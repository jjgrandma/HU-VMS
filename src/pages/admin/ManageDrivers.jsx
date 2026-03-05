import { useState } from 'react';
import './manageDrivers.css';

const ManageDrivers = () => {
  const [drivers, setDrivers] = useState([
    { id: 1, fullname: 'John Doe', licenseNumber: 'DL-123456', phone: '09123456789', status: 'Active', vehicle: 'ABC-1234', totalTrips: 45 },
    { id: 2, fullname: 'Jane Smith', licenseNumber: 'DL-234567', phone: '09234567890', status: 'Active', vehicle: 'XYZ-5678', totalTrips: 38 },
    { id: 3, fullname: 'Mike Johnson', licenseNumber: 'DL-345678', phone: '09345678901', status: 'On Leave', vehicle: 'Unassigned', totalTrips: 42 },
    { id: 4, fullname: 'Robert Wilson', licenseNumber: 'DL-456789', phone: '09456789012', status: 'Active', vehicle: 'GHI-3456', totalTrips: 35 },
    { id: 5, fullname: 'David Brown', licenseNumber: 'DL-567890', phone: '09567890123', status: 'Active', vehicle: 'JKL-7890', totalTrips: 40 }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newDriver, setNewDriver] = useState({
    fullname: '',
    licenseNumber: '',
    phone: '',
    email: '',
    address: ''
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      setDrivers(drivers.filter(driver => driver.id !== id));
    }
  };

  const handleAddDriver = (e) => {
    e.preventDefault();
    const driver = {
      id: drivers.length + 1,
      ...newDriver,
      status: 'Active',
      vehicle: 'Unassigned',
      totalTrips: 0
    };
    setDrivers([...drivers, driver]);
    setNewDriver({ fullname: '', licenseNumber: '', phone: '', email: '', address: '' });
    setShowAddForm(false);
    alert('Driver added successfully!');
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeDrivers = drivers.filter(d => d.status === 'Active').length;

  const getStatusClass = (status) => {
    switch(status) {
      case 'Active': return 'status-active';
      case 'On Leave': return 'status-leave';
      default: return '';
    }
  };

  return (
    <div className="manage-drivers-container">
      <div className="header-section">
        <h1>Manage Drivers</h1>
        <button 
          className="btn-add-driver"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add Driver'}
        </button>
      </div>

      <div className="driver-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{drivers.length}</h3>
            <p>Total Drivers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <h3>{activeDrivers}</h3>
            <p>Active Drivers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <h3>{drivers.filter(d => d.vehicle !== 'Unassigned').length}</h3>
            <p>Assigned Vehicles</p>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="add-driver-form">
          <h2>Add New Driver</h2>
          <form onSubmit={handleAddDriver}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={newDriver.fullname}
                  onChange={(e) => setNewDriver({...newDriver, fullname: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>License Number</label>
                <input
                  type="text"
                  value={newDriver.licenseNumber}
                  onChange={(e) => setNewDriver({...newDriver, licenseNumber: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({...newDriver, phone: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newDriver.email}
                  onChange={(e) => setNewDriver({...newDriver, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={newDriver.address}
                onChange={(e) => setNewDriver({...newDriver, address: e.target.value})}
                required
              />
            </div>

            <button type="submit" className="btn-submit">Add Driver</button>
          </form>
        </div>
      )}

      <div className="controls-bar">
        <input
          type="text"
          placeholder="Search by name or license number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-container">
        <table className="drivers-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>License Number</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Assigned Vehicle</th>
              <th>Total Trips</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.map(driver => (
              <tr key={driver.id}>
                <td>{driver.id}</td>
                <td>{driver.fullname}</td>
                <td>{driver.licenseNumber}</td>
                <td>{driver.phone}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(driver.status)}`}>
                    {driver.status}
                  </span>
                </td>
                <td>{driver.vehicle}</td>
                <td>{driver.totalTrips}</td>
                <td>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(driver.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredDrivers.length === 0 && (
        <div className="no-results">No drivers found</div>
      )}
    </div>
  );
};

export default ManageDrivers;
