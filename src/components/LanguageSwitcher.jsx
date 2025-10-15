// src/components/LanguageSwitcher.jsx
import React, { useEffect, useState } from "react";
import i18n from "../i18n";

const LanguageSwitcher = () => {
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");

  const handleChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  // Ensure consistency if another component changes the language
  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    if (savedLang && savedLang !== language) {
      setLanguage(savedLang);
      i18n.changeLanguage(savedLang);
    }
  }, []);

  return (
    <div style={{ marginBottom: "10px" }}>
      <label htmlFor="language" style={{ marginRight: "8px" }}>🌐 Language:</label>
      <select id="language" value={language} onChange={handleChange}>
        <option value="en">English</option>
        <option value="yo">Yorùbá</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
