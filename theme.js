/* ==========================================================================
   rami.party — theme engine
   Applies the visitor's chosen palette (stored in localStorage) and injects a
   small theme switcher into the site header. Load this in <head>, before the
   page renders, on every page that uses theme.css and the shared chrome.
   ========================================================================== */

(function () {
    'use strict';

    var STORAGE_KEY = 'rami-theme';
    var DEFAULT_THEME = 'enchanted';

    var THEMES = [
        { id: 'enchanted', name: 'Enchanted', swatch: 'linear-gradient(135deg, #a855f7, #ec4899 50%, #22d3ee)', color: '#0b0524' },
        { id: 'pro-dark', name: 'Professional dark', swatch: 'linear-gradient(135deg, #6366f1, #3b82f6 55%, #22d3ee)', color: '#0d131d' },
        { id: 'pro-light', name: 'Professional light', swatch: 'linear-gradient(135deg, #4f46e5, #2563eb 55%, #0891b2)', color: '#f8fafc' },
        { id: 'ember', name: 'Ember', swatch: 'linear-gradient(135deg, #f97316, #ef4444 45%, #fcd34d)', color: '#1c0b06' },
        { id: 'verdant', name: 'Verdant', swatch: 'linear-gradient(135deg, #10b981, #14b8a6 45%, #a3e635)', color: '#071d14' },
        { id: 'parchment', name: 'Parchment', swatch: 'linear-gradient(135deg, #a16207, #b91c1c 45%, #7c3aed)', color: '#faf3e4' }
    ];

    function byId(id) {
        for (var i = 0; i < THEMES.length; i++) {
            if (THEMES[i].id === id) return THEMES[i];
        }
        return null;
    }

    function readStored() {
        try {
            return window.localStorage.getItem(STORAGE_KEY);
        } catch (err) {
            return null; // private mode / storage disabled
        }
    }

    function store(id) {
        try {
            window.localStorage.setItem(STORAGE_KEY, id);
        } catch (err) {
            /* nothing we can do — the theme still applies for this page view */
        }
    }

    var stored = readStored();
    var current = byId(stored) ? stored : DEFAULT_THEME;

    function apply(id, persist) {
        var theme = byId(id) || byId(DEFAULT_THEME);
        current = theme.id;
        var root = document.documentElement;
        if (theme.id === DEFAULT_THEME) root.removeAttribute('data-theme');
        else root.setAttribute('data-theme', theme.id);
        root.style.colorScheme = (theme.id === 'pro-light' || theme.id === 'parchment') ? 'light' : 'dark';
        if (persist) store(theme.id);

        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', theme.color);

        document.dispatchEvent(new CustomEvent('rami:themechange', { detail: { theme: theme.id } }));
    }

    // Apply as early as possible so the page never flashes the wrong palette.
    apply(current, false);

    window.RamiTheme = {
        themes: THEMES,
        get: function () { return current; },
        set: function (id) { apply(id, true); }
    };

    /* ---- Switcher UI ----------------------------------------------------- */
    function buildSwitcher() {
        var mount = document.querySelector('.site-header .container');
        if (!mount || mount.querySelector('.theme-switch')) return;

        var active = byId(current) || byId(DEFAULT_THEME);

        var wrap = document.createElement('div');
        wrap.className = 'theme-switch';

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'theme-switch-btn';
        btn.id = 'themeSwitchBtn';
        btn.setAttribute('aria-haspopup', 'true');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-controls', 'themeMenu');
        btn.setAttribute('aria-label', 'Change theme (current: ' + active.name + ')');
        btn.innerHTML = '<span class="theme-swatch" aria-hidden="true"></span><span class="theme-name"></span>';
        btn.querySelector('.theme-swatch').style.background = active.swatch;
        btn.querySelector('.theme-name').textContent = active.name;

        var menu = document.createElement('div');
        menu.className = 'theme-menu';
        menu.id = 'themeMenu';
        menu.setAttribute('role', 'menu');
        menu.setAttribute('aria-label', 'Themes');

        THEMES.forEach(function (theme) {
            var opt = document.createElement('button');
            opt.type = 'button';
            opt.className = 'theme-option';
            opt.setAttribute('role', 'menuitemradio');
            opt.setAttribute('aria-checked', String(theme.id === current));
            opt.dataset.theme = theme.id;
            opt.innerHTML = '<span class="theme-swatch" aria-hidden="true"></span>' +
                '<span class="theme-label"></span>' +
                '<span class="theme-check" aria-hidden="true">✓</span>';
            opt.querySelector('.theme-swatch').style.background = theme.swatch;
            opt.querySelector('.theme-label').textContent = theme.name;
            opt.addEventListener('click', function () {
                apply(theme.id, true);
                syncUI();
                closeMenu();
                btn.focus();
            });
            menu.appendChild(opt);
        });

        function syncUI() {
            var now = byId(current);
            btn.querySelector('.theme-swatch').style.background = now.swatch;
            btn.querySelector('.theme-name').textContent = now.name;
            btn.setAttribute('aria-label', 'Change theme (current: ' + now.name + ')');
            menu.querySelectorAll('.theme-option').forEach(function (opt) {
                opt.setAttribute('aria-checked', String(opt.dataset.theme === current));
            });
        }

        function openMenu() {
            menu.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
            var checked = menu.querySelector('.theme-option[aria-checked="true"]') || menu.firstElementChild;
            if (checked) checked.focus();
        }

        function closeMenu() {
            menu.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        }

        btn.addEventListener('click', function () {
            if (menu.classList.contains('open')) closeMenu();
            else openMenu();
        });

        document.addEventListener('click', function (e) {
            if (menu.classList.contains('open') && !wrap.contains(e.target)) closeMenu();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && menu.classList.contains('open')) {
                closeMenu();
                btn.focus();
            }
        });

        wrap.appendChild(btn);
        wrap.appendChild(menu);

        // Sit just before the burger so the mobile menu button stays last.
        var burger = mount.querySelector('.burger');
        if (burger) mount.insertBefore(wrap, burger);
        else mount.appendChild(wrap);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildSwitcher);
    } else {
        buildSwitcher();
    }
})();
