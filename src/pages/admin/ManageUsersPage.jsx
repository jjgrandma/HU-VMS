import { useState } from 'react';
import './adminTheme.css';
import './manageUsersPage.css';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([
    { id: 1, fullname: 'John Doe', username: 'johndoe', email: 'john@example.com', role: 'Driver', unit: 'Transport Unit', status: 'Active', isLocked: false, joinDate: '2024-01-15' },
    { id: 2, fullname: 'Jane Smith', username: 'janesmith', email: 'jane@example.com', role: 'User', unit: 'Engineering College', status: 'Active', isLocked: false, joinDate: '2024-02-10' },
    { id: 3, fullname: 'Mike Johnson', username: 'mikej', email: 'mike@example.com', role: 'Driver', unit: 'Transport Unit', status: 'Active', isLocked: false, joinDate: '2024-01-20' },
    { id: 4, fullname: 'Sarah Williams', username: 'sarahw', email: 'sarah@example.com', role: 'User', unit: 'Medical College', status: 'Inactive', isLocked: false, joinDate: '2023-12-05' },
    { id: 5, fullname: 'David Brown', username: 'davidb', email: 'david@example.com', role: 'Transport Officer', unit: 'Transport Unit', status: 'Active', isLocked: false, joinDate: '2023-11-15' },
    { id: 6, fullname: 'Emily Davis', username: 'emilyd', email: 'emily@example.com', role: 'User', unit: 'Law School', status: 'Active', isLocked: false, joinDate: '2024-03-01' },
    { id: 7, fullname: 'Robert Wilson', username: 'robertw', email: 'robert@example.com', role: 'Driver', unit: 'Transport Unit', status: 'Active', isLocked: false, joinDate: '2024-02-15' },
    { id: 8, fullname: 'Lisa Anderson', username: 'lisaa', email: 'lisa@example.com', role: 'User', unit: 'Business School', status: 'Active', isLocked: false, joinDate: '2024-01-25' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showLockModal, setShowLockModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [lockReason, setLockReason] = useState('');

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== id));
      // Reset to first page if current page becomes empty
      const newFilteredUsers = users.filter(user => user.id !== id);
      const totalPages = Math.ceil(newFilteredUsers.length / itemsPerPage);
      if (currentPage > totalPages) {
        setCurrentPage(totalPages || 1);
      }
    }
  };

  const handleToggleLock = (id) => {
    const user = users.find(u => u.id === id);
    
    if (user.isLocked) {
      // Unlock account directly
      setUsers(users.map(u => {
        if (u.id === id) {
          return { ...u, isLocked: false, lockReason: null };
        }
        return u;
      }));
      alert('Account unlocked successfully!');
    } else {
      // Show modal to enter lock reason
      setSelectedUserId(id);
      setShowLockModal(true);
    }
  };

  const handleLockSubmit = () => {
    if (!lockReason.trim()) {
      alert('Please provide a reason for locking this account.');
      return;
    }

    setUsers(users.map(user => {
      if (user.id === selectedUserId) {
        return { ...user, isLocked: true, lockReason: lockReason.trim() };
      }
      return user;
    }));

    alert('Account locked successfully!');
    setShowLockModal(false);
    setLockReason('');
    setSelectedUserId(null);
  };

  const handleLockCancel = () => {
    setShowLockModal(false);
    setLockReason('');
    setSelectedUserId(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'All' || user.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when search or filter changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    setFilterRole(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getStatusClass = (status) => {
    return status === 'Active' ? 'status-active' : 'status-inactive';
  };

  return (
    <div className="manage-users-container">
      <h1>Manage Users</h1>

      <div className="controls-bar">
        <input
          type="text"
          placeholder="Search by name, username, or email..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />

        <select
          value={filterRole}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="All">All Roles</option>
          <option value="User">User</option>
          <option value="Driver">Driver</option>
          <option value="Transport Officer">Transport Officer</option>
        </select>
      </div>

      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Unit</th>
              <th>Status</th>
              <th>Join Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.fullname}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.unit}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.joinDate}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className={user.isLocked ? "btn-unlock" : "btn-lock"}
                      onClick={() => handleToggleLock(user.id)}
                      title={user.isLocked ? "Unlock Account" : "Lock Account"}
                    >
                      {user.isLocked ? '🔓 Unlock' : '🔒 Lock'}
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="no-results">No users found</div>
      )}

      {/* Lock Account Modal */}
      {showLockModal && (
        <div className="modal-overlay" onClick={handleLockCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Lock User Account</h2>
              <button className="modal-close" onClick={handleLockCancel}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Please provide a reason for locking this account. This will be recorded for administrative purposes.
              </p>
              <textarea
                className="lock-reason-input"
                placeholder="Enter reason for locking account (e.g., Policy violation, Security concern, etc.)"
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                rows="4"
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={handleLockCancel}>
                Cancel
              </button>
              <button className="btn-modal-submit" onClick={handleLockSubmit}>
                Lock Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            <span>
              Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
            </span>
            <select 
              value={itemsPerPage} 
              onChange={handleItemsPerPageChange}
              className="items-per-page"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>

          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              ⟪ First
            </button>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹ Prev
            </button>

            {/* Page Numbers */}
            <div className="page-numbers">
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      className={`page-number ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="page-ellipsis">...</span>;
                }
                return null;
              })}
            </div>

            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next ›
            </button>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last ⟫
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsersPage;
