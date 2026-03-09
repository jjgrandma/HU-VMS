import { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import './fuelstation.css';

const FuelStationLayout = ({ onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = () => {
    // Mock notifications for fuel station officer
    const mockNotifications = [
      {
        id: 1,
        title: 'New Fuel Request',
        message: 'Vehicle VH-012 has requested 45L of diesel',
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
        read: false,
        type: 'request'
      },
      {
        id: 2,
        title: 'Low Inventory Alert',
        message: 'Petrol inventory is below 20% threshold',
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
        read: false,
        type: 'alert'
      },
      {
        id: 3,
        title: 'Authorization Approved',
        message: 'Fuel request TXN-004 has been authorized by Admin',
        createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
        read: false,
        type: 'info'
      },
      {
        id: 4,
        title: 'Daily Report Generated',
        message: 'Your daily fuel report has been generated successfully',
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        read: true,
        type: 'success'
      },
      {
        id: 5,
        title: 'Maintenance Reminder',
        message: 'Fuel pump maintenance scheduled for tomorrow',
        createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
        read: true,
        type: 'info'
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

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

  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationDate) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

    return notificationDate.toLocaleDateString();
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
            to="/fuel/requests"
            className={`fuel-nav-item ${location.pathname === '/fuel/requests' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="fuel-nav-icon">📋</span>
            <span>Fuel Requests</span>
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
            to="/fuel/reports"
            className={`fuel-nav-item ${location.pathname === '/fuel/reports' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="fuel-nav-icon">📄</span>
            <span>Reports</span>
          </Link>

          <Link
            to="/fuel/transactions"
            className={`fuel-nav-item ${location.pathname === '/fuel/transactions' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="fuel-nav-icon">📜</span>
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
            {/* Notification Bell */}
            <button
              className="fuel-notification-bell"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              🔔
              {unreadCount > 0 && <span className="fuel-notification-badge">{unreadCount}</span>}
            </button>

            <span className="fuel-welcome">Welcome, Fuel Officer</span>
            <div className="fuel-avatar">F</div>
          </div>
        </div>

        {/* Notification Dropdown */}
        {showNotifications && (
          <>
            <div className="fuel-notification-overlay" onClick={() => setShowNotifications(false)}></div>
            <div className="fuel-notification-dropdown">
              <div className="fuel-notification-dropdown-header">
                <h3>Notifications</h3>
                <div className="fuel-notification-actions">
                  {unreadCount > 0 && (
                    <button
                      className="fuel-mark-all-read"
                      onClick={markAllAsRead}
                      title="Mark all as read"
                    >
                      ✓ Mark all read
                    </button>
                  )}
                  <button
                    className="fuel-notification-close"
                    onClick={() => setShowNotifications(false)}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="fuel-notification-list">
                {notifications.length === 0 ? (
                  <div className="fuel-no-notifications">
                    <span className="fuel-no-notifications-icon">🔔</span>
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`fuel-notification-item ${notification.read ? 'read' : 'unread'} ${notification.type}`}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification.id);
                        }
                      }}
                    >
                      <div className="fuel-notification-icon">
                        {notification.type === 'request' && '📋'}
                        {notification.type === 'alert' && '⚠️'}
                        {notification.type === 'info' && 'ℹ️'}
                        {notification.type === 'success' && '✓'}
                      </div>
                      <div className="fuel-notification-content">
                        <strong className="fuel-notification-title">{notification.title}</strong>
                        <p className="fuel-notification-message">{notification.message}</p>
                        <span className="fuel-notification-time">
                          {formatNotificationTime(notification.createdAt)}
                        </span>
                      </div>
                      {!notification.read && <div className="fuel-notification-unread-dot"></div>}
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="fuel-notification-footer">
                  <button
                    className="fuel-view-all-notifications"
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/fuel/notifications');
                    }}
                  >
                    View All Notifications
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Page Content */}
        <div className="fuel-page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default FuelStationLayout;