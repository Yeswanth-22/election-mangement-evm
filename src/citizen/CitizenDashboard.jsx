import { useContext, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const initialForm = {
  id: null,
  title: "",
  category: "Bribery",
  location: "",
  description: "",
};

function CitizenDashboard() {
  const {
    currentUser,
    incidents,
    fraudReports,
    analystReports,
    electionResults,
    createFraudReport,
    updateFraudReport,
    deleteFraudReport,
  } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState("my-reports");
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  const myReports = useMemo(
    () => fraudReports.filter((report) => report.createdById === currentUser?.id),
    [fraudReports, currentUser?.id]
  );

  const sections = [
    { key: "my-reports", label: "My Reports", count: myReports.length },
    { key: "submit", label: form.id ? "Edit Report" : "Submit Report" },
    { key: "incidents", label: "Incident Feed", count: incidents.length },
    {
      key: "analysis",
      label: "Analyst Updates",
      count: analystReports.length,
    },
    {
      key: "results",
      label: "Election Results",
      count: electionResults.length,
    },
  ];

  const resetForm = () => setForm(initialForm);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (form.id) {
      const result = updateFraudReport(form.id, {
        title: form.title,
        category: form.category,
        location: form.location,
        description: form.description,
      });
      setMessage(result.message);
      resetForm();
      setActiveSection("my-reports");
      return;
    }

    const result = createFraudReport(form);
    setMessage(result.message);
    resetForm();
    setActiveSection("my-reports");
  };

  return (
    <div className="dashboard-page">
      <Navbar title="Citizen Dashboard" />

      <div className="dashboard-layout">
        <Sidebar
          title="Citizen Menu"
          items={sections}
          activeItem={activeSection}
          onChange={setActiveSection}
        />

        <main className="dashboard-main">
          {activeSection === "my-reports" ? (
            <section className="panel">
              <h3>My submitted fraud reports</h3>
              <p>Track status updates and maintain your report records.</p>
              {message ? <p className="muted">{message}</p> : null}

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myReports.length ? (
                      myReports.map((report) => (
                        <tr key={report.id}>
                          <td>{report.title}</td>
                          <td>{report.category}</td>
                          <td>{report.location}</td>
                          <td>
                            <span className="pill">{report.status}</span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button
                                className="btn btn-outline"
                                type="button"
                                onClick={() => {
                                  setForm({
                                    id: report.id,
                                    title: report.title,
                                    category: report.category,
                                    location: report.location,
                                    description: report.description,
                                  });
                                  setActiveSection("submit");
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-danger"
                                type="button"
                                onClick={() => {
                                  const result = deleteFraudReport(report.id);
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
                          You have not submitted any fraud reports yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeSection === "submit" ? (
            <section className="panel">
              <h3>{form.id ? "Update fraud report" : "Submit fraud report"}</h3>
              <p>Provide clear and accurate details for verification workflow.</p>

              <form className="compact-form" onSubmit={handleSubmit}>
                <input
                  placeholder="Report title"
                  required
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                />
                <select
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                >
                  <option value="Bribery">Bribery</option>
                  <option value="Influence">Influence</option>
                  <option value="Impersonation">Impersonation</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  placeholder="Location"
                  required
                  value={form.location}
                  onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                />
                <textarea
                  placeholder="Description"
                  required
                  rows={5}
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
                <div className="form-row">
                  <button className="btn btn-primary" type="submit">
                    {form.id ? "Save Changes" : "Submit Report"}
                  </button>
                  {form.id ? (
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() => {
                        resetForm();
                        setActiveSection("my-reports");
                      }}
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>
            </section>
          ) : null}

          {activeSection === "incidents" ? (
            <section className="panel">
              <h3>Election incident feed</h3>
              <p>View observer incident updates from all monitored locations.</p>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Location</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Observer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.length ? (
                      incidents.map((incident) => (
                        <tr key={incident.id}>
                          <td>{incident.title}</td>
                          <td>{incident.location}</td>
                          <td>
                            <span className="pill">{incident.severity}</span>
                          </td>
                          <td>{incident.status}</td>
                          <td>{incident.createdBy}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="muted">
                          No incidents are available yet.
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
              <h3>Analyst updates</h3>
              <p>Review the latest analytical summaries and recommendations.</p>

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
                <p className="muted">No analyst reports have been published yet.</p>
              )}
            </section>
          ) : null}

          {activeSection === "results" ? (
            <section className="panel">
              <h3>Election results by booth</h3>
              <p>View current booth-wise election results and winner details.</p>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Booth Name</th>
                      <th>Constituency</th>
                      <th>Winner</th>
                      <th>Party</th>
                      <th>Votes</th>
                      <th>Total Votes</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {electionResults.length ? (
                      electionResults.map((result) => (
                        <tr key={result.id}>
                          <td>{result.boothName}</td>
                          <td>{result.constituency}</td>
                          <td>{result.winner}</td>
                          <td>{result.party}</td>
                          <td>{result.votes}</td>
                          <td>{result.totalVotes}</td>
                          <td>
                            <span className="pill">{result.status}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="muted">
                          Election results are not available yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default CitizenDashboard;