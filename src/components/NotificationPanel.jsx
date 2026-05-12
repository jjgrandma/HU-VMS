import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell, X, Search, Filter, RefreshCw, ChevronDown, ChevronUp,
  Lock, Key, User, BarChart2, Mail, Download, Send,
  CheckCircle, XCircle, AlertTriangle, Clock, Shield,
  Unlock, RotateCcw, FileText, Copy, Check, Inbox,
  Circle, Zap, Activity,
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getVehicleUsageReport, getDriverActivityReport, sendReport, getReportRequests, updateReportRequest } from '../api/api';
import './NotificationPanel.css';

// ── Helpers ───────────────────────────────────────────────
const fmt = (d) =>
  d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const TYPE_META = {
  access_denied:   { icon: Lock,      label: 'Access Denied',   color: '#ef4444', bg: '#fff1f2', border: '#fecdd3' },
  password_reset:  { icon: Key,       label: 'Password Reset',  color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  username_reset:  { icon: User,      label: 'Username Reset',  color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  report_request:  { icon: BarChart2, label: 'Report Request',  color: '#0369a1', bg: '#eff6ff', border: '#bfdbfe' },
  default:         { icon: Bell,      label: 'Notification',    color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
};

const STATUS_META = {
  pending:  { color: '#d97706', bg: '#fef3c7', border: '#fde68a',  label: 'Pending'  },
  approved: { color: '#16a34a', bg: '#dcfce7', border: '#86efac',  label: 'Approved' },
  rejected: { color: '#dc2626', bg: '#fee2e2', border: '#fca5a5',  label: 'Rejected' },
  resolved: { color: '#1d4ed8', bg: '#dbeafe', border: '#bfdbfe',  label: 'Resolved' },
};

const ROLE_META = {
  'Driver':           { color: '#1d4ed8', bg: '#dbeafe' },
  'User':             { color: '#15803d', bg: '#dcfce7' },
  'Transport Officer':{ color: '#d97706', bg: '#fef3c7' },
  'Admin':            { color: '#7c3aed', bg: '#ede9fe' },
};

function TypeIcon({ type, size = 16 }) {
  const meta = TYPE_META[type] || TYPE_META.default;
  const Icon = meta.icon;
  return (
    <span className="np-type-icon" style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
      <Icon size={size} />
    </span>
  );
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || { color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0', label: status };
  return (
    <span className="np-status-badge" style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}>
      {status === 'pending'  && <Clock size={10} />}
      {status === 'approved' && <CheckCircle size={10} />}
      {status === 'rejected' && <XCircle size={10} />}
      {status === 'resolved' && <CheckCircle size={10} />}
      {m.label}
    </span>
  );
}

function RoleBadge({ role }) {
  const m = ROLE_META[role] || { color: '#64748b', bg: '#f1f5f9' };
  return <span className="np-role-badge" style={{ background: m.bg, color: m.color }}>{role || 'Unknown'}</span>;
}

function Avatar({ name, type }) {
  const meta = TYPE_META[type] || TYPE_META.default;
  const initials = (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className="np-avatar" style={{ background: meta.bg, color: meta.color, border: `2px solid ${meta.border}` }}>
      {initials}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
const NotificationPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter]               = useState('all');
  const [search, setSearch]               = useState('');
  const [expanded, setExpanded]           = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(null);
  const [tempPassword, setTempPassword]   = useState('');
  const [copied, setCopied]               = useState(false);
  const [loading, setLoading]             = useState(false);
  const searchRef = useRef(null);

  // Load report requests from DB
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getReportRequests()
      .then(requests => {
        const mapped = requests.map(r => ({
          id: r._id,
          dbId: r._id,
          type: 'report_request',
          role: 'Transport Officer',
          username: r.requestedBy,
          fullName: r.requestedByName || r.requestedBy,
          reportType: r.reportType,
          period: r.period,
          message: r.message || `Requested ${r.reportType.replace('_', ' ')} report`,
          timestamp: r.createdAt,
          status: r.status === 'resolved' ? 'resolved' : r.status === 'rejected' ? 'rejected' : 'pending',
          priority: 'medium',
        }));
        setNotifications(prev => {
          const statics = prev.filter(n => !n.dbId);
          return [...statics, ...mapped];
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const handleUnlockAccount = (id, username) => {
    setNotifications(n => n.map(x => x.id === id ? { ...x, status: 'resolved', resolvedData: { action: 'Account unlocked', message: `Account ${username} has been unlocked` } } : x));
  };

  const handleResetSession = (id, username) => {
    setNotifications(n => n.map(x => x.id === id ? { ...x, status: 'resolved', resolvedData: { action: 'Session reset', message: `Login session for ${username} has been reset` } } : x));
  };

  const handleApproveCredentialReset = (id, username, requestType) => {
    const pw = generateTempPassword();
    setTempPassword(pw);
    setNotifications(n => n.map(x => x.id === id ? { ...x, status: 'approved', resolvedData: { action: 'Credentials reset', tempPassword: pw, requestType, message: 'Temporary password generated' } } : x));
    setExpanded(id);
  };

  const handleRejectWithReason = (id) => {
    if (!rejectionReason.trim()) return;
    setNotifications(n => n.map(x => x.id === id ? { ...x, status: 'rejected', rejectionReason } : x));
    setRejectionReason('');
    setShowRejectInput(null);
  };

  const buildPDF = (reportType, requesterName, rows, columns) => {
    const doc = new jsPDF();
    const now = new Date().toLocaleString();
    const title = reportType === 'vehicle_usage' ? 'Vehicle Usage Report' : 'Driver Activity Report';
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Haramaya University — VMS', 14, 12);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(title, 14, 22);
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.text(`Generated: ${now}`, 14, 36);
    doc.text(`Requested by: ${requesterName}`, 14, 42);
    doc.autoTable({ head: [columns], body: rows, startY: 50, theme: 'grid', headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' }, alternateRowStyles: { fillColor: [240, 245, 255] }, styles: { fontSize: 8, cellPadding: 3 } });
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('HU-VMS Confidential', 14, doc.internal.pageSize.height - 8);
    return { doc, title };
  };

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
      setNotifications(n => n.map(x => x.id === id ? { ...x, status: 'resolved', resolvedData: { action: 'Report generated', reportUrl: blobUrl, reportName: title, filename, reportType, rows, columns } } : x));
      setExpanded(id);
      const notif = notifications.find(x => x.id === id);
      if (notif?.dbId) updateReportRequest(notif.dbId, { status: 'resolved' }).catch(() => {});
    } catch (err) {
      console.error('Report generation failed:', err);
    }
  };

  const handleDownloadReport = (reportUrl, filename) => {
    const a = document.createElement('a');
    a.href = reportUrl;
    a.download = filename || 'report.pdf';
    a.click();
  };

  const handleSendReport = async (reportUrl, username, filename, resolvedData) => {
    try {
      await sendReport({ reportType: resolvedData.reportType, reportName: resolvedData.reportName, sentTo: username, data: resolvedData.rows || [], columns: resolvedData.columns || [] });
    } catch {}
    const a = document.createElement('a');
    a.href = reportUrl;
    a.download = `FOR_${username}_${filename || 'report.pdf'}`;
    a.click();
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered list
  const filtered = notifications.filter(n => {
    if (filter !== 'all' && n.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (n.fullName || '').toLowerCase().includes(q) ||
             (n.username || '').toLowerCase().includes(q) ||
             (n.message  || '').toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    all:      notifications.length,
    pending:  notifications.filter(n => n.status === 'pending').length,
    approved: notifications.filter(n => n.status === 'approved').length,
    rejected: notifications.filter(n => n.status === 'rejected').length,
    resolved: notifications.filter(n => n.status === 'resolved').length,
  };

  if (!isOpen) return null;

  return (
    <div className="np-overlay" onClick={onClose}>
      <div className="np-panel" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="np-header">
          <div className="np-header-left">
            <div className="np-header-icon"><Bell size={20} /></div>
            <div>
              <h2 className="np-title">Notifications</h2>
              <p className="np-subtitle">
                {counts.pending > 0
                  ? <><span className="np-pending-dot" />{counts.pending} pending action{counts.pending !== 1 ? 's' : ''} · {counts.all} total</>
                  : `${counts.all} notification${counts.all !== 1 ? 's' : ''} · all clear`}
              </p>
            </div>
          </div>
          <div className="np-header-right">
            <button className="np-icon-btn" title="Refresh" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 600); }}>
              <RefreshCw size={15} className={loading ? 'np-spin' : ''} />
            </button>
            <button className="np-close-btn" onClick={onClose} title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="np-controls">
          <div className="np-search-wrap">
            <Search size={14} className="np-search-icon" />
            <input
              ref={searchRef}
              className="np-search"
              placeholder="Search by name, username or message…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className="np-search-clear" onClick={() => setSearch('')}><X size={12} /></button>}
          </div>
          <div className="np-filters">
            {['all', 'pending', 'approved', 'rejected', 'resolved'].map(f => (
              <button
                key={f}
                className={`np-filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'pending' && counts.pending > 0 && <span className="np-filter-dot" />}
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="np-filter-count">{counts[f]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── List ── */}
        <div className="np-list">
          {loading && (
            <div className="np-loading">
              <div className="np-spinner" />
              <span>Loading notifications…</span>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="np-empty">
              <div className="np-empty-icon"><Inbox size={36} strokeWidth={1.2} /></div>
              <p>No notifications found</p>
              <span>{search || filter !== 'all' ? 'Try adjusting your search or filter.' : 'You are all caught up.'}</span>
              {(search || filter !== 'all') && (
                <button className="np-clear-btn" onClick={() => { setSearch(''); setFilter('all'); }}>
                  <X size={13} />Clear filters
                </button>
              )}
            </div>
          )}

          {!loading && filtered.map(notif => {
            const typeMeta   = TYPE_META[notif.type] || TYPE_META.default;
            const isExpanded = expanded === notif.id;

            return (
              <div key={notif.id} className={`np-item ${notif.status} ${isExpanded ? 'np-item-expanded' : ''}`}>

                {/* Row */}
                <div className="np-row" onClick={() => setExpanded(isExpanded ? null : notif.id)}>
                  <Avatar name={notif.fullName} type={notif.type} />
                  <div className="np-row-body">
                    <div className="np-row-top">
                      <span className="np-name">{notif.fullName || '—'}</span>
                      <RoleBadge role={notif.role} />
                    </div>
                    <div className="np-row-mid">
                      <TypeIcon type={notif.type} size={12} />
                      <span className="np-type-label">{typeMeta.label}</span>
                      <span className="np-sep">·</span>
                      <span className="np-username">@{notif.username}</span>
                    </div>
                    <p className="np-message">{notif.message}</p>
                  </div>
                  <div className="np-row-meta">
                    <StatusBadge status={notif.status} />
                    <span className="np-time"><Clock size={11} />{fmt(notif.timestamp)}</span>
                    <span className="np-chevron">{isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>
                  </div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="np-expanded">

                    {/* Access Denied — pending */}
                    {notif.type === 'access_denied' && notif.status === 'pending' && (
                      <div className="np-action-card np-card-warn">
                        <div className="np-action-card-title"><Lock size={14} />Account Access Issue</div>
                        <div className="np-detail-row"><span className="np-dl">Username</span><span className="np-dv">@{notif.username}</span></div>
                        <div className="np-detail-row"><span className="np-dl">Role</span><span className="np-dv"><RoleBadge role={notif.role} /></span></div>
                        <div className="np-action-btns">
                          <button className="np-btn np-btn-success" onClick={() => handleUnlockAccount(notif.id, notif.username)}>
                            <Unlock size={13} />Unlock Account
                          </button>
                          <button className="np-btn np-btn-info" onClick={() => handleResetSession(notif.id, notif.username)}>
                            <RotateCcw size={13} />Reset Session
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Credential Reset — pending */}
                    {(notif.type === 'password_reset' || notif.type === 'username_reset') && notif.status === 'pending' && (
                      <div className="np-action-card np-card-amber">
                        <div className="np-action-card-title"><Key size={14} />Credential Reset Request</div>
                        <div className="np-detail-row"><span className="np-dl">Username</span><span className="np-dv">@{notif.username}</span></div>
                        <div className="np-detail-row"><span className="np-dl">Request Type</span><span className="np-dv">{notif.requestType === 'both' ? 'Username & Password' : notif.requestType || 'Password'}</span></div>
                        <div className="np-action-btns">
                          <button className="np-btn np-btn-success" onClick={() => handleApproveCredentialReset(notif.id, notif.username, notif.requestType)}>
                            <CheckCircle size={13} />Approve & Reset
                          </button>
                          <button className="np-btn np-btn-danger" onClick={() => setShowRejectInput(notif.id)}>
                            <XCircle size={13} />Reject
                          </button>
                        </div>
                        {showRejectInput === notif.id && (
                          <div className="np-reject-box">
                            <textarea
                              className="np-textarea"
                              placeholder="Enter rejection reason…"
                              value={rejectionReason}
                              onChange={e => setRejectionReason(e.target.value)}
                              rows={3}
                            />
                            <button className="np-btn np-btn-danger np-btn-full" onClick={() => handleRejectWithReason(notif.id)}>
                              <Send size={13} />Send Rejection
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Approved — show temp password */}
                    {notif.status === 'approved' && notif.resolvedData?.tempPassword && (
                      <div className="np-action-card np-card-success">
                        <div className="np-action-card-title"><CheckCircle size={14} />Request Approved</div>
                        <div className="np-pw-box">
                          <span className="np-pw-label">Temporary Password</span>
                          <div className="np-pw-row">
                            <code className="np-pw-code">{notif.resolvedData.tempPassword}</code>
                            <button className="np-btn np-btn-copy" onClick={() => handleCopy(notif.resolvedData.tempPassword)}>
                              {copied ? <Check size={13} /> : <Copy size={13} />}
                              {copied ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        </div>
                        <p className="np-success-note"><Mail size={12} />Confirmation sent to user</p>
                      </div>
                    )}

                    {/* Report Request — pending */}
                    {notif.type === 'report_request' && notif.status === 'pending' && (
                      <div className="np-action-card np-card-blue">
                        <div className="np-action-card-title"><BarChart2 size={14} />Report Request</div>
                        <div className="np-detail-row"><span className="np-dl">Report Type</span><span className="np-dv">{(notif.reportType || '').replace(/_/g, ' ').toUpperCase()}</span></div>
                        {notif.period && <div className="np-detail-row"><span className="np-dl">Period</span><span className="np-dv">{notif.period.charAt(0).toUpperCase() + notif.period.slice(1)}</span></div>}
                        <div className="np-detail-row"><span className="np-dl">Requested By</span><span className="np-dv">{notif.fullName} <RoleBadge role={notif.role} /></span></div>
                        <div className="np-action-btns">
                          <button className="np-btn np-btn-primary" onClick={() => handleGenerateReport(notif.id, notif.reportType, notif.fullName)}>
                            <FileText size={13} />Generate Report
                          </button>
                          <button className="np-btn np-btn-danger" onClick={() => setShowRejectInput(notif.id)}>
                            <XCircle size={13} />Reject Request
                          </button>
                        </div>
                        {showRejectInput === notif.id && (
                          <div className="np-reject-box">
                            <textarea
                              className="np-textarea"
                              placeholder="Enter rejection reason…"
                              value={rejectionReason}
                              onChange={e => setRejectionReason(e.target.value)}
                              rows={3}
                            />
                            <button className="np-btn np-btn-danger np-btn-full" onClick={() => handleRejectWithReason(notif.id)}>
                              <Send size={13} />Send Rejection
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Report Generated — resolved */}
                    {notif.status === 'resolved' && notif.resolvedData?.reportUrl && (
                      <div className="np-action-card np-card-success">
                        <div className="np-action-card-title"><CheckCircle size={14} />Report Generated</div>
                        <div className="np-detail-row"><span className="np-dl">Report</span><span className="np-dv">{notif.resolvedData.reportName}</span></div>
                        <div className="np-action-btns">
                          <button className="np-btn np-btn-info" onClick={() => handleDownloadReport(notif.resolvedData.reportUrl, notif.resolvedData.filename)}>
                            <Download size={13} />Download
                          </button>
                          <button className="np-btn np-btn-amber" onClick={() => handleSendReport(notif.resolvedData.reportUrl, notif.username, notif.resolvedData.filename, notif.resolvedData)}>
                            <Send size={13} />Send to Officer
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Rejected */}
                    {notif.status === 'rejected' && notif.rejectionReason && (
                      <div className="np-action-card np-card-danger">
                        <div className="np-action-card-title"><XCircle size={14} />Request Rejected</div>
                        <div className="np-rejection-reason">{notif.rejectionReason}</div>
                      </div>
                    )}

                    {/* Resolved — generic */}
                    {notif.status === 'resolved' && notif.resolvedData && !notif.resolvedData.reportUrl && (
                      <div className="np-action-card np-card-success">
                        <div className="np-action-card-title"><CheckCircle size={14} />{notif.resolvedData.action}</div>
                        <p className="np-resolved-msg">{notif.resolvedData.message}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        {!loading && notifications.length > 0 && (
          <div className="np-footer">
            <span><Activity size={12} />{counts.pending} pending · {counts.resolved} resolved · {counts.rejected} rejected</span>
            <span><Zap size={12} />Live updates enabled</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
