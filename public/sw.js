/* Silkpath service worker.
 * - App shell and data: network first (fees change), 4 s timeout, cache fallback so it works offline.
 * - Fonts, icons, images: cache first.
 * scripts/build.py stamps BUILD_ID so each deploy invalidates the old cache. */
const BUILD_ID = '__BUILD_ID__';
const CACHE = 'silkpath-' + BUILD_ID;
const CORE = ['./', 'index.html', 'styles.css', 'fonts/fonts.css', 'js/config.js', 'js/data.js', 'js/language.js', 'js/canada.js', 'js/institutions.js', 'js/engine.js', 'js/app.js', 'js/pwa.js',
  'fonts/archivo-0.woff2', 'fonts/ibm-plex-mono-1.woff2', 'fonts/ibm-plex-mono-2.woff2', 'fonts/ibm-plex-sans-3.woff2',
  'icons/icon.svg', 'icons/icon-192.png', 'manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('silkpath-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

function networkFirst(req) {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => { caches.match(req).then((hit) => { if (hit && !settled) { settled = true; resolve(hit); } }); }, 4000);
    fetch(req).then((res) => {
      clearTimeout(timer);
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      if (!settled) { settled = true; resolve(res); }
    }).catch(() => {
      clearTimeout(timer);
      caches.match(req).then((hit) => { if (!settled) { settled = true; resolve(hit || caches.match('index.html')); } });
    });
  });
}
function cacheFirst(req) {
  return caches.match(req).then((hit) => hit || fetch(req).then((res) => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  }));
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (/\.(woff2|png|svg|ico|webp)$/.test(url.pathname)) { e.respondWith(cacheFirst(req)); return; }
  e.respondWith(networkFirst(req));
});
