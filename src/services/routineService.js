const API_BASE = 'http://localhost:5000/api/routines';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ── Schedule CRUD ─────────────────────────────────────────────

export async function getSchedules(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}${qs ? `?${qs}` : ''}`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function getScheduleById(id) {
  const res = await fetch(`${API_BASE}/${id}`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function createSchedule(data) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateSchedule(id, data) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteSchedule(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(res);
}

// ── Trip Logs ─────────────────────────────────────────────────

export async function getTripLogs(scheduleId, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/${scheduleId}/logs${qs ? `?${qs}` : ''}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function completeTrip(logId) {
  const res = await fetch(`${API_BASE}/trips/${logId}/complete`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return handleResponse(res);
}

// ── Driver endpoints ──────────────────────────────────────────

export async function getMyTrips() {
  const res = await fetch(`${API_BASE}/driver/my-trips`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function getMySchedule() {
  const res = await fetch(`${API_BASE}/driver/my-schedule`, { headers: getHeaders() });
  return handleResponse(res);
}
