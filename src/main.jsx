// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
import "./i18n"; // initialize translations
import { syncQueuedActions } from "./utils/offlineQueue"; // existing file you have
import { schedulePendingNotifications, requestPermission } from "./utils/notifications";

// Register service worker (if available) once on load
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((reg) => {
        console.log("✅ Service Worker registered with scope:", reg.scope);
      })
      .catch((err) => {
        console.warn("❌ Service Worker registration failed:", err);
      });
  });
}

// Listen for online event to sync any queued actions
window.addEventListener(
  "online",
  () => {
    console.log("🔁 Back online — syncing queued actions...");
    try {
      syncQueuedActions();
    } catch (err) {
      console.warn("syncQueuedActions failed:", err);
    }
  },
  false
);

// When the page loads, schedule pending notifications for saved meds.
// Also request permission proactively (so user sees a prompt early).
window.addEventListener("load", () => {
  // schedule notifications for meds in storage
  try {
    schedulePendingNotifications();
  } catch (err) {
    console.warn("schedulePendingNotifications error:", err);
  }

  // optionally request permission quietly (don't spam)
  requestPermission().catch(() => {});
});

// mount app
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(<App />);
