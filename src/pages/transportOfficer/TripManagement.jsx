import { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  PlayCircle, 
  Filter,
  Car,
  User,
  MoreVertical,
  Activity,
  CheckCircle,
  Clock as ClockIcon
} from 'lucide-react';
import './TripManagement.css';

const TripManagement = () => {
  const [trips, setTrips] = useState([
    {
      id: 'TRIP-001',
      vehicle: 'HU-VH-001 (Toyota Hiace)',
      driver: 'Ato Mulugeta',
      startLocation: 'Haramaya University',
      destination: 'Dire Dawa',
      departureTime: '08:00 AM',
      returnTime: '06:00 PM',
      status: 'In Progress',
      requestId: 'REQ-001',
      date: 'Today'
    },
    {
      id: 'TRIP-002',
      vehicle: 'HU-VH-003 (Toyota Coaster)',
      driver: 'Ato Bekele',
      startLocation: 'Haramaya University',
      destination: 'Addis Ababa',
      departureTime: '06:00 AM',
      returnTime: '08:00 PM',
      status: 'Approved',
      requestId: 'REQ-002',
      date: 'Tomorrow'
    },
    {
      id: 'TRIP-003',
      vehicle: 'HU-VH-005 (Isuzu D-Max)',
      driver: 'W/ro Almaz',
      startLocation: 'Haramaya University',
      destination: 'Harar',
      departureTime: '09:00 AM',
      returnTime: '04:00 PM',
      status: 'Completed',
      requestId: 'REQ-003',
      date: 'Yesterday'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const handleStartTrip = (tripId) => {
    setTrips(trips.map(trip => 
      trip.id === tripId ? { ...trip, status: 'In Progress' } : trip
    ));
  };

  const handleEndTrip = (tripId) => {
    setTrips(trips.map(trip => 
      trip.id === tripId ? { ...trip, status: 'Completed' } : trip
    ));
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || trip.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'var(--text-secondary)';
      case 'Approved': return 'var(--status-available)';
      case 'In Progress': return 'var(--status-pending)';
      case 'Completed': return 'var(--primary-color)';
      case 'Cancelled': return 'var(--status-complaint)';
      default: return 'var(--text-secondary)';
    }
  };

  const stats = {
    active: trips.filter(t => t.status === 'In Progress').length,
    completed: trips.filter(t => t.status === 'Completed').length,
    upcoming: trips.filter(t => t.status === 'Approved').length,
  };

  return (
    <div className="trip-management">
      <div className="page-header">
        <div>
          <h1>Trip Management</h1>
          <p>Monitor active journeys and upcoming schedules</p>
        </div>
        <button className="btn btn-primary">
          + New Trip
        </button>
      </div>

      <div className="trip-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper active-trips">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <h3>Active Trips</h3>
            <div className="stat-value">{stats.active}</div>
            <span className="stat-trend positive">Live tracking enabled</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper upcoming-trips">
            <ClockIcon size={24} />
          </div>
          <div className="stat-info">
            <h3>Upcoming Today</h3>
            <div className="stat-value">{stats.upcoming}</div>
            <span className="stat-trend">Scheduled departures</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper completed-trips">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>Completed</h3>
            <div className="stat-value">{stats.completed}</div>
            <span className="stat-trend">Successfully finished</span>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by ID, Driver, or Destination..."
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
                <option value="Approved">Upcoming (Approved)</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="trips-table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Trip Details</th>
                <th>Vehicle & Driver</th>
                <th>Route</th>
                <th>Schedule</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map((trip) => (
                <tr key={trip.id}>
                  <td>
                    <div className="td-content">
                      <span className="text-primary-bold">{trip.id}</span>
                      <span className="text-sub">Req: {trip.requestId}</span>
                    </div>
                  </td>
                  <td>
                    <div className="td-content row-gap">
                      <div className="icon-text">
                        <Car size={14} className="text-muted" />
                        <span>{trip.vehicle}</span>
                      </div>
                      <div className="icon-text text-sub">
                        <User size={14} className="text-muted" />
                        <span>{trip.driver}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="td-content row-gap">
                      <div className="icon-text">
                         <div className="route-dot start"></div>
                         <span>{trip.startLocation}</span>
                      </div>
                      <div className="icon-text text-sub">
                         <div className="route-dot end"></div>
                         <span>{trip.destination}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="td-content row-gap">
                      <div className="icon-text">
                        <Calendar size={14} className="text-muted" />
                        <span>{trip.date}</span>
                      </div>
                      <div className="icon-text text-sub">
                        <Clock size={14} className="text-muted" />
                        <span>{trip.departureTime} - {trip.returnTime}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: `${getStatusColor(trip.status)}15`,
                        color: getStatusColor(trip.status)
                      }}
                    >
                      {trip.status === 'In Progress' && <span className="live-dot"></span>}
                      {trip.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="action-buttons">
                      {trip.status === 'Approved' && (
                        <button 
                          className="btn-icon-text action-start"
                          onClick={() => handleStartTrip(trip.id)}
                        >
                          <PlayCircle size={16} /> Start
                        </button>
                      )}
                      {trip.status === 'In Progress' && (
                        <button 
                          className="btn-icon-text action-end"
                          onClick={() => handleEndTrip(trip.id)}
                        >
                          <CheckCircle2 size={16} /> Finish
                        </button>
                      )}
                      <button className="btn-icon ghost">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTrips.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-table-state">
                    <div className="empty-content">
                      <Car size={32} className="empty-icon" />
                      <p>No trips found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TripManagement;