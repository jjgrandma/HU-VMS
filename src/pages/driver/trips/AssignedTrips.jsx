import { useState, useEffect } from 'react';
import driverService from '../../../services/driverService';
import AcceptTrip from './AcceptTrip';
import './AssignedTrips.css';

const AssignedTrips = ({ onTripUpdate }) => {
    const [trips, setTrips] = useState([]);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        try {
            const data = await driverService.getAssignedTrips();
            setTrips(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load trips:', error);
            setLoading(false);
        }
    };

    const handleAccept = async (tripId) => {
        try {
            await driverService.acceptTrip(tripId);
            loadTrips();
            if (onTripUpdate) onTripUpdate();
        } catch (error) {
            console.error('Failed to accept trip:', error);
        }
    };

    const handleReject = async (tripId, reason) => {
        try {
            await driverService.rejectTrip(tripId, reason);
            loadTrips();
            if (onTripUpdate) onTripUpdate();
        } catch (error) {
            console.error('Failed to reject trip:', error);
        }
    };

    if (loading) return <div className="loading">Loading trips...</div>;

    return (
        <div className="assigned-trips">
            <h2>Assigned Trips</h2>

            {trips.length === 0 ? (
                <p className="no-trips">No trips assigned</p>
            ) : (
                <div className="trips-list">
                    {trips.map(trip => (
                        <div key={trip.id} className={`trip-card ${trip.status}`}>
                            <div className="trip-header">
                                <span className="trip-id">Trip #{trip.id}</span>
                                <span className={`trip-status ${trip.status}`}>{trip.status}</span>
                            </div>

                            <div className="trip-details">
                                <div className="trip-info">
                                    <p><strong>Pickup:</strong> {trip.pickupLocation}</p>
                                    <p><strong>Destination:</strong> {trip.destination}</p>
                                    <p><strong>Scheduled:</strong> {new Date(trip.scheduledTime).toLocaleString()}</p>
                                    <p><strong>Passenger:</strong> {trip.passengerName}</p>
                                </div>

                                {trip.status === 'pending' && (
                                    <div className="trip-actions">
                                        <button
                                            onClick={() => setSelectedTrip(trip)}
                                            className="btn-accept"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => {
                                                const reason = prompt('Reason for rejection:');
                                                if (reason) handleReject(trip.id, reason);
                                            }}
                                            className="btn-reject"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedTrip && (
                <AcceptTrip
                    trip={selectedTrip}
                    onAccept={handleAccept}
                    onCancel={() => setSelectedTrip(null)}
                />
            )}
        </div>
    );
};

export default AssignedTrips;
