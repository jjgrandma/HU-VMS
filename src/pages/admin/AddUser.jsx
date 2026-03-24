import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../api/api';
import './adminTheme.css';
import './addUser.css';

const ROLES = [
  { label: 'User',                  value: 'USER' },
  { label: 'Driver',                value: 'DRIVER' },
  { label: 'Transport Officer',     value: 'TRANSPORT' },
  { label: 'Fuel Station Officer',  value: 'FUEL_OFFICER' },
  { label: 'Gate Security Officer', value: 'GATE_OFFICER' },
  { label: 'Admin',                 value: 'ADMIN' },
];

const EMPTY = {
  name: '', username: '', email: '', password: '',
  confirmPassword: '', role: '', department: '', phone: '', employeeId: '',
};

export default function AddUser() {
  const navigate   = useNavigate();
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [msg, setMsg]         = useState(null); // { type, text }

  const set = (e) => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setMsg(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim())     return setMsg({ type:'error', text:'Full name is required.' });
    if (!form.username.trim()) return setMsg({ type:'error', text:'Username is required.' });
    if (!form.email.trim())    return setMsg({ type:'error', text:'Email is required.' });
    if (!form.role)            return setMsg({ type:'error', text:'Please select a role.' });
    if (form.password.length < 6) return setMsg({ type:'error', text:'Password must be at least 6 characters.' });
    if (form.password !== form.confirmPassword) return setMsg({ type:'error', text:'Passwords do not match.' });

    setLoading(true);
    try {
      await registerUser({
        name:       form.name.trim(),
        username:   form.username.trim(),
        email:      form.email.trim(),
        password:   form.password,
        role:       form.role,
        department: form.department.trim(),
        phone:      form.phone.trim(),
        employeeId: form.employeeId.trim(),
      });
      setMsg({ type:'success', text:`User "${form.username}" created successfully!` });
      setForm(EMPTY);
    } catch (err) {
      setMsg({ type:'error', text: err.message || 'Failed to create user.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-user-container">
      <h1>Add New User</h1>

      <div className="form-card">
        {msg && (
          <div style={{
            padding:'12px 16px', borderRadius:8, marginBottom:20, fontSize:14, fontWeight:500,
            background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color:      msg.type === 'success' ? '#16a34a' : '#dc2626',
            border:    `1px solid ${msg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            display:'flex', alignItems:'center', gap:8,
          }}>
            {msg.type === 'success' ? '✅' : '❌'} {msg.text}
            {msg.type === 'success' && (
              <button onClick={() => navigate('/admin/manage-users')}
                style={{ marginLeft:'auto', background:'#16a34a', color:'#fff', border:'none',
                  borderRadius:6, padding:'4px 12px', cursor:'pointer', fontSize:13 }}>
                View Users →
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Row 1 */}
          <div className="form-row">
            <div className="form-group">
              <label>Full Name <span style={{color:'#ef4444'}}>*</span></label>
              <input type="text" name="name" value={form.name} onChange={set}
                placeholder="e.g. Abebe Kebede" required />
            </div>
            <div className="form-group">
              <label>Username <span style={{color:'#ef4444'}}>*</span></label>
              <input type="text" name="username" value={form.username} onChange={set}
                placeholder="e.g. abebe.kebede" required />
            </div>
          </div>

          {/* Row 2 */}
          <div className="form-row">
            <div className="form-group">
              <label>Email <span style={{color:'#ef4444'}}>*</span></label>
              <input type="email" name="email" value={form.email} onChange={set}
                placeholder="abebe@haramaya.edu.et" required />
            </div>
            <div className="form-group">
              <label>Role <span style={{color:'#ef4444'}}>*</span></label>
              <select name="role" value={form.role} onChange={set} required>
                <option value="">Select Role</option>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>

          {/* Row 3 — passwords */}
          <div className="form-row">
            <div className="form-group">
              <label>Password <span style={{color:'#ef4444'}}>*</span></label>
              <input type={showPw ? 'text' : 'password'} name="password" value={form.password}
                onChange={set} placeholder="Min 6 characters" required />
            </div>
            <div className="form-group">
              <label>Confirm Password <span style={{color:'#ef4444'}}>*</span></label>
              <input type={showPw ? 'text' : 'password'} name="confirmPassword"
                value={form.confirmPassword} onChange={set} placeholder="Repeat password" required />
            </div>
          </div>
          <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13,
            color:'#6b7280', marginBottom:16, cursor:'pointer' }}>
            <input type="checkbox" checked={showPw} onChange={e => setShowPw(e.target.checked)} />
            Show passwords
          </label>

          {/* Row 4 */}
          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <input type="text" name="department" value={form.department} onChange={set}
                placeholder="e.g. Computer Science" />
            </div>
            <div className="form-group">
              <label>Employee / Student ID</label>
              <input type="text" name="employeeId" value={form.employeeId} onChange={set}
                placeholder="e.g. EMP-0042" />
            </div>
          </div>

          {/* Row 5 */}
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input type="text" name="phone" value={form.phone} onChange={set}
                placeholder="+251 9XX XXX XXX" />
            </div>
          </div>

          <div style={{ display:'flex', gap:12, marginTop:8 }}>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : '💾 Save User'}
            </button>
            <button type="button" className="btn-submit"
              style={{ background:'#6b7280' }}
              onClick={() => { setForm(EMPTY); setMsg(null); }}>
              🔄 Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
