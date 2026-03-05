// src/pages/driver/components/ScheduleCard.jsx
import React, { useState } from 'react';
import './ScheduleCard.css';

const ScheduleCard = ({ fullView = false }) => {
  const [selectedDay, setSelectedDay] = useState('today');
  const [viewMode, setViewMode] = useState('list');
  
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

  return (
    <div className={`schedule-card ${fullView ? 'schedule-card-full' : ''}`}>
      <div className="schedule-card-glow"></div>
      
      {/* Header */}
      <div className="schedule-header">
        <div className="schedule-header-left">
          <div className="schedule-header-icon">📅</div>
          <div>
            <h3 className="schedule-header-title">
              {fullView ? 'Full Schedule' : "Today's Schedule"}
            </h3>
            <div className="schedule-header-subtitle">
              {fullView ? 'Weekly trip overview' : 'Your trips for today'}
            </div>
          </div>
        </div>
        {!fullView && (
          <button className="schedule-view-all-btn">
            View Full Schedule
            <span className="schedule-view-all-arrow">→</span>
          </button>
        )}
      </div>

      {/* View Mode Toggle (for full view) */}
      {fullView && (
        <div className="schedule-view-mode">
          {['list', 'timeline', 'calendar'].map(mode => (
            <button
              key={mode}
              className={`schedule-view-mode-btn ${viewMode === mode ? 'active' : ''}`}
              onClick={() => setViewMode(mode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Day Tabs (for full view) */}
      {fullView && (
        <div className="schedule-day-tabs">
          {days.map(day => (
            <button
              key={day.id}
              className={`schedule-day-tab ${selectedDay === day.id ? 'active' : ''}`}
              onClick={() => setSelectedDay(day.id)}
            >
              <span>{day.icon}</span>
              <span>{day.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      <div className="schedule-stats">
        <div className="schedule-stat-item">
          <div className="schedule-stat-value">${totalEarnings.toFixed(2)}</div>
          <div className="schedule-stat-label">Total Earnings</div>
        </div>
        <div className="schedule-stat-item">
          <div className="schedule-stat-value">{totalTrips}</div>
          <div className="schedule-stat-label">Total Trips</div>
        </div>
        <div className="schedule-stat-item">
          <div className="schedule-stat-value">{completedTrips}</div>
          <div className="schedule-stat-label">Completed</div>
          <span className="schedule-stat-badge schedule-stat-badge-completed">✓ Done</span>
        </div>
        <div className="schedule-stat-item">
          <div className="schedule-stat-value">{inProgressTrips}</div>
          <div className="schedule-stat-label">In Progress</div>
          <span className="schedule-stat-badge schedule-stat-badge-progress">🔄 Active</span>
        </div>
      </div>

      {/* Schedule Content */}
      {viewMode === 'list' && (
        <div className="schedule-list">
          {currentSchedule.map((item, index) => {
            const status = getStatusIcon(item.status);
            return (
              <div key={item.id} className="schedule-list-item">
                <div className="schedule-item-time">
                  <span className="schedule-time-dot"></span>
                  <span className="schedule-time-text">{item.time}</span>
                </div>
                
                <div className="schedule-item-content">
                  <div className="schedule-item-route">{item.route}</div>
                  <div className="schedule-item-details">
                    <span className="schedule-item-passenger">👤 {item.passenger}</span>
                    <span className="schedule-item-duration">⏱️ {item.duration}</span>
                    <span className="schedule-item-earnings">💰 {item.earnings}</span>
                  </div>
                </div>

                <div 
                  className="schedule-item-status"
                  style={{
                    background: status.bg,
                    color: status.color
                  }}
                >
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
        <div className="schedule-timeline">
          {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map(hour => {
            const hourEvents = currentSchedule.filter(item => item.time.includes(hour.slice(0,2)));
            return (
              <div key={hour} className="schedule-timeline-hour">
                <div className="schedule-timeline-label">{hour}</div>
                <div className="schedule-timeline-events">
                  {hourEvents.map(event => (
                    <div key={event.id} className="schedule-timeline-event">
                      <div className="schedule-timeline-line"></div>
                      <div className="schedule-timeline-route">{event.route}</div>
                      <div className="schedule-timeline-passenger">{event.passenger}</div>
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
        <div className="schedule-calendar">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div key={day} className="schedule-calendar-day">
              <div className="schedule-calendar-date">{index + 17}</div>
              <div className="schedule-calendar-day-name">{day}</div>
              <div className="schedule-calendar-dots">
                {index < 5 && <span className="schedule-calendar-dot"></span>}
                {index < 4 && <span className="schedule-calendar-dot"></span>}
                {index < 3 && <span className="schedule-calendar-dot"></span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Summary (for non-full view) */}
      {!fullView && (
        <div className="schedule-summary">
          <div className="schedule-summary-item">
            <div className="schedule-summary-label">Completed</div>
            <div className="schedule-summary-value">{completedTrips}</div>
            <span className="schedule-summary-badge schedule-summary-badge-completed">✓</span>
          </div>
          <div className="schedule-summary-item">
            <div className="schedule-summary-label">In Progress</div>
            <div className="schedule-summary-value">{inProgressTrips}</div>
            <span className="schedule-summary-badge schedule-summary-badge-progress">🔄</span>
          </div>
          <div className="schedule-summary-item">
            <div className="schedule-summary-label">Upcoming</div>
            <div className="schedule-summary-value">{scheduledTrips}</div>
            <span className="schedule-summary-badge schedule-summary-badge-upcoming">⏰</span>
          </div>
        </div>
      )}

      {/* View All Link (for non-full view) */}
      {!fullView && (
        <div className="schedule-view-all-container">
          <button className="schedule-view-all-link">
            View All Trips →
          </button>
        </div>
      )}
    </div>
  );
};

export default ScheduleCard;