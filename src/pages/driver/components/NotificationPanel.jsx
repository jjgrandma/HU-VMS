// src/pages/driver/components/NotificationPanel.jsx
import React from 'react';

const NotificationPanel = ({ notifications, onClose, onMarkRead }) => {
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '📋';
    }
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <h3>Notifications</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <p className="no-notifications">No new notifications</p>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => onMarkRead(notification.id)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">
                  {formatTime(notification.timestamp || notification.time)}
                </span>
              </div>
              {!notification.read && <span className="unread-dot">●</span>}
            </div>
          ))
        )}
      </div>

      <div className="notification-footer">
        <button className="mark-all-read">Mark all as read</button>
        <button className="view-all">View all</button>
      </div>
    </div>
  );
};

export default NotificationPanel;