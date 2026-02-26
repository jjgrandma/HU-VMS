// src/pages/driver/components/NotificationPanel.jsx
import React, { useState, useEffect } from 'react';

const NotificationPanel = ({ 
  notifications = [], 
  onClose, 
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onRefresh,
  isLoading = false 
}) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest
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

  const styles = {
    panel: {
      position: 'absolute',
      top: '60px',
      right: '20px',
      width: '420px',
      maxWidth: 'calc(100vw - 40px)',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
      zIndex: 1000,
      overflow: 'hidden'
    },
    header: {
      padding: '20px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    title: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1e293b',
      margin: 0
    },
    unreadBadge: {
      backgroundColor: '#0D8F81',
      color: 'white',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      color: '#64748b',
      padding: '8px',
      borderRadius: '8px',
      transition: 'all 0.3s'
    },
    searchBar: {
      padding: '12px 20px',
      borderBottom: '1px solid #e2e8f0'
    },
    searchInput: {
      width: '100%',
      padding: '10px 16px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.3s'
    },
    filterBar: {
      padding: '12px 20px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    filterChips: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    filterChip: {
      padding: '6px 12px',
      border: '1px solid #e2e8f0',
      borderRadius: '20px',
      fontSize: '13px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      backgroundColor: 'transparent'
    },
    filterChipActive: {
      backgroundColor: '#0D8F81',
      borderColor: '#0D8F81',
      color: 'white'
    },
    sortBtn: {
      background: 'none',
      border: 'none',
      fontSize: '16px',
      cursor: 'pointer',
      padding: '6px',
      borderRadius: '6px',
      color: '#64748b'
    },
    notificationsList: {
      maxHeight: '500px',
      overflowY: 'auto',
      padding: '0 20px'
    },
    dateGroup: {
      marginBottom: '20px'
    },
    dateHeader: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#64748b',
      padding: '12px 0 8px',
      position: 'sticky',
      top: 0,
      backgroundColor: 'white',
      zIndex: 1
    },
    notificationItem: {
      display: 'flex',
      gap: '12px',
      padding: '12px',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      marginBottom: '4px',
      position: 'relative'
    },
    notificationUnread: {
      backgroundColor: '#f0fdf9'
    },
    iconWrapper: {
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      flexShrink: 0
    },
    content: {
      flex: 1,
      minWidth: 0
    },
    title: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#1e293b',
      margin: '0 0 4px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    message: {
      fontSize: '13px',
      color: '#64748b',
      margin: '0 0 4px',
      lineHeight: '1.4'
    },
    time: {
      fontSize: '11px',
      color: '#94a3b8',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    unreadDot: {
      width: '8px',
      height: '8px',
      backgroundColor: '#0D8F81',
      borderRadius: '50%',
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)'
    },
    deleteBtn: {
      opacity: 0,
      background: 'none',
      border: 'none',
      fontSize: '16px',
      cursor: 'pointer',
      color: '#ef4444',
      padding: '4px',
      borderRadius: '4px',
      transition: 'opacity 0.3s'
    },
    footer: {
      padding: '16px 20px',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    markAllBtn: {
      background: 'none',
      border: 'none',
      color: '#0D8F81',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      padding: '8px 12px',
      borderRadius: '6px'
    },
    settingsBtn: {
      background: 'none',
      border: 'none',
      fontSize: '18px',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '6px',
      color: '#64748b'
    },
    emptyState: {
      padding: '40px 20px',
      textAlign: 'center'
    },
    emptyIcon: {
      fontSize: '48px',
      marginBottom: '12px',
      display: 'block'
    },
    emptyText: {
      color: '#64748b',
      fontSize: '14px',
      margin: 0
    },
    loadingSpinner: {
      textAlign: 'center',
      padding: '40px',
      color: '#64748b'
    },
    advancedFilters: {
      padding: '12px 20px',
      backgroundColor: '#f8fafc',
      borderBottom: '1px solid #e2e8f0'
    },
    filterSelect: {
      padding: '8px',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      fontSize: '13px',
      outline: 'none',
      width: '100%'
    }
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

  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <h3 style={styles.title}>Notifications</h3>
          {unreadCount > 0 && (
            <span style={styles.unreadBadge}>{unreadCount} new</span>
          )}
        </div>
        <button 
          style={styles.closeBtn}
          onClick={onClose}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          ✕
        </button>
      </div>

      {/* Search Bar */}
      <div style={styles.searchBar}>
        <input
          type="text"
          placeholder="Search notifications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Filter Chips */}
      <div style={styles.filterBar}>
        <div style={styles.filterChips}>
          {filterOptions.map(option => (
            <button
              key={option.value}
              style={{
                ...styles.filterChip,
                ...(filter === option.value ? styles.filterChipActive : {})
              }}
              onClick={() => setFilter(option.value)}
              onMouseEnter={(e) => {
                if (filter !== option.value) {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== option.value) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button
          style={styles.sortBtn}
          onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
          title={`Sort by ${sortBy === 'newest' ? 'oldest' : 'newest'}`}
        >
          {sortBy === 'newest' ? '↓' : '↑'}
        </button>
      </div>

      {/* Advanced Filters Toggle */}
      <div style={styles.filterBar}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{ ...styles.filterChip, fontSize: '12px' }}
        >
          {showFilters ? 'Hide Filters' : 'More Filters'} ⚙️
        </button>
        <button
          style={styles.sortBtn}
          onClick={handleRefresh}
          title="Refresh"
        >
          🔄
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div style={styles.advancedFilters}>
          <select style={styles.filterSelect} defaultValue="">
            <option value="">All types</option>
            <option value="unread">Unread only</option>
            <option value="read">Read only</option>
          </select>
        </div>
      )}

      {/* Notifications List */}
      <div style={styles.notificationsList}>
        {isLoading ? (
          <div style={styles.loadingSpinner}>Loading...</div>
        ) : filteredNotifications.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>🔔</span>
            <p style={styles.emptyText}>No notifications to show</p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                style={{ ...styles.markAllBtn, marginTop: '12px' }}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([date, items]) => (
            <div key={date} style={styles.dateGroup}>
              <div style={styles.dateHeader}>{date}</div>
              {items.map(notification => {
                const iconStyle = getNotificationIcon(notification.type);
                return (
                  <div 
                    key={notification.id} 
                    style={{
                      ...styles.notificationItem,
                      ...(!notification.read ? styles.notificationUnread : {})
                    }}
                    onClick={() => handleMarkAsRead(notification.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = notification.read ? '#f8fafc' : '#e6f7f2';
                      e.currentTarget.querySelector('.delete-btn').style.opacity = 1;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = notification.read ? 'transparent' : '#f0fdf9';
                      e.currentTarget.querySelector('.delete-btn').style.opacity = 0;
                    }}
                  >
                    <div style={{ ...styles.iconWrapper, backgroundColor: iconStyle.bg }}>
                      <span style={{ color: iconStyle.color }}>{iconStyle.icon}</span>
                    </div>
                    <div style={styles.content}>
                      {notification.title && (
                        <div style={styles.title}>
                          <span>{notification.title}</span>
                          <span style={{ fontSize: '11px', color: iconStyle.color }}>
                            {iconStyle.label}
                          </span>
                        </div>
                      )}
                      <p style={styles.message}>{notification.message}</p>
                      <div style={styles.time}>
                        <span>⏱️</span>
                        <span>{formatTime(notification.timestamp || notification.time)}</span>
                      </div>
                    </div>
                    {!notification.read && <span style={styles.unreadDot}></span>}
                    <button
                      className="delete-btn"
                      style={styles.deleteBtn}
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
      <div style={styles.footer}>
        <button 
          style={styles.markAllBtn}
          onClick={handleMarkAllRead}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdf9'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          Mark all as read
        </button>
        <button 
          style={styles.settingsBtn}
          onClick={() => alert('Notification settings')}
          title="Settings"
        >
          ⚙️
        </button>
      </div>
    </div>
  );
};

export default NotificationPanel;