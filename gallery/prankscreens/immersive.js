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

/* ==========================================================================
   Holding on to fullscreen
   A browser will never let a page block Escape outright, and it should not.
   What it does offer is the Keyboard Lock API: while the page is fullscreen,
   navigator.keyboard.lock(['Escape']) routes Escape to the page as an
   ordinary keydown instead of dropping out of fullscreen. The way out then
   becomes press-and-HOLD Escape, which the browser still enforces itself, so
   nobody can be trapped. Chrome and Edge on desktop support it; everywhere
   else this is a no-op and Escape behaves normally.

   Whatever happens, if fullscreen is lost the illusion still fills the whole
   window, and the next click quietly restores it.
   ========================================================================== */
(function () {
    'use strict';

    var kb = navigator.keyboard;
    var wanted = false;             // did the user ever ask for fullscreen?

    function inFullscreen() {
        return !!(document.fullscreenElement || document.webkitFullscreenElement);
    }

    function lockEscape() {
        if (!kb || !kb.lock) return;
        try { kb.lock(['Escape']).catch(function () { }); } catch (e) { }
    }

    function unlockEscape() {
        if (!kb || !kb.unlock) return;
        try { kb.unlock(); } catch (e) { }
    }

    function enter() {
        var el = document.documentElement;
        var req = el.requestFullscreen || el.webkitRequestFullscreen;
        if (!req) return;
        var p = req.call(el);
        if (p && p.catch) p.catch(function () { });
    }

    document.addEventListener('fullscreenchange', function () {
        if (inFullscreen()) {
            wanted = true;
            lockEscape();
        } else {
            unlockEscape();
        }
    });

    // Any per-screen script may have taken us fullscreen already.
    if (inFullscreen()) { wanted = true; lockEscape(); }

    // Escape drops fullscreen on browsers without keyboard lock; the next
    // click puts it back rather than leaving a half-broken illusion.
    window.addEventListener('pointerdown', function () {
        if (wanted && !inFullscreen()) enter();
    }, true);
})();
