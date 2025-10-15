import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { queueAction, syncQueuedActions } from "../utils/offlineQueue"; // ✅ added

const ADRForm = () => {
  const [formData, setFormData] = useState({
    medicineName: "",
    symptoms: "",
    file: null,
  });
  const [adrReports, setAdrReports] = useState([]);
  const [plan, setPlan] = useState("free");
  const navigate = useNavigate();

  // Load ADR data and plan from storage
  useEffect(() => {
    const savedReports = JSON.parse(localStorage.getItem("adrReports")) || [];
    const savedPlan = localStorage.getItem("plan") || "free";
    setAdrReports(savedReports);
    setPlan(savedPlan);
  }, []);

  // Save to localStorage when updated
  useEffect(() => {
    localStorage.setItem("adrReports", JSON.stringify(adrReports));
  }, [adrReports]);

  // ✅ Automatically sync queued actions when back online
  useEffect(() => {
    const handleOnline = () => {
      console.log("🔁 Back online — syncing queued ADR reports...");
      syncQueuedActions();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  // Handle field change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Submit ADR form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Restrict free users to 3 reports
    if (plan === "free" && adrReports.length >= 3) {
      alert("You’ve reached your free limit. Upgrade to Premium for unlimited access!");
      navigate("/upgrade");
      return;
    }

    if (!formData.medicineName || !formData.symptoms) {
      alert("Please fill in all required fields.");
      return;
    }

    const newReport = {
      id: Date.now(),
      medicineName: formData.medicineName,
      symptoms: formData.symptoms,
      file: formData.file ? formData.file.name : null,
      date: new Date().toLocaleString(),
    };

    const payload = { type: "adr", data: newReport, timestamp: Date.now() };

    try {
      if (!navigator.onLine) {
        // ✅ Save locally for offline users
        await queueAction(payload);
        alert("You’re offline. ADR report saved locally and will sync when back online.");
      } else {
        // ✅ Simulate server sync (replace with your API endpoint)
        await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        alert("ADR report synced successfully!");
      }
    } catch (err) {
      console.error("ADR submission error:", err);
      alert("Something went wrong. Please try again later.");
    }

    setAdrReports([...adrReports, newReport]);
    setFormData({ medicineName: "", symptoms: "", file: null });
  };

  const deleteReport = (id) => {
    const filtered = adrReports.filter((r) => r.id !== id);
    setAdrReports(filtered);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>🧾 Report Adverse Drug Reaction (ADR)</h2>
      {plan === "free" && (
        <p style={{ color: "gray" }}>
          Free plan usage: {adrReports.length}/3 ADR reports
        </p>
      )}

      {plan === "free" && adrReports.length >= 3 && (
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
          ⚠️ You’ve reached your free plan limit (3 ADR reports).{" "}
          <button
            onClick={() => navigate("/upgrade")}
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

      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#fff",
          padding: "1rem",
          borderRadius: "8px",
          border: "1px solid #ddd",
          marginBottom: "1rem",
          maxWidth: "600px",
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <label>
            <strong>Medicine Name:</strong>
          </label>
          <input
            type="text"
            name="medicineName"
            value={formData.medicineName}
            onChange={handleChange}
            placeholder="Enter medicine name"
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
            required
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>
            <strong>Describe Symptoms:</strong>
          </label>
          <textarea
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            placeholder="Describe the side effects or reactions..."
            style={{
              width: "100%",
              height: "100px",
              padding: "8px",
              marginTop: "5px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              resize: "vertical",
            }}
            required
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>
            <strong>Attach Image/Document (Optional):</strong>
          </label>
          <input
            type="file"
            name="file"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "6px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              marginTop: "5px",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            padding: "10px 15px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Submit ADR Report
        </button>
      </form>

      <h3>📋 Submitted ADR Reports</h3>
      {adrReports.length === 0 ? (
        <p>No ADR reports yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {adrReports.map((report) => (
            <li
              key={report.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "10px",
                margin: "10px 0",
                backgroundColor: "#f9f9f9",
              }}
            >
              <strong>Medicine:</strong> {report.medicineName} <br />
              <strong>Symptoms:</strong> {report.symptoms} <br />
              {report.file && (
                <p>
                  <strong>Attachment:</strong> {report.file}
                </p>
              )}
              <small>📅 {report.date}</small>
              <br />
              <button
                onClick={() => deleteReport(report.id)}
                style={{
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  border: "none",
                  padding: "6px 10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginTop: "8px",
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ADRForm;
