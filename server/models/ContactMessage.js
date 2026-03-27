const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved'],
      default: 'pending'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    category: {
      type: String,
      enum: ['password-reset', 'account-access', 'technical-issue', 'general', 'other'],
      default: 'general'
    },
    adminResponse: String,
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    respondedAt: Date,
    autoReplySent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
