import { useState, useEffect } from "react";
import { Search, MapPin, Users, AlertCircle, CheckCircle, XCircle, Building2, GraduationCap, Stethoscope, Truck, FlaskConical, Car, User, Calendar, RefreshCw, Fuel, Navigation } from "lucide-react";
import { getRequests, getVehicles, approveRequest, rejectRequest, getCurrentUser } from "../../api/api";
import "./requests.css";

// Haversine distance — straight line fallback
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

// Geocode via Nominatim
const geocode = async (place) => {
  const query = encodeURIComponent(`${place}, Ethiopia`);
  const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'HU-VMS/1.0' }
  });
  const data = await res.json();
  if (!data.length) throw new Error(`Location not found: ${place}`);
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), display: data[0].display_name };
};

// Get actual road distance via OSRM (free routing engine)
const getRoadDistance = async (fromLat, fromLon, toLat, toLon) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=false`;
    const res  = await fetch(url);
    const data = await res.json();
    if (data.code === 'Ok' && data.routes?.length) {
      return {
        distKm:      Math.round(data.routes[0].distance / 100) / 10,
        durationMin: Math.round(data.routes[0].duration / 60),
        source:      'road',
      };
    }
  } catch {}
  // Fallback: straight-line × 1.3 road factor
  const d = haversineKm(fromLat, fromLon, toLat, toLon);
  return { distKm: Math.round(d * 1.3 * 10) / 10, durationMin: Math.round(d * 1.3 / 60 * 60), source: 'estimated' };
};

// Per-vehicle fuel consumption (L/100km) — model-specific then type fallback
const getFuelRate = (vehicle) => {
  const type  = (vehicle?.type  || '').toLowerCase();
  const model = (vehicle?.model || '').toLowerCase();

  if (/land cruiser|prado|gx/.test(model))    return { rate: 14, label: 'Land Cruiser 4WD' };
  if (/hilux/.test(model))                    return { rate: 12, label: 'Toyota Hilux' };
  if (/hiace/.test(model))                    return { rate: 14, label: 'Toyota HiAce' };
  if (/coaster/.test(model))                  return { rate: 20, label: 'Toyota Coaster' };
  if (/isuzu/.test(model))                    return { rate: 16, label: 'Isuzu' };
  if (/bus|coach/.test(model))                return { rate: 30, label: 'Bus' };
  if (/truck|lorry/.test(model))              return { rate: 28, label: 'Truck' };
  if (/minibus|mini bus/.test(model))         return { rate: 18, label: 'Minibus' };
  if (/corolla|camry|sedan/.test(model))      return { rate: 9,  label: 'Sedan' };
  if (/rav4|crv|fortuner|suv/.test(model))    return { rate: 11, label: 'SUV' };
  if (/pickup|ranger|navara|d-max/.test(model)) return { rate: 13, label: 'Pickup' };

  const typeRates = {
    bus:     { rate: 30, label: 'Bus' },
    minibus: { rate: 18, label: 'Minibus' },
    van:     { rate: 14, label: 'Van' },
    truck:   { rate: 28, label: 'Truck' },
    pickup:  { rate: 13, label: 'Pickup' },
    suv:     { rate: 11, label: 'SUV' },
    car:     { rate: 9,  label: 'Car' },
    sedan:   { rate: 9,  label: 'Sedan' },
  };
  return typeRates[type] || { rate: 12, label: 'Vehicle' };
};

// Fuel prices in ETB per liter (Ethiopia current approximate rates)
const FUEL_PRICES_ETB = {
  Diesel: 95,
  Petrol: 100,
  default: 95,
};

// Typical tank capacities by vehicle type (liters)
const TANK_CAPACITY = {
  bus:     200,
  minibus: 80,
  van:     70,
  truck:   200,
  pickup:  70,
  suv:     65,
  car:     50,
  sedan:   50,
};

const getTankCapacity = (vehicle) => {
  const type  = (vehicle?.type  || '').toLowerCase();
  const model = (vehicle?.model || '').toLowerCase();
  if (/coaster/.test(model))  return 100;
  if (/hiace/.test(model))    return 70;
  if (/land cruiser|prado/.test(model)) return 87;
  if (/hilux/.test(model))    return 80;
  if (/isuzu/.test(model))    return 100;
  return TANK_CAPACITY[type] || 60;
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
  const [tripType, setTripType]           = useState('round_trip'); // 'round_trip' | 'one_way'

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
    setTripType('round_trip'); // default to round trip

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

  const estimateFuel = async (request, currentTripType = tripType) => {
    if (!request.destination) return;
    setFuelLoading(true);
    try {
      const origin = { lat: 9.1850, lon: 42.0350 }; // Haramaya University
      const dest   = await geocode(request.destination);
      const route  = await getRoadDistance(origin.lat, origin.lon, dest.lat, dest.lon);
      // Round trip = ×2, one way = ×1, then add 10% safety buffer
      const multiplier = currentTripType === 'one_way' ? 1 : 2;
      const baseKm  = route.distKm * multiplier;
      const totalKm = Math.round(baseKm * 1.10 * 10) / 10; // +10% buffer
      setFuelEstimate({
        distKm:      route.distKm,
        baseKm:      Math.round(baseKm * 10) / 10,
        totalKm,
        bufferKm:    Math.round((totalKm - baseKm) * 10) / 10,
        durationMin: route.durationMin,
        source:      route.source,
        destName:    dest.display.split(',')[0],
        tripType:    currentTripType,
      });
    } catch (err) {
      setFuelEstimate({ error: err.message });
    } finally {
      setFuelLoading(false);
    }
  };

  const getFuelForVehicle = (vehicle) => {
    if (!fuelEstimate || fuelEstimate.error) return null;
    const { rate, label } = getFuelRate(vehicle);
    const totalNeeded = Math.ceil((fuelEstimate.totalKm * rate) / 100);
    const tankCapacity = getTankCapacity(vehicle);
    const fuelType = vehicle?.fuelType || 'Diesel';
    const pricePerLiter = FUEL_PRICES_ETB[fuelType] || FUEL_PRICES_ETB.default;

    // Check if needed fuel exceeds tank capacity
    const exceedsTank = totalNeeded > tankCapacity;
    const fuelFromStation = exceedsTank ? tankCapacity : totalNeeded;
    const fuelGapLiters   = exceedsTank ? totalNeeded - tankCapacity : 0;
    const cashAllowanceETB = exceedsTank ? Math.ceil(fuelGapLiters * pricePerLiter) : 0;

    return {
      liters:           fuelFromStation,   // what the fuel station gives
      totalNeeded,                          // total needed for the trip
      tankCapacity,
      exceedsTank,
      fuelGapLiters,
      cashAllowanceETB,
      pricePerLiter,
      fuelType,
      rate,
      label,
      km: fuelEstimate.totalKm,
    };
  };

  const confirmAssignment = async (vehicleId, vehicle) => {
    try {
      setActionLoading(true);
      const fuel = getFuelForVehicle(vehicle);
      const updated = await approveRequest(requestToApprove._id, {
        vehicleId,
        approvedBy: currentUser?.name || currentUser?.username || "Transport Officer",
        estimatedFuelLiters: fuel?.liters || null,
        fuelType: vehicle?.fuelType || 'Diesel',
        tripType,
        cashAllowanceETB: fuel?.cashAllowanceETB || 0,
        totalFuelNeededLiters: fuel?.totalNeeded || null,
      });
      setRequests(prev => prev.map(r => r._id === updated._id ? updated : r));
      setShowAssignmentModal(false);
      setRequestToApprove(null);
      setRecommendedVehicles([]);
      setFuelEstimate(null);
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
    // Only show requests currently assigned to Transport Officer
    // (either direct submissions or dean-forwarded ones at level 2)
    const isAssignedToTransport =
      !req.currentApproverRole ||                          // legacy requests (no routing)
      req.currentApproverRole === 'TRANSPORT_OFFICER';     // explicitly routed here
    if (!isAssignedToTransport) return false;

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
                  {request.deanStamp?.deanName && (
                    <div className="meta-item" style={{ marginTop: 4 }}>
                      <span style={{ fontSize: 11, background: '#dcfce7', color: '#15803d', padding: '2px 10px', borderRadius: 20, fontWeight: 700, border: '1px solid #86efac' }}>
                        🏛️ Dean Approved · {request.deanStamp.deanName} · {request.deanStamp.collegeName}
                      </span>
                    </div>
                  )}
                  {request.unitType === 'DEPARTMENT' && !request.deanStamp?.deanName && (
                    <div className="meta-item" style={{ marginTop: 4 }}>
                      <span style={{ fontSize: 11, background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                        🏛️ Dean-forwarded · Stage {request.approvalLevel || 1}/2
                      </span>
                    </div>
                  )}
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
                  {selectedRequest.unitType && (
                    <div className="info-item"><label>Unit</label><span>{selectedRequest.unitName || selectedRequest.unitType}</span></div>
                  )}
                  {selectedRequest.collegeName && (
                    <div className="info-item"><label>College</label><span>{selectedRequest.collegeName}</span></div>
                  )}
                  {selectedRequest.unitType === 'DEPARTMENT' && (
                    <div className="info-item">
                      <label>Approval Stage</label>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                          Stage {selectedRequest.approvalLevel || 1}/2
                        </span>
                        {(selectedRequest.approvalLevel || 1) >= 2 && (
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                            ✓ Dean Approved
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dean Approval Stamp — shown when request was approved by a dean */}
              {selectedRequest.deanStamp?.deanName && (
                <div className="detail-section" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1.5px solid #86efac', borderRadius: 12, padding: '16px 18px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 20 }}>🏛️</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#15803d' }}>Dean Approval Stamp</div>
                      <div style={{ fontSize: 11, color: '#16a34a' }}>This request has been reviewed and approved by the College Dean</div>
                    </div>
                    <span style={{ marginLeft: 'auto', background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>✓ VERIFIED</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px', background: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: '12px 14px' }}>
                    {[
                      ['Dean Name',    selectedRequest.deanStamp.deanName],
                      ['Employee ID',  selectedRequest.deanStamp.deanEmployeeId || '—'],
                      ['College',      selectedRequest.deanStamp.collegeName],
                      ['College Code', selectedRequest.deanStamp.collegeCode || '—'],
                      ['Approved At',  selectedRequest.deanStamp.approvedAt
                        ? new Date(selectedRequest.deanStamp.approvedAt).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
                        : '—'],
                      ['Username',     selectedRequest.deanStamp.deanUsername || '—'],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: 13, color: '#14532d', fontWeight: 600 }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  {selectedRequest.deanStamp.remarks && (
                    <div style={{ marginTop: 10, background: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: '8px 12px' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Dean&apos;s Remarks</div>
                      <div style={{ fontSize: 13, color: '#14532d', fontStyle: 'italic' }}>&ldquo;{selectedRequest.deanStamp.remarks}&rdquo;</div>
                    </div>
                  )}
                </div>
              )}

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
                      {selectedRequest.tripType && (
                        <span>Trip type: {selectedRequest.tripType === 'one_way' ? '➡️ One Way' : '🔄 Round Trip'}</span>
                      )}
                      {selectedRequest.estimatedFuelLiters && (
                        <span>⛽ Fuel from station: {selectedRequest.estimatedFuelLiters}L {selectedRequest.fuelType || ''}</span>
                      )}
                      {selectedRequest.totalFuelNeededLiters && selectedRequest.totalFuelNeededLiters !== selectedRequest.estimatedFuelLiters && (
                        <span>📊 Total needed: {selectedRequest.totalFuelNeededLiters}L (incl. 10% buffer)</span>
                      )}
                      {selectedRequest.cashAllowanceETB > 0 && (
                        <div style={{ marginTop: 8, padding: '8px 12px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, fontSize: 13 }}>
                          💵 Cash Allowance: <strong style={{ color: '#d97706', fontSize: 15 }}>
                            {selectedRequest.cashAllowanceETB.toLocaleString()} ETB
                          </strong>
                          <div style={{ fontSize: 11, color: '#92400e', marginTop: 2 }}>
                            For road refueling — tank capacity insufficient for full trip
                          </div>
                        </div>
                      )}
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

                  {/* Trip type toggle */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', alignSelf: 'center' }}>Trip Type:</span>
                    {[
                      { value: 'round_trip', label: '🔄 Round Trip' },
                      { value: 'one_way',    label: '➡️ One Way' },
                    ].map(opt => (
                      <button key={opt.value}
                        onClick={() => {
                          setTripType(opt.value);
                          if (requestToApprove) estimateFuel(requestToApprove, opt.value);
                        }}
                        style={{
                          padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                          fontSize: 12, fontWeight: 700,
                          background: tripType === opt.value ? '#2563eb' : '#f1f5f9',
                          color: tripType === opt.value ? '#fff' : '#64748b',
                        }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {fuelLoading ? (
                    <span style={{ color:'#6b7280', fontSize:13 }}>📍 Calculating route to {requestToApprove?.destination}...</span>
                  ) : fuelEstimate?.error ? (
                    <span style={{ color:'#f59e0b', fontSize:13 }}>⚠ Could not estimate distance: {fuelEstimate.error}</span>
                  ) : fuelEstimate ? (
                    <>
                      <div className="fuel-estimate-title">
                        <Navigation size={14} /> Route: Haramaya University → {fuelEstimate.destName}
                        {fuelEstimate.source === 'road' && <span style={{ fontSize:11, color:'#16a34a', marginLeft:6 }}>📡 Road route</span>}
                        {fuelEstimate.source === 'estimated' && <span style={{ fontSize:11, color:'#f59e0b', marginLeft:6 }}>📐 Estimated</span>}
                      </div>
                      <div className="fuel-estimate-stats">
                        <span>📏 One-way: <strong>{fuelEstimate.distKm} km</strong></span>
                        {tripType === 'round_trip'
                          ? <span>🔄 Round trip: <strong>{fuelEstimate.baseKm} km</strong></span>
                          : <span>➡️ One-way trip: <strong>{fuelEstimate.baseKm} km</strong></span>
                        }
                        <span style={{ color: '#f59e0b' }}>+10% buffer: <strong>{fuelEstimate.totalKm} km total</strong></span>
                        {fuelEstimate.durationMin && <span>⏱ ~{fuelEstimate.durationMin} min one-way</span>}
                      </div>
                      <div style={{ fontSize:12, color:'#6b7280', marginTop:4 }}>
                        Fuel needed per vehicle shown below ↓ (includes 10% safety buffer)
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
                        <div>
                          <div className="vehicle-fuel-estimate">
                            <Fuel size={14} color="#16a34a" />
                            <span>Fuel from station: <strong style={{ color:'#16a34a' }}>{fuel.liters}L</strong></span>
                            <span style={{ color:'#9ca3af', fontSize:11 }}>({fuel.label} — {fuel.rate}L/100km × {fuel.km}km)</span>
                          </div>
                          {fuel.exceedsTank && (
                            <div style={{
                              marginTop: 8, padding: '10px 12px', borderRadius: 8,
                              background: '#fef3c7', border: '1px solid #fde68a',
                            }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>
                                ⚠️ Tank capacity exceeded — Cash Allowance Required
                              </div>
                              <div style={{ fontSize: 12, color: '#78350f', lineHeight: 1.6 }}>
                                <div>Total needed: <strong>{fuel.totalNeeded}L</strong> &nbsp;|&nbsp; Tank holds: <strong>{fuel.tankCapacity}L</strong></div>
                                <div>Fuel gap: <strong>{fuel.fuelGapLiters}L</strong> to buy on the road</div>
                                <div style={{ marginTop: 4, padding: '6px 10px', background: '#fffbeb', borderRadius: 6, border: '1px solid #fcd34d' }}>
                                  💵 Cash Allowance: <strong style={{ fontSize: 14, color: '#d97706' }}>
                                    {fuel.cashAllowanceETB.toLocaleString()} ETB
                                  </strong>
                                  <span style={{ fontSize: 11, color: '#92400e', marginLeft: 6 }}>
                                    ({fuel.fuelGapLiters}L × {fuel.pricePerLiter} ETB/L)
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="match-reasons">
                        <strong>Why this vehicle:</strong>
                        <ul>{vehicle.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
                      </div>
                      <button
                        className={`assign-btn ${index === 0 ? "primary" : "secondary"}`}
                        onClick={() => confirmAssignment(vehicle._id, vehicle)}
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
