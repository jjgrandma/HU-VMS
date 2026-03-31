import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, Calendar, ClipboardCheck, Fuel, Wrench, Bell, Settings, User, X, CheckCheck, MessageSquareWarning } from 'lucide-react';
import { getCurrentUser } from '../../api/api';
import './DriverLayout.css';
import './driverShared.css';

const BASE = 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');

const DriverLayout = ({ onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const notifRef = useRef(null);
  const settingsRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'D';

  // Fetch profile photo
  useEffect(() => {
    const t = token();
    if (!t) return;
    fetch(`${BASE}/users/me`, { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.json())
      .then(u => { if (u.profilePhoto) setProfilePhoto(u.profilePhoto); })
      .catch(console.error);
  }, [location.pathname]);

  // Fetch notifications from trips
  useEffect(() => {
    const t = token();
    if (!t) return;
    fetch(`${BASE}/driver/trips`, { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.json())
      .then(trips => {
        if (!Array.isArray(trips)) return;
        const notifs = trips
          .filter(tr => tr.status === 'approved')
          .map(tr => ({
            id: tr._id,
            title: 'New Trip Assigned',
            message: `Trip to ${tr.destination} on ${tr.date}`,
            time: tr.createdAt,
          }));
        setNotifications(notifs);
      })
      .catch(console.error);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setShowSettings(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

  const navItems = [
    { to: '/driver/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/driver/trips',     icon: <Car size={18} />,             label: 'My Trips' },
    { to: '/driver/schedule',  icon: <Calendar size={18} />,        label: 'Schedule' },
    { to: '/driver/inspection',icon: <ClipboardCheck size={18} />,  label: 'Inspection' },
    { to: '/driver/fuel',         icon: <Fuel size={18} />,            label: 'Fuel Log' },
    { to: '/driver/fuel-request', icon: <Fuel size={18} />,            label: 'Fuel Request' },
    { to: '/driver/maintenance',icon: <Wrench size={18} />,                label: 'Maintenance' },
    { to: '/driver/complaints', icon: <MessageSquareWarning size={18} />,  label: 'Complaints' },
  ];

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <div className="driver-wrapper">
      {/* Mobile toggle */}
      <button className="driver-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
        <span className={`driver-hamburger ${mobileOpen ? 'open' : ''}`}>
          <span /><span /><span />
        </span>
      </button>
      {mobileOpen && <div className="driver-overlay" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={`driver-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="driver-sidebar-header">
          <div className="driver-logo">
            <div className="driver-logo-icon"><Car size={20} color="#16a34a" /></div>
            {!collapsed && <span className="driver-logo-text">HU-VMS</span>}
          </div>
          <button className="driver-collapse-btn" onClick={() => setCollapsed(p => !p)}>
            {collapsed ? '▶' : '◀'}
          </button>
        </div>

        <nav className="driver-nav">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`driver-nav-item ${isActive(item.to) ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : ''}
            >
              <span className="driver-nav-icon">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="driver-main">
        {/* Header */}
        <header className="driver-header">
          <div className="driver-header-left">
            <h1>Driver Portal</h1>
          </div>
          <div className="driver-header-right">
            {/* Notifications */}
            <div className="driver-header-dropdown" ref={notifRef}>
              <button className="driver-header-btn" onClick={() => setShowNotif(p => !p)}>
                <Bell size={20} />
                {notifications.length > 0 && <span className="driver-badge">{notifications.length}</span>}
              </button>
              {showNotif && (
                <div className="driver-dropdown-panel">
                  <div className="driver-dropdown-header">
                    <span>Notifications</span>
                    <button onClick={() => setShowNotif(false)}><X size={14} /></button>
                  </div>
                  <div className="driver-dropdown-list">
                    {notifications.length === 0
                      ? <div className="driver-dropdown-empty"><Bell size={28} /><p>No new notifications</p></div>
                      : notifications.map(n => (
                        <div key={n.id} className="driver-notif-item">
                          <div className="driver-notif-title">{n.title}</div>
                          <div className="driver-notif-msg">{n.message}</div>
                          <div className="driver-notif-time">{new Date(n.time).toLocaleDateString()}</div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="driver-header-dropdown" ref={settingsRef}>
              <button className="driver-header-btn" onClick={() => setShowSettings(p => !p)}>
                <Settings size={20} />
              </button>
              {showSettings && (
                <div className="driver-dropdown-panel driver-settings-panel">
                  <Link to="/driver/profile" className="driver-settings-item" onClick={() => setShowSettings(false)}>
                    <User size={15} /> My Profile
                  </Link>
                </div>
              )}
            </div>

            {/* Avatar + name */}
            <div className="driver-header-profile">
              <div className="driver-avatar">
                {profilePhoto
                  ? <img src={profilePhoto} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  : initials
                }
              </div>
              <div className="driver-header-info">
                <span className="driver-header-name">{currentUser?.name || 'Driver'}</span>
                <span className="driver-header-role">DRIVER</span>
              </div>
            </div>

            <button className="driver-logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        {/* Content */}
        <main className="driver-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DriverLayout;
