import { useState } from 'react';
import './addUser.css';

const AddUser = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    unit: '',
    date: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('User Added:', formData);
    alert('User added successfully!');
    setFormData({
      fullname: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      unit: '',
      date: ''
    });
  };

  return (
    <div className="add-user-container">
      <h1>Add New User</h1>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
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

          <button type="submit" className="btn-submit">
            Add User
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
