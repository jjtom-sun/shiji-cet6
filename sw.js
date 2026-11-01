/* 拾级 · offline cache. Update CACHE_VERSION when shipping asset changes. */
const CACHE_VERSION = 'shiji-cet6-v1.2.3';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './DATA_SOURCES.md',
  './THIRD_PARTY_NOTICES.md',
  './assets/css/main.css',
  './assets/css/listening-real.css',
  './assets/img/logo.svg',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png',
  './assets/img/apple-touch-icon.png',
  './assets/js/core/utils.js',
  './assets/js/core/icons.js',
  './assets/js/core/store.js',
  './assets/js/core/charts.js',
  './assets/js/core/speech.js',
  './assets/js/core/engine.js',
  './assets/js/core/tutor.js',
  './assets/js/core/progress.js',
  './assets/js/data/vocab.data.js',
  './assets/js/data/vocab-more.data.js',
  './assets/js/data/vocab-listening.data.js',
  './assets/js/data/vocab-full.data.js',
  './assets/js/data/listening.data.js',
  './assets/js/data/listening-real.data.js',
  './assets/js/data/reading.data.js',
  './assets/js/data/reading-passages.data.js',
  './assets/js/data/writing.data.js',
  './assets/js/data/exam.data.js',
  './assets/js/views/dashboard.js',
  './assets/js/views/vocab.js',
  './assets/js/views/listening.js',
  './assets/js/views/listening-real.js',
  './assets/js/views/reading.js',
  './assets/js/views/writing.js',
  './assets/js/views/errors.js',
  './assets/js/views/mock.js',
  './assets/js/views/analytics.js',
  './assets/js/views/tutor-view.js',
  './assets/js/views/settings.js',
  './assets/js/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        return response;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
