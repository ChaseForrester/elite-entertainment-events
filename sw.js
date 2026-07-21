/* ═══════════════════════════════════════════════════
   ELITE ENTERTAINMENT — PWA Service Worker
═══════════════════════════════════════════════════ */

const CACHE_NAME = 'elite-events-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './admin.html',
  './artists-bands.html',
  './artists-djs.html',
  './artists-duo.html',
  './artists-jazz.html',
  './artists-solo.html',
  './artists-tributes.html',
  './multicultural.html',
  './comedians.html',
  './country.html',
  './children.html',
  './specialty.html',
  './roving.html',
  './corporate.html',
  './event-djs.html',
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
  './manifest.webmanifest',
  './favicon.ico',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './images/party-band.jpg',
  './images/trio.jpg',
  './images/duo.jpg',
  './images/solo.jpg',
  './images/artists/guy-sebastian.jpg',
  './images/artists/jessica-mauboy.jpg',
  './images/artists/ricki-lee.jpg',
  './images/artists/jason-owen.jpg',
  './images/artists/anh-do.jpg',
  './images/artists/george-kapiniaris.jpg',
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
