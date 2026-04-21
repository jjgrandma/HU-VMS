const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientRole: { type: String, required: true }, // 'FUEL_OFFICER', 'DRIVER', 'TRANSPORT', etc.
  recipientUsername: String, // specific user, or null = all of that role
  type: {
    type: String,
    enum: ['fuel_request', 'trip_approved', 'trip_rejected', 'fuel_dispensed', 'general'],
    default: 'general',
  },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  data:    { type: Object, default: {} }, // extra payload (tripId, fuelLiters, etc.)
  read:    { type: Boolean, default: false },
  readAt:  Date,
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
