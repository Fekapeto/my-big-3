const CACHE = 'big3-v1';
const ASSETS = [
  './my-big-3.html',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network-first for API calls, cache-first for everything else
  if (e.request.url.includes('api.anthropic.com')) {
    return; // Always network for AI calls
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
