import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Calendar } from 'lucide-react';
import { createSchedule, updateSchedule, getScheduleById } from '../../services/routineService';
import './routines.css';

const API = 'http://localhost:5000/api';

function authHeaders() {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export default function RoutineScheduleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    scheduleType: 'EMPLOYEE_SHUTTLE',
    routeName: '',
    vehicle: '',
    driver: '',
    morningDepartureTime: '',
    afternoonDepartureTime: '',
    pickupLocation: '',
    dropoffLocation: '',
    assignedAdministrator: '',
    status: 'active',
  });

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load reference data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [vRes, dRes, uRes] = await Promise.all([
          fetch(`${API}/vehicles`, { headers: authHeaders() }),
          fetch(`${API}/drivers`, { headers: authHeaders() }),
          fetch(`${API}/users`, { headers: authHeaders() }),
        ]);
        const [vData, dData, uData] = await Promise.all([vRes.json(), dRes.json(), uRes.json()]);
        setVehicles(Array.isArray(vData) ? vData : vData.vehicles || []);
        setDrivers(Array.isArray(dData) ? dData : dData.drivers || []);
        // Filter users who can be assigned as admin (USER, ADMIN, DEAN roles)
        const adminRoles = ['USER', 'ADMIN', 'DEAN'];
        setAdmins((Array.isArray(uData) ? uData : uData.users || []).filter(u => adminRoles.includes(u.role)));
      } catch (err) {
        setError('Failed to load reference data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Load existing schedule for edit
  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getScheduleById(id);
        setForm({
          scheduleType: data.scheduleType,
          routeName: data.routeName,
          vehicle: data.vehicle?._id || data.vehicle || '',
          driver: data.driver?._id || data.driver || '',
          morningDepartureTime: data.morningDepartureTime || '',
          afternoonDepartureTime: data.afternoonDepartureTime || '',
          pickupLocation: data.pickupLocation || '',
          dropoffLocation: data.dropoffLocation || '',
          assignedAdministrator: data.assignedAdministrator?._id || data.assignedAdministrator || '',
          status: data.status,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form };
      // Clean up fields not relevant to the schedule type
      if (payload.scheduleType === 'ADMIN_ASSIGNED') {
        delete payload.morningDepartureTime;
        delete payload.afternoonDepartureTime;
        delete payload.pickupLocation;
        delete payload.dropoffLocation;
      } else {
        delete payload.assignedAdministrator;
      }
      if (isEdit) {
        await updateSchedule(id, payload);
      } else {
        await createSchedule(payload);
      }
      navigate('/transport/routines');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="routine-loading">Loading…</div>;

  return (
    <div className="routine-page">
      <div className="routine-header">
        <div className="routine-title">
          <Calendar size={24} />
          <h1>{isEdit ? 'Edit Routine Schedule' : 'New Routine Schedule'}</h1>
        </div>
        <button className="btn-secondary" onClick={() => navigate('/transport/routines')}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {error && <div className="routine-error">{error}</div>}

      <form className="routine-form" onSubmit={handleSubmit}>
        {/* Schedule Type */}
        <div className="form-section">
          <h3>Schedule Type</h3>
          <div className="type-selector">
            {['EMPLOYEE_SHUTTLE', 'ADMIN_ASSIGNED'].map(t => (
              <label key={t} className={`type-option ${form.scheduleType === t ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="scheduleType"
                  value={t}
                  checked={form.scheduleType === t}
                  onChange={() => set('scheduleType', t)}
                />
                <span>{t === 'EMPLOYEE_SHUTTLE' ? '🚌 Employee Shuttle' : '👤 Admin Assigned'}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Basic Info */}
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Route Name *</label>
              <input
                type="text"
                value={form.routeName}
                onChange={e => set('routeName', e.target.value)}
                placeholder="e.g. Main Campus – Staff Quarters"
                required
              />
            </div>

            <div className="form-group">
              <label>Vehicle *</label>
              <select value={form.vehicle} onChange={e => set('vehicle', e.target.value)} required>
                <option value="">Select vehicle…</option>
                {vehicles.map(v => (
                  <option key={v._id} value={v._id}>
                    {v.plateNumber} — {v.model} ({v.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Driver *</label>
              <select value={form.driver} onChange={e => set('driver', e.target.value)} required>
                <option value="">Select driver…</option>
                {drivers.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.employeeId})
                  </option>
                ))}
              </select>
            </div>

            {isEdit && (
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* EMPLOYEE_SHUTTLE fields */}
        {form.scheduleType === 'EMPLOYEE_SHUTTLE' && (
          <>
            <div className="form-section">
              <h3>Route Locations</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Pickup Location *</label>
                  <input
                    type="text"
                    value={form.pickupLocation}
                    onChange={e => set('pickupLocation', e.target.value)}
                    placeholder="e.g. Harar Aretanya, Haramaya Town"
                    required
                  />
                  <small>Where employees are picked up in the morning</small>
                </div>
                <div className="form-group">
                  <label>Drop-off Location *</label>
                  <input
                    type="text"
                    value={form.dropoffLocation}
                    onChange={e => set('dropoffLocation', e.target.value)}
                    placeholder="e.g. Main Campus, HU Gate"
                    required
                  />
                  <small>Where employees are dropped off (university side)</small>
                </div>
              </div>
              {/* Visual route preview */}
              {(form.pickupLocation || form.dropoffLocation) && (
                <div className="route-preview">
                  <span className="route-from">{form.pickupLocation || '…'}</span>
                  <span className="route-arrow">→</span>
                  <span className="route-to">{form.dropoffLocation || '…'}</span>
                  <span className="route-note">(morning) · reverses in afternoon</span>
                </div>
              )}
            </div>

            <div className="form-section">
              <h3>Departure Times (Ethiopia Time)</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Morning Departure *</label>
                  <input
                    type="time"
                    value={form.morningDepartureTime}
                    onChange={e => set('morningDepartureTime', e.target.value)}
                    required
                  />
                  <small>Departs from pickup location to campus</small>
                </div>
                <div className="form-group">
                  <label>Afternoon Departure *</label>
                  <input
                    type="time"
                    value={form.afternoonDepartureTime}
                    onChange={e => set('afternoonDepartureTime', e.target.value)}
                    required
                  />
                  <small>Departs from campus back to pickup location (~17:00)</small>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ADMIN_ASSIGNED fields */}
        {form.scheduleType === 'ADMIN_ASSIGNED' && (
          <div className="form-section">
            <h3>Administrator Assignment</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Assigned Administrator *</label>
                <select
                  value={form.assignedAdministrator}
                  onChange={e => set('assignedAdministrator', e.target.value)}
                  required
                >
                  <option value="">Select administrator…</option>
                  {admins.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.name} — {u.role} ({u.department || u.email})
                    </option>
                  ))}
                </select>
                <small>This vehicle will be permanently reserved for this administrator</small>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/transport/routines')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            <Save size={16} />
            {saving ? 'Saving…' : isEdit ? 'Update Schedule' : 'Create Schedule'}
          </button>
        </div>
      </form>
    </div>
  );
}
