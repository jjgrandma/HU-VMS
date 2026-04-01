import React, { createContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const setUserAndPersist = (userData) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, setUser: setUserAndPersist, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };

