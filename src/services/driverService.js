<<<<<<< HEAD
import { useState, useEffect } from 'react'; 
 
// Mock data for driver dashboard 
const mockTrips = [ 
  { id: 1, date: '2026-02-25', route: 'Downtown - Airport', status: 'completed' }, 
  { id: 2, date: '2026-02-26', route: 'Airport - City Center', status: 'scheduled' }, 
  { id: 3, date: '2026-02-27', route: 'Northside - Southside', status: 'scheduled' } 
]; 
 
const mockVehicleStatus = { 
  batteryLevel: 85, 
  rangeKm: 320, 
  tirePressure: 'OK', 
  nextMaintenance: '2026-03-15' 
}; 
 
const driverService = { 
  getTrips: () => { 
    return mockTrips; 
  }, 
  getVehicleStatus: () => { 
    return mockVehicleStatus; 
  }, 
  getTripById: (id) => { 
    return mockTrips.find(trip => trip.id === id); 
  } 
}; 
 
export default driverService; 
=======
// Mock driver service for development
const driverService = {
  updateLocation: (location) => {
    console.log('Location updated:', location);
    return Promise.resolve();
  },

  updateStatus: (status) => {
    console.log('Status updated:', status);
    return Promise.resolve();
  },

  markNotificationRead: (notificationId) => {
    console.log('Notification marked as read:', notificationId);
    return Promise.resolve();
  }
};

export default driverService;
>>>>>>> 92dea57c0f4eeb7d4bbaef666f10e99a97f8e1bf
