const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  partName:    { type: String, required: true, unique: true },
  category:    { type: String, enum: ['engine', 'brakes', 'tires', 'electrical', 'body', 'fluids', 'other'], default: 'other' },
  quantity:    { type: Number, required: true, default: 0 },
  minLevel:    { type: Number, default: 5 }, // alert when below this
  unitCost:    { type: Number, default: 0 },
  supplier:    String,
  lastRestocked: Date,
  notes:       String,
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
