import { useState } from "react";
import { Search, MapPin, Users, Clock, AlertCircle, CheckCircle, XCircle, Building2, GraduationCap, Stethoscope, Truck, FlaskConical } from "lucide-react";
import "./requests.css";

export default function Requests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [expandedCard, setExpandedCard] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
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
      status: "in-transit",
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
    },
    {
      id: "HU-9012",
      name: "Mercedes Sprinter",
      type: "Van",
      capacity: 12,
      driver: "Dawit Haile",
      driverPhone: "+251-911-555555",
      status: "maintenance",
      fuelType: "Diesel",
      features: ["AC", "Cargo Space", "GPS"],
      suitableFor: ["research", "logistics"]
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
      specialRequirements: "Medical bag and portable equipment"
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
    },
    {
      id: "REQ-005",
      requester: "Mr. Yusuf Ibrahim",
      destination: "Bahir Dar Conference Center",
      date: "2024-03-25",
      time: "06:00",
      passengers: 12,
      priority: "Low",
      status: "Rejected",
      vehicleType: "Bus",
      purpose: "Academic conference attendance",
      department: "Engineering College",
      departmentType: "academic",
      contactPhone: "+251-911-234567",
      estimatedDuration: "4 days",
      specialRequirements: "Presentation equipment transport",
      rejectionReason: "Budget constraints for extended travel duration"
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
            score += 50; // Perfect size match
            reasons.push("Optimal capacity match");
          } else {
            score += 30; // Oversized but available
            reasons.push("Sufficient capacity");
          }
        } else {
          return null; // Cannot accommodate passengers
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

        if (request.specialRequirements.toLowerCase().includes("air conditioning") && 
            vehicle.features.includes("AC")) {
          score += 15;
          reasons.push("Air conditioning available");
        }

        // Vehicle type preference
        if (request.vehicleType.toLowerCase() === vehicle.type.toLowerCase()) {
          score += 20;
          reasons.push("Requested vehicle type");
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
    
    setRequests(prev =>
      prev.map(req =>
        req.id === requestToApprove.id 
          ? { 
              ...req, 
              status: "Approved",
              assignedVehicle: selectedVehicle.name,
              assignedDriver: selectedVehicle.driver,
              vehicleId: vehicleId
            } 
          : req
      )
    );
    
    setShowAssignmentModal(false);
    setRequestToApprove(null);
    setRecommendedVehicles([]);
  };

  const approveRequest = (id) => {
    const request = requests.find(r => r.id === id);
    handleApproveClick(request);
  };

  const rejectRequest = (id) => {
    if (!rejectionReason.trim()) {
      return;
    }
    setRequests(prev =>
      prev.map(req =>
        req.id === id ? { ...req, status: "Rejected", rejectionReason } : req
      )
    );
    setRejectionReason("");
    setExpandedCard(null);
  };

  const toggleRejectForm = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
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
  return (
    <div className="logistics-command-center">
      <div className="command-header">
        <div className="header-content">
          <h1 className="command-title">Request Management</h1>
          <p className="command-subtitle">Logistics Command Center • Real-time Operations</p>
        </div>
        <div className="header-actions">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search requests, destinations, or IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="command-search"
            />
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <div className="custom-select">
            <select 
              value={filterPriority} 
              onChange={(e) => setFilterPriority(e.target.value)}
              className="floating-select"
            >
              <option value="All">All Priorities</option>
              <option value="Emergency">Emergency</option>
              <option value="High">High Priority</option>
              <option value="Normal">Normal</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
          <div className="custom-select">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="floating-select"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div className="results-counter">
          <span className="counter-badge">{filteredRequests.length}</span>
          <span className="counter-text">Active Requests</span>
        </div>
      </div>

      <div className="command-grid">
        <div className="requests-panel">
          <div className="panel-header">
            <h2 className="panel-title">Incoming Requests</h2>
            <div className="live-indicator">
              <div className="pulse-dot"></div>
              <span>Live</span>
            </div>
          </div>
          
          <div className="requests-stream">
            {filteredRequests.map((request) => (
              <div 
                key={request.id} 
                className={`request-card ${selectedRequest?.id === request.id ? 'expanded' : 'compact'} priority-${request.priority.toLowerCase()} status-${request.status.toLowerCase()}`}
                onClick={() => setSelectedRequest(selectedRequest?.id === request.id ? null : request)}
              >
                <div className={`priority-glow priority-${request.priority.toLowerCase()}`}></div>
                
                <div className="card-header">
                  <div className="request-meta">
                    <span className="request-id">{request.id}</span>
                    <span className={`status-badge status-${request.status.toLowerCase()}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="request-time">
                    <Clock size={14} />
                    <span>{request.time}</span>
                  </div>
                </div>

                <div className="requester-section">
                  <div className="requester-info">
                    {getDepartmentIcon(request.departmentType)}
                    <div className="requester-details">
                      <h3 className="requester-name">{request.requester}</h3>
                      <span className="department-name">{request.department}</span>
                    </div>
                  </div>
                </div>

                <div className="trip-details-compact">
                  <div className="detail-row">
                    <MapPin size={14} className="detail-icon" />
                    <span className="detail-text">{request.destination}</span>
                  </div>
                  <div className="detail-row">
                    <Users size={14} className="detail-icon" />
                    <span className="detail-text">{request.passengers} passengers</span>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedRequest?.id === request.id && (
                  <div className="expanded-details">
                    <div className="detail-section">
                      <h4>Trip Information</h4>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>Date & Time:</label>
                          <span>{request.date} at {request.time}</span>
                        </div>
                        <div className="detail-item">
                          <label>Duration:</label>
                          <span>{request.estimatedDuration}</span>
                        </div>
                        <div className="detail-item">
                          <label>Vehicle Type:</label>
                          <span>{request.vehicleType}</span>
                        </div>
                        <div className="detail-item">
                          <label>Contact:</label>
                          <span>{request.contactPhone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>Purpose & Requirements</h4>
                      <p className="purpose-text-expanded">{request.purpose}</p>
                      <div className="requirements-box">
                        <strong>Special Requirements:</strong>
                        <p>{request.specialRequirements}</p>
                      </div>
                    </div>

                    {request.assignedVehicle && (
                      <div className="assignment-info">
                        <h4>Assignment Details</h4>
                        <div className="assignment-details">
                          <span><strong>Vehicle:</strong> {request.assignedVehicle}</span>
                          <span><strong>Driver:</strong> {request.assignedDriver}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                {request.status === "Pending" && (
                  <div className="card-actions">
                    <button 
                      className="action-btn approve-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        approveRequest(request.id);
                      }}
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button 
                      className="action-btn reject-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRejectForm(request.id);
                      }}
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                )}

                {/* Rejection Reason Display */}
                {request.status === "Rejected" && request.rejectionReason && (
                  <div className="rejection-display">
                    <AlertCircle size={16} className="rejection-icon" />
                    <span className="rejection-text">{request.rejectionReason}</span>
                  </div>
                )}

                {/* Expandable Rejection Form */}
                {expandedCard === request.id && (
                  <div className="rejection-form" onClick={(e) => e.stopPropagation()}>
                    <textarea
                      placeholder="Please provide a detailed reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="rejection-textarea"
                      autoFocus
                    />
                    <div className="rejection-actions">
                      <button 
                        className="cancel-btn"
                        onClick={() => toggleRejectForm(null)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="confirm-reject-btn"
                        onClick={() => rejectRequest(request.id)}
                        disabled={!rejectionReason.trim()}
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="assignment-panel">
          <div className="panel-header">
            <h2 className="panel-title">Vehicle Fleet</h2>
            <span className="assignment-subtitle">Real-time status</span>
          </div>
          
          <div className="vehicle-fleet">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className={`fleet-card ${vehicle.status}`}>
                <div className="vehicle-header">
                  <h4 className="vehicle-name">{vehicle.name}</h4>
                  <span className="vehicle-id">{vehicle.id}</span>
                </div>
                <div className="vehicle-specs">
                  <span className="spec-item">🚐 {vehicle.capacity} seats</span>
                  <span className="spec-item">👤 {vehicle.driver}</span>
                  <span className="spec-item">⛽ {vehicle.fuelType}</span>
                </div>
                <div className="vehicle-features">
                  {vehicle.features.slice(0, 2).map((feature, index) => (
                    <span key={index} className="feature-tag">{feature}</span>
                  ))}
                </div>
                <div className={`availability-status ${vehicle.status}`}>
                  <div className="status-dot"></div>
                  <span>{vehicle.status === 'available' ? 'Available' : 
                         vehicle.status === 'in-transit' ? 'In Transit' : 'Maintenance'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Smart Assignment Modal */}
      {showAssignmentModal && (
        <div className="modal-overlay" onClick={() => setShowAssignmentModal(false)}>
          <div className="assignment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Smart Vehicle Assignment</h2>
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
                        {index === 0 ? '✨ Assign Best Match' : 'Assign Vehicle'}
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