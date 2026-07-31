/* ==========================================================================
   Tombstone service worker.
   --------------------------------------------------------------------------
   O.A.S.I.S. moved from /workshop/OASIS/ to https://oasis.labidi.eu/.

   The service worker that used to live here was CACHE FIRST. That means every
   returning visitor — and everyone who installed it as an app — would keep
   being served the old copy out of their own storage and would never see the
   redirect page sitting on the server. They would be stranded on a frozen
   version of a system whose whole purpose is to be correct.

   The browser fetches this script directly from the network rather than
   through the old worker, so replacing it is what actually breaks the loop.
   This installs, deletes the caches, unregisters itself, and reloads any open
   window — which then reaches the real redirect page.

   There is deliberately NO fetch handler. With none, requests bypass the
   worker entirely and go straight to the network.

   Do not delete this file. It has to outlive the caches on other people's
   devices, and there is no way to know when the last one is gone.
   ========================================================================== */

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        try {
            const keys = await caches.keys();
            await Promise.all(keys.map(k => caches.delete(k)));
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
