import { useState } from 'react';
import ExportButton from '../../components/ExportButton';
import './vehicleTripReport.css';

const VehicleTripReport = () => {
  const [trips] = useState([
    { id: 1, plateNumber: 'ABC-1234', model: 'Toyota Hiace', driver: 'John Doe', route: 'Main Campus - Engineering', distance: '15 km', fuelUsed: '3.5 L', date: '2024-03-15', duration: '2h 30m' },
    { id: 2, plateNumber: 'XYZ-5678', model: 'Nissan Urvan', driver: 'Jane Smith', route: 'Medical Campus - Law School', distance: '22 km', fuelUsed: '5.2 L', date: '2024-03-15', duration: '2h 45m' },
    { id: 3, plateNumber: 'DEF-9012', model: 'Mitsubishi L300', driver: 'Mike Johnson', route: 'Business School - Library', distance: '10 km', fuelUsed: '2.8 L', date: '2024-03-14', duration: '1h 30m' },
    { id: 4, plateNumber: 'GHI-3456', model: 'Isuzu Elf', driver: 'Sarah Williams', route: 'Sports Complex - Admin', distance: '18 km', fuelUsed: '4.1 L', date: '2024-03-14', duration: '2h 30m' },
    { id: 5, plateNumber: 'JKL-7890', model: 'Toyota Coaster', driver: 'David Brown', route: 'Research Center - Main Campus', distance: '12 km', fuelUsed: '3.2 L', date: '2024-03-13', duration: '2h 00m' },
    { id: 6, plateNumber: 'MNO-2345', model: 'Hyundai County', driver: 'Emily Davis', route: 'Library - Engineering', distance: '8 km', fuelUsed: '2.1 L', date: '2024-03-13', duration: '2h 30m' },
    { id: 7, plateNumber: 'PQR-6789', model: 'Ford Transit', driver: 'Robert Wilson', route: 'Admin - Medical Campus', distance: '5 km', fuelUsed: '1.5 L', date: '2024-03-12', duration: '1h 30m' },
    { id: 8, plateNumber: 'STU-0123', model: 'Mercedes Sprinter', driver: 'Lisa Anderson', route: 'Law School - Business School', distance: '20 km', fuelUsed: '4.8 L', date: '2024-03-12', duration: '2h 45m' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredTrips = trips.filter(trip =>
    trip.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.route.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="vehicle-trip-report-container">
      <div className="report-header">
        <h1>Vehicle Trip Report</h1>
        <ExportButton 
          data={filteredTrips}
          filename="vehicle_trip_report"
          reportTitle="Vehicle Trip Report"
        />
      </div>

      <div className="controls-bar">
        <input
          type="text"
          placeholder="Search by plate, model, driver, or route..."
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
              <th>Plate Number</th>
              <th>Model</th>
              <th>Driver</th>
              <th>Route</th>
              <th>Distance</th>
              <th>Fuel Used</th>
              <th>Date</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.map(trip => (
              <tr key={trip.id}>
                <td>{trip.id}</td>
                <td>{trip.plateNumber}</td>
                <td>{trip.model}</td>
                <td>{trip.driver}</td>
                <td>{trip.route}</td>
                <td>{trip.distance}</td>
                <td>{trip.fuelUsed}</td>
                <td>{trip.date}</td>
                <td>{trip.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTrips.length === 0 && (
        <div className="no-results">No trips found</div>
      )}
    </div>
  );
};

export default VehicleTripReport;
