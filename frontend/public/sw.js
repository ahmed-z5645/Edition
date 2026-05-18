// Bump this on any deploy that must invalidate cached assets. The activate
// handler deletes every cache whose name !== CACHE_NAME, so changing it
// purges the previous release's cache (including the old "edition-v1").
const CACHE_NAME = "patches-v2";

// Only cache things that are safe to serve stale. Never precache HTML:
// cached document HTML references hashed JS chunk filenames, and after a
// deploy those point at a bundle the new build no longer ships — which
// strands clients on old code until they manually clear storage.
const PRECACHE_URLS = ["/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // API calls always go to the network (and to the correct origin).
  if (url.pathname.startsWith("/api/")) return;

  // Navigations / document requests: network-ONLY, never cached. This
  // guarantees a returning client always gets fresh HTML pointing at the
  // current build's chunk hashes, so deploys take effect immediately.
  const isNavigation =
    event.request.mode === "navigate" ||
    event.request.destination === "document";
  if (isNavigation) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Static assets (hashed JS/CSS, images): network-first, fall back to
  // cache only when offline. Hashed filenames change per build, so a
  // cached copy can never be a stale version of a current asset.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Patches", {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url ?? "/editor" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url ?? "/editor";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        for (const client of list) {
          if (new URL(client.url).pathname === target && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow(target);
      })
  );
});
