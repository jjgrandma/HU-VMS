import { useState, useEffect } from 'react';
import './FuelNotifications.css';

const FuelNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = () => {
        // Mock notifications - same as in layout but with more items
        const mockNotifications = [
            {
                id: 1,
                title: 'New Fuel Request',
                message: 'Vehicle VH-012 has requested 45L of diesel',
                createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
                read: false,
                type: 'request'
            },
            {
                id: 2,
                title: 'Low Inventory Alert',
                message: 'Petrol inventory is below 20% threshold',
                createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
                read: false,
                type: 'alert'
            },
            {
                id: 3,
                title: 'Authorization Approved',
                message: 'Fuel request TXN-004 has been authorized by Admin',
                createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
                read: false,
                type: 'info'
            },
            {
                id: 4,
                title: 'Daily Report Generated',
                message: 'Your daily fuel report has been generated successfully',
                createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
                read: true,
                type: 'success'
            },
            {
                id: 5,
                title: 'Maintenance Reminder',
                message: 'Fuel pump maintenance scheduled for tomorrow',
                createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
                read: true,
                type: 'info'
            },
            {
                id: 6,
                title: 'New Fuel Request',
                message: 'Vehicle VH-018 has requested 38L of petrol',
                createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
                read: true,
                type: 'request'
            },
            {
                id: 7,
                title: 'Inventory Restocked',
                message: 'Diesel inventory has been restocked with 5000L',
                createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
                read: true,
                type: 'success'
            },
            {
                id: 8,
                title: 'System Update',
                message: 'Fuel management system will be updated tonight at 2 AM',
                createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
                read: true,
                type: 'info'
            },
            {
                id: 9,
                title: 'Critical Alert',
                message: 'Diesel inventory critically low - immediate restocking required',
                createdAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
                read: true,
                type: 'alert'
            },
            {
                id: 10,
                title: 'Weekly Report Ready',
                message: 'Your weekly fuel consumption report is ready for review',
                createdAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
                read: true,
                type: 'success'
            }
        ];

        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
    };

    const markAsRead = (notificationId) => {
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const deleteNotification = (notificationId) => {
        const notification = notifications.find(n => n.id === notificationId);
        if (!notification.read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    };

    const formatNotificationTime = (timestamp) => {
        const now = new Date();
        const notificationDate = new Date(timestamp);
        const diffInMinutes = Math.floor((now - notificationDate) / 60000);

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

        return notificationDate.toLocaleDateString();
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notification.read;
        return notification.type === filter;
    });

    return (
        <div className="fuel-notifications-page">
            <div className="fuel-notifications-header">
                <div className="fuel-notifications-title">
                    <h2>Notifications</h2>
                    <span className="fuel-notifications-count">
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                    </span>
                </div>
                {unreadCount > 0 && (
                    <button className="fuel-mark-all-read-btn" onClick={markAllAsRead}>
                        <span>✓</span> Mark All as Read
                    </button>
                )}
            </div>

            <div className="fuel-notifications-filters">
                <button
                    className={`fuel-filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All ({notifications.length})
                </button>
                <button
                    className={`fuel-filter-btn ${filter === 'unread' ? 'active' : ''}`}
                    onClick={() => setFilter('unread')}
                >
                    Unread ({unreadCount})
                </button>
                <button
                    className={`fuel-filter-btn ${filter === 'request' ? 'active' : ''}`}
                    onClick={() => setFilter('request')}
                >
                    📋 Requests
                </button>
                <button
                    className={`fuel-filter-btn ${filter === 'alert' ? 'active' : ''}`}
                    onClick={() => setFilter('alert')}
                >
                    ⚠️ Alerts
                </button>
                <button
                    className={`fuel-filter-btn ${filter === 'info' ? 'active' : ''}`}
                    onClick={() => setFilter('info')}
                >
                    ℹ️ Info
                </button>
                <button
                    className={`fuel-filter-btn ${filter === 'success' ? 'active' : ''}`}
                    onClick={() => setFilter('success')}
                >
                    ✓ Success
                </button>
            </div>

            <div className="fuel-notifications-list-page">
                {filteredNotifications.length === 0 ? (
                    <div className="fuel-no-notifications-page">
                        <span className="fuel-no-notifications-icon-page">🔔</span>
                        <h3>No notifications</h3>
                        <p>You're all caught up! Check back later for updates.</p>
                    </div>
                ) : (
                    filteredNotifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`fuel-notification-card ${notification.read ? 'read' : 'unread'} ${notification.type}`}
                        >
                            <div className="fuel-notification-card-icon">
                                {notification.type === 'request' && '📋'}
                                {notification.type === 'alert' && '⚠️'}
                                {notification.type === 'info' && 'ℹ️'}
                                {notification.type === 'success' && '✓'}
                            </div>
                            <div className="fuel-notification-card-content">
                                <div className="fuel-notification-card-header">
                                    <strong className="fuel-notification-card-title">{notification.title}</strong>
                                    {!notification.read && <div className="fuel-notification-card-unread-dot"></div>}
                                </div>
                                <p className="fuel-notification-card-message">{notification.message}</p>
                                <span className="fuel-notification-card-time">
                                    {formatNotificationTime(notification.createdAt)}
                                </span>
                            </div>
                            <div className="fuel-notification-card-actions">
                                {!notification.read && (
                                    <button
                                        className="fuel-notification-action-btn mark-read"
                                        onClick={() => markAsRead(notification.id)}
                                        title="Mark as read"
                                    >
                                        ✓
                                    </button>
                                )}
                                <button
                                    className="fuel-notification-action-btn delete"
                                    onClick={() => deleteNotification(notification.id)}
                                    title="Delete notification"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FuelNotifications;
