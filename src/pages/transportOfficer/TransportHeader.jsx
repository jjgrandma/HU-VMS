import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './TransportHeader.css';

const TransportHeader = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      '/transport/dashboard': 'Transport Officer Dashboard',
      '/transport/requests': 'Request Pool',
      '/transport/trips': 'Trip Management',
      '/transport/tracking': 'Vehicle Tracking',
      '/transport/drivers': 'Driver Coordination',
      '/transport/complaints': 'Complaints',
      '/transport/reports': 'Reports'
    };
    return titles[path] || 'Transport Officer Dashboard';
  };

  const getPageSubtitle = () => {
    const path = location.pathname;
    const subtitles = {
      '/transport/dashboard': 'Monitor and manage university transport operations',
      '/transport/requests': 'Review and manage trip requests',
      '/transport/trips': 'Plan and schedule trips',
      '/transport/tracking': 'Track vehicles in real-time',
      '/transport/drivers': 'Manage driver assignments',
      '/transport/complaints': 'Handle transport complaints',
      '/transport/reports': 'Generate transport reports'
    };
    return subtitles[path] || '';
  };

  return (
    <header className="transport-header">
      <div className="header-left">
        <h1 className="page-title">{getPageTitle()}</h1>
        {getPageSubtitle() && (
          <p className="page-subtitle">{getPageSubtitle()}</p>
        )}
      </div>

      <div className="header-right">
        {/* Notification Bell */}
        <button className="notification-btn">
          <span className="notification-icon">🔔</span>
          <span className="notification-badge">3</span>
        </button>

        {/* Profile Menu */}
        <div className="profile-menu-container">
          <button 
            className="profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="profile-avatar">TO</div>
            <div className="profile-info">
              <span className="profile-name">Transport Officer</span>
              <span className="profile-role">Officer</span>
            </div>
            <span className="dropdown-arrow">▼</span>
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <ul className="dropdown-menu">
                <li>
                  <button className="dropdown-item">
                    <span className="item-icon">👤</span>
                    My Profile
                  </button>
                </li>
                <li>
                  <button className="dropdown-item">
                    <span className="item-icon">⚙️</span>
                    Settings
                  </button>
                </li>
                <li>
                  <button className="dropdown-item logout-item">
                    <span className="item-icon">🚪</span>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showProfileMenu && (
        <div 
          className="dropdown-overlay"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </header>
  );
};

export default TransportHeader;