import { useState, useEffect, useCallback } from 'react';
import { getFuelRequests, getFuelInventory } from '../../api/api';

const TYPE_META = {
  request: { icon: '📋', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'Request' },
  alert:   { icon: '⚠️', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Alert'   },
  info:    { icon: 'ℹ️', color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', label: 'Info'    },
  success: { icon: '✅', color: '#16a34a', bg: '#f0fdf4', border: '#86efac', label: 'Success' },
};

const timeAgo = (ts) => {
  if (!ts) return '';
  const diff = Math.floor((Date.now() - new Date(ts)) / 60000);
  if (diff < 1)  return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24)    return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'Yesterday' : `${d}d ago`;
};

const groupByTime = (notifs) => {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yest  = new Date(today); yest.setDate(yest.getDate() - 1);

  const groups = { Today: [], Yesterday: [], Earlier: [] };
  notifs.forEach(n => {
    const d = new Date(n.createdAt || Date.now());
    if (d >= today)      groups.Today.push(n);
    else if (d >= yest)  groups.Yesterday.push(n);
    else                 groups.Earlier.push(n);
  });
  return Object.entries(groups).filter(([, items]) => items.length > 0);
};

const FILTERS = [
  { key: 'all',     label: 'All' },
  { key: 'unread',  label: 'Unread' },
  { key: 'request', label: '📋 Requests' },
  { key: 'alert',   label: '⚠️ Alerts' },
  { key: 'success', label: '✅ Success' },
  { key: 'info',    label: 'ℹ️ Info' },
];

export default function FuelNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter]               = useState('all');
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [readIds, setReadIds]             = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('fuel_notif_read') || '[]')); }
    catch { return new Set(); }
  });
  const [dismissedIds, setDismissedIds]   = useState(new Set());
  const [expandedId, setExpandedId]       = useState(null);

  const persistRead = (ids) => {
    localStorage.setItem('fuel_notif_read', JSON.stringify([...ids]));
  };

  const buildNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const [requests, inventory] = await Promise.all([getFuelRequests(), getFuelInventory()]);
      const notifs = [];

      requests.filter(r => r.status === 'pending').forEach(r => notifs.push({
        id: `pending-${r._id}`, type: 'request',
        title: 'New Fuel Request',
        message: `${r.driverName} requested ${r.requestedLiters}L ${r.fuelType} for ${r.destination}`,
        detail: `Vehicle: ${r.vehiclePlate}${r.vehicleModel ? ` · ${r.vehicleModel}` : ''}`,
        createdAt: r.createdAt,
      }));

      requests.filter(r => r.status === 'approved').forEach(r => notifs.push({
        id: `approved-${r._id}`, type: 'request',
        title: 'Ready to Dispense',
        message: `${r.driverName} — ${r.permittedLiters}L ${r.fuelType} approved`,
        detail: `Approved by ${r.approvedBy || 'Transport Officer'} · ${r.vehiclePlate}`,
        createdAt: r.approvedAt || r.updatedAt,
        action: 'Dispense now',
      }));

      requests.filter(r => r.status === 'confirmed').forEach(r => notifs.push({
        id: `confirmed-${r._id}`, type: 'success',
        title: 'Driver Confirmed Receipt',
        message: `${r.driverName} confirmed receiving ${r.dispensedLiters}L ${r.fuelType}`,
        detail: `Vehicle: ${r.vehiclePlate}`,
        createdAt: r.confirmedAt || r.updatedAt,
      }));

      requests.filter(r => r.status === 'dispensed').forEach(r => {
        const hoursAgo = (Date.now() - new Date(r.dispensedAt)) / 3600000;
        notifs.push({
          id: `dispensed-${r._id}`,
          type: hoursAgo > 2 ? 'alert' : 'info',
          title: hoursAgo > 2 ? 'Awaiting Confirmation' : 'Fuel Dispensed',
          message: `${r.dispensedLiters}L ${r.fuelType} dispensed to ${r.driverName}`,
          detail: hoursAgo > 2 ? `Dispensed ${Math.floor(hoursAgo)}h ago — driver hasn't confirmed yet` : `Waiting for driver confirmation`,
          createdAt: r.dispensedAt,
        });
      });

      inventory.forEach(inv => {
        if (!inv.capacity) return;
        const p = (inv.available / inv.capacity) * 100;
        if (p <= 20) notifs.push({
          id: `inv-crit-${inv.fuelType}`, type: 'alert',
          title: `${inv.fuelType} Critically Low`,
          message: `Only ${inv.available}L remaining — ${p.toFixed(1)}% of capacity`,
          detail: `Tank capacity: ${inv.capacity}L · Immediate refill recommended`,
          createdAt: inv.updatedAt,
        });
        else if (p <= 40) notifs.push({
          id: `inv-low-${inv.fuelType}`, type: 'alert',
          title: `${inv.fuelType} Running Low`,
          message: `${inv.fuelType} at ${p.toFixed(1)}% — ${inv.available}L remaining`,
          detail: `Consider scheduling a refill soon`,
          createdAt: inv.updatedAt,
        });
      });

      notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(notifs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    buildNotifications(false);
    const iv = setInterval(() => buildNotifications(true), 30000);
    return () => clearInterval(iv);
  }, [buildNotifications]);

  const isRead = (n) => readIds.has(n.id);

  const markRead = (id) => {
    setReadIds(prev => {
      const next = new Set([...prev, id]);
      persistRead(next);
      return next;
    });
  };

  const markAllRead = () => {
    const next = new Set(notifications.map(n => n.id));
    setReadIds(next);
    persistRead(next);
  };

  const dismiss = (e, id) => {
    e.stopPropagation();
    markRead(id);
    setDismissedIds(prev => new Set([...prev, id]));
  };

  const visible = notifications.filter(n => !dismissedIds.has(n.id));
  const unread  = visible.filter(n => !isRead(n)).length;

  const filtered = visible.filter(n => {
    if (filter === 'unread')  return !isRead(n);
    if (filter === 'all')     return true;
    return n.type === filter;
  });

  const grouped = groupByTime(filtered);

  return (
    <div style={{ padding: '28px 28px 48px', maxWidth: 780, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Notifications</h1>
            {unread > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 20, animation: 'notifPop 0.3s ease' }}>
                {unread} new
              </span>
            )}
            {/* Live pulse */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'notifPulse 2s ease-in-out infinite' }} />
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Live</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
            {unread > 0 ? `${unread} unread notification${unread !== 1 ? 's' : ''}` : 'You\'re all caught up!'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {unread > 0 && (
            <button onClick={markAllRead}
              style={{ padding: '8px 14px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              ✓ Mark all read
            </button>
          )}
          <button onClick={() => buildNotifications(false)} disabled={refreshing}
            style={{ padding: '8px 14px', background: '#f8fafc', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ display: 'inline-block', animation: refreshing ? 'notifSpin 0.7s linear infinite' : 'none' }}>🔄</span>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── Filter pills ── */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
        {FILTERS.map(f => {
          const active = filter === f.key;
          const count  = f.key === 'all' ? visible.length
                       : f.key === 'unread' ? unread
                       : visible.filter(n => n.type === f.key).length;
          return (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 700, transition: 'all 0.2s',
                background: active ? '#0f172a' : '#f1f5f9',
                color: active ? '#fff' : '#64748b',
                boxShadow: active ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
              }}>
              {f.label}
              {count > 0 && (
                <span style={{ marginLeft: 6, background: active ? 'rgba(255,255,255,0.2)' : '#e2e8f0', color: active ? '#fff' : '#64748b', padding: '1px 6px', borderRadius: 10, fontSize: 10, fontWeight: 800 }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Notification list ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <div style={{ fontSize: 36, marginBottom: 10, animation: 'notifSpin 1s linear infinite', display: 'inline-block' }}>🔔</div>
          <div style={{ fontSize: 14 }}>Loading notifications...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            {filter === 'unread' ? 'All caught up!' : 'No notifications'}
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>
            {filter === 'unread' ? 'No unread notifications right now.' : 'Nothing to show for this filter.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {grouped.map(([groupLabel, items]) => (
            <div key={groupLabel}>
              {/* Group label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {groupLabel}
                </span>
                <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
                <span style={{ fontSize: 11, color: '#cbd5e1' }}>{items.length}</span>
              </div>

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map(n => {
                  const meta    = TYPE_META[n.type] || TYPE_META.info;
                  const read    = isRead(n);
                  const open    = expandedId === n.id;

                  return (
                    <div key={n.id}
                      onClick={() => { markRead(n.id); setExpandedId(open ? null : n.id); }}
                      style={{
                        background: read ? '#fff' : meta.bg,
                        border: `1px solid ${read ? '#e2e8f0' : meta.border}`,
                        borderLeft: `4px solid ${read ? '#e2e8f0' : meta.color}`,
                        borderRadius: 12,
                        padding: '14px 16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        opacity: read ? 0.85 : 1,
                        boxShadow: read ? 'none' : `0 2px 10px ${meta.color}18`,
                        position: 'relative',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(3px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${meta.color}22`; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = read ? 'none' : `0 2px 10px ${meta.color}18`; }}
                    >
                      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        {/* Icon */}
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: read ? '#f1f5f9' : meta.bg, border: `1px solid ${read ? '#e2e8f0' : meta.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                          {meta.icon}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <span style={{ fontSize: 13, fontWeight: read ? 600 : 800, color: '#0f172a' }}>{n.title}</span>
                              {!read && (
                                <div style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                              <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>{timeAgo(n.createdAt)}</span>
                              <button onClick={(e) => dismiss(e, n.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', fontSize: 16, lineHeight: 1, padding: '0 2px' }}
                                title="Dismiss">×</button>
                            </div>
                          </div>

                          <p style={{ margin: '3px 0 0', fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{n.message}</p>

                          {/* Expanded detail */}
                          {open && n.detail && (
                            <div style={{ marginTop: 8, padding: '8px 10px', background: 'rgba(0,0,0,0.03)', borderRadius: 8, fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                              {n.detail}
                            </div>
                          )}

                          {/* Type badge + action */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, background: read ? '#f1f5f9' : meta.bg, color: read ? '#94a3b8' : meta.color, border: `1px solid ${read ? '#e2e8f0' : meta.border}`, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {meta.label}
                            </span>
                            {n.action && !read && (
                              <span style={{ fontSize: 11, color: meta.color, fontWeight: 700 }}>
                                → {n.action}
                              </span>
                            )}
                            {n.detail && (
                              <span style={{ fontSize: 11, color: '#94a3b8' }}>
                                {open ? '▲ Less' : '▼ More'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes notifPop    { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes notifPulse  { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }
        @keyframes notifSpin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
