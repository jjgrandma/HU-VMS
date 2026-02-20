import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCheckCircle, 
  FaClock, 
  FaSpinner, 
  FaTimesCircle,
  FaCar,
  FaExclamationTriangle,
  FaClipboardList,
  FaBell
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = ({ requests, complaints, notifications }) => {
  // Calculate stats
  const stats = {
    totalRequests: requests.length,
    pending: requests.filter(r => r.status === 'Pending').length,
    approved: requests.filter(r => r.status === 'Approved').length,
    completed: requests.filter(r => r.status === 'Completed').length,
    rejected: requests.filter(r => r.status === 'Rejected').length,
    activeComplaints: complaints.filter(c => c.status !== 'Resolved').length,
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Approved': return <FaCheckCircle className="text-green-500 text-lg" />;
      case 'Pending': return <FaClock className="text-yellow-500 text-lg" />;
      case 'In Progress': return <FaSpinner className="text-blue-500 text-lg animate-spin" />;
      case 'Rejected': return <FaTimesCircle className="text-red-500 text-lg" />;
      case 'Completed': return <FaCheckCircle className="text-green-500 text-lg" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'bg-green-100 text-green-800 border-l-4 border-green-500';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-l-4 border-blue-500';
      case 'Rejected': return 'bg-red-100 text-red-800 border-l-4 border-red-500';
      case 'Completed': return 'bg-green-100 text-green-800 border-l-4 border-green-500';
      default: return 'bg-gray-100 text-gray-800 border-l-4 border-gray-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-lg text-gray-600"></p>
      </div>

      {/* Stats Cards - Larger and more colorful */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <FaClipboardList className="text-3xl opacity-80" />
            <span className="text-sm font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full">Total</span>
          </div>
          <div className="text-4xl font-bold mb-2">{stats.totalRequests}</div>
          <div className="text-lg opacity-90">Total Requests</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <FaClock className="text-3xl opacity-80" />
            <span className="text-sm font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full">Pending</span>
          </div>
          <div className="text-4xl font-bold mb-2">{stats.pending}</div>
          <div className="text-lg opacity-90">Pending Requests</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <FaCheckCircle className="text-3xl opacity-80" />
            <span className="text-sm font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full">Approved</span>
          </div>
          <div className="text-4xl font-bold mb-2">{stats.approved}</div>
          <div className="text-lg opacity-90">Approved Requests</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <FaExclamationTriangle className="text-3xl opacity-80" />
            <span className="text-sm font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full">Active</span>
          </div>
          <div className="text-4xl font-bold mb-2">{stats.activeComplaints}</div>
          <div className="text-lg opacity-90">Active Complaints</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
            <h2 className="text-xl font-bold text-white">Recent Requests</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {requests.slice(0, 5).map((request) => (
              <div key={request.id} className={`px-6 py-4 hover:bg-gray-50 transition-colors ${getStatusColor(request.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(request.status)}
                    <span className="font-bold text-gray-800">{request.id}</span>
                  </div>
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-white shadow-sm">
                    {request.status}
                  </span>
                </div>
                <div className="text-gray-600 text-sm">
                  <span className="font-medium">{request.vehicleType}</span> • {request.purpose} • 
                  <span className="text-gray-500"> {request.date} at {request.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <Link to="/requests" className="text-blue-600 hover:text-blue-800 font-semibold flex items-center">
              View All Requests 
              <span className="ml-2 text-xl">→</span>
            </Link>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Recent Notifications</h2>
              <FaBell className="text-white text-xl" />
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {notifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className={`px-6 py-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}>
                <div className="flex items-start">
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{notification.title}</p>
                    <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">New</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <Link to="/notifications" className="text-orange-600 hover:text-orange-800 font-semibold flex items-center">
              View All Notifications
              <span className="ml-2 text-xl">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/submit-request"
          className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-8 text-center hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-xl"
        >
          <FaCar className="mx-auto text-5xl mb-4 group-hover:animate-bounce" />
          <h3 className="text-2xl font-bold mb-2">Submit Vehicle Request</h3>
          <p className="text-blue-100 text-lg">Request a vehicle for your trip</p>
        </Link>
        <Link
          to="/submit-complaint"
          className="group bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl p-8 text-center hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 shadow-xl"
        >
          <FaExclamationTriangle className="mx-auto text-5xl mb-4 group-hover:animate-bounce" />
          <h3 className="text-2xl font-bold mb-2">Submit Complaint</h3>
          <p className="text-red-100 text-lg">Report an issue or concern</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;