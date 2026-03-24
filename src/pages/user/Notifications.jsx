import React, { useState, useEffect } from 'react';
import { getRequests, getComplaints, getCurrentUser } from '../../api/api';
import './Notifications.css';

// Build notifications from requests + complaints
const buildNotifications = (requests, complaints, username) => {
  const notifs = [];

  requests.forEach(req => {
    const base = {
      id: `req-${req._id}`,
      createdAt: req.updatedAt || req.createdAt,
      read: false,
    };

    if (req.status === 'approved') {
      notifs.push({
        ...base,
        type: 'success',
        title: 'Request Approved',
        message: `Your request to "${req.destination}" has been approved.${req.assignedVehicle ? ` Vehicle: ${req.assignedVehicle}.` : ''}${req.assignedDriver ? ` Driver: ${req.assignedDriver}.` : ''}`,
      });
    } else if (req.status === 'rejected') {
      notifs.push({
        ...base,
        type: 'warning',
        title: 'Request Rejected',
        message: `Your request to "${req.destination}" was rejected.${req.rejectionReason ? ` Reason: ${req.rejectionReason}` : ''}`,
      });
    } else if (req.status === 'pending') {
      notifs.push({
        ...base,
        type: 'info',
        title: 'Request Submitted',
        message: `Your vehicle request to "${req.destination}" is under review.`,
      });
    } else if (req.status === 'completed') {
      notifs.push({
        ...base,
        type: 'success',
        title: 'Trip Completed',
        message: `Your trip to "${req.destination}" has been marked as completed.`,
      });
    }
  });

  complaints
    .filter(c => c.senderUsername === username)
    .forEach(c => {
      const base = {
        id: `cmp-${c._id}`,
        createdAt: c.updatedAt || c.createdAt,
        read: false,
      };
      if (c.status === 'Resolved') {
        notifs.push({
          ...base,
          type: 'success',
          title: 'Complaint Resolved',
          message: `Your complaint (${c.category}) has been resolved.${c.resolutionNotes ? ` Notes: ${c.resolutionNotes}` : ''}`,
        });
      } else {
        notifs.push({
          ...base,
          type: 'info',
          title: 'Complaint Submitted',
          message: `Your complaint (${c.category}) is being reviewed.`,
        });
      }
    });

  // Sort newest first
  return notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const Notifications = () => {
  const currentUser = getCurrentUser();
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('notif_read') || '[]'); } catch { return []; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.username) { setLoading(false); return; }
    Promise.all([
      getRequests({ requesterUsername: currentUser.username }),
      getComplaints(),
    ]).then(([reqs, complaints]) => {
      setNotifications(buildNotifications(reqs, complaints, currentUser.username));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markAsRead = (id) => {
    const updated = [...readIds, id];
    setReadIds(updated);
    localStorage.setItem('notif_read', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => n.id);
    setReadIds(updated);
    localStorage.setItem('notif_read', JSON.stringify(updated));
  };

  const enriched = notifications.map(n => ({ ...n, read: readIds.includes(n.id) }));
  const unreadCount = enriched.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  };

  const getBgClass = (type, read) => {
    if (read) return '';
    switch (type) {
      case 'success': return 'notification-success';
      case 'warning': return 'notification-warning';
      case 'info': return 'notification-info';
      default: return 'notification-default';
    }
  };

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center', color: '#6b7280' }}>Loading notifications...</div>
  );

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="mark-all-btn">
            <span>✓</span> Mark All as Read
          </button>
        )}
      </div>

      <div className="notifications-list">
        {enriched.length === 0 ? (
          <div className="empty-notifications">
            <span className="empty-icon">🔔</span>
            <p>No notifications yet</p>
          </div>
        ) : (
          enriched.map((n) => (
            <div
              key={n.id}
              className={`notification-card ${getBgClass(n.type, n.read)} ${!n.read ? 'unread' : ''}`}
              onClick={() => !n.read && markAsRead(n.id)}
            >
              <div className="notification-icon">{getIcon(n.type)}</div>
              <div className="notification-content">
                <div className="notification-header">
                  <h3>{n.title}</h3>
                  <span className="notification-time">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p>{n.message}</p>
              </div>
              {!n.read && <span className="unread-dot"></span>}
            </div>
          ))
        )}
      </div>

      <div className="notifications-summary">
        <div className="summary-item"><span>Total</span><span className="summary-value">{enriched.length}</span></div>
        <div className="summary-item"><span>Unread</span><span className="summary-value unread">{unreadCount}</span></div>
        <div className="summary-item"><span>Read</span><span className="summary-value">{enriched.length - unreadCount}</span></div>
      </div>
    </div>
  );
};

export default Notifications;
