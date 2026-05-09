const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['ADMIN', 'TRANSPORT', 'DRIVER', 'USER', 'FUEL_OFFICER', 'GATE_OFFICER', 'MAINTENANCE_OFFICER', 'DEAN'],
      required: true,
    },
    phone: String,
    department: String,
    employeeId: String,
    isActive: { type: Boolean, default: true },
    profilePhoto: { type: String, default: null },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    // Organizational unit — used for approval routing
    unitType: {
      type: String,
      enum: ['DEPARTMENT', 'CAFETERIA', 'CLINIC', 'AGRICULTURAL_ACTIVITY', 'COLLEGE', 'OTHER'],
      default: null,
    },
    unitName:    { type: String, default: null },
    collegeName: { type: String, default: null }, // for DEAN role — the college they oversee
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
