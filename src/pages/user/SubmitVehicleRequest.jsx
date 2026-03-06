import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SubmitVehicleRequest.css';

const vehicleTypes = [
  'Sedan',
  'SUV',
  'Hatchback',
  'Van',
  'Bus',
  'Truck',
  'Other'
];

const SubmitVehicleRequest = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicleType: '',
    otherVehicleType: '',
    purpose: '',
    date: '',
    time: '',
    destination: '',
    passengers: 1,
    additionalNotes: ''
  });

  const [errors, setErrors] = useState({});

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
    if (!formData.vehicleType) newErrors.vehicleType = 'Vehicle type is required';
    if (formData.vehicleType === 'Other' && !formData.otherVehicleType) {
      newErrors.otherVehicleType = 'Please specify the vehicle type';
    }
    if (!formData.purpose) newErrors.purpose = 'Purpose is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.destination) newErrors.destination = 'Destination is required';
    if (formData.passengers < 1) newErrors.passengers = 'At least 1 passenger is required';
    
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      newErrors.date = 'Date cannot be in the past';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      if (onSubmit) {
        onSubmit(formData);
      }
      alert('Vehicle request submitted successfully!');
      navigate('/user/my-requests');
    } else {
      setErrors(newErrors);
      alert('Please fill in all required fields');
    }
  };

  return (
    <div className="request-form-page">
      <h1 className="page-title">Submit Vehicle Request</h1>
      
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Vehicle Type */}
            <div className="form-group">
              <label className="form-label">
                Vehicle Type <span className="required">*</span>
              </label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className={`form-select ${errors.vehicleType ? 'error' : ''}`}
              >
                <option value="">Select vehicle type</option>
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.vehicleType && <p className="error-message">{errors.vehicleType}</p>}
              
              {/* Show input field when "Other" is selected */}
              {formData.vehicleType === 'Other' && (
                <div style={{ marginTop: '10px' }}>
                  <input
                    type="text"
                    name="otherVehicleType"
                    value={formData.otherVehicleType}
                    onChange={handleChange}
                    placeholder="Please specify vehicle type"
                    className={`form-input ${errors.otherVehicleType ? 'error' : ''}`}
                  />
                  {errors.otherVehicleType && <p className="error-message">{errors.otherVehicleType}</p>}
                </div>
              )}
            </div>

            {/* Purpose */}
            <div className="form-group">
              <label className="form-label">
                Purpose <span className="required">*</span>
              </label>
              <input
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="e.g., Airport Pickup, Client Meeting"
                className={`form-input ${errors.purpose ? 'error' : ''}`}
              />
              {errors.purpose && <p className="error-message">{errors.purpose}</p>}
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label">
                Date <span className="required">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`form-input ${errors.date ? 'error' : ''}`}
              />
              {errors.date && <p className="error-message">{errors.date}</p>}
            </div>

            {/* Time */}
            <div className="form-group">
              <label className="form-label">
                Time <span className="required">*</span>
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={`form-input ${errors.time ? 'error' : ''}`}
              />
              {errors.time && <p className="error-message">{errors.time}</p>}
            </div>

            {/* Destination */}
            <div className="form-group">
              <label className="form-label">
                Destination <span className="required">*</span>
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="Enter destination"
                className={`form-input ${errors.destination ? 'error' : ''}`}
              />
              {errors.destination && <p className="error-message">{errors.destination}</p>}
            </div>

            {/* Passengers */}
            <div className="form-group">
              <label className="form-label">
                Number of Passengers <span className="required">*</span>
              </label>
              <input
                type="number"
                name="passengers"
                value={formData.passengers}
                onChange={handleChange}
                min="1"
                max="20"
                className={`form-input ${errors.passengers ? 'error' : ''}`}
              />
              {errors.passengers && <p className="error-message">{errors.passengers}</p>}
            </div>

            {/* Additional Notes - Full width */}
            <div className="form-group full-width">
              <label className="form-label">Additional Notes (Optional)</label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                rows="4"
                placeholder="Any special requirements or instructions..."
                className="form-textarea"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              Submit Request
            </button>
            <button type="button" onClick={() => navigate('/user/dashboard')} className="btn-cancel">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitVehicleRequest;