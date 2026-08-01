/* ============================================================
   Phonetic Alphabet Studio — service worker
   The tool has to work offline (radio and aviation use is frequently out
   of signal) without ever pinning users to a stale build.

     · navigations  -> network first, cache fallback (fresh HTML when online)
     · static files -> stale-while-revalidate (instant, refreshed in the
                       background, so the next load already has the update)

   Bump CACHE when a shell file is added or renamed.
   ============================================================ */
const CACHE = "pas-v6";

const SHELL = [
    "./",
    "index.html",
    "style.css",
    "manifest.webmanifest",
    "icon.svg",
    "icon-maskable.svg",
    "js/core.js",
    "js/i18n.js",
    "js/lang/en.js",
    "js/lang/fr.js",
    "js/lang/nl.js",
    "js/data-alphabets.js",
    "js/data-reference.js",
    "js/speech.js",
    "js/wake.js",
    "js/translator.js",
    "js/grid.js",
    "js/quiz.js",
    "js/exporters.js",
    "js/ui-wake.js",
    "js/ui-translate.js",
    "js/ui-present.js",
    "js/ui.js",
    "js/app.js"
];

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE)
            .then(function (cache) { return cache.addAll(SHELL); })
            .then(function () { return self.skipWaiting(); })
    );
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys()
            .then(function (keys) {
                return Promise.all(keys.filter(function (k) { return k !== CACHE; })
                    .map(function (k) { return caches.delete(k); }));
            })
            .then(function () { return self.clients.claim(); })
    );
});

function cacheable(response) {
    return response && response.ok && response.type === "basic";
}

self.addEventListener("fetch", function (event) {
    const request = event.request;
    if (request.method !== "GET") { return; }
    if (new URL(request.url).origin !== self.location.origin) { return; }

    // Navigations: prefer the network so a new deploy is picked up at once.
    // ignoreSearch lets ?lang=fr and friends fall back to the cached page.
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).then(function (response) {
                if (cacheable(response)) {
                    const copy = response.clone();
                    caches.open(CACHE).then(function (cache) { cache.put("index.html", copy); });
                }
                return response;
            }).catch(function () {
                return caches.match(request, { ignoreSearch: true }).then(function (hit) {
                    return hit || caches.match("index.html");
                });
            })
        );
        return;
    }

    // Static assets: serve the cached copy at once, refresh it behind the scenes.
    event.respondWith(
        caches.match(request).then(function (hit) {
            const network = fetch(request).then(function (response) {
                if (cacheable(response)) {
                    const copy = response.clone();
                    caches.open(CACHE).then(function (cache) { cache.put(request, copy); });
                }
                return response;
            }).catch(function () { return hit; });
            return hit || network;
        })
    );
});
