/* ==========================================================================
   rami.party — theme switcher
   Lets every visitor pick a colour theme (Enchanted, Midnight, Pale,
   Professional Navy, Professional Ivory). The choice is remembered in
   localStorage and applied instantly on every page that loads this file
   and theme.css. Designed to be simple, accessible and bug-free:
   - Runs synchronously in <head> (right after theme.css) so the saved
     theme is applied before the page paints — no flash of the wrong theme.
   - Falls back gracefully if localStorage or matchMedia are unavailable.
   - Adds a single native <select> to the header — keyboard and
     screen-reader friendly with zero extra dependencies.
   ========================================================================== */

(function () {
    'use strict';

    var STORAGE_KEY = 'rami-theme';

    var THEMES = [
        { id: 'enchanted', label: '✨ Enchanted (Default)', color: '#0b0524' },
        { id: 'dark', label: '🌑 Midnight (Dark)', color: '#000000' },
        { id: 'pale', label: '🤍 Pale (Light)', color: '#f7f5ff' },
        { id: 'professional-navy', label: '💼 Professional Navy', color: '#0a0e17' },
        { id: 'professional-ivory', label: '📄 Professional Ivory', color: '#f8f9fb' },
    ];
    var THEME_IDS = THEMES.map(function (t) { return t.id; });

    function safeGet(key) {
        try { return window.localStorage.getItem(key); } catch (e) { return null; }
    }

    function safeSet(key, value) {
        try { window.localStorage.setItem(key, value); } catch (e) { /* ignore (private mode, etc.) */ }
    }

    function prefersLight() {
        try {
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        } catch (e) {
            return false;
        }
    }

    function resolveInitialTheme() {
        var stored = safeGet(STORAGE_KEY);
        if (stored && THEME_IDS.indexOf(stored) !== -1) return stored;
        return prefersLight() ? 'pale' : 'enchanted';
    }

    function themeMeta(id) {
        for (var i = 0; i < THEMES.length; i++) {
            if (THEMES[i].id === id) return THEMES[i];
        }
        return THEMES[0];
    }

    function updateMetaThemeColor(id) {
        var meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) return;
        meta.setAttribute('content', themeMeta(id).color);
    }

    function applyTheme(id) {
        if (THEME_IDS.indexOf(id) === -1) id = 'enchanted';
        var root = document.documentElement;
        if (id === 'enchanted') {
            root.removeAttribute('data-theme');
        } else {
            root.setAttribute('data-theme', id);
        }
        updateMetaThemeColor(id);
        window.__ramiTheme = id;
        return id;
    }

    function setTheme(id) {
        id = applyTheme(id);
        safeSet(STORAGE_KEY, id);
        document.dispatchEvent(new CustomEvent('rami-theme-change', { detail: { theme: id } }));
        return id;
    }

    // Apply the saved/preferred theme immediately, before first paint.
    applyTheme(resolveInitialTheme());

    function buildSwitcher() {
        var header = document.querySelector('.site-header .container');
        if (!header || document.getElementById('ramiThemeSelect')) return;

        var wrap = document.createElement('div');
        wrap.className = 'theme-switcher';

        var label = document.createElement('label');
        label.className = 'visually-hidden';
        label.setAttribute('for', 'ramiThemeSelect');
        label.textContent = 'Choose a colour theme';

        var select = document.createElement('select');
        select.id = 'ramiThemeSelect';
        select.className = 'theme-switcher-select';
        select.setAttribute('aria-label', 'Choose a colour theme');

        THEMES.forEach(function (t) {
            var opt = document.createElement('option');
            opt.value = t.id;
            opt.textContent = t.label;
            if (t.id === window.__ramiTheme) opt.selected = true;
            select.appendChild(opt);
        });

        select.addEventListener('change', function () {
            setTheme(select.value);
        });

        // Keep the control in sync if the theme changes elsewhere (e.g. another tab).
        document.addEventListener('rami-theme-change', function (e) {
            if (select.value !== e.detail.theme) select.value = e.detail.theme;
        });

        wrap.appendChild(label);
        wrap.appendChild(select);

        var burger = header.querySelector('.burger');
        if (burger) {
            header.insertBefore(wrap, burger);
        } else {
            header.appendChild(wrap);
        }
    }

    window.addEventListener('storage', function (e) {
        if (e.key === STORAGE_KEY && e.newValue && THEME_IDS.indexOf(e.newValue) !== -1) {
            applyTheme(e.newValue);
            document.dispatchEvent(new CustomEvent('rami-theme-change', { detail: { theme: e.newValue } }));
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildSwitcher);
    } else {
        buildSwitcher();
    }

    // Expose a tiny API in case other scripts on the page want to react to theme changes.
    window.ramiTheme = { get: function () { return window.__ramiTheme; }, set: setTheme, list: THEMES.slice() };
})();
