const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    requester: { type: String, required: true },
    department: { type: String, required: true },
    destination: { type: String, required: true },
    purpose: String,
    date: { type: String, required: true },
    returnDate: String,
    passengers: { type: Number, required: true },
    priority: {
      type: String,
      enum: ['emergency', 'high', 'normal', 'low'],
      default: 'normal',
    },
    vehicleType: String,
    specialRequirements: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    assignedVehicle: String,
    assignedDriver: String,
    rejectionReason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Request', requestSchema);
