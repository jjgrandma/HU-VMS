// src/pages/driver/components/NotificationPanel.jsx
import React, { useState } from 'react';
import './NotificationPanel.css';

const NotificationPanel = ({ 
  notifications = [], 
  onClose, 
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onRefresh,
  isLoading = false,
  isFullPage = false // ← NEW PROP: true for full page, false for dropdown
}) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Group notifications by date
  const groupNotificationsByDate = (notifications) => {
    const groups = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    notifications.forEach(notif => {
      const date = new Date(notif.timestamp || notif.time).toDateString();
      let groupKey = 'Older';
      
      if (date === today) groupKey = 'Today';
      else if (date === yesterday) groupKey = 'Yesterday';
      else groupKey = new Date(notif.timestamp || notif.time).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(notif);
    });

    return groups;
  };

  const getNotificationIcon = (type) => {
    const icons = {
      info: { icon: 'ℹ️', bg: '#e3f2fd', color: '#1976d2', label: 'Info' },
      warning: { icon: '⚠️', bg: '#fff3e0', color: '#f57c00', label: 'Alert' },
      success: { icon: '✅', bg: '#e8f5e8', color: '#2e7d32', label: 'Success' },
      error: { icon: '❌', bg: '#ffebee', color: '#c62828', label: 'Error' },
      trip: { icon: '🚗', bg: '#e8eaf6', color: '#3f51b5', label: 'Trip' },
      earnings: { icon: '💰', bg: '#f3e5f5', color: '#7b1fa2', label: 'Earnings' },
      vehicle: { icon: '🚙', bg: '#e0f2f1', color: '#00695c', label: 'Vehicle' },
      maintenance: { icon: '🔧', bg: '#fff3e0', color: '#e65100', label: 'Maintenance' },
      reminder: { icon: '⏰', bg: '#f3e5f5', color: '#6a1b9a', label: 'Reminder' },
      message: { icon: '💬', bg: '#e1f5fe', color: '#01579b', label: 'Message' }
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
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Filter and sort notifications
  const filteredNotifications = notifications
    .filter(n => {
      if (filter !== 'all' && n.type !== filter) return false;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return n.message?.toLowerCase().includes(searchLower) ||
               n.title?.toLowerCase().includes(searchLower);
      }
      return true;
    })
    .sort((a, b) => {
      const timeA = new Date(a.timestamp || a.time).getTime();
      const timeB = new Date(b.timestamp || b.time).getTime();
      return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
    });

  const groupedNotifications = groupNotificationsByDate(filteredNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id) => {
    if (onMarkRead) onMarkRead(id);
  };

  const handleMarkAllRead = () => {
    if (onMarkAllRead) onMarkAllRead();
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (onDelete) onDelete(id);
  };

  const handleRefresh = () => {
    if (onRefresh) onRefresh();
  };

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'trip', label: 'Trips' },
    { value: 'warning', label: 'Alerts' },
    { value: 'earnings', label: 'Earnings' },
    { value: 'vehicle', label: 'Vehicle' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'message', label: 'Messages' }
  ];

  // If it's a full page, wrap in page container
  if (isFullPage) {
    return (
      <div className="notification-page">
        <div className="notification-page-header">
          <h1>Notifications</h1>
          <div className="header-actions">
            <button className="settings-btn" onClick={handleRefresh}>
              <span>🔄</span> Refresh
            </button>
            <button className="settings-btn" onClick={() => alert('Settings')}>
              <span>⚙️</span> Settings
            </button>
          </div>
        </div>
        <div className="notification-page-content">
          {/* Reuse the same panel structure but without absolute positioning */}
          <div className="notification-panel notification-panel-page">
            {/* Search Bar */}
            <div className="notification-search">
              <input
                type="text"
                className="notification-search-input"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Chips */}
            <div className="notification-filter-bar">
              <div className="notification-filter-chips">
                {filterOptions.map(option => (
                  <button
                    key={option.value}
                    className={`notification-filter-chip ${filter === option.value ? 'active' : ''}`}
                    onClick={() => setFilter(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <button
                className="notification-sort-btn"
                onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
                title={`Sort by ${sortBy === 'newest' ? 'oldest' : 'newest'}`}
              >
                {sortBy === 'newest' ? '↓' : '↑'}
              </button>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="notification-filter-bar">
              <button
                className="notification-filter-chip"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide Filters' : 'More Filters'} ⚙️
              </button>
              <button className="notification-sort-btn" onClick={handleRefresh} title="Refresh">
                🔄
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="notification-advanced-filters">
                <select className="notification-filter-select" defaultValue="">
                  <option value="">All types</option>
                  <option value="unread">Unread only</option>
                  <option value="read">Read only</option>
                </select>
              </div>
            )}

            {/* Notifications List */}
            <div className="notification-list notification-list-page">
              {isLoading ? (
                <div className="notification-loading">Loading...</div>
              ) : filteredNotifications.length === 0 ? (
                <div className="notification-empty">
                  <span className="notification-empty-icon">🔔</span>
                  <p className="notification-empty-text">No notifications to show</p>
                  {searchTerm && (
                    <button className="notification-clear-search" onClick={() => setSearchTerm('')}>
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                Object.entries(groupedNotifications).map(([date, items]) => (
                  <div key={date} className="notification-date-group">
                    <div className="notification-date-header">{date}</div>
                    {items.map(notification => {
                      const iconStyle = getNotificationIcon(notification.type);
                      return (
                        <div 
                          key={notification.id} 
                          className={`notification-item ${!notification.read ? 'unread' : ''}`}
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <div className="notification-icon-wrapper" style={{ backgroundColor: iconStyle.bg }}>
                            <span style={{ color: iconStyle.color }}>{iconStyle.icon}</span>
                          </div>
                          <div className="notification-content">
                            {notification.title && (
                              <div className="notification-title-row">
                                <span className="notification-item-title">{notification.title}</span>
                                <span className="notification-type-label" style={{ color: iconStyle.color }}>
                                  {iconStyle.label}
                                </span>
                              </div>
                            )}
                            <p className="notification-message">{notification.message}</p>
                            <div className="notification-time">
                              <span>⏱️</span>
                              <span>{formatTime(notification.timestamp || notification.time)}</span>
                            </div>
                          </div>
                          {!notification.read && <span className="notification-unread-dot"></span>}
                          <button
                            className="notification-delete-btn"
                            onClick={(e) => handleDelete(notification.id, e)}
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="notification-footer">
              <button className="notification-mark-all-btn" onClick={handleMarkAllRead}>
                Mark all as read
              </button>
              <button className="notification-settings-btn" onClick={() => alert('Notification settings')} title="Settings">
                ⚙️
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original dropdown version (for header bell)
  return (
    <div className="notification-panel notification-panel-dropdown">
      {/* Header */}
      <div className="notification-header">
        <div className="notification-header-title">
          <h3 className="notification-title">Notifications</h3>
          {unreadCount > 0 && (
            <span className="notification-unread-badge">{unreadCount} new</span>
          )}
        </div>
        <button className="notification-close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* Search Bar */}
      <div className="notification-search">
        <input
          type="text"
          className="notification-search-input"
          placeholder="Search notifications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter Chips */}
      <div className="notification-filter-bar">
        <div className="notification-filter-chips">
          {filterOptions.map(option => (
            <button
              key={option.value}
              className={`notification-filter-chip ${filter === option.value ? 'active' : ''}`}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button
          className="notification-sort-btn"
          onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
          title={`Sort by ${sortBy === 'newest' ? 'oldest' : 'newest'}`}
        >
          {sortBy === 'newest' ? '↓' : '↑'}
        </button>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="notification-filter-bar">
        <button
          className="notification-filter-chip"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide Filters' : 'More Filters'} ⚙️
        </button>
        <button className="notification-sort-btn" onClick={handleRefresh} title="Refresh">
          🔄
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="notification-advanced-filters">
          <select className="notification-filter-select" defaultValue="">
            <option value="">All types</option>
            <option value="unread">Unread only</option>
            <option value="read">Read only</option>
          </select>
        </div>
      )}

      {/* Notifications List */}
      <div className="notification-list">
        {isLoading ? (
          <div className="notification-loading">Loading...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="notification-empty">
            <span className="notification-empty-icon">🔔</span>
            <p className="notification-empty-text">No notifications to show</p>
            {searchTerm && (
              <button className="notification-clear-search" onClick={() => setSearchTerm('')}>
                Clear search
              </button>
            )}
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([date, items]) => (
            <div key={date} className="notification-date-group">
              <div className="notification-date-header">{date}</div>
              {items.map(notification => {
                const iconStyle = getNotificationIcon(notification.type);
                return (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="notification-icon-wrapper" style={{ backgroundColor: iconStyle.bg }}>
                      <span style={{ color: iconStyle.color }}>{iconStyle.icon}</span>
                    </div>
                    <div className="notification-content">
                      {notification.title && (
                        <div className="notification-title-row">
                          <span className="notification-item-title">{notification.title}</span>
                          <span className="notification-type-label" style={{ color: iconStyle.color }}>
                            {iconStyle.label}
                          </span>
                        </div>
                      )}
                      <p className="notification-message">{notification.message}</p>
                      <div className="notification-time">
                        <span>⏱️</span>
                        <span>{formatTime(notification.timestamp || notification.time)}</span>
                      </div>
                    </div>
                    {!notification.read && <span className="notification-unread-dot"></span>}
                    <button
                      className="notification-delete-btn"
                      onClick={(e) => handleDelete(notification.id, e)}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="notification-footer">
        <button className="notification-mark-all-btn" onClick={handleMarkAllRead}>
          Mark all as read
        </button>
        <button className="notification-settings-btn" onClick={() => alert('Notification settings')} title="Settings">
          ⚙️
        </button>
      </div>
    </div>
  );
};

export default NotificationPanel;