import { useState, useEffect } from 'react';
import { FileText, Download, FileSpreadsheet, Clock, Inbox, Send, BarChart2 } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { getReceivedReports, submitReportRequest, getCurrentUser } from '../../api/api';
import './TransportReports.css';

const API = 'http://localhost:5000/api';
const tok = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` });

// ── Department Usage Report sub-tab ──────────────────────────
function DepartmentUsageReport() {
  const [from, setFrom]       = useState('');
  const [to, setTo]           = useState('');
  const [dept, setDept]       = useState('');
  const [rows, setRows]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [pricePerLiter, setPricePerLiter] = useState(0);

  useEffect(() => {
    fetch(`${API}/system-config`, { headers: tok() })
      .then(r => r.json())
      .then(d => setPricePerLiter(d.pricePerLiter?.Diesel || 0))
      .catch(() => {});
  }, []);

  const run = async () => {
    if (!from || !to) { alert('Select a date range'); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ from, to });
      if (dept) params.set('department', dept);
      const r = await fetch(`${API}/requests?${params}&limit=500`, { headers: tok() });
      const data = await r.json();

      // Aggregate by department
      const map = {};
      (Array.isArray(data) ? data : []).forEach(req => {
        const d = req.department || req.unitName || req.collegeName || 'Unknown';
        if (!map[d]) map[d] = { department: d, trips: 0, totalKm: 0, totalFuel: 0 };
        map[d].trips++;
        if (req.estimatedDistanceKm) map[d].totalKm += req.estimatedDistanceKm;
        if (req.estimatedFuelLiters) map[d].totalFuel += req.estimatedFuelLiters;
      });
      setRows(Object.values(map).sort((a, b) => b.trips - a.trips));
    } finally { setLoading(false); }
  };

  const exportPDF = () => {
    if (!rows?.length) return;
    const doc = new jsPDF();
    doc.setFillColor(30, 64, 175); doc.rect(0, 0, 210, 24, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('HU-VMS — Department Usage Report', 14, 16);
    doc.setTextColor(80, 80, 80); doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${from} to ${to}  |  Generated: ${new Date().toLocaleString()}`, 14, 32);
    doc.autoTable({
      head: [['Department', 'Trips', 'Total km', 'Total Fuel (L)', 'Est. Cost (ETB)']],
      body: rows.map(r => [r.department, r.trips, r.totalKm.toFixed(0), r.totalFuel.toFixed(1), (r.totalFuel * pricePerLiter).toFixed(2)]),
      startY: 38, theme: 'grid',
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 245, 255] },
      styles: { fontSize: 8, cellPadding: 3 },
    });
    doc.save('department_usage_report.pdf');
  };

  const exportExcel = () => {
    if (!rows?.length) return;
    const ws = XLSX.utils.json_to_sheet(rows.map(r => ({ Department: r.department, Trips: r.trips, 'Total km': r.totalKm.toFixed(0), 'Total Fuel (L)': r.totalFuel.toFixed(1), 'Est. Cost (ETB)': (r.totalFuel * pricePerLiter).toFixed(2) })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dept Usage');
    XLSX.writeFile(wb, 'department_usage_report.xlsx');
  };

  return (
    <div>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 22px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Department (optional)</label>
            <input value={dept} onChange={e => setDept(e.target.value)} placeholder="Filter by department…" style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, width: 200 }} />
          </div>
          <button onClick={run} disabled={loading} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {loading ? 'Running…' : 'Generate'}
          </button>
          {rows?.length > 0 && (
            <>
              <button onClick={exportPDF} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><Download size={13} /> PDF</button>
              <button onClick={exportExcel} style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><Download size={13} /> Excel</button>
            </>
          )}
        </div>
      </div>

      {rows !== null && (
        rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>No trip data found for the selected period.</div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Department', 'Trips', 'Total km', 'Total Fuel (L)', 'Est. Cost (ETB)'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: '#1e293b' }}>{r.department}</td>
                    <td style={{ padding: '10px 16px', color: '#374151' }}>{r.trips}</td>
                    <td style={{ padding: '10px 16px', color: '#374151' }}>{r.totalKm.toFixed(0)} km</td>
                    <td style={{ padding: '10px 16px', color: '#374151' }}>{r.totalFuel.toFixed(1)} L</td>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: '#2563eb' }}>
                      {pricePerLiter > 0 ? `ETB ${(r.totalFuel * pricePerLiter).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

const TransportReports = () => {
  const [mainTab, setMainTab] = useState('received');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [reqType, setReqType] = useState('vehicle_usage');
  const [reqPeriod, setReqPeriod] = useState('monthly');
  const [reqMessage, setReqMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState(null);

  useEffect(() => {
    getReceivedReports()
      .then(data => setReports(data))
      .catch(err => console.error('Failed to load reports:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      await submitReportRequest({ reportType: reqType, period: reqPeriod, message: reqMessage });
      setSubmitMsg({ type: 'success', text: 'Report request submitted. Admin will generate and send it to you.' });
      setReqMessage('');
      setReqPeriod('monthly');
    } catch (err) {
      setSubmitMsg({ type: 'error', text: err.message || 'Failed to submit request.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPDF = (report) => {
    const doc = new jsPDF();
    const now = new Date().toLocaleString();

    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Haramaya University — VMS', 14, 12);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(report.reportName, 14, 22);

    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.text(`Generated: ${now}`, 14, 36);
    doc.text(`Sent by: ${report.sentBy}`, 14, 42);

    if (report.columns?.length && report.data?.length) {
      doc.autoTable({
        head: [report.columns],
        body: report.data,
        startY: 50,
        theme: 'grid',
        headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 245, 255] },
        styles: { fontSize: 8, cellPadding: 3 },
      });
    } else {
      doc.setFontSize(11);
      doc.setTextColor(120);
      doc.text('No data available in this report.', 14, 60);
    }

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('HU-VMS Confidential', 14, doc.internal.pageSize.height - 8);
    doc.save(`${report.reportName.replace(/\s+/g, '_')}.pdf`);
  };

  const handleDownloadExcel = (report) => {
    if (!report.data?.length || !report.columns?.length) {
      alert('No data to export.');
      return;
    }
    const rows = report.data.map(row => {
      const obj = {};
      report.columns.forEach((col, i) => { obj[col] = row[i] ?? ''; });
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, report.reportName.slice(0, 31));
    XLSX.writeFile(wb, `${report.reportName.replace(/\s+/g, '_')}.xlsx`);
  };

  const selStyle = {
    padding: '9px 12px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'var(--text-primary)',
    fontSize: '13px',
  };

  const filtered = filter === 'all' ? reports
    : reports.filter(r => r.reportType === filter);

  return (
    <div className="transport-reports-page">
      <div className="dashboard-header">
        <div>
          <h1>Reports</h1>
          <p>Reports sent to you by the Admin, and on-demand usage reports</p>
        </div>
      </div>

      {/* Main tab switcher */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {[['received', '📥 Received Reports'], ['dept-usage', '🏛️ Department Usage'], ['request', '📋 Request a Report']].map(([key, label]) => (
          <button key={key} onClick={() => setMainTab(key)}
            style={{ padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
              background: mainTab === key ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: mainTab === key ? 'var(--text-primary, #fff)' : 'var(--text-secondary, #aaa)' }}>
            {label}
          </button>
        ))}
      </div>

      {mainTab === 'dept-usage' && <DepartmentUsageReport />}

      {mainTab === 'request' && (
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '24px',
        }}>
        <h3 style={{ marginBottom: '16px', fontSize: '15px', color: 'var(--text-primary)' }}>
          📋 Request a Report from Admin
        </h3>
        <form onSubmit={handleRequestSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>

          {/* Report Type */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: '1', minWidth: '180px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Report Type</label>
            <select value={reqType} onChange={e => setReqType(e.target.value)} style={selStyle}>
              <option value="vehicle_usage">Vehicle Usage Report</option>
              <option value="driver_activity">Driver Activity Report</option>
              <option value="trip_summary">Trip Summary Report</option>
              <option value="fuel_consumption">Fuel Consumption Report</option>
              <option value="request_analytics">Request Analytics Report</option>
              <option value="driver_performance">Driver Performance Report</option>
              <option value="maintenance">Maintenance Report</option>
            </select>
          </div>

          {/* Period */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: '1', minWidth: '150px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Period</label>
            <select value={reqPeriod} onChange={e => setReqPeriod(e.target.value)} style={selStyle}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>

          {/* Message */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: '2', minWidth: '200px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Note (optional)</label>
            <input
              type="text"
              value={reqMessage}
              onChange={e => setReqMessage(e.target.value)}
              placeholder="e.g. Need report for March 2025"
              style={selStyle}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '9px 20px', borderRadius: '8px', border: 'none',
              background: 'var(--primary-color, #1e40af)', color: '#fff',
              fontWeight: 600, fontSize: '13px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              opacity: submitting ? 0.7 : 1, whiteSpace: 'nowrap',
            }}
          >
            <Send size={14} /> {submitting ? 'Sending...' : 'Submit Request'}
          </button>
        </form>

        {submitMsg && (
          <div style={{
            marginTop: '10px', padding: '8px 12px', borderRadius: '6px', fontSize: '13px',
            background: submitMsg.type === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            color: submitMsg.type === 'success' ? '#4ade80' : '#f87171',
            border: `1px solid ${submitMsg.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          }}>
            {submitMsg.text}
          </div>
        )}
      </div>
      )}

      {mainTab === 'received' && (
      <>
      {/* Filter */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['all', 'vehicle_usage', 'driver_activity'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '7px 16px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              background: filter === f ? 'var(--primary-color, #1e40af)' : 'rgba(255,255,255,0.08)',
              color: filter === f ? '#fff' : 'var(--text-secondary, #aaa)',
              transition: '0.2s',
            }}
          >
            {f === 'all' ? 'All' : f === 'vehicle_usage' ? 'Vehicle Usage' : 'Driver Activity'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          Loading reports...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          <Inbox size={48} style={{ marginBottom: '12px', opacity: 0.4 }} />
          <p>No reports received yet.</p>
          <p style={{ fontSize: '13px', marginTop: '6px', opacity: 0.6 }}>
            Reports sent by the Admin will appear here.
          </p>
        </div>
      ) : (
        <div className="reports-grid">
          {filtered.map(report => (
            <div key={report._id} className="report-card">
              <div className="rc-header">
                <div className="rc-icon">
                  <FileText size={24} />
                </div>
                <span className="rc-badge" style={{ background: 'rgba(30,64,175,0.12)', color: '#1e40af' }}>
                  {report.reportType?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Report'}
                </span>
              </div>

              <div className="rc-body">
                <h3>{report.reportName}</h3>
                <p>Sent by <strong>{report.sentBy}</strong></p>
              </div>

              <div className="rc-meta">
                <div className="rc-meta-item">
                  <Clock size={13} />
                  <span>{new Date(report.createdAt).toLocaleString()}</span>
                </div>
                <div className="rc-meta-item">
                  <span>{report.data?.length || 0} rows</span>
                </div>
              </div>

              <div className="rc-footer">
                <button
                  className="btn-text secondary"
                  onClick={() => handleDownloadPDF(report)}
                  title="Download PDF"
                >
                  <FileText size={14} /> PDF
                </button>
                <button
                  className="btn-text secondary"
                  onClick={() => handleDownloadExcel(report)}
                  title="Download Excel"
                >
                  <FileSpreadsheet size={14} /> Excel
                </button>
                <button
                  className="btn-icon primary-light"
                  onClick={() => handleDownloadPDF(report)}
                  title="Download"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default TransportReports;
