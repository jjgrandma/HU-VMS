import { useState, useEffect } from 'react';
import { getFuelRequests, dispenseFuel, getCurrentUser } from '../../api/api';
import './FuelDispenseForm.css';

export default function FuelDispenseForm() {
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [selectedRequest, setSelectedRequest]   = useState(null);
  const [dispensedLiters, setDispensedLiters]   = useState('');
  const [loading, setLoading]   = useState(true);
  const [dispensing, setDispensing] = useState(false);
  const [toast, setToast]       = useState(null);
  const currentUser = getCurrentUser();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchApproved = () => {
    getFuelRequests()
      .then(data => {
        if (Array.isArray(data)) {
          setApprovedRequests(data.filter(r => r.status === 'approved'));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApproved(); }, []);

  const handleDispense = async (e) => {
    e.preventDefault();
    if (!selectedRequest) { showToast('Select a request to dispense', 'error'); return; }
    const liters = parseFloat(dispensedLiters);
    if (!liters || liters <= 0) { showToast('Enter valid liters amount', 'error'); return; }
    if (liters > selectedRequest.permittedLiters) {
      showToast(`Cannot exceed permitted amount: ${selectedRequest.permittedLiters}L`, 'error');
      return;
    }

    setDispensing(true);
    try {
      await dispenseFuel(selectedRequest._id, liters, currentUser?.name || 'Fuel Officer');
      showToast(`✅ ${liters}L dispensed to ${selectedRequest.driverName} successfully!`);
      setSelectedRequest(null);
      setDispensedLiters('');
      fetchApproved();
    } catch (err) {
      showToast(err.message || 'Failed to dispense fuel', 'error');
    } finally {
      setDispensing(false);
    }
  };

  return (
    <div className="fuel-dispense-page">
      {toast && (
        <div style={{
          position:'fixed', top:20, right:20, zIndex:9999,
          background: toast.type === 'error' ? '#dc2626' : '#16a34a',
          color:'#fff', padding:'12px 20px', borderRadius:10,
          fontWeight:600, fontSize:14, boxShadow:'0 4px 16px rgba(0,0,0,0.15)',
        }}>{toast.msg}</div>
      )}

      <div className="fuel-page-header">
        <h2>Dispense Fuel</h2>
        <p>Dispense fuel for approved requests</p>
      </div>

      {loading ? (
        <p style={{ color:'#9ca3af', padding:40, textAlign:'center' }}>Loading approved requests...</p>
      ) : approvedRequests.length === 0 ? (
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:60, textAlign:'center', color:'#9ca3af' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>⛽</div>
          <p style={{ fontSize:16, fontWeight:600 }}>No approved requests to dispense</p>
          <p style={{ fontSize:13, marginTop:4 }}>Requests approved by the Transport Officer will appear here.</p>
        </div>
      ) : (
        <div className="fd-layout">
          {/* Left: approved requests list */}
          <div className="fd-requests-list">
            <h3>Approved Requests ({approvedRequests.length})</h3>
            {approvedRequests.map(req => (
              <div
                key={req._id}
                className={`fd-request-card ${selectedRequest?._id === req._id ? 'selected' : ''}`}
                onClick={() => { setSelectedRequest(req); setDispensedLiters(String(req.permittedLiters || req.requestedLiters)); }}
              >
                <div className="fd-req-header">
                  <span className="fd-req-driver">{req.driverName}</span>
                  <span className="fd-req-badge">{req.fuelType}</span>
                </div>
                <div className="fd-req-details">
                  <span>🚗 {req.vehicleType || req.vehiclePlate || '—'}</span>
                  <span>📋 Requested: {req.requestedLiters}L</span>
                  <span>✅ Permitted: <strong>{req.permittedLiters}L</strong></span>
                </div>
                {req.approvedBy && (
                  <div className="fd-req-approved">Approved by: {req.approvedBy}</div>
                )}
              </div>
            ))}
          </div>

          {/* Right: dispense form */}
          <div className="fd-form-panel">
            {!selectedRequest ? (
              <div className="fd-select-prompt">
                <div style={{ fontSize:48 }}>👈</div>
                <p>Select a request from the list to dispense fuel</p>
              </div>
            ) : (
              <div>
                <h3>Dispense Fuel</h3>

                <div className="fd-summary-card">
                  <div className="fd-summary-row"><span>Driver</span><strong>{selectedRequest.driverName}</strong></div>
                  <div className="fd-summary-row"><span>Vehicle</span><strong>{selectedRequest.vehicleType || selectedRequest.vehiclePlate || '—'}</strong></div>
                  <div className="fd-summary-row"><span>Fuel Type</span><strong>{selectedRequest.fuelType}</strong></div>
                  <div className="fd-summary-row"><span>Requested</span><strong>{selectedRequest.requestedLiters}L</strong></div>
                  <div className="fd-summary-row"><span>Permitted</span><strong style={{ color:'#16a34a' }}>{selectedRequest.permittedLiters}L</strong></div>
                  {selectedRequest.destination && (
                    <div className="fd-summary-row"><span>Destination</span><strong>{selectedRequest.destination}</strong></div>
                  )}
                </div>

                <form onSubmit={handleDispense}>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>
                      Actual Liters to Dispense *
                    </label>
                    <input
                      type="number"
                      value={dispensedLiters}
                      onChange={e => setDispensedLiters(e.target.value)}
                      min="0.1"
                      max={selectedRequest.permittedLiters}
                      step="0.1"
                      required
                      style={{ width:'100%', padding:'12px 14px', border:'2px solid #e5e7eb', borderRadius:8, fontSize:16, fontWeight:700, boxSizing:'border-box' }}
                    />
                    <p style={{ fontSize:12, color:'#6b7280', marginTop:4 }}>
                      Max: {selectedRequest.permittedLiters}L (permitted by Transport Officer)
                    </p>
                  </div>

                  <div style={{ display:'flex', gap:10 }}>
                    <button type="submit" disabled={dispensing} style={{
                      flex:1, padding:'14px', background:'#16a34a', color:'#fff',
                      border:'none', borderRadius:10, fontSize:15, fontWeight:700,
                      cursor:'pointer', opacity: dispensing ? 0.6 : 1,
                    }}>
                      {dispensing ? 'Dispensing...' : `⛽ Dispense ${dispensedLiters || 0}L`}
                    </button>
                    <button type="button" onClick={() => setSelectedRequest(null)} style={{
                      padding:'14px 20px', background:'#f3f4f6', color:'#374151',
                      border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer',
                    }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
