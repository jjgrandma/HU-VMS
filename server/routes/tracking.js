const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const Vehicle = require('../models/Vehicle');

// In-memory store for live locations (keyed by vehicleId or driverUsername)
// Shape: { vehicleId: { lat, lng, speed, source, driverName, updatedAt } }
const liveLocations = {};

// POST /api/tracking/update — driver sends GPS location
router.post('/update', authMiddleware, async (req, res) => {
  try {
    const { vehicleId, vehiclePlate, lat, lng, speed, source } = req.body;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng required' });

    const key = vehicleId || vehiclePlate || req.user.id;

    // Only update if no hardware GPS exists for this vehicle, or source is hardware
    const existing = liveLocations[key];
    if (existing && existing.source === 'hardware' && source === 'mobile') {
      // Hardware takes priority — ignore mobile update
      return res.json({ message: 'Hardware GPS active, mobile ignored', location: existing });
    }

    liveLocations[key] = {
      vehicleId:   vehicleId || key,
      vehiclePlate: vehiclePlate || '',
      lat:         parseFloat(lat),
      lng:         parseFloat(lng),
      speed:       parseFloat(speed) || 0,
      source:      source || 'mobile', // 'mobile' | 'hardware'
      driverName:  req.user.name || '',
      updatedAt:   new Date().toISOString(),
    };

    // Also update vehicle record in DB if vehicleId provided
    if (vehicleId) {
      await Vehicle.findByIdAndUpdate(vehicleId, {
        'location.lat': parseFloat(lat),
        'location.lng': parseFloat(lng),
        speed: parseFloat(speed) || 0,
      }).catch(() => {});
    }

    res.json({ message: 'Location updated', location: liveLocations[key] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/tracking/stop — driver stops sharing location
router.delete('/stop', authMiddleware, async (req, res) => {
  try {
    const { vehicleId, vehiclePlate } = req.body;
    const key = vehicleId || vehiclePlate || req.user.id;
    delete liveLocations[key];
    res.json({ message: 'Tracking stopped' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/tracking/live — get all live locations
router.get('/live', authMiddleware, async (req, res) => {
  try {
    // Remove stale locations (older than 30 seconds)
    const now = Date.now();
    Object.keys(liveLocations).forEach(k => {
      if (now - new Date(liveLocations[k].updatedAt).getTime() > 30000) {
        delete liveLocations[k];
      }
    });
    res.json(Object.values(liveLocations));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/tracking/live/:vehicleId
router.get('/live/:vehicleId', authMiddleware, (req, res) => {
  const loc = liveLocations[req.params.vehicleId];
  if (!loc) return res.status(404).json({ message: 'No live location' });
  res.json(loc);
});

module.exports = router;
