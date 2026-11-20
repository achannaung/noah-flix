/* Noah-Flix service worker — network-first for the app shell so updates
   land immediately, cache-first for TMDB poster images, pass-through for
   API calls and third-party embed players. */
const CACHE = 'noahflix-shell-v1';
const SHELL = ['./', './index.html', './app1.js', './app2.js', './app3.js',
               './manifest.json', './icon.svg'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      Promise.allSettled(SHELL.map((u) => c.add(u)))
    )
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // TMDB images: cache-first (posters rarely change)
  if (url.hostname === 'image.tmdb.org') {
    e.respondWith(
      caches.match(e.request).then((hit) =>
        hit ||
        fetch(e.request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        }).catch(() => hit)
      )
    );
    return;
  }

  // Same-origin app files: network-first, cache fallback when offline
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request, { ignoreSearch: true }))
    );
    return;
  }

  // Everything else (TMDB API, proxies, embed players): pass through.
});
