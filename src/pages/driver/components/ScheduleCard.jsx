// src/pages/driver/components/ScheduleCard.jsx
import React, { useState } from 'react';

const ScheduleCard = ({ fullView = false }) => {
  const [selectedDay, setSelectedDay] = useState('today');
  
  const schedule = {
    today: [
      { id: 1, time: '09:00 AM', route: 'Downtown → Airport', status: 'completed' },
      { id: 2, time: '11:30 AM', route: 'Airport → City Center', status: 'completed' },
      { id: 3, time: '02:00 PM', route: 'Northside → Southside', status: 'in-progress' },
      { id: 4, time: '04:30 PM', route: 'Eastside → Westside', status: 'scheduled' },
      { id: 5, time: '07:00 PM', route: 'Central → Mall', status: 'scheduled' }
    ],
    tomorrow: [
      { id: 6, time: '08:30 AM', route: 'Airport → Hotel', status: 'scheduled' },
      { id: 7, time: '10:00 AM', route: 'Hotel → Convention Center', status: 'scheduled' },
      { id: 8, time: '12:30 PM', route: 'Convention Center → Downtown', status: 'scheduled' },
      { id: 9, time: '03:00 PM', route: 'Downtown → Airport', status: 'scheduled' }
    ],
    wed: [
      { id: 10, time: '08:00 AM', route: 'Northside → Airport', status: 'scheduled' },
      { id: 11, time: '11:00 AM', route: 'Airport → Southside', status: 'scheduled' },
      { id: 12, time: '02:30 PM', route: 'Southside → Eastside', status: 'scheduled' }
    ],
    thu: [
      { id: 13, time: '09:30 AM', route: 'Westside → Downtown', status: 'scheduled' },
      { id: 14, time: '01:00 PM', route: 'Downtown → Airport', status: 'scheduled' },
      { id: 15, time: '04:00 PM', route: 'Airport → Mall', status: 'scheduled' }
    ],
    fri: [
      { id: 16, time: '07:00 AM', route: 'Airport → Convention Center', status: 'scheduled' },
      { id: 17, time: '10:30 AM', route: 'Convention Center → Hotel', status: 'scheduled' },
      { id: 18, time: '02:00 PM', route: 'Hotel → Airport', status: 'scheduled' },
      { id: 19, time: '06:00 PM', route: 'Airport → Downtown', status: 'scheduled' }
    ]
  };

  const days = ['today', 'tomorrow', 'wed', 'thu', 'fri'];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return '✓';
      case 'in-progress': return '🔄';
      case 'scheduled': return '⏰';
      default: return '⏰';
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'completed': return 'completed';
      case 'in-progress': return 'in-progress';
      case 'scheduled': return 'scheduled';
      default: return '';
    }
  };

  const currentSchedule = schedule[selectedDay] || schedule.today;

  return (
    <div className={`schedule-card ${fullView ? 'full-view' : ''} glass-effect`}>
      <div className="card-header">
        <h3>
          <span className="header-icon">📅</span>
          {fullView ? 'Full Schedule' : 'Today\'s Schedule'}
        </h3>
        {!fullView && <button className="view-all-btn">View All →</button>}
      </div>

      {fullView && (
        <div className="schedule-days">
          {days.map(day => (
            <button
              key={day}
              className={`day-tab ${selectedDay === day ? 'active' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </button>
          ))}
        </div>
      )}

      <div className="schedule-list">
        {currentSchedule.map(item => (
          <div key={item.id} className="schedule-item">
            <div className="item-time">
              <span className="time-dot"></span>
              <span className="time">{item.time}</span>
            </div>
            <div className="item-route">{item.route}</div>
            <div className={`item-status ${getStatusClass(item.status)}`}>
              {getStatusIcon(item.status)}
            </div>
          </div>
        ))}
      </div>

      {!fullView && (
        <div className="schedule-summary">
          <div className="summary-item">
            <span>Completed</span>
            <span className="badge success">
              {schedule.today.filter(item => item.status === 'completed').length}
            </span>
          </div>
          <div className="summary-item">
            <span>In Progress</span>
            <span className="badge warning">
              {schedule.today.filter(item => item.status === 'in-progress').length}
            </span>
          </div>
          <div className="summary-item">
            <span>Upcoming</span>
            <span className="badge info">
              {schedule.today.filter(item => item.status === 'scheduled').length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleCard; // ← MAKE SURE THIS IS HERE!