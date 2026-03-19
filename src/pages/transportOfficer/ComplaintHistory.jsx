import { useState, useMemo } from 'react';
import {
  Search, Filter, Download, ChevronDown, Calendar,
  User, Car, Hash, FileText, CheckCircle2, Clock,
  AlertTriangle, ShieldAlert, Wrench, Users, Fuel,
  TrendingUp, BarChart2, Eye, X
} from 'lucide-react';
import './complaintHistory.css';

// ─── Shared sample data (in real app, this comes from a shared store/API) ───
const ALL_COMPLAINTS = [
  {
    id: 'COMP-001', sender: 'Dr. Ahmed Hassan', role: 'User',
    vehicle: 'HU-VH-001 Toyota Hiace', driver: 'Abdi Mohammed',
    tripId: 'TRIP-2024-045', category: 'Mechanical',
    description: 'Air conditioning not working properly. Passengers were uncomfortable during the 4-hour trip.',
    priority: 'Medium', status: 'Resolved', dateSubmitted: '2024-03-14',
    resolvedAt: '2024-03-15', actions: ['Mark Vehicle Out of Service', 'Create Maintenance Ticket'],
    resolutionNotes: 'AC unit replaced. Vehicle returned to service after inspection.',
    driverAtFault: false,
  },
  {
    id: 'COMP-002', sender: 'Ato Mulugeta', role: 'Driver',
    vehicle: 'HU-VH-003 Isuzu D-Max', driver: 'Ato Mulugeta',
    tripId: 'TRIP-2024-041', category: 'Resource',
    description: 'Fuel allocation was insufficient for the assigned route. Had to stop mid-trip.',
    priority: 'High', status: 'Resolved', dateSubmitted: '2024-03-13',
    resolvedAt: '2024-03-14', actions: ['Fuel Deduction', 'Conduct Audit'],
    resolutionNotes: 'Fuel allocation policy reviewed and updated for long routes.',
    driverAtFault: false,
  },
  {
    id: 'COMP-003', sender: 'Prof. Sarah Johnson', role: 'User',
    vehicle: 'HU-VH-002 Toyota Coaster', driver: 'Fatuma Ahmed',
    tripId: 'TRIP-2024-038', category: 'Behavioral',
    description: 'Driver was rude to passengers and used phone while driving.',
    priority: 'High', status: 'Resolved', dateSubmitted: '2024-03-12',
    resolvedAt: '2024-03-13', actions: ['Add to Driver File Record', 'Schedule Counseling', 'Issue Behavioral Warning'],
    resolutionNotes: 'Driver counseled. Formal warning added to file. Follow-up in 30 days.',
    driverAtFault: true,
  },
  {
    id: 'COMP-004', sender: 'W/ro Hanan', role: 'Driver',
    vehicle: 'HU-VH-002 Toyota Coaster', driver: 'W/ro Hanan',
    tripId: 'TRIP-2024-035', category: 'Safety',
    description: 'Brake system needs immediate attention. Noticed unusual noise and reduced braking efficiency.',
    priority: 'Critical', status: 'Resolved', dateSubmitted: '2024-03-11',
    resolvedAt: '2024-03-11', actions: ['Issue Warning', 'Vehicle Inspection'],
    resolutionNotes: 'Brake pads replaced. Full safety inspection passed. Vehicle cleared.',
    driverAtFault: false,
  },
  {
    id: 'COMP-005', sender: 'Mr. Tesfaye Bekele', role: 'User',
    vehicle: 'HU-VH-004 Land Cruiser', driver: 'Meron Bekele',
    tripId: 'TRIP-2024-030', category: 'Service',
    description: 'Route taken was unnecessarily long, adding 2 hours to the trip.',
    priority: 'Low', status: 'Resolved', dateSubmitted: '2024-03-10',
    resolvedAt: '2024-03-12', actions: ['Route Optimization', 'Schedule Adjustment'],
    resolutionNotes: 'Route updated in system. Driver briefed on optimized path.',
    driverAtFault: false,
  },
  {
    id: 'COMP-006', sender: 'Dr. Liya Tadesse', role: 'User',
    vehicle: 'HU-VH-001 Toyota Hiace', driver: 'Abdi Mohammed',
    tripId: 'TRIP-2024-028', category: 'Safety',
    description: 'Driver was speeding on the highway and ignored passenger requests to slow down.',
    priority: 'High', status: 'In Progress', dateSubmitted: '2024-03-09',
    resolvedAt: null, actions: ['Issue Warning', 'Schedule Safety Training'],
    resolutionNotes: 'Training scheduled for next week.',
    driverAtFault: true,
  },
  {
    id: 'COMP-007', sender: 'Ato Girma Wolde', role: 'User',
    vehicle: 'HU-VH-003 Isuzu D-Max', driver: 'Fatuma Ahmed',
    tripId: 'TRIP-2024-022', category: 'Behavioral',
    description: 'Driver arrived 45 minutes late without prior notification.',
    priority: 'Medium', status: 'Resolved', dateSubmitted: '2024-03-05',
    resolvedAt: '2024-03-06', actions: ['Add to Driver File Record', 'Issue Behavioral Warning'],
    resolutionNotes: 'Driver warned. Punctuality policy reinforced.',
    driverAtFault: true,
  },
  {
    id: 'COMP-008', sender: 'Ms. Hiwot Alemu', role: 'User',
    vehicle: 'HU-VH-004 Land Cruiser', driver: 'Meron Bekele',
    tripId: 'TRIP-2024-018', category: 'Mechanical',
    description: 'Vehicle had a flat tire mid-journey with no spare available.',
    priority: 'High', status: 'Resolved', dateSubmitted: '2024-02-28',
    resolvedAt: '2024-03-01', actions: ['Mark Vehicle Out of Service', 'Create Maintenance Ticket'],
    resolutionNotes: 'Spare tire policy updated. All vehicles now carry two spares.',
    driverAtFault: false,
  },
];

const STATUSES = ['All', 'Pending', 'In Progress', 'Resolved'];
const ROLES = ['All', 'User', 'Driver'];
const CATEGORIES = ['All', 'Resource', 'Safety', 'Mechanical', 'Behavioral', 'Service'];
const PRIORITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];

const PRIORITY_COLORS = { Critical: '#dc2626', High: '#f59e0b', Medium: '#3b82f6', Low: '#22c55e' };
const STATUS_COLORS = { Pending: '#f59e0b', 'In Progress': '#3b82f6', Resolved: '#22c55e' };
const CATEGORY_ICONS = {
  Resource: <Fuel size={13} />, Safety: <ShieldAlert size={13} />,
  Mechanical: <Wrench size={13} />, Behavioral: <Users size={13} />, Service: <Clock size={13} />,
};

function FilterSelect({ icon, value, onChange, options, placeholder }) {
  return (
    <div className="ch-filter-wrap">
      {icon && <span className="ch-filter-icon">{icon}</span>}
      <select value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o} value={o}>{o === 'All' ? (placeholder || 'All') : o}</option>)}
      </select>
      <ChevronDown size={12} className="ch-chevron" />
    </div>
  );
}

export default function ComplaintHistory() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [driverFilter, setDriverFilter] = useState('All');
  const [senderFilter, setSenderFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [detailItem, setDetailItem] = useState(null);
  const PER_PAGE = 6;

  // Unique drivers and senders for individual filter
  const drivers = useMemo(() => ['All', ...new Set(ALL_COMPLAINTS.map(c => c.driver))], []);
  const senders = useMemo(() => ['All', ...new Set(ALL_COMPLAINTS.map(c => c.sender))], []);

  const filtered = useMemo(() => {
    return ALL_COMPLAINTS.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.id.toLowerCase().includes(q) ||
        c.sender.toLowerCase().includes(q) || c.driver.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) || c.tripId.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchRole = roleFilter === 'All' || c.role === roleFilter;
      const matchCat = categoryFilter === 'All' || c.category === categoryFilter;
      const matchPri = priorityFilter === 'All' || c.priority === priorityFilter;
      const matchDriver = driverFilter === 'All' || c.driver === driverFilter;
      const matchSender = senderFilter === 'All' || c.sender === senderFilter;
      const matchFrom = !dateFrom || c.dateSubmitted >= dateFrom;
      const matchTo = !dateTo || c.dateSubmitted <= dateTo;
      return matchSearch && matchStatus && matchRole && matchCat && matchPri && matchDriver && matchSender && matchFrom && matchTo;
    });
  }, [search, statusFilter, roleFilter, categoryFilter, priorityFilter, driverFilter, senderFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Summary stats from filtered set
  const stats = useMemo(() => ({
    total: filtered.length,
    resolved: filtered.filter(c => c.status === 'Resolved').length,
    inProgress: filtered.filter(c => c.status === 'In Progress').length,
    driverFault: filtered.filter(c => c.driverAtFault).length,
    resolutionRate: filtered.length
      ? Math.round((filtered.filter(c => c.status === 'Resolved').length / filtered.length) * 100)
      : 0,
  }), [filtered]);

  const resetFilters = () => {
    setSearch(''); setStatusFilter('All'); setRoleFilter('All');
    setCategoryFilter('All'); setPriorityFilter('All');
    setDriverFilter('All'); setSenderFilter('All');
    setDateFrom(''); setDateTo(''); setPage(1);
  };

  const hasActiveFilters = search || statusFilter !== 'All' || roleFilter !== 'All' ||
    categoryFilter !== 'All' || priorityFilter !== 'All' || driverFilter !== 'All' ||
    senderFilter !== 'All' || dateFrom || dateTo;

  const exportCSV = () => {
    const headers = ['ID', 'Sender', 'Role', 'Driver', 'Vehicle', 'Trip ID', 'Category', 'Priority', 'Status', 'Date Submitted', 'Resolved At', 'Driver At Fault', 'Actions', 'Notes'];
    const rows = filtered.map(c => [
      c.id, c.sender, c.role, c.driver, c.vehicle, c.tripId,
      c.category, c.priority, c.status, c.dateSubmitted,
      c.resolvedAt || '-', c.driverAtFault ? 'Yes' : 'No',
      (c.actions || []).join('; '), c.resolutionNotes || '-'
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `complaint-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="ch-page">

      {/* Header */}
      <div className="ch-header">
        <div>
          <h1>Complaint History</h1>
          <p>Full audit trail of all complaints with resolution details</p>
        </div>
        <button className="ch-export-btn" onClick={exportCSV}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Summary Stats */}
      <div className="ch-stats">
        <div className="ch-stat">
          <div className="ch-stat-icon total"><BarChart2 size={17} /></div>
          <div><div className="ch-stat-val">{stats.total}</div><div className="ch-stat-lbl">Filtered Total</div></div>
        </div>
        <div className="ch-stat">
          <div className="ch-stat-icon resolved"><CheckCircle2 size={17} /></div>
          <div><div className="ch-stat-val">{stats.resolved}</div><div className="ch-stat-lbl">Resolved</div></div>
        </div>
        <div className="ch-stat">
          <div className="ch-stat-icon progress"><Clock size={17} /></div>
          <div><div className="ch-stat-val">{stats.inProgress}</div><div className="ch-stat-lbl">In Progress</div></div>
        </div>
        <div className="ch-stat">
          <div className="ch-stat-icon fault"><AlertTriangle size={17} /></div>
          <div><div className="ch-stat-val">{stats.driverFault}</div><div className="ch-stat-lbl">Driver at Fault</div></div>
        </div>
        <div className="ch-stat">
          <div className="ch-stat-icon rate"><TrendingUp size={17} /></div>
          <div><div className="ch-stat-val">{stats.resolutionRate}%</div><div className="ch-stat-lbl">Resolution Rate</div></div>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="ch-filters-panel">
        <div className="ch-filters-row">
          {/* Search */}
          <div className="ch-search">
            <Search size={14} />
            <input
              placeholder="Search ID, sender, driver, trip..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Date Range */}
          <div className="ch-date-range">
            <Calendar size={14} className="ch-date-icon" />
            <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} title="From date" />
            <span className="ch-date-sep">—</span>
            <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} title="To date" />
          </div>

          {hasActiveFilters && (
            <button className="ch-reset-btn" onClick={resetFilters}>
              <X size={13} /> Clear Filters
            </button>
          )}
        </div>

        <div className="ch-filters-row">
          <FilterSelect icon={<Filter size={13} />} value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} options={STATUSES} placeholder="All Statuses" />
          <FilterSelect value={roleFilter} onChange={v => { setRoleFilter(v); setPage(1); }} options={ROLES} placeholder="All Roles" />
          <FilterSelect value={categoryFilter} onChange={v => { setCategoryFilter(v); setPage(1); }} options={CATEGORIES} placeholder="All Categories" />
          <FilterSelect value={priorityFilter} onChange={v => { setPriorityFilter(v); setPage(1); }} options={PRIORITIES} placeholder="All Priorities" />
          <FilterSelect icon={<User size={13} />} value={senderFilter} onChange={v => { setSenderFilter(v); setPage(1); }} options={senders} placeholder="All Senders" />
          <FilterSelect icon={<Car size={13} />} value={driverFilter} onChange={v => { setDriverFilter(v); setPage(1); }} options={drivers} placeholder="All Drivers" />
        </div>
      </div>

      {/* Table */}
      <div className="ch-table-wrap">
        <div className="ch-table-meta">
          <span>{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</span>
        </div>
        <table className="ch-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sender / Role</th>
              <th>Driver</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Resolved</th>
              <th>Fault</th>
              <th>Actions Taken</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(c => (
              <tr key={c.id}>
                <td><span className="ch-id">{c.id}</span></td>
                <td>
                  <div className="ch-sender">{c.sender}</div>
                  <span className={`ch-role-badge ${c.role.toLowerCase()}`}>{c.role}</span>
                </td>
                <td>
                  <div className="ch-driver">{c.driver}</div>
                  <div className="ch-vehicle-sm">{c.vehicle.split(' ').slice(0, 2).join(' ')}</div>
                </td>
                <td>
                  <span className="ch-cat-tag">
                    {CATEGORY_ICONS[c.category]} {c.category}
                  </span>
                </td>
                <td>
                  <span className="ch-priority" style={{ color: PRIORITY_COLORS[c.priority] }}>
                    <span className="ch-dot" style={{ background: PRIORITY_COLORS[c.priority] }} />
                    {c.priority}
                  </span>
                </td>
                <td>
                  <span className="ch-status" style={{ color: STATUS_COLORS[c.status], background: STATUS_COLORS[c.status] + '18' }}>
                    {c.status}
                  </span>
                </td>
                <td><span className="ch-date">{c.dateSubmitted}</span></td>
                <td><span className="ch-date">{c.resolvedAt || '—'}</span></td>
                <td>
                  {c.driverAtFault
                    ? <span className="ch-fault yes">Yes</span>
                    : <span className="ch-fault no">No</span>}
                </td>
                <td>
                  <div className="ch-actions-taken">
                    {(c.actions || []).slice(0, 2).map((a, i) => (
                      <span key={i} className="ch-action-chip">{a}</span>
                    ))}
                    {(c.actions || []).length > 2 && (
                      <span className="ch-action-more">+{c.actions.length - 2}</span>
                    )}
                  </div>
                </td>
                <td>
                  <button className="ch-view-btn" onClick={() => setDetailItem(c)}>
                    <Eye size={13} /> View
                  </button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan="11" className="ch-empty">
                  <FileText size={28} />
                  <p>No records match your filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="ch-pagination">
          <span className="ch-page-info">
            {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div className="ch-page-controls">
            <button className="ch-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} className={`ch-page-num ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>
                {i + 1}
              </button>
            ))}
            <button className="ch-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailItem && (
        <div className="ch-detail-overlay" onClick={() => setDetailItem(null)}>
          <div className="ch-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="ch-detail-header">
              <div>
                <h2>Complaint Detail</h2>
                <span className="ch-detail-id">{detailItem.id}</span>
              </div>
              <button className="ch-detail-close" onClick={() => setDetailItem(null)}><X size={18} /></button>
            </div>

            <div className="ch-detail-body">
              <div className="ch-detail-grid">
                <div className="ch-detail-row"><span className="ch-dl">Sender</span><span>{detailItem.sender} <em className="ch-role-em">({detailItem.role})</em></span></div>
                <div className="ch-detail-row"><span className="ch-dl">Driver</span><span>{detailItem.driver}</span></div>
                <div className="ch-detail-row"><span className="ch-dl">Vehicle</span><span>{detailItem.vehicle}</span></div>
                <div className="ch-detail-row"><span className="ch-dl">Trip ID</span><span>{detailItem.tripId}</span></div>
                <div className="ch-detail-row"><span className="ch-dl">Category</span><span>{detailItem.category}</span></div>
                <div className="ch-detail-row"><span className="ch-dl">Priority</span>
                  <span style={{ color: PRIORITY_COLORS[detailItem.priority], fontWeight: 600 }}>{detailItem.priority}</span>
                </div>
                <div className="ch-detail-row"><span className="ch-dl">Status</span>
                  <span className="ch-status" style={{ color: STATUS_COLORS[detailItem.status], background: STATUS_COLORS[detailItem.status] + '18' }}>{detailItem.status}</span>
                </div>
                <div className="ch-detail-row"><span className="ch-dl">Submitted</span><span>{detailItem.dateSubmitted}</span></div>
                <div className="ch-detail-row"><span className="ch-dl">Resolved</span><span>{detailItem.resolvedAt || '—'}</span></div>
                <div className="ch-detail-row"><span className="ch-dl">Driver at Fault</span>
                  <span className={`ch-fault ${detailItem.driverAtFault ? 'yes' : 'no'}`}>{detailItem.driverAtFault ? 'Yes' : 'No'}</span>
                </div>
              </div>

              <div className="ch-detail-section">
                <div className="ch-detail-section-title"><FileText size={14} /> Description</div>
                <p className="ch-detail-text">{detailItem.description}</p>
              </div>

              <div className="ch-detail-section">
                <div className="ch-detail-section-title"><CheckCircle2 size={14} /> Actions Taken</div>
                <div className="ch-detail-actions">
                  {(detailItem.actions || []).map((a, i) => (
                    <span key={i} className="ch-action-chip">{a}</span>
                  ))}
                </div>
              </div>

              {detailItem.resolutionNotes && (
                <div className="ch-detail-section">
                  <div className="ch-detail-section-title"><Hash size={14} /> Resolution Notes</div>
                  <p className="ch-detail-text">{detailItem.resolutionNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
