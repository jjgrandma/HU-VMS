import { useState, useEffect } from 'react';
import driverService from '../../../services/driverService';
import './DriverNotifications.css';

const DriverNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await driverService.getNotifications();
            setNotifications(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load notifications:', error);
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await driverService.markNotificationRead(id);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'trip_assignment': return '🚗';
            case 'schedule_reminder': return '⏰';
            case 'vehicle_alert': return '⚠️';
            case 'fuel_alert': return '⛽';
            case 'maintenance': return '🔧';
            default: return '📢';
        }
    };

    const filteredNotifications = filter === 'all'
        ? notifications
        : filter === 'unread'
            ? notifications.filter(n => !n.read)
            : notifications.filter(n => n.type === filter);

    if (loading) return <div className="loading">Loading notifications...</div>;

    return (
        <div className="driver-notifications">
            <h2>Notifications</h2>

            <div className="filter-buttons">
                <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
                    All
                </button>
                <button className={filter === 'unread' ? 'active' : ''} onClick={() => setFilter('unread')}>
                    Unread
                </button>
                <button className={filter === 'trip_assignment' ? 'active' : ''} onClick={() => setFilter('trip_assignment')}>
                    Trips
                </button>
                <button className={filter === 'vehicle_alert' ? 'active' : ''} onClick={() => setFilter('vehicle_alert')}>
                    Alerts
                </button>
            </div>

            <div className="notifications-list">
                {filteredNotifications.length === 0 ? (
                    <p className="no-notifications">No notifications</p>
                ) : (
                    filteredNotifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`notification-card ${notification.read ? 'read' : 'unread'} ${notification.severity || ''}`}
                            onClick={() => !notification.read && markAsRead(notification.id)}
                        >
                            <div className="notification-icon">
                                {getNotificationIcon(notification.type)}
                            </div>
                            <div className="notification-content">
                                <h4>{notification.title}</h4>
                                <p>{notification.message}</p>
                                <span className="notification-time">
                                    {new Date(notification.createdAt).toLocaleString()}
                                </span>
                            </div>
                            {!notification.read && <div className="unread-indicator"></div>}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DriverNotifications;
