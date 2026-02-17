import "./requests.css";

export default function Requests() {
  return (
    <div className="requests-page">

      {/* HEADER */}
      <header className="requests-header">
        <h1>Requests Pool</h1>
        <p>View all vehicle transport requests</p>
      </header>

      {/* REQUEST LIST */}
      <section className="requests-list">

        <div className="request-card">
          <div className="request-info">
            <strong>Staff Transport</strong>
            <span>Requester: HR Department</span>
            <span>Destination: Campus B</span>
          </div>
          <span className="status pending">Pending</span>
        </div>

        <div className="request-card">
          <div className="request-info">
            <strong>Goods Delivery</strong>
            <span>Requester: Logistics</span>
            <span>Destination: Central Store</span>
          </div>
          <span className="status approved">Approved</span>
        </div>

        <div className="request-card">
          <div className="request-info">
            <strong>Maintenance Trip</strong>
            <span>Requester: Transport Unit</span>
            <span>Destination: Garage</span>
          </div>
          <span className="status rejected">Rejected</span>
        </div>

      </section>
    </div>
  );
}