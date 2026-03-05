// src/pages/driver/DriverDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import TripCard from './components/TripCard';
import VehicleStatusCard from './components/VehicleStatusCard';
import NotificationPanel from './components/NotificationPanel';
import QuickActions from './components/QuickActions';
import EarningsCard from './components/EarningsCard';
import ScheduleCard from './components/ScheduleCard';
import BreakTimer from './components/BreakTimer';
import useDriverData from './hooks/useDriverData';
import useGeolocation from './hooks/useGeolocation';
import driverService from '../../services/driverService';
import './styles/driverDashboard.css';

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const {
    trips,
    vehicle,
    notifications,
    earnings,
    stats,
    loading,
    refreshData,
    updateTripStatus,
    reportIncident
  } = useDriverData();

  const { location, watchLocation, stopWatching, getCurrentPosition } = useGeolocation();

  const [activeTab, setActiveTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [tripFilter, setTripFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [driverStatus, setDriverStatus] = useState('online');
  const [showIncidentReport, setShowIncidentReport] = useState(false);
  const [incidentData, setIncidentData] = useState({
    type: '',
    description: '',
    tripId: null
  });
  const [breakState, setBreakState] = useState({
    isOnBreak: false,
    breakTime: 0,
    breakHistory: []
  });

  // Layout state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dashboardLayout, setDashboardLayout] = useState('default');

  // Quick Actions state
  const [quickActionsExpanded, setQuickActionsExpanded] = useState(false);

  // Track which quick action modal is open
  const [activeQuickAction, setActiveQuickAction] = useState(null);


  // Update time and greeting
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    return () => clearInterval(timer);
  }, []);

  // Start location tracking
  useEffect(() => {
    watchLocation();
    return () => stopWatching();
  }, [watchLocation, stopWatching]);

  // Refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Send location updates every 10 seconds when online
  useEffect(() => {
    if (driverStatus === 'online' && location) {
      const locationInterval = setInterval(() => {
        driverService.updateLocation(location);
      }, 10000);
      return () => clearInterval(locationInterval);
    }
  }, [driverStatus, location]);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Change layout
  const changeLayout = (layout) => {
    setDashboardLayout(layout);
    localStorage.setItem('driverDashboardLayout', layout);
  };

  // Load saved layout preference
  useEffect(() => {
    const savedLayout = localStorage.getItem('driverDashboardLayout');
    if (savedLayout) {
      setDashboardLayout(savedLayout);
    }
  }, []);

  const handleLogout = async () => {
    try {
      // End shift
      await driverService.updateStatus('offline');
      stopWatching();
      logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleStartTrip = async (tripId) => {
    try {
      await updateTripStatus(tripId, 'in-progress');
      // Get current location for trip start
      getCurrentPosition();
      const successNotification = {
        id: Date.now(),
        type: 'success',
        message: 'Trip started successfully! Follow route to destination.',
        timestamp: new Date().toISOString()
      };
      console.log('Trip started:', successNotification);
    } catch (error) {
      console.error('Error starting trip:', error);
    }
  };

  const handleCompleteTrip = async (tripId) => {
    try {
      await updateTripStatus(tripId, 'completed');
      const successNotification = {
        id: Date.now(),
        type: 'success',
        message: 'Trip completed successfully! Great job!',
        timestamp: new Date().toISOString()
      };
      console.log('Trip completed:', successNotification);
    } catch (error) {
      console.error('Error completing trip:', error);
    }
  };

  const handleCancelTrip = async (tripId, reason) => {
    if (!reason) {
      alert('Please provide a reason for cancellation');
      return;
    }
    try {
      await updateTripStatus(tripId, 'cancelled', { reason });
      alert('Trip cancelled');
    } catch (error) {
      console.error('Error cancelling trip:', error);
    }
  };

  const handleReportIncident = async (e) => {
    e.preventDefault();
    try {
      await reportIncident({
        ...incidentData,
        location: location?.coordinates,
        timestamp: new Date().toISOString()
      });
      setShowIncidentReport(false);
      setIncidentData({ type: '', description: '', tripId: null });
      alert('Incident reported successfully. Dispatch has been notified.');
    } catch (error) {
      console.error('Error reporting incident:', error);
    }
  };

  const handleShiftChange = async (status) => {
    try {
      await driverService.updateStatus(status);
      setDriverStatus(status);

      if (status === 'offline') {
        stopWatching();
        await driverService.logShiftEnd({
          time: new Date().toISOString(),
          earnings: earnings?.today,
          hours: stats?.hoursToday
        });
      } else if (status === 'online') {
        watchLocation();
        await driverService.logShiftStart({
          time: new Date().toISOString(),
          location: location?.coordinates
        });
      }
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await driverService.markNotificationRead(notificationId);
      refreshData();
    } catch (error) {
      console.error('Error marking notification:', error);
    }
  };

  const handleStartBreak = () => {
    setBreakState(prev => ({ ...prev, isOnBreak: true }));
    setDriverStatus('on-break');
  };

  const handleEndBreak = (breakTime, history) => {
    setBreakState({
      isOnBreak: false,
      breakTime: 0,
      breakHistory: history
    });
    setDriverStatus('online');
  };

  const filteredTrips = () => {
    if (!trips?.all) return [];

    const now = new Date();
    const today = now.toDateString();

    switch (tripFilter) {
      case 'today':
        return trips.all.filter(trip =>
          new Date(trip.date).toDateString() === today
        );
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        return trips.all.filter(trip =>
          new Date(trip.date) >= weekAgo
        );
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        return trips.all.filter(trip =>
          new Date(trip.date) >= monthAgo
        );
      default:
        return trips.all;
    }
  };

  const handleQuickAction = (action, subAction = null) => {
    switch (action) {
      case 'verify-stop':
        if (subAction === 'fulle') {
          setActiveQuickAction('fuel');
        }
        break;
      case 'bypass-glande':
        if (subAction === 'fulle' || subAction === 'faille') {
          setActiveQuickAction('fuel');
        }
        break;
      case 'bypass-gendre':
        if (subAction === 'faille') {
          setActiveQuickAction('fuel');
        }
        break;
      case 'incident':
        setShowIncidentReport(true);
        break;
      case 'dispatch':
        window.open('tel:+1234567890');
        break;
      case 'break':
        handleStartBreak();
        break;
      case 'fuel':
        setActiveQuickAction('fuel');
        break;
      case 'start-trip':
        setActiveQuickAction('trip');
        break;
      case 'report':
        setActiveQuickAction('report');
        break;
      case 'contact':
        setActiveQuickAction('contact');
        break;
      case 'earnings':
        setActiveQuickAction('earnings');
        break;
      case 'support':
        window.open('https://support.example.com', '_blank');
        break;
      case 'break-history':
        setQuickActionsExpanded(!quickActionsExpanded);
        break;
      default:
        break;
    }
  };

  const handleQuickActionComplete = (type, data) => {
    console.log(`Quick action ${type} completed:`, data);

    if (type === 'break') {
      handleStartBreak();
    } else if (type === 'report' && data) {
      setShowIncidentReport(false);
    }

    setActiveQuickAction(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className={`driver-dashboard layout-${dashboardLayout}`}>
      <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button className="sidebar-toggle" onClick={toggleSidebar} title="Toggle sidebar">
            {sidebarCollapsed ? '→' : '←'}
          </button>
          {!sidebarCollapsed && <span className="sidebar-title">Navigation</span>}
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('overview');
              setActiveQuickAction(null);
            }}
            title={sidebarCollapsed ? 'Overview' : ''}
          >
            <span className="nav-icon">📊</span>
            {!sidebarCollapsed && <span className="nav-text">Overview</span>}
          </button>

          <button
            className={`nav-item ${activeTab === 'trips' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('trips');
              setActiveQuickAction(null);
            }}
            title={sidebarCollapsed ? 'My Trips' : ''}
          >
            <span className="nav-icon">🗺️</span>
            {!sidebarCollapsed && <span className="nav-text">My Trips</span>}
          </button>

          <button
            className={`nav-item ${activeTab === 'earnings' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('earnings');
              setActiveQuickAction(null);
            }}
            title={sidebarCollapsed ? 'Earnings' : ''}
          >
            <span className="nav-icon">💰</span>
            {!sidebarCollapsed && <span className="nav-text">Earnings</span>}
          </button>

          <button
            className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('schedule');
              setActiveQuickAction(null);
            }}
            title={sidebarCollapsed ? 'Schedule' : ''}
          >
            <span className="nav-icon">📅</span>
            {!sidebarCollapsed && <span className="nav-text">Schedule</span>}
          </button>

          <div className="nav-divider"></div>

          {/* Quick Actions Panel Link - This remains */}
          <button
            className={`nav-item nav-quick-actions-link ${activeTab === 'quick-actions' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('quick-actions');
              setActiveQuickAction(null);
            }}
            title={sidebarCollapsed ? 'Quick Actions Panel' : ''}
          >
            <span className="nav-icon">⚡</span>
            {!sidebarCollapsed && <span className="nav-text">Quick Actions Panel</span>}
          </button>

          <div className="nav-divider"></div>

          <button className="nav-item" onClick={() => window.open('/support', '_blank')} title={sidebarCollapsed ? 'Help Center' : ''}>
            <span className="nav-icon">❓</span>
            {!sidebarCollapsed && <span className="nav-text">Help Center</span>}
          </button>

          <button className="nav-item" onClick={() => window.open('/settings', '_blank')} title={sidebarCollapsed ? 'Settings' : ''}>
            <span className="nav-icon">⚙️</span>
            {!sidebarCollapsed && <span className="nav-text">Settings</span>}
          </button>
        </nav>

        {!sidebarCollapsed && (
          <div className="sidebar-footer">
            <div className="layout-controls">
              <span className="layout-label">Layout:</span>
              <div className="layout-buttons">
                <button className={`layout-btn ${dashboardLayout === 'default' ? 'active' : ''}`} onClick={() => changeLayout('default')} title="Default layout">⊞</button>
                <button className={`layout-btn ${dashboardLayout === 'compact' ? 'active' : ''}`} onClick={() => changeLayout('compact')} title="Compact layout">⊟</button>
                <button className={`layout-btn ${dashboardLayout === 'detailed' ? 'active' : ''}`} onClick={() => changeLayout('detailed')} title="Detailed layout">☷</button>
              </div>
            </div>
          </div>
        )}
      </aside>


      <main className={`dashboard-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="dashboard-header glass-effect">
          <div className="header-left">
            <div className="welcome-section">
              <h1>{greeting}, <span className="user-name">{user?.name || 'Driver'}!</span></h1>
              <div className="header-meta">
                <p className="current-time">
                  <svg className="icon-clock" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="date-badge">
                  <svg className="icon-calendar" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>

          <div className="header-right">
            <div className="status-indicator">
              <select value={driverStatus} onChange={(e) => handleShiftChange(e.target.value)} className="status-select" aria-label="Driver status">
                <option value="online">🟢 Online</option>
                <option value="on-break">🟡 On Break</option>
                <option value="offline">🔴 Offline</option>
              </select>
            </div>

            <div className="location-badge" title="Current location">
              <span className="location-dot"></span>
              <span className="location-text">
                {location?.city || 'Location available'}
                {location?.speed && <span className="speed-indicator"> • {Math.round(location.speed * 3.6)} km/h</span>}
              </span>
            </div>

            <button className={`notification-bell ${notifications?.unreadCount > 0 ? 'has-notifications' : ''}`} onClick={() => setShowNotifications(!showNotifications)} aria-label="Notifications">
              <svg className="bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" />
                <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" />
              </svg>
              {notifications?.unreadCount > 0 && <span className="notification-badge">{notifications.unreadCount}</span>}
            </button>

            <div className="profile-menu">
              <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Driver')}&background=667eea&color=fff&size=48`} alt="Profile" className="profile-avatar" onClick={() => setShowLogoutConfirm(true)} title="Click to logout" />
              <div className={`profile-status ${driverStatus}`}></div>
            </div>
          </div>
        </header>

        {quickActionsExpanded && (
          <div className="quick-actions-expanded">
            <div className="expanded-header">
              <h4>All Quick Actions</h4>
              <button
                className="close-expanded"
                onClick={() => setQuickActionsExpanded(false)}
              >
                ×
              </button>
            </div>
            <div className="expanded-grid">
              <button className="expanded-item" onClick={() => { setQuickActionsExpanded(false); handleQuickAction('verify-stop', 'fulle'); }}>
                <span className="item-icon">⛽</span>
                <span className="item-text">Vérifier l'arrêt</span>
                <span className="item-desc">pour Fulle</span>
              </button>
              <button className="expanded-item" onClick={() => { setQuickActionsExpanded(false); handleQuickAction('bypass-glande', 'fulle'); }}>
                <span className="item-icon">⛽</span>
                <span className="item-text">Contourner Glande</span>
                <span className="item-desc">pour Fulle</span>
              </button>
              <button className="expanded-item" onClick={() => { setQuickActionsExpanded(false); handleQuickAction('bypass-glande', 'faille'); }}>
                <span className="item-icon">⛽</span>
                <span className="item-text">Contourner Glande</span>
                <span className="item-desc">pour Faille</span>
              </button>
              <button className="expanded-item" onClick={() => { setQuickActionsExpanded(false); handleQuickAction('bypass-gendre', 'faille'); }}>
                <span className="item-icon">⛽</span>
                <span className="item-text">Contourner gendre</span>
                <span className="item-desc">pour Faille</span>
              </button>
              <button className="expanded-item" onClick={() => { setQuickActionsExpanded(false); handleQuickAction('start-trip'); }}>
                <span className="item-icon">🚀</span>
                <span className="item-text">Démarrer un voyage</span>
              </button>
              <button className="expanded-item" onClick={() => { setQuickActionsExpanded(false); handleQuickAction('fuel'); }}>
                <span className="item-icon">⛽</span>
                <span className="item-text">Enregistrer carburant</span>
              </button>
              <button className="expanded-item" onClick={() => { setQuickActionsExpanded(false); handleQuickAction('break'); }}>
                <span className="item-icon">☕</span>
                <span className="item-text">Prendre une pause</span>
              </button>
              <button className="expanded-item" onClick={() => { setQuickActionsExpanded(false); handleQuickAction('report'); }}>
                <span className="item-icon">⚠️</span>
                <span className="item-text">Signaler problème</span>
              </button>
            </div>
          </div>
        )}

        {showLogoutConfirm && (
          <div className="modal-overlay">
            <div className="modal-content glass-effect">
              <h3>End Shift?</h3>
              <p>Are you sure you want to log out?</p>
              <p className="shift-summary">
                Today's earnings: ${earnings?.today || 0}<br />
                Hours worked: {stats?.hoursToday || 0}h
              </p>
              <div className="modal-actions">
                <button className="btn-primary" onClick={handleLogout}>Yes, End Shift</button>
                <button className="btn-secondary" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showIncidentReport && (
          <div className="modal-overlay">
            <div className="modal-content glass-effect">
              <h3>⚠️ Report Incident</h3>
              <form onSubmit={handleReportIncident}>
                <div className="form-group">
                  <label>Incident Type</label>
                  <select value={incidentData.type} onChange={(e) => setIncidentData({ ...incidentData, type: e.target.value })} required>
                    <option value="">Select type</option>
                    <option value="accident">Accident</option>
                    <option value="mechanical">Mechanical Issue</option>
                    <option value="traffic">Traffic Delay</option>
                    <option value="customer">Customer Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={incidentData.description} onChange={(e) => setIncidentData({ ...incidentData, description: e.target.value })} rows="4" placeholder="Describe what happened..." required />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-primary">Submit Report</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowIncidentReport(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showNotifications && (
          <NotificationPanel
            notifications={notifications?.list || []}
            onClose={() => setShowNotifications(false)}
            onMarkRead={handleMarkNotificationRead}
            onMarkAllRead={() => { notifications?.list.forEach(n => handleMarkNotificationRead(n.id)); }}
          />
        )}

        <div className="stats-grid">
          <div className="stat-card gradient-blue">
            <div className="stat-icon">🚗</div>
            <div className="stat-info">
              <h3>{stats?.totalTrips || 0}</h3>
              <p>Total Trips</p>
            </div>
            <div className="stat-trend positive">↑ {stats?.completionRate || 98}%</div>
          </div>

          <div className="stat-card gradient-green">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>${earnings?.today?.toFixed(2) || '0.00'}</h3>
              <p>Today's Earnings</p>
            </div>
            <div className="stat-trend positive">${earnings?.hourly?.toFixed(2) || '0'}/hr</div>
          </div>

          <div className="stat-card gradient-orange">
            <div className="stat-icon">⏱️</div>
            <div className="stat-info">
              <h3>{stats?.hoursToday || 0}h</h3>
              <p>Hours Today</p>
            </div>
            <div className="stat-trend">{breakState.breakTime > 0 ? `Break: ${Math.floor(breakState.breakTime / 60)}m` : 'On Track'}</div>
          </div>

          <div className="stat-card gradient-purple">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <h3>{stats?.rating || 4.8}</h3>
              <p>Rating</p>
            </div>
            <div className="stat-trend positive">{stats?.acceptanceRate || 95}% accepted</div>
          </div>
        </div>

        <div className="dashboard-tabs">
          <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Overview</button>
          <button className={`tab-btn ${activeTab === 'trips' ? 'active' : ''}`} onClick={() => setActiveTab('trips')}>🗺️ My Trips</button>
          <button className={`tab-btn ${activeTab === 'earnings' ? 'active' : ''}`} onClick={() => setActiveTab('earnings')}>💵 Earnings</button>
          <button className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>📅 Schedule</button>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-grid">
              <div className="left-column">
                <VehicleStatusCard vehicle={vehicle} onReportIssue={() => setShowIncidentReport(true)} />
                <BreakTimer isOnBreak={breakState.isOnBreak} breakTime={breakState.breakTime} breakHistory={breakState.breakHistory} onStartBreak={handleStartBreak} onEndBreak={handleEndBreak} />
                <QuickActions onActionComplete={handleQuickActionComplete} />
              </div>
              <div className="right-column">
                <EarningsCard earnings={earnings} />
                <div className="upcoming-trips-preview">
                  <h3>Upcoming Trips</h3>
                  {trips?.upcoming?.length > 0 ? (
                    trips.upcoming.slice(0, 2).map(trip => (
                      <TripCard key={trip.id} trip={trip} compact onStart={() => handleStartTrip(trip.id)} onCancel={(reason) => handleCancelTrip(trip.id, reason)} />
                    ))
                  ) : (
                    <p className="no-data">No upcoming trips</p>
                  )}
                  {trips?.upcoming?.length > 2 && (
                    <button className="view-all-link" onClick={() => setActiveTab('trips')}>View all {trips.upcoming.length} trips →</button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trips' && (
            <div className="trips-full-view">
              <div className="trips-header">
                <h2>My Trips</h2>
                <div className="trip-filters">
                  <button className={`filter-btn ${tripFilter === 'all' ? 'active' : ''}`} onClick={() => setTripFilter('all')}>All</button>
                  <button className={`filter-btn ${tripFilter === 'today' ? 'active' : ''}`} onClick={() => setTripFilter('today')}>Today</button>
                  <button className={`filter-btn ${tripFilter === 'week' ? 'active' : ''}`} onClick={() => setTripFilter('week')}>Week</button>
                  <button className={`filter-btn ${tripFilter === 'month' ? 'active' : ''}`} onClick={() => setTripFilter('month')}>Month</button>
                </div>
              </div>
              <div className="trips-list">
                {filteredTrips().length > 0 ? (
                  filteredTrips().map(trip => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      onStart={() => handleStartTrip(trip.id)}
                      onComplete={() => handleCompleteTrip(trip.id)}
                      onCancel={(reason) => handleCancelTrip(trip.id, reason)}
                      onReportIncident={() => {
                        setIncidentData({ ...incidentData, tripId: trip.id });
                        setShowIncidentReport(true);
                      }}
                    />
                  ))
                ) : (
                  <p className="no-data">No trips found for selected filter</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="earnings-full-view">
              <EarningsCard earnings={earnings} fullView />
              <div className="earnings-actions">
                <button className="btn-primary" onClick={() => window.print()}>🖨️ Download Statement</button>
                <button className="btn-secondary" onClick={() => alert('Payout scheduled for tomorrow')}>💰 Request Payout</button>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="schedule-full-view">
              <ScheduleCard
                fullView
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onSelectTrip={(trip) => {
                  setActiveTab('trips');
                }}
              />
            </div>
          )}

          {activeTab === 'quick-actions' && (
            <div className="quick-actions-full-view">
              <div className="quick-actions-header">
                <h2>⚡ Quick Actions Panel</h2>
                <p className="subtitle">Access all your quick actions in one place</p>
              </div>
              <QuickActions onActionComplete={handleQuickActionComplete} fullView />
            </div>
          )}
        </div>
      </main>

      {activeQuickAction && (
        <QuickActions onActionComplete={handleQuickActionComplete} initialAction={activeQuickAction} />
      )}
    </div>
  );
};

export default DriverDashboard;