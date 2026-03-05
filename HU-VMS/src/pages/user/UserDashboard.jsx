import "./user.css";

export default function UserDashboard() {
  return (
    <div className="dashboard">
      <h2>User Dashboard</h2>
      <div className="cards">
        <div className="card">Submit Vehicle Request</div>
        <div className="card">View Request Status</div>
        <div className="card">Submit Complaint</div>
        <div className="card">Notifications</div>
      </div>
    </div>
  );
}