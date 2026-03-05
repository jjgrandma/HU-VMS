// src/pages/driver/services/driverService.js
const API_BASE = '/api/driver';

const driverService = {
  // Trip management
  getTrips: async () => {
    // Mock data - replace with actual API call
    return {
      upcoming: [
        { id: 1, pickup: 'Downtown', dropoff: 'Airport', time: '10:30 AM', status: 'scheduled' },
        { id: 2, pickup: 'Airport', dropoff: 'City Center', time: '2:00 PM', status: 'scheduled' }
      ],
      all: [
        { id: 1, pickup: '123 Main St', dropoff: 'Airport Terminal 1', date: 'Today, 10:30 AM', status: 'completed', distance: 12.5, earnings: 25.00 },
        { id: 2, pickup: 'Airport Terminal 2', dropoff: 'Central Station', date: 'Today, 11:30 AM', status: 'completed', distance: 8.3, earnings: 18.50 },
        { id: 3, pickup: 'North Mall', dropoff: 'South Park', date: 'Today, 2:00 PM', status: 'in-progress', distance: 15.7, earnings: 32.80 },
        { id: 4, pickup: 'East Station', dropoff: 'West End', date: 'Today, 4:30 PM', status: 'scheduled', distance: 10.2, earnings: 22.30 }
      ]
    };
  },

  startTrip: async (tripId) => {
    // API call to start trip
    return { success: true, message: 'Trip started' };
  },

  completeTrip: async (tripId) => {
    // API call to complete trip
    return { success: true, message: 'Trip completed' };
  },

  // Vehicle status
  getVehicleStatus: async () => {
    return {
      id: 'VH-1234',
      model: 'Tesla Model 3',
      licensePlate: 'ABC-1234',
      batteryLevel: 85,
      rangeKm: 320,
      tirePressure: '32 PSI',
      nextMaintenance: '2026-03-15',
      oilLevel: '98%',
      engineTemp: 92,
      fuelLevel: 65,
      mileage: 15234,
      lastService: '2026-01-20'
    };
  },

  reportIssue: async (issueData) => {
    return { success: true, message: 'Issue reported' };
  },

  // Notifications
  getNotifications: async () => {
    return {
      list: [
        { id: 1, type: 'trip', message: 'New trip assigned: Airport pickup', timestamp: new Date(Date.now() - 5*60000), read: false },
        { id: 2, type: 'warning', message: 'Vehicle maintenance due in 3 days', timestamp: new Date(Date.now() - 60*60000), read: false },
        { id: 3, type: 'earnings', message: 'Daily earnings report ready', timestamp: new Date(Date.now() - 120*60000), read: true },
        { id: 4, type: 'success', message: 'Trip completed successfully', timestamp: new Date(Date.now() - 180*60000), read: true }
      ],
      unreadCount: 2
    };
  },

  markNotificationRead: async (notificationId) => {
    return { success: true };
  },

  // Earnings
  getEarnings: async () => {
    return {
      today: 125.50,
      week: 875.25,
      month: 3450.75,
      total: 12450.50,
      tripsToday: 8,
      tipsToday: 32.50,
      hourly: 18.75,
      chart: [45, 52, 38, 45, 65, 58, 72]
    };
  },

  // Stats
  getStats: async () => {
    return {
      totalTrips: 128,
      hoursToday: 6.5,
      rating: 4.8,
      totalRatings: 128,
      acceptanceRate: 95,
      completionRate: 98
    };
  },

  // Location updates
  updateLocation: async (location) => {
    return { success: true };
  },

  // Status updates
  updateStatus: async (status) => {
    return { success: true };
  }
};

export default driverService; // ← THIS MUST BE AT THE END!