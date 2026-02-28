import React from 'react';
import './RequestStatus.css';

const RequestStatus = ({ requests = [] }) => {
  const getStatusIcon = (status) => {
    switch(status) {
      case 'Approved': return '✅';
      case 'Pending': return '⏰';
      case 'In Progress': return '⏳';
      case 'Rejected': return '❌';
      case 'Completed': return '✅';
      default: return '⏰';
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Approved': return 'status-approved';
      case 'Pending': return 'status-pending';
      case 'In Progress': return 'status-progress';
      case 'Rejected': return 'status-rejected';
      case 'Completed': return 'status-completed';
      default: return '';
    }
  };

  const getProgressSteps = (status) => {
    const steps = [
      { name: 'Submitted', completed: true },
      { name: 'Under Review', completed: ['Approved', 'In Progress', 'Completed'].includes(status) },
      { name: 'Approved', completed: ['Approved', 'In Progress', 'Completed'].includes(status) },
      { name: 'In Progress', completed: ['In Progress', 'Completed'].includes(status) },
      { name: 'Completed', completed: status === 'Completed' }
    ];
    return steps;
  };

  return (
    <div className="request-status-page">
      <h1 className="page-title">Request Status</h1>

      {requests.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🚗</span>
          <h3>No Requests Found</h3>
          <p>You haven't submitted any vehicle requests yet.</p>
          <button className="btn-primary">Submit Your First Request</button>
        </div>
      ) : (
        <div className="requests-container">
          {requests.map((request) => (
            <div key={request.id} className="request-status-card">
              {/* Header */}
              <div className={`request-header ${getStatusClass(request.status)}`}>
                <div className="request-header-left">
                  <span className="status-icon">{getStatusIcon(request.status)}</span>
                  <div>
                    <h2 className="request-id">{request.id}</h2>
                    <p className="request-purpose">{request.purpose}</p>
                  </div>
                </div>
                <span className={`status-badge ${getStatusClass(request.status)}`}>
                  {request.status}
                </span>
              </div>

              {/* Details */}
              <div className="request-details-section">
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-icon">🚗</span>
                    <span className="detail-text">{request.vehicleType}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <span className="detail-text">{new Date(request.date).toLocaleDateString()} at {request.time}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">📍</span>
                    <span className="detail-text">{request.destination}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">👥</span>
                    <span className="detail-text">{request.passengers} Passenger(s)</span>
                  </div>
                </div>

                {/* Progress Tracker */}
                <div className="progress-section">
                  <h3>Request Progress</h3>
                  <div className="progress-tracker">
                    {getProgressSteps(request.status).map((step, index) => (
                      <div key={index} className="progress-step-wrapper">
                        <div className={`progress-step ${step.completed ? 'completed' : ''}`}>
                          {step.completed ? '✓' : index + 1}
                        </div>
                        <span className="step-name">{step.name}</span>
                      </div>
                    ))}
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${(getProgressSteps(request.status).filter(s => s.completed).length - 1) * 25}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                {request.additionalNotes && (
                  <div className="notes-section">
                    <h4>Additional Notes:</h4>
                    <p>{request.additionalNotes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestStatus;