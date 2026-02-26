import { useState } from "react";
import "./requests.css";

export default function Requests() {
  /* ===== STATE ===== */
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [rejectionInput, setRejectionInput] = useState({});

  const [requests, setRequests] = useState([
    {
      id: 1,
      title: "Clinic Emergency Transport",
      requester: "Health Office",
      vehicleType: "Ambulance",
      dateNeeded: "2026-03-01",
      destination: "Black Lion Hospital",
      purpose: "Emergency patient transfer",
      priority: "Emergency",
      status: "Pending",
      rejectionReason: "",
    },
    {
      id: 2,
      title: "Staff Field Visit",
      requester: "Admin",
      vehicleType: "Bus",
      dateNeeded: "2026-03-05",
      destination: "Adama",
      purpose: "Training",
      priority: "Normal",
      status: "Approved",
      rejectionReason: "",
    },
  ]);

  /* ===== COLOR MAP ===== */
  const requesterColor = {
    Admin: "admin",
    "Health Office": "health",
    Student: "student",
  };

  /* ===== FILTER LOGIC ===== */
  const filteredRequests = requests.filter((req) => {
    const priorityMatch =
      filterPriority === "All" || req.priority === filterPriority;
    const statusMatch =
      filterStatus === "All" || req.status === filterStatus;
    return priorityMatch && statusMatch;
  });

  /* ===== ACTIONS ===== */
  const approveRequest = (id) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: "Approved" } : req
      )
    );
  };

  const rejectRequest = (id) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status: "Rejected",
              rejectionReason: rejectionInput[id] || "No reason provided",
            }
          : req
      )
    );
  };

  return (
    <div className="requests-page">
      <header className="requests-header">
        <h1>Requests Pool</h1>
        <p>Manage and review transport requests</p>
      </header>

      {/* FILTERS */}
      <div className="filter-section">
        <div className="filter-group">
          <label>Filter by Priority:</label>
          <select onChange={(e) => setFilterPriority(e.target.value)}>
            <option>All</option>
            <option>Emergency</option>
            <option>High</option>
            <option>Normal</option>
            <option>Low</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Filter by Status:</label>
          <select onChange={(e) => setFilterStatus(e.target.value)}>
            <option>All</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      {/* REQUEST LIST */}
      <section className="requests-list">
        {filteredRequests.map((req) => (
          <div
            key={req.id}
            className={`request-card ${req.priority.toLowerCase()} ${
              requesterColor[req.requester] || ""
            }`}
          >
            <div className="request-info">
              <strong>{req.title}</strong>
              <span><b>Requester:</b> {req.requester}</span>
              <span><b>Vehicle Type:</b> {req.vehicleType}</span>
              <span><b>Date Needed:</b> {req.dateNeeded}</span>
              <span><b>Destination:</b> {req.destination}</span>
              <span><b>Purpose:</b> {req.purpose}</span>
              <span><b>Priority:</b> {req.priority}</span>

              {req.status === "Rejected" && (
                <span className="rejection-reason">
                  <b>Rejection Reason:</b> {req.rejectionReason}
                </span>
              )}
            </div>

            <div className="action-section">
              <span className={`status ${req.status.toLowerCase()}`}>
                {req.status}
              </span>

              {req.status === "Pending" && (
                <div className="action-buttons">
                  <button
                    className="approve-btn"
                    onClick={() => approveRequest(req.id)}
                  >
                    Approve
                  </button>

                  <div className="reject-area">
                    <textarea
                      placeholder="Enter rejection reason..."
                      value={rejectionInput[req.id] || ""}
                      onChange={(e) =>
                        setRejectionInput({
                          ...rejectionInput,
                          [req.id]: e.target.value,
                        })
                      }
                    />
                    <button
                      className="reject-btn"
                      onClick={() => rejectRequest(req.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}