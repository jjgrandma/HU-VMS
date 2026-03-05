import { useState } from 'react';
import ExportButton from '../../components/ExportButton';
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

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || request.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
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
            {filteredRequests.map(request => (
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
    </div>
  );
};

export default UserRequestReport;
