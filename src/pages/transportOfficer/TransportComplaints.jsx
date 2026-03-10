import { useState } from 'react';
import './transportTheme.css';
import './TransportComplaints.css';

const TransportComplaints = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [filterStatus, setFilterStatus] = useState('All');

  const [complaints, setComplaints] = useState([
    {
      id: 1,
      title: "Driver Late Arrival",
      complainant: "Dr. Ahmed Hassan",
      department: "Medical College",
      description: "The assigned driver arrived 30 minutes late for the scheduled trip to the hospital, causing delays in patient transport.",
      date: "2024-03-15",
      priority: "High",
      status: "Pending",
      category: "Driver Conduct"
    },
    {
      id: 2,
      title: "Vehicle Maintenance Issue",
      complainant: "Prof. Fatima Ali",
      department: "Engineering College",
      description: "The vehicle had a strange noise during the trip and the air conditioning was not working properly.",
      date: "2024-03-14",
      priority: "Medium",
      status: "Approved",
      category: "Vehicle Condition"
    },
    {
      id: 3,
      title: "Unprofessional Behavior",
      complainant: "Mohammed Said",
      department: "Agriculture Unit",
      description: "The driver was using mobile phone while driving and did not follow the designated route.",
      date: "2024-03-13",
      priority: "High",
      status: "Pending",
      category: "Driver Conduct"
    },
    {
      id: 4,
      title: "Fuel Shortage During Trip",
      complainant: "Aisha Omar",
      department: "Business School",
      description: "The vehicle ran out of fuel during the trip, causing significant delays and inconvenience.",
      date: "2024-03-12",
      priority: "Medium",
      status: "Rejected",
      category: "Vehicle Management"
    },
    {
      id: 5,
      title: "Route Deviation",
      complainant: "Ibrahim Yusuf",
      department: "Law School",
      description: "Driver took a longer route without explanation, resulting in extra travel time and fuel consumption.",
      date: "2024-03-11",
      priority: "Low",
      status: "Approved",
      category: "Route Management"
    },
    {
      id: 6,
      title: "Vehicle Cleanliness",
      complainant: "Maryam Ahmed",
      department: "Medical College",
      description: "The vehicle interior was not clean and had an unpleasant odor, which is unacceptable for medical transport.",
      date: "2024-03-10",
      priority: "Medium",
      status: "Pending",
      category: "Vehicle Condition"
    }
  ]);

  const handleStatusChange = (id, newStatus) => {
    setComplaints(prev => 
      prev.map(complaint => 
        complaint.id === id ? { ...complaint, status: newStatus } : complaint
      )
    );
  };

  const filteredComplaints = complaints.filter(complaint => 
    filterStatus === 'All' || complaint.status === filterStatus
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentComplaints = filteredComplaints.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const getStatusClass = (status) => {
    const classes = {
      'Pending': 'status-pending',
      'Approved': 'status-approved',
      'Rejected': 'status-rejected'
    };
    return classes[status] || 'status-pending';
  };

  const getPriorityClass = (priority) => {
    const classes = {
      'High': 'priority-high',
      'Medium': 'priority-medium',
      'Low': 'priority-low'
    };
    return classes[priority] || 'priority-medium';
  };

  return (
    <div className="transport-container">
      <div className="page-header">
        <h1>📝 Complaints Management</h1>
        <p>Handle and resolve transport-related complaints efficiently</p>
      </div>

      {/* Compact Summary Cards */}
      <div className="summary-cards-compact">
        <div className="summary-card-compact total">
          <div className="card-icon-compact">📝</div>
          <div className="card-content-compact">
            <h4>{complaints.length}</h4>
            <span>Total</span>
          </div>
        </div>
        <div className="summary-card-compact pending">
          <div className="card-icon-compact">⏳</div>
          <div className="card-content-compact">
            <h4>{complaints.filter(c => c.status === 'Pending').length}</h4>
            <span>Pending</span>
          </div>
        </div>
        <div className="summary-card-compact approved">
          <div className="card-icon-compact">✅</div>
          <div className="card-content-compact">
            <h4>{complaints.filter(c => c.status === 'Approved').length}</h4>
            <span>Approved</span>
          </div>
        </div>
        <div className="summary-card-compact rejected">
          <div className="card-icon-compact">❌</div>
          <div className="card-content-compact">
            <h4>{complaints.filter(c => c.status === 'Rejected').length}</h4>
            <span>Rejected</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select 
            className="input-field"
            value={filterStatus}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      <div className="complaints-list">
        {currentComplaints.map(complaint => (
          <div key={complaint.id} className={`complaint-card ${getPriorityClass(complaint.priority)}`}>
            <div className="complaint-header">
              <div className="complaint-title">
                <h3>{complaint.title}</h3>
                <span className={`priority-badge ${getPriorityClass(complaint.priority)}`}>
                  {complaint.priority}
                </span>
              </div>
              <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                {complaint.status}
              </span>
            </div>

            <div className="complaint-details">
              <div className="detail-row">
                <span className="label">Complainant:</span>
                <span className="value">{complaint.complainant}</span>
              </div>
              <div className="detail-row">
                <span className="label">Department:</span>
                <span className="value">{complaint.department}</span>
              </div>
              <div className="detail-row">
                <span className="label">Category:</span>
                <span className="value">{complaint.category}</span>
              </div>
              <div className="detail-row">
                <span className="label">Date:</span>
                <span className="value">{complaint.date}</span>
              </div>
            </div>

            <div className="complaint-description">
              <h4>Description:</h4>
              <p>{complaint.description}</p>
            </div>

            {complaint.status === 'Pending' && (
              <div className="complaint-actions">
                <button 
                  className="btn-primary btn-large"
                  onClick={() => handleStatusChange(complaint.id, 'Approved')}
                >
                  ✅ Approve
                </button>
                <button 
                  className="btn-secondary btn-large"
                  onClick={() => handleStatusChange(complaint.id, 'Rejected')}
                >
                  ❌ Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Smart Pagination */}
      {filteredComplaints.length > itemsPerPage && (
        <div className="pagination-compact">
          <div className="pagination-info">
            <span>
              {startIndex + 1}-{Math.min(endIndex, filteredComplaints.length)} of {filteredComplaints.length}
            </span>
          </div>

          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹ Previous
            </button>
            
            <span className="page-indicator">
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next ›
            </button>
          </div>
        </div>
      )}

      {filteredComplaints.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">📝</div>
          <h3>No complaints found</h3>
          <p>No complaints match your current filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default TransportComplaints;