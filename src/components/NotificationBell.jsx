import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import './NotificationBell.css';

const NotificationBell = ({ count = 0, onClick }) => {
  const [ringing, setRinging] = useState(false);
  const [pulse, setPulse]     = useState(false);

  // Auto-pulse when there are unread notifications
  useEffect(() => {
    if (count > 0) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 2000);
      return () => clearTimeout(t);
    }
  }, [count]);

  const handleClick = () => {
    setRinging(true);
    setTimeout(() => setRinging(false), 600);
    onClick?.();
  };

  return (
    <button
      className={`nb-btn ${ringing ? 'nb-ringing' : ''} ${pulse ? 'nb-pulse' : ''}`}
      onClick={handleClick}
      aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
      title="Notifications"
    >
      <Bell size={20} className="nb-icon" />
      {count > 0 && (
        <span className="nb-badge" aria-hidden="true">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
