import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './App.css';

// Landing
import LandingPage from './pages/landing/LandingPage';

// Auth
import Login from './pages/auth/Login';

// Components
import AdminHeader from './components/AdminHeader';

// Admin
import AdminSidebar from './pages/admin/AdminSidebar';
import AdminDashboardOverview from './pages/admin/AdminDashboardOverview';
import ManageVehiclesPage from './pages/admin/ManageVehiclesPage';
import AddVehicle from './pages/admin/AddVehicle';
import VehicleStatus from './pages/admin/VehicleStatus';
import VehicleTripHistory from './pages/admin/VehicleTripHistory';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import AddUser from './pages/admin/AddUser';
import ManageDrivers from './pages/admin/ManageDrivers';
import UserRequestReport from './pages/admin/UserRequestReport';
import VehicleTripReport from './pages/admin/VehicleTripReport';
import DriverTripReport from './pages/admin/DriverTripReport';
import DriverPerformanceReport from './pages/admin/DriverPerformanceReport';
import FuelRecordsReport from './pages/admin/FuelRecordsReport';
import Settings from './pages/admin/Settings';

// Transport Officer
import TransportOfficerLayout from './pages/transportOfficer/TransportOfficerLayout';
import OfficerDashboard from './pages/transportOfficer/OfficerDashboard';
import Requests from './pages/transportOfficer/Requests';
import Tracking from './pages/transportOfficer/Tracking';
import Complaints from './pages/transportOfficer/Complaints';
import ViewReports from './pages/transportOfficer/ViewReports';

// Driver
import DriverDashboard from './pages/driver/DriverDashboard';

// User
import UserLayout from './pages/user/UserLayout';
import UserDashboard from './pages/user/UserDashboard';
import UserProfile from './pages/user/UserProfile';
import SubmitVehicleRequest from './pages/user/SubmitVehicleRequest';
import RequestStatus from './pages/user/RequestStatus';
import SubmitComplaint from './pages/user/SubmitComplaint';
import Notifications from './pages/user/Notifications';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Routes>
        {/* Landing Page - Always accessible */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {!user && (
          <>
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}

        {/* Admin Routes */}
        {user?.role === 'ADMIN' && (
          <>
            <Route path="/admin" element={
              <div className="app">
                <AdminSidebar onLogout={handleLogout} />
                <div className="main-content">
                  <AdminHeader />
                  <AdminDashboardOverview />
                </div>
              </div>
            } />
            <Route path="/admin/dashboard" element={
              <div className="app">
                <AdminSidebar onLogout={handleLogout} />
                <div className="main-content">
                  <AdminHeader />
                  <AdminDashboardOverview />
                </div>
              </div>
            } />
            <Route path="/admin/manage-vehicles" element={
              <div className="app">
                <AdminSidebar onLogout={handleLogout} />
                <div className="main-content">
                  <AdminHeader />
                  <ManageVehiclesPage />
                </div>
              </div>
            } />
            <Route path="/admin/vehicle-status" element={
              <div className="app">
                <AdminSidebar onLogout={handleLogout} />
                <div className="main-content">
                  <AdminHeader />
                  <VehicleStatus />
                </div>
              </div>
            } />
            <Route path="/admin/add-vehicle" element={
              <div className="app">
                <AdminSidebar onLogout={handleLogout} />
                <div className="main-content">
                  <AdminHeader />
                  <AddVehicle />
                </div>
              </div>
            } />
            <Route path="/admin/vehicle-trip-history" element={
              <div className="app">
                <AdminSidebar onLogout={handleLogout} />
                <div className="main-content">
                  <AdminHeader />
                  <VehicleTripHistory />
                </div>
              </div>
            } />
            <Route path="/admin/manage-users" element={
              <div className="app">
                <AdminSidebar onLogout={handleLogout} />
                <div className="main-content">
                  <AdminHeader />
                  <ManageUsersPage />
                </div>
              </div>
            } />
            <Route path="/admin/add-user" element={
              <div className="app">
                <AdminSidebar onLogout={handleLogout} />
                <div className="main-content">
                  <AdminHeader />
                  <AddUser />
                </div>
              </div>
            } />
            <Route path="/admin/manage-drivers" element={
              <div className="app">
                <AdminSidebar onLogout={handleLogout} />
                <div className="main-content">
                  <AdminHeader />
                  <ManageDrivers />
                </div>
              </div>
            } />
            <Route path="/admin/user-request-report" element={
              <div className="app">
                <AdminSidebar onLogout={handleLogout} />
                <div className="main-content">
                  <AdminHeader />
                  <UserRequestReport />
                </div>
              </div>
            } />
            <Route path="/admin/vehicle-trip-report" element={
              <div className="app">
                <AdminSidebar onLogout={handleLogout} />
                <div className="main-content">
                  <AdminHeader />
                  <VehicleTripReport />
                </div>
              </div>
            } />
            <Route path="/admin/driver-trip-report" element={
              <div className="app">
                <AdminSidebar onLogout={handleLogout} />
                <div className="main-content">
                  <AdminHeader />
                  <DriverTripReport />
                </div>
              </div>
            } />
            <Route path="/admin/driver-performance-report" element={
              <div className="app">
                <AdminSidebar onLogout={handleLogout} />
                <div className="main-content">
                  <AdminHeader />
                  <DriverPerformanceReport />
                </div>
              </div>
            } />
            <Route path="/admin/fuel-records-report" element={
              <div className="app">
                <AdminSidebar onLogout={handleLogout} />
                <div className="main-content">
                  <AdminHeader />
                  <FuelRecordsReport />
                </div>
              </div>
            } />
            <Route path="/admin/settings" element={
              <div className="app">
                <AdminSidebar onLogout={handleLogout} />
                <div className="main-content">
                  <AdminHeader />
                  <Settings />
                </div>
              </div>
            } />
          </>
        )}

        {/* Transport Officer Routes */}
        {user?.role === 'TRANSPORT' && (
          <>
            <Route path="/transport" element={<Navigate to="/transport/dashboard" replace />} />
            <Route path="/transport" element={<TransportOfficerLayout onLogout={handleLogout} />}>
              <Route path="dashboard" element={<OfficerDashboard />} />
              <Route path="requests" element={<Requests />} />
              <Route path="tracking" element={<Tracking />} />
              <Route path="complaints" element={<Complaints />} />
              <Route path="reports" element={<ViewReports />} />
            </Route>
          </>
        )}

        {/* Driver Routes */}
        {user?.role === 'DRIVER' && (
          <>
            <Route path="/driver" element={<DriverDashboard onLogout={handleLogout} />} />
            <Route path="/driver/dashboard" element={<DriverDashboard onLogout={handleLogout} />} />
          </>
        )}

        {/* User Routes */}
        {user?.role === 'USER' && (
          <>
            <Route path="/user" element={<UserLayout onLogout={handleLogout} />}>
              <Route index element={<UserDashboard />} />
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="request-vehicle" element={<SubmitVehicleRequest />} />
              <Route path="my-requests" element={<RequestStatus />} />
              <Route path="submit-complaint" element={<SubmitComplaint />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<UserProfile />} />
            </Route>
          </>
        )}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

export default App;