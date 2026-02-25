// src/pages/driver/DriverDashboard.jsx
import React, { useState, useEffect } from 'react';
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
import './styles/driverDashboard.css';

const DriverDashboard = () => {
  const { user } = useAuth();
  const { trips, vehicle, notifications, earnings, stats, loading, refreshData } = useDriverData();
  const { location, watchLocation, stopWatching } = useGeolocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');

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
  }, []);

  // Refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

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
          <div className="location-badge">
            <span className="location-dot"></span>
            <span>{location?.city || 'Location available'}</span>
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
              src={user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'Driver')} 
              alt="Profile" 
              className="profile-avatar"
            />
            <div className="profile-status"></div>
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      {showNotifications && (
        <NotificationPanel 
          notifications={notifications?.list || []}
          onClose={() => setShowNotifications(false)}
          onMarkRead={(id) => {/* handle mark read */}}
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
          <div className="stat-trend positive">↑ 12%</div>
        </div>

        <div className="stat-card gradient-green">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>${earnings?.today || 0}</h3>
            <p>Today's Earnings</p>
          </div>
          <div className="stat-trend positive">↑ 8%</div>
        </div>

        <div className="stat-card gradient-orange">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <h3>{stats?.hoursToday || 0}h</h3>
            <p>Hours Today</p>
          </div>
          <div className="stat-trend">On Track</div>
        </div>

        <div className="stat-card gradient-purple">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>{stats?.rating || 4.8}</h3>
            <p>Rating</p>
          </div>
          <div className="stat-trend positive">★ {stats?.totalRatings || 128}</div>
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
              <VehicleStatusCard vehicle={vehicle} />
              <BreakTimer />
              <QuickActions />
            </div>
            <div className="right-column">
              <EarningsCard earnings={earnings} />
              <div className="upcoming-trips-preview">
                <h3>Upcoming Trips</h3>
                {trips?.upcoming?.slice(0, 2).map(trip => (
                  <TripCard key={trip.id} trip={trip} compact />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trips' && (
          <div className="trips-full-view">
            <div className="trips-header">
              <h2>My Trips</h2>
              <div className="trip-filters">
                <button className="filter-btn active">All</button>
                <button className="filter-btn">Today</button>
                <button className="filter-btn">Week</button>
                <button className="filter-btn">Month</button>
              </div>
            </div>
            <div className="trips-list">
              {trips?.all?.map(trip => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="earnings-full-view">
            <EarningsCard earnings={earnings} fullView />
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="schedule-full-view">
            <ScheduleCard fullView />
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;