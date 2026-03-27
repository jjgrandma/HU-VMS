const mongoose = require('mongoose');

const passwordResetLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestedAt: { type: Date, default: Date.now },
    token: String,
    tokenExpires: Date,
    status: {
      type: String,
      enum: ['pending', 'completed', 'expired', 'cancelled'],
      default: 'pending'
    },
    completedAt: Date,
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('PasswordResetLog', passwordResetLogSchema);
