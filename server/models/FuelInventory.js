const mongoose = require('mongoose');

const fuelInventorySchema = new mongoose.Schema(
  {
    fuelType:  { type: String, enum: ['Diesel', 'Petrol'], required: true, unique: true },
    available: { type: Number, default: 0 },
    capacity:  { type: Number, default: 0 },
    updatedBy: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('FuelInventory', fuelInventorySchema);
