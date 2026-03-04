import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import './settings.css';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('appearance');

  const themes = [
    { id: 'dark', name: 'Dark', icon: '🌙', color: '#0f172a' },
    { id: 'light', name: 'Light', icon: '☀️', color: '#ffffff' },
    { id: 'colorful', name: 'Colorful', icon: '🎨', color: '#6366f1' }
  ];

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
            <p className="section-description">Manage your account information</p>
            
            <div className="settings-group">
              <h3>Profile Information</h3>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" defaultValue="Admin User" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" defaultValue="admin@example.com" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" defaultValue="+1234567890" />
              </div>
            </div>

            <div className="settings-group">
              <h3>Security</h3>
              <button className="btn-secondary">Change Password</button>
              <button className="btn-secondary">Enable Two-Factor Authentication</button>
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
