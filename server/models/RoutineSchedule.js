const mongoose = require('mongoose');

const routineScheduleSchema = new mongoose.Schema(
  {
    scheduleType: {
      type: String,
      enum: ['EMPLOYEE_SHUTTLE', 'ADMIN_ASSIGNED'],
      required: true,
    },
    routeName: { type: String, required: true, trim: true },
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
    // EMPLOYEE_SHUTTLE fields
    morningDepartureTime: { type: String, default: null }, // HH:MM
    afternoonDepartureTime: { type: String, default: null }, // HH:MM
    pickupLocation: { type: String, default: null, trim: true },   // e.g. "Harar Aretanya"
    dropoffLocation: { type: String, default: null, trim: true },  // e.g. "Main Campus"
    // ADMIN_ASSIGNED fields
    assignedAdministrator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Index for fast overlap checks
routineScheduleSchema.index({ vehicle: 1, status: 1 });
// Index for scheduler queries
routineScheduleSchema.index({ scheduleType: 1, status: 1 });
// Index for admin-assigned lookups
routineScheduleSchema.index({ assignedAdministrator: 1, status: 1 });

module.exports = mongoose.model('RoutineSchedule', routineScheduleSchema);
