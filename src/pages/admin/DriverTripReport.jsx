import { useState } from 'react';
import ExportButton from '../../components/ExportButton';
import './driverTripReport.css';

const DriverTripReport = () => {
  const [driverTrips] = useState([
    { id: 1, driverName: 'John Doe', licenseNumber: 'DL-123456', vehicle: 'ABC-1234', totalTrips: 45, totalDistance: '680 km', totalHours: '112h', avgRating: 4.8 },
    { id: 2, driverName: 'Jane Smith', licenseNumber: 'DL-234567', vehicle: 'XYZ-5678', totalTrips: 38, totalDistance: '590 km', totalHours: '95h', avgRating: 4.6 },
    { id: 3, driverName: 'Mike Johnson', licenseNumber: 'DL-345678', vehicle: 'DEF-9012', totalTrips: 42, totalDistance: '625 km', totalHours: '105h', avgRating: 4.9 },
    { id: 4, driverName: 'Sarah Williams', licenseNumber: 'DL-456789', vehicle: 'GHI-3456', totalTrips: 35, totalDistance: '520 km', totalHours: '88h', avgRating: 4.5 },
    { id: 5, driverName: 'David Brown', licenseNumber: 'DL-567890', vehicle: 'JKL-7890', totalTrips: 40, totalDistance: '610 km', totalHours: '100h', avgRating: 4.7 },
    { id: 6, driverName: 'Emily Davis', licenseNumber: 'DL-678901', vehicle: 'MNO-2345', totalTrips: 33, totalDistance: '485 km', totalHours: '82h', avgRating: 4.4 },
    { id: 7, driverName: 'Robert Wilson', licenseNumber: 'DL-789012', vehicle: 'PQR-6789', totalTrips: 37, totalDistance: '555 km', totalHours: '92h', avgRating: 4.6 },
    { id: 8, driverName: 'Lisa Anderson', licenseNumber: 'DL-890123', vehicle: 'STU-0123', totalTrips: 41, totalDistance: '640 km', totalHours: '108h', avgRating: 4.8 }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredDrivers = driverTrips.filter(driver =>
    driver.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.vehicle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="driver-trip-report-container">
      <div className="report-header">
        <h1>Driver Trip Report</h1>
        <ExportButton 
          data={filteredDrivers}
          filename="driver_trip_report"
          reportTitle="Driver Trip Report"
        />
      </div>

      <div className="controls-bar">
        <input
          type="text"
          placeholder="Search by driver name, license, or vehicle..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Driver Name</th>
              <th>License Number</th>
              <th>Vehicle</th>
              <th>Total Trips</th>
              <th>Total Distance</th>
              <th>Total Hours</th>
              <th>Avg Rating</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.map(driver => (
              <tr key={driver.id}>
                <td>{driver.id}</td>
                <td>{driver.driverName}</td>
                <td>{driver.licenseNumber}</td>
                <td>{driver.vehicle}</td>
                <td>{driver.totalTrips}</td>
                <td>{driver.totalDistance}</td>
                <td>{driver.totalHours}</td>
                <td>
                  <span className="rating-badge">⭐ {driver.avgRating}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredDrivers.length === 0 && (
        <div className="no-results">No driver trips found</div>
      )}
    </div>
  );
};

export default DriverTripReport;
