'use strict';

/* Sunseer service worker: network-first shell so a deploy can never freeze
   visitors on a stale build; cache-first for the versioned assets. */

const CACHE = 'sunseer-v5';
const ASSETS = [
    './',
    'index.html',
    'style.css?v=5',
    'app.js?v=5',
    'manifest.webmanifest',
    'icon.svg',
];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
    e.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter((k) => k.startsWith('sunseer-') && k !== CACHE).map((k) => caches.delete(k)));
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);
    if (e.request.method !== 'GET' || url.origin !== location.origin) return;
    if (e.request.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
        e.respondWith((async () => {
            try {
                const fresh = await fetch(e.request);
                (await caches.open(CACHE)).put('./', fresh.clone());
                return fresh;
            } catch {
                return (await caches.match('./')) || Response.error();
            }
        })());
        return;
    }
    e.respondWith((async () => {
        const hit = await caches.match(e.request);
        if (hit) return hit;
        const fresh = await fetch(e.request);
        if (fresh.ok) (await caches.open(CACHE)).put(e.request, fresh.clone());
        return fresh;
    })());
});
