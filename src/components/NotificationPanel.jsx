import { useState } from 'react';
import './NotificationPanel.css';

const NotificationPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'access_denied',
      role: 'Driver',
      username: 'john_driver',
      fullName: 'John Smith',
      message: 'Cannot access account - Login failed multiple times',
      timestamp: '5 minutes ago',
      status: 'pending',
      priority: 'high',
      avatar: '👨‍✈️'
    },
    {
      id: 2,
      type: 'password_reset',
      role: 'User',
      username: 'jane_user',
      fullName: 'Jane Doe',
      requestType: 'password',
      message: 'Password reset request',
      timestamp: '15 minutes ago',
      status: 'pending',
      priority: 'medium',
      avatar: '👩'
    },
    {
      id: 3,
      type: 'username_reset',
      role: 'Driver',
      username: 'mike_driver',
      fullName: 'Mike Johnson',
      requestType: 'both',
      message: 'Username and Password reset request',
      timestamp: '1 hour ago',
      status: 'pending',
      priority: 'high',
      avatar: '👨‍✈️'
    },
    {
      id: 4,
      type: 'report_request',
      role: 'Transport Officer',
      username: 'sarah_officer',
      fullName: 'Sarah Williams',
      reportType: 'vehicle_usage',
      message: 'Requested Vehicle Usage Report for March 2024',
      timestamp: '2 hours ago',
      status: 'pending',
      priority: 'medium',
      avatar: '👩‍💼'
    },
    {
      id: 5,
      type: 'report_request',
      role: 'Transport Officer',
      username: 'david_officer',
      fullName: 'David Brown',
      reportType: 'driver_activity',
      message: 'Requested Driver Activity Report',
      timestamp: '3 hours ago',
      status: 'resolved',
      priority: 'low',
      avatar: '👨‍💼',
      resolvedData: {
        reportUrl: '/reports/driver-activity-2024.pdf'
      }
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNotif, setExpandedNotif] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(null);
  const [tempPassword, setTempPassword] = useState('');

  // Generate temporary password
  const generateTempPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Handle Access Denied - Unlock Account
  const handleUnlockAccount = (id, username) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { 
        ...notif, 
        status: 'resolved',
        resolvedData: {
          action: 'Account unlocked',
          message: `Account ${username} has been unlocked successfully`
        }
      } : notif
    ));
    alert(`✅ Account ${username} unlocked successfully!`);
  };

  // Handle Reset Login Session
  const handleResetSession = (id, username) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { 
        ...notif, 
        status: 'resolved',
        resolvedData: {
          action: 'Session reset',
          message: `Login session for ${username} has been reset`
        }
      } : notif
    ));
    alert(`✅ Login session for ${username} reset successfully!`);
  };

  // Handle Approve Credential Reset
  const handleApproveCredentialReset = (id, username, requestType) => {
    const newPassword = generateTempPassword();
    setTempPassword(newPassword);
    
    setNotifications(notifications.map(notif => 
      notif.id === id ? { 
        ...notif, 
        status: 'approved',
        resolvedData: {
          action: 'Credentials reset',
          tempPassword: newPassword,
          requestType: requestType,
          message: `Temporary password generated and sent to user`
        }
      } : notif
    ));
    
    setExpandedNotif(id);
  };

  // Handle Reject with Reason
  const handleRejectWithReason = (id) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setNotifications(notifications.map(notif => 
      notif.id === id ? { 
        ...notif, 
        status: 'rejected',
        rejectionReason: rejectionReason
      } : notif
    ));
    
    setRejectionReason('');
    setShowRejectInput(null);
    alert('✅ Request rejected and user notified');
  };

  // Handle Generate Report
  const handleGenerateReport = (id, reportType) => {
    const reportName = reportType.replace('_', ' ').toUpperCase();
    const reportUrl = `/reports/${reportType}-${Date.now()}.pdf`;
    
    setNotifications(notifications.map(notif => 
      notif.id === id ? { 
        ...notif, 
        status: 'resolved',
        resolvedData: {
          action: 'Report generated',
          reportUrl: reportUrl,
          reportName: reportName
        }
      } : notif
    ));
    
    setExpandedNotif(id);
    alert(`✅ ${reportName} Report generated successfully!`);
  };

  // Handle Send Report
  const handleSendReport = (reportUrl, username) => {
    alert(`✅ Report sent to ${username} successfully!`);
  };

  // Handle Download Report
  const handleDownloadReport = (reportUrl) => {
    alert(`📥 Downloading report: ${reportUrl}`);
    // In real implementation: window.open(reportUrl, '_blank');
  };

  const getIcon = (type) => {
    switch(type) {
      case 'access_denied': return '🔒';
      case 'password_reset': return '🔑';
      case 'username_reset': return '👤';
      case 'report_request': return '📊';
      default: return '📬';
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'Driver': return '#3b82f6';
      case 'User': return '#10b981';
      case 'Transport Officer': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'resolved': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  // Filter notifications
  let filteredNotifications = notifications;
  
  if (filter !== 'all') {
    filteredNotifications = filteredNotifications.filter(n => n.status === filter);
  }
  
  if (searchQuery) {
    filteredNotifications = filteredNotifications.filter(n => 
      n.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const pendingCount = notifications.filter(n => n.status === 'pending').length;
  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="notification-overlay" onClick={onClose}>
      <div className="notification-panel" onClick={(e) => e.stopPropagation()}>
        <div className="notification-header">
          <div>
            <h2>🔔 Notifications</h2>
            <span className="notification-count">
              {pendingCount} pending · {unreadCount} unread
            </span>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Search and Filters Combined */}
        <div className="notification-controls">
          <input
            type="text"
            placeholder="🔍 Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button 
              className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
              onClick={() => setFilter('approved')}
            >
              Approved
            </button>
            <button 
              className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilter('rejected')}
            >
              Rejected
            </button>
            <button 
              className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
              onClick={() => setFilter('resolved')}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="notification-list">
          {filteredNotifications.map(notif => (
            <div 
              key={notif.id} 
              className={`notification-item ${notif.status} ${expandedNotif === notif.id ? 'expanded' : ''}`}
              style={{ borderLeftColor: getStatusColor(notif.status) }}
            >
              {/* Compact Row View */}
              <div 
                className="notification-row"
                onClick={() => setExpandedNotif(expandedNotif === notif.id ? null : notif.id)}
              >
                <div className="row-left">
                  <div className="user-avatar-small">{notif.avatar}</div>
                  <div className="row-info">
                    <span className="row-name">{notif.fullName}</span>
                    <span className="row-meta">
                      <span 
                        className="user-role-small"
                        style={{ backgroundColor: getRoleColor(notif.role) }}
                      >
                        {notif.role}
                      </span>
                      <span className="row-username">@{notif.username}</span>
                    </span>
                  </div>
                </div>
                
                <div className="row-right">
                  <span className="notif-icon-small">{getIcon(notif.type)}</span>
                  <span 
                    className="status-badge-small"
                    style={{ backgroundColor: getStatusColor(notif.status) }}
                  >
                    {notif.status}
                  </span>
                  <span className="notif-time-small">⏰ {notif.timestamp}</span>
                  <span className="expand-icon">{expandedNotif === notif.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded Details View */}
              {expandedNotif === notif.id && (
                <div className="notification-expanded">
                  {/* Message Section */}
                  <div className="expanded-message">
                    <h4>📩 Message</h4>
                    <p>{notif.message}</p>
                  </div>

                  {/* Action Section */}
                  <div className="expanded-actions">
                    {/* Access Denied Details */}
                    {notif.type === 'access_denied' && notif.status === 'pending' && (
                      <div className="action-section">
                        <h4>🔒 Account Access Issue</h4>
                        <p><strong>Username:</strong> {notif.username}</p>
                        <p><strong>Role:</strong> {notif.role}</p>
                        <div className="action-buttons">
                          <button 
                            className="btn-action btn-unlock"
                            onClick={() => handleUnlockAccount(notif.id, notif.username)}
                          >
                            🔓 Unlock Account
                          </button>
                          <button 
                            className="btn-action btn-reset"
                            onClick={() => handleResetSession(notif.id, notif.username)}
                          >
                            🔄 Reset Session
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Credential Reset Details */}
                    {(notif.type === 'password_reset' || notif.type === 'username_reset') && notif.status === 'pending' && (
                      <div className="action-section">
                        <h4>🔑 Credential Reset Request</h4>
                        <p><strong>Username:</strong> {notif.username}</p>
                        <p><strong>Request Type:</strong> {notif.requestType === 'both' ? 'Username & Password' : notif.requestType}</p>
                        <div className="action-buttons">
                          <button 
                            className="btn-action btn-approve"
                            onClick={() => handleApproveCredentialReset(notif.id, notif.username, notif.requestType)}
                          >
                            ✅ Approve & Reset
                          </button>
                          <button 
                            className="btn-action btn-reject"
                            onClick={() => setShowRejectInput(notif.id)}
                          >
                            ❌ Reject
                          </button>
                        </div>
                        
                        {showRejectInput === notif.id && (
                          <div className="reject-section">
                            <textarea
                              placeholder="Enter rejection reason..."
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              rows="3"
                            />
                            <button 
                              className="btn-submit-reject"
                              onClick={() => handleRejectWithReason(notif.id)}
                            >
                              Send Rejection
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Approved Credential Reset - Show Temp Password */}
                    {notif.status === 'approved' && notif.resolvedData && (
                      <div className="success-section">
                        <h4>✅ Request Approved</h4>
                        <div className="temp-password-box">
                          <p><strong>Temporary Password:</strong></p>
                          <code className="temp-password">{notif.resolvedData.tempPassword}</code>
                          <button 
                            className="btn-copy"
                            onClick={() => {
                              navigator.clipboard.writeText(notif.resolvedData.tempPassword);
                              alert('Password copied to clipboard!');
                            }}
                          >
                            📋 Copy
                          </button>
                        </div>
                        <p className="success-message">✉️ Confirmation sent to user</p>
                      </div>
                    )}

                    {/* Report Request Details */}
                    {notif.type === 'report_request' && notif.status === 'pending' && (
                      <div className="action-section">
                        <h4>📊 Report Request</h4>
                        <p><strong>Report Type:</strong> {notif.reportType?.replace('_', ' ').toUpperCase()}</p>
                        <p><strong>Requested by:</strong> {notif.fullName} ({notif.role})</p>
                        <div className="action-buttons">
                          <button 
                            className="btn-action btn-generate"
                            onClick={() => handleGenerateReport(notif.id, notif.reportType)}
                          >
                            📄 Generate Report
                          </button>
                          <button 
                            className="btn-action btn-reject"
                            onClick={() => setShowRejectInput(notif.id)}
                          >
                            ❌ Reject Request
                          </button>
                        </div>
                        
                        {showRejectInput === notif.id && (
                          <div className="reject-section">
                            <textarea
                              placeholder="Enter rejection reason..."
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              rows="3"
                            />
                            <button 
                              className="btn-submit-reject"
                              onClick={() => handleRejectWithReason(notif.id)}
                            >
                              Send Rejection
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Report Generated - Show Download */}
                    {notif.status === 'resolved' && notif.resolvedData?.reportUrl && (
                      <div className="success-section">
                        <h4>✅ Report Generated</h4>
                        <p><strong>{notif.resolvedData.reportName}</strong></p>
                        <div className="action-buttons">
                          <button 
                            className="btn-action btn-download"
                            onClick={() => handleDownloadReport(notif.resolvedData.reportUrl)}
                          >
                            📥 Download Report
                          </button>
                          <button 
                            className="btn-action btn-send"
                            onClick={() => handleSendReport(notif.resolvedData.reportUrl, notif.username)}
                          >
                            📧 Send to Officer
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Rejected - Show Reason */}
                    {notif.status === 'rejected' && notif.rejectionReason && (
                      <div className="rejected-section">
                        <h4>❌ Request Rejected</h4>
                        <p><strong>Reason:</strong></p>
                        <p className="rejection-reason">{notif.rejectionReason}</p>
                      </div>
                    )}

                    {/* Resolved - Show Action */}
                    {notif.status === 'resolved' && notif.resolvedData && !notif.resolvedData.reportUrl && (
                      <div className="success-section">
                        <h4>✅ {notif.resolvedData.action}</h4>
                        <p>{notif.resolvedData.message}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {filteredNotifications.length === 0 && (
            <div className="no-notifications">
              <p>📭 No notifications found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;