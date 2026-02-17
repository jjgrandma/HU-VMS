import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Search } from "lucide-react";
import L from "leaflet";
import "./tracking.css";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function Tracking() {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const data = [
      {
        id: "BUS-12",
        driver: "John Doe",
        route: "Main Campus → Campus B",
        lat: 9.03,
        lng: 38.74,
        status: "moving",
      },
      {
        id: "VAN-04",
        driver: "Michael",
        route: "Store → Warehouse",
        lat: 9.05,
        lng: 38.70,
        status: "idle",
      },
      {
        id: "BUS-09",
        driver: "Alex",
        route: "Garage → Campus A",
        lat: 9.01,
        lng: 38.72,
        status: "offline",
      },
    ];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVehicles(data);
  }, []);

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.id.toLowerCase().includes(search.toLowerCase()) ||
      v.driver.toLowerCase().includes(search.toLowerCase()) ||
      v.route.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="tracking-page">

      {/* HEADER + SEARCH */}
      <header className="tracking-header">
        <h1>Vehicle Tracking</h1>
        <p>Monitor vehicles in real time</p>

        <div className="tracking-search-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by Vehicle ID, Driver, or Route..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="tracking-search"
          />
        </div>
      </header>

      <div className="tracking-container">

        {/* VEHICLE CARDS */}
        <div className="tracking-cards">
          {filteredVehicles.map((v) => (
            <div className="tracking-card" key={v.id}>
              <div>
                <strong>Vehicle: {v.id}</strong>
                <span>Driver: {v.driver}</span>
                <span>Route: {v.route}</span>
              </div>
              <span className={`track-status ${v.status}`}>
                ● {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
              </span>
            </div>
          ))}

          {filteredVehicles.length === 0 && (
            <p className="no-results">No vehicles found.</p>
          )}
        </div>

        {/* MAP */}
        <div className="tracking-map">
          <MapContainer
            center={[9.03, 38.74]}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filteredVehicles.map((v) => (
              <Marker key={v.id} position={[v.lat, v.lng]}>
                <Popup>
                  <strong>{v.id}</strong>
                  <br />
                  Driver: {v.driver}
                  <br />
                  Status: {v.status}
                  <br />
                  Route: {v.route}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

      </div>
    </div>
  );
}