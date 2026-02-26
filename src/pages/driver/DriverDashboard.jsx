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
  const [driverStatus, setDriverStatus] = useState('online'); // online, offline, on-break
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
      alert('Trip started successfully! Follow route to destination.');
    } catch (error) {
      console.error('Error starting trip:', error);
    }
  };

  const handleCompleteTrip = async (tripId) => {
    try {
      await updateTripStatus(tripId, 'completed');
      alert('Trip completed successfully! Great job!');
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
      await reportIncident(incidentData);
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
      } else if (status === 'online') {
        watchLocation();
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
    
    switch(tripFilter) {
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="driver-dashboard">
      {/* Header Section */}
      <header className="dashboard-header glass-effect">
        <div className="header-left">
          <div className="welcome-section">
            <h1>{greeting}, <span className="user-name">{user?.name || 'Driver'}!</span></h1>
            <p className="current-time">{currentTime.toLocaleTimeString()}</p>
          </div>
          <div className="date-badge">
            📅 {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        <div className="header-right">
          <div className="status-indicator">
            <select 
              value={driverStatus} 
              onChange={(e) => handleShiftChange(e.target.value)}
              className="status-select"
            >
              <option value="online">🟢 Online</option>
              <option value="on-break">🟡 On Break</option>
              <option value="offline">🔴 Offline</option>
            </select>
          </div>

          <div className="location-badge">
            <span className="location-dot"></span>
            <span>
              {location?.city || 'Location available'}
              {location?.speed ? ` • ${Math.round(location.speed * 3.6)} km/h` : ''}
            </span>
          </div>
          
          <button 
            className={`notification-bell ${notifications?.unreadCount > 0 ? 'has-notifications' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <svg className="bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" />
              <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" />
            </svg>
            {notifications?.unreadCount > 0 && (
              <span className="notification-badge">{notifications.unreadCount}</span>
            )}
          </button>

          <div className="profile-menu">
            <img 
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Driver')}&background=667eea&color=fff&size=48`} 
              alt="Profile" 
              className="profile-avatar"
              onClick={() => setShowLogoutConfirm(true)}
            />
            <div className={`profile-status ${driverStatus}`}></div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
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

      {/* Incident Report Modal */}
      {showIncidentReport && (
        <div className="modal-overlay">
          <div className="modal-content glass-effect">
            <h3>⚠️ Report Incident</h3>
            <form onSubmit={handleReportIncident}>
              <div className="form-group">
                <label>Incident Type</label>
                <select
                  value={incidentData.type}
                  onChange={(e) => setIncidentData({...incidentData, type: e.target.value})}
                  required
                >
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
                <textarea
                  value={incidentData.description}
                  onChange={(e) => setIncidentData({...incidentData, description: e.target.value})}
                  rows="4"
                  placeholder="Describe what happened..."
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Submit Report</button>
                <button type="button" className="btn-secondary" onClick={() => setShowIncidentReport(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Panel */}
      {showNotifications && (
        <NotificationPanel 
          notifications={notifications?.list || []}
          onClose={() => setShowNotifications(false)}
          onMarkRead={handleMarkNotificationRead}
          onMarkAllRead={() => {
            notifications?.list.forEach(n => handleMarkNotificationRead(n.id));
          }}
        />
      )}

      {/* Stats Cards */}
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
          <div className="stat-trend">{breakState.breakTime > 0 ? `Break: ${Math.floor(breakState.breakTime/60)}m` : 'On Track'}</div>
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

      {/* Tab Navigation */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'trips' ? 'active' : ''}`}
          onClick={() => setActiveTab('trips')}
        >
          🗺️ My Trips
        </button>
        <button 
          className={`tab-btn ${activeTab === 'earnings' ? 'active' : ''}`}
          onClick={() => setActiveTab('earnings')}
        >
          💵 Earnings
        </button>
        <button 
          className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          📅 Schedule
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <div className="left-column">
              <VehicleStatusCard 
                vehicle={vehicle} 
                onReportIssue={() => setShowIncidentReport(true)}
              />
              <BreakTimer 
                isOnBreak={breakState.isOnBreak}
                breakTime={breakState.breakTime}
                breakHistory={breakState.breakHistory}
                onStartBreak={handleStartBreak}
                onEndBreak={handleEndBreak}
              />
              <QuickActions 
                onReportIncident={() => setShowIncidentReport(true)}
                onContactDispatch={() => window.open('tel:+1234567890')}
                onViewSchedule={() => setActiveTab('schedule')}
                onViewEarnings={() => setActiveTab('earnings')}
                driverStatus={driverStatus}
              />
            </div>
            <div className="right-column">
              <EarningsCard earnings={earnings} />
              <div className="upcoming-trips-preview">
                <h3>Upcoming Trips</h3>
                {trips?.upcoming?.length > 0 ? (
                  trips.upcoming.slice(0, 2).map(trip => (
                    <TripCard 
                      key={trip.id} 
                      trip={trip} 
                      compact 
                      onStart={() => handleStartTrip(trip.id)}
                      onCancel={(reason) => handleCancelTrip(trip.id, reason)}
                    />
                  ))
                ) : (
                  <p className="no-data">No upcoming trips</p>
                )}
                {trips?.upcoming?.length > 2 && (
                  <button className="view-all-link" onClick={() => setActiveTab('trips')}>
                    View all {trips.upcoming.length} trips →
                  </button>
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
                <button 
                  className={`filter-btn ${tripFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setTripFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-btn ${tripFilter === 'today' ? 'active' : ''}`}
                  onClick={() => setTripFilter('today')}
                >
                  Today
                </button>
                <button 
                  className={`filter-btn ${tripFilter === 'week' ? 'active' : ''}`}
                  onClick={() => setTripFilter('week')}
                >
                  Week
                </button>
                <button 
                  className={`filter-btn ${tripFilter === 'month' ? 'active' : ''}`}
                  onClick={() => setTripFilter('month')}
                >
                  Month
                </button>
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
                      setIncidentData({...incidentData, tripId: trip.id});
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
              <button className="btn-primary" onClick={() => window.print()}>
                🖨️ Download Statement
              </button>
              <button className="btn-secondary" onClick={() => alert('Payout scheduled for tomorrow')}>
                💰 Request Payout
              </button>
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
                // Scroll to trip
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;