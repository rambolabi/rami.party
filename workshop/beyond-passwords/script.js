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
    var K_LANG = 'beyond-passwords:lang';
    var THEMES = ['dark', 'light', 'contrast'];
    var LANGS = ['en', 'nl', 'fr'];

    var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
    var counter = document.getElementById('counter');
    var fill = document.getElementById('progress-fill');
    var blackout = document.getElementById('blackout');
    var modeBtn = document.getElementById('mode-btn');
    var themeBtn = document.getElementById('theme-btn');
    var themeName = document.getElementById('theme-name');
    var fsBtn = document.getElementById('fs-btn');
    var langBtn = document.getElementById('lang-btn');
    var langName = document.getElementById('lang-name');

    var current = 0;
    var presenting = true;
    var lang = 'en';

    /* ------------------------------------------------------------ language */
    /* English is snapshotted from the markup itself, so it can never drift. */

    var i18nEls = Array.prototype.slice.call(document.querySelectorAll('[data-i18n]'));
    var EN = {};
    i18nEls.forEach(function (el) { EN[el.dataset.i18n] = el.innerHTML; });

    function ui() {
        return window.BP_UI[lang] || window.BP_UI.en;
    }

    function applyLang(id) {
        lang = LANGS.indexOf(id) !== -1 ? id : 'en';
        var dict = lang === 'en' ? EN : (window.BP_T[lang] || {});
        i18nEls.forEach(function (el) {
            var k = el.dataset.i18n;
            el.innerHTML = dict[k] !== undefined ? dict[k] : EN[k];
        });
        document.documentElement.lang = lang;
        document.title = ui().title;
        langName.textContent = lang.toUpperCase();
        langBtn.title = ui().lang_title;
        refreshModeBtn();
        refreshThemeBtn();
        fsBtn.title = ui().fs_title;
        try { localStorage.setItem(K_LANG, lang); } catch (err) { /* private mode */ }
    }

    function cycleLang() {
        applyLang(LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length]);
    }

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

    function refreshModeBtn() {
        modeBtn.textContent = presenting ? ui().read : ui().present;
        modeBtn.title = presenting ? ui().read_title : ui().present_title;
    }

    function setMode(present) {
        presenting = present;
        document.body.dataset.mode = present ? 'present' : 'read';
        refreshModeBtn();
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

    function refreshThemeBtn() {
        var cur = document.documentElement.getAttribute('data-theme') || 'dark';
        themeName.textContent = ui()['theme_' + cur] || cur;
        themeBtn.title = ui().theme_title;
    }

    function applyTheme(id) {
        var t = THEMES.indexOf(id) !== -1 ? id : THEMES[0];
        document.documentElement.setAttribute('data-theme', t);
        refreshThemeBtn();
        try { localStorage.setItem(K_THEME, t); } catch (err) { /* private mode */ }
    }

    function cycleTheme() {
        var cur = document.documentElement.getAttribute('data-theme');
        applyTheme(THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length]);
    }

    /* ----------------------------------------------------------------- boot */

    document.getElementById('next-btn').addEventListener('click', next);
    document.getElementById('prev-btn').addEventListener('click', prev);
    modeBtn.addEventListener('click', function () { setMode(!presenting); });
    themeBtn.addEventListener('click', cycleTheme);
    langBtn.addEventListener('click', cycleLang);
    fsBtn.addEventListener('click', toggleFullscreen);
    blackout.addEventListener('click', function () { blackout.hidden = true; });
    document.addEventListener('keydown', onKey);
    window.addEventListener('hashchange', fromHash);
    window.addEventListener('beforeprint', function () { setMode(false); });

    var savedTheme = 'dark';
    try { savedTheme = localStorage.getItem(K_THEME) || 'dark'; } catch (err) { /* private mode */ }
    applyTheme(savedTheme);

    var savedLang = '';
    try { savedLang = localStorage.getItem(K_LANG) || ''; } catch (err) { /* private mode */ }
    if (LANGS.indexOf(savedLang) === -1) {
        var nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
        savedLang = LANGS.indexOf(nav) !== -1 ? nav : 'en';
    }
    applyLang(savedLang);

    fromHash();
    requestWakeLock();
})();
