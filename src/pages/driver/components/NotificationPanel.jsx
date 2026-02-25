// src/pages/driver/components/NotificationPanel.jsx
import React, { useState } from 'react';

const NotificationPanel = ({ notifications = [], onClose, onMarkRead }) => {
  const [filter, setFilter] = useState('all');

  const getNotificationIcon = (type) => {
    const icons = {
      info: { icon: 'ℹ️', bg: '#e3f2fd', color: '#1976d2' },
      warning: { icon: '⚠️', bg: '#fff3e0', color: '#f57c00' },
      success: { icon: '✅', bg: '#e8f5e8', color: '#2e7d32' },
      error: { icon: '❌', bg: '#ffebee', color: '#c62828' },
      trip: { icon: '🚗', bg: '#e8eaf6', color: '#3f51b5' },
      earnings: { icon: '💰', bg: '#f3e5f5', color: '#7b1fa2' }
    };
    return icons[type] || icons.info;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' ? true : n.type === filter
  );

  return (
    <div className="notification-panel glass-effect">
      <div className="panel-header">
        <h3>Notifications</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="notification-filters">
        <button 
          className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-chip ${filter === 'trip' ? 'active' : ''}`}
          onClick={() => setFilter('trip')}
        >
          Trips
        </button>
        <button 
          className={`filter-chip ${filter === 'warning' ? 'active' : ''}`}
          onClick={() => setFilter('warning')}
        >
          Alerts
        </button>
        <button 
          className={`filter-chip ${filter === 'earnings' ? 'active' : ''}`}
          onClick={() => setFilter('earnings')}
        >
          Earnings
        </button>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔔</span>
            <p>No notifications</p>
          </div>
        ) : (
          filteredNotifications.map(notification => {
            const iconStyle = getNotificationIcon(notification.type);
            return (
              <div 
                key={notification.id} 
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                onClick={() => onMarkRead(notification.id)}
              >
                <div className="notification-icon-wrapper" style={{ background: iconStyle.bg }}>
                  <span className="notification-icon">{iconStyle.icon}</span>
                </div>
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-time">
                    {formatTime(notification.timestamp || notification.time)}
                  </span>
                </div>
                {!notification.read && <span className="unread-dot"></span>}
              </div>
            );
          })
        )}
      </div>

      <div className="panel-footer">
        <button className="mark-all-btn" onClick={() => onMarkRead('all')}>
          Mark all as read
        </button>
        <button className="settings-btn">⚙️</button>
      </div>
    </div>
  );
};

export default NotificationPanel; // ← MAKE SURE THIS IS HERE!