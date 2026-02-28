// src/pages/user/UserDashboard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './UserDashboard.css';

const UserDashboard = () => {
  const [activeFilter, setActiveFilter] = useState(null);
  const [filteredStats, setFilteredStats] = useState(null);

  const stats = [
    { id: 1, title: 'Total Requests', value: '5', color: 'blue', icon: '📊', filter: 'all' },
    { id: 2, title: 'Pending Requests', value: '1', color: 'yellow', icon: '⏳', filter: 'pending' },
    { id: 3, title: 'Approved Requests', value: '1', color: 'green', icon: '✅', filter: 'approved' },
    { id: 4, title: 'Active Complaints', value: '2', color: 'red', icon: '⚠️', filter: 'complaints' },
  ];

  const allRequests = [
    {
      id: 'REQ001',
      vehicle: 'Sedan',
      purpose: 'Airport Pickup',
      date: '2026-02-20',
      time: '09:00',
      status: 'Approved',
      statusColor: 'green'
    },
    {
      id: 'REQ002',
      vehicle: 'SUV',
      purpose: 'Client Meeting',
      date: '2026-02-21',
      time: '14:30',
      status: 'Pending',
      statusColor: 'yellow'
    },
    {
      id: 'REQ003',
      vehicle: 'Van',
      purpose: 'Team Outing',
      date: '2026-02-22',
      time: '10:00',
      status: 'Approved',
      statusColor: 'green'
    },
    {
      id: 'REQ004',
      vehicle: 'Truck',
      purpose: 'Equipment Transport',
      date: '2026-02-19',
      time: '11:00',
      status: 'Completed',
      statusColor: 'blue'
    },
  ];

  const complaints = [
    {
      id: 'CMP001',
      title: 'Vehicle Maintenance Issue',
      status: 'Active',
      priority: 'High',
      date: '2026-02-18'
    },
    {
      id: 'CMP002',
      title: 'Driver Behavior Complaint',
      status: 'Active',
      priority: 'Medium',
      date: '2026-02-17'
    }
  ];

  const recentNotifications = [
    {
      id: 1,
      title: 'Request Approved',
      message: 'Your vehicle request REQ001 has been approved.',
      time: '4 days ago',
      type: 'success'
    },
    {
      id: 2,
      title: 'Complaint Update',
      message: 'Your complaint CMP001 has been resolved.',
      time: '6 days ago',
      type: 'info'
    },
    {
      id: 3,
      title: 'Vehicle Assignment',
      message: 'Vehicle assigned for request REQ002: Toyota Camry (Plate: ABC-1234)',
      time: '4 days ago',
      type: 'info'
    },
  ];

  const handleStatClick = (stat) => {
    if (activeFilter === stat.filter) {
      // If clicking the same stat, clear the filter
      setActiveFilter(null);
      setFilteredStats(null);
    } else {
      setActiveFilter(stat.filter);
      setFilteredStats({
        title: stat.title,
        icon: stat.icon,
        count: stat.value,
        color: stat.color
      });
    }
  };

  const getFilteredRequests = () => {
    if (!activeFilter) return allRequests;
    
    switch(activeFilter) {
      case 'pending':
        return allRequests.filter(req => req.status.toLowerCase() === 'pending');
      case 'approved':
        return allRequests.filter(req => req.status.toLowerCase() === 'approved');
      case 'complaints':
        return complaints;
      case 'all':
      default:
        return allRequests;
    }
  };

  const clearFilter = () => {
    setActiveFilter(null);
    setFilteredStats(null);
  };

  const filteredItems = getFilteredRequests();
  const isComplaintsView = activeFilter === 'complaints';

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, User! Here's your overview.</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div 
            key={stat.id} 
            className={`stat-card ${activeFilter === stat.filter ? 'active' : ''} ${stat.color}`}
            onClick={() => handleStatClick(stat)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleStatClick(stat);
              }
            }}
          >
            <div className="stat-header">
              <span className="stat-icon">{stat.icon}</span>
              <span className={`stat-badge ${stat.color}`}>{stat.title}</span>
            </div>
            <div>
              <span className="stat-value">{stat.value}</span>
              <span className="stat-title">{stat.title}</span>
            </div>
            {activeFilter === stat.filter && (
              <div className="stat-active-indicator">▼ Filtering</div>
            )}
          </div>
        ))}
      </div>

      {activeFilter && (
        <div className="filter-indicator">
          <div className="filter-badge">
            <span className="filter-icon">{filteredStats?.icon}</span>
            <span>Showing: <strong>{filteredStats?.title}</strong> ({filteredItems.length} items)</span>
          </div>
          <button className="clear-filter" onClick={clearFilter}>
            Clear Filter ✕
          </button>
        </div>
      )}

      <div className="dashboard-columns">
        {/* Recent Requests / Complaints */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>
              {isComplaintsView ? 'Active Complaints' : 'Recent Requests'}
              {activeFilter && !isComplaintsView && (
                <span className="filter-label">
                  ({activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)})
                </span>
              )}
            </h2>
            <Link 
              to={isComplaintsView ? "/user/complaints" : "/user/requests"} 
              className="view-link"
            >
              View All →
            </Link>
          </div>
          <div>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div key={item.id} className="request-item">
                  {isComplaintsView ? (
                    // Complaint View
                    <div className="request-info">
                      <div className="request-header">
                        <span className="request-id">{item.id}</span>
                        <span className={`status-badge ${item.priority === 'High' ? 'red' : 'yellow'}`}>
                          {item.priority}
                        </span>
                      </div>
                      <p className="request-details">{item.title}</p>
                      <p className="request-time">
                        {item.date} • Status: {item.status}
                      </p>
                    </div>
                  ) : (
                    // Request View
                    <div className="request-info">
                      <div className="request-header">
                        <span className="request-id">{item.id}</span>
                        <span className={`status-badge ${item.statusColor}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="request-details">
                        {item.vehicle} - {item.purpose}
                      </p>
                      <p className="request-time">
                        {item.date} at {item.time}
                      </p>
                    </div>
                  )}
                  <Link 
                    to={isComplaintsView ? `/user/complaints/${item.id}` : `/user/requests/${item.id}`} 
                    className="view-request"
                  >
                    View →
                  </Link>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No {isComplaintsView ? 'complaints' : 'requests'} found</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Recent Notifications</h2>
            <Link to="/user/notifications" className="view-link">View All →</Link>
          </div>
          <div>
            {recentNotifications.map((notification) => (
              <div key={notification.id} className="notification-item">
                <div className="notification-content">
                  <div className={`notification-dot ${notification.type}`} />
                  <div className="notification-text">
                    <p className="notification-title">{notification.title}</p>
                    <p className="notification-message">{notification.message}</p>
                    <p className="notification-time">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="view-all-button">
            <Link to="/user/notifications" className="view-all-link">
              View All Notifications
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;