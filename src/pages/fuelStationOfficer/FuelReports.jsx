import { useState } from 'react';
import pdfGenerator from '../../utils/pdfGenerator';
import './FuelReports.css';
import './fuelstation.css';

const FuelReports = () => {
    const [reportConfig, setReportConfig] = useState({
        reportType: 'daily',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        recipient: 'Admin',
        includeTransactions: true,
        includeInventory: true,
        includeSummary: true
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Mock data - replace with actual API calls
    const reportData = {
        daily: {
            totalFuelDispensed: 203.8,
            dieselDispensed: 143.0,
            petrolDispensed: 60.8,
            totalTransactions: 5,
            dieselAvailable: 5000,
            petrolAvailable: 3500,
            pendingAuthorizations: 2,
            completedTransactions: 4
        },
        weekly: {
            totalFuelDispensed: 1059.8,
            dieselDispensed: 743.6,
            petrolDispensed: 316.2,
            totalTransactions: 26,
            dieselAvailable: 5000,
            petrolAvailable: 3500,
            pendingAuthorizations: 3,
            completedTransactions: 23
        },
        monthly: {
            totalFuelDispensed: 4523.5,
            dieselDispensed: 3166.5,
            petrolDispensed: 1357.0,
            totalTransactions: 112,
            dieselAvailable: 5000,
            petrolAvailable: 3500,
            pendingAuthorizations: 5,
            completedTransactions: 107
        }
    };

    const handleInputChange = (field, value) => {
        setReportConfig(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleGenerateReport = async () => {
        setIsGenerating(true);

        try {
            const data = reportData[reportConfig.reportType];

            const pdfData = {
                reportType: 'fuel_station',
                period: reportConfig.reportType.charAt(0).toUpperCase() + reportConfig.reportType.slice(1),
                startDate: reportConfig.startDate,
                endDate: reportConfig.endDate,
                totalFuel: data.totalFuelDispensed.toFixed(1),
                dieselDispensed: data.dieselDispensed.toFixed(1),
                petrolDispensed: data.petrolDispensed.toFixed(1),
                totalTransactions: data.totalTransactions,
                completedTransactions: data.completedTransactions,
                pendingAuthorizations: data.pendingAuthorizations,
                dieselAvailable: data.dieselAvailable,
                petrolAvailable: data.petrolAvailable,
                recipient: reportConfig.recipient,
                generatedBy: 'Fuel Station Officer',
                date: new Date().toLocaleDateString(),
                includeTransactions: reportConfig.includeTransactions,
                includeInventory: reportConfig.includeInventory,
                includeSummary: reportConfig.includeSummary
            };

            // Simulate API call to send report
            await new Promise(resolve => setTimeout(resolve, 1500));

            pdfGenerator.generateFuelStationReport(pdfData, reportConfig.recipient);

            alert(`✅ Report Generated Successfully!\n\n` +
                `Report Type: ${reportConfig.reportType.toUpperCase()}\n` +
                `Recipient: ${reportConfig.recipient}\n` +
                `Period: ${reportConfig.startDate} to ${reportConfig.endDate}\n\n` +
                `The report has been generated and sent to ${reportConfig.recipient}.`);

            setIsGenerating(false);
            setShowPreview(false);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('❌ Error generating report. Please try again.');
            setIsGenerating(false);
        }
    };

    const getCurrentData = () => {
        return reportData[reportConfig.reportType];
    };

    return (
        <div className="fuel-reports-page">
            <div className="fuel-page-header">
                <h2>Generate Reports</h2>
                <p>Create and send fuel station reports to administration</p>
            </div>

            <div className="reports-container">
                {/* Report Configuration Card */}
                <div className="report-config-card">
                    <div className="card-header">
                        <h3>📄 Report Configuration</h3>
                        <p>Configure your report settings</p>
                    </div>

                    <div className="report-form">
                        {/* Report Type */}
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">📊</span>
                                    Report Type
                                </label>
                                <select
                                    value={reportConfig.reportType}
                                    onChange={(e) => handleInputChange('reportType', e.target.value)}
                                    className="form-select"
                                >
                                    <option value="daily">Daily Report</option>
                                    <option value="weekly">Weekly Report</option>
                                    <option value="monthly">Monthly Report</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">👤</span>
                                    Send To
                                </label>
                                <select
                                    value={reportConfig.recipient}
                                    onChange={(e) => handleInputChange('recipient', e.target.value)}
                                    className="form-select"
                                >
                                    <option value="Admin">Administration Office</option>
                                    <option value="Transport Office">Transport Office</option>
                                    <option value="Both">Both Offices</option>
                                </select>
                            </div>
                        </div>

                        {/* Date Range */}
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">📅</span>
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={reportConfig.startDate}
                                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">📅</span>
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={reportConfig.endDate}
                                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        {/* Report Sections */}
                        <div className="form-group full-width">
                            <label className="form-label">
                                <span className="label-icon">📋</span>
                                Include in Report
                            </label>
                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={reportConfig.includeSummary}
                                        onChange={(e) => handleInputChange('includeSummary', e.target.checked)}
                                    />
                                    <span>Summary Statistics</span>
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={reportConfig.includeTransactions}
                                        onChange={(e) => handleInputChange('includeTransactions', e.target.checked)}
                                    />
                                    <span>Transaction Details</span>
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={reportConfig.includeInventory}
                                        onChange={(e) => handleInputChange('includeInventory', e.target.checked)}
                                    />
                                    <span>Inventory Status</span>
                                </label>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="form-actions">
                            <button
                                onClick={() => setShowPreview(true)}
                                className="btn-preview"
                            >
                                <span>👁️</span>
                                Preview Report
                            </button>
                            <button
                                onClick={handleGenerateReport}
                                className="btn-generate"
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <span className="spinner">⏳</span>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <span>📄</span>
                                        Generate & Send Report
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Report Preview Card */}
                {showPreview && (
                    <div className="report-preview-card">
                        <div className="card-header">
                            <h3>📊 Report Preview</h3>
                            <button onClick={() => setShowPreview(false)} className="close-preview">×</button>
                        </div>

                        <div className="preview-content">
                            <div className="preview-header">
                                <h4>Fuel Station Report</h4>
                                <p className="preview-period">{reportConfig.reportType.toUpperCase()} REPORT</p>
                                <p className="preview-date">
                                    Period: {reportConfig.startDate} to {reportConfig.endDate}
                                </p>
                            </div>

                            {reportConfig.includeSummary && (
                                <div className="preview-section">
                                    <h5>📈 Summary Statistics</h5>
                                    <div className="preview-stats">
                                        <div className="preview-stat">
                                            <span className="stat-label">Total Fuel Dispensed</span>
                                            <span className="stat-value">{getCurrentData().totalFuelDispensed}L</span>
                                        </div>
                                        <div className="preview-stat">
                                            <span className="stat-label">Diesel Dispensed</span>
                                            <span className="stat-value">{getCurrentData().dieselDispensed}L</span>
                                        </div>
                                        <div className="preview-stat">
                                            <span className="stat-label">Petrol Dispensed</span>
                                            <span className="stat-value">{getCurrentData().petrolDispensed}L</span>
                                        </div>
                                        <div className="preview-stat">
                                            <span className="stat-label">Total Transactions</span>
                                            <span className="stat-value">{getCurrentData().totalTransactions}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {reportConfig.includeInventory && (
                                <div className="preview-section">
                                    <h5>📦 Current Inventory</h5>
                                    <div className="preview-stats">
                                        <div className="preview-stat">
                                            <span className="stat-label">Diesel Available</span>
                                            <span className="stat-value">{getCurrentData().dieselAvailable}L</span>
                                        </div>
                                        <div className="preview-stat">
                                            <span className="stat-label">Petrol Available</span>
                                            <span className="stat-value">{getCurrentData().petrolAvailable}L</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="preview-footer">
                                <p><strong>Recipient:</strong> {reportConfig.recipient}</p>
                                <p><strong>Generated By:</strong> Fuel Station Officer</p>
                                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Stats */}
                <div className="quick-stats-grid">
                    <div className="quick-stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <div className="stat-value">{getCurrentData().totalFuelDispensed}L</div>
                            <div className="stat-label">Total Fuel</div>
                        </div>
                    </div>

                    <div className="quick-stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <div className="stat-value">{getCurrentData().completedTransactions}</div>
                            <div className="stat-label">Completed</div>
                        </div>
                    </div>

                    <div className="quick-stat-card">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-info">
                            <div className="stat-value">{getCurrentData().pendingAuthorizations}</div>
                            <div className="stat-label">Pending</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FuelReports;
