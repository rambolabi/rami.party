/* ==========================================================================
   O.A.S.I.S. — service worker
   --------------------------------------------------------------------------
   The whole point of this system is that it works with the cable cut, so the
   strategy is CACHE FIRST for the shell, with a quiet background refresh
   (stale-while-revalidate). You get an instant, guaranteed-offline load, and
   the next visit has any update.

   There is nothing to fetch from anywhere else — this worker never talks to a
   third-party origin, and it deliberately ignores any request that is not to
   its own scope.

   Bump CACHE whenever SHELL changes.
   ========================================================================== */

const CACHE = 'oasis-v1';

const SHELL = [
    './',
    './index.html',
    './style.css',
    './geo.js',
    './data-knowledge.js',
    './data-reference.js',
    './tools.js',
    './app.js',
    './manifest.webmanifest',
];

/**
 * Add anything missing from the cache.
 *
 * This is deliberately not "cache.addAll" in `install` and nothing else.
 * `install` runs exactly once per worker version, so a first visit on a
 * flaky connection would otherwise leave a half-empty cache forever — and
 * the user would find out about it in the worst possible circumstances.
 * So: re-check on install, on activate, and whenever the page asks.
 */
async function fillCache() {
    const cache = await caches.open(CACHE);
    const base = self.location.href;
    const have = new Set((await cache.keys()).map(r => new URL(r.url).pathname));
    const missing = SHELL.filter(u => !have.has(new URL(u, base).pathname));
    if (!missing.length) return 0;
    /* One failed file must not sink the whole operation. */
    await Promise.allSettled(missing.map(u => cache.add(new Request(u, { cache: 'reload' }))));
    return missing.length;
}

self.addEventListener('install', event => {
    event.waitUntil(fillCache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(fillCache)
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    const scope = new URL('./', self.location.href).pathname;
    if (url.origin !== self.location.origin) return;      // never proxy anything external
    if (!url.pathname.startsWith(scope)) return;

    event.respondWith(
        caches.match(req, { ignoreSearch: true }).then(hit => {
            const network = fetch(req).then(res => {
                if (res && res.ok && res.type === 'basic') {
                    const copy = res.clone();
                    caches.open(CACHE).then(c => c.put(req, copy));
                }
                return res;
            }).catch(() => null);

            /* Cache first: instant, and correct with no connection at all. */
            if (hit) {
                try { event.waitUntil(network); } catch (e) { /* lifetime already settled */ }
                return hit;
            }

            return network.then(res => res || caches.match('./index.html'));
        })
    );
});

/* The "Cache everything now" button in the app sends this. */
self.addEventListener('message', event => {
    if (!event.data || event.data.type !== 'PRECACHE') return;
    event.waitUntil(fillCache());
});
