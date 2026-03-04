import { useState } from 'react';
import './vehicleStatus.css';

const VehicleStatus = () => {
  const [vehicles] = useState([
    { id: 1, plateNumber: 'ABC-1234', model: 'Toyota Hiace', status: 'Available', location: 'Main Garage', lastUpdate: '2024-03-15 10:30' },
    { id: 2, plateNumber: 'XYZ-5678', model: 'Nissan Urvan', status: 'Assigned', location: 'Engineering Building', lastUpdate: '2024-03-15 11:45' },
    { id: 3, plateNumber: 'DEF-9012', model: 'Mitsubishi L300', status: 'Maintenance', location: 'Service Center', lastUpdate: '2024-03-14 09:20' },
    { id: 4, plateNumber: 'GHI-3456', model: 'Isuzu Elf', status: 'Available', location: 'Main Garage', lastUpdate: '2024-03-15 08:15' },
    { id: 5, plateNumber: 'JKL-7890', model: 'Toyota Coaster', status: 'Assigned', location: 'Medical Campus', lastUpdate: '2024-03-15 12:00' },
    { id: 6, plateNumber: 'MNO-2345', model: 'Hyundai County', status: 'Available', location: 'Main Garage', lastUpdate: '2024-03-15 07:30' },
    { id: 7, plateNumber: 'PQR-6789', model: 'Ford Transit', status: 'Maintenance', location: 'Service Center', lastUpdate: '2024-03-13 14:50' },
    { id: 8, plateNumber: 'STU-0123', model: 'Mercedes Sprinter', status: 'Assigned', location: 'Law School', lastUpdate: '2024-03-15 10:00' }
  ]);

  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || vehicle.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    available: vehicles.filter(v => v.status === 'Available').length,
    assigned: vehicles.filter(v => v.status === 'Assigned').length,
    maintenance: vehicles.filter(v => v.status === 'Maintenance').length
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Available': return 'status-available';
      case 'Assigned': return 'status-assigned';
      case 'Maintenance': return 'status-maintenance';
      default: return '';
    }
  };

  return (
    <div className="vehicle-status-container">
      <h1>Vehicle Status</h1>

      <div className="status-summary">
        <div className="summary-card summary-available">
          <div className="summary-icon">✓</div>
          <div className="summary-content">
            <h3>{statusCounts.available}</h3>
            <p>Available</p>
          </div>
        </div>

        <div className="summary-card summary-assigned">
          <div className="summary-icon">📍</div>
          <div className="summary-content">
            <h3>{statusCounts.assigned}</h3>
            <p>Assigned</p>
          </div>
        </div>

        <div className="summary-card summary-maintenance">
          <div className="summary-icon">🔧</div>
          <div className="summary-content">
            <h3>{statusCounts.maintenance}</h3>
            <p>Maintenance</p>
          </div>
        </div>
      </div>

      <div className="controls-bar">
        <input
          type="text"
          placeholder="Search vehicles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterStatus === 'All' ? 'active' : ''}`}
            onClick={() => setFilterStatus('All')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'Available' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Available')}
          >
            Available
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'Assigned' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Assigned')}
          >
            Assigned
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'Maintenance' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Maintenance')}
          >
            Maintenance
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="status-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Plate Number</th>
              <th>Model</th>
              <th>Status</th>
              <th>Location</th>
              <th>Last Update</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map(vehicle => (
              <tr key={vehicle.id}>
                <td>{vehicle.id}</td>
                <td>{vehicle.plateNumber}</td>
                <td>{vehicle.model}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(vehicle.status)}`}>
                    {vehicle.status}
                  </span>
                </td>
                <td>{vehicle.location}</td>
                <td>{vehicle.lastUpdate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredVehicles.length === 0 && (
        <div className="no-results">No vehicles found</div>
      )}
    </div>
  );
};

export default VehicleStatus;
