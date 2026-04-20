import { useState, useEffect, useRef } from 'react';
import { Navigation, MapPin, WifiOff } from 'lucide-react';

const BASE  = 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');

/**
 * GPS Tracker component — shown on active trips.
 * Sends driver phone GPS to backend every 3 seconds.
 */
export default function DriverGPSTracker({ trip, onStatusChange }) {
  const [tracking, setTracking]   = useState(false);
  const [gpsError, setGpsError]   = useState('');
  const [lastPos, setLastPos]     = useState(null);
  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);
  const posRef = useRef(null);

  const sendLocation = async (pos) => {
    if (!pos) return;
    try {
      await fetch(`${BASE}/tracking/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          vehicleId:    trip.assignedVehicleId || null,
          vehiclePlate: trip.assignedVehicle?.match(/\(([^)]+)\)/)?.[1] || '',
          lat:          pos.coords.latitude,
          lng:          pos.coords.longitude,
          speed:        pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0, // m/s → km/h
          source:       'mobile',
        }),
      });
    } catch (err) { console.error('GPS send error:', err); }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setGpsError('GPS not supported on this device');
      return;
    }
    setGpsError('');
    setTracking(true);

    // Watch position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        posRef.current = pos;
        setLastPos({ lat: pos.coords.latitude, lng: pos.coords.longitude, speed: Math.round((pos.coords.speed || 0) * 3.6) });
      },
      (err) => setGpsError(`GPS error: ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );

    // Send every 3 seconds
    intervalRef.current = setInterval(() => {
      if (posRef.current) sendLocation(posRef.current);
    }, 3000);
  };

  const stopTracking = async () => {
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    watchIdRef.current = null;
    intervalRef.current = null;
    posRef.current = null;
    setTracking(false);
    setLastPos(null);

    // Tell server to remove this location
    await fetch(`${BASE}/tracking/stop`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ vehiclePlate: trip.assignedVehicle?.match(/\(([^)]+)\)/)?.[1] || '' }),
    }).catch(console.error);
  };

  // Auto-stop on unmount
  useEffect(() => () => { stopTracking(); }, []);

  if (!trip || !['approved', 'started', 'in-progress'].includes(trip.status)) return null;

  return (
    <div className="gps-tracker-card">
      <div className="gps-tracker-header">
        <Navigation size={18} color={tracking ? '#16a34a' : '#6b7280'} />
        <span>Mobile GPS Tracking</span>
        {tracking && <span className="gps-live-dot" />}
      </div>

      {gpsError && (
        <div className="gps-error"><WifiOff size={14} /> {gpsError}</div>
      )}

      {lastPos && (
        <div className="gps-coords">
          <MapPin size={13} />
          <span>{lastPos.lat.toFixed(5)}, {lastPos.lng.toFixed(5)}</span>
          {lastPos.speed > 0 && <span className="gps-speed">{lastPos.speed} km/h</span>}
        </div>
      )}

      <div className="gps-tracker-actions">
        {!tracking ? (
          <button className="gps-btn start" onClick={startTracking}>
            📍 Start GPS Sharing
          </button>
        ) : (
          <button className="gps-btn stop" onClick={stopTracking}>
            ⏹ Stop GPS Sharing
          </button>
        )}
      </div>

      <p className="gps-note">
        {tracking
          ? '✅ Your location is being shared with the transport officer'
          : 'Share your GPS so the transport officer can track your trip in real-time'}
      </p>
    </div>
  );
}
