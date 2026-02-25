// useDriverData.js - Fetch driver data 
// src/pages/driver/hooks/useDriverData.js
import { useState, useEffect } from 'react';
import driverService from '../services/driverService';

const useDriverData = () => {
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState({ upcoming: [], all: [] });
  const [vehicle, setVehicle] = useState(null);
  const [notifications, setNotifications] = useState({ list: [], unreadCount: 0 });
  const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0, total: 0 });
  const [stats, setStats] = useState({ totalTrips: 0, hoursToday: 0, rating: 4.8, totalRatings: 128 });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tripsData, vehicleData, notificationsData, earningsData, statsData] = await Promise.all([
        driverService.getTrips(),
        driverService.getVehicleStatus(),
        driverService.getNotifications(),
        driverService.getEarnings(),
        driverService.getStats()
      ]);
      
      setTrips(tripsData);
      setVehicle(vehicleData);
      setNotifications(notificationsData);
      setEarnings(earningsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching driver data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { trips, vehicle, notifications, earnings, stats, loading, refreshData: fetchData };
};

export default useDriverData; // ← THIS MUST BE AT THE END!