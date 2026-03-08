import { useState, useEffect } from 'react';
import './fuelstation.css';

const FuelDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalFuelDispensedToday: 0,
    dieselAvailable: 5000,
    petrolAvailable: 3500,
    totalTransactionsToday: 0
  });

  const [recentTransactions, setRecentTransactions] = useState([
    {
      id: 'TXN-001',
      vehicleId: 'VH-001',
      driverName: 'John Smith',
      fuelType: 'Diesel',
      liters: 45.5,
      date: '2026-03-08',
      status: 'Completed'
    },
    {
      id: 'TXN-002',
      vehicleId: 'VH-003',
      driverName: 'Sarah Johnson',
      fuelType: 'Petrol',
      liters: 32.0,
      date: '2026-03-08',
      status: 'Completed'
    },
    {
      id: 'TXN-003',
      vehicleId: 'VH-007',
      driverName: 'Mike Wilson',
      fuelType: 'Diesel',
      liters: 55.2,
      date: '2026-03-08',
      status: 'Completed'
    },
    {
      id: 'TXN-004',
      vehicleId: 'VH-012',
      driverName: 'Lisa Brown',
      fuelType: 'Petrol',
      liters: 28.8,
      date: '2026-03-08',
      status: 'Pending'
    },
    {
      id: 'TXN-005',
      vehicleId: 'VH-015',
      driverName: 'David Lee',
      fuelType: 'Diesel',
      liters: 42.3,
      date: '2026-03-08',
      status: 'Completed'
    }
  ]);

  useEffect(() => {
    // Calculate dashboard statistics from transactions
    const todayTransactions = recentTransactions.filter(
      transaction => transaction.date === '2026-03-08'
    );
    
    const totalFuelToday = todayTransactions.reduce(
      (sum, transaction) => sum + transaction.liters, 0
    );

    setDashboardData(prev => ({
      ...prev,
      totalFuelDispensedToday: totalFuelToday,
      totalTransactionsToday: todayTransactions.length
    }));
  }, [recentTransactions]);

  const getStatusBadge = (status) => {
    const statusClass = status.toLowerCase();
    return <span className={`status-badge ${statusClass}`}>{status}</span>;
  };

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
          <div className="fuel-stat-value">{dashboardData.totalFuelDispensedToday.toFixed(1)}L</div>
          <div className="fuel-stat-label">Total Fuel Dispensed Today</div>
        </div>

        <div className="fuel-stat-card green">
          <div className="fuel-stat-icon">🟢</div>
          <div className="fuel-stat-value">{dashboardData.dieselAvailable.toLocaleString()}L</div>
          <div className="fuel-stat-label">Diesel Available</div>
        </div>

        <div className="fuel-stat-card orange">
          <div className="fuel-stat-icon">🟠</div>
          <div className="fuel-stat-value">{dashboardData.petrolAvailable.toLocaleString()}L</div>
          <div className="fuel-stat-label">Petrol Available</div>
        </div>

        <div className="fuel-stat-card purple">
          <div className="fuel-stat-icon">📊</div>
          <div className="fuel-stat-value">{dashboardData.totalTransactionsToday}</div>
          <div className="fuel-stat-label">Total Transactions Today</div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="fuel-table-container">
        <div className="fuel-table-header">
          <h3>Recent Fuel Transactions</h3>
        </div>
        
        <div className="fuel-table-wrapper">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>Vehicle ID</th>
                <th>Driver Name</th>
                <th>Fuel Type</th>
                <th>Liters</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="vehicle-id">{transaction.vehicleId}</td>
                  <td>{transaction.driverName}</td>
                  <td>
                    <span className={`fuel-type-badge ${transaction.fuelType.toLowerCase()}`}>
                      {transaction.fuelType}
                    </span>
                  </td>
                  <td className="liters">{transaction.liters}L</td>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td>{getStatusBadge(transaction.status)}</td>
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