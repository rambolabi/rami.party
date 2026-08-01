/* ==========================================================================
   Tombstone service worker.
   --------------------------------------------------------------------------
   The Phonetic Alphabet Studio moved from /gallery/militaryalphabet/ to
   https://alphabet.labidi.eu/.

   The service worker that used to live here pre-cached the whole shell and
   served static assets stale-while-revalidate. That means a returning visitor
   — and everyone who installed it as an app — would keep being served the old
   copy out of their own storage and would never reliably see the redirect page
   sitting on the server, least of all offline, which is exactly how this tool
   was meant to be used.

   The browser fetches this script directly from the network rather than
   through the old worker, so replacing it is what actually breaks the loop.
   This installs, deletes the caches, unregisters itself, and reloads any open
   window — which then reaches the real redirect page.

   There is deliberately NO fetch handler. With none, requests bypass the
   worker entirely and go straight to the network.

   Only this app's own caches are deleted. `caches` is shared by the whole
   origin, and rami.party hosts other offline-capable pages — wiping the lot
   would break their offline mode as a side effect. Every cache this tool ever
   opened was named `pas-v<n>`.

   Do not delete this file. It has to outlive the caches on other people's
   devices, and there is no way to know when the last one is gone.
   ========================================================================== */

const OWN_CACHE = /^pas-/;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        try {
            const keys = await caches.keys();
            await Promise.all(keys.filter(k => OWN_CACHE.test(k)).map(k => caches.delete(k)));
        } catch (e) { /* storage may be unavailable; carry on regardless */ }

        try { await self.registration.unregister(); } catch (e) { }

        /* Send any window still showing the stale copy to the redirect page,
           preserving whatever address it was pointing at. */
        try {
            const windows = await self.clients.matchAll({ type: 'window' });
            windows.forEach(c => { try { c.navigate(c.url); } catch (e) { } });
        } catch (e) { }
    })());
});
