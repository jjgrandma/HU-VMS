import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HU_COLLEGES, getDepartmentsByCollege } from '../../data/colleges';
import './adminTheme.css';
import './addUser.css';

const ROLES = [
  { label: 'User',                  value: 'USER' },
  { label: 'Driver',                value: 'DRIVER' },
  { label: 'Transport Officer',     value: 'TRANSPORT' },
  { label: 'Fuel Station Officer',  value: 'FUEL_OFFICER' },
  { label: 'Gate Security Officer', value: 'GATE_OFFICER' },
  { label: 'College Dean',          value: 'DEAN' },
  { label: 'Admin',                 value: 'ADMIN' },
];

const UNIT_TYPES = [
  { label: 'Department',           value: 'DEPARTMENT' },
  { label: 'College Office',       value: 'COLLEGE' },
  { label: 'Cafeteria',            value: 'CAFETERIA' },
  { label: 'Clinic',               value: 'CLINIC' },
  { label: 'Agricultural Activity',value: 'AGRICULTURAL_ACTIVITY' },
  { label: 'Other',                value: 'OTHER' },
];

const EMPTY = {
  name: '', username: '', email: '', password: '',
  confirmPassword: '', role: '', department: '', phone: '', employeeId: '',
  unitType: '', unitName: '', collegeName: '', selectedCollege: '',
};

export default function AddUser() {
  const navigate = useNavigate();
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const set = (e) => {
    const { name, value } = e.target;
    setForm(f => {
      const updated = { ...f, [name]: value };
      // When college changes for a USER, reset department
      if (name === 'selectedCollege') {
        updated.unitName = '';
        updated.department = '';
        updated.collegeName = value; // store college name for routing
      }
      // When unitType changes, reset college/dept selection
      if (name === 'unitType') {
        updated.selectedCollege = '';
        updated.unitName = '';
        updated.department = '';
        updated.collegeName = '';
      }
      // When DEAN selects a college, auto-fill the code
      if (name === 'collegeName') {
        const col = HU_COLLEGES.find(c => c.name === value);
        if (col) updated.unitName = col.code;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation
    if (!form.name.trim())        { setError('Full name is required.');         return; }
    if (!form.username.trim())    { setError('Username is required.');           return; }
    if (!form.email.trim())       { setError('Email is required.');              return; }
    if (!form.role)               { setError('Please select a role.');           return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }

    // Department users must have college + department selected
    if (form.role === 'USER' && form.unitType === 'DEPARTMENT') {
      if (!form.selectedCollege) { setError('Please select the college for this department user.'); return; }
      if (!form.unitName.trim()) { setError('Please select the department.'); return; }
    }
    // Dean must have a college selected
    if (form.role === 'DEAN' && !form.collegeName.trim()) {
      setError('Please select the college this dean oversees.'); return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name:        form.name.trim(),
          username:    form.username.trim(),
          email:       form.email.trim(),
          password:    form.password,
          role:        form.role,
          department:  form.role === 'USER' && form.unitType === 'DEPARTMENT'
                         ? (form.unitName.trim() || form.department.trim())  // from cascade
                         : form.department.trim(),                            // free text for others
          phone:       form.phone.trim(),
          employeeId:  form.employeeId.trim(),
          unitType:    form.unitType    || undefined,
          unitName:    form.unitName.trim()    || undefined,
          collegeName: (form.role === 'USER' && form.selectedCollege)
                         ? form.selectedCollege
                         : (form.collegeName.trim() || undefined),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to create user.');
        return;
      }

      setSuccess(`User "${data.user?.username || form.username}" created successfully!`);
      setForm(EMPTY);
      // Scroll to top so the success banner is visible
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => navigate('/admin/manage-users'), 4000);
    } catch (err) {
      setError('Cannot connect to server. Make sure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-user-container">
      <h1>Add New User</h1>

      <div className="form-card">
        {/* Error banner */}
        {error && (
          <div style={{
            padding: '14px 18px', borderRadius: 10, marginBottom: 20,
            background: '#fef2f2', color: '#dc2626',
            border: '2px solid #fecaca', fontSize: 15, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            ❌ {error}
          </div>
        )}

        {/* Success toast — fixed overlay, always visible */}
        {success && (
          <div style={{
            position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
            zIndex: 9999, minWidth: 340, maxWidth: 520,
            background: '#fff', borderRadius: 14,
            boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            border: '2px solid #86efac',
            padding: '20px 24px',
            display: 'flex', alignItems: 'flex-start', gap: 14,
            animation: 'slideDown 0.3s ease',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, flexShrink: 0,
            }}>✅</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#15803d', marginBottom: 4 }}>
                User Created Successfully!
              </div>
              <div style={{ fontSize: 14, color: '#374151', marginBottom: 12 }}>
                {success}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => navigate('/admin/manage-users')}
                  style={{
                    background: '#16a34a', color: '#fff', border: 'none',
                    borderRadius: 8, padding: '7px 18px', cursor: 'pointer',
                    fontSize: 13, fontWeight: 700,
                  }}>
                  View Users →
                </button>
                <button onClick={() => setSuccess('')}
                  style={{
                    background: '#f1f5f9', color: '#374151', border: 'none',
                    borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600,
                  }}>
                  Add Another
                </button>
              </div>
            </div>
            <button onClick={() => setSuccess('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20, lineHeight: 1, padding: 0, flexShrink: 0 }}>
              ×
            </button>
          </div>
        )}

        <style>{`
          @keyframes slideDown {
            from { opacity: 0; transform: translateX(-50%) translateY(-16px); }
            to   { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
        `}</style>

        <div>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="text" name="name" value={form.name} onChange={set}
                placeholder="e.g. Abebe Kebede" />
            </div>
            <div className="form-group">
              <label>Username <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="text" name="username" value={form.username} onChange={set}
                placeholder="e.g. abebe.kebede" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="email" name="email" value={form.email} onChange={set}
                placeholder="abebe@haramaya.edu.et" />
            </div>
            <div className="form-group">
              <label>Role <span style={{ color: '#ef4444' }}>*</span></label>
              <select name="role" value={form.role} onChange={set}>
                <option value="">Select Role</option>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password <span style={{ color: '#ef4444' }}>*</span></label>
              <input type={showPw ? 'text' : 'password'} name="password"
                value={form.password} onChange={set} placeholder="Min 6 characters" />
              <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                🔒 This is a temporary password. The user should change it after first login. You cannot view it after saving.
              </p>
            </div>
            <div className="form-group">
              <label>Confirm Password <span style={{ color: '#ef4444' }}>*</span></label>
              <input type={showPw ? 'text' : 'password'} name="confirmPassword"
                value={form.confirmPassword} onChange={set} placeholder="Repeat password" />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
            color: '#6b7280', marginBottom: 16, cursor: 'pointer' }}>
            <input type="checkbox" checked={showPw} onChange={e => setShowPw(e.target.checked)} />
            Show passwords
          </label>

          <div className="form-row">
            <div className="form-group">
              <label>
                Department
                {form.role === 'USER' && form.unitType === 'DEPARTMENT'
                  ? <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 6 }}>(set via college/dept below)</span>
                  : <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 6 }}>(optional)</span>
                }
              </label>
              <input
                type="text"
                name="department"
                value={
                  // Auto-fill from department cascade for DEPARTMENT users
                  form.role === 'USER' && form.unitType === 'DEPARTMENT' && form.unitName
                    ? form.unitName
                    : form.department
                }
                onChange={set}
                placeholder="e.g. Computer Science"
                readOnly={form.role === 'USER' && form.unitType === 'DEPARTMENT' && !!form.unitName}
                style={{
                  background: form.role === 'USER' && form.unitType === 'DEPARTMENT' && form.unitName
                    ? '#f0fdf4'
                    : '#fff',
                  color: form.role === 'USER' && form.unitType === 'DEPARTMENT' && form.unitName
                    ? '#15803d'
                    : undefined,
                }}
              />
              {form.role === 'USER' && form.unitType === 'DEPARTMENT' && form.unitName && (
                <p style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>
                  ✅ Auto-filled from department selection below
                </p>
              )}
            </div>
            <div className="form-group">
              <label>Employee / Student ID</label>
              <input type="text" name="employeeId" value={form.employeeId} onChange={set}
                placeholder="e.g. EMP-0042" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input type="text" name="phone" value={form.phone} onChange={set}
                placeholder="+251 9XX XXX XXX" />
            </div>
          </div>

          {/* College Dean Details — college dropdown + auto-populated departments count */}
          {form.role === 'DEAN' && (
            <div style={{
              background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
              border: '1px solid #c7d2fe',
              borderRadius: 12, padding: '18px 20px', marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 18 }}>🏛️</span>
                <span style={{ fontWeight: 700, color: '#3730a3', fontSize: 15 }}>College Dean Details</span>
              </div>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <div className="form-group">
                  <label>College <span style={{ color: '#ef4444' }}>*</span></label>
                  <select name="collegeName" value={form.collegeName} onChange={set}>
                    <option value="">Select college...</option>
                    {HU_COLLEGES.map(c => (
                      <option key={c.code} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  {form.collegeName && (() => {
                    const col = HU_COLLEGES.find(c => c.name === form.collegeName);
                    return col ? (
                      <p style={{ fontSize: 12, color: '#6366f1', marginTop: 4 }}>
                        🏛️ {col.departments.length} departments under this college. This dean will review all their requests.
                      </p>
                    ) : null;
                  })()}
                </div>
                <div className="form-group">
                  <label>College Code</label>
                  <input
                    type="text"
                    name="unitName"
                    value={form.unitName || (HU_COLLEGES.find(c => c.name === form.collegeName)?.code || '')}
                    onChange={set}
                    placeholder="e.g. CAES (auto-filled)"
                    readOnly={!!HU_COLLEGES.find(c => c.name === form.collegeName)}
                    style={{ background: HU_COLLEGES.find(c => c.name === form.collegeName) ? '#f8fafc' : '#fff' }}
                  />
                  <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                    Auto-filled from college selection.
                  </p>
                </div>
              </div>

              {/* Show departments list for selected college */}
              {form.collegeName && (() => {
                const col = HU_COLLEGES.find(c => c.name === form.collegeName);
                return col ? (
                  <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                      Departments under this college ({col.departments.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {col.departments.map(d => (
                        <span key={d} style={{ fontSize: 11, background: '#e0e7ff', color: '#3730a3', padding: '3px 10px', borderRadius: 20, fontWeight: 500 }}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {/* Organizational unit — shown only for USER role */}
          {form.role === 'USER' && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 16 }}>🏢</span>
                <span style={{ fontWeight: 700, color: '#374151', fontSize: 14 }}>Organizational Unit</span>
                <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 400 }}>(determines approval route)</span>
              </div>

              {/* Unit Type */}
              <div className="form-row">
                <div className="form-group">
                  <label>Unit Type <span style={{ color: '#ef4444' }}>*</span></label>
                  <select name="unitType" value={form.unitType} onChange={set}>
                    <option value="">Select unit type...</option>
                    {UNIT_TYPES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                  {form.unitType === 'DEPARTMENT' && (
                    <p style={{ fontSize: 12, color: '#2563eb', marginTop: 4 }}>
                      🏛️ Routes: Department → College Dean → Transport Officer
                    </p>
                  )}
                  {form.unitType && form.unitType !== 'DEPARTMENT' && (
                    <p style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>
                      ✅ Routes directly to Transport Officer
                    </p>
                  )}
                </div>

                {/* For DEPARTMENT: show college picker */}
                {form.unitType === 'DEPARTMENT' ? (
                  <div className="form-group">
                    <label>College <span style={{ color: '#ef4444' }}>*</span></label>
                    <select name="selectedCollege" value={form.selectedCollege} onChange={set}>
                      <option value="">Select college...</option>
                      {HU_COLLEGES.map(c => (
                        <option key={c.code} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    {form.selectedCollege && (() => {
                      const col = HU_COLLEGES.find(c => c.name === form.selectedCollege);
                      return col ? (
                        <p style={{ fontSize: 12, color: '#6366f1', marginTop: 4 }}>
                          {col.departments.length} departments available
                        </p>
                      ) : null;
                    })()}
                  </div>
                ) : (
                  /* For non-DEPARTMENT: free text unit name */
                  <div className="form-group">
                    <label>Unit Name</label>
                    <input type="text" name="unitName" value={form.unitName} onChange={set}
                      placeholder="e.g. Main Cafeteria, University Clinic" />
                  </div>
                )}
              </div>

              {/* Department dropdown — only shown when college is selected */}
              {form.unitType === 'DEPARTMENT' && form.selectedCollege && (
                <div className="form-row" style={{ marginTop: 4 }}>
                  <div className="form-group">
                    <label>Department <span style={{ color: '#ef4444' }}>*</span></label>
                    <select name="unitName" value={form.unitName} onChange={set}>
                      <option value="">Select department...</option>
                      {getDepartmentsByCollege(form.selectedCollege).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    {form.unitName && (
                      <p style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>
                        ✅ {form.unitName} — {form.selectedCollege}
                      </p>
                    )}
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                    {/* Department count badge */}
                    {(() => {
                      const col = HU_COLLEGES.find(c => c.name === form.selectedCollege);
                      return col ? (
                        <div style={{ background: '#e0e7ff', borderRadius: 10, padding: '10px 14px', width: '100%' }}>
                          <div style={{ fontSize: 22, fontWeight: 800, color: '#4338ca' }}>{col.departments.length}</div>
                          <div style={{ fontSize: 12, color: '#6366f1' }}>departments in this college</div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" onClick={handleSubmit} className="btn-submit" disabled={loading}>
              {loading ? '⏳ Saving...' : '💾 Save User'}
            </button>
            <button type="button" className="btn-submit" style={{ background: '#6b7280' }}
              onClick={() => { setForm(EMPTY); setError(''); setSuccess(''); }}>
              🔄 Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
