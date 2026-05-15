import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Edit2, Trash2, Clock, User, Truck, MapPin } from 'lucide-react';
import { getSchedules, deleteSchedule } from '../../services/routineService';
import './routines.css';

export default function RoutineScheduleList() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterType) params.scheduleType = filterType;
      if (filterStatus) params.status = filterStatus;
      const data = await getSchedules(params);
      setSchedules(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterType, filterStatus]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete schedule "${name}"? Trip logs will be preserved.`)) return;
    setDeletingId(id);
    try {
      await deleteSchedule(id);
      setSchedules(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const typeLabel = (t) => t === 'EMPLOYEE_SHUTTLE' ? 'Employee Shuttle' : 'Admin Assigned';
  const typeBadge = (t) => t === 'EMPLOYEE_SHUTTLE' ? 'badge-shuttle' : 'badge-admin';

  return (
    <div className="routine-page">
      <div className="routine-header">
        <div className="routine-title">
          <Calendar size={24} />
          <h1>Routine Schedules</h1>
        </div>
        <Link to="/transport/routines/new" className="btn-primary">
          <Plus size={16} /> New Schedule
        </Link>
      </div>

      {/* Filters */}
      <div className="routine-filters">
        <div className="filter-group">
          <label>Type</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option value="EMPLOYEE_SHUTTLE">Employee Shuttle</option>
            <option value="ADMIN_ASSIGNED">Admin Assigned</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {error && <div className="routine-error">{error}</div>}

      {loading ? (
        <div className="routine-loading">Loading schedules…</div>
      ) : schedules.length === 0 ? (
        <div className="routine-empty">
          <Calendar size={48} />
          <p>No routine schedules found.</p>
          <Link to="/transport/routines/new" className="btn-primary">Create First Schedule</Link>
        </div>
      ) : (
        <div className="schedule-grid">
          {schedules.map(s => (
            <div key={s._id} className={`schedule-card ${s.status === 'inactive' ? 'card-inactive' : ''}`}>
              <div className="card-top">
                <div className="card-badges">
                  <span className={`badge ${typeBadge(s.scheduleType)}`}>{typeLabel(s.scheduleType)}</span>
                  <span className={`badge ${s.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                    {s.status}
                  </span>
                </div>
                <div className="card-actions">
                  <Link to={`/transport/routines/${s._id}/edit`} className="icon-btn" title="Edit">
                    <Edit2 size={15} />
                  </Link>
                  <button
                    className="icon-btn icon-btn-danger"
                    title="Delete"
                    disabled={deletingId === s._id}
                    onClick={() => handleDelete(s._id, s.routeName)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <h3 className="card-name">{s.routeName}</h3>

              <div className="card-details">
                <div className="detail-row">
                  <Truck size={14} />
                  <span>{s.vehicle?.plateNumber} — {s.vehicle?.model}</span>
                </div>
                <div className="detail-row">
                  <User size={14} />
                  <span>{s.driver?.name} ({s.driver?.employeeId})</span>
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
                      <span>Morning: <strong>{s.morningDepartureTime}</strong></span>
                    </div>
                    <div className="detail-row">
                      <Clock size={14} />
                      <span>Afternoon: <strong>{s.afternoonDepartureTime}</strong></span>
                    </div>
                  </>
                )}
                {s.scheduleType === 'ADMIN_ASSIGNED' && s.assignedAdministrator && (
                  <div className="detail-row">
                    <User size={14} />
                    <span>Admin: {s.assignedAdministrator.name}</span>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <Link to={`/transport/routines/${s._id}/logs`} className="btn-link">
                  View Trip Logs →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
