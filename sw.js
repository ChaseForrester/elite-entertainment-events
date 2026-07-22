/* ═══════════════════════════════════════════════════
   ELITE ENTERTAINMENT — PWA Service Worker
═══════════════════════════════════════════════════ */

const CACHE_NAME = 'elite-events-v78-roving-order';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './admin.html',
  './category-djs-karaoke.html',
  './category-specialty.html',
  './category-multicultural.html',
  './category-live-bands.html',
  './categories-data.js',
  './category-page.js',
  './category-form.js',
  './artists-bands.html',
  './artists-djs.html',
  './artists-duo.html',
  './artists-jazz.html',
  './artists-solo.html',
  './artists-tributes.html',
  './corporate.html',
  './event-djs.html',
  './event-packages-data.js',
  './event-packages.js',
  './event-packages.css',
  './luxury-car-hire.html',
  './luxury-yacht-hire.html',
  './models-dancers.html',
  './private-parties.html',
  './security.html',
  './solo-duo.html',
  './tribute-shows.html',
  './trios-bands.html',
  './weddings.html',
  './style.css',
  './script.js',
  './cms.js',
  './service-form.js',
  './service-form.css',
  './site-nav.js',
  './manifest.webmanifest',
  './favicon.ico',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './images/brand/logo-icon.png',
  './images/brand/logo-nav-icon.png',
  './images/brand/logo-loading.png',
  './images/brand/logo-footer.png',
  './images/party-band.jpg',
  './images/trio.jpg',
  './images/duo.jpg',
  './images/solo.jpg',
  './images/categories/djs-karaoke.png',
  './images/categories/specialty-family.png',
  './images/categories/multicultural-country-comedy.png',
  './images/categories/live-bands-stage.png',
  './images/artists/wiggles.jpg'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching offline assets');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.warn('[SW] Pre-cache warning:', err));
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting stale cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network First with Cache Fallback for dynamic updates
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache valid HTTP response clone
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('./index.html');
          }
        });
      })
  );
});
