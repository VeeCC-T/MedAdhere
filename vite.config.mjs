import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Vite uses ESM modules, so this file must be named vite.config.mjs

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // Keeps the service worker fresh automatically
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        id: "/",
        short_name: "MedAdhere",
        name: "MedAdhere - Medication Adherence Tracker",
        description:
          "Track your medications, get reminders, and report adverse drug reactions even offline.",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        start_url: "/",
        display: "standalone",
        theme_color: "#007bff",
        background_color: "#ffffff",
        orientation: "portrait-primary",
        scope: "/",
        prefer_related_applications: false,
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*/i, // Cache any external requests if needed
            handler: "NetworkFirst",
            options: {
              cacheName: "external-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173, // default Vite port, can change if needed
  },
  build: {
    outDir: "dist",
  },
});
