import { useState, useEffect } from 'react';
import { getFuelRequests, getFuelInventory } from '../../api/api';
import './FuelNotifications.css';

const FuelNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
        // Refresh every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
        try {
            const [requests, inventory] = await Promise.all([
                getFuelRequests(),
                getFuelInventory(),
            ]);

            const notifs = [];

            // New pending requests (driver submitted, waiting for transport officer)
            requests.filter(r => r.status === 'pending').forEach(r => {
                notifs.push({
                    id: `pending-${r._id}`,
                    title: 'New Fuel Request',
                    message: `${r.driverName} requested ${r.requestedLiters}L ${r.fuelType} for ${r.destination}`,
                    createdAt: r.createdAt,
                    read: false,
                    type: 'request',
                });
            });

            // Approved requests ready to dispense
            requests.filter(r => r.status === 'approved').forEach(r => {
                notifs.push({
                    id: `approved-${r._id}`,
                    title: 'Ready to Dispense',
                    message: `${r.driverName} — ${r.permittedLiters}L ${r.fuelType} approved by ${r.approvedBy || 'Transport Officer'}`,
                    createdAt: r.approvedAt || r.updatedAt,
                    read: false,
                    type: 'request',
                });
            });

            // Driver confirmed receipt
            requests.filter(r => r.status === 'confirmed').forEach(r => {
                notifs.push({
                    id: `confirmed-${r._id}`,
                    title: 'Driver Confirmed Receipt',
                    message: `${r.driverName} confirmed receiving ${r.dispensedLiters}L ${r.fuelType}`,
                    createdAt: r.confirmedAt || r.updatedAt,
                    read: true,
                    type: 'success',
                });
            });

            // Dispensed but not yet confirmed
            requests.filter(r => r.status === 'dispensed').forEach(r => {
                const dispensedAt = new Date(r.dispensedAt);
                const hoursAgo = (Date.now() - dispensedAt) / 3600000;
                notifs.push({
                    id: `dispensed-${r._id}`,
                    title: hoursAgo > 2 ? 'Awaiting Driver Confirmation' : 'Fuel Dispensed',
                    message: `${r.dispensedLiters}L ${r.fuelType} dispensed to ${r.driverName} — waiting for driver confirmation`,
                    createdAt: r.dispensedAt,
                    read: hoursAgo <= 1,
                    type: hoursAgo > 2 ? 'alert' : 'info',
                });
            });

            // Low inventory alerts
            inventory.forEach(inv => {
                if (!inv.capacity) return;
                const pct = (inv.available / inv.capacity) * 100;
                if (pct <= 20) {
                    notifs.push({
                        id: `inv-${inv.fuelType}`,
                        title: `${inv.fuelType} Critically Low`,
                        message: `${inv.fuelType} is at ${pct.toFixed(1)}% — only ${inv.available}L remaining out of ${inv.capacity}L capacity`,
                        createdAt: inv.updatedAt,
                        read: false,
                        type: 'alert',
                    });
                } else if (pct <= 40) {
                    notifs.push({
                        id: `inv-low-${inv.fuelType}`,
                        title: `${inv.fuelType} Running Low`,
                        message: `${inv.fuelType} is at ${pct.toFixed(1)}% — consider restocking soon`,
                        createdAt: inv.updatedAt,
                        read: true,
                        type: 'alert',
                    });
                }
            });

            // Sort newest first
            notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setNotifications(notifs);
        } catch (err) {
            console.error('Failed to load notifications:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const [readIds, setReadIds] = useState(new Set());

    const markAsRead = (id) => setReadIds(prev => new Set([...prev, id]));
    const markAllAsRead = () => setReadIds(new Set(notifications.map(n => n.id)));

    const isRead = (n) => n.read || readIds.has(n.id);
    const unreadCount = notifications.filter(n => !isRead(n)).length;

    const filtered = notifications.filter(n => {
        if (filter === 'unread') return !isRead(n);
        if (filter === 'all') return true;
        return n.type === filter;
    });

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const diff = Math.floor((Date.now() - new Date(timestamp)) / 60000);
        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff}m ago`;
        const h = Math.floor(diff / 60);
        if (h < 24) return `${h}h ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    const typeIcon = { request: '📋', alert: '⚠️', info: 'ℹ️', success: '✓' };

    return (
        <div className="fuel-notifications-page">
            <div className="fuel-notifications-header">
                <div className="fuel-notifications-title">
                    <h2>Notifications</h2>
                    <span className="fuel-notifications-count">
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {unreadCount > 0 && (
                        <button className="fuel-mark-all-read-btn" onClick={markAllAsRead}>
                            <span>✓</span> Mark All as Read
                        </button>
                    )}
                    <button className="fuel-mark-all-read-btn" onClick={loadNotifications}
                        style={{ background: '#f1f5f9', color: '#374151' }}>
                        🔄 Refresh
                    </button>
                </div>
            </div>

            <div className="fuel-notifications-filters">
                {['all', 'unread', 'request', 'alert', 'info', 'success'].map(f => (
                    <button key={f} className={`fuel-filter-btn ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}>
                        {f === 'all' && `All (${notifications.length})`}
                        {f === 'unread' && `Unread (${unreadCount})`}
                        {f === 'request' && '📋 Requests'}
                        {f === 'alert' && '⚠️ Alerts'}
                        {f === 'info' && 'ℹ️ Info'}
                        {f === 'success' && '✓ Success'}
                    </button>
                ))}
            </div>

            <div className="fuel-notifications-list-page">
                {loading ? (
                    <div className="fuel-no-notifications-page">
                        <p style={{ color: '#94a3b8' }}>Loading...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="fuel-no-notifications-page">
                        <span className="fuel-no-notifications-icon-page">🔔</span>
                        <h3>No notifications</h3>
                        <p>You're all caught up!</p>
                    </div>
                ) : filtered.map(n => (
                    <div key={n.id}
                        className={`fuel-notification-card ${isRead(n) ? 'read' : 'unread'} ${n.type}`}
                        onClick={() => markAsRead(n.id)}>
                        <div className="fuel-notification-card-icon">{typeIcon[n.type]}</div>
                        <div className="fuel-notification-card-content">
                            <div className="fuel-notification-card-header">
                                <strong className="fuel-notification-card-title">{n.title}</strong>
                                {!isRead(n) && <div className="fuel-notification-card-unread-dot"></div>}
                            </div>
                            <p className="fuel-notification-card-message">{n.message}</p>
                            <span className="fuel-notification-card-time">{formatTime(n.createdAt)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FuelNotifications;
