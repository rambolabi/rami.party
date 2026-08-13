// ==UserScript==
// @name         Prism · Reading Comfort
// @namespace    https://rami.party/workshop/glamours/
// @version      1.0.1
// @description  Make any site readable: invert it, repaint it in a dark, sepia or high-contrast palette (or colours you pick), scale the text without breaking the layout, widen the line spacing, cap the line length, swap the font, calm the animations and dim the images. Settings are remembered per site. Alt+Shift+P for the panel.
// @author       rami.party
// @license      MIT
// @match        *://*/*
// @icon         data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%230d0726'/%3E%3Cpath d='M50 18 88 78H12Z' fill='none' stroke='%23e9d5ff' stroke-width='6'/%3E%3Cpath d='M50 40 68 70H32Z' fill='%23a855f7'/%3E%3C/svg%3E
// @run-at       document-start
// @grant        none
// @homepageURL  https://rami.party/workshop/glamours/
// @supportURL   https://rami.party/workshop/glamours/
// @downloadURL  https://rami.party/workshop/glamours/user-scripts/prism.user.js
// @updateURL    https://rami.party/workshop/glamours/user-scripts/prism.user.js
// ==/UserScript==

/* --------------------------------------------------------------------------
   Prism: bend a page's light until you can read it
   --------------------------------------------------------------------------
   Two different tools that people lump together as "dark mode":

   • INVERT is a filter on the root element. It costs nothing, works on a site
     it has never seen, and keeps every layer intact, but it flips photos too,
     so images and video get a counter-invert to put them back.
   • REPAINT forces a palette instead: one background, one text colour, one
     link colour, everything else flattened. Blunter, but it never turns a
     photograph into a negative and the contrast is exactly what you chose.

   Text size is neither zoom nor a blanket font-size. Every element is tagged
   once with its ORIGINAL size and a small generated stylesheet maps each
   distinct size to the scaled one, so buttons, icons and column widths keep
   their dimensions and re-applying never compounds.

   Nothing is sent anywhere; settings live in this browser, per site.
   -------------------------------------------------------------------------- */

(function () {
    'use strict';

    var NS = '__rpgPrism';
    if (window[NS]) { window[NS].toggle(); return; }       // re-clicked bookmarklet

    var IS_TOP = window.self === window.top;
    var VERSION = '1.0.1';
    var KEY = 'rpgPrism.v1';
    /* Same heuristic as Truesight: running before the page means a userscript
       on every site, so wait behind the pill; running after means a click. */
    var onDemand = document.readyState !== 'loading';

    var DEFAULTS = {
        theme: 'off',       // off | invert | dark | sepia | contrast | custom
        bg: '#101318',      // used by "custom"
        fg: '#dfe5ee',
        link: '#7cc4ff',
        text: 100,          // text-only scale, 70 to 200 %
        leading: 0,         // extra line-height, 0 to 100 (gives +0.00 to 1.00em)
        spacing: 0,         // letter spacing, 0 to 100 (gives 0 to 0.1em)
        width: 0,           // max line length in ch, 0 = leave alone
        font: 'page',       // page | sans | serif | mono | legible
        underline: false,
        calm: false,        // stop animations and smooth scrolling
        images: 'normal',   // normal | dim | hidden
        pill: true
    };

    /* Presets are "repaint" palettes; invert is a filter and has no colours. */
    var THEMES = [
        { id: 'off', label: 'Site\u2019s own colours' },
        { id: 'invert', label: 'Invert the page', filter: 'invert(1) hue-rotate(180deg)' },
        { id: 'dark', label: 'Dark repaint', bg: '#10131a', fg: '#dbe2ee', link: '#7cc4ff' },
        { id: 'sepia', label: 'Sepia', bg: '#f4ecd8', fg: '#42392a', link: '#8a5a12' },
        { id: 'contrast', label: 'High contrast', bg: '#000000', fg: '#ffffff', link: '#ffd400' },
        { id: 'custom', label: 'Custom colours\u2026' }
    ];

    var FONTS = {
        page: '',
        sans: 'system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
        serif: 'Georgia,"Iowan Old Style","Times New Roman",serif',
        mono: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
        legible: '"Atkinson Hyperlegible",Verdana,Tahoma,system-ui,sans-serif'
    };

    /* ---------------- settings ---------------- */

    var site = '';
    try { site = location.hostname || 'file'; } catch (e) { site = 'file'; }

    function readAll() {
        try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
    }

    function load() {
        var all = readAll();
        var stored = (all.sites && all.sites[site]) || all.global || {};
        /* Only an object survives: `k in 5` throws, outside any catch. */
        if (!stored || typeof stored !== 'object') stored = {};
        var out = {};
        for (var k in DEFAULTS) out[k] = (k in stored) ? stored[k] : DEFAULTS[k];
        out.text = clamp(out.text, 70, 200);
        out.leading = clamp(out.leading, 0, 100);
        out.spacing = clamp(out.spacing, 0, 100);
        out.width = clamp(out.width, 0, 120);
        return out;
    }

    function save(s, everywhere) {
        var all = readAll();
        if (!all.sites) all.sites = {};
        if (everywhere) all.global = s; else all.sites[site] = s;
        try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) { /* private mode */ }
    }

    function forget() {
        var all = readAll();
        if (all.sites) delete all.sites[site];
        try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) { /* ignore */ }
    }

    function clamp(v, lo, hi) {
        v = parseInt(v, 10);
        if (isNaN(v)) v = lo;
        return Math.max(lo, Math.min(hi, v));
    }

    /* ---------------- stylesheets ---------------- */

    function setSheet(id, css) {
        var node = document.getElementById(id);
        if (!css) { if (node) node.parentNode.removeChild(node); return; }
        if (!node) {
            node = document.createElement('style');
            node.id = id;
            (document.head || document.documentElement).appendChild(node);
        }
        if (node.textContent !== css) node.textContent = css;
    }

    /* ---------------- colour helpers ---------------- */

    function toRgb(hex) {
        var h = String(hex).replace('#', '');
        if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        var n = parseInt(h, 16);
        return isNaN(n) ? [0, 0, 0] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    function mix(hex, towards, amount) {
        var a = toRgb(hex), b = toRgb(towards);
        return '#' + a.map(function (v, i) {
            var m = Math.round(v + (b[i] - v) * amount);
            return ('0' + m.toString(16)).slice(-2);
        }).join('');
    }

    function isDark(hex) {
        var c = toRgb(hex);
        return (c[0] * 299 + c[1] * 587 + c[2] * 114) / 1000 < 128;
    }

    /* ---------------- the repaint ----------------
       Icon fonts are the reason the font override carries an exclusion list:
       they draw glyphs from a private range, so swapping their family turns a
       toolbar into a row of tofu. */
    var ICON_SKIP = ':not([class*="icon" i]):not([class*="fa-" i]):not([class*="material" i])' +
        ':not(i):not(svg):not(svg *)';

    function paletteCSS(bg, fg, link) {
        var surface = mix(bg, isDark(bg) ? '#ffffff' : '#000000', 0.07);
        var border = mix(bg, isDark(bg) ? '#ffffff' : '#000000', 0.22);
        var faded = mix(fg, bg, 0.35);
        /* Flattening and the rules that lift things back out of it are all
           !important, so specificity decides; they are written to the same
           weight and ordered, which is why the later ones carry html+body
           prefixes they would not otherwise need. The panel is not a child of
           <body>, so `body *` never reaches it. */
        return [
            'html,body{background:' + bg + '!important}',
            'body *:not(svg):not(svg *){background-color:transparent!important;',
            'color:' + fg + '!important;border-color:' + border + '!important;text-shadow:none!important}',
            'html body input,html body textarea,html body select,html body button,',
            'html body pre,html body code,html body kbd,html body samp,html body th,html body td,',
            'html body dialog,html body [role="dialog"],html body [role="menu"],html body [role="listbox"]',
            '{background-color:' + surface + '!important}',
            'html body a,html body a *{color:' + link + '!important}',
            'html body hr{border-color:' + border + '!important}',
            '::placeholder{color:' + faded + '!important;opacity:1!important}',
            '::selection{background:' + link + '!important;color:' + bg + '!important}'
        ].join('');
    }

    function themeCSS(s) {
        var t = null;
        for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === s.theme) t = THEMES[i];
        if (!t || t.id === 'off') return '';
        if (t.filter) {
            /* No background is set on <html>: it is inside the filter, so a
               dark colour there comes back out pale. Media is flipped back. */
            return 'html{filter:' + t.filter + '!important}' +
                'img,video,canvas,picture,embed,object,iframe,[style*="background-image" i]{' +
                'filter:invert(1) hue-rotate(180deg)!important}' +
                '#rpg-prism,#rpg-prism-pill{filter:invert(1) hue-rotate(180deg)}';
        }
        if (t.id === 'custom') return paletteCSS(s.bg, s.fg, s.link);
        return paletteCSS(t.bg, t.fg, t.link);
    }

    function typographyCSS(s) {
        var out = [];
        if (s.leading) {
            out.push('body,p,li,dd,dt,blockquote,td,th{line-height:' +
                (1 + s.leading / 100).toFixed(2) + 'em!important}');
        }
        if (s.spacing) out.push('body *{letter-spacing:' + (s.spacing / 1000).toFixed(3) + 'em!important}');
        if (s.width) out.push('p,li,blockquote,dd{max-width:' + s.width + 'ch!important}');
        if (s.font !== 'page' && FONTS[s.font]) {
            out.push('body' + ICON_SKIP + ',body *' + ICON_SKIP + '{font-family:' + FONTS[s.font] + '!important}');
        }
        if (s.underline) out.push('a[href]{text-decoration:underline!important;text-underline-offset:2px!important}');
        if (s.calm) {
            out.push('*,*::before,*::after{animation-duration:1ms!important;animation-iteration-count:1!important;' +
                'transition-duration:1ms!important;scroll-behavior:auto!important}');
        }
        if (s.images === 'dim') out.push('img,video,picture{opacity:.62!important}');
        if (s.images === 'hidden') {
            out.push('img,video,picture,svg:not(#rpg-prism svg){opacity:0!important}');
        }
        return out.join('');
    }

    /* ---------------- text-only scaling ----------------
       Not zoom: only glyphs grow, so layout boxes keep their dimensions. Each
       element is tagged once with its ORIGINAL size; the generated rule
       repeats the attribute selector three times because plenty of sites pin
       their type with an !important rule of their own that a single attribute
       selector would lose to. */

    var FS = 'data-rpgprism';
    var buckets = {};
    var factor = 1;
    var observer = null, queued = [], pending = 0;

    function tag(root) {
        if (root.nodeType !== 1 || (root.closest && root.closest('#rpg-prism'))) return;
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
            acceptNode: function (n) {
                if (n.id === 'rpg-prism' || n.id === 'rpg-prism-pill') return NodeFilter.FILTER_REJECT;
                var t = n.tagName;
                if (t === 'SCRIPT' || t === 'STYLE' || t === 'LINK' || t === 'META' ||
                    t === 'HEAD' || t === 'TITLE' || t === 'IFRAME') return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        var n = root;
        while (n) {
            if (!n.hasAttribute(FS)) {
                var px = parseFloat(getComputedStyle(n).fontSize);
                if (px) {
                    var bucket = String(Math.round(px * 2) / 2);
                    n.setAttribute(FS, bucket);
                    buckets[bucket] = true;
                }
            }
            n = walker.nextNode();
        }
    }

    function scaleCSS() {
        var out = [];
        for (var v in buckets) {
            var sel = '[' + FS + '="' + v + '"]';
            out.push(sel + sel + sel + '{font-size:' +
                (Math.round(parseFloat(v) * factor * 100) / 100) + 'px!important}');
        }
        return out.join('');
    }

    function rescale(roots) {
        var sheet = document.getElementById('rpg-prism-text');
        var live = sheet && sheet.sheet;
        if (live) live.disabled = true;            // measure the originals
        try {
            for (var i = 0; i < roots.length; i++) if (roots[i].isConnected) tag(roots[i]);
        } finally {
            if (live) live.disabled = false;
        }
        setSheet('rpg-prism-text', scaleCSS());
    }

    function applyText(s) {
        factor = s.text / 100;
        if (factor === 1) { setSheet('rpg-prism-text', ''); return; }
        if (!document.body) return;
        rescale([document.body]);
        if (observer) return;
        observer = new MutationObserver(function (records) {
            if (factor === 1) return;
            records.forEach(function (r) {
                for (var i = 0; i < r.addedNodes.length; i++) {
                    if (r.addedNodes[i].nodeType === 1) queued.push(r.addedNodes[i]);
                }
            });
            if (!queued.length || pending) return;
            pending = setTimeout(function () {
                pending = 0;
                var batch = queued;
                queued = [];
                rescale(batch);
            }, 300);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    /* ---------------- apply ---------------- */

    var current = load();

    function apply(s) {
        current = s;
        setSheet('rpg-prism-theme', themeCSS(s));
        setSheet('rpg-prism-type', typographyCSS(s));
        applyText(s);
        if (refs) sync(s);
        if (pillEl) pillEl.hidden = !s.pill;
    }

    function update(patch) {
        var s = load();
        Object.keys(patch).forEach(function (k) { s[k] = patch[k]; });
        save(s, false);
        apply(s);
    }

    /* ---------------- panel ---------------- */

    var panel = null, pillEl = null, refs = null;

    function el(tag, attrs, kids) {
        var node = document.createElement(tag);
        if (attrs) Object.keys(attrs).forEach(function (k) {
            if (k === 'text') node.textContent = attrs[k];
            else node.setAttribute(k, attrs[k]);
        });
        (kids || []).forEach(function (k) { node.appendChild(k); });
        return node;
    }

    var PANEL_CSS = [
        '#rpg-prism,#rpg-prism *{box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}',
        '#rpg-prism{position:fixed;right:14px;bottom:58px;z-index:2147483600;width:min(300px,calc(100vw - 28px));',
        'max-height:min(78vh,760px);overflow:auto;padding:14px;border-radius:14px;',
        'background:#150a33;border:1px solid rgba(168,85,247,.5);color:#ece9ff;font-size:13px;line-height:1.45;',
        'box-shadow:0 18px 46px rgba(0,0,0,.55)}',
        '#rpg-prism[hidden],#rpg-prism-pill[hidden]{display:none!important}',
        '#rpg-prism h2{margin:0 0 4px;font-weight:700;font-size:14px;line-height:1.2;color:#e9d5ff}',
        '#rpg-prism .sub{margin:0 0 10px;font-size:11px;color:#9d92c9}',
        '#rpg-prism .row{display:flex;align-items:center;gap:8px;margin:9px 0}',
        '#rpg-prism .row>span{min-width:74px;font-size:12px;color:#b9b3d9}',
        '#rpg-prism select,#rpg-prism input[type=number]{flex:1;min-width:0;padding:5px 7px;border-radius:8px;',
        'border:1px solid rgba(168,85,247,.45);background:#1e1145;color:#ece9ff;font:inherit;font-size:12px}',
        '#rpg-prism input[type=range]{flex:1;min-width:0;accent-color:#a855f7}',
        '#rpg-prism input[type=color]{width:34px;height:26px;padding:0;border:1px solid rgba(168,85,247,.45);',
        'border-radius:7px;background:#1e1145}',
        '#rpg-prism output{min-width:44px;text-align:right;font-size:12px;font-variant-numeric:tabular-nums;color:#d6cffb}',
        '#rpg-prism label.check{display:flex;align-items:center;gap:8px;margin:7px 0;cursor:pointer;font-size:12.5px}',
        '#rpg-prism input[type=checkbox]{accent-color:#a855f7;width:15px;height:15px;margin:0}',
        '#rpg-prism .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0 2px}',
        '#rpg-prism button{padding:5px 8px;border-radius:8px;border:1px solid rgba(168,85,247,.45);',
        'background:rgba(168,85,247,.14);color:#ece9ff;font:inherit;font-size:11.5px;cursor:pointer}',
        '#rpg-prism button:hover{border-color:#a855f7}',
        '#rpg-prism .note{margin:10px 0 0;font-size:10.5px;color:#8f88b8}',
        '#rpg-prism .note a{color:#22d3ee;text-decoration:none}',
        '#rpg-prism fieldset{border:0;border-top:1px solid rgba(168,85,247,.25);margin:12px 0 0;padding:8px 0 0}',
        '#rpg-prism legend{padding:0;font-size:11px;color:#9d92c9;letter-spacing:.04em;text-transform:uppercase}',
        '#rpg-prism-pill{position:fixed;right:14px;bottom:14px;z-index:2147483599;display:inline-flex;',
        'align-items:center;gap:6px;padding:8px 13px;border-radius:999px;cursor:pointer;opacity:.85;',
        'background:rgba(21,10,51,.94);color:#ece9ff;border:1px solid rgba(168,85,247,.5);',
        'font:600 12.5px/1 system-ui,sans-serif;box-shadow:0 8px 22px rgba(0,0,0,.45)}',
        '#rpg-prism-pill:hover{opacity:1}'
    ].join('');

    function slider(label, key, min, max, step, suffix, s) {
        var input = el('input', { type: 'range', min: String(min), max: String(max), step: String(step) });
        input.value = s[key];
        var out = el('output', { text: s[key] + suffix });
        input.addEventListener('input', function () {
            out.textContent = input.value + suffix;
            update(makePatch(key, parseInt(input.value, 10)));
        });
        return { row: el('div', { 'class': 'row' }, [el('span', { text: label }), input, out]), input: input, out: out, suffix: suffix, key: key };
    }

    function makePatch(key, value) {
        var p = {};
        p[key] = value;
        return p;
    }

    function build() {
        setSheet('rpg-prism-css', PANEL_CSS);
        var s = load();

        panel = el('div', { id: 'rpg-prism', role: 'dialog', 'aria-label': 'Prism reading comfort' });
        panel.hidden = !onDemand;
        panel.appendChild(el('h2', { text: '🔺 Prism' }));
        panel.appendChild(el('p', { 'class': 'sub', text: 'Saved for ' + site }));

        var themeSel = document.createElement('select');
        THEMES.forEach(function (t) {
            var o = document.createElement('option');
            o.value = t.id;
            o.textContent = t.label;
            themeSel.appendChild(o);
        });
        themeSel.value = s.theme;
        themeSel.addEventListener('change', function () { update({ theme: themeSel.value }); });
        panel.appendChild(el('div', { 'class': 'row' }, [el('span', { text: 'Theme' }), themeSel]));

        var colours = el('div', { id: 'rpg-prism-colours' });
        var pickers = {};
        [['bg', 'Background'], ['fg', 'Text'], ['link', 'Links']].forEach(function (c) {
            var input = el('input', { type: 'color' });
            input.value = s[c[0]];
            input.addEventListener('input', function () { update(makePatch(c[0], input.value)); });
            pickers[c[0]] = input;
            colours.appendChild(el('div', { 'class': 'row' }, [el('span', { text: c[1] }), input]));
        });
        panel.appendChild(colours);

        var type = el('fieldset');
        type.appendChild(el('legend', { text: 'Type' }));
        var text = slider('Text size', 'text', 70, 200, 5, '%', s);
        var leading = slider('Line height', 'leading', 0, 100, 5, '', s);
        var spacing = slider('Letter space', 'spacing', 0, 100, 5, '', s);
        var width = slider('Line length', 'width', 0, 120, 5, 'ch', s);
        [text, leading, spacing, width].forEach(function (x) { type.appendChild(x.row); });

        var fontSel = document.createElement('select');
        [['page', 'Page\u2019s own font'], ['sans', 'System sans'], ['serif', 'Serif'],
         ['mono', 'Monospace'], ['legible', 'High legibility']].forEach(function (f) {
            var o = document.createElement('option');
            o.value = f[0];
            o.textContent = f[1];
            fontSel.appendChild(o);
        });
        fontSel.value = s.font;
        fontSel.addEventListener('change', function () { update({ font: fontSel.value }); });
        type.appendChild(el('div', { 'class': 'row' }, [el('span', { text: 'Font' }), fontSel]));
        panel.appendChild(type);

        var extras = el('fieldset');
        extras.appendChild(el('legend', { text: 'Comfort' }));
        var checks = {};
        [['underline', 'Underline every link'], ['calm', 'Stop animations'], ['pill', 'Show the 🔺 button']].forEach(function (c) {
            var cb = el('input', { type: 'checkbox' });
            cb.checked = !!s[c[0]];
            cb.addEventListener('change', function () { update(makePatch(c[0], cb.checked)); });
            checks[c[0]] = cb;
            extras.appendChild(el('label', { 'class': 'check' }, [cb, el('span', { text: c[1] })]));
        });

        var imgSel = document.createElement('select');
        [['normal', 'Show images'], ['dim', 'Dim images'], ['hidden', 'Hide images']].forEach(function (o) {
            var opt = document.createElement('option');
            opt.value = o[0];
            opt.textContent = o[1];
            imgSel.appendChild(opt);
        });
        imgSel.value = s.images;
        imgSel.addEventListener('change', function () { update({ images: imgSel.value }); });
        extras.appendChild(el('div', { 'class': 'row' }, [el('span', { text: 'Images' }), imgSel]));
        panel.appendChild(extras);

        var buttons = el('div', { 'class': 'grid' });
        var resetBtn = el('button', { type: 'button', text: 'Reset site' });
        resetBtn.addEventListener('click', function () { forget(); apply(load()); });
        var everywhereBtn = el('button', { type: 'button', text: 'Use everywhere' });
        everywhereBtn.title = 'Make the current settings the default on sites you have not set up yet.';
        everywhereBtn.addEventListener('click', function () {
            save(load(), true);
            everywhereBtn.textContent = 'Saved ✓';
            setTimeout(function () { everywhereBtn.textContent = 'Use everywhere'; }, 1500);
        });
        var closeBtn = el('button', { type: 'button', text: 'Close' });
        closeBtn.addEventListener('click', function () { toggle(); });
        buttons.appendChild(resetBtn);
        buttons.appendChild(everywhereBtn);
        buttons.appendChild(closeBtn);
        panel.appendChild(buttons);

        var note = el('p', { 'class': 'note' });
        note.appendChild(document.createTextNode('Alt+Shift+P opens this · Alt+Shift+O cycles the theme. Stays in this browser. '));
        note.appendChild(el('a', {
            href: 'https://rami.party/workshop/glamours/', target: '_blank', rel: 'noopener',
            text: 'About ↗'
        }));
        note.appendChild(el('span', { text: '  v' + VERSION }));
        panel.appendChild(note);

        pillEl = el('button', { id: 'rpg-prism-pill', type: 'button', 'aria-expanded': 'false' }, [
            el('span', { 'aria-hidden': 'true', text: '🔺' })
        ]);
        pillEl.appendChild(document.createTextNode(' Prism'));
        pillEl.addEventListener('click', toggle);
        pillEl.hidden = !s.pill;

        /* Mounted on <html>, not <body>: the repaint flattens `body *`, and
           the panel has no business being repainted along with the page. */
        var root = document.documentElement;
        root.appendChild(panel);
        root.appendChild(pillEl);

        refs = { theme: themeSel, colours: colours, pickers: pickers, font: fontSel,
                 images: imgSel, checks: checks, sliders: [text, leading, spacing, width] };
        sync(s);
    }

    function sync(s) {
        if (!refs) return;
        refs.theme.value = s.theme;
        refs.colours.hidden = s.theme !== 'custom';
        Object.keys(refs.pickers).forEach(function (k) { refs.pickers[k].value = s[k]; });
        refs.font.value = s.font;
        refs.images.value = s.images;
        Object.keys(refs.checks).forEach(function (k) { refs.checks[k].checked = !!s[k]; });
        refs.sliders.forEach(function (x) {
            if (document.activeElement !== x.input) x.input.value = s[x.key];
            x.out.textContent = s[x.key] + x.suffix;
        });
    }

    function toggle() {
        if (!panel) return;
        panel.hidden = !panel.hidden;
        if (pillEl) pillEl.setAttribute('aria-expanded', String(!panel.hidden));
        if (!panel.hidden) sync(load());
    }

    function cycleTheme() {
        var ids = THEMES.map(function (t) { return t.id; });
        var next = ids[(ids.indexOf(load().theme) + 1) % ids.length];
        update({ theme: next });
    }

    /* ---------------- boot ---------------- */

    try {
        Object.defineProperty(window, NS, {
            value: { version: VERSION, toggle: function () { toggle(); }, apply: function () { apply(load()); } },
            enumerable: false, configurable: true
        });
    } catch (e) { window[NS] = { toggle: toggle }; }

    apply(current);                                   // colours before first paint

    function start() {
        apply(load());                                // body exists now → text scaling
        if (IS_TOP) build();
        document.addEventListener('keydown', function (e) {
            if (!e.altKey || !e.shiftKey) return;
            if (e.code === 'KeyP') { e.preventDefault(); toggle(); }
            if (e.code === 'KeyO') { e.preventDefault(); cycleTheme(); }
        }, true);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();

    /* Other tabs and frames on this site follow along. */
    window.addEventListener('storage', function (e) {
        if (e.key === KEY) apply(load());
    });
})();
