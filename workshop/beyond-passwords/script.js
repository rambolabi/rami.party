/* ==========================================================================
   Beyond Passwords — deck engine
   --------------------------------------------------------------------------
   One HTML file holds the whole talk; this script only decides how much of
   it is visible. Present mode shows a single .slide at a time and drives it
   with keys, clicker, touch or the corner buttons. Read mode is the same
   content as one scrollable page, which is also what printing uses.
   ========================================================================== */

(function () {
    'use strict';

    var K_THEME = 'beyond-passwords:theme';
    var THEMES = [
        { id: 'dark', name: 'Dark' },
        { id: 'light', name: 'Light' },
        { id: 'contrast', name: 'Contrast' }
    ];

    var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
    var counter = document.getElementById('counter');
    var fill = document.getElementById('progress-fill');
    var blackout = document.getElementById('blackout');
    var modeBtn = document.getElementById('mode-btn');
    var themeBtn = document.getElementById('theme-btn');
    var themeName = document.getElementById('theme-name');
    var fsBtn = document.getElementById('fs-btn');

    var current = 0;
    var presenting = true;

    /* ------------------------------------------------------------- slides */

    function go(n) {
        current = Math.max(0, Math.min(slides.length - 1, n));
        slides.forEach(function (s, i) {
            s.classList.toggle('active', i === current);
        });
        counter.textContent = (current + 1) + ' / ' + slides.length;
        fill.style.width = (((current + 1) / slides.length) * 100) + '%';
        if (history.replaceState) {
            history.replaceState(null, '', '#' + (current + 1));
        }
    }

    function next() { if (presenting) go(current + 1); }
    function prev() { if (presenting) go(current - 1); }

    function fromHash() {
        var n = parseInt(location.hash.slice(1), 10);
        go(isNaN(n) ? 0 : n - 1);
    }

    /* --------------------------------------------------------------- mode */

    function setMode(present) {
        presenting = present;
        document.body.dataset.mode = present ? 'present' : 'read';
        modeBtn.textContent = present ? '📖 Read' : '🎬 Present';
        modeBtn.title = present
            ? 'Switch to a single readable page'
            : 'Switch back to slides';
        if (present) {
            go(current);
            requestWakeLock();
        } else {
            releaseWakeLock();
            // land the reader on the slide that was showing
            var target = slides[current];
            if (target) target.scrollIntoView({ block: 'start' });
        }
    }

    /* ---------------------------------------------------------- wake lock */
    /* Keeps the screen on mid-talk; silently unsupported on some browsers. */

    var wakeLock = null;

    function requestWakeLock() {
        if (!('wakeLock' in navigator) || !presenting) return;
        if (document.visibilityState !== 'visible') return;
        navigator.wakeLock.request('screen').then(function (lock) {
            wakeLock = lock;
        }).catch(function () { /* denied or unsupported: harmless */ });
    }

    function releaseWakeLock() {
        if (wakeLock) {
            wakeLock.release().catch(function () { });
            wakeLock = null;
        }
    }

    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') requestWakeLock();
    });

    /* ---------------------------------------------------------------- keys */

    function onKey(e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        if (e.key === 'b' || e.key === 'B') {
            blackout.hidden = !blackout.hidden;
            e.preventDefault();
            return;
        }
        if (!blackout.hidden) {           // any other key wakes the screen
            blackout.hidden = true;
            return;
        }
        if (e.key === 'f' || e.key === 'F') {
            toggleFullscreen();
            e.preventDefault();
            return;
        }
        if (!presenting) return;

        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
            case 'PageDown':              // presenter clickers send these
            case ' ':
                next(); e.preventDefault(); break;
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
                prev(); e.preventDefault(); break;
            case 'Home':
                go(0); e.preventDefault(); break;
            case 'End':
                go(slides.length - 1); e.preventDefault(); break;
        }
    }

    function toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(function () { });
        } else {
            document.documentElement.requestFullscreen().catch(function () { });
        }
    }

    /* --------------------------------------------------------------- touch */

    var touchX = null;

    document.addEventListener('touchstart', function (e) {
        if (e.touches.length === 1) touchX = e.touches[0].clientX;
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
        if (touchX === null) return;
        var dx = e.changedTouches[0].clientX - touchX;
        touchX = null;
        if (Math.abs(dx) < 50) return;
        if (dx < 0) next(); else prev();
    }, { passive: true });

    /* --------------------------------------------------------------- theme */

    function applyTheme(id) {
        var t = null;
        for (var i = 0; i < THEMES.length; i++) {
            if (THEMES[i].id === id) { t = THEMES[i]; break; }
        }
        if (!t) t = THEMES[0];
        document.documentElement.setAttribute('data-theme', t.id);
        themeName.textContent = t.name;
        try { localStorage.setItem(K_THEME, t.id); } catch (err) { /* private mode */ }
    }

    function cycleTheme() {
        var cur = document.documentElement.getAttribute('data-theme');
        var idx = 0;
        for (var i = 0; i < THEMES.length; i++) {
            if (THEMES[i].id === cur) { idx = i; break; }
        }
        applyTheme(THEMES[(idx + 1) % THEMES.length].id);
    }

    /* ----------------------------------------------------------------- boot */

    document.getElementById('next-btn').addEventListener('click', next);
    document.getElementById('prev-btn').addEventListener('click', prev);
    modeBtn.addEventListener('click', function () { setMode(!presenting); });
    themeBtn.addEventListener('click', cycleTheme);
    fsBtn.addEventListener('click', toggleFullscreen);
    blackout.addEventListener('click', function () { blackout.hidden = true; });
    document.addEventListener('keydown', onKey);
    window.addEventListener('hashchange', fromHash);
    window.addEventListener('beforeprint', function () { setMode(false); });

    var saved = 'dark';
    try { saved = localStorage.getItem(K_THEME) || 'dark'; } catch (err) { /* private mode */ }
    applyTheme(saved);

    fromHash();
    requestWakeLock();
})();
