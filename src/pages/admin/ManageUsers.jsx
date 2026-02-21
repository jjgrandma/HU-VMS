import { useState, useEffect } from "react";
import "./manageUsers.css";

export default function ManageUsers() {
  const [users, setUsers] = useState([
    { username: "john_admin", password: "1234", role: "Admin", status: "Active" },
    { username: "driver01", password: "1234", role: "Driver", status: "Active" },
    { username: "transport01", password: "1234", role: "Transport Officer", status: "Inactive" },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "Driver",
    status: "Active",
  });

  // Load users from localStorage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem("users");
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  }, []);

  // Save users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleChange = (e) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setNewUser({
      username: "",
      password: "",
      confirmPassword: "",
      role: "Driver",
      status: "Active",
    });
    setEditingIndex(null);
    setShowForm(false);
  };

  const validateForm = () => {
    if (!newUser.username || !newUser.password) {
      showNotification("Please fill all required fields", "error");
      return false;
    }

    if (newUser.username.length < 3) {
      showNotification("Username must be at least 3 characters", "error");
      return false;
    }

    if (newUser.password.length < 4) {
      showNotification("Password must be at least 4 characters", "error");
      return false;
    }

    if (!editingIndex && newUser.password !== newUser.confirmPassword) {
      showNotification("Passwords do not match", "error");
      return false;
    }

    const duplicate = users.some(
      (u, index) =>
        u.username.toLowerCase() === newUser.username.toLowerCase() &&
        index !== editingIndex
    );

    if (duplicate) {
      showNotification("Username already exists", "error");
      return false;
    }

    return true;
  };

  const handleAddOrUpdateUser = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const userData = {
      username: newUser.username,
      password: newUser.password,
      role: newUser.role,
      status: newUser.status,
    };

    if (editingIndex !== null) {
      const updatedUsers = [...users];
      updatedUsers[editingIndex] = userData;
      setUsers(updatedUsers);
      showNotification("User updated successfully", "success");
    } else {
      setUsers([...users, userData]);
      showNotification("User added successfully", "success");
    }

    resetForm();
  };

  const handleEdit = (index) => {
    const user = users[index];
    setNewUser({
      username: user.username,
      password: user.password,
      confirmPassword: user.password,
      role: user.role,
      status: user.status,
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    setShowDeleteConfirm(index);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm !== null) {
      const updatedUsers = users.filter((_, i) => i !== showDeleteConfirm);
      setUsers(updatedUsers);
      showNotification("User deleted successfully", "success");
      setShowDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const toggleUserStatus = (index) => {
    const updatedUsers = [...users];
    updatedUsers[index].status = updatedUsers[index].status === "Active" ? "Inactive" : "Active";
    setUsers(updatedUsers);
    showNotification(`User status updated to ${updatedUsers[index].status}`, "success");
  };

  // Filter users based on search term, role, and status
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "All" || u.role === filterRole;
    const matchesStatus = filterStatus === "All" || u.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get unique roles for filter dropdown
  const roles = ["All", ...new Set(users.map(u => u.role))];

  return (
    <div className="manage-users-container">
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete user "{users[showDeleteConfirm]?.username}"?</p>
            <p className="muted-text">This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete
              </button>
              <button className="btn btn-secondary" onClick={cancelDelete}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Manage Users</h1>
          <p className="text-muted">Control system access and permissions</p>
        </div>

        <div className="header-actions">
          <input
            type="text"
            placeholder="Search users..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select 
            className="filter-select"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            {roles.map(role => (
              <option key={role} value={role}>
                {role === "All" ? "All Roles" : role}
              </option>
            ))}
          </select>

          <select 
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>

          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            + Add User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Users</span>
          <span className="stat-value">{users.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active</span>
          <span className="stat-value">{users.filter(u => u.status === "Active").length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Inactive</span>
          <span className="stat-value">{users.filter(u => u.status === "Inactive").length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Admins</span>
          <span className="stat-value">{users.filter(u => u.role === "Admin").length}</span>
        </div>
      </div>

      {/* Add/Edit User Form */}
      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <div className="form-header">
              <h2>{editingIndex !== null ? "Edit User" : "Add New User"}</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleAddOrUpdateUser}>
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  name="username"
                  value={newUser.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                />
              </div>

              {!editingIndex && (
                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={newUser.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    required
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select name="role" value={newUser.role} onChange={handleChange}>
                    <option value="User(Requestor)">User (Requestor)</option>
                    <option value="Admin">Admin</option>
                    <option value="Driver">Driver</option>
                    <option value="Transport Officer">Transport Officer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={newUser.status} onChange={handleChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingIndex !== null ? "Update User" : "Save User"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => {
                const originalIndex = users.findIndex(u => u.username === user.username);
                return (
                  <tr key={originalIndex}>
                    <td className="username-cell">{user.username}</td>
                    <td>
                      <span className={`role-badge role-${user.role.toLowerCase().replace(/[^a-z]/g, '')}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span 
                        className={`status-badge ${user.status.toLowerCase()}`}
                        onClick={() => toggleUserStatus(originalIndex)}
                      >
                        ● {user.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(originalIndex)}
                          title="Edit user"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(originalIndex)}
                          title="Delete user"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="no-results">
                  No users found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="table-footer">
        <span className="text-muted">
          Showing {filteredUsers.length} of {users.length} users
        </span>
      </div>
    </div>
  );
}
