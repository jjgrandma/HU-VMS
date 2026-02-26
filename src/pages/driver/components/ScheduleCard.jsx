// src/pages/driver/components/ScheduleCard.jsx
import React, { useState } from 'react';

const ScheduleCard = ({ fullView = false }) => {
  const [selectedDay, setSelectedDay] = useState('today');
  const [viewMode, setViewMode] = useState('list'); // list, calendar, timeline
  
  const schedule = {
    today: [
      { id: 1, time: '09:00 AM', route: 'Downtown → Airport', status: 'completed', passenger: 'Mr. Johnson', duration: '45 min', earnings: '$35.50' },
      { id: 2, time: '11:30 AM', route: 'Airport → City Center', status: 'completed', passenger: 'Ms. Smith', duration: '30 min', earnings: '$28.00' },
      { id: 3, time: '02:00 PM', route: 'Northside → Southside', status: 'in-progress', passenger: 'Dr. Williams', duration: '25 min', earnings: '$22.50' },
      { id: 4, time: '04:30 PM', route: 'Eastside → Westside', status: 'scheduled', passenger: 'Mrs. Brown', duration: '40 min', earnings: '$32.00' },
      { id: 5, time: '07:00 PM', route: 'Central → Mall', status: 'scheduled', passenger: 'Mr. Davis', duration: '20 min', earnings: '$18.50' }
    ],
    tomorrow: [
      { id: 6, time: '08:30 AM', route: 'Airport → Hotel', status: 'scheduled', passenger: 'Ms. Garcia', duration: '35 min', earnings: '$29.50' },
      { id: 7, time: '10:00 AM', route: 'Hotel → Convention Center', status: 'scheduled', passenger: 'Dr. Martinez', duration: '15 min', earnings: '$15.00' },
      { id: 8, time: '12:30 PM', route: 'Convention Center → Downtown', status: 'scheduled', passenger: 'Mr. Robinson', duration: '25 min', earnings: '$22.50' },
      { id: 9, time: '03:00 PM', route: 'Downtown → Airport', status: 'scheduled', passenger: 'Mrs. Clark', duration: '45 min', earnings: '$35.50' }
    ],
    wed: [
      { id: 10, time: '08:00 AM', route: 'Northside → Airport', status: 'scheduled', passenger: 'Mr. Rodriguez', duration: '50 min', earnings: '$40.00' },
      { id: 11, time: '11:00 AM', route: 'Airport → Southside', status: 'scheduled', passenger: 'Ms. Lewis', duration: '40 min', earnings: '$32.00' },
      { id: 12, time: '02:30 PM', route: 'Southside → Eastside', status: 'scheduled', passenger: 'Dr. Lee', duration: '30 min', earnings: '$25.00' }
    ],
    thu: [
      { id: 13, time: '09:30 AM', route: 'Westside → Downtown', status: 'scheduled', passenger: 'Mr. Walker', duration: '35 min', earnings: '$28.50' },
      { id: 14, time: '01:00 PM', route: 'Downtown → Airport', status: 'scheduled', passenger: 'Ms. Hall', duration: '45 min', earnings: '$35.50' },
      { id: 15, time: '04:00 PM', route: 'Airport → Mall', status: 'scheduled', passenger: 'Mrs. Young', duration: '25 min', earnings: '$22.00' }
    ],
    fri: [
      { id: 16, time: '07:00 AM', route: 'Airport → Convention Center', status: 'scheduled', passenger: 'Mr. King', duration: '40 min', earnings: '$32.00' },
      { id: 17, time: '10:30 AM', route: 'Convention Center → Hotel', status: 'scheduled', passenger: 'Ms. Wright', duration: '20 min', earnings: '$18.50' },
      { id: 18, time: '02:00 PM', route: 'Hotel → Airport', status: 'scheduled', passenger: 'Dr. Scott', duration: '35 min', earnings: '$29.50' },
      { id: 19, time: '06:00 PM', route: 'Airport → Downtown', status: 'scheduled', passenger: 'Mr. Green', duration: '45 min', earnings: '$35.50' }
    ]
  };

  const days = [
    { id: 'today', label: 'Today', icon: '🔆' },
    { id: 'tomorrow', label: 'Tomorrow', icon: '🌅' },
    { id: 'wed', label: 'Wednesday', icon: '📆' },
    { id: 'thu', label: 'Thursday', icon: '📆' },
    { id: 'fri', label: 'Friday', icon: '📆' }
  ];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return { icon: '✓', color: '#10b981', bg: '#e8f5e8', label: 'Completed' };
      case 'in-progress': return { icon: '🔄', color: '#f59e0b', bg: '#fff3e0', label: 'In Progress' };
      case 'scheduled': return { icon: '⏰', color: '#3b82f6', bg: '#e8f0fe', label: 'Scheduled' };
      default: return { icon: '⏰', color: '#64748b', bg: '#f1f5f9', label: 'Pending' };
    }
  };

  const currentSchedule = schedule[selectedDay] || schedule.today;

  // Calculate stats
  const totalEarnings = currentSchedule.reduce((sum, item) => {
    const amount = parseFloat(item.earnings?.replace('$', '') || 0);
    return sum + amount;
  }, 0);

  const totalTrips = currentSchedule.length;
  const completedTrips = currentSchedule.filter(item => item.status === 'completed').length;
  const inProgressTrips = currentSchedule.filter(item => item.status === 'in-progress').length;
  const scheduledTrips = currentSchedule.filter(item => item.status === 'scheduled').length;

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
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '28px',
      position: 'relative'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px'
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
    viewAllBtn: {
      background: 'rgba(13,143,129,0.1)',
      border: 'none',
      color: '#0D8F81',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      padding: '12px 24px',
      borderRadius: '40px',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backdropFilter: 'blur(5px)',
      border: '1px solid rgba(13,143,129,0.2)'
    },
    // View Mode Toggle
    viewModeToggle: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      background: '#f1f5f9',
      padding: '4px',
      borderRadius: '40px',
      width: 'fit-content'
    },
    viewModeBtn: {
      padding: '10px 20px',
      border: 'none',
      background: 'transparent',
      borderRadius: '30px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      color: '#64748b'
    },
    viewModeBtnActive: {
      background: 'white',
      color: '#0D8F81',
      boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
    },
    // Day Tabs
    dayTabs: {
      display: 'flex',
      gap: '12px',
      marginBottom: '28px',
      flexWrap: 'wrap'
    },
    dayTab: {
      padding: '14px 24px',
      border: 'none',
      background: '#f8fafc',
      borderRadius: '40px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#64748b',
      border: '1px solid #e2e8f0'
    },
    dayTabActive: {
      background: 'linear-gradient(145deg, #0D8F81, #0b7a6e)',
      color: 'white',
      borderColor: 'transparent',
      boxShadow: '0 10px 20px rgba(13,143,129,0.3)',
      transform: 'translateY(-2px)'
    },
    // Stats Summary
    statsSummary: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '16px',
      marginBottom: '28px',
      padding: '20px',
      background: 'linear-gradient(145deg, #f8fafc, #f1f5f9)',
      borderRadius: '24px'
    },
    statItem: {
      textAlign: 'center'
    },
    statValue: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '4px'
    },
    statLabel: {
      fontSize: '13px',
      color: '#64748b'
    },
    statBadge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      marginTop: '4px'
    },
    // Schedule List
    scheduleList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxHeight: fullView ? '500px' : '400px',
      overflowY: 'auto',
      paddingRight: '8px'
    },
    scheduleItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px',
      background: '#f8fafc',
      borderRadius: '20px',
      transition: 'all 0.3s',
      border: '1px solid #e2e8f0',
      position: 'relative',
      overflow: 'hidden'
    },
    itemTime: {
      minWidth: '100px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    timeDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#0D8F81',
      boxShadow: '0 0 0 3px rgba(13,143,129,0.2)'
    },
    timeText: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1e293b'
    },
    itemContent: {
      flex: 1
    },
    itemRoute: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '4px'
    },
    itemDetails: {
      display: 'flex',
      gap: '16px',
      fontSize: '13px',
      color: '#64748b'
    },
    itemPassenger: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    itemDuration: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    itemEarnings: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      color: '#0D8F81',
      fontWeight: '600'
    },
    itemStatus: {
      padding: '8px 16px',
      borderRadius: '30px',
      fontSize: '13px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      minWidth: '110px',
      justifyContent: 'center'
    },
    // Timeline View
    timelineView: {
      position: 'relative',
      padding: '20px 0'
    },
    timelineHour: {
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: '16px',
      position: 'relative'
    },
    timelineHourLabel: {
      minWidth: '60px',
      fontSize: '12px',
      fontWeight: '600',
      color: '#64748b',
      paddingTop: '8px'
    },
    timelineEvents: {
      flex: 1,
      position: 'relative'
    },
    timelineEvent: {
      position: 'relative',
      marginBottom: '8px',
      padding: '12px',
      background: '#f8fafc',
      borderRadius: '12px',
      marginLeft: '20px'
    },
    timelineLine: {
      position: 'absolute',
      left: '-20px',
      top: '0',
      bottom: '0',
      width: '2px',
      background: 'linear-gradient(to bottom, #0D8F81, #0b7a6e)'
    },
    // Calendar View
    calendarView: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '8px',
      marginTop: '20px'
    },
    calendarDay: {
      aspectRatio: '1',
      background: '#f8fafc',
      borderRadius: '16px',
      padding: '8px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      border: '1px solid #e2e8f0'
    },
    calendarDayNumber: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '4px'
    },
    calendarEventDot: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      backgroundColor: '#0D8F81',
      margin: '2px'
    },
    // Schedule Summary (for non-full view)
    scheduleSummary: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      marginTop: '20px',
      padding: '16px',
      background: 'linear-gradient(145deg, #f8fafc, #f1f5f9)',
      borderRadius: '20px'
    },
    summaryItem: {
      textAlign: 'center'
    },
    summaryLabel: {
      fontSize: '12px',
      color: '#64748b',
      marginBottom: '4px'
    },
    summaryValue: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#1e293b'
    },
    badge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600'
    }
  };

  return (
    <>
      {/* Global Animations */}
      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .schedule-item {
          animation: slideIn 0.3s ease-out;
        }
        .schedule-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
      `}</style>

      <div style={styles.card}>
        <div style={styles.cardGlow}></div>
        
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>📅</div>
            <div>
              <h3 style={styles.headerTitle}>
                {fullView ? 'Full Schedule' : "Today's Schedule"}
              </h3>
              <div style={styles.headerSubtitle}>
                {fullView ? 'Weekly trip overview' : 'Your trips for today'}
              </div>
            </div>
          </div>
          {!fullView && (
            <button 
              style={styles.viewAllBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#0D8F81';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(13,143,129,0.1)';
                e.currentTarget.style.color = '#0D8F81';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              View Full Schedule
              <span>→</span>
            </button>
          )}
        </div>

        {/* View Mode Toggle (for full view) */}
        {fullView && (
          <div style={styles.viewModeToggle}>
            {['list', 'timeline', 'calendar'].map(mode => (
              <button
                key={mode}
                style={{
                  ...styles.viewModeBtn,
                  ...(viewMode === mode ? styles.viewModeBtnActive : {})
                }}
                onClick={() => setViewMode(mode)}
                onMouseEnter={(e) => {
                  if (viewMode !== mode) {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = '#1e293b';
                  }
                }}
                onMouseLeave={(e) => {
                  if (viewMode !== mode) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#64748b';
                  }
                }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Day Tabs (for full view) */}
        {fullView && (
          <div style={styles.dayTabs}>
            {days.map(day => (
              <button
                key={day.id}
                style={{
                  ...styles.dayTab,
                  ...(selectedDay === day.id ? styles.dayTabActive : {})
                }}
                onClick={() => setSelectedDay(day.id)}
                onMouseEnter={(e) => {
                  if (selectedDay !== day.id) {
                    e.currentTarget.style.background = '#f1f5f9';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedDay !== day.id) {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <span>{day.icon}</span>
                <span>{day.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {(fullView || !fullView) && (
          <div style={styles.statsSummary}>
            <div style={styles.statItem}>
              <div style={styles.statValue}>${totalEarnings.toFixed(2)}</div>
              <div style={styles.statLabel}>Total Earnings</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{totalTrips}</div>
              <div style={styles.statLabel}>Total Trips</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{completedTrips}</div>
              <div style={styles.statLabel}>Completed</div>
              <span style={{...styles.statBadge, background: '#e8f5e8', color: '#10b981'}}>
                ✓ Done
              </span>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{inProgressTrips}</div>
              <div style={styles.statLabel}>In Progress</div>
              <span style={{...styles.statBadge, background: '#fff3e0', color: '#f59e0b'}}>
                🔄 Active
              </span>
            </div>
          </div>
        )}

        {/* Schedule Content */}
        {viewMode === 'list' && (
          <div style={styles.scheduleList} className="schedule-list">
            {currentSchedule.map((item, index) => {
              const status = getStatusIcon(item.status);
              return (
                <div 
                  key={item.id} 
                  className="schedule-item"
                  style={styles.scheduleItem}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={styles.itemTime}>
                    <span style={styles.timeDot}></span>
                    <span style={styles.timeText}>{item.time}</span>
                  </div>
                  
                  <div style={styles.itemContent}>
                    <div style={styles.itemRoute}>{item.route}</div>
                    <div style={styles.itemDetails}>
                      <span style={styles.itemPassenger}>👤 {item.passenger}</span>
                      <span style={styles.itemDuration}>⏱️ {item.duration}</span>
                      <span style={styles.itemEarnings}>💰 {item.earnings}</span>
                    </div>
                  </div>

                  <div style={{
                    ...styles.itemStatus,
                    background: status.bg,
                    color: status.color
                  }}>
                    <span>{status.icon}</span>
                    <span>{status.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <div style={styles.timelineView}>
            {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map(hour => {
              const hourEvents = currentSchedule.filter(item => item.time.includes(hour.slice(0,2)));
              return (
                <div key={hour} style={styles.timelineHour}>
                  <div style={styles.timelineHourLabel}>{hour}</div>
                  <div style={styles.timelineEvents}>
                    {hourEvents.map(event => (
                      <div key={event.id} style={styles.timelineEvent}>
                        <div style={styles.timelineLine}></div>
                        <div style={{fontWeight: '600', marginBottom: '4px'}}>{event.route}</div>
                        <div style={{fontSize: '12px', color: '#64748b'}}>{event.passenger}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div style={styles.calendarView}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={day} style={styles.calendarDay}>
                <div style={styles.calendarDayNumber}>{index + 17}</div>
                <div style={{fontSize: '11px', color: '#64748b'}}>{day}</div>
                <div style={{display: 'flex', gap: '2px', marginTop: '4px'}}>
                  {index < 5 && <span style={styles.calendarEventDot}></span>}
                  {index < 4 && <span style={styles.calendarEventDot}></span>}
                  {index < 3 && <span style={styles.calendarEventDot}></span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Schedule Summary (for non-full view) */}
        {!fullView && (
          <div style={styles.scheduleSummary}>
            <div style={styles.summaryItem}>
              <div style={styles.summaryLabel}>Completed</div>
              <div style={styles.summaryValue}>{completedTrips}</div>
              <span style={{...styles.badge, background: '#e8f5e8', color: '#10b981'}}>
                ✓
              </span>
            </div>
            <div style={styles.summaryItem}>
              <div style={styles.summaryLabel}>In Progress</div>
              <div style={styles.summaryValue}>{inProgressTrips}</div>
              <span style={{...styles.badge, background: '#fff3e0', color: '#f59e0b'}}>
                🔄
              </span>
            </div>
            <div style={styles.summaryItem}>
              <div style={styles.summaryLabel}>Upcoming</div>
              <div style={styles.summaryValue}>{scheduledTrips}</div>
              <span style={{...styles.badge, background: '#e8f0fe', color: '#3b82f6'}}>
                ⏰
              </span>
            </div>
          </div>
        )}

        {/* View All Link (for non-full view) */}
        {!fullView && (
          <div style={{textAlign: 'center', marginTop: '16px'}}>
            <button 
              style={{
                background: 'none',
                border: 'none',
                color: '#0D8F81',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: '20px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(13,143,129,0.1)';
                e.currentTarget.style.transform = 'translateX(5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              View All Trips →
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ScheduleCard;