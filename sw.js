// Offline shell. Bump CACHE when the app changes.
const CACHE = 'mood-tracker-v4';
const CORE = [
  './', './index.html', './app.css', './manifest.webmanifest',
  './js/app.js', './js/ui.js', './js/db.js', './js/icons.js', './js/moods.js',
  './js/editor.js', './js/stats.js', './js/archive.js', './js/profile.js', './js/labels.js', './js/sections.js',
  './assets/icons/index.json', './assets/img/icon-192.png', './assets/img/icon-512.png'
];

// Precache the shell, then every icon, so the whole picker works offline.
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(CORE);
    try {
      const list = await (await fetch('assets/icons/index.json')).json();
      await Promise.all(list.map(f => c.add('assets/icons/' + f).catch(() => {})));
    } catch { /* icons will be cached lazily instead */ }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;  // weather API always goes to the network
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => hit))
  );
});
