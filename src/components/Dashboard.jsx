import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import UpgradeModal from "./UpgradeModal";

const Dashboard = () => {
  const [adherenceHistory, setAdherenceHistory] = useState({});
  const [medications, setMedications] = useState([]);
  const [adrReports, setAdrReports] = useState([]);
  const [adrForm, setAdrForm] = useState({
    medication: "",
    symptom: "",
    severity: "Mild",
  });

  const [plan, setPlan] = useState("free");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const todayKey = new Date().toLocaleDateString();
  const [todayPercent, setTodayPercent] = useState(0);

  // Load persisted data
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("adherenceHistory")) || {};
    const savedMeds = JSON.parse(localStorage.getItem("medications")) || [];
    const savedADRs = JSON.parse(localStorage.getItem("adrReports")) || [];
    const savedPlan = localStorage.getItem("plan") || "free";
    const savedDark = JSON.parse(localStorage.getItem("darkMode")) || false;

    setAdherenceHistory(savedHistory);
    setMedications(savedMeds);
    setAdrReports(savedADRs);
    setPlan(savedPlan);
    setDarkMode(savedDark);

    // Compute today's adherence immediately
    if (typeof savedHistory[todayKey] !== "undefined") {
      setTodayPercent(savedHistory[todayKey]);
    } else {
      const allowed = savedPlan === "free" ? savedMeds.slice(0, 3) : savedMeds;
      const takenCount = allowed.filter((m) => m.taken).length;
      const pct = allowed.length === 0 ? 0 : Math.round((takenCount / allowed.length) * 100);
      setTodayPercent(pct);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const syncAdherenceHistory = (percent) => {
    const newHistory = { ...adherenceHistory, [todayKey]: percent };
    setAdherenceHistory(newHistory);
    localStorage.setItem("adherenceHistory", JSON.stringify(newHistory));
  };

  // --- ADR handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdrForm({ ...adrForm, [name]: value });
  };

  const handleADRSubmit = (e) => {
    e.preventDefault();
    if (!adrForm.medication || !adrForm.symptom) {
      alert("Please fill in all fields.");
      return;
    }
    if (plan === "free" && adrReports.length >= 3) {
      alert("Upgrade to Premium to submit unlimited ADR reports.");
      setShowUpgrade(true);
      return;
    }

    const newADR = {
      id: Date.now(),
      ...adrForm,
      date: new Date().toLocaleDateString(),
    };

    const updatedReports = [newADR, ...adrReports];
    setAdrReports(updatedReports);
    localStorage.setItem("adrReports", JSON.stringify(updatedReports));
    setAdrForm({ medication: "", symptom: "", severity: "Mild" });
    alert("✅ ADR Report submitted successfully!");
  };

  const handleDeleteADR = (id) => {
    if (!confirm("Delete this ADR report?")) return;
    const updated = adrReports.filter((r) => r.id !== id);
    setAdrReports(updated);
    localStorage.setItem("adrReports", JSON.stringify(updated));
  };

  // --- Plan upgrade ---
  const handleUpgrade = () => {
    localStorage.setItem("plan", "premium");
    setPlan("premium");
    setShowUpgrade(false);
    alert("🎉 Upgrade successful! You’re now on the Premium plan.");
  };

  // --- Adherence chart data ---
  const weeklyTrend = Object.keys(adherenceHistory)
    .sort((a, b) => new Date(a) - new Date(b))
    .slice(-7)
    .map((day) => ({ date: day, adherence: adherenceHistory[day] }));

  // --- Medication quick actions ---
  const markAsTaken = (id) => {
    const updated = medications.map((m) =>
      m.id === id ? { ...m, taken: true, takenAt: new Date().toLocaleTimeString() } : m
    );
    setMedications(updated);
    localStorage.setItem("medications", JSON.stringify(updated));

    const allowed = plan === "free" ? updated.slice(0, 3) : updated;
    const takenCount = allowed.filter((m) => m.taken).length;
    const percent = allowed.length === 0 ? 0 : Math.round((takenCount / allowed.length) * 100);
    setTodayPercent(percent);
    syncAdherenceHistory(percent);

    if (percent === 100) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🎉 Great job!", { body: "You completed today's medications." });
      } else {
        alert("🎉 Great job! You completed today's medications.");
      }
    }
  };

  const deleteMedication = (id) => {
    if (!confirm("Delete this medication?")) return;
    const updated = medications.filter((m) => m.id !== id);
    setMedications(updated);
    localStorage.setItem("medications", JSON.stringify(updated));

    const allowed = plan === "free" ? updated.slice(0, 3) : updated;
    const takenCount = allowed.filter((m) => m.taken).length;
    const percent = allowed.length === 0 ? 0 : Math.round((takenCount / allowed.length) * 100);
    setTodayPercent(percent);
    syncAdherenceHistory(percent);
  };

  // --- ADR search filter (safe handling) ---
  const filteredReports = adrReports.filter((r) => {
    if (!r || !r.medication || !r.symptom) return false;
    const med = r.medication.toString().toLowerCase();
    const sym = r.symptom.toString().toLowerCase();
    const query = searchQuery.toLowerCase();
    return med.includes(query) || sym.includes(query);
  });

  // --- Styles ---
  const bg = darkMode ? "#0b1220" : "#f8fafc";
  const text = darkMode ? "#f8fafc" : "#0b1220";

  const motivational = (p) => {
    if (p === 100) return "🎉 Perfect — all meds taken today.";
    if (p >= 75) return "💪 Great progress — almost there!";
    if (p >= 40) return "👍 Keep going — consistency matters.";
    if (p > 0) return "⏳ Take the rest to stay on track.";
    return "📌 No meds taken yet today.";
  };

  return (
    <div style={{ padding: 16, backgroundColor: bg, color: text, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>📊 My Dashboard</h2>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            backgroundColor: darkMode ? "#334155" : "#e2e8f0",
            color: darkMode ? "#f8fafc" : "#0b1220",
            border: "none",
            borderRadius: 6,
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      {/* Plan */}
      <div style={{ margin: "12px 0", maxWidth: 600 }}>
        <p>
          Plan:{" "}
          <strong style={{ color: plan === "premium" ? "#22c55e" : "#f59e0b" }}>
            {plan.toUpperCase()}
          </strong>
        </p>
        {plan === "free" && (
          <button
            onClick={() => setShowUpgrade(true)}
            style={{
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              padding: "8px 12px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Upgrade to Premium
          </button>
        )}
      </div>

      {/* Daily Adherence */}
      <div style={{ maxWidth: 600, background: darkMode ? "#0f172a" : "#fff", padding: 12, borderRadius: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <strong>Today's adherence</strong>
            <div style={{ fontSize: 12 }}>{todayKey}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: "600" }}>{todayPercent}%</div>
            <div style={{ fontSize: 12 }}>{motivational(todayPercent)}</div>
          </div>
        </div>
        <div style={{ height: 18, background: darkMode ? "#475569" : "#e6eef6", borderRadius: 10, marginTop: 8 }}>
          <div
            style={{
              height: "100%",
              width: `${todayPercent}%`,
              background: todayPercent === 100 ? "#16a34a" : "#2563eb",
              borderRadius: 10,
              transition: "width 700ms ease-in-out",
            }}
          />
        </div>
      </div>

      {/* Weekly Trend */}
      <div
        style={{
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 10,
          padding: 12,
          backgroundColor: darkMode ? "#071029" : "#fff",
          maxWidth: 600,
          marginTop: 20,
        }}
      >
        <h4>💊 Adherence Trend (last 7 days)</h4>
        {weeklyTrend.length === 0 ? (
          <p>No adherence data yet.</p>
        ) : (
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: text }} />
                <YAxis domain={[0, 100]} tick={{ fill: text }} />
                <Tooltip />
                <Bar dataKey="adherence" fill="#22c55e" barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ADR Section */}
      <div style={{ display: "grid", gap: 16, maxWidth: 600, marginTop: 20 }}>
        <div style={{ background: darkMode ? "#071029" : "#fff", padding: 12, borderRadius: 10 }}>
          <h4>⚠️ Report an ADR</h4>
          <form onSubmit={handleADRSubmit} style={{ display: "grid", gap: 8 }}>
            <input
              name="medication"
              value={adrForm.medication}
              onChange={handleChange}
              placeholder="Medication name"
              style={{ padding: 8, borderRadius: 6, border: "1px solid #cbd5e1" }}
              required
            />
            <input
              name="symptom"
              value={adrForm.symptom}
              onChange={handleChange}
              placeholder="Symptom / Reaction"
              style={{ padding: 8, borderRadius: 6, border: "1px solid #cbd5e1" }}
              required
            />
            <select name="severity" value={adrForm.severity} onChange={handleChange} style={{ padding: 8 }}>
              <option>Mild</option>
              <option>Moderate</option>
              <option>Severe</option>
            </select>
            <button
              type="submit"
              style={{
                background: "#007bff",
                color: "#fff",
                padding: "8px 12px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
              }}
            >
              Submit ADR
            </button>
          </form>
        </div>

        <div style={{ background: darkMode ? "#071029" : "#f8fafc", padding: 12, borderRadius: 10 }}>
          <h4>🩺 Recent ADR Reports</h4>
          <input
            placeholder="Search ADRs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: 8, borderRadius: 6, width: "100%", marginBottom: 8 }}
          />
          {filteredReports.length === 0 ? (
            <p>No ADRs found.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {filteredReports.map((r) => (
                <li
                  key={r.id}
                  style={{
                    padding: 8,
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <strong>{r.medication}</strong> — {r.symptom}
                    <br />
                    <small>
                      {r.date} • <em>{r.severity}</em>
                    </small>
                  </div>
                  <button
                    onClick={() => handleDeleteADR(r.id)}
                    style={{ background: "transparent", border: "none", color: "red", cursor: "pointer" }}
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Medications Quick List */}
      <div style={{ marginTop: 20, maxWidth: 600 }}>
        <h4>🗒️ Your medications (quick access)</h4>
        {medications.length === 0 ? (
          <p>No medications added yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {medications.map((m) => (
              <li
                key={m.id}
                style={{
                  padding: 8,
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{m.name}</strong> — {m.dosage}
                  <br />
                  <small>
                    {m.time || "time not set"} {m.taken ? `• Taken ${m.takenAt || ""}` : ""}
                  </small>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {!m.taken && (
                    <button
                      onClick={() => markAsTaken(m.id)}
                      style={{
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      Mark taken
                    </button>
                  )}
                  <button
                    onClick={() => deleteMedication(m.id)}
                    style={{ background: "transparent", border: "none", color: "red", cursor: "pointer" }}
                  >
                    ❌
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <UpgradeModal show={showUpgrade} onClose={() => setShowUpgrade(false)} onUpgrade={handleUpgrade} />
    </div>
  );
};

export default Dashboard;
