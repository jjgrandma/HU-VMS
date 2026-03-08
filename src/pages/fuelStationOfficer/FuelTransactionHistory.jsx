import { useState } from 'react';
import './fuelstation.css';

const FuelTransactionHistory = () => {
  const [transactions] = useState([
    {
      id: 'TXN-001',
      vehicleId: 'VH-001',
      driver: 'John Smith',
      fuelType: 'Diesel',
      liters: 45.5,
      date: '2026-03-08',
      odometer: 125430,
      operator: 'Fuel Officer A',
      status: 'Completed'
    },
    {
      id: 'TXN-002',
      vehicleId: 'VH-003',
      driver: 'Sarah Johnson',
      fuelType: 'Petrol',
      liters: 32.0,
      date: '2026-03-08',
      odometer: 89650,
      operator: 'Fuel Officer A',
      status: 'Completed'
    },
    {
      id: 'TXN-003',
      vehicleId: 'VH-007',
      driver: 'Mike Wilson',
      fuelType: 'Diesel',
      liters: 55.2,
      date: '2026-03-08',
      odometer: 156780,
      operator: 'Fuel Officer B',
      status: 'Completed'
    },
    {
      id: 'TXN-004',
      vehicleId: 'VH-012',
      driver: 'Lisa Brown',
      fuelType: 'Petrol',
      liters: 28.8,
      date: '2026-03-08',
      odometer: 67890,
      operator: 'Fuel Officer A',
      status: 'Pending'
    },
    {
      id: 'TXN-005',
      vehicleId: 'VH-015',
      driver: 'David Lee',
      fuelType: 'Diesel',
      liters: 42.3,
      date: '2026-03-07',
      odometer: 134560,
      operator: 'Fuel Officer C',
      status: 'Completed'
    },
    {
      id: 'TXN-006',
      vehicleId: 'VH-002',
      driver: 'Emma Davis',
      fuelType: 'Petrol',
      liters: 38.7,
      date: '2026-03-07',
      odometer: 98760,
      operator: 'Fuel Officer A',
      status: 'Completed'
    },
    {
      id: 'TXN-007',
      vehicleId: 'VH-009',
      driver: 'James Miller',
      fuelType: 'Diesel',
      liters: 51.4,
      date: '2026-03-07',
      odometer: 178920,
      operator: 'Fuel Officer B',
      status: 'Completed'
    },
    {
      id: 'TXN-008',
      vehicleId: 'VH-006',
      driver: 'Anna Garcia',
      fuelType: 'Petrol',
      liters: 29.5,
      date: '2026-03-06',
      odometer: 76540,
      operator: 'Fuel Officer A',
      status: 'Completed'
    },
    {
      id: 'TXN-009',
      vehicleId: 'VH-011',
      driver: 'Robert Taylor',
      fuelType: 'Diesel',
      liters: 47.8,
      date: '2026-03-06',
      odometer: 145670,
      operator: 'Fuel Officer C',
      status: 'Completed'
    },
    {
      id: 'TXN-010',
      vehicleId: 'VH-004',
      driver: 'Maria Rodriguez',
      fuelType: 'Petrol',
      liters: 35.2,
      date: '2026-03-06',
      odometer: 87430,
      operator: 'Fuel Officer B',
      status: 'Completed'
    }
  ]);

  const [filters, setFilters] = useState({
    fuelType: '',
    date: '',
    vehicleId: '',
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
    setCurrentPage(1); // Reset to first page when filtering
  };

  const filteredTransactions = transactions.filter(transaction => {
    return (
      (filters.fuelType === '' || transaction.fuelType === filters.fuelType) &&
      (filters.date === '' || transaction.date === filters.date) &&
      (filters.vehicleId === '' || transaction.vehicleId.toLowerCase().includes(filters.vehicleId.toLowerCase())) &&
      (filters.status === '' || transaction.status === filters.status)
    );
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const statusClass = status.toLowerCase();
    return <span className={`status-badge ${statusClass}`}>{status}</span>;
  };

  const clearFilters = () => {
    setFilters({
      fuelType: '',
      date: '',
      vehicleId: '',
      status: ''
    });
    setCurrentPage(1);
  };

  return (
    <div className="fuel-transactions-page">
      <div className="fuel-page-header">
        <h2>Fuel Transaction History</h2>
        <p>View and filter all fuel dispensing transactions</p>
      </div>

      {/* Filters */}
      <div className="fuel-filters-container">
        <div className="fuel-filters-grid">
          <div className="fuel-filter-group">
            <label className="fuel-filter-label">Fuel Type</label>
            <select
              name="fuelType"
              value={filters.fuelType}
              onChange={handleFilterChange}
              className="fuel-filter-select"
            >
              <option value="">All Types</option>
              <option value="Diesel">Diesel</option>
              <option value="Petrol">Petrol</option>
            </select>
          </div>

          <div className="fuel-filter-group">
            <label className="fuel-filter-label">Date</label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="fuel-filter-input"
            />
          </div>

          <div className="fuel-filter-group">
            <label className="fuel-filter-label">Vehicle ID</label>
            <input
              type="text"
              name="vehicleId"
              value={filters.vehicleId}
              onChange={handleFilterChange}
              placeholder="Search by Vehicle ID"
              className="fuel-filter-input"
            />
          </div>

          <div className="fuel-filter-group">
            <label className="fuel-filter-label">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="fuel-filter-select"
            >
              <option value="">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="fuel-filter-actions">
            <button onClick={clearFilters} className="fuel-btn-clear">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="fuel-results-summary">
        <span>Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions</span>
      </div>

      {/* Transactions Table */}
      <div className="fuel-table-container">
        <div className="fuel-table-wrapper">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Vehicle ID</th>
                <th>Driver</th>
                <th>Fuel Type</th>
                <th>Liters</th>
                <th>Date</th>
                <th>Odometer</th>
                <th>Operator</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="transaction-id">{transaction.id}</td>
                  <td className="vehicle-id">{transaction.vehicleId}</td>
                  <td>{transaction.driver}</td>
                  <td>
                    <span className={`fuel-type-badge ${transaction.fuelType.toLowerCase()}`}>
                      {transaction.fuelType}
                    </span>
                  </td>
                  <td className="liters">{transaction.liters}L</td>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td className="odometer">{transaction.odometer.toLocaleString()} km</td>
                  <td>{transaction.operator}</td>
                  <td>{getStatusBadge(transaction.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="fuel-pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="fuel-pagination-btn"
          >
            ‹ Previous
          </button>
          
          <div className="fuel-pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`fuel-pagination-number ${currentPage === page ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="fuel-pagination-btn"
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
};

export default FuelTransactionHistory;