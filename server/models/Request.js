const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    requester: { type: String, required: true },
    requesterUsername: { type: String, default: '' },
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
      enum: ['pending', 'approved', 'rejected', 'in-progress', 'completed'],
      default: 'pending',
    },
    assignedVehicle: String,
    assignedVehicleId: String,
    assignedDriver: String,
    approvedBy: String,
    rejectionReason: String,
    startedAt: Date,
    completedAt: Date,
    // QR Code fields
    qrToken:     { type: String, unique: true, sparse: true },
    qrGenerated: { type: Boolean, default: false },
    qrUsed:      { type: Boolean, default: false },
    qrUsedAt:    Date,
    // ── Approval routing fields (backward-compatible) ──────
    unitType: {
      type: String,
      enum: ['DEPARTMENT', 'CAFETERIA', 'CLINIC', 'AGRICULTURAL_ACTIVITY', 'COLLEGE', 'OTHER'],
      default: null,
    },
    unitName:           { type: String, default: null },
    approvalLevel:      { type: Number, default: 1 },
    currentApproverRole: { type: String, default: null },  // 'COLLEGE_DEAN' | 'TRANSPORT_OFFICER'
    currentApproverId:  { type: String, default: null },
    routingHistory: [
      {
        role:       String,
        action:     String,   // 'approved' | 'rejected'
        by:         String,
        at:         { type: Date, default: Date.now },
        note:       String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Request', requestSchema);
