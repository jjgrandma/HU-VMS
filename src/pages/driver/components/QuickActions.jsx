// src/pages/driver/components/QuickActions.jsx
import React, { useState } from 'react';

const QuickActions = () => {
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [fuelAmount, setFuelAmount] = useState('');
  const [fuelCost, setFuelCost] = useState('');

  const actions = [
    {
      id: 1,
      name: 'Start Trip',
      icon: '🚀',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      action: () => console.log('Start trip')
    },
    {
      id: 2,
      name: 'Report Issue',
      icon: '⚠️',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      action: () => console.log('Report issue')
    },
    {
      id: 3,
      name: 'Contact Dispatch',
      icon: '📞',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      action: () => setShowContactModal(true)
    },
    {
      id: 4,
      name: 'Take Break',
      icon: '☕',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      action: () => console.log('Take break')
    },
    {
      id: 5,
      name: 'Log Fuel',
      icon: '⛽',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      action: () => setShowFuelModal(true)
    },
    {
      id: 6,
      name: 'View Earnings',
      icon: '💰',
      gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      action: () => console.log('View earnings')
    }
  ];

  const handleFuelSubmit = (e) => {
    e.preventDefault();
    console.log('Fuel logged:', { amount: fuelAmount, cost: fuelCost });
    setShowFuelModal(false);
    setFuelAmount('');
    setFuelCost('');
    alert('Fuel logged successfully!');
  };

  return (
    <>
      <div className="quick-actions-card glass-effect">
        <h3>
          <span className="header-icon">⚡</span>
          Quick Actions
        </h3>
        <div className="actions-grid">
          {actions.map(action => (
            <button
              key={action.id}
              className="action-button"
              style={{ background: action.gradient }}
              onClick={action.action}
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-name">{action.name}</span>
              <span className="action-shine"></span>
            </button>
          ))}
        </div>
      </div>

      {/* Fuel Modal */}
      {showFuelModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-effect">
            <div className="modal-header">
              <h3>⛽ Log Fuel</h3>
              <button className="modal-close" onClick={() => setShowFuelModal(false)}>✕</button>
            </div>
            <form onSubmit={handleFuelSubmit}>
              <div className="form-group">
                <label>Fuel Amount (liters)</label>
                <input
                  type="number"
                  step="0.1"
                  value={fuelAmount}
                  onChange={(e) => setFuelAmount(e.target.value)}
                  placeholder="e.g., 45.5"
                  required
                />
              </div>
              <div className="form-group">
                <label>Total Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={fuelCost}
                  onChange={(e) => setFuelCost(e.target.value)}
                  placeholder="e.g., 85.50"
                  required
                />
              </div>
              <div className="form-group">
                <label>Fuel Type</label>
                <select className="fuel-select">
                  <option value="regular">Regular</option>
                  <option value="premium">Premium</option>
                  <option value="diesel">Diesel</option>
                </select>
              </div>
              <button type="submit" className="modal-submit">Save Fuel Log</button>
            </form>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-effect">
            <div className="modal-header">
              <h3>📞 Contact Dispatch</h3>
              <button className="modal-close" onClick={() => setShowContactModal(false)}>✕</button>
            </div>
            <div className="contact-options">
              <button className="contact-option" onClick={() => window.location.href = 'tel:+1234567890'}>
                <span className="contact-icon">📱</span>
                <div>
                  <strong>Call Now</strong>
                  <p>+1 (234) 567-890</p>
                </div>
              </button>
              <button className="contact-option" onClick={() => window.location.href = 'sms:+1234567890'}>
                <span className="contact-icon">💬</span>
                <div>
                  <strong>Text Message</strong>
                  <p>Send a quick message</p>
                </div>
              </button>
              <button className="contact-option">
                <span className="contact-icon">📧</span>
                <div>
                  <strong>Email</strong>
                  <p>dispatch@company.com</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActions; // ← MAKE SURE THIS IS HERE!