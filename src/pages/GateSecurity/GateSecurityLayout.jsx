import { useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import './GateSecurityLayout.css';

const GateSecurityLayout = ({ onLogout }) => {
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
    <div className="gate-dashboard-wrapper">
      {/* Mobile Menu Toggle */}
      <button className="gate-mobile-menu-toggle" onClick={toggleMobileMenu}>
        <span className={`gate-hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="gate-mobile-overlay" onClick={closeMobileMenu}></div>
      )}

      {/* Sidebar */}
      <div className={`gate-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="gate-sidebar-header">
          <div className="gate-logo">
            <span className="gate-logo-icon">🚧</span>
            <span className="gate-logo-text">GATE SECURITY</span>
          </div>
        </div>

        <nav className="gate-sidebar-nav">
          <Link 
            to="/gate/dashboard" 
            className={`gate-nav-item ${location.pathname === '/gate/dashboard' || location.pathname === '/gate' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="gate-nav-icon">📊</span>
            <span>Dashboard</span>
          </Link>

          <Link 
            to="/gate/camera" 
            className={`gate-nav-item ${location.pathname === '/gate/camera' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="gate-nav-icon">📷</span>
            <span>ALPR Camera</span>
          </Link>

          <Link 
            to="/gate/verification" 
            className={`gate-nav-item ${location.pathname === '/gate/verification' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="gate-nav-icon">🔍</span>
            <span>Vehicle Verification</span>
          </Link>

          <Link 
            to="/gate/logs" 
            className={`gate-nav-item ${location.pathname === '/gate/logs' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="gate-nav-icon">📋</span>
            <span>Gate Logs</span>
          </Link>
        </nav>

        <div className="gate-sidebar-footer">
          <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="gate-logout-btn">
            <span className="gate-logout-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="gate-main-content">
        {/* Header */}
        <div className="gate-header">
          <div className="gate-header-left">
            <h1>Gate Security System</h1>
          </div>
          <div className="gate-header-right">
            <span className="gate-welcome">Welcome, Gate Officer</span>
            <div className="gate-avatar">G</div>
          </div>
        </div>

        {/* Page Content */}
        <div className="gate-page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default GateSecurityLayout;
