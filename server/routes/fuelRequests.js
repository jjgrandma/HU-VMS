const router = require('express').Router();
const FuelRequest = require('../models/FuelRequest');
const FuelInventory = require('../models/FuelInventory');
const { authMiddleware } = require('../middleware/auth');

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
    const request = new FuelRequest({ ...req.body, driver: req.user.id });
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    console.error('FuelRequest POST error:', err.message);
    // Return the actual validation error to the client
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: messages });
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
