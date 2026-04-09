const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Allow any localhost origin or no origin (e.g. curl/Postman)
    if (!origin || origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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
