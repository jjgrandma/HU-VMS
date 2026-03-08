import { useState } from 'react';
import driverService from '../../../services/driverService';
import pdfGenerator from '../../../utils/pdfGenerator';
import ExportButton from '../../../components/ExportButton';
import './FuelReport.css';

const FuelReport = ({ tripId, onClose, onSubmit }) => {
    const [reportType, setReportType] = useState('refill'); // 'refill' or 'consumption'
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        cost: '',
        odometer: '',
        station: '',
        notes: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (reportType === 'refill') {
                await driverService.recordFuelRefill(formData);
            } else {
                await driverService.reportFuelConsumption(tripId, formData);
            }

            if (onSubmit) onSubmit();
            if (onClose) onClose();
        } catch (error) {
            console.error('Failed to submit fuel report:', error);
            alert('Failed to submit report');
        } finally {
            setSubmitting(false);
        }
    };

    const handleExportPDF = async (recipient) => {
        try {
            const reportData = {
                reportType,
                ...formData,
                driverName: 'John Doe', // Replace with actual driver name from context
                vehicleId: 'VEH-001', // Replace with actual vehicle ID
                licensePlate: 'ABC-1234' // Replace with actual license plate
            };

            const fileName = pdfGenerator.generateFuelReport(reportData, recipient);
            alert(`PDF exported successfully: ${fileName}\nSent to: ${recipient === 'Admin' ? 'Administration Office' : 'Transport Office'}`);
        } catch (error) {
            console.error('Failed to export PDF:', error);
            throw error;
        }
    };

    return (
        <div className="fuel-report-modal">
            <div className="modal-content">
                <h3>Fuel Report</h3>

                <div className="report-type-selector">
                    <button
                        className={reportType === 'refill' ? 'active' : ''}
                        onClick={() => setReportType('refill')}
                    >
                        Fuel Refill
                    </button>
                    <button
                        className={reportType === 'consumption' ? 'active' : ''}
                        onClick={() => setReportType('consumption')}
                    >
                        Fuel Consumption
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Amount (Liters)</label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            step="0.1"
                            required
                        />
                    </div>

                    {reportType === 'refill' && (
                        <>
                            <div className="form-group">
                                <label>Cost</label>
                                <input
                                    type="number"
                                    name="cost"
                                    value={formData.cost}
                                    onChange={handleChange}
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Gas Station</label>
                                <input
                                    type="text"
                                    name="station"
                                    value={formData.station}
                                    onChange={handleChange}
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Odometer Reading (km)</label>
                        <input
                            type="number"
                            name="odometer"
                            value={formData.odometer}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Additional Notes (Optional)</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Any additional information..."
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" disabled={submitting} className="btn-primary">
                            Submit Report
                        </button>
                        <ExportButton
                            onExport={handleExportPDF}
                            disabled={!formData.amount || !formData.odometer}
                            label="Export PDF"
                        />
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FuelReport;
