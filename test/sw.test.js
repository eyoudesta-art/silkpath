// Service-worker behaviour, tested against a mocked worker environment (works in Node and in test/run.html).
const IN_NODE_SW = typeof module === 'object' && module.exports;
let swTest, swAssert, loadSw;
if (IN_NODE_SW) {
  swTest = require('node:test'); swAssert = require('node:assert');
  loadSw = async () => require('node:fs').readFileSync(require('node:path').join(__dirname, '../public/sw.js'), 'utf8');
} else {
  swTest = window.__test; swAssert = window.__assert;
  loadSw = async () => (await fetch('../public/sw.js', { cache: 'no-store' })).text();
}

async function makeWorker(fetchImpl) {
  const src = await loadSw();
  const store = new Map(); // cache name -> Map(url -> response)
  const norm = (r) => new URL(typeof r === 'string' ? r : r.url, 'https://x.test/').href;
  const cacheObj = (name) => ({
    addAll: async (urls) => { const m = store.get(name) || new Map(); urls.forEach((u) => m.set(norm(u), { ok: true, url: norm(u), clone() { return this; } })); store.set(name, m); },
    put: async (req, res) => { const m = store.get(name) || new Map(); m.set(norm(req), res); store.set(name, m); }
  });
  const caches = {
    open: async (name) => { if (!store.has(name)) store.set(name, new Map()); return cacheObj(name); },
    keys: async () => [...store.keys()],
    delete: async (n) => store.delete(n),
    match: async (req) => { for (const m of store.values()) { const hit = m.get(norm(req)); if (hit) return hit; } return undefined; }
  };
  const handlers = {}; const state = { skipped: false, claimed: false };
  const self = { addEventListener: (t, f) => { handlers[t] = f; }, skipWaiting: () => { state.skipped = true; return Promise.resolve(); }, clients: { claim: () => { state.claimed = true; return Promise.resolve(); } } };
  const fetchFn = (req) => fetchImpl(req);
  new Function('self', 'caches', 'fetch', 'location', 'URL', src)(self, caches, fetchFn, { origin: 'https://x.test' }, URL);
  const run = async (type, extra) => { let p; await handlers[type](Object.assign({ waitUntil: (x) => { p = x; }, respondWith: (x) => { p = x; p.__responded = true; } }, extra)); return p; };
  return { store, caches, handlers, state, run, norm };
}
const ok = (url) => ({ ok: true, url, clone() { return this; }, tag: 'network' });

swTest('sw: install precaches every CORE file and activates immediately', async () => {
  const w = await makeWorker(async () => ok('x'));
  await w.run('install');
  const names = [...w.store.keys()];
  swAssert.strictEqual(names.length, 1);
  swAssert.ok(names[0].startsWith('silkpath-'));
  const cached = [...w.store.get(names[0]).keys()];
  ['index.html', 'js/app.js', 'js/data.js', 'js/engine.js', 'styles.css', 'manifest.webmanifest', 'fonts/archivo-0.woff2'].forEach((f) => swAssert.ok(cached.includes('https://x.test/' + f), 'precached ' + f));
  swAssert.strictEqual(w.state.skipped, true);
});

swTest('sw: activate deletes old silkpath caches only', async () => {
  const w = await makeWorker(async () => ok('x'));
  await w.run('install');
  await w.caches.open('silkpath-old-build'); await w.caches.open('someone-elses-cache');
  await w.run('activate');
  const names = await w.caches.keys();
  swAssert.ok(!names.includes('silkpath-old-build'), 'old cache removed');
  swAssert.ok(names.includes('someone-elses-cache'), 'foreign cache untouched');
  swAssert.strictEqual(w.state.claimed, true);
});

swTest('sw: ignores non-GET and cross-origin requests', async () => {
  const w = await makeWorker(async () => ok('x'));
  const a = await w.run('fetch', { request: { method: 'POST', url: 'https://x.test/js/data.js' } });
  const b = await w.run('fetch', { request: { method: 'GET', url: 'https://other.test/js/data.js' } });
  swAssert.ok(!a && !b, 'respondWith must not be called');
});

swTest('sw: network-first serves fresh data and refreshes the cache', async () => {
  const w = await makeWorker(async (req) => ({ ok: true, url: req.url, clone() { return this; }, tag: 'fresh' }));
  await w.run('install');
  const res = await (await w.run('fetch', { request: { method: 'GET', url: 'https://x.test/js/data.js' } }));
  swAssert.strictEqual(res.tag, 'fresh');
  await new Promise((r) => setTimeout(r, 20));
  const cached = await w.caches.match('js/data.js');
  swAssert.strictEqual(cached.tag, 'fresh', 'cache updated with the fresh copy');
});

swTest('sw: offline falls back to the cached copy, and to index.html for unknown pages', async () => {
  const w = await makeWorker(async () => { throw new Error('offline'); });
  await w.run('install');
  const data = await (await w.run('fetch', { request: { method: 'GET', url: 'https://x.test/js/data.js' } }));
  swAssert.strictEqual(data.url, 'https://x.test/js/data.js');
  const nav = await (await w.run('fetch', { request: { method: 'GET', url: 'https://x.test/some/unknown/page' } }));
  swAssert.strictEqual(nav.url, 'https://x.test/index.html', 'app shell served for navigation offline');
});

swTest('sw: images and fonts are cache-first (no network when cached)', async () => {
  let hits = 0;
  const w = await makeWorker(async () => { hits++; return ok('x'); });
  await w.run('install');
  await (await w.run('fetch', { request: { method: 'GET', url: 'https://x.test/fonts/archivo-0.woff2' } }));
  swAssert.strictEqual(hits, 0, 'served from cache without touching the network');
});
