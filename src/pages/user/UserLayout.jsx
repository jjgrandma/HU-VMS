// src/pages/user/UserLayout.jsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './UserLayout.css';

const UserLayout = () => {
  const navItems = [
    { path: "/user", label: "Dashboard", icon: "📊" },
    { path: "/user/submit-request", label: "Request Vehicle", icon: "🚗" },
    { path: "/user/requests", label: "My Requests", icon: "📋" },
    { path: "/user/submit-complaint", label: "Submit Complaint", icon: "⚠️" },
    { path: "/user/notifications", label: "Notifications", icon: "🔔" },
  ];

  return (
    <div className="user-layout">
      {/* Sidebar */}
      <aside className="user-sidebar">
        <div className="sidebar-header">
          <h1>USER PORTAL</h1>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                isActive ? 'nav-item active' : 'nav-item'
              }
              end={item.path === "/user"}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="user-main">
        <header className="user-header">
          <div className="header-content">
            <h2>User Dashboard</h2>
            <div className="user-profile">
              <span>Welcome, User</span>
              <div className="user-avatar">U</div>
            </div>
          </div>
        </header>
        <div className="user-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default UserLayout;