// src/pages/driver/components/VehicleStatusCard.jsx
import React, { useState } from 'react';

const VehicleStatusCard = ({ vehicle, onStatusChange }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [reportingIssue, setReportingIssue] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');

  // Mock vehicle data (replace with actual props)
  const vehicleData = vehicle || {
    id: 'VH-1234',
    model: 'Tesla Model 3',
    licensePlate: 'ABC-1234',
    batteryLevel: 85,
    rangeKm: 320,
    tirePressure: 'OK',
    nextMaintenance: '2026-03-15',
    oilLevel: 'Good',
    engineTemp: 92,
    fuelLevel: 65,
    mileage: 15234,
    lastService: '2026-01-20',
    issues: []
  };

  const getBatteryColor = (level) => {
    if (level > 70) return '#4caf50';
    if (level > 30) return '#ff9800';
    return '#f44336';
  };

  const handleReportIssue = (e) => {
    e.preventDefault();
    if (issueDescription.trim()) {
      console.log('Reporting issue:', issueDescription);
      // Add actual API call here
      setReportingIssue(false);
      setIssueDescription('');
      alert('Issue reported successfully');
    }
  };

  return (
    <div className="vehicle-status-card">
      <div className="vehicle-header">
        <h3>Vehicle Status</h3>
        <span className="vehicle-id">{vehicleData.licensePlate}</span>
      </div>

      <div className="vehicle-info">
        <p className="vehicle-model">{vehicleData.model}</p>
      </div>

      {/* Battery Progress Bar */}
      <div className="battery-section">
        <div className="battery-label">
          <span>Battery</span>
          <span style={{ color: getBatteryColor(vehicleData.batteryLevel) }}>
            {vehicleData.batteryLevel}%
          </span>
        </div>
        <div className="battery-progress">
          <div 
            className="battery-fill"
            style={{ 
              width: `${vehicleData.batteryLevel}%`,
              backgroundColor: getBatteryColor(vehicleData.batteryLevel)
            }}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="vehicle-stats">
        <div className="stat">
          <span className="stat-icon">🔋</span>
          <span className="stat-value">{vehicleData.rangeKm} km</span>
          <span className="stat-label">Range</span>
        </div>
        <div className="stat">
          <span className="stat-icon">🛞</span>
          <span className="stat-value">{vehicleData.tirePressure}</span>
          <span className="stat-label">Tires</span>
        </div>
        <div className="stat">
          <span className="stat-icon">⏱️</span>
          <span className="stat-value">{vehicleData.mileage}</span>
          <span className="stat-label">Mileage</span>
        </div>
      </div>

      {/* Toggle Details Button */}
      <button 
        className="toggle-details"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? '▼ Hide Details' : '▶ Show Details'}
      </button>

      {/* Detailed Information */}
      {showDetails && (
        <div className="vehicle-details">
          <div className="details-row">
            <span>Oil Level:</span>
            <span className={vehicleData.oilLevel === 'Good' ? 'status-good' : 'status-warning'}>
              {vehicleData.oilLevel}
            </span>
          </div>
          <div className="details-row">
            <span>Engine Temp:</span>
            <span>{vehicleData.engineTemp}°C</span>
          </div>
          <div className="details-row">
            <span>Fuel Level:</span>
            <span>{vehicleData.fuelLevel}%</span>
          </div>
          <div className="details-row">
            <span>Last Service:</span>
            <span>{vehicleData.lastService}</span>
          </div>
          <div className="details-row">
            <span>Next Maintenance:</span>
            <span className="maintenance-date">{vehicleData.nextMaintenance}</span>
          </div>
        </div>
      )}

      {/* Report Issue Section */}
      {!reportingIssue ? (
        <button 
          className="report-issue-btn"
          onClick={() => setReportingIssue(true)}
        >
          ⚠️ Report an Issue
        </button>
      ) : (
        <form onSubmit={handleReportIssue} className="issue-form">
          <textarea
            placeholder="Describe the issue..."
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            rows="3"
            required
          />
          <div className="form-actions">
            <button type="submit" className="btn-submit">Submit</button>
            <button 
              type="button" 
              className="btn-cancel"
              onClick={() => setReportingIssue(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default VehicleStatusCard;