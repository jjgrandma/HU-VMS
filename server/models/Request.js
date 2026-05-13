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
    unitName:            { type: String, default: null },
    collegeName:         { type: String, default: null },
    approvalLevel:       { type: Number, default: 1 },
    currentApproverRole: { type: String, default: null },
    currentApproverId:   { type: String, default: null },
    routingHistory: [
      {
        role:   String,
        action: String,
        by:     String,
        at:     { type: Date, default: Date.now },
        note:   String,
      },
    ],
    // ── Dean approval stamp — attached when dean approves ──
    deanStamp: {
      deanName:       { type: String, default: null },
      deanUsername:   { type: String, default: null },
      deanEmployeeId: { type: String, default: null },
      collegeName:    { type: String, default: null },
      collegeCode:    { type: String, default: null },
      approvedAt:     { type: Date,   default: null },
      remarks:        { type: String, default: null },
    },
    // ── Fuel & trip type fields ────────────────────────────
    tripType:              { type: String, enum: ['round_trip', 'one_way'], default: 'round_trip' },
    estimatedFuelLiters:   { type: Number, default: null },  // fuel from station
    totalFuelNeededLiters: { type: Number, default: null },  // total needed incl. buffer
    cashAllowanceETB:      { type: Number, default: 0 },     // ETB cash for road refuel
    fuelType:              { type: String, default: null },
  },
  { timestamps: true }
);

// ── Performance indexes ────────────────────────────────────
// These make the most common queries fast instead of doing full collection scans

// Transport Officer loads pending requests assigned to them
requestSchema.index({ currentApproverRole: 1, status: 1 });

// Dean loads requests for their college
requestSchema.index({ collegeName: 1, unitType: 1, status: 1 });

// User loads their own requests
requestSchema.index({ requesterUsername: 1, status: 1 });

// General status + date sorting (used everywhere)
requestSchema.index({ status: 1, createdAt: -1 });

// Priority queue (emergency requests surface first)
requestSchema.index({ priority: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Request', requestSchema);
