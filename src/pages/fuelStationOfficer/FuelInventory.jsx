import { useState } from 'react';
import './FuelInventory.css';
import './fuelstation.css';

const FuelInventory = () => {
  const [inventory, setInventory] = useState({
    diesel: {
      available: 5000,
      capacity: 10000,
      lastUpdated: '2026-03-08T08:00:00'
    },
    petrol: {
      available: 3500,
      capacity: 8000,
      lastUpdated: '2026-03-08T08:00:00'
    }
  });

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    fuelType: '',
    litersAdded: '',
    reason: ''
  });
  const [modalErrors, setModalErrors] = useState({});

  const handleUpdateStock = (fuelType) => {
    setModalData({
      fuelType: fuelType,
      litersAdded: '',
      reason: ''
    });
    setModalErrors({});
    setShowModal(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModalData(prev => ({
      ...prev,
      [name]: value
    }));
    if (modalErrors[name]) {
      setModalErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateModal = () => {
    const errors = {};

    if (!modalData.litersAdded) errors.litersAdded = 'Liters added is required';
    if (!modalData.reason) errors.reason = 'Reason is required';

    if (modalData.litersAdded) {
      const liters = parseFloat(modalData.litersAdded);
      if (liters <= 0) errors.litersAdded = 'Liters must be positive';

      const currentStock = inventory[modalData.fuelType].available;
      const capacity = inventory[modalData.fuelType].capacity;

      if (currentStock + liters > capacity) {
        errors.litersAdded = `Cannot exceed capacity. Maximum: ${capacity - currentStock}L`;
      }
    }

    return errors;
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    const errors = validateModal();

    if (Object.keys(errors).length === 0) {
      const litersAdded = parseFloat(modalData.litersAdded);

      setInventory(prev => ({
        ...prev,
        [modalData.fuelType]: {
          ...prev[modalData.fuelType],
          available: prev[modalData.fuelType].available + litersAdded,
          lastUpdated: new Date().toISOString()
        }
      }));

      alert(`Stock updated successfully!\n${modalData.fuelType.charAt(0).toUpperCase() + modalData.fuelType.slice(1)}: +${litersAdded}L\nReason: ${modalData.reason}`);
      setShowModal(false);
    } else {
      setModalErrors(errors);
    }
  };

  const getStockLevel = (available, capacity) => {
    const percentage = (available / capacity) * 100;
    if (percentage > 50) return 'high';
    if (percentage > 20) return 'medium';
    return 'low';
  };

  const getStockPercentage = (available, capacity) => {
    return ((available / capacity) * 100).toFixed(1);
  };

  return (
    <div className="fuel-inventory-page">
      <div className="fuel-page-header">
        <h2>Fuel Inventory Management</h2>
        <p>Monitor and update fuel stock levels</p>
      </div>

      {/* Inventory Cards */}
      <div className="fuel-inventory-grid">
        {/* Diesel Card */}
        <div className="fuel-inventory-card">
          <div className="fuel-inventory-header">
            <div className="fuel-type-info">
              <span className="fuel-type-icon diesel">🟢</span>
              <h3>Diesel</h3>
            </div>
            <span className={`stock-level-badge ${getStockLevel(inventory.diesel.available, inventory.diesel.capacity)}`}>
              {getStockPercentage(inventory.diesel.available, inventory.diesel.capacity)}%
            </span>
          </div>

          <div className="fuel-inventory-content">
            <div className="fuel-amount">
              <span className="amount-value">{inventory.diesel.available.toLocaleString()}</span>
              <span className="amount-unit">Liters</span>
            </div>

            <div className="fuel-capacity">
              <span>Capacity: {inventory.diesel.capacity.toLocaleString()}L</span>
            </div>

            <div className="fuel-progress-bar">
              <div
                className={`fuel-progress-fill ${getStockLevel(inventory.diesel.available, inventory.diesel.capacity)}`}
                style={{ width: `${getStockPercentage(inventory.diesel.available, inventory.diesel.capacity)}%` }}
              ></div>
            </div>

            <div className="fuel-last-updated">
              Last Updated: {new Date(inventory.diesel.lastUpdated).toLocaleString()}
            </div>

            <button
              className="fuel-btn-update"
              onClick={() => handleUpdateStock('diesel')}
            >
              <span>📦</span> Update Stock
            </button>
          </div>
        </div>

        {/* Petrol Card */}
        <div className="fuel-inventory-card">
          <div className="fuel-inventory-header">
            <div className="fuel-type-info">
              <span className="fuel-type-icon petrol">🟠</span>
              <h3>Petrol</h3>
            </div>
            <span className={`stock-level-badge ${getStockLevel(inventory.petrol.available, inventory.petrol.capacity)}`}>
              {getStockPercentage(inventory.petrol.available, inventory.petrol.capacity)}%
            </span>
          </div>

          <div className="fuel-inventory-content">
            <div className="fuel-amount">
              <span className="amount-value">{inventory.petrol.available.toLocaleString()}</span>
              <span className="amount-unit">Liters</span>
            </div>

            <div className="fuel-capacity">
              <span>Capacity: {inventory.petrol.capacity.toLocaleString()}L</span>
            </div>

            <div className="fuel-progress-bar">
              <div
                className={`fuel-progress-fill ${getStockLevel(inventory.petrol.available, inventory.petrol.capacity)}`}
                style={{ width: `${getStockPercentage(inventory.petrol.available, inventory.petrol.capacity)}%` }}
              ></div>
            </div>

            <div className="fuel-last-updated">
              Last Updated: {new Date(inventory.petrol.lastUpdated).toLocaleString()}
            </div>

            <button
              className="fuel-btn-update"
              onClick={() => handleUpdateStock('petrol')}
            >
              <span>📦</span> Update Stock
            </button>
          </div>
        </div>
      </div>

      {/* Update Stock Modal */}
      {showModal && (
        <div className="fuel-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="fuel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fuel-modal-header">
              <h3>Update {modalData.fuelType.charAt(0).toUpperCase() + modalData.fuelType.slice(1)} Stock</h3>
              <button
                className="fuel-modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleModalSubmit}>
              <div className="fuel-modal-content">
                <div className="fuel-form-group">
                  <label className="fuel-form-label">
                    Fuel Type
                  </label>
                  <input
                    type="text"
                    value={modalData.fuelType.charAt(0).toUpperCase() + modalData.fuelType.slice(1)}
                    disabled
                    className="fuel-form-input disabled"
                  />
                </div>

                <div className="fuel-form-group">
                  <label className="fuel-form-label">
                    Liters Added <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="litersAdded"
                    value={modalData.litersAdded}
                    onChange={handleModalChange}
                    placeholder="Enter liters to add"
                    step="0.1"
                    min="0"
                    className={`fuel-form-input ${modalErrors.litersAdded ? 'error' : ''}`}
                  />
                  {modalErrors.litersAdded && <p className="fuel-error-message">{modalErrors.litersAdded}</p>}
                </div>

                <div className="fuel-form-group">
                  <label className="fuel-form-label">
                    Reason <span className="required">*</span>
                  </label>
                  <select
                    name="reason"
                    value={modalData.reason}
                    onChange={handleModalChange}
                    className={`fuel-form-select ${modalErrors.reason ? 'error' : ''}`}
                  >
                    <option value="">Select reason</option>
                    <option value="Fuel Delivery">Fuel Delivery</option>
                    <option value="Tank Refill">Tank Refill</option>
                    <option value="Emergency Refill">Emergency Refill</option>
                    <option value="Inventory Correction">Inventory Correction</option>
                    <option value="Other">Other</option>
                  </select>
                  {modalErrors.reason && <p className="fuel-error-message">{modalErrors.reason}</p>}
                </div>
              </div>

              <div className="fuel-modal-actions">
                <button type="submit" className="fuel-btn-primary">
                  Update Stock
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="fuel-btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelInventory;