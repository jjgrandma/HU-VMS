// src/pages/driver/services/driverService.js

// API Base URL - Change this to your actual backend URL
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/driver';

// Helper function for API calls with error handling
const apiCall = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('token'); // Get auth token
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API call failed');
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Mock data for development (remove when API is ready)
const MOCK_DATA = {
  trips: {
    upcoming: [
      { id: 1, pickup: 'Downtown', dropoff: 'Airport', time: '10:30 AM', status: 'scheduled', passenger: 'Mr. Johnson' },
      { id: 2, pickup: 'Airport', dropoff: 'City Center', time: '2:00 PM', status: 'scheduled', passenger: 'Ms. Smith' }
    ],
    all: [
      { id: 1, pickup: '123 Main St', dropoff: 'Airport Terminal 1', date: 'Today, 10:30 AM', status: 'completed', distance: 12.5, earnings: 25.00, passenger: 'Mr. Johnson' },
      { id: 2, pickup: 'Airport Terminal 2', dropoff: 'Central Station', date: 'Today, 11:30 AM', status: 'completed', distance: 8.3, earnings: 18.50, passenger: 'Ms. Smith' },
      { id: 3, pickup: 'North Mall', dropoff: 'South Park', date: 'Today, 2:00 PM', status: 'in-progress', distance: 15.7, earnings: 32.80, passenger: 'Dr. Williams' },
      { id: 4, pickup: 'East Station', dropoff: 'West End', date: 'Today, 4:30 PM', status: 'scheduled', distance: 10.2, earnings: 22.30, passenger: 'Mrs. Brown' }
    ]
  },
  vehicle: {
    id: 'VH-1234',
    model: 'Tesla Model 3',
    year: 2023,
    licensePlate: 'ABC-1234',
    batteryLevel: 85,
    rangeKm: 320,
    tirePressure: {
      frontLeft: 32,
      frontRight: 32,
      rearLeft: 32,
      rearRight: 32
    },
    nextMaintenance: '2026-03-15',
    oilLevel: 98,
    engineTemp: 92,
    fuelLevel: 65,
    mileage: 15234,
    lastService: '2026-01-20',
    insuranceValid: true,
    registrationValid: true,
    vin: '1HGCM82633A123456',
    healthScore: 92
  },
  notifications: {
    list: [
      { id: 1, type: 'trip', message: 'New trip assigned: Airport pickup', timestamp: new Date(Date.now() - 5*60000), read: false },
      { id: 2, type: 'warning', message: 'Vehicle maintenance due in 3 days', timestamp: new Date(Date.now() - 60*60000), read: false },
      { id: 3, type: 'earnings', message: 'Daily earnings report ready', timestamp: new Date(Date.now() - 120*60000), read: true },
      { id: 4, type: 'success', message: 'Trip completed successfully', timestamp: new Date(Date.now() - 180*60000), read: true }
    ],
    unreadCount: 2
  },
  earnings: {
    today: 125.50,
    week: 875.25,
    month: 3450.75,
    total: 12450.50,
    tripsToday: 8,
    tipsToday: 32.50,
    hourly: 18.75,
    chart: [45, 52, 38, 45, 65, 58, 72]
  },
  stats: {
    totalTrips: 128,
    hoursToday: 6.5,
    rating: 4.8,
    totalRatings: 128,
    acceptanceRate: 95,
    completionRate: 98,
    distanceToday: 45.2,
    distanceTotal: 2345.8
  },
  schedule: {
    today: [
      { id: 1, time: '09:00 AM', route: 'Downtown → Airport', status: 'completed' },
      { id: 2, time: '11:30 AM', route: 'Airport → City Center', status: 'completed' },
      { id: 3, time: '02:00 PM', route: 'Northside → Southside', status: 'in-progress' },
      { id: 4, time: '04:30 PM', route: 'Eastside → Westside', status: 'scheduled' },
      { id: 5, time: '07:00 PM', route: 'Central → Mall', status: 'scheduled' }
    ],
    tomorrow: [
      { id: 6, time: '08:30 AM', route: 'Airport → Hotel', status: 'scheduled' },
      { id: 7, time: '10:00 AM', route: 'Hotel → Convention Center', status: 'scheduled' }
    ]
  },
  fuelHistory: [
    { id: 1, date: '2026-02-25', amount: 45.5, cost: 85.50, location: 'Shell Station', odometer: 15234 },
    { id: 2, date: '2026-02-20', amount: 38.2, cost: 72.80, location: 'Exxon', odometer: 14890 }
  ],
  maintenanceHistory: [
    { id: 1, date: '2026-01-20', type: 'Oil Change', cost: 65.00, notes: 'Regular maintenance' },
    { id: 2, date: '2025-12-15', type: 'Tire Rotation', cost: 25.00, notes: 'Winter tire check' }
  ]
};

// Configuration for using mock data (set to false when API is ready)
const USE_MOCK = true;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const driverService = {
  // ==================== TRIP MANAGEMENT ====================

  /**
   * Get all trips for the driver
   * @param {Object} filters - Optional filters (status, date, etc.)
   * @returns {Promise<Object>} Trip data
   */
  getTrips: async (filters = {}) => {
    if (USE_MOCK) {
      await delay(500); // Simulate network delay
      
      let trips = { ...MOCK_DATA.trips };
      
      // Apply filters if provided
      if (filters.status) {
        trips.all = trips.all.filter(t => t.status === filters.status);
      }
      if (filters.date) {
        trips.all = trips.all.filter(t => t.date.includes(filters.date));
      }
      
      return trips;
    }
    
    const queryParams = new URLSearchParams(filters).toString();
    return await apiCall(`/trips${queryParams ? `?${queryParams}` : ''}`);
  },

  /**
   * Get upcoming trips only
   * @returns {Promise<Array>} Upcoming trips
   */
  getUpcomingTrips: async () => {
    if (USE_MOCK) {
      await delay(300);
      return MOCK_DATA.trips.upcoming;
    }
    return await apiCall('/trips/upcoming');
  },

  /**
   * Get a specific trip by ID
   * @param {string|number} tripId - Trip ID
   * @returns {Promise<Object>} Trip details
   */
  getTripById: async (tripId) => {
    if (USE_MOCK) {
      await delay(300);
      const trip = MOCK_DATA.trips.all.find(t => t.id === parseInt(tripId));
      if (!trip) throw new Error('Trip not found');
      return trip;
    }
    return await apiCall(`/trips/${tripId}`);
  },

  /**
   * Start a trip
   * @param {string|number} tripId - Trip ID
   * @param {Object} startData - Start data (odometer, time, etc.)
   * @returns {Promise<Object>} Start confirmation
   */
  startTrip: async (tripId, startData = {}) => {
    if (USE_MOCK) {
      await delay(400);
      return { 
        success: true, 
        message: 'Trip started successfully',
        data: {
          tripId,
          startTime: new Date().toISOString(),
          ...startData
        }
      };
    }
    return await apiCall(`/trips/${tripId}/start`, {
      method: 'POST',
      body: JSON.stringify(startData)
    });
  },

  /**
   * Complete a trip
   * @param {string|number} tripId - Trip ID
   * @param {Object} completionData - Completion data (odometer, notes, etc.)
   * @returns {Promise<Object>} Completion confirmation
   */
  completeTrip: async (tripId, completionData = {}) => {
    if (USE_MOCK) {
      await delay(400);
      return { 
        success: true, 
        message: 'Trip completed successfully',
        data: {
          tripId,
          earnings: 25.00,
          distance: 12.5,
          endTime: new Date().toISOString(),
          ...completionData
        }
      };
    }
    return await apiCall(`/trips/${tripId}/complete`, {
      method: 'POST',
      body: JSON.stringify(completionData)
    });
  },

  /**
   * Cancel a trip
   * @param {string|number} tripId - Trip ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Cancellation confirmation
   */
  cancelTrip: async (tripId, reason) => {
    if (USE_MOCK) {
      await delay(300);
      return { success: true, message: 'Trip cancelled' };
    }
    return await apiCall(`/trips/${tripId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  // ==================== VEHICLE MANAGEMENT ====================

  /**
   * Get vehicle status
   * @returns {Promise<Object>} Vehicle status data
   */
  getVehicleStatus: async () => {
    if (USE_MOCK) {
      await delay(400);
      return MOCK_DATA.vehicle;
    }
    return await apiCall('/vehicle/status');
  },

  /**
   * Get detailed vehicle information
   * @returns {Promise<Object>} Vehicle details
   */
  getVehicleDetails: async () => {
    if (USE_MOCK) {
      await delay(300);
      return {
        ...MOCK_DATA.vehicle,
        features: ['Autopilot', 'Heated Seats', 'Navigation', 'Bluetooth'],
        lastMaintenance: '2026-01-20',
        nextMaintenance: '2026-03-15',
        warranty: '2028-12-31'
      };
    }
    return await apiCall('/vehicle/details');
  },

  /**
   * Report a vehicle issue
   * @param {Object} issueData - Issue details
   * @returns {Promise<Object>} Report confirmation
   */
  reportIssue: async (issueData) => {
    if (USE_MOCK) {
      await delay(500);
      return { 
        success: true, 
        message: 'Issue reported successfully',
        issueId: Date.now()
      };
    }
    return await apiCall('/vehicle/issues', {
      method: 'POST',
      body: JSON.stringify(issueData)
    });
  },

  /**
   * Get vehicle issue history
   * @returns {Promise<Array>} Issue history
   */
  getIssueHistory: async () => {
    if (USE_MOCK) {
      await delay(400);
      return [
        { id: 1, date: '2026-02-01', type: 'Tire pressure low', status: 'resolved' },
        { id: 2, date: '2026-01-15', type: 'Check engine light', status: 'resolved' }
      ];
    }
    return await apiCall('/vehicle/issues/history');
  },

  /**
   * Update vehicle status
   * @param {string} status - New status
   * @returns {Promise<Object>} Update confirmation
   */
  updateVehicleStatus: async (status) => {
    if (USE_MOCK) {
      await delay(300);
      return { success: true, message: 'Status updated' };
    }
    return await apiCall('/vehicle/status', {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  // ==================== NOTIFICATIONS ====================

  /**
   * Get all notifications
   * @returns {Promise<Object>} Notifications data
   */
  getNotifications: async () => {
    if (USE_MOCK) {
      await delay(400);
      return MOCK_DATA.notifications;
    }
    return await apiCall('/notifications');
  },

  /**
   * Mark a notification as read
   * @param {string|number} notificationId - Notification ID
   * @returns {Promise<Object>} Update confirmation
   */
  markNotificationRead: async (notificationId) => {
    if (USE_MOCK) {
      await delay(200);
      return { success: true };
    }
    return await apiCall(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Update confirmation
   */
  markAllNotificationsRead: async () => {
    if (USE_MOCK) {
      await delay(300);
      return { success: true };
    }
    return await apiCall('/notifications/read-all', {
      method: 'PUT'
    });
  },

  /**
   * Delete a notification
   * @param {string|number} notificationId - Notification ID
   * @returns {Promise<Object>} Delete confirmation
   */
  deleteNotification: async (notificationId) => {
    if (USE_MOCK) {
      await delay(200);
      return { success: true };
    }
    return await apiCall(`/notifications/${notificationId}`, {
      method: 'DELETE'
    });
  },

  // ==================== EARNINGS ====================

  /**
   * Get earnings data
   * @param {string} period - Period (today, week, month, year)
   * @returns {Promise<Object>} Earnings data
   */
  getEarnings: async (period = 'today') => {
    if (USE_MOCK) {
      await delay(400);
      return MOCK_DATA.earnings;
    }
    return await apiCall(`/earnings?period=${period}`);
  },

  /**
   * Get earnings history
   * @param {Object} filters - Date range filters
   * @returns {Promise<Array>} Earnings history
   */
  getEarningsHistory: async (filters = {}) => {
    if (USE_MOCK) {
      await delay(500);
      return [
        { date: '2026-02-25', amount: 125.50, trips: 8 },
        { date: '2026-02-24', amount: 145.30, trips: 9 },
        { date: '2026-02-23', amount: 98.20, trips: 6 },
        { date: '2026-02-22', amount: 167.80, trips: 10 }
      ];
    }
    const queryParams = new URLSearchParams(filters).toString();
    return await apiCall(`/earnings/history${queryParams ? `?${queryParams}` : ''}`);
  },

  /**
   * Request payout
   * @param {Object} payoutData - Payout details
   * @returns {Promise<Object>} Payout confirmation
   */
  requestPayout: async (payoutData = {}) => {
    if (USE_MOCK) {
      await delay(600);
      return { 
        success: true, 
        message: 'Payout requested successfully',
        estimatedDate: new Date(Date.now() + 2*24*60*60*1000).toISOString().split('T')[0]
      };
    }
    return await apiCall('/earnings/payout', {
      method: 'POST',
      body: JSON.stringify(payoutData)
    });
  },

  // ==================== STATISTICS ====================

  /**
   * Get driver statistics
   * @returns {Promise<Object>} Statistics data
   */
  getStats: async () => {
    if (USE_MOCK) {
      await delay(400);
      return MOCK_DATA.stats;
    }
    return await apiCall('/stats');
  },

  /**
   * Get performance metrics
   * @returns {Promise<Object>} Performance data
   */
  getPerformanceMetrics: async () => {
    if (USE_MOCK) {
      await delay(500);
      return {
        weekly: [85, 92, 88, 95, 90, 87, 93],
        monthly: [88, 91, 89, 94],
        rating: 4.8,
        acceptanceRate: 95,
        completionRate: 98,
        onTimeRate: 96
      };
    }
    return await apiCall('/stats/performance');
  },

  // ==================== SCHEDULE ====================

  /**
   * Get driver schedule
   * @param {string} day - Day (today, tomorrow, or date)
   * @returns {Promise<Object>} Schedule data
   */
  getSchedule: async (day = 'today') => {
    if (USE_MOCK) {
      await delay(400);
      return MOCK_DATA.schedule[day] || MOCK_DATA.schedule.today;
    }
    return await apiCall(`/schedule?day=${day}`);
  },

  /**
   * Get weekly schedule
   * @returns {Promise<Array>} Weekly schedule
   */
  getWeeklySchedule: async () => {
    if (USE_MOCK) {
      await delay(500);
      return [
        { day: 'Monday', trips: 8, earnings: 145.50 },
        { day: 'Tuesday', trips: 7, earnings: 132.30 },
        { day: 'Wednesday', trips: 9, earnings: 167.80 },
        { day: 'Thursday', trips: 6, earnings: 112.40 },
        { day: 'Friday', trips: 10, earnings: 198.20 }
      ];
    }
    return await apiCall('/schedule/weekly');
  },

  // ==================== FUEL MANAGEMENT ====================

  /**
   * Get fuel history
   * @returns {Promise<Array>} Fuel history
   */
  getFuelHistory: async () => {
    if (USE_MOCK) {
      await delay(400);
      return MOCK_DATA.fuelHistory;
    }
    return await apiCall('/fuel/history');
  },

  /**
   * Log fuel purchase
   * @param {Object} fuelData - Fuel data
   * @returns {Promise<Object>} Log confirmation
   */
  logFuel: async (fuelData) => {
    if (USE_MOCK) {
      await delay(500);
      return { 
        success: true, 
        message: 'Fuel logged successfully',
        id: Date.now()
      };
    }
    return await apiCall('/fuel/log', {
      method: 'POST',
      body: JSON.stringify(fuelData)
    });
  },

  // ==================== MAINTENANCE ====================

  /**
   * Get maintenance history
   * @returns {Promise<Array>} Maintenance history
   */
  getMaintenanceHistory: async () => {
    if (USE_MOCK) {
      await delay(400);
      return MOCK_DATA.maintenanceHistory;
    }
    return await apiCall('/maintenance/history');
  },

  /**
   * Schedule maintenance
   * @param {Object} maintenanceData - Maintenance details
   * @returns {Promise<Object>} Schedule confirmation
   */
  scheduleMaintenance: async (maintenanceData) => {
    if (USE_MOCK) {
      await delay(500);
      return { 
        success: true, 
        message: 'Maintenance scheduled',
        appointmentId: Date.now()
      };
    }
    return await apiCall('/maintenance/schedule', {
      method: 'POST',
      body: JSON.stringify(maintenanceData)
    });
  },

  // ==================== LOCATION & STATUS ====================

  /**
   * Update driver location
   * @param {Object} location - Location coordinates
   * @returns {Promise<Object>} Update confirmation
   */
  updateLocation: async (location) => {
    if (USE_MOCK) {
      // In mock mode, just log the location
      console.log('Location updated:', location);
      return { success: true };
    }
    return await apiCall('/location', {
      method: 'POST',
      body: JSON.stringify(location)
    });
  },

  /**
   * Update driver status
   * @param {string} status - New status (online, offline, onBreak)
   * @returns {Promise<Object>} Update confirmation
   */
  updateStatus: async (status) => {
    if (USE_MOCK) {
      await delay(200);
      return { success: true, status };
    }
    return await apiCall('/status', {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  /**
   * Get current driver status
   * @returns {Promise<Object>} Current status
   */
  getCurrentStatus: async () => {
    if (USE_MOCK) {
      await delay(200);
      return { 
        status: 'online',
        since: new Date().toISOString(),
        shiftStart: new Date(Date.now() - 4*60*60*1000).toISOString()
      };
    }
    return await apiCall('/status');
  },

  // ==================== PROFILE ====================

  /**
   * Get driver profile
   * @returns {Promise<Object>} Profile data
   */
  getProfile: async () => {
    if (USE_MOCK) {
      await delay(400);
      return {
        id: 'DRV001',
        name: 'John Driver',
        email: 'john.driver@example.com',
        phone: '+1 (555) 123-4567',
        license: 'DL-12345678',
        joinDate: '2025-01-15',
        avatar: 'https://ui-avatars.com/api/?name=John+Driver&background=0D8F81&color=fff'
      };
    }
    return await apiCall('/profile');
  },

  /**
   * Update driver profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Update confirmation
   */
  updateProfile: async (profileData) => {
    if (USE_MOCK) {
      await delay(500);
      return { success: true, message: 'Profile updated' };
    }
    return await apiCall('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // ==================== DASHBOARD ====================

  /**
   * Get complete dashboard data in one call
   * @returns {Promise<Object>} Dashboard data
   */
  getDashboardData: async () => {
    if (USE_MOCK) {
      await delay(800); // Simulate loading
      return {
        stats: MOCK_DATA.stats,
        upcomingTrips: MOCK_DATA.trips.upcoming,
        vehicleStatus: MOCK_DATA.vehicle,
        recentActivities: [
          { id: 1, action: 'Trip completed', location: 'Airport to Hotel', time: '2 hours ago', icon: '✅' },
          { id: 2, action: 'Vehicle fueled', location: 'Shell Station', time: '5 hours ago', icon: '⛽' },
          { id: 3, action: 'Break taken', location: 'Rest area', time: '3 hours ago', icon: '☕' }
        ],
        notifications: MOCK_DATA.notifications.list.slice(0, 3),
        earnings: MOCK_DATA.earnings.today
      };
    }
    return await apiCall('/dashboard');
  },

  // ==================== UTILITY ====================

  /**
   * Toggle mock mode (for development)
   * @param {boolean} useMock - Whether to use mock data
   */
  setMockMode: (useMock) => {
    USE_MOCK = useMock;
  },

  /**
   * Clear all local data (logout)
   */
  clearLocalData: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default driverService;