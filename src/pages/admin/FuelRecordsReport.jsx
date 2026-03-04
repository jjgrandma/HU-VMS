import { useState } from 'react';
import ExportButton from '../../components/ExportButton';
import './fuelRecordsReport.css';

const FuelRecordsReport = () => {
  const [fuelRecords] = useState([
    { id: 1, plateNumber: 'ABC-1234', model: 'Toyota Hiace', date: '2024-03-15', fuelType: 'Diesel', quantity: '45 L', cost: '₱3,150', odometer: '45,230 km', driver: 'John Doe' },
    { id: 2, plateNumber: 'XYZ-5678', model: 'Nissan Urvan', date: '2024-03-14', fuelType: 'Diesel', quantity: '50 L', cost: '₱3,500', odometer: '38,450 km', driver: 'Jane Smith' },
    { id: 3, plateNumber: 'DEF-9012', model: 'Mitsubishi L300', date: '2024-03-13', fuelType: 'Diesel', quantity: '40 L', cost: '₱2,800', odometer: '52,100 km', driver: 'Mike Johnson' },
    { id: 4, plateNumber: 'GHI-3456', model: 'Isuzu Elf', date: '2024-03-12', fuelType: 'Diesel', quantity: '55 L', cost: '₱3,850', odometer: '61,200 km', driver: 'Sarah Williams' },
    { id: 5, plateNumber: 'JKL-7890', model: 'Toyota Coaster', date: '2024-03-11', fuelType: 'Diesel', quantity: '60 L', cost: '₱4,200', odometer: '48,900 km', driver: 'David Brown' },
    { id: 6, plateNumber: 'MNO-2345', model: 'Hyundai County', date: '2024-03-10', fuelType: 'Diesel', quantity: '52 L', cost: '₱3,640', odometer: '35,670 km', driver: 'Emily Davis' },
    { id: 7, plateNumber: 'PQR-6789', model: 'Ford Transit', date: '2024-03-09', fuelType: 'Diesel', quantity: '42 L', cost: '₱2,940', odometer: '44,320 km', driver: 'Robert Wilson' },
    { id: 8, plateNumber: 'STU-0123', model: 'Mercedes Sprinter', date: '2024-03-08', fuelType: 'Diesel', quantity: '48 L', cost: '₱3,360', odometer: '29,850 km', driver: 'Lisa Anderson' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterFuelType, setFilterFuelType] = useState('All');

  const filteredRecords = fuelRecords.filter(record => {
    const matchesSearch = record.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.driver.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterFuelType === 'All' || record.fuelType === filterFuelType;
    return matchesSearch && matchesFilter;
  });

  const totalFuelCost = fuelRecords.reduce((sum, record) => {
    const cost = parseFloat(record.cost.replace('₱', '').replace(',', ''));
    return sum + cost;
  }, 0);

  const totalQuantity = fuelRecords.reduce((sum, record) => {
    const quantity = parseFloat(record.quantity.replace(' L', ''));
    return sum + quantity;
  }, 0);

  return (
    <div className="fuel-records-container">
      <div className="report-header">
        <h1>Fuel Records Report</h1>
        <ExportButton 
          data={filteredRecords}
          filename="fuel_records_report"
          reportTitle="Fuel Records Report"
        />
      </div>

      <div className="fuel-summary">
        <div className="summary-card">
          <div className="summary-icon">⛽</div>
          <div className="summary-content">
            <h3>{totalQuantity} L</h3>
            <p>Total Fuel</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <h3>₱{totalFuelCost.toLocaleString()}</h3>
            <p>Total Cost</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">📊</div>
          <div className="summary-content">
            <h3>{fuelRecords.length}</h3>
            <p>Total Records</p>
          </div>
        </div>
      </div>

      <div className="controls-bar">
        <input
          type="text"
          placeholder="Search by plate, model, or driver..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={filterFuelType}
          onChange={(e) => setFilterFuelType(e.target.value)}
          className="filter-select"
        >
          <option value="All">All Fuel Types</option>
          <option value="Diesel">Diesel</option>
          <option value="Gasoline">Gasoline</option>
        </select>
      </div>

      <div className="table-container">
        <table className="fuel-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Plate Number</th>
              <th>Model</th>
              <th>Date</th>
              <th>Fuel Type</th>
              <th>Quantity</th>
              <th>Cost</th>
              <th>Odometer</th>
              <th>Driver</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map(record => (
              <tr key={record.id}>
                <td>{record.id}</td>
                <td>{record.plateNumber}</td>
                <td>{record.model}</td>
                <td>{record.date}</td>
                <td>
                  <span className="fuel-type-badge">{record.fuelType}</span>
                </td>
                <td>{record.quantity}</td>
                <td>{record.cost}</td>
                <td>{record.odometer}</td>
                <td>{record.driver}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRecords.length === 0 && (
        <div className="no-results">No fuel records found</div>
      )}
    </div>
  );
};

export default FuelRecordsReport;
