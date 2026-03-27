const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trip:   { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
  vehicle: { type: String, required: true },
  fuelLevel: { type: Number, min: 0, max: 100 },
  fuelLiters: { type: Number, min: 0, default: null },
  tireCondition: { type: String, enum: ['good', 'fair', 'poor'], default: 'good' },
  oilLevel: { type: String, enum: ['full', 'low', 'critical'], default: 'full' },
  brakesStatus: { type: String, enum: ['good', 'fair', 'poor'], default: 'good' },
  lightsWorking: { type: Boolean, default: true },
  wiperWorking:  { type: Boolean, default: true },
  hornWorking:   { type: Boolean, default: true },
  seatbeltsOk:   { type: Boolean, default: true },
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('Inspection', inspectionSchema);
