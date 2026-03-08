import { useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import './fuelstation.css';

const FuelStationLayout = ({ onLogout }) => {
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
    <div className="fuel-dashboard-wrapper">
      {/* Mobile Menu Toggle */}
      <button className="fuel-mobile-menu-toggle" onClick={toggleMobileMenu}>
        <span className={`fuel-hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fuel-mobile-overlay" onClick={closeMobileMenu}></div>
      )}

      {/* Sidebar */}
      <div className={`fuel-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="fuel-sidebar-header">
          <div className="fuel-logo">
            <span className="fuel-logo-icon">⛽</span>
            <span className="fuel-logo-text">FUEL STATION</span>
          </div>
        </div>

        <nav className="fuel-sidebar-nav">
          <Link 
            to="/fuel/dashboard" 
            className={`fuel-nav-item ${location.pathname === '/fuel/dashboard' || location.pathname === '/fuel' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="fuel-nav-icon">📊</span>
            <span>Dashboard</span>
          </Link>

          <Link 
            to="/fuel/dispense" 
            className={`fuel-nav-item ${location.pathname === '/fuel/dispense' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="fuel-nav-icon">⛽</span>
            <span>Dispense Fuel</span>
          </Link>

          <Link 
            to="/fuel/inventory" 
            className={`fuel-nav-item ${location.pathname === '/fuel/inventory' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="fuel-nav-icon">📦</span>
            <span>Fuel Inventory</span>
          </Link>

          <Link 
            to="/fuel/transactions" 
            className={`fuel-nav-item ${location.pathname === '/fuel/transactions' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="fuel-nav-icon">📋</span>
            <span>Transactions</span>
          </Link>
        </nav>

        <div className="fuel-sidebar-footer">
          <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="fuel-logout-btn">
            <span className="fuel-logout-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="fuel-main-content">
        {/* Header */}
        <div className="fuel-header">
          <div className="fuel-header-left">
            <h1>Fuel Station Management</h1>
          </div>
          <div className="fuel-header-right">
            <span className="fuel-welcome">Welcome, Fuel Officer</span>
            <div className="fuel-avatar">F</div>
          </div>
        </div>

        {/* Page Content */}
        <div className="fuel-page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default FuelStationLayout;