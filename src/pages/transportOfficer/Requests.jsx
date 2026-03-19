import { useState } from "react";
import { Search, MapPin, Users, Clock, AlertCircle, CheckCircle, XCircle, Building2, GraduationCap, Stethoscope, Truck, FlaskConical, Car, User, Phone, Calendar } from "lucide-react";
import "./requests.css";

export default function Requests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState(null);
  const [recommendedVehicles, setRecommendedVehicles] = useState([]);
  
  const [vehicles] = useState([
    {
      id: "HU-2456",
      name: "Toyota Hiace",
      type: "Van",
      capacity: 14,
      driver: "Abdi Mohammed",
      driverPhone: "+251-911-111111",
      status: "available",
      fuelType: "Diesel",
      features: ["AC", "GPS", "Medical Kit"],
      suitableFor: ["medical", "research", "academic"]
    },
    {
      id: "HU-3789",
      name: "Isuzu D-Max",
      type: "Pickup",
      capacity: 5,
      driver: "Fatuma Ahmed",
      driverPhone: "+251-911-222222",
      status: "available",
      fuelType: "Diesel",
      features: ["4WD", "Cargo Space"],
      suitableFor: ["logistics", "research"]
    },
    {
      id: "HU-1234",
      name: "Toyota Coaster",
      type: "Bus",
      capacity: 30,
      driver: "Alemayehu Tadesse",
      driverPhone: "+251-911-333333",
      status: "available",
      fuelType: "Diesel",
      features: ["AC", "Large Capacity", "Comfortable Seats"],
      suitableFor: ["academic", "administration"]
    },
    {
      id: "HU-5678",
      name: "Toyota Land Cruiser",
      type: "SUV",
      capacity: 7,
      driver: "Meron Bekele",
      driverPhone: "+251-911-444444",
      status: "available",
      fuelType: "Petrol",
      features: ["4WD", "Medical Equipment Space", "Emergency Kit"],
      suitableFor: ["medical", "emergency"]
    }
  ]);
  
  const [requests, setRequests] = useState([
    {
      id: "REQ-001",
      requester: "Dr. Ahmed Hassan",
      destination: "Dire Dawa Medical Center",
      date: "2024-03-15",
      time: "08:30",
      passengers: 8,
      priority: "Emergency",
      status: "Pending",
      vehicleType: "Ambulance",
      purpose: "Emergency medical transport for critical patient",
      department: "Medical College",
      departmentType: "medical",
      contactPhone: "+251-911-123456",
      estimatedDuration: "4 hours",
      specialRequirements: "Medical equipment and oxygen support required"
    },
    {
      id: "REQ-002", 
      requester: "Prof. Sarah Johnson",
      destination: "Addis Ababa Research Institute",
      date: "2024-03-18",
      time: "09:00",
      passengers: 6,
      priority: "High",
      status: "Pending",
      vehicleType: "Van",
      purpose: "Research collaboration and equipment transport",
      department: "Agriculture College",
      departmentType: "research",
      contactPhone: "+251-911-789012",
      estimatedDuration: "2 days",
      specialRequirements: "Climate-controlled storage for samples"
    },
    {
      id: "REQ-003",
      requester: "Dr. Mohammed Ali",
      destination: "Harar General Hospital",
      date: "2024-03-20",
      time: "14:00",
      passengers: 4,
      priority: "Normal",
      status: "Approved",
      vehicleType: "SUV",
      purpose: "Medical consultation and patient follow-up",
      department: "Health Sciences",
      departmentType: "medical",
      contactPhone: "+251-911-345678",
      estimatedDuration: "6 hours",
      specialRequirements: "Medical bag and portable equipment",
      assignedVehicle: "Toyota Land Cruiser",
      assignedDriver: "Meron Bekele",
      matchPercentage: 95
    },
    {
      id: "REQ-004",
      requester: "Ms. Fatima Ahmed",
      destination: "Jijiga University Campus",
      date: "2024-03-22",
      time: "07:00",
      passengers: 15,
      priority: "Normal",
      status: "Pending",
      vehicleType: "Bus",
      purpose: "Student field research expedition",
      department: "Social Sciences",
      departmentType: "academic",
      contactPhone: "+251-911-567890",
      estimatedDuration: "3 days",
      specialRequirements: "Research equipment and camping gear transport"
    }
  ]);

  const getDepartmentIcon = (type) => {
    switch (type) {
      case "medical": return <Stethoscope size={16} className="department-icon" />;
      case "research": return <FlaskConical size={16} className="department-icon" />;
      case "academic": return <GraduationCap size={16} className="department-icon" />;
      case "logistics": return <Truck size={16} className="department-icon" />;
      case "administration": return <Building2 size={16} className="department-icon" />;
      default: return <Building2 size={16} className="department-icon" />;
    }
  };

  const getSmartVehicleRecommendations = (request) => {
    const availableVehicles = vehicles.filter(v => v.status === "available");
    
    return availableVehicles
      .map(vehicle => {
        let score = 0;
        let reasons = [];

        // Capacity matching (most important)
        if (vehicle.capacity >= request.passengers) {
          if (vehicle.capacity <= request.passengers + 5) {
            score += 50;
            reasons.push("Optimal capacity match");
          } else {
            score += 30;
            reasons.push("Sufficient capacity");
          }
        } else {
          return null;
        }

        // Department type suitability
        if (vehicle.suitableFor.includes(request.departmentType)) {
          score += 30;
          reasons.push("Suitable for " + request.departmentType);
        }

        // Priority matching
        if (request.priority === "Emergency" && vehicle.features.includes("Emergency Kit")) {
          score += 40;
          reasons.push("Emergency equipped");
        }

        // Special requirements
        if (request.specialRequirements.toLowerCase().includes("medical") && 
            vehicle.features.includes("Medical Kit")) {
          score += 25;
          reasons.push("Medical equipment available");
        }

        return {
          ...vehicle,
          score,
          reasons,
          matchPercentage: Math.min(100, Math.round((score / 100) * 100))
        };
      })
      .filter(v => v !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Top 3 recommendations
  };

  const handleApproveClick = (request) => {
    const recommendations = getSmartVehicleRecommendations(request);
    setRecommendedVehicles(recommendations);
    setRequestToApprove(request);
    setShowAssignmentModal(true);
  };

  const confirmAssignment = (vehicleId) => {
    const selectedVehicle = vehicles.find(v => v.id === vehicleId);
    const matchPercentage = recommendedVehicles.find(v => v.id === vehicleId)?.matchPercentage || 85;
    
    setRequests(prev =>
      prev.map(req =>
        req.id === requestToApprove.id 
          ? { 
              ...req, 
              status: "Approved",
              assignedVehicle: selectedVehicle.name,
              assignedDriver: selectedVehicle.driver,
              vehicleId: vehicleId,
              matchPercentage: matchPercentage
            } 
          : req
      )
    );
    
    // Update selected request
    if (selectedRequest && selectedRequest.id === requestToApprove.id) {
      setSelectedRequest({
        ...requestToApprove,
        status: "Approved",
        assignedVehicle: selectedVehicle.name,
        assignedDriver: selectedVehicle.driver,
        vehicleId: vehicleId,
        matchPercentage: matchPercentage
      });
    }
    
    setShowAssignmentModal(false);
    setRequestToApprove(null);
    setRecommendedVehicles([]);
  };

  const rejectRequest = (id) => {
    if (!rejectionReason.trim()) return;
    
    setRequests(prev =>
      prev.map(req =>
        req.id === id ? { ...req, status: "Rejected", rejectionReason } : req
      )
    );
    
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest({
        ...selectedRequest,
        status: "Rejected",
        rejectionReason
      });
    }
    
    setRejectionReason("");
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "All" || req.priority === filterPriority;
    const matchesStatus = filterStatus === "All" || req.status === filterStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  return (
    <div className="request-management-layout">
      <div className="dashboard-header">
        <div>
          <h1>Request Management</h1>
          <p>Review trips, allocate resources, and coordinate drivers</p>
        </div>
        <div className="header-actions">
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
        {/* Single Panel - Incoming Requests */}
        <div className="requests-panel-full">
          <div className="panel-header">
            <h3>Incoming Requests</h3>
            <span className="request-count">{filteredRequests.length}</span>
          </div>
          
          <div className="filter-bar">
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
            <select 
              value={filterPriority} 
              onChange={(e) => setFilterPriority(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Priority</option>
              <option value="Emergency">Emergency</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="requests-list">
            {filteredRequests.map((request) => (
              <div 
                key={request.id} 
                className={`request-item priority-${request.priority.toLowerCase()}`}
                onClick={() => handleRequestClick(request)}
              >
                <div className="request-header">
                  <span className="request-id">{request.id}</span>
                  <span className={`status-badge status-${request.status.toLowerCase()}`}>
                    {request.status}
                  </span>
                </div>
                
                <div className="requester-info">
                  <h4>{request.requester}</h4>
                  <span className="department">{request.department}</span>
                </div>
                
                <div className="request-meta">
                  <div className="meta-item">
                    <MapPin size={14} />
                    <span>{request.destination}</span>
                  </div>
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>{request.date}</span>
                  </div>
                  <div className="meta-item">
                    <Users size={14} />
                    <span>{request.passengers} passengers</span>
                  </div>
                </div>
                
                <div className={`priority-indicator priority-${request.priority.toLowerCase()}`}>
                  {request.priority}
                </div>
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
              <span className="request-id-large">{selectedRequest.id}</span>
              <button 
                className="close-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {/* Requester Info Section */}
              <div className="detail-section">
                <div className="section-header">
                  <User size={20} />
                  <h4>Requester Info</h4>
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Name</label>
                    <span>{selectedRequest.requester}</span>
                  </div>
                  <div className="info-item">
                    <label>Department</label>
                    <span>{selectedRequest.department}</span>
                  </div>
                </div>
              </div>

              {/* Trip Details Section */}
              <div className="detail-section">
                <div className="section-header">
                  <MapPin size={20} />
                  <h4>Trip Details</h4>
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Purpose</label>
                    <span>{selectedRequest.purpose}</span>
                  </div>
                  <div className="info-item">
                    <label>Destination</label>
                    <span>{selectedRequest.destination}</span>
                  </div>
                  <div className="info-item">
                    <label>Departure</label>
                    <span>{selectedRequest.date}, {selectedRequest.time}</span>
                  </div>
                  <div className="info-item">
                    <label>Return</label>
                    <span>{selectedRequest.estimatedDuration}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Assignment Section */}
              {selectedRequest.status === "Approved" && selectedRequest.assignedVehicle && (
                <div className="detail-section assignment-section">
                  <div className="section-header">
                    <Car size={20} />
                    <h4>Vehicle Assignment</h4>
                    <span className="match-badge">{selectedRequest.matchPercentage}% Match</span>
                  </div>
                  <div className="assignment-card">
                    <div className="vehicle-info">
                      <h5>{selectedRequest.assignedVehicle}</h5>
                      <span>Driver: {selectedRequest.assignedDriver}</span>
                    </div>
                    <div className="assignment-status">
                      <CheckCircle size={16} />
                      <span>Assigned</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions Section */}
              {selectedRequest.status === "Pending" && (
                <div className="actions-section">
                  <button 
                    className="action-btn approve-btn"
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleApproveClick(selectedRequest);
                    }}
                  >
                    <CheckCircle size={16} />
                    Approve Request
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
                      onClick={() => {
                        rejectRequest(selectedRequest.id);
                        setShowDetailsModal(false);
                      }}
                      disabled={!rejectionReason.trim()}
                    >
                      <XCircle size={16} />
                      Reject Request
                    </button>
                  </div>
                </div>
              )}

              {selectedRequest.status === "Rejected" && selectedRequest.rejectionReason && (
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
              <button 
                className="close-btn"
                onClick={() => setShowAssignmentModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="request-summary">
                <h3>Request: {requestToApprove?.id}</h3>
                <div className="summary-details">
                  <span><strong>Requester:</strong> {requestToApprove?.requester}</span>
                  <span><strong>Passengers:</strong> {requestToApprove?.passengers}</span>
                  <span><strong>Destination:</strong> {requestToApprove?.destination}</span>
                  <span><strong>Priority:</strong> {requestToApprove?.priority}</span>
                </div>
              </div>

              <div className="recommendations-section">
                <h3>Recommended Vehicles</h3>
                <div className="vehicle-recommendations">
                  {recommendedVehicles.map((vehicle, index) => (
                    <div key={vehicle.id} className={`recommendation-card ${index === 0 ? 'best-match' : ''}`}>
                      <div className="recommendation-header">
                        <div className="vehicle-info">
                          <h4>{vehicle.name}</h4>
                          <span className="vehicle-type">{vehicle.type} • {vehicle.capacity} seats</span>
                        </div>
                        <div className="match-score">
                          <span className="percentage">{vehicle.matchPercentage}%</span>
                          <span className="match-label">Match</span>
                        </div>
                      </div>
                      
                      <div className="driver-info">
                        <span><strong>Driver:</strong> {vehicle.driver}</span>
                        <span><strong>Contact:</strong> {vehicle.driverPhone}</span>
                      </div>
                      
                      <div className="match-reasons">
                        <strong>Why this vehicle:</strong>
                        <ul>
                          {vehicle.reasons.map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <button 
                        className={`assign-btn ${index === 0 ? 'primary' : 'secondary'}`}
                        onClick={() => confirmAssignment(vehicle.id)}
                      >
                        {index === 0 ? '⭐ Assign Best Match' : 'Assign Vehicle'}
                      </button>
                    </div>
                  ))}
                </div>
                
                {recommendedVehicles.length === 0 && (
                  <div className="no-vehicles">
                    <p>⚠️ No suitable vehicles available for this request.</p>
                    <p>All vehicles are either in use or don't meet the requirements.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}