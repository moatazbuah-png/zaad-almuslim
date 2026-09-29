const CACHE_NAME = 'zaad-almuslim-v5';
const APP_SHELL = [
  './', './index.html', './style.css', './script.js', './manifest.webmanifest', './data/content.json', './data/quran.json', './icons/icon.svg',
  './js/app.js', './js/bootstrap.js', './js/content.js', './js/offline.js', './js/search.js', './js/security.js', './js/pwa.js',
  './js/core/errors.js', './js/core/state.js', './js/core/storage.js',
  './js/features/adhkar.js', './js/features/hadith.js', './js/features/prayer.js', './js/features/quran.js', './js/features/search.js', './js/features/settings.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => Promise.allSettled(APP_SHELL.map(url => cache.add(url)))));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put('./index.html', response.clone()));
      return response;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(request).then(cached => {
    const network = fetch(request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
      return response;
    }).catch(() => cached || Response.error());
    return cached || network;
  }));
});
