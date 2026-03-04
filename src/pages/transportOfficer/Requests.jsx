import { useState } from "react";
import "./requests.css";

export default function Requests() {
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

  // Map requester type to color classes
  const requesterColor = {
    "University Clinic": "clinic",
    "HR Department": "hr",
    "Logistics Unit": "logistics",
    "Research Institute": "research",
    "Cafe Service": "cafe",
    "Agriculture Unit": "agriculture",
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
