import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Auth Components
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";

// Core Components
import Dashboard from "./components/Dashboard";
import MedicationList from "./components/MedicationList";
import MedicationForm from "./components/MedicationForm";
import ADRForm from "./components/ADRForm";
import PharmacyFinder from "./components/PharmacyFinder";

// Pages
import PaymentPage from "./pages/PaymentPage.jsx";
import Premium from "./pages/Premium.jsx";
import Upgrade from "./pages/Upgrade.jsx";

const App = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  React.useEffect(() => {
    const savedLang = localStorage.getItem("language") || "en";
    i18n.changeLanguage(savedLang);
  }, []);

  return (
    <Router>
      <div className="app">
        {/* 🌐 Language Toggle */}
        <div style={{ textAlign: "right", padding: "0.5rem 1rem" }}>
          <select
            onChange={(e) => changeLanguage(e.target.value)}
            defaultValue={i18n.language}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              cursor: "pointer",
              backgroundColor: "#fff",
            }}
          >
            <option value="en">English 🇬🇧</option>
            <option value="yo">Yorùbá 🗣️</option>
          </select>
        </div>

        {/* Navigation Bar */}
        <nav style={{ marginBottom: "1rem", textAlign: "center" }}>
          <Link to="/">Login</Link> |{" "}
          <Link to="/signup">Signup</Link> |{" "}
          <Link to="/dashboard">Dashboard</Link> |{" "}
          <Link to="/medications">Medications</Link> |{" "}
          <Link to="/adr">ADR Form</Link> |{" "}
          <Link to="/pharmacy-finder">Pharmacy Finder</Link> |{" "}
          <Link to="/upgrade">Upgrade</Link>
        </nav>

        {/* App Routes */}
        <Routes>
          {/* Auth */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Core */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/medications" element={<MedicationList />} />
          <Route path="/adr" element={<ADRForm />} />
          <Route path="/pharmacy-finder" element={<PharmacyFinder />} />

          {/* Premium Upgrade Flow */}
          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/payment" element={<PaymentPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
