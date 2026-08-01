/* ==========================================================================
   Tombstone service worker.
   --------------------------------------------------------------------------
   Markdown Studio moved from /workshop/md/ to https://md.labidi.eu/.

   The service worker that used to live here was CACHE FIRST. That means every
   returning visitor — and everyone who installed it as an app — would keep
   being served the old copy out of their own storage and would never see the
   redirect page sitting on the server.

   The browser fetches this script directly from the network rather than
   through the old worker, so replacing it is what actually breaks the loop.
   This installs, deletes the caches, unregisters itself, and reloads any open
   window — which then reaches the real redirect page.

   There is deliberately NO fetch handler. With none, requests bypass the
   worker entirely and go straight to the network.

   Note: this only clears the Cache Storage entries this app created, and only
   unregisters itself. Both are shared by the whole rami.party origin, so a
   blanket wipe would take every other workshop app's offline copy with it.
   Documents live in localStorage and are left alone, so anyone who comes back
   can still export their work.

   Do not delete this file. It has to outlive the caches on other people's
   devices, and there is no way to know when the last one is gone.
   ========================================================================== */

const CACHE_PREFIX = 'md-studio';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        try {
            const keys = await caches.keys();
            await Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX)).map(k => caches.delete(k)));
        } catch (e) { /* storage may be unavailable; carry on regardless */ }

        try { await self.registration.unregister(); } catch (e) { }

        /* Send any window still showing the stale copy to the redirect page. */
        try {
            const windows = await self.clients.matchAll({ type: 'window' });
            windows.forEach(c => { try { c.navigate(c.url); } catch (e) { } });
        } catch (e) { }
    })());
});
