const router = require('express').Router();
const Vehicle = require('../models/Vehicle');
const { authMiddleware } = require('../middleware/auth');

// GET /api/vehicles
router.get('/', authMiddleware, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const vehicles = await Vehicle.find(filter).populate('assignedDriver', 'name phone');
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/vehicles
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { plateNumber, model, type, capacity, year, color } = req.body;

    // Required field validation
    if (!plateNumber?.trim()) return res.status(400).json({ message: 'Plate number is required' });
    if (!model?.trim())       return res.status(400).json({ message: 'Model is required' });
    if (!type)                return res.status(400).json({ message: 'Vehicle type is required' });

    // Plate format: letters, numbers, hyphens, 3–15 chars
    if (!/^[A-Za-z0-9\-]{3,15}$/.test(plateNumber.trim())) {
      return res.status(400).json({ message: 'Invalid plate number format' });
    }

    // Capacity bounds
    const cap = Number(capacity);
    if (!capacity || !Number.isInteger(cap) || cap < 1 || cap > 200) {
      return res.status(400).json({ message: 'Capacity must be a whole number between 1 and 200' });
    }

    // Year bounds
    const yr = Number(year);
    const currentYear = new Date().getFullYear();
    if (year && (yr < 1980 || yr > currentYear + 1)) {
      return res.status(400).json({ message: `Year must be between 1980 and ${currentYear + 1}` });
    }

    // Duplicate plate check
    const existing = await Vehicle.findOne({ plateNumber: { $regex: new RegExp(`^${plateNumber.trim()}$`, 'i') } });
    if (existing) return res.status(400).json({ message: `A vehicle with plate number "${plateNumber.trim()}" already exists` });

    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/vehicles/:id
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/vehicles/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
