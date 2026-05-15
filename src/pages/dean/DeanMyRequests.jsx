import { useState, useEffect } from 'react';
import { getRequests, getCurrentUser } from '../../api/api';

const STATUS_META = {
  pending:     { color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '⏳', label: 'Pending' },
  approved:    { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '✅', label: 'Approved' },
  rejected:    { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '❌', label: 'Rejected' },
  'in-progress': { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: '🚗', label: 'In Progress' },
  completed:   { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: '🏁', label: 'Completed' },
};

const PRIORITY_COLORS = {
  emergency: '#dc2626', high: '#f59e0b', normal: '#3b82f6', low: '#22c55e',
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function DeanMyRequests() {
  const currentUser = getCurrentUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter]     = useState('all');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch requests submitted by this dean (matched by requesterUsername)
      const data = await getRequests({ requesterUsername: currentUser?.username });
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = requests.filter(r => filter === 'all' || r.status === filter);

  const stats = {
    total:      requests.length,
    pending:    requests.filter(r => r.status === 'pending').length,
    approved:   requests.filter(r => r.status === 'approved' || r.status === 'in-progress').length,
    completed:  requests.filter(r => r.status === 'completed').length,
    rejected:   requests.filter(r => r.status === 'rejected').length,
  };

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center', color: '#6b7280' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>Loading your requests…
    </div>
  );

  if (error) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>Error: {error}</div>
  );

  return (
    <div style={{ padding: '28px 28px 60px', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
            📋 My Vehicle Requests
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
            Requests you submitted on behalf of{' '}
            <strong style={{ color: '#4338ca' }}>{currentUser?.collegeName || 'your college'}</strong>
          </p>
        </div>
        <button onClick={load}
          style={{ padding: '8px 16px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total',     value: stats.total,     color: '#6366f1', bg: '#eef2ff',  key: 'all' },
          { label: 'Pending',   value: stats.pending,   color: '#d97706', bg: '#fffbeb',  key: 'pending' },
          { label: 'Approved',  value: stats.approved,  color: '#16a34a', bg: '#f0fdf4',  key: 'approved' },
          { label: 'Completed', value: stats.completed, color: '#7c3aed', bg: '#f5f3ff',  key: 'completed' },
          { label: 'Rejected',  value: stats.rejected,  color: '#dc2626', bg: '#fef2f2',  key: 'rejected' },
        ].map(s => (
          <button key={s.key}
            onClick={() => setFilter(s.key)}
            style={{
              background: filter === s.key ? s.bg : '#fff',
              border: `1px solid ${filter === s.key ? s.color + '66' : '#e2e8f0'}`,
              borderRadius: 12, padding: '14px 10px', cursor: 'pointer', textAlign: 'center',
              transition: 'all 0.15s',
              boxShadow: filter === s.key ? `0 2px 8px ${s.color}22` : 'none',
            }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: 500 }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No requests found</div>
          <div style={{ fontSize: 13 }}>
            {filter !== 'all' ? `No ${filter} requests.` : 'You have not submitted any vehicle requests yet.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(req => {
            const st = STATUS_META[req.status] || STATUS_META.pending;
            const isOpen = expanded === req._id;
            return (
              <div key={req._id}
                style={{
                  background: '#fff',
                  border: `1px solid ${isOpen ? '#c7d2fe' : '#e2e8f0'}`,
                  borderLeft: `4px solid ${st.color}`,
                  borderRadius: 12, overflow: 'hidden',
                  boxShadow: isOpen ? '0 4px 20px rgba(99,102,241,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s',
                }}>

                {/* Card header */}
                <div
                  onClick={() => setExpanded(isOpen ? null : req._id)}
                  style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                        📍 {req.destination}
                      </span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>#{req._id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      🎯 {req.purpose} &nbsp;·&nbsp; 📅 {req.date?.slice(0, 10)} &nbsp;·&nbsp; 👥 {req.passengers} passenger(s)
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
                        ['Submitted',      fmt(req.createdAt)],
                        ['Trip Date',      req.date?.slice(0, 10)],
                        ['Return Date',    req.returnDate?.slice(0, 10)],
                        ['Vehicle Type',   req.vehicleType || 'Any'],
                        ['Passengers',     req.passengers],
                        ['Priority',       req.priority?.toUpperCase()],
                      ].filter(([, v]) => v).map(([label, value]) => (
                        <div key={label}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
                          <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {req.specialRequirements && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Notes</div>
                        <div style={{ fontSize: 13, color: '#374151' }}>{req.specialRequirements}</div>
                      </div>
                    )}

                    {/* Status outcome */}
                    {req.status === 'approved' || req.status === 'in-progress' || req.status === 'completed' ? (
                      <div style={{ marginTop: 14, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 14px' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Assignment</div>
                        {req.assignedVehicle && <div style={{ fontSize: 13, color: '#15803d' }}>🚌 {req.assignedVehicle}</div>}
                        {req.assignedDriver  && <div style={{ fontSize: 13, color: '#15803d', marginTop: 4 }}>👨‍✈️ {req.assignedDriver}</div>}
                        {req.approvedBy      && <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Approved by {req.approvedBy}</div>}
                      </div>
                    ) : req.status === 'rejected' && req.rejectionReason ? (
                      <div style={{ marginTop: 14, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Rejection Reason</div>
                        <div style={{ fontSize: 13, color: '#991b1b' }}>{req.rejectionReason}</div>
                      </div>
                    ) : req.status === 'pending' ? (
                      <div style={{ marginTop: 14, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#92400e' }}>
                        ⏳ Awaiting Transport Officer review.
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
