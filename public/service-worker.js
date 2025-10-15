const CACHE_NAME = "medadhere-cache-v3";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

// ✅ INSTALL: Pre-cache core app files
self.addEventListener("install", (event) => {
  console.log("🔧 Installing service worker and caching core assets...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// ✅ FETCH: Cache-first strategy with HTTP-only filter
self.addEventListener("fetch", (event) => {
  // Skip non-GET or non-HTTP(S) requests (e.g. chrome-extension://)
  if (
    event.request.method !== "GET" ||
    !event.request.url.startsWith("http")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Serve cached version if available
        return cachedResponse;
      }

      // Otherwise fetch from network
      return fetch(event.request)
        .then((networkResponse) => {
          // Only cache valid responses
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          // Clone and cache a copy
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Optional: return cached fallback if offline
          return caches.match("/index.html");
        });
    })
  );
});

// ✅ ACTIVATE: Clean up old caches
self.addEventListener("activate", (event) => {
  console.log("🧹 Activating service worker and cleaning old caches...");
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

console.log("✅ MedAdhere Service Worker loaded and ready.");
