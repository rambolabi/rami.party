/* ==========================================================================
   Tombstone service worker.
   --------------------------------------------------------------------------
   Breachlight moved from /workshop/breachlight/ to https://breach.labidi.eu/.

   The worker that used to live here was network-first, so most returning
   visitors reach the redirect page on their next load anyway. This tombstone
   covers the rest: installed-app users and anyone offline at the wrong
   moment. It installs, deletes the old breachlight caches, unregisters
   itself, and reloads any open window — which then reaches the redirect.

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

        /* Send any window still showing the stale copy back through the
           network, where the redirect page is waiting. */
        try {
            const windows = await self.clients.matchAll({ type: 'window' });
            windows.forEach(c => { try { c.navigate(c.url); } catch (e) { } });
        } catch (e) { }
    })());
});
