import { useState, useEffect } from "react";
import "./complaints.css";

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [senderFilter, setSenderFilter] = useState("All");

  useEffect(() => {
    // Simulated complaints data
    const data = [
      {
        id: 1,
        sender: "John Doe",
        role: "User",
        vehicle: "BUS-12",
        description: "Vehicle was late to pickup point.",
        status: "Pending",
        response: "",
      },
      {
        id: 2,
        sender: "Michael",
        role: "Driver",
        vehicle: "VAN-04",
        description: "Brake issue detected on route.",
        status: "In Progress",
        response: "",
      },
      {
        id: 3,
        sender: "Alice",
        role: "User",
        vehicle: "BUS-09",
        description: "AC not working in bus.",
        status: "Resolved",
        response: "Adjusted schedule and maintenance completed.",
      },
    ];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setComplaints(data);
  }, []);

  // Filter complaints by status and sender
  const filteredComplaints = complaints.filter((c) => {
    const statusMatch = statusFilter === "All" || c.status === statusFilter;
    const senderMatch = senderFilter === "All" || c.role === senderFilter;
    return statusMatch && senderMatch;
  });

  // Update complaint status or response
  const updateComplaint = (id, newStatus, responseText = "") => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: newStatus, response: responseText || c.response }
          : c
      )
    );
  };

  // Role-based workflow actions
  const roleActions = (complaint) => {
    if (complaint.role === "User") {
      return (
        <>
          <button onClick={() => alert(`Reassign vehicle ${complaint.vehicle}`)}>
            Reassign Vehicle
          </button>
          <button onClick={() => alert(`Talk to driver for ${complaint.vehicle}`)}>
            Contact Driver
          </button>
          <button onClick={() => updateComplaint(complaint.id, "Resolved")}>
            Mark Resolved
          </button>
        </>
      );
    } else if (complaint.role === "Driver") {
      return (
        <>
          <button onClick={() => alert(`Send ${complaint.vehicle} to maintenance`)}>
            Maintenance
          </button>
          <button onClick={() => alert(`Replace ${complaint.vehicle}`)}>
            Replace Vehicle
          </button>
          <button onClick={() => updateComplaint(complaint.id, "Resolved")}>
            Mark Resolved
          </button>
        </>
      );
    }
  };

  return (
    <div className="complaints-page">
      <h1>Complaints Management</h1>
      <p>Review and respond to all user and driver complaints.</p>

      {/* Filters */}
      <div className="filters">
        <div>
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
        </div>

        <div>
          <label>Sender:</label>
          <select
            value={senderFilter}
            onChange={(e) => setSenderFilter(e.target.value)}
          >
            <option>All</option>
            <option>User</option>
            <option>Driver</option>
          </select>
        </div>
      </div>

      {/* Complaint Cards */}
      <div className="complaints-list">
        {filteredComplaints.map((c) => (
          <div className="complaint-card" key={c.id}>
            <div className="complaint-header">
              <strong>{c.sender}</strong> ({c.role}) | Vehicle: {c.vehicle}
            </div>
            <p>{c.description}</p>
            <div className="complaint-status">
              Status: <span className={`status ${c.status.toLowerCase().replace(" ", "-")}`}>{c.status}</span>
            </div>
            <div className="complaint-response">
              <label>Response:</label>
              <input
                type="text"
                placeholder="Add response..."
                value={c.response}
                onChange={(e) => updateComplaint(c.id, c.status, e.target.value)}
              />
            </div>
            <div className="complaint-actions">{roleActions(c)}</div>
          </div>
        ))}
        {filteredComplaints.length === 0 && <p className="no-complaints">No complaints found.</p>}
      </div>
    </div>
  );
}