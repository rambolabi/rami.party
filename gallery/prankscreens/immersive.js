/* ==========================================================================
   Prank Screens — immersive guard (shared)
   Swallows stray key presses so a random keystroke can't scroll, reload or
   navigate away and shatter the illusion — Escape and F11 included, since the
   viewer is told up front and always has other ways to leave the page.

   It only prevents the browser's *default* action — it never stops events
   from reaching each screen's own script, so existing per-screen key/Esc
   handling keeps working.

   Escape pressed three times in a row (within 2s) is the escape hatch: it
   returns to the Prank Screens hub, so nobody is ever trapped on a screen
   with no visible way out. It leaves no visual trace, so the illusion is
   untouched.

   It also holds a screen wake lock, so the display never dims or locks while
   a screen is on show.
   Loaded by every screen under /gallery/prankscreens/<name>/.
   ========================================================================== */
(function () {
    'use strict';

    var hits = 0;
    var timer;

    window.addEventListener('keydown', function (e) {
        // Block default browser behaviour (space/arrow scroll, Backspace back,
        // Esc, F11, quick-find, single-key shortcuts, …) but let the event
        // bubble so each screen's own listeners still fire.
        e.preventDefault();

        if (e.key !== 'Escape') { hits = 0; clearTimeout(timer); return; }

        hits++;
        clearTimeout(timer);
        timer = setTimeout(function () { hits = 0; }, 2000);
        if (hits >= 3) window.location.href = '../';
    }, false);
})();

/* ==========================================================================
   Screen wake lock
   A display that dims or locks itself after five idle minutes shatters the
   illusion just as thoroughly as a stray keypress does, so hold a wake lock
   for as long as the screen is on show.
   Needs a secure context (https / localhost); unsupported browsers no-op.
   ========================================================================== */
(function () {
    'use strict';

    if (!('wakeLock' in navigator)) return;

    var sentinel = null;

    function acquire() {
        if (sentinel || document.visibilityState !== 'visible') return;
        navigator.wakeLock.request('screen').then(function (lock) {
            sentinel = lock;
            // The browser drops the lock whenever the tab is hidden or minimised.
            lock.addEventListener('release', function () { sentinel = null; });
        }).catch(armRetry);
    }

    // Some browsers refuse the request until the page has been interacted with.
    function armRetry() {
        window.addEventListener('pointerdown', retry, { once: true, capture: true });
        window.addEventListener('keydown', retry, { once: true, capture: true });
    }

    function retry() {
        window.removeEventListener('pointerdown', retry, true);
        window.removeEventListener('keydown', retry, true);
        acquire();
    }

    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') acquire();
    });

    acquire();
})();
