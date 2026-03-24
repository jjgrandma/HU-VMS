import { useState, useEffect } from 'react';
import { getDrivers, getRequests } from '../../api/api';
import ExportButton from '../../components/ExportButton';
import './adminTheme.css';
import './driverPerformanceReport.css';

const DriverPerformanceReport = () => {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    Promise.all([getDrivers(), getRequests()])
      .then(([drivers, requests]) => {
        const data = drivers.map(d => {
          const driverTrips = requests.filter(r => r.driver?._id === d._id || r.driver === d._id);
          const completed   = driverTrips.filter(r => r.status === 'completed').length;
          const total       = driverTrips.length;
          const efficiency  = total > 0 ? Math.round((completed / total) * 100) + '%' : '—';
          return {
            _id: d._id,
            name: d.name,
            totalTrips: total,
            completed,
            late: total - completed,
            status: d.status,
            efficiency,
          };
        });
        setRows(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rows.filter(r =>
    r.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const current    = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="driver-performance-container">
      <div className="report-header">
        <h1>Driver Performance Report</h1>
        <ExportButton data={filtered} filename="driver_performance_report" reportTitle="Driver Performance Report" />
      </div>

      <div className="controls-bar">
        <input type="text" placeholder="Search by driver name..."
          value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="search-input" />
      </div>

      {loading ? (
        <p style={{ textAlign:'center', color:'#94a3b8', padding:40 }}>Loading...</p>
      ) : (
        <>
          <div className="table-container">
            <table className="performance-table">
              <thead>
                <tr>
                  <th>#</th><th>Driver Name</th><th>Total Trips</th>
                  <th>Completed</th><th>Incomplete</th><th>Efficiency</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {current.map((d, i) => (
                  <tr key={d._id}>
                    <td>{startIndex + i + 1}</td>
                    <td>{d.name}</td>
                    <td>{d.totalTrips}</td>
                    <td><span className="badge-success">{d.completed}</span></td>
                    <td><span className="badge-warning">{d.late}</span></td>
                    <td><span className="efficiency-badge">{d.efficiency}</span></td>
                    <td><span className={`status-badge status-${d.status}`}>{d.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="no-results">No performance data found</div>}
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

export default DriverPerformanceReport;
