import { useState, useEffect } from 'react';
import './DriverDashboard.css';
import AssignedTrips from './trips/AssignedTrips';
import TripHistory from './trips/TripHistory';
import VehicleInfo from './vehicle/VehicleInfo';
import DriverNotifications from './notifications/DriverNotifications';
import DriverAvailability from './availability/DriverAvailability';
import UpdateTripStatus from './trip-status/UpdateTripStatus';
import GPSTracking from './tracking/GPSTracking';
import DriverComplaints from './complaints/DriverComplaints';
import SubmitComplaint from './submit-complaint/SubmitComplaint';
import ExitEntryVerification from './gate-verification/ExitEntryVerification';
import DriverProfile from './profile/DriverProfile';
import DriverReports from './reports/DriverReports';
import DriverSettings from './DriverSettings';
import driverService from '../../services/driverService';

const DriverDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [driverInfo, setDriverInfo] = useState({
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@university.edu',
    phone: '+1 234 567 8900',
    employeeId: 'DRV-001',
    avatar: localStorage.getItem('driverProfileImage') || 'https://ui-avatars.com/api/?name=Ahmed+Hassan&background=28a745&color=fff&size=200&bold=true&font-size=0.4'
  });
  const [stats, setStats] = useState({
    totalTrips: 0,
    completedToday: 0,
    activeTrip: null,
    availability: 'available'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    loadNotifications();
    loadSettings();
    
    // Listen for profile image updates
    const handleStorageChange = () => {
      const newImage = localStorage.getItem('driverProfileImage');
      if (newImage) {
        setDriverInfo(prev => ({ ...prev, avatar: newImage }));
      }
    };
    
    // Listen for settings updates (including name changes)
    const handleSettingsUpdate = (e) => {
      if (e.detail && e.detail.account) {
        setDriverInfo(prev => ({
          ...prev,
          name: e.detail.account.name,
          email: e.detail.account.email,
          avatar: e.detail.account.avatar || prev.avatar
        }));
      }
      loadSettings();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileImageUpdated', handleStorageChange);
    window.addEventListener('driverAccountSettingsUpdated', handleSettingsUpdate);

    const interval = setInterval(() => {
      loadDashboardData();
      loadNotifications();
    }, 10000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileImageUpdated', handleStorageChange);
      window.removeEventListener('driverAccountSettingsUpdated', handleSettingsUpdate);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const [trips, availability] = await Promise.all([
        driverService.getAssignedTrips(),
        driverService.getAvailability()
      ]);

      const activeTrip = trips.find(t => t.status === 'started' || t.status === 'on-the-way');

      setStats({
        totalTrips: trips.length,
        completedToday: trips.filter(t => t.status === 'completed' && isToday(t.completedAt)).length,
        activeTrip: activeTrip || null,
        availability: availability.status
      });

      setCurrentTrip(activeTrip);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
    }
  };

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('driverSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        
        // Apply account settings
        if (parsed.account) {
          setDriverInfo(prev => ({
            ...prev,
            name: parsed.account.name || prev.name,
            email: parsed.account.email || prev.email,
            phone: parsed.account.phone || prev.phone,
            avatar: parsed.account.avatar || prev.avatar
          }));
        }
        
        // Apply theme settings
        if (parsed.system && parsed.system.theme) {
          applyTheme(parsed.system.theme);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  };

  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.style.backgroundColor = '#1a1a1a';
      document.body.style.color = '#ffffff';
    } else if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#000000';
    } else if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      document.body.style.backgroundColor = prefersDark ? '#1a1a1a' : '#ffffff';
      document.body.style.color = prefersDark ? '#ffffff' : '#000000';
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await driverService.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    const checkDate = new Date(date);
    return checkDate.toDateString() === today.toDateString();
  };

  const handleTripUpdate = () => {
    loadDashboardData();
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      // Clear session and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'trips':
        return <AssignedTrips onTripUpdate={handleTripUpdate} />;
      case 'trip-history':
        return <TripHistory />;
      case 'vehicle':
        return <VehicleInfo />;
      case 'notifications':
        return <DriverNotifications />;
      case 'complaints':
        return <DriverComplaints />;
      case 'submit-complaint':
        return <SubmitComplaint />;
      case 'gate-verification':
        return <ExitEntryVerification />;
      case 'reports':
        return <DriverReports />;
      case 'profile':
        return <DriverProfile />;
      case 'settings':
        return <DriverSettings />;
      case 'tracking':
        return currentTrip ? <GPSTracking trip={currentTrip} /> : <div className="no-data">No active trip for tracking</div>;
      case 'trip-status':
        return currentTrip ? <UpdateTripStatus trip={currentTrip} onUpdate={handleTripUpdate} /> : <div className="no-data">No active trip to update</div>;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">�</div>
          <div className="stat-info">
            <h3>{stats.totalTrips}</h3>
            <p>Assigned Trips</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.completedToday}</h3>
            <p>Completed Today</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📍</div>
          <div className="stat-info">
            <h3>{stats.activeTrip ? 'In Progress' : 'No Active Trip'}</h3>
            <p>Current Status</p>
          </div>
        </div>
      </div>

      {currentTrip && (
        <div className="current-trip-section">
          <div className="card current-trip-card">
            <h3>� Current Trip</h3>
            <div className="trip-details">
              <div className="detail-row">
                <span>Pickup:</span>
                <strong>{currentTrip.pickupLocation}</strong>
              </div>
              <div className="detail-row">
                <span>Destination:</span>
                <strong>{currentTrip.destination}</strong>
              </div>
              <div className="detail-row">
                <span>Status:</span>
                <span className={`status ${currentTrip.status}`}>{currentTrip.status}</span>
              </div>
              <button onClick={() => setActiveView('trip-status')} className="btn-primary">
                Update Trip Status
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="quick-actions-grid">
        <button onClick={() => setActiveView('trips')} className="action-card">
          <div className="action-icon">📋</div>
          <h4>My Trips</h4>
          <p>View assigned trips</p>
        </button>
        <button onClick={() => setActiveView('vehicle')} className="action-card">
          <div className="action-icon">🚙</div>
          <h4>Vehicle Info</h4>
          <p>Check vehicle status</p>
        </button>
        <button onClick={() => setActiveView('fuel')} className="action-card">
          <div className="action-icon">⛽</div>
          <h4>Fuel Report</h4>
          <p>Record fuel usage</p>
        </button>
        {currentTrip && (
          <button onClick={() => setActiveView('tracking')} className="action-card">
            <div className="action-icon">📍</div>
            <h4>GPS Tracking</h4>
            <p>Track current trip</p>
          </button>
        )}
      </div>
    </>
  );

  if (loading) {
    return <div className="driver-dashboard loading">Loading...</div>;
  }

  return (
    <div className="driver-dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Driver Portal</h2>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={activeView === 'overview' ? 'active' : ''}
            onClick={() => setActiveView('overview')}
          >
            <span className="nav-icon">🏠</span>
            {sidebarOpen && <span>Dashboard</span>}
          </button>
          <button
            className={activeView === 'trips' ? 'active' : ''}
            onClick={() => setActiveView('trips')}
          >
            <span className="nav-icon">📋</span>
            {sidebarOpen && <span>Assigned Trips</span>}
          </button>
          <button
            className={activeView === 'trip-history' ? 'active' : ''}
            onClick={() => setActiveView('trip-history')}
          >
            <span className="nav-icon">📜</span>
            {sidebarOpen && <span>Trip History</span>}
          </button>
          <button
            className={activeView === 'vehicle' ? 'active' : ''}
            onClick={() => setActiveView('vehicle')}
          >
            <span className="nav-icon">🚙</span>
            {sidebarOpen && <span>Vehicle Info</span>}
          </button>
          {currentTrip && (
            <>
              <button
                className={activeView === 'trip-status' ? 'active' : ''}
                onClick={() => setActiveView('trip-status')}
              >
                <span className="nav-icon">🔄</span>
                {sidebarOpen && <span>Update Status</span>}
              </button>
              <button
                className={activeView === 'tracking' ? 'active' : ''}
                onClick={() => setActiveView('tracking')}
              >
                <span className="nav-icon">📍</span>
                {sidebarOpen && <span>GPS Tracking</span>}
              </button>
            </>
          )}
          <button
            className={activeView === 'complaints' ? 'active' : ''}
            onClick={() => setActiveView('complaints')}
          >
            <span className="nav-icon">💬</span>
            {sidebarOpen && <span>Complaints</span>}
          </button>
          <button
            className={activeView === 'submit-complaint' ? 'active' : ''}
            onClick={() => setActiveView('submit-complaint')}
          >
            <span className="nav-icon">📝</span>
            {sidebarOpen && <span>Submit Complaint</span>}
          </button>
          <button
            className={activeView === 'gate-verification' ? 'active' : ''}
            onClick={() => setActiveView('gate-verification')}
          >
            <span className="nav-icon">🚪</span>
            {sidebarOpen && <span>Gate Verification</span>}
          </button>
          <button
            className={activeView === 'reports' ? 'active' : ''}
            onClick={() => setActiveView('reports')}
          >
            <span className="nav-icon">📊</span>
            {sidebarOpen && <span>Reports</span>}
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span className="logout-icon">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <h1>Driver Dashboard</h1>
          </div>
          <div className="header-right">
            <DriverAvailability currentStatus={stats.availability} onUpdate={loadDashboardData} />

            <button
              className="notification-bell"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
            >
              🔔
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>

            {/* Profile Dropdown */}
            <div className="profile-dropdown-container">
              <button
                className="profile-button"
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
              >
                <div className="profile-avatar">
                  {driverInfo.avatar ? (
                    <img src={driverInfo.avatar} alt={driverInfo.name} />
                  ) : (
                    <span>{driverInfo.name.charAt(0)}</span>
                  )}
                </div>
                <div className="profile-info">
                  <span className="profile-name">{driverInfo.name}</span>
                  <span className="profile-role">Driver</span>
                </div>
                <span className="dropdown-arrow">▼</span>
              </button>

              {showProfileMenu && (
                <div className="profile-menu">
                  <div className="profile-menu-header">
                    <div className="profile-avatar-large">
                      {driverInfo.avatar ? (
                        <img src={driverInfo.avatar} alt={driverInfo.name} />
                      ) : (
                        <span>{driverInfo.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="profile-details">
                      <h4>{driverInfo.name}</h4>
                      <p>{driverInfo.email}</p>
                      <span className="employee-id">{driverInfo.employeeId}</span>
                    </div>
                  </div>

                  <div className="profile-menu-items">
                    <button
                      onClick={() => {
                        setActiveView('profile');
                        setShowProfileMenu(false);
                      }}
                    >
                      <span className="menu-icon">👤</span>
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        setActiveView('settings');
                        setShowProfileMenu(false);
                      }}
                    >
                      <span className="menu-icon">⚙️</span>
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        setActiveView('trip-history');
                        setShowProfileMenu(false);
                      }}
                    >
                      <span className="menu-icon">📊</span>
                      My Performance
                    </button>
                    <div className="menu-divider"></div>
                    <button onClick={handleLogout} className="logout-btn">
                      <span className="menu-icon">🚪</span>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Notification Dropdown */}
        {showNotifications && (
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Notifications</h3>
              <button onClick={() => setShowNotifications(false)}>✕</button>
            </div>
            <div className="notification-list">
              {notifications.length === 0 ? (
                <p className="no-notifications">No notifications</p>
              ) : (
                notifications.slice(0, 5).map(notification => (
                  <div key={notification.id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
                    <div className="notification-content">
                      <strong>{notification.title}</strong>
                      <p>{notification.message}</p>
                      <span className="notification-time">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              className="view-all-btn"
              onClick={() => {
                setActiveView('notifications');
                setShowNotifications(false);
              }}
            >
              View All Notifications
            </button>
          </div>
        )}

        {/* Main View */}
        <main className="dashboard-main">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default DriverDashboard;
