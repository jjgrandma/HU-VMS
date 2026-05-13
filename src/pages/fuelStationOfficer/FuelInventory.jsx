import { useState, useEffect } from 'react';
import { getFuelInventory, updateFuelInventory, getCurrentUser } from '../../api/api';

const pct = (available, capacity) =>
  capacity > 0 ? Math.min(100, ((available / capacity) * 100)).toFixed(1) : '0.0';

const levelColor = (available, capacity) => {
  if (!capacity) return { bar: '#94a3b8', text: '#64748b', bg: '#f8fafc' };
  const p = (available / capacity) * 100;
  if (p > 50) return { bar: '#22c55e', text: '#15803d', bg: '#f0fdf4' };
  if (p > 20) return { bar: '#f59e0b', text: '#d97706', bg: '#fffbeb' };
  return { bar: '#ef4444', text: '#dc2626', bg: '#fef2f2' };
};

export default function FuelInventory() {
  const currentUser = getCurrentUser();
  const [inventory, setInventory]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [modalData, setModalData]   = useState({ fuelType: '', litersToAdd: '', capacity: '', reason: '' });
  const [errors, setErrors]         = useState({});
  const [saving, setSaving]         = useState(false);

  const fetchInventory = async () => {
    try {
      const data = await getFuelInventory();
      setInventory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const openModal = (fuelType) => {
    const rec = inventory.find(i => i.fuelType === fuelType) || {};
    setModalData({ fuelType, litersToAdd: '', capacity: rec.capacity || '', reason: '' });
    setErrors({});
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setModalData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!modalData.reason) errs.reason = 'Reason is required';
    if (modalData.litersToAdd && parseFloat(modalData.litersToAdd) < 0) errs.litersToAdd = 'Cannot be negative';
    if (modalData.capacity && parseFloat(modalData.capacity) <= 0) errs.capacity = 'Must be positive';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const updates = { updatedBy: currentUser?.name || currentUser?.username };
      if (modalData.litersToAdd) updates.litersToAdd = parseFloat(modalData.litersToAdd);
      if (modalData.capacity)    updates.capacity    = parseFloat(modalData.capacity);
      const updated = await updateFuelInventory(modalData.fuelType, updates);
      setInventory(prev => prev.map(i => i.fuelType === updated.fuelType ? updated : i));
      setShowModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>⛽</div>Loading inventory...
    </div>
  );

  return (
    <div style={{ padding: '28px 28px 48px', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Fuel Inventory</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
            Monitor tank levels. Stock decreases automatically when fuel is dispensed.
          </p>
        </div>
        <button onClick={fetchInventory}
          style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Inventory cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {inventory.map(item => {
          const p    = parseFloat(pct(item.available, item.capacity));
          const clr  = levelColor(item.available, item.capacity);
          const icon = item.fuelType === 'Diesel' ? '🟢' : '🟠';

          return (
            <div key={item.fuelType} style={{
              background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
              overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}>
              {/* Card top bar */}
              <div style={{ height: 4, background: clr.bar }} />

              <div style={{ padding: '20px 22px' }}>
                {/* Title row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{item.fuelType}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>Tank fuel type</div>
                    </div>
                  </div>
                  <div style={{ background: clr.bg, color: clr.text, padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 800 }}>
                    {p}%
                  </div>
                </div>

                {/* Volume display */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: clr.text, lineHeight: 1 }}>
                    {item.available.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>L available</span>
                  {item.capacity > 0 && (
                    <span style={{ fontSize: 12, color: '#cbd5e1', marginLeft: 4 }}>
                      / {item.capacity.toLocaleString()}L capacity
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden', marginBottom: 14 }}>
                  <div style={{ width: `${p}%`, height: '100%', background: clr.bar, borderRadius: 4, transition: 'width 0.6s ease' }} />
                </div>

                {/* Meta row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    {item.updatedAt
                      ? `Updated ${new Date(item.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}${item.updatedBy ? ` · ${item.updatedBy}` : ''}`
                      : 'Never updated'}
                  </div>
                  <button onClick={() => openModal(item.fuelType)}
                    style={{ padding: '7px 16px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }}>
                    + Update Stock
                  </button>
                </div>

                {/* Low stock warning */}
                {p < 20 && (
                  <div style={{ marginTop: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#dc2626', fontWeight: 600 }}>
                    ⚠️ Low stock — consider refilling soon
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Update Stock Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={() => setShowModal(false)}>
          <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 440, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Update {modalData.fuelType} Stock</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>Add fuel or adjust tank capacity</div>
              </div>
              <button onClick={() => setShowModal(false)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '22px' }}>
              {/* Liters to add */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  Liters to Add
                </label>
                <input type="number" name="litersToAdd" value={modalData.litersToAdd}
                  onChange={handleChange} placeholder="e.g. 500" step="0.1" min="0"
                  style={{ width: '100%', padding: '10px 12px', border: `1px solid ${errors.litersToAdd ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
                {errors.litersToAdd && <p style={{ fontSize: 12, color: '#dc2626', margin: '4px 0 0' }}>{errors.litersToAdd}</p>}
              </div>

              {/* Capacity */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  Tank Capacity (L)
                </label>
                <input type="number" name="capacity" value={modalData.capacity}
                  onChange={handleChange} placeholder="e.g. 10000" min="0"
                  style={{ width: '100%', padding: '10px 12px', border: `1px solid ${errors.capacity ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>Leave blank to keep current capacity</p>
                {errors.capacity && <p style={{ fontSize: 12, color: '#dc2626', margin: '4px 0 0' }}>{errors.capacity}</p>}
              </div>

              {/* Reason */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  Reason <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select name="reason" value={modalData.reason} onChange={handleChange}
                  style={{ width: '100%', padding: '10px 12px', border: `1px solid ${errors.reason ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 8, fontSize: 14, boxSizing: 'border-box', background: '#fff', outline: 'none' }}>
                  <option value="">Select reason...</option>
                  <option value="Fuel Delivery">Fuel Delivery</option>
                  <option value="Tank Refill">Tank Refill</option>
                  <option value="Emergency Refill">Emergency Refill</option>
                  <option value="Inventory Correction">Inventory Correction</option>
                  <option value="Capacity Update">Capacity Update</option>
                  <option value="Other">Other</option>
                </select>
                {errors.reason && <p style={{ fontSize: 12, color: '#dc2626', margin: '4px 0 0' }}>{errors.reason}</p>}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={saving}
                  style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? '⏳ Saving...' : '✓ Update Stock'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ padding: '12px 20px', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
