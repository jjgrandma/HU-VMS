import { useState } from 'react';
import { 
  ClipboardList, 
  MapPin, 
  Car, 
  Users, 
  AlertTriangle,
  FileCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import './TransportDashboard.css';

const TransportDashboard = () => {
  const [dashboardData] = useState({
    pendingRequests: { value: 12, trend: 8, isUp: true },
    activeTrips: { value: 7, trend: 15, isUp: true },
    availableVehicles: { value: 18, trend: 2, isUp: false },
    driversOnDuty: { value: 9, trend: 0, isUp: true },
    complaints: { value: 3, trend: 50, isUp: false } // decreasing complaints is good
  });

  const summaryCards = [
    {
      title: 'Pending Requests',
      value: dashboardData.pendingRequests.value,
      trend: `${dashboardData.pendingRequests.trend}%`,
      isUp: dashboardData.pendingRequests.isUp,
      icon: <ClipboardList size={28} />,
      color: 'var(--status-pending)'
    },
    {
      title: 'Active Trips',
      value: dashboardData.activeTrips.value,
      trend: `${dashboardData.activeTrips.trend}%`,
      isUp: dashboardData.activeTrips.isUp,
      icon: <MapPin size={28} />,
      color: 'var(--status-in-trip)'
    },
    {
      title: 'Available Vehicles',
      value: dashboardData.availableVehicles.value,
      trend: `${dashboardData.availableVehicles.trend}%`,
      isUp: dashboardData.availableVehicles.isUp,
      icon: <Car size={28} />,
      color: 'var(--status-available)'
    },
    {
      title: 'Drivers On Duty',
      value: dashboardData.driversOnDuty.value,
      trend: `${dashboardData.driversOnDuty.trend}%`,
      isUp: dashboardData.driversOnDuty.isUp,
      icon: <Users size={28} />,
      color: 'var(--status-driver)'
    },
    {
      title: 'Complaints',
      value: dashboardData.complaints.value,
      trend: `${dashboardData.complaints.trend}%`,
      isUp: dashboardData.complaints.isUp,
      icon: <AlertTriangle size={28} />,
      color: 'var(--status-complaint)'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'request',
      title: 'New trip request from Engineering Dept',
      time: '2 min ago',
      icon: <FileCheck size={18} color="var(--status-pending)" />
    },
    {
      id: 2,
      type: 'completion',
      title: 'Trip HU-001 completed successfully',
      time: '15 min ago',
      icon: <CheckCircle size={18} color="var(--status-available)" />
    },
    {
      id: 3,
      type: 'assignment',
      title: 'Vehicle HU-VH-003 assigned to driver',
      time: '1 hour ago',
      icon: <Car size={18} color="var(--status-in-trip)" />
    },
    {
      id: 4,
      type: 'complaint',
      title: 'Complaint recorded for HU-VH-012',
      time: '2 hours ago',
      icon: <AlertTriangle size={18} color="var(--status-complaint)" />
    }
  ];

  return (
    <div className="transport-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Transport Officer operational summary and metrics</p>
      </div>

      <div className="summary-cards">
        {summaryCards.map((card, index) => (
          <div key={index} className="summary-card">
            <div className="card-header">
              <div className="card-icon-wrapper" style={{ color: card.color, backgroundColor: `${card.color}15` }}>
                {card.icon}
              </div>
              <div className={`trend-indicator ${card.isUp ? 'positive' : 'negative'}`}>
                {card.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{card.trend}</span>
              </div>
            </div>
            <div className="card-content">
              <h3>{card.value}</h3>
              <p>{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-panel timeline-panel">
          <div className="panel-header">
            <h3>Recent Activity Timeline</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="activity-timeline">
            {recentActivity.map((activity, index) => (
              <div key={activity.id} className="timeline-item">
                <div className="timeline-marker">
                  <div className="timeline-icon-bg">{activity.icon}</div>
                  {index < recentActivity.length - 1 && <div className="timeline-connector"></div>}
                </div>
                <div className="timeline-content">
                  <p className="timeline-title">{activity.title}</p>
                  <div className="timeline-meta">
                    <Clock size={12} />
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-panel actions-panel">
          <div className="panel-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="quick-actions-grid">
            <button className="action-card primary">
              <div className="action-icon">
                <ClipboardList size={24} />
              </div>
              <div className="action-text">
                <span className="title">Review Requests</span>
                <span className="subtitle">12 pending approvals</span>
              </div>
              <ArrowRight size={20} className="action-arrow" />
            </button>
            
            <button className="action-card secondary">
              <div className="action-icon">
                <Car size={24} />
              </div>
              <div className="action-text">
                <span className="title">Assign Vehicle</span>
                <span className="subtitle">Allocate fleet resources</span>
              </div>
              <ArrowRight size={20} className="action-arrow" />
            </button>
            
            <button className="action-card tertiary">
              <div className="action-icon">
                <MapPin size={24} />
              </div>
              <div className="action-text">
                <span className="title">Track Fleet</span>
                <span className="subtitle">View live GPS map</span>
              </div>
              <ArrowRight size={20} className="action-arrow" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportDashboard;