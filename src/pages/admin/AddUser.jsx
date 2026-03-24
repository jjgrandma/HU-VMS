import { useState } from 'react';
import { registerUser } from '../../api/api';
import './adminTheme.css';
import './addUser.css';

const ROLE_MAP = {
  'User': 'USER',
  'Driver': 'DRIVER',
  'Transport Officer': 'TRANSPORT',
  'Admin': 'ADMIN',
  'Fuel Station Officer': 'FUEL_OFFICER',
  'Gate Security Officer': 'GATE_OFFICER',
};

const AddUser = () => {
  const [formData, setFormData] = useState({
    fullname: '', username: '', email: '', password: '',
    confirmPassword: '', role: '', department: '', unit: '', phone: '', date: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }
    setLoading(true);
    try {
      await registerUser({
        name: formData.fullname,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: ROLE_MAP[formData.role] || formData.role,
        department: formData.department,
        phone: formData.phone,
        employeeId: formData.unit,
      });
      setMessage({ type: 'success', text: 'User added successfully!' });
      setFormData({ fullname: '', username: '', email: '', password: '', confirmPassword: '', role: '', department: '', unit: '', phone: '', date: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to add user' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-user-container">
      <h1>Add New User</h1>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {message && (
            <div style={{
              padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px',
              background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
              color: message.type === 'success' ? '#16a34a' : '#dc2626',
              border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
            }}>{message.text}</div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">Select Role</option>
                <option value="User">User</option>
                <option value="Driver">Driver</option>
                <option value="Transport Officer">Transport Officer</option>
                <option value="Fuel Station Officer">Fuel Station Officer</option>
                <option value="Gate Security Officer">Gate Security Officer</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Computer Science"
                required
              />
            </div>

            <div className="form-group">
              <label>College/Service Unit</label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="Engineering College"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+251 9XX XXX XXX"
              />
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
