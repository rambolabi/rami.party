// ==UserScript==
// @name         ConnectWise Manage · Comfort Glamour
// @namespace    https://rami.party/workshop/glamours/
// @version      1.0.0
// @description  Quality-of-life for ConnectWise Manage: a midnight veil (dark mode), readable scrollbars, row hover highlighting, visible focus rings, a password-manager-friendly login and text zoom. Every tweak is a toggle — press Alt+Shift+G for the panel.
// @author       rami.party
// @license      MIT
// @match        https://eu.myconnectwise.net/*
// @match        https://*.myconnectwise.net/*
// @icon         data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%230d0726'/%3E%3Cpath d='M50 18 L57 43 L82 50 L57 57 L50 82 L43 57 L18 50 L43 43 Z' fill='%23a855f7'/%3E%3Ccircle cx='75' cy='25' r='6' fill='%2322d3ee'/%3E%3C/svg%3E
// @run-at       document-start
// @grant        none
// @homepageURL  https://rami.party/workshop/glamours/
// @supportURL   https://rami.party/workshop/glamours/
// @downloadURL  https://rami.party/workshop/glamours/cw-manage-eu.user.js
// @updateURL    https://rami.party/workshop/glamours/cw-manage-eu.user.js
// ==/UserScript==

/* --------------------------------------------------------------------------
   How this file is organised
   --------------------------------------------------------------------------
   ConnectWise Manage hosts its modules inside same-origin iframes, so this
   script deliberately runs in EVERY frame (no @noframes):

   • CSS comfort tweaks (scrollbars, row hover, focus rings) mount in every
     frame — each frame document needs its own copy.
   • The dark "midnight veil" inverts ONLY the top document. A CSS filter on
     the top <html> composites over iframe content too; inverting each frame
     as well would double-invert them back to blinding white.
   • Images/video get a counter-invert in every frame so photos stay natural.
   • The ✨ settings panel mounts only in the top frame. Settings live in
     localStorage; the 'storage' event keeps all frames in sync live.
   -------------------------------------------------------------------------- */

(function () {
    'use strict';

    var IS_TOP = window.self === window.top;
    var KEY = 'rpGlamourCw.v1';
    var DEFAULTS = {
        dark: false,        // midnight veil (invert)
        scrollbars: true,   // chunky, visible scrollbars
        rows: true,         // hover highlight on table/grid rows
        focus: true,        // visible keyboard focus rings
        login: true,        // login page helper
        zoom: 100,          // text zoom %, 80–130
        pill: true          // show the floating ✨ button
    };

    /* ---------------- settings I/O (sandboxed-frame safe) ---------------- */

    var memFallback = null;
    function loadSettings() {
        var s = {};
        try {
            var raw = localStorage.getItem(KEY);
            if (raw) s = JSON.parse(raw) || {};
        } catch (e) { s = memFallback || {}; }
        var out = {};
        for (var k in DEFAULTS) out[k] = (k in s) ? s[k] : DEFAULTS[k];
        out.zoom = Math.max(80, Math.min(130, parseInt(out.zoom, 10) || 100));
        return out;
    }
    function saveSettings(s) {
        try { localStorage.setItem(KEY, JSON.stringify(s)); }
        catch (e) { memFallback = s; }
    }

    /* ---------------- stylesheet manager ---------------- */

    function setSheet(id, css) {
        var el = document.getElementById(id);
        if (!css) { if (el) el.parentNode.removeChild(el); return; }
        if (!el) {
            el = document.createElement('style');
            el.id = id;
            (document.head || document.documentElement).appendChild(el);
        }
        if (el.textContent !== css) el.textContent = css;
    }

    var ACCENT = '#2563eb';

    var CSS = {
        scrollbars: [
            '*::-webkit-scrollbar{width:14px;height:14px}',
            '*::-webkit-scrollbar-track{background:rgba(100,116,139,.12)}',
            '*::-webkit-scrollbar-thumb{background:rgba(100,116,139,.75);border-radius:8px;',
            'border:3px solid transparent;background-clip:padding-box}',
            '*::-webkit-scrollbar-thumb:hover{background-color:rgba(71,85,105,.95)}',
            '*::-webkit-scrollbar-corner{background:transparent}',
            'html{scrollbar-color:#64748b transparent}'
        ].join(''),

        rows: [
            'tr:hover>td,tr:hover>th{background-color:rgba(37,99,235,.10)!important}',
            '[role="row"]:hover>[role="gridcell"],[role="row"]:hover>[role="cell"],',
            '[role="row"]:hover>[role="rowheader"]{background-color:rgba(37,99,235,.10)!important}'
        ].join(''),

        focus: ':focus-visible{outline:2px solid ' + ACCENT + '!important;outline-offset:1px!important}',

        /* Top frame only. The filter makes <html> the containing block for
           position:fixed children — on ConnectWise the shell does not scroll,
           so nothing drifts. #rpg-root is counter-inverted to keep the panel
           in its true colours. */
        darkRoot: [
            'html{filter:invert(.92) hue-rotate(180deg)!important;background:#0b0d12!important}',
            '#rpg-root{filter:invert(1.087) hue-rotate(180deg)}'
        ].join(''),

        /* Every frame: flip photos, logos and video back to natural. */
        darkMedia: [
            'img,video,canvas,embed,object,picture,',
            '[style*="background-image"]{filter:invert(1) hue-rotate(180deg)!important}'
        ].join(''),

        login: [
            '#loginContainer .loginTextBox{font-size:15px!important}',
            '#loginContainer .loginButton{cursor:pointer}',
            '#rpg-caps{margin:6px 0 0;font:600 12px/1.3 system-ui,-apple-system,"Segoe UI",sans-serif;color:#b45309}',
            '#rpg-caps[hidden]{display:none}'
        ].join('')
    };

    /* ---------------- apply settings ---------------- */

    function applyZoom(s) {
        if (!IS_TOP || !document.body) return;
        document.body.style.zoom = (s.zoom === 100) ? '' : s.zoom + '%';
    }

    function apply(s) {
        setSheet('rpg-scrollbars', s.scrollbars ? CSS.scrollbars : '');
        setSheet('rpg-rows', s.rows ? CSS.rows : '');
        setSheet('rpg-focus', s.focus ? CSS.focus : '');
        setSheet('rpg-dark-media', s.dark ? CSS.darkMedia : '');
        if (IS_TOP) setSheet('rpg-dark-root', s.dark ? CSS.darkRoot : '');
        setSheet('rpg-login', s.login ? CSS.login : '');
        applyZoom(s);
        if (IS_TOP) syncPanel(s);
    }

    /* ---------------- login page helper ---------------- */

    function enhanceLogin(s) {
        if (!s.login) return;
        var form = document.getElementById('loginForm');
        var company = document.getElementById('company');
        var username = document.getElementById('username');
        var password = document.getElementById('password');
        if (!form || !company || !username || !password) return;

        /* ConnectWise ships autocomplete="off" on every field, which keeps
           password managers from offering to fill. Proper tokens fix that. */
        company.setAttribute('autocomplete', 'organization');
        username.setAttribute('autocomplete', 'username');
        password.setAttribute('autocomplete', 'current-password');

        /* Focus the first empty field once init() reveals the container. */
        var box = document.getElementById('loginContainer');
        var focused = false;
        function tryFocus() {
            if (focused || !box || box.style.display === 'none') return;
            var target = [company, username, password].filter(function (el) {
                return el && !el.value;
            })[0] || company;
            try { target.focus(); focused = true; } catch (e) { /* ignore */ }
        }
        if (box) {
            new MutationObserver(tryFocus)
                .observe(box, { attributes: true, attributeFilter: ['style'] });
        }
        tryFocus();

        /* Caps Lock warning under the password field. */
        var hint = document.createElement('div');
        hint.id = 'rpg-caps';
        hint.hidden = true;
        hint.textContent = '\u21EA Caps Lock is on';
        password.insertAdjacentElement('afterend', hint);
        ['keydown', 'keyup'].forEach(function (evt) {
            password.addEventListener(evt, function (e) {
                if (e.getModifierState) hint.hidden = !e.getModifierState('CapsLock');
            });
        });
        password.addEventListener('blur', function () { hint.hidden = true; });
    }

    /* ---------------- settings panel (top frame only) ---------------- */

    var panelRefs = null;

    function el(tag, attrs, children) {
        var node = document.createElement(tag);
        if (attrs) Object.keys(attrs).forEach(function (k) {
            if (k === 'text') node.textContent = attrs[k];
            else if (k === 'html') { /* never used — createElement only */ }
            else node.setAttribute(k, attrs[k]);
        });
        (children || []).forEach(function (c) { node.appendChild(c); });
        return node;
    }

    var PANEL_CSS = [
        '#rpg-root{position:fixed;right:14px;bottom:14px;z-index:2147483000;',
        'font:400 13px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;color:#ece9ff}',
        '#rpg-pill{display:inline-flex;align-items:center;gap:6px;padding:9px 14px;',
        'border-radius:999px;border:1px solid rgba(168,85,247,.45);cursor:pointer;',
        'background:rgba(16,8,42,.88);color:#ece9ff;font:600 13px/1 system-ui,sans-serif;',
        'box-shadow:0 8px 24px rgba(0,0,0,.45);opacity:.8}',
        '#rpg-pill:hover,#rpg-pill:focus-visible{opacity:1}',
        '#rpg-root[data-nopill] #rpg-pill{display:none}',
        '#rpg-panel{position:absolute;right:0;bottom:44px;width:248px;padding:14px;',
        'border-radius:14px;background:rgba(16,8,42,.96);border:1px solid rgba(168,85,247,.45);',
        'box-shadow:0 16px 40px rgba(0,0,0,.55)}',
        '#rpg-panel[hidden]{display:none}',
        '#rpg-panel h2{margin:0 0 10px;font:700 14px/1.2 system-ui,sans-serif;color:#e9d5ff}',
        '#rpg-panel label{display:flex;align-items:center;gap:8px;margin:7px 0;cursor:pointer}',
        '#rpg-panel input[type=checkbox]{accent-color:#a855f7;width:15px;height:15px;margin:0}',
        '#rpg-zoom{display:flex;align-items:center;gap:8px;margin:10px 0 4px}',
        '#rpg-zoom button{width:26px;height:26px;border-radius:8px;border:1px solid rgba(168,85,247,.5);',
        'background:rgba(168,85,247,.15);color:#ece9ff;font:700 14px/1 system-ui,sans-serif;cursor:pointer}',
        '#rpg-zoom output{min-width:44px;text-align:center;font-weight:700}',
        '#rpg-note{margin:10px 0 0;font-size:11px;color:#b9b3d9}',
        '#rpg-note a{color:#22d3ee;text-decoration:none}'
    ].join('');

    var TOGGLES = [
        ['dark', 'Midnight veil (dark mode)'],
        ['scrollbars', 'Comfy scrollbars'],
        ['rows', 'Row hover highlight'],
        ['focus', 'Keyboard focus rings'],
        ['login', 'Login helper'],
        ['pill', 'Show the \u2728 button']
    ];

    function buildPanel(s) {
        if (panelRefs || !document.body) return;
        setSheet('rpg-panel-css', PANEL_CSS);

        var root = el('div', { id: 'rpg-root' });
        var pill = el('button', { id: 'rpg-pill', type: 'button', 'aria-expanded': 'false', 'aria-label': 'Glamour settings' });
        pill.appendChild(el('span', { 'aria-hidden': 'true', text: '\u2728' }));
        pill.appendChild(document.createTextNode(' Glamour'));

        var panel = el('div', { id: 'rpg-panel', role: 'dialog', 'aria-label': 'Glamour settings' });
        panel.hidden = true;
        panel.appendChild(el('h2', { text: '\u2728 Comfort Glamour' }));

        var inputs = {};
        TOGGLES.forEach(function (t) {
            var cb = el('input', { type: 'checkbox' });
            cb.checked = !!s[t[0]];
            cb.addEventListener('change', function () { update(t[0], cb.checked); });
            inputs[t[0]] = cb;
            panel.appendChild(el('label', null, [cb, el('span', { text: t[1] })]));
        });

        var out = el('output', { text: s.zoom + '%' });
        var minus = el('button', { type: 'button', 'aria-label': 'Smaller text', text: '\u2212' });
        var plus = el('button', { type: 'button', 'aria-label': 'Larger text', text: '+' });
        minus.addEventListener('click', function () { update('zoom', loadSettings().zoom - 5); });
        plus.addEventListener('click', function () { update('zoom', loadSettings().zoom + 5); });
        var zoomRow = el('div', { id: 'rpg-zoom' }, [el('span', { text: 'Text zoom' }), minus, out, plus]);
        panel.appendChild(zoomRow);

        var note = el('p', { id: 'rpg-note' });
        note.appendChild(document.createTextNode('Alt+Shift+G toggles this panel \u00b7 Alt+Shift+D toggles the veil. Settings stay in this browser. '));
        var home = el('a', { href: 'https://rami.party/workshop/glamours/', target: '_blank', rel: 'noopener', text: 'About this glamour \u2197' });
        note.appendChild(home);
        panel.appendChild(note);

        pill.addEventListener('click', function () {
            panel.hidden = !panel.hidden;
            pill.setAttribute('aria-expanded', String(!panel.hidden));
        });
        document.addEventListener('keydown', function (e) {
            if (e.altKey && e.shiftKey && (e.code === 'KeyG')) {
                e.preventDefault();
                panel.hidden = !panel.hidden;
                pill.setAttribute('aria-expanded', String(!panel.hidden));
            }
            if (e.altKey && e.shiftKey && (e.code === 'KeyD')) {
                e.preventDefault();
                update('dark', !loadSettings().dark);
            }
            if (e.key === 'Escape' && !panel.hidden) {
                panel.hidden = true;
                pill.setAttribute('aria-expanded', 'false');
            }
        });

        root.appendChild(panel);
        root.appendChild(pill);
        document.body.appendChild(root);
        panelRefs = { root: root, panel: panel, pill: pill, inputs: inputs, zoomOut: out };
        syncPanel(s);
    }

    function syncPanel(s) {
        if (!panelRefs) return;
        if (s.pill) panelRefs.root.removeAttribute('data-nopill');
        else panelRefs.root.setAttribute('data-nopill', '');
        TOGGLES.forEach(function (t) {
            if (panelRefs.inputs[t[0]]) panelRefs.inputs[t[0]].checked = !!s[t[0]];
        });
        panelRefs.zoomOut.textContent = s.zoom + '%';
    }

    function update(key, value) {
        var s = loadSettings();
        s[key] = value;
        s.zoom = Math.max(80, Math.min(130, parseInt(s.zoom, 10) || 100));
        saveSettings(s);
        apply(s);
    }

    /* ---------------- boot ---------------- */

    apply(loadSettings());                       // CSS as early as possible

    function onReady() {
        var s = loadSettings();
        apply(s);                                // body exists now → zoom
        enhanceLogin(s);
        if (IS_TOP) buildPanel(s);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        onReady();
    }

    /* Other frames (and other tabs) follow along live. */
    window.addEventListener('storage', function (e) {
        if (e.key === KEY) apply(loadSettings());
    });
})();
