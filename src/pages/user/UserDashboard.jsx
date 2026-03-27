import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend
} from 'recharts';
import { getRequests, getComplaints, getCurrentUser } from '../../api/api';
import './user.css';

const COLORS = {
  pending:   '#f59e0b',
  approved:  '#16a34a',
  rejected:  '#dc2626',
  completed: '#3b82f6',
  'in-progress': '#8b5cf6',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1e293b', color: '#fff', padding: '10px 16px',
        borderRadius: 10, fontSize: 13, boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
      }}>
        <p style={{ margin: 0, fontWeight: 700 }}>{label}</p>
        <p style={{ margin: '4px 0 0', color: payload[0].fill }}>
          {payload[0].value} request{payload[0].value !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }
  return null;
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, completed: 0, rejected: 0, complaints: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

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
        total:     reqs.length,
        pending:   reqs.filter(r => r.status === 'pending').length,
        approved:  reqs.filter(r => r.status === 'approved').length,
        completed: reqs.filter(r => r.status === 'completed').length,
        rejected:  reqs.filter(r => r.status === 'rejected').length,
        complaints: myComplaints.length,
      });

      setRecentRequests(reqs.slice(0, 3));

      // Build last 6 months data
      const now = new Date();
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return {
          month: d.toLocaleString('default', { month: 'short' }),
          year: d.getFullYear(),
          monthNum: d.getMonth(),
          total: 0, approved: 0, rejected: 0, completed: 0,
        };
      });

      reqs.forEach(r => {
        const d = new Date(r.createdAt);
        const m = months.find(x => x.monthNum === d.getMonth() && x.year === d.getFullYear());
        if (m) {
          m.total++;
          if (r.status === 'approved')  m.approved++;
          if (r.status === 'rejected')  m.rejected++;
          if (r.status === 'completed') m.completed++;
        }
      });

      setMonthlyData(months);
    }).catch(err => console.error(err));
  }, []);

  const statusBarData = [
    { name: 'Pending',   value: stats.pending,   fill: COLORS.pending },
    { name: 'Approved',  value: stats.approved,  fill: COLORS.approved },
    { name: 'Completed', value: stats.completed, fill: COLORS.completed },
    { name: 'Rejected',  value: stats.rejected,  fill: COLORS.rejected },
  ];

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

      {/* Charts replacing stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, margin: '20px 0' }}>

        {/* Status Bar Chart */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '20px 16px', border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#111827' }}>Request Summary</h3>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: '#6b7280' }}>Your requests by status</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={statusBarData} barSize={44} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {statusBarData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Mini legend with values */}
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 12, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
            {statusBarData.map(s => (
              <div key={s.name} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.fill }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{s.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '20px 16px', border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#111827' }}>Monthly Activity</h3>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: '#6b7280' }}>Last 6 months</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} barSize={12} barGap={2} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="approved"  name="Approved"  fill={COLORS.approved}  radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill={COLORS.completed} radius={[4, 4, 0, 0]} />
              <Bar dataKey="rejected"  name="Rejected"  fill={COLORS.rejected}  radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 12, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>{stats.total}</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Total</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b' }}>{stats.complaints}</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Complaints</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
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
