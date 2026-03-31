import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFuelRequests, getFuelInventory } from '../../api/api';
import './FuelDashboard.css';
import './fuelstation.css';

const FuelDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFuelDispensedToday: 0,
    dieselAvailable: 0,
    petrolAvailable: 0,
    totalTransactionsToday: 0,
    weeklyFuelDispensed: 0,
    pendingAuthorizations: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requests, inventory] = await Promise.all([
          getFuelRequests(),
          getFuelInventory(),
        ]);

        const today = new Date().toDateString();
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const dispensedToday = requests.filter(
          r => r.status === 'dispensed' && new Date(r.dispensedAt).toDateString() === today
        );
        const dispensedThisWeek = requests.filter(
          r => r.status === 'dispensed' && new Date(r.dispensedAt) >= oneWeekAgo
        );
        const pending = requests.filter(r => r.status === 'pending');

        const diesel = inventory.find(i => i.fuelType === 'Diesel');
        const petrol = inventory.find(i => i.fuelType === 'Petrol');

        setStats({
          totalFuelDispensedToday: dispensedToday.reduce((s, r) => s + (r.dispensedLiters || 0), 0),
          totalTransactionsToday: dispensedToday.length,
          weeklyFuelDispensed: dispensedThisWeek.reduce((s, r) => s + (r.dispensedLiters || 0), 0),
          pendingAuthorizations: pending.length,
          dieselAvailable: diesel?.available || 0,
          petrolAvailable: petrol?.available || 0,
        });

        // Show 5 most recent dispensed requests
        setRecentRequests(
          requests.filter(r => r.status === 'dispensed').slice(0, 5)
        );
      } catch (err) {
        console.error('Dashboard fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status) => (
    <span className={`status-badge ${status?.toLowerCase()}`}>{status}</span>
  );

  if (loading) return <p style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>Loading...</p>;

  return (
    <div className="fuel-dashboard-content">
      <div className="fuel-dashboard-header">
        <h2>Fuel Station Dashboard</h2>
        <p>Monitor fuel operations and inventory status</p>
      </div>

      {/* Summary Cards */}
      <div className="fuel-stats-grid">
        <div className="fuel-stat-card blue">
          <div className="fuel-stat-icon">⛽</div>
          <div className="fuel-stat-value">{stats.totalFuelDispensedToday.toFixed(1)}L</div>
          <div className="fuel-stat-label">Total Fuel Dispensed Today</div>
        </div>
        <div className="fuel-stat-card green">
          <div className="fuel-stat-icon">🟢</div>
          <div className="fuel-stat-value">{stats.dieselAvailable.toLocaleString()}L</div>
          <div className="fuel-stat-label">Diesel Available</div>
        </div>
        <div className="fuel-stat-card orange">
          <div className="fuel-stat-icon">🟠</div>
          <div className="fuel-stat-value">{stats.petrolAvailable.toLocaleString()}L</div>
          <div className="fuel-stat-label">Petrol Available</div>
        </div>
        <div className="fuel-stat-card purple">
          <div className="fuel-stat-icon">📊</div>
          <div className="fuel-stat-value">{stats.totalTransactionsToday}</div>
          <div className="fuel-stat-label">Transactions Today</div>
        </div>
        <div className="fuel-stat-card teal">
          <div className="fuel-stat-icon">📈</div>
          <div className="fuel-stat-value">{stats.weeklyFuelDispensed.toFixed(1)}L</div>
          <div className="fuel-stat-label">Weekly Fuel Dispensed</div>
        </div>
        <div className="fuel-stat-card red">
          <div className="fuel-stat-icon">⏳</div>
          <div className="fuel-stat-value">{stats.pendingAuthorizations}</div>
          <div className="fuel-stat-label">Pending (awaiting transport officer)</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="fuel-quick-actions">
        <button className="fuel-action-btn secondary" onClick={() => navigate('/fuel/requests')}>
          <span className="action-icon">✓</span>
          <span>Dispense Fuel</span>
        </button>
        <button className="fuel-action-btn success" onClick={() => navigate('/fuel/inventory')}>
          <span className="action-icon">📦</span>
          <span>Update Inventory</span>
        </button>
        <button className="fuel-action-btn primary" onClick={() => navigate('/fuel/reports')}>
          <span className="action-icon">📄</span>
          <span>Generate Report</span>
        </button>
      </div>

      {/* Recent Dispensed Requests */}
      <div className="fuel-table-container">
        <div className="fuel-table-header">
          <h3>Recent Fuel Dispensed</h3>
        </div>
        <div className="fuel-table-wrapper">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>Driver</th>
                <th>Vehicle</th>
                <th>Fuel Type</th>
                <th>Dispensed</th>
                <th>Destination</th>
                <th>Date</th>
                <th>Dispensed By</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No dispensed fuel yet</td></tr>
              ) : recentRequests.map(r => (
                <tr key={r._id}>
                  <td>{r.driverName}</td>
                  <td>{r.vehiclePlate}{r.vehicleModel ? ` — ${r.vehicleModel}` : ''}</td>
                  <td><span className={`fuel-type-badge ${r.fuelType?.toLowerCase()}`}>{r.fuelType}</span></td>
                  <td className="liters">{r.dispensedLiters}L</td>
                  <td>{r.destination}</td>
                  <td>{r.dispensedAt ? new Date(r.dispensedAt).toLocaleString() : '—'}</td>
                  <td>{r.dispensedBy || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FuelDashboard;