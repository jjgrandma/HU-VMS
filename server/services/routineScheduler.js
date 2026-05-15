const cron = require('node-cron');
const { DateTime } = require('luxon');
const RoutineSchedule = require('../models/RoutineSchedule');
const RoutineTripLog  = require('../models/RoutineTripLog');
const Vehicle         = require('../models/Vehicle');
const Notification    = require('../models/Notification');
const Driver          = require('../models/Driver');

// Ethiopia timezone
const TZ = 'Africa/Addis_Ababa';

// Reminder window: notify driver 30 minutes before departure
const REMINDER_MINUTES = 30;

/**
 * Returns current Ethiopia time as a Luxon DateTime
 */
function nowEAT() {
  return DateTime.now().setZone(TZ);
}

/**
 * Returns today's date string in YYYY-MM-DD (Ethiopia timezone)
 */
function todayString() {
  return nowEAT().toFormat('yyyy-MM-dd');
}

/**
 * Parse HH:MM string into { hour, minute }
 */
function parseTime(hhmm) {
  const [hour, minute] = hhmm.split(':').map(Number);
  return { hour, minute };
}

/**
 * Returns minutes until departure for a given HH:MM time string.
 * Negative if already past.
 */
function minutesUntil(hhmm) {
  const now = nowEAT();
  const { hour, minute } = parseTime(hhmm);
  const departure = now.set({ hour, minute, second: 0, millisecond: 0 });
  return departure.diff(now, 'minutes').minutes;
}

/**
 * Check if a reminder has already been sent today for this schedule+shift
 */
async function reminderAlreadySentToday(scheduleId, shift) {
  const today = todayString();
  const existing = await Notification.findOne({
    'data.scheduleId': scheduleId.toString(),
    'data.shift': shift,
    'data.reminderDate': today,
    type: 'routine_reminder',
  });
  return !!existing;
}

/**
 * Check if vehicle status transition has already been applied today for this schedule+shift
 */
async function transitionAlreadyAppliedToday(scheduleId, shift) {
  const today = todayString();
  const existing = await RoutineTripLog.findOne({
    schedule: scheduleId,
    shift,
    tripDate: today,
  });
  return !!existing;
}

/**
 * Send a reminder notification to the driver
 */
async function sendDriverReminder(schedule, shift, departureTime) {
  try {
    // Get driver's User record for username (notifications use username)
    const driver = await Driver.findById(schedule.driver).lean();
    if (!driver) {
      console.warn(`[RoutineScheduler] No driver found for schedule ${schedule._id}, skipping reminder`);
      return;
    }

    // Get vehicle plate
    const vehicle = await Vehicle.findById(schedule.vehicle).lean();
    const plate = vehicle ? vehicle.plateNumber : 'N/A';

    const shiftLabel = shift === 'morning' ? 'Morning' : 'Afternoon';
    const today = todayString();

    // Build route description if locations are set
    const routeDesc = (schedule.pickupLocation && schedule.dropoffLocation)
      ? ` Route: ${schedule.pickupLocation} → ${schedule.dropoffLocation}.`
      : '';

    await new Notification({
      recipientRole: 'DRIVER',
      recipientUsername: driver.employeeId || null,
      type: 'routine_reminder',
      title: `🚌 ${shiftLabel} Shuttle Reminder`,
      message: `Your ${shiftLabel.toLowerCase()} shuttle (${schedule.routeName}) departs at ${departureTime}.${routeDesc} ` +
               `Vehicle: ${plate}. Please be ready.`,
      data: {
        scheduleId:    schedule._id.toString(),
        shift,
        reminderDate:  today,
        departureTime,
        vehiclePlate:  plate,
        routeName:     schedule.routeName,
        pickupLocation:  schedule.pickupLocation || null,
        dropoffLocation: schedule.dropoffLocation || null,
      },
    }).save();

    console.log(`[RoutineScheduler] Reminder sent for schedule ${schedule._id} (${shift} shift)`);
  } catch (err) {
    console.error(`[RoutineScheduler] Error sending reminder for schedule ${schedule._id}:`, err.message);
  }
}

/**
 * Transition vehicle to in-use and create a trip log
 */
async function triggerDeparture(schedule, shift, departureTime) {
  try {
    const vehicle = await Vehicle.findById(schedule.vehicle);
    if (!vehicle) {
      console.warn(`[RoutineScheduler] Vehicle not found for schedule ${schedule._id}`);
      return;
    }

    if (vehicle.status !== 'available') {
      // Notify Transport Officer that vehicle is not available
      await new Notification({
        recipientRole: 'TRANSPORT',
        type: 'general',
        title: `⚠️ Routine Shuttle Vehicle Unavailable`,
        message: `Vehicle ${vehicle.plateNumber} is currently "${vehicle.status}" and cannot depart for the ` +
                 `${shift} shift of "${schedule.routeName}" scheduled at ${departureTime}. ` +
                 `Please resolve manually.`,
        data: {
          scheduleId:   schedule._id.toString(),
          shift,
          vehiclePlate: vehicle.plateNumber,
          vehicleStatus: vehicle.status,
        },
      }).save();
      console.warn(`[RoutineScheduler] Vehicle ${vehicle.plateNumber} not available for departure (status: ${vehicle.status})`);
      return;
    }

    // Mark vehicle in-use
    vehicle.status = 'in-use';
    await vehicle.save();

    // Create trip log
    const today = todayString();
    await new RoutineTripLog({
      schedule:               schedule._id,
      vehicle:                schedule.vehicle,
      driver:                 schedule.driver,
      shift,
      scheduledDepartureTime: departureTime,
      actualStartTime:        new Date(),
      status:                 'in_progress',
      tripDate:               today,
    }).save();

    console.log(`[RoutineScheduler] Departure triggered for schedule ${schedule._id} (${shift} shift)`);
  } catch (err) {
    console.error(`[RoutineScheduler] Error triggering departure for schedule ${schedule._id}:`, err.message);
  }
}

/**
 * Main cron tick — runs every minute
 */
async function tick() {
  try {
    const schedules = await RoutineSchedule.find({
      scheduleType: 'EMPLOYEE_SHUTTLE',
      status: 'active',
    }).lean();

    for (const schedule of schedules) {
      const shifts = [
        { key: 'morning',   time: schedule.morningDepartureTime },
        { key: 'afternoon', time: schedule.afternoonDepartureTime },
      ];

      for (const { key: shift, time } of shifts) {
        if (!time) continue;

        const minsUntil = minutesUntil(time);

        // ── Reminder: send once when 0 < minsUntil <= REMINDER_MINUTES ──
        if (minsUntil > 0 && minsUntil <= REMINDER_MINUTES) {
          const alreadySent = await reminderAlreadySentToday(schedule._id, shift);
          if (!alreadySent) {
            await sendDriverReminder(schedule, shift, time);
          }
        }

        // ── Departure: trigger once when minsUntil is in [-1, 0] (same minute) ──
        if (minsUntil >= -1 && minsUntil <= 0) {
          const alreadyTriggered = await transitionAlreadyAppliedToday(schedule._id, shift);
          if (!alreadyTriggered) {
            await triggerDeparture(schedule, shift, time);
          }
        }
      }
    }
  } catch (err) {
    console.error('[RoutineScheduler] Tick error:', err.message);
  }
}

/**
 * Startup recovery — runs once when the scheduler initialises.
 * Catches any departures that were missed while the server was down.
 * For each active EMPLOYEE_SHUTTLE schedule, if the departure time has
 * already passed today AND no trip log exists yet, trigger the departure now.
 */
async function recoverMissedDepartures() {
  try {
    const schedules = await RoutineSchedule.find({
      scheduleType: 'EMPLOYEE_SHUTTLE',
      status: 'active',
    }).lean();

    let recovered = 0;

    for (const schedule of schedules) {
      const shifts = [
        { key: 'morning',   time: schedule.morningDepartureTime },
        { key: 'afternoon', time: schedule.afternoonDepartureTime },
      ];

      for (const { key: shift, time } of shifts) {
        if (!time) continue;

        const minsUntil = minutesUntil(time);

        // Departure has already passed today (up to 8 hours ago to avoid
        // recovering yesterday's missed trips after midnight)
        if (minsUntil < 0 && minsUntil >= -480) {
          const alreadyTriggered = await transitionAlreadyAppliedToday(schedule._id, shift);
          if (!alreadyTriggered) {
            console.log(`[RoutineScheduler] Recovering missed departure: schedule ${schedule._id} (${shift} shift, was ${time})`);
            await triggerDeparture(schedule, shift, time);
            recovered++;
          }
        }
      }
    }

    if (recovered > 0) {
      console.log(`[RoutineScheduler] Recovery complete — ${recovered} missed departure(s) processed`);
    } else {
      console.log('[RoutineScheduler] Recovery check complete — no missed departures');
    }
  } catch (err) {
    console.error('[RoutineScheduler] Recovery error:', err.message);
  }
}

/**
 * Initialize the routine scheduler — call after MongoDB connects
 */
function initializeRoutineScheduler() {
  try {
    // Run every minute
    cron.schedule('* * * * *', tick, { timezone: TZ });
    console.log('[RoutineScheduler] Initialized — running every minute (Africa/Addis_Ababa)');

    // Recover any departures missed while the server was down
    recoverMissedDepartures();
  } catch (err) {
    console.error('[RoutineScheduler] Failed to initialize:', err.message);
    // Non-fatal — server continues
  }
}

module.exports = { initializeRoutineScheduler };
