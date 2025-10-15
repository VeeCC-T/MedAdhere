// src/utils/ics.js
function pad(n) {
  return String(n).padStart(2, "0");
}

function formatDateForICS(date) {
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

function uidForEvent(med, dayIndex) {
  return `${med.id}-${dayIndex}@medadherence.local`;
}

function escapeText(txt = "") {
  return txt.replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function generateICS(medications = [], days = 30) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MedAdhere//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  const now = new Date();

  medications.forEach((med) => {
    const [hh, mm] = (med.time || "09:00").split(":").map((s) => parseInt(s, 10));

    for (let d = 0; d < days; d++) {
      const eventDate = new Date(now);
      eventDate.setDate(now.getDate() + d);
      eventDate.setHours(hh, mm, 0, 0);

      const dtstamp = formatDateForICS(new Date());
      const dtstart = formatDateForICS(eventDate);
      const endDate = new Date(eventDate.getTime() + 15 * 60 * 1000);

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${uidForEvent(med, d)}`);
      lines.push(`DTSTAMP:${dtstamp}`);
      lines.push(`DTSTART:${dtstart}`);
      lines.push(`DTEND:${formatDateForICS(endDate)}`);
      lines.push(`SUMMARY:${escapeText(`${med.name} — ${med.dosage}`)}`);
      lines.push(`DESCRIPTION:${escapeText(`Medication reminder: ${med.name} — ${med.dosage}`)}`);
      lines.push("END:VEVENT");
    }
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadICS(icsText, filename = "medadherence_schedule.ics") {
  const blob = new Blob([icsText], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
