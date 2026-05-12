import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Key, Clock, CheckCircle, XCircle, AlertTriangle,
  Search, Filter, RefreshCw, Eye, Trash2, ShieldOff,
  Lock, Calendar, Monitor, Mail, Shield, X,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Send, Zap, Activity, UserCheck, Hash, Globe, Info,
  CheckSquare, Ban, KeyRound, Fingerprint, BarChart3,
} from 'lucide-react';
import './adminTheme.css';
import './passwordResetManagement.css';

// ── Constants ─────────────────────────────────────────────
const BASE = 'http://localhost:5000/api';
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const STATUS_CONFIG = {
  pending:   { bg: '#fef3c7', color: '#d97706', border: '#fde68a', label: 'Pending',   },
  approved:  { bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe', label: 'Approved',  },
  completed: { bg: '#dcfce7', color: '#16a34a', border: '#86efac', label: 'Completed', },
  rejected:  { bg: '#fce7f3', color: '#be185d', border: '#fbcfe8', label: 'Rejected',  },
  expired:   { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5', label: 'Expired',   },
  cancelled: { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', label: 'Cancelled', },
};

const ROLE_COLORS = {
  ADMIN:               { bg: '#ede9fe', color: '#7c3aed' },
  TRANSPORT:           { bg: '#dbeafe', color: '#1d4ed8' },
  DRIVER:              { bg: '#dcfce7', color: '#15803d' },
  USER:                { bg: '#f0fdf4', color: '#16a34a' },
  FUEL_OFFICER:        { bg: '#fef3c7', color: '#d97706' },
  GATE_OFFICER:        { bg: '#fce7f3', color: '#be185d' },
  MAINTENANCE_OFFICER: { bg: '#e0f2fe', color: '#0369a1' },
  DEAN:                { bg: '#f5f3ff', color: '#6d28d9' },
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

// ── Helpers ───────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const initials = (name) => (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
const shortId = (id) => id ? `#${String(id).slice(-6).toUpperCase()}` : '—';
const isExpired = (log) => log.status === 'pending' && log.tokenExpires && new Date(log.tokenExpires) < new Date();

// ── Sub-components ────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className="prm-badge" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      {status === 'pending'   && <Clock size={11} />}
      {status === 'approved'  && <CheckCircle size={11} />}
      {status === 'completed' && <CheckCircle size={11} />}
      {status === 'rejected'  && <XCircle size={11} />}
      {status === 'expired'   && <AlertTriangle size={11} />}
      {status === 'cancelled' && <ShieldOff size={11} />}
      {cfg.label}
    </span>
  );
}

function RoleBadge({ role }) {
  const cfg = ROLE_COLORS[role] || { bg: '#f1f5f9', color: '#64748b' };
  return (
    <span className="prm-role-badge" style={{ background: cfg.bg, color: cfg.color }}>
      {(role || 'Unknown').replace(/_/g, ' ')}
    </span>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  const isError   = toast.type === 'error';
  const isWarning = toast.type === 'warning';
  return (
    <div className={`prm-toast ${toast.type}`}>
      {isError ? <XCircle size={15} /> : isWarning ? <AlertTriangle size={15} /> : <CheckCircle size={15} />}
      {toast.msg}
    </div>
  );
}

function ErrorBanner({ error, onDismiss }) {
  if (!error) return null;
  const styles = {
    error:   { bg: '#fff1f2', color: '#be123c', border: '#fecdd3', icon: <XCircle size={15} /> },
    warning: { bg: '#fffbeb', color: '#b45309', border: '#fde68a', icon: <AlertTriangle size={15} /> },
    info:    { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', icon: <Shield size={15} /> },
  };
  const s = styles[error.level] || styles.info;
  return (
    <div className="prm-error-banner" style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      {s.icon}
      <span><strong>[{error.code}]</strong> {error.msg}</span>
      <button onClick={onDismiss} className="prm-error-dismiss"><X size={12} /></button>
    </div>
  );
}

function Pagination({ page, totalPages, pageSize, totalItems, onPage, onPageSize }) {
  if (totalPages <= 1 && totalItems <= PAGE_SIZE_OPTIONS[0]) return null;
  const pages = [];
  const delta = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) pages.push(i);
    else if (pages[pages.length - 1] !== '...') pages.push('...');
  }
  return (
    <div className="prm-pagination">
      <div className="prm-pagination-info">
        Showing <strong>{Math.min((page - 1) * pageSize + 1, totalItems)}</strong>–
        <strong>{Math.min(page * pageSize, totalItems)}</strong> of <strong>{totalItems}</strong> records
      </div>
      <div className="prm-pagination-controls">
        <select className="prm-page-size" value={pageSize} onChange={e => onPageSize(Number(e.target.value))}>
          {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n} / page</option>)}
        </select>
        <button className="prm-pg-btn" onClick={() => onPage(1)} disabled={page === 1} title="First"><ChevronsLeft size={14} /></button>
        <button className="prm-pg-btn" onClick={() => onPage(page - 1)} disabled={page === 1} title="Prev"><ChevronLeft size={14} /></button>
        {pages.map((p, i) =>
          p === '...'
            ? <span key={`e${i}`} className="prm-pg-ellipsis">…</span>
            : <button key={p} className={`prm-pg-btn ${p === page ? 'active' : ''}`} onClick={() => onPage(p)}>{p}</button>
        )}
        <button className="prm-pg-btn" onClick={() => onPage(page + 1)} disabled={page === totalPages} title="Next"><ChevronRight size={14} /></button>
        <button className="prm-pg-btn" onClick={() => onPage(totalPages)} disabled={page === totalPages} title="Last"><ChevronsRight size={14} /></button>
      </div>
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────
function DetailModal({ log, onClose, onReset, onCancel, onDelete, actionLoading }) {
  if (!log) return null;
  const user = log.user || {};
  const expired = isExpired(log);
  const canAct = log.status === 'pending' || log.status === 'approved';

  return (
    <div className="prm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="prm-modal">
        <div className="prm-modal-header">
          <div>
            <h3><Eye size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />Request Details</h3>
            <div className="prm-modal-id">{shortId(log._id)} &nbsp;·&nbsp; <StatusBadge status={expired ? 'expired' : log.status} /></div>
          </div>
          <button className="prm-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="prm-modal-body">
          {/* User Info */}
          <div className="prm-detail-section">
            <div className="prm-detail-section-title"><UserCheck size={13} />User Information</div>
            <div className="prm-reset-user-info">
              <div className="prm-avatar prm-avatar-lg">{initials(user.name)}</div>
              <div>
                <div className="prm-user-name" style={{ fontSize: 16 }}>{user.name || 'Unknown'}</div>
                <div className="prm-user-sub">{user.username || '—'}</div>
                <div className="prm-email" style={{ marginTop: 4 }}><Mail size={12} />{user.email || '—'}</div>
                <div style={{ marginTop: 6 }}><RoleBadge role={user.role} /></div>
              </div>
            </div>
          </div>

          {/* Request Info */}
          <div className="prm-detail-section">
            <div className="prm-detail-section-title"><Info size={13} />Request Information</div>
            <div className="prm-detail-grid">
              <div className="prm-detail-row">
                <span className="prm-dl">Request ID</span>
                <span className="prm-dv prm-mono">{shortId(log._id)}</span>
              </div>
              <div className="prm-detail-row">
                <span className="prm-dl">Requested At</span>
                <span className="prm-dv">{fmt(log.requestedAt || log.createdAt)}</span>
              </div>
              <div className="prm-detail-row">
                <span className="prm-dl">Token Expires</span>
                <span className={`prm-dv ${expired ? 'prm-expired-text' : ''}`}>
                  {fmt(log.tokenExpires)}
                  {expired && <span className="prm-expired-tag">EXPIRED</span>}
                </span>
              </div>
              {log.completedAt && (
                <div className="prm-detail-row">
                  <span className="prm-dl">Completed At</span>
                  <span className="prm-dv">{fmt(log.completedAt)}</span>
                </div>
              )}
              <div className="prm-detail-row">
                <span className="prm-dl">Reset Method</span>
                <span className="prm-dv">Email Link</span>
              </div>
              <div className="prm-detail-row">
                <span className="prm-dl">Department</span>
                <span className="prm-dv">{user.department || '—'}</span>
              </div>
            </div>
          </div>

          {/* Device / Network */}
          <div className="prm-detail-section">
            <div className="prm-detail-section-title"><Monitor size={13} />Device &amp; Network</div>
            <div className="prm-detail-grid">
              <div className="prm-detail-row">
                <span className="prm-dl">IP Address</span>
                <span className="prm-dv prm-mono">{log.ipAddress || '—'}</span>
              </div>
              <div className="prm-detail-row">
                <span className="prm-dl">User Agent</span>
                <span className="prm-dv" style={{ fontSize: 11, wordBreak: 'break-all' }}>{log.userAgent || '—'}</span>
              </div>
            </div>
          </div>

          {/* Security Notes */}
          <div className="prm-security-notes">
            <div className="prm-sn-title"><Shield size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />Security Compliance</div>
            <div className="prm-sn-grid">
              <div className="prm-sn-item">✅ Token is SHA-256 hashed</div>
              <div className="prm-sn-item">✅ One-time use link</div>
              <div className="prm-sn-item">✅ 1-hour expiration window</div>
              <div className="prm-sn-item">✅ Password bcrypt (12 rounds)</div>
              <div className="prm-sn-item">✅ IP &amp; device logged</div>
              <div className="prm-sn-item">✅ Full audit trail</div>
            </div>
          </div>
        </div>

        <div className="prm-modal-footer">
          {canAct && (
            <button className="prm-btn reset" onClick={() => onReset(log)} disabled={actionLoading}>
              <KeyRound size={13} />Manual Reset
            </button>
          )}
          {(log.status === 'pending') && (
            <button className="prm-btn cancel" onClick={() => onCancel(log._id)} disabled={actionLoading}>
              <Ban size={13} />Cancel Request
            </button>
          )}
          <button className="prm-btn delete" onClick={() => onDelete(log._id)} disabled={actionLoading}>
            <Trash2 size={13} />Delete Log
          </button>
          <button className="prm-btn view" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={13} />Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Manual Reset Modal ────────────────────────────────────
function ResetModal({ log, onClose, onConfirm, actionLoading }) {
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  if (!log) return null;
  const user = log.user || {};

  const handleSubmit = () => {
    if (!pw || pw.length < 8) { setErr('Password must be at least 8 characters.'); return; }
    if (!/[A-Z]/.test(pw)) { setErr('Include at least one uppercase letter.'); return; }
    if (!/[0-9]/.test(pw)) { setErr('Include at least one number.'); return; }
    setErr('');
    onConfirm(log._id, pw);
  };

  return (
    <div className="prm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="prm-modal prm-modal-sm">
        <div className="prm-modal-header">
          <div>
            <h3><KeyRound size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />Manual Password Reset</h3>
            <div className="prm-modal-id">Set a new password for this user</div>
          </div>
          <button className="prm-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="prm-modal-body">
          <div className="prm-reset-user-info">
            <div className="prm-avatar">{initials(user.name)}</div>
            <div>
              <div className="prm-user-name">{user.name || 'Unknown'}</div>
              <div className="prm-user-sub">{user.email || user.username || '—'}</div>
              <div style={{ marginTop: 4 }}><RoleBadge role={user.role} /></div>
            </div>
          </div>
          <div className="prm-form-group">
            <label>New Password</label>
            <div className="prm-pw-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                value={pw}
                onChange={e => { setPw(e.target.value); setErr(''); }}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                autoFocus
              />
              <button className="prm-pw-toggle" onClick={() => setShowPw(v => !v)} type="button">
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
            {err && <div className="prm-field-error">{err}</div>}
            <div className="prm-field-hint">
              Password will be hashed with bcrypt (12 rounds). The user will need to log in with this new password.
            </div>
          </div>
        </div>
        <div className="prm-modal-footer">
          <button className="prm-btn reset" onClick={handleSubmit} disabled={actionLoading || !pw}>
            <KeyRound size={13} />{actionLoading ? 'Resetting…' : 'Confirm Reset'}
          </button>
          <button className="prm-btn view" onClick={onClose}><X size={13} />Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Confirm Delete Modal ──────────────────────────────────
function ConfirmDeleteModal({ logId, onClose, onConfirm, actionLoading }) {
  if (!logId) return null;
  return (
    <div className="prm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="prm-modal prm-modal-sm">
        <div className="prm-modal-header">
          <div>
            <h3><Trash2 size={16} style={{ marginRight: 6, verticalAlign: 'middle', color: '#e11d48' }} />Delete Log Entry</h3>
            <div className="prm-modal-id">This action cannot be undone</div>
          </div>
          <button className="prm-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="prm-modal-body">
          <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: '14px 16px', color: '#be123c', fontSize: 14 }}>
            <AlertTriangle size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Are you sure you want to permanently delete this password reset log? This will remove all audit trail data for this request.
          </div>
        </div>
        <div className="prm-modal-footer">
          <button className="prm-btn delete" onClick={() => onConfirm(logId)} disabled={actionLoading}>
            <Trash2 size={13} />{actionLoading ? 'Deleting…' : 'Delete Permanently'}
          </button>
          <button className="prm-btn view" onClick={onClose}><X size={13} />Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
export default function PasswordResetManagement() {
  // ── State ──
  const [logs, setLogs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState(null);
  const [toast, setToast]             = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter]   = useState('all');
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');

  // Pagination
  const [page, setPage]               = useState(1);
  const [pageSize, setPageSize]       = useState(10);

  // Modals
  const [detailLog, setDetailLog]     = useState(null);
  const [resetLog, setResetLog]       = useState(null);
  const [deleteLogId, setDeleteLogId] = useState(null);

  const toastTimer = useRef(null);
  const searchRef  = useRef(null);

  // ── Toast helper ──
  const showToast = useCallback((msg, type = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Fetch logs ──
  const fetchLogs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo)   params.set('dateTo', dateTo);
      if (search)   params.set('search', search);
      const res = await fetch(`${BASE}/auth/reset-logs?${params}`, { headers: authHeaders() });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) { setError({ level: 'error', code: 'AUTH_401', msg: 'Session expired. Please log in again.' }); return; }
        if (res.status === 403) { setError({ level: 'error', code: 'PERM_403', msg: 'You do not have permission to view reset logs.' }); return; }
        setError({ level: 'error', code: `HTTP_${res.status}`, msg: data.message || 'Failed to load reset logs.' });
        return;
      }
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
      setPage(1);
    } catch (e) {
      setError({ level: 'warning', code: 'NET_ERR', msg: 'Cannot reach server. Check your connection.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, dateFrom, dateTo, search]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // ── Client-side filter (role) ──
  const filtered = logs.filter(l => {
    if (roleFilter !== 'all' && (l.user?.role || '') !== roleFilter) return false;
    return true;
  });

  // ── Pagination ──
  const totalItems  = filtered.length;
  const totalPages  = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginated   = filtered.slice((page - 1) * pageSize, page * pageSize);

  // ── Stats ──
  const stats = {
    total:     logs.length,
    pending:   logs.filter(l => l.status === 'pending').length,
    completed: logs.filter(l => l.status === 'completed').length,
    expired:   logs.filter(l => l.status === 'expired' || isExpired(l)).length,
    cancelled: logs.filter(l => l.status === 'cancelled').length,
  };

  // ── Actions ──
  const handleManualReset = async (logId, newPassword) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${BASE}/auth/reset-logs/${logId}/manual-reset`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message || 'Reset failed.', 'error'); return; }
      showToast(data.message || 'Password reset successfully.', 'success');
      setResetLog(null);
      setDetailLog(null);
      fetchLogs(true);
    } catch { showToast('Network error. Try again.', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleCancel = async (logId) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${BASE}/auth/reset-logs/${logId}/cancel`, {
        method: 'PATCH', headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message || 'Cancel failed.', 'error'); return; }
      showToast('Request cancelled.', 'success');
      setDetailLog(null);
      fetchLogs(true);
    } catch { showToast('Network error.', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async (logId) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${BASE}/auth/reset-logs/${logId}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      if (!res.ok) { const d = await res.json(); showToast(d.message || 'Delete failed.', 'error'); return; }
      showToast('Log entry deleted.', 'success');
      setDeleteLogId(null);
      setDetailLog(null);
      fetchLogs(true);
    } catch { showToast('Network error.', 'error'); }
    finally { setActionLoading(false); }
  };

  const clearFilters = () => {
    setSearch(''); setStatusFilter('all'); setRoleFilter('all');
    setDateFrom(''); setDateTo(''); setPage(1);
  };
  const hasFilters = search || statusFilter !== 'all' || roleFilter !== 'all' || dateFrom || dateTo;

  // ── Render ──
  return (
    <div className="prm-page">
      <Toast toast={toast} />

      {/* Modals */}
      {detailLog && (
        <DetailModal
          log={detailLog}
          onClose={() => setDetailLog(null)}
          onReset={l => { setDetailLog(null); setResetLog(l); }}
          onCancel={id => handleCancel(id)}
          onDelete={id => { setDetailLog(null); setDeleteLogId(id); }}
          actionLoading={actionLoading}
        />
      )}
      {resetLog && (
        <ResetModal
          log={resetLog}
          onClose={() => setResetLog(null)}
          onConfirm={handleManualReset}
          actionLoading={actionLoading}
        />
      )}
      {deleteLogId && (
        <ConfirmDeleteModal
          logId={deleteLogId}
          onClose={() => setDeleteLogId(null)}
          onConfirm={handleDelete}
          actionLoading={actionLoading}
        />
      )}

      {/* ── Page Header ── */}
      <div className="prm-header">
        <div>
          <h1><KeyRound size={22} style={{ marginRight: 8, verticalAlign: 'middle', color: '#6366f1' }} />Password Reset Management</h1>
          <p>Monitor and manage all password reset requests across the system</p>
        </div>
        <button className="prm-refresh-btn" onClick={() => fetchLogs(true)} disabled={refreshing}>
          <RefreshCw size={14} className={refreshing ? 'prm-spin' : ''} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── Error Banner ── */}
      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      {/* ── Security Banner ── */}
      <div className="prm-security-banner">
        <div className="prm-sec-item"><Shield size={12} /><strong>SHA-256</strong> Token Hashing</div>
        <div className="prm-sec-item"><Clock size={12} /><strong>1-Hour</strong> Token Expiry</div>
        <div className="prm-sec-item"><Fingerprint size={12} /><strong>One-Time</strong> Use Links</div>
        <div className="prm-sec-item"><Lock size={12} /><strong>bcrypt-12</strong> Password Hashing</div>
        <div className="prm-sec-item"><Globe size={12} /><strong>IP &amp; Device</strong> Logging</div>
        <div className="prm-sec-item"><Activity size={12} /><strong>Full</strong> Audit Trail</div>
        <div className="prm-sec-item"><Zap size={12} /><strong>Auto-Expire</strong> Detection</div>
      </div>

      {/* ── Stats ── */}
      <div className="prm-stats">
        {[
          { label: 'Total Requests', val: stats.total,     color: '#6366f1', icon: <BarChart3 size={18} />,    bg: '#ede9fe' },
          { label: 'Pending',        val: stats.pending,   color: '#d97706', icon: <Clock size={18} />,        bg: '#fef3c7' },
          { label: 'Completed',      val: stats.completed, color: '#16a34a', icon: <CheckCircle size={18} />,  bg: '#dcfce7' },
          { label: 'Expired',        val: stats.expired,   color: '#dc2626', icon: <AlertTriangle size={18} />,bg: '#fee2e2' },
          { label: 'Cancelled',      val: stats.cancelled, color: '#64748b', icon: <ShieldOff size={18} />,    bg: '#f1f5f9' },
        ].map(s => (
          <div key={s.label} className="prm-stat-card" style={{ borderTopColor: s.color }}>
            <div className="prm-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="prm-stat-val" style={{ color: s.color }}>{s.val}</div>
            <div className="prm-stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="prm-filters">
        <div className="prm-search">
          <Search size={15} />
          <input
            ref={searchRef}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email or username…"
          />
          {search && (
            <button className="prm-clear-search" onClick={() => { setSearch(''); searchRef.current?.focus(); }}>
              <X size={13} />
            </button>
          )}
        </div>

        <div className="prm-filter-group">
          <Filter size={13} />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="prm-filter-group">
          <Hash size={13} />
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="all">All Roles</option>
            {Object.keys(ROLE_COLORS).map(r => (
              <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <div className="prm-date-range">
          <Calendar size={13} />
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} title="From date" />
          <span>→</span>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} title="To date" />
        </div>

        {hasFilters && (
          <button className="prm-btn cancel" onClick={clearFilters} style={{ padding: '8px 14px' }}>
            <X size={13} />Clear Filters
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="prm-table-wrap">
        <div className="prm-table-meta">
          {loading ? 'Loading…' : `${totalItems} request${totalItems !== 1 ? 's' : ''} found`}
          {hasFilters && !loading && <span style={{ color: '#6366f1', marginLeft: 8 }}>(filtered)</span>}
        </div>

        {loading ? (
          <div className="prm-loading">
            <div className="prm-spinner" />
            <span>Loading password reset logs…</span>
          </div>
        ) : paginated.length === 0 ? (
          <div className="prm-empty">
            <Key size={40} strokeWidth={1.2} />
            <p>No password reset requests found</p>
            <span>{hasFilters ? 'Try adjusting your filters.' : 'No requests have been submitted yet.'}</span>
            {hasFilters && (
              <button className="prm-btn view" onClick={clearFilters} style={{ marginTop: 8 }}>
                <X size={13} />Clear Filters
              </button>
            )}
          </div>
        ) : (
          <table className="prm-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Requested At</th>
                <th>Token Expires</th>
                <th>Status</th>
                <th>Reset Method</th>
                <th>IP Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(log => {
                const user    = log.user || {};
                const expired = isExpired(log);
                const status  = expired ? 'expired' : log.status;
                return (
                  <tr key={log._id} className={expired ? 'prm-row-expired' : ''}>
                    <td><span className="prm-id">{shortId(log._id)}</span></td>
                    <td>
                      <div className="prm-user-cell">
                        <div className="prm-avatar">{initials(user.name)}</div>
                        <div>
                          <div className="prm-user-name">{user.name || '—'}</div>
                          <div className="prm-user-sub">{user.username || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="prm-email">
                        <Mail size={12} />
                        {user.email || '—'}
                      </div>
                    </td>
                    <td><RoleBadge role={user.role} /></td>
                    <td><div className="prm-date">{fmt(log.requestedAt || log.createdAt)}</div></td>
                    <td>
                      <div className={`prm-date ${expired ? 'prm-expired-text' : ''}`}>
                        {fmt(log.tokenExpires)}
                        {expired && <span className="prm-expired-tag">EXPIRED</span>}
                      </div>
                    </td>
                    <td><StatusBadge status={status} /></td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#475569' }}>
                        <Send size={12} />Email Link
                      </span>
                    </td>
                    <td><span className="prm-ip">{log.ipAddress || '—'}</span></td>
                    <td>
                      <div className="prm-actions">
                        <button className="prm-btn view" onClick={() => setDetailLog(log)} title="View Details">
                          <Eye size={12} />View
                        </button>
                        {(log.status === 'pending' || log.status === 'approved') && (
                          <button className="prm-btn reset" onClick={() => setResetLog(log)} title="Manual Reset">
                            <KeyRound size={12} />Reset
                          </button>
                        )}
                        {log.status === 'pending' && (
                          <button className="prm-btn cancel" onClick={() => handleCancel(log._id)} disabled={actionLoading} title="Cancel Request">
                            <Ban size={12} />Cancel
                          </button>
                        )}
                        <button className="prm-btn delete" onClick={() => setDeleteLogId(log._id)} title="Delete Log">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && paginated.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPage={p => setPage(p)}
            onPageSize={n => { setPageSize(n); setPage(1); }}
          />
        )}
      </div>

      {/* ── Footer Info ── */}
      {!loading && logs.length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 12, color: '#94a3b8' }}>
          <span><CheckSquare size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Last refreshed: {new Date().toLocaleTimeString()}</span>
          <span><Info size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Showing up to 200 most recent records from server</span>
          <span><UserCheck size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Expired tokens are auto-detected client-side</span>
        </div>
      )}
    </div>
  );
}
