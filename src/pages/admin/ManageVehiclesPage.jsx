import { useState } from 'react';
import './manageVehiclesPage.css';

const ManageVehiclesPage = () => {
  const [vehicles, setVehicles] = useState([
    { 
      id: 'VH-001', 
      plateNumber: 'ABC-1234', 
      model: 'Toyota Hiace', 
      type: 'Van', 
      capacity: 15, 
      status: 'Available', 
      driver: 'Unassigned',
      fuelType: 'Diesel',
      lastMaintenance: '2024-02-15',
      department: 'Transport',
      mileage: '45,000 km',
      year: 2022
    },
    { 
      id: 'VH-002', 
      plateNumber: 'XYZ-5678', 
      model: 'Nissan Urvan', 
      type: 'Van', 
      capacity: 18, 
      status: 'Assigned', 
      driver: 'John Doe',
      fuelType: 'Diesel',
      lastMaintenance: '2024-01-20',
      department: 'Administration',
      mileage: '62,000 km',
      year: 2021
    },
    { 
      id: 'VH-003', 
      plateNumber: 'DEF-9012', 
      model: 'Mitsubishi L300', 
      type: 'Van', 
      capacity: 12, 
      status: 'Maintenance', 
      driver: 'Unassigned',
      fuelType: 'Gasoline',
      lastMaintenance: '2024-03-01',
      department: 'Transport',
      mileage: '78,000 km',
      year: 2020
    },
    { 
      id: 'VH-004', 
      plateNumber: 'GHI-3456', 
      model: 'Isuzu Elf', 
      type: 'Truck', 
      capacity: 20, 
      status: 'Available', 
      driver: 'Unassigned',
      fuelType: 'Diesel',
      lastMaintenance: '2024-02-28',
      department: 'Logistics',
      mileage: '35,000 km',
      year: 2023
    },
    { 
      id: 'VH-005', 
      plateNumber: 'JKL-7890', 
      model: 'Toyota Coaster', 
      type: 'Bus', 
      capacity: 30, 
      status: 'Assigned', 
      driver: 'Jane Smith',
      fuelType: 'Diesel',
      lastMaintenance: '2024-01-15',
      department: 'Transport',
      mileage: '92,000 km',
      year: 2019
    },
    { 
      id: 'VH-006', 
      plateNumber: 'MNO-2345', 
      model: 'Hyundai County', 
      type: 'Bus', 
      capacity: 25, 
      status: 'Available', 
      driver: 'Unassigned',
      fuelType: 'Diesel',
      lastMaintenance: '2024-02-10',
      department: 'Administration',
      mileage: '55,000 km',
      year: 2022
    },
    { 
      id: 'VH-007', 
      plateNumber: 'PQR-6789', 
      model: 'Ford Transit', 
      type: 'Van', 
      capacity: 14, 
      status: 'Maintenance', 
      driver: 'Unassigned',
      fuelType: 'Gasoline',
      lastMaintenance: '2024-03-05',
      department: 'Logistics',
      mileage: '48,000 km',
      year: 2021
    },
    { 
      id: 'VH-008', 
      plateNumber: 'STU-0123', 
      model: 'Mercedes Sprinter', 
      type: 'Van', 
      capacity: 16, 
      status: 'Assigned', 
      driver: 'Mike Johnson',
      fuelType: 'Diesel',
      lastMaintenance: '2024-01-25',
      department: 'Transport',
      mileage: '71,000 km',
      year: 2020
    },
    { 
      id: 'VH-009', 
      plateNumber: 'VWX-4567', 
      model: 'Toyota Commuter', 
      type: 'Van', 
      capacity: 14, 
      status: 'Available', 
      driver: 'Unassigned',
      fuelType: 'Diesel',
      lastMaintenance: '2024-02-20',
      department: 'Transport',
      mileage: '38,000 km',
      year: 2023
    },
    { 
      id: 'VH-010', 
      plateNumber: 'YZA-8901', 
      model: 'Nissan Civilian', 
      type: 'Bus', 
      capacity: 28, 
      status: 'Assigned', 
      driver: 'Sarah Williams',
      fuelType: 'Diesel',
      lastMaintenance: '2024-01-10',
      department: 'Administration',
      mileage: '85,000 km',
      year: 2019
    },
    { 
      id: 'VH-011', 
      plateNumber: 'BCD-2345', 
      model: 'Isuzu NQR', 
      type: 'Truck', 
      capacity: 25, 
      status: 'Available', 
      driver: 'Unassigned',
      fuelType: 'Diesel',
      lastMaintenance: '2024-02-25',
      department: 'Logistics',
      mileage: '42,000 km',
      year: 2022
    },
    { 
      id: 'VH-012', 
      plateNumber: 'EFG-6789', 
      model: 'Toyota Hiace Super GL', 
      type: 'Van', 
      capacity: 15, 
      status: 'Maintenance', 
      driver: 'Unassigned',
      fuelType: 'Diesel',
      lastMaintenance: '2024-03-02',
      department: 'Transport',
      mileage: '67,000 km',
      year: 2020
    },
    { 
      id: 'VH-013', 
      plateNumber: 'HIJ-0123', 
      model: 'Mitsubishi Fuso', 
      type: 'Truck', 
      capacity: 30, 
      status: 'Assigned', 
      driver: 'David Brown',
      fuelType: 'Diesel',
      lastMaintenance: '2024-01-18',
      department: 'Logistics',
      mileage: '95,000 km',
      year: 2018
    },
    { 
      id: 'VH-014', 
      plateNumber: 'KLM-4567', 
      model: 'Hyundai H350', 
      type: 'Van', 
      capacity: 17, 
      status: 'Available', 
      driver: 'Unassigned',
      fuelType: 'Diesel',
      lastMaintenance: '2024-02-12',
      department: 'Administration',
      mileage: '51,000 km',
      year: 2021
    },
    { 
      id: 'VH-015', 
      plateNumber: 'NOP-8901', 
      model: 'Toyota Coaster Deluxe', 
      type: 'Bus', 
      capacity: 32, 
      status: 'Assigned', 
      driver: 'Emily Davis',
      fuelType: 'Diesel',
      lastMaintenance: '2024-01-22',
      department: 'Transport',
      mileage: '88,000 km',
      year: 2019
    },
    { 
      id: 'VH-016', 
      plateNumber: 'QRS-2345', 
      model: 'Nissan Caravan', 
      type: 'Van', 
      capacity: 13, 
      status: 'Available', 
      driver: 'Unassigned',
      fuelType: 'Gasoline',
      lastMaintenance: '2024-02-18',
      department: 'Transport',
      mileage: '44,000 km',
      year: 2022
    },
    { 
      id: 'VH-017', 
      plateNumber: 'TUV-6789', 
      model: 'Isuzu Giga', 
      type: 'Truck', 
      capacity: 35, 
      status: 'Maintenance', 
      driver: 'Unassigned',
      fuelType: 'Diesel',
      lastMaintenance: '2024-03-04',
      department: 'Logistics',
      mileage: '102,000 km',
      year: 2017
    },
    { 
      id: 'VH-018', 
      plateNumber: 'WXY-0123', 
      model: 'Mercedes Vito', 
      type: 'Van', 
      capacity: 12, 
      status: 'Assigned', 
      driver: 'Robert Wilson',
      fuelType: 'Diesel',
      lastMaintenance: '2024-01-28',
      department: 'Administration',
      mileage: '59,000 km',
      year: 2021
    },
    { 
      id: 'VH-019', 
      plateNumber: 'ZAB-4567', 
      model: 'Toyota Granvia', 
      type: 'Van', 
      capacity: 10, 
      status: 'Available', 
      driver: 'Unassigned',
      fuelType: 'Hybrid',
      lastMaintenance: '2024-02-22',
      department: 'Administration',
      mileage: '28,000 km',
      year: 2023
    },
    { 
      id: 'VH-020', 
      plateNumber: 'CDE-8901', 
      model: 'Hino Dutro', 
      type: 'Truck', 
      capacity: 22, 
      status: 'Assigned', 
      driver: 'Lisa Anderson',
      fuelType: 'Diesel',
      lastMaintenance: '2024-01-30',
      department: 'Logistics',
      mileage: '73,000 km',
      year: 2020
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [showOtherType, setShowOtherType] = useState(false);
  const [showOtherFuel, setShowOtherFuel] = useState(false);
  const [showOtherDept, setShowOtherDept] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // View Details
  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailsModal(true);
  };

  // Edit Vehicle
  const handleEditClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setEditFormData(vehicle);
    setShowEditModal(true);
    setShowOtherType(false);
    setShowOtherFuel(false);
    setShowOtherDept(false);
  };

  const handleEditSave = () => {
    setVehicles(vehicles.map(v => 
      v.id === selectedVehicle.id ? editFormData : v
    ));
    setShowEditModal(false);
    alert('✅ Vehicle updated successfully!');
  };

  const handleTypeChange = (value) => {
    if (value === 'Other') {
      setShowOtherType(true);
      setEditFormData({...editFormData, type: ''});
    } else {
      setShowOtherType(false);
      setEditFormData({...editFormData, type: value});
    }
  };

  const handleFuelChange = (value) => {
    if (value === 'Other') {
      setShowOtherFuel(true);
      setEditFormData({...editFormData, fuelType: ''});
    } else {
      setShowOtherFuel(false);
      setEditFormData({...editFormData, fuelType: value});
    }
  };

  const handleDeptChange = (value) => {
    if (value === 'Other') {
      setShowOtherDept(true);
      setEditFormData({...editFormData, department: ''});
    } else {
      setShowOtherDept(false);
      setEditFormData({...editFormData, department: value});
    }
  };

  // Delete Vehicle
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
      alert('✅ Vehicle deleted successfully!');
    }
  };

  // Filter and Sort
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || vehicle.status === filterStatus;
    const matchesDepartment = filterDepartment === 'All' || vehicle.department === filterDepartment;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Sort vehicles
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortBy === 'lastMaintenance') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Available': return 'status-available';
      case 'Assigned': return 'status-assigned';
      case 'Maintenance': return 'status-maintenance';
      default: return '';
    }
  };

  // Pagination
  const totalPages = Math.ceil(sortedVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVehicles = sortedVehicles.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 10; // Show up to 10 page numbers
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first 10 pages, then ellipsis, then last 2 pages
      for (let i = 1; i <= Math.min(10, totalPages); i++) {
        pages.push(i);
      }
      if (totalPages > 10) {
        pages.push('...');
        pages.push(totalPages - 1);
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="manage-vehicles-container">
      <div className="page-header">
        <h1>📋 View Vehicle List</h1>
        <p className="page-subtitle">Manage all vehicles in the system</p>
      </div>

      <div className="controls-bar">
        <input
          type="text"
          placeholder="🔍 Search by Vehicle ID, Plate Number, or Model..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />

        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="filter-select"
        >
          <option value="All">All Status</option>
          <option value="Available">Available</option>
          <option value="Assigned">Assigned</option>
          <option value="Maintenance">Maintenance</option>
        </select>

        <select
          value={filterDepartment}
          onChange={(e) => {
            setFilterDepartment(e.target.value);
            setCurrentPage(1);
          }}
          className="filter-select"
        >
          <option value="All">All Departments</option>
          <option value="Transport">Transport</option>
          <option value="Administration">Administration</option>
          <option value="Logistics">Logistics</option>
        </select>

        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="filter-select"
        >
          <option value="10">10 per page</option>
          <option value="15">15 per page</option>
          <option value="25">25 per page</option>
          <option value="50">50 per page</option>
          <option value={sortedVehicles.length}>Show All</option>
        </select>
      </div>

      <div className="table-container">
        <table className="vehicles-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} className="sortable">
                Vehicle ID {sortBy === 'id' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('plateNumber')} className="sortable">
                Plate Number {sortBy === 'plateNumber' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('type')} className="sortable">
                Vehicle Type {sortBy === 'type' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('driver')} className="sortable">
                Driver {sortBy === 'driver' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('status')} className="sortable">
                Status {sortBy === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('fuelType')} className="sortable">
                Fuel Type {sortBy === 'fuelType' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('lastMaintenance')} className="sortable">
                Last Maintenance {sortBy === 'lastMaintenance' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('department')} className="sortable">
                Department {sortBy === 'department' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentVehicles.map(vehicle => (
              <tr key={vehicle.id}>
                <td><strong>{vehicle.id}</strong></td>
                <td>{vehicle.plateNumber}</td>
                <td>{vehicle.type}</td>
                <td>{vehicle.driver}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(vehicle.status)}`}>
                    {vehicle.status}
                  </span>
                </td>
                <td>{vehicle.fuelType}</td>
                <td>{vehicle.lastMaintenance}</td>
                <td>{vehicle.department}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-action btn-view"
                      onClick={() => handleViewDetails(vehicle)}
                      title="View Details"
                    >
                      👁️
                    </button>
                    <button 
                      className="btn-action btn-edit"
                      onClick={() => handleEditClick(vehicle)}
                      title="Edit Vehicle"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(vehicle.id)}
                      title="Delete Vehicle"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedVehicles.length === 0 && (
        <div className="no-results">
          <p>📭 No vehicles found</p>
        </div>
      )}

      {sortedVehicles.length > 0 && (
        <div className="pagination-container">
          <div className="table-footer">
            <p>
              Showing {startIndex + 1} to {Math.min(endIndex, sortedVehicles.length)} of {sortedVehicles.length} results
            </p>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn pagination-arrow"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                title="Previous"
              >
                ‹
              </button>

              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                ) : (
                  <button
                    key={page}
                    className={`pagination-btn pagination-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )
              ))}

              <button
                className="pagination-btn pagination-arrow"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                title="Next"
              >
                ›
              </button>
            </div>
          )}
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedVehicle && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🚗 Vehicle Details</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Vehicle ID:</label>
                  <span>{selectedVehicle.id}</span>
                </div>
                <div className="detail-item">
                  <label>Plate Number:</label>
                  <span>{selectedVehicle.plateNumber}</span>
                </div>
                <div className="detail-item">
                  <label>Model:</label>
                  <span>{selectedVehicle.model}</span>
                </div>
                <div className="detail-item">
                  <label>Type:</label>
                  <span>{selectedVehicle.type}</span>
                </div>
                <div className="detail-item">
                  <label>Capacity:</label>
                  <span>{selectedVehicle.capacity} passengers</span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span className={`status-badge ${getStatusClass(selectedVehicle.status)}`}>
                    {selectedVehicle.status}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Driver:</label>
                  <span>{selectedVehicle.driver}</span>
                </div>
                <div className="detail-item">
                  <label>Fuel Type:</label>
                  <span>{selectedVehicle.fuelType}</span>
                </div>
                <div className="detail-item">
                  <label>Last Maintenance:</label>
                  <span>{selectedVehicle.lastMaintenance}</span>
                </div>
                <div className="detail-item">
                  <label>Department:</label>
                  <span>{selectedVehicle.department}</span>
                </div>
                <div className="detail-item">
                  <label>Mileage:</label>
                  <span>{selectedVehicle.mileage}</span>
                </div>
                <div className="detail-item">
                  <label>Year:</label>
                  <span>{selectedVehicle.year}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {showEditModal && selectedVehicle && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Edit Vehicle</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Plate Number:</label>
                  <input
                    type="text"
                    value={editFormData.plateNumber}
                    onChange={(e) => setEditFormData({...editFormData, plateNumber: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Model:</label>
                  <input
                    type="text"
                    value={editFormData.model}
                    onChange={(e) => setEditFormData({...editFormData, model: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Type:</label>
                  <select
                    value={showOtherType ? 'Other' : editFormData.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                  >
                    <option value="Van">Van</option>
                    <option value="Bus">Bus</option>
                    <option value="Truck">Truck</option>
                    <option value="Other">Other</option>
                  </select>
                  {showOtherType && (
                    <input
                      type="text"
                      placeholder="Enter vehicle type..."
                      value={editFormData.type}
                      onChange={(e) => setEditFormData({...editFormData, type: e.target.value})}
                      style={{ marginTop: '8px' }}
                    />
                  )}
                </div>
                <div className="form-group">
                  <label>Capacity:</label>
                  <input
                    type="number"
                    value={editFormData.capacity}
                    onChange={(e) => setEditFormData({...editFormData, capacity: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Status:</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                  >
                    <option value="Available">Available</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Fuel Type:</label>
                  <select
                    value={showOtherFuel ? 'Other' : editFormData.fuelType}
                    onChange={(e) => handleFuelChange(e.target.value)}
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Gasoline">Gasoline</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Other">Other</option>
                  </select>
                  {showOtherFuel && (
                    <input
                      type="text"
                      placeholder="Enter fuel type..."
                      value={editFormData.fuelType}
                      onChange={(e) => setEditFormData({...editFormData, fuelType: e.target.value})}
                      style={{ marginTop: '8px' }}
                    />
                  )}
                </div>
                <div className="form-group">
                  <label>Department:</label>
                  <select
                    value={showOtherDept ? 'Other' : editFormData.department}
                    onChange={(e) => handleDeptChange(e.target.value)}
                  >
                    <option value="Transport">Transport</option>
                    <option value="Administration">Administration</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Other">Other</option>
                  </select>
                  {showOtherDept && (
                    <input
                      type="text"
                      placeholder="Enter department..."
                      value={editFormData.department}
                      onChange={(e) => setEditFormData({...editFormData, department: e.target.value})}
                      style={{ marginTop: '8px' }}
                    />
                  )}
                </div>
                <div className="form-group">
                  <label>Year:</label>
                  <input
                    type="number"
                    value={editFormData.year}
                    onChange={(e) => setEditFormData({...editFormData, year: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="btn-save" onClick={handleEditSave}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageVehiclesPage;
