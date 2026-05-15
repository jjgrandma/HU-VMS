import { useState, useEffect } from 'react';
import { CheckCircle, Clock, Calendar, Truck, MapPin } from 'lucide-react';
import { getMyTrips, getMySchedule, completeTrip } from '../../services/routineService';
import './routines.css';

export default function DriverRoutineTrips() {
  const [trips, setTrips] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [tripsData, schedData] = await Promise.all([getMyTrips(), getMySchedule()]);
      setTrips(tripsData);
      setSchedules(schedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleComplete = async (logId) => {
    if (!window.confirm('Mark this trip as completed?')) return;
    setCompleting(logId);
    try {
      await completeTrip(logId);
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setCompleting(null);
    }
  };

  const formatTime = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-ET', {
      timeZone: 'Africa/Addis_Ababa',
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  const activeTrips = trips.filter(t => t.status === 'in_progress');
  const recentTrips = trips.filter(t => t.status === 'completed');

  return (
    <div className="routine-page">
      <div className="routine-header">
        <div className="routine-title">
          <Calendar size={24} />
          <h1>My Routine Trips</h1>
        </div>
      </div>

      {error && <div className="routine-error">{error}</div>}

      {loading ? (
        <div className="routine-loading">Loading…</div>
      ) : (
        <>
          {/* My Schedules */}
          {schedules.length > 0 && (
            <section className="routine-section">
              <h2>My Assigned Schedules</h2>
              <div className="schedule-grid">
                {schedules.map(s => (
                  <div key={s._id} className="schedule-card">
                    <h3 className="card-name">{s.routeName}</h3>
                    <div className="card-details">
                      <div className="detail-row">
                        <Truck size={14} />
                        <span>{s.vehicle?.plateNumber} — {s.vehicle?.model}</span>
                      </div>
                      {s.scheduleType === 'EMPLOYEE_SHUTTLE' && (
                        <>
                          {(s.pickupLocation || s.dropoffLocation) && (
                            <div className="route-pill">
                              <MapPin size={13} />
                              <span className="route-from">{s.pickupLocation || '—'}</span>
                              <span className="route-arrow">→</span>
                              <span className="route-to">{s.dropoffLocation || '—'}</span>
                            </div>
                          )}
                          <div className="detail-row">
                            <Clock size={14} />
                            <span>Morning: <strong>{s.morningDepartureTime}</strong> — depart from {s.pickupLocation || 'pickup point'}</span>
                          </div>
                          <div className="detail-row">
                            <Clock size={14} />
                            <span>Afternoon: <strong>{s.afternoonDepartureTime}</strong> — return from campus</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Active Trips */}
          {activeTrips.length > 0 && (
            <section className="routine-section">
              <h2>Active Trips</h2>
              {activeTrips.map(trip => {
                const pickup  = trip.schedule?.pickupLocation;
                const dropoff = trip.schedule?.dropoffLocation;
                // Morning: pickup → campus | Afternoon: campus → pickup
                const from = trip.shift === 'morning' ? pickup  : dropoff;
                const to   = trip.shift === 'morning' ? dropoff : pickup;
                return (
                  <div key={trip._id} className="trip-card trip-active">
                    <div className="trip-info">
                      <div className="trip-route">{trip.schedule?.routeName || 'Routine Trip'}</div>
                      {(from || to) && (
                        <div className="route-pill route-pill-active">
                          <MapPin size={13} />
                          <span className="route-from">{from || '—'}</span>
                          <span className="route-arrow">→</span>
                          <span className="route-to">{to || '—'}</span>
                        </div>
                      )}
                      <div className="trip-meta">
                        <span className={`badge ${trip.shift === 'morning' ? 'badge-morning' : 'badge-afternoon'}`}>
                          {trip.shift}
                        </span>
                        <span>Scheduled: {trip.scheduledDepartureTime}</span>
                        <span>Started: {formatTime(trip.actualStartTime)}</span>
                        <span>{trip.vehicle?.plateNumber}</span>
                      </div>
                    </div>
                    <button
                      className="btn-success"
                      disabled={completing === trip._id}
                      onClick={() => handleComplete(trip._id)}
                    >
                      <CheckCircle size={16} />
                      {completing === trip._id ? 'Completing…' : 'Complete Trip'}
                    </button>
                  </div>
                );
              })}
            </section>
          )}

          {/* Recent Trips */}
          <section className="routine-section">
            <h2>Recent Trips (Last 7 Days)</h2>
            {recentTrips.length === 0 ? (
              <div className="routine-empty-small">No completed trips in the last 7 days.</div>
            ) : (
              <div className="logs-table-wrapper">
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Route</th>
                      <th>Shift</th>
                      <th>Scheduled</th>
                      <th>Started</th>
                      <th>Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrips.map(trip => (
                      <tr key={trip._id}>
                        <td>{trip.tripDate}</td>
                        <td>{trip.schedule?.routeName || '—'}</td>
                        <td>
                          <span className={`badge ${trip.shift === 'morning' ? 'badge-morning' : 'badge-afternoon'}`}>
                            {trip.shift}
                          </span>
                        </td>
                        <td>{trip.scheduledDepartureTime}</td>
                        <td>{formatTime(trip.actualStartTime)}</td>
                        <td>{formatTime(trip.actualEndTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
