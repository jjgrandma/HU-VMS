import { useState } from 'react';
import './vehicleTripHistory.css';

const VehicleTripHistory = () => {
  console.log('VehicleTripHistory component is rendering!');
  
  const [trips] = useState([
    { 
      id: 'TRP-001', 
      plateNumber: 'ABC-1234', 
      vehicleType: 'Van',
      driver: 'John Doe', 
      requestedBy: 'Dr. Ahmed Ali',
      startLocation: 'Main Campus',
      destination: 'Engineering Building', 
      departureTime: '2024-03-15 08:00',
      returnTime: '2024-03-15 10:30',
      distance: 15,
      fuelUsed: '5.2L',
      purpose: 'Faculty Transport',
      status: 'Completed' 
    },
    { 
      id: 'TRP-002', 
      plateNumber: 'XYZ-5678', 
      vehicleType: 'Bus',
      driver: 'Jane Smith', 
      requestedBy: 'Prof. Sara Mohammed',
      startLocation: 'Main Campus',
      destination: 'Medical Campus', 
      departureTime: '2024-03-15 09:00',
      returnTime: '2024-03-15 11:45',
      distance: 22,
      fuelUsed: '8.5L',
      purpose: 'Student Field Trip',
      status: 'Completed' 
    },
    { 
      id: 'TRP-003', 
      plateNumber: 'DEF-9012', 
      vehicleType: 'Van',
      driver: 'Mike Johnson', 
      requestedBy: 'Dean Office',
      startLocation: 'Main Campus',
      destination: 'Law School', 
      departureTime: '2024-03-14 07:30',
      returnTime: '2024-03-14 09:00',
      distance: 10,
      fuelUsed: '3.8L',
      purpose: 'Administrative Meeting',
      status: 'Completed' 
    },
    { 
      id: 'TRP-004', 
      plateNumber: 'GHI-3456', 
      vehicleType: 'Truck',
      driver: 'Sarah Williams', 
      requestedBy: 'Logistics Dept',
      startLocation: 'Warehouse',
      destination: 'Business School', 
      departureTime: '2024-03-14 13:00',
      returnTime: null,
      distance: 18,
      fuelUsed: '6.2L',
      purpose: 'Equipment Delivery',
      status: 'Delayed' 
    },
    { 
      id: 'TRP-005', 
      plateNumber: 'JKL-7890', 
      vehicleType: 'Bus',
      driver: 'David Brown', 
      requestedBy: 'Sports Director',
      startLocation: 'Main Campus',
      destination: 'Sports Complex', 
      departureTime: '2024-03-13 10:00',
      returnTime: '2024-03-13 12:00',
      distance: 12,
      fuelUsed: '4.5L',
      purpose: 'Sports Event',
      status: 'Completed' 
    },
    { 
      id: 'TRP-006', 
      plateNumber: 'MNO-2345', 
      vehicleType: 'Van',
      driver: 'Emily Davis', 
      requestedBy: 'Library Staff',
      startLocation: 'Main Campus',
      destination: 'Central Library', 
      departureTime: '2024-03-13 14:00',
      returnTime: null,
      distance: 8,
      fuelUsed: '2.8L',
      purpose: 'Book Transport',
      status: 'Cancelled' 
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredTrips = trips.filter(trip => 
    trip.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusClass = (status) => {
    switch(status) {
      case 'Completed': return 'status-completed';
      case 'Delayed': return 'status-delayed';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  return (
    <div className="trip-history-container" style={{ background: 'white', minHeight: '100vh', padding: '30px' }}>
      <h1 style={{ color: '#32CD32', fontSize: '32px', marginBottom: '30px' }}>🚗 Vehicle Trip History</h1>

      <div className="controls-bar">
        <input
          type="text"
          placeholder="🔍 Search by Trip ID, Plate Number, or Driver..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-container">
        <table className="trip-table">
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Plate Number</th>
              <th>Vehicle Type</th>
              <th>Driver</th>
              <th>Requested By</th>
              <th>Start Location</th>
              <th>Destination</th>
              <th>Departure Time</th>
              <th>Return Time</th>
              <th>Distance (km)</th>
              <th>Fuel Used</th>
              <th>Purpose</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.map(trip => (
              <tr key={trip.id}>
                <td><strong>{trip.id}</strong></td>
                <td>{trip.plateNumber}</td>
                <td>{trip.vehicleType}</td>
                <td>{trip.driver}</td>
                <td>{trip.requestedBy}</td>
                <td>{trip.startLocation}</td>
                <td>{trip.destination}</td>
                <td>{trip.departureTime}</td>
                <td>{trip.returnTime || 'In Progress'}</td>
                <td>{trip.distance} km</td>
                <td>{trip.fuelUsed}</td>
                <td>{trip.purpose}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(trip.status)}`}>
                    {trip.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTrips.length === 0 && (
        <div className="no-results">
          <p>📭 No trip records found</p>
        </div>
      )}
    </div>
  );
};

export default VehicleTripHistory;
