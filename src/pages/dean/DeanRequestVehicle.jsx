import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRequest, getCurrentUser } from '../../api/api';

const today = () => new Date().toISOString().split('T')[0];
const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const VEHICLE_TYPES = ['', 'bus', 'minibus', 'car', 'suv', 'van', 'pickup', 'truck'];
const PRIORITIES    = ['normal', 'high', 'emergency', 'low'];

export default function DeanRequestVehicle() {
  const navigate    = useNavigate();
  const currentUser = getCurrentUser();

  const [form, setForm] = useState({
    requester:           currentUser?.name || '',
    requesterUsername:   currentUser?.username || '',
    department:          currentUser?.collegeName || '',
    destination:         '',
    purpose:             '',
    date:                tomorrow(),
    returnDate:          '',
    passengers:          1,
    priority:            'normal',
    vehicleType:         '',
    specialRequirements: '',
    // Routing — college dean submitting on behalf of the college goes straight to Transport Officer
    unitType:            'COLLEGE',
    unitName:            currentUser?.collegeName || '',
    collegeName:         currentUser?.collegeName || '',
  });

  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    setApiError('');
  };

  const validate = () => {
    const e = {};
    if (!form.destination.trim())  e.destination = 'Destination is required';
    if (!form.purpose.trim())      e.purpose     = 'Purpose is required';
    if (!form.date)                e.date        = 'Trip date is required';
    if (form.date < today())       e.date        = 'Trip date cannot be in the past';
    if (!form.passengers || form.passengers < 1 || form.passengers > 200)
      e.passengers = 'Passengers must be between 1 and 200';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    setApiError('');
    try {
      await createRequest({
        ...form,
        passengers: Number(form.passengers),
      });
      setSuccess(true);
    } catch (err) {
      setApiError(err.message || 'Failed to submit request');
    } finally {
      setSaving(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────
  if (success) {
    return (
      <div style={{ padding: 40, maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20,
          padding: '48px 32px',
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#15803d' }}>
            Request Submitted
          </h2>
          <p style={{ margin: '0 0 24px', color: '#374151', fontSize: 15 }}>
            Your vehicle request has been sent directly to the Transport Officer for processing.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setSuccess(false); setForm(prev => ({ ...prev, destination: '', purpose: '', specialRequirements: '', returnDate: '' })); }}
              style={{ padding: '10px 22px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}
            >
              Submit Another
            </button>
            <button
              onClick={() => navigate('/dean/my-requests')}
              style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              View My Requests →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────
  return (
    <div style={{ padding: '28px 28px 60px', maxWidth: 760, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
          🚗 Request a Vehicle
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
          Submit a vehicle request on behalf of{' '}
          <strong style={{ color: '#4338ca' }}>{currentUser?.collegeName || 'your college'}</strong>.
          It will be sent directly to the Transport Officer.
        </p>
      </div>

      {apiError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#dc2626', fontSize: 14, fontWeight: 500 }}>
          ⚠️ {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* ── Requester Info (read-only) ── */}
        <section style={sectionStyle}>
          <h3 style={sectionTitle}>Requester Information</h3>
          <div style={gridStyle}>
            <Field label="Requester Name">
              <input style={inputStyle} value={form.requester} readOnly />
            </Field>
            <Field label="College / Unit">
              <input style={{ ...inputStyle, background: '#f8fafc' }} value={form.unitName} readOnly />
            </Field>
          </div>
        </section>

        {/* ── Trip Details ── */}
        <section style={sectionStyle}>
          <h3 style={sectionTitle}>Trip Details</h3>
          <div style={gridStyle}>

            <Field label="Destination *" error={errors.destination}>
              <input
                style={inputStyle}
                placeholder="e.g. Addis Ababa, Dire Dawa"
                value={form.destination}
                onChange={e => set('destination', e.target.value)}
                required
              />
            </Field>

            <Field label="Purpose *" error={errors.purpose}>
              <input
                style={inputStyle}
                placeholder="e.g. Conference, Field visit, Official meeting"
                value={form.purpose}
                onChange={e => set('purpose', e.target.value)}
                required
              />
            </Field>

            <Field label="Trip Date *" error={errors.date}>
              <input
                type="date"
                style={inputStyle}
                value={form.date}
                min={today()}
                onChange={e => set('date', e.target.value)}
                required
              />
            </Field>

            <Field label="Return Date">
              <input
                type="date"
                style={inputStyle}
                value={form.returnDate}
                min={form.date || today()}
                onChange={e => set('returnDate', e.target.value)}
              />
            </Field>

            <Field label="Number of Passengers *" error={errors.passengers}>
              <input
                type="number"
                style={inputStyle}
                value={form.passengers}
                min={1}
                max={200}
                onChange={e => set('passengers', e.target.value)}
                required
              />
            </Field>

            <Field label="Priority">
              <select style={inputStyle} value={form.priority} onChange={e => set('priority', e.target.value)}>
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </Field>

            <Field label="Preferred Vehicle Type">
              <select style={inputStyle} value={form.vehicleType} onChange={e => set('vehicleType', e.target.value)}>
                <option value="">No preference</option>
                {VEHICLE_TYPES.filter(Boolean).map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </Field>

          </div>

          <Field label="Special Requirements / Notes" style={{ marginTop: 16 }}>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
              placeholder="Any special requirements, accessibility needs, or additional notes..."
              value={form.specialRequirements}
              onChange={e => set('specialRequirements', e.target.value)}
              rows={3}
            />
          </Field>
        </section>

        {/* ── Routing info ── */}
        <div style={{
          background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
          border: '1px solid #c7d2fe', borderRadius: 12, padding: '14px 18px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 22 }}>🏛️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#4338ca' }}>Direct to Transport Officer</div>
            <div style={{ fontSize: 12, color: '#6366f1' }}>
              As College Dean, your request goes directly to the Transport Officer — no additional approval step required.
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate('/dean/requests')}
            style={{ padding: '11px 22px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '11px 28px',
              background: saving ? '#a5b4fc' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: saving ? 'none' : '0 4px 14px rgba(79,70,229,0.35)',
            }}
          >
            {saving ? '⏳ Submitting…' : '🚗 Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Small helpers ────────────────────────────────────────────

const sectionStyle = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 14,
  padding: '20px 22px',
  marginBottom: 20,
};

const sectionTitle = {
  margin: '0 0 16px',
  fontSize: 12,
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  paddingBottom: 10,
  borderBottom: '1px solid #f1f5f9',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: 16,
};

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  fontSize: 14,
  color: '#1e293b',
  background: '#fff',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  outline: 'none',
};

function Field({ label, error, children, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{label}</label>
      {children}
      {error && <span style={{ fontSize: 12, color: '#dc2626' }}>{error}</span>}
    </div>
  );
}
