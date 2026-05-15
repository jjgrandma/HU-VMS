const mongoose = require('mongoose');

const routineTripLogSchema = new mongoose.Schema(
  {
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoutineSchedule',
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },
    shift: {
      type: String,
      enum: ['morning', 'afternoon'],
      required: true,
    },
    scheduledDepartureTime: { type: String, required: true }, // HH:MM
    actualStartTime: { type: Date, default: null },
    actualEndTime: { type: Date, default: null },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
    },
    // Calendar date string (YYYY-MM-DD, Africa/Addis_Ababa) for dedup
    tripDate: { type: String, required: true },
  },
  { timestamps: true }
);

// Index for dedup check: one in_progress per schedule+shift+day
routineTripLogSchema.index({ schedule: 1, shift: 1, tripDate: 1 });
// Index for driver's own logs
routineTripLogSchema.index({ driver: 1, status: 1, actualStartTime: -1 });
// Index for history queries
routineTripLogSchema.index({ schedule: 1, actualStartTime: -1 });

module.exports = mongoose.model('RoutineTripLog', routineTripLogSchema);
