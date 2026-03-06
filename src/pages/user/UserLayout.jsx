import { useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import './user.css';

const UserLayout = ({ onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  return (
    <div className="user-dashboard-wrapper">
      {/* Mobile Menu Toggle */}
      <button className="user-mobile-menu-toggle" onClick={toggleMobileMenu}>
        <span className={`user-hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="user-mobile-overlay" onClick={closeMobileMenu}></div>
      )}

      {/* Sidebar */}
      <div className={`user-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="user-sidebar-header">
          <div className="user-logo">
            <span className="user-logo-icon">🚗</span>
            <span className="user-logo-text">USER PORTAL</span>
          </div>
        </div>

        <nav className="user-sidebar-nav">
          <Link 
            to="/user/dashboard" 
            className={`user-nav-item ${location.pathname === '/user/dashboard' || location.pathname === '/user' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="user-nav-icon">📊</span>
            <span>Dashboard</span>
          </Link>

          <Link 
            to="/user/request-vehicle" 
            className={`user-nav-item ${location.pathname === '/user/request-vehicle' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="user-nav-icon">🚗</span>
            <span>Request Vehicle</span>
          </Link>

          <Link 
            to="/user/my-requests" 
            className={`user-nav-item ${location.pathname === '/user/my-requests' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="user-nav-icon">📋</span>
            <span>My Requests</span>
          </Link>

          <Link 
            to="/user/submit-complaint" 
            className={`user-nav-item ${location.pathname === '/user/submit-complaint' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="user-nav-icon">⚠️</span>
            <span>Submit Complaint</span>
          </Link>

          <Link 
            to="/user/notifications" 
            className={`user-nav-item ${location.pathname === '/user/notifications' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="user-nav-icon">🔔</span>
            <span>Notifications</span>
          </Link>
        </nav>

        <div className="user-sidebar-footer">
          <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="user-logout-btn">
            <span className="user-logout-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="user-main-content">
        {/* Header */}
        <div className="user-header">
          <div className="user-header-left">
            <h1>User Dashboard</h1>
          </div>
          <div className="user-header-right">
            <span className="user-welcome">Welcome, User</span>
            
            {/* Settings Button */}
            <button className="user-header-btn" title="Settings">
              <span>⚙️</span>
            </button>
            
            {/* Profile Button */}
            <button className="user-header-btn" onClick={() => navigate('/user/profile')} title="Profile">
              <span>👤</span>
            </button>
            
            {/* Logout Button */}
            <button className="user-header-btn user-logout-header-btn" onClick={handleLogout} title="Logout">
              <span>🚪</span>
            </button>
            
            <div className="user-avatar">U</div>
          </div>
        </div>

        {/* Page Content */}
        <div className="user-page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
