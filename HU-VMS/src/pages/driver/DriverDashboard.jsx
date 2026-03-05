import { useState } from 'react';
import './DriverDashboard.css';

const DriverDashboard = () => {
  const [stats] = useState({
    totalTrips: 45,
    todayEarnings: 250,
    hoursToday: 8,
    rating: 4.8
  });

  return (
    <div className="driver-dashboard">
      <header className="dashboard-header">
        <h1>Driver Dashboard</h1>
        <p>Welcome back! Here's your daily overview.</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-info">
            <h3>{stats.totalTrips}</h3>
            <p>Total Trips</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>${stats.todayEarnings}</h3>
            <p>Today's Earnings</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <h3>{stats.hoursToday}h</h3>
            <p>Hours Today</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>{stats.rating}</h3>
            <p>Rating</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="card">
          <h3>Current Trip</h3>
          <p>No active trips</p>
        </div>

        <div className="card">
          <h3>Upcoming Trips</h3>
          <p>2 trips scheduled for today</p>
        </div>

        <div className="card">
          <h3>Vehicle Status</h3>
          <p>Vehicle ABC-1234 - Good condition</p>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;