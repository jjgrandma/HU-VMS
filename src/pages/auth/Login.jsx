import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail } from "lucide-react";
import busLogo from "../../assets/bus.png";
import { login } from "../../api/api";
import "./login.css";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const data = await login(formData.username, formData.password);
      onLogin({ username: data.user.username, role: data.user.role });

      const routes = {
        ADMIN: '/admin/dashboard',
        TRANSPORT: '/transport/dashboard',
        DRIVER: '/driver/dashboard',
        USER: '/user/dashboard',
        FUEL_OFFICER: '/fuel/dashboard',
        GATE_OFFICER: '/gate/dashboard',
        MAINTENANCE_OFFICER: '/maintenance/dashboard',
      };
      const destination = routes[data.user.role];
      if (!destination) {
        setError(`Unknown role: ${data.user.role}. Contact admin.`);
        return;
      }
      navigate(destination);
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
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

          <h2>Sign In</h2>
          <p className="subtitle">Login to Secure Access</p>

          {error && <div className="login-error">{error}</div>}

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

            <div className="login-actions">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="support">
            <div className="support-divider">
              <span>Need Help?</span>
            </div>
            <Link to="/contact-support" className="support-link">
              <Mail size={18} />
              Contact Admin Support
            </Link>
            <p className="support-text">
              Having trouble accessing your account? Contact our admin team for assistance with password resets, account issues, or system access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
