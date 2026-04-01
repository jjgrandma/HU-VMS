const mongoose = require('mongoose');

const maintenanceScheduleSchema = new mongoose.Schema({
  vehicleId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  vehiclePlate: { type: String, required: true },
  type:         { type: String, enum: ['routine', 'oil-change', 'tire', 'inspection', 'other'], default: 'routine' },
  description:  { type: String, required: true },
  scheduledDate: { type: Date, required: true },
  mileageTrigger: Number, // trigger at this mileage
  status:       { type: String, enum: ['scheduled', 'completed', 'overdue', 'cancelled'], default: 'scheduled' },
  createdBy:    String,
  completedAt:  Date,
  cost:         Number,
  notes:        String,
}, { timestamps: true });

module.exports = mongoose.model('MaintenanceSchedule', maintenanceScheduleSchema);
