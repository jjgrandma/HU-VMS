import { Search, Bell, ChevronDown, Menu, Settings, User, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import './TransportHeader.css';

const TransportHeader = ({ onLogout, toggleSidebar, isSidebarOpen }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    name: 'Transport Officer',
    email: 'transport.officer@haramaya.edu.et',
    phone: '+251-911-123456',
    department: 'Transport Operations',
    employeeId: 'HU-TO-001'
  });
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleProfileImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProfile = () => {
    setShowProfileModal(true);
    setShowProfileDropdown(false);
  };

  const handleSaveProfile = (updatedInfo) => {
    setPersonalInfo(updatedInfo);
    setShowProfileModal(false);
    console.log('Profile saved:', updatedInfo);
  };

  const handleCancelEdit = () => {
    setShowProfileModal(false);
    console.log('Edit cancelled');
  };

  return (
    <div className="transport-header-wrapper">
      <div className="top-admin-bar">
        <div className="admin-dropdown-container" ref={dropdownRef}>
          <div 
            className={`admin-profile-button ${showProfileDropdown ? 'active' : ''}`}
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <div className="admin-avatar">
              <span className="admin-avatar-text">TO</span>
            </div>
            <div className="admin-text-info">
              <span className="admin-main-text">Transport Officer</span>
              <span className="admin-sub-text">Admin</span>
            </div>
            <ChevronDown size={14} className="admin-chevron" />
          </div>

          {showProfileDropdown && (
            <div className="admin-dropdown">
              <div className="admin-dropdown-header">
                <div className="admin-dropdown-avatar">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="profile-image" />
                  ) : (
                    <span className="admin-avatar-text">TO</span>
                  )}
                </div>
                <div className="admin-dropdown-info">
                  <h4>{personalInfo.name}</h4>
                  <p>Administrator</p>
                  <span className="admin-email">{personalInfo.email}</span>
                </div>
              </div>
              
              <div className="admin-dropdown-divider"></div>
              
              <div className="admin-dropdown-menu">
                <button className="admin-dropdown-item" onClick={() => setShowProfileDropdown(false)}>
                  <User size={16} />
                  <span>View Profile</span>
                </button>
                <button className="admin-dropdown-item" onClick={handleEditProfile}>
                  <Settings size={16} />
                  <span>Edit Personal Info</span>
                </button>
                <button className="admin-dropdown-item" onClick={handleProfileImageUpload}>
                  <div className="upload-icon">📷</div>
                  <span>Upload Profile Picture</span>
                </button>
                <button className="admin-dropdown-item">
                  <div className="security-icon">🔒</div>
                  <span>Change Password</span>
                </button>
                <button className="admin-dropdown-item">
                  <Bell size={16} />
                  <span>Notification Settings</span>
                </button>
                <button className="admin-dropdown-item">
                  <div className="theme-icon">🎨</div>
                  <span>Theme Preferences</span>
                </button>
              </div>
              
              <div className="admin-dropdown-divider"></div>
              
              <button className="admin-dropdown-item logout-item" onClick={onLogout}>
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
        
        <button className="top-logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="transport-header">
        <div className="header-left">
          {!isSidebarOpen && (
            <button className="menu-toggle-btn" onClick={toggleSidebar}>
              <Menu size={20} />
            </button>
          )}
          <div className="title-section">
            <h1 className="page-title">Transport</h1>
            <h1 className="page-subtitle">Operations</h1>
          </div>
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search..." className="search-input" />
          </div>
        </div>

        <div className="header-right">
          <div className="header-actions">
            <button className="icon-btn notification-btn">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input for profile image upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="profile-modal-overlay">
          <div className="profile-modal">
            <div className="profile-modal-header">
              <h3>Edit Personal Information</h3>
              <button 
                className="modal-close-btn"
                onClick={() => setShowProfileModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="profile-modal-content">
              <div className="profile-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={personalInfo.name}
                  onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                />
              </div>
              
              <div className="profile-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                />
              </div>
              
              <div className="profile-form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                />
              </div>
              
              <div className="profile-form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={personalInfo.department}
                  onChange={(e) => setPersonalInfo({...personalInfo, department: e.target.value})}
                />
              </div>
              
              <div className="profile-form-group">
                <label>Employee ID</label>
                <input
                  type="text"
                  value={personalInfo.employeeId}
                  onChange={(e) => setPersonalInfo({...personalInfo, employeeId: e.target.value})}
                />
              </div>
            </div>
            
            <div className="profile-modal-actions">
              <button 
                className="btn-cancel"
                onClick={handleCancelEdit}
                type="button"
              >
                Cancel
              </button>
              <button 
                className="btn-save"
                onClick={() => handleSaveProfile(personalInfo)}
                type="button"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportHeader;
