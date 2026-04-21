const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');

// GET /api/notifications — get notifications for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username role');
    const notifications = await Notification.find({
      $or: [
        { recipientRole: user.role },
        { recipientUsername: user.username },
      ],
    }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/notifications/unread-count
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username role');
    const count = await Notification.countDocuments({
      $or: [{ recipientRole: user.role }, { recipientUsername: user.username }],
      read: false,
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true, readAt: new Date() });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username role');
    await Notification.updateMany(
      { $or: [{ recipientRole: user.role }, { recipientUsername: user.username }], read: false },
      { read: true, readAt: new Date() }
    );
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
