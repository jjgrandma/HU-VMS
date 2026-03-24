import { useState, useEffect } from 'react';
import { getRequests } from '../../api/api';
import ExportButton from '../../components/ExportButton';
import './adminTheme.css';
import './userRequestReport.css';

const UserRequestReport = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage]   = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    getRequests()
      .then(setRequests)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = requests.filter(r => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      r.requestedBy?.name?.toLowerCase().includes(q) ||
      r.requestedBy?.username?.toLowerCase().includes(q) ||
      r.destination?.toLowerCase().includes(q) ||
      r.purpose?.toLowerCase().includes(q);
    const matchFilter = filterStatus === 'All' || r.status === filterStatus.toLowerCase();
    return matchSearch && matchFilter;
  });

  const totalPages  = Math.ceil(filtered.length / itemsPerPage);
  const startIndex  = (currentPage - 1) * itemsPerPage;
  const current     = filtered.slice(startIndex, startIndex + itemsPerPage);

  const getStatusClass = (s) => {
    if (s === 'pending')   return 'status-pending';
    if (s === 'approved' || s === 'in-progress') return 'status-approved';
    if (s === 'completed') return 'status-approved';
    if (s === 'rejected')  return 'status-rejected';
    return '';
  };

  const exportData = filtered.map(r => ({
    User: r.requestedBy?.name || r.requestedBy?.username || '—',
    Destination: r.destination || '—',
    Purpose: r.purpose || '—',
    RequestDate: r.requestDate ? new Date(r.requestDate).toLocaleDateString() : '—',
    TripDate: r.tripDate ? new Date(r.tripDate).toLocaleDateString() : '—',
    Status: r.status,
    Priority: r.priority || '—',
  }));

  return (
    <div className="user-request-report-container">
      <div className="report-header">
        <h1>User Request Report</h1>
        <ExportButton data={exportData} filename="user_request_report" reportTitle="User Request Report" />
      </div>

      <div className="controls-bar">
        <input type="text" placeholder="Search by user, destination, purpose..."
          value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="search-input" />
        <select value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
          className="filter-select">
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="In-progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <p style={{ textAlign:'center', color:'#94a3b8', padding:40 }}>Loading...</p>
      ) : (
        <>
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>#</th><th>User</th><th>Destination</th><th>Purpose</th>
                  <th>Request Date</th><th>Trip Date</th><th>Priority</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {current.map((r, i) => (
                  <tr key={r._id}>
                    <td>{startIndex + i + 1}</td>
                    <td>{r.requestedBy?.name || r.requestedBy?.username || '—'}</td>
                    <td>{r.destination || '—'}</td>
                    <td>{r.purpose || '—'}</td>
                    <td>{r.requestDate ? new Date(r.requestDate).toLocaleDateString() : '—'}</td>
                    <td>{r.tripDate ? new Date(r.tripDate).toLocaleDateString() : '—'}</td>
                    <td>
                      <span className={`priority-badge priority-${(r.priority||'low').toLowerCase()}`}>
                        {r.priority || 'Normal'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(r.status)}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="no-results">No requests found</div>}
          </div>

          {filtered.length > 0 && (
            <div className="pagination-compact">
              <div className="pagination-info-compact">
                <span>{startIndex + 1}–{Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length}</span>
                <select value={itemsPerPage}
                  onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="items-per-page-compact">
                  {[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="pagination-controls-compact">
                <button className="pagination-btn-compact" onClick={() => setCurrentPage(1)} disabled={currentPage===1}>⟪</button>
                <button className="pagination-btn-compact" onClick={() => setCurrentPage(p=>p-1)} disabled={currentPage===1}>‹</button>
                <span className="page-indicator-compact">{currentPage} / {totalPages}</span>
                <button className="pagination-btn-compact" onClick={() => setCurrentPage(p=>p+1)} disabled={currentPage===totalPages}>›</button>
                <button className="pagination-btn-compact" onClick={() => setCurrentPage(totalPages)} disabled={currentPage===totalPages}>⟫</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserRequestReport;
