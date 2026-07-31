/* ==========================================================================
   rami.party — theme engine
   Applies the saved theme before first paint, then renders an accessible
   theme picker into the site header. Load this in <head>, render-blocking,
   BEFORE any other script:  <script src="/theme.js"></script>
   ========================================================================== */

(function () {
    'use strict';

    var STORAGE_KEY = 'rami.theme';
    var AUTO = 'auto';

    /* id must match the :root[data-theme="…"] blocks in theme.css.
       `scheme` drives <meta name="color-scheme"> and the browser UI colour. */
    var THEMES = [
        { id: 'enchanted', name: 'Enchanted', glyph: '🔮', note: 'Midnight arcane — the house style', scheme: 'dark', color: '#0b0524' },
        { id: 'slate', name: 'Professional Dark', glyph: '🛡️', note: 'Calm slate & steel blue', scheme: 'dark', color: '#0d131d' },
        { id: 'daylight', name: 'Professional Light', glyph: '📄', note: 'Crisp, printable, boardroom-safe', scheme: 'light', color: '#f8fafc' },
        { id: 'parchment', name: 'Grimoire', glyph: '📜', note: 'Warm parchment & ink', scheme: 'light', color: '#f6eeda' },
        { id: 'terminal', name: 'Phosphor', glyph: '🖥️', note: 'A CRT that wandered in from 1983', scheme: 'dark', color: '#000000' },
        { id: 'contrast', name: 'High Contrast', glyph: '◐', note: 'Maximum legibility, no decoration', scheme: 'dark', color: '#000000' }
    ];

    var DEFAULT_THEME = 'enchanted';
    var byId = {};
    THEMES.forEach(function (t) { byId[t.id] = t; });

    var darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    function read() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (err) {
            return null;
        }
    }

    function write(value) {
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch (err) {
            /* Storage blocked (private mode / disabled cookies) — theme is
               still applied for this page view, it just will not persist. */
        }
    }

    /* The stored choice: a theme id, 'auto', or null when never chosen. */
    function preference() {
        var stored = read();
        if (stored === AUTO || byId[stored]) return stored;
        return DEFAULT_THEME;
    }

    /* The theme actually painted right now. */
    function resolve(pref) {
        if (pref !== AUTO) return byId[pref] ? pref : DEFAULT_THEME;
        return darkQuery && !darkQuery.matches ? 'daylight' : DEFAULT_THEME;
    }

    function setMeta(name, content, attr) {
        var key = attr || 'name';
        var el = document.querySelector('meta[' + key + '="' + name + '"]');
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute(key, name);
            (document.head || document.documentElement).appendChild(el);
        }
        el.setAttribute('content', content);
    }

    function apply(pref, persist) {
        var id = resolve(pref);
        var theme = byId[id];
        var root = document.documentElement;
        root.setAttribute('data-theme', id);
        root.style.colorScheme = theme.scheme;
        if (persist) write(pref);
        if (document.head) {
            setMeta('theme-color', theme.color);
            setMeta('color-scheme', theme.scheme);
        }
        try {
            document.dispatchEvent(new CustomEvent('rami:themechange', {
                detail: { preference: pref, theme: id, scheme: theme.scheme }
            }));
        } catch (err) { /* CustomEvent unsupported — nothing depends on it */ }
        return id;
    }

    /* ---- Boot (runs before first paint, so there is no flash) ------------- */
    var current = preference();
    apply(current, false);

    if (darkQuery) {
        var onSchemeChange = function () { if (current === AUTO) apply(AUTO, false); };
        if (darkQuery.addEventListener) darkQuery.addEventListener('change', onSchemeChange);
        else if (darkQuery.addListener) darkQuery.addListener(onSchemeChange);
    }

    /* Keep every open tab in sync. */
    window.addEventListener('storage', function (e) {
        if (e.key !== STORAGE_KEY) return;
        current = preference();
        apply(current, false);
        syncUI();
    });

    /* ---- Picker UI -------------------------------------------------------- */
    var menu = null;
    var toggle = null;

    function syncUI() {
        if (!menu || !toggle) return;
        var active = byId[resolve(current)];
        toggle.querySelector('.theme-toggle-glyph').textContent = active.glyph;
        toggle.setAttribute('title', 'Theme: ' + active.name);
        toggle.setAttribute('aria-label', 'Change theme (current: ' + active.name + ')');
        menu.querySelectorAll('[role="menuitemradio"]').forEach(function (btn) {
            btn.setAttribute('aria-checked', btn.dataset.theme === current ? 'true' : 'false');
        });
    }

    function closeMenu(focusToggle) {
        if (!menu || !menu.classList.contains('open')) return;
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        if (focusToggle) toggle.focus();
    }

    function openMenu() {
        if (!menu) return;
        menu.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
        var checked = menu.querySelector('[aria-checked="true"]') || menu.querySelector('[role="menuitemradio"]');
        if (checked) checked.focus();
    }

    function buildPicker() {
        var header = document.querySelector('.site-header .container');
        if (!header || document.querySelector('.theme-picker')) return;

        var wrap = document.createElement('div');
        wrap.className = 'theme-picker';

        toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'theme-toggle';
        toggle.setAttribute('aria-haspopup', 'true');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<span class="theme-toggle-glyph" aria-hidden="true">🔮</span>' +
            '<span class="theme-toggle-label">Theme</span>';

        menu = document.createElement('div');
        menu.className = 'theme-menu';
        menu.setAttribute('role', 'menu');
        menu.setAttribute('aria-label', 'Choose a theme');

        var options = THEMES.concat([{
            id: AUTO, name: 'Match system', glyph: '🌗', note: 'Follow your device’s light/dark setting'
        }]);

        options.forEach(function (t) {
            var item = document.createElement('button');
            item.type = 'button';
            item.className = 'theme-option';
            item.setAttribute('role', 'menuitemradio');
            item.setAttribute('aria-checked', 'false');
            item.dataset.theme = t.id;
            item.innerHTML = '<span class="theme-option-glyph" aria-hidden="true"></span>' +
                '<span class="theme-option-text"><strong></strong><small></small></span>';
            item.querySelector('.theme-option-glyph').textContent = t.glyph;
            item.querySelector('strong').textContent = t.name;
            item.querySelector('small').textContent = t.note;
            item.addEventListener('click', function () {
                current = t.id;
                apply(current, true);
                syncUI();
                closeMenu(true);
            });
            menu.appendChild(item);
        });

        toggle.addEventListener('click', function () {
            if (menu.classList.contains('open')) closeMenu(false);
            else openMenu();
        });

        wrap.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') { closeMenu(true); return; }
            if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
            var items = Array.prototype.slice.call(menu.querySelectorAll('[role="menuitemradio"]'));
            if (!items.length) return;
            e.preventDefault();
            if (!menu.classList.contains('open')) { openMenu(); return; }
            var i = items.indexOf(document.activeElement);
            var next = e.key === 'ArrowDown' ? i + 1 : i - 1;
            if (next < 0) next = items.length - 1;
            if (next >= items.length) next = 0;
            items[next].focus();
        });

        document.addEventListener('click', function (e) {
            if (!wrap.contains(e.target)) closeMenu(false);
        });

        wrap.appendChild(toggle);
        wrap.appendChild(menu);

        var burger = header.querySelector('.burger');
        if (burger) header.insertBefore(wrap, burger);
        else header.appendChild(wrap);

        syncUI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildPicker);
    } else {
        buildPicker();
    }

    /* Small public surface, handy for sub-realms with their own chrome. */
    window.RamiTheme = {
        themes: THEMES,
        get: function () { return current; },
        resolved: function () { return resolve(current); },
        set: function (id) {
            if (id !== AUTO && !byId[id]) return false;
            current = id;
            apply(current, true);
            syncUI();
            return true;
        }
    };
})();
