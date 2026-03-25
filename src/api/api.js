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

export const approveRequest = async (id, payload) => {
  const res = await fetch(`${BASE_URL}/requests/${id}/approve`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const rejectRequest = async (id, rejectionReason) => {
  const res = await fetch(`${BASE_URL}/requests/${id}/reject`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ rejectionReason }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const startTrip = async (id) => {
  const res = await fetch(`${BASE_URL}/requests/${id}/start`, {
    method: 'PUT',
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const completeTrip = async (id) => {
  const res = await fetch(`${BASE_URL}/requests/${id}/complete`, {
    method: 'PUT',
    headers: headers(),
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
export const createVehicle = async (vehicleData) => {
  const res = await fetch(`${BASE_URL}/vehicles`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(vehicleData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

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

export const createDriver = async (driverData) => {
  const res = await fetch(`${BASE_URL}/drivers`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(driverData),
  });
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

// ─── Additional helpers ───────────────────────────────────
export const registerUser = async (userData) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const deleteUser = async (id) => {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const updateUser = async (id, updates) => {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const resetUserPassword = async (id, newPassword) => {
  const res = await fetch(`${BASE_URL}/users/${id}/reset-password`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const resetUsername = async (id, newUsername) => {
  const res = await fetch(`${BASE_URL}/users/${id}/reset-username`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ newUsername }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const deleteVehicle = async (id) => {
  const res = await fetch(`${BASE_URL}/vehicles/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const deleteDriver = async (id) => {
  const res = await fetch(`${BASE_URL}/drivers/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const updateDriver = async (id, updates) => {
  const res = await fetch(`${BASE_URL}/drivers/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

// ─── Reports ─────────────────────────────────────────────
export const getVehicleUsageReport = async () => {
  const res = await fetch(`${BASE_URL}/reports/vehicle-usage`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const getDriverActivityReport = async () => {
  const res = await fetch(`${BASE_URL}/reports/driver-activity`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const getRequestsSummaryReport = async () => {
  const res = await fetch(`${BASE_URL}/reports/requests-summary`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const sendReport = async (payload) => {
  const res = await fetch(`${BASE_URL}/reports/send`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const getReceivedReports = async () => {
  const res = await fetch(`${BASE_URL}/reports/received`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const submitReportRequest = async (payload) => {
  const res = await fetch(`${BASE_URL}/reports/request`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const getReportRequests = async () => {
  const res = await fetch(`${BASE_URL}/reports/requests`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const updateReportRequest = async (id, updates) => {
  const res = await fetch(`${BASE_URL}/reports/requests/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

// ─── Complaints ───────────────────────────────────────────
export const getComplaints = async () => {
  const res = await fetch(`${BASE_URL}/complaints`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const createComplaint = async (payload) => {
  const res = await fetch(`${BASE_URL}/complaints`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const updateComplaint = async (id, updates) => {
  const res = await fetch(`${BASE_URL}/complaints/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

// ─── Fuel Records ─────────────────────────────────────────
export const getFuelRecords = async () => {
  const res = await fetch(`${BASE_URL}/fuel`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const createFuelRecord = async (payload) => {
  const res = await fetch(`${BASE_URL}/fuel`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const deleteFuelRecord = async (id) => {
  const res = await fetch(`${BASE_URL}/fuel/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};
