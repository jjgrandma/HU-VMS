const mongoose = require('mongoose');

const gateLogSchema = new mongoose.Schema({
  plateNumber:  { type: String, required: true },
  driverName:   String,
  vehicleModel: String,
  direction:    { type: String, enum: ['entry', 'exit'], required: true },
  status:       { type: String, enum: ['approved', 'unauthorized', 'pending'], default: 'pending' },
  tripId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
  officer:      String,
  remarks:      String,
  entryTime:    { type: Date, default: Date.now },
  exitTime:     Date,
}, { timestamps: true });

module.exports = mongoose.model('GateLog', gateLogSchema);
