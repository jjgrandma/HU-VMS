const router = require('express').Router();
const FuelRequest = require('../models/FuelRequest');
const FuelInventory = require('../models/FuelInventory');
const User   = require('../models/User');
const Driver = require('../models/Driver');
const { authMiddleware } = require('../middleware/auth');
const { sendSMS } = require('../utils/sms');

// GET /api/fuel-requests
router.get('/', authMiddleware, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.driver) filter.driver = req.query.driver;
    const requests = await FuelRequest.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Drop stale indexes once on startup
FuelRequest.collection.dropIndex('requestId_1').catch(() => {});

// POST /api/fuel-requests  (driver submits)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { odometer } = req.body;
    let odometerAnalysis = null;

    if (odometer && Number(odometer) > 0) {
      const lastReq = await FuelRequest.findOne({
        driver: req.user.id,
        status: { $in: ['dispensed', 'confirmed'] },
        odometer: { $gt: 0 },
      }).sort({ createdAt: -1 });

      if (lastReq?.odometer) {
        const kmTraveled = Number(odometer) - lastReq.odometer;
        const fuelUsed = lastReq.dispensedLiters || lastReq.permittedLiters;
        if (kmTraveled > 0 && fuelUsed > 0) {
          const efficiency = (kmTraveled / fuelUsed).toFixed(1);
          const expectedKm = lastReq.estimatedDistanceKm || null;
          let flag = null;
          if (expectedKm && kmTraveled > expectedKm * 1.3) flag = 'HIGH_MILEAGE';
          else if (expectedKm && kmTraveled < expectedKm * 0.3) flag = 'LOW_MILEAGE';
          odometerAnalysis = {
            previousOdometer: lastReq.odometer,
            currentOdometer: Number(odometer),
            kmTraveled,
            fuelUsedLastTrip: fuelUsed,
            efficiencyKmPerLiter: Number(efficiency),
            expectedKm,
            flag,
          };
        }
      }
    }

    const request = new FuelRequest({ ...req.body, driver: req.user.id, odometerAnalysis });
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    console.error('FuelRequest POST error:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/fuel-requests/:id/approve  (transport officer approves with permitted liters)
router.put('/:id/approve', authMiddleware, async (req, res) => {
  try {
    const { permittedLiters, approvedBy } = req.body;
    if (!permittedLiters || permittedLiters <= 0)
      return res.status(400).json({ message: 'Permitted liters must be a positive number' });

    const updated = await FuelRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', permittedLiters, approvedBy, approvedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Fuel request not found' });

    // ── SMS: notify driver ─────────────────────────────────
    const driverUser = await User.findById(updated.driver);
    if (driverUser?.phone) {
      await sendSMS(
        driverUser.phone,
        `HU-VMS: Your fuel request has been approved. ${permittedLiters}L of ${updated.fuelType} permitted for ${updated.destination}. Please collect from the fuel station.`
      );
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/fuel-requests/:id/reject  (transport officer rejects)
router.put('/:id/reject', authMiddleware, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const updated = await FuelRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Fuel request not found' });

    // ── SMS: notify driver ─────────────────────────────────
    const driverUser = await User.findById(updated.driver);
    if (driverUser?.phone) {
      await sendSMS(
        driverUser.phone,
        `HU-VMS: Your fuel request for ${updated.destination} has been rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`
      );
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/fuel-requests/:id/dispense  (fuel station dispenses)
router.put('/:id/dispense', authMiddleware, async (req, res) => {
  try {
    const { dispensedLiters, dispensedBy } = req.body;
    const fuelReq = await FuelRequest.findById(req.params.id);
    if (!fuelReq) return res.status(404).json({ message: 'Fuel request not found' });
    if (fuelReq.status !== 'approved')
      return res.status(400).json({ message: 'Only approved requests can be dispensed' });
    if (dispensedLiters > fuelReq.permittedLiters)
      return res.status(400).json({ message: `Cannot dispense more than permitted: ${fuelReq.permittedLiters}L` });

    // Deduct from inventory
    const inv = await FuelInventory.findOne({ fuelType: fuelReq.fuelType });
    if (inv) {
      if (inv.available < dispensedLiters)
        return res.status(400).json({ message: `Not enough ${fuelReq.fuelType} in stock. Available: ${inv.available}L` });
      inv.available = inv.available - dispensedLiters;
      inv.updatedBy = dispensedBy;
      await inv.save();
    }

    const updated = await FuelRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'dispensed', dispensedLiters, dispensedBy, dispensedAt: new Date() },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/fuel-requests/:id/confirm  (driver confirms receipt)
router.put('/:id/confirm', authMiddleware, async (req, res) => {
  try {
    const fuelReq = await FuelRequest.findById(req.params.id);
    if (!fuelReq) return res.status(404).json({ message: 'Fuel request not found' });
    if (fuelReq.status !== 'dispensed')
      return res.status(400).json({ message: 'Only dispensed requests can be confirmed' });

    const updated = await FuelRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'confirmed', confirmedAt: new Date() },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
