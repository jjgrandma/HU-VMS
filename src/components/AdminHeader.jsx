import { useState } from 'react';
import { Link } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import NotificationPanel from './NotificationPanel';
import './AdminHeader.css';

const AdminHeader = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount] = useState(4);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <>
      <div className="admin-header">
        <div className="header-left">
          <h1 className="page-title">Dashboard</h1>
        </div>
        
        <div className="header-right">
          <NotificationBell 
            count={notificationCount}
            onClick={() => setShowNotifications(true)}
          />
          
          <div className="header-profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <img src="https://via.placeholder.com/40" alt="Admin" className="header-avatar" />
            <div className="header-profile-info">
              <span className="header-profile-name">Admin User</span>
              <span className="header-profile-role">Administrator</span>
            </div>
            <span className="profile-dropdown-arrow">▼</span>
            
            {showProfileMenu && (
              <div className="profile-dropdown-menu">
                <Link to="/admin/settings" className="dropdown-menu-item">
                  <span>👤</span>
                  <span>My Profile</span>
                </Link>
                <Link to="/admin/settings" className="dropdown-menu-item">
                  <span>⚙️</span>
                  <span>Settings</span>
                </Link>
                <div className="dropdown-divider"></div>
                <button className="dropdown-menu-item logout-item">
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <NotificationPanel 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
};

export default AdminHeader;
