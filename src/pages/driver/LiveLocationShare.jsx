import { useState, useEffect, useRef, useCallback } from 'react';
import { Navigation, NavigationOff, MapPin, Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';
import './LiveLocationShare.css';

const BASE  = 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');

/**
 * LiveLocationShare
 * Driver activates this to share their phone/browser GPS with the
 * Transport Officer's live tracking map.
 *
 * Props:
 *   vehicleId    — MongoDB _id of the assigned vehicle
 *   vehiclePlate — plate number (shown in map popup)
 *   tripId       — active trip _id (optional, for context)
 */
export default function LiveLocationShare({ vehicleId, vehiclePlate, tripId }) {
  const [sharing, setSharing]       = useState(false);
  const [position, setPosition]     = useState(null);   // { lat, lng, speed, accuracy }
  const [error, setError]           = useState(null);
  const [lastSent, setLastSent]     = useState(null);   // ISO timestamp
  const [sendCount, setSendCount]   = useState(0);
  const [permission, setPermission] = useState('unknown'); // 'granted'|'denied'|'unknown'

  const watchIdRef    = useRef(null);
  const intervalRef   = useRef(null);
  const latestPosRef  = useRef(null); // always holds the freshest coords

  // ── Send location to server ──────────────────────────────
  const sendLocation = useCallback(async (pos) => {
    if (!pos) return;
    try {
      await fetch(`${BASE}/tracking/update`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          vehicleId,
          vehiclePlate,
          tripId,
          lat:    pos.lat,
          lng:    pos.lng,
          speed:  pos.speed,
          source: 'mobile',
        }),
      });
      setLastSent(new Date().toLocaleTimeString());
      setSendCount(c => c + 1);
      setError(null);
    } catch {
      setError('Failed to send location. Check connection.');
    }
  }, [vehicleId, vehiclePlate, tripId]);

  // ── Start sharing ────────────────────────────────────────
  const startSharing = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setError(null);
    setSharing(true);

    // Watch position — fires whenever device moves
    watchIdRef.current = navigator.geolocation.watchPosition(
      (geo) => {
        const pos = {
          lat:      geo.coords.latitude,
          lng:      geo.coords.longitude,
          speed:    geo.coords.speed != null ? Math.round(geo.coords.speed * 3.6) : 0, // m/s → km/h
          accuracy: Math.round(geo.coords.accuracy),
        };
        latestPosRef.current = pos;
        setPosition(pos);
        setPermission('granted');
      },
      (err) => {
        if (err.code === 1) {
          setPermission('denied');
          setError('Location permission denied. Enable it in browser settings.');
        } else if (err.code === 2) {
          setError('Location unavailable. Move to an open area.');
        } else {
          setError('Location request timed out. Retrying...');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    // Send to server every 5 seconds regardless of movement
    intervalRef.current = setInterval(() => {
      if (latestPosRef.current) sendLocation(latestPosRef.current);
    }, 5000);
  };

  // ── Stop sharing ─────────────────────────────────────────
  const stopSharing = useCallback(async () => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSharing(false);
    setPosition(null);
    latestPosRef.current = null;

    // Tell server to remove this vehicle from live map
    try {
      await fetch(`${BASE}/tracking/stop`, {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ vehicleId, vehiclePlate }),
      });
    } catch {}
  }, [vehicleId, vehiclePlate]);

  // Cleanup on unmount
  useEffect(() => () => { stopSharing(); }, [stopSharing]);

  // ── Render ───────────────────────────────────────────────
  return (
    <div className={`lls-card ${sharing ? 'lls-active' : ''}`}>
      <div className="lls-header">
        <div className="lls-title-row">
          <div className={`lls-status-dot ${sharing ? 'lls-dot-live' : 'lls-dot-off'}`} />
          <span className="lls-title">
            {sharing ? 'Sharing Live Location' : 'Location Sharing Off'}
          </span>
          {sharing
            ? <Wifi size={15} className="lls-wifi-icon lls-wifi-on" />
            : <WifiOff size={15} className="lls-wifi-icon lls-wifi-off" />}
        </div>
        <p className="lls-subtitle">
          {sharing
            ? 'Transport Officer can see your position on the live map'
            : 'Start sharing so the Transport Officer can track your trip'}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="lls-error">
          <AlertTriangle size={14} />
          {error}
        </div>
      )}

      {/* Live position display */}
      {sharing && position && (
        <div className="lls-position-grid">
          <div className="lls-pos-item">
            <MapPin size={13} className="lls-pos-icon" />
            <div>
              <div className="lls-pos-label">Coordinates</div>
              <div className="lls-pos-value">{position.lat.toFixed(5)}, {position.lng.toFixed(5)}</div>
            </div>
          </div>
          <div className="lls-pos-item">
            <Navigation size={13} className="lls-pos-icon" />
            <div>
              <div className="lls-pos-label">Speed</div>
              <div className="lls-pos-value">{position.speed} km/h</div>
            </div>
          </div>
          <div className="lls-pos-item">
            <CheckCircle size={13} className="lls-pos-icon" />
            <div>
              <div className="lls-pos-label">Accuracy</div>
              <div className="lls-pos-value">±{position.accuracy} m</div>
            </div>
          </div>
          <div className="lls-pos-item">
            <Wifi size={13} className="lls-pos-icon" />
            <div>
              <div className="lls-pos-label">Updates sent</div>
              <div className="lls-pos-value">{sendCount} · {lastSent || '—'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Permission denied help */}
      {permission === 'denied' && (
        <div className="lls-permission-help">
          <strong>How to enable location:</strong>
          <ul>
            <li>Chrome: Click the 🔒 lock icon in the address bar → Location → Allow</li>
            <li>Firefox: Click the shield icon → Permissions → Allow Location</li>
            <li>Mobile: Settings → Browser → Location → Allow</li>
          </ul>
        </div>
      )}

      {/* Toggle button */}
      <button
        className={`lls-btn ${sharing ? 'lls-btn-stop' : 'lls-btn-start'}`}
        onClick={sharing ? stopSharing : startSharing}
      >
        {sharing
          ? <><NavigationOff size={16} />Stop Sharing</>
          : <><Navigation size={16} />Start Sharing Location</>}
      </button>

      {vehiclePlate && (
        <div className="lls-vehicle-tag">
          Vehicle: <strong>{vehiclePlate}</strong>
        </div>
      )}
    </div>
  );
}
