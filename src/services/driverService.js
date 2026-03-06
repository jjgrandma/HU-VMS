import api from './api';

// Mock data for development/testing
const MOCK_MODE = true; // Set to false when backend is ready

const mockData = {
  trips: [
    {
      id: 1,
      pickupLocation: 'Main Campus Gate',
      destination: 'Engineering Building',
      scheduledTime: new Date(Date.now() + 3600000).toISOString(),
      passengerName: 'Dr. Ahmed Hassan',
      status: 'pending'
    },
    {
      id: 2,
      pickupLocation: 'Library',
      destination: 'Student Center',
      scheduledTime: new Date(Date.now() + 7200000).toISOString(),
      passengerName: 'Prof. Sarah Johnson',
      status: 'accepted'
    },
    {
      id: 3,
      pickupLocation: 'Admin Building',
      destination: 'Medical Center',
      scheduledTime: new Date(Date.now() - 1800000).toISOString(),
      passengerName: 'Dr. Mohammed Ali',
      status: 'started'
    }
  ],

  tripHistory: [
    {
      id: 101,
      pickupLocation: 'Science Building',
      destination: 'Main Gate',
      completedAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed',
      fuelUsed: 2.5
    },
    {
      id: 102,
      pickupLocation: 'Sports Complex',
      destination: 'Cafeteria',
      completedAt: new Date(Date.now() - 172800000).toISOString(),
      status: 'completed',
      fuelUsed: 1.8
    },
    {
      id: 103,
      pickupLocation: 'Dormitory A',
      destination: 'Hospital',
      completedAt: new Date(Date.now() - 259200000).toISOString(),
      status: 'cancelled'
    }
  ],

  vehicle: {
    vehicleId: 'VEH-001',
    model: 'Toyota Hiace 2022',
    licensePlate: 'ABC-1234',
    fuelLevel: 75,
    maintenanceStatus: 'Good',
    lastMaintenanceDate: new Date(Date.now() - 2592000000).toISOString(),
    maintenanceDueDays: 15,
    odometer: 45230
  },

  notifications: [
    {
      id: 1,
      type: 'trip_assignment',
      title: 'New Trip Assigned',
      message: 'You have been assigned a new trip to Engineering Building',
      createdAt: new Date(Date.now() - 300000).toISOString(),
      read: false,
      severity: 'normal'
    },
    {
      id: 2,
      type: 'vehicle_alert',
      title: 'Maintenance Reminder',
      message: 'Vehicle maintenance is due in 15 days',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      severity: 'medium'
    },
    {
      id: 3,
      type: 'schedule_reminder',
      title: 'Upcoming Trip',
      message: 'Trip to Student Center starts in 2 hours',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      read: true,
      severity: 'normal'
    },
    {
      id: 4,
      type: 'fuel_alert',
      title: 'Fuel Level Notice',
      message: 'Current fuel level is at 75%',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      read: true,
      severity: 'low'
    }
  ],

  complaints: [
    {
      id: 1,
      complainantName: 'Dr. Ahmed Hassan',
      description: 'The vehicle arrived 10 minutes late for the scheduled pickup',
      submittedAt: new Date(Date.now() - 172800000).toISOString(),
      status: 'pending',
      driverResponse: null
    },
    {
      id: 2,
      complainantName: 'Prof. Sarah Johnson',
      description: 'Driver was very professional and helpful',
      submittedAt: new Date(Date.now() - 259200000).toISOString(),
      status: 'responded',
      driverResponse: 'Thank you for your kind feedback!'
    }
  ],

  availability: {
    status: 'available'
  }
};

// Helper to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const driverService = {
  // Trip Management
  getAssignedTrips: async () => {
    if (MOCK_MODE) {
      await delay(500);
      return mockData.trips;
    }
    return api.get('/driver/trips/assigned');
  },

  getTripHistory: async () => {
    if (MOCK_MODE) {
      await delay(500);
      return mockData.tripHistory;
    }
    return api.get('/driver/trips/history');
  },

  acceptTrip: async (tripId) => {
    if (MOCK_MODE) {
      await delay(300);
      const trip = mockData.trips.find(t => t.id === tripId);
      if (trip) trip.status = 'accepted';
      return { success: true };
    }
    return api.post(`/driver/trips/${tripId}/accept`);
  },

  rejectTrip: async (tripId, reason) => {
    if (MOCK_MODE) {
      await delay(300);
      mockData.trips = mockData.trips.filter(t => t.id !== tripId);
      return { success: true };
    }
    return api.post(`/driver/trips/${tripId}/reject`, { reason });
  },

  updateTripStatus: async (tripId, status) => {
    if (MOCK_MODE) {
      await delay(300);
      const trip = mockData.trips.find(t => t.id === tripId);
      if (trip) trip.status = status;
      return { success: true };
    }
    return api.put(`/driver/trips/${tripId}/status`, { status });
  },

  // Vehicle Information
  getVehicleInfo: async () => {
    if (MOCK_MODE) {
      await delay(400);
      return mockData.vehicle;
    }
    return api.get('/driver/vehicle');
  },

  // Notifications
  getNotifications: async () => {
    if (MOCK_MODE) {
      await delay(300);
      return mockData.notifications;
    }
    return api.get('/driver/notifications');
  },

  markNotificationRead: async (notificationId) => {
    if (MOCK_MODE) {
      await delay(200);
      const notification = mockData.notifications.find(n => n.id === notificationId);
      if (notification) notification.read = true;
      return { success: true };
    }
    return api.put(`/driver/notifications/${notificationId}/read`);
  },

  // Fuel Management
  recordFuelRefill: async (data) => {
    if (MOCK_MODE) {
      await delay(500);
      console.log('Fuel refill recorded:', data);
      return { success: true, message: 'Fuel refill recorded successfully' };
    }
    return api.post('/driver/fuel/refill', data);
  },

  reportFuelConsumption: async (tripId, data) => {
    if (MOCK_MODE) {
      await delay(500);
      console.log('Fuel consumption reported:', data);
      return { success: true, message: 'Fuel consumption reported successfully' };
    }
    return api.post(`/driver/fuel/consumption/${tripId}`, data);
  },

  getFuelHistory: async () => {
    if (MOCK_MODE) {
      await delay(400);
      return [
        { date: new Date(Date.now() - 86400000).toISOString(), amount: 45, cost: 180, type: 'refill' },
        { date: new Date(Date.now() - 259200000).toISOString(), amount: 2.5, type: 'consumption' }
      ];
    }
    return api.get('/driver/fuel/history');
  },

  // GPS Tracking
  updateLocation: async (location) => {
    if (MOCK_MODE) {
      // Silent update, no delay
      return { success: true };
    }
    return api.post('/driver/location', location);
  },

  // Vehicle Issues
  reportIssue: async (data) => {
    if (MOCK_MODE) {
      await delay(600);
      console.log('Vehicle issue reported:', data);
      return { success: true, message: 'Issue reported successfully' };
    }
    return api.post('/driver/vehicle/issue', data);
  },

  // Complaints
  getComplaints: async () => {
    if (MOCK_MODE) {
      await delay(400);
      return mockData.complaints;
    }
    return api.get('/driver/complaints');
  },

  respondToComplaint: async (complaintId, response) => {
    if (MOCK_MODE) {
      await delay(500);
      const complaint = mockData.complaints.find(c => c.id === complaintId);
      if (complaint) {
        complaint.driverResponse = response;
        complaint.status = 'responded';
      }
      return { success: true };
    }
    return api.post(`/driver/complaints/${complaintId}/respond`, { response });
  },

  // Submit Complaint to Admin/Transport Office
  submitComplaint: async (data) => {
    if (MOCK_MODE) {
      await delay(600);
      console.log('Complaint submitted:', data);
      return { success: true, message: 'Complaint submitted successfully' };
    }
    return api.post('/driver/complaints/submit', data);
  },

  // Gate Verification
  confirmExit: async (data) => {
    if (MOCK_MODE) {
      await delay(400);
      console.log('Exit confirmed:', data);
      return { success: true, message: 'Exit confirmed successfully' };
    }
    return api.post('/driver/gate/exit', data);
  },

  confirmEntry: async (data) => {
    if (MOCK_MODE) {
      await delay(400);
      console.log('Entry confirmed:', data);
      return { success: true, message: 'Entry confirmed successfully' };
    }
    return api.post('/driver/gate/entry', data);
  },

  // Availability
  updateAvailability: async (status) => {
    if (MOCK_MODE) {
      await delay(300);
      mockData.availability.status = status;
      return { success: true };
    }
    return api.put('/driver/availability', { status });
  },

  getAvailability: async () => {
    if (MOCK_MODE) {
      await delay(200);
      return mockData.availability;
    }
    return api.get('/driver/availability');
  },
};

export default driverService;
