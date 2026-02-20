import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Changed to HashRouter
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import RequestStatus from './components/RequestStatus';
import SubmitComplaint from './components/SubmitComplaint';
import SubmitVehicleRequest from './components/SubmitVehicleRequest';
import Notifications from './components/Notifications';
import { mockRequests, mockComplaints, mockNotifications } from './data/mockData';

function App() {
  const [requests, setRequests] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load mock data on initial render
  useEffect(() => {
    // Load from localStorage if available, otherwise use mock data
    const savedRequests = localStorage.getItem('requests');
    const savedComplaints = localStorage.getItem('complaints');
    const savedNotifications = localStorage.getItem('notifications');

    if (savedRequests) {
      setRequests(JSON.parse(savedRequests));
    } else {
      setRequests(mockRequests);
      localStorage.setItem('requests', JSON.stringify(mockRequests));
    }

    if (savedComplaints) {
      setComplaints(JSON.parse(savedComplaints));
    } else {
      setComplaints(mockComplaints);
      localStorage.setItem('complaints', JSON.stringify(mockComplaints));
    }

    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      setNotifications(mockNotifications);
      localStorage.setItem('notifications', JSON.stringify(mockNotifications));
    }
  }, []);

  // Update unread count when notifications change
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (requests.length) localStorage.setItem('requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    if (complaints.length) localStorage.setItem('complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    if (notifications.length) localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Function to add a new vehicle request
  const addVehicleRequest = (newRequest) => {
    const request = {
      ...newRequest,
      id: `REQ${String(requests.length + 1).padStart(3, '0')}`,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    const updatedRequests = [request, ...requests];
    setRequests(updatedRequests);

    // Add notification
    const notification = {
      id: `NOT${String(notifications.length + 1).padStart(3, '0')}`,
      title: 'Request Submitted',
      message: `Your vehicle request ${request.id} has been submitted successfully.`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications([notification, ...notifications]);
  };

  // Function to add a new complaint
  const addComplaint = (newComplaint) => {
    const complaint = {
      ...newComplaint,
      id: `CMP${String(complaints.length + 1).padStart(3, '0')}`,
      status: 'Received',
      createdAt: new Date().toISOString()
    };
    const updatedComplaints = [complaint, ...complaints];
    setComplaints(updatedComplaints);

    // Add notification
    const notification = {
      id: `NOT${String(notifications.length + 1).padStart(3, '0')}`,
      title: 'Complaint Submitted',
      message: `Your complaint ${complaint.id} has been received and is under review.`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications([notification, ...notifications]);
  };

  // Function to mark notification as read
  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
  };

  // Function to mark all as read
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar unreadCount={unreadCount} />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard requests={requests} complaints={complaints} notifications={notifications.slice(0, 3)} />} />
            <Route path="/requests" element={<RequestStatus requests={requests} />} />
            <Route path="/submit-complaint" element={<SubmitComplaint onSubmit={addComplaint} />} />
            <Route path="/submit-request" element={<SubmitVehicleRequest onSubmit={addVehicleRequest} />} />
            <Route path="/notifications" element={
              <Notifications 
                notifications={notifications} 
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
              />
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;