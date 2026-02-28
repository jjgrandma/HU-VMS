import React from 'react';
import './Notifications.css';

const Notifications = ({ notifications = [], onMarkAsRead, onMarkAllAsRead }) => {
  const getIcon = (type) => {
    switch(type) {
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      default: return '🔔';
    }
  };

  const getBgClass = (type, read) => {
    if (read) return '';
    switch(type) {
      case 'success': return 'notification-success';
      case 'info': return 'notification-info';
      case 'warning': return 'notification-warning';
      default: return 'notification-default';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={onMarkAllAsRead} className="mark-all-btn">
            <span>✓</span>
            Mark All as Read
          </button>
        )}
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-notifications">
            <span className="empty-icon">🔔</span>
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${getBgClass(notification.type, notification.read)} ${!notification.read ? 'unread' : ''}`}
              onClick={() => !notification.read && onMarkAsRead && onMarkAsRead(notification.id)}
            >
              <div className="notification-icon">
                {getIcon(notification.type)}
              </div>
              <div className="notification-content">
                <div className="notification-header">
                  <h3>{notification.title}</h3>
                  <span className="notification-time">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p>{notification.message}</p>
              </div>
              {!notification.read && (
                <span className="unread-dot"></span>
              )}
            </div>
          ))
        )}
      </div>

      <div className="notifications-summary">
        <div className="summary-item">
          <span>Total</span>
          <span className="summary-value">{notifications.length}</span>
        </div>
        <div className="summary-item">
          <span>Unread</span>
          <span className="summary-value unread">{unreadCount}</span>
        </div>
        <div className="summary-item">
          <span>Read</span>
          <span className="summary-value">{notifications.length - unreadCount}</span>
        </div>
      </div>
    </div>
  );
};

export default Notifications;