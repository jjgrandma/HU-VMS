import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './TransportSidebar.css';

const TransportSidebar = ({ onLogout }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const menuItems = [
    { path: '/transport/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/transport/requests', icon: '📋', label: 'Request Pool' },
    { path: '/transport/trips', icon: '🚗', label: 'Trip Management' },
    { path: '/transport/tracking', icon: '📍', label: 'Vehicle Tracking' },
    { path: '/transport/drivers', icon: '👨‍✈️', label: 'Driver Coordination' },
    { path: '/transport/complaints', icon: '⚠️', label: 'Complaints' },
    { path: '/transport/reports', icon: '📈', label: 'Reports' }
  ];

  const handleMenuItemClick = () => {
    setShowMobileMenu(false);
    setShowProfileDropdown(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <div className={`transport-sidebar ${showMobileMenu ? 'mobile-open' : ''}`}>
        {/* Logo Section */}
        <div className="sidebar-logo">
          <div className="logo-container">
            <div className="logo-icon">🚛</div>
            <div className="logo-text">
              <span className="logo-title">Transport Officer</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item) => (
              <li key={item.path} className="nav-item">
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => 
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                  onClick={handleMenuItemClick}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Mobile Overlay */}
      {showMobileMenu && (
        <div 
          className="mobile-overlay"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </>
  );
};

export default TransportSidebar;