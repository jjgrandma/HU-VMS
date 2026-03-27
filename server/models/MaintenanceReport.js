const mongoose = require('mongoose');

const maintenanceReportSchema = new mongoose.Schema({
  driver:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle:     { type: String, required: true },
  description: { type: String, required: true },
  urgency:     { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status:      { type: String, enum: ['pending', 'in-progress', 'resolved'], default: 'pending' },
  resolvedAt:  Date,
  resolvedBy:  String,
}, { timestamps: true });

module.exports = mongoose.model('MaintenanceReport', maintenanceReportSchema);
