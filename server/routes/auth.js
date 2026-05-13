const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const PasswordResetLog = require('../models/PasswordResetLog');
const { authMiddleware, requireRole } = require('../middleware/auth');

const VALID_ROLES = ['ADMIN', 'TRANSPORT', 'DRIVER', 'USER', 'FUEL_OFFICER', 'GATE_OFFICER', 'MAINTENANCE_OFFICER', 'DEAN'];

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Case-insensitive username lookup
    const query = { username: { $regex: new RegExp(`^${username.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } };
    if (role) query.role = role;

    const user = await User.findOne(query).select('+password');
    // Use same message for both "not found" and "wrong password" to prevent user enumeration
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isActive) return res.status(403).json({ message: 'Account is disabled. Contact admin.' });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        unitType:         user.unitType         || null,
        unitName:         user.unitName         || null,
        collegeName:      user.collegeName      || null,
        mustChangePassword: user.mustChangePassword || false,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/register (admin only in production)
router.post('/register', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const { name, username, email, password, role, phone, department, employeeId, unitType, unitName, collegeName } = req.body;

    if (!name || !username || !email || !password || !role) {
      return res.status(400).json({ message: 'name, username, email, password and role are required' });
    }

    // Validate role is one of the allowed values
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ message: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` });
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const exists = await User.findOne({ $or: [{ username: username.trim() }, { email: email.trim() }] });
    if (exists) {
      const field = exists.username === username.trim() ? 'Username' : 'Email';
      return res.status(400).json({ message: `${field} already exists` });
    }

    const hashed = await bcrypt.hash(password, 12); // increased from 10 to 12
    const user = new User({
      name: name.trim(),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashed,
      role,
      phone: phone?.trim(),
      department: department?.trim(),
      employeeId: employeeId?.trim(),
      unitType:    unitType    || null,
      unitName:    unitName    || null,
      collegeName: collegeName
        ? collegeName.trim().replace(/\b\w/g, c => c.toUpperCase())
        : null,
    });
    await user.save();

    const { password: _pw, ...userOut } = user.toObject();
    res.status(201).json({ message: 'User created successfully', user: userOut });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email or username is required' });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email }, { username: email }]
    });

    // Always return the same response to prevent account enumeration
    if (!user) {
      return res.json({ message: 'If an account with that email or username exists, a reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Log the password reset request
    const resetLog = new PasswordResetLog({
      user: user._id,
      token: hashedToken,
      tokenExpires: user.resetPasswordExpires,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    await resetLog.save();

    // In production, send email here
    // For now, just log the reset URL
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    console.log('Password Reset URL:', resetUrl);
    console.log('User:', user.email);

    res.json({ 
      message: 'If an account with that email or username exists, a reset link has been sent.',
      // Remove this in production
      resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/auth/verify-reset-token/:token
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    res.json({ message: 'Token is valid' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      // Mark as expired in log
      await PasswordResetLog.updateOne(
        { token: hashedToken },
        { status: 'expired' }
      );
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password — bcrypt rounds 12
    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Update log status
    await PasswordResetLog.updateOne(
      { token: hashedToken },
      { status: 'completed', completedAt: new Date() }
    );

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/auth/reset-logs - Get password reset logs (Admin only)
router.get('/reset-logs', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const { status, search, dateFrom, dateTo } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (dateFrom || dateTo) {
      filter.requestedAt = {};
      if (dateFrom) filter.requestedAt.$gte = new Date(dateFrom);
      if (dateTo)   filter.requestedAt.$lte = new Date(new Date(dateTo).setHours(23,59,59,999));
    }

    let logs = await PasswordResetLog.find(filter)
      .populate('user', 'name email username role department')
      .sort({ requestedAt: -1 })
      .limit(200);

    // Search filter (post-query since it's on populated fields)
    if (search) {
      const q = search.toLowerCase();
      logs = logs.filter(l =>
        (l.user?.name     || '').toLowerCase().includes(q) ||
        (l.user?.email    || '').toLowerCase().includes(q) ||
        (l.user?.username || '').toLowerCase().includes(q)
      );
    }

    // Auto-mark expired pending tokens
    const now = new Date();
    const expiredIds = logs
      .filter(l => l.status === 'pending' && l.tokenExpires && new Date(l.tokenExpires) < now)
      .map(l => l._id);
    if (expiredIds.length > 0) {
      await PasswordResetLog.updateMany({ _id: { $in: expiredIds } }, { status: 'expired' });
      logs = logs.map(l =>
        expiredIds.some(id => id.equals(l._id)) ? { ...l.toObject(), status: 'expired' } : l
      );
    }

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/reset-logs/:id/manual-reset — Admin manually resets a user's password
router.post('/reset-logs/:id/manual-reset', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const log = await PasswordResetLog.findById(req.params.id).populate('user');
    if (!log) return res.status(404).json({ message: 'Log not found' });

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(log.user._id, {
      password: hashed,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
      mustChangePassword: true,   // force user to change on next login
    });

    await PasswordResetLog.findByIdAndUpdate(req.params.id, {
      status: 'completed',
      completedAt: new Date(),
    });

    res.json({ message: `Password reset successfully for ${log.user.name}` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/auth/reset-logs/:id/cancel — Admin cancels/rejects a request
router.patch('/reset-logs/:id/cancel', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const log = await PasswordResetLog.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    ).populate('user', 'name email username role');
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/auth/reset-logs/:id — Admin deletes a log entry
router.delete('/reset-logs/:id', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    await PasswordResetLog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Log deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/change-password — Authenticated user changes their own password
// Used when mustChangePassword === true (admin-set temporary password)
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ message: 'New password must contain at least one uppercase letter' });
    }

    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({ message: 'New password must contain at least one number' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'New password must be different from the current password' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.mustChangePassword = false;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;