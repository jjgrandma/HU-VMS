import { useState } from "react";
import "./requests.css";

export default function Requests() {
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
            className={`request-card ${req.priority.toLowerCase()} ${requesterColor[req.requester]}`}
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
                  <button className="approve-btn" onClick={() => approveRequest(req.id)}>
                    Approve
                  </button>

                  <div className="reject-area">
                    <textarea
                      placeholder="Enter rejection reason..."
                      value={rejectionInput[req.id] || ""}
                      onChange={(e) =>
                        setRejectionInput({ ...rejectionInput, [req.id]: e.target.value })
                      }
                    />
                    <button className="reject-btn" onClick={() => rejectRequest(req.id)}>
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
