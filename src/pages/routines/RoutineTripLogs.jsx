import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getTripLogs, getScheduleById } from '../../services/routineService';
import './routines.css';

export default function RoutineTripLogs() {
  const { id } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterShift, setFilterShift] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterShift) params.shift = filterShift;
      if (filterStatus) params.status = filterStatus;
      const [sched, logsData] = await Promise.all([
        getScheduleById(id),
        getTripLogs(id, params),
      ]);
      setSchedule(sched);
      setLogs(logsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id, filterShift, filterStatus]);

  const formatTime = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-ET', {
      timeZone: 'Africa/Addis_Ababa',
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  const duration = (start, end) => {
    if (!start || !end) return '—';
    const mins = Math.round((new Date(end) - new Date(start)) / 60000);
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  return (
    <div className="routine-page">
      <div className="routine-header">
        <div className="routine-title">
          <Clock size={24} />
          <h1>Trip Logs{schedule ? ` — ${schedule.routeName}` : ''}</h1>
        </div>
        <Link to="/transport/routines" className="btn-secondary">
          <ArrowLeft size={16} /> Back to Schedules
        </Link>
      </div>

      {schedule && (
        <div className="schedule-info-bar">
          <span>Vehicle: <strong>{schedule.vehicle?.plateNumber}</strong></span>
          <span>Driver: <strong>{schedule.driver?.name}</strong></span>
          {schedule.scheduleType === 'EMPLOYEE_SHUTTLE' && (
            <>
              <span>Morning: <strong>{schedule.morningDepartureTime}</strong></span>
              <span>Afternoon: <strong>{schedule.afternoonDepartureTime}</strong></span>
            </>
          )}
        </div>
      )}

      <div className="routine-filters">
        <div className="filter-group">
          <label>Shift</label>
          <select value={filterShift} onChange={e => setFilterShift(e.target.value)}>
            <option value="">All Shifts</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {error && <div className="routine-error">{error}</div>}

      {loading ? (
        <div className="routine-loading">Loading trip logs…</div>
      ) : logs.length === 0 ? (
        <div className="routine-empty">
          <Clock size={48} />
          <p>No trip logs found for this schedule.</p>
        </div>
      ) : (
        <div className="logs-table-wrapper">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Shift</th>
                <th>Scheduled</th>
                <th>Started</th>
                <th>Completed</th>
                <th>Duration</th>
                <th>Driver</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log._id}>
                  <td>{log.tripDate}</td>
                  <td>
                    <span className={`badge ${log.shift === 'morning' ? 'badge-morning' : 'badge-afternoon'}`}>
                      {log.shift}
                    </span>
                  </td>
                  <td>{log.scheduledDepartureTime}</td>
                  <td>{formatTime(log.actualStartTime)}</td>
                  <td>{formatTime(log.actualEndTime)}</td>
                  <td>{duration(log.actualStartTime, log.actualEndTime)}</td>
                  <td>{log.driver?.name || '—'}</td>
                  <td>
                    {log.status === 'completed' ? (
                      <span className="status-chip status-completed">
                        <CheckCircle size={12} /> Completed
                      </span>
                    ) : (
                      <span className="status-chip status-inprogress">
                        <AlertCircle size={12} /> In Progress
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
