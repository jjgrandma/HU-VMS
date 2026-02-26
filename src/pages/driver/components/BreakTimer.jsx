// src/pages/driver/components/BreakTimer.jsx
import React, { useState, useEffect } from 'react';

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

  const styles = {
    container: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      marginBottom: '20px'
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
    historyBtn: {
      background: 'none',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '8px',
      transition: 'background 0.3s'
    },
    timerDisplay: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '20px'
    },
    timerCircle: {
      position: 'relative',
      width: '120px',
      height: '120px'
    },
    timerText: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center'
    },
    time: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1e293b'
    },
    timerLabel: {
      fontSize: '12px',
      color: isOnBreak ? '#ff9800' : '#4caf50'
    },
    actions: {
      display: 'flex',
      justifyContent: 'center',
      gap: '12px',
      marginBottom: '16px'
    },
    startBtn: {
      backgroundColor: '#4caf50',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    endBtn: {
      backgroundColor: '#ff9800',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    history: {
      marginTop: '20px',
      padding: '16px',
      backgroundColor: '#f8fafc',
      borderRadius: '12px'
    },
    historyTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '12px'
    },
    historyItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid #e2e8f0',
      fontSize: '13px'
    },
    totalTime: {
      marginTop: '12px',
      padding: '8px',
      backgroundColor: '#0D8F81',
      color: 'white',
      borderRadius: '8px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '600'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          <span>☕</span>
          Break Timer
        </h3>
        <button 
          style={styles.historyBtn}
          onClick={() => setShowHistory(!showHistory)}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          📋
        </button>
      </div>

      <div style={styles.timerDisplay}>
        <div style={styles.timerCircle}>
          <svg width="120" height="120" style={{ position: 'absolute' }}>
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
              style={{ transition: 'stroke-dashoffset 0.5s' }}
            />
          </svg>
          <div style={styles.timerText}>
            <div style={styles.time}>{formatTime(breakTime)}</div>
            <div style={styles.timerLabel}>{isOnBreak ? 'On Break' : 'Working'}</div>
          </div>
        </div>
      </div>

      <div style={styles.actions}>
        {!isOnBreak ? (
          <button style={styles.startBtn} onClick={handleStartBreak}>
            <span>☕</span>
            Start Break
          </button>
        ) : (
          <button style={styles.endBtn} onClick={handleEndBreak}>
            <span>✓</span>
            End Break
          </button>
        )}
      </div>

      {showHistory && (
        <div style={styles.history}>
          <h4 style={styles.historyTitle}>Today's Break History</h4>
          {breakHistory.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center' }}>No breaks taken yet</p>
          ) : (
            <>
              {breakHistory.map((break_, index) => (
                <div key={break_.id} style={styles.historyItem}>
                  <span>{break_.startTime} - {break_.endTime}</span>
                  <span style={{ fontWeight: '600', color: '#0D8F81' }}>{formatTime(break_.duration)}</span>
                </div>
              ))}
              <div style={styles.totalTime}>
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