import { useContext, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const initialForm = {
  title: "",
  category: "vote-buying",
  location: "",
  description: "",
};

function CitizenDashboard() {
  const {
    currentUser,
    fraudReports,
    electionResults,
    createFraudReport,
  } = useContext(AuthContext);

  const [activeSection, setActiveSection] = useState("report");
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  const myReports = useMemo(
    () => fraudReports.filter((report) => report.createdById === currentUser?.id),
    [fraudReports, currentUser?.id]
  );

  const sections = [
    { key: "report", label: "New Report" },
    { key: "my-reports", label: "My Reports", count: myReports.length },
    { key: "results", label: "Election Results", count: electionResults.length },
  ];

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = createFraudReport(form);
    setMessage(result.message);
    if (result.success) {
      setForm(initialForm);
      setActiveSection("my-reports");
    }
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
          {activeSection === "report" ? (
            <section className="panel">
              <h3>Submit fraud report</h3>
              <p>Provide details about suspicious activity near polling locations.</p>
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
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, category: event.target.value }))
                  }
                >
                  <option value="vote-buying">Vote Buying</option>
                  <option value="intimidation">Voter Intimidation</option>
                  <option value="booth-capturing">Booth Capturing</option>
                  <option value="other">Other</option>
                </select>
                <input
                  placeholder="Location"
                  required
                  value={form.location}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, location: event.target.value }))
                  }
                />
                <textarea
                  placeholder="Describe what happened"
                  required
                  rows={6}
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
                <button className="btn btn-primary" type="submit">
                  Submit Report
                </button>
              </form>
            </section>
          ) : null}

          {activeSection === "my-reports" ? (
            <section className="panel">
              <h3>My reports</h3>
              <p>Track review status of your submitted complaints.</p>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Location</th>
                      <th>Category</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myReports.length ? (
                      myReports.map((report) => (
                        <tr key={report.id}>
                          <td>{report.title}</td>
                          <td>{report.location}</td>
                          <td>{report.category}</td>
                          <td>
                            <span className="pill">{report.status}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="muted">
                          No reports submitted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeSection === "results" ? (
            <section className="panel">
              <h3>Election results</h3>
              <p>Published constituency-level updates from the election desk.</p>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Constituency</th>
                      <th>Booth</th>
                      <th>Winner</th>
                      <th>Party</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {electionResults.map((result) => (
                      <tr key={result.id}>
                        <td>{result.constituency}</td>
                        <td>{result.boothName}</td>
                        <td>{result.winner}</td>
                        <td>{result.party}</td>
                        <td>
                          <span className="pill">{result.status}</span>
                        </td>
                      </tr>
                    ))}
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
