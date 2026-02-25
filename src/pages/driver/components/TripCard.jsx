// src/pages/driver/components/TripCard.jsx
import React, { useState } from 'react';

const TripCard = ({ trip }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch(status) {
      case 'scheduled': return '#ff9800';
      case 'in-progress': return '#4caf50';
      case 'completed': return '#2196f3';
      case 'cancelled': return '#f44336';
      default: return '#999';
    }
  };

  const handleStartTrip = () => {
    console.log('Starting trip:', trip.id);
    // Add actual start trip logic here
  };

  const handleCompleteTrip = () => {
    console.log('Completing trip:', trip.id);
    // Add actual complete trip logic here
  };

  return (
    <div className="trip-card" style={{ borderLeft: `4px solid ${getStatusColor(trip.status)}` }}>
      <div className="trip-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="trip-route">
          <span className="pickup">{trip.pickup}</span>
          <span className="arrow">→</span>
          <span className="dropoff">{trip.dropoff}</span>
        </div>
        <div className="trip-status">
          <span className={`status-badge ${trip.status}`}>
            {trip.status}
          </span>
          <button className="expand-btn">
            {expanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="trip-card-details">
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Distance:</span>
              <span className="detail-value">{trip.distance || '12.5'} km</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Duration:</span>
              <span className="detail-value">{trip.duration || '25 min'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Earnings:</span>
              <span className="detail-value">${trip.earnings || '25.00'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Date:</span>
              <span className="detail-value">{trip.date}</span>
            </div>
          </div>

          <div className="trip-actions">
            {trip.status === 'scheduled' && (
              <button className="btn-primary" onClick={handleStartTrip}>
                Start Trip
              </button>
            )}
            {trip.status === 'in-progress' && (
              <button className="btn-success" onClick={handleCompleteTrip}>
                Complete Trip
              </button>
            )}
            <button className="btn-secondary">View Details</button>
          </div>

          <div className="trip-map-preview">
            {/* Map preview would go here */}
            <div className="map-placeholder">
              <span>🗺️ Route Map</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripCard;