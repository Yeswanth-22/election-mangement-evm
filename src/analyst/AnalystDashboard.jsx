import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const initialForm = {
  id: null,
  title: "",
  summary: "",
  recommendation: "",
  status: "draft",
};

const formatNumber = (value) => new Intl.NumberFormat("en-IN").format(value);

function AnalystDashboard() {
  const {
    currentUser,
    incidents,
    fraudReports,
    analystReports,
    electionResults,
    createAnalystReport,
    updateAnalystReport,
    deleteAnalystReport,
  } = useContext(AuthContext);

  const [activeSection, setActiveSection] = useState("overview");
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [liveNow, setLiveNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLiveNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const myReports = useMemo(
    () => analystReports.filter((report) => report.createdById === currentUser?.id),
    [analystReports, currentUser?.id]
  );

  const riskCases = useMemo(
    () => incidents.filter((item) => item.severity === "high").length,
    [incidents]
  );

  const voteSummary = useMemo(() => {
    const totalVotes = electionResults.reduce(
      (sum, item) => sum + Number(item.totalVotes || 0),
      0
    );
    const countedVotes = electionResults.reduce(
      (sum, item) => sum + Number(item.votes || 0),
      0
    );
    const countingProgress = totalVotes ? (countedVotes / totalVotes) * 100 : 0;
    const finalizedBooths = electionResults.filter(
      (item) => item.status === "final"
    ).length;
    const activeBooths = Math.max(electionResults.length - finalizedBooths, 0);
    const leadingBooth = [...electionResults].sort(
      (a, b) => Number(b.votes || 0) - Number(a.votes || 0)
    )[0];

    return {
      totalVotes,
      countedVotes,
      countingProgress,
      finalizedBooths,
      activeBooths,
      leadingBooth,
    };
  }, [electionResults]);

  const constituencyBars = useMemo(() => {
    const grouped = electionResults.reduce((acc, item) => {
      const key = item.constituency || "Unknown";
      const current = acc[key] || { label: key, votes: 0, totalVotes: 0, booths: 0 };

      current.votes += Number(item.votes || 0);
      current.totalVotes += Number(item.totalVotes || 0);
      current.booths += 1;

      acc[key] = current;
      return acc;
    }, {});

    return Object.values(grouped)
      .map((item) => ({
        ...item,
        percentage: item.totalVotes ? (item.votes / item.totalVotes) * 100 : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 8);
  }, [electionResults]);

  const boothBars = useMemo(
    () =>
      [...electionResults]
        .map((item) => ({
          ...item,
          percentage: item.totalVotes
            ? (Number(item.votes || 0) / Number(item.totalVotes || 0)) * 100
            : 0,
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 8),
    [electionResults]
  );

  const sections = [
    { key: "overview", label: "Overview" },
    { key: "reports", label: "My Reports", count: myReports.length },
    { key: "create", label: form.id ? "Edit Report" : "Create Report" },
    { key: "incidents", label: "Incident Data", count: incidents.length },
    { key: "fraud", label: "Fraud Data", count: fraudReports.length },
  ];

  const resetForm = () => setForm(initialForm);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (form.id) {
      const result = updateAnalystReport(form.id, {
        title: form.title,
        summary: form.summary,
        recommendation: form.recommendation,
        status: form.status,
      });
      setMessage(result.message);
      resetForm();
      setActiveSection("reports");
      return;
    }

    const result = createAnalystReport(form);
    setMessage(result.message);
    resetForm();
    setActiveSection("reports");
  };

  return (
    <div className="dashboard-page">
      <Navbar title="Analyst Dashboard" />

      <div className="dashboard-layout">
        <Sidebar
          title="Analyst Menu"
          items={sections}
          activeItem={activeSection}
          onChange={setActiveSection}
        />

        <main className="dashboard-main">
          {activeSection === "overview" ? (
            <>
              <section className="panel analyst-overview-panel">
                <div className="analyst-overview-head">
                  <div>
                    <h3>Election Results Monitoring Center</h3>
                    <p>
                      Live intelligence board for constituency-level counting progress,
                      voting trends, and operational risk tracking.
                    </p>
                  </div>
                  <div className="analyst-live-chip">
                    <span>Live Update</span>
                    <strong>{liveNow.toLocaleTimeString()}</strong>
                  </div>
                </div>

                <div className="analyst-kpi-grid">
                  <article className="analyst-kpi-card">
                    <span>Booths Monitored</span>
                    <strong>{electionResults.length}</strong>
                  </article>
                  <article className="analyst-kpi-card">
                    <span>Votes Counted</span>
                    <strong>{formatNumber(voteSummary.countedVotes)}</strong>
                  </article>
                  <article className="analyst-kpi-card">
                    <span>Counting Progress</span>
                    <strong>{voteSummary.countingProgress.toFixed(1)}%</strong>
                  </article>
                  <article className="analyst-kpi-card">
                    <span>Finalized Booths</span>
                    <strong>{voteSummary.finalizedBooths}</strong>
                  </article>
                  <article className="analyst-kpi-card">
                    <span>High-Risk Incidents</span>
                    <strong>{riskCases}</strong>
                  </article>
                  <article className="analyst-kpi-card">
                    <span>Fraud Reports</span>
                    <strong>{fraudReports.length}</strong>
                  </article>
                </div>
              </section>

              <section className="analyst-chart-grid">
                <article className="panel analyst-chart-card">
                  <h3>Constituency Counting Progress</h3>
                  <p>Live percentage of counted votes against expected votes.</p>

                  {constituencyBars.length ? (
                    <div className="result-bar-list">
                      {constituencyBars.map((item) => (
                        <div className="result-bar-row" key={item.label}>
                          <div className="result-bar-head">
                            <strong>{item.label}</strong>
                            <span>
                              {formatNumber(item.votes)} / {formatNumber(item.totalVotes)} (
                              {item.percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="result-bar-track">
                            <div
                              className="result-bar-fill"
                              style={{ "--bar-width": `${item.percentage}%` }}
                              title={`${item.label}: ${formatNumber(
                                item.votes
                              )} counted votes (${item.percentage.toFixed(2)}%)`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="muted">No constituency vote data available yet.</p>
                  )}
                </article>

                <article className="panel analyst-chart-card">
                  <h3>Booth Vote Share</h3>
                  <p>Top polling booths by counted vote percentage.</p>

                  {boothBars.length ? (
                    <div className="result-bar-list">
                      {boothBars.map((item) => (
                        <div className="result-bar-row" key={item.id}>
                          <div className="result-bar-head">
                            <strong>{item.boothName}</strong>
                            <span>
                              {formatNumber(item.votes)} / {formatNumber(item.totalVotes)} (
                              {item.percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="result-bar-track">
                            <div
                              className="result-bar-fill alt"
                              style={{ "--bar-width": `${item.percentage}%` }}
                              title={`${item.boothName}: ${formatNumber(
                                item.votes
                              )} votes (${item.percentage.toFixed(2)}%)`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="muted">No booth-level vote data available yet.</p>
                  )}
                </article>
              </section>

              <section className="panel analyst-live-panel">
                <h3>Real-Time Vote Calculation</h3>
                <div className="analyst-live-grid">
                  <article>
                    <span>Total Expected Votes</span>
                    <strong>{formatNumber(voteSummary.totalVotes)}</strong>
                  </article>
                  <article>
                    <span>Remaining Votes</span>
                    <strong>
                      {formatNumber(voteSummary.totalVotes - voteSummary.countedVotes)}
                    </strong>
                  </article>
                  <article>
                    <span>Active Counting Booths</span>
                    <strong>{voteSummary.activeBooths}</strong>
                  </article>
                  <article>
                    <span>Analyst Reports</span>
                    <strong>{myReports.length}</strong>
                  </article>
                </div>

                {voteSummary.leadingBooth ? (
                  <p className="muted">
                    Current leading booth by counted votes: {voteSummary.leadingBooth.boothName}
                    {" • "}
                    {formatNumber(voteSummary.leadingBooth.votes)} votes counted.
                  </p>
                ) : (
                  <p className="muted">Real-time calculations will appear once vote data is available.</p>
                )}
              </section>

              <section className="panel">
                <h3>Recent evidence feed</h3>
                {incidents.length ? (
                  incidents.slice(0, 5).map((incident) => (
                    <div className="list-item" key={incident.id}>
                      <strong>{incident.title}</strong>
                      <p>
                        {incident.location} • {incident.severity} • {incident.status}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="muted">No incident records are available yet.</p>
                )}
              </section>
            </>
          ) : null}

          {activeSection === "reports" ? (
            <section className="panel">
              <h3>My analytical reports</h3>
              {message ? <p className="muted">{message}</p> : null}

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myReports.length ? (
                      myReports.map((report) => (
                        <tr key={report.id}>
                          <td>{report.title}</td>
                          <td>
                            <span className="pill">{report.status}</span>
                          </td>
                          <td>{new Date(report.createdAt).toLocaleString()}</td>
                          <td>
                            <div className="table-actions">
                              <button
                                className="btn btn-outline"
                                type="button"
                                onClick={() => {
                                  setForm({
                                    id: report.id,
                                    title: report.title,
                                    summary: report.summary,
                                    recommendation: report.recommendation,
                                    status: report.status,
                                  });
                                  setActiveSection("create");
                                }}
                              >
                                Edit
                              </button>
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
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="muted">
                          You have not created any analyst reports yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeSection === "create" ? (
            <section className="panel">
              <h3>{form.id ? "Update analysis report" : "Create analysis report"}</h3>

              <form className="compact-form" onSubmit={handleSubmit}>
                <input
                  placeholder="Report title"
                  required
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                />
                <textarea
                  placeholder="Summary"
                  required
                  rows={5}
                  value={form.summary}
                  onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
                />
                <textarea
                  placeholder="Recommendation"
                  required
                  rows={4}
                  value={form.recommendation}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, recommendation: e.target.value }))
                  }
                />
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="draft">Draft</option>
                  <option value="review">Review</option>
                  <option value="published">Published</option>
                </select>
                <div className="form-row">
                  <button className="btn btn-primary" type="submit">
                    {form.id ? "Save Changes" : "Create Report"}
                  </button>
                  {form.id ? (
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() => {
                        resetForm();
                        setActiveSection("reports");
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
              <h3>Incident dataset</h3>
              <p>Analyze operational incidents collected by observers.</p>

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
                          <td>{incident.severity}</td>
                          <td>{incident.status}</td>
                          <td>{incident.createdBy}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="muted">
                          Incident data is not available yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeSection === "fraud" ? (
            <section className="panel">
              <h3>Fraud report dataset</h3>
              <p>Use citizen-reported fraud cases for risk and pattern analysis.</p>

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
                          Fraud report data is not available yet.
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

export default AnalystDashboard;