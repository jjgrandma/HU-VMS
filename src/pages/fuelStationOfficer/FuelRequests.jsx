import { useState } from 'react';
import './FuelRequests.css';
import './fuelstation.css';

const FuelRequests = () => {
    const [fuelRequests, setFuelRequests] = useState([
        {
            id: 'REQ-001',
            vehicleId: 'VH-001',
            vehiclePlate: 'AA-001-ET',
            driverName: 'John Smith',
            driverId: 'DRV-001',
            fuelType: 'Diesel',
            requestedAmount: 45.5,
            currentOdometer: 12500,
            requestDate: '2026-03-08T09:30:00',
            status: 'Pending',
            priority: 'Normal',
            purpose: 'Regular Trip',
            destination: 'Harar',
            authorizationCode: 'AUTH-2024-001',
            authorizedBy: 'Transport Office',
            notes: 'Urgent delivery trip'
        },
        {
            id: 'REQ-002',
            vehicleId: 'VH-003',
            vehiclePlate: 'AA-003-ET',
            driverName: 'Sarah Johnson',
            driverId: 'DRV-003',
            fuelType: 'Petrol',
            requestedAmount: 32.0,
            currentOdometer: 8750,
            requestDate: '2026-03-08T10:15:00',
            status: 'Pending',
            priority: 'High',
            purpose: 'Emergency',
            destination: 'Dire Dawa',
            authorizationCode: 'AUTH-2024-002',
            authorizedBy: 'Admin',
            notes: 'Medical emergency transport'
        },
        {
            id: 'REQ-003',
            vehicleId: 'VH-007',
            vehiclePlate: 'AA-007-ET',
            driverName: 'Mike Wilson',
            driverId: 'DRV-007',
            fuelType: 'Diesel',
            requestedAmount: 55.2,
            currentOdometer: 15200,
            requestDate: '2026-03-08T11:00:00',
            status: 'Approved',
            priority: 'Normal',
            purpose: 'Regular Trip',
            destination: 'Addis Ababa',
            authorizationCode: 'AUTH-2024-003',
            authorizedBy: 'Transport Office',
            notes: 'Long distance trip'
        },
        {
            id: 'REQ-004',
            vehicleId: 'VH-012',
            vehiclePlate: 'AA-012-ET',
            driverName: 'Lisa Brown',
            driverId: 'DRV-012',
            fuelType: 'Petrol',
            requestedAmount: 28.8,
            currentOdometer: 6300,
            requestDate: '2026-03-08T08:45:00',
            status: 'Rejected',
            priority: 'Low',
            purpose: 'Maintenance',
            destination: 'Local',
            authorizationCode: null,
            authorizedBy: null,
            notes: 'Vehicle maintenance check',
            rejectionReason: 'No authorization code provided'
        },
        {
            id: 'REQ-005',
            vehicleId: 'VH-015',
            vehiclePlate: 'AA-015-ET',
            driverName: 'David Lee',
            driverId: 'DRV-015',
            fuelType: 'Diesel',
            requestedAmount: 42.3,
            currentOdometer: 11800,
            requestDate: '2026-03-08T12:30:00',
            status: 'Pending',
            priority: 'Normal',
            purpose: 'Regular Trip',
            destination: 'Jijiga',
            authorizationCode: 'AUTH-2024-001',
            authorizedBy: 'Transport Office',
            notes: 'Scheduled delivery'
        }
    ]);

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');
    const [rejectionReason, setRejectionReason] = useState('');
    const [dispensedAmount, setDispensedAmount] = useState('');

    const getStatusBadge = (status) => {
        const statusClass = status.toLowerCase();
        return <span className={`status-badge ${statusClass}`}>{status}</span>;
    };

    const getPriorityBadge = (priority) => {
        const priorityClass = priority.toLowerCase();
        return <span className={`priority-badge ${priorityClass}`}>{priority}</span>;
    };

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setDispensedAmount(request.requestedAmount.toString());
        setShowDetailModal(true);
    };

    const handleApproveRequest = (request) => {
        setSelectedRequest(request);
        setDispensedAmount(request.requestedAmount.toString());
        setShowApproveModal(true);
    };

    const handleRejectRequest = (request) => {
        setSelectedRequest(request);
        setRejectionReason('');
        setShowRejectModal(true);
    };

    const confirmApproval = () => {
        if (!dispensedAmount || parseFloat(dispensedAmount) <= 0) {
            alert('Please enter a valid fuel amount');
            return;
        }

        setFuelRequests(prev => prev.map(req =>
            req.id === selectedRequest.id
                ? { ...req, status: 'Approved', dispensedAmount: parseFloat(dispensedAmount) }
                : req
        ));

        alert(`Fuel request approved!\nRequest ID: ${selectedRequest.id}\nAmount: ${dispensedAmount}L ${selectedRequest.fuelType}`);
        setShowApproveModal(false);
        setShowDetailModal(false);
    };

    const confirmRejection = () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        setFuelRequests(prev => prev.map(req =>
            req.id === selectedRequest.id
                ? { ...req, status: 'Rejected', rejectionReason }
                : req
        ));

        alert(`Fuel request rejected!\nRequest ID: ${selectedRequest.id}\nReason: ${rejectionReason}`);
        setShowRejectModal(false);
        setShowDetailModal(false);
    };

    const filteredRequests = filterStatus === 'All'
        ? fuelRequests
        : fuelRequests.filter(req => req.status === filterStatus);

    const stats = {
        total: fuelRequests.length,
        pending: fuelRequests.filter(r => r.status === 'Pending').length,
        approved: fuelRequests.filter(r => r.status === 'Approved').length,
        rejected: fuelRequests.filter(r => r.status === 'Rejected').length
    };

    return (
        <div className="fuel-requests-page">
            <div className="fuel-page-header">
                <h2>Fuel Requests</h2>
                <p>View and manage incoming fuel requests from drivers</p>
            </div>

            {/* Statistics Cards */}
            <div className="fuel-stats-grid">
                <div className="fuel-stat-card blue">
                    <div className="fuel-stat-icon">📋</div>
                    <div className="fuel-stat-value">{stats.total}</div>
                    <div className="fuel-stat-label">Total Requests</div>
                </div>

                <div className="fuel-stat-card orange">
                    <div className="fuel-stat-icon">⏳</div>
                    <div className="fuel-stat-value">{stats.pending}</div>
                    <div className="fuel-stat-label">Pending Requests</div>
                </div>

                <div className="fuel-stat-card green">
                    <div className="fuel-stat-icon">✓</div>
                    <div className="fuel-stat-value">{stats.approved}</div>
                    <div className="fuel-stat-label">Approved Requests</div>
                </div>

                <div className="fuel-stat-card red">
                    <div className="fuel-stat-icon">✗</div>
                    <div className="fuel-stat-value">{stats.rejected}</div>
                    <div className="fuel-stat-label">Rejected Requests</div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="fuel-filter-section">
                <label className="fuel-filter-label">Filter by Status:</label>
                <div className="fuel-filter-buttons">
                    {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                        <button
                            key={status}
                            className={`fuel-filter-btn ${filterStatus === status ? 'active' : ''}`}
                            onClick={() => setFilterStatus(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Requests Table */}
            <div className="fuel-table-container">
                <div className="fuel-table-header">
                    <h3>Fuel Requests ({filteredRequests.length})</h3>
                </div>

                <div className="fuel-table-wrapper">
                    <table className="fuel-table">
                        <thead>
                            <tr>
                                <th>Request ID</th>
                                <th>Vehicle</th>
                                <th>Driver</th>
                                <th>Fuel Type</th>
                                <th>Amount (L)</th>
                                <th>Priority</th>
                                <th>Request Time</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map((request) => (
                                <tr key={request.id}>
                                    <td className="transaction-id">{request.id}</td>
                                    <td>
                                        <div className="vehicle-info">
                                            <strong>{request.vehicleId}</strong>
                                            <small>{request.vehiclePlate}</small>
                                        </div>
                                    </td>
                                    <td>{request.driverName}</td>
                                    <td>
                                        <span className={`fuel-type-badge ${request.fuelType.toLowerCase()}`}>
                                            {request.fuelType}
                                        </span>
                                    </td>
                                    <td className="liters">{request.requestedAmount}L</td>
                                    <td>{getPriorityBadge(request.priority)}</td>
                                    <td>{new Date(request.requestDate).toLocaleString()}</td>
                                    <td>{getStatusBadge(request.status)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="action-btn view"
                                                onClick={() => handleViewDetails(request)}
                                                title="View Details"
                                            >
                                                👁️
                                            </button>
                                            {request.status === 'Pending' && (
                                                <>
                                                    <button
                                                        className="action-btn approve"
                                                        onClick={() => handleApproveRequest(request)}
                                                        title="Approve"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        className="action-btn reject"
                                                        onClick={() => handleRejectRequest(request)}
                                                        title="Reject"
                                                    >
                                                        ✗
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedRequest && (
                <div className="fuel-modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="fuel-modal large" onClick={(e) => e.stopPropagation()}>
                        <div className="fuel-modal-header">
                            <h3>Fuel Request Details</h3>
                            <button
                                className="fuel-modal-close"
                                onClick={() => setShowDetailModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="fuel-modal-content">
                            <div className="request-detail-grid">
                                <div className="detail-section">
                                    <h4>Request Information</h4>
                                    <div className="detail-item">
                                        <span>Request ID:</span>
                                        <strong>{selectedRequest.id}</strong>
                                    </div>
                                    <div className="detail-item">
                                        <span>Status:</span>
                                        {getStatusBadge(selectedRequest.status)}
                                    </div>
                                    <div className="detail-item">
                                        <span>Priority:</span>
                                        {getPriorityBadge(selectedRequest.priority)}
                                    </div>
                                    <div className="detail-item">
                                        <span>Request Date:</span>
                                        <strong>{new Date(selectedRequest.requestDate).toLocaleString()}</strong>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h4>Vehicle & Driver</h4>
                                    <div className="detail-item">
                                        <span>Vehicle ID:</span>
                                        <strong>{selectedRequest.vehicleId}</strong>
                                    </div>
                                    <div className="detail-item">
                                        <span>Plate Number:</span>
                                        <strong>{selectedRequest.vehiclePlate}</strong>
                                    </div>
                                    <div className="detail-item">
                                        <span>Driver Name:</span>
                                        <strong>{selectedRequest.driverName}</strong>
                                    </div>
                                    <div className="detail-item">
                                        <span>Driver ID:</span>
                                        <strong>{selectedRequest.driverId}</strong>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h4>Fuel Details</h4>
                                    <div className="detail-item">
                                        <span>Fuel Type:</span>
                                        <span className={`fuel-type-badge ${selectedRequest.fuelType.toLowerCase()}`}>
                                            {selectedRequest.fuelType}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span>Requested Amount:</span>
                                        <strong>{selectedRequest.requestedAmount}L</strong>
                                    </div>
                                    <div className="detail-item">
                                        <span>Current Odometer:</span>
                                        <strong>{selectedRequest.currentOdometer} km</strong>
                                    </div>
                                    {selectedRequest.dispensedAmount && (
                                        <div className="detail-item">
                                            <span>Dispensed Amount:</span>
                                            <strong className="success-text">{selectedRequest.dispensedAmount}L</strong>
                                        </div>
                                    )}
                                </div>

                                <div className="detail-section">
                                    <h4>Trip Information</h4>
                                    <div className="detail-item">
                                        <span>Purpose:</span>
                                        <strong>{selectedRequest.purpose}</strong>
                                    </div>
                                    <div className="detail-item">
                                        <span>Destination:</span>
                                        <strong>{selectedRequest.destination}</strong>
                                    </div>
                                </div>

                                <div className="detail-section full-width">
                                    <h4>Authorization</h4>
                                    <div className="detail-item">
                                        <span>Authorization Code:</span>
                                        <strong className="auth-code">{selectedRequest.authorizationCode || 'N/A'}</strong>
                                    </div>
                                    <div className="detail-item">
                                        <span>Authorized By:</span>
                                        <strong>{selectedRequest.authorizedBy || 'N/A'}</strong>
                                    </div>
                                </div>

                                {selectedRequest.notes && (
                                    <div className="detail-section full-width">
                                        <h4>Notes</h4>
                                        <p className="notes-text">{selectedRequest.notes}</p>
                                    </div>
                                )}

                                {selectedRequest.rejectionReason && (
                                    <div className="detail-section full-width rejection-section">
                                        <h4>Rejection Reason</h4>
                                        <p className="rejection-text">{selectedRequest.rejectionReason}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="fuel-modal-actions">
                            {selectedRequest.status === 'Pending' && (
                                <>
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleApproveRequest(selectedRequest);
                                        }}
                                        className="fuel-btn-primary"
                                    >
                                        <span>✓</span> Approve Request
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleRejectRequest(selectedRequest);
                                        }}
                                        className="fuel-btn-danger"
                                    >
                                        <span>✗</span> Reject Request
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="fuel-btn-secondary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approve Modal */}
            {showApproveModal && selectedRequest && (
                <div className="fuel-modal-overlay" onClick={() => setShowApproveModal(false)}>
                    <div className="fuel-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="fuel-modal-header">
                            <h3>Approve Fuel Request</h3>
                            <button
                                className="fuel-modal-close"
                                onClick={() => setShowApproveModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="fuel-modal-content">
                            <div className="approval-info">
                                <p><strong>Request ID:</strong> {selectedRequest.id}</p>
                                <p><strong>Vehicle:</strong> {selectedRequest.vehicleId} ({selectedRequest.vehiclePlate})</p>
                                <p><strong>Driver:</strong> {selectedRequest.driverName}</p>
                                <p><strong>Fuel Type:</strong> {selectedRequest.fuelType}</p>
                                <p><strong>Requested Amount:</strong> {selectedRequest.requestedAmount}L</p>
                            </div>

                            <div className="fuel-form-group">
                                <label className="fuel-form-label">
                                    Fuel Amount to Dispense (L) <span className="required">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={dispensedAmount}
                                    onChange={(e) => setDispensedAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    step="0.1"
                                    min="0"
                                    className="fuel-form-input"
                                />
                                <p className="fuel-help-text">
                                    You can adjust the amount if needed
                                </p>
                            </div>
                        </div>

                        <div className="fuel-modal-actions">
                            <button
                                onClick={confirmApproval}
                                className="fuel-btn-primary"
                            >
                                <span>✓</span> Confirm Approval
                            </button>
                            <button
                                onClick={() => setShowApproveModal(false)}
                                className="fuel-btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedRequest && (
                <div className="fuel-modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="fuel-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="fuel-modal-header danger">
                            <h3>Reject Fuel Request</h3>
                            <button
                                className="fuel-modal-close"
                                onClick={() => setShowRejectModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="fuel-modal-content">
                            <div className="rejection-info">
                                <p><strong>Request ID:</strong> {selectedRequest.id}</p>
                                <p><strong>Vehicle:</strong> {selectedRequest.vehicleId}</p>
                                <p><strong>Driver:</strong> {selectedRequest.driverName}</p>
                            </div>

                            <div className="fuel-form-group">
                                <label className="fuel-form-label">
                                    Rejection Reason <span className="required">*</span>
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Please provide a reason for rejection..."
                                    rows="4"
                                    className="fuel-form-textarea"
                                />
                            </div>
                        </div>

                        <div className="fuel-modal-actions">
                            <button
                                onClick={confirmRejection}
                                className="fuel-btn-danger"
                            >
                                <span>✗</span> Confirm Rejection
                            </button>
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="fuel-btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FuelRequests;
