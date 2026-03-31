import { useState, useEffect } from 'react';
import { getMe, updateMe, changePassword, getCurrentUser } from '../../api/api';
import './FuelStationProfile.css';

const FuelStationProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Password change state
    const [showPwdForm, setShowPwdForm] = useState(false);
    const [pwdData, setPwdData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwdError, setPwdError] = useState('');
    const [pwdSuccess, setPwdSuccess] = useState('');

    useEffect(() => {
        getMe()
            .then(data => {
                setProfile(data);
                setEditData({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    department: data.department || '',
                });
            })
            .catch(err => setErrorMsg(err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setErrorMsg('');
        try {
            const updated = await updateMe(editData);
            setProfile(updated);
            setIsEditing(false);
            setSuccessMsg('Profile updated successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const photoData = ev.target.result;
            try {
                const updated = await updateMe({ profilePhoto: photoData });
                setProfile(updated);
                localStorage.setItem('fuelStationProfilePhoto', photoData);
                window.dispatchEvent(new CustomEvent('fuelProfilePhotoUpdated', { detail: { profilePhoto: photoData } }));
                setSuccessMsg('Photo updated!');
                setTimeout(() => setSuccessMsg(''), 3000);
            } catch (err) {
                setErrorMsg(err.message);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwdError('');
        if (pwdData.newPassword !== pwdData.confirmPassword) { setPwdError('Passwords do not match'); return; }
        if (pwdData.newPassword.length < 8) { setPwdError('Password must be at least 8 characters'); return; }
        try {
            await changePassword(pwdData.currentPassword, pwdData.newPassword);
            setPwdSuccess('Password changed successfully!');
            setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => { setPwdSuccess(''); setShowPwdForm(false); }, 3000);
        } catch (err) {
            setPwdError(err.message);
        }
    };

    const initials = profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'FO';

    if (loading) return <p style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>Loading...</p>;

    return (
        <div className="fuel-profile-container">
            <div className="fuel-profile-header">
                <div className="fuel-profile-title">
                    <h2>⛽ My Profile</h2>
                    <p>Manage your account information</p>
                </div>
                {!isEditing ? (
                    <button className="fuel-btn-edit" onClick={() => setIsEditing(true)}>
                        ✏️ Edit Profile
                    </button>
                ) : (
                    <div className="fuel-edit-actions">
                        <button className="fuel-btn-save" onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : '💾 Save'}
                        </button>
                        <button className="fuel-btn-cancel" onClick={() => { setIsEditing(false); setEditData({ name: profile.name, email: profile.email, phone: profile.phone || '', department: profile.department || '' }); }}>
                            ❌ Cancel
                        </button>
                    </div>
                )}
            </div>

            {successMsg && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '10px 16px', borderRadius: 8, marginBottom: 16 }}>{successMsg}</div>}
            {errorMsg && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 16px', borderRadius: 8, marginBottom: 16 }}>{errorMsg}</div>}

            <div className="fuel-profile-content">
                {/* Photo */}
                <div className="fuel-profile-photo-section">
                    <div className="fuel-profile-photo">
                        {profile?.profilePhoto
                            ? <img src={profile.profilePhoto} alt="Profile" />
                            : <div className="fuel-profile-photo-placeholder" style={{ background: '#84cc16', color: '#fff', fontSize: 32, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', borderRadius: '50%' }}>{initials}</div>
                        }
                    </div>
                    <input type="file" id="fuelPhotoUpload" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                    <label htmlFor="fuelPhotoUpload" className="fuel-photo-upload-btn" style={{ cursor: 'pointer' }}>
                        📷 Change Photo
                    </label>
                </div>

                <div className="fuel-profile-info-grid">
                    {/* Personal Info */}
                    <div className="fuel-info-section">
                        <h3>👤 Personal Information</h3>
                        <div className="fuel-info-grid">
                            <div className="fuel-info-item">
                                <label>Full Name</label>
                                {isEditing
                                    ? <input type="text" value={editData.name} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} className="fuel-input" />
                                    : <span className="fuel-info-value">{profile?.name}</span>}
                            </div>
                            <div className="fuel-info-item">
                                <label>Username</label>
                                <span className="fuel-info-value fuel-readonly">{profile?.username}</span>
                            </div>
                            <div className="fuel-info-item">
                                <label>Role</label>
                                <span className="fuel-info-value fuel-readonly">{profile?.role}</span>
                            </div>
                            <div className="fuel-info-item">
                                <label>Employee ID</label>
                                <span className="fuel-info-value fuel-readonly">{profile?.employeeId || '—'}</span>
                            </div>
                            <div className="fuel-info-item">
                                <label>Email</label>
                                {isEditing
                                    ? <input type="email" value={editData.email} onChange={e => setEditData(p => ({ ...p, email: e.target.value }))} className="fuel-input" />
                                    : <span className="fuel-info-value">{profile?.email}</span>}
                            </div>
                            <div className="fuel-info-item">
                                <label>Phone</label>
                                {isEditing
                                    ? <input type="tel" value={editData.phone} onChange={e => setEditData(p => ({ ...p, phone: e.target.value }))} className="fuel-input" placeholder="+251-9xx-xxxxxx" />
                                    : <span className="fuel-info-value">{profile?.phone || '—'}</span>}
                            </div>
                            <div className="fuel-info-item">
                                <label>Department</label>
                                {isEditing
                                    ? <input type="text" value={editData.department} onChange={e => setEditData(p => ({ ...p, department: e.target.value }))} className="fuel-input" />
                                    : <span className="fuel-info-value">{profile?.department || '—'}</span>}
                            </div>
                            <div className="fuel-info-item">
                                <label>Member Since</label>
                                <span className="fuel-info-value fuel-readonly">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className="fuel-info-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3>🔒 Security</h3>
                            <button onClick={() => setShowPwdForm(!showPwdForm)}
                                style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                                {showPwdForm ? 'Cancel' : 'Change Password'}
                            </button>
                        </div>
                        {showPwdForm && (
                            <form onSubmit={handleChangePassword}>
                                {pwdError && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 8 }}>{pwdError}</p>}
                                {pwdSuccess && <p style={{ color: '#16a34a', fontSize: 13, marginBottom: 8 }}>{pwdSuccess}</p>}
                                <div className="fuel-info-grid">
                                    <div className="fuel-info-item">
                                        <label>Current Password</label>
                                        <input type="password" value={pwdData.currentPassword} onChange={e => setPwdData(p => ({ ...p, currentPassword: e.target.value }))} className="fuel-input" required />
                                    </div>
                                    <div className="fuel-info-item">
                                        <label>New Password</label>
                                        <input type="password" value={pwdData.newPassword} onChange={e => setPwdData(p => ({ ...p, newPassword: e.target.value }))} className="fuel-input" required />
                                    </div>
                                    <div className="fuel-info-item">
                                        <label>Confirm New Password</label>
                                        <input type="password" value={pwdData.confirmPassword} onChange={e => setPwdData(p => ({ ...p, confirmPassword: e.target.value }))} className="fuel-input" required />
                                    </div>
                                </div>
                                <button type="submit" className="fuel-btn-save" style={{ marginTop: 12 }}>Update Password</button>
                            </form>
                        )}
                        {!showPwdForm && <p style={{ color: '#6b7280', fontSize: 13 }}>Keep your account secure by using a strong password.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FuelStationProfile;
