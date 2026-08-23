/* Wattwarden service worker: network-first shell so the dashboard opens
   instantly on a wall tablet even when the network hiccups, without ever
   freezing visitors on a stale build. Meter traffic is cross-origin and
   never touched. Bump CACHE on every deploy. */
'use strict';

const CACHE = 'wattwarden-v3';
const SHELL = ['./', 'index.html', 'style.css?v=3', 'app.js?v=3', 'icon.svg', 'manifest.webmanifest'];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
    e.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter((k) => k.startsWith('wattwarden-') && k !== CACHE)
            .map((k) => caches.delete(k)));
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);
    // same-origin GETs inside this app's scope only; the meter and relay bypass the SW
    if (e.request.method !== 'GET' || url.origin !== location.origin
        || !url.pathname.startsWith(new URL('./', location).pathname)) return;
    e.respondWith((async () => {
        try {
            const fresh = await fetch(e.request);
            const cache = await caches.open(CACHE);
            cache.put(e.request, fresh.clone());
            return fresh;
        } catch {
            const hit = await caches.match(e.request, { ignoreSearch: false });
            return hit || Response.error();
        }
    })());
});
