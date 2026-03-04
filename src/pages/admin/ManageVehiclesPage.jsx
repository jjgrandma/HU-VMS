import { useState } from 'react';
import './manageVehiclesPage.css';

const ManageVehiclesPage = () => {
  const [vehicles, setVehicles] = useState([
    { id: 1, plateNumber: 'ABC-1234', model: 'Toyota Hiace', type: 'Van', capacity: 15, status: 'Available', driver: 'Unassigned' },
    { id: 2, plateNumber: 'XYZ-5678', model: 'Nissan Urvan', type: 'Van', capacity: 18, status: 'Assigned', driver: 'John Doe' },
    { id: 3, plateNumber: 'DEF-9012', model: 'Mitsubishi L300', type: 'Van', capacity: 12, status: 'Maintenance', driver: 'Unassigned' },
    { id: 4, plateNumber: 'GHI-3456', model: 'Isuzu Elf', type: 'Truck', capacity: 20, status: 'Available', driver: 'Unassigned' },
    { id: 5, plateNumber: 'JKL-7890', model: 'Toyota Coaster', type: 'Bus', capacity: 30, status: 'Assigned', driver: 'Jane Smith' },
    { id: 6, plateNumber: 'MNO-2345', model: 'Hyundai County', type: 'Bus', capacity: 25, status: 'Available', driver: 'Unassigned' },
    { id: 7, plateNumber: 'PQR-6789', model: 'Ford Transit', type: 'Van', capacity: 14, status: 'Maintenance', driver: 'Unassigned' },
    { id: 8, plateNumber: 'STU-0123', model: 'Mercedes Sprinter', type: 'Van', capacity: 16, status: 'Assigned', driver: 'Mike Johnson' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || vehicle.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusClass = (status) => {
    switch(status) {
      case 'Available': return 'status-available';
      case 'Assigned': return 'status-assigned';
      case 'Maintenance': return 'status-maintenance';
      default: return '';
    }
  };

  return (
    <div className="manage-vehicles-container">
      <h1>Manage Vehicles</h1>

      <div className="controls-bar">
        <input
          type="text"
          placeholder="Search by plate number or model..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="All">All Status</option>
          <option value="Available">Available</option>
          <option value="Assigned">Assigned</option>
          <option value="Maintenance">Maintenance</option>
        </select>
      </div>

      <div className="table-container">
        <table className="vehicles-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Plate Number</th>
              <th>Model</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Driver</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map(vehicle => (
              <tr key={vehicle.id}>
                <td>{vehicle.id}</td>
                <td>{vehicle.plateNumber}</td>
                <td>{vehicle.model}</td>
                <td>{vehicle.type}</td>
                <td>{vehicle.capacity}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(vehicle.status)}`}>
                    {vehicle.status}
                  </span>
                </td>
                <td>{vehicle.driver}</td>
                <td>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(vehicle.id)}
                  >
                    Delete
                  </button>
                </td>
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

export default ManageVehiclesPage;
