import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Phone, 
  Clock, 
  MapPin, 
  Car, 
  Briefcase, 
  Calendar, 
  MoreVertical,
  User,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import './DriverCoordination.css';

const DriverCoordination = () => {
  const [drivers, setDrivers] = useState([
    {
      id: 'DR-001',
      name: 'Ato Mulugeta Tadesse',
      assignedVehicle: 'HU-VH-001',
      status: 'On Trip',
      currentTrip: 'TRIP-001',
      destination: 'Dire Dawa',
      schedule: 'Full Day',
      phone: '+251-911-123456',
      experience: '5 years'
    },
    {
      id: 'DR-002',
      name: 'W/ro Hanan Ahmed',
      assignedVehicle: 'HU-VH-002',
      status: 'Available',
      currentTrip: null,
      destination: null,
      schedule: 'Morning Shift',
      phone: '+251-911-234567',
      experience: '3 years'
    },
    {
      id: 'DR-003',
      name: 'Ato Bekele Worku',
      assignedVehicle: 'HU-VH-003',
      status: 'On Trip',
      currentTrip: 'TRIP-002',
      destination: 'Addis Ababa',
      schedule: 'Full Day',
      phone: '+251-911-345678',
      experience: '7 years'
    },
    {
      id: 'DR-004',
      name: 'Ato Tesfaye Girma',
      assignedVehicle: 'HU-VH-004',
      status: 'Off Duty',
      currentTrip: null,
      destination: null,
      schedule: 'Evening Shift',
      phone: '+251-911-456789',
      experience: '4 years'
    },
    {
      id: 'DR-005',
      name: 'W/ro Almaz Kebede',
      assignedVehicle: 'HU-VH-005',
      status: 'Available',
      currentTrip: null,
      destination: null,
      schedule: 'Full Day',
      phone: '+251-911-567890',
      experience: '6 years'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.assignedVehicle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || driver.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'var(--status-available)';
      case 'On Trip': return 'var(--primary-color)';
      case 'Off Duty': return 'var(--text-secondary)';
      case 'On Leave': return 'var(--status-pending)';
      default: return 'var(--text-secondary)';
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleAssignDriver = (driver) => {
    setSelectedDriver(driver);
    setShowAssignModal(true);
  };

  const handleChangeDriver = (driverId) => {
    console.log('Change driver:', driverId);
  };

  const stats = {
    total: drivers.length,
    available: drivers.filter(d => d.status === 'Available').length,
    onTrip: drivers.filter(d => d.status === 'On Trip').length,
    offDuty: drivers.filter(d => ['Off Duty', 'On Leave'].includes(d.status)).length
  };

  return (
    <div className="driver-coordination-page">
      <div className="page-header">
        <div>
          <h1>Driver Directory</h1>
          <p>Manage personnel, assignments, and schedules</p>
        </div>
        <button className="btn btn-primary">
          + Add Driver
        </button>
      </div>

      <div className="driver-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper total">
            <User size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Drivers</h3>
            <div className="stat-value">{stats.total}</div>
            <span className="stat-trend">Registered staff</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper available">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <h3>Available Now</h3>
            <div className="stat-value">{stats.available}</div>
            <span className="stat-trend positive">Ready for dispatch</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper on-trip">
            <MapPin size={24} />
          </div>
          <div className="stat-info">
            <h3>Active on Trips</h3>
            <div className="stat-value">{stats.onTrip}</div>
            <span className="stat-trend">Currently driving</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper off-duty">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>Off Duty</h3>
            <div className="stat-value">{stats.offDuty}</div>
            <span className="stat-trend">Resting or leave</span>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search drivers by name or vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <div className="status-filter">
            <Filter size={16} className="filter-icon" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="Off Duty">Off Duty</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      <div className="drivers-grid">
        {filteredDrivers.map((driver) => (
          <div key={driver.id} className="driver-card">
            <div className="dc-header">
              <div className="dc-avatar-profile">
                <div className="dc-avatar" style={ driver.status === 'On Trip' ? { borderColor: 'var(--primary-color)' } : {}}>
                  {getInitials(driver.name)}
                  <span className="dc-status-indicator" style={{ backgroundColor: getStatusColor(driver.status) }}></span>
                </div>
                <div className="dc-info">
                  <h3>{driver.name}</h3>
                  <span className="dc-id">{driver.id}</span>
                </div>
              </div>
              <button className="btn-icon ghost">
                <MoreVertical size={16} />
              </button>
            </div>
            
            <div className="dc-body">
              <div className="dc-row">
                <div className="dc-icon-wrapper"><Phone size={14} /></div>
                <div className="dc-text">{driver.phone}</div>
              </div>
              <div className="dc-row">
                <div className="dc-icon-wrapper"><Briefcase size={14} /></div>
                <div className="dc-text">{driver.experience} exp</div>
              </div>
              <div className="dc-row">
                <div className="dc-icon-wrapper"><Clock size={14} /></div>
                <div className="dc-text">{driver.schedule}</div>
              </div>

              <div className="dc-assignment-box">
                <div className="assign-item">
                  <span className="assign-label">Vehicle</span>
                  <span className="assign-val vehicle-text"><Car size={14} /> {driver.assignedVehicle}</span>
                </div>
                <div className="assign-divider"></div>
                <div className="assign-item">
                  <span className="assign-label">Current Trip</span>
                  <span className={`assign-val ${driver.currentTrip ? 'trip-active' : 'no-trip'}`}>
                    {driver.currentTrip ? (
                      <><MapPin size={14} /> {driver.destination}</>
                    ) : (
                      'None'
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="dc-footer">
              <button 
                className="btn btn-outline"
                onClick={() => handleAssignDriver(driver)}
              >
                Reassign Vehicle
              </button>
              <button className="btn btn-secondary">
                View Profile
              </button>
            </div>
          </div>
        ))}
        {filteredDrivers.length === 0 && (
          <div className="empty-state">
            <AlertCircle size={32} />
            <p>No drivers found matching your search</p>
          </div>
        )}
      </div>

      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Assign Vehicle</h3>
            <div className="modal-driver-summary">
              <div className="mds-avatar">{getInitials(selectedDriver?.name || '')}</div>
              <div>
                <h4>{selectedDriver?.name}</h4>
                <p>Current: {selectedDriver?.assignedVehicle}</p>
              </div>
            </div>
            
            <div className="vehicle-selection">
              <label>Select New Vehicle</label>
              <select className="modern-select">
                <option value="">Choose from available vehicles...</option>
                <option value="HU-VH-001">HU-VH-001 (Bus)</option>
                <option value="HU-VH-002">HU-VH-002 (Minibus)</option>
                <option value="HU-VH-003">HU-VH-003 (Car) - Available</option>
                <option value="HU-VH-004">HU-VH-004 (Van) - Available</option>
              </select>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary">
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverCoordination;