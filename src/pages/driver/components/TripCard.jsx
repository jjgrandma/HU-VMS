// src/pages/driver/components/TripCard.jsx
import React, { useState } from 'react';

const TripCard = ({ trip, compact = false, onStatusChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(trip?.status || 'scheduled');
  const [showDetails, setShowDetails] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Sample trip data with defaults
  const tripData = {
    id: trip?.id || 'TR-1234',
    date: trip?.date || 'Today, 10:30 AM',
    pickup: trip?.pickup || '123 Main Street, Downtown',
    dropoff: trip?.dropoff || 'International Airport, Terminal 2',
    pickupLat: trip?.pickupLat || '40.7128',
    pickupLng: trip?.pickupLng || '-74.0060',
    dropoffLat: trip?.dropoffLat || '40.7614',
    dropoffLng: trip?.dropoffLng || '-73.9776',
    distance: trip?.distance || '12.5',
    duration: trip?.duration || '25',
    earnings: trip?.earnings || '25.00',
    passenger: trip?.passenger || 'John Doe',
    passengerRating: trip?.passengerRating || '4.8',
    passengerImage: trip?.passengerImage || 'https://ui-avatars.com/api/?name=John+Doe&background=0D8F81&color=fff&size=40',
    vehicle: trip?.vehicle || 'Toyota Camry (ABC-123)',
    notes: trip?.notes || 'Please wait at the main entrance. Passenger has luggage.',
    ...trip
  };

  const getStatusConfig = (status) => {
    const configs = {
      scheduled: {
        bg: '#e3f2fd',
        color: '#1976d2',
        text: 'Scheduled',
        icon: '⏰',
        gradient: 'linear-gradient(145deg, #e3f2fd, #bbdefb)',
        shadow: '0 10px 20px rgba(25, 118, 210, 0.2)',
        nextAction: 'Start Trip',
        nextActionIcon: '🚀'
      },
      'in-progress': {
        bg: '#e8f5e8',
        color: '#2e7d32',
        text: 'In Progress',
        icon: '🔄',
        gradient: 'linear-gradient(145deg, #e8f5e8, #c8e6c9)',
        shadow: '0 10px 20px rgba(46, 125, 50, 0.2)',
        nextAction: 'Complete Trip',
        nextActionIcon: '✅'
      },
      completed: {
        bg: '#f3e5f5',
        color: '#7b1fa2',
        text: 'Completed',
        icon: '✓',
        gradient: 'linear-gradient(145deg, #f3e5f5, #e1bee7)',
        shadow: '0 10px 20px rgba(123, 31, 162, 0.2)',
        nextAction: 'View Summary',
        nextActionIcon: '📊'
      },
      cancelled: {
        bg: '#ffebee',
        color: '#c62828',
        text: 'Cancelled',
        icon: '✕',
        gradient: 'linear-gradient(145deg, #ffebee, #ffcdd2)',
        shadow: '0 10px 20px rgba(198, 40, 40, 0.2)',
        nextAction: 'Reschedule',
        nextActionIcon: '🔄'
      }
    };
    return configs[status] || configs.scheduled;
  };

  const statusConfig = getStatusConfig(status);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(tripData.id, newStatus);
    }
    // Show success message
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(145deg, #0D8F81, #0b7a6e);
      color: white;
      padding: 16px 24px;
      border-radius: 50px;
      box-shadow: 0 20px 40px rgba(13,143,129,0.3);
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
      display: flex;
      align-items: center;
      gap: 12px;
    `;
    message.innerHTML = `
      <span style="font-size: 20px;">✅</span>
      <span>Trip ${statusConfig.text.toLowerCase()} successfully!</span>
    `;
    document.body.appendChild(message);
    setTimeout(() => {
      message.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => document.body.removeChild(message), 300);
    }, 3000);
  };

  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins} min`;
  };

  const styles = {
    // Main Card
    card: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '32px',
      padding: compact ? '16px' : '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 2px rgba(255,255,255,0.5)',
      border: '1px solid rgba(255,255,255,0.3)',
      marginBottom: '16px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      cursor: compact ? 'pointer' : 'default'
    },
    // Compact Card Styles
    compactCard: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px'
    },
    compactTime: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1e293b',
      minWidth: '80px'
    },
    compactRoute: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      margin: '0 16px'
    },
    compactPickup: {
      fontSize: '14px',
      color: '#1e293b',
      fontWeight: '500'
    },
    compactArrow: {
      color: '#0D8F81',
      fontSize: '16px'
    },
    compactDropoff: {
      fontSize: '14px',
      color: '#64748b'
    },
    compactStatus: {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      whiteSpace: 'nowrap'
    },
    // Header
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: expanded ? '20px' : '0',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '16px',
      transition: 'background 0.3s'
    },
    tripInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    tripId: {
      fontSize: '16px',
      fontWeight: '700',
      background: 'linear-gradient(145deg, #1e293b, #0f172a)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    tripDate: {
      fontSize: '14px',
      color: '#64748b',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    statusBadge: {
      padding: '8px 16px',
      borderRadius: '30px',
      fontSize: '13px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
    },
    // Route
    route: {
      marginBottom: expanded ? '20px' : '0',
      position: 'relative'
    },
    routePoint: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '12px 0'
    },
    pointDot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      marginTop: '4px',
      position: 'relative',
      boxShadow: '0 0 0 3px rgba(0,0,0,0.05)'
    },
    pointDotGreen: {
      background: 'linear-gradient(145deg, #10b981, #059669)'
    },
    pointDotRed: {
      background: 'linear-gradient(145deg, #ef4444, #dc2626)'
    },
    pointDetails: {
      flex: 1
    },
    pointLabel: {
      fontSize: '11px',
      fontWeight: '600',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '2px'
    },
    pointAddress: {
      fontSize: '15px',
      fontWeight: '500',
      color: '#1e293b'
    },
    routeLine: {
      position: 'absolute',
      left: '5px',
      top: '30px',
      width: '2px',
      height: '50px',
      background: 'linear-gradient(to bottom, #10b981, #ef4444)',
      borderRadius: '1px'
    },
    // Details Grid
    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      marginBottom: '20px',
      padding: '20px',
      background: 'linear-gradient(145deg, #f8fafc, #f1f5f9)',
      borderRadius: '24px'
    },
    detailItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    detailLabel: {
      fontSize: '12px',
      color: '#64748b',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    detailValue: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#1e293b'
    },
    // Passenger Info
    passengerInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px',
      background: 'white',
      borderRadius: '20px',
      marginBottom: '20px',
      border: '1px solid #e2e8f0'
    },
    passengerImage: {
      width: '48px',
      height: '48px',
      borderRadius: '16px',
      objectFit: 'cover',
      border: '3px solid white',
      boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
    },
    passengerDetails: {
      flex: 1
    },
    passengerName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '2px'
    },
    passengerMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '13px',
      color: '#64748b'
    },
    passengerRating: {
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      color: '#f59e0b'
    },
    // Actions
    actions: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '12px',
      marginBottom: '20px'
    },
    actionButton: {
      padding: '14px',
      border: 'none',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
    },
    primaryButton: {
      background: 'linear-gradient(145deg, #0D8F81, #0b7a6e)',
      color: 'white',
      boxShadow: '0 10px 20px rgba(13,143,129,0.3)'
    },
    successButton: {
      background: 'linear-gradient(145deg, #10b981, #059669)',
      color: 'white',
      boxShadow: '0 10px 20px rgba(16,185,129,0.3)'
    },
    secondaryButton: {
      background: 'linear-gradient(145deg, #f8fafc, #f1f5f9)',
      color: '#1e293b',
      border: '1px solid #e2e8f0'
    },
    outlineButton: {
      background: 'transparent',
      color: '#64748b',
      border: '2px solid #e2e8f0'
    },
    // Map Preview
    mapPreview: {
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      marginTop: '16px',
      cursor: 'pointer',
      position: 'relative'
    },
    mapImage: {
      width: '100%',
      height: '150px',
      objectFit: 'cover',
      transition: 'transform 0.3s'
    },
    mapOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0,
      transition: 'opacity 0.3s'
    },
    // Notes
    notes: {
      padding: '16px',
      background: '#fff3e0',
      borderRadius: '16px',
      marginTop: '16px',
      fontSize: '14px',
      color: '#f57c00',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      border: '1px solid #ffe0b2'
    },
    // Expand Icon
    expandIcon: {
      fontSize: '20px',
      color: '#0D8F81',
      transition: 'transform 0.3s'
    }
  };

  // Add global animations
  const animations = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .trip-card {
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .trip-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.3);
    }
    .map-preview:hover img {
      transform: scale(1.05);
    }
    .map-preview:hover .map-overlay {
      opacity: 1;
    }
  `;

  if (compact) {
    return (
      <>
        <style>{animations}</style>
        <div 
          style={{...styles.card, ...styles.compactCard}}
          className="trip-card"
          onClick={() => setExpanded(!expanded)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 30px 60px -15px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
          }}
        >
          <div style={styles.compactTime}>{tripData.time || '10:30 AM'}</div>
          <div style={styles.compactRoute}>
            <span style={styles.compactPickup}>{tripData.pickup.split(',')[0]}</span>
            <span style={styles.compactArrow}>→</span>
            <span style={styles.compactDropoff}>{tripData.dropoff.split(',')[0]}</span>
          </div>
          <span style={{
            ...styles.compactStatus,
            background: statusConfig.bg,
            color: statusConfig.color
          }}>
            {statusConfig.icon} {statusConfig.text}
          </span>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{animations}</style>
      <div 
        style={styles.card}
        className="trip-card"
        onMouseEnter={(e) => {
          if (!expanded) {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 30px 60px -15px rgba(0, 0, 0, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (!expanded) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
          }
        }}
      >
        {/* Header */}
        <div 
          style={styles.header}
          onClick={() => setExpanded(!expanded)}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <div style={styles.tripInfo}>
            <span style={styles.tripId}>#{tripData.id}</span>
            <span style={styles.tripDate}>
              <span>📅</span> {tripData.date}
            </span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <span style={{
              ...styles.statusBadge,
              background: statusConfig.bg,
              color: statusConfig.color,
              boxShadow: statusConfig.shadow
            }}>
              <span>{statusConfig.icon}</span>
              <span>{statusConfig.text}</span>
            </span>
            <span style={{
              ...styles.expandIcon,
              transform: expanded ? 'rotate(180deg)' : 'rotate(0)'
            }}>
              ▼
            </span>
          </div>
        </div>

        {/* Route */}
        <div style={styles.route}>
          <div style={styles.routePoint}>
            <div style={{...styles.pointDot, ...styles.pointDotGreen}}></div>
            <div style={styles.pointDetails}>
              <div style={styles.pointLabel}>PICKUP</div>
              <div style={styles.pointAddress}>{tripData.pickup}</div>
            </div>
          </div>
          <div style={styles.routeLine}></div>
          <div style={styles.routePoint}>
            <div style={{...styles.pointDot, ...styles.pointDotRed}}></div>
            <div style={styles.pointDetails}>
              <div style={styles.pointLabel}>DROPOFF</div>
              <div style={styles.pointAddress}>{tripData.dropoff}</div>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div style={{animation: 'slideIn 0.3s ease-out'}}>
            {/* Details Grid */}
            <div style={styles.detailsGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>📏 Distance</span>
                <span style={styles.detailValue}>{tripData.distance} km</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>⏱️ Duration</span>
                <span style={styles.detailValue}>{formatTime(parseInt(tripData.duration))}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>💰 Earnings</span>
                <span style={{...styles.detailValue, color: '#0D8F81'}}>${tripData.earnings}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>🚗 Vehicle</span>
                <span style={styles.detailValue}>{tripData.vehicle}</span>
              </div>
            </div>

            {/* Passenger Info */}
            <div style={styles.passengerInfo}>
              <img 
                src={tripData.passengerImage} 
                alt={tripData.passenger}
                style={styles.passengerImage}
              />
              <div style={styles.passengerDetails}>
                <div style={styles.passengerName}>{tripData.passenger}</div>
                <div style={styles.passengerMeta}>
                  <span style={styles.passengerRating}>
                    <span>⭐</span> {tripData.passengerRating}
                  </span>
                  <span>•</span>
                  <span>📞 (555) 123-4567</span>
                </div>
              </div>
            </div>

            {/* Notes if available */}
            {tripData.notes && (
              <div style={styles.notes}>
                <span>📝</span>
                <span>{tripData.notes}</span>
              </div>
            )}

            {/* Actions */}
            <div style={styles.actions}>
              {status === 'scheduled' && (
                <button 
                  style={{...styles.actionButton, ...styles.primaryButton}}
                  onClick={() => handleStatusChange('in-progress')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 20px 30px rgba(13,143,129,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(13,143,129,0.3)';
                  }}
                >
                  <span>🚀</span>
                  Start Trip
                </button>
              )}
              {status === 'in-progress' && (
                <button 
                  style={{...styles.actionButton, ...styles.successButton}}
                  onClick={() => handleStatusChange('completed')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 20px 30px rgba(16,185,129,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(16,185,129,0.3)';
                  }}
                >
                  <span>✅</span>
                  Complete Trip
                </button>
              )}
              <button 
                style={{...styles.actionButton, ...styles.secondaryButton}}
                onClick={() => setShowMap(!showMap)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(145deg, #f8fafc, #f1f5f9)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>🗺️</span>
                {showMap ? 'Hide Map' : 'Show Route'}
              </button>
              <button 
                style={{...styles.actionButton, ...styles.outlineButton}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>📞</span>
                Contact
              </button>
            </div>

            {/* Map Preview */}
            {showMap && (
              <div 
                className="map-preview"
                style={styles.mapPreview}
                onClick={() => window.open(`https://maps.google.com/?saddr=${tripData.pickupLat},${tripData.pickupLng}&daddr=${tripData.dropoffLat},${tripData.dropoffLng}`, '_blank')}
              >
                <img 
                  src={`https://maps.googleapis.com/maps/api/staticmap?size=600x200&maptype=roadmap&markers=color:green%7C${tripData.pickupLat},${tripData.pickupLng}&markers=color:red%7C${tripData.dropoffLat},${tripData.dropoffLng}&path=color:0x0D8F81|weight:5|${tripData.pickupLat},${tripData.pickupLng}|${tripData.dropoffLat},${tripData.dropoffLng}&key=YOUR_API_KEY`}
                  alt="Route map"
                  style={styles.mapImage}
                />
                <div style={styles.mapOverlay}>
                  <span style={{
                    background: 'white',
                    padding: '12px 24px',
                    borderRadius: '30px',
                    fontWeight: '600',
                    color: '#1e293b',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                  }}>
                    Open in Google Maps →
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default TripCard;