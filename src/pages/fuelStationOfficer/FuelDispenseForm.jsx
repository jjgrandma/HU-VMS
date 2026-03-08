import { useState } from 'react';
import './fuelstation.css';

const FuelDispenseForm = () => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverName: '',
    fuelType: '',
    liters: '',
    odometerReading: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [errors, setErrors] = useState({});

  // Mock data
  const vehicles = [
    { id: 'VH-001', plateNumber: 'AA-001-ET' },
    { id: 'VH-002', plateNumber: 'AA-002-ET' },
    { id: 'VH-003', plateNumber: 'AA-003-ET' },
    { id: 'VH-004', plateNumber: 'AA-004-ET' },
    { id: 'VH-005', plateNumber: 'AA-005-ET' },
    { id: 'VH-006', plateNumber: 'AA-006-ET' },
    { id: 'VH-007', plateNumber: 'AA-007-ET' },
    { id: 'VH-008', plateNumber: 'AA-008-ET' },
    { id: 'VH-009', plateNumber: 'AA-009-ET' },
    { id: 'VH-010', plateNumber: 'AA-010-ET' }
  ];

  const drivers = [
    'John Smith',
    'Sarah Johnson',
    'Mike Wilson',
    'Lisa Brown',
    'David Lee',
    'Emma Davis',
    'James Miller',
    'Anna Garcia',
    'Robert Taylor',
    'Maria Rodriguez'
  ];

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
    
    if (formData.liters && (parseFloat(formData.liters) <= 0 || parseFloat(formData.liters) > 200)) {
      newErrors.liters = 'Liters must be between 0 and 200';
    }
    
    if (formData.odometerReading && parseFloat(formData.odometerReading) < 0) {
      newErrors.odometerReading = 'Odometer reading must be positive';
    }

    return newErrors;
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
      notes: ''
    });
    setErrors({});
  };

  return (
    <div className="fuel-dispense-page">
      <div className="fuel-page-header">
        <h2>Fuel Dispense Form</h2>
        <p>Record fuel dispensing transactions</p>
      </div>
      
      <div className="fuel-form-container">
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
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.id} - {vehicle.plateNumber}
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
                  <option key={driver} value={driver}>{driver}</option>
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
    </div>
  );
};

export default FuelDispenseForm;