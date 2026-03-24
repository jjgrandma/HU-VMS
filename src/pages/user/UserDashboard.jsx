import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRequests, getComplaints, getCurrentUser } from '../../api/api';
import './user.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, complaints: 0 });
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    if (!currentUser?.username) return;
    Promise.all([
      getRequests({ requesterUsername: currentUser.username }),
      getComplaints(),
    ]).then(([reqs, complaints]) => {
      const myComplaints = complaints.filter(c =>
        c.senderUsername === currentUser.username && c.status !== 'Resolved'
      );
      setStats({
        total: reqs.length,
        pending: reqs.filter(r => r.status === 'pending').length,
        approved: reqs.filter(r => r.status === 'approved').length,
        complaints: myComplaints.length,
      });
      setRecentRequests(reqs.slice(0, 3));
    }).catch(err => console.error(err));
  }, []);

  const STATUS_STYLE = {
    pending:   { bg: '#fef3c7', color: '#92400e' },
    approved:  { bg: '#d1fae5', color: '#065f46' },
    rejected:  { bg: '#fee2e2', color: '#991b1b' },
    completed: { bg: '#dbeafe', color: '#1e40af' },
  };

  return (
    <div className="user-dashboard-content">
      <div className="user-dashboard-header">
        <h2>Dashboard</h2>
        <p>Welcome back, {currentUser?.name || 'User'}!</p>
      </div>

      <div className="user-stats-grid">
        <div className="user-stat-card blue">
          <div className="user-stat-icon">📊</div>
          <div className="user-stat-badge">TOTAL REQUESTS</div>
          <div className="user-stat-value">{stats.total}</div>
          <div className="user-stat-label">Total Requests</div>
        </div>
        <div className="user-stat-card yellow">
          <div className="user-stat-icon">⏳</div>
          <div className="user-stat-badge">PENDING</div>
          <div className="user-stat-value">{stats.pending}</div>
          <div className="user-stat-label">Awaiting Approval</div>
        </div>
        <div className="user-stat-card green">
          <div className="user-stat-icon">✅</div>
          <div className="user-stat-badge">APPROVED</div>
          <div className="user-stat-value">{stats.approved}</div>
          <div className="user-stat-label">Approved Requests</div>
        </div>
        <div className="user-stat-card red">
          <div className="user-stat-icon">⚠️</div>
          <div className="user-stat-badge">COMPLAINTS</div>
          <div className="user-stat-value">{stats.complaints}</div>
          <div className="user-stat-label">Active Complaints</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 12, margin: '24px 0 20px' }}>
        <button onClick={() => navigate('/user/request-vehicle')} style={{
          padding: '10px 20px', borderRadius: 8, border: 'none',
          background: '#3b82f6', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
        }}>
          🚗 Request Vehicle
        </button>
        <button onClick={() => navigate('/user/submit-complaint')} style={{
          padding: '10px 20px', borderRadius: 8, border: '1px solid #e5e7eb',
          background: '#fff', color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer',
        }}>
          ⚠️ Submit Complaint
        </button>
      </div>

      {/* Recent Requests */}
      {recentRequests.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Recent Requests</span>
            <button onClick={() => navigate('/user/my-requests')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
              View All →
            </button>
          </div>
          {recentRequests.map(req => {
            const st = STATUS_STYLE[req.status] || STATUS_STYLE.pending;
            return (
              <div key={req._id} style={{ padding: '12px 20px', borderBottom: '1px solid #f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{req.purpose}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{req.destination} · {req.date?.slice(0, 10)}</div>
                </div>
                <span style={{ background: st.bg, color: st.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                  {req.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
