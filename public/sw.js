// Aktiviraj novu verziju odmah
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('install', (event) => {
  self.skipWaiting();
});
// Service Worker for offline support
const CACHE_NAME = 'frizerke-salon-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/rezervacija.html',
  '/privacy-policy.html',
  '/terms-of-service.html',
  '/style_simple.css',
  '/script.js',
  '/rezervacija.js',
  '/loading.js',
  '/cookie-consent.js',
  'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css',
  'https://cdn.jsdelivr.net/npm/flatpickr'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
// Za HTML datoteke uvijek dohvaćaj svježu verziju s mreže
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'document' || event.request.url.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Po želji: update cache
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        if (event.request.url.includes('/api/')) {
          return fetch(event.request).catch(() => {
            return new Response(JSON.stringify({
              error: 'Trenutno ste offline. Molimo pokušajte ponovo kada se povežete na internet.'
            }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        }
        return fetch(event.request);
      })
  );
});
