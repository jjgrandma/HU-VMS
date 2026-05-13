/**
 * maps.js  —  Distance calculation proxy
 *
 * Strategy (all free, no API key required):
 *   1. Look up destination in the Ethiopian city coordinate table
 *   2. If found → call OSRM (free open-source routing engine) for real road distance
 *   3. If OSRM fails → Haversine × 1.3 road factor as final fallback
 *   4. If city not in table → Haversine × 1.3 using Nominatim geocoding
 *
 * Origin is always Haramaya University (9.1850, 42.0350)
 */

const router = require('express').Router();
const https  = require('https');
const http   = require('http');
const { authMiddleware } = require('../middleware/auth');

// ── Haramaya University coordinates ──────────────────────
const HU = { lat: 9.1850, lon: 42.0350 };

// ── Ethiopian city coordinate lookup table ────────────────
// Road distances from Haramaya are well-known; coordinates allow OSRM routing
const CITY_COORDS = {
  // East / nearby
  'harar':            { lat: 9.3120,  lon: 42.1180 },
  'haramaya':         { lat: 9.1850,  lon: 42.0350 },
  'dire dawa':        { lat: 9.5931,  lon: 41.8661 },
  'diredawa':         { lat: 9.5931,  lon: 41.8661 },
  'jigjiga':          { lat: 9.3500,  lon: 42.7900 },
  'jijiga':           { lat: 9.3500,  lon: 42.7900 },
  'chiro':            { lat: 9.0700,  lon: 40.8700 },
  'asebe teferi':     { lat: 9.0700,  lon: 40.8700 },
  'bedessa':          { lat: 9.0200,  lon: 40.7800 },
  'awash':            { lat: 8.9900,  lon: 40.1600 },
  'metehara':         { lat: 8.8700,  lon: 39.9200 },
  'gewane':           { lat: 9.9800,  lon: 40.6500 },
  'gode':             { lat: 5.9500,  lon: 43.5700 },
  'kebri dahar':      { lat: 6.7400,  lon: 44.2800 },

  // Central
  'addis ababa':      { lat: 9.0320,  lon: 38.7469 },
  'adama':            { lat: 8.5400,  lon: 39.2700 },
  'nazret':           { lat: 8.5400,  lon: 39.2700 },
  'bishoftu':         { lat: 8.7500,  lon: 38.9833 },
  'debre birhan':     { lat: 9.6833,  lon: 39.5333 },
  'ambo':             { lat: 8.9833,  lon: 37.8500 },
  'nekemte':          { lat: 9.0833,  lon: 36.5500 },
  'gimbi':            { lat: 9.1667,  lon: 35.8333 },

  // North
  'dessie':           { lat: 11.1300, lon: 39.6400 },
  'kombolcha':        { lat: 11.0800, lon: 39.7400 },
  'woldia':           { lat: 11.8167, lon: 39.6000 },
  'lalibela':         { lat: 12.0333, lon: 39.0500 },
  'bahir dar':        { lat: 11.5742, lon: 37.3614 },
  'gondar':           { lat: 12.6030, lon: 37.4521 },
  'axum':             { lat: 14.1200, lon: 38.7200 },
  'mekelle':          { lat: 13.4967, lon: 39.4767 },
  'adigrat':          { lat: 14.2700, lon: 39.4600 },
  'shire':            { lat: 14.1000, lon: 38.2800 },

  // South
  'hawassa':          { lat: 7.0621,  lon: 38.4762 },
  'shashamane':       { lat: 7.2000,  lon: 38.6000 },
  'arba minch':       { lat: 6.0333,  lon: 37.5500 },
  'wolaita sodo':     { lat: 6.8500,  lon: 37.7500 },
  'dilla':            { lat: 6.4100,  lon: 38.3100 },
  'yirgalem':         { lat: 6.7500,  lon: 38.4000 },
  'moyale':           { lat: 3.5300,  lon: 39.0500 },

  // West / Southwest
  'jimma':            { lat: 7.6667,  lon: 36.8333 },
  'gambela':          { lat: 8.2500,  lon: 34.5833 },
  'assosa':           { lat: 10.0667, lon: 34.5333 },
  'tepi':             { lat: 7.2000,  lon: 35.4500 },
  'mizan teferi':     { lat: 6.9833,  lon: 35.5833 },
};

// ── Helpers ───────────────────────────────────────────────
function haversineKm(lat1, lon1, lat2, lon2) {
  const R    = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a    = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, { headers: { 'User-Agent': 'HU-VMS/1.0' } }, (res) => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error('Invalid JSON response')); }
      });
    }).on('error', reject);
  });
}

// Resolve destination text → { lat, lon, resolvedName }
function resolveCoords(destination) {
  const key = destination.toLowerCase().trim();

  // Exact match
  if (CITY_COORDS[key]) {
    return { ...CITY_COORDS[key], resolvedName: destination };
  }

  // Partial match — destination contains a known city name
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (key.includes(city) || city.includes(key)) {
      return { ...coords, resolvedName: city };
    }
  }

  return null; // unknown place
}

// Call OSRM public routing API (completely free, no key)
async function osrmDistance(fromLat, fromLon, toLat, toLon) {
  const url = `http://router.project-osrm.org/route/v1/driving/`
    + `${fromLon},${fromLat};${toLon},${toLat}?overview=false`;
  const data = await httpGet(url);
  if (data.code === 'Ok' && data.routes?.length) {
    return {
      distKm:      Math.round(data.routes[0].distance / 100) / 10,
      durationMin: Math.round(data.routes[0].duration / 60),
      source:      'osrm',
    };
  }
  throw new Error('OSRM route not found');
}

// Nominatim geocoding (free OpenStreetMap, last resort for unknown cities)
async function nominatimGeocode(place) {
  const q   = encodeURIComponent(`${place}, Ethiopia`);
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=et`;
  const data = await httpGet(url);
  if (!Array.isArray(data) || !data.length) throw new Error(`Place not found: ${place}`);
  return {
    lat:         parseFloat(data[0].lat),
    lon:         parseFloat(data[0].lon),
    resolvedName: data[0].display_name.split(',')[0],
  };
}

// ── Route: GET /api/maps/distance?destination=<text> ──────
router.get('/distance', authMiddleware, async (req, res) => {
  const { destination } = req.query;
  if (!destination || !destination.trim()) {
    return res.status(400).json({ message: 'destination query param is required' });
  }

  let coords    = null;
  let destName  = destination;
  let source    = 'haversine_fallback';
  let warning   = null;

  // Step 1 — resolve coordinates
  coords = resolveCoords(destination);

  if (!coords) {
    // Step 2 — try Nominatim for unknown places
    try {
      coords   = await nominatimGeocode(destination);
      destName = coords.resolvedName || destination;
    } catch (err) {
      // Step 3 — complete fallback: return a safe default
      console.warn('[Maps] Could not resolve:', destination, err.message);
      return res.json({
        distKm:      50,
        durationMin: 60,
        destName:    destination,
        source:      'haversine_fallback',
        warning:     `Could not find "${destination}". Using default 50 km estimate.`,
        unknownPlace: true,
      });
    }
  } else {
    destName = coords.resolvedName || destination;
  }

  // Step 4 — try OSRM for real road distance
  try {
    const route = await osrmDistance(HU.lat, HU.lon, coords.lat, coords.lon);
    return res.json({
      distKm:      route.distKm,
      durationMin: route.durationMin,
      destName,
      source:      'osrm',   // real road routing, free
    });
  } catch (err) {
    console.warn('[Maps] OSRM failed, using Haversine:', err.message);
    warning = 'Road routing unavailable — using estimated distance';
  }

  // Step 5 — Haversine × 1.3 final fallback
  const straight  = haversineKm(HU.lat, HU.lon, coords.lat, coords.lon);
  const distKm    = Math.round(straight * 1.3 * 10) / 10;
  const durationMin = Math.round(distKm / 60 * 60);

  return res.json({ distKm, durationMin, destName, source: 'haversine_fallback', warning });
});

module.exports = router;
