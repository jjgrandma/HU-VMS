import { useState, useEffect } from 'react';
import { getFuelRequests, getFuelInventory, getCurrentUser } from '../../api/api';
import pdfGenerator from '../../utils/pdfGenerator';

const today = new Date().toISOString().split('T')[0];

const Field = ({ label, children, error }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
      {label}
    </label>
    {children}
    {error && <p style={{ fontSize: 12, color: '#dc2626', margin: '4px 0 0' }}>{error}</p>}
  </div>
);

const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0',
  borderRadius: 8, fontSize: 13, boxSizing: 'border-box', outline: 'none',
  background: '#fff', color: '#0f172a',
};

export default function FuelReports() {
  const currentUser = getCurrentUser();

  const [config, setConfig] = useState({
    reportType: 'daily',
    startDate: today,
    endDate: today,
    recipient: 'Admin',
    includeSummary: true,
    includeTransactions: true,
    includeInventory: true,
  });

  const [liveData, setLiveData]       = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => { fetchData(); }, [config.startDate, config.endDate]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [requests, inventory] = await Promise.all([getFuelRequests(), getFuelInventory()]);

      const start = new Date(config.startDate); start.setHours(0, 0, 0, 0);
      const end   = new Date(config.endDate);   end.setHours(23, 59, 59, 999);

      const inRange        = requests.filter(r => { const d = new Date(r.createdAt); return d >= start && d <= end; });
      const dispensedRange = inRange.filter(r => r.status === 'dispensed');
      const allDispensed   = requests.filter(r => r.status === 'dispensed');
      const allPending     = requests.filter(r => r.status === 'pending');

      const sum = (arr, key) => arr.reduce((s, r) => s + (r[key] || 0), 0);

      const diesel = inventory.find(i => i.fuelType === 'Diesel');
      const petrol = inventory.find(i => i.fuelType === 'Petrol');

      setLiveData({
        totalDispensed:   sum(allDispensed, 'dispensedLiters'),
        dieselDispensed:  sum(allDispensed.filter(r => r.fuelType === 'Diesel'), 'dispensedLiters'),
        petrolDispensed:  sum(allDispensed.filter(r => r.fuelType === 'Petrol'), 'dispensedLiters'),
        completed:        allDispensed.length,
        pending:          allPending.length,
        dieselAvailable:  diesel?.available || 0,
        petrolAvailable:  petrol?.available || 0,
        transactions:     dispensedRange,
        rangeTotal:       sum(dispensedRange, 'dispensedLiters'),
        rangeDiesel:      sum(dispensedRange.filter(r => r.fuelType === 'Diesel'), 'dispensedLiters'),
        rangePetrol:      sum(dispensedRange.filter(r => r.fuelType === 'Petrol'), 'dispensedLiters'),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const set = (field, value) => setConfig(p => ({ ...p, [field]: value }));

  const handleGenerate = async () => {
    if (!liveData) return;
    setIsGenerating(true);
    try {
      pdfGenerator.generateFuelStationReport({
        reportType: 'fuel_station',
        period: config.reportType.charAt(0).toUpperCase() + config.reportType.slice(1),
        startDate: config.startDate,
        endDate: config.endDate,
        totalFuel: liveData.rangeTotal.toFixed(1),
        dieselDispensed: liveData.rangeDiesel.toFixed(1),
        petrolDispensed: liveData.rangePetrol.toFixed(1),
        totalTransactions: liveData.transactions.length,
        completedTransactions: liveData.transactions.length,
        pendingAuthorizations: liveData.pending,
        dieselAvailable: liveData.dieselAvailable,
        petrolAvailable: liveData.petrolAvailable,
        recipient: config.recipient,
        generatedBy: currentUser?.name || 'Fuel Station Officer',
        date: new Date().toLocaleDateString(),
        transactions: liveData.transactions,
        includeTransactions: config.includeTransactions,
        includeInventory: config.includeInventory,
        includeSummary: config.includeSummary,
      }, config.recipient);
      alert(`✅ Report generated!\nPeriod: ${config.startDate} → ${config.endDate}\nRecipient: ${config.recipient}`);
      setShowPreview(false);
    } catch (err) {
      alert('❌ Error generating report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ padding: '28px 28px 48px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Generate Reports</h1>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
          Create and download fuel station reports for administration
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

        {/* ── Left: Config + Preview ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Config card */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              📄 Report Configuration
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <Field label="Report Type">
                <select value={config.reportType} onChange={e => set('reportType', e.target.value)} style={inputStyle}>
                  <option value="daily">Daily Report</option>
                  <option value="weekly">Weekly Report</option>
                  <option value="monthly">Monthly Report</option>
                </select>
              </Field>

              <Field label="Send To">
                <select value={config.recipient} onChange={e => set('recipient', e.target.value)} style={inputStyle}>
                  <option value="Admin">Administration Office</option>
                  <option value="Transport Office">Transport Office</option>
                  <option value="Both">Both Offices</option>
                </select>
              </Field>

              <Field label="Start Date">
                <input type="date" value={config.startDate} onChange={e => set('startDate', e.target.value)} style={inputStyle} />
              </Field>

              <Field label="End Date">
                <input type="date" value={config.endDate} onChange={e => set('endDate', e.target.value)} style={inputStyle} />
              </Field>
            </div>

            {/* Include checkboxes */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Include in Report</div>
              <div style={{ display: 'flex', gap: 20 }}>
                {[
                  ['includeSummary',      'Summary Statistics'],
                  ['includeTransactions', 'Transaction Details'],
                  ['includeInventory',    'Inventory Status'],
                ].map(([key, label]) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                    <input type="checkbox" checked={config[key]} onChange={e => set(key, e.target.checked)}
                      style={{ width: 15, height: 15, accentColor: '#2563eb', cursor: 'pointer' }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { fetchData(); setShowPreview(true); }}
                style={{ padding: '10px 20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                👁 Preview
              </button>
              <button onClick={handleGenerate} disabled={isGenerating || loadingData}
                style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: (isGenerating || loadingData) ? 'not-allowed' : 'pointer', opacity: (isGenerating || loadingData) ? 0.7 : 1 }}>
                {isGenerating ? '⏳ Generating...' : '📄 Generate & Download'}
              </button>
            </div>
          </div>

          {/* Preview card */}
          {showPreview && liveData && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>📊 Report Preview</span>
                <button onClick={() => setShowPreview(false)}
                  style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#94a3b8' }}>×</button>
              </div>
              <div style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
                  <strong style={{ color: '#0f172a' }}>{config.reportType.toUpperCase()} REPORT</strong>
                  &nbsp;·&nbsp; {config.startDate} → {config.endDate}
                  &nbsp;·&nbsp; To: {config.recipient}
                </div>

                {config.includeSummary && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Summary (selected period)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                      {[
                        ['Total Dispensed', `${liveData.rangeTotal.toFixed(1)}L`, '#2563eb'],
                        ['Diesel',          `${liveData.rangeDiesel.toFixed(1)}L`, '#16a34a'],
                        ['Petrol',          `${liveData.rangePetrol.toFixed(1)}L`, '#d97706'],
                        ['Transactions',    liveData.transactions.length,          '#7c3aed'],
                      ].map(([label, value, color]) => (
                        <div key={label} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {config.includeInventory && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Current Inventory</div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {[
                        ['Diesel Available', `${liveData.dieselAvailable}L`, '#16a34a'],
                        ['Petrol Available', `${liveData.petrolAvailable}L`, '#d97706'],
                      ].map(([label, value, color]) => (
                        <div key={label} style={{ flex: 1, background: '#f8fafc', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, color: '#374151' }}>{label}</span>
                          <span style={{ fontSize: 15, fontWeight: 800, color }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ fontSize: 12, color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                  Generated by <strong>{currentUser?.name || 'Fuel Station Officer'}</strong> · {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Live Stats ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
            Live Overview (All Time)
          </div>

          {[
            { label: 'Total Dispensed',  value: loadingData ? '…' : `${liveData?.totalDispensed.toFixed(1)}L`, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: '⛽' },
            { label: 'Diesel Dispensed', value: loadingData ? '…' : `${liveData?.dieselDispensed.toFixed(1)}L`, color: '#16a34a', bg: '#f0fdf4', border: '#86efac', icon: '🟢' },
            { label: 'Petrol Dispensed', value: loadingData ? '…' : `${liveData?.petrolDispensed.toFixed(1)}L`, color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '🟠' },
            { label: 'Completed',        value: loadingData ? '…' : liveData?.completed,  color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: '✅' },
            { label: 'Pending',          value: loadingData ? '…' : liveData?.pending,    color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '⏳' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{s.label}</span>
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
