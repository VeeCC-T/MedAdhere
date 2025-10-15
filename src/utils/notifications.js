// src/utils/notifications.js
// Lightweight notifications scheduler for MedAdhere
// - scheduleNotification(med) -> schedules next occurrence (today or tomorrow)
// - schedulePendingNotifications() -> schedules all meds stored in localStorage
// - requestPermission() -> asks user to grant notifications

export async function requestPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (err) {
    console.warn("Notification permission request failed:", err);
    return Notification.permission || "default";
  }
}

function showInPageNotification(title, options) {
  // fallback alert if notifications are blocked or not available
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, options);
    } else {
      // simple fallback UI
      // eslint-disable-next-line no-alert
      alert(`${title}\n\n${options && options.body ? options.body : ""}`);
    }
  } catch (err) {
    console.error("showInPageNotification error:", err);
  }
}

async function showNotificationCrossContext(title, options) {
  // Try service worker first (for installed PWA), else page Notification
  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        return reg.showNotification(title, options);
      }
    }
  } catch (err) {
    console.warn("SW showNotification failed:", err);
  }
  // fallback to page
  return showInPageNotification(title, options);
}

// store timeouts (so we can clear duplicates)
window.__medAdhereTimers = window.__medAdhereTimers || {};

export async function scheduleNotification(med) {
  // med: { id, name, dosage, time: "HH:MM" }
  if (!med || !med.id || !med.time) return;

  await requestPermission();

  // compute target Date for next occurrence
  const [hh, mm] = med.time.split(":").map((s) => parseInt(s, 10));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return;

  const now = new Date();
  let target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0);

  // if target already passed for today, schedule next day
  if (target.getTime() <= now.getTime()) {
    target = new Date(target.getTime() + 24 * 60 * 60 * 1000);
  }

  const delay = target.getTime() - now.getTime();

  // clear existing timeout for this med
  if (window.__medAdhereTimers[med.id]) {
    clearTimeout(window.__medAdhereTimers[med.id]);
  }

  const timeoutId = setTimeout(async () => {
    const title = "Medication Reminder 💊";
    const body = `${med.name} — ${med.dosage || ""}`.trim();
    await showNotificationCrossContext(title, { body, tag: `med-${med.id}`, renotify: true });

    // after firing, reschedule for next day automatically (repeat daily reminders)
    // read latest med from storage (in case it's deleted)
    try {
      const meds = JSON.parse(localStorage.getItem("medications")) || [];
      const found = meds.find((m) => m.id === med.id);
      if (found) {
        // schedule next day's reminder
        scheduleNotification(found);
      }
    } catch (err) {
      console.warn("Failed to reschedule after trigger:", err);
    }
  }, delay);

  window.__medAdhereTimers[med.id] = timeoutId;
  return timeoutId;
}

// schedule all pending meds (call on app load)
export function schedulePendingNotifications() {
  try {
    const meds = JSON.parse(localStorage.getItem("medications")) || [];
    meds.forEach((m) => {
      if (m && m.time) scheduleNotification(m).catch(() => {});
    });
  } catch (err) {
    console.warn("schedulePendingNotifications error:", err);
  }
}

// utility to cancel scheduled timer (used when deleting)
export function cancelScheduledNotification(medId) {
  if (window.__medAdhereTimers && window.__medAdhereTimers[medId]) {
    clearTimeout(window.__medAdhereTimers[medId]);
    delete window.__medAdhereTimers[medId];
  }
}
