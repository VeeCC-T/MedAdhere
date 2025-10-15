# MedAdhere — Medication Adherence PWA (MVP)

MedAdhere is a Progressive Web App (PWA) built as a 48-hour hackathon MVP to help patients track medication, get reminders, report side effects (ADR), and find nearby pharmacies. Designed for the African market with English and Yoruba support. Built with React + Vite and Firebase.

## Live demo
(Deploy your site and paste URL here)

## Features (MVP)
- Email/password signup & login (Firebase Auth)
- Medication CRUD (add/edit/delete)
- Mark doses as Taken / Missed (dose logs)
- Adherence dashboard (basic %)
- ADR reporting (symptom, severity, optional photo)
- Pharmacy finder (OpenStreetMap/Nominatim)
- PWA (manifest + service worker)
- i18n: English + Yoruba
- Monetization flags: `plan` field (free/premium/organization)
- Upgrade modal (Stripe test instructions + simulated upgrade)
- Offline cache + queued writes pattern (basic)

## Tech stack
- React + Vite
- Firebase Auth, Firestore, Storage
- i18next for localization
- OpenStreetMap / Nominatim for searching pharmacies
- Web Notification API + .ics export strategy for reminders

## Setup (local)
1. Clone repo
2. Install dependencies
```bash
npm install
