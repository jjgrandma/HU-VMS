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

  const styles = {
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      marginBottom: '20px',
      width: fullView ? '100%' : 'auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    title: {
      fontSize: '18px',
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    viewAllBtn: {
      background: 'none',
      border: 'none',
      color: '#0D8F81',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      padding: '4px 8px',
      borderRadius: '4px'
    },
    earningsGrid: {
      display: 'grid',
      gridTemplateColumns: fullView ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
      gap: '16px',
      marginBottom: '20px'
    },
    earningItem: {
      padding: '12px',
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      border: '1px solid #e2e8f0'
    },
    earningItemHighlight: {
      padding: '12px',
      backgroundColor: '#f0fdf9',
      borderRadius: '12px',
      border: '1px solid #0D8F81'
    },
    earningLabel: {
      fontSize: '12px',
      color: '#64748b',
      display: 'block',
      marginBottom: '4px'
    },
    earningValue: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1e293b',
      display: 'block',
      marginBottom: '2px'
    },
    earningTrend: {
      fontSize: '11px',
      fontWeight: '500',
      padding: '2px 6px',
      borderRadius: '12px',
      display: 'inline-block'
    },
    trendPositive: {
      backgroundColor: '#10b98120',
      color: '#10b981'
    },
    miniChart: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '4px',
      height: '60px',
      marginTop: '16px',
      padding: '8px 0'
    },
    chartBar: {
      flex: 1,
      backgroundColor: '#e2e8f0',
      borderRadius: '4px',
      height: '100%',
      position: 'relative'
    },
    barFill: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      backgroundColor: '#0D8F81',
      borderRadius: '4px'
    },
    earningsDetails: {
      marginTop: '20px',
      padding: '16px',
      backgroundColor: '#f8fafc',
      borderRadius: '12px'
    },
    detailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid #e2e8f0'
    },
    detailValue: {
      fontWeight: '600',
      color: '#1e293b'
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          <span>💰</span>
          Earnings Overview
        </h3>
        {!fullView && (
          <button 
            style={styles.viewAllBtn}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdf9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            View All →
          </button>
        )}
      </div>

      <div style={styles.earningsGrid}>
        <div style={styles.earningItemHighlight}>
          <span style={styles.earningLabel}>Today</span>
          <span style={styles.earningValue}>${earningsData.today.toFixed(2)}</span>
          <span style={{...styles.earningTrend, ...styles.trendPositive}}>+12%</span>
        </div>
        <div style={styles.earningItem}>
          <span style={styles.earningLabel}>This Week</span>
          <span style={styles.earningValue}>${earningsData.week.toFixed(2)}</span>
        </div>
        <div style={styles.earningItem}>
          <span style={styles.earningLabel}>This Month</span>
          <span style={styles.earningValue}>${earningsData.month.toFixed(2)}</span>
        </div>
        <div style={styles.earningItem}>
          <span style={styles.earningLabel}>Total</span>
          <span style={styles.earningValue}>${earningsData.total.toFixed(2)}</span>
        </div>
      </div>

      {!fullView && (
        <div style={styles.miniChart}>
          {earningsData.chart.map((value, index) => (
            <div key={index} style={styles.chartBar}>
              <div style={{
                ...styles.barFill,
                height: `${value}px`
              }}></div>
            </div>
          ))}
        </div>
      )}

      {fullView && (
        <div style={styles.earningsDetails}>
          <div style={styles.detailRow}>
            <span>Trips Today</span>
            <span style={styles.detailValue}>{earningsData.tripsToday}</span>
          </div>
          <div style={styles.detailRow}>
            <span>Tips Today</span>
            <span style={styles.detailValue}>${earningsData.tipsToday.toFixed(2)}</span>
          </div>
          <div style={styles.detailRow}>
            <span>Hourly Rate</span>
            <span style={styles.detailValue}>${earningsData.hourly}/hr</span>
          </div>
          <div style={styles.detailRow}>
            <span>Next Payout</span>
            <span style={styles.detailValue}>Tomorrow</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsCard;