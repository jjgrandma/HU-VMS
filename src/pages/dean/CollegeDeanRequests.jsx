import { useState, useEffect } from 'react';
import { getDeanRequests, deanApproveRequest, rejectRequest, getCurrentUser } from '../../api/api';

const STATUS_COLORS = {
  pending:   { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
  approved:  { bg: '#d1fae5', color: '#065f46', label: 'Approved' },
  rejected:  { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
  completed: { bg: '#dbeafe', color: '#1e40af', label: 'Completed' },
};

const PRIORITY_COLORS = {
  emergency: '#dc2626', high: '#f59e0b', normal: '#3b82f6', low: '#22c55e',
};

export default function CollegeDeanRequests() {
  const currentUser = getCurrentUser();
  const [requests, setRequests]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selected, setSelected]         = useState(null);
  const [showModal, setShowModal]       = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading]     = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Server-side filtered: only returns requests from departments
      // under THIS dean's college (matched by collegeName on the dean's account)
      const deanRequests = await getDeanRequests();
      setRequests(deanRequests);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const [remarks, setRemarks] = useState('');

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      const updated = await deanApproveRequest(selected._id, {
        approvedBy: currentUser?.name || currentUser?.username || 'College Dean',
        remarks: remarks.trim(),
      });
      setRequests(prev => prev.map(r => r._id === updated._id ? updated : r));
      setRemarks('');
      setShowModal(false);
      setSelected(null);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    try {
      setActionLoading(true);
      const updated = await rejectRequest(selected._id, rejectionReason);
      setRequests(prev => prev.map(r => r._id === updated._id ? updated : r));
      setRejectionReason('');
      setShowModal(false);
      setSelected(null);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const pendingForDean = requests.filter(r =>
    r.status === 'pending' && r.currentApproverRole === 'COLLEGE_DEAN'
  );

  const filtered = requests.filter(req => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      (req.requester || '').toLowerCase().includes(q) ||
      (req.destination || '').toLowerCase().includes(q) ||
      (req.purpose || '').toLowerCase().includes(q);
    const matchStatus = filterStatus === 'All' || req.status === filterStatus.toLowerCase();
    return matchSearch && matchStatus;
  });

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading requests...</div>
  );
  if (error) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>Error: {error}</div>
  );

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
            🏛️ Department Requests
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
            {currentUser?.collegeName
              ? <><strong style={{ color: '#4338ca' }}>{currentUser.collegeName}</strong> — review and approve vehicle requests from your departments</>
              : 'Review and approve vehicle requests from departments under your college'
            }
          </p>
        </div>
        <button onClick={fetchData}
          style={{ padding: '8px 16px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Awaiting Your Review', value: pendingForDean.length, color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Total Requests', value: requests.length, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Approved', value: requests.filter(r => r.status === 'approved' || r.status === 'completed').length, color: '#22c55e', bg: '#f0fdf4' },
          { label: 'Rejected', value: requests.filter(r => r.status === 'rejected').length, color: '#ef4444', bg: '#fef2f2' },
        ].map(s => (
          <div key={s.label} style={{ flex: '1 1 160px', background: s.bg, border: `1px solid ${s.color}33`, borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by requester, destination, purpose..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: 220, padding: '9px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '9px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: '#fff' }}>
          <option value="All">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Request list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <p>No department requests found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(req => {
            const st = STATUS_COLORS[req.status] || STATUS_COLORS.pending;
            const isAwaitingDean = req.status === 'pending' && req.currentApproverRole === 'COLLEGE_DEAN';
            return (
              <div key={req._id}
                onClick={() => { setSelected(req); setRejectionReason(''); setShowModal(true); }}
                style={{
                  background: '#fff', border: `1px solid ${isAwaitingDean ? '#fde68a' : '#e2e8f0'}`,
                  borderLeft: `4px solid ${isAwaitingDean ? '#f59e0b' : st.color}`,
                  borderRadius: 12, padding: '16px 20px', cursor: 'pointer',
                  transition: 'all 0.2s', boxShadow: isAwaitingDean ? '0 2px 12px rgba(245,158,11,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{req.requester}</span>
                      {req.unitName && (
                        <span style={{ fontSize: 12, background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                          {req.unitName}
                        </span>
                      )}
                      {isAwaitingDean && (
                        <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 20, fontWeight: 700, animation: 'pulse 2s infinite' }}>
                          ⏳ Awaiting Your Review
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>
                      📍 {req.destination} &nbsp;·&nbsp; 📅 {req.date?.slice(0, 10)} &nbsp;·&nbsp; 👥 {req.passengers} passenger(s)
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                      🎯 {req.purpose}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      background: PRIORITY_COLORS[req.priority] + '22',
                      color: PRIORITY_COLORS[req.priority],
                      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    }}>
                      {req.priority?.toUpperCase()}
                    </span>
                    <span style={{ background: st.color, color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                      {st.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details + Action Modal */}
      {showModal && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={() => setShowModal(false)}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Request Details</h2>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>#{selected._id.slice(-6).toUpperCase()}</span>
              </div>
              <button onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Requester */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Requester</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                  {[
                    ['Name', selected.requester],
                    ['Department', selected.department],
                    ['Unit', selected.unitName || selected.unitType],
                    ['Username', selected.requesterUsername],
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{label}</div>
                      <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trip details */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Trip Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                  {[
                    ['Purpose', selected.purpose],
                    ['Destination', selected.destination],
                    ['Date', selected.date],
                    ['Passengers', selected.passengers],
                    ['Vehicle Type', selected.vehicleType],
                    ['Priority', selected.priority?.toUpperCase()],
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{label}</div>
                      <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>{value}</div>
                    </div>
                  ))}
                </div>
                {selected.specialRequirements && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Notes</div>
                    <div style={{ fontSize: 14, color: '#1e293b' }}>{selected.specialRequirements}</div>
                  </div>
                )}
              </div>

              {/* Approval route */}
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Approval Route</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Requester</span>
                  <span style={{ color: '#94a3b8' }}>→</span>
                  <span style={{ background: (selected.approvalLevel || 1) >= 2 ? '#dcfce7' : '#e0e7ff', color: (selected.approvalLevel || 1) >= 2 ? '#15803d' : '#4338ca', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    {(selected.approvalLevel || 1) >= 2 ? '✓ Dean Approved' : '⏳ College Dean'}
                  </span>
                  <span style={{ color: '#94a3b8' }}>→</span>
                  <span style={{ background: selected.status === 'approved' ? '#dcfce7' : '#f1f5f9', color: selected.status === 'approved' ? '#15803d' : '#94a3b8', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    Transport Officer
                  </span>
                </div>
              </div>

              {/* Actions — only for pending requests awaiting dean */}
              {selected.status === 'pending' && selected.currentApproverRole === 'COLLEGE_DEAN' && (
                <div>
                  {/* Dean stamp preview */}
                  <div style={{ background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', border: '1px solid #c7d2fe', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                      🏛️ Your Approval Stamp (will be attached)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                      {[
                        ['Dean Name',    currentUser?.name],
                        ['Employee ID',  currentUser?.employeeId || '—'],
                        ['College',      currentUser?.collegeName || '—'],
                        ['College Code', currentUser?.unitName || '—'],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <div style={{ fontSize: 10, color: '#6366f1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                          <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 600 }}>{value}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Remarks (optional)</div>
                      <textarea
                        placeholder="Add any remarks or notes for the Transport Officer..."
                        value={remarks}
                        onChange={e => setRemarks(e.target.value)}
                        rows={2}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #c7d2fe', borderRadius: 8, fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', background: 'rgba(255,255,255,0.7)' }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    style={{
                      width: '100%', padding: '13px', background: 'linear-gradient(135deg, #16a34a, #15803d)',
                      color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
                      cursor: 'pointer', marginBottom: 12, boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
                    }}>
                    {actionLoading ? 'Processing...' : '✅ Approve & Forward to Transport Officer'}
                  </button>

                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#991b1b', marginBottom: 8 }}>Reject Request</div>
                    <textarea
                      placeholder="Reason for rejection (required)..."
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      rows={3}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #fecaca', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    />
                    <button
                      onClick={handleReject}
                      disabled={!rejectionReason.trim() || actionLoading}
                      style={{
                        marginTop: 10, width: '100%', padding: '11px', background: '#ef4444',
                        color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700,
                        cursor: rejectionReason.trim() ? 'pointer' : 'not-allowed', opacity: rejectionReason.trim() ? 1 : 0.5,
                      }}>
                      {actionLoading ? 'Processing...' : '❌ Reject Request'}
                    </button>
                  </div>
                </div>
              )}

              {/* Already processed */}
              {selected.status === 'rejected' && selected.rejectionReason && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontWeight: 700, color: '#991b1b', marginBottom: 4 }}>❌ Rejected</div>
                  <div style={{ fontSize: 13, color: '#374151' }}>{selected.rejectionReason}</div>
                </div>
              )}
              {(selected.status === 'approved' || selected.status === 'completed') && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontWeight: 700, color: '#15803d' }}>✅ Approved — forwarded to Transport Officer</div>
                  {selected.assignedVehicle && (
                    <div style={{ fontSize: 13, color: '#374151', marginTop: 6 }}>🚌 Vehicle: <strong>{selected.assignedVehicle}</strong></div>
                  )}
                </div>
              )}
              {selected.status === 'pending' && selected.currentApproverRole !== 'COLLEGE_DEAN' && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: 14, fontSize: 13, color: '#92400e' }}>
                  ⏳ This request is currently with the Transport Officer.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
