import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, getDeanRequests } from '../../api/api';
import { HU_COLLEGES } from '../../data/colleges';

const NAV_ITEMS = [
  { path: '/dean/requests', label: '📋 Requests' },
  { path: '/dean/history',  label: '📜 Approval History' },
];

const PRIORITY_COLORS = {
  emergency: { bg: '#fef2f2', color: '#dc2626', dot: '#dc2626' },
  high:      { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b' },
  normal:    { bg: '#eff6ff', color: '#2563eb', dot: '#3b82f6' },
  low:       { bg: '#f0fdf4', color: '#16a34a', dot: '#22c55e' },
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function DeanLayout({ onLogout }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = getCurrentUser();
  const panelRef  = useRef(null);

  const [pendingRequests, setPendingRequests] = useState([]);
  const [showPanel, setShowPanel]             = useState(false);
  const [lastSeen, setLastSeen]               = useState(() => {
    // Persist last-seen timestamp so badge resets after viewing
    return parseInt(localStorage.getItem('dean_notif_seen') || '0', 10);
  });
  const [isRefreshing, setIsRefreshing]       = useState(false);

  // ── Fetch pending requests for this dean's college ──────────────────────
  const fetchPending = useCallback(async (silent = true) => {
    if (!silent) setIsRefreshing(true);
    try {
      // Server-side filtered: only returns requests from this dean's college
      const all = await getDeanRequests({ status: 'pending' });
      // Further filter to only those currently waiting for the dean
      const mine = all.filter(r => r.currentApproverRole === 'COLLEGE_DEAN');
      setPendingRequests(mine);
    } catch (_) { /* silent fail */ }
    finally { if (!silent) setIsRefreshing(false); }
  }, []);

  // Initial load + poll every 30 seconds
  useEffect(() => {
    fetchPending(false);
    const interval = setInterval(() => fetchPending(true), 30000);
    return () => clearInterval(interval);
  }, [fetchPending]);

  // Close panel when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowPanel(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Unread count = requests newer than lastSeen
  const unreadCount = pendingRequests.filter(
    r => new Date(r.createdAt).getTime() > lastSeen
  ).length;

  const handleBellClick = () => {
    setShowPanel(p => !p);
    if (!showPanel) {
      // Mark all as seen
      const now = Date.now();
      setLastSeen(now);
      localStorage.setItem('dean_notif_seen', String(now));
    }
  };

  const handleNotifClick = (req) => {
    setShowPanel(false);
    navigate('/dean/requests');
  };

  const col = HU_COLLEGES.find(c => c.name === user?.collegeName);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f1f5f9' }}>

      {/* ── Top Header ── */}
      <header style={{
        height: 60, background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', flexShrink: 0, position: 'sticky', top: 0, zIndex: 200,
        boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
      }}>
        {/* Left: logo + college name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 22 }}>🏛️</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
              {user?.collegeName
                ? user.collegeName.replace('College of ', '')
                : 'College Dean Portal'}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>HU-VMS · Dean Dashboard</div>
          </div>
        </div>

        {/* Right: notification bell + user avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

          {/* Notification Bell */}
          <div ref={panelRef} style={{ position: 'relative' }}>
            <button
              onClick={handleBellClick}
              style={{
                position: 'relative', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
                width: 40, height: 40, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 18,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              title="Department request notifications"
            >
              🔔
              {/* Unread badge */}
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  background: '#ef4444', color: '#fff',
                  fontSize: 10, fontWeight: 800, minWidth: 18, height: 18,
                  borderRadius: 9, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', padding: '0 4px',
                  border: '2px solid #1e1b4b',
                  animation: 'deanBadgePop 0.3s ease',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {/* Pending dot (even if all seen) */}
              {pendingRequests.length > 0 && unreadCount === 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: -2,
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#f59e0b', border: '2px solid #1e1b4b',
                }} />
              )}
            </button>

            {/* ── Notification Panel ── */}
            {showPanel && (
              <div style={{
                position: 'absolute', top: 48, right: 0,
                width: 380, maxHeight: 520,
                background: '#fff', borderRadius: 16,
                boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
                border: '1px solid #e2e8f0',
                overflow: 'hidden', zIndex: 1000,
                animation: 'deanPanelSlide 0.2s ease',
              }}>

                {/* Panel header */}
                <div style={{
                  padding: '16px 18px 12px',
                  background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                      🔔 Department Requests
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                      {pendingRequests.length > 0
                        ? `${pendingRequests.length} awaiting your review`
                        : 'No pending requests'}
                    </div>
                  </div>
                  <button
                    onClick={() => { setIsRefreshing(true); fetchPending(false); }}
                    disabled={isRefreshing}
                    style={{
                      background: 'rgba(255,255,255,0.12)', border: 'none',
                      borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
                      fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    <span style={{ display: 'inline-block', animation: isRefreshing ? 'deanSpin 0.8s linear infinite' : 'none' }}>
                      🔄
                    </span>
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>

                {/* Requests list */}
                <div style={{ overflowY: 'auto', maxHeight: 400 }}>
                  {pendingRequests.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                      <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>All caught up!</div>
                      <div style={{ fontSize: 12 }}>No pending requests from your departments.</div>
                    </div>
                  ) : (
                    pendingRequests.map((req, i) => {
                      const pc = PRIORITY_COLORS[req.priority] || PRIORITY_COLORS.normal;
                      const isNew = new Date(req.createdAt).getTime() > lastSeen;
                      return (
                        <div
                          key={req._id}
                          onClick={() => handleNotifClick(req)}
                          style={{
                            padding: '14px 18px',
                            borderBottom: i < pendingRequests.length - 1 ? '1px solid #f1f5f9' : 'none',
                            cursor: 'pointer', transition: 'background 0.15s',
                            background: isNew ? '#fefce8' : '#fff',
                            display: 'flex', gap: 12, alignItems: 'flex-start',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                          onMouseLeave={e => e.currentTarget.style.background = isNew ? '#fefce8' : '#fff'}
                        >
                          {/* Priority dot */}
                          <div style={{
                            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                            background: pc.bg, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: 16, marginTop: 1,
                          }}>
                            🚗
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {req.requester}
                              </div>
                              <div style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>
                                {timeAgo(req.createdAt)}
                              </div>
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              📍 {req.destination}
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              🎯 {req.purpose}
                            </div>
                            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                              {req.unitName && (
                                <span style={{ fontSize: 10, background: '#e0e7ff', color: '#4338ca', padding: '2px 7px', borderRadius: 20, fontWeight: 600 }}>
                                  {req.unitName}
                                </span>
                              )}
                              <span style={{ fontSize: 10, background: pc.bg, color: pc.color, padding: '2px 7px', borderRadius: 20, fontWeight: 600, border: `1px solid ${pc.dot}33` }}>
                                {req.priority?.toUpperCase()}
                              </span>
                              {isNew && (
                                <span style={{ fontSize: 10, background: '#fef3c7', color: '#92400e', padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>
                                  NEW
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                {pendingRequests.length > 0 && (
                  <div style={{ padding: '12px 18px', borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
                    <button
                      onClick={() => { setShowPanel(false); navigate('/dean/requests'); }}
                      style={{
                        width: '100%', padding: '9px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        color: '#fff', border: 'none', borderRadius: 8, fontSize: 13,
                        fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      Review All {pendingRequests.length} Request{pendingRequests.length !== 1 ? 's' : ''} →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 800, color: '#fff', flexShrink: 0,
              border: '2px solid rgba(255,255,255,0.2)',
            }}>
              {user?.name?.charAt(0).toUpperCase() || 'D'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>
                {user?.name || 'Dean'}
              </span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>College Dean</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Body: sidebar + content ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        <aside style={{
          width: 220, background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',
          display: 'flex', flexDirection: 'column', flexShrink: 0,
          boxShadow: '2px 0 12px rgba(0,0,0,0.15)',
        }}>

          {/* User info */}
          <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
              {user?.collegeName || 'College Dean'}
            </div>
            {col && (
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#a5b4fc' }}>{col.departments.length}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.3 }}>
                  departments<br/>under your college
                </span>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '12px 10px' }}>
            {NAV_ITEMS.map(item => {
              const active = location.pathname.startsWith(item.path);
              return (
                <button key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 8,
                    border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 600,
                    background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                    color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                    marginBottom: 4, transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? 'rgba(255,255,255,0.15)' : 'transparent'; }}
                >
                  <span>{item.label}</span>
                  {/* Show pending count badge on Requests nav item */}
                  {item.path === '/dean/requests' && pendingRequests.length > 0 && (
                    <span style={{
                      background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800,
                      minWidth: 18, height: 18, borderRadius: 9, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                    }}>
                      {pendingRequests.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div style={{ padding: '14px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button onClick={onLogout}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}>
              🚪 Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes deanBadgePop {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.2); }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes deanPanelSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes deanSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
