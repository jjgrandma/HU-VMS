import { useState } from 'react';
import './GateDashboard.css';

const GateDashboard = () => {
  const [dashboardData] = useState({
    vehiclesDetectedToday: 45,
    universityVehicles: 38,
    externalVehicles: 7,
    pendingApprovals: 3
  });

  const [liveActivity] = useState([
    {
      id: 1,
      plateNumber: 'HU-2045',
      vehicle: 'Toyota Hilux',
      driver: 'John Smith',
      direction: 'Entry',
      detectionTime: '2026-03-08 09:15:23',
      status: 'Approved'
    },
    {
      id: 2,
      plateNumber: 'AA-1234-ET',
      vehicle: 'Honda Civic',
      driver: 'Unknown',
      direction: 'Entry',
      detectionTime: '2026-03-08 09:12:45',
      status: 'Pending'
    },
    {
      id: 3,
      plateNumber: 'HU-3021',
      vehicle: 'Isuzu D-Max',
      driver: 'Sarah Johnson',
      direction: 'Exit',
      detectionTime: '2026-03-08 09:08:12',
      status: 'Approved'
    },
    {
      id: 4,
      plateNumber: 'HU-1567',
      vehicle: 'Toyota Land Cruiser',
      driver: 'Mike Wilson',
      direction: 'Entry',
      detectionTime: '2026-03-08 09:05:34',
      status: 'Approved'
    },
    {
      id: 5,
      plateNumber: 'AA-5678-ET',
      vehicle: 'Nissan Patrol',
      driver: 'Unknown',
      direction: 'Entry',
      detectionTime: '2026-03-08 09:02:18',
      status: 'Rejected'
    }
  ]);

  const getStatusBadge = (status) => {
    const statusClass = status.toLowerCase();
    return <span className={`gate-status-badge ${statusClass}`}>{status}</span>;
  };

  const getDirectionBadge = (direction) => {
    const directionClass = direction.toLowerCase();
    return <span className={`gate-direction-badge ${directionClass}`}>{direction}</span>;
  };

  return (
    <div className="gate-dashboard-content">
      <div className="gate-dashboard-header">
        <h2>Gate Security Dashboard</h2>
        <p>Real-time monitoring of vehicle entry and exit</p>
      </div>

      {/* Summary Cards */}
      <div className="gate-stats-grid">
        <div className="gate-stat-card blue">
          <div className="gate-stat-icon">🚗</div>
          <div className="gate-stat-value">{dashboardData.vehiclesDetectedToday}</div>
          <div className="gate-stat-label">Vehicles Detected Today</div>
        </div>

        <div className="gate-stat-card green">
          <div className="gate-stat-icon">✅</div>
          <div className="gate-stat-value">{dashboardData.universityVehicles}</div>
          <div className="gate-stat-label">University Vehicles</div>
        </div>

        <div className="gate-stat-card orange">
          <div className="gate-stat-icon">⚠️</div>
          <div className="gate-stat-value">{dashboardData.externalVehicles}</div>
          <div className="gate-stat-label">External Vehicles</div>
        </div>

        <div className="gate-stat-card red">
          <div className="gate-stat-icon">⏳</div>
          <div className="gate-stat-value">{dashboardData.pendingApprovals}</div>
          <div className="gate-stat-label">Pending Gate Approvals</div>
        </div>
      </div>

      {/* Live Gate Activity Table */}
      <div className="gate-table-container">
        <div className="gate-table-header">
          <h3>Live Gate Activity</h3>
          <span className="gate-live-indicator">
            <span className="gate-pulse"></span>
            Live
          </span>
        </div>
        
        <div className="gate-table-wrapper">
          <table className="gate-table">
            <thead>
              <tr>
                <th>Plate Number</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Direction</th>
                <th>Detection Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {liveActivity.map((activity) => (
                <tr key={activity.id}>
                  <td className="plate-number">{activity.plateNumber}</td>
                  <td>{activity.vehicle}</td>
                  <td>{activity.driver}</td>
                  <td>{getDirectionBadge(activity.direction)}</td>
                  <td className="detection-time">{activity.detectionTime}</td>
                  <td>{getStatusBadge(activity.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GateDashboard;
