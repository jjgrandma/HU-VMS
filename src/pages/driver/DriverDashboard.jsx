import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import driverService from '../../services/driverService';
import TripCard from './components/TripCard';
import VehicleStatusCard from './components/VehicleStatusCard';
import NotificationPanel from './components/NotificationPanel';
import QuickActions from './components/QuickActions';
import './styles/driverDashboard.css';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    upcomingTrips: [],
    assignedVehicle: null,
    recentActivity: [],
    notifications: [],
    stats: {
      totalTrips: 0,
      totalDistance: 0,
      fuelEfficiency: 0,
      completedTrips: 0
    }
  });
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await driverService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading Dashboard...</div>;
  }

  return (
    <div className="driver-dashboard">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Welcome back, {user?.name || 'Driver'}!</h1>
          <p className="date">{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
        <div className="header-right">
          <button 
            className="notification-bell"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
            {dashboardData.notifications?.length > 0 && (
              <span className="notification-badge">
                {dashboardData.notifications.length}
              </span>
            )}
          </button>
          <div className="driver-profile">
            <img src={user?.avatar || '/default-avatar.png'} alt="Profile" />
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      {showNotifications && (
        <NotificationPanel 
          notifications={dashboardData.notifications}
          onClose={() => setShowNotifications(false)}
          onMarkRead={driverService.markNotificationRead}
        />
      )}

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-info">
            <h3>{dashboardData.stats.totalTrips}</h3>
            <p>Total Trips</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📏</div>
          <div className="stat-info">
            <h3>{dashboardData.stats.totalDistance} km</h3>
            <p>Distance Covered</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⛽</div>
          <div className="stat-info">
            <h3>{dashboardData.stats.fuelEfficiency} km/l</h3>
            <p>Fuel Efficiency</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{dashboardData.stats.completedTrips}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="grid-left">
          <section className="upcoming-trips">
            <h2>Upcoming Trips</h2>
            {dashboardData.upcomingTrips.length > 0 ? (
              dashboardData.upcomingTrips.map(trip => (
                <TripCard key={trip.id} trip={trip} />
              ))
            ) : (
              <p className="no-data">No upcoming trips scheduled</p>
            )}
          </section>

          <section className="recent-activity">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <span className="activity-time">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="activity-description">
                    {activity.description}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="grid-right">
          <VehicleStatusCard 
            vehicle={dashboardData.assignedVehicle}
            onStatusChange={driverService.updateVehicleStatus}
          />
          
          <QuickActions 
            onReportIssue={() => {}}
            onRequestMaintenance={() => {}}
            onLogFuel={() => {}}
            onViewTrips={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
