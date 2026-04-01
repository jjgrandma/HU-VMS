import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { getFuelRecords, getVehicles, deleteFuelRecord } from '../../api/api';
import ExportButton from '../../components/ExportButton';
import Pagination from '../../components/Pagination';
import ReportFilters, { filterByDate } from '../../components/ReportFilters';
import './adminTheme.css';
import './fuelRecordsReport.css';

const Toast = ({ msg, type }) => msg ? (
  <div style={{
    position: 'fixed', top: 20, right: 20, zIndex: 9999,
    background: type === 'error' ? '#ef4444' : '#22c55e',
    color: '#fff', padding: '10px 20px', borderRadius: 10,
    fontWeight: 600, fontSize: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  }}>{msg}</div>
) : null;

const EMPTY_FORM = {
  vehicle: '', fuelType: 'Diesel', quantity: '', cost: '', odometer: '', date: '',
};

const FuelRecordsReport = () => {
  const [records, setRecords]     = useState([]);
  const [vehicles, setVehicles]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState({ msg: '', type: 'success' });
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterFuelType, setFilterFuelType] = useState('All');
  const [period, setPeriod]             = useState('all');
  const [currentPage, setCurrentPage]   = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    Promise.all([getFuelRecords(), getVehicles()])
      .then(([recs, vehs]) => { setRecords(recs); setVehicles(vehs); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!form.vehicle)  return showToast('Select a vehicle', 'error');
    if (!form.quantity) return showToast('Quantity is required', 'error');
    if (!form.cost)     return showToast('Cost is required', 'error');
    setSaving(true);
    try {
      const veh = vehicles.find(v => v._id === form.vehicle);
      const rec = await createFuelRecord({
        vehicle:     form.vehicle,
        plateNumber: veh?.plateNumber || '',
        model:       veh?.model || '',
        fuelType:    form.fuelType,
        quantity:    Number(form.quantity),
        cost:        Number(form.cost),
        odometer:    Number(form.odometer) || 0,
        date:        form.date || new Date().toISOString(),
      });
      setRecords(r => [rec, ...r]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      showToast('Fuel record added');
    } catch (err) {
      showToast(err.message, 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await deleteFuelRecord(id);
      setRecords(r => r.filter(x => x._id !== id));
      showToast('Record deleted');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const filtered = filterByDate(records, period, 'date').filter(r => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      (r.plateNumber || r.vehicle?.plateNumber || '').toLowerCase().includes(q) ||
      (r.model || r.vehicle?.model || '').toLowerCase().includes(q) ||
      (r.driverName || r.driver?.name || '').toLowerCase().includes(q);
    const matchFuel = filterFuelType === 'All' || r.fuelType === filterFuelType;
    return matchSearch && matchFuel;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const current    = filtered.slice(startIndex, startIndex + itemsPerPage);

  const totalQty  = records.reduce((s, r) => s + (r.quantity || 0), 0);
  const totalCost = records.reduce((s, r) => s + (r.cost || 0), 0);

  // Bar chart: fuel by type
  const fuelByType = ['Diesel','Gasoline','Electric','Hybrid'].map(type => ({
    name: type,
    Quantity: records.filter(r => r.fuelType === type).reduce((s,r) => s + (r.quantity||0), 0),
    Cost:     records.filter(r => r.fuelType === type).reduce((s,r) => s + (r.cost||0), 0),
  })).filter(d => d.Quantity > 0);

  // Bar chart: top 6 vehicles by fuel consumed
  const vehicleMap = {};
  records.forEach(r => {
    const plate = r.plateNumber || r.vehicle?.plateNumber || 'Unknown';
    if (!vehicleMap[plate]) vehicleMap[plate] = { name: plate, Quantity: 0, Cost: 0 };
    vehicleMap[plate].Quantity += r.quantity || 0;
    vehicleMap[plate].Cost     += r.cost || 0;
  });
  const topVehicles = Object.values(vehicleMap).sort((a,b) => b.Quantity - a.Quantity).slice(0, 6);

  // Monthly trend — last 6 months
  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = d.toLocaleString('default', { month: 'short' });
    const monthRecs = records.filter(r => {
      const rd = new Date(r.date || r.createdAt);
      return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
    });
    return {
      month: label,
      Quantity: parseFloat(monthRecs.reduce((s,r) => s + (r.quantity||0), 0).toFixed(1)),
      Cost:     monthRecs.reduce((s,r) => s + (r.cost||0), 0),
    };
  });

  const exportData = filtered.map(r => ({
    Plate:    r.plateNumber || r.vehicle?.plateNumber || '—',
    Model:    r.model || r.vehicle?.model || '—',
    Date:     r.date ? new Date(r.date).toLocaleDateString() : '—',
    FuelType: r.fuelType,
    Quantity: `${r.quantity} L`,
    Cost:     `${r.cost} ETB`,
    Odometer: `${r.odometer} km`,
    Driver:   r.driverName || r.driver?.name || '—',
  }));

  return (
    <div className="fuel-records-container">
      <Toast msg={toast.msg} type={toast.type} />

      <div className="report-header">
        <h1>Fuel Records Report</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <ExportButton data={exportData} filename="fuel_records_report" reportTitle="Fuel Records Report" />
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:'Total Fuel',    value:`${totalQty.toFixed(1)} L`,          color:'#3b82f6', bg:'#dbeafe', icon:'⛽' },
          { label:'Total Cost',    value:`${totalCost.toLocaleString()} ETB`,  color:'#16a34a', bg:'#dcfce7', icon:'💰' },
          { label:'Total Records', value: records.length,                      color:'#8b5cf6', bg:'#ede9fe', icon:'📊' },
        ].map((k,i) => (
          <div key={i} style={{ background:'#fff', border:`1px solid #e5e7eb`, borderTop:`3px solid ${k.color}`, borderRadius:12, padding:'18px 20px', display:'flex', alignItems:'center', gap:14, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width:44, height:44, background:k.bg, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{k.icon}</div>
            <div>
              <div style={{ fontSize:22, fontWeight:800, color:k.color }}>{k.value}</div>
              <div style={{ fontSize:12, color:'#6b7280', marginTop:2 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1.2fr', gap:20, marginBottom:24 }}>

        {/* Fuel by Type */}
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, color:'#111827', marginBottom:4 }}>Fuel by Type</div>
          <div style={{ fontSize:12, color:'#6b7280', marginBottom:12 }}>Total liters per fuel type</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={fuelByType} barSize={36} margin={{ top:4, right:8, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize:12, fill:'#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:12, fill:'#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill:'rgba(0,0,0,0.04)' }} formatter={(v) => [`${v} L`, 'Quantity']} />
              <Bar dataKey="Quantity" radius={[6,6,0,0]}>
                {fuelByType.map((_, i) => <Cell key={i} fill={['#3b82f6','#16a34a','#f59e0b','#8b5cf6'][i % 4]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Vehicles */}
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, color:'#111827', marginBottom:4 }}>Top Vehicles</div>
          <div style={{ fontSize:12, color:'#6b7280', marginBottom:12 }}>By fuel consumption (L)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topVehicles} barSize={20} layout="vertical" margin={{ top:4, right:20, left:10, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize:11, fill:'#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:'#374151' }} axisLine={false} tickLine={false} width={70} />
              <Tooltip cursor={{ fill:'rgba(0,0,0,0.04)' }} formatter={(v) => [`${v} L`, 'Fuel']} />
              <Bar dataKey="Quantity" fill="#3b82f6" radius={[0,6,6,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend */}
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, color:'#111827', marginBottom:4 }}>Monthly Trend</div>
          <div style={{ fontSize:12, color:'#6b7280', marginBottom:12 }}>Last 6 months fuel usage</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barSize={14} margin={{ top:4, right:8, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize:12, fill:'#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:12, fill:'#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill:'rgba(0,0,0,0.04)' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:12 }} />
              <Bar dataKey="Quantity" name="Fuel (L)"    fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <ReportFilters period={period} onPeriod={p => { setPeriod(p); setCurrentPage(1); }} />

      {/* Filters */}
      <div className="controls-bar">
        <input type="text" placeholder="Search by plate, model or driver..."
          value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="search-input" />
        <select value={filterFuelType}
          onChange={e => { setFilterFuelType(e.target.value); setCurrentPage(1); }}
          className="filter-select">
          <option value="All">All Fuel Types</option>
          <option>Diesel</option><option>Gasoline</option><option>Electric</option><option>Hybrid</option>
        </select>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>Loading...</p>
      ) : (
        <>
          <div style={{ width:'100%', overflowX:'auto', WebkitOverflowScrolling:'touch', borderRadius:12, border:'2px solid #16a34a', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
            <table className="fuel-table" style={{ minWidth:900, width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>
                  <th>#</th><th>Plate</th><th>Model</th><th>Date</th>
                  <th>Fuel Type</th><th>Quantity</th><th>Cost (ETB)</th><th>Odometer</th><th>Driver</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {current.map((r, i) => (
                  <tr key={r._id}>
                    <td>{startIndex + i + 1}</td>
                    <td>{r.plateNumber || r.vehicle?.plateNumber || '—'}</td>
                    <td>{r.model || r.vehicle?.model || '—'}</td>
                    <td>{r.date ? new Date(r.date).toLocaleDateString() : '—'}</td>
                    <td><span className="fuel-type-badge">{r.fuelType}</span></td>
                    <td>{r.quantity} L</td>
                    <td>{r.cost?.toLocaleString()}</td>
                    <td>{r.odometer} km</td>
                    <td>{r.driverName || r.driver?.name || '—'}</td>
                    <td>
                      <button onClick={() => handleDelete(r._id)}
                        style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                          borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 13 }}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="no-results">No fuel records found. Click "+ Add Record" to add one.</div>}
          </div>

          {filtered.length > 0 && (
            <Pagination
              currentPage={currentPage} totalPages={totalPages}
              onPageChange={setCurrentPage} totalItems={filtered.length}
              startIndex={startIndex} itemsPerPage={itemsPerPage}
              onItemsPerPageChange={n => { setItemsPerPage(n); setCurrentPage(1); }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default FuelRecordsReport;
