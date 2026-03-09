import { useState } from 'react';
import ExportButton from '../../components/ExportButton';
import './adminTheme.css';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filteredDrivers = driverTrips.filter(driver =>
    driver.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.vehicle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDrivers = filteredDrivers.slice(startIndex, endIndex);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

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
          onChange={handleSearchChange}
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
            {currentDrivers.map(driver => (
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

      {/* Compact Pagination */}
      {filteredDrivers.length > 0 && (
        <div className="pagination-compact">
          <div className="pagination-info-compact">
            <span>
              {startIndex + 1}-{Math.min(endIndex, filteredDrivers.length)} of {filteredDrivers.length}
            </span>
            <select 
              value={itemsPerPage} 
              onChange={handleItemsPerPageChange}
              className="items-per-page-compact"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>

          <div className="pagination-controls-compact">
            <button
              className="pagination-btn-compact"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              title="First Page"
            >
              ⟪
            </button>
            <button
              className="pagination-btn-compact"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous Page"
            >
              ‹
            </button>

            <span className="page-indicator-compact">
              {currentPage} / {totalPages}
            </span>

            <button
              className="pagination-btn-compact"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Next Page"
            >
              ›
            </button>
            <button
              className="pagination-btn-compact"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              title="Last Page"
            >
              ⟫
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverTripReport;
