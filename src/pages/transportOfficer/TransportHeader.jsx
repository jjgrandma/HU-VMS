import { Search, Bell, ChevronDown, Menu, Settings, User, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import './TransportHeader.css';

const TransportHeader = ({ title, onLogout, toggleSidebar, isSidebarOpen }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="transport-header">
      <div className="header-left">
        {!isSidebarOpen && (
          <button className="menu-toggle-btn" onClick={toggleSidebar}>
            <Menu size={20} />
          </button>
        )}
        <h1 className="page-title">{title}</h1>
      </div>
      
      <div className="header-right">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>

        <div className="header-actions">
          <button className="icon-btn notification-btn">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>
          
          <div className="profile-menu-container" ref={dropdownRef}>
            <div 
              className={`profile-menu ${showProfileDropdown ? 'active' : ''}`}
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <div className="profile-avatar">
                <img src="https://ui-avatars.com/api/?name=Transport+Officer&background=84cc16&color=fff" alt="User" />
              </div>
              <div className="profile-info">
                <span className="profile-name">Officer</span>
                <span className="profile-role">Admin</span>
              </div>
              <ChevronDown size={16} className="profile-chevron" />
            </div>

            {showProfileDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    <img src="https://ui-avatars.com/api/?name=Transport+Officer&background=84cc16&color=fff" alt="User" />
                  </div>
                  <div className="dropdown-info">
                    <h4>Officer</h4>
                    <p>Administrator</p>
                    <span className="user-email">transport.officer@haramaya.edu.et</span>
                  </div>
                </div>
                
                <div className="dropdown-divider"></div>
                
                <div className="dropdown-menu">
                  <button className="dropdown-item">
                    <User size={16} />
                    <span>My Profile</span>
                  </button>
                  <button className="dropdown-item">
                    <Settings size={16} />
                    <span>Account Settings</span>
                  </button>
                  <button className="dropdown-item">
                    <Bell size={16} />
                    <span>Notification Settings</span>
                  </button>
                </div>
                
                <div className="dropdown-divider"></div>
                
                <button className="dropdown-item logout-item" onClick={onLogout}>
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportHeader;
