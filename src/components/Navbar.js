import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaClipboardList, 
  FaExclamationTriangle, 
  FaCar, 
  FaBell 
} from 'react-icons/fa';

const Navbar = ({ unreadCount }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', name: 'Dashboard', icon: <FaHome />, color: 'blue' },
    { path: '/requests', name: 'Requests', icon: <FaClipboardList />, color: 'green' },
    { path: '/submit-complaint', name: 'Complaint', icon: <FaExclamationTriangle />, color: 'red' },
    { path: '/submit-request', name: 'New Request', icon: <FaCar />, color: 'purple' },
    { path: '/notifications', name: 'Notifications', icon: <FaBell />, color: 'orange', badge: unreadCount },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getActiveStyles = (path, color) => {
    if (isActive(path)) {
      const colorMap = {
        blue: 'bg-blue-600 text-white shadow-lg scale-105',
        green: 'bg-green-600 text-white shadow-lg scale-105',
        red: 'bg-red-600 text-white shadow-lg scale-105',
        purple: 'bg-purple-600 text-white shadow-lg scale-105',
        orange: 'bg-orange-600 text-white shadow-lg scale-105'
      };
      return colorMap[color] || 'bg-blue-600 text-white shadow-lg scale-105';
    }
    return 'text-gray-600 hover:bg-gray-100 hover:scale-105';
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo with larger font */}
          <div className="flex items-center">
            <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              USER PORTAL
            </span>
          </div>
          
          {/* Navigation Items - Larger and more prominent */}
          <div className="flex space-x-1 md:space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 md:px-5 py-3 rounded-lg text-sm md:text-base font-semibold transition-all duration-200 relative ${
                  getActiveStyles(item.path, item.color)
                }`}
              >
                <span className="mr-2 text-lg md:text-xl">{item.icon}</span>
                <span className="hidden md:inline">{item.name}</span>
                {item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 md:h-6 md:w-6 flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;