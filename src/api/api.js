const BASE_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// ─── Auth ────────────────────────────────────────────────
export const login = async (username, password, role) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// ─── Requests ────────────────────────────────────────────
export const getRequests = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await fetch(`${BASE_URL}/requests?${params}`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const createRequest = async (requestData) => {
  const res = await fetch(`${BASE_URL}/requests`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(requestData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const updateRequest = async (id, updates) => {
  const res = await fetch(`${BASE_URL}/requests/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const deleteRequest = async (id) => {
  const res = await fetch(`${BASE_URL}/requests/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

// ─── Vehicles ────────────────────────────────────────────
export const getVehicles = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await fetch(`${BASE_URL}/vehicles?${params}`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const updateVehicle = async (id, updates) => {
  const res = await fetch(`${BASE_URL}/vehicles/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

// ─── Drivers ─────────────────────────────────────────────
export const getDrivers = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await fetch(`${BASE_URL}/drivers?${params}`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

// ─── Users ───────────────────────────────────────────────
export const getUsers = async () => {
  const res = await fetch(`${BASE_URL}/users`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};
