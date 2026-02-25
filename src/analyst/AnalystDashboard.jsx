import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

import AnalystSidebar from "./components/AnalystSidebar";
import AnalystTopbar from "./components/AnalystTopbar";
import SummaryCard from "./components/SummaryCard";

import VotesPerCandidateChart from "./components/charts/VotesPerCandidateChart";
import ParticipationPieChart from "./components/charts/ParticipationPieChart";
import VotingTrendLineChart from "./components/charts/VotingTrendLineChart";
import RegionResultsChart from "./components/charts/RegionResultsChart";

import electionData from "./data/electionData.json";
import "./AnalystDashboard.css";

const formatNumber = (value) => Number(value).toLocaleString();

const reportInitialForm = {
  id: null,
  title: "",
  summary: "",
  recommendation: "",
  status: "draft",
};

function AnalystDashboard() {
  const {
    currentUser,
    logout,
    analystReports,
    createAnalystReport,
    updateAnalystReport,
    deleteAnalystReport,
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [now, setNow] = useState(() => new Date());
  const [reportForm, setReportForm] = useState(reportInitialForm);
  const [reportMessage, setReportMessage] = useState("");
  const [candidateSearch, setCandidateSearch] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const notifications = useMemo(
    () => electionData.recentActivity.filter((item) => item.status === "Pending").length,
    []
  );

  const summaryCards = [
    {
      title: "Total Registered Voters",
      value: formatNumber(electionData.summary.totalRegisteredVoters),
      icon: "👥",
      gradient: "gradient-1",
    },
    {
      title: "Total Votes Cast",
      value: formatNumber(electionData.summary.totalVotesCast),
      icon: "🗳️",
      gradient: "gradient-2",
    },
    {
      title: "Voter Participation",
      value: `${electionData.summary.participationPercentage}%`,
      icon: "📈",
      gradient: "gradient-3",
    },
    {
      title: "Leading Candidate",
      value: electionData.summary.leadingCandidate,
      icon: "🏆",
      gradient: "gradient-4",
    },
  ];

  const constituencyRows = useMemo(
    () =>
      electionData.regionResults.map((item) => ({
        ...item,
        share: ((item.votes / electionData.summary.totalVotesCast) * 100).toFixed(2),
      })),
    []
  );

  const candidateRows = useMemo(() => {
    const safeSearch = candidateSearch.trim().toLowerCase();

    return [...electionData.votesPerCandidate]
      .filter((item) => item.name.toLowerCase().includes(safeSearch))
      .sort((first, second) => second.votes - first.votes)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
  }, [candidateSearch]);

  const myReports = useMemo(
    () =>
      analystReports
        .filter((item) => item.createdById === currentUser?.id)
        .sort(
          (first, second) =>
            new Date(second.updatedAt || second.createdAt || 0).getTime() -
            new Date(first.updatedAt || first.createdAt || 0).getTime()
        ),
    [analystReports, currentUser?.id]
  );

  const resetReportForm = () => {
    setReportForm(reportInitialForm);
  };

  const handleReportSubmit = (event) => {
    event.preventDefault();

    const payload = {
      title: reportForm.title.trim(),
      summary: reportForm.summary.trim(),
      recommendation: reportForm.recommendation.trim(),
      status: reportForm.status,
    };

    if (!payload.title || !payload.summary || !payload.recommendation || !payload.status) {
      setReportMessage("All report fields are required.");
      return;
    }

    if (reportForm.id) {
      const result = updateAnalystReport(reportForm.id, payload);
      setReportMessage(result.message);
      if (result.success) {
        resetReportForm();
      }
      return;
    }

    const result = createAnalystReport(payload);
    setReportMessage(result.message);
    if (result.success) {
      resetReportForm();
    }
  };

  const beginEditReport = (report) => {
    setReportForm({
      id: report.id,
      title: report.title,
      summary: report.summary,
      recommendation: report.recommendation,
      status: report.status,
    });
  };

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "📊" },
    { key: "reports", label: "Reports", icon: "📁" },
    { key: "constituencies", label: "Constituencies", icon: "🗺️" },
    { key: "candidates", label: "Candidates", icon: "👤" },
    {
      key: "logout",
      label: "Logout",
      icon: "↩️",
      action: () => {
        logout();
        navigate("/");
      },
    },
  ];

  return (
    <div className="analyst-shell">
      <AnalystSidebar navItems={navItems} activeItem={activeSection} onSelect={setActiveSection} />

      <div className="analyst-shell-content">
        <AnalystTopbar
          analystName={currentUser?.name || "Election Analyst"}
          now={now}
          notifications={notifications}
        />

        <main className="analyst-main-grid">
          {activeSection === "dashboard" ? (
            <>
              <section className="analyst-summary-grid">
                {summaryCards.map((card) => (
                  <SummaryCard
                    key={card.title}
                    icon={card.icon}
                    title={card.title}
                    value={card.value}
                    gradient={card.gradient}
                  />
                ))}
              </section>

              <section className="analyst-charts-grid">
                <VotesPerCandidateChart data={electionData.votesPerCandidate} />
                <ParticipationPieChart data={electionData.voterParticipation} />
                <VotingTrendLineChart data={electionData.votingTrend} />
                <RegionResultsChart data={electionData.regionResults} />
              </section>

              <section className="analyst-table-card">
                <div className="analyst-table-header">
                  <h3>Recent Activity</h3>
                  <p>Latest voter verification events across regions.</p>
                </div>

                <div className="analyst-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Voter ID</th>
                        <th>Region</th>
                        <th>Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {electionData.recentActivity.map((item) => (
                        <tr key={`${item.voterId}-${item.time}`}>
                          <td>{item.voterId}</td>
                          <td>{item.region}</td>
                          <td>{item.time}</td>
                          <td>
                            <span
                              className={`activity-status ${
                                item.status === "Verified" ? "verified" : "pending"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : null}

          {activeSection === "reports" ? (
            <section className="analyst-table-card analyst-stack-card">
              <div className="analyst-table-header">
                <h3>Analyst Reports</h3>
                <p>Create, edit, and manage your analytical reports.</p>
              </div>

              <form className="analyst-report-form" onSubmit={handleReportSubmit}>
                <input
                  type="text"
                  placeholder="Report title"
                  value={reportForm.title}
                  onChange={(event) =>
                    setReportForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
                <textarea
                  rows={3}
                  placeholder="Summary"
                  value={reportForm.summary}
                  onChange={(event) =>
                    setReportForm((prev) => ({ ...prev, summary: event.target.value }))
                  }
                />
                <textarea
                  rows={3}
                  placeholder="Recommendation"
                  value={reportForm.recommendation}
                  onChange={(event) =>
                    setReportForm((prev) => ({ ...prev, recommendation: event.target.value }))
                  }
                />
                <div className="analyst-report-actions">
                  <select
                    value={reportForm.status}
                    onChange={(event) =>
                      setReportForm((prev) => ({ ...prev, status: event.target.value }))
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                    <option value="published">Published</option>
                  </select>
                  <button className="btn btn-primary" type="submit">
                    {reportForm.id ? "Update Report" : "Create Report"}
                  </button>
                  {reportForm.id ? (
                    <button className="btn btn-outline" type="button" onClick={resetReportForm}>
                      Cancel
                    </button>
                  ) : null}
                </div>
                {reportMessage ? <p className="analyst-inline-note">{reportMessage}</p> : null}
              </form>

              <div className="analyst-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myReports.length ? (
                      myReports.map((item) => (
                        <tr key={item.id}>
                          <td>{item.title}</td>
                          <td>
                            <span className="activity-status pending">{item.status}</span>
                          </td>
                          <td>{new Date(item.updatedAt || item.createdAt || Date.now()).toLocaleString()}</td>
                          <td>
                            <div className="analyst-action-row">
                              <button
                                className="btn btn-outline"
                                type="button"
                                onClick={() => beginEditReport(item)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-danger"
                                type="button"
                                onClick={() => {
                                  const result = deleteAnalystReport(item.id);
                                  setReportMessage(result.message);
                                  if (reportForm.id === item.id) {
                                    resetReportForm();
                                  }
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
                        <td colSpan={4}>No reports found for this analyst.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeSection === "constituencies" ? (
            <section className="analyst-table-card">
              <div className="analyst-table-header">
                <h3>Constituency Results</h3>
                <p>Region-level vote count and share contribution.</p>
              </div>

              <div className="analyst-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Region</th>
                      <th>Votes</th>
                      <th>Share of Total Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {constituencyRows.map((item) => (
                      <tr key={item.region}>
                        <td>{item.region}</td>
                        <td>{formatNumber(item.votes)}</td>
                        <td>{item.share}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeSection === "candidates" ? (
            <section className="analyst-table-card analyst-stack-card">
              <div className="analyst-table-header">
                <h3>Candidate Performance</h3>
                <p>Search and track candidate vote performance rankings.</p>
              </div>

              <div className="analyst-search-row">
                <input
                  type="search"
                  placeholder="Search candidate name"
                  value={candidateSearch}
                  onChange={(event) => setCandidateSearch(event.target.value)}
                />
              </div>

              <div className="analyst-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Candidate</th>
                      <th>Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidateRows.length ? (
                      candidateRows.map((item) => (
                        <tr key={item.name}>
                          <td>#{item.rank}</td>
                          <td>{item.name}</td>
                          <td>{formatNumber(item.votes)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3}>No candidate match found.</td>
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
