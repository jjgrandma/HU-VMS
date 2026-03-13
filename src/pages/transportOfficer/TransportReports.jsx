import { useState } from 'react';
import { 
  FileText, 
  Download, 
  RefreshCw, 
  Eye, 
  Calendar, 
  FileSpreadsheet, 
  TrendingUp, 
  Clock,
  PieChart,
  BarChart,
  Filter,
  CheckCircle2
} from 'lucide-react';
import './TransportReports.css';

const TransportReports = () => {
  const [reports] = useState([
    {
      id: 'RPT-001',
      title: 'Daily Trip Report',
      description: 'Comprehensive summary of all trips completed today, including routes and times.',
      type: 'Daily',
      lastGenerated: 'Today, 08:00 AM',
      size: '2.3 MB',
      format: 'PDF',
      icon: <FileText size={24} />
    },
    {
      id: 'RPT-002',
      title: 'Driver Performance',
      description: 'Individual driver performance metrics, ratings, and trip history.',
      type: 'Weekly',
      lastGenerated: 'Mar 14, 06:00 PM',
      size: '1.8 MB',
      format: 'Excel',
      icon: <FileSpreadsheet size={24} />
    },
    {
      id: 'RPT-003',
      title: 'Vehicle Utilization',
      description: 'Detailed analysis of vehicle usage, mileage, and maintenance logs.',
      type: 'Monthly',
      lastGenerated: 'Mar 01, 09:00 AM',
      size: '4.1 MB',
      format: 'PDF',
      icon: <PieChart size={24} />
    },
    {
      id: 'RPT-004',
      title: 'Fuel Consumption',
      description: 'Fuel usage metrics tracking consumption by vehicle model and route.',
      type: 'Monthly',
      lastGenerated: 'Mar 01, 09:30 AM',
      size: '1.5 MB',
      format: 'Excel',
      icon: <BarChart size={24} />
    },
    {
      id: 'RPT-005',
      title: 'Request Analytics',
      description: 'Trip request volume patterns, approval rates, and department statistics.',
      type: 'Quarterly',
      lastGenerated: 'Jan 01, 10:00 AM',
      size: '3.2 MB',
      format: 'PDF',
      icon: <TrendingUp size={24} />
    }
  ]);

  const [selectedPeriod, setSelectedPeriod] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');

  const filteredReports = reports.filter(report => {
    const matchesPeriod = selectedPeriod === 'All' || report.type === selectedPeriod;
    const matchesFormat = selectedFormat === 'All' || report.format === selectedFormat;
    return matchesPeriod && matchesFormat;
  });

  const handleDownload = (reportId, format) => {
    // Simulate download
    console.log(`Downloading report ${reportId} in ${format} format`);
  };

  const handleGenerate = (reportId) => {
    console.log(`Generating report ${reportId}`);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Daily': return 'var(--status-available)';
      case 'Weekly': return 'var(--primary-color)';
      case 'Monthly': return 'var(--status-pending)';
      case 'Quarterly': return 'var(--status-complaint)';
      default: return 'var(--text-secondary)';
    }
  };

  const getFormatIcon = (format) => {
    return format === 'Excel' ? <FileSpreadsheet size={14} /> : <FileText size={14} />;
  };

  return (
    <div className="transport-reports-page">
      <div className="page-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Generate, view, and export operational metrics</p>
        </div>
        <button className="btn btn-primary">
          <TrendingUp size={16} /> Custom Report
        </button>
      </div>

      <div className="reports-top-section">
        <div className="reports-quick-stats">
          <div className="rqs-card">
            <div className="rqs-icon"><FileText size={20} /></div>
            <div className="rqs-info">
              <span className="rqs-val">24</span>
              <span className="rqs-label">Generated This Month</span>
            </div>
          </div>
          <div className="rqs-card">
            <div className="rqs-icon"><Download size={20} /></div>
            <div className="rqs-info">
              <span className="rqs-val">156</span>
              <span className="rqs-label">Total Downloads</span>
            </div>
          </div>
          <div className="rqs-card">
            <div className="rqs-icon"><PieChart size={20} /></div>
            <div className="rqs-info">
              <span className="rqs-val">5</span>
              <span className="rqs-label">Report Types</span>
            </div>
          </div>
          <div className="rqs-card">
            <div className="rqs-icon"><CheckCircle2 size={20} /></div>
            <div className="rqs-info">
              <span className="rqs-val">98%</span>
              <span className="rqs-label">Success Rate</span>
            </div>
          </div>
        </div>

        <div className="recent-activity-panel">
          <h3>Recent Activity</h3>
          <div className="rap-list">
            <div className="rap-item">
              <div className="rap-bullet success"></div>
              <div className="rap-content">
                <span className="rap-text">Daily Trip Report generated</span>
                <span className="rap-time">2 hours ago</span>
              </div>
            </div>
            <div className="rap-item">
              <div className="rap-bullet print"></div>
              <div className="rap-content">
                <span className="rap-text">Vehicle Usage Report downloaded</span>
                <span className="rap-time">4 hours ago</span>
              </div>
            </div>
            <div className="rap-item">
              <div className="rap-bullet processing"></div>
              <div className="rap-content">
                <span className="rap-text">Fuel Usage Report queued</span>
                <span className="rap-time">6 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="reports-workspace">
        <div className="rw-toolbar">
          <div className="rw-title">
            <h3>Standard Reports</h3>
          </div>
          <div className="rw-filters">
            <div className="filter-select-wrapper">
              <Filter size={14} className="fs-icon" />
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="All">All Periods</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
              </select>
            </div>
            <div className="filter-select-wrapper">
              <select 
                value={selectedFormat} 
                onChange={(e) => setSelectedFormat(e.target.value)}
              >
                <option value="All">All Formats</option>
                <option value="PDF">PDF</option>
                <option value="Excel">Excel / CSV</option>
              </select>
            </div>
          </div>
        </div>

        <div className="reports-grid">
          {filteredReports.map((report) => (
            <div key={report.id} className="report-card">
              <div className="rc-header">
                <div className="rc-icon">
                  {report.icon}
                </div>
                <span 
                  className="rc-badge"
                  style={{ 
                    backgroundColor: `${getTypeColor(report.type)}15`,
                    color: getTypeColor(report.type)
                  }}
                >
                  {report.type}
                </span>
              </div>
              
              <div className="rc-body">
                <h3>{report.title}</h3>
                <p>{report.description}</p>
              </div>
              
              <div className="rc-meta">
                <div className="rc-meta-item">
                  <Clock size={14} />
                  <span>{report.lastGenerated}</span>
                </div>
                <div className="rc-meta-item format-size">
                  <span className="fmt-icon">{getFormatIcon(report.format)}</span>
                  <span>{report.format} &bull; {report.size}</span>
                </div>
              </div>

              <div className="rc-footer">
                <button 
                  className="btn-text secondary"
                  onClick={() => handleGenerate(report.id)}
                >
                  <RefreshCw size={14} /> Generate
                </button>
                <div className="rc-actions-right">
                  <button className="btn-icon ghost" title="Preview">
                    <Eye size={16} />
                  </button>
                  <button 
                    className="btn-icon primary-light" 
                    title="Download"
                    onClick={() => handleDownload(report.id, report.format)}
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredReports.length === 0 && (
            <div className="empty-state">
              <FileText size={32} />
              <p>No reports match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransportReports;