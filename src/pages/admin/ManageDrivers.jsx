import { useState } from 'react';
import './adminTheme.css';
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
  const [licenseDocument, setLicenseDocument] = useState(null);
  const [idDocument, setIdDocument] = useState(null);
  const [newDriver, setNewDriver] = useState({
    fullname: '',
    licenseNumber: '',
    phone: '',
    email: '',
    address: '',
    idNumber: '',
    idType: 'National ID',
    dateOfBirth: '',
    licenseExpiryDate: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      setDrivers(drivers.filter(driver => driver.id !== id));
    }
  };

  const handleLicenseUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      setLicenseDocument(file);
    }
  };

  const handleIdUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      setIdDocument(file);
    }
  };

  const handleAddDriver = (e) => {
    e.preventDefault();
    
    // Validate password match
    if (newDriver.password !== newDriver.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Validate password strength
    if (newDriver.password.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    // Validate documents
    if (!licenseDocument) {
      alert('Please upload driving license document!');
      return;
    }

    if (!idDocument) {
      alert('Please upload ID document!');
      return;
    }

    const driver = {
      id: drivers.length + 1,
      fullname: newDriver.fullname,
      licenseNumber: newDriver.licenseNumber,
      phone: newDriver.phone,
      status: 'Active',
      vehicle: 'Unassigned',
      totalTrips: 0
    };
    
    setDrivers([...drivers, driver]);
    setNewDriver({ 
      fullname: '', 
      licenseNumber: '', 
      phone: '', 
      email: '', 
      address: '',
      idNumber: '',
      idType: 'National ID',
      dateOfBirth: '',
      licenseExpiryDate: '',
      username: '',
      password: '',
      confirmPassword: ''
    });
    setLicenseDocument(null);
    setIdDocument(null);
    setShowAddForm(false);
    alert('Driver added successfully with username: ' + newDriver.username);
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
          <h2>📝 Add New Driver</h2>
          <form onSubmit={handleAddDriver}>
            {/* Personal Information Section */}
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={newDriver.fullname}
                    onChange={(e) => setNewDriver({...newDriver, fullname: e.target.value})}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    value={newDriver.dateOfBirth}
                    onChange={(e) => setNewDriver({...newDriver, dateOfBirth: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    value={newDriver.phone}
                    onChange={(e) => setNewDriver({...newDriver, phone: e.target.value})}
                    placeholder="+251 912 345 678"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={newDriver.email}
                    onChange={(e) => setNewDriver({...newDriver, email: e.target.value})}
                    placeholder="driver@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  value={newDriver.address}
                  onChange={(e) => setNewDriver({...newDriver, address: e.target.value})}
                  placeholder="Street, City, Region"
                  required
                />
              </div>
            </div>

            {/* ID Information Section */}
            <div className="form-section">
              <h3>ID Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>ID Type *</label>
                  <select
                    value={newDriver.idType}
                    onChange={(e) => setNewDriver({...newDriver, idType: e.target.value})}
                    required
                  >
                    <option value="National ID">National ID</option>
                    <option value="Passport">Passport</option>
                    <option value="Driver License">Driver License</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>ID Number *</label>
                  <input
                    type="text"
                    value={newDriver.idNumber}
                    onChange={(e) => setNewDriver({...newDriver, idNumber: e.target.value})}
                    placeholder="ID-123456789"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Upload ID Document * (PDF, JPG, PNG - Max 5MB)</label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    id="id-document"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleIdUpload}
                    className="file-input"
                    required
                  />
                  <label htmlFor="id-document" className="file-label">
                    <span className="file-icon">📄</span>
                    <span className="file-text">
                      {idDocument ? idDocument.name : 'Choose ID Document'}
                    </span>
                  </label>
                  {idDocument && (
                    <span className="file-success">✓ Uploaded</span>
                  )}
                </div>
              </div>
            </div>

            {/* License Information Section */}
            <div className="form-section">
              <h3>Driving License Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>License Number *</label>
                  <input
                    type="text"
                    value={newDriver.licenseNumber}
                    onChange={(e) => setNewDriver({...newDriver, licenseNumber: e.target.value})}
                    placeholder="DL-123456"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>License Expiry Date *</label>
                  <input
                    type="date"
                    value={newDriver.licenseExpiryDate}
                    onChange={(e) => setNewDriver({...newDriver, licenseExpiryDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Upload Driving License Document * (PDF, JPG, PNG - Max 5MB)</label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    id="license-document"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleLicenseUpload}
                    className="file-input"
                    required
                  />
                  <label htmlFor="license-document" className="file-label">
                    <span className="file-icon">🪪</span>
                    <span className="file-text">
                      {licenseDocument ? licenseDocument.name : 'Choose License Document'}
                    </span>
                  </label>
                  {licenseDocument && (
                    <span className="file-success">✓ Uploaded</span>
                  )}
                </div>
              </div>
            </div>

            {/* Account Credentials Section */}
            <div className="form-section">
              <h3>Account Credentials</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={newDriver.username}
                    onChange={(e) => setNewDriver({...newDriver, username: e.target.value})}
                    placeholder="driver_username"
                    minLength="4"
                    required
                  />
                  <small className="field-hint">Minimum 4 characters</small>
                </div>

                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={newDriver.password}
                    onChange={(e) => setNewDriver({...newDriver, password: e.target.value})}
                    placeholder="••••••••"
                    minLength="6"
                    required
                  />
                  <small className="field-hint">Minimum 6 characters</small>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  value={newDriver.confirmPassword}
                  onChange={(e) => setNewDriver({...newDriver, confirmPassword: e.target.value})}
                  placeholder="••••••••"
                  minLength="6"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                ✓ Add Driver
              </button>
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => setShowAddForm(false)}
              >
                ✕ Cancel
              </button>
            </div>
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
