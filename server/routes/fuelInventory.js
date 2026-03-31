const router = require('express').Router();
const FuelInventory = require('../models/FuelInventory');
const { authMiddleware } = require('../middleware/auth');

// GET /api/fuel-inventory — get all inventory
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Ensure both fuel types exist
    await FuelInventory.findOneAndUpdate(
      { fuelType: 'Diesel' }, { $setOnInsert: { fuelType: 'Diesel' } }, { upsert: true, new: true }
    );
    await FuelInventory.findOneAndUpdate(
      { fuelType: 'Petrol' }, { $setOnInsert: { fuelType: 'Petrol' } }, { upsert: true, new: true }
    );
    const inventory = await FuelInventory.find();
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/fuel-inventory/:fuelType — add stock or update capacity
router.patch('/:fuelType', authMiddleware, async (req, res) => {
  try {
    const { litersToAdd, capacity, updatedBy } = req.body;
    const fuelType = req.params.fuelType; // 'Diesel' or 'Petrol'

    const record = await FuelInventory.findOne({ fuelType });
    if (!record) return res.status(404).json({ message: 'Fuel type not found' });

    if (capacity !== undefined) record.capacity = Number(capacity);
    if (litersToAdd !== undefined) {
      const newAvailable = record.available + Number(litersToAdd);
      if (record.capacity > 0 && newAvailable > record.capacity)
        return res.status(400).json({ message: `Exceeds capacity. Max you can add: ${record.capacity - record.available}L` });
      record.available = newAvailable;
    }
    if (updatedBy) record.updatedBy = updatedBy;

    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
