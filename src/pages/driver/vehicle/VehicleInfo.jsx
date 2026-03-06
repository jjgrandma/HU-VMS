import { useState, useEffect } from 'react';
import driverService from '../../../services/driverService';
import VehicleIssueReport from '../vehicle-report/VehicleIssueReport';
import './VehicleInfo.css';

const VehicleInfo = () => {
    const [vehicle, setVehicle] = useState(null);
    const [showReportIssue, setShowReportIssue] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadVehicleInfo();
    }, []);

    const loadVehicleInfo = async () => {
        try {
            const data = await driverService.getVehicleInfo();
            setVehicle(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load vehicle info:', error);
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading vehicle info...</div>;
    if (!vehicle) return <div className="no-data">No vehicle assigned</div>;

    const fuelPercentage = vehicle.fuelLevel || 0;
    const isFuelLow = fuelPercentage < 20;
    const isMaintenanceDue = vehicle.maintenanceDueDays <= 7;

    return (
        <div className="vehicle-info">
            <h2>Vehicle Information</h2>

            <div className="vehicle-card">
                <div className="vehicle-header">
                    <h3>{vehicle.model}</h3>
                    <span className="vehicle-id">{vehicle.vehicleId}</span>
                </div>

                <div className="vehicle-details">
                    <div className="detail-row">
                        <span>License Plate:</span>
                        <strong>{vehicle.licensePlate}</strong>
                    </div>

                    <div className="detail-row">
                        <span>Fuel Level:</span>
                        <div className="fuel-indicator">
                            <div
                                className={`fuel-bar ${isFuelLow ? 'low' : ''}`}
                                style={{ width: `${fuelPercentage}%` }}
                            ></div>
                            <span>{fuelPercentage}%</span>
                        </div>
                    </div>

                    {isFuelLow && (
                        <div className="warning">⚠️ Low fuel warning</div>
                    )}

                    <div className="detail-row">
                        <span>Maintenance Status:</span>
                        <strong className={isMaintenanceDue ? 'warning-text' : ''}>
                            {vehicle.maintenanceStatus}
                        </strong>
                    </div>

                    <div className="detail-row">
                        <span>Last Maintenance:</span>
                        <strong>{new Date(vehicle.lastMaintenanceDate).toLocaleDateString()}</strong>
                    </div>

                    {isMaintenanceDue && (
                        <div className="warning">
                            ⚠️ Maintenance due in {vehicle.maintenanceDueDays} days
                        </div>
                    )}

                    <div className="detail-row">
                        <span>Odometer:</span>
                        <strong>{vehicle.odometer} km</strong>
                    </div>
                </div>

                <button
                    onClick={() => setShowReportIssue(true)}
                    className="btn-report-issue"
                >
                    Report Issue
                </button>
            </div>

            {showReportIssue && (
                <VehicleIssueReport
                    vehicleId={vehicle.vehicleId}
                    onClose={() => setShowReportIssue(false)}
                    onSubmit={loadVehicleInfo}
                />
            )}
        </div>
    );
};

export default VehicleInfo;
