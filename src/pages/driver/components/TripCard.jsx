// TripCard.jsx - Display individual trip details 
// src/pages/driver/components/TripCard.jsx
import React, { useState } from 'react';

const TripCard = ({ trip, compact = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(trip?.status || 'scheduled');

  const getStatusColor = (status) => {
    const colors = {
      scheduled: { bg: '#e3f2fd', color: '#1976d2', text: 'Scheduled' },
      'in-progress': { bg: '#e8f5e8', color: '#2e7d32', text: 'In Progress' },
      completed: { bg: '#f3e5f5', color: '#7b1fa2', text: 'Completed' },
      cancelled: { bg: '#ffebee', color: '#c62828', text: 'Cancelled' }
    };
    return colors[status] || colors.scheduled;
  };

  const statusStyle = getStatusColor(status);

  const handleStartTrip = () => {
    setStatus('in-progress');
    // Add actual API call here
  };

  const handleCompleteTrip = () => {
    setStatus('completed');
    // Add actual API call here
  };

  if (compact) {
    return (
      <div className="trip-card compact" style={{ borderLeftColor: statusStyle.color }}>
        <div className="trip-time">{trip?.time || '10:30 AM'}</div>
        <div className="trip-route-compact">
          <span className="pickup">{trip?.pickup || 'Downtown'}</span>
          <span className="arrow">→</span>
          <span className="dropoff">{trip?.dropoff || 'Airport'}</span>
        </div>
        <span className="trip-status" style={{ background: statusStyle.bg, color: statusStyle.color }}>
          {statusStyle.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`trip-card ${expanded ? 'expanded' : ''}`}>
      <div className="trip-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="trip-info">
          <span className="trip-id">Trip #{trip?.id || '1234'}</span>
          <span className="trip-date">{trip?.date || 'Today, 10:30 AM'}</span>
        </div>
        <div className="trip-status-badge" style={{ background: statusStyle.bg, color: statusStyle.color }}>
          {statusStyle.text}
        </div>
      </div>

      <div className="trip-route">
        <div className="route-point pickup">
          <div className="point-dot green"></div>
          <div className="point-details">
            <span className="point-label">PICKUP</span>
            <span className="point-address">{trip?.pickup || '123 Main Street, Downtown'}</span>
          </div>
        </div>
        <div className="route-line"></div>
        <div className="route-point dropoff">
          <div className="point-dot red"></div>
          <div className="point-details">
            <span className="point-label">DROPOFF</span>
            <span className="point-address">{trip?.dropoff || 'International Airport, Terminal 2'}</span>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="trip-details">
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Distance</span>
              <span className="detail-value">{trip?.distance || '12.5'} km</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Duration</span>
              <span className="detail-value">{trip?.duration || '25'} min</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Earnings</span>
              <span className="detail-value">${trip?.earnings || '25.00'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Passenger</span>
              <span className="detail-value">{trip?.passenger || 'John Doe'}</span>
            </div>
          </div>

          <div className="trip-actions">
            {status === 'scheduled' && (
              <button className="btn-primary" onClick={handleStartTrip}>
                <span className="btn-icon">🚀</span>
                Start Trip
              </button>
            )}
            {status === 'in-progress' && (
              <button className="btn-success" onClick={handleCompleteTrip}>
                <span className="btn-icon">✅</span>
                Complete Trip
              </button>
            )}
            <button className="btn-secondary">
              <span className="btn-icon">🗺️</span>
              View Route
            </button>
            <button className="btn-outline">
              <span className="btn-icon">📞</span>
              Contact
            </button>
          </div>

          <div className="trip-map-preview">
            <img 
              src={`https://maps.googleapis.com/maps/api/staticmap?center=${trip?.pickupLat || '40.7128'},${trip?.pickupLng || '-74.0060'}&zoom=13&size=600x200&markers=color:green%7C${trip?.pickupLat || '40.7128'},${trip?.pickupLng || '-74.0060'}&markers=color:red%7C${trip?.dropoffLat || '40.7614'},${trip?.dropoffLng || '-73.9776'}&key=YOUR_API_KEY`}
              alt="Route map"
              className="map-image"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TripCard;