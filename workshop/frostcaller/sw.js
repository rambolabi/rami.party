/* ==========================================================================
   Frostcaller — service worker
   --------------------------------------------------------------------------
   The whole point: this guide is read while you are standing in front of an
   air conditioner holding a USB cable, which is exactly where the Wi-Fi is
   worst. Cache the page and its tools so it opens with no connection at all.

   Strategy: **network first, cache as the fallback**, for everything.

   Cache-first is faster, and it is what this originally did — but it meant a
   reader who had visited once kept the old JavaScript until the second reload
   after every update. For a page whose whole job is to be correct about
   pin numbers and protocol names, silently serving yesterday's copy is worse
   than a few hundred milliseconds. Offline still works: if the network fails
   for any reason, the cached copy is served immediately.

   Bump CACHE when the file list below changes.
   ========================================================================== */

const CACHE = 'frostcaller-v11';

const SHELL = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './tools.js',
    './i18n.js',
    './i18n-writer.js',
    './text.js',
    './ui.js',
    './data-themes.js',
    './data-brands.js',
    './data-guide.js',
    './data-chapters.js',
    './diagrams.js',
    './planner.js',
    './writer/',
    './writer/index.html',
    './writer/style.css',
    './writer/app.js',
    './writer/flipper.js',
    './writer/lab.js',
    '../../theme.css',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE)
            /* One missing file must not sink the whole install. */
            .then(cache => Promise.allSettled(SHELL.map(url => cache.add(url))))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;   /* fonts and the like: leave alone */

    /* Share links carry their state in `?s=…`, and every distinct one would
       otherwise become its own cache entry — an unbounded pile of copies of the
       same document. Store one copy per path and ignore the query on the way
       back out; the page reads its own `?s=` from the address bar anyway. */
    const key = new Request(url.origin + url.pathname);

    event.respondWith(
        fetch(request)
            .then(res => {
                if (res && res.status === 200 && res.type === 'basic') {
                    const copy = res.clone();
                    caches.open(CACHE).then(c => c.put(key, copy));
                }
                return res;
            })
            .catch(() => caches.match(key, { ignoreSearch: true }).then(hit =>
                hit || (request.mode === 'navigate' ? caches.match('./index.html') : undefined)
            ))
    );
});
