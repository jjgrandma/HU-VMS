import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NotificationBell from '../../components/NotificationBell';
import NotificationPanel from '../../components/NotificationPanel';
import './adminSidebar.css';

const AdminSidebar = ({ onLogout }) => {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount] = useState(4); // Mock count - would come from API

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? '' : menu);
  };

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
        <div className="header-actions">
          <NotificationBell 
            count={notificationCount}
            onClick={() => setShowNotifications(true)}
          />
          {onLogout && (
            <button onClick={onLogout} className="logout-btn">
              Logout
            </button>
          )}
        </div>
      </div>

      <NotificationPanel 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <nav className="sidebar-nav">
        <Link 
          to="/admin/dashboard" 
          className={`nav-item ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
        >
          <span className="nav-icon">📊</span>
          <span>Dashboard Overview</span>
        </Link>

        <div className="nav-dropdown">
          <div 
            className={`nav-item dropdown-toggle ${openDropdown === 'vehicles' ? 'open' : ''}`}
            onClick={() => toggleDropdown('vehicles')}
          >
            <span className="nav-icon">🚗</span>
            <span>Vehicles</span>
            <span className="dropdown-arrow">{openDropdown === 'vehicles' ? '▼' : '▶'}</span>
          </div>
          {openDropdown === 'vehicles' && (
            <div className="dropdown-menu">
              <Link 
                to="/admin/manage-vehicles" 
                className={`dropdown-item ${location.pathname === '/admin/manage-vehicles' ? 'active' : ''}`}
              >
                Manage Vehicles
              </Link>
              <Link 
                to="/admin/vehicle-status" 
                className={`dropdown-item ${location.pathname === '/admin/vehicle-status' ? 'active' : ''}`}
              >
                Vehicle Status
              </Link>
              <Link 
                to="/admin/add-vehicle" 
                className={`dropdown-item ${location.pathname === '/admin/add-vehicle' ? 'active' : ''}`}
              >
                Add Vehicle
              </Link>
              <Link 
                to="/admin/vehicle-trip-history" 
                className={`dropdown-item ${location.pathname === '/admin/vehicle-trip-history' ? 'active' : ''}`}
              >
                Trip History
              </Link>
            </div>
          )}
        </div>

        <div className="nav-dropdown">
          <div 
            className={`nav-item dropdown-toggle ${openDropdown === 'users' ? 'open' : ''}`}
            onClick={() => toggleDropdown('users')}
          >
            <span className="nav-icon">👥</span>
            <span>Users</span>
            <span className="dropdown-arrow">{openDropdown === 'users' ? '▼' : '▶'}</span>
          </div>
          {openDropdown === 'users' && (
            <div className="dropdown-menu">
              <Link 
                to="/admin/manage-users" 
                className={`dropdown-item ${location.pathname === '/admin/manage-users' ? 'active' : ''}`}
              >
                Manage Users
              </Link>
              <Link 
                to="/admin/add-user" 
                className={`dropdown-item ${location.pathname === '/admin/add-user' ? 'active' : ''}`}
              >
                Add New User
              </Link>
              <Link 
                to="/admin/manage-drivers" 
                className={`dropdown-item ${location.pathname === '/admin/manage-drivers' ? 'active' : ''}`}
              >
                Manage Drivers
              </Link>
            </div>
          )}
        </div>

        <div className="nav-dropdown">
          <div 
            className={`nav-item dropdown-toggle ${openDropdown === 'reports' ? 'open' : ''}`}
            onClick={() => toggleDropdown('reports')}
          >
            <span className="nav-icon">📄</span>
            <span>Reports</span>
            <span className="dropdown-arrow">{openDropdown === 'reports' ? '▼' : '▶'}</span>
          </div>
          {openDropdown === 'reports' && (
            <div className="dropdown-menu">
              <Link 
                to="/admin/user-request-report" 
                className={`dropdown-item ${location.pathname === '/admin/user-request-report' ? 'active' : ''}`}
              >
                User Request Report
              </Link>
              <Link 
                to="/admin/vehicle-trip-report" 
                className={`dropdown-item ${location.pathname === '/admin/vehicle-trip-report' ? 'active' : ''}`}
              >
                Vehicle Trip Report
              </Link>
              <Link 
                to="/admin/driver-trip-report" 
                className={`dropdown-item ${location.pathname === '/admin/driver-trip-report' ? 'active' : ''}`}
              >
                Driver Trip Report
              </Link>
              <Link 
                to="/admin/driver-performance-report" 
                className={`dropdown-item ${location.pathname === '/admin/driver-performance-report' ? 'active' : ''}`}
              >
                Driver Performance
              </Link>
              <Link 
                to="/admin/fuel-records-report" 
                className={`dropdown-item ${location.pathname === '/admin/fuel-records-report' ? 'active' : ''}`}
              >
                Fuel Records
              </Link>
            </div>
          )}
        </div>

        <Link 
          to="/admin/settings" 
          className={`nav-item ${location.pathname === '/admin/settings' ? 'active' : ''}`}
        >
          <span className="nav-icon">⚙️</span>
          <span>Settings</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        {onLogout && (
          <button onClick={onLogout} className="logout-btn-footer">
            <span className="logout-icon">🚪</span>
            <span>Logout</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;
