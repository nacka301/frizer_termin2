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
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        // If it's an API request and we're offline, return offline message
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
