// src/pages/driver/components/EarningsCard.jsx
import React from 'react';

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
    <div className={`earnings-card ${fullView ? 'full-view' : ''} glass-effect`}>
      <div className="card-header">
        <h3>
          <span className="header-icon">💰</span>
          Earnings Overview
        </h3>
        {!fullView && <button className="view-all-btn">View All →</button>}
      </div>

      <div className="earnings-grid">
        <div className="earning-item highlight">
          <span className="earning-label">Today</span>
          <span className="earning-value">${earningsData.today.toFixed(2)}</span>
          <span className="earning-trend positive">+12%</span>
        </div>
        <div className="earning-item">
          <span className="earning-label">This Week</span>
          <span className="earning-value">${earningsData.week.toFixed(2)}</span>
        </div>
        <div className="earning-item">
          <span className="earning-label">This Month</span>
          <span className="earning-value">${earningsData.month.toFixed(2)}</span>
        </div>
        <div className="earning-item">
          <span className="earning-label">Total</span>
          <span className="earning-value">${earningsData.total.toFixed(2)}</span>
        </div>
      </div>

      {!fullView && (
        <div className="mini-chart">
          {earningsData.chart.map((value, index) => (
            <div key={index} className="chart-bar" style={{ height: `${value}px` }}>
              <div className="bar-fill" style={{ height: `${value}px` }}></div>
            </div>
          ))}
        </div>
      )}

      {fullView && (
        <div className="earnings-details">
          <div className="detail-row">
            <span>Trips Today</span>
            <span className="detail-value">{earningsData.tripsToday}</span>
          </div>
          <div className="detail-row">
            <span>Tips Today</span>
            <span className="detail-value">${earningsData.tipsToday.toFixed(2)}</span>
          </div>
          <div className="detail-row">
            <span>Hourly Rate</span>
            <span className="detail-value">${earningsData.hourly}/hr</span>
          </div>
          <div className="detail-row">
            <span>Next Payout</span>
            <span className="detail-value">Tomorrow</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsCard; // ← THIS MUST BE AT THE END!