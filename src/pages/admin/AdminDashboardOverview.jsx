import { useState, useEffect } from 'react';
import './adminDashboardOverview.css';

const AdminDashboardOverview = () => {
  const [hoveredMonth, setHoveredMonth] = useState(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 });
  const [stats] = useState({
    totalVehicles: 45,
    availableVehicles: 18,
    assignedVehicles: 20,
    maintenanceVehicles: 7,
    totalUsers: 156,
    totalDrivers: 32,
    activeDrivers: 28,
    totalTrips: 342,
    completedTrips: 298,
    pendingRequests: 12,
    approvedRequests: 245,
    rejectedRequests: 18
  });

  const [vehicleData, setVehicleData] = useState([
    { month: 'Jan', trips: 45, distance: '1,250 km', fuel: '320 L' },
    { month: 'Feb', trips: 52, distance: '1,420 km', fuel: '365 L' },
    { month: 'Mar', trips: 48, distance: '1,310 km', fuel: '340 L' },
    { month: 'Apr', trips: 61, distance: '1,680 km', fuel: '425 L' },
    { month: 'May', trips: 55, distance: '1,520 km', fuel: '390 L' },
    { month: 'Jun', trips: 67, distance: '1,850 km', fuel: '470 L' }
  ]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicleData(prev => prev.map((data, index) => {
        if (index === prev.length - 1) {
          const randomChange = Math.floor(Math.random() * 5) - 2;
          return {
            ...data,
            trips: Math.max(50, data.trips + randomChange)
          };
        }
        return data;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const [driverPerformance] = useState([
    { name: 'John Doe', trips: 45, rating: 4.8 },
    { name: 'Jane Smith', trips: 38, rating: 4.6 },
    { name: 'Mike Johnson', trips: 42, rating: 4.9 },
    { name: 'Sarah Williams', trips: 35, rating: 4.5 },
    { name: 'David Brown', trips: 40, rating: 4.7 }
  ]);

  return (
    <div className="admin-overview-container">
      <h1 className="overview-title">Dashboard Overview</h1>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <h3>{stats.totalVehicles}</h3>
            <p>Total Vehicles</p>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <h3>{stats.availableVehicles}</h3>
            <p>Available</p>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">📍</div>
          <div className="stat-content">
            <h3>{stats.assignedVehicles}</h3>
            <p>Assigned</p>
          </div>
        </div>

        <div className="stat-card stat-danger">
          <div className="stat-icon">🔧</div>
          <div className="stat-content">
            <h3>{stats.maintenanceVehicles}</h3>
            <p>Maintenance</p>
          </div>
        </div>

        <div className="stat-card stat-primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">🚙</div>
          <div className="stat-content">
            <h3>{stats.totalDrivers}</h3>
            <p>Total Drivers</p>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingRequests}</h3>
            <p>Pending Requests</p>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.totalTrips}</h3>
            <p>Total Trips</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2>Vehicle Trip History <span className="live-indicator">● LIVE</span></h2>
          <div className="bar-chart">
            {vehicleData.map((data, index) => (
              <div 
                key={index} 
                className="bar-item"
                onMouseEnter={(e) => {
                  setHoveredMonth(index);
                  setTooltip({
                    show: true,
                    content: `${data.month}: ${data.trips} trips, ${data.distance}, ${data.fuel}`,
                    x: e.clientX,
                    y: e.clientY
                  });
                }}
                onMouseLeave={() => {
                  setHoveredMonth(null);
                  setTooltip({ show: false, content: '', x: 0, y: 0 });
                }}
              >
                <div className="bar-column">
                  <div 
                    className={`bar-fill ${hoveredMonth === index ? 'hovered' : ''}`}
                    style={{ height: `${(data.trips / 70) * 100}%` }}
                  >
                    <span className="bar-value">{data.trips}</span>
                  </div>
                </div>
                <span className="bar-label">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h2>Vehicle Status Distribution</h2>
          <div className="pie-chart-container">
            <svg viewBox="0 0 200 200" className="pie-chart">
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#4CAF50"
                strokeWidth="40"
                strokeDasharray={`${(stats.availableVehicles / stats.totalVehicles) * 502.4} 502.4`}
                transform="rotate(-90 100 100)"
                className={`pie-segment ${hoveredSegment === 'available' ? 'hovered' : ''}`}
                onMouseEnter={(e) => {
                  setHoveredSegment('available');
                  setTooltip({
                    show: true,
                    content: `Available: ${stats.availableVehicles} vehicles (${Math.round((stats.availableVehicles / stats.totalVehicles) * 100)}%)`,
                    x: e.clientX,
                    y: e.clientY
                  });
                }}
                onMouseLeave={() => {
                  setHoveredSegment(null);
                  setTooltip({ show: false, content: '', x: 0, y: 0 });
                }}
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#2196F3"
                strokeWidth="40"
                strokeDasharray={`${(stats.assignedVehicles / stats.totalVehicles) * 502.4} 502.4`}
                strokeDashoffset={`-${(stats.availableVehicles / stats.totalVehicles) * 502.4}`}
                transform="rotate(-90 100 100)"
                className={`pie-segment ${hoveredSegment === 'assigned' ? 'hovered' : ''}`}
                onMouseEnter={(e) => {
                  setHoveredSegment('assigned');
                  setTooltip({
                    show: true,
                    content: `Assigned: ${stats.assignedVehicles} vehicles (${Math.round((stats.assignedVehicles / stats.totalVehicles) * 100)}%)`,
                    x: e.clientX,
                    y: e.clientY
                  });
                }}
                onMouseLeave={() => {
                  setHoveredSegment(null);
                  setTooltip({ show: false, content: '', x: 0, y: 0 });
                }}
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#f44336"
                strokeWidth="40"
                strokeDasharray={`${(stats.maintenanceVehicles / stats.totalVehicles) * 502.4} 502.4`}
                strokeDashoffset={`-${((stats.availableVehicles + stats.assignedVehicles) / stats.totalVehicles) * 502.4}`}
                transform="rotate(-90 100 100)"
                className={`pie-segment ${hoveredSegment === 'maintenance' ? 'hovered' : ''}`}
                onMouseEnter={(e) => {
                  setHoveredSegment('maintenance');
                  setTooltip({
                    show: true,
                    content: `Maintenance: ${stats.maintenanceVehicles} vehicles (${Math.round((stats.maintenanceVehicles / stats.totalVehicles) * 100)}%)`,
                    x: e.clientX,
                    y: e.clientY
                  });
                }}
                onMouseLeave={() => {
                  setHoveredSegment(null);
                  setTooltip({ show: false, content: '', x: 0, y: 0 });
                }}
              />
            </svg>
            <div className="pie-legend">
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#4CAF50' }}></span>
                <span>Available ({stats.availableVehicles})</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#2196F3' }}></span>
                <span>Assigned ({stats.assignedVehicles})</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#f44336' }}></span>
                <span>Maintenance ({stats.maintenanceVehicles})</span>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h2>Request Status Overview</h2>
          <div className="histogram">
            <div className="histogram-bar">
              <div className="histogram-fill histogram-pending" style={{ width: `${(stats.pendingRequests / stats.approvedRequests) * 100}%` }}>
                <span>{stats.pendingRequests}</span>
              </div>
              <span className="histogram-label">Pending</span>
            </div>
            <div className="histogram-bar">
              <div className="histogram-fill histogram-approved" style={{ width: '100%' }}>
                <span>{stats.approvedRequests}</span>
              </div>
              <span className="histogram-label">Approved</span>
            </div>
            <div className="histogram-bar">
              <div className="histogram-fill histogram-rejected" style={{ width: `${(stats.rejectedRequests / stats.approvedRequests) * 100}%` }}>
                <span>{stats.rejectedRequests}</span>
              </div>
              <span className="histogram-label">Rejected</span>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h2>Top Driver Performance</h2>
          <div className="driver-performance">
            {driverPerformance.map((driver, index) => (
              <div key={index} className="driver-item">
                <div className="driver-info">
                  <span className="driver-rank">#{index + 1}</span>
                  <span className="driver-name">{driver.name}</span>
                </div>
                <div className="driver-stats">
                  <span className="driver-trips">{driver.trips} trips</span>
                  <span className="driver-rating">⭐ {driver.rating}</span>
                </div>
                <div className="driver-progress">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${(driver.trips / 50) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h2>Trip Completion Rate</h2>
          <div className="completion-chart">
            <div className="completion-circle">
              <svg viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#1a1a2e"
                  strokeWidth="20"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="20"
                  strokeDasharray={`${(stats.completedTrips / stats.totalTrips) * 502.4} 502.4`}
                  transform="rotate(-90 100 100)"
                  strokeLinecap="round"
                />
                <text x="100" y="100" textAnchor="middle" dy="0.3em" className="completion-text">
                  {Math.round((stats.completedTrips / stats.totalTrips) * 100)}%
                </text>
              </svg>
            </div>
            <div className="completion-info">
              <p>{stats.completedTrips} of {stats.totalTrips} trips completed</p>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h2>Monthly Activity Summary</h2>
          <div className="activity-summary">
            <div className="activity-item">
              <div className="activity-icon">📝</div>
              <div className="activity-details">
                <h4>New Requests</h4>
                <p className="activity-count">28</p>
                <span className="activity-trend trend-up">↑ 12%</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">🚗</div>
              <div className="activity-details">
                <h4>Trips Completed</h4>
                <p className="activity-count">67</p>
                <span className="activity-trend trend-up">↑ 8%</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">⚠️</div>
              <div className="activity-details">
                <h4>Maintenance</h4>
                <p className="activity-count">7</p>
                <span className="activity-trend trend-down">↓ 3%</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">👤</div>
              <div className="activity-details">
                <h4>New Users</h4>
                <p className="activity-count">15</p>
                <span className="activity-trend trend-up">↑ 25%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {tooltip.show && (
        <div 
          className="chart-tooltip"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y + 10}px`
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardOverview;
