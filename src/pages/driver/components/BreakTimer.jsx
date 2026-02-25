// src/pages/driver/components/BreakTimer.jsx
import React, { useState, useEffect } from 'react';

const BreakTimer = () => {
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakTime, setBreakTime] = useState(0);
  const [breakHistory, setBreakHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    let interval;
    if (isOnBreak) {
      interval = setInterval(() => {
        setBreakTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOnBreak]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartBreak = () => {
    setIsOnBreak(true);
  };

  const handleEndBreak = () => {
    setIsOnBreak(false);
    setBreakHistory(prev => [...prev, { date: new Date(), duration: breakTime }]);
    setBreakTime(0);
  };

  return (
    <div className="break-timer-card glass-effect">
      <div className="timer-header">
        <h3>
          <span className="header-icon">☕</span>
          Break Timer
        </h3>
        <button className="history-btn" onClick={() => setShowHistory(!showHistory)}>
          📋
        </button>
      </div>

      <div className="timer-display">
        <div className="timer-circle">
          <svg className="progress-ring" width="120" height="120">
            <circle
              className="progress-ring-circle"
              stroke={isOnBreak ? '#ff9800' : '#4caf50'}
              strokeWidth="4"
              fill="transparent"
              r="52"
              cx="60"
              cy="60"
            />
          </svg>
          <div className="timer-text">
            <span className="time">{formatTime(breakTime)}</span>
            <span className="timer-label">{isOnBreak ? 'On Break' : 'Working'}</span>
          </div>
        </div>
      </div>

      <div className="timer-actions">
        {!isOnBreak ? (
          <button className="start-break-btn" onClick={handleStartBreak}>
            <span className="btn-icon">☕</span>
            Start Break
          </button>
        ) : (
          <button className="end-break-btn" onClick={handleEndBreak}>
            <span className="btn-icon">✓</span>
            End Break
          </button>
        )}
      </div>

      {showHistory && (
        <div className="break-history">
          <h4>Today's Breaks</h4>
          {breakHistory.length === 0 ? (
            <p className="no-history">No breaks taken yet</p>
          ) : (
            breakHistory.map((break_, index) => (
              <div key={index} className="history-item">
                <span>{new Date(break_.date).toLocaleTimeString()}</span>
                <span>{formatTime(break_.duration)}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default BreakTimer; // ← Make sure this line exists!