const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const app = express();

// ── Security headers ──────────────────────────────────────
app.use(helmet());
app.disable('x-powered-by');

// ── CORS — only allow localhost in dev ────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  // Expose rate-limit headers so the frontend can read remaining attempts
  exposedHeaders: [
    'RateLimit-Limit',
    'RateLimit-Remaining',
    'RateLimit-Reset',
    'Retry-After',
  ],
}));

// ── Body parsing ──────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

// ── NoSQL injection sanitization ──────────────────────────
app.use(mongoSanitize());

// ── Global rate limiter ───────────────────────────────────
// 1000 req / 15 min per IP — covers all normal usage including
// GPS polling (every 4s = ~225 req/15min) and map polling.
// Auth endpoints have their own stricter limiters below.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
  // Skip rate limiting for high-frequency polling endpoints
  skip: (req) => {
    const path = req.path;
    return (
      path.startsWith('/api/tracking') ||   // GPS updates every 4s
      path.startsWith('/api/notifications') // notification bell polling
    );
  },
});
app.use('/api/', globalLimiter);


// ── Password reset rate limiter (5 attempts / 15 min) ─────
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many password reset attempts. Please wait 15 minutes.' },
});
app.use('/api/auth/forgot-password', resetLimiter);
app.use('/api/auth/reset-password', resetLimiter);

// Routes
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/requests',  require('./routes/requests'));
app.use('/api/vehicles',  require('./routes/vehicles'));
app.use('/api/drivers',   require('./routes/drivers'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/reports',   require('./routes/reports'));
app.use('/api/complaints',require('./routes/complaints'));
app.use('/api/fuel',          require('./routes/fuel'));
app.use('/api/fuel-requests', require('./routes/fuelRequests'));
app.use('/api/fuel-inventory', require('./routes/fuelInventory'));
app.use('/api/contact',   require('./routes/contact'));
app.use('/api/driver',    require('./routes/driverPortal'));
app.use('/api/security',  require('./routes/security'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/tracking',     require('./routes/tracking'));

// ─── Scheduled Jobs ───────────────────────────────────────
require('./jobs/dailyMaintenanceReport')();

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error('MongoDB connection error:', err));
