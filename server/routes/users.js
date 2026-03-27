const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authMiddleware, requireRole } = require('../middleware/auth');

// GET /api/users/me — get own profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/users/me — update own profile
router.patch('/me', authMiddleware, async (req, res) => {
  try {
    const allowed = ['name', 'email', 'phone', 'department', 'profilePhoto'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const updated = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/users/me/change-password — change own password
router.post('/me/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both current and new password are required' });
    if (newPassword.length < 8)
      return res.status(400).json({ message: 'New password must be at least 8 characters' });

    const user = await User.findById(req.user.id);
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/users  (admin only)
router.get('/', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/users/:id — admin update user (guard against 'me')
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    // If somehow 'me' slips through, handle it
    const targetId = id === 'me' ? req.user.id : id;
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    const updated = await User.findByIdAndUpdate(targetId, req.body, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/users/:id/reset-password  (admin sets a new password)
router.post('/:id/reset-password', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    const hashed = await bcrypt.hash(newPassword, 10);
    const updated = await User.findByIdAndUpdate(req.params.id, { password: hashed }, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Password reset successfully', user: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/users/:id/reset-username  (admin sets a new username)
router.post('/:id/reset-username', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const { newUsername } = req.body;
    if (!newUsername || newUsername.trim().length < 3)
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    const exists = await User.findOne({ username: newUsername.trim() });
    if (exists) return res.status(400).json({ message: 'Username already taken' });
    const updated = await User.findByIdAndUpdate(
      req.params.id, { username: newUsername.trim() }, { new: true }
    ).select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Username reset successfully', user: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/users/:id  (admin only)
router.delete('/:id', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/users/profile — update own profile (avoids /:id conflict)
router.post('/profile', authMiddleware, async (req, res) => {
  try {
    const allowed = ['name', 'email', 'phone', 'department', 'profilePhoto'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const updated = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
