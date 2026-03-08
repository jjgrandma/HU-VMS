import { useState } from 'react';
import './GateLogs.css';

const GateLogs = () => {
  const [gateLogs] = useState([
    {
      logId: 'LOG-001',
      plateNumber: 'HU-2045',
      vehicle: 'Toyota Hilux',
      driver: 'John Smith',
      direction: 'Entry',
      gateOfficer: 'Officer A',
      detectionTime: '2026-03-08 09:15:23',
      status: 'Approved'
    },
    {
      logId: 'LOG-002',
      plateNumber: 'AA-1234-ET',
      vehicle: 'Honda Civic',
      driver: 'Unknown',
      direction: 'Entry',
      gateOfficer: 'Officer A',
      detectionTime: '2026-03-08 09:12:45',
      status: 'Rejected'
    },
    {
      logId: 'LOG-003',
      plateNumber: 'HU-3021',
      vehicle: 'Isuzu D-Max',
      driver: 'Sarah Johnson',
      direction: 'Exit',
      gateOfficer: 'Officer B',
      detectionTime: '2026-03-08 09:08:12',
      status: 'Approved'
    },
    {
      logId: 'LOG-004',
      plateNumber: 'HU-1567',
      vehicle: 'Toyota Land Cruiser',
      driver: 'Mike Wilson',
      direction: 'Entry',
      gateOfficer: 'Officer A',
      detectionTime: '2026-03-08 09:05:34',
      status: 'Approved'
    },
    {
      logId: 'LOG-005',
      plateNumber: 'AA-5678-ET',
      vehicle: 'Nissan Patrol',
      driver: 'Unknown',
      direction: 'Entry',
      gateOfficer: 'Officer C',
      detectionTime: '2026-03-08 09:02:18',
      status: 'Rejected'
    },
    {
      logId: 'LOG-006',
      plateNumber: 'HU-4532',
      vehicle: 'Nissan Patrol',
      driver: 'David Lee',
      direction: 'Exit',
      gateOfficer: 'Officer B',
      detectionTime: '2026-03-08 08:58:45',
      status: 'Approved'
    },
    {
      logId: 'LOG-007',
      plateNumber: 'HU-2045',
      vehicle: 'Toyota Hilux',
      driver: 'John Smith',
      direction: 'Exit',
      gateOfficer: 'Officer A',
      detectionTime: '2026-03-08 08:45:12',
      status: 'Approved'
    },
    {
      logId: 'LOG-008',
      plateNumber: 'HU-3021',
      vehicle: 'Isuzu D-Max',
      driver: 'Sarah Johnson',
      direction: 'Entry',
      gateOfficer: 'Officer C',
      detectionTime: '2026-03-08 08:32:56',
      status: 'Approved'
    },
    {
      logId: 'LOG-009',
      plateNumber: 'AA-9876-ET',
      vehicle: 'Toyota Corolla',
      driver: 'Unknown',
      direction: 'Entry',
      gateOfficer: 'Officer B',
      detectionTime: '2026-03-08 08:28:34',
      status: 'Pending'
    },
    {
      logId: 'LOG-010',
      plateNumber: 'HU-1567',
      vehicle: 'Toyota Land Cruiser',
      driver: 'Mike Wilson',
      direction: 'Exit',
      gateOfficer: 'Officer A',
      detectionTime: '2026-03-08 08:15:22',
      status: 'Approved'
    }
  ]);

  const [filters, setFilters] = useState({
    direction: '',
    date: '',
    plateNumber: '',
    status: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  const filteredLogs = gateLogs.filter(log => {
    return (
      (filters.direction === '' || log.direction === filters.direction) &&
      (filters.date === '' || log.detectionTime.startsWith(filters.date)) &&
      (filters.plateNumber === '' || log.plateNumber.toLowerCase().includes(filters.plateNumber.toLowerCase())) &&
      (filters.status === '' || log.status === filters.status)
    );
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const statusClass = status.toLowerCase();
    return <span className={`gate-status-badge ${statusClass}`}>{status}</span>;
  };

  const getDirectionBadge = (direction) => {
    const directionClass = direction.toLowerCase();
    return <span className={`gate-direction-badge ${directionClass}`}>{direction}</span>;
  };

  const clearFilters = () => {
    setFilters({
      direction: '',
      date: '',
      plateNumber: '',
      status: ''
    });
    setCurrentPage(1);
  };

  const exportLogs = () => {
    alert('Exporting gate logs to CSV...');
  };

  return (
    <div className="gate-logs-page">
      <div className="gate-page-header">
        <div>
          <h2>Gate Logs</h2>
          <p>Complete history of all gate activities</p>
        </div>
        <button className="gate-btn-primary" onClick={exportLogs}>
          <span>📥</span> Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="gate-filters-container">
        <div className="gate-filters-grid">
          <div className="gate-filter-group">
            <label className="gate-filter-label">Direction</label>
            <select
              name="direction"
              value={filters.direction}
              onChange={handleFilterChange}
              className="gate-filter-select"
            >
              <option value="">All Directions</option>
              <option value="Entry">Entry</option>
              <option value="Exit">Exit</option>
            </select>
          </div>

          <div className="gate-filter-group">
            <label className="gate-filter-label">Date</label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="gate-filter-input"
            />
          </div>

          <div className="gate-filter-group">
            <label className="gate-filter-label">Plate Number</label>
            <input
              type="text"
              name="plateNumber"
              value={filters.plateNumber}
              onChange={handleFilterChange}
              placeholder="Search by plate"
              className="gate-filter-input"
            />
          </div>

          <div className="gate-filter-group">
            <label className="gate-filter-label">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="gate-filter-select"
            >
              <option value="">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="gate-filter-actions">
            <button onClick={clearFilters} className="gate-btn-clear">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="gate-results-summary">
        <span>Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} logs</span>
      </div>

      {/* Gate Logs Table */}
      <div className="gate-table-container">
        <div className="gate-table-wrapper">
          <table className="gate-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Plate Number</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Direction</th>
                <th>Gate Officer</th>
                <th>Detection Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log) => (
                <tr key={log.logId}>
                  <td className="log-id">{log.logId}</td>
                  <td className="plate-number">{log.plateNumber}</td>
                  <td>{log.vehicle}</td>
                  <td>{log.driver}</td>
                  <td>{getDirectionBadge(log.direction)}</td>
                  <td>{log.gateOfficer}</td>
                  <td className="detection-time">{log.detectionTime}</td>
                  <td>{getStatusBadge(log.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="gate-pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="gate-pagination-btn"
          >
            ‹ Previous
          </button>
          
          <div className="gate-pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`gate-pagination-number ${currentPage === page ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="gate-pagination-btn"
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
};

export default GateLogs;
