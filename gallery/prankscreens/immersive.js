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
