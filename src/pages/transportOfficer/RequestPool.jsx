import { useState } from 'react';
import './transportTheme.css';
import './RequestPool.css';

const RequestPool = () => {
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [rejectionInput, setRejectionInput] = useState({});

  const [requests, setRequests] = useState([
    {
      id: 1,
      title: "Clinic Emergency Transport",
      requester: "University Clinic",
      vehicleType: "Pickup",
      dateNeeded: "2026-02-18",
      destination: "Haramaya Hospital",
      purpose: "Medical emergency transfer",
      priority: "Emergency",
      status: "Pending",
      rejectionReason: "",
    },
    {
      id: 2,
      title: "Staff Transport",
      requester: "HR Department",
      vehicleType: "Bus",
      dateNeeded: "2026-02-20",
      destination: "Campus B",
      purpose: "Staff meeting transportation",
      priority: "Normal",
      status: "Pending",
      rejectionReason: "",
    },
    {
      id: 3,
      title: "Goods Delivery",
      requester: "Logistics Unit",
      vehicleType: "Truck",
      dateNeeded: "2026-02-22",
      destination: "Central Store",
      purpose: "Supply delivery",
      priority: "High",
      status: "Pending",
      rejectionReason: "",
    },
    {
      id: 4,
      title: "Research Equipment Transport",
      requester: "Research Institute",
      vehicleType: "Van",
      dateNeeded: "2026-02-24",
      destination: "Science Lab",
      purpose: "Transport sensitive lab equipment",
      priority: "High",
      status: "Pending",
      rejectionReason: "",
    },
    {
      id: 5,
      title: "Cafe Supplies Delivery",
      requester: "Cafe Service",
      vehicleType: "Truck",
      dateNeeded: "2026-02-25",
      destination: "Student Cafeteria",
      purpose: "Deliver ingredients and supplies",
      priority: "Normal",
      status: "Pending",
      rejectionReason: "",
    },
    {
      id: 6,
      title: "Agriculture Service Transport",
      requester: "Agriculture Unit",
      vehicleType: "Pickup",
      dateNeeded: "2026-02-26",
      destination: "University Farm",
      purpose: "Transport farming tools and seeds",
      priority: "Emergency",
      status: "Pending",
      rejectionReason: "",
    },
  ]);

  const approveRequest = (id) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: "Approved", rejectionReason: "" } : req
      )
    );
  };

  const rejectRequest = (id) => {
    const reason = rejectionInput[id];
    if (!reason || reason.trim() === "") {
      alert("Please enter a rejection reason.");
      return;
    }

    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: "Rejected", rejectionReason: reason } : req
      )
    );

    setRejectionInput((prev) => ({ ...prev, [id]: "" }));
  };

  const filteredRequests = requests.filter((req) => {
    const priorityMatch = filterPriority === "All" || req.priority === filterPriority;
    const statusMatch = filterStatus === "All" || req.status === filterStatus;
    return priorityMatch && statusMatch;
  });

  const getPriorityClass = (priority) => {
    const classes = {
      'Emergency': 'priority-emergency',
      'High': 'priority-high',
      'Normal': 'priority-normal',
      'Low': 'priority-low'
    };
    return classes[priority] || 'priority-normal';
  };

  const getStatusClass = (status) => {
    const classes = {
      'Pending': 'status-pending',
      'Approved': 'status-approved',
      'Rejected': 'status-rejected'
    };
    return classes[status] || 'status-pending';
  };

  return (
    <div className="transport-container">
      <div className="page-header">
        <h1>📋 Request Pool Management</h1>
        <p>Review and manage transport requests with smart assignment</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card total">
          <div className="card-icon">📋</div>
          <div className="card-content">
            <h3>{requests.length}</h3>
            <p>Total Requests</p>
          </div>
        </div>
        <div className="summary-card pending">
          <div className="card-icon">⏳</div>
          <div className="card-content">
            <h3>{requests.filter(r => r.status === 'Pending').length}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="summary-card approved">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <h3>{requests.filter(r => r.status === 'Approved').length}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div className="summary-card rejected">
          <div className="card-icon">❌</div>
          <div className="card-content">
            <h3>{requests.filter(r => r.status === 'Rejected').length}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by Priority:</label>
          <select 
            className="input-field"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option>All</option>
            <option>Emergency</option>
            <option>High</option>
            <option>Normal</option>
            <option>Low</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Filter by Status:</label>
          <select 
            className="input-field"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option>All</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="requests-grid">
        {filteredRequests.map((req) => (
          <div key={req.id} className={`request-card ${getPriorityClass(req.priority)}`}>
            <div className="request-header">
              <h3>{req.title}</h3>
              <span className={`status-badge ${getStatusClass(req.status)}`}>
                {req.status}
              </span>
            </div>
            
            <div className="request-details">
              <div className="detail-item">
                <span className="label">Requester:</span>
                <span className="value">{req.requester}</span>
              </div>
              <div className="detail-item">
                <span className="label">Vehicle Type:</span>
                <span className="value">{req.vehicleType}</span>
              </div>
              <div className="detail-item">
                <span className="label">Date Needed:</span>
                <span className="value">{req.dateNeeded}</span>
              </div>
              <div className="detail-item">
                <span className="label">Destination:</span>
                <span className="value">{req.destination}</span>
              </div>
              <div className="detail-item">
                <span className="label">Purpose:</span>
                <span className="value">{req.purpose}</span>
              </div>
              <div className="detail-item">
                <span className="label">Priority:</span>
                <span className={`priority-badge ${getPriorityClass(req.priority)}`}>
                  {req.priority}
                </span>
              </div>
            </div>

            {req.status === "Rejected" && (
              <div className="rejection-reason">
                <strong>Rejection Reason:</strong> {req.rejectionReason}
              </div>
            )}

            {req.status === "Pending" && (
              <div className="action-section">
                <div className="action-buttons">
                  <button 
                    className="btn-primary btn-large approve-btn" 
                    onClick={() => approveRequest(req.id)}
                  >
                    ✅ Approve Request
                  </button>

                  <div className="reject-section">
                    <textarea
                      className="input-field reject-textarea"
                      placeholder="Enter rejection reason..."
                      value={rejectionInput[req.id] || ""}
                      onChange={(e) =>
                        setRejectionInput({ ...rejectionInput, [req.id]: e.target.value })
                      }
                      rows="2"
                    />
                    <button 
                      className="btn-secondary btn-large reject-btn" 
                      onClick={() => rejectRequest(req.id)}
                    >
                      ❌ Reject Request
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">📋</div>
          <h3>No requests found</h3>
          <p>Try adjusting your filters or check back later for new requests.</p>
        </div>
      )}
    </div>
  );
};

export default RequestPool;
