const mongoose = require('mongoose');

const fuelLogSchema = new mongoose.Schema({
  driver:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle:  { type: String, required: true },
  fuelAmount: { type: Number, required: true },
  cost:       { type: Number, required: true },
  odometer:   { type: Number, required: true },
  date:       { type: Date, default: Date.now },
  notes: String,
  receiptImage: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('FuelLog', fuelLogSchema);
