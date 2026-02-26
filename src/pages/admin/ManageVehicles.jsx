import { useState } from "react";
import "./manageVehicles.css";

export default function ManageVehicles() {
  const [vehicles, setVehicles] = useState([
    {
      name: "Suzuki-80937",
      type: "N/A",
      department: "Research and Development",
      date: "1980-09-30",
      ownership: "Third Party Financed",
      vendor: "Tariq Traders",
    },
  ]);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    department: "",
    date: "",
    ownership: "",
    vendor: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setVehicles([...vehicles, formData]);
    setFormData({
      name: "",
      type: "",
      department: "",
      date: "",
      ownership: "",
      vendor: "",
    });
    setShowForm(false);
  };

  const filtered = vehicles.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="vehicle-page">
      {/* Header */}
      <div className="vehicle-header">
        <h2>Vehicle list</h2>
        <button className="btn add" onClick={() => setShowForm(true)}>
          + Add vehicle
        </button>
      </div>

      {/* Search */}
      <div className="table-controls right">
        Search:
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <table className="vehicle-table">
        <thead>
          <tr>
            <th>SI</th>
            <th>Name</th>
            <th>Vehicle type</th>
            <th>Department</th>
            <th>Registration date</th>
            <th>Ownership</th>
            <th>Vendor</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((v, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{v.name}</td>
              <td>{v.type}</td>
              <td>{v.department}</td>
              <td>{v.date}</td>
              <td>{v.ownership}</td>
              <td>{v.vendor}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Vehicle Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Vehicle</h3>

            <form onSubmit={handleSubmit}>
              <input
                name="name"
                placeholder="Vehicle Name"
                onChange={handleChange}
                required
              />

              <input
                name="type"
                placeholder="Vehicle Type"
                onChange={handleChange}
                required
              />

              <input
                name="department"
                placeholder="Department"
                onChange={handleChange}
                required
              />

              <input
                type="date"
                name="date"
                onChange={handleChange}
                required
              />

              <input
                name="ownership"
                placeholder="Ownership"
                onChange={handleChange}
                required
              />

              <input
                name="vendor"
                placeholder="Vendor"
                onChange={handleChange}
                required
              />

              <div className="modal-actions">
                <button type="submit" className="btn add">
                  Save
                </button>
             
                <button
                  type="button"
                  className="btn cancel"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}