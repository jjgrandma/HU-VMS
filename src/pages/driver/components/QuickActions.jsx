// src/pages/driver/components/QuickActions.jsx
import React, { useState } from 'react';

const QuickActions = ({ onActionComplete }) => {
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(null);
  
  // Form states
  const [fuelAmount, setFuelAmount] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [fuelType, setFuelType] = useState('regular');
  const [fuelLocation, setFuelLocation] = useState('');
  const [fuelOdometer, setFuelOdometer] = useState('');
  
  const [breakDuration, setBreakDuration] = useState('15');
  const [breakReason, setBreakReason] = useState('');
  
  const [reportType, setReportType] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportUrgency, setReportUrgency] = useState('medium');
  
  const [tripStatus, setTripStatus] = useState('ready');
  const [tripNotes, setTripNotes] = useState('');

  const actions = [
    {
      id: 1,
      name: 'Start Trip',
      icon: '🚀',
      gradient: 'linear-gradient(145deg, #4158D0, #C850C0)',
      shadow: '0 10px 20px rgba(65, 88, 208, 0.3)',
      description: 'Begin your assigned trip',
      action: () => setShowTripModal(true)
    },
    {
      id: 2,
      name: 'Report Issue',
      icon: '⚠️',
      gradient: 'linear-gradient(145deg, #FF512F, #DD2476)',
      shadow: '0 10px 20px rgba(255, 81, 47, 0.3)',
      description: 'Report vehicle or trip issues',
      action: () => setShowReportModal(true)
    },
    {
      id: 3,
      name: 'Contact Dispatch',
      icon: '📞',
      gradient: 'linear-gradient(145deg, #00B4DB, #0083B0)',
      shadow: '0 10px 20px rgba(0, 180, 219, 0.3)',
      description: 'Call or message dispatch',
      action: () => setShowContactModal(true)
    },
    {
      id: 4,
      name: 'Take Break',
      icon: '☕',
      gradient: 'linear-gradient(145deg, #FDC830, #F37335)',
      shadow: '0 10px 20px rgba(253, 200, 48, 0.3)',
      description: 'Start your break time',
      action: () => setShowBreakModal(true)
    },
    {
      id: 5,
      name: 'Log Fuel',
      icon: '⛽',
      gradient: 'linear-gradient(145deg, #11998e, #38ef7d)',
      shadow: '0 10px 20px rgba(17, 153, 142, 0.3)',
      description: 'Record fuel purchase',
      action: () => setShowFuelModal(true)
    },
    {
      id: 6,
      name: 'View Earnings',
      icon: '💰',
      gradient: 'linear-gradient(145deg, #834d9b, #d04ed6)',
      shadow: '0 10px 20px rgba(131, 77, 155, 0.3)',
      description: 'Check your earnings',
      action: () => setShowEarningsModal(true)
    }
  ];

  const showSuccessMessage = (type, message) => {
    setShowSuccess({ type, message });
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const handleFuelSubmit = (e) => {
    e.preventDefault();
    const fuelData = {
      amount: parseFloat(fuelAmount),
      cost: parseFloat(fuelCost),
      type: fuelType,
      location: fuelLocation,
      odometer: fuelOdometer,
      timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    const fuelHistory = JSON.parse(localStorage.getItem('fuelHistory') || '[]');
    fuelHistory.push(fuelData);
    localStorage.setItem('fuelHistory', JSON.stringify(fuelHistory));
    
    setShowFuelModal(false);
    setFuelAmount('');
    setFuelCost('');
    setFuelLocation('');
    setFuelOdometer('');
    
    showSuccessMessage('fuel', '✅ Fuel logged successfully!');
    if (onActionComplete) onActionComplete('fuel', fuelData);
  };

  const handleBreakSubmit = (e) => {
    e.preventDefault();
    const breakData = {
      duration: parseInt(breakDuration),
      reason: breakReason,
      startTime: new Date().toISOString()
    };
    
    setShowBreakModal(false);
    setBreakReason('');
    
    showSuccessMessage('break', '☕ Break started! Take your time.');
    if (onActionComplete) onActionComplete('break', breakData);
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    const reportData = {
      type: reportType,
      description: reportDescription,
      urgency: reportUrgency,
      timestamp: new Date().toISOString()
    };
    
    setShowReportModal(false);
    setReportType('');
    setReportDescription('');
    
    showSuccessMessage('report', '📝 Issue reported. Dispatch notified.');
    if (onActionComplete) onActionComplete('report', reportData);
  };

  const handleTripStart = (e) => {
    e.preventDefault();
    const tripData = {
      status: tripStatus,
      notes: tripNotes,
      startTime: new Date().toISOString()
    };
    
    setShowTripModal(false);
    setTripNotes('');
    
    showSuccessMessage('trip', '🚀 Trip started! Safe driving!');
    if (onActionComplete) onActionComplete('trip', tripData);
  };

  const handleContact = (method, number) => {
    if (method === 'call') window.location.href = `tel:${number}`;
    else if (method === 'sms') window.location.href = `sms:${number}`;
    else if (method === 'email') window.location.href = `mailto:${number}`;
    else if (method === 'chat') window.open('https://chat.company.com', '_blank');
    setShowContactModal(false);
  };

  const styles = {
    // Main Card
    card: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '32px',
      padding: '28px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 2px rgba(255,255,255,0.5)',
      border: '1px solid rgba(255,255,255,0.3)',
      marginBottom: '24px',
      position: 'relative',
      overflow: 'hidden'
    },
    // Decorative Elements
    cardGlow: {
      position: 'absolute',
      top: '-50%',
      right: '-50%',
      width: '200%',
      height: '200%',
      background: 'radial-gradient(circle, rgba(13,143,129,0.03) 0%, transparent 70%)',
      animation: 'rotate 20s linear infinite',
      pointerEvents: 'none'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      marginBottom: '28px',
      position: 'relative'
    },
    headerIcon: {
      fontSize: '32px',
      background: 'linear-gradient(145deg, #0D8F81, #0b7a6e)',
      width: '56px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '20px',
      boxShadow: '0 10px 20px rgba(13,143,129,0.3), inset 0 -2px 4px rgba(0,0,0,0.1)',
      color: 'white'
    },
    headerTitle: {
      fontSize: '26px',
      fontWeight: '700',
      background: 'linear-gradient(145deg, #1e293b, #0f172a)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: 0
    },
    headerSubtitle: {
      fontSize: '14px',
      color: '#64748b',
      marginTop: '4px'
    },
    actionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '16px',
      position: 'relative'
    },
    actionButton: {
      border: 'none',
      borderRadius: '24px',
      padding: '20px 16px',
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
      border: '1px solid rgba(255,255,255,0.2)',
      backdropFilter: 'blur(5px)'
    },
    actionIcon: {
      fontSize: '40px',
      filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))',
      animation: 'float 3s ease-in-out infinite'
    },
    actionName: {
      fontSize: '16px',
      fontWeight: '600',
      letterSpacing: '0.5px',
      textShadow: '0 2px 4px rgba(0,0,0,0.2)'
    },
    actionDescription: {
      fontSize: '11px',
      opacity: 0.9,
      textAlign: 'center',
      lineHeight: '1.4',
      maxWidth: '120px'
    },
    actionShine: {
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
      transition: 'left 0.5s'
    },
    actionParticles: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
      opacity: 0,
      transition: 'opacity 0.3s'
    },
    // Success Toast
    successToast: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'linear-gradient(145deg, #0D8F81, #0b7a6e)',
      color: 'white',
      padding: '16px 24px',
      borderRadius: '50px',
      boxShadow: '0 20px 40px rgba(13,143,129,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 2000,
      animation: 'slideIn 0.5s ease-out',
      border: '1px solid rgba(255,255,255,0.2)',
      backdropFilter: 'blur(10px)'
    },
    // Modal Overlay
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease-out'
    },
    modalContent: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '40px',
      padding: '32px',
      width: '90%',
      maxWidth: '550px',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 40px 80px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.5)',
      border: '1px solid rgba(255,255,255,0.3)',
      animation: 'scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '28px',
      paddingBottom: '16px',
      borderBottom: '2px solid rgba(13,143,129,0.1)'
    },
    modalTitle: {
      fontSize: '28px',
      fontWeight: '700',
      background: 'linear-gradient(145deg, #0D8F81, #0b7a6e)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    modalClose: {
      background: 'rgba(0,0,0,0.05)',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#64748b',
      width: '44px',
      height: '44px',
      borderRadius: '22px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s'
    },
    formGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '8px',
      letterSpacing: '0.5px'
    },
    input: {
      width: '100%',
      padding: '14px 18px',
      border: '2px solid rgba(226, 232, 240, 0.6)',
      borderRadius: '20px',
      fontSize: '15px',
      outline: 'none',
      transition: 'all 0.3s',
      background: 'rgba(255,255,255,0.9)',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
    },
    select: {
      width: '100%',
      padding: '14px 18px',
      border: '2px solid rgba(226, 232, 240, 0.6)',
      borderRadius: '20px',
      fontSize: '15px',
      outline: 'none',
      background: 'rgba(255,255,255,0.9)',
      cursor: 'pointer'
    },
    textarea: {
      width: '100%',
      padding: '14px 18px',
      border: '2px solid rgba(226, 232, 240, 0.6)',
      borderRadius: '20px',
      fontSize: '15px',
      outline: 'none',
      minHeight: '100px',
      resize: 'vertical',
      background: 'rgba(255,255,255,0.9)'
    },
    submitButton: {
      width: '100%',
      padding: '16px',
      background: 'linear-gradient(145deg, #0D8F81, #0b7a6e)',
      color: 'white',
      border: 'none',
      borderRadius: '30px',
      fontSize: '18px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      marginTop: '16px',
      boxShadow: '0 10px 20px rgba(13,143,129,0.3)',
      border: '1px solid rgba(255,255,255,0.2)',
      letterSpacing: '0.5px'
    },
    // Contact Options
    contactOptions: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    contactOption: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      padding: '20px',
      background: 'linear-gradient(145deg, #f8fafc, #f1f5f9)',
      border: '2px solid rgba(255,255,255,0.5)',
      borderRadius: '30px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      textAlign: 'left',
      width: '100%',
      boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
    },
    contactIcon: {
      fontSize: '36px',
      width: '64px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(145deg, #0D8F81, #0b7a6e)',
      color: 'white',
      borderRadius: '20px',
      boxShadow: '0 10px 20px rgba(13,143,129,0.3)'
    },
    contactInfo: {
      flex: 1
    },
    contactName: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '4px'
    },
    contactDetail: {
      fontSize: '14px',
      color: '#64748b'
    },
    // Break Options
    breakOptions: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '12px',
      marginBottom: '16px'
    },
    breakOption: {
      padding: '16px 8px',
      background: 'linear-gradient(145deg, #f8fafc, #f1f5f9)',
      border: '2px solid rgba(255,255,255,0.5)',
      borderRadius: '20px',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.3s',
      fontWeight: '600',
      color: '#1e293b',
      boxShadow: '0 5px 10px rgba(0,0,0,0.05)'
    },
    breakOptionSelected: {
      background: 'linear-gradient(145deg, #0D8F81, #0b7a6e)',
      borderColor: 'transparent',
      color: 'white',
      boxShadow: '0 10px 20px rgba(13,143,129,0.3)',
      transform: 'scale(1.05)'
    },
    // Urgency Badges
    urgencyContainer: {
      display: 'flex',
      gap: '12px',
      marginTop: '8px'
    },
    urgencyBadge: {
      flex: 1,
      padding: '12px',
      borderRadius: '16px',
      fontSize: '14px',
      fontWeight: '600',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s',
      border: '2px solid transparent',
      letterSpacing: '0.5px'
    },
    // Earnings Preview
    earningsPreview: {
      textAlign: 'center',
      padding: '20px',
      background: 'linear-gradient(145deg, #f8fafc, #f1f5f9)',
      borderRadius: '30px'
    },
    earningsAmount: {
      fontSize: '64px',
      fontWeight: '800',
      background: 'linear-gradient(145deg, #0D8F81, #0b7a6e)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '8px',
      lineHeight: 1
    },
    earningsLabel: {
      fontSize: '16px',
      color: '#64748b',
      marginBottom: '24px'
    },
    earningsDetails: {
      textAlign: 'left',
      padding: '16px',
      background: 'white',
      borderRadius: '20px',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
    },
    earningsRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid rgba(226, 232, 240, 0.5)'
    },
    earningsRowLast: {
      borderBottom: 'none'
    },
    earningsKey: {
      color: '#64748b',
      fontSize: '15px'
    },
    earningsValue: {
      fontWeight: '700',
      color: '#1e293b',
      fontSize: '16px'
    }
  };

  const urgencyColors = {
    low: { bg: '#e8f5e8', color: '#2e7d32', gradient: 'linear-gradient(145deg, #e8f5e8, #c8e6c9)' },
    medium: { bg: '#fff3e0', color: '#f57c00', gradient: 'linear-gradient(145deg, #fff3e0, #ffe0b2)' },
    high: { bg: '#ffebee', color: '#c62828', gradient: 'linear-gradient(145deg, #ffebee, #ffcdd2)' }
  };

  return (
    <>
      {/* Global Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

      {/* Success Toast */}
      {showSuccess && (
        <div style={styles.successToast}>
          <span style={{ fontSize: '24px' }}>{showSuccess.type === 'fuel' ? '⛽' : 
            showSuccess.type === 'break' ? '☕' : 
            showSuccess.type === 'report' ? '📝' : 
            showSuccess.type === 'trip' ? '🚀' : '✅'}</span>
          <span>{showSuccess.message}</span>
        </div>
      )}

      {/* Main Card */}
      <div style={styles.card}>
        <div style={styles.cardGlow}></div>
        <div style={styles.header}>
          <div style={styles.headerIcon}>⚡</div>
          <div>
            <h3 style={styles.headerTitle}>Quick Actions</h3>
            <div style={styles.headerSubtitle}>What would you like to do?</div>
          </div>
        </div>
        
        <div style={styles.actionsGrid}>
          {actions.map(action => (
            <button
              key={action.id}
              style={{
                ...styles.actionButton,
                background: action.gradient,
                boxShadow: action.shadow
              }}
              onClick={action.action}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = action.shadow.replace('0 10px', '0 20px');
                e.currentTarget.querySelector('.shine').style.left = '100%';
                e.currentTarget.querySelector('.particles').style.opacity = 1;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = action.shadow;
                e.currentTarget.querySelector('.shine').style.left = '-100%';
                e.currentTarget.querySelector('.particles').style.opacity = 0;
              }}
            >
              <span className="particles" style={styles.actionParticles}></span>
              <span className="shine" style={styles.actionShine}></span>
              <span style={styles.actionIcon}>{action.icon}</span>
              <span style={styles.actionName}>{action.name}</span>
              <span style={styles.actionDescription}>{action.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fuel Modal */}
      {showFuelModal && (
        <div style={styles.modalOverlay} onClick={() => setShowFuelModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                <span style={{ fontSize: '32px' }}>⛽</span> Log Fuel
              </h3>
              <button 
                style={styles.modalClose}
                onClick={() => setShowFuelModal(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(13,143,129,0.1)';
                  e.currentTarget.style.color = '#0D8F81';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleFuelSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Fuel Amount (liters)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={fuelAmount}
                  onChange={(e) => setFuelAmount(e.target.value)}
                  placeholder="e.g., 45.5"
                  required
                  style={styles.input}
                  onFocus={(e) => e.target.style.borderColor = '#0D8F81'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(226, 232, 240, 0.6)'}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Total Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={fuelCost}
                  onChange={(e) => setFuelCost(e.target.value)}
                  placeholder="e.g., 85.50"
                  required
                  style={styles.input}
                  onFocus={(e) => e.target.style.borderColor = '#0D8F81'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(226, 232, 240, 0.6)'}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Fuel Type</label>
                <select 
                  style={styles.select}
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = '#0D8F81'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(226, 232, 240, 0.6)'}
                >
                  <option value="regular">Regular ⛽</option>
                  <option value="premium">Premium ⛽</option>
                  <option value="diesel">Diesel ⛽</option>
                  <option value="electric">Electric ⚡</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Location/Station</label>
                <input
                  type="text"
                  value={fuelLocation}
                  onChange={(e) => setFuelLocation(e.target.value)}
                  placeholder="Gas station name"
                  style={styles.input}
                  onFocus={(e) => e.target.style.borderColor = '#0D8F81'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(226, 232, 240, 0.6)'}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Odometer Reading</label>
                <input
                  type="number"
                  value={fuelOdometer}
                  onChange={(e) => setFuelOdometer(e.target.value)}
                  placeholder="Current mileage"
                  style={styles.input}
                  onFocus={(e) => e.target.style.borderColor = '#0D8F81'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(226, 232, 240, 0.6)'}
                />
              </div>
              <button 
                type="submit" 
                style={styles.submitButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 20px 30px rgba(13,143,129,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(13,143,129,0.3)';
                }}
              >
                Save Fuel Log
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div style={styles.modalOverlay} onClick={() => setShowContactModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                <span style={{ fontSize: '32px' }}>📞</span> Contact Dispatch
              </h3>
              <button 
                style={styles.modalClose}
                onClick={() => setShowContactModal(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(13,143,129,0.1)';
                  e.currentTarget.style.color = '#0D8F81';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                ✕
              </button>
            </div>
            <div style={styles.contactOptions}>
              <button 
                style={styles.contactOption}
                onClick={() => handleContact('call', '+1234567890')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 30px rgba(13,143,129,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';
                }}
              >
                <span style={styles.contactIcon}>📱</span>
                <div style={styles.contactInfo}>
                  <div style={styles.contactName}>Call Now</div>
                  <div style={styles.contactDetail}>+1 (234) 567-890</div>
                </div>
              </button>
              <button 
                style={styles.contactOption}
                onClick={() => handleContact('sms', '+1234567890')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 30px rgba(13,143,129,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';
                }}
              >
                <span style={styles.contactIcon}>💬</span>
                <div style={styles.contactInfo}>
                  <div style={styles.contactName}>Text Message</div>
                  <div style={styles.contactDetail}>Send a quick message</div>
                </div>
              </button>
              <button 
                style={styles.contactOption}
                onClick={() => handleContact('email', 'dispatch@company.com')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 30px rgba(13,143,129,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';
                }}
              >
                <span style={styles.contactIcon}>📧</span>
                <div style={styles.contactInfo}>
                  <div style={styles.contactName}>Email</div>
                  <div style={styles.contactDetail}>dispatch@company.com</div>
                </div>
              </button>
              <button 
                style={styles.contactOption}
                onClick={() => handleContact('chat', '')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 30px rgba(13,143,129,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';
                }}
              >
                <span style={styles.contactIcon}>💭</span>
                <div style={styles.contactInfo}>
                  <div style={styles.contactName}>Live Chat</div>
                  <div style={styles.contactDetail}>Chat with dispatch online</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Break Modal */}
      {showBreakModal && (
        <div style={styles.modalOverlay} onClick={() => setShowBreakModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                <span style={{ fontSize: '32px' }}>☕</span> Take a Break
              </h3>
              <button 
                style={styles.modalClose}
                onClick={() => setShowBreakModal(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(13,143,129,0.1)';
                  e.currentTarget.style.color = '#0D8F81';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleBreakSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Break Duration</label>
                <div style={styles.breakOptions}>
                  {['15', '30', '45', '60'].map(min => (
                    <div
                      key={min}
                      style={{
                        ...styles.breakOption,
                        ...(breakDuration === min ? styles.breakOptionSelected : {})
                      }}
                      onClick={() => setBreakDuration(min)}
                      onMouseEnter={(e) => {
                        if (breakDuration !== min) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (breakDuration !== min) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 5px 10px rgba(0,0,0,0.05)';
                        }
                      }}
                    >
                      {min} min
                    </div>
                  ))}
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Reason (optional)</label>
                <select 
                  style={styles.select}
                  value={breakReason}
                  onChange={(e) => setBreakReason(e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = '#0D8F81'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(226, 232, 240, 0.6)'}
                >
                  <option value="">Select reason</option>
                  <option value="lunch">🍱 Lunch break</option>
                  <option value="rest">😴 Rest break</option>
                  <option value="personal">👤 Personal time</option>
                  <option value="waiting">⏳ Waiting for next trip</option>
                </select>
              </div>
              <button 
                type="submit" 
                style={styles.submitButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 20px 30px rgba(13,143,129,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(13,143,129,0.3)';
                }}
              >
                Start Break
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div style={styles.modalOverlay} onClick={() => setShowReportModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                <span style={{ fontSize: '32px' }}>⚠️</span> Report Issue
              </h3>
              <button 
                style={styles.modalClose}
                onClick={() => setShowReportModal(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(13,143,129,0.1)';
                  e.currentTarget.style.color = '#0D8F81';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleReportSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Issue Type</label>
                <select 
                  style={styles.select}
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  required
                  onFocus={(e) => e.target.style.borderColor = '#0D8F81'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(226, 232, 240, 0.6)'}
                >
                  <option value="">Select type</option>
                  <option value="vehicle">🚗 Vehicle Issue</option>
                  <option value="trip">📋 Trip Problem</option>
                  <option value="customer">👥 Customer Issue</option>
                  <option value="traffic">🚦 Traffic/Accident</option>
                  <option value="other">❓ Other</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Urgency</label>
                <div style={styles.urgencyContainer}>
                  {['low', 'medium', 'high'].map(level => (
                    <div
                      key={level}
                      style={{
                        ...styles.urgencyBadge,
                        background: urgencyColors[level].gradient,
                        color: urgencyColors[level].color,
                        border: reportUrgency === level ? `3px solid ${urgencyColors[level].color}` : '2px solid transparent',
                        transform: reportUrgency === level ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: reportUrgency === level ? `0 10px 20px ${urgencyColors[level].color}40` : 'none'
                      }}
                      onClick={() => setReportUrgency(level)}
                      onMouseEnter={(e) => {
                        if (reportUrgency !== level) {
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = `0 5px 10px ${urgencyColors[level].color}20`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (reportUrgency !== level) {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {level.toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  style={styles.textarea}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  required
                  onFocus={(e) => e.target.style.borderColor = '#0D8F81'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(226, 232, 240, 0.6)'}
                />
              </div>
              <button 
                type="submit" 
                style={styles.submitButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 20px 30px rgba(13,143,129,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(13,143,129,0.3)';
                }}
              >
                Submit Report
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Trip Modal */}
      {showTripModal && (
        <div style={styles.modalOverlay} onClick={() => setShowTripModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                <span style={{ fontSize: '32px' }}>🚀</span> Start Trip
              </h3>
              <button 
                style={styles.modalClose}
                onClick={() => setShowTripModal(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(13,143,129,0.1)';
                  e.currentTarget.style.color = '#0D8F81';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleTripStart}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Trip Status</label>
                <select 
                  style={styles.select}
                  value={tripStatus}
                  onChange={(e) => setTripStatus(e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = '#0D8F81'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(226, 232, 240, 0.6)'}
                >
                  <option value="ready">✅ Ready to start</option>
                  <option value="pickup">🚗 Heading to pickup</option>
                  <option value="passenger">👥 Passenger on board</option>
                  <option value="dropoff">📍 Heading to dropoff</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Trip Notes</label>
                <textarea
                  style={styles.textarea}
                  value={tripNotes}
                  onChange={(e) => setTripNotes(e.target.value)}
                  placeholder="Any special instructions or notes..."
                  onFocus={(e) => e.target.style.borderColor = '#0D8F81'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(226, 232, 240, 0.6)'}
                />
              </div>
              <button 
                type="submit" 
                style={styles.submitButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 20px 30px rgba(13,143,129,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(13,143,129,0.3)';
                }}
              >
                Start Trip
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Earnings Modal */}
      {showEarningsModal && (
        <div style={styles.modalOverlay} onClick={() => setShowEarningsModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                <span style={{ fontSize: '32px' }}>💰</span> Today's Earnings
              </h3>
              <button 
                style={styles.modalClose}
                onClick={() => setShowEarningsModal(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(13,143,129,0.1)';
                  e.currentTarget.style.color = '#0D8F81';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                ✕
              </button>
            </div>
            <div style={styles.earningsPreview}>
              <div style={styles.earningsAmount}>$125.50</div>
              <div style={styles.earningsLabel}>Today's total</div>
              
              <div style={styles.earningsDetails}>
                <div style={styles.earningsRow}>
                  <span style={styles.earningsKey}>Trips completed</span>
                  <span style={styles.earningsValue}>8</span>
                </div>
                <div style={styles.earningsRow}>
                  <span style={styles.earningsKey}>Tips received</span>
                  <span style={styles.earningsValue}>$32.50</span>
                </div>
                <div style={styles.earningsRow}>
                  <span style={styles.earningsKey}>Hourly rate</span>
                  <span style={styles.earningsValue}>$18.75/hr</span>
                </div>
                <div style={{...styles.earningsRow, ...styles.earningsRowLast}}>
                  <span style={styles.earningsKey}>Active time</span>
                  <span style={styles.earningsValue}>6h 45m</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  style={{
                    ...styles.submitButton,
                    marginTop: 0,
                    flex: 1,
                    background: 'linear-gradient(145deg, #f8fafc, #f1f5f9)',
                    color: '#1e293b',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 15px 25px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';
                  }}
                  onClick={() => {
                    setShowEarningsModal(false);
                    alert('Opening full earnings report...');
                  }}
                >
                  Full Report
                </button>
                <button 
                  style={{
                    ...styles.submitButton,
                    marginTop: 0,
                    flex: 1,
                    background: 'linear-gradient(145deg, #0D8F81, #0b7a6e)',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 20px 30px rgba(13,143,129,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(13,143,129,0.3)';
                  }}
                  onClick={() => {
                    setShowEarningsModal(false);
                    alert('Requesting payout...');
                  }}
                >
                  Request Payout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActions;