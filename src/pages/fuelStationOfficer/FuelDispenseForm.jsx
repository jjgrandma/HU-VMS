import { useState, useEffect } from 'react';
import { getDrivers, getVehicles } from '../../api/api';
import './FuelDispenseForm.css';
import './fuelstation.css';

const FuelDispenseForm = () => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverName: '',
    fuelType: '',
    liters: '',
    odometerReading: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    authorizationCode: ''
  });

  const [errors, setErrors] = useState({});
  const [authStatus, setAuthStatus] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    getVehicles().then(setVehicles).catch(() => {});
    getDrivers().then(setDrivers).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.vehicleId) newErrors.vehicleId = 'Vehicle ID is required';
    if (!formData.driverName) newErrors.driverName = 'Driver name is required';
    if (!formData.fuelType) newErrors.fuelType = 'Fuel type is required';
    if (!formData.liters) newErrors.liters = 'Liters is required';
    if (!formData.odometerReading) newErrors.odometerReading = 'Odometer reading is required';
    if (!formData.date) newErrors.date = 'Date is required';

    if (!authStatus || !authStatus.verified) {
      newErrors.authorization = 'Fuel authorization must be verified before dispensing';
    }

    if (formData.liters && (parseFloat(formData.liters) <= 0 || parseFloat(formData.liters) > 200)) {
      newErrors.liters = 'Liters must be between 0 and 200';
    }

    if (formData.odometerReading && parseFloat(formData.odometerReading) < 0) {
      newErrors.odometerReading = 'Odometer reading must be positive';
    }

    return newErrors;
  };

  const handleVerifyAuthorization = () => {
    if (!formData.vehicleId || !formData.driverName) {
      alert('Please select vehicle and driver first');
      return;
    }
    setShowAuthModal(true);
  };

  const handleAuthVerification = (code) => {
    // Mock authorization verification
    const validCodes = ['AUTH-2024-001', 'AUTH-2024-002', 'AUTH-2024-003'];

    if (validCodes.includes(code)) {
      setAuthStatus({
        verified: true,
        authorizedBy: 'Transport Office',
        message: 'Authorization verified successfully'
      });
      setShowAuthModal(false);
    } else {
      setAuthStatus({
        verified: false,
        message: 'Invalid authorization code'
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      // Generate transaction ID
      const transactionId = `TXN-${Date.now().toString().slice(-6)}`;

      const transactionData = {
        id: transactionId,
        ...formData,
        liters: parseFloat(formData.liters),
        odometerReading: parseFloat(formData.odometerReading),
        status: 'Completed',
        operator: 'Fuel Officer',
        timestamp: new Date().toISOString()
      };

      console.log('New fuel transaction:', transactionData);
      alert(`Fuel dispensed successfully!\nTransaction ID: ${transactionId}\nVehicle: ${formData.vehicleId}\nAmount: ${formData.liters}L ${formData.fuelType}`);

      // Reset form
      setFormData({
        vehicleId: '',
        driverName: '',
        fuelType: '',
        liters: '',
        odometerReading: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    } else {
      setErrors(newErrors);
    }
  };

  const handleClearForm = () => {
    setFormData({
      vehicleId: '',
      driverName: '',
      fuelType: '',
      liters: '',
      odometerReading: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      authorizationCode: ''
    });
    setErrors({});
    setAuthStatus(null);
  };

  return (
    <div className="fuel-dispense-page">
      <div className="fuel-page-header">
        <h2>Fuel Dispense Form</h2>
        <p>Record fuel dispensing transactions</p>
      </div>

      <div className="fuel-form-container">
        {/* Authorization Status Banner */}
        {authStatus && (
          <div className={`auth-status-banner ${authStatus.verified ? 'success' : 'error'}`}>
            <span className="auth-icon">{authStatus.verified ? '✓' : '✗'}</span>
            <div className="auth-message">
              <strong>{authStatus.message}</strong>
              {authStatus.verified && authStatus.authorizedBy && (
                <p>Authorized by: {authStatus.authorizedBy}</p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="fuel-form-grid">
            {/* Vehicle ID */}
            <div className="fuel-form-group">
              <label className="fuel-form-label">
                Vehicle ID <span className="required">*</span>
              </label>
              <select
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
                className={`fuel-form-select ${errors.vehicleId ? 'error' : ''}`}
              >
                <option value="">Select vehicle</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.plateNumber} — {vehicle.model}
                  </option>
                ))}
              </select>
              {errors.vehicleId && <p className="fuel-error-message">{errors.vehicleId}</p>}
            </div>

            {/* Driver Name */}
            <div className="fuel-form-group">
              <label className="fuel-form-label">
                Driver Name <span className="required">*</span>
              </label>
              <select
                name="driverName"
                value={formData.driverName}
                onChange={handleChange}
                className={`fuel-form-select ${errors.driverName ? 'error' : ''}`}
              >
                <option value="">Select driver</option>
                {drivers.map(driver => (
                  <option key={driver._id} value={driver.name}>{driver.name}</option>
                ))}
              </select>
              {errors.driverName && <p className="fuel-error-message">{errors.driverName}</p>}
            </div>

            {/* Fuel Type */}
            <div className="fuel-form-group">
              <label className="fuel-form-label">
                Fuel Type <span className="required">*</span>
              </label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className={`fuel-form-select ${errors.fuelType ? 'error' : ''}`}
              >
                <option value="">Select fuel type</option>
                <option value="Diesel">Diesel</option>
                <option value="Petrol">Petrol</option>
              </select>
              {errors.fuelType && <p className="fuel-error-message">{errors.fuelType}</p>}
            </div>

            {/* Liters */}
            <div className="fuel-form-group">
              <label className="fuel-form-label">
                Liters <span className="required">*</span>
              </label>
              <input
                type="number"
                name="liters"
                value={formData.liters}
                onChange={handleChange}
                placeholder="Enter liters"
                step="0.1"
                min="0"
                max="200"
                className={`fuel-form-input ${errors.liters ? 'error' : ''}`}
              />
              {errors.liters && <p className="fuel-error-message">{errors.liters}</p>}
            </div>

            {/* Odometer Reading */}
            <div className="fuel-form-group">
              <label className="fuel-form-label">
                Odometer Reading (km) <span className="required">*</span>
              </label>
              <input
                type="number"
                name="odometerReading"
                value={formData.odometerReading}
                onChange={handleChange}
                placeholder="Enter odometer reading"
                min="0"
                className={`fuel-form-input ${errors.odometerReading ? 'error' : ''}`}
              />
              {errors.odometerReading && <p className="fuel-error-message">{errors.odometerReading}</p>}
            </div>

            {/* Date */}
            <div className="fuel-form-group">
              <label className="fuel-form-label">
                Date <span className="required">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`fuel-form-input ${errors.date ? 'error' : ''}`}
              />
              {errors.date && <p className="fuel-error-message">{errors.date}</p>}
            </div>

            {/* Authorization Verification - Full width */}
            <div className="fuel-form-group full-width">
              <label className="fuel-form-label">
                Fuel Authorization <span className="required">*</span>
              </label>
              <div className="auth-verification-section">
                <button
                  type="button"
                  onClick={handleVerifyAuthorization}
                  className="fuel-btn-verify"
                >
                  <span>🔐</span> Verify Authorization
                </button>
                {authStatus && authStatus.verified && (
                  <span className="auth-verified-badge">
                    ✓ Verified
                  </span>
                )}
              </div>
              {errors.authorization && <p className="fuel-error-message">{errors.authorization}</p>}
            </div>

            {/* Notes - Full width */}
            <div className="fuel-form-group full-width">
              <label className="fuel-form-label">Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                placeholder="Any additional notes or observations..."
                className="fuel-form-textarea"
              />
            </div>
          </div>

          <div className="fuel-form-actions">
            <button type="submit" className="fuel-btn-primary">
              <span>⛽</span> Dispense Fuel
            </button>
            <button type="button" onClick={handleClearForm} className="fuel-btn-secondary">
              <span>🔄</span> Clear Form
            </button>
          </div>
        </form>
      </div>

      {/* Authorization Verification Modal */}
      {showAuthModal && (
        <div className="fuel-modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="fuel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fuel-modal-header">
              <h3>Verify Fuel Authorization</h3>
              <button
                className="fuel-modal-close"
                onClick={() => setShowAuthModal(false)}
              >
                ×
              </button>
            </div>

            <div className="fuel-modal-content">
              <div className="auth-info-box">
                <p><strong>Vehicle:</strong> {formData.vehicleId}</p>
                <p><strong>Driver:</strong> {formData.driverName}</p>
              </div>

              <div className="fuel-form-group">
                <label className="fuel-form-label">
                  Authorization Code <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.authorizationCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, authorizationCode: e.target.value }))}
                  placeholder="Enter authorization code (e.g., AUTH-2024-001)"
                  className="fuel-form-input"
                />
                <p className="fuel-help-text">
                  Enter the authorization code provided by the transport office
                </p>
              </div>
            </div>

            <div className="fuel-modal-actions">
              <button
                onClick={() => handleAuthVerification(formData.authorizationCode)}
                className="fuel-btn-primary"
              >
                <span>✓</span> Verify
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="fuel-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelDispenseForm;