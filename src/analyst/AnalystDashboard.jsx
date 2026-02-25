import { useContext, useMemo, useState } from "react";
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

const reportFlow = {
  draft: "review",
  review: "published",
  published: "published",
};

const buildPercent = (value, total) => {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
};

const normalizeLocation = (value) => {
  if (!value || typeof value !== "string") {
    return "Unknown";
  }

  const safeValue = value.trim();
  return safeValue || "Unknown";
};

function AnalystDashboard() {
  const {
    currentUser,
    incidents,
    fraudReports,
    analystReports,
    createAnalystReport,
    updateAnalystReport,
    deleteAnalystReport,
  } = useContext(AuthContext);

  const [activeSection, setActiveSection] = useState("overview");
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState("");

  const myReports = useMemo(
    () => analystReports.filter((report) => report.createdById === currentUser?.id),
    [analystReports, currentUser?.id]
  );

  const incidentSeverity = useMemo(
    () =>
      incidents.reduce(
        (accumulator, item) => {
          const safeSeverity = item.severity || "medium";
          if (accumulator[safeSeverity] === undefined) {
            return accumulator;
          }

          return {
            ...accumulator,
            [safeSeverity]: accumulator[safeSeverity] + 1,
          };
        },
        { low: 0, medium: 0, high: 0 }
      ),
    [incidents]
  );

  const fraudWorkflow = useMemo(
    () =>
      fraudReports.reduce(
        (accumulator, item) => {
          const safeStatus = item.status || "submitted";
          if (accumulator[safeStatus] === undefined) {
            return accumulator;
          }

          return {
            ...accumulator,
            [safeStatus]: accumulator[safeStatus] + 1,
          };
        },
        { submitted: 0, "under-review": 0, verified: 0, rejected: 0 }
      ),
    [fraudReports]
  );

  const reportStatus = useMemo(
    () =>
      myReports.reduce(
        (accumulator, item) => {
          const safeStatus = item.status || "draft";
          if (accumulator[safeStatus] === undefined) {
            return accumulator;
          }

          return {
            ...accumulator,
            [safeStatus]: accumulator[safeStatus] + 1,
          };
        },
        { draft: 0, review: 0, published: 0 }
      ),
    [myReports]
  );

  const locationHotspots = useMemo(() => {
    const locationMap = {};

    incidents.forEach((item) => {
      const safeLocation = normalizeLocation(item.location);
      locationMap[safeLocation] = (locationMap[safeLocation] || 0) + 1;
    });

    fraudReports.forEach((item) => {
      const safeLocation = normalizeLocation(item.location);
      locationMap[safeLocation] = (locationMap[safeLocation] || 0) + 1;
    });

    return Object.entries(locationMap)
      .map(([location, count]) => ({ location, count }))
      .sort((first, second) => second.count - first.count)
      .slice(0, 6);
  }, [incidents, fraudReports]);

  const totalInputs = incidents.length + fraudReports.length;
  const incidentTotal = incidents.length;
  const fraudTotal = fraudReports.length;
  const hotspotMax = locationHotspots.length
    ? Math.max(...locationHotspots.map((item) => item.count))
    : 0;

  const incidentBars = [
    { key: "high", label: "High", value: incidentSeverity.high },
    { key: "medium", label: "Medium", value: incidentSeverity.medium },
    { key: "low", label: "Low", value: incidentSeverity.low },
  ];

  const fraudBars = [
    { key: "submitted", label: "Submitted", value: fraudWorkflow.submitted },
    { key: "under-review", label: "Under Review", value: fraudWorkflow["under-review"] },
    { key: "verified", label: "Verified", value: fraudWorkflow.verified },
    { key: "rejected", label: "Rejected", value: fraudWorkflow.rejected },
  ];

  const recentIncidents = useMemo(
    () =>
      [...incidents]
        .sort(
          (first, second) =>
            new Date(second.createdAt || 0).getTime() - new Date(first.createdAt || 0).getTime()
        )
        .slice(0, 5),
    [incidents]
  );

  const recentFraudReports = useMemo(
    () =>
      [...fraudReports]
        .sort(
          (first, second) =>
            new Date(second.createdAt || 0).getTime() - new Date(first.createdAt || 0).getTime()
        )
        .slice(0, 5),
    [fraudReports]
  );

  const filteredReports = useMemo(() => {
    const safeSearch = search.trim().toLowerCase();

    return [...myReports]
      .filter((item) => {
        if (statusFilter !== "all" && item.status !== statusFilter) {
          return false;
        }

        if (!safeSearch) {
          return true;
        }

        const searchable = `${item.title} ${item.summary} ${item.recommendation}`.toLowerCase();
        return searchable.includes(safeSearch);
      })
      .sort(
        (first, second) =>
          new Date(second.createdAt || 0).getTime() - new Date(first.createdAt || 0).getTime()
      );
  }, [myReports, search, statusFilter]);

  const sections = [
    { key: "overview", label: "Overview" },
    { key: "reports", label: "My Reports", count: myReports.length },
    { key: "compose", label: form.id ? "Edit Report" : "New Report" },
    { key: "inputs", label: "Data Inputs", count: incidents.length + fraudReports.length },
  ];

  const resetForm = () => {
    setForm(initialForm);
  };

  const startEdit = (report) => {
    setForm({
      id: report.id,
      title: report.title,
      summary: report.summary,
      recommendation: report.recommendation,
      status: report.status,
    });
    setActiveSection("compose");
  };

  const updateReportStatus = (report, status) => {
    const result = updateAnalystReport(report.id, {
      title: report.title,
      summary: report.summary,
      recommendation: report.recommendation,
      status,
    });

    setMessage(result.message);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      title: form.title.trim(),
      summary: form.summary.trim(),
      recommendation: form.recommendation.trim(),
      status: form.status,
    };

    if (!payload.title || !payload.summary || !payload.recommendation) {
      setMessage("Title, summary, and recommendation are required.");
      return;
    }

    if (form.id) {
      const result = updateAnalystReport(form.id, {
        ...payload,
      });
      setMessage(result.message);
      if (result.success) {
        resetForm();
        setActiveSection("reports");
      }
      return;
    }

    const result = createAnalystReport(payload);
    setMessage(result.message);
    if (result.success) {
      resetForm();
      setActiveSection("reports");
    }
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
                    <h3>Operational Intelligence</h3>
                    <p>
                      Live analyst workspace based on observer incidents, fraud complaints, and
                      report production.
                    </p>
                  </div>
                  <div className="analyst-live-chip">
                    <span>Total Inputs</span>
                    <strong>{totalInputs}</strong>
                  </div>
                </div>

                <div className="analyst-kpi-grid">
                  <article className="analyst-kpi-card">
                    <span>My Reports</span>
                    <strong>{myReports.length}</strong>
                  </article>
                  <article className="analyst-kpi-card">
                    <span>Published Reports</span>
                    <strong>{reportStatus.published}</strong>
                  </article>
                  <article className="analyst-kpi-card">
                    <span>Open Risk Signals</span>
                    <strong>{fraudWorkflow.submitted + fraudWorkflow["under-review"]}</strong>
                  </article>
                </div>
              </section>

              <section className="analyst-chart-grid">
                <article className="panel analyst-chart-card">
                  <h3>Incident Severity Distribution</h3>
                  <p>Bar graph of observer incident intensity.</p>

                  <div className="result-bar-list">
                    {incidentBars.map((item) => (
                      <div key={item.key} className="result-bar-row">
                        <div className="result-bar-head">
                          <strong>{item.label}</strong>
                          <span>{item.value}</span>
                        </div>
                        <div className="result-bar-track">
                          <div
                            className="result-bar-fill"
                            style={{ "--bar-width": `${buildPercent(item.value, incidentTotal)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="panel analyst-chart-card">
                  <h3>Fraud Workflow Health</h3>
                  <p>Pipeline view from submission to verification.</p>

                  <div className="result-bar-list">
                    {fraudBars.map((item) => (
                      <div key={item.key} className="result-bar-row">
                        <div className="result-bar-head">
                          <strong>{item.label}</strong>
                          <span>{item.value}</span>
                        </div>
                        <div className="result-bar-track">
                          <div
                            className="result-bar-fill alt"
                            style={{ "--bar-width": `${buildPercent(item.value, fraudTotal)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </section>

              <section className="panel analyst-live-panel">
                <h3>Risk Hotspots by Location</h3>
                <p>Combined count of incidents and fraud reports per location.</p>

                <div className="result-bar-list">
                  {locationHotspots.length ? (
                    locationHotspots.map((item) => (
                      <div key={item.location} className="result-bar-row">
                        <div className="result-bar-head">
                          <strong>{item.location}</strong>
                          <span>{item.count}</span>
                        </div>
                        <div className="result-bar-track">
                          <div
                            className="result-bar-fill"
                            style={{ "--bar-width": `${buildPercent(item.count, hotspotMax)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="muted">No location data available yet.</p>
                  )}
                </div>
              </section>
            </>
          ) : null}

          {activeSection === "reports" ? (
            <section className="panel">
              <h3>My analysis reports</h3>
              <p>Review, filter, and advance reports through analyst workflow.</p>
              {message ? <p className="muted">{message}</p> : null}

              <div className="analyst-toolbar">
                <div className="analyst-toolbar-group">
                  <input
                    type="search"
                    placeholder="Search reports by title or content"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <option value="all">All statuses</option>
                    <option value="draft">Draft</option>
                    <option value="review">In Review</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveSection("compose");
                  }}
                >
                  New Report
                </button>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Updated</th>
                      <th>Summary</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.length ? (
                      filteredReports.map((report) => (
                        <tr key={report.id}>
                          <td className="analyst-report-title">{report.title}</td>
                          <td>
                            <span className="pill">{report.status}</span>
                          </td>
                          <td>{new Date(report.createdAt || Date.now()).toLocaleString()}</td>
                          <td>{report.summary}</td>
                          <td>
                            <div className="table-actions">
                              <button
                                className="btn btn-outline"
                                type="button"
                                onClick={() => startEdit(report)}
                              >
                                Edit
                              </button>
                              {report.status !== "published" ? (
                                <button
                                  className="btn btn-primary"
                                  type="button"
                                  onClick={() =>
                                    updateReportStatus(report, reportFlow[report.status])
                                  }
                                >
                                  Move to {reportFlow[report.status]}
                                </button>
                              ) : null}
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
                        <td colSpan={5} className="muted">
                          No reports match your current search and status filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeSection === "compose" ? (
            <section className="panel">
              <h3>{form.id ? "Update report" : "Create report"}</h3>
              <p>Draft a professional analytical brief for election authorities.</p>
              {message ? <p className="muted">{message}</p> : null}

              <form className="compact-form" onSubmit={handleSubmit}>
                <input
                  placeholder="Report title"
                  required
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
                <textarea
                  placeholder="Summary"
                  required
                  rows={5}
                  value={form.summary}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, summary: event.target.value }))
                  }
                />
                <textarea
                  placeholder="Recommendation"
                  required
                  rows={5}
                  value={form.recommendation}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, recommendation: event.target.value }))
                  }
                />
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, status: event.target.value }))
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="review">In Review</option>
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

          {activeSection === "inputs" ? (
            <section className="panel">
              <h3>Data inputs</h3>
              <p>Recent field records and citizen complaints supporting analyst decisions.</p>

              <div className="grid two-cols">
                <article className="panel">
                  <h3>Recent incidents ({incidents.length})</h3>
                  <p className="muted">Observer-submitted incident records with severity markers.</p>

                  {recentIncidents.length ? (
                    recentIncidents.map((item) => (
                      <div className="list-item" key={item.id}>
                        <strong>{item.title}</strong>
                        <p>
                          {item.location} · <span className="pill">{item.severity}</span>
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="muted">No incidents available yet.</p>
                  )}
                </article>
                <article className="panel">
                  <h3>Recent fraud reports ({fraudReports.length})</h3>
                  <p className="muted">Citizen-submitted complaints and allegations by workflow state.</p>

                  {recentFraudReports.length ? (
                    recentFraudReports.map((item) => (
                      <div className="list-item" key={item.id}>
                        <strong>{item.title}</strong>
                        <p>
                          {item.location} · <span className="pill">{item.status}</span>
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="muted">No fraud reports available yet.</p>
                  )}
                </article>
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default AnalystDashboard;
