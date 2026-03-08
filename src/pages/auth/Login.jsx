import { useState } from "react";
import { useNavigate } from "react-router-dom";
import busLogo from "../../assets/bus.png"; // local logo
import "./login.css";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.role) {
      alert("Please select your role");
      return;
    }

    // Call the onLogin prop passed from App.jsx
    onLogin({
      username: formData.username,
      role: formData.role,
    });

    // Navigate to the appropriate dashboard based on role
    switch (formData.role) {
      case 'ADMIN':
        navigate('/admin/dashboard');
        break;
      case 'TRANSPORT':
        navigate('/transport/dashboard');
        break;
      case 'DRIVER':
        navigate('/driver/dashboard');
        break;
      case 'USER':
        navigate('/user/dashboard');
        break;
      case 'FUEL_OFFICER':
        navigate('/fuel/dashboard');
        break;
      case 'GATE_OFFICER':
        navigate('/gate/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="login-page">

      {/* ===== CENTER CONTENT ===== */}
      <div className="login-container">
        <div className="login-card">
          <div className="logo-wrapper">
            <img 
              src={busLogo} 
              alt="Haramaya University Logo" 
              className="login-logo"
            />
          </div>

          <p className="subtitle">Login to Secure Access</p>

          <form onSubmit={handleSubmit}>
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />

            <label>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select your role</option>
              <option value="ADMIN">Admin</option>
              <option value="TRANSPORT">Transport Officer</option>
              <option value="DRIVER">Driver</option>
              <option value="USER">User</option>
              <option value="FUEL_OFFICER">Fuel Station Officer</option>
              <option value="GATE_OFFICER">Gate Security Officer</option>
            </select>

            <div className="login-actions">
              <a href="#">Forgot Password?</a>
            </div>

            <button type="submit">Login</button>
          </form>

          <div className="support">
            Need help? <a href="#">Contact Support</a>
          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="login-footer">
        © 2026 Haramaya University. All rights reserved.
      </footer>
    </div>
  );
}
