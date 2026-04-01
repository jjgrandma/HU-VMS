import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
  AreaChart, Area,
} from 'recharts';
import { Droplets, ClipboardList, Package, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { getFuelRequests, getFuelInventory } from '../../api/api';
import './FuelDashboard.css';

const COLORS = {
  pending:'#f59e0b', approved:'#3b82f6', dispensed:'#16a34a',
  confirmed:'#8b5cf6', rejected:'#dc2626', Diesel:'#3b82f6', Petrol:'#f59e0b',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#1e293b', color:'#fff', padding:'8px 14px', borderRadius:10, fontSize:13 }}>
      {payload.map((p, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:7 }}>
          <span style={{ width:10, height:10, borderRadius:'50%', background:p.fill||p.color, display:'inline-block' }} />
          <strong>{p.name}</strong>: {p.value}
        </div>
      ))}
    </div>
  );
};

const DonutCenter = ({ cx, cy, total, label }) => (
  <>
    <text x={cx} y={cy-8}  textAnchor="middle" fill="#1e293b" fontSize={26} fontWeight={700}>{total}</text>
    <text x={cx} y={cy+14} textAnchor="middle" fill="#94a3b8" fontSize={11}>{label}</text>
  </>
);

export default function FuelDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading]     = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [requests, setRequests]   = useState([]);
  const [inventory, setInventory] = useState([]);

  const fetchData = async () => {
    try {
      const [reqs, inv] = await Promise.all([getFuelRequests(), getFuelInventory()]);
      setRequests(Array.isArray(reqs) ? reqs : []);
      setInventory(Array.isArray(inv) ? inv : []);
      setLastRefresh(new Date());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const today      = new Date().toDateString();
  const oneWeekAgo = new Date(Date.now() - 7*24*60*60*1000);
  const pending    = requests.filter(r => r.status === 'pending').length;
  const approved   = requests.filter(r => r.status === 'approved').length;
  const dispensed  = requests.filter(r => r.status === 'dispensed').length;
  const confirmed  = requests.filter(r => r.status === 'confirmed').length;
  const rejected   = requests.filter(r => r.status === 'rejected').length;
  const todayDisp  = requests.filter(r => r.status === 'dispensed' && new Date(r.dispensedAt).toDateString() === today);
  const totalLitersToday = todayDisp.reduce((s,r) => s+(r.dispensedLiters||0), 0);
  const weeklyLiters     = requests.filter(r => r.status==='dispensed' && new Date(r.dispensedAt)>=oneWeekAgo).reduce((s,r) => s+(r.dispensedLiters||0), 0);
  const diesel = inventory.find(i => i.fuelType === 'Diesel');
  const petrol = inventory.find(i => i.fuelType === 'Petrol');

  const statusData = [
    { name:'Pending',   value:pending,   fill:COLORS.pending },
    { name:'Approved',  value:approved,  fill:COLORS.approved },
    { name:'Dispensed', value:dispensed, fill:COLORS.dispensed },
    { name:'Confirmed', value:confirmed, fill:COLORS.confirmed },
    { name:'Rejected',  value:rejected,  fill:COLORS.rejected },
  ].filter(d => d.value > 0);

  const inventoryData = inventory.map(i => ({
    name: i.fuelType, Available: i.available||0, Capacity: i.capacity||0,
  }));

  const monthlyData = Array.from({ length:6 }, (_,i) => {
    const d = new Date(new Date().getFullYear(), new Date().getMonth()-(5-i), 1);
    const label = d.toLocaleString('default', { month:'short' });
    const m = requests.filter(r => {
      const rd = new Date(r.dispensedAt||r.createdAt);
      return rd.getMonth()===d.getMonth() && rd.getFullYear()===d.getFullYear() && r.status==='dispensed';
    });
    return {
      month: label,
      Diesel: m.filter(r=>r.fuelType==='Diesel').reduce((s,r)=>s+(r.dispensedLiters||0),0),
      Petrol: m.filter(r=>r.fuelType==='Petrol').reduce((s,r)=>s+(r.dispensedLiters||0),0),
    };
  });

  const timeAgo = (d) => {
    const s = Math.floor((Date.now()-new Date(d))/1000);
    if(s<60) return `${s}s ago`;
    if(s<3600) return `${Math.floor(s/60)}m ago`;
    return `${Math.floor(s/3600)}h ago`;
  };

  if (loading) return <div style={{ padding:60, textAlign:'center', color:'#6b7280' }}>Loading dashboard...</div>;

  return (
    <div className="fuel-dash-page">
      <div className="fuel-dash-header">
        <div>
          <h2>Dashboard Overview</h2>
          <p>Fuel Station operational summary and metrics</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:12, color:'#94a3b8' }}>Updated {timeAgo(lastRefresh)}</span>
          <button className="fuel-refresh-btn" onClick={() => { setLoading(true); fetchData(); }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="fuel-kpi-grid">
        {[
          { label:'Dispensed Today',   value:`${totalLitersToday.toFixed(1)}L`, color:'#16a34a', bg:'#dcfce7', icon:<Droplets size={22} color="#16a34a" />, to:'/fuel/transactions' },
          { label:'Pending Requests',  value:pending,   color:'#f59e0b', bg:'#fef3c7', icon:<Clock size={22} color="#f59e0b" />,       to:'/fuel/requests' },
          { label:'Ready to Dispense', value:approved,  color:'#3b82f6', bg:'#dbeafe', icon:<ClipboardList size={22} color="#3b82f6" />, to:'/fuel/dispense' },
          { label:'Diesel Stock',      value:`${diesel?.available||0}L`, color:'#3b82f6', bg:'#dbeafe', icon:<Package size={22} color="#3b82f6" />, to:'/fuel/inventory' },
          { label:'Petrol Stock',      value:`${petrol?.available||0}L`, color:'#f59e0b', bg:'#fef3c7', icon:<Package size={22} color="#f59e0b" />, to:'/fuel/inventory' },
          { label:'Weekly Dispensed',  value:`${weeklyLiters.toFixed(1)}L`, color:'#8b5cf6', bg:'#ede9fe', icon:<CheckCircle size={22} color="#8b5cf6" />, to:'/fuel/reports' },
        ].map((k,i) => (
          <div key={i} className="fuel-kpi-card" style={{ borderTop:`3px solid ${k.color}`, cursor:'pointer' }} onClick={() => navigate(k.to)}>
            <div className="fuel-kpi-icon" style={{ background:k.bg }}>{k.icon}</div>
            <div>
              <div className="fuel-kpi-value" style={{ color:k.color }}>{k.value}</div>
              <div className="fuel-kpi-label">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="fuel-charts-row">
        {/* Donut */}
        <div className="fuel-chart-card">
          <div className="fuel-chart-title">REQUESTS</div>
          <p className="fuel-chart-sub">Status breakdown</p>
          {statusData.length === 0
            ? <div style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>No requests yet</div>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                    paddingAngle={3} dataKey="value" labelLine={false}>
                    {statusData.map((e,i) => <Cell key={i} fill={e.fill} stroke="none" />)}
                    <DonutCenter cx={0} cy={0} total={requests.length} label="Total" />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )
          }
          <div className="fuel-status-rows">
            {[
              { label:'Pending',   value:pending,   color:COLORS.pending },
              { label:'Approved',  value:approved,  color:COLORS.approved },
              { label:'Dispensed', value:dispensed, color:COLORS.dispensed },
              { label:'Confirmed', value:confirmed, color:COLORS.confirmed },
              { label:'Rejected',  value:rejected,  color:COLORS.rejected },
            ].map(s => (
              <div key={s.label} className="fuel-status-row">
                <span className="fuel-status-dot" style={{ background:s.color }} />
                <span className="fuel-status-label">{s.label}</span>
                <div className="fuel-status-bar-track">
                  <div className="fuel-status-bar-fill" style={{ width:`${Math.round((s.value/(requests.length||1))*100)}%`, background:s.color }} />
                </div>
                <span className="fuel-status-val" style={{ color:s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Bar */}
        <div className="fuel-chart-card">
          <div className="fuel-chart-title">INVENTORY</div>
          <p className="fuel-chart-sub">Available vs Capacity (Liters)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={inventoryData} barSize={50} margin={{ top:20, right:20, left:-10, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize:13, fill:'#374151', fontWeight:600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:12, fill:'#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(0,0,0,0.04)' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:12 }} />
              <Bar dataKey="Available" fill="#16a34a" radius={[6,6,0,0]}>
                <LabelList dataKey="Available" position="top" style={{ fontSize:13, fontWeight:700, fill:'#1e293b' }} />
              </Bar>
              <Bar dataKey="Capacity" fill="#e5e7eb" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="fuel-chart-card fuel-chart-full">
        <div className="fuel-chart-title">MONTHLY FUEL DISPENSED</div>
        <p className="fuel-chart-sub">Last 6 months — Diesel vs Petrol (Liters)</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthlyData} margin={{ top:10, right:20, left:-10, bottom:0 }}>
            <defs>
              <linearGradient id="gradD" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradP" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize:12, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:12, fill:'#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:12 }} />
            <Area type="monotone" dataKey="Diesel" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gradD)" dot={{ r:4, fill:'#3b82f6', strokeWidth:0 }} activeDot={{ r:6 }} />
            <Area type="monotone" dataKey="Petrol" stroke="#f59e0b" strokeWidth={2.5} fill="url(#gradP)" dot={{ r:4, fill:'#f59e0b', strokeWidth:0 }} activeDot={{ r:6 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent */}
      {requests.length > 0 && (
        <div className="fuel-recent-card">
          <div className="fuel-recent-header">
            <span>Recent Requests</span>
            <button onClick={() => navigate('/fuel/requests')}>View All →</button>
          </div>
          {requests.slice(0,5).map(r => {
            const color = COLORS[r.status] || '#6b7280';
            return (
              <div key={r._id} className="fuel-recent-item">
                <div>
                  <div style={{ fontWeight:600, fontSize:14, color:'#111827' }}>{r.driverName||'—'}</div>
                  <div style={{ fontSize:12, color:'#6b7280' }}>{r.vehicleType||r.vehiclePlate||'—'} · {r.fuelType} · {r.requestedLiters}L</div>
                </div>
                <span style={{ background:`${color}20`, color, padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>
                  {r.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
