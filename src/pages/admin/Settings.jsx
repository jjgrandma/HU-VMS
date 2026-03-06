import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import './settings.css';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('appearance');
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/120');

  const themes = [
    { id: 'dark', name: 'Dark', icon: '🌙', color: '#0f172a' },
    { id: 'light', name: 'Light', icon: '☀️', color: '#ffffff' },
    { id: 'colorful', name: 'Colorful', icon: '🎨', color: '#6366f1' }
  ];

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        // Here you would typically upload to your backend
        // uploadToBackend(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfileImage('https://via.placeholder.com/120');
    // Here you would typically call your backend to remove the photo
    // removePhotoFromBackend();
  };

  const triggerFileInput = () => {
    document.getElementById('profile-image-input').click();
  };

  return (
    <div className="settings-container">
      <h1>Settings</h1>

      <div className="settings-tabs">
        <button 
          className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
          onClick={() => setActiveTab('appearance')}
        >
          🎨 Appearance
        </button>
        <button 
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notifications
        </button>
        <button 
          className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          👤 Account
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'appearance' && (
          <div className="settings-section">
            <h2>Theme Selection</h2>
            <p className="section-description">Choose your preferred theme for the admin panel</p>
            
            <div className="theme-grid">
              {themes.map(t => (
                <div 
                  key={t.id}
                  className={`theme-card ${theme === t.id ? 'active' : ''}`}
                  onClick={() => toggleTheme(t.id)}
                >
                  <div className="theme-preview" style={{ background: t.color }}>
                    <span className="theme-icon">{t.icon}</span>
                  </div>
                  <div className="theme-info">
                    <h3>{t.name}</h3>
                    {theme === t.id && <span className="active-badge">✓ Active</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="settings-group">
              <h3>Display Options</h3>
              <label className="setting-item">
                <input type="checkbox" defaultChecked />
                <span>Show animations</span>
              </label>
              <label className="setting-item">
                <input type="checkbox" defaultChecked />
                <span>Enable tooltips</span>
              </label>
              <label className="setting-item">
                <input type="checkbox" />
                <span>Compact mode</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="settings-section">
            <h2>Notification Preferences</h2>
            <p className="section-description">Manage how you receive notifications</p>
            
            <div className="settings-group">
              <h3>Email Notifications</h3>
              <label className="setting-item">
                <input type="checkbox" defaultChecked />
                <span>Report requests</span>
              </label>
              <label className="setting-item">
                <input type="checkbox" defaultChecked />
                <span>Password reset requests</span>
              </label>
              <label className="setting-item">
                <input type="checkbox" />
                <span>System updates</span>
              </label>
            </div>

            <div className="settings-group">
              <h3>Push Notifications</h3>
              <label className="setting-item">
                <input type="checkbox" defaultChecked />
                <span>Enable push notifications</span>
              </label>
              <label className="setting-item">
                <input type="checkbox" />
                <span>Sound alerts</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="settings-section">
            <h2>Account Settings</h2>
            <p className="section-description">Manage your account information and profile</p>
            
            <div className="settings-group">
              <h3>Profile Picture</h3>
              <div className="profile-picture-section">
                <div className="current-picture">
                  <img src={profileImage} alt="Profile" className="profile-pic" />
                  <span className="online-badge">Online</span>
                </div>
                <div className="picture-actions">
                  <input 
                    type="file" 
                    id="profile-image-input"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <button 
                    className="btn-secondary" 
                    onClick={triggerFileInput}
                  >
                    📤 Upload New Photo
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={handleRemovePhoto}
                  >
                    🗑️ Remove Photo
                  </button>
                  <p className="help-text">Recommended: Square image, at least 400x400px, max 5MB</p>
                </div>
              </div>
            </div>

            <div className="settings-group">
              <h3>Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" defaultValue="Admin" />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" defaultValue="User" />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" defaultValue="admin@haramaya.edu.et" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" defaultValue="+251 912 345 678" />
                </div>
                <div className="form-group">
                  <label>Emergency Contact</label>
                  <input type="tel" defaultValue="+251 911 234 567" placeholder="Emergency phone number" />
                </div>
              </div>
              <div className="form-group">
                <label>Department</label>
                <select defaultValue="administration">
                  <option value="administration">Administration</option>
                  <option value="transport">Transport</option>
                  <option value="it">IT Department</option>
                  <option value="hr">Human Resources</option>
                </select>
              </div>
              <div className="form-group">
                <label>Job Title</label>
                <input type="text" defaultValue="System Administrator" />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea rows="4" defaultValue="Experienced system administrator managing the university vehicle management system." placeholder="Tell us about yourself..."></textarea>
              </div>
            </div>

            <div className="settings-group">
              <h3>Address Information</h3>
              <div className="form-group">
                <label>Street Address</label>
                <input type="text" defaultValue="Haramaya University Campus" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" defaultValue="Haramaya" />
                </div>
                <div className="form-group">
                  <label>State/Region</label>
                  <input type="text" defaultValue="Oromia" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Postal Code</label>
                  <input type="text" defaultValue="138" />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input type="text" defaultValue="Ethiopia" />
                </div>
              </div>
            </div>

            <div className="settings-group">
              <h3>Security</h3>
              <button className="btn-secondary">Change Password</button>
              <button className="btn-secondary">Enable Two-Factor Authentication</button>
              <button className="btn-secondary">View Login History</button>
            </div>
          </div>
        )}
      </div>

      <div className="settings-footer">
        <button className="btn-primary">Save Changes</button>
        <button className="btn-secondary">Reset to Default</button>
      </div>
    </div>
  );
};

export default Settings;
