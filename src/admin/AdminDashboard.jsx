import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ManageUser from "./ManageUser";
import FraudReports from "./FraudReports";

const initialResultForm = {
  id: null,
  boothName: "",
  constituency: "",
  winner: "",
  party: "",
  votes: "",
  totalVotes: "",
  status: "in-progress",
};

function AdminDashboard() {
  const {
    currentUser,
    users,
    incidents,
    fraudReports,
    analystReports,
    electionResults,
    dashboardStats,
    createUser,
    updateUser,
    deleteUser,
    updateIncident,
    deleteIncident,
    updateFraudReport,
    deleteFraudReport,
    updateAnalystReport,
    deleteAnalystReport,
    createElectionResult,
    updateElectionResult,
    deleteElectionResult,
  } = useContext(AuthContext);

  const [activeSection, setActiveSection] = useState("overview");
  const [message, setMessage] = useState("");
  const [resultForm, setResultForm] = useState(initialResultForm);

  const sections = useMemo(
    () => [
      { key: "overview", label: "Overview" },
      { key: "users", label: "Manage Users", count: users.length },
      { key: "incidents", label: "Incidents", count: incidents.length },
      { key: "fraud", label: "Fraud Reports", count: fraudReports.length },
      {
        key: "analysis",
        label: "Analyst Reports",
        count: analystReports.length,
      },
      {
        key: "results",
        label: "Election Results",
        count: electionResults.length,
      },
    ],
    [
      users.length,
      incidents.length,
      fraudReports.length,
      analystReports.length,
      electionResults.length,
    ]
  );

  const resetResultForm = () => {
    setResultForm(initialResultForm);
  };

  const handleResultSubmit = (event) => {
    event.preventDefault();

    if (resultForm.id) {
      const result = updateElectionResult(resultForm.id, {
        boothName: resultForm.boothName,
        constituency: resultForm.constituency,
        winner: resultForm.winner,
        party: resultForm.party,
        votes: resultForm.votes,
        totalVotes: resultForm.totalVotes,
        status: resultForm.status,
      });
      setMessage(result.message);
      if (result.success) {
        resetResultForm();
      }
      return;
    }

    const result = createElectionResult({
      boothName: resultForm.boothName,
      constituency: resultForm.constituency,
      winner: resultForm.winner,
      party: resultForm.party,
      votes: resultForm.votes,
      totalVotes: resultForm.totalVotes,
      status: resultForm.status,
    });
    setMessage(result.message);
    if (result.success) {
      resetResultForm();
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar title="Admin Control Center" />

      <div className="dashboard-layout">
        <Sidebar
          title="Admin Menu"
          items={sections}
          activeItem={activeSection}
          onChange={setActiveSection}
        />

        <main className="dashboard-main">
          {activeSection === "overview" ? (
            <>
              <section className="panel">
                <h3>Welcome, {currentUser?.name}</h3>
                <p>
                  Monitor election system activity, manage all user roles, and resolve
                  incoming fraud alerts.
                </p>
                <div className="stats-grid">
                  <article className="stat-card">
                    <span>Total Users</span>
                    <strong>{dashboardStats.users}</strong>
                  </article>
                  <article className="stat-card">
                    <span>Incidents</span>
                    <strong>{dashboardStats.incidents}</strong>
                  </article>
                  <article className="stat-card">
                    <span>Fraud Reports</span>
                    <strong>{dashboardStats.fraudReports}</strong>
                  </article>
                  <article className="stat-card">
                    <span>Analyst Reports</span>
                    <strong>{dashboardStats.analystReports}</strong>
                  </article>
                  <article className="stat-card">
                    <span>Election Results</span>
                    <strong>{dashboardStats.electionResults}</strong>
                  </article>
                </div>
              </section>

              <section className="grid two-cols">
                <article className="panel">
                  <h3>Recent incidents</h3>
                  {incidents.length ? (
                    incidents.slice(0, 5).map((incident) => (
                      <div className="list-item" key={incident.id}>
                        <strong>{incident.title}</strong>
                        <p>
                          {incident.location} • {incident.status}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="muted">No incidents have been recorded yet.</p>
                  )}
                </article>

                <article className="panel">
                  <h3>Recent analyst reports</h3>
                  {analystReports.length ? (
                    analystReports.slice(0, 5).map((report) => (
                      <div className="list-item" key={report.id}>
                        <strong>{report.title}</strong>
                        <p>{report.status}</p>
                      </div>
                    ))
                  ) : (
                    <p className="muted">No analyst reports are available yet.</p>
                  )}
                </article>
              </section>
            </>
          ) : null}

          {activeSection === "users" ? (
            <ManageUser
              users={users}
              currentUserId={currentUser?.id}
              onCreate={createUser}
              onUpdate={updateUser}
              onDelete={deleteUser}
            />
          ) : null}

          {activeSection === "incidents" ? (
            <section className="panel">
              <h3>Incident operations</h3>
              <p>Review observer incidents and keep operational status up to date.</p>
              {message ? <p className="muted">{message}</p> : null}

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Location</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Observer</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map((incident) => (
                      <tr key={incident.id}>
                        <td>{incident.title}</td>
                        <td>{incident.location}</td>
                        <td>
                          <span className="pill">{incident.severity}</span>
                        </td>
                        <td>
                          <select
                            value={incident.status}
                            onChange={(event) => {
                              const result = updateIncident(incident.id, {
                                status: event.target.value,
                              });
                              setMessage(result.message);
                            }}
                          >
                            <option value="open">Open</option>
                            <option value="investigating">Investigating</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>
                        <td>{incident.createdBy}</td>
                        <td>
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeSection === "fraud" ? (
            <FraudReports
              reports={fraudReports}
              onUpdate={updateFraudReport}
              onDelete={deleteFraudReport}
            />
          ) : null}

          {activeSection === "analysis" ? (
            <section className="panel">
              <h3>Analyst reports desk</h3>
              <p>Track analyst outputs and control report publication status.</p>
              {message ? <p className="muted">{message}</p> : null}

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Analyst</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analystReports.map((report) => (
                      <tr key={report.id}>
                        <td>{report.title}</td>
                        <td>
                          <select
                            value={report.status}
                            onChange={(event) => {
                              const result = updateAnalystReport(report.id, {
                                status: event.target.value,
                              });
                              setMessage(result.message);
                            }}
                          >
                            <option value="draft">Draft</option>
                            <option value="review">Review</option>
                            <option value="published">Published</option>
                          </select>
                        </td>
                        <td>{report.createdBy}</td>
                        <td>{new Date(report.createdAt).toLocaleString()}</td>
                        <td>
                          <button
                            className="btn btn-danger"
                            type="button"
                            onClick={() => {
                              const result = deleteAnalystReport(report.id);
                              setMessage(result.message);
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeSection === "results" ? (
            <section className="panel">
              <h3>Election results desk</h3>
              <p>Create, update, and remove booth-wise election result records.</p>
              {message ? <p className="muted">{message}</p> : null}

              <form className="compact-form" onSubmit={handleResultSubmit}>
                <input
                  placeholder="Booth name"
                  required
                  value={resultForm.boothName}
                  onChange={(event) =>
                    setResultForm((prev) => ({ ...prev, boothName: event.target.value }))
                  }
                />
                <input
                  placeholder="Constituency"
                  required
                  value={resultForm.constituency}
                  onChange={(event) =>
                    setResultForm((prev) => ({ ...prev, constituency: event.target.value }))
                  }
                />
                <input
                  placeholder="Winner name"
                  required
                  value={resultForm.winner}
                  onChange={(event) =>
                    setResultForm((prev) => ({ ...prev, winner: event.target.value }))
                  }
                />
                <input
                  placeholder="Party"
                  required
                  value={resultForm.party}
                  onChange={(event) =>
                    setResultForm((prev) => ({ ...prev, party: event.target.value }))
                  }
                />
                <div className="form-row">
                  <input
                    placeholder="Votes"
                    type="number"
                    min={0}
                    required
                    value={resultForm.votes}
                    onChange={(event) =>
                      setResultForm((prev) => ({ ...prev, votes: event.target.value }))
                    }
                  />
                  <input
                    placeholder="Total votes"
                    type="number"
                    min={0}
                    required
                    value={resultForm.totalVotes}
                    onChange={(event) =>
                      setResultForm((prev) => ({ ...prev, totalVotes: event.target.value }))
                    }
                  />
                  <select
                    value={resultForm.status}
                    onChange={(event) =>
                      setResultForm((prev) => ({ ...prev, status: event.target.value }))
                    }
                  >
                    <option value="in-progress">In Progress</option>
                    <option value="final">Final</option>
                  </select>
                </div>
                <div className="form-row">
                  <button className="btn btn-primary" type="submit">
                    {resultForm.id ? "Update Result" : "Add Result"}
                  </button>
                  {resultForm.id ? (
                    <button className="btn btn-outline" type="button" onClick={resetResultForm}>
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>

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
                      <th>Actions</th>
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
                          <td>
                            <div className="table-actions">
                              <button
                                className="btn btn-outline"
                                type="button"
                                onClick={() => {
                                  setResultForm({
                                    id: result.id,
                                    boothName: result.boothName,
                                    constituency: result.constituency,
                                    winner: result.winner,
                                    party: result.party,
                                    votes: String(result.votes),
                                    totalVotes: String(result.totalVotes),
                                    status: result.status,
                                  });
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-danger"
                                type="button"
                                onClick={() => {
                                  const deleteResult = deleteElectionResult(result.id);
                                  setMessage(deleteResult.message);
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
                        <td colSpan={8} className="muted">
                          No election results are available yet.
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

export default AdminDashboard;