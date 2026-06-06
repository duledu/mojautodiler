const CACHE_NAME = 'mad-app-shell-v2';
const APP_SHELL = [
  '/',
  '/sr',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-icon-192.png',
  '/icons/maskable-icon-512.png',
];

self.addEventListener('install', (event) => {
  // Use allSettled so a single 404 (e.g. an icon not yet deployed) does not
  // abort the install and leave the SW in a broken/deleted state.
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(APP_SHELL.map((url) => cache.add(url)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept non-GET requests
  if (request.method !== 'GET') return;

  // Never intercept API or admin routes
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) return;

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Navigation requests: network-first, fall back to cached shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/sr').then((cached) => cached ?? caches.match('/'))
      )
    );
    return;
  }

  // Static app-shell assets: cache-first
  if (APP_SHELL.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached ?? fetch(request))
    );
  }
});
