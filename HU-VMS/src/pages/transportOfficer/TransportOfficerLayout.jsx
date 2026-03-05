import { NavLink, Outlet } from "react-router-dom";
import "./transportOfficerLayout.css";

export default function TransportOfficerLayout() {
  return (
    <div className="to-layout">
      
      {/* SIDEBAR */}
      <aside className="to-sidebar">
        <h2>Transport Officer</h2>

        <nav>
          <NavLink to="dashboard">Dashboard</NavLink>
          <NavLink to="requests">Requests Pool</NavLink>
          <NavLink to="tracking">Vehicle Tracking</NavLink>
          <NavLink to="complaints">Complaints</NavLink>
          <NavLink to="reports">Reports</NavLink>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="to-content">
        <Outlet />
      </main>

    </div>
  );
}