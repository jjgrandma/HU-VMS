import React, { useState } from 'react';
import { 
  FaSearch, 
  FaCheckCircle, 
  FaClock, 
  FaSpinner, 
  FaTimesCircle 
} from 'react-icons/fa';

const RequestStatus = ({ requests }) => {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filters = ['All', 'Pending', 'Approved', 'In Progress', 'Completed', 'Rejected'];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Approved': return <FaCheckCircle className="text-green-500" />;
      case 'Pending': return <FaClock className="text-yellow-500" />;
      case 'In Progress': return <FaSpinner className="text-blue-500" />;
      case 'Rejected': return <FaTimesCircle className="text-red-500" />;
      case 'Completed': return <FaCheckCircle className="text-green-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests
    .filter(req => filter === 'All' || req.status === filter)
    .filter(req => 
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.destination.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Request Status</h1>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, purpose, or destination..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No requests found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center mb-2 md:mb-0">
                    {getStatusIcon(request.status)}
                    <span className="ml-2 font-semibold text-lg">{request.id}</span>
                  </div>
                  <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Vehicle Type</p>
                    <p className="font-medium">{request.vehicleType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Purpose</p>
                    <p className="font-medium">{request.purpose}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium">{request.date} at {request.time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Destination</p>
                    <p className="font-medium">{request.destination}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Passengers</p>
                    <p className="font-medium">{request.passengers}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Requested On</p>
                    <p className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestStatus;