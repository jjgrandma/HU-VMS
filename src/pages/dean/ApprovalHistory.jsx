import { useState, useEffect, useMemo } from 'react';
import { getDeanRequests, getCurrentUser } from '../../api/api';

const STATUS_META = {
  approved:  { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '✅', label: 'Approved' },
  rejected:  { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '❌', label: 'Rejected' },
  completed: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: '🏁', label: 'Completed' },
  pending:   { color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '⏳', label: 'Pending' },
};

const PRIORITY_COLORS = {
  emergency: '#dc2626', high: '#f59e0b', normal: '#3b82f6', low: '#22c55e',
};

const fmt = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

// Get the date the dean acted on a request
const getDeanActionDate = (req) => {
  const histEntry = req.routingHistory?.find(h => h.role === 'COLLEGE_DEAN');
  if (histEntry?.at) return new Date(histEntry.at);
  if (req.updatedAt) return new Date(req.updatedAt);
  return new Date(req.createdAt);
};

export default function ApprovalHistory() {
  const currentUser = getCurrentUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Filters
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('all');
  const [dateFrom, setDateFrom]     = useState('');
  const [dateTo, setDateTo]         = useState('');
  const [sortOrder, setSortOrder]   = useState('desc'); // newest first
  const [expanded, setExpanded]     = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Server returns only requests from this dean's college
      const all = await getDeanRequests();
      // History = requests that have already been acted on (not still waiting for dean)
      const history = all.filter(r =>
        r.routingHistory?.some(h => h.role === 'COLLEGE_DEAN') ||
        r.status !== 'pending' ||
        r.currentApproverRole === 'TRANSPORT_OFFICER'
      );
      setRequests(history);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    let list = [...requests];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        (r.requester || '').toLowerCase().includes(q) ||
        (r.destination || '').toLowerCase().includes(q) ||
        (r.purpose || '').toLowerCase().includes(q) ||
        (r.department || '').toLowerCase().includes(q)
      );
    }

    // Status
    if (statusFilter !== 'all') {
      list = list.filter(r => r.status === statusFilter);
    }

    // Date range — based on when dean acted
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      list = list.filter(r => getDeanActionDate(r) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter(r => getDeanActionDate(r) <= to);
    }

    // Sort
    list.sort((a, b) => {
      const da = getDeanActionDate(a);
      const db = getDeanActionDate(b);
      return sortOrder === 'desc' ? db - da : da - db;
    });

    return list;
  }, [requests, search, statusFilter, dateFrom, dateTo, sortOrder]);

  // Group by date for timeline view
  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach(r => {
      const d = getDeanActionDate(r);
      const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    });
    return Array.from(map.entries());
  }, [filtered]);

  // Summary stats for filtered set
  const stats = useMemo(() => ({
    total:    filtered.length,
    approved: filtered.filter(r => r.status === 'approved' || r.status === 'completed').length,
    rejected: filtered.filter(r => r.status === 'rejected').length,
    pending:  filtered.filter(r => r.status === 'pending').length,
  }), [filtered]);

  const clearFilters = () => {
    setSearch(''); setStatus('all'); setDateFrom(''); setDateTo('');
  };
  const hasFilters = search || statusFilter !== 'all' || dateFrom || dateTo;

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center', color: '#6b7280', fontSize: 15 }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>Loading approval history...
    </div>
  );
  if (error) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>Error: {error}</div>
  );

  return (
    <div style={{ padding: '28px 28px 48px', maxWidth: 1000, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
            📜 Approval History
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
            {currentUser?.collegeName
              ? <><strong style={{ color: '#4338ca' }}>{currentUser.collegeName}</strong> — all decisions you have made</>
              : 'All requests you have approved or rejected'}
          </p>
        </div>
        <button onClick={fetchData}
          style={{ padding: '8px 16px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      {/* ── Summary stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total Decisions', value: stats.total,    color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
          { label: 'Approved',        value: stats.approved, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
          { label: 'Rejected',        value: stats.rejected, color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
          { label: 'Still Pending',   value: stats.pending,  color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filter bar ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>🔍 Filter & Search</span>
          {hasFilters && (
            <button onClick={clearFilters}
              style={{ marginLeft: 'auto', fontSize: 12, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              ✕ Clear all
            </button>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <input
            type="text"
            placeholder="Search requester, destination, purpose..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '9px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', minWidth: 0 }}
          />
          {/* Status */}
          <select value={statusFilter} onChange={e => setStatus(e.target.value)}
            style={{ padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer' }}>
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
          {/* Date from */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              style={{ padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, cursor: 'pointer' }} />
          </div>
          {/* Date to */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              style={{ padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, cursor: 'pointer' }} />
          </div>
          {/* Sort */}
          <button onClick={() => setSortOrder(o => o === 'desc' ? 'asc' : 'desc')}
            style={{ padding: '9px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: '#f8fafc', cursor: 'pointer', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
            {sortOrder === 'desc' ? '↓ Newest' : '↑ Oldest'}
          </button>
        </div>
      </div>

      {/* ── Timeline ── */}
      {grouped.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No history found</div>
          <div style={{ fontSize: 13 }}>
            {hasFilters ? 'Try adjusting your filters.' : 'Decisions you make will appear here.'}
          </div>
        </div>
      ) : (
        <div>
          {grouped.map(([dateLabel, items]) => (
            <div key={dateLabel} style={{ marginBottom: 32 }}>
              {/* Date group header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                  📅 {dateLabel}
                </div>
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{items.length} decision{items.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Cards for this date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 8, borderLeft: '2px solid #e0e7ff' }}>
                {items.map(req => {
                  const st = STATUS_META[req.status] || STATUS_META.pending;
                  const deanEntry = req.routingHistory?.find(h => h.role === 'COLLEGE_DEAN');
                  const actionTime = deanEntry?.at ? fmtTime(deanEntry.at) : fmtTime(req.updatedAt);
                  const isOpen = expanded === req._id;

                  return (
                    <div key={req._id}
                      style={{
                        background: '#fff', border: `1px solid ${isOpen ? '#c7d2fe' : '#e2e8f0'}`,
                        borderLeft: `3px solid ${st.color}`,
                        borderRadius: 12, overflow: 'hidden',
                        boxShadow: isOpen ? '0 4px 20px rgba(99,102,241,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s',
                        marginLeft: 12,
                      }}>

                      {/* Card header — always visible */}
                      <div
                        onClick={() => setExpanded(isOpen ? null : req._id)}
                        style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{req.requester}</span>
                            {req.unitName && (
                              <span style={{ fontSize: 11, background: '#e0e7ff', color: '#4338ca', padding: '1px 8px', borderRadius: 20, fontWeight: 600 }}>
                                {req.unitName}
                              </span>
                            )}
                            {actionTime && (
                              <span style={{ fontSize: 11, color: '#94a3b8' }}>at {actionTime}</span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            🎯 {req.purpose} &nbsp;·&nbsp; 📍 {req.destination}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <span style={{ background: PRIORITY_COLORS[req.priority] + '22', color: PRIORITY_COLORS[req.priority], padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                            {req.priority?.toUpperCase()}
                          </span>
                          <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            {st.icon} {st.label}
                          </span>
                          <span style={{ color: '#94a3b8', fontSize: 16, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                        </div>
                      </div>

                      {/* Expanded details */}
                      {isOpen && (
                        <div style={{ padding: '0 18px 18px', borderTop: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 20px', marginTop: 14 }}>
                            {[
                              ['Department', req.department],
                              ['Trip Date', req.date?.slice(0, 10)],
                              ['Passengers', req.passengers],
                              ['Vehicle Type', req.vehicleType],
                              ['Submitted', fmt(req.createdAt)],
                              ['Decision Date', fmt(getDeanActionDate(req))],
                            ].filter(([, v]) => v).map(([label, value]) => (
                              <div key={label}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
                                <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>{value}</div>
                              </div>
                            ))}
                          </div>

                          {/* Dean's action from routing history */}
                          {deanEntry && (
                            <div style={{ marginTop: 14, background: deanEntry.action === 'approved' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${deanEntry.action === 'approved' ? '#bbf7d0' : '#fecaca'}`, borderRadius: 8, padding: '10px 14px' }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Your Decision</div>
                              <div style={{ fontSize: 13, color: deanEntry.action === 'approved' ? '#15803d' : '#991b1b', fontWeight: 600 }}>
                                {deanEntry.action === 'approved' ? '✅ Approved & forwarded to Transport Officer' : '❌ Rejected'}
                              </div>
                              {deanEntry.note && <div style={{ fontSize: 12, color: '#374151', marginTop: 4 }}>{deanEntry.note}</div>}
                              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>by {deanEntry.by} · {fmt(deanEntry.at)} {fmtTime(deanEntry.at)}</div>
                            </div>
                          )}

                          {/* Rejection reason */}
                          {req.status === 'rejected' && req.rejectionReason && (
                            <div style={{ marginTop: 10, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px' }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Rejection Reason</div>
                              <div style={{ fontSize: 13, color: '#991b1b' }}>{req.rejectionReason}</div>
                            </div>
                          )}

                          {/* Final outcome */}
                          {(req.status === 'approved' || req.status === 'completed') && req.assignedVehicle && (
                            <div style={{ marginTop: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px' }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Final Assignment</div>
                              <div style={{ fontSize: 13, color: '#15803d' }}>🚌 {req.assignedVehicle}{req.assignedDriver ? ` · 👨‍✈️ ${req.assignedDriver}` : ''}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Result count */}
          <div style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', marginTop: 8 }}>
            Showing {filtered.length} of {requests.length} total decisions
          </div>
        </div>
      )}
    </div>
  );
}
