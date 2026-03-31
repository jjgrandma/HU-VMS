import { useState, useEffect } from 'react';
import { getFuelInventory, updateFuelInventory, getCurrentUser } from '../../api/api';
import './FuelInventory.css';
import './fuelstation.css';

const FuelInventory = () => {
  const currentUser = getCurrentUser();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ fuelType: '', litersToAdd: '', capacity: '', reason: '' });
  const [modalErrors, setModalErrors] = useState({});
  const [saving, setSaving] = useState(false);

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

  const handleUpdateStock = (fuelType) => {
    const record = inventory.find(i => i.fuelType === fuelType) || {};
    setModalData({ fuelType, litersToAdd: '', capacity: record.capacity || '', reason: '' });
    setModalErrors({});
    setShowModal(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModalData(prev => ({ ...prev, [name]: value }));
    if (modalErrors[name]) setModalErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errors = {};
    if (!modalData.reason) errors.reason = 'Reason is required';
    if (modalData.litersToAdd && parseFloat(modalData.litersToAdd) < 0)
      errors.litersToAdd = 'Cannot be negative';
    if (modalData.capacity && parseFloat(modalData.capacity) <= 0)
      errors.capacity = 'Capacity must be positive';
    return errors;
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) { setModalErrors(errors); return; }
    setSaving(true);
    try {
      const updates = { updatedBy: currentUser?.name || currentUser?.username };
      if (modalData.litersToAdd) updates.litersToAdd = parseFloat(modalData.litersToAdd);
      if (modalData.capacity) updates.capacity = parseFloat(modalData.capacity);
      const updated = await updateFuelInventory(modalData.fuelType, updates);
      setInventory(prev => prev.map(i => i.fuelType === updated.fuelType ? updated : i));
      setShowModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getStockLevel = (available, capacity) => {
    if (!capacity) return 'medium';
    const pct = (available / capacity) * 100;
    if (pct > 50) return 'high';
    if (pct > 20) return 'medium';
    return 'low';
  };

  const getStockPercentage = (available, capacity) => {
    if (!capacity) return '0.0';
    return ((available / capacity) * 100).toFixed(1);
  };

  if (loading) return <p style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>Loading...</p>;

  return (
    <div className="fuel-inventory-page">
      <div className="fuel-page-header">
        <h2>Fuel Inventory Management</h2>
        <p>Track tank stock levels. Add fuel when a delivery arrives. Stock automatically decreases when fuel is dispensed to drivers.</p>
      </div>

      <div className="fuel-inventory-grid">
        {inventory.map(item => (
          <div key={item.fuelType} className="fuel-inventory-card">
            <div className="fuel-inventory-header">
              <div className="fuel-type-info">
                <span className="fuel-type-icon">{item.fuelType === 'Diesel' ? '🟢' : '🟠'}</span>
                <h3>{item.fuelType}</h3>
              </div>
              <span className={`stock-level-badge ${getStockLevel(item.available, item.capacity)}`}>
                {getStockPercentage(item.available, item.capacity)}%
              </span>
            </div>

            <div className="fuel-inventory-content">
              <div className="fuel-amount">
                <span className="amount-value">{item.available.toLocaleString()}</span>
                <span className="amount-unit">Liters</span>
              </div>
              <div className="fuel-capacity">
                <span>Capacity: {item.capacity ? `${item.capacity.toLocaleString()}L` : 'Not set'}</span>
              </div>

              {item.capacity > 0 && (
                <div className="fuel-progress-bar">
                  <div className={`fuel-progress-fill ${getStockLevel(item.available, item.capacity)}`}
                    style={{ width: `${getStockPercentage(item.available, item.capacity)}%` }} />
                </div>
              )}

              <div className="fuel-last-updated">
                Last Updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'Never'}
                {item.updatedBy && ` by ${item.updatedBy}`}
              </div>

              <button className="fuel-btn-update" onClick={() => handleUpdateStock(item.fuelType)}>
                <span>📦</span> Update Stock
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fuel-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="fuel-modal" onClick={e => e.stopPropagation()}>
            <div className="fuel-modal-header">
              <h3>Update {modalData.fuelType} Stock</h3>
              <button className="fuel-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleModalSubmit}>
              <div className="fuel-modal-content">
                <div className="fuel-form-group">
                  <label className="fuel-form-label">Liters to Add</label>
                  <input type="number" name="litersToAdd" value={modalData.litersToAdd}
                    onChange={handleModalChange} placeholder="e.g. 500" step="0.1" min="0"
                    className={`fuel-form-input ${modalErrors.litersToAdd ? 'error' : ''}`} />
                  {modalErrors.litersToAdd && <p className="fuel-error-message">{modalErrors.litersToAdd}</p>}
                </div>

                <div className="fuel-form-group">
                  <label className="fuel-form-label">Set Tank Capacity (L)</label>
                  <input type="number" name="capacity" value={modalData.capacity}
                    onChange={handleModalChange} placeholder="e.g. 10000" min="0"
                    className={`fuel-form-input ${modalErrors.capacity ? 'error' : ''}`} />
                  <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>Leave blank to keep current capacity</p>
                  {modalErrors.capacity && <p className="fuel-error-message">{modalErrors.capacity}</p>}
                </div>

                <div className="fuel-form-group">
                  <label className="fuel-form-label">Reason <span className="required">*</span></label>
                  <select name="reason" value={modalData.reason} onChange={handleModalChange}
                    className={`fuel-form-select ${modalErrors.reason ? 'error' : ''}`}>
                    <option value="">Select reason</option>
                    <option value="Fuel Delivery">Fuel Delivery</option>
                    <option value="Tank Refill">Tank Refill</option>
                    <option value="Emergency Refill">Emergency Refill</option>
                    <option value="Inventory Correction">Inventory Correction</option>
                    <option value="Capacity Update">Capacity Update</option>
                    <option value="Other">Other</option>
                  </select>
                  {modalErrors.reason && <p className="fuel-error-message">{modalErrors.reason}</p>}
                </div>
              </div>
              <div className="fuel-modal-actions">
                <button type="submit" className="fuel-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Update Stock'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="fuel-btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelInventory;
