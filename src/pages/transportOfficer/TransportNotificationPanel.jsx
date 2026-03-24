import { useState, useEffect } from 'react';
import { X, FileText, Clock, CheckCircle, XCircle, Inbox, Download, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { getReceivedReports } from '../../api/api';
import './TransportNotificationPanel.css';

const TransportNotificationPanel = ({ isOpen, onClose, onBadgeCount }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getReceivedReports()
      .then(data => {
        setReports(data);
        onBadgeCount?.(data.length);
      })
      .catch(err => console.error('Failed to load notifications:', err))
      .finally(() => setLoading(false));
  }, [isOpen]);

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
    doc.text(`Downloaded: ${now}`, 14, 36);
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

  if (!isOpen) return null;

  return (
    <div className="tnp-overlay" onClick={onClose}>
      <div className="tnp-panel" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="tnp-header">
          <div>
            <h3>🔔 Notifications</h3>
            <span className="tnp-sub">{reports.length} report{reports.length !== 1 ? 's' : ''} received</span>
          </div>
          <button className="tnp-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="tnp-body">
          {loading ? (
            <div className="tnp-empty">Loading...</div>
          ) : reports.length === 0 ? (
            <div className="tnp-empty">
              <Inbox size={40} style={{ opacity: 0.35, marginBottom: 10 }} />
              <p>No notifications yet.</p>
              <p style={{ fontSize: 12, opacity: 0.6 }}>Reports sent by Admin will appear here.</p>
            </div>
          ) : (
            reports.map(report => (
              <div key={report._id} className="tnp-item">
                <div className="tnp-item-icon">
                  <FileText size={20} />
                </div>
                <div className="tnp-item-body">
                  <div className="tnp-item-title">{report.reportName}</div>
                  <div className="tnp-item-meta">
                    <span className={`tnp-badge ${report.reportType === 'vehicle_usage' ? 'blue' : 'green'}`}>
                      {report.reportType === 'vehicle_usage' ? 'Vehicle Usage' : 'Driver Activity'}
                    </span>
                    <span className="tnp-time">
                      <Clock size={11} /> {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="tnp-item-sent">Sent by {report.sentBy} · {report.data?.length || 0} rows</div>
                  <div className="tnp-item-actions">
                    <button className="tnp-btn pdf" onClick={() => handleDownloadPDF(report)}>
                      <FileText size={13} /> PDF
                    </button>
                    <button className="tnp-btn excel" onClick={() => handleDownloadExcel(report)}>
                      <FileSpreadsheet size={13} /> Excel
                    </button>
                  </div>
                </div>
                <div className="tnp-item-status">
                  <CheckCircle size={16} className="tnp-received-icon" />
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default TransportNotificationPanel;
