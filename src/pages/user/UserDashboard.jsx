import { useState } from 'react';
import './user.css';

const UserDashboard = () => {
  const stats = [
    { 
      id: 1, 
      title: 'TOTAL REQUESTS', 
      value: '5', 
      label: 'Total Requests',
      color: 'blue', 
      icon: '📊'
    },
    { 
      id: 2, 
      title: 'PENDING REQUESTS', 
      value: '1', 
      label: 'Pending Requests',
      color: 'yellow', 
      icon: '⏳'
    },
    { 
      id: 3, 
      title: 'APPROVED REQUESTS', 
      value: '1', 
      label: 'Approved Requests',
      color: 'green', 
      icon: '✅'
    },
    { 
      id: 4, 
      title: 'ACTIVE COMPLAINTS', 
      value: '2', 
      label: 'Active Complaints',
      color: 'red', 
      icon: '⚠️'
    },
  ];

  return (
    <div className="user-dashboard-content">
      <div className="user-dashboard-header">
        <h2>Dashboard</h2>
        <p>Welcome back, User! Here's your overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="user-stats-grid">
        {stats.map((stat) => (
          <div key={stat.id} className={`user-stat-card ${stat.color}`}>
            <div className="user-stat-icon">{stat.icon}</div>
            <div className="user-stat-badge">{stat.title}</div>
            <div className="user-stat-value">{stat.value}</div>
            <div className="user-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
