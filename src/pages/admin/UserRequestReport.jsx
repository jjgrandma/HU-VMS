import { useState } from 'react';
import ExportButton from '../../components/ExportButton';
import './adminTheme.css';
import './userRequestReport.css';

const UserRequestReport = () => {
  const [requests] = useState([
    { id: 1, userName: 'John Doe', unit: 'Engineering College', destination: 'Medical Campus', requestDate: '2024-03-15', tripDate: '2024-03-18', status: 'Pending', priority: 'High' },
    { id: 2, userName: 'Jane Smith', unit: 'Law School', destination: 'Business School', requestDate: '2024-03-14', tripDate: '2024-03-17', status: 'Approved', priority: 'Medium' },
    { id: 3, userName: 'Mike Johnson', unit: 'Medical College', destination: 'Main Campus', requestDate: '2024-03-13', tripDate: '2024-03-16', status: 'Approved', priority: 'Low' },
    { id: 4, userName: 'Sarah Williams', unit: 'Business School', destination: 'Engineering Building', requestDate: '2024-03-12', tripDate: '2024-03-15', status: 'Rejected', priority: 'Medium' },
    { id: 5, userName: 'David Brown', unit: 'Engineering College', destination: 'Sports Complex', requestDate: '2024-03-11', tripDate: '2024-03-14', status: 'Approved', priority: 'High' },
    { id: 6, userName: 'Emily Davis', unit: 'Law School', destination: 'Library', requestDate: '2024-03-10', tripDate: '2024-03-13', status: 'Pending', priority: 'Low' },
    { id: 7, userName: 'Robert Wilson', unit: 'Medical College', destination: 'Research Center', requestDate: '2024-03-09', tripDate: '2024-03-12', status: 'Approved', priority: 'High' },
    { id: 8, userName: 'Lisa Anderson', unit: 'Business School', destination: 'Admin Building', requestDate: '2024-03-08', tripDate: '2024-03-11', status: 'Rejected', priority: 'Medium' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || request.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  // Reset to first page when search or filter changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Pending': return 'status-pending';
      case 'Approved': return 'status-approved';
      case 'Rejected': return 'status-rejected';
      default: return '';
    }
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return '';
    }
  };

  return (
    <div className="user-request-report-container">
      <div className="report-header">
        <h1>User Request Report</h1>
        <ExportButton 
          data={filteredRequests}
          filename="user_request_report"
          reportTitle="User Request Report"
        />
      </div>

      <div className="controls-bar">
        <input
          type="text"
          placeholder="Search by user, unit, or destination..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />

        <select
          value={filterStatus}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User Name</th>
              <th>Unit</th>
              <th>Destination</th>
              <th>Request Date</th>
              <th>Trip Date</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentRequests.map(request => (
              <tr key={request.id}>
                <td>{request.id}</td>
                <td>{request.userName}</td>
                <td>{request.unit}</td>
                <td>{request.destination}</td>
                <td>{request.requestDate}</td>
                <td>{request.tripDate}</td>
                <td>
                  <span className={`priority-badge ${getPriorityClass(request.priority)}`}>
                    {request.priority}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${getStatusClass(request.status)}`}>
                    {request.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRequests.length === 0 && (
        <div className="no-results">No requests found</div>
      )}

      {/* Compact Pagination */}
      {filteredRequests.length > 0 && (
        <div className="pagination-compact">
          <div className="pagination-info-compact">
            <span>
              {startIndex + 1}-{Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length}
            </span>
            <select 
              value={itemsPerPage} 
              onChange={handleItemsPerPageChange}
              className="items-per-page-compact"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>

          <div className="pagination-controls-compact">
            <button
              className="pagination-btn-compact"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              title="First Page"
            >
              ⟪
            </button>
            <button
              className="pagination-btn-compact"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous Page"
            >
              ‹
            </button>

            <span className="page-indicator-compact">
              {currentPage} / {totalPages}
            </span>

            <button
              className="pagination-btn-compact"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Next Page"
            >
              ›
            </button>
            <button
              className="pagination-btn-compact"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              title="Last Page"
            >
              ⟫
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRequestReport;
