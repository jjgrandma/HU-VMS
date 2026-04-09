import { useState, useEffect } from "react";
import { Search, MapPin, Users, AlertCircle, CheckCircle, XCircle, Building2, GraduationCap, Stethoscope, Truck, FlaskConical, Car, User, Calendar, RefreshCw, Fuel, Navigation } from "lucide-react";
import { getRequests, getVehicles, approveRequest, rejectRequest, getCurrentUser } from "../../api/api";
import "./requests.css";

// Haversine distance between two lat/lng points (km)
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

// Geocode a place name using Nominatim (free, no key)
const geocode = async (place) => {
  const query = encodeURIComponent(`${place}, Ethiopia`);
  const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'HU-VMS/1.0' }
  });
  const data = await res.json();
  if (data.length === 0) throw new Error(`Location not found: ${place}`);
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), display: data[0].display_name };
};

// Fuel consumption rates by vehicle type (L/100km)
const FUEL_RATES = {
  bus:       35,
  minibus:   18,
  van:       14,
  car:       10,
  truck:     28,
  pickup:    15,
  default:   15,
};

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState(null);
  const [recommendedVehicles, setRecommendedVehicles] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [fuelEstimate, setFuelEstimate]   = useState(null);
  const [fuelLoading, setFuelLoading]     = useState(false);

  const currentUser = getCurrentUser();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqs, vehs] = await Promise.all([
        getRequests(),
        getVehicles({ status: "available" }),
      ]);
      setRequests(reqs);
      setVehicles(vehs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getDepartmentIcon = (dept = "") => {
    const d = dept.toLowerCase();
    if (d.includes("medical") || d.includes("health")) return <Stethoscope size={16} className="department-icon" />;
    if (d.includes("research") || d.includes("agri")) return <FlaskConical size={16} className="department-icon" />;
    if (d.includes("social") || d.includes("science") || d.includes("college")) return <GraduationCap size={16} className="department-icon" />;
    if (d.includes("logistic") || d.includes("transport")) return <Truck size={16} className="department-icon" />;
    return <Building2 size={16} className="department-icon" />;
  };

  const getSmartVehicleRecommendations = (request, vehicleList = vehicles) => {
    return vehicleList
      .map(vehicle => {
        let score = 0;
        const reasons = [];
        if (vehicle.capacity >= request.passengers) {
          if (vehicle.capacity <= request.passengers + 5) { score += 50; reasons.push("Optimal capacity match"); }
          else { score += 30; reasons.push("Sufficient capacity"); }
        } else {
          score += 10;
          reasons.push("Below required capacity");
        }

        const reqType = (request.vehicleType || "").toLowerCase();
        if (vehicle.type === reqType) { score += 30; reasons.push(`Matches requested ${vehicle.type}`); }

        if (request.priority === "emergency" && vehicle.type === "van") { score += 20; reasons.push("Suitable for emergency"); }

        return { ...vehicle, score, reasons, matchPercentage: Math.min(100, Math.round((score / 145) * 100)) };
      })
      .sort((a, b) => b.score - a.score);
  };

  const handleApproveClick = async (request) => {
    setRequestToApprove(request);
    setShowAssignmentModal(true);
    setRecommendedVehicles([]);
    setFuelEstimate(null);

    // Estimate fuel in background
    estimateFuel(request);

    try {
      const fresh = await getVehicles({ status: "available" });
      setVehicles(fresh);
      setRecommendedVehicles(getSmartVehicleRecommendations(request, fresh));
    } catch (err) {
      console.error("Failed to fetch vehicles:", err.message);
    }
  };

  const estimateFuel = async (request) => {
    if (!request.destination) return;
    setFuelLoading(true);
    try {
      // Origin: Haramaya University
      const origin = { lat: 9.1850, lon: 42.0350 };
      const dest   = await geocode(request.destination);
      const distKm = haversineKm(origin.lat, origin.lon, dest.lat, dest.lon);
      // Round trip
      const totalKm = distKm * 2;
      setFuelEstimate({ distKm: Math.round(distKm), totalKm: Math.round(totalKm), destName: dest.display.split(',')[0] });
    } catch (err) {
      setFuelEstimate({ error: err.message });
    } finally {
      setFuelLoading(false);
    }
  };

  const getFuelForVehicle = (vehicle) => {
    if (!fuelEstimate || fuelEstimate.error) return null;
    const type  = (vehicle.type || 'default').toLowerCase();
    const rate  = FUEL_RATES[type] || FUEL_RATES.default;
    const liters = Math.ceil((fuelEstimate.totalKm * rate) / 100);
    return { liters, rate, km: fuelEstimate.totalKm };
  };

  const confirmAssignment = async (vehicleId) => {
    try {
      setActionLoading(true);
      const updated = await approveRequest(requestToApprove._id, {
        vehicleId,
        approvedBy: currentUser?.name || currentUser?.username || "Transport Officer",
      });
      setRequests(prev => prev.map(r => r._id === updated._id ? updated : r));
      setShowAssignmentModal(false);
      setRequestToApprove(null);
      setRecommendedVehicles([]);
      // Refresh available vehicles
      const vehs = await getVehicles({ status: "available" });
      setVehicles(vehs);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) return;
    try {
      setActionLoading(true);
      const updated = await rejectRequest(id, rejectionReason);
      setRequests(prev => prev.map(r => r._id === updated._id ? updated : r));
      setRejectionReason("");
      setShowDetailsModal(false);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch =
      (req.requester || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.destination || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req._id || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "All" || req.priority === filterPriority.toLowerCase();
    const matchesStatus = filterStatus === "All" || req.status === filterStatus.toLowerCase();
    return matchesSearch && matchesPriority && matchesStatus;
  });

  if (loading) return <div className="request-management-layout"><p style={{padding:"2rem",color:"#94a3b8"}}>Loading requests...</p></div>;
  if (error) return <div className="request-management-layout"><p style={{padding:"2rem",color:"#f87171"}}>Error: {error}</p></div>;

  return (
    <div className="request-management-layout">
      <div className="dashboard-header">
        <div>
          <h1>Request Management</h1>
          <p>Review trips, allocate resources, and coordinate drivers</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={fetchData} title="Refresh">
            <RefreshCw size={16} />
          </button>
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="request-workspace-single">
        <div className="requests-panel-full">
          <div className="panel-header">
            <h3>Incoming Requests</h3>
            <span className="request-count">{filteredRequests.length}</span>
          </div>

          <div className="filter-bar">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
              <option value="All">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="filter-select">
              <option value="All">All Priority</option>
              <option value="emergency">Emergency</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="requests-list">
            {filteredRequests.length === 0 && (
              <p style={{padding:"1.5rem",color:"#94a3b8",textAlign:"center"}}>No requests found.</p>
            )}
            {filteredRequests.map((request) => (
              <div
                key={request._id}
                className={`request-item priority-${request.priority}`}
                onClick={() => { setSelectedRequest(request); setShowDetailsModal(true); }}
              >
                <div className="request-header">
                  <span className="request-id">{request._id.slice(-6).toUpperCase()}</span>
                  <span className={`status-badge status-${request.status}`}>{request.status}</span>
                </div>
                <div className="requester-info">
                  <h4>{request.requester}</h4>
                  <span className="department">{getDepartmentIcon(request.department)} {request.department}</span>
                </div>
                <div className="request-meta">
                  <div className="meta-item"><MapPin size={14} /><span>{request.destination}</span></div>
                  <div className="meta-item"><Calendar size={14} /><span>{request.date}</span></div>
                  <div className="meta-item"><Users size={14} /><span>{request.passengers} passengers</span></div>
                </div>
                <div className={`priority-indicator priority-${request.priority}`}>{request.priority}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Request Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Details</h2>
              <span className="request-id-large">#{selectedRequest._id.slice(-6).toUpperCase()}</span>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <div className="section-header"><User size={20} /><h4>Requester Info</h4></div>
                <div className="info-grid">
                  <div className="info-item"><label>Name</label><span>{selectedRequest.requester}</span></div>
                  <div className="info-item"><label>Department</label><span>{selectedRequest.department}</span></div>
                  {selectedRequest.requesterUsername && (
                    <div className="info-item"><label>Username</label><span>{selectedRequest.requesterUsername}</span></div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <div className="section-header"><MapPin size={20} /><h4>Trip Details</h4></div>
                <div className="info-grid">
                  <div className="info-item"><label>Purpose</label><span>{selectedRequest.purpose}</span></div>
                  <div className="info-item"><label>Destination</label><span>{selectedRequest.destination}</span></div>
                  <div className="info-item"><label>Date</label><span>{selectedRequest.date}</span></div>
                  <div className="info-item"><label>Passengers</label><span>{selectedRequest.passengers}</span></div>
                  <div className="info-item"><label>Vehicle Type</label><span>{selectedRequest.vehicleType}</span></div>
                  {selectedRequest.specialRequirements && (
                    <div className="info-item"><label>Special Requirements</label><span>{selectedRequest.specialRequirements}</span></div>
                  )}
                </div>
              </div>

              {selectedRequest.status === "approved" && selectedRequest.assignedVehicle && (
                <div className="detail-section assignment-section">
                  <div className="section-header"><Car size={20} /><h4>Vehicle Assignment</h4></div>
                  <div className="assignment-card">
                    <div className="vehicle-info">
                      <h5>{selectedRequest.assignedVehicle}</h5>
                      {selectedRequest.assignedDriver && <span>Driver: {selectedRequest.assignedDriver}</span>}
                      {selectedRequest.approvedBy && <span>Approved by: {selectedRequest.approvedBy}</span>}
                    </div>
                    <div className="assignment-status"><CheckCircle size={16} /><span>Assigned</span></div>
                  </div>
                </div>
              )}

              {selectedRequest.status === "pending" && (
                <div className="actions-section">
                  <button
                    className="action-btn approve-btn"
                    disabled={actionLoading}
                    onClick={() => { setShowDetailsModal(false); handleApproveClick(selectedRequest); }}
                  >
                    <CheckCircle size={16} /> Approve Request
                  </button>
                  <div className="reject-section">
                    <textarea
                      placeholder="Reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="rejection-textarea"
                    />
                    <button
                      className="action-btn reject-btn"
                      onClick={() => handleReject(selectedRequest._id)}
                      disabled={!rejectionReason.trim() || actionLoading}
                    >
                      <XCircle size={16} /> Reject Request
                    </button>
                  </div>
                </div>
              )}

              {selectedRequest.status === "rejected" && selectedRequest.rejectionReason && (
                <div className="rejection-display">
                  <AlertCircle size={16} />
                  <span>{selectedRequest.rejectionReason}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Assignment Modal */}
      {showAssignmentModal && (
        <div className="modal-overlay" onClick={() => setShowAssignmentModal(false)}>
          <div className="assignment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Select Vehicle for Assignment</h2>
              <button className="close-btn" onClick={() => setShowAssignmentModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="request-summary">
                <h3>Request: #{requestToApprove?._id.slice(-6).toUpperCase()}</h3>
                <div className="summary-details">
                  <span><strong>Requester:</strong> {requestToApprove?.requester}</span>
                  <span><strong>Passengers:</strong> {requestToApprove?.passengers}</span>
                  <span><strong>Destination:</strong> {requestToApprove?.destination}</span>
                  <span><strong>Priority:</strong> {requestToApprove?.priority}</span>
                </div>
              </div>

              {/* Fuel Estimate Banner */}
              <div className="fuel-estimate-banner">
                <div className="fuel-estimate-icon"><Fuel size={20} color="#16a34a" /></div>
                <div className="fuel-estimate-content">
                  {fuelLoading ? (
                    <span style={{ color:'#6b7280', fontSize:13 }}>📍 Calculating route to {requestToApprove?.destination}...</span>
                  ) : fuelEstimate?.error ? (
                    <span style={{ color:'#f59e0b', fontSize:13 }}>⚠ Could not estimate distance: {fuelEstimate.error}</span>
                  ) : fuelEstimate ? (
                    <>
                      <div className="fuel-estimate-title">
                        <Navigation size={14} /> Route: Haramaya University → {fuelEstimate.destName}
                      </div>
                      <div className="fuel-estimate-stats">
                        <span>📏 One-way: <strong>{fuelEstimate.distKm} km</strong></span>
                        <span>🔄 Round trip: <strong>{fuelEstimate.totalKm} km</strong></span>
                      </div>
                      <div style={{ fontSize:12, color:'#6b7280', marginTop:4 }}>
                        Fuel needed per vehicle type shown below ↓
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="recommendations-section">
                <h3>Available Vehicles ({recommendedVehicles.length})</h3>
                {recommendedVehicles.length === 0 && actionLoading === false && (
                  <p style={{color:"#94a3b8",padding:"1rem"}}>Loading vehicles...</p>
                )}
                <div className="vehicle-recommendations">
                  {recommendedVehicles.map((vehicle, index) => {
                    const fuel = getFuelForVehicle(vehicle);
                    return (
                    <div key={vehicle._id} className={`recommendation-card ${index === 0 ? "best-match" : ""}`}>
                      <div className="recommendation-header">
                        <div className="vehicle-info">
                          <h4>{vehicle.model}</h4>
                          <span className="vehicle-type">{vehicle.type} • {vehicle.capacity} seats • {vehicle.plateNumber}</span>
                        </div>
                        <div className="match-score">
                          <span className="percentage">{vehicle.matchPercentage}%</span>
                          <span className="match-label">Match</span>
                        </div>
                      </div>
                      {vehicle.assignedDriverName && (
                        <div className="driver-info">
                          <span><strong>Driver:</strong> {vehicle.assignedDriverName}</span>
                        </div>
                      )}
                      {/* Fuel Estimate for this vehicle */}
                      {fuel && (
                        <div className="vehicle-fuel-estimate">
                          <Fuel size={14} color="#16a34a" />
                          <span>Estimated fuel: <strong style={{ color:'#16a34a' }}>{fuel.liters}L</strong></span>
                          <span style={{ color:'#9ca3af', fontSize:11 }}>({fuel.rate}L/100km × {fuel.km}km)</span>
                        </div>
                      )}
                      <div className="match-reasons">
                        <strong>Why this vehicle:</strong>
                        <ul>{vehicle.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
                      </div>
                      <button
                        className={`assign-btn ${index === 0 ? "primary" : "secondary"}`}
                        onClick={() => confirmAssignment(vehicle._id)}
                        disabled={actionLoading}
                      >
                        {index === 0 ? "⭐ Assign Best Match" : "Assign Vehicle"}
                      </button>
                    </div>
                  );
                  })}

                  {/* Show all available vehicles if no smart recommendations */}
                  {recommendedVehicles.length === 0 && vehicles.map((vehicle) => (
                    <div key={vehicle._id} className="recommendation-card">
                      <div className="recommendation-header">
                        <div className="vehicle-info">
                          <h4>{vehicle.model}</h4>
                          <span className="vehicle-type">{vehicle.type} • {vehicle.capacity} seats • {vehicle.plateNumber}</span>
                        </div>
                      </div>
                      {vehicle.assignedDriverName && (
                        <div className="driver-info"><span><strong>Driver:</strong> {vehicle.assignedDriverName}</span></div>
                      )}
                      <button
                        className="assign-btn secondary"
                        onClick={() => confirmAssignment(vehicle._id)}
                        disabled={actionLoading}
                      >
                        Assign Vehicle
                      </button>
                    </div>
                  ))}

                  {vehicles.length === 0 && (
                    <div className="no-vehicles">
                      <p>⚠️ No available vehicles at the moment.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
