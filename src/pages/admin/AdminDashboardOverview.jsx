import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, LabelList, ResponsiveContainer,
  PieChart, Pie, Sector,
} from 'recharts';
import { getVehicles, getDrivers, getRequests, getUsers } from '../../api/api';
import './adminTheme.css';
import './adminDashboardOverview.css';

// ── Colours ────────────────────────────────────────────────────────────────
const ROLE_COLORS   = ['#6366f1','#22c55e','#3b82f6','#f59e0b','#ec4899','#14b8a6'];
const DRIVER_COLORS = ['#22c55e','#3b82f6','#94a3b8'];
const REQ_COLORS    = ['#f59e0b','#6366f1','#22c55e','#ef4444'];

// ── Custom tooltip ─────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:'#fff', border:'1px solid #e2e8f0', borderRadius:10,
      padding:'10px 16px', boxShadow:'0 4px 16px rgba(0,0,0,0.1)', fontSize:13,
    }}>
      <div style={{ fontWeight:700, color:'#1e293b', marginBottom:4 }}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:7 }}>
          <span style={{ width:10, height:10, borderRadius:'50%', background:p.fill, display:'inline-block' }} />
          <span style={{ color:'#374151' }}>{p.name}: <strong>{p.value}</strong></span>
        </div>
      ))}
    </div>
  );
};

// ── Donut label in centre ──────────────────────────────────────────────────
const CentreLabel = ({ cx, cy, total, label }) => (
  <>
    <text x={cx} y={cy - 8} textAnchor="middle" fill="#1e293b" fontSize={26} fontWeight={800}>{total}</text>
    <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize={11}>{label}</text>
  </>
);

// ── Pie custom tooltip ─────────────────────────────────────────────────────
const PieTooltip = ({ active, payload, total }) => {
  if (!active || !payload?.length) return null;
  const { name, value, fill } = payload[0].payload;
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{
      background: '#fff',
      border: `2px solid ${fill}`,
      borderRadius: 10,
      padding: '10px 16px',
      boxShadow: '0 6px 24px rgba(0,0,0,0.13)',
      fontSize: 13,
      minWidth: 140,
      pointerEvents: 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: fill, display: 'inline-block', flexShrink: 0 }} />
        <span style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>{name}</span>
      </div>
      <div style={{ color: fill, fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 3 }}>{pct}% of total</div>
    </div>
  );
};

// ── Active slice shape (grows on hover) ────────────────────────────────────
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx} cy={cy}
      innerRadius={innerRadius - 3}
      outerRadius={outerRadius + 10}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      opacity={1}
    />
  );
};

// ── Compact custom legend ──────────────────────────────────────────────────
const PieLegend = ({ data }) => (
  <div className="adm-pie-legend">
    {data.map((d, i) => (
      <div key={i} className="adm-pie-legend-item">
        <span className="adm-pie-dot" style={{ background: d.fill }} />
        <span className="adm-pie-lbl">{d.name}</span>
        <span className="adm-pie-val" style={{ color: d.fill }}>{d.value}</span>
      </div>
    ))}
  </div>
);

export default function AdminDashboardOverview() {
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [activeRole, setActiveRole]     = useState(null);
  const [activeDriver, setActiveDriver] = useState(null);
  const [activeReq, setActiveReq]       = useState(null);

  useEffect(() => {
    Promise.all([getVehicles(), getDrivers(), getRequests(), getUsers()])
      .then(([vehicles, drivers, requests, users]) => {
        // vehicle
        const available   = vehicles.filter(v => v.status === 'available').length;
        const inUse       = vehicles.filter(v => v.status === 'in-use').length;
        const maintenance = vehicles.filter(v => v.status === 'maintenance').length;

        // driver status
        const drvAvailable = drivers.filter(d => d.status === 'available').length;
        const drvOnTrip    = drivers.filter(d => d.status === 'on-trip').length;
        const drvOffDuty   = drivers.filter(d => d.status === 'off-duty').length;
        const activeDrivers = drvAvailable + drvOnTrip;

        // requests
        const pending   = requests.filter(r => r.status === 'pending').length;
        const approved  = requests.filter(r => ['approved','in-progress'].includes(r.status)).length;
        const completed = requests.filter(r => r.status === 'completed').length;
        const rejected  = requests.filter(r => r.status === 'rejected').length;

        // users by role
        const roleCounts = {};
        users.forEach(u => {
          const r = u.role || 'Unknown';
          roleCounts[r] = (roleCounts[r] || 0) + 1;
        });

        setStats({
          totalVehicles: vehicles.length, available, inUse, maintenance,
          totalUsers: users.length, totalDrivers: drivers.length,
          drvAvailable, drvOnTrip, drvOffDuty, activeDrivers,
          totalRequests: requests.length, pending, approved, completed, rejected,
          roleCounts,
        });
      })
      .catch(err => console.error('Admin dashboard error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="admin-overview-container">
      <h1 className="overview-title">Dashboard Overview</h1>
      <p style={{ color:'#94a3b8', textAlign:'center' }}>Loading...</p>
    </div>
  );

  // ── Pie data ───────────────────────────────────────────────────────────────
  const userRolePie = Object.entries(stats.roleCounts).map(([name, value], i) => ({
    name, value, fill: ROLE_COLORS[i % ROLE_COLORS.length],
  }));

  const driverStatusPie = [
    { name: 'Available', value: stats.drvAvailable, fill: DRIVER_COLORS[0] },
    { name: 'On Trip',   value: stats.drvOnTrip,    fill: DRIVER_COLORS[1] },
    { name: 'Off Duty',  value: stats.drvOffDuty,   fill: DRIVER_COLORS[2] },
  ].filter(d => d.value > 0);

  const requestStatusPie = [
    { name: 'Pending',   value: stats.pending,   fill: REQ_COLORS[0] },
    { name: 'Approved',  value: stats.approved,  fill: REQ_COLORS[1] },
    { name: 'Completed', value: stats.completed, fill: REQ_COLORS[2] },
    { name: 'Rejected',  value: stats.rejected,  fill: REQ_COLORS[3] },
  ].filter(d => d.value > 0);

  // ── Bar chart data ─────────────────────────────────────────────────────────
  const vehicleBarData = [
    { name:'Total',       value: stats.totalVehicles, fill:'#6366f1' },
    { name:'Available',   value: stats.available,     fill:'#22c55e' },
    { name:'Assigned',    value: stats.inUse,         fill:'#3b82f6' },
    { name:'Maintenance', value: stats.maintenance,   fill:'#f59e0b' },
  ];

  const requestBarData = [
    { name:'Pending',   value: stats.pending,   fill:'#f59e0b' },
    { name:'Approved',  value: stats.approved,  fill:'#6366f1' },
    { name:'Completed', value: stats.completed, fill:'#22c55e' },
    { name:'Rejected',  value: stats.rejected,  fill:'#ef4444' },
  ];

  return (
    <div className="admin-overview-container">
      <h1 className="overview-title">Dashboard Overview</h1>

      {/* ── 3-column Pie Charts row ── */}
      <div className="adm-pie-row">

        {/* Users by Role */}
        <div className="adm-chart-card adm-pie-card">
          <h2 className="adm-chart-title">Users by Role</h2>
          <p className="adm-chart-sub">{stats.totalUsers} total accounts</p>
          <PieChart width={180} height={180}>
            <Pie data={userRolePie} cx={85} cy={85} innerRadius={52} outerRadius={80}
              dataKey="value" paddingAngle={3} stroke="none"
              activeIndex={activeRole}
              activeShape={renderActiveShape}
              onMouseEnter={(_, i) => setActiveRole(i)}
              onMouseLeave={() => setActiveRole(null)}>
              {userRolePie.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </Pie>
            <CentreLabel cx={85} cy={85} total={stats.totalUsers} label="Users" />
            <Tooltip content={<PieTooltip total={stats.totalUsers} />} />
          </PieChart>
          <PieLegend data={userRolePie} />
        </div>

        {/* Drivers by Status */}
        <div className="adm-chart-card adm-pie-card">
          <h2 className="adm-chart-title">Drivers by Status</h2>
          <p className="adm-chart-sub">{stats.totalDrivers} total drivers</p>
          <PieChart width={180} height={180}>
            <Pie data={driverStatusPie} cx={85} cy={85} innerRadius={52} outerRadius={80}
              dataKey="value" paddingAngle={3} stroke="none"
              activeIndex={activeDriver}
              activeShape={renderActiveShape}
              onMouseEnter={(_, i) => setActiveDriver(i)}
              onMouseLeave={() => setActiveDriver(null)}>
              {driverStatusPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </Pie>
            <CentreLabel cx={85} cy={85} total={stats.totalDrivers} label="Drivers" />
            <Tooltip content={<PieTooltip total={stats.totalDrivers} />} />
          </PieChart>
          <PieLegend data={driverStatusPie} />
        </div>

        {/* Requests by Status */}
        <div className="adm-chart-card adm-pie-card">
          <h2 className="adm-chart-title">Requests by Status</h2>
          <p className="adm-chart-sub">{stats.totalRequests} total requests</p>
          <PieChart width={180} height={180}>
            <Pie data={requestStatusPie} cx={85} cy={85} innerRadius={52} outerRadius={80}
              dataKey="value" paddingAngle={3} stroke="none"
              activeIndex={activeReq}
              activeShape={renderActiveShape}
              onMouseEnter={(_, i) => setActiveReq(i)}
              onMouseLeave={() => setActiveReq(null)}>
              {requestStatusPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </Pie>
            <CentreLabel cx={85} cy={85} total={stats.totalRequests} label="Requests" />
            <Tooltip content={<PieTooltip total={stats.totalRequests} />} />
          </PieChart>
          <PieLegend data={requestStatusPie} />
        </div>

      </div>

      {/* ── Vehicle Status Bar Chart ── */}
      <div className="adm-chart-card adm-chart-full">
        <div className="adm-chart-header">
          <div>
            <h2 className="adm-chart-title">Vehicle Status Overview</h2>
            <p className="adm-chart-sub">Total · Available · Assigned · Maintenance</p>
          </div>
          <div className="adm-vehicle-badges">
            {vehicleBarData.map((d, i) => (
              <span key={i} className="adm-badge" style={{ background: d.fill+'18', color: d.fill, border:`1px solid ${d.fill}44` }}>
                {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={vehicleBarData} margin={{ top:20, right:30, left:0, bottom:10 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize:13, fill:'#374151', fontWeight:600 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:12, fill:'#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} width={32} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(99,102,241,0.06)' }} />
            <Bar dataKey="value" name="Vehicles" radius={[10,10,0,0]} maxBarSize={100}>
              {vehicleBarData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              <LabelList dataKey="value" position="top" style={{ fontSize:15, fontWeight:800, fill:'#1e293b' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="adm-legend-row">
          {vehicleBarData.map((d, i) => (
            <div key={i} className="adm-legend-item">
              <span className="adm-legend-dot" style={{ background: d.fill }} />
              <span className="adm-legend-lbl">{d.name}</span>
              <span className="adm-legend-val" style={{ color: d.fill }}>{d.value}</span>
              <span className="adm-legend-pct" style={{ color:'#94a3b8' }}>
                ({Math.round((d.value / (stats.totalVehicles || 1)) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Request Status Bar Chart ── */}
      <div className="adm-chart-card adm-chart-full">
        <div className="adm-chart-header">
          <div>
            <h2 className="adm-chart-title">Request Status Overview</h2>
            <p className="adm-chart-sub">Pending · Approved · Completed · Rejected</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={requestBarData} margin={{ top:20, right:30, left:0, bottom:10 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize:13, fill:'#374151', fontWeight:600 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:12, fill:'#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} width={32} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(99,102,241,0.06)' }} />
            <Bar dataKey="value" name="Requests" radius={[10,10,0,0]} maxBarSize={100}>
              {requestBarData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              <LabelList dataKey="value" position="top" style={{ fontSize:15, fontWeight:800, fill:'#1e293b' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Bottom summary row ── */}
      <div className="adm-summary-row">
        <div className="adm-summary-card">
          <div className="adm-summary-icon" style={{ background:'#ede9fe', color:'#6366f1' }}>🚙</div>
          <div>
            <div className="adm-summary-val">{stats.activeDrivers}</div>
            <div className="adm-summary-lbl">Active Drivers</div>
            <div className="adm-summary-sub">of {stats.totalDrivers} total</div>
          </div>
        </div>
        <div className="adm-summary-card">
          <div className="adm-summary-icon" style={{ background:'#dcfce7', color:'#22c55e' }}>✅</div>
          <div>
            <div className="adm-summary-val">{stats.completed}</div>
            <div className="adm-summary-lbl">Completed Trips</div>
            <div className="adm-summary-sub">{Math.round((stats.completed / (stats.totalRequests || 1)) * 100)}% completion rate</div>
          </div>
        </div>
        <div className="adm-summary-card">
          <div className="adm-summary-icon" style={{ background:'#fef3c7', color:'#f59e0b' }}>⏳</div>
          <div>
            <div className="adm-summary-val">{stats.pending}</div>
            <div className="adm-summary-lbl">Pending Requests</div>
            <div className="adm-summary-sub">Awaiting approval</div>
          </div>
        </div>
        <div className="adm-summary-card">
          <div className="adm-summary-icon" style={{ background:'#dbeafe', color:'#3b82f6' }}>👥</div>
          <div>
            <div className="adm-summary-val">{stats.totalUsers}</div>
            <div className="adm-summary-lbl">Registered Users</div>
            <div className="adm-summary-sub">System accounts</div>
          </div>
        </div>
      </div>
    </div>
  );
}
