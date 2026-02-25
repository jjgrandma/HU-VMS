// src/pages/driver/components/QuickActions.jsx
import React, { useState } from 'react';

const QuickActions = ({ 
  onReportIssue, 
  onRequestMaintenance, 
  onLogFuel, 
  onViewTrips 
}) => {
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [fuelAmount, setFuelAmount] = useState('');
  const [fuelCost, setFuelCost] = useState('');

  const actions = [
    {
      id: 1,
      name: 'Start Trip',
      icon: '🚀',
      color: '#4caf50',
      action: () => console.log('Start trip clicked')
    },
    {
      id: 2,
      name: 'Report Issue',
      icon: '⚠️',
      color: '#ff9800',
      action: onReportIssue || (() => console.log('Report issue clicked'))
    },
    {
      id: 3,
      name: 'Contact Dispatch',
      icon: '📞',
      color: '#2196f3',
      action: () => window.location.href = 'tel:+1234567890'
    },
    {
      id: 4,
      name: 'Take Break',
      icon: '☕',
      color: '#9c27b0',
      action: () => console.log('Take break clicked')
    },
    {
      id: 5,
      name: 'Log Fuel',
      icon: '⛽',
      color: '#795548',
      action: () => setShowFuelModal(true)
    },
    {
      id: 6,
      name: 'View Trips',
      icon: '📋',
      color: '#607d8b',
      action: onViewTrips || (() => console.log('View trips clicked'))
    },
    {
      id: 7,
      name: 'Request Maintenance',
      icon: '🔧',
      color: '#e91e63',
      action: onRequestMaintenance || (() => console.log('Maintenance requested'))
    },
    {
      id: 8,
      name: 'Earnings',
      icon: '💰',
      color: '#009688',
      action: () => console.log('View earnings clicked')
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
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          {actions.map(action => (
            <button
              key={action.id}
              className="action-btn"
              style={{ '--action-color': action.color }}
              onClick={action.action}
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-name">{action.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fuel Log Modal */}
      {showFuelModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Log Fuel</h3>
            <form onSubmit={handleFuelSubmit}>
              <div className="form-group">
                <label>Fuel Amount (liters)</label>
                <input
                  type="number"
                  step="0.1"
                  value={fuelAmount}
                  onChange={(e) => setFuelAmount(e.target.value)}
                  required
                  placeholder="e.g., 45.5"
                />
              </div>
              <div className="form-group">
                <label>Total Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={fuelCost}
                  onChange={(e) => setFuelCost(e.target.value)}
                  required
                  placeholder="e.g., 85.50"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Submit</button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowFuelModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActions;