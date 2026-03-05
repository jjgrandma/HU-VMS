import { useState } from 'react';
import './vehicleTripHistory.css';

const VehicleTripHistory = () => {
  const [trips] = useState([
    { id: 1, plateNumber: 'ABC-1234', driver: 'John Doe', destination: 'Engineering Building', date: '2024-03-15', startTime: '08:00', endTime: '10:30', distance: '15 km', status: 'Completed' },
    { id: 2, plateNumber: 'XYZ-5678', driver: 'Jane Smith', destination: 'Medical Campus', date: '2024-03-15', startTime: '09:00', endTime: '11:45', distance: '22 km', status: 'Completed' },
    { id: 3, plateNumber: 'DEF-9012', driver: 'Mike Johnson', destination: 'Law School', date: '2024-03-14', startTime: '07:30', endTime: '09:00', distance: '10 km', status: 'Completed' },
    { id: 4, plateNumber: 'GHI-3456', driver: 'Sarah Williams', destination: 'Business School', date: '2024-03-14', startTime: '13:00', endTime: '15:30', distance: '18 km', status: 'Completed' },
    { id: 5, plateNumber: 'JKL-7890', driver: 'David Brown', destination: 'Sports Complex', date: '2024-03-13', startTime: '10:00', endTime: '12:00', distance: '12 km', status: 'Completed' },
    { id: 6, plateNumber: 'MNO-2345', driver: 'Emily Davis', destination: 'Library', date: '2024-03-13', startTime: '14:00', endTime: '16:30', distance: '8 km', status: 'Completed' },
    { id: 7, plateNumber: 'PQR-6789', driver: 'John Doe', destination: 'Admin Building', date: '2024-03-12', startTime: '08:30', endTime: '10:00', distance: '5 km', status: 'Completed' },
    { id: 8, plateNumber: 'STU-0123', driver: 'Jane Smith', destination: 'Research Center', date: '2024-03-12', startTime: '11:00', endTime: '13:45', distance: '20 km', status: 'Completed' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredTrips = trips.filter(trip => 
    trip.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="trip-history-container">
      <h1>Vehicle Trip History</h1>

      <div className="controls-bar">
        <input
          type="text"
          placeholder="Search by plate number, driver, or destination..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-container">
        <table className="trip-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Plate Number</th>
              <th>Driver</th>
              <th>Destination</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Distance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.map(trip => (
              <tr key={trip.id}>
                <td>{trip.id}</td>
                <td>{trip.plateNumber}</td>
                <td>{trip.driver}</td>
                <td>{trip.destination}</td>
                <td>{trip.date}</td>
                <td>{trip.startTime}</td>
                <td>{trip.endTime}</td>
                <td>{trip.distance}</td>
                <td>
                  <span className="status-badge status-completed">
                    {trip.status}
                  </span>
                </td>
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

export default VehicleTripHistory;
