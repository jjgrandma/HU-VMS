const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const MaintenanceIssue = require('../models/MaintenanceIssue');
const MaintenanceSchedule = require('../models/MaintenanceSchedule');
const Inventory = require('../models/Inventory');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// ─── ISSUES ──────────────────────────────────────────────

// POST /api/maintenance/report — driver submits issue
router.post('/report', authMiddleware, async (req, res) => {
  try {
    const { vehiclePlate, issue, priority, images } = req.body;
    if (!vehiclePlate || !issue) return res.status(400).json({ message: 'Vehicle plate and issue are required' });

    const vehicle = await Vehicle.findOne({ plateNumber: { $regex: new RegExp(`^${vehiclePlate}$`, 'i') } });
    const user = await User.findById(req.user.id).select('name');

    const newIssue = new MaintenanceIssue({
      vehicleId:    vehicle?._id,
      vehiclePlate: vehiclePlate.toUpperCase(),
      reportedBy:   req.user.id,
      reporterName: user?.name || req.user.name,
      issue,
      priority: priority || 'Medium',
      images: images || [],
    });

    await newIssue.save();
    res.status(201).json(newIssue);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/maintenance/issues — get all issues (maintenance officer) or own (driver)
router.get('/issues', authMiddleware, async (req, res) => {
  try {
    const { status, priority, vehiclePlate } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (vehiclePlate) filter.vehiclePlate = { $regex: vehiclePlate, $options: 'i' };

    // Drivers only see their own
    if (req.user.role === 'DRIVER') {
      filter.reportedBy = req.user.id;
    }

    const issues = await MaintenanceIssue.find(filter).sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/maintenance/approve/:id — approve issue, set vehicle to Under Maintenance
router.put('/approve/:id', authMiddleware, async (req, res) => {
  try {
    const { estimatedCost, notes } = req.body;
    const issue = await MaintenanceIssue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.status = 'approved';
    issue.approvedBy = req.user.name || 'Maintenance Officer';
    issue.approvedAt = new Date();
    if (estimatedCost) issue.estimatedCost = estimatedCost;
    if (notes) issue.notes = notes;
    await issue.save();

    // Set vehicle status to Under Maintenance
    if (issue.vehicleId) {
      await Vehicle.findByIdAndUpdate(issue.vehicleId, { status: 'maintenance' });
    } else {
      await Vehicle.updateOne(
        { plateNumber: { $regex: new RegExp(`^${issue.vehiclePlate}$`, 'i') } },
        { status: 'maintenance' }
      );
    }

    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/maintenance/reject/:id
router.put('/reject/:id', authMiddleware, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const issue = await MaintenanceIssue.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason },
      { new: true }
    );
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/maintenance/status/:id — update repair status
router.put('/status/:id', authMiddleware, async (req, res) => {
  try {
    const { status, actualCost, partsUsed, notes } = req.body;
    const issue = await MaintenanceIssue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.status = status;
    if (actualCost) issue.actualCost = actualCost;
    if (notes) issue.notes = notes;

    if (status === 'in-progress') {
      // No vehicle change needed
    }

    if (status === 'completed') {
      issue.completedAt = new Date();

      // Deduct parts from inventory
      if (partsUsed?.length) {
        issue.partsUsed = partsUsed;
        for (const part of partsUsed) {
          await Inventory.updateOne(
            { partName: { $regex: new RegExp(`^${part.partName}$`, 'i') } },
            { $inc: { quantity: -part.quantity } }
          );
        }
      }

      // Set vehicle back to available
      if (issue.vehicleId) {
        await Vehicle.findByIdAndUpdate(issue.vehicleId, { status: 'available' });
      } else {
        await Vehicle.updateOne(
          { plateNumber: { $regex: new RegExp(`^${issue.vehiclePlate}$`, 'i') } },
          { status: 'available' }
        );
      }
    }

    await issue.save();
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/maintenance/history/:vehiclePlate
router.get('/history/:vehiclePlate', authMiddleware, async (req, res) => {
  try {
    const issues = await MaintenanceIssue.find({
      vehiclePlate: { $regex: new RegExp(`^${req.params.vehiclePlate}$`, 'i') }
    }).sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── SCHEDULE ────────────────────────────────────────────

// POST /api/maintenance/schedule
router.post('/schedule', authMiddleware, async (req, res) => {
  try {
    const schedule = new MaintenanceSchedule({ ...req.body, createdBy: req.user.name });
    await schedule.save();
    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/maintenance/schedule
router.get('/schedule', authMiddleware, async (req, res) => {
  try {
    const schedules = await MaintenanceSchedule.find().sort({ scheduledDate: 1 });
    // Auto-mark overdue
    const today = new Date();
    for (const s of schedules) {
      if (s.status === 'scheduled' && new Date(s.scheduledDate) < today) {
        s.status = 'overdue';
        await s.save();
      }
    }
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/maintenance/schedule/:id
router.put('/schedule/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await MaintenanceSchedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── INVENTORY ───────────────────────────────────────────

// GET /api/maintenance/inventory
router.get('/inventory', authMiddleware, async (req, res) => {
  try {
    const items = await Inventory.find().sort({ partName: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/maintenance/inventory
router.post('/inventory', authMiddleware, async (req, res) => {
  try {
    const item = new Inventory(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Part already exists' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/maintenance/inventory/:id
router.put('/inventory/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/maintenance/inventory/:id
router.delete('/inventory/:id', authMiddleware, async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── REPORTS & STATS ─────────────────────────────────────

// GET /api/maintenance/stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [total, pending, inProgress, completed, lowStock] = await Promise.all([
      MaintenanceIssue.countDocuments(),
      MaintenanceIssue.countDocuments({ status: 'pending' }),
      MaintenanceIssue.countDocuments({ status: 'in-progress' }),
      MaintenanceIssue.countDocuments({ status: 'completed' }),
      Inventory.countDocuments({ $expr: { $lte: ['$quantity', '$minLevel'] } }),
    ]);

    const totalCost = await MaintenanceIssue.aggregate([
      { $match: { status: 'completed', actualCost: { $exists: true } } },
      { $group: { _id: null, total: { $sum: '$actualCost' } } },
    ]);

    const flagged = await MaintenanceIssue.countDocuments({ autoFlagged: true, status: { $ne: 'completed' } });

    res.json({
      total, pending, inProgress, completed, lowStock, flagged,
      totalCost: totalCost[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/maintenance/report-summary
router.get('/report-summary', authMiddleware, async (req, res) => {
  try {
    const issues = await MaintenanceIssue.find({ status: 'completed' });

    // Cost by vehicle
    const costByVehicle = {};
    issues.forEach(i => {
      if (!costByVehicle[i.vehiclePlate]) costByVehicle[i.vehiclePlate] = 0;
      costByVehicle[i.vehiclePlate] += i.actualCost || 0;
    });

    // Frequent issues
    const issueCounts = {};
    issues.forEach(i => {
      const key = i.issue.slice(0, 30);
      issueCounts[key] = (issueCounts[key] || 0) + 1;
    });

    // Vehicles with repeated issues (3+)
    const vehicleIssueCounts = {};
    await MaintenanceIssue.find().then(all => {
      all.forEach(i => {
        vehicleIssueCounts[i.vehiclePlate] = (vehicleIssueCounts[i.vehiclePlate] || 0) + 1;
      });
    });
    const repeatedIssueVehicles = Object.entries(vehicleIssueCounts)
      .filter(([, count]) => count >= 3)
      .map(([plate, count]) => ({ plate, count }));

    res.json({ costByVehicle, issueCounts, repeatedIssueVehicles });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

// POST /api/maintenance/send-to-admin — send maintenance report to admin
router.post('/send-to-admin', authMiddleware, async (req, res) => {
  try {
    const { reportType, summary, data } = req.body;
    const SentReport = require('../models/SentReport');

    // Find all admin users
    const admins = await User.find({ role: 'ADMIN', isActive: true }).select('username');
    if (!admins.length) return res.status(404).json({ message: 'No admin users found' });

    const columns = data?.length ? Object.keys(data[0]) : [];

    await Promise.all(admins.map(admin =>
      new SentReport({
        reportType: 'maintenance',
        reportName: reportType || 'Maintenance Report',
        sentTo: admin.username,
        sentBy: req.user.name || 'Maintenance Officer',
        data: data || [],
        columns,
      }).save()
    ));

    res.json({ message: `Report sent to ${admins.length} admin(s)` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
