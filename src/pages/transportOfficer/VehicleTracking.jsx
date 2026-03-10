import { useState } from 'react';
import './transportTheme.css';
import './VehicleTracking.css';

const VehicleTracking = () => {
  const [viewMode, setViewMode] = useState('fleet'); // 'fleet' or 'map'
  
  const [vehicles] = useState([
    { id: 1, plateNumber: 'HU-001', model: 'Toyota Hiace', driver: 'Ahmed Hassan', status: 'Available', location: 'Main Campus', fuel: '85%' },
    { id: 2, plateNumber: 'HU-002', model: 'Nissan Urvan', driver: 'Fatima Ali', status: 'In Transit', location: 'Engineering Campus', fuel: '62%' },
    { id: 3, plateNumber: 'HU-003', model: 'Mitsubishi L300', driver: 'Mohammed Said', status: 'Available', location: 'Medical Campus', fuel: '78%' },
    { id: 4, plateNumber: 'HU-004', model: 'Isuzu Elf', driver: 'Aisha Omar', status: 'Maintenance', location: 'Workshop', fuel: '45%' },
    { id: 5, plateNumber: 'HU-005', model: 'Toyota Coaster', driver: 'Ibrahim Yusuf', status: 'In Transit', location: 'City Center', fuel: '91%' },
    { id: 6, plateNumber: 'HU-006', model: 'Ford Transit', driver: 'Maryam Ahmed', status: 'Available', location: 'Agriculture Campus', fuel: '67%' }
  ]);

  const getStatusClass = (status) => {
    const classes = {
      'Available': 'status-available',
      'In Transit': 'status-in-transit',
      'Maintenance': 'status-maintenance',
      'Out of Service': 'status-out-of-service'
    };
    return classes[status] || 'status-available';
  };

  const getFuelClass = (fuel) => {
    const percentage = parseInt(fuel);
    if (percentage >= 70) return 'fuel-high';
    if (percentage >= 40) return 'fuel-medium';
    return 'fuel-low';
  };

  return (
    <div className="transport-container">
      <div className="page-header">
        <h1>🗺️ Vehicle Tracking System</h1>
        <p>Monitor vehicle locations and status in real-time</p>
      </div>

      {/* Toggle Interface */}
      <div className="view-toggle">
        <button 
          className={`toggle-btn ${viewMode === 'fleet' ? 'active' : ''}`}
          onClick={() => setViewMode('fleet')}
        >
          🚗 Vehicle Fleet
        </button>
        <button 
          className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
          onClick={() => setViewMode('map')}
        >
          🗺️ Live GPS Tracking Map
        </button>
      </div>

      {/* Fleet View */}
      {viewMode === 'fleet' && (
        <div className="fleet-view">
          <div className="fleet-stats">
            <div className="stat-card available">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>{vehicles.filter(v => v.status === 'Available').length}</h3>
                <p>Available</p>
              </div>
            </div>
            <div className="stat-card in-transit">
              <div className="stat-icon">🚗</div>
              <div className="stat-content">
                <h3>{vehicles.filter(v => v.status === 'In Transit').length}</h3>
                <p>In Transit</p>
              </div>
            </div>
            <div className="stat-card maintenance">
              <div className="stat-icon">🔧</div>
              <div className="stat-content">
                <h3>{vehicles.filter(v => v.status === 'Maintenance').length}</h3>
                <p>Maintenance</p>
              </div>
            </div>
            <div className="stat-card total">
              <div className="stat-icon">🚛</div>
              <div className="stat-content">
                <h3>{vehicles.length}</h3>
                <p>Total Fleet</p>
              </div>
            </div>
          </div>

          <div className="vehicles-grid">
            {vehicles.map(vehicle => (
              <div key={vehicle.id} className={`vehicle-card ${getStatusClass(vehicle.status)}`}>
                <div className="vehicle-header">
                  <h3>{vehicle.plateNumber}</h3>
                  <span className={`status-badge ${getStatusClass(vehicle.status)}`}>
                    {vehicle.status}
                  </span>
                </div>
                
                <div className="vehicle-details">
                  <div className="detail-row">
                    <span className="label">Model:</span>
                    <span className="value">{vehicle.model}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Driver:</span>
                    <span className="value">{vehicle.driver}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Location:</span>
                    <span className="value">{vehicle.location}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Fuel Level:</span>
                    <span className={`fuel-level ${getFuelClass(vehicle.fuel)}`}>
                      {vehicle.fuel}
                    </span>
                  </div>
                </div>

                <div className="vehicle-actions">
                  <button className="btn-secondary btn-small">
                    📍 Track Location
                  </button>
                  <button className="btn-secondary btn-small">
                    📞 Contact Driver
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="map-view">
          <div className="map-controls">
            <button className="btn-primary">
              🎯 Center on University
            </button>
            <div className="map-legend">
              <div className="legend-item">
                <span className="legend-dot available"></span>
                <span>Available</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot in-transit"></span>
                <span>In Transit</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot maintenance"></span>
                <span>Maintenance</span>
              </div>
            </div>
          </div>

          <div className="map-container">
            <div className="map-placeholder">
              <div className="map-placeholder-content">
                <div className="map-icon">🗺️</div>
                <h3>GPS Tracking Map</h3>
                <p>Real-time vehicle tracking around Haramaya University</p>
                <p className="coordinates">📍 9.414° N, 42.036° E</p>
                <div className="map-features">
                  <div className="feature">✅ Real-time GPS updates every 3 seconds</div>
                  <div className="feature">🎯 Interactive markers with vehicle info</div>
                  <div className="feature">🗺️ OpenStreetMap integration</div>
                  <div className="feature">📱 Mobile-friendly interface</div>
                </div>
                <button className="btn-primary btn-large">
                  🚀 Initialize Live Map
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleTracking;