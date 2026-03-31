const mongoose = require('mongoose');

const incidentReportSchema = new mongoose.Schema({
  plateNumber:  String,
  description:  { type: String, required: true },
  incidentType: { type: String, enum: ['unauthorized', 'accident', 'suspicious', 'other'], default: 'other' },
  severity:     { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  image:        String,
  reportedBy:   String,
  status:       { type: String, enum: ['open', 'investigating', 'resolved'], default: 'open' },
}, { timestamps: true });

module.exports = mongoose.model('IncidentReport', incidentReportSchema);
