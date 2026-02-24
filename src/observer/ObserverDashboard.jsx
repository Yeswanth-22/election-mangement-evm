import { useContext, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const initialForm = {
  id: null,
  title: "",
  location: "",
  severity: "medium",
  status: "open",
  details: "",
};

function ObserverDashboard() {
  const {
    currentUser,
    incidents,
    fraudReports,
    analystReports,
    createIncident,
    updateIncident,
    deleteIncident,
  } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState("incidents");
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  const myIncidents = useMemo(
    () => incidents.filter((incident) => incident.createdById === currentUser?.id),
    [incidents, currentUser?.id]
  );

  const sections = [
    { key: "incidents", label: "My Incidents", count: myIncidents.length },
    { key: "report", label: form.id ? "Edit Incident" : "New Incident" },
    { key: "fraud", label: "Fraud Feed", count: fraudReports.length },
    { key: "analysis", label: "Analyst Feed", count: analystReports.length },
  ];

  const resetForm = () => setForm(initialForm);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (form.id) {
      const result = updateIncident(form.id, {
        title: form.title,
        location: form.location,
        severity: form.severity,
        status: form.status,
        details: form.details,
      });
      setMessage(result.message);
      resetForm();
      setActiveSection("incidents");
      return;
    }

    const result = createIncident(form);
    setMessage(result.message);
    resetForm();
    setActiveSection("incidents");
  };

  return (
    <div className="dashboard-page">
      <Navbar title="Observer Dashboard" />

      <div className="dashboard-layout">
        <Sidebar
          title="Observer Menu"
          items={sections}
          activeItem={activeSection}
          onChange={setActiveSection}
        />

        <main className="dashboard-main">
          {activeSection === "incidents" ? (
            <section className="panel">
              <h3>Field incidents</h3>
              <p>Create and maintain incident logs from polling stations.</p>
              {message ? <p className="muted">{message}</p> : null}

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Location</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myIncidents.length ? (
                      myIncidents.map((incident) => (
                        <tr key={incident.id}>
                          <td>{incident.title}</td>
                          <td>{incident.location}</td>
                          <td>
                            <span className="pill">{incident.severity}</span>
                          </td>
                          <td>{incident.status}</td>
                          <td>
                            <div className="table-actions">
                              <button
                                className="btn btn-outline"
                                type="button"
                                onClick={() => {
                                  setForm({
                                    id: incident.id,
                                    title: incident.title,
                                    location: incident.location,
                                    severity: incident.severity,
                                    status: incident.status,
                                    details: incident.details,
                                  });
                                  setActiveSection("report");
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-danger"
                                type="button"
                                onClick={() => {
                                  const result = deleteIncident(incident.id);
                                  setMessage(result.message);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="muted">
                          You have not created any incidents yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeSection === "report" ? (
            <section className="panel">
              <h3>{form.id ? "Update incident" : "Record new incident"}</h3>
              <p>Capture factual events and keep case status current.</p>

              <form className="compact-form" onSubmit={handleSubmit}>
                <input
                  placeholder="Incident title"
                  required
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                />
                <input
                  placeholder="Location"
                  required
                  value={form.location}
                  onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                />
                <select
                  value={form.severity}
                  onChange={(e) => setForm((prev) => ({ ...prev, severity: e.target.value }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                </select>
                <textarea
                  placeholder="Incident details"
                  required
                  rows={6}
                  value={form.details}
                  onChange={(e) => setForm((prev) => ({ ...prev, details: e.target.value }))}
                />
                <div className="form-row">
                  <button className="btn btn-primary" type="submit">
                    {form.id ? "Save Changes" : "Add Incident"}
                  </button>
                  {form.id ? (
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() => {
                        resetForm();
                        setActiveSection("incidents");
                      }}
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>
            </section>
          ) : null}

          {activeSection === "fraud" ? (
            <section className="panel">
              <h3>Fraud report feed</h3>
              <p>Monitor citizen fraud reports alongside field observations.</p>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Reporter</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fraudReports.length ? (
                      fraudReports.map((report) => (
                        <tr key={report.id}>
                          <td>{report.title}</td>
                          <td>{report.category}</td>
                          <td>{report.location}</td>
                          <td>{report.status}</td>
                          <td>{report.createdBy}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="muted">
                          No fraud reports are available yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeSection === "analysis" ? (
            <section className="panel">
              <h3>Analyst intelligence feed</h3>
              <p>Track current analytical findings to guide on-ground operations.</p>

              {analystReports.length ? (
                analystReports.map((report) => (
                  <article className="list-item" key={report.id}>
                    <strong>{report.title}</strong>
                    <p>
                      Status: {report.status} • Analyst: {report.createdBy}
                    </p>
                    <p>{report.summary}</p>
                    <p>
                      <strong>Recommendation:</strong> {report.recommendation}
                    </p>
                  </article>
                ))
              ) : (
                <p className="muted">No analyst reports are available yet.</p>
              )}
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default ObserverDashboard;