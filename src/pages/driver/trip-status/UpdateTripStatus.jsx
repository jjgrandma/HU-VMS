import { useState } from 'react';
import driverService from '../../../services/driverService';
import './UpdateTripStatus.css';

const UpdateTripStatus = ({ trip, onUpdate }) => {
    const [updating, setUpdating] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [showCancelForm, setShowCancelForm] = useState(false);

    const handleStatusUpdate = async (newStatus) => {
        setUpdating(true);
        try {
            await driverService.updateTripStatus(trip.id, newStatus);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Failed to update trip status:', error);
            alert('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleCancel = async () => {
        if (!cancellationReason.trim()) {
            alert('Please provide a cancellation reason');
            return;
        }

        setUpdating(true);
        try {
            await driverService.rejectTrip(trip.id, cancellationReason);
            setShowCancelForm(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Failed to cancel trip:', error);
            alert('Failed to cancel trip');
        } finally {
            setUpdating(false);
        }
    };

    const getAvailableActions = () => {
        switch (trip.status) {
            case 'accepted':
                return [
                    { label: 'Start Trip', status: 'started', icon: '🚀' },
                    { label: 'Cancel', action: () => setShowCancelForm(true), icon: '❌' }
                ];
            case 'started':
                return [
                    { label: 'On The Way', status: 'on-the-way', icon: '🚗' }
                ];
            case 'on-the-way':
                return [
                    { label: 'Complete Trip', status: 'completed', icon: '✅' }
                ];
            default:
                return [];
        }
    };

    const actions = getAvailableActions();

    return (
        <div className="update-trip-status">
            <h2>Update Trip Status</h2>

            <div className="current-trip-info">
                <h3>Trip #{trip.id}</h3>
                <p><strong>Current Status:</strong> <span className={`status ${trip.status}`}>{trip.status}</span></p>
                <p><strong>Pickup:</strong> {trip.pickupLocation}</p>
                <p><strong>Destination:</strong> {trip.destination}</p>
            </div>

            {showCancelForm ? (
                <div className="cancel-form">
                    <h4>Cancel Trip</h4>
                    <textarea
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        placeholder="Enter cancellation reason..."
                        rows="4"
                    />
                    <div className="form-actions">
                        <button onClick={handleCancel} disabled={updating} className="btn-danger">
                            Confirm Cancel
                        </button>
                        <button onClick={() => setShowCancelForm(false)} className="btn-secondary">
                            Back
                        </button>
                    </div>
                </div>
            ) : (
                <div className="status-actions">
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => action.status ? handleStatusUpdate(action.status) : action.action()}
                            disabled={updating}
                            className="status-btn"
                        >
                            <span className="icon">{action.icon}</span>
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UpdateTripStatus;
