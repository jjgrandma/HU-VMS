import { useState, useEffect } from 'react';
import './transportTheme.css';
import './TransportDashboard.css';

const TransportDashboard = () => {
  const [stats, setStats] = useState({
    totalRequests: 24,
    activeTrips: 12,
    availableVehicles: 18,
    activeDrivers: 15
  });

  const [recentActivities] = useState([
    { id: 1, type: 'request', message: 'New transport request from Medical College', time: '5 min ago', priority: 'high' },
    { id: 2, type: 'trip', message: 'Trip to Engineering Campus completed', time: '12 min ago', priority: 'normal' },
    { id: 3, type: 'vehicle', message: 'Vehicle HU-001 maintenance scheduled', time: '25 min ago', priority: 'medium' },
    { id: 4, type: 'driver', message: 'Driver Ahmed reported for duty', time: '1 hour ago', priority: 'normal' },
    { id: 5, type: 'complaint', message: 'New complaint received - Trip delay', time: '2 hours ago', priority: 'high' }
  ]);

  const [quickActions] = useState([
    { id: 1, title: 'New Request', icon: '📋', action: 'create-request', color: 'lime' },
    { id: 2, title: 'Assign Driver', icon: '👨‍✈️', action: 'assign-driver', color: 'blue' },
    { id: 3, title: 'Track Vehicle', icon: '🗺️', action: 'track-vehicle', color: 'green' },
    { id: 4, title: 'Emergency Alert', icon: '🚨', action: 'emergency', color: 'red' }
  ]);

  const getActivityIcon = (type) => {
    const icons = {
      request: '📋',
      trip: '🚗',
      vehicle: '🔧',
      driver: '👨‍✈️',
      complaint: '📝'
    };
    return icons[type] || '📌';
  };

  const getPriorityClass = (priority) => {
    return `priority-${priority}`;
  };

  return (
    <div className="transport-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🚛 Transport Officer Dashboard</h1>
          <p className="header-subtitle">Monitor and manage university transport operations</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary btn-large">
            📊 Generate Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card requests">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.totalRequests}</h3>
            <p>Total Requests</p>
            <span className="stat-change">+3 today</span>
          </div>
        </div>

        <div className="stat-card trips">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <h3>{stats.activeTrips}</h3>
            <p>Active Trips</p>
            <span className="stat-change">+2 ongoing</span>
          </div>
        </div>

        <div className="stat-card vehicles">
          <div className="stat-icon">🚛</div>
          <div className="stat-content">
            <h3>{stats.availableVehicles}</h3>
            <p>Available Vehicles</p>
            <span className="stat-change">Ready for dispatch</span>
          </div>
        </div>

        <div className="stat-card drivers">
          <div className="stat-icon">👨‍✈️</div>
          <div className="stat-content">
            <h3>{stats.activeDrivers}</h3>
            <p>Active Drivers</p>
            <span className="stat-change">On duty now</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map(action => (
            <button key={action.id} className={`quick-action-card ${action.color}`}>
              <span className="action-icon">{action.icon}</span>
              <span className="action-title">{action.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Activities */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Activities</h2>
            <button className="btn-secondary">View All</button>
          </div>
          <div className="activities-list">
            {recentActivities.map(activity => (
              <div key={activity.id} className={`activity-item ${getPriorityClass(activity.priority)}`}>
                <div className="activity-icon">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="activity-content">
                  <p className="activity-message">{activity.message}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
                <div className={`activity-priority ${activity.priority}`}>
                  {activity.priority}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>System Status</h2>
            <span className="status-indicator online">● All Systems Online</span>
          </div>
          <div className="status-list">
            <div className="status-item">
              <span className="status-label">GPS Tracking</span>
              <span className="status-value online">● Online</span>
            </div>
            <div className="status-item">
              <span className="status-label">Request Service</span>
              <span className="status-value online">● Online</span>
            </div>
            <div className="status-item">
              <span className="status-label">Driver Communication</span>
              <span className="status-value online">● Online</span>
            </div>
            <div className="status-item">
              <span className="status-label">Vehicle Monitoring</span>
              <span className="status-value online">● Online</span>
            </div>
            <div className="status-item">
              <span className="status-label">Database Connection</span>
              <span className="status-value online">● Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportDashboard;