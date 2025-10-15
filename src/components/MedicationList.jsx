import React, { useState, useEffect } from "react";
import MedicationForm from "./MedicationForm";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { generateICS, downloadICS } from "../utils/ics";
import { useNavigate } from "react-router-dom";
import { queueAction, syncQueuedActions } from "../utils/offlineQueue"; // ✅ added

const MedicationList = () => {
  const [medications, setMedications] = useState([]);
  const [adherence, setAdherence] = useState(0);
  const [adherenceHistory, setAdherenceHistory] = useState({});
  const [plan, setPlan] = useState("free");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const navigate = useNavigate();

  // Load saved data
  useEffect(() => {
    const savedMeds = JSON.parse(localStorage.getItem("medications")) || [];
    const savedHistory = JSON.parse(localStorage.getItem("adherenceHistory")) || {};
    const savedPlan = localStorage.getItem("plan") || "free";

    setMedications(savedMeds);
    setAdherenceHistory(savedHistory);
    setPlan(savedPlan);
  }, []);

  // Save when medications change
  useEffect(() => {
    localStorage.setItem("medications", JSON.stringify(medications));
    localStorage.setItem("adherenceHistory", JSON.stringify(adherenceHistory));
    calculateAdherence();
  }, [medications]);

  // ✅ Auto-sync when device goes online
  useEffect(() => {
    const handleOnline = () => {
      console.log("🔁 Back online — syncing queued medication data...");
      syncQueuedActions();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Smart reminders every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;

      medications.forEach((med) => {
        if (med.time === currentTime && !med.taken) {
          showReminder(med);

          // Repeat after 30 min if untaken
          setTimeout(() => {
            const refreshed = JSON.parse(localStorage.getItem("medications")) || [];
            const stillUntaken = refreshed.find((m) => m.id === med.id && !m.taken);
            if (stillUntaken) {
              showReminder(med, true);
            }
          }, 1800000);
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [medications]);

  const showReminder = (med, isRepeat = false) => {
    const msg = isRepeat
      ? `⏰ Reminder: You still haven't taken ${med.name} (${med.dosage})`
      : `It's time to take your ${med.name} (${med.dosage})`;

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Medication Reminder 💊", { body: msg });
    } else {
      alert(msg);
    }
  };

  // ✅ Add medication (offline-safe)
  const addMedication = async (med) => {
    if (plan === "free" && medications.length >= 3) {
      alert("You’ve reached your free limit. Upgrade to Premium for unlimited access!");
      setShowUpgrade(true);
      return;
    }

    const newMed = { ...med, taken: false, id: Date.now() };
    const updatedList = [...medications, newMed];
    setMedications(updatedList);

    const payload = { type: "medication", data: newMed, timestamp: Date.now() };

    try {
      if (!navigator.onLine) {
        await queueAction(payload);
        alert("You’re offline. Medication saved locally and will sync when back online.");
      } else {
        await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        console.log("Medication synced successfully.");
      }
    } catch (err) {
      console.error("Error syncing medication:", err);
    }
  };

  const markAsTaken = async (id) => {
    const updated = medications.map((med) =>
      med.id === id ? { ...med, taken: true, takenAt: new Date().toLocaleTimeString() } : med
    );
    setMedications(updated);
    updateDailyAdherence(updated);

    const payload = { type: "markTaken", data: { id }, timestamp: Date.now() };

    try {
      if (!navigator.onLine) {
        await queueAction(payload);
      } else {
        await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    } catch (err) {
      console.error("Error syncing markAsTaken:", err);
    }
  };

  const updateDailyAdherence = (updatedMeds) => {
    const today = new Date().toLocaleDateString();
    const allowedMeds = plan === "free" ? updatedMeds.slice(0, 3) : updatedMeds;

    const takenCount = allowedMeds.filter((m) => m.taken).length;
    const total = allowedMeds.length;
    const percent = total === 0 ? 0 : Math.round((takenCount / total) * 100);

    const updatedHistory = { ...adherenceHistory, [today]: percent };
    setAdherenceHistory(updatedHistory);
    setAdherence(percent);

    localStorage.setItem("adherenceHistory", JSON.stringify(updatedHistory));

    if (percent === 100) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🎉 Excellent!", {
          body: "You’ve taken all your meds for today. Keep it up!",
        });
      } else {
        alert("🎉 You’ve taken all your meds for today. Keep it up!");
      }
    }
  };

  const deleteMedication = async (id) => {
    const filtered = medications.filter((med) => med.id !== id);
    setMedications(filtered);
    updateDailyAdherence(filtered);

    const payload = { type: "deleteMedication", data: { id }, timestamp: Date.now() };

    try {
      if (!navigator.onLine) {
        await queueAction(payload);
      } else {
        await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    } catch (err) {
      console.error("Error syncing delete:", err);
    }
  };

  const calculateAdherence = () => {
    if (medications.length === 0) {
      setAdherence(0);
      return;
    }
    const takenCount = medications.filter((m) => m.taken).length;
    const percent = Math.round((takenCount / medications.length) * 100);
    setAdherence(percent);
  };

  const handleExportICS = () => {
    if (medications.length === 0) return alert("No medications to export.");
    const icsText = generateICS(medications, 30);
    downloadICS(icsText);
  };

  const handleUpgrade = () => {
    localStorage.setItem("plan", "premium");
    setPlan("premium");
    setShowUpgrade(false);
    alert("🎉 Upgrade successful! You’re now on the Premium plan.");
    navigate("/premium");
  };

  const chartData = Object.entries(adherenceHistory).map(([date, percent]) => ({
    date,
    percent,
  }));

  return (
    <div style={{ padding: "1rem" }}>
      <h2>My Medications 💊</h2>
      <p>
        <strong>Adherence Rate:</strong> {adherence}% ✅
      </p>

      {plan === "free" && (
        <p style={{ color: "gray", marginBottom: "10px" }}>
          Free plan usage: {medications.length}/3 medications used
        </p>
      )}

      {plan === "free" && medications.length >= 3 && (
        <div
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeeba",
            color: "#856404",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        >
          ⚠️ You’ve reached your free plan limit (3 medications).{" "}
          <button
            onClick={() => navigate("/premium")}
            style={{
              background: "#28a745",
              color: "#fff",
              border: "none",
              padding: "6px 12px",
              borderRadius: "5px",
              cursor: "pointer",
              marginLeft: "10px",
            }}
          >
            Upgrade Now
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
        <button
          onClick={handleExportICS}
          style={{
            backgroundColor: "#6f42c1",
            color: "#fff",
            border: "none",
            padding: "8px 12px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Export .ics (30 days)
        </button>

        <button
          onClick={() => {
            if (confirm("Clear all medications?")) {
              setMedications([]);
              localStorage.removeItem("medications");
            }
          }}
          style={{
            backgroundColor: "#dc3545",
            color: "#fff",
            border: "none",
            padding: "8px 12px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Clear All
        </button>
      </div>

      <MedicationForm onAddMedication={addMedication} />

      {chartData.length > 0 && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1rem",
            margin: "1rem 0",
          }}
        >
          <h3>📊 Adherence Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="percent" stroke="#007bff" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {medications.length === 0 ? (
          <p>No medications added yet.</p>
        ) : (
          medications.map((med) => (
            <li
              key={med.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "10px",
                margin: "10px 0",
                backgroundColor: med.taken ? "#e8f5e9" : "#fff",
              }}
            >
              <strong>{med.name}</strong> — {med.dosage} at {med.time}
              {med.taken && (
                <span style={{ color: "green", marginLeft: "10px" }}>
                  ✔ Taken at {med.takenAt}
                </span>
              )}
              <br />
              {!med.taken && (
                <button
                  onClick={() => markAsTaken(med.id)}
                  style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginTop: "5px",
                    marginRight: "5px",
                  }}
                >
                  Mark as Taken
                </button>
              )}
              <button
                onClick={() => deleteMedication(med.id)}
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginTop: "5px",
                }}
              >
                Delete
              </button>
            </li>
          ))
        )}
      </ul>

      {showUpgrade && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "10px",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            <h3>Upgrade to Premium 💳</h3>
            <p>Free plan allows only 3 medications. Upgrade for unlimited access!</p>
            <button
              onClick={handleUpgrade}
              style={{
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                padding: "10px 15px",
                borderRadius: "5px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              Upgrade Now
            </button>
            <button
              onClick={() => setShowUpgrade(false)}
              style={{
                backgroundColor: "#dc3545",
                color: "#fff",
                border: "none",
                padding: "10px 15px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationList;
