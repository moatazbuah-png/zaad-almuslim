const CACHE_NAME = 'zaad-almuslim-v6';
const APP_SHELL = [
  './', './index.html', './style.css', './manifest.webmanifest',
  './data/content.json', './icons/icon.svg',
  './js/integration.js', './js/ui.js', './js/bootstrap.js', './js/content.js', './js/offline.js', './js/search.js', './js/security.js', './js/app.js',
  './js/core/state.js', './js/core/storage.js', './js/core/errors.js',
  './js/features/quran.js', './js/features/quran-data.js', './js/features/adhkar.js', './js/features/hadith.js', './js/features/search.js', './js/features/prayer.js', './js/features/settings.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
        }
        return response;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      });
      return cached || network.catch(() => new Response('', { status: 503, statusText: 'Offline' }));
    })
  );
});
