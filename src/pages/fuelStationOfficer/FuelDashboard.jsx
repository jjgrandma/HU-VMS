import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pdfGenerator from '../../utils/pdfGenerator';
import './FuelDashboard.css';
import './fuelstation.css';

const FuelDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalFuelDispensedToday: 0,
    dieselAvailable: 5000,
    petrolAvailable: 3500,
    totalTransactionsToday: 0,
    weeklyFuelDispensed: 0,
    pendingAuthorizations: 2
  });

  const [recentTransactions, setRecentTransactions] = useState([
    {
      id: 'TXN-001',
      vehicleId: 'VH-001',
      driverName: 'John Smith',
      fuelType: 'Diesel',
      liters: 45.5,
      date: '2026-03-08',
      status: 'Completed',
      authorized: true,
      authorizedBy: 'Transport Office'
    },
    {
      id: 'TXN-002',
      vehicleId: 'VH-003',
      driverName: 'Sarah Johnson',
      fuelType: 'Petrol',
      liters: 32.0,
      date: '2026-03-08',
      status: 'Completed',
      authorized: true,
      authorizedBy: 'Admin'
    },
    {
      id: 'TXN-003',
      vehicleId: 'VH-007',
      driverName: 'Mike Wilson',
      fuelType: 'Diesel',
      liters: 55.2,
      date: '2026-03-08',
      status: 'Completed',
      authorized: true,
      authorizedBy: 'Transport Office'
    },
    {
      id: 'TXN-004',
      vehicleId: 'VH-012',
      driverName: 'Lisa Brown',
      fuelType: 'Petrol',
      liters: 28.8,
      date: '2026-03-08',
      status: 'Pending',
      authorized: false,
      authorizedBy: null
    },
    {
      id: 'TXN-005',
      vehicleId: 'VH-015',
      driverName: 'David Lee',
      fuelType: 'Diesel',
      liters: 42.3,
      date: '2026-03-08',
      status: 'Completed',
      authorized: true,
      authorizedBy: 'Admin'
    }
  ]);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('daily');
  const [reportRecipient, setReportRecipient] = useState('Admin');
  const [showUsageModal, setShowUsageModal] = useState(false);

  const handleVerifyAuthorization = () => {
    // Navigate to fuel requests page where authorizations can be verified
    navigate('/fuel/requests');
  };

  const handleMonitorUsage = () => {
    // Show usage monitoring modal
    setShowUsageModal(true);
  };

  const usageData = {
    hourlyUsage: [
      { hour: '08:00', diesel: 45, petrol: 20 },
      { hour: '09:00', diesel: 52, petrol: 28 },
      { hour: '10:00', diesel: 38, petrol: 15 },
      { hour: '11:00', diesel: 61, petrol: 32 },
      { hour: '12:00', diesel: 48, petrol: 25 }
    ],
    topVehicles: [
      { vehicleId: 'VH-001', totalFuel: 145.5, trips: 8 },
      { vehicleId: 'VH-003', totalFuel: 132.0, trips: 7 },
      { vehicleId: 'VH-007', totalFuel: 125.2, trips: 6 }
    ]
  };

  useEffect(() => {
    // Calculate dashboard statistics from transactions
    const todayTransactions = recentTransactions.filter(
      transaction => transaction.date === '2026-03-08'
    );

    const totalFuelToday = todayTransactions.reduce(
      (sum, transaction) => sum + transaction.liters, 0
    );

    const pendingAuth = recentTransactions.filter(
      transaction => !transaction.authorized
    ).length;

    setDashboardData(prev => ({
      ...prev,
      totalFuelDispensedToday: totalFuelToday,
      totalTransactionsToday: todayTransactions.length,
      weeklyFuelDispensed: totalFuelToday * 5.2,
      pendingAuthorizations: pendingAuth
    }));
  }, [recentTransactions]);

  const getStatusBadge = (status) => {
    const statusClass = status.toLowerCase();
    return <span className={`status-badge ${statusClass}`}>{status}</span>;
  };

  const getAuthBadge = (authorized) => {
    return (
      <span className={`auth-badge ${authorized ? 'authorized' : 'pending'}`}>
        {authorized ? '✓ Authorized' : '⏳ Pending'}
      </span>
    );
  };

  const handleGenerateReport = () => {
    const reportData = {
      reportType: reportType,
      period: reportType === 'daily' ? 'Today' : 'This Week',
      totalFuel: reportType === 'daily'
        ? dashboardData.totalFuelDispensedToday
        : dashboardData.weeklyFuelDispensed,
      totalTransactions: reportType === 'daily'
        ? dashboardData.totalTransactionsToday
        : dashboardData.totalTransactionsToday * 5,
      dieselDispensed: reportType === 'daily' ? 143.0 : 715.0,
      petrolDispensed: reportType === 'daily' ? 60.8 : 304.0,
      transactions: recentTransactions,
      generatedBy: 'Fuel Station Officer',
      date: new Date().toLocaleDateString()
    };

    // Generate PDF using pdfGenerator
    const pdfData = {
      reportType: 'fuel_station',
      period: reportData.period,
      totalFuel: reportData.totalFuel.toFixed(1),
      totalTransactions: reportData.totalTransactions,
      dieselDispensed: reportData.dieselDispensed,
      petrolDispensed: reportData.petrolDispensed,
      date: reportData.date,
      generatedBy: reportData.generatedBy,
      transactions: reportData.transactions
    };

    try {
      pdfGenerator.generateFuelStationReport(pdfData, reportRecipient);
      alert(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} fuel report generated successfully!\nRecipient: ${reportRecipient}`);
      setShowReportModal(false);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    }
  };

  return (
    <div className="fuel-dashboard-content">
      <div className="fuel-dashboard-header">
        <h2>Fuel Station Dashboard</h2>
        <p>Monitor fuel operations and inventory status</p>
      </div>

      {/* Summary Cards */}
      <div className="fuel-stats-grid">
        <div className="fuel-stat-card blue">
          <div className="fuel-stat-icon">⛽</div>
          <div className="fuel-stat-value">{dashboardData.totalFuelDispensedToday.toFixed(1)}L</div>
          <div className="fuel-stat-label">Total Fuel Dispensed Today</div>
        </div>

        <div className="fuel-stat-card green">
          <div className="fuel-stat-icon">🟢</div>
          <div className="fuel-stat-value">{dashboardData.dieselAvailable.toLocaleString()}L</div>
          <div className="fuel-stat-label">Diesel Available</div>
        </div>

        <div className="fuel-stat-card orange">
          <div className="fuel-stat-icon">🟠</div>
          <div className="fuel-stat-value">{dashboardData.petrolAvailable.toLocaleString()}L</div>
          <div className="fuel-stat-label">Petrol Available</div>
        </div>

        <div className="fuel-stat-card purple">
          <div className="fuel-stat-icon">📊</div>
          <div className="fuel-stat-value">{dashboardData.totalTransactionsToday}</div>
          <div className="fuel-stat-label">Total Transactions Today</div>
        </div>

        <div className="fuel-stat-card teal">
          <div className="fuel-stat-icon">📈</div>
          <div className="fuel-stat-value">{dashboardData.weeklyFuelDispensed.toFixed(1)}L</div>
          <div className="fuel-stat-label">Weekly Fuel Dispensed</div>
        </div>

        <div className="fuel-stat-card red">
          <div className="fuel-stat-icon">⏳</div>
          <div className="fuel-stat-value">{dashboardData.pendingAuthorizations}</div>
          <div className="fuel-stat-label">Pending Authorizations</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="fuel-quick-actions">
        <button
          className="fuel-action-btn primary"
          onClick={() => setShowReportModal(true)}
        >
          <span className="action-icon">📄</span>
          <span>Generate Report</span>
        </button>
        <button
          className="fuel-action-btn secondary"
          onClick={handleVerifyAuthorization}
        >
          <span className="action-icon">✓</span>
          <span>Verify Authorization</span>
        </button>
        <button
          className="fuel-action-btn success"
          onClick={handleMonitorUsage}
        >
          <span className="action-icon">📊</span>
          <span>Monitor Usage</span>
        </button>
      </div>

      {/* Recent Transactions Table */}
      <div className="fuel-table-container">
        <div className="fuel-table-header">
          <h3>Recent Fuel Transactions</h3>
        </div>

        <div className="fuel-table-wrapper">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Vehicle ID</th>
                <th>Driver Name</th>
                <th>Fuel Type</th>
                <th>Liters</th>
                <th>Date & Time</th>
                <th>Authorization</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="transaction-id">{transaction.id}</td>
                  <td className="vehicle-id">{transaction.vehicleId}</td>
                  <td>{transaction.driverName}</td>
                  <td>
                    <span className={`fuel-type-badge ${transaction.fuelType.toLowerCase()}`}>
                      {transaction.fuelType}
                    </span>
                  </td>
                  <td className="liters">{transaction.liters}L</td>
                  <td>{new Date(transaction.date).toLocaleString()}</td>
                  <td>{getAuthBadge(transaction.authorized)}</td>
                  <td>{getStatusBadge(transaction.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Generation Modal */}
      {showReportModal && (
        <div className="fuel-modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="fuel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fuel-modal-header">
              <h3>Generate Fuel Report</h3>
              <button
                className="fuel-modal-close"
                onClick={() => setShowReportModal(false)}
              >
                ×
              </button>
            </div>

            <div className="fuel-modal-content">
              <div className="fuel-form-group">
                <label className="fuel-form-label">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="fuel-form-select"
                >
                  <option value="daily">Daily Report</option>
                  <option value="weekly">Weekly Report</option>
                </select>
              </div>

              <div className="fuel-form-group">
                <label className="fuel-form-label">Send To</label>
                <select
                  value={reportRecipient}
                  onChange={(e) => setReportRecipient(e.target.value)}
                  className="fuel-form-select"
                >
                  <option value="Admin">Administration Office</option>
                  <option value="Transport Office">Transport Office</option>
                </select>
              </div>

              <div className="report-preview">
                <h4>Report Summary</h4>
                <div className="preview-item">
                  <span>Period:</span>
                  <strong>{reportType === 'daily' ? 'Today' : 'This Week'}</strong>
                </div>
                <div className="preview-item">
                  <span>Total Fuel:</span>
                  <strong>
                    {reportType === 'daily'
                      ? dashboardData.totalFuelDispensedToday.toFixed(1)
                      : dashboardData.weeklyFuelDispensed.toFixed(1)}L
                  </strong>
                </div>
                <div className="preview-item">
                  <span>Transactions:</span>
                  <strong>
                    {reportType === 'daily'
                      ? dashboardData.totalTransactionsToday
                      : dashboardData.totalTransactionsToday * 5}
                  </strong>
                </div>
              </div>
            </div>

            <div className="fuel-modal-actions">
              <button
                onClick={handleGenerateReport}
                className="fuel-btn-primary"
              >
                <span>📄</span> Generate PDF Report
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="fuel-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Usage Monitoring Modal */}
      {showUsageModal && (
        <div className="fuel-modal-overlay" onClick={() => setShowUsageModal(false)}>
          <div className="fuel-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="fuel-modal-header">
              <h3>📊 Fuel Usage Monitoring</h3>
              <button
                className="fuel-modal-close"
                onClick={() => setShowUsageModal(false)}
              >
                ×
              </button>
            </div>

            <div className="fuel-modal-content">
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                  Hourly Fuel Consumption (Today)
                </h4>
                <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '16px' }}>
                  {usageData.hourlyUsage.map((data, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '12px 0',
                      borderBottom: index < usageData.hourlyUsage.length - 1 ? '1px solid #e5e7eb' : 'none'
                    }}>
                      <span style={{ fontWeight: '600', color: '#374151' }}>{data.hour}</span>
                      <div style={{ display: 'flex', gap: '20px' }}>
                        <span style={{ color: '#3b82f6' }}>🔵 Diesel: {data.diesel}L</span>
                        <span style={{ color: '#f59e0b' }}>🟠 Petrol: {data.petrol}L</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                  Top Fuel Consumers (This Week)
                </h4>
                <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '16px' }}>
                  {usageData.topVehicles.map((vehicle, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: index < usageData.topVehicles.length - 1 ? '1px solid #e5e7eb' : 'none'
                    }}>
                      <div>
                        <span style={{
                          fontWeight: '700',
                          color: '#7c3aed',
                          fontFamily: 'Courier New, monospace',
                          fontSize: '14px'
                        }}>
                          {vehicle.vehicleId}
                        </span>
                        <span style={{ color: '#6b7280', fontSize: '13px', marginLeft: '12px' }}>
                          {vehicle.trips} trips
                        </span>
                      </div>
                      <span style={{
                        fontWeight: '700',
                        color: '#1f2937',
                        fontSize: '16px'
                      }}>
                        {vehicle.totalFuel}L
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
                borderRadius: '8px',
                border: '1px solid #c4b5fd'
              }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#5b21b6', fontWeight: '500' }}>
                  💡 <strong>Tip:</strong> Peak usage hours are 11:00-12:00. Consider scheduling maintenance during low-usage periods (08:00-09:00).
                </p>
              </div>
            </div>

            <div className="fuel-modal-actions">
              <button
                onClick={() => {
                  setShowUsageModal(false);
                  navigate('/fuel/transactions');
                }}
                className="fuel-btn-primary"
              >
                <span>📋</span> View Full Transaction History
              </button>
              <button
                onClick={() => setShowUsageModal(false)}
                className="fuel-btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelDashboard;