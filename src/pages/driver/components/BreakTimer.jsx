// src/pages/driver/components/BreakTimer.jsx
import React, { useState, useEffect } from 'react';
import './BreakTimer.css';

const BreakTimer = () => {
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakTime, setBreakTime] = useState(0);
  const [breakHistory, setBreakHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [dailyTotalBreaks, setDailyTotalBreaks] = useState(0);

  useEffect(() => {
    let interval;
    if (isOnBreak) {
      interval = setInterval(() => {
        setBreakTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOnBreak]);

  useEffect(() => {
    // Calculate daily total break time
    const total = breakHistory.reduce((acc, curr) => acc + curr.duration, 0);
    setDailyTotalBreaks(total);
  }, [breakHistory]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartBreak = () => {
    setIsOnBreak(true);
    // Notify dispatch that driver is on break
    console.log('Break started at:', new Date().toLocaleTimeString());
  };

  const handleEndBreak = () => {
    setIsOnBreak(false);
    const breakRecord = {
      id: Date.now(),
      startTime: new Date(Date.now() - breakTime * 1000).toLocaleTimeString(),
      endTime: new Date().toLocaleTimeString(),
      duration: breakTime,
      date: new Date().toLocaleDateString()
    };
    setBreakHistory(prev => [breakRecord, ...prev]);
    setBreakTime(0);
    // Notify dispatch that driver is back
    console.log('Break ended at:', new Date().toLocaleTimeString());
  };

  return (
    <div className="break-timer-container">
      <div className="break-timer-header">
        <h3 className="break-timer-title">
          <span>☕</span>
          Break Timer
        </h3>
        <button 
          className="break-timer-history-btn"
          onClick={() => setShowHistory(!showHistory)}
        >
          📋
        </button>
      </div>

      <div className="break-timer-display">
        <div className="break-timer-circle">
          <svg width="120" height="120" className="break-timer-svg">
            <circle
              cx="60" cy="60" r="52"
              stroke="#e2e8f0"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="60" cy="60" r="52"
              stroke={isOnBreak ? '#ff9800' : '#4caf50'}
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={2 * Math.PI * 52 * (1 - Math.min(breakTime / 3600, 1))}
              strokeLinecap="round"
              className="break-timer-progress"
            />
          </svg>
          <div className="break-timer-text">
            <div className="break-timer-time">{formatTime(breakTime)}</div>
            <div className={`break-timer-label ${isOnBreak ? 'on-break' : 'working'}`}>
              {isOnBreak ? 'On Break' : 'Working'}
            </div>
          </div>
        </div>
      </div>

      <div className="break-timer-actions">
        {!isOnBreak ? (
          <button className="break-timer-start-btn" onClick={handleStartBreak}>
            <span>☕</span>
            Start Break
          </button>
        ) : (
          <button className="break-timer-end-btn" onClick={handleEndBreak}>
            <span>✓</span>
            End Break
          </button>
        )}
      </div>

      {showHistory && (
        <div className="break-timer-history">
          <h4 className="break-timer-history-title">Today's Break History</h4>
          {breakHistory.length === 0 ? (
            <p className="break-timer-no-history">No breaks taken yet</p>
          ) : (
            <>
              {breakHistory.map((break_, index) => (
                <div key={break_.id} className="break-timer-history-item">
                  <span>{break_.startTime} - {break_.endTime}</span>
                  <span className="break-timer-history-duration">{formatTime(break_.duration)}</span>
                </div>
              ))}
              <div className="break-timer-total">
                Total Break Time Today: {formatTime(dailyTotalBreaks)}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BreakTimer;