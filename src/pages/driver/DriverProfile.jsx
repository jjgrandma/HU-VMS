import { useState, useEffect, useRef } from 'react';
import { getCurrentUser } from '../../api/api';
import './DriverProfile.css';

const BASE = 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');

export default function DriverProfile() {
  const currentUser = getCurrentUser();
  const [data, setData] = useState({
    name: '', email: '', phone: '', department: '',
    employeeId: '', username: '', role: '', createdAt: '',
    profilePhoto: null,
    cbeAccount: { accountNumber: '', accountName: '' },
  });
  const [tab, setTab] = useState('info');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [cbe, setCbe] = useState({ accountNumber: '', accountName: '' });
  const fileRef = useRef();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const t = token(); if (!t) return;
    fetch(`${BASE}/users/me`, { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.json())
      .then(u => {
        setData(p => ({ ...p, ...u, profilePhoto: u.profilePhoto || null }));
        setCbe({
          accountNumber: u.cbeAccount?.accountNumber || '',
          accountName:   u.cbeAccount?.accountName   || '',
        });
      })
      .catch(console.error);
  }, []);

  const initials = data.name
    ? data.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'D';

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Max 5MB', 'error'); return; }
    setUploading(true);
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const MAX = 400; let { width, height } = img;
      if (width > height) { if (width > MAX) { height = height * MAX / width; width = MAX; } }
      else { if (height > MAX) { width = width * MAX / height; height = MAX; } }
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      const base64 = canvas.toDataURL('image/jpeg', 0.8);
      try {
        const res = await fetch(`${BASE}/users/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
          body: JSON.stringify({ profilePhoto: base64 }),
        });
        const d = await res.json(); if (!res.ok) throw new Error(d.message);
        setData(p => ({ ...p, profilePhoto: base64 }));
        showToast('Photo updated!');
      } catch (err) { showToast(err.message || 'Failed', 'error'); }
      finally { setUploading(false); }
    };
    img.src = url;
  };

  const saveInfo = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch(`${BASE}/users/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ name: data.name, email: data.email, phone: data.phone }),
      });
      const d = await res.json(); if (!res.ok) throw new Error(d.message);
      showToast('Profile saved!');
    } catch (err) { showToast(err.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const savePwd = async (e) => {
    e.preventDefault();
    if (pwd.newPwd !== pwd.confirm) { showToast('Passwords do not match', 'error'); return; }
    if (pwd.newPwd.length < 8) { showToast('Min 8 characters', 'error'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/users/me/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ currentPassword: pwd.current, newPassword: pwd.newPwd }),
      });
      const d = await res.json(); if (!res.ok) throw new Error(d.message);
      showToast('Password changed!');
      setPwd({ current: '', newPwd: '', confirm: '' });
    } catch (err) { showToast(err.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const saveCbe = async (e) => {
    e.preventDefault();
    // Validate: CBE account numbers are 13 digits
    const acc = cbe.accountNumber.trim();
    if (!/^\d{13}$/.test(acc)) {
      showToast('CBE account number must be exactly 13 digits', 'error');
      return;
    }
    if (!cbe.accountName.trim()) {
      showToast('Account holder name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/users/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ cbeAccount: { accountNumber: acc, accountName: cbe.accountName.trim() } }),
      });
      const d = await res.json(); if (!res.ok) throw new Error(d.message);
      setData(p => ({ ...p, cbeAccount: d.cbeAccount }));
      showToast('CBE account saved! You will receive cash allowances to this account.');
    } catch (err) { showToast(err.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const hasCbe = data.cbeAccount?.accountNumber?.length === 13;

  return (
    <div className="dp-page">
      {toast && <div className={`driver-toast ${toast.type}`}>{toast.msg}</div>}
      <div className="driver-page-header"><h2>My Profile</h2><p>Manage your account</p></div>

      <div className="dp-container">
        {/* ── Avatar + info header ── */}
        <div className="dp-header">
          <div className="dp-avatar-wrap">
            <div className="dp-avatar" onClick={() => fileRef.current.click()} title="Change photo">
              {data.profilePhoto
                ? <img src={data.profilePhoto} alt="avatar" />
                : <span>{initials}</span>}
              <div className="dp-avatar-overlay">{uploading ? '⏳' : '📷'}</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
            <button className="dp-photo-btn" onClick={() => fileRef.current.click()} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Change Photo'}
            </button>
          </div>
          <div className="dp-header-info">
            <div className="dp-name-row">
              <h2>{data.name || '—'}</h2>
              <span className="dp-role-badge">{data.role || 'DRIVER'}</span>
              {hasCbe && (
                <span className="dp-cbe-badge">
                  🏦 CBE Linked
                </span>
              )}
            </div>
            <div className="dp-info-grid">
              {[
                ['Username',    `@${data.username || '—'}`],
                ['Email',       data.email || '—'],
                ['Phone',       data.phone || '—'],
                ['Department',  data.department || '—'],
                ['Employee ID', data.employeeId || '—'],
                ['Member Since', data.createdAt
                  ? new Date(data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  : '—'],
              ].map(([l, v]) => (
                <div key={l} className="dp-info-item">
                  <span className="dp-info-label">{l}</span>
                  <span className="dp-info-value">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="dp-tabs">
          <button className={`dp-tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>
            Personal Info
          </button>
          <button className={`dp-tab ${tab === 'payment' ? 'active' : ''}`} onClick={() => setTab('payment')}>
            💳 Payment Method
            {!hasCbe && <span className="dp-tab-alert">!</span>}
          </button>
          <button className={`dp-tab ${tab === 'pwd' ? 'active' : ''}`} onClick={() => setTab('pwd')}>
            Change Password
          </button>
        </div>

        {/* ── Personal Info ── */}
        {tab === 'info' && (
          <form onSubmit={saveInfo} className="dp-form">
            <div className="dp-form-row">
              <div className="driver-form-group">
                <label>Full Name</label>
                <input value={data.name} onChange={e => setData(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="driver-form-group">
                <label>Email</label>
                <input type="email" value={data.email} onChange={e => setData(p => ({ ...p, email: e.target.value }))} required />
              </div>
            </div>
            <div className="dp-form-row">
              <div className="driver-form-group">
                <label>Phone</label>
                <input value={data.phone} onChange={e => setData(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="driver-form-group">
                <label>Department</label>
                <input value={data.department} disabled />
              </div>
            </div>
            <button type="submit" className="driver-submit-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {/* ── Payment Method (CBE) ── */}
        {tab === 'payment' && (
          <div className="dp-payment-section">

            {/* Info banner */}
            <div className="dp-cbe-info-banner">
              <div className="dp-cbe-info-icon">🏦</div>
              <div>
                <div className="dp-cbe-info-title">Commercial Bank of Ethiopia (CBE)</div>
                <div className="dp-cbe-info-sub">
                  When a trip requires a cash allowance for road refueling, the amount will be
                  transferred to this CBE account before your departure.
                </div>
              </div>
            </div>

            {/* Current status */}
            {hasCbe ? (
              <div className="dp-cbe-current">
                <div className="dp-cbe-current-header">
                  <span className="dp-cbe-check">✓</span>
                  <span>CBE Account Linked</span>
                </div>
                <div className="dp-cbe-current-details">
                  <div className="dp-cbe-detail-row">
                    <span className="dp-cbe-detail-label">Account Number</span>
                    <span className="dp-cbe-detail-value dp-cbe-masked">
                      {data.cbeAccount.accountNumber.slice(0, 4)}
                      {'•'.repeat(5)}
                      {data.cbeAccount.accountNumber.slice(-4)}
                    </span>
                  </div>
                  <div className="dp-cbe-detail-row">
                    <span className="dp-cbe-detail-label">Account Holder</span>
                    <span className="dp-cbe-detail-value">{data.cbeAccount.accountName}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="dp-cbe-missing">
                <span>⚠️</span>
                <span>No payment method added. You won&apos;t receive cash allowances until you add your CBE account.</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={saveCbe} className="dp-form" style={{ marginTop: 24 }}>
              <div className="dp-cbe-form-title">
                {hasCbe ? '✏️ Update CBE Account' : '➕ Add CBE Account'}
              </div>

              <div className="dp-form-row">
                <div className="driver-form-group">
                  <label>CBE Account Number <span className="dp-required">*</span></label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={13}
                    placeholder="1000XXXXXXXXX (13 digits)"
                    value={cbe.accountNumber}
                    onChange={e => setCbe(p => ({ ...p, accountNumber: e.target.value.replace(/\D/g, '') }))}
                    className={cbe.accountNumber.length > 0 && cbe.accountNumber.length !== 13 ? 'dp-input-error' : ''}
                    required
                  />
                  {cbe.accountNumber.length > 0 && cbe.accountNumber.length !== 13 && (
                    <span className="dp-field-error">Must be exactly 13 digits ({cbe.accountNumber.length}/13)</span>
                  )}
                </div>
                <div className="driver-form-group">
                  <label>Account Holder Name <span className="dp-required">*</span></label>
                  <input
                    type="text"
                    placeholder="Full name as registered in CBE"
                    value={cbe.accountName}
                    onChange={e => setCbe(p => ({ ...p, accountName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="dp-cbe-note">
                <strong>Important:</strong> Make sure the account number and name exactly match your CBE account.
                Incorrect details may delay or prevent cash allowance transfers.
              </div>

              <button type="submit" className="driver-submit-btn dp-cbe-save-btn" disabled={saving}>
                {saving ? 'Saving...' : hasCbe ? '💾 Update Account' : '🏦 Save CBE Account'}
              </button>
            </form>
          </div>
        )}

        {/* ── Change Password ── */}
        {tab === 'pwd' && (
          <form onSubmit={savePwd} className="dp-form">
            <div className="driver-form-group">
              <label>Current Password</label>
              <input type="password" value={pwd.current} onChange={e => setPwd(p => ({ ...p, current: e.target.value }))} required />
            </div>
            <div className="dp-form-row">
              <div className="driver-form-group">
                <label>New Password</label>
                <input type="password" value={pwd.newPwd} onChange={e => setPwd(p => ({ ...p, newPwd: e.target.value }))} required />
              </div>
              <div className="driver-form-group">
                <label>Confirm Password</label>
                <input type="password" value={pwd.confirm} onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))} required />
              </div>
            </div>
            <button type="submit" className="driver-submit-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
