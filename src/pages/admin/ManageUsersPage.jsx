import { useState, useEffect } from 'react';
import { getUsers, deleteUser, updateUser } from '../../api/api';
import './adminTheme.css';
import './manageUsersPage.css';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then(data => setUsers(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showLockModal, setShowLockModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [lockReason, setLockReason] = useState('');

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        setUsers(users.filter(u => u._id !== id));
      } catch (err) {
        alert('Failed to delete: ' + err.message);
      }
    }
  };

  const handleToggleLock = async (id) => {
    const user = users.find(u => u._id === id);
    if (user.isActive === false) {
      try {
        const updated = await updateUser(id, { isActive: true });
        setUsers(users.map(u => u._id === id ? updated : u));
      } catch (err) { alert(err.message); }
    } else {
      setSelectedUserId(id);
      setShowLockModal(true);
    }
  };

  const handleLockSubmit = async () => {
    if (!lockReason.trim()) { alert('Please provide a reason.'); return; }
    try {
      const updated = await updateUser(selectedUserId, { isActive: false });
      setUsers(users.map(u => u._id === selectedUserId ? { ...updated, lockReason } : u));
      setShowLockModal(false);
      setLockReason('');
      setSelectedUserId(null);
    } catch (err) { alert(err.message); }
  };

  const handleLockCancel = () => {
    setShowLockModal(false);
    setLockReason('');
    setSelectedUserId(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
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
          <option value="USER">User</option>
          <option value="DRIVER">Driver</option>
          <option value="TRANSPORT">Transport Officer</option>
          <option value="FUEL_OFFICER">Fuel Officer</option>
          <option value="GATE_OFFICER">Gate Officer</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div className="table-container">
        {loading ? <div style={{padding:'40px',textAlign:'center'}}>Loading users...</div> : (
        <table className="users-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{{
                  ADMIN: 'Admin',
                  TRANSPORT: 'Transport Officer',
                  DRIVER: 'Driver',
                  USER: 'User',
                  FUEL_OFFICER: 'Fuel Officer',
                  GATE_OFFICER: 'Gate Officer',
                }[user.role] || user.role}</td>
                <td>{user.department || '-'}</td>
                <td>
                  <span className={`status-badge ${user.isActive !== false ? 'status-active' : 'status-inactive'}`}>
                    {user.isActive !== false ? 'Active' : 'Locked'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className={user.isActive === false ? "btn-unlock" : "btn-lock"}
                      onClick={() => handleToggleLock(user._id)}
                    >
                      {user.isActive === false ? '🔓 Unlock' : '🔒 Lock'}
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(user._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
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
