import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { getFuelRequests, dispenseFuel, getCurrentUser } from '../../api/api';

const STATUS_META = {
  pending:   { color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '⏳', label: 'Pending' },
  approved:  { color: '#16a34a', bg: '#f0fdf4', border: '#86efac', icon: '✅', label: 'Ready to Dispense' },
  rejected:  { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '❌', label: 'Rejected' },
  dispensed: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: '⛽', label: 'Dispensed' },
  confirmed: { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: '✓', label: 'Confirmed' },
};

const FUEL_COLORS = {
  Diesel: { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  Petrol: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
};

const fmt = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const FILTERS = ['approved', 'dispensed', 'confirmed', 'pending', 'rejected', 'all'];

export default function FuelRequests() {
  const currentUser = getCurrentUser();
  const [fuelRequests, setFuelRequests] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [filterStatus, setFilterStatus] = useState('approved');
  const [search, setSearch]             = useState('');
  const [selected, setSelected]         = useState(null);
  const [showModal, setShowModal]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage]   = useState(1);
  const PAGE_SIZE = 10;

  const fetchRequests = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getFuelRequests();
      setFuelRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchRequests(false); }, []);

  const handleDispense = async () => {
    setActionLoading(true);
    try {
      const updated = await dispenseFuel(
        selected._id,
        selected.permittedLiters,
        currentUser?.name || currentUser?.username
      );
      setFuelRequests(prev => prev.map(r => r._id === updated._id ? updated : r));
      setShowModal(false);
      setSelected(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const stats = {
    total:     fuelRequests.length,
    pending:   fuelRequests.filter(r => r.status === 'pending').length,
    approved:  fuelRequests.filter(r => r.status === 'approved').length,
    dispensed: fuelRequests.filter(r => r.status === 'dispensed').length,
    totalLiters: fuelRequests
      .filter(r => r.status === 'dispensed' || r.status === 'confirmed')
      .reduce((sum, r) => sum + (r.dispensedLiters || r.permittedLiters || 0), 0),
  };

  const filtered = fuelRequests.filter(r => {
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (r.driverName || '').toLowerCase().includes(q) ||
      (r.vehiclePlate || '').toLowerCase().includes(q) ||
      (r.destination || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // Reset to page 1 whenever filter/search changes
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage   = Math.min(currentPage, totalPages || 1);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div style={{ padding: '28px 28px 48px', maxWidth: 1200, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Fuel Requests</h1>
          </div>
          <p style={{ margin: 0, color: '#64748b', fontSize: 14, paddingLeft: 50 }}>
            Dispense fuel for transport-officer-approved requests
          </p>
        </div>
        <button onClick={() => fetchRequests(true)} disabled={refreshing}
          style={{ padding: '9px 18px', background: refreshing ? '#fef9c3' : '#fffbeb', color: '#d97706', border: '1px solid #fde68a', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: refreshing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: refreshing ? 0.8 : 1 }}>
          <span style={{ display: 'inline-block', animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }}>🔄</span>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>

      {/* ── Charts row ── */}
      {!loading && fuelRequests.length > 0 && (() => {
        // Donut data — request count by status
        const donutData = [
          { name: 'Ready to Dispense', value: stats.approved,  color: '#4ade80' },
          { name: 'Dispensed',         value: stats.dispensed, color: '#60a5fa' },
          { name: 'Pending',           value: stats.pending,   color: '#fbbf24' },
          { name: 'Confirmed',         value: fuelRequests.filter(r => r.status === 'confirmed').length, color: '#c084fc' },
          { name: 'Rejected',          value: fuelRequests.filter(r => r.status === 'rejected').length, color: '#f87171' },
        ].filter(d => d.value > 0);

        // Bar data — liters by fuel type
        const dieselApproved  = fuelRequests.filter(r => r.fuelType === 'Diesel' && r.status === 'approved').reduce((s, r) => s + (r.permittedLiters || 0), 0);
        const dieselDispensed = fuelRequests.filter(r => r.fuelType === 'Diesel' && (r.status === 'dispensed' || r.status === 'confirmed')).reduce((s, r) => s + (r.dispensedLiters || r.permittedLiters || 0), 0);
        const petrolApproved  = fuelRequests.filter(r => r.fuelType === 'Petrol' && r.status === 'approved').reduce((s, r) => s + (r.permittedLiters || 0), 0);
        const petrolDispensed = fuelRequests.filter(r => r.fuelType === 'Petrol' && (r.status === 'dispensed' || r.status === 'confirmed')).reduce((s, r) => s + (r.dispensedLiters || r.permittedLiters || 0), 0);

        const barData = [
          { name: 'Diesel', 'Ready (L)': dieselApproved, 'Dispensed (L)': dieselDispensed },
          { name: 'Petrol', 'Ready (L)': petrolApproved, 'Dispensed (L)': petrolDispensed },
        ];

        const CustomTooltip = ({ active, payload, label }) => {
          if (!active || !payload?.length) return null;
          return (
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>{label}</div>
              {payload.map(p => (
                <div key={p.name} style={{ fontSize: 13, color: p.color, fontWeight: 600 }}>
                  {p.name}: {p.value}L
                </div>
              ))}
            </div>
          );
        };

        const DonutLabel = ({ cx, cy }) => (
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
            <tspan x={cx} dy="-8" style={{ fontSize: 28, fontWeight: 900, fill: '#fff' }}>{stats.total}</tspan>
            <tspan x={cx} dy="22" style={{ fontSize: 11, fill: '#94a3b8' }}>Total</tspan>
          </text>
        );

        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16, marginBottom: 28 }}>

            {/* Donut — request status breakdown */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 16, padding: '22px 24px', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>Request Status Breakdown</div>
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 16 }}>Distribution of all fuel requests</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={52} outerRadius={72}
                      paddingAngle={3} dataKey="value" labelLine={false}>
                      {donutData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <DonutLabel cx={80} cy={80} />
                    <Tooltip formatter={(v, n) => [`${v} requests`, n]} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  {donutData.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{d.name}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: d.color }}>{d.value}</div>
                      </div>
                      {/* Mini progress bar */}
                      <div style={{ width: 40, height: 4, background: '#1e293b', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.round((d.value / stats.total) * 100)}%`, height: '100%', background: d.color, borderRadius: 2 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bar chart — liters by fuel type */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 16, padding: '22px 24px', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>Fuel Volume by Type</div>
                  <div style={{ fontSize: 11, color: '#475569', marginBottom: 16 }}>Liters ready vs dispensed</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#34d399' }}>{stats.totalLiters}L</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>Total dispensed</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} unit="L" />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 600 }} axisLine={false} tickLine={false} width={48} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#64748b', paddingTop: 8 }} />
                  <Bar dataKey="Ready (L)"     fill="#4ade80" radius={[0, 6, 6, 0]} barSize={18} />
                  <Bar dataKey="Dispensed (L)" fill="#60a5fa" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        );
      })()}

      {/* ── Filter + Search bar ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 15 }}>🔍</span>
          <input
            type="text"
            placeholder="Search driver, plate, destination..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            style={{ width: '100%', padding: '9px 14px 9px 36px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Status filters */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map(s => {
            const meta = STATUS_META[s];
            const active = filterStatus === s;
            return (
              <button key={s} onClick={() => { setFilterStatus(s); setCurrentPage(1); }}
                style={{
                  padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 700, transition: 'all 0.2s',
                  background: active ? (meta?.color || '#374151') : '#f1f5f9',
                  color: active ? '#fff' : '#64748b',
                  boxShadow: active ? `0 2px 8px ${(meta?.color || '#374151')}44` : 'none',
                }}>
                {meta?.icon || '📋'} {s === 'all' ? 'All' : meta?.label || s}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⛽</div>
          <div style={{ fontSize: 15 }}>Loading fuel requests...</div>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          {/* Table header bar */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
              Fuel Requests
              <span style={{ marginLeft: 8, background: '#f1f5f9', color: '#64748b', fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>
                {filtered.length}
              </span>
            </span>          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Driver', 'Vehicle', 'Fuel Type', 'Requested', 'Permitted', 'Destination', 'Approved By', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>No requests found</div>
                    </td>
                  </tr>
                ) : paginated.map((r, i) => {
                  const st   = STATUS_META[r.status] || STATUS_META.pending;
                  const fuel = FUEL_COLORS[r.fuelType] || { bg: '#f8fafc', color: '#374151', dot: '#94a3b8' };
                  const isReady = r.status === 'approved';

                  return (
                    <tr key={r._id}
                      style={{ borderBottom: '1px solid #f1f5f9', background: isReady ? '#f0fdf4' : i % 2 === 0 ? '#fff' : '#fafafa', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = isReady ? '#f0fdf4' : i % 2 === 0 ? '#fff' : '#fafafa'}
                    >
                      {/* Driver */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                            {(r.driverName || 'D').charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{r.driverName}</span>
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>
                        <div style={{ fontWeight: 600 }}>{r.vehiclePlate}</div>
                        {r.vehicleModel && <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.vehicleModel}</div>}
                      </td>

                      {/* Fuel Type */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: fuel.bg, color: fuel.color, border: `1px solid ${fuel.dot}44`, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                          {r.fuelType}
                        </span>
                      </td>

                      {/* Requested */}
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                        {r.requestedLiters}L
                      </td>

                      {/* Permitted */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#16a34a' }}>
                          {r.permittedLiters ? `${r.permittedLiters}L` : '—'}
                        </span>
                      </td>

                      {/* Destination */}
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.destination}
                      </td>

                      {/* Approved By */}
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>
                        {r.approvedBy || '—'}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {st.icon} {st.label}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ padding: '12px 16px' }}>
                        {isReady ? (
                          <button
                            onClick={() => { setSelected(r); setShowModal(true); }}
                            style={{ padding: '7px 14px', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(22,163,74,0.3)' }}>
                            ⛽ Dispense
                          </button>
                        ) : r.status === 'dispensed' ? (
                          <span style={{ fontSize: 12, color: '#2563eb', fontWeight: 600 }}>✓ {r.dispensedLiters}L dispensed</span>
                        ) : r.status === 'confirmed' ? (
                          <span style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600 }}>✓ Confirmed</span>
                        ) : (
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && filtered.length > PAGE_SIZE && (() => {
        const pages = [];
        for (let p = 1; p <= totalPages; p++) {
          if (p === 1 || p === totalPages || (p >= safePage - 1 && p <= safePage + 1)) {
            pages.push(p);
          } else if (p === safePage - 2 || p === safePage + 2) {
            pages.push('...');
          }
        }
        const deduped = pages.filter((p, i) => !(p === '...' && pages[i - 1] === '...'));

        const btnStyle = (active, disabled) => ({
          padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
          background: active ? '#2563eb' : disabled ? '#f8fafc' : '#fff',
          color: active ? '#fff' : disabled ? '#cbd5e1' : '#374151',
          fontSize: 13, fontWeight: active ? 700 : 500,
          cursor: disabled ? 'not-allowed' : 'pointer',
          minWidth: 36, textAlign: 'center',
          boxShadow: active ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
          transition: 'all 0.15s',
        });

        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Showing <strong>{(safePage - 1) * PAGE_SIZE + 1}</strong>–<strong>{Math.min(safePage * PAGE_SIZE, filtered.length)}</strong> of <strong>{filtered.length}</strong> requests
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button style={btnStyle(false, safePage === 1)} disabled={safePage === 1}
                onClick={() => setCurrentPage(1)}>«</button>
              <button style={btnStyle(false, safePage === 1)} disabled={safePage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>‹ Prev</button>
              {deduped.map((p, i) =>
                p === '...'
                  ? <span key={`e${i}`} style={{ padding: '7px 4px', color: '#94a3b8', fontSize: 13 }}>…</span>
                  : <button key={p} style={btnStyle(p === safePage, false)}
                      onClick={() => setCurrentPage(p)}>{p}</button>
              )}
              <button style={btnStyle(false, safePage === totalPages)} disabled={safePage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>Next ›</button>
              <button style={btnStyle(false, safePage === totalPages)} disabled={safePage === totalPages}
                onClick={() => setCurrentPage(totalPages)}>»</button>
            </div>
          </div>
        );
      })()}

      {/* ── Dispense Modal ── */}
      {showModal && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={() => setShowModal(false)}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 28 }}>⛽</span>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Dispense Fuel</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Confirm and release fuel to driver</div>
                </div>
              </div>
              <button onClick={() => setShowModal(false)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ×
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Driver + vehicle info */}
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20, background: '#f8fafc', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 20, flexShrink: 0 }}>
                  {(selected.driverName || 'D').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>{selected.driverName}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>{selected.vehiclePlate}{selected.vehicleModel ? ` · ${selected.vehicleModel}` : ''}</div>
                </div>
              </div>

              {/* Trip details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', marginBottom: 20 }}>
                {[
                  ['Destination', selected.destination],
                  ['Purpose',     selected.purpose],
                  ['Fuel Type',   selected.fuelType],
                  ['Approved By', selected.approvedBy],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Fuel amount highlight */}
              <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1.5px solid #86efac', borderRadius: 14, padding: '18px 20px', marginBottom: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Amount to Dispense</div>
                <div style={{ fontSize: 48, fontWeight: 900, color: '#15803d', lineHeight: 1 }}>
                  {selected.permittedLiters}
                  <span style={{ fontSize: 20, fontWeight: 600, color: '#16a34a', marginLeft: 4 }}>Liters</span>
                </div>
                <div style={{ fontSize: 12, color: '#16a34a', marginTop: 6 }}>
                  🛢 {selected.fuelType} · Set by Transport Officer
                </div>
                {selected.requestedLiters && selected.requestedLiters !== selected.permittedLiters && (
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                    Driver requested {selected.requestedLiters}L
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleDispense} disabled={actionLoading}
                  style={{
                    flex: 1, padding: '14px', background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 16px rgba(22,163,74,0.35)',
                    opacity: actionLoading ? 0.7 : 1,
                  }}>
                  {actionLoading ? '⏳ Dispensing...' : `⛽ Confirm — Dispense ${selected.permittedLiters}L`}
                </button>
                <button onClick={() => setShowModal(false)}
                  style={{ padding: '14px 20px', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
