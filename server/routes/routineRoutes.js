const router = require('express').Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/routineController');

// ── Transport Officer only ────────────────────────────────────
router.get('/',    authMiddleware, requireRole('TRANSPORT', 'ADMIN'), ctrl.getSchedules);
router.get('/:id', authMiddleware, requireRole('TRANSPORT', 'ADMIN'), ctrl.getScheduleById);
router.post('/',   authMiddleware, requireRole('TRANSPORT'), ctrl.createSchedule);
router.put('/:id', authMiddleware, requireRole('TRANSPORT'), ctrl.updateSchedule);
router.delete('/:id', authMiddleware, requireRole('TRANSPORT'), ctrl.deleteSchedule);

// Trip logs — Transport Officer views all logs for a schedule
router.get('/:id/logs', authMiddleware, requireRole('TRANSPORT', 'ADMIN'), ctrl.getTripLogs);

// ── Driver endpoints ──────────────────────────────────────────
// Driver completes a trip
router.post('/trips/:logId/complete', authMiddleware, requireRole('DRIVER'), ctrl.completeTrip);
// Driver views their own trips (last 7 days)
router.get('/driver/my-trips', authMiddleware, requireRole('DRIVER'), ctrl.getMyTrips);
// Driver views their assigned schedules
router.get('/driver/my-schedule', authMiddleware, requireRole('DRIVER'), ctrl.getMySchedule);

module.exports = router;
