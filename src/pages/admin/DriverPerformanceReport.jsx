import { useState } from 'react';
import ExportButton from '../../components/ExportButton';
import './driverPerformanceReport.css';

const DriverPerformanceReport = () => {
  const [performance] = useState([
    { id: 1, driverName: 'John Doe', totalTrips: 45, completedOnTime: 42, lateTrips: 3, rating: 4.8, complaints: 2, commendations: 8, efficiency: '93%' },
    { id: 2, driverName: 'Jane Smith', totalTrips: 38, completedOnTime: 35, lateTrips: 3, rating: 4.6, complaints: 3, commendations: 6, efficiency: '92%' },
    { id: 3, driverName: 'Mike Johnson', totalTrips: 42, completedOnTime: 40, lateTrips: 2, rating: 4.9, complaints: 1, commendations: 10, efficiency: '95%' },
    { id: 4, driverName: 'Sarah Williams', totalTrips: 35, completedOnTime: 31, lateTrips: 4, rating: 4.5, complaints: 4, commendations: 5, efficiency: '89%' },
    { id: 5, driverName: 'David Brown', totalTrips: 40, completedOnTime: 38, lateTrips: 2, rating: 4.7, complaints: 2, commendations: 7, efficiency: '95%' },
    { id: 6, driverName: 'Emily Davis', totalTrips: 33, completedOnTime: 29, lateTrips: 4, rating: 4.4, complaints: 5, commendations: 4, efficiency: '88%' },
    { id: 7, driverName: 'Robert Wilson', totalTrips: 37, completedOnTime: 34, lateTrips: 3, rating: 4.6, complaints: 3, commendations: 6, efficiency: '92%' },
    { id: 8, driverName: 'Lisa Anderson', totalTrips: 41, completedOnTime: 39, lateTrips: 2, rating: 4.8, complaints: 1, commendations: 9, efficiency: '95%' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredPerformance = performance.filter(driver =>
    driver.driverName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRatingClass = (rating) => {
    if (rating >= 4.7) return 'rating-excellent';
    if (rating >= 4.5) return 'rating-good';
    return 'rating-average';
  };

  return (
    <div className="driver-performance-container">
      <div className="report-header">
        <h1>Driver Performance Report</h1>
        <ExportButton 
          data={filteredPerformance}
          filename="driver_performance_report"
          reportTitle="Driver Performance Report"
        />
      </div>

      <div className="controls-bar">
        <input
          type="text"
          placeholder="Search by driver name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-container">
        <table className="performance-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Driver Name</th>
              <th>Total Trips</th>
              <th>On Time</th>
              <th>Late</th>
              <th>Rating</th>
              <th>Complaints</th>
              <th>Commendations</th>
              <th>Efficiency</th>
            </tr>
          </thead>
          <tbody>
            {filteredPerformance.map(driver => (
              <tr key={driver.id}>
                <td>{driver.id}</td>
                <td>{driver.driverName}</td>
                <td>{driver.totalTrips}</td>
                <td><span className="badge-success">{driver.completedOnTime}</span></td>
                <td><span className="badge-warning">{driver.lateTrips}</span></td>
                <td>
                  <span className={`rating-badge ${getRatingClass(driver.rating)}`}>
                    ⭐ {driver.rating}
                  </span>
                </td>
                <td><span className="badge-danger">{driver.complaints}</span></td>
                <td><span className="badge-info">{driver.commendations}</span></td>
                <td><span className="efficiency-badge">{driver.efficiency}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPerformance.length === 0 && (
        <div className="no-results">No performance data found</div>
      )}
    </div>
  );
};

export default DriverPerformanceReport;
