const router = require('express').Router();
const crypto = require('crypto');
const QRCode = require('qrcode');
const Request = require('../models/Request');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const Notification = require('../models/Notification');
const FuelRequest   = require('../models/FuelRequest');
const { authMiddleware } = require('../middleware/auth');

// GET /api/requests
router.get('/', authMiddleware, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status)              filter.status              = req.query.status;
    if (req.query.priority)            filter.priority            = req.query.priority;
    if (req.query.requesterUsername)   filter.requesterUsername   = req.query.requesterUsername;
    if (req.query.currentApproverRole) filter.currentApproverRole = req.query.currentApproverRole;
    if (req.query.collegeName)         filter.collegeName         = req.query.collegeName;
    if (req.query.unitType)            filter.unitType            = req.query.unitType;

    // Pagination — default 100 per page, max 200
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(200, parseInt(req.query.limit) || 100);
    const skip  = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      Request.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Request.countDocuments(filter),
    ]);

    res.json(requests); // keep same response shape for backward compat
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/requests/for-dean — returns only requests for the logged-in dean's college
// The dean's collegeName comes from their JWT / user record
router.get('/for-dean', authMiddleware, async (req, res) => {
  try {
    const dean = await User.findById(req.user.id).select('collegeName role');

    if (!dean || dean.role !== 'DEAN') {
      return res.status(403).json({ message: 'Access denied — Dean role required' });
    }

    // Build filter — use case-insensitive regex so "College of Computing and Informatics"
    // matches "college of computing and informatics" regardless of how it was saved
    const filter = { unitType: 'DEPARTMENT' };

    if (dean.collegeName) {
      filter.collegeName = { $regex: new RegExp(`^${dean.collegeName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
    }

    // Optionally filter by status
    if (req.query.status) filter.status = req.query.status;

    const requests = await Request.find(filter).sort({ createdAt: -1 }).lean();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/requests
router.post('/', authMiddleware, async (req, res) => {
  try {
    const body = { ...req.body };

    // Auto-set routing based on unitType
    if (body.unitType === 'DEPARTMENT') {
      body.approvalLevel      = 1;
      body.currentApproverRole = 'COLLEGE_DEAN';
    } else if (body.unitType) {
      body.approvalLevel      = 1;
      body.currentApproverRole = 'TRANSPORT_OFFICER';
    }
    // Legacy requests (no unitType) go straight to transport officer
    if (!body.unitType) {
      body.currentApproverRole = 'TRANSPORT_OFFICER';
    }

    const request = new Request(body);
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/requests/:id/start
router.put('/:id/start', authMiddleware, async (req, res) => {
  try {
    const updated = await Request.findByIdAndUpdate(
      req.params.id,
      { status: 'in-progress', startedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Request not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/requests/:id/complete
router.put('/:id/complete', authMiddleware, async (req, res) => {
  try {
    // Free up the vehicle
    const request = await Request.findById(req.params.id);
    if (request?.assignedVehicleId) {
      await Vehicle.findByIdAndUpdate(request.assignedVehicleId, { status: 'available' });
    }
    const updated = await Request.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', completedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Request not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/requests/:id/dean-approve  — College Dean forwards to Transport Officer
router.put('/:id/dean-approve', authMiddleware, async (req, res) => {
  try {
    const { approvedBy, remarks } = req.body;

    // Fetch the dean's full profile for the stamp
    const User = require('../models/User');
    const dean = await User.findById(req.user.id).select('name username employeeId collegeName unitName role');
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is no longer pending' });
    }

    // ── Ownership check: dean can only approve requests from their own college ──
    if (dean?.collegeName && request.collegeName) {
      const deanCollege = dean.collegeName.toLowerCase().trim();
      const reqCollege  = request.collegeName.toLowerCase().trim();
      if (deanCollege !== reqCollege) {
        return res.status(403).json({ message: 'You can only approve requests from your own college' });
      }
    }

    const now = new Date();

    // ── Attach the Dean's approval stamp ──────────────────
    request.deanStamp = {
      deanName:       dean?.name       || approvedBy || 'College Dean',
      deanUsername:   dean?.username   || '',
      deanEmployeeId: dean?.employeeId || '',
      // Normalize college name to title case for consistency
      collegeName:    dean?.collegeName
                        ? dean.collegeName.replace(/\b\w/g, c => c.toUpperCase())
                        : (request.collegeName || ''),
      collegeCode:    dean?.unitName   || '',
      approvedAt:     now,
      remarks:        remarks || '',
    };

    // ── Record in routing history ─────────────────────────
    request.routingHistory.push({
      role:   'COLLEGE_DEAN',
      action: 'approved',
      by:     dean?.name || approvedBy || 'College Dean',
      at:     now,
      note:   remarks || '',
    });

    // ── Advance to Transport Officer ──────────────────────
    request.approvalLevel       = 2;
    request.currentApproverRole = 'TRANSPORT_OFFICER';
    request.currentApproverId   = null;
    request.status              = 'pending';

    await request.save();

    // ── Notify Transport Officer ──────────────────────────
    try {
      await new Notification({
        recipientRole: 'TRANSPORT',
        type:    'request_forwarded',
        title:   `🏛️ Dean-Approved: ${request.requester} — ${request.department}`,
        message: `Approved by ${request.deanStamp.deanName} (${request.deanStamp.collegeName}). ` +
                 `Trip: ${request.purpose} → ${request.destination} on ${request.date}. ` +
                 `${request.passengers} passenger(s). Awaiting vehicle assignment.`,
        data: {
          requestId:    request._id,
          deanName:     request.deanStamp.deanName,
          collegeName:  request.deanStamp.collegeName,
          department:   request.unitName || request.department,
        },
      }).save();
    } catch (_) { /* notifications are non-critical */ }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/requests/:id/approve
router.put('/:id/approve', authMiddleware, async (req, res) => {
  try {
    const { vehicleId, approvedBy, estimatedFuelLiters, fuelType } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (vehicle.status !== 'available') return res.status(400).json({ message: 'Vehicle is not available' });

    vehicle.status = 'in-use';
    await vehicle.save();

    // Generate QR token upfront so we only do one save
    const qrToken = crypto.randomBytes(20).toString('hex');

    const updated = await Request.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        assignedVehicle: `${vehicle.model} (${vehicle.plateNumber})`,
        assignedVehicleId: vehicleId,
        assignedDriver: vehicle.assignedDriverName || '',
        approvedBy: approvedBy || 'Transport Officer',
        estimatedFuelLiters: estimatedFuelLiters || null,
        qrToken,
        qrGenerated: true,
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Request not found' });

    const Notification = require('../models/Notification');
    const FuelRequest   = require('../models/FuelRequest');

    // ── Auto-create fuel request for fuel officer ──────────    if (estimatedFuelLiters && estimatedFuelLiters > 0) {
      await new FuelRequest({
        driver:          updated._id,
        driverName:      vehicle.assignedDriverName || updated.requester,
        vehicleType:     vehicle.type,
        vehiclePlate:    vehicle.plateNumber,
        vehicleModel:    vehicle.model,
        fuelType:        fuelType || vehicle.fuelType || 'Diesel',
        requestedLiters: estimatedFuelLiters,
        destination:     updated.destination,
        purpose:         updated.purpose,
        status:          'approved',
        permittedLiters: estimatedFuelLiters,
        approvedBy:      approvedBy || 'Transport Officer',
        approvedAt:      new Date(),
      }).save();

      // Notify Fuel Officer
      await new Notification({
        recipientRole: 'FUEL_OFFICER',
        type:    'fuel_request',
        title:   '⛽ Fuel Required for Approved Trip',
        message: `Dispense ${estimatedFuelLiters}L (${fuelType || 'Diesel'}) to ${vehicle.assignedDriverName || updated.requester} — ${vehicle.plateNumber} → ${updated.destination}`,
        data: {
          tripId: updated._id, vehicle: vehicle.plateNumber, model: vehicle.model,
          driver: vehicle.assignedDriverName || updated.requester,
          fuelLiters: estimatedFuelLiters, fuelType: fuelType || 'Diesel',
          destination: updated.destination, date: updated.date,
        },
      }).save();
    }

    // ── Notify Driver ──────────────────────────────────────
    await new Notification({
      recipientRole:     'DRIVER',
      recipientUsername: vehicle.assignedDriverUsername || null,
      type:    'trip_approved',
      title:   '✅ Trip Approved',
      message: `Your trip to ${updated.destination} on ${updated.date} is approved. Vehicle: ${vehicle.model} (${vehicle.plateNumber}).${estimatedFuelLiters ? ` Fuel allocated: ${estimatedFuelLiters}L ${fuelType || 'Diesel'}.` : ''} Collect fuel from the fuel station before departure.`,
      data: {
        tripId: updated._id, vehicle: vehicle.plateNumber, model: vehicle.model,
        destination: updated.destination, date: updated.date,
        fuelLiters: estimatedFuelLiters || 0, fuelType: fuelType || 'Diesel',
      },
    }).save();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/requests/:id/reject
router.put('/:id/reject', authMiddleware, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const updated = await Request.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Request not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/requests/:id  (generic update)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Request.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Request not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/requests/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/requests/:id/qr — get QR code image for approved trip
router.get('/:id/qr', authMiddleware, async (req, res) => {
  try {
    const trip = await Request.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.status !== 'approved' && trip.status !== 'in-progress') {
      return res.status(400).json({ message: 'Trip is not approved yet' });
    }

    // Generate token if not already done
    if (!trip.qrToken) {
      trip.qrToken = crypto.randomBytes(20).toString('hex');
      trip.qrGenerated = true;
      await trip.save();
    }

    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/gate/scan/${trip.qrToken}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 300,
      margin: 2,
      color: { dark: '#111827', light: '#ffffff' },
    });

    res.json({
      qrCode: qrDataUrl,
      token: trip.qrToken,
      verifyUrl,
      trip: {
        destination: trip.destination,
        date: trip.date,
        assignedVehicle: trip.assignedVehicle,
        assignedDriver: trip.assignedDriver,
        status: trip.status,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
