const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const Request = require('../models/Request');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Inspection = require('../models/Inspection');
const FuelLog = require('../models/FuelLog');
const MaintenanceReport = require('../models/MaintenanceReport');

// Middleware: driver only
const driverOnly = (req, res, next) => {
  if (req.user.role !== 'DRIVER') return res.status(403).json({ message: 'Driver access only' });
  next();
};

// Helper: find driver record linked to logged-in user
const getDriverRecord = async (userId) => {
  const user = await User.findById(userId).select('name username');
  const driver = await Driver.findOne({ name: user.name });
  return { user, driver };
};

// GET /api/driver/trips — assigned trips
router.get('/trips', authMiddleware, driverOnly, async (req, res) => {
  try {
    const { user } = await getDriverRecord(req.user.id);
    const trips = await Request.find({
      $or: [{ assignedDriver: user.name }, { driverUsername: user.username }],
      status: { $in: ['approved', 'in-progress', 'completed', 'started'] }
    }).sort({ date: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/driver/trips/:id/status — update trip status
router.patch('/trips/:id/status', authMiddleware, driverOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['started', 'in-progress', 'completed'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const trip = await Request.findByIdAndUpdate(
      req.params.id,
      { status, ...(status === 'completed' ? { completedAt: new Date() } : {}) },
      { new: true }
    );
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/driver/schedule — today + this week trips
router.get('/schedule', authMiddleware, driverOnly, async (req, res) => {
  try {
    const { user } = await getDriverRecord(req.user.id);
    const now = new Date();
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 7);

    const trips = await Request.find({
      assignedDriver: user.name,
      date: { $gte: weekStart.toISOString().slice(0, 10), $lte: weekEnd.toISOString().slice(0, 10) }
    }).sort({ date: 1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/driver/inspection — submit pre-trip inspection
router.post('/inspection', authMiddleware, driverOnly, async (req, res) => {
  try {
    const inspection = new Inspection({ ...req.body, driver: req.user.id });
    await inspection.save();
    res.status(201).json(inspection);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/driver/inspection — get own inspections
router.get('/inspection', authMiddleware, driverOnly, async (req, res) => {
  try {
    const inspections = await Inspection.find({ driver: req.user.id }).sort({ createdAt: -1 }).limit(20);
    res.json(inspections);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/driver/fuel — log fuel
router.post('/fuel', authMiddleware, driverOnly, async (req, res) => {
  try {
    const log = new FuelLog({ ...req.body, driver: req.user.id });
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/driver/fuel — get own fuel logs
router.get('/fuel', authMiddleware, driverOnly, async (req, res) => {
  try {
    const logs = await FuelLog.find({ driver: req.user.id }).sort({ date: -1 }).limit(30);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/driver/maintenance — submit maintenance report
router.post('/maintenance', authMiddleware, driverOnly, async (req, res) => {
  try {
    const report = new MaintenanceReport({ ...req.body, driver: req.user.id });
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/driver/maintenance — get own reports
router.get('/maintenance', authMiddleware, driverOnly, async (req, res) => {
  try {
    const reports = await MaintenanceReport.find({ driver: req.user.id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/driver/stats — dashboard stats
router.get('/stats', authMiddleware, driverOnly, async (req, res) => {
  try {
    const { user, driver } = await getDriverRecord(req.user.id);
    const today = new Date().toISOString().slice(0, 10);
    const trips = await Request.find({ assignedDriver: user.name });
    const todayTrips = trips.filter(t => t.date === today);
    const activeTrip = trips.find(t => t.status === 'started' || t.status === 'in-progress');

    res.json({
      totalTrips: trips.length,
      completedTrips: trips.filter(t => t.status === 'completed').length,
      todayTrips: todayTrips.length,
      activeTrip: activeTrip || null,
      vehicle: driver?.assignedVehiclePlate || null,
      status: driver?.status || 'available',
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
