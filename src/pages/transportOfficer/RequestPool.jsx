import { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Users, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  ChevronRight,
  Car,
  Briefcase,
  ClipboardList,
  Bell,
  User,
  Send
} from 'lucide-react';
import './RequestPool.css';

const RequestPool = () => {
  const [requests, setRequests] = useState([
    {
      id: 'REQ-001',
      requestedBy: 'Dr. Ahmed Hassan',
      department: 'Engineering',
      destination: 'Dire Dawa',
      date: '2024-03-15',
      departureTime: '08:00 AM',
      returnDate: '2024-03-17',
      tripDuration: 3,
      priority: 'High',
      status: 'Pending',
      purpose: 'Academic Conference',
      requestedVehicleType: 'Toyota Hiace',
      requestedCapacity: 12,
      passengerCount: 8,
      estimatedDistance: '515 km',
      accommodationRequired: true
    },
    {
      id: 'REQ-002',
      requestedBy: 'Prof. Sarah Johnson',
      department: 'Medicine',
      destination: 'Addis Ababa',
      date: '2024-03-16',
      departureTime: '06:30 AM',
      returnDate: '2024-03-18',
      tripDuration: 3,
      priority: 'Medium',
      status: 'Pending',
      purpose: 'Medical Supplies Procurement',
      requestedVehicleType: 'Toyota Coaster',
      requestedCapacity: 25,
      passengerCount: 20,
      estimatedDistance: '526 km',
      accommodationRequired: true
    },
    {
      id: 'REQ-003',
      requestedBy: 'Mr. Kebede Alemu',
      department: 'Administration',
      destination: 'Harar',
      date: '2024-03-17',
      departureTime: '09:00 AM',
      returnDate: '2024-03-17',
      tripDuration: 1,
      priority: 'Low',
      status: 'Under Review',
      purpose: 'Official Meeting',
      requestedVehicleType: 'Isuzu D-Max',
      requestedCapacity: 5,
      passengerCount: 3,
      estimatedDistance: '45 km',
      accommodationRequired: false
    }
  ]);

  // Vehicles already have drivers assigned (1:1 relationship)
  const [fleetVehicles] = useState([
    { id: 'HU-2456', model: 'Toyota Hiace', capacity: 14, status: 'Available', driver: { name: 'Abdi Mohammed', phone: '+251-911-123456', id: 'DRV-001' } },
    { id: 'HU-3789', model: 'Isuzu D-Max', capacity: 5, status: 'Available', driver: { name: 'Fatuma Ahmed', phone: '+251-911-234567', id: 'DRV-002' } },
    { id: 'HU-1234', model: 'Toyota Coaster', capacity: 30, status: 'Available', driver: { name: 'Alemayehu Tadesse', phone: '+251-911-345678', id: 'DRV-003' } },
    { id: 'HU-5678', model: 'Toyota Land Cruiser', capacity: 7, status: 'On Trip', driver: { name: 'Bekele Worku', phone: '+251-911-456789', id: 'DRV-004' } },
  ]);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Reject modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Success notification
  const [notification, setNotification] = useState(null);

  const availableVehicles = fleetVehicles.filter(v => v.status === 'Available');
  const selectedVehicle = fleetVehicles.find(v => v.id === selectedVehicleId);

  const filteredRequests = requests.filter(req =>
    req.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectRequest = (req) => {
    setSelectedRequest(req);
    setSelectedVehicleId('');
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleApprove = () => {
    if (!selectedVehicleId || !selectedVehicle) return;

    // Update request status
    setRequests(requests.map(req =>
      req.id === selectedRequest.id
        ? {
            ...req,
            status: 'Approved',
            assignedVehicle: selectedVehicle.id,
            assignedVehicleModel: selectedVehicle.model,
            assignedDriver: selectedVehicle.driver.name,
            assignedDriverPhone: selectedVehicle.driver.phone
          }
        : req
    ));

    showNotification(
      `✅ ${selectedRequest.id} approved! Vehicle ${selectedVehicle.model} (${selectedVehicle.id}) assigned. Driver ${selectedVehicle.driver.name} has been notified.`
    );

    setSelectedRequest(null);
    setSelectedVehicleId('');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;

    setRequests(requests.map(req =>
      req.id === selectedRequest.id
        ? { ...req, status: 'Rejected', rejectionReason: rejectReason }
        : req
    ));

    showNotification(
      `❌ ${selectedRequest.id} rejected. Requester ${selectedRequest.requestedBy} has been notified.`,
      'error'
    );

    setRejectReason('');
    setShowRejectModal(false);
    setSelectedRequest(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'var(--status-complaint)';
      case 'Medium': return 'var(--status-pending)';
      case 'Low': return 'var(--status-available)';
      default: return 'var(--text-secondary)';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved': return { bg: 'rgba(16,185,129,0.1)', color: 'var(--status-available)' };
      case 'Rejected': return { bg: 'rgba(239,68,68,0.1)', color: 'var(--status-complaint)' };
      case 'Under Review': return { bg: 'rgba(245,158,11,0.1)', color: 'var(--status-pending)' };
      default: return { bg: 'rgba(107,114,128,0.1)', color: 'var(--text-secondary)' };
    }
  };

  const isActionable = selectedRequest && (selectedRequest.status === 'Pending' || selectedRequest.status === 'Under Review');

  return (
    <div className="request-pool-workspace">
      {/* Notification Toast */}
      {notification && (
        <div className={`toast-notification ${notification.type}`}>
          <span>{notification.message}</span>
        </div>
      )}

      <div className="workspace-header">
        <div>
          <h1>Request Management</h1>
          <p>Review trips, allocate resources, and coordinate drivers</p>
        </div>
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="workspace-grid">
        {/* Column 1: Requests List */}
        <div className="requests-list-col">
          <div className="col-header">
            <h3>Incoming Requests</h3>
            <span className="badge">{filteredRequests.length}</span>
          </div>
          <div className="requests-list">
            {filteredRequests.map(req => {
              const statusStyle = getStatusStyle(req.status);
              return (
                <div
                  key={req.id}
                  className={`request-card ${selectedRequest?.id === req.id ? 'selected' : ''} ${req.status === 'Approved' ? 'done' : ''} ${req.status === 'Rejected' ? 'rejected' : ''}`}
                  onClick={() => handleSelectRequest(req)}
                >
                  <div className="rc-header">
                    <span className="rc-id">{req.id}</span>
                    <span className="rc-status-badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                      {req.status}
                    </span>
                  </div>
                  <div className="rc-body">
                    <div className="rc-requester">{req.requestedBy}</div>
                    <div className="rc-row">
                      <MapPin size={14} /> <span>{req.destination}</span>
                    </div>
                    <div className="rc-row">
                      <Calendar size={14} /> <span>{req.date}</span>
                    </div>
                    <div className="rc-row">
                      <Users size={14} /> <span>{req.passengerCount} passengers</span>
                    </div>
                  </div>
                  <div className="rc-footer-bar">
                    <span className="rc-priority" style={{ backgroundColor: `${getPriorityColor(req.priority)}15`, color: getPriorityColor(req.priority) }}>
                      {req.priority}
                    </span>
                    <ChevronRight size={16} className="rc-chevron" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2+3: Details + Actions */}
        {selectedRequest ? (
          <div className="details-and-actions-col">
            <div className="details-panel">
              <div className="col-header">
                <h3>Request Details — {selectedRequest.id}</h3>
                <span className="rc-status-badge" style={{
                  backgroundColor: getStatusStyle(selectedRequest.status).bg,
                  color: getStatusStyle(selectedRequest.status).color
                }}>
                  {selectedRequest.status}
                </span>
              </div>

              <div className="details-body">
                <div className="detail-section">
                  <h4><User size={16} /> Requester Info</h4>
                  <div className="detail-grid">
                    <div className="info-item"><span className="label">Name</span><span className="value">{selectedRequest.requestedBy}</span></div>
                    <div className="info-item"><span className="label">Department</span><span className="value">{selectedRequest.department}</span></div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4><MapPin size={16} /> Trip Details</h4>
                  <div className="detail-grid">
                    <div className="info-item"><span className="label">Purpose</span><span className="value">{selectedRequest.purpose}</span></div>
                    <div className="info-item"><span className="label">Destination</span><span className="value">{selectedRequest.destination}</span></div>
                    <div className="info-item"><span className="label">Departure</span><span className="value">{selectedRequest.date}, {selectedRequest.departureTime}</span></div>
                    <div className="info-item"><span className="label">Return</span><span className="value">{selectedRequest.returnDate}</span></div>
                    <div className="info-item"><span className="label">Duration</span><span className="value">{selectedRequest.tripDuration} day(s)</span></div>
                    <div className="info-item"><span className="label">Distance</span><span className="value">{selectedRequest.estimatedDistance}</span></div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4><Car size={16} /> Vehicle Requirements</h4>
                  <div className="detail-grid">
                    <div className="info-item"><span className="label">Requested Type</span><span className="value">{selectedRequest.requestedVehicleType}</span></div>
                    <div className="info-item"><span className="label">Passengers</span><span className="value">{selectedRequest.passengerCount} / {selectedRequest.requestedCapacity} capacity</span></div>
                    <div className="info-item"><span className="label">Accommodation</span><span className="value">{selectedRequest.accommodationRequired ? 'Required' : 'Not needed'}</span></div>
                  </div>
                </div>

                {/* Show assignment result if already approved */}
                {selectedRequest.status === 'Approved' && (
                  <div className="detail-section approved-summary">
                    <h4><CheckCircle size={16} /> Assignment Summary</h4>
                    <div className="approved-box">
                      <div className="ab-row"><strong>Vehicle:</strong> {selectedRequest.assignedVehicleModel} ({selectedRequest.assignedVehicle})</div>
                      <div className="ab-row"><strong>Driver:</strong> {selectedRequest.assignedDriver}</div>
                      <div className="ab-row"><strong>Driver Phone:</strong> {selectedRequest.assignedDriverPhone}</div>
                      <div className="ab-row notified"><Bell size={14} /> Driver has been notified</div>
                    </div>
                  </div>
                )}

                {/* Show rejection reason if rejected */}
                {selectedRequest.status === 'Rejected' && (
                  <div className="detail-section rejected-summary">
                    <h4><XCircle size={16} /> Rejection Details</h4>
                    <div className="rejected-box">
                      <p>{selectedRequest.rejectionReason}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Panel — only show for actionable requests */}
            {isActionable && (
              <div className="action-panel">
                <div className="col-header">
                  <h3>Take Action</h3>
                </div>

                <div className="action-body">
                  <div className="action-section">
                    <h4>Assign Vehicle & Driver</h4>
                    <p className="action-hint">Each vehicle has a pre-assigned driver. Selecting a vehicle automatically assigns the driver.</p>

                    <div className="vehicle-radio-list">
                      {availableVehicles.map(v => (
                        <label
                          key={v.id}
                          className={`vehicle-option ${selectedVehicleId === v.id ? 'active' : ''}`}
                        >
                          <input
                            type="radio"
                            name="vehicle"
                            value={v.id}
                            checked={selectedVehicleId === v.id}
                            onChange={() => setSelectedVehicleId(v.id)}
                          />
                          <div className="vo-content">
                            <div className="vo-top">
                              <span className="vo-model">{v.model}</span>
                              <span className="vo-plate">{v.id}</span>
                            </div>
                            <div className="vo-details">
                              <span><Car size={13} /> {v.capacity} seats</span>
                              <span className="vo-divider">•</span>
                              <span><User size={13} /> {v.driver.name}</span>
                            </div>
                          </div>
                          <div className={`vo-check ${selectedVehicleId === v.id ? 'checked' : ''}`}>
                            {selectedVehicleId === v.id && <CheckCircle size={18} />}
                          </div>
                        </label>
                      ))}
                    </div>

                    {selectedVehicle && (
                      <div className="driver-preview">
                        <div className="dp-avatar">
                          {selectedVehicle.driver.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div className="dp-info">
                          <span className="dp-name">{selectedVehicle.driver.name}</span>
                          <span className="dp-phone">{selectedVehicle.driver.phone}</span>
                        </div>
                        <div className="dp-notify-tag">
                          <Bell size={14} /> Will be notified
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="action-buttons">
                    <button
                      className="btn btn-reject"
                      onClick={() => setShowRejectModal(true)}
                    >
                      <XCircle size={16} /> Reject
                    </button>
                    <button
                      className="btn btn-approve"
                      disabled={!selectedVehicleId}
                      onClick={handleApprove}
                    >
                      <CheckCircle size={16} /> Approve & Assign
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state-col">
            <div className="empty-state-content">
              <ClipboardList size={48} className="empty-icon" />
              <h3>Select a Request</h3>
              <p>Choose a request from the list to view details and take action.</p>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <XCircle size={20} color="var(--status-complaint)" />
              <h3>Reject Request</h3>
            </div>
            <p className="modal-sub">Provide a reason for rejecting <strong>{selectedRequest?.id}</strong> from <strong>{selectedRequest?.requestedBy}</strong>:</p>
            <textarea
              className="reject-textarea"
              placeholder="e.g., No vehicles available for the requested date, budget constraints, route not approved..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => { setShowRejectModal(false); setRejectReason(''); }}>Cancel</button>
              <button
                className="btn btn-reject"
                onClick={handleReject}
                disabled={!rejectReason.trim()}
              >
                <Send size={14} /> Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestPool;