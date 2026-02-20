import React from 'react';
import { 
  FaCheckCircle, 
  FaInfoCircle, 
  FaExclamationTriangle, 
  FaBell, 
  FaCheck 
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const Notifications = ({ notifications, onMarkAsRead, onMarkAllAsRead }) => {
  const getIcon = (type) => {
    switch(type) {
      case 'success': return <FaCheckCircle className="text-green-500 text-xl" />;
      case 'info': return <FaInfoCircle className="text-blue-500 text-xl" />;
      case 'warning': return <FaExclamationTriangle className="text-yellow-500 text-xl" />;
      default: return <FaBell className="text-gray-500 text-xl" />;
    }
  };

  const getBgColor = (type, read) => {
    if (read) return 'bg-white';
    switch(type) {
      case 'success': return 'bg-green-50';
      case 'info': return 'bg-blue-50';
      case 'warning': return 'bg-yellow-50';
      default: return 'bg-gray-50';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <FaCheck className="mr-2" />
            Mark All as Read
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <FaBell className="mx-auto text-4xl text-gray-400 mb-3" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 ${getBgColor(notification.type, notification.read)} hover:bg-gray-50 transition-colors relative cursor-pointer`}
                onClick={() => !notification.read && onMarkAsRead(notification.id)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-lg">{notification.title}</h3>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-600">{notification.message}</p>
                  </div>
                  {!notification.read && (
                    <div className="ml-4">
                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Notifications</span>
          <span className="font-semibold">{notifications.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-600">Unread</span>
          <span className="font-semibold text-blue-600">{unreadCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-600">Read</span>
          <span className="font-semibold text-gray-600">{notifications.length - unreadCount}</span>
        </div>
      </div>
    </div>
  );
};

export default Notifications;