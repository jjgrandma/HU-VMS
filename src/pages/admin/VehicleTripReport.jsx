import { useState, useEffect } from 'react';
import { getRequests } from '../../api/api';
import ExportButton from '../../components/ExportButton';
import './adminTheme.css';
import './vehicleTripReport.css';

const VehicleTripReport = () => {
  const [trips, setTrips]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    getRequests()
      .then(data => setTrips(data.filter(r => r.status === 'completed' || r.status === 'in-progress')))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = trips.filter(t => {
    const q = searchTerm.toLowerCase();
    return (
      t.vehicle?.plateNumber?.toLowerCase().includes(q) ||
      t.vehicle?.model?.toLowerCase().includes(q) ||
      t.driver?.name?.toLowerCase().includes(q) ||
      t.destination?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const current    = filtered.slice(startIndex, startIndex + itemsPerPage);

  const exportData = filtered.map(t => ({
    Plate: t.vehicle?.plateNumber || '—',
    Model: t.vehicle?.model || '—',
    Driver: t.driver?.name || '—',
    Destination: t.destination || '—',
    Purpose: t.purpose || '—',
    Departure: t.startTime ? new Date(t.startTime).toLocaleString() : '—',
    Return: t.endTime ? new Date(t.endTime).toLocaleString() : 'In Progress',
    Status: t.status,
  }));

  return (
    <div className="vehicle-trip-report-container">
      <div className="report-header">
        <h1>Vehicle Trip Report</h1>
        <ExportButton data={exportData} filename="vehicle_trip_report" reportTitle="Vehicle Trip Report" />
      </div>

      <div className="controls-bar">
        <input type="text" placeholder="Search by plate, model, driver, destination..."
          value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="search-input" />
      </div>

      {loading ? (
        <p style={{ textAlign:'center', color:'#94a3b8', padding:40 }}>Loading...</p>
      ) : (
        <>
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>#</th><th>Plate</th><th>Model</th><th>Driver</th>
                  <th>Destination</th><th>Purpose</th><th>Departure</th><th>Return</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {current.map((t, i) => (
                  <tr key={t._id}>
                    <td>{startIndex + i + 1}</td>
                    <td>{t.vehicle?.plateNumber || '—'}</td>
                    <td>{t.vehicle?.model || '—'}</td>
                    <td>{t.driver?.name || '—'}</td>
                    <td>{t.destination || '—'}</td>
                    <td>{t.purpose || '—'}</td>
                    <td>{t.startTime ? new Date(t.startTime).toLocaleString() : '—'}</td>
                    <td>{t.endTime ? new Date(t.endTime).toLocaleString() : 'In Progress'}</td>
                    <td><span className={`status-badge status-${t.status}`}>{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="no-results">No trips found</div>}
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

export default VehicleTripReport;
