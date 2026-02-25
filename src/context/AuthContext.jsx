import { createContext, useEffect, useMemo, useState } from "react";

export const AuthContext = createContext();

const STORAGE_KEYS = {
  users: "ems_users_v1",
  currentUser: "ems_current_user_v1",
  incidents: "ems_incidents_v1",
  fraudReports: "ems_fraud_reports_v1",
  analystReports: "ems_analyst_reports_v1",
  electionResults: "ems_election_results_v1",
};

const makeId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
};

const seededUsers = [];
const seededIncidents = [];
const seededFraudReports = [];
const seededAnalystReports = [];
const seededElectionResults = [
  {
    id: "res-1",
    constituency: "North City",
    boothName: "Booth 12 - Community Hall",
    winner: "Aditi Sharma",
    party: "Progress Alliance",
    votes: 1423,
    totalVotes: 2980,
    status: "final",
    updatedAt: "2026-02-20T08:30:00.000Z",
  },
  {
    id: "res-2",
    constituency: "West Valley",
    boothName: "Booth 44 - Government School",
    winner: "Rohit Verma",
    party: "Civic Front",
    votes: 1189,
    totalVotes: 2510,
    status: "final",
    updatedAt: "2026-02-20T08:35:00.000Z",
  },
  {
    id: "res-3",
    constituency: "South Ridge",
    boothName: "Booth 8 - Primary School",
    winner: "Neha Iyer",
    party: "People First",
    votes: 1335,
    totalVotes: 2876,
    status: "in-progress",
    updatedAt: "2026-02-20T08:40:00.000Z",
  },
];

const readList = (key, fallback) => {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const readObject = (key, fallback = null) => {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => readList(STORAGE_KEYS.users, seededUsers));
  const [currentUser, setCurrentUser] = useState(() =>
    readObject(STORAGE_KEYS.currentUser, null)
  );
  const [incidents, setIncidents] = useState(() =>
    readList(STORAGE_KEYS.incidents, seededIncidents)
  );
  const [fraudReports, setFraudReports] = useState(() =>
    readList(STORAGE_KEYS.fraudReports, seededFraudReports)
  );
  const [analystReports, setAnalystReports] = useState(() =>
    readList(STORAGE_KEYS.analystReports, seededAnalystReports)
  );
  const [electionResults, setElectionResults] = useState(() =>
    readList(STORAGE_KEYS.electionResults, seededElectionResults)
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.incidents, JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.fraudReports, JSON.stringify(fraudReports));
  }, [fraudReports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.analystReports, JSON.stringify(analystReports));
  }, [analystReports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.electionResults, JSON.stringify(electionResults));
  }, [electionResults]);

  const register = (userData) => {
    const safeEmail = userData.email.trim().toLowerCase();
    const safeName = userData.name.trim();
    const safePassword = userData.password;
    const safeRole = userData.role;

    if (!safeName || !safeEmail || !safePassword || !safeRole) {
      return { success: false, message: "All fields are required." };
    }

    const exists = users.some(
      (user) => user.email.toLowerCase() === safeEmail
    );

    if (exists) {
      return { success: false, message: "Email is already registered." };
    }

    const newUser = {
      id: makeId(),
      name: safeName,
      email: safeEmail,
      password: safePassword,
      role: safeRole,
    };

    setUsers((prev) => [...prev, newUser]);
    return { success: true, message: "Registration successful." };
  };

  const login = (email, password) => {
    const safeEmail = email.trim().toLowerCase();

    const user = users.find(
      (item) => item.email.toLowerCase() === safeEmail && item.password === password
    );

    if (!user) {
      return { success: false, message: "Invalid email or password." };
    }

    setCurrentUser(user);
    return { success: true, user };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const createUser = (payload) => {
    const safeEmail = payload.email.trim().toLowerCase();
    const safeName = payload.name.trim();

    if (!safeName || !safeEmail || !payload.password || !payload.role) {
      return { success: false, message: "All fields are required." };
    }

    const exists = users.some(
      (user) => user.email.toLowerCase() === safeEmail
    );

    if (exists) {
      return { success: false, message: "Email already exists." };
    }

    const newUser = {
      id: makeId(),
      name: safeName,
      email: safeEmail,
      password: payload.password,
      role: payload.role,
    };

    setUsers((prev) => [...prev, newUser]);
    return { success: true, message: "User created." };
  };

  const updateUser = (userId, updates) => {
    const safeEmail = updates.email.trim().toLowerCase();
    const safeName = updates.name.trim();

    if (!safeName || !safeEmail || !updates.role) {
      return { success: false, message: "Name, email, and role are required." };
    }

    const duplicateEmail = users.some(
      (user) => user.id !== userId && user.email.toLowerCase() === safeEmail
    );

    if (duplicateEmail) {
      return { success: false, message: "Email already exists." };
    }

    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              ...updates,
              name: safeName,
              email: safeEmail,
              password: updates.password || user.password,
            }
          : user
      )
    );

    if (currentUser?.id === userId) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }

    return { success: true, message: "User updated." };
  };

  const deleteUser = (userId) => {
    if (currentUser?.id === userId) {
      return { success: false, message: "You cannot delete the active user." };
    }

    setUsers((prev) => prev.filter((user) => user.id !== userId));
    return { success: true, message: "User removed." };
  };

  const createIncident = (payload) => {
    const item = {
      id: makeId(),
      title: payload.title,
      location: payload.location,
      severity: payload.severity,
      status: payload.status,
      details: payload.details,
      createdBy: currentUser?.name || "Unknown",
      createdById: currentUser?.id,
      createdAt: new Date().toISOString(),
    };

    setIncidents((prev) => [item, ...prev]);
    return { success: true, message: "Incident added." };
  };

  const updateIncident = (incidentId, updates) => {
    setIncidents((prev) =>
      prev.map((item) => (item.id === incidentId ? { ...item, ...updates } : item))
    );
    return { success: true, message: "Incident updated." };
  };

  const deleteIncident = (incidentId) => {
    setIncidents((prev) => prev.filter((item) => item.id !== incidentId));
    return { success: true, message: "Incident deleted." };
  };

  const createFraudReport = (payload) => {
    const safeTitle = payload.title?.trim();
    const safeCategory = payload.category;
    const safeDescription = payload.description?.trim();
    const safeLocation = payload.location?.trim();

    if (!safeTitle || !safeCategory || !safeDescription || !safeLocation) {
      return { success: false, message: "All fraud report fields are required." };
    }

    const item = {
      id: makeId(),
      title: safeTitle,
      category: safeCategory,
      status: "submitted",
      description: safeDescription,
      location: safeLocation,
      createdBy: currentUser?.name || "Unknown",
      createdById: currentUser?.id,
      createdAt: new Date().toISOString(),
    };

    setFraudReports((prev) => [item, ...prev]);
    return { success: true, message: "Fraud report submitted." };
  };

  const updateFraudReport = (reportId, updates) => {
    setFraudReports((prev) =>
      prev.map((item) => (item.id === reportId ? { ...item, ...updates } : item))
    );
    return { success: true, message: "Fraud report updated." };
  };

  const deleteFraudReport = (reportId) => {
    setFraudReports((prev) => prev.filter((item) => item.id !== reportId));
    return { success: true, message: "Fraud report deleted." };
  };

  const createAnalystReport = (payload) => {
    const safeTitle = payload.title?.trim();
    const safeSummary = payload.summary?.trim();
    const safeRecommendation = payload.recommendation?.trim();
    const safeStatus = payload.status;

    if (!safeTitle || !safeSummary || !safeRecommendation || !safeStatus) {
      return { success: false, message: "All analyst report fields are required." };
    }

    const now = new Date().toISOString();

    const item = {
      id: makeId(),
      title: safeTitle,
      summary: safeSummary,
      recommendation: safeRecommendation,
      status: safeStatus,
      createdBy: currentUser?.name || "Unknown",
      createdById: currentUser?.id,
      createdAt: now,
      updatedAt: now,
    };

    setAnalystReports((prev) => [item, ...prev]);
    return { success: true, message: "Analysis report created." };
  };

  const updateAnalystReport = (reportId, updates) => {
    const safeTitle = updates.title?.trim();
    const safeSummary = updates.summary?.trim();
    const safeRecommendation = updates.recommendation?.trim();
    const safeStatus = updates.status;

    if (!safeTitle || !safeSummary || !safeRecommendation || !safeStatus) {
      return { success: false, message: "All analyst report fields are required." };
    }

    setAnalystReports((prev) =>
      prev.map((item) =>
        item.id === reportId
          ? {
              ...item,
              ...updates,
              title: safeTitle,
              summary: safeSummary,
              recommendation: safeRecommendation,
              status: safeStatus,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
    return { success: true, message: "Analysis report updated." };
  };

  const deleteAnalystReport = (reportId) => {
    setAnalystReports((prev) => prev.filter((item) => item.id !== reportId));
    return { success: true, message: "Analysis report deleted." };
  };

  const createElectionResult = (payload) => {
    const safeBoothName = payload.boothName.trim();
    const safeConstituency = payload.constituency.trim();
    const safeWinner = payload.winner.trim();
    const safeParty = payload.party.trim();
    const safeStatus = payload.status;
    const safeVotes = Number(payload.votes);
    const safeTotalVotes = Number(payload.totalVotes);

    if (
      !safeBoothName ||
      !safeConstituency ||
      !safeWinner ||
      !safeParty ||
      !safeStatus ||
      Number.isNaN(safeVotes) ||
      Number.isNaN(safeTotalVotes)
    ) {
      return { success: false, message: "All election result fields are required." };
    }

    const item = {
      id: makeId(),
      boothName: safeBoothName,
      constituency: safeConstituency,
      winner: safeWinner,
      party: safeParty,
      votes: safeVotes,
      totalVotes: safeTotalVotes,
      status: safeStatus,
      updatedAt: new Date().toISOString(),
    };

    setElectionResults((prev) => [item, ...prev]);
    return { success: true, message: "Election result added." };
  };

  const updateElectionResult = (resultId, updates) => {
    const safeBoothName = updates.boothName.trim();
    const safeConstituency = updates.constituency.trim();
    const safeWinner = updates.winner.trim();
    const safeParty = updates.party.trim();
    const safeStatus = updates.status;
    const safeVotes = Number(updates.votes);
    const safeTotalVotes = Number(updates.totalVotes);

    if (
      !safeBoothName ||
      !safeConstituency ||
      !safeWinner ||
      !safeParty ||
      !safeStatus ||
      Number.isNaN(safeVotes) ||
      Number.isNaN(safeTotalVotes)
    ) {
      return { success: false, message: "All election result fields are required." };
    }

    setElectionResults((prev) =>
      prev.map((item) =>
        item.id === resultId
          ? {
              ...item,
              boothName: safeBoothName,
              constituency: safeConstituency,
              winner: safeWinner,
              party: safeParty,
              votes: safeVotes,
              totalVotes: safeTotalVotes,
              status: safeStatus,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
    return { success: true, message: "Election result updated." };
  };

  const deleteElectionResult = (resultId) => {
    setElectionResults((prev) => prev.filter((item) => item.id !== resultId));
    return { success: true, message: "Election result deleted." };
  };

  const dashboardStats = useMemo(
    () => ({
      users: users.length,
      incidents: incidents.length,
      fraudReports: fraudReports.length,
      analystReports: analystReports.length,
      electionResults: electionResults.length,
    }),
    [
      users.length,
      incidents.length,
      fraudReports.length,
      analystReports.length,
      electionResults.length,
    ]
  );

  return (
    <AuthContext.Provider
      value={{
        users,
        currentUser,
        incidents,
        fraudReports,
        analystReports,
        electionResults,
        dashboardStats,
        register,
        login,
        logout,
        createUser,
        updateUser,
        deleteUser,
        createIncident,
        updateIncident,
        deleteIncident,
        createFraudReport,
        updateFraudReport,
        deleteFraudReport,
        createAnalystReport,
        updateAnalystReport,
        deleteAnalystReport,
        createElectionResult,
        updateElectionResult,
        deleteElectionResult,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};