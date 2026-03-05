import { useState } from 'react';
import './NotificationPanel.css';

const NotificationPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'report_request',
      from: 'Transport Officer - John Smith',
      message: 'Requested Vehicle Trip Report for March 2024',
      timestamp: '5 minutes ago',
      status: 'pending',
      priority: 'high'
    },
    {
      id: 2,
      type: 'password_reset',
      from: 'User - Jane Doe',
      message: 'Password reset request',
      timestamp: '15 minutes ago',
      status: 'pending',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'username_recovery',
      from: 'Driver - Mike Johnson',
      message: 'Username recovery request',
      timestamp: '1 hour ago',
      status: 'pending',
      priority: 'low'
    },
    {
      id: 4,
      type: 'system_issue',
      from: 'Transport Officer - Sarah Williams',
      message: 'System access denied - Unable to view tracking page',
      timestamp: '2 hours ago',
      status: 'pending',
      priority: 'high'
    },
    {
      id: 5,
      type: 'report_request',
      from: 'Transport Officer - David Brown',
      message: 'Requested Driver Performance Report',
      timestamp: '3 hours ago',
      status: 'resolved',
      priority: 'medium'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [comment, setComment] = useState('');

  const handleApprove = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, status: 'resolved' } : notif
    ));
    setSelectedNotification(null);
    alert('Request approved and processed');
  };

  const handleReject = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, status: 'rejected' } : notif
    ));
    setSelectedNotification(null);
    alert('Request rejected');
  };

  const handleAddComment = (id) => {
    if (!comment.trim()) {
      alert('Please enter a comment');
      return;
    }
    
    setNotifications(notifications.map(notif => 
      notif.id === id ? { 
        ...notif, 
        comments: [...(notif.comments || []), {
          text: comment,
          timestamp: 'Just now',
          author: 'Admin'
        }]
      } : notif
    ));
    setComment('');
    alert('Comment added successfully');
  };

  const handleViewDetails = (notif) => {
    setSelectedNotification(notif);
    setComment('');
  };

  const getIcon = (type) => {
    switch(type) {
      case 'report_request': return '📊';
      case 'password_reset': return '🔑';
      case 'username_recovery': return '👤';
      case 'system_issue': return '⚠️';
      default: return '📬';
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.status === filter);

  const pendingCount = notifications.filter(n => n.status === 'pending').length;

  if (!isOpen) return null;

  return (
    <div className="notification-overlay" onClick={onClose}>
      <div className="notification-panel" onClick={(e) => e.stopPropagation()}>
        <div className="notification-header">
          <div>
            <h2>Notifications</h2>
            <span className="notification-count">{pendingCount} pending</span>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="notification-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({pendingCount})
          </button>
          <button 
            className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
            onClick={() => setFilter('resolved')}
          >
            Resolved
          </button>
        </div>

        <div className="notification-list">
          {filteredNotifications.map(notif => (
            <div key={notif.id} className={`notification-item ${notif.priority}`}>
              <div className="notification-icon">{getIcon(notif.type)}</div>
              <div className="notification-content">
                <div className="notification-from">{notif.from}</div>
                <div className="notification-message">{notif.message}</div>
                <div className="notification-meta">
                  <span className="notification-time">{notif.timestamp}</span>
                  <span className={`notification-status ${notif.status}`}>
                    {notif.status}
                  </span>
                </div>
                {notif.comments && notif.comments.length > 0 && (
                  <div className="notification-comments">
                    <div className="comments-header">💬 {notif.comments.length} comment(s)</div>
                  </div>
                )}
              </div>
              <div className="notification-actions">
                <button 
                  className="view-btn"
                  onClick={() => handleViewDetails(notif)}
                  title="View details and add comment"
                >
                  👁️
                </button>
                {notif.status === 'pending' && (
                  <>
                    <button 
                      className="approve-btn"
                      onClick={() => handleApprove(notif.id)}
                      title="Approve"
                    >
                      ✓
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => handleReject(notif.id)}
                      title="Reject"
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {filteredNotifications.length === 0 && (
            <div className="no-notifications">
              <p>No notifications</p>
            </div>
          )}
        </div>

        {selectedNotification && (
          <div className="notification-detail-overlay" onClick={() => setSelectedNotification(null)}>
            <div className="notification-detail-panel" onClick={(e) => e.stopPropagation()}>
              <div className="detail-header">
                <h3>Notification Details</h3>
                <button className="close-btn" onClick={() => setSelectedNotification(null)}>✕</button>
              </div>

              <div className="detail-content">
                <div className="detail-info">
                  <div className="detail-icon">{getIcon(selectedNotification.type)}</div>
                  <div>
                    <div className="detail-from">{selectedNotification.from}</div>
                    <div className="detail-message">{selectedNotification.message}</div>
                    <div className="detail-meta">
                      <span className="detail-time">{selectedNotification.timestamp}</span>
                      <span className={`detail-status ${selectedNotification.status}`}>
                        {selectedNotification.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="comments-section">
                  <h4>Comments & Responses</h4>
                  {selectedNotification.comments && selectedNotification.comments.length > 0 ? (
                    <div className="comments-list">
                      {selectedNotification.comments.map((comment, index) => (
                        <div key={index} className="comment-item">
                          <div className="comment-author">{comment.author}</div>
                          <div className="comment-text">{comment.text}</div>
                          <div className="comment-time">{comment.timestamp}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-comments">No comments yet</p>
                  )}
                </div>

                <div className="add-comment-section">
                  <textarea
                    className="comment-input"
                    placeholder="Add a comment or response..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="3"
                  />
                  <div className="comment-actions">
                    <button 
                      className="btn-submit-comment"
                      onClick={() => handleAddComment(selectedNotification.id)}
                    >
                      💬 Add Comment
                    </button>
                    {selectedNotification.status === 'pending' && (
                      <>
                        <button 
                          className="btn-approve"
                          onClick={() => handleApprove(selectedNotification.id)}
                        >
                          ✓ Approve
                        </button>
                        <button 
                          className="btn-reject"
                          onClick={() => handleReject(selectedNotification.id)}
                        >
                          ✕ Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;