import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getVehicleUsageReport, getDriverActivityReport, sendReport, getReportRequests, updateReportRequest } from '../api/api';
import './NotificationPanel.css';

const NotificationPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);

  // Load real report requests from DB and merge into notifications
  useEffect(() => {
    if (!isOpen) return;
    getReportRequests()
      .then(requests => {
        const mapped = requests.map(r => ({
          id: r._id,
          type: 'report_request',
          role: 'Transport Officer',
          username: r.requestedBy,
          fullName: r.requestedByName || r.requestedBy,
          reportType: r.reportType,
          period: r.period,
          message: r.message || `Requested ${r.reportType.replace('_', ' ')} report`,
          timestamp: new Date(r.createdAt).toLocaleString(),
          status: r.status === 'resolved' ? 'resolved' : r.status === 'rejected' ? 'rejected' : 'pending',
          priority: 'medium',
          avatar: '👩‍💼',
          dbId: r._id,
        }));
        setNotifications(prev => {
          // Remove old DB-sourced report_requests, keep static ones
          const statics = prev.filter(n => !n.dbId);
          return [...statics, ...mapped];
        });
      })
      .catch(err => console.warn('Could not load report requests:', err));
  }, [isOpen]);

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

  // Build and return a jsPDF doc from real data rows/columns
  const buildPDF = (reportType, requesterName, rows, columns) => {
    const doc = new jsPDF();
    const now = new Date().toLocaleString();
    const title = reportType === 'vehicle_usage' ? 'Vehicle Usage Report' : 'Driver Activity Report';

    // Header
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Haramaya University — VMS', 14, 12);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(title, 14, 22);

    // Meta
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.text(`Generated: ${now}`, 14, 36);
    doc.text(`Requested by: ${requesterName}`, 14, 42);

    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 50,
      theme: 'grid',
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 245, 255] },
      styles: { fontSize: 8, cellPadding: 3 },
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('HU-VMS Confidential', 14, doc.internal.pageSize.height - 8);

    return { doc, title };
  };

  // Handle Generate Report — fetches real backend data, builds PDF, auto-downloads
  const handleGenerateReport = async (id, reportType, requesterName) => {
    try {
      let columns, rows;

      if (reportType === 'vehicle_usage') {
        const data = await getVehicleUsageReport();
        columns = ['Model', 'Plate', 'Type', 'Capacity', 'Status', 'Trips', 'Mileage', 'Fuel', 'Driver'];
        rows = data.map(v => [v.model, v.plateNumber, v.type, v.capacity, v.status, v.trips, v.mileage, v.fuelLevel, v.driver]);
      } else {
        const data = await getDriverActivityReport();
        columns = ['Name', 'Employee ID', 'Phone', 'License', 'Status', 'Vehicle', 'Trips', 'Rating'];
        rows = data.map(d => [d.name, d.employeeId, d.phone, d.licenseNumber, d.status, d.assignedVehicle, d.totalTrips, d.rating]);
      }

      const { doc, title } = buildPDF(reportType, requesterName, rows, columns);
      const filename = `${reportType}_${Date.now()}.pdf`;
      doc.save(filename);

      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);

      setNotifications(notifications.map(notif =>
        notif.id === id ? {
          ...notif,
          status: 'resolved',
          resolvedData: {
            action: 'Report generated',
            reportUrl: blobUrl,
            reportName: title,
            filename,
            reportType,
            rows,
            columns,
          }
        } : notif
      ));
      setExpandedNotif(id);
      // Mark DB request as resolved
      const notif = notifications.find(n => n.id === id);
      if (notif?.dbId) {
        updateReportRequest(notif.dbId, { status: 'resolved' }).catch(() => {});
      }
    } catch (err) {
      alert(`Failed to generate report: ${err.message}`);
    }
  };

  // Handle Download Report — re-triggers browser download from blob URL
  const handleDownloadReport = (reportUrl, filename) => {
    const a = document.createElement('a');
    a.href = reportUrl;
    a.download = filename || 'report.pdf';
    a.click();
  };

  // Handle Send Report — saves to DB + downloads a copy for the officer
  const handleSendReport = async (reportUrl, username, filename, resolvedData) => {
    try {
      await sendReport({
        reportType: resolvedData.reportType,
        reportName: resolvedData.reportName,
        sentTo: username,
        data: resolvedData.rows || [],
        columns: resolvedData.columns || [],
      });
    } catch (e) {
      console.warn('Could not persist report to DB:', e.message);
    }
    const a = document.createElement('a');
    a.href = reportUrl;
    a.download = `FOR_${username}_${filename || 'report.pdf'}`;
    a.click();
    alert(`✅ Report sent to ${username}`);
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
                        <p><strong>Report Type:</strong> {notif.reportType?.replace(/_/g, ' ').toUpperCase()}</p>
                        {notif.period && <p><strong>Period:</strong> {notif.period.charAt(0).toUpperCase() + notif.period.slice(1)}</p>}
                        <p><strong>Requested by:</strong> {notif.fullName} ({notif.role})</p>
                        <div className="action-buttons">
                          <button 
                            className="btn-action btn-generate"
                            onClick={() => handleGenerateReport(notif.id, notif.reportType, notif.fullName)}
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
                            onClick={() => handleDownloadReport(notif.resolvedData.reportUrl, notif.resolvedData.filename)}
                          >
                            📥 Download Report
                          </button>
                          <button 
                            className="btn-action btn-send"
                            onClick={() => handleSendReport(notif.resolvedData.reportUrl, notif.username, notif.resolvedData.filename, notif.resolvedData)}
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