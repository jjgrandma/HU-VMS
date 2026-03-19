import { useState } from 'react';
import {
  Search, Filter, MessageSquare, AlertCircle, CheckCircle2,
  Clock, ShieldAlert, Wrench, Users, Fuel, ChevronDown
} from 'lucide-react';
import ComplaintResolutionToolkit from './ComplaintResolutionToolkit';
import './complaints.css';

// ─── Sample Data ─────────────────────────────────────────────────────────────
const INITIAL_COMPLAINTS = [
  {
    id: 'COMP-001', sender: 'Dr. Ahmed Hassan', role: 'User',
    vehicle: 'HU-VH-001 Toyota Hiace', driver: 'Abdi Mohammed',
    tripId: 'TRIP-2024-045', category: 'Mechanical',
    description: 'Air conditioning not working properly. Passengers were uncomfortable during the 4-hour trip.',
    priority: 'Medium', status: 'Pending', dateSubmitted: '2024-03-14',
  },
  {
    id: 'COMP-002', sender: 'Ato Mulugeta', role: 'Driver',
    vehicle: 'HU-VH-003 Isuzu D-Max', driver: 'Ato Mulugeta',
    tripId: 'TRIP-2024-041', category: 'Resource',
    description: 'Fuel allocation was insufficient for the assigned route. Had to stop mid-trip.',
    priority: 'High', status: 'In Progress', dateSubmitted: '2024-03-13',
  },
  {
    id: 'COMP-003', sender: 'Prof. Sarah Johnson', role: 'User',
    vehicle: 'HU-VH-002 Toyota Coaster', driver: 'Fatuma Ahmed',
    tripId: 'TRIP-2024-038', category: 'Behavioral',
    description: 'Driver was rude to passengers and used phone while driving.',
    priority: 'High', status: 'Pending', dateSubmitted: '2024-03-12',
  },
  {
    id: 'COMP-004', sender: 'W/ro Hanan', role: 'Driver',
    vehicle: 'HU-VH-002 Toyota Coaster', driver: 'W/ro Hanan',
    tripId: 'TRIP-2024-035', category: 'Safety',
    description: 'Brake system needs immediate attention. Noticed unusual noise and reduced braking efficiency.',
    priority: 'Critical', status: 'Pending', dateSubmitted: '2024-03-11',
  },
  {
    id: 'COMP-005', sender: 'Mr. Tesfaye Bekele', role: 'User',
    vehicle: 'HU-VH-004 Land Cruiser', driver: 'Meron Bekele',
    tripId: 'TRIP-2024-030', category: 'Service',
    description: 'Route taken was unnecessarily long, adding 2 hours to the trip. Needs optimization.',
    priority: 'Low', status: 'Resolved', dateSubmitted: '2024-03-10',
  },
  {
    id: 'COMP-006', sender: 'Dr. Liya Tadesse', role: 'User',
    vehicle: 'HU-VH-001 Toyota Hiace', driver: 'Abdi Mohammed',
    tripId: 'TRIP-2024-028', category: 'Safety',
    description: 'Driver was speeding on the highway and ignored passenger requests to slow down.',
    priority: 'High', status: 'Pending', dateSubmitted: '2024-03-09',
  },
];

const CATEGORIES = ['All', 'Resource', 'Safety', 'Mechanical', 'Behavioral', 'Service'];
const STATUSES = ['All', 'Pending', 'In Progress', 'Resolved'];
const ROLES = ['All', 'User', 'Driver'];

const PRIORITY_COLORS = { Critical: '#dc2626', High: '#f59e0b', Medium: '#3b82f6', Low: '#22c55e' };
const STATUS_COLORS = { Pending: '#f59e0b', 'In Progress': '#3b82f6', Resolved: '#22c55e' };

const CATEGORY_ICONS = {
  Resource: <Fuel size={14} />,
  Safety: <ShieldAlert size={14} />,
  Mechanical: <Wrench size={14} />,
  Behavioral: <Users size={14} />,
  Service: <Clock size={14} />,
};

export default function Complaints() {
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [toolkitComplaint, setToolkitComplaint] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 6;

  const filtered = complaints.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = c.id.toLowerCase().includes(q) || c.sender.toLowerCase().includes(q) ||
      c.driver.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    return matchSearch &&
      (statusFilter === 'All' || c.status === statusFilter) &&
      (roleFilter === 'All' || c.role === roleFilter) &&
      (categoryFilter === 'All' || c.category === categoryFilter);
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
  };

  const handleResolve = (resolution) => {
    setComplaints(prev => prev.map(c =>
      c.id === resolution.complaintId
        ? { ...c, status: 'Resolved', resolution }
        : c
    ));
    setToolkitComplaint(null);
    alert(`✅ Complaint ${resolution.complaintId} resolved successfully.\n\nActions taken: ${resolution.actions.map(a => a.label).join(', ')}`);
  };

  return (
    <div className="complaints-page">

      {/* Page Header */}
      <div className="cp-header">
        <div>
          <h1>Complaint Management</h1>
          <p>Review, investigate, and resolve transport complaints</p>
        </div>
      </div>

      {/* Stats */}
      <div className="cp-stats">
        <div className="cp-stat-card">
          <div className="cp-stat-icon total"><MessageSquare size={18} /></div>
          <div><div className="cp-stat-val">{stats.total}</div><div className="cp-stat-lbl">Total</div></div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-icon pending"><AlertCircle size={18} /></div>
          <div><div className="cp-stat-val">{stats.pending}</div><div className="cp-stat-lbl">Pending</div></div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-icon progress"><Clock size={18} /></div>
          <div><div className="cp-stat-val">{stats.inProgress}</div><div className="cp-stat-lbl">In Progress</div></div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-icon resolved"><CheckCircle2 size={18} /></div>
          <div><div className="cp-stat-val">{stats.resolved}</div><div className="cp-stat-lbl">Resolved</div></div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="cp-toolbar">
        <div className="cp-search">
          <Search size={15} />
          <input
            placeholder="Search by ID, sender, driver..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="cp-filters">
          <div className="cp-filter-wrap">
            <Filter size={14} />
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown size={13} className="cp-chevron" />
          </div>
          <div className="cp-filter-wrap">
            <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
              {ROLES.map(r => <option key={r}>{r === 'All' ? 'All Roles' : r}</option>)}
            </select>
            <ChevronDown size={13} className="cp-chevron" />
          </div>
          <div className="cp-filter-wrap">
            <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
              {CATEGORIES.map(c => <option key={c}>{c === 'All' ? 'All Categories' : c}</option>)}
            </select>
            <ChevronDown size={13} className="cp-chevron" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="cp-table-wrap">
        <table className="cp-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sender / Role</th>
              <th>Vehicle / Driver</th>
              <th>Trip ID</th>
              <th>Category</th>
              <th>Description</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(c => (
              <tr key={c.id}>
                <td><span className="cp-id">{c.id}</span></td>
                <td>
                  <div className="cp-sender">{c.sender}</div>
                  <span className={`cp-role-badge ${c.role.toLowerCase()}`}>{c.role}</span>
                </td>
                <td>
                  <div className="cp-vehicle">{c.vehicle}</div>
                  <div className="cp-driver-name">{c.driver}</div>
                </td>
                <td><span className="cp-trip">{c.tripId}</span></td>
                <td>
                  <span className="cp-category-tag">
                    {CATEGORY_ICONS[c.category]}
                    {c.category}
                  </span>
                </td>
                <td>
                  <span className="cp-desc" title={c.description}>
                    {c.description.length > 55 ? c.description.slice(0, 55) + '…' : c.description}
                  </span>
                </td>
                <td>
                  <span className="cp-priority" style={{ color: PRIORITY_COLORS[c.priority], borderColor: PRIORITY_COLORS[c.priority] }}>
                    <span className="cp-dot" style={{ background: PRIORITY_COLORS[c.priority] }} />
                    {c.priority}
                  </span>
                </td>
                <td>
                  <span className="cp-status" style={{ color: STATUS_COLORS[c.status], background: STATUS_COLORS[c.status] + '18' }}>
                    {c.status}
                  </span>
                </td>
                <td><span className="cp-date">{c.dateSubmitted}</span></td>
                <td>
                  {c.status !== 'Resolved' ? (
                    <button className="cp-toolkit-btn" onClick={() => setToolkitComplaint(c)}>
                      <ShieldAlert size={13} /> Resolution Toolkit
                    </button>
                  ) : (
                    <span className="cp-resolved-tag"><CheckCircle2 size={13} /> Resolved</span>
                  )}
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan="10" className="cp-empty">
                  <CheckCircle2 size={28} />
                  <p>No complaints match your filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="cp-pagination">
          <span className="cp-page-info">
            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div className="cp-page-controls">
            <button className="cp-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} className={`cp-page-num ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>
                {i + 1}
              </button>
            ))}
            <button className="cp-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </div>
      )}

      {/* Resolution Toolkit Modal */}
      {toolkitComplaint && (
        <ComplaintResolutionToolkit
          complaint={toolkitComplaint}
          onClose={() => setToolkitComplaint(null)}
          onResolve={handleResolve}
        />
      )}
    </div>
  );
}
