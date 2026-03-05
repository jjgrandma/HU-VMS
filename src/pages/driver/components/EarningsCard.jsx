// src/pages/driver/components/EarningsCard.jsx
import React from 'react';
import './EarningsCard.css';

const EarningsCard = ({ earnings, fullView = false }) => {
  const earningsData = earnings || {
    today: 125.50,
    week: 875.25,
    month: 3450.75,
    total: 12450.50,
    tripsToday: 8,
    tipsToday: 32.50,
    hourly: 18.75,
    chart: [45, 52, 38, 45, 65, 58, 72]
  };

  return (
    <div className={`earnings-card ${fullView ? 'earnings-card-full' : ''}`}>
      <div className="earnings-header">
        <h3 className="earnings-title">
          <span className="earnings-title-icon">💰</span>
          Earnings Overview
        </h3>
        {!fullView && (
          <button className="earnings-view-btn">
            View All <span className="earnings-view-arrow">→</span>
          </button>
        )}
      </div>

      <div className="earnings-grid">
        <div className="earnings-item earnings-item-highlight">
          <span className="earnings-label">Today</span>
          <span className="earnings-value">${earningsData.today.toFixed(2)}</span>
          <span className="earnings-trend earnings-trend-positive">+12%</span>
        </div>
        <div className="earnings-item">
          <span className="earnings-label">This Week</span>
          <span className="earnings-value">${earningsData.week.toFixed(2)}</span>
        </div>
        <div className="earnings-item">
          <span className="earnings-label">This Month</span>
          <span className="earnings-value">${earningsData.month.toFixed(2)}</span>
        </div>
        <div className="earnings-item">
          <span className="earnings-label">Total</span>
          <span className="earnings-value">${earningsData.total.toFixed(2)}</span>
        </div>
      </div>

      {!fullView && (
        <div className="earnings-chart">
          {earningsData.chart.map((value, index) => (
            <div key={index} className="earnings-chart-bar">
              <div 
                className="earnings-bar-fill"
                style={{ height: `${value}px` }}
              ></div>
            </div>
          ))}
        </div>
      )}

      {fullView && (
        <div className="earnings-details">
          <div className="earnings-detail-row">
            <span className="earnings-detail-label">Trips Today</span>
            <span className="earnings-detail-value">{earningsData.tripsToday}</span>
          </div>
          <div className="earnings-detail-row">
            <span className="earnings-detail-label">Tips Today</span>
            <span className="earnings-detail-value">${earningsData.tipsToday.toFixed(2)}</span>
          </div>
          <div className="earnings-detail-row">
            <span className="earnings-detail-label">Hourly Rate</span>
            <span className="earnings-detail-value">${earningsData.hourly}/hr</span>
          </div>
          <div className="earnings-detail-row">
            <span className="earnings-detail-label">Next Payout</span>
            <span className="earnings-detail-value earnings-payout-badge">Tomorrow</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsCard;