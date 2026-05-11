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
}));

// ── Body parsing ──────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

// ── NoSQL injection sanitization ──────────────────────────
app.use(mongoSanitize());

// ── Global rate limiter (100 req / 15 min per IP) ─────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api/', globalLimiter);

// ── Strict login rate limiter (10 attempts / 15 min) ──────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please wait 15 minutes.' },
});
app.use('/api/auth/login', loginLimiter);

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
