const router = require('express').Router();
const crypto = require('crypto');
const QRCode = require('qrcode');
const Request = require('../models/Request');
const Vehicle = require('../models/Vehicle');
const { authMiddleware } = require('../middleware/auth');

// GET /api/requests
router.get('/', authMiddleware, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.requesterUsername) filter.requesterUsername = req.query.requesterUsername;

    const requests = await Request.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/requests
router.post('/', authMiddleware, async (req, res) => {
  try {
    const request = new Request(req.body);
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

// PUT /api/requests/:id/approve
router.put('/:id/approve', authMiddleware, async (req, res) => {
  try {
    const { vehicleId, approvedBy } = req.body;

    // Find the vehicle and mark it in-use
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (vehicle.status !== 'available') return res.status(400).json({ message: 'Vehicle is not available' });

    vehicle.status = 'in-use';
    await vehicle.save();

    const updated = await Request.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        assignedVehicle: `${vehicle.model} (${vehicle.plateNumber})`,
        assignedVehicleId: vehicleId,
        assignedDriver: vehicle.assignedDriverName || '',
        approvedBy: approvedBy || 'Transport Officer',
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Request not found' });

    // Generate QR token on approval
    if (!updated.qrGenerated) {
      const qrToken = crypto.randomBytes(20).toString('hex');
      updated.qrToken = qrToken;
      updated.qrGenerated = true;
      await updated.save();
    }

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
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
