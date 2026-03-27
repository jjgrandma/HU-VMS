const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    role: { type: String, required: true },
    department: String,
    subject: { type: String, default: 'Support Request' },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'resolved'],
      default: 'pending',
    },
    response: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    respondedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupportMessage', supportMessageSchema);
