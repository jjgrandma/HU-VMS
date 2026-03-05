// src/pages/driver/components/VehicleStatusCard.jsx
import React, { useState } from 'react';
import './VehicleStatusCard.css';

const VehicleStatusCard = ({ vehicle, onStatusChange }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [reportingIssue, setReportingIssue] = useState(false);
  const [issueType, setIssueType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');

  // Mock vehicle data (replace with actual props)
  const vehicleData = vehicle || {
    id: 'VH-1234',
    model: 'Tesla Model 3',
    licensePlate: 'ABC-1234',
    batteryLevel: 85,
    rangeKm: 320,
    tirePressure: '32 PSI',
    nextMaintenance: '2026-03-15',
    oilLevel: '98%',
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
    if (issueType && issueDescription) {
      console.log('Reporting issue:', { type: issueType, description: issueDescription });
      setReportingIssue(false);
      setIssueType('');
      setIssueDescription('');
      alert('Issue reported successfully');
    }
  };

  return (
    <div className="vehicle-status-card glass-effect">
      <div className="vehicle-card-header">
        <h3 className="vehicle-card-title">
          <span className="vehicle-header-icon">🚗</span>
          Vehicle Status
        </h3>
        <span className="vehicle-id-badge">{vehicleData.licensePlate}</span>
      </div>

      <div className="vehicle-model-badge">
        {vehicleData.model} • {vehicleData.mileage.toLocaleString()} km
      </div>

      {/* Battery Gauge */}
      <div className="vehicle-battery-gauge">
        <div className="vehicle-gauge-header">
          <span className="vehicle-gauge-label">Battery</span>
          <span 
            className="vehicle-gauge-value"
            style={{ color: getBatteryColor(vehicleData.batteryLevel) }}
          >
            {vehicleData.batteryLevel}%
          </span>
        </div>
        <div className="vehicle-gauge-progress">
          <div 
            className="vehicle-gauge-fill"
            style={{ 
              width: `${vehicleData.batteryLevel}%`,
              background: `linear-gradient(90deg, ${getBatteryColor(vehicleData.batteryLevel)} 0%, ${getBatteryColor(vehicleData.batteryLevel - 20)} 100%)`
            }}
          >
            <div className="vehicle-gauge-glow"></div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="vehicle-stats-grid">
        <div className="vehicle-stat-item">
          <span className="vehicle-stat-icon">🔋</span>
          <span className="vehicle-stat-value">{vehicleData.rangeKm} km</span>
          <span className="vehicle-stat-label">Range</span>
        </div>
        <div className="vehicle-stat-item">
          <span className="vehicle-stat-icon">🛞</span>
          <span className="vehicle-stat-value">{vehicleData.tirePressure}</span>
          <span className="vehicle-stat-label">Tires</span>
        </div>
        <div className="vehicle-stat-item">
          <span className="vehicle-stat-icon">⚙️</span>
          <span className="vehicle-stat-value">{vehicleData.oilLevel}</span>
          <span className="vehicle-stat-label">Oil</span>
        </div>
        <div className="vehicle-stat-item">
          <span className="vehicle-stat-icon">🌡️</span>
          <span className="vehicle-stat-value">{vehicleData.engineTemp}°C</span>
          <span className="vehicle-stat-label">Engine</span>
        </div>
      </div>

      {/* Maintenance Alert */}
      <div className="vehicle-maintenance-alert">
        <div className="vehicle-alert-icon">🔧</div>
        <div className="vehicle-alert-content">
          <span className="vehicle-alert-title">Next Maintenance</span>
          <span className="vehicle-alert-date">{vehicleData.nextMaintenance}</span>
        </div>
        <button className="vehicle-alert-btn">Schedule</button>
      </div>

      {/* Toggle Details Button */}
      <button 
        className="vehicle-toggle-details"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? '▼ Hide Details' : '▶ Show Details'}
      </button>

      {/* Detailed Information */}
      {showDetails && (
        <div className="vehicle-details-grid">
          <div className="vehicle-detail-row">
            <span>Last Service</span>
            <span>{vehicleData.lastService}</span>
          </div>
          <div className="vehicle-detail-row">
            <span>Fuel Level</span>
            <span>{vehicleData.fuelLevel}%</span>
          </div>
          <div className="vehicle-detail-row">
            <span>VIN</span>
            <span>{vehicleData.vin || '1HGCM82633A123456'}</span>
          </div>
          <div className="vehicle-detail-row">
            <span>Insurance</span>
            <span className="vehicle-status-badge vehicle-status-valid">Valid</span>
          </div>
        </div>
      )}

      {/* Report Issue Section */}
      {!reportingIssue ? (
        <button 
          className="vehicle-report-btn"
          onClick={() => setReportingIssue(true)}
        >
          <span className="vehicle-report-icon">⚠️</span>
          Report an Issue
        </button>
      ) : (
        <form className="vehicle-issue-form" onSubmit={handleReportIssue}>
          <select 
            className="vehicle-issue-select"
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            required
          >
            <option value="">Select issue type</option>
            <option value="mechanical">Mechanical</option>
            <option value="electrical">Electrical</option>
            <option value="tire">Tire</option>
            <option value="other">Other</option>
          </select>
          <textarea
            className="vehicle-issue-textarea"
            placeholder="Describe the issue in detail..."
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            rows="3"
            required
          />
          <div className="vehicle-form-actions">
            <button type="submit" className="vehicle-btn-submit">Submit Report</button>
            <button 
              type="button" 
              className="vehicle-btn-cancel"
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