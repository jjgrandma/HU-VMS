import { useState } from 'react';
import './ExportButton.css';

const ExportButton = ({ data, filename, reportTitle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [timePeriod, setTimePeriod] = useState('all');
  const [selectedOfficers, setSelectedOfficers] = useState([]);
  const [exportFormat, setExportFormat] = useState('');

  // Mock transport officers - would come from API
  const transportOfficers = [
    { id: 1, name: 'John Smith', email: 'john.smith@transport.com' },
    { id: 2, name: 'Sarah Williams', email: 'sarah.williams@transport.com' },
    { id: 3, name: 'David Brown', email: 'david.brown@transport.com' },
    { id: 4, name: 'Emily Davis', email: 'emily.davis@transport.com' }
  ];

  const filterDataByPeriod = (data, period) => {
    // This is a mock filter - in real app, would filter by actual dates
    if (period === 'all') return data;
    
    const now = new Date();
    const filtered = data.filter((item, index) => {
      switch(period) {
        case 'daily':
          return index < Math.ceil(data.length * 0.1); // Last 10%
        case 'weekly':
          return index < Math.ceil(data.length * 0.3); // Last 30%
        case 'monthly':
          return index < Math.ceil(data.length * 0.5); // Last 50%
        case 'yearly':
          return true; // All data
        default:
          return true;
      }
    });
    return filtered;
  };

  const exportToPDF = (period) => {
    const filteredData = filterDataByPeriod(data, period);
    const printWindow = window.open('', '_blank');
    const tableHTML = document.querySelector('.table-container')?.innerHTML || '';
    
    const periodLabel = period === 'all' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle || 'Report'} - ${periodLabel}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #000;
            }
            h1 {
              color: #1e293b;
              margin-bottom: 10px;
            }
            .period-info {
              color: #64748b;
              font-size: 14px;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #1e293b;
              color: white;
              font-weight: 600;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            .badge, .status-badge, .priority-badge, .rating-badge, .efficiency-badge, .fuel-type-badge {
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h1>${reportTitle || 'Report'}</h1>
          <div class="period-info">
            <strong>Period:</strong> ${periodLabel}<br>
            <strong>Generated on:</strong> ${new Date().toLocaleString()}<br>
            <strong>Total Records:</strong> ${filteredData.length}
          </div>
          ${tableHTML}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setIsOpen(false);
    
    // Show share modal after export
    setExportFormat('PDF');
    setShowShareModal(true);
  };

  const exportToExcel = (period) => {
    const filteredData = filterDataByPeriod(data, period);
    
    if (!filteredData || filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(filteredData[0]);
    const periodLabel = period === 'all' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1);
    
    const csvContent = [
      `${reportTitle || 'Report'} - ${periodLabel}`,
      `Generated on: ${new Date().toLocaleString()}`,
      `Total Records: ${filteredData.length}`,
      '',
      headers.join(','),
      ...filteredData.map(row => 
        headers.map(header => {
          const value = row[header]?.toString() || '';
          return `"${value.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename || 'report'}_${period}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsOpen(false);
    
    // Show share modal after export
    setExportFormat('Excel');
    setShowShareModal(true);
  };

  const handleOfficerToggle = (officerId) => {
    setSelectedOfficers(prev => 
      prev.includes(officerId) 
        ? prev.filter(id => id !== officerId)
        : [...prev, officerId]
    );
  };

  const handleShareReport = () => {
    if (selectedOfficers.length === 0) {
      alert('Please select at least one transport officer');
      return;
    }

    const officerNames = transportOfficers
      .filter(o => selectedOfficers.includes(o.id))
      .map(o => o.name)
      .join(', ');

    const periodLabel = timePeriod === 'all' ? 'All Time' : timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1);

    alert(`Report shared successfully!\n\nFormat: ${exportFormat}\nPeriod: ${periodLabel}\nSent to: ${officerNames}`);
    
    setShowShareModal(false);
    setSelectedOfficers([]);
    setTimePeriod('all');
  };

  return (
    <div className="export-button-container">
      <button 
        className="export-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="export-icon">📥</span>
        Export Report
      </button>

      {isOpen && (
        <div className="export-dropdown">
          <div className="export-section">
            <div className="section-title">Select Time Period</div>
            <button 
              className={`period-option ${timePeriod === 'daily' ? 'active' : ''}`}
              onClick={() => setTimePeriod('daily')}
            >
              📅 Daily
            </button>
            <button 
              className={`period-option ${timePeriod === 'weekly' ? 'active' : ''}`}
              onClick={() => setTimePeriod('weekly')}
            >
              📆 Weekly
            </button>
            <button 
              className={`period-option ${timePeriod === 'monthly' ? 'active' : ''}`}
              onClick={() => setTimePeriod('monthly')}
            >
              📊 Monthly
            </button>
            <button 
              className={`period-option ${timePeriod === 'yearly' ? 'active' : ''}`}
              onClick={() => setTimePeriod('yearly')}
            >
              📈 Yearly
            </button>
            <button 
              className={`period-option ${timePeriod === 'all' ? 'active' : ''}`}
              onClick={() => setTimePeriod('all')}
            >
              🗂️ All Time
            </button>
          </div>

          <div className="export-divider"></div>

          <div className="export-section">
            <div className="section-title">Export Format</div>
            <button 
              className="export-option pdf"
              onClick={() => exportToPDF(timePeriod)}
            >
              <span className="option-icon">📄</span>
              Export as PDF
            </button>
            <button 
              className="export-option excel"
              onClick={() => exportToExcel(timePeriod)}
            >
              <span className="option-icon">📊</span>
              Export as Excel
            </button>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-header">
              <h3>Share Report with Transport Officers</h3>
              <button className="close-btn" onClick={() => setShowShareModal(false)}>✕</button>
            </div>

            <div className="share-content">
              <div className="share-info">
                <div className="info-item">
                  <span className="info-label">Report:</span>
                  <span className="info-value">{reportTitle}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Format:</span>
                  <span className="info-value">{exportFormat}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Period:</span>
                  <span className="info-value">
                    {timePeriod === 'all' ? 'All Time' : timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}
                  </span>
                </div>
              </div>

              <div className="officers-section">
                <h4>Select Transport Officers</h4>
                <div className="officers-list">
                  {transportOfficers.map(officer => (
                    <label key={officer.id} className="officer-item">
                      <input
                        type="checkbox"
                        checked={selectedOfficers.includes(officer.id)}
                        onChange={() => handleOfficerToggle(officer.id)}
                      />
                      <div className="officer-info">
                        <div className="officer-name">{officer.name}</div>
                        <div className="officer-email">{officer.email}</div>
                      </div>
                      <span className="checkmark">✓</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="share-actions">
                <button className="btn-share" onClick={handleShareReport}>
                  📤 Share Report
                </button>
                <button className="btn-cancel" onClick={() => setShowShareModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
