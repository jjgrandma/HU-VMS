import { useState } from 'react';
import { createVehicle } from '../../api/api';
import './addVehicle.css';

const AddVehicle = () => {
  const [formData, setFormData] = useState({
    plateNumber: '',
    model: '',
    type: '',
    capacity: '',
    year: '',
    color: '',
    status: 'available'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage(null);
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.plateNumber.trim())
      errs.plateNumber = 'Plate number is required';
    else if (!/^[A-Za-z0-9\-]{3,15}$/.test(formData.plateNumber.trim()))
      errs.plateNumber = 'Invalid plate format (letters, numbers, hyphens only, 3–15 chars)';

    if (!formData.model.trim())
      errs.model = 'Model is required';
    else if (formData.model.trim().length > 60)
      errs.model = 'Model name too long (max 60 characters)';

    if (!formData.type)
      errs.type = 'Vehicle type is required';

    const cap = Number(formData.capacity);
    if (!formData.capacity) errs.capacity = 'Capacity is required';
    else if (!Number.isInteger(cap) || cap < 1 || cap > 200)
      errs.capacity = 'Capacity must be a whole number between 1 and 200';

    const yr = Number(formData.year);
    const currentYear = new Date().getFullYear();
    if (!formData.year) errs.year = 'Year is required';
    else if (!Number.isInteger(yr) || yr < 1980 || yr > currentYear + 1)
      errs.year = `Year must be between 1980 and ${currentYear + 1}`;

    if (!formData.color.trim())
      errs.color = 'Color is required';
    else if (formData.color.trim().length > 30)
      errs.color = 'Color name too long (max 30 characters)';

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      await createVehicle({ ...formData, capacity: Number(formData.capacity), year: Number(formData.year) });
      setMessage({ type: 'success', text: 'Vehicle added successfully!' });
      setFormData({ plateNumber: '', model: '', type: '', capacity: '', year: '', color: '', status: 'available' });
      setErrors({});
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to add vehicle' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-vehicle-container" style={{ background: 'white', minHeight: '100vh', padding: '30px' }}>
      <h1 style={{ color: '#32CD32', fontSize: '32px', marginBottom: '30px', display: 'block' }}>🚗 Add New Vehicle</h1>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {message && (
            <div style={{
              padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px',
              background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
              color: message.type === 'success' ? '#16a34a' : '#dc2626',
              border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
            }}>
              {message.text}
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label>Plate Number</label>
              <input
                type="text"
                name="plateNumber"
                value={formData.plateNumber}
                onChange={handleChange}
                placeholder="e.g. AA-12345"
                required
                maxLength={15}
              />
              {errors.plateNumber && <p style={{color:'#dc2626',fontSize:12,marginTop:3}}>{errors.plateNumber}</p>}
            </div>

            <div className="form-group">
              <label>Model</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Toyota Hiace"
                required
                maxLength={60}
              />
              {errors.model && <p style={{color:'#dc2626',fontSize:12,marginTop:3}}>{errors.model}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="van">Van</option>
                <option value="bus">Bus</option>
                <option value="minibus">Minibus</option>
                <option value="truck">Truck</option>
                <option value="car">Car</option>
                <option value="pickup">Pickup</option>
                <option value="suv">SUV</option>
              </select>
              {errors.type && <p style={{color:'#dc2626',fontSize:12,marginTop:3}}>{errors.type}</p>}
            </div>

            <div className="form-group">
              <label>Capacity (seats)</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="e.g. 15"
                min="1"
                max="200"
                required
              />
              {errors.capacity && <p style={{color:'#dc2626',fontSize:12,marginTop:3}}>{errors.capacity}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder={`e.g. ${new Date().getFullYear()}`}
                min="1980"
                max={new Date().getFullYear() + 1}
                required
              />
              {errors.year && <p style={{color:'#dc2626',fontSize:12,marginTop:3}}>{errors.year}</p>}
            </div>

            <div className="form-group">
              <label>Color</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="White"
                required
                maxLength={30}
              />
              {errors.color && <p style={{color:'#dc2626',fontSize:12,marginTop:3}}>{errors.color}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="available">Available</option>
                <option value="in-use">In Use</option>
                <option value="maintenance">Maintenance</option>
                <option value="out-of-service">Out of Service</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Saving...' : 'Add Vehicle'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddVehicle;
