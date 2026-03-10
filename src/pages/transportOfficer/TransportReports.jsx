import { useState } from 'react';
import ExportButton from '../../components/ExportButton';
import './transportTheme.css';
import './TransportReports.css';

const TransportReports = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const [reportData] = useState({
    overview: {
      totalTrips: 156,
      totalDistance: '2,340 km',
      fuelConsumed: '890 L',
      avgTripTime: '45 min'
    },
    trips: [
      { id: 1, date: '2024-03-15', vehicle: 'HU-001', driver: 'Ahmed Hassan', route: 'Main-Medical', distance: '15 km', duration: '35 min' },
      { id: 2, date: '2024-03-15', vehicle: 'HU-002', driver: 'Fatima Ali', route: 'Engineering-City', distance: '22 km', duration: '50 min' },
      { id: 3, date: '2024-03-14', vehicle: 'HU-003', driver: 'Mohammed Said', route: 'Agriculture-Main', distance: '18 km', duration: '40 min' }
    ],
    drivers: [
      { id: 1, name: 'Ahmed Hassan', trips: 45, distance: '680 km', rating: 4.8, efficiency: '95%' },
      { id: 2, name: 'Fatima Ali', trips: 38, distance: '590 km', rating: 4.6, efficiency: '92%' },
      { id: 3, name: 'Mohammed Said', trips: 42, distance: '625 km', rating: 4.9, efficiency: '96%' }
    ],
    vehicles: [
      { id: 1, plate: 'HU-001', model: 'Toyota Hiace', trips: 52, distance: '780 km', fuel: '295 L', status: 'Active' },
      { id: 2, plate: 'HU-002', model: 'Nissan Urvan', trips: 48, distance: '720 km', fuel: '280 L', status: 'Active' },
      { id: 3, plate: 'HU-003', model: 'Mitsubishi L300', trips: 35, distance: '525 km', fuel: '200 L', status: 'Maintenance' }
    ]
  });

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'trips', label: '🚗 Trip Reports', icon: '🚗' },
    { id: 'drivers', label: '👨‍✈️ Driver Reports', icon: '👨‍✈️' },
    { id: 'vehicles', label: '🚛 Vehicle Reports', icon: '🚛' }
  ];

  return (
    <div className="transport-container">
      <div className="page-header">
        <h1>📈 Reports & Analytics</h1>
        <p>Comprehensive transport performance reports and data visualization</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          <div className="overview-stats">
            <div className="stat-card">
              <div className="stat-icon">🚗</div>
              <div className="stat-content">
                <h3>{reportData.overview.totalTrips}</h3>
                <p>Total Trips</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📏</div>
              <div className="stat-content">
                <h3>{reportData.overview.totalDistance}</h3>
                <p>Total Distance</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⛽</div>
              <div className="stat-content">
                <h3>{reportData.overview.fuelConsumed}</h3>
                <p>Fuel Consumed</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-content">
                <h3>{reportData.overview.avgTripTime}</h3>
                <p>Avg Trip Time</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trip Reports Tab */}
      {activeTab === 'trips' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Trip Reports</h2>
            <ExportButton 
              data={reportData.trips}
              filename="trip_reports"
              reportTitle="Transport Trip Reports"
            />
          </div>
          <div className="table-container">
            <table className="transport-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Route</th>
                  <th>Distance</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {reportData.trips.map(trip => (
                  <tr key={trip.id}>
                    <td>{trip.date}</td>
                    <td>{trip.vehicle}</td>
                    <td>{trip.driver}</td>
                    <td>{trip.route}</td>
                    <td>{trip.distance}</td>
                    <td>{trip.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Driver Reports Tab */}
      {activeTab === 'drivers' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Driver Performance Reports</h2>
            <ExportButton 
              data={reportData.drivers}
              filename="driver_reports"
              reportTitle="Driver Performance Reports"
            />
          </div>
          <div className="table-container">
            <table className="transport-table">
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Total Trips</th>
                  <th>Distance</th>
                  <th>Rating</th>
                  <th>Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {reportData.drivers.map(driver => (
                  <tr key={driver.id}>
                    <td>{driver.name}</td>
                    <td>{driver.trips}</td>
                    <td>{driver.distance}</td>
                    <td>⭐ {driver.rating}</td>
                    <td>{driver.efficiency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vehicle Reports Tab */}
      {activeTab === 'vehicles' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Vehicle Performance Reports</h2>
            <ExportButton 
              data={reportData.vehicles}
              filename="vehicle_reports"
              reportTitle="Vehicle Performance Reports"
            />
          </div>
          <div className="table-container">
            <table className="transport-table">
              <thead>
                <tr>
                  <th>Plate Number</th>
                  <th>Model</th>
                  <th>Total Trips</th>
                  <th>Distance</th>
                  <th>Fuel Used</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.vehicles.map(vehicle => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.plate}</td>
                    <td>{vehicle.model}</td>
                    <td>{vehicle.trips}</td>
                    <td>{vehicle.distance}</td>
                    <td>{vehicle.fuel}</td>
                    <td>
                      <span className={`status-badge ${vehicle.status === 'Active' ? 'status-available' : 'status-maintenance'}`}>
                        {vehicle.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportReports;