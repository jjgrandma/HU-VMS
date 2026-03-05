import { useState } from 'react';
import './addVehicle.css';

const AddVehicle = () => {
  const [formData, setFormData] = useState({
    plateNumber: '',
    model: '',
    type: '',
    capacity: '',
    year: '',
    color: '',
    status: 'Available'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Vehicle Added:', formData);
    alert('Vehicle added successfully!');
    setFormData({
      plateNumber: '',
      model: '',
      type: '',
      capacity: '',
      year: '',
      color: '',
      status: 'Available'
    });
  };

  return (
    <div className="add-vehicle-container">
      <h1>Add New Vehicle</h1>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Plate Number</label>
              <input
                type="text"
                name="plateNumber"
                value={formData.plateNumber}
                onChange={handleChange}
                placeholder="ABC-1234"
                required
              />
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
              />
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
                <option value="Van">Van</option>
                <option value="Bus">Bus</option>
                <option value="Truck">Truck</option>
                <option value="SUV">SUV</option>
              </select>
            </div>

            <div className="form-group">
              <label>Capacity</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="15"
                required
              />
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
                placeholder="2024"
                required
              />
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
              />
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
                <option value="Available">Available</option>
                <option value="Assigned">Assigned</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-submit">
            Add Vehicle
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddVehicle;
