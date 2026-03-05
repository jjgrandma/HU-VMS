import { useState } from 'react';
import './manageUsersPage.css';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([
    { id: 1, fullname: 'John Doe', username: 'johndoe', email: 'john@example.com', role: 'Driver', unit: 'Transport Unit', status: 'Active', joinDate: '2024-01-15' },
    { id: 2, fullname: 'Jane Smith', username: 'janesmith', email: 'jane@example.com', role: 'User', unit: 'Engineering College', status: 'Active', joinDate: '2024-02-10' },
    { id: 3, fullname: 'Mike Johnson', username: 'mikej', email: 'mike@example.com', role: 'Driver', unit: 'Transport Unit', status: 'Active', joinDate: '2024-01-20' },
    { id: 4, fullname: 'Sarah Williams', username: 'sarahw', email: 'sarah@example.com', role: 'User', unit: 'Medical College', status: 'Inactive', joinDate: '2023-12-05' },
    { id: 5, fullname: 'David Brown', username: 'davidb', email: 'david@example.com', role: 'Transport Officer', unit: 'Transport Unit', status: 'Active', joinDate: '2023-11-15' },
    { id: 6, fullname: 'Emily Davis', username: 'emilyd', email: 'emily@example.com', role: 'User', unit: 'Law School', status: 'Active', joinDate: '2024-03-01' },
    { id: 7, fullname: 'Robert Wilson', username: 'robertw', email: 'robert@example.com', role: 'Driver', unit: 'Transport Unit', status: 'Active', joinDate: '2024-02-15' },
    { id: 8, fullname: 'Lisa Anderson', username: 'lisaa', email: 'lisa@example.com', role: 'User', unit: 'Business School', status: 'Active', joinDate: '2024-01-25' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'All' || user.role === filterRole;
    return matchesSearch && matchesFilter;
  });

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
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
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
            {filteredUsers.map(user => (
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
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="no-results">No users found</div>
      )}
    </div>
  );
};

export default ManageUsersPage;
