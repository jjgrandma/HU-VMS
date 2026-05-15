const { DateTime } = require('luxon');
const RoutineSchedule = require('../models/RoutineSchedule');
const RoutineTripLog  = require('../models/RoutineTripLog');
const Vehicle         = require('../models/Vehicle');
const Driver          = require('../models/Driver');
const User            = require('../models/User');
const Notification    = require('../models/Notification');

const TZ = 'Africa/Addis_Ababa';

function todayEAT() {
  return DateTime.now().setZone(TZ).toFormat('yyyy-MM-dd');
}

// Validate HH:MM format
function isValidTime(t) {
  if (!t || typeof t !== 'string') return false;
  const m = t.match(/^(\d{2}):(\d{2})$/);
  if (!m) return false;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  return h >= 0 && h <= 23 && min >= 0 && min <= 59;
}

// ─────────────────────────────────────────────────────────────
// GET /api/routines
// ─────────────────────────────────────────────────────────────
exports.getSchedules = async (req, res) => {
  try {
    const filter = {};
    if (req.query.scheduleType) {
      if (!['EMPLOYEE_SHUTTLE', 'ADMIN_ASSIGNED'].includes(req.query.scheduleType)) {
        return res.status(400).json({ message: 'Invalid scheduleType filter value' });
      }
      filter.scheduleType = req.query.scheduleType;
    }
    if (req.query.status) {
      if (!['active', 'inactive'].includes(req.query.status)) {
        return res.status(400).json({ message: 'Invalid status filter value' });
      }
      filter.status = req.query.status;
    }

    const schedules = await RoutineSchedule.find(filter)
      .populate('vehicle', 'plateNumber model type')
      .populate('driver', 'name employeeId phone')
      .populate('assignedAdministrator', 'name email username')
      .sort({ createdAt: -1 });

    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/routines/:id
// ─────────────────────────────────────────────────────────────
exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await RoutineSchedule.findById(req.params.id)
      .populate('vehicle', 'plateNumber model type status')
      .populate('driver', 'name employeeId phone status')
      .populate('assignedAdministrator', 'name email username department');

    if (!schedule) return res.status(404).json({ message: 'Routine schedule not found' });
    res.json(schedule);
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid schedule ID' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/routines
// ─────────────────────────────────────────────────────────────
exports.createSchedule = async (req, res) => {
  try {
    const {
      scheduleType, routeName, vehicle: vehicleId, driver: driverId,
      morningDepartureTime, afternoonDepartureTime,
      pickupLocation, dropoffLocation,
      assignedAdministrator,
    } = req.body;

    // Basic required fields
    if (!scheduleType || !['EMPLOYEE_SHUTTLE', 'ADMIN_ASSIGNED'].includes(scheduleType)) {
      return res.status(400).json({ message: 'scheduleType must be EMPLOYEE_SHUTTLE or ADMIN_ASSIGNED' });
    }
    if (!routeName || !routeName.trim()) {
      return res.status(400).json({ message: 'routeName is required' });
    }

    // Validate vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(400).json({ message: 'Vehicle not found' });

    // Validate driver exists and has DRIVER role
    const driver = await Driver.findById(driverId);
    if (!driver) return res.status(400).json({ message: 'Driver not found' });

    // Check driver role via User model (Driver model doesn't store role)
    // The Driver model is separate from User; we check the User with matching employeeId
    // Actually Driver model is standalone — role check is implicit (only Drivers are in Driver collection)
    // We still verify the driver is active
    if (!driver.isActive) {
      return res.status(400).json({ message: 'Driver is not active' });
    }

    // EMPLOYEE_SHUTTLE: require departure times
    if (scheduleType === 'EMPLOYEE_SHUTTLE') {
      if (!isValidTime(morningDepartureTime)) {
        return res.status(400).json({ message: 'morningDepartureTime is required and must be HH:MM (00:00–23:59)' });
      }
      if (!isValidTime(afternoonDepartureTime)) {
        return res.status(400).json({ message: 'afternoonDepartureTime is required and must be HH:MM (00:00–23:59)' });
      }
    }

    // ADMIN_ASSIGNED: require assignedAdministrator
    if (scheduleType === 'ADMIN_ASSIGNED') {
      if (!assignedAdministrator) {
        return res.status(400).json({ message: 'assignedAdministrator is required for ADMIN_ASSIGNED schedules' });
      }
      const admin = await User.findById(assignedAdministrator);
      if (!admin) return res.status(400).json({ message: 'Assigned administrator not found' });
      if (admin.role !== 'USER' && admin.role !== 'ADMIN' && admin.role !== 'DEAN') {
        return res.status(400).json({ message: 'assignedAdministrator must be a valid user (USER, ADMIN, or DEAN role)' });
      }
    }

    // Check vehicle overlap — no two active schedules for same vehicle
    const overlap = await RoutineSchedule.findOne({ vehicle: vehicleId, status: 'active' });
    if (overlap) {
      return res.status(409).json({
        message: `Vehicle is already assigned to active routine schedule "${overlap.routeName}" (ID: ${overlap._id})`,
        conflictingScheduleId: overlap._id,
        conflictingScheduleName: overlap.routeName,
      });
    }

    const schedule = new RoutineSchedule({
      scheduleType,
      routeName: routeName.trim(),
      vehicle: vehicleId,
      driver: driverId,
      morningDepartureTime:   scheduleType === 'EMPLOYEE_SHUTTLE' ? morningDepartureTime : null,
      afternoonDepartureTime: scheduleType === 'EMPLOYEE_SHUTTLE' ? afternoonDepartureTime : null,
      pickupLocation:         scheduleType === 'EMPLOYEE_SHUTTLE' ? (pickupLocation?.trim() || null) : null,
      dropoffLocation:        scheduleType === 'EMPLOYEE_SHUTTLE' ? (dropoffLocation?.trim() || null) : null,
      assignedAdministrator:  scheduleType === 'ADMIN_ASSIGNED' ? assignedAdministrator : null,
      createdBy: req.user.id,
    });

    await schedule.save();

    const populated = await RoutineSchedule.findById(schedule._id)
      .populate('vehicle', 'plateNumber model type')
      .populate('driver', 'name employeeId phone')
      .populate('assignedAdministrator', 'name email username');

    res.status(201).json(populated);
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID format' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/routines/:id
// ─────────────────────────────────────────────────────────────
exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await RoutineSchedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Routine schedule not found' });

    const allowed = ['routeName', 'vehicle', 'driver', 'morningDepartureTime',
                     'afternoonDepartureTime', 'pickupLocation', 'dropoffLocation',
                     'assignedAdministrator', 'status'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // Validate driver if being updated
    if (updates.driver) {
      const driver = await Driver.findById(updates.driver);
      if (!driver) return res.status(400).json({ message: 'Driver not found' });
      if (!driver.isActive) return res.status(400).json({ message: 'Driver is not active' });
    }

    // Validate vehicle overlap if vehicle is being changed
    if (updates.vehicle && updates.vehicle.toString() !== schedule.vehicle.toString()) {
      const overlap = await RoutineSchedule.findOne({
        vehicle: updates.vehicle,
        status: 'active',
        _id: { $ne: schedule._id },
      });
      if (overlap) {
        return res.status(409).json({
          message: `Vehicle is already assigned to active routine schedule "${overlap.routeName}"`,
          conflictingScheduleId: overlap._id,
        });
      }
    }

    // Validate departure times if being updated
    if (updates.morningDepartureTime !== undefined && !isValidTime(updates.morningDepartureTime)) {
      return res.status(400).json({ message: 'morningDepartureTime must be HH:MM (00:00–23:59)' });
    }
    if (updates.afternoonDepartureTime !== undefined && !isValidTime(updates.afternoonDepartureTime)) {
      return res.status(400).json({ message: 'afternoonDepartureTime must be HH:MM (00:00–23:59)' });
    }

    // Validate status
    if (updates.status && !['active', 'inactive'].includes(updates.status)) {
      return res.status(400).json({ message: 'status must be active or inactive' });
    }

    Object.assign(schedule, updates);
    await schedule.save();

    const populated = await RoutineSchedule.findById(schedule._id)
      .populate('vehicle', 'plateNumber model type')
      .populate('driver', 'name employeeId phone')
      .populate('assignedAdministrator', 'name email username');

    res.json(populated);
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID format' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/routines/:id
// ─────────────────────────────────────────────────────────────
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await RoutineSchedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Routine schedule not found' });

    // Block deletion if there's an active trip
    const activeTrip = await RoutineTripLog.findOne({ schedule: schedule._id, status: 'in_progress' });
    if (activeTrip) {
      return res.status(409).json({ message: 'Cannot delete schedule while a trip is in progress' });
    }

    await RoutineSchedule.findByIdAndDelete(req.params.id);
    // Trip logs are preserved (not deleted)

    res.json({ message: 'Routine schedule deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid schedule ID' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/routines/:id/logs
// ─────────────────────────────────────────────────────────────
exports.getTripLogs = async (req, res) => {
  try {
    const schedule = await RoutineSchedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Routine schedule not found' });

    const filter = { schedule: req.params.id };

    if (req.query.shift) {
      if (!['morning', 'afternoon'].includes(req.query.shift)) {
        return res.status(400).json({ message: 'shift must be morning or afternoon' });
      }
      filter.shift = req.query.shift;
    }
    if (req.query.status) {
      if (!['in_progress', 'completed'].includes(req.query.status)) {
        return res.status(400).json({ message: 'status must be in_progress or completed' });
      }
      filter.status = req.query.status;
    }

    const logs = await RoutineTripLog.find(filter)
      .populate('vehicle', 'plateNumber model')
      .populate('driver', 'name employeeId')
      .sort({ actualStartTime: -1 });

    res.json(logs);
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid schedule ID' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/routines/trips/:logId/complete
// Driver completes a trip
// ─────────────────────────────────────────────────────────────
exports.completeTrip = async (req, res) => {
  try {
    const log = await RoutineTripLog.findById(req.params.logId).populate('schedule');
    if (!log) return res.status(404).json({ message: 'Trip log not found' });

    // Only the assigned driver can complete
    const schedule = await RoutineSchedule.findById(log.schedule);
    if (!schedule) return res.status(404).json({ message: 'Associated schedule not found' });

    // Find driver by user id — match via Driver.employeeId or by _id
    // req.user.id is the User._id; we need to find the Driver linked to this user
    // The schedule.driver is a Driver._id; we need to verify the logged-in user is that driver
    // We look up the Driver whose employeeId matches the logged-in user's employeeId
    const user = await User.findById(req.user.id).select('employeeId role');
    const driver = await Driver.findById(schedule.driver);

    const isAssignedDriver =
      user?.role === 'DRIVER' &&
      driver &&
      (driver._id.toString() === req.user.driverId ||
       (user.employeeId && driver.employeeId && user.employeeId === driver.employeeId));

    if (!isAssignedDriver) {
      return res.status(403).json({ message: 'Only the assigned driver can complete this trip' });
    }

    if (log.status !== 'in_progress') {
      return res.status(409).json({ message: 'Trip is not in progress' });
    }

    log.actualEndTime = new Date();
    log.status = 'completed';
    await log.save();

    // Update vehicle back to available
    await Vehicle.findByIdAndUpdate(log.vehicle, { status: 'available' });

    res.json(log);
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID format' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/routines/my-trips  (Driver's own logs)
// ─────────────────────────────────────────────────────────────
exports.getMyTrips = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('employeeId');
    const driver = await Driver.findOne({ employeeId: user?.employeeId });
    if (!driver) return res.status(404).json({ message: 'Driver profile not found' });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const logs = await RoutineTripLog.find({
      driver: driver._id,
      $or: [
        { status: 'in_progress' },
        { actualStartTime: { $gte: sevenDaysAgo } },
      ],
    })
      .populate('vehicle', 'plateNumber model')
      .populate('schedule', 'routeName scheduleType pickupLocation dropoffLocation')
      .sort({ actualStartTime: -1 })
      .limit(50);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/routines/my-schedule  (Driver's assigned schedules)
// ─────────────────────────────────────────────────────────────
exports.getMySchedule = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('employeeId');
    const driver = await Driver.findOne({ employeeId: user?.employeeId });
    if (!driver) return res.status(404).json({ message: 'Driver profile not found' });

    const schedules = await RoutineSchedule.find({ driver: driver._id, status: 'active' })
      .populate('vehicle', 'plateNumber model type')
      .sort({ createdAt: -1 });

    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
