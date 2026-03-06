import { useState } from 'react';
import driverService from '../../../services/driverService';
import pdfGenerator from '../../../utils/pdfGenerator';
import ExportButton from '../../../components/ExportButton';
import './VehicleIssueReport.css';

const VehicleIssueReport = ({ vehicleId, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        category: 'mechanical',
        severity: 'medium',
        description: '',
        photos: []
    });
    const [submitting, setSubmitting] = useState(false);

    const categories = [
        { value: 'mechanical', label: 'Mechanical Problem' },
        { value: 'accident', label: 'Accident' },
        { value: 'damage', label: 'Vehicle Damage' },
        { value: 'maintenance', label: 'Maintenance Need' }
    ];

    const severityLevels = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'critical', label: 'Critical' }
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData({
            ...formData,
            photos: files
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.description.trim()) {
            alert('Please provide a description');
            return;
        }

        setSubmitting(true);
        try {
            await driverService.reportIssue({
                vehicleId,
                ...formData
            });

            if (onSubmit) onSubmit();
            if (onClose) onClose();
        } catch (error) {
            console.error('Failed to submit issue report:', error);
            alert('Failed to submit report');
        } finally {
            setSubmitting(false);
        }
    };

    const handleExportPDF = async (recipient) => {
        try {
            const reportData = {
                issueType: formData.category,
                priority: formData.severity,
                description: formData.description,
                date: new Date().toLocaleDateString(),
                driverName: 'John Doe', // Replace with actual driver name
                vehicleId: vehicleId || 'VEH-001',
                licensePlate: 'ABC-1234', // Replace with actual license plate
                odometer: '45230' // Replace with actual odometer reading
            };

            const fileName = pdfGenerator.generateVehicleIssueReport(reportData, recipient);
            alert(`PDF exported successfully: ${fileName}\nSent to: ${recipient === 'Admin' ? 'Administration Office' : 'Transport Office'}`);
        } catch (error) {
            console.error('Failed to export PDF:', error);
            throw error;
        }
    };

    return (
        <div className="vehicle-issue-modal">
            <div className="modal-content">
                <h3>Report Vehicle Issue</h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Category</label>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Severity</label>
                        <select name="severity" value={formData.severity} onChange={handleChange}>
                            {severityLevels.map(level => (
                                <option key={level.value} value={level.value}>{level.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="5"
                            placeholder="Describe the issue in detail..."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Photos (Optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                        />
                        {formData.photos.length > 0 && (
                            <p className="file-count">{formData.photos.length} file(s) selected</p>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="submit" disabled={submitting} className="btn-danger">
                            Submit Report
                        </button>
                        <ExportButton
                            onExport={handleExportPDF}
                            disabled={!formData.description.trim()}
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

export default VehicleIssueReport;
