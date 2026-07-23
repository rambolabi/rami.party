// sw.js — Laser Forge v2 service worker. Offline-first app shell, no tracking.
// Bump CACHE when any shell asset changes so clients update cleanly.
const CACHE = 'laserforge2-v1';
const SHELL = [
    './',
    './index.html',
    './style.css',
    './manifest.webmanifest',
    './js/main.js',
    './js/store.js',
    './js/artboard.js',
    './js/objects.js',
    './js/generators.js',
    './js/geometry.js',
    './js/exporters.js',
    './js/dither.js',
    './js/image.js',
    './js/trace.js',
    './js/qr.js',
    './js/barcode.js',
    './js/i18n.js',
    './js/tileeditor.js',
    './js/importers.js',
    './js/serial.js',
    './js/machine.js',
    './js/fs.js',
    './js/plugins.js',
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {
            // add individually so one missing optional file can't break install
            return Promise.all(SHELL.map((u) => c.add(u).catch(() => null)));
        })).then(() => self.skipWaiting()),
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim()),
    );
});

self.addEventListener('message', (e) => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', (e) => {
    const req = e.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    const sameOrigin = url.origin === self.location.origin;

    // Same-origin app assets: cache-first, fall back to network then cache it.
    if (sameOrigin) {
        e.respondWith(
            caches.match(req).then((hit) => hit || fetch(req).then((res) => {
                const copy = res.clone();
                caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
                return res;
            }).catch(() => caches.match('./index.html'))),
        );
        return;
    }

    // Cross-origin (e.g. Google Fonts): stale-while-revalidate so it works offline after first load.
    if (/fonts\.(googleapis|gstatic)\.com/.test(url.host)) {
        e.respondWith(
            caches.open(CACHE).then((c) => c.match(req).then((hit) => {
                const net = fetch(req).then((res) => { c.put(req, res.clone()).catch(() => {}); return res; }).catch(() => hit);
                return hit || net;
            })),
        );
    }
});
