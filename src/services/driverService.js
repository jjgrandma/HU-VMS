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