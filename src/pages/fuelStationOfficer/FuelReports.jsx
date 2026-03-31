import { useState, useEffect } from 'react';
import { getFuelRequests, getFuelInventory, getCurrentUser } from '../../api/api';
import pdfGenerator from '../../utils/pdfGenerator';
import './FuelReports.css';
import './fuelstation.css';

const FuelReports = () => {
    const currentUser = getCurrentUser();
    const [reportConfig, setReportConfig] = useState({
        reportType: 'daily',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        recipient: 'Admin',
        includeTransactions: true,
        includeInventory: true,
        includeSummary: true,
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [liveData, setLiveData] = useState(null);
    const [loadingData, setLoadingData] = useState(true);

    // Fetch real data on mount and when date range changes
    useEffect(() => {
        fetchReportData();
    }, [reportConfig.startDate, reportConfig.endDate]);

    const fetchReportData = async () => {
        setLoadingData(true);
        try {
            const [requests, inventory] = await Promise.all([
                getFuelRequests(),
                getFuelInventory(),
            ]);

            const start = new Date(reportConfig.startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(reportConfig.endDate);
            end.setHours(23, 59, 59, 999);

            // For PDF: filter by date range using createdAt (works even if not dispensed yet)
            const inRange = requests.filter(r => {
                const d = new Date(r.createdAt);
                return d >= start && d <= end;
            });

            const dispensedInRange = inRange.filter(r => r.status === 'dispensed');

            // For quick stats: use ALL data (no date filter)
            const allDispensed = requests.filter(r => r.status === 'dispensed');
            const allPending   = requests.filter(r => r.status === 'pending');

            const dieselDispensed = allDispensed.filter(r => r.fuelType === 'Diesel').reduce((s, r) => s + (r.dispensedLiters || 0), 0);
            const petrolDispensed = allDispensed.filter(r => r.fuelType === 'Petrol').reduce((s, r) => s + (r.dispensedLiters || 0), 0);

            const diesel = inventory.find(i => i.fuelType === 'Diesel');
            const petrol = inventory.find(i => i.fuelType === 'Petrol');

            setLiveData({
                // Quick stats (all-time)
                totalFuelDispensed: dieselDispensed + petrolDispensed,
                dieselDispensed,
                petrolDispensed,
                totalTransactions: allDispensed.length,
                completedTransactions: allDispensed.length,
                pendingAuthorizations: allPending.length,
                dieselAvailable: diesel?.available || 0,
                petrolAvailable: petrol?.available || 0,
                // PDF report (date-filtered)
                transactions: dispensedInRange,
                rangeTotal: dispensedInRange.reduce((s, r) => s + (r.dispensedLiters || 0), 0),
                rangeDiesel: dispensedInRange.filter(r => r.fuelType === 'Diesel').reduce((s, r) => s + (r.dispensedLiters || 0), 0),
                rangePetrol: dispensedInRange.filter(r => r.fuelType === 'Petrol').reduce((s, r) => s + (r.dispensedLiters || 0), 0),
            });
        } catch (err) {
            console.error('Failed to load report data:', err.message);
        } finally {
            setLoadingData(false);
        }
    };

    const handleInputChange = (field, value) => {
        setReportConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerateReport = async () => {
        if (!liveData) return;
        setIsGenerating(true);
        try {
            const pdfData = {
                reportType: 'fuel_station',
                period: reportConfig.reportType.charAt(0).toUpperCase() + reportConfig.reportType.slice(1),
                startDate: reportConfig.startDate,
                endDate: reportConfig.endDate,
                totalFuel: liveData.rangeTotal.toFixed(1),
                dieselDispensed: liveData.rangeDiesel.toFixed(1),
                petrolDispensed: liveData.rangePetrol.toFixed(1),
                totalTransactions: liveData.transactions.length,
                completedTransactions: liveData.transactions.length,
                pendingAuthorizations: liveData.pendingAuthorizations,
                dieselAvailable: liveData.dieselAvailable,
                petrolAvailable: liveData.petrolAvailable,
                recipient: reportConfig.recipient,
                generatedBy: currentUser?.name || 'Fuel Station Officer',
                date: new Date().toLocaleDateString(),
                transactions: liveData.transactions,
                includeTransactions: reportConfig.includeTransactions,
                includeInventory: reportConfig.includeInventory,
                includeSummary: reportConfig.includeSummary,
            };

            pdfGenerator.generateFuelStationReport(pdfData, reportConfig.recipient);
            alert(`✅ Report generated!\nPeriod: ${reportConfig.startDate} to ${reportConfig.endDate}\nRecipient: ${reportConfig.recipient}`);
            setShowPreview(false);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('❌ Error generating report. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fuel-reports-page">
            <div className="fuel-page-header">
                <h2 className="fuel-roman-title">⛽ Generate Reports</h2>
                <p className="roman-emphasis">Create and send fuel station reports to administration</p>
                <div className="fuel-roman-divider"></div>
            </div>

            <div className="reports-container">
                {/* Config Card */}
                <div className="report-config-card roman-card">
                    <div className="card-header">
                        <h3 className="roman-strong">📄 Report Configuration</h3>
                        <p>Configure your report settings</p>
                    </div>
                    <div className="report-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label"><span className="label-icon">📊</span>Report Type</label>
                                <select value={reportConfig.reportType} onChange={e => handleInputChange('reportType', e.target.value)} className="form-select">
                                    <option value="daily">Daily Report</option>
                                    <option value="weekly">Weekly Report</option>
                                    <option value="monthly">Monthly Report</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label"><span className="label-icon">👤</span>Send To</label>
                                <select value={reportConfig.recipient} onChange={e => handleInputChange('recipient', e.target.value)} className="form-select">
                                    <option value="Admin">Administration Office</option>
                                    <option value="Transport Office">Transport Office</option>
                                    <option value="Both">Both Offices</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label"><span className="label-icon">📅</span>Start Date</label>
                                <input type="date" value={reportConfig.startDate} onChange={e => handleInputChange('startDate', e.target.value)} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label"><span className="label-icon">📅</span>End Date</label>
                                <input type="date" value={reportConfig.endDate} onChange={e => handleInputChange('endDate', e.target.value)} className="form-input" />
                            </div>
                        </div>
                        <div className="form-group full-width">
                            <label className="form-label"><span className="label-icon">📋</span>Include in Report</label>
                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input type="checkbox" checked={reportConfig.includeSummary} onChange={e => handleInputChange('includeSummary', e.target.checked)} />
                                    <span>Summary Statistics</span>
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" checked={reportConfig.includeTransactions} onChange={e => handleInputChange('includeTransactions', e.target.checked)} />
                                    <span>Transaction Details</span>
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" checked={reportConfig.includeInventory} onChange={e => handleInputChange('includeInventory', e.target.checked)} />
                                    <span>Inventory Status</span>
                                </label>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button onClick={() => { fetchReportData(); setShowPreview(true); }} className="btn-preview roman-button">
                                <span>👁️</span> Preview Report
                            </button>
                            <button onClick={handleGenerateReport} className="btn-generate roman-button" disabled={isGenerating || loadingData}>
                                {isGenerating ? <><span>⏳</span> Generating...</> : <><span>📄</span> Generate & Send Report</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Live Quick Stats */}
                <div className="quick-stats-grid">
                    <div className="quick-stat-card">
                        <div className="stat-icon">⛽</div>
                        <div className="stat-info">
                            <div className="stat-value">{loadingData ? '...' : `${liveData?.totalFuelDispensed.toFixed(1)}L`}</div>
                            <div className="stat-label">Total Dispensed</div>
                        </div>
                    </div>
                    <div className="quick-stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <div className="stat-value">{loadingData ? '...' : liveData?.completedTransactions}</div>
                            <div className="stat-label">Completed</div>
                        </div>
                    </div>
                    <div className="quick-stat-card">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-info">
                            <div className="stat-value">{loadingData ? '...' : liveData?.pendingAuthorizations}</div>
                            <div className="stat-label">Pending</div>
                        </div>
                    </div>
                </div>

                {/* Preview */}
                {showPreview && liveData && (
                    <div className="report-preview-card">
                        <div className="card-header">
                            <h3>📊 Report Preview</h3>
                            <button onClick={() => setShowPreview(false)} className="close-preview">×</button>
                        </div>
                        <div className="preview-content">
                            <div className="preview-header">
                                <h4>Fuel Station Report</h4>
                                <p className="preview-period">{reportConfig.reportType.toUpperCase()} REPORT</p>
                                <p className="preview-date">Period: {reportConfig.startDate} to {reportConfig.endDate}</p>
                            </div>
                            {reportConfig.includeSummary && (
                                <div className="preview-section">
                                    <h5>📈 Summary Statistics</h5>
                                    <div className="preview-stats">
                                        <div className="preview-stat"><span className="stat-label">Total Fuel Dispensed</span><span className="stat-value">{liveData.rangeTotal.toFixed(1)}L</span></div>
                                        <div className="preview-stat"><span className="stat-label">Diesel Dispensed</span><span className="stat-value">{liveData.rangeDiesel.toFixed(1)}L</span></div>
                                        <div className="preview-stat"><span className="stat-label">Petrol Dispensed</span><span className="stat-value">{liveData.rangePetrol.toFixed(1)}L</span></div>
                                        <div className="preview-stat"><span className="stat-label">Total Transactions</span><span className="stat-value">{liveData.transactions.length}</span></div>
                                    </div>
                                </div>
                            )}
                            {reportConfig.includeInventory && (
                                <div className="preview-section">
                                    <h5>📦 Current Inventory</h5>
                                    <div className="preview-stats">
                                        <div className="preview-stat"><span className="stat-label">Diesel Available</span><span className="stat-value">{liveData.dieselAvailable}L</span></div>
                                        <div className="preview-stat"><span className="stat-label">Petrol Available</span><span className="stat-value">{liveData.petrolAvailable}L</span></div>
                                    </div>
                                </div>
                            )}
                            <div className="preview-footer">
                                <p><strong>Recipient:</strong> {reportConfig.recipient}</p>
                                <p><strong>Generated By:</strong> {currentUser?.name || 'Fuel Station Officer'}</p>
                                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FuelReports;
