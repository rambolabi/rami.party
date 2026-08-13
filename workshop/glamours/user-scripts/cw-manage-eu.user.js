// ==UserScript==
// @name         ConnectWise Manage · Comfort Glamour
// @namespace    https://rami.party/workshop/glamours/
// @version      1.11.5
// @description  Quality-of-life for ConnectWise Manage: seven themes, three that repaint the app in a full palette and four that filter it, a hover ticket preview with pickable columns plus the latest note, stale-ticket highlighting, one-click Change/Change/Change, a password-manager-friendly login, and true text-only scaling. Every tweak is a toggle; press Alt+Shift+G for the panel.
// @author       rami.party
// @license      MIT
// @match        https://*.myconnectwise.net/*
// @exclude      https://sandbox-eu.myconnectwise.net/*
// @icon         data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%230d0726'/%3E%3Cpath d='M50 18 L57 43 L82 50 L57 57 L50 82 L43 57 L18 50 L43 43 Z' fill='%23a855f7'/%3E%3Ccircle cx='75' cy='25' r='6' fill='%2322d3ee'/%3E%3C/svg%3E
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @homepageURL  https://rami.party/workshop/glamours/
// @supportURL   https://rami.party/workshop/glamours/
// @downloadURL  https://rami.party/workshop/glamours/user-scripts/cw-manage-eu.user.js
// @updateURL    https://rami.party/workshop/glamours/user-scripts/cw-manage-eu.user.js
// ==/UserScript==

/* --------------------------------------------------------------------------
   How this file is organised
   --------------------------------------------------------------------------
   ConnectWise Manage hosts its modules inside same-origin iframes, so this
   script deliberately runs in EVERY frame (no @noframes):

   • Ticket preview and text scaling both mount per frame: that is where the
     grids actually live.
   • The theme filter is applied to the top document ONLY. A CSS filter on
     the top <html> composites over iframe content too; filtering each frame
     as well would apply it twice.
   • Under an inverting theme, images/video get a counter-invert in every
     frame so photos stay natural, and so do our own overlays. The pale and
     greyscale themes do not invert, so they get no counter-invert.
   • The ✨ settings panel mounts only in the top frame. Settings live in the
     userscript manager's storage so one set of preferences covers every
     regional tenant, mirrored into localStorage whose 'storage' event syncs
     frames.
   -------------------------------------------------------------------------- */

(function () {
    'use strict';

    var IS_TOP = window.self === window.top;
    var VERSION = '1.11.5';              // keep in step with @version above
    var KEY = 'rpGlamourCw.v1';
    var COLS_KEY = 'rpGlamourCw.cols';   // columns of the grid last hovered
    var DEFAULTS = {
        theme: 'none',      // one of THEMES below
        lastTheme: 'goodit', // restored by the Alt+Shift+D toggle
        preview: true,      // hover a grid row → preview card
        previewMode: 'cursor', // 'cursor' (floats by the pointer) | 'inline' (under the row)
        previewFields: true, // list the row's columns in the card
        previewCols: [],    // column labels to LEAVE OUT of the card
        previewNotes: false, // fold Manage's own note tooltip into the card
        stale: false,       // colour rows nobody has touched lately
        staleDays: 5,
        staleColour: 'red', // red | amber | violet
        tripleChange: false, // Type = Change → Subtype + Item = Change
        navDark: false,     // keep the left menu bar dark
        login: true,        // login page helper
        loginCompany: '',   // auto-filled into #company
        loginUser: '',      // auto-filled into #username (the password is NEVER stored)
        zoom: 100,          // text-only scale %, 80 to 130
        pill: true          // show the floating ✨ button
    };

    /* Three of these repaint the app, the rest filter it.
       A filter is a recipe applied to the top <html>: cheap, and it keeps
       every hue where it was, which is why a red pill still reads as red.
       What it cannot do is tint the greys towards a brand colour, because
       reaching a green or a pink means rotating every hue by 95 or 275
       degrees, and a red priority that comes out green is worse than no
       theme at all. So the Good IT pair and Hot Pink take the other road
       and overwrite ConnectWise's own surfaces, colour by colour; they
       carry a Beta tag while that beds in.
       Daylight is saturation only: a contrast boost on a light UI crushes
       the pale greys Manage draws its borders and zebra rows with. */
    var THEMES = [
        { id: 'none',       label: 'ConnectWise default',             filter: '',                                                                  invert: false },
        { id: 'goodit',     label: 'Good IT · brand green (Beta)',    filter: '',                                                                  invert: false, paint: 'goodit' },
        { id: 'goodpurple', label: 'Good IT · brand purple (Beta)',   filter: '',                                                                  invert: false, paint: 'goodpurple' },
        { id: 'obsidian',   label: 'Obsidian · deep black',           filter: 'invert(1) hue-rotate(180deg) contrast(.92)',                         invert: true },
        { id: 'hotpink',    label: 'Hot Pink · bright rose (Beta)',   filter: '',                                                                  invert: false, paint: 'hotpink' },
        { id: 'ember',      label: 'Ember · warm amber',              filter: 'invert(.9) hue-rotate(180deg) sepia(.28) saturate(1.15)',            invert: true },
        { id: 'daylight',   label: 'Daylight · pale, vivid',          filter: 'saturate(1.6)',                                                     invert: false },
        { id: 'graphite',   label: 'Graphite · soft greyscale',       filter: 'grayscale(1) invert(.22) contrast(1.06)',                           invert: false }
    ];
    function themeById(id) {
        for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return THEMES[i];
        return THEMES[0];
    }

    var MOVED = { midnight: 'goodit', slate: 'hotpink' };

    /* ---------------- settings I/O ----------------
       Regional tenants (eu., na., …) are separate origins, so localStorage on
       its own would mean setting the glamour up again on each. The manager's
       storage spans them; localStorage is kept in step because its 'storage'
       event is what syncs the iframes live. */

    var GM_OK = typeof GM_getValue === 'function' && typeof GM_setValue === 'function';
    var memFallback = null;

    function readRaw() {
        var raw = null;
        if (GM_OK) { try { raw = GM_getValue(KEY, null); } catch (e) { /* ignore */ } }
        if (!raw) { try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; } }
        return raw;
    }

    function writeRaw(raw) {
        if (GM_OK) { try { GM_setValue(KEY, raw); } catch (e) { /* ignore */ } }
        try { localStorage.setItem(KEY, raw); } catch (e) { memFallback = raw; }
    }

    function loadSettings() {
        var s = {};
        try {
            var raw = readRaw() || memFallback;
            /* Only an object survives: `k in 5` throws, and this runs outside
               the catch, so a corrupted blob would kill the whole script. */
            if (raw) {
                var parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') s = parsed;
            }
        } catch (e) { s = {}; }
        var out = {};
        for (var k in DEFAULTS) out[k] = (k in s) ? s[k] : DEFAULTS[k];
        if (s.dark === true && !('theme' in s)) { out.theme = 'goodit'; out.lastTheme = 'goodit'; } // v1.0 migration
        /* v1.10 rebuilt both of those slots; a stored id nobody answers to
           would otherwise fall back to no theme at all. */
        if (MOVED[out.theme]) out.theme = MOVED[out.theme];
        if (MOVED[out.lastTheme]) out.lastTheme = MOVED[out.lastTheme];
        /* any other unshipped id would leave the panel's theme select blank */
        if (themeById(out.theme).id !== out.theme) out.theme = DEFAULTS.theme;
        if (themeById(out.lastTheme).id !== out.lastTheme) out.lastTheme = DEFAULTS.lastTheme;
        if (!Array.isArray(out.previewCols)) out.previewCols = [];
        out.zoom = Math.max(80, Math.min(130, parseInt(out.zoom, 10) || 100));
        out.staleDays = Math.max(1, Math.min(365, parseInt(out.staleDays, 10) || 5));
        return out;
    }

    function saveSettings(s) {
        writeRaw(JSON.stringify(s));
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

    var CSS = {
        preview: [
            '#rpg-preview{position:fixed;z-index:2147482000;box-sizing:border-box;',
            'max-width:440px;min-width:230px;padding:9px 12px 10px;border-radius:10px;',
            'pointer-events:none;background:#141a24;color:#e8edf6;',
            'border:1px solid #3b82f6;border-left:3px solid #3b82f6;',
            'box-shadow:0 10px 30px rgba(0,0,0,.5);',
            'font:400 12.5px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;',
            'opacity:0;transition:opacity .12s ease}',
            '#rpg-preview[data-show]{opacity:1}',
            '#rpg-preview[data-mode="inline"]{position:absolute;max-width:none;',
            'box-shadow:0 6px 18px rgba(0,0,0,.4)}',
            '#rpg-preview b{display:block;margin:0 0 6px;font:700 13px/1.35 inherit;color:#93c5fd}',
            '#rpg-preview dl{display:grid;grid-template-columns:auto minmax(0,1fr);',
            'gap:2px 10px;margin:0}',
            '#rpg-preview dt{color:#9fb0c9;font-size:11.5px;white-space:nowrap}',
            '#rpg-preview dd{margin:0;overflow-wrap:anywhere}',
            '#rpg-preview .rpg-pv-notes{margin-top:9px;padding-top:8px;',
            'border-top:1px solid rgba(159,176,201,.3)}',
            '#rpg-preview .rpg-pv-notes p{margin:6px 0 0;white-space:pre-wrap;',
            'max-height:220px;overflow:hidden;color:#cfd9e8}',
            '#rpg-preview .rpg-pv-wait{color:#8ea3bd;font-style:italic}',
            '@media (prefers-reduced-motion:reduce){#rpg-preview{transition:none}}'
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

    /* The dark filters keep hue (invert + hue-rotate 180), so a red tint
       still reads as red once one is on, just lighter. Graphite is greyscale
       by definition and turns these into shades of grey; the bar down the
       side is what marks the row there. */
    var STALE_COLOURS = {
        red: { label: 'Red', bar: '#dc2626', tint: 'rgba(220,38,38,.16)' },
        amber: { label: 'Amber', bar: '#d97706', tint: 'rgba(217,119,6,.18)' },
        violet: { label: 'Violet', bar: '#8b5cf6', tint: 'rgba(139,92,246,.18)' }
    };

    /* The attribute is repeated to lift the rule to (0,3,1). Manage paints its
       own grid cells from long !important selectors, and a single attribute
       cannot outrank those: the row would be marked and stay uncoloured. */
    function staleCSS(name) {
        var c = STALE_COLOURS[name] || STALE_COLOURS.red;
        var sel = '[data-rpg-stale][data-rpg-stale][data-rpg-stale]';
        return sel + '>td{background-color:' + c.tint + '!important}' +
            sel + '>td>div{background-color:transparent!important}' +
            sel + '>td:first-child{box-shadow:inset 3px 0 0 ' + c.bar + '!important}';
    }

    /* ---------------- text-only scaling ----------------
       Not page zoom: boxes, icons, paddings and grid columns keep their size,
       only the glyphs grow. Every element is tagged once with its ORIGINAL
       font size, and a small generated stylesheet maps each distinct original
       size to the scaled one. So changing the percentage rewrites a handful of
       rules instead of re-walking the DOM, and re-applying never compounds. */

    var FS_ATTR = 'data-rpgfs';
    var fsBuckets = {};
    var fsFactor = 1;
    var fsObserver = null;
    var fsPending = 0;
    var fsQueue = [];

    function tagFontSizes(root) {
        if (root.nodeType === 1 && root.closest && root.closest('#rpg-root,#rpg-preview')) return;
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
            acceptNode: function (n) {
                if (n.id === 'rpg-root' || n.id === 'rpg-preview') return NodeFilter.FILTER_REJECT;
                var t = n.tagName;
                if (t === 'SCRIPT' || t === 'STYLE' || t === 'LINK' || t === 'META' ||
                    t === 'HEAD' || t === 'TITLE' || t === 'IFRAME') return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        var n = root.nodeType === 1 ? root : walker.nextNode();
        while (n) {
            if (!n.hasAttribute(FS_ATTR)) {
                var px = parseFloat(getComputedStyle(n).fontSize);
                if (px) {
                    var bucket = String(Math.round(px * 2) / 2);
                    n.setAttribute(FS_ATTR, bucket);
                    fsBuckets[bucket] = true;
                }
            }
            n = walker.nextNode();
        }
    }

    /* The attribute selector is repeated on purpose: Manage pins its grid text
       with `.mm_grid > div > div table > tbody > tr > td{font-size:11px!important}`,
       and one attribute selector loses that tie however important it is. */
    function fsSheetCSS() {
        var out = [];
        for (var v in fsBuckets) {
            var sel = '[' + FS_ATTR + '="' + v + '"]';
            out.push(sel + sel + sel + '{font-size:' +
                (Math.round(parseFloat(v) * fsFactor * 100) / 100) + 'px!important}');
        }
        return out.join('');
    }

    /* Our own sheet is switched off around the measuring pass, so the sizes
       read back are the page's originals and re-applying never compounds. */
    function rescale(roots) {
        var sheet = document.getElementById('rpg-textscale');
        var live = sheet && sheet.sheet;
        if (live) live.disabled = true;
        try {
            for (var i = 0; i < roots.length; i++) {
                if (roots[i].isConnected) tagFontSizes(roots[i]);
            }
        } finally {
            if (live) live.disabled = false;
        }
        setSheet('rpg-textscale', fsSheetCSS());
    }

    function applyTextScale(s) {
        fsFactor = s.zoom / 100;
        if (fsFactor === 1) {
            setSheet('rpg-textscale', '');
            return;
        }
        if (!document.body) return;
        rescale([document.body]);
        if (fsObserver) return;
        fsObserver = new MutationObserver(function (records) {
            if (fsFactor === 1) return;
            records.forEach(function (r) {
                for (var i = 0; i < r.addedNodes.length; i++) {
                    if (r.addedNodes[i].nodeType === 1) fsQueue.push(r.addedNodes[i]);
                }
            });
            /* Nodes arriving while a batch waits join the queue instead of
               being dropped, which used to leave late grids unscaled. */
            if (!fsQueue.length || fsPending) return;
            fsPending = setTimeout(function () {
                fsPending = 0;
                var batch = fsQueue;
                fsQueue = [];
                if (fsFactor === 1) return;   // zoom went back to 100% while this batch waited
                rescale(batch);
            }, 350);
        });
        fsObserver.observe(document.body, { childList: true, subtree: true });
    }

    /* Top frame only. The filter makes <html> the containing block for
       position:fixed children: on ConnectWise the shell does not scroll,
       so nothing drifts. Under an inverting theme #rpg-root is counter-
       inverted to keep the panel in its true colours. No background is set
       here: the page canvas is filtered along with everything else, so
       painting it dark would light it back up: that was the pale wash
       behind half-empty screens. */
    function themeRootCSS(t) {
        return 'html{filter:' + t.filter + '!important}' +
            (t.invert ? '#rpg-root{filter:invert(1) hue-rotate(180deg)}' : '');
    }

    /* Manage's left menu is the one dark surface it ships (#212121 with #ccc
       text), so an inverting theme turns it into a pale column. Those colours
       are written pre-filter: the page filter turns them back into light text
       on near-black. Themes that do not invert take the direct colours
       instead. Only the <svg> gets a fill, never the paths: half of them
       carry fill="none" and would become solid blocks. */
    var NAV_SEL = 'div:has(> .cw-lcm-section)';

    function navCSS(themed) {
        var bg = themed ? '#f2f2f2' : '#12141a';
        var fg = themed ? '#1f2229' : '#cfd3da';
        return NAV_SEL + '{background:' + bg + '!important}' +
            NAV_SEL + ' .gwt-Label{color:' + fg + '!important}' +
            NAV_SEL + ' svg{fill:' + fg + '!important}';
    }

    /* ---------------- repainted themes ----------------
       ConnectWise ships no theming, so these overwrite its colours instead of
       filtering them. Almost everything in Manage is already transparent and
       inherits from a handful of surfaces, so the sheet flattens the lot and
       then lifts those few back out.

       Flatten and lifts are all !important, which means specificity decides
       rather than order, so they are written to the same weight and the lifts
       come second. Both carry the same guard: every overlay either script
       mounts is called rpg-something, and those keep their own colours. */

    var SKIP = ':not([id^="rpg-"]):not([id^="rpg-"] *)';
    var LIFT = ':not(svg)' + SKIP;              // the extra :not is weight, not meaning
    var PICK_ATTR = 'data-rpg-picked';          // our own "this row is ticked" mark

    /* Good IT green is the brand sheet: 3302 deep green surfaces, 9222 warm
       off-white text, 7464 muted teal, with 7452 periwinkle (#9898FF) as THE
       accent: links, row hover and selection all show it. Good IT purple is
       the same sheet reversed, periwinkle-dark surfaces with the mint 7478 as
       accent. Hot Pink is the same shape in rose. Hovering a row always marks
       it in the theme's accent. */
    var PALETTES = {
        goodit: {
            bg: '#003731', surface: '#0C4840', raised: '#2A524D',
            fg: '#EAE4DD', muted: '#95B6B5', line: 'rgba(149,182,181,.34)',
            link: '#9898FF', accent: '#9898FF', hover: 'rgba(152,152,255,.20)',
            selected: 'rgba(152,152,255,.30)'
        },
        goodpurple: {
            bg: '#181833', surface: '#232349', raised: '#2D2D5A',
            fg: '#EAE4DD', muted: '#B4B4E5', line: 'rgba(152,152,255,.34)',
            link: '#95F9A9', accent: '#95F9A9', hover: 'rgba(149,249,169,.16)',
            selected: 'rgba(149,249,169,.26)'
        },
        hotpink: {
            bg: '#33061F', surface: '#4A0B2C', raised: '#5C1039',
            fg: '#FFE6F2', muted: '#F7A8CE', line: 'rgba(255,105,180,.34)',
            link: '#FF69B4', accent: '#FFC2E0', hover: 'rgba(255,194,224,.16)',
            selected: 'rgba(255,194,224,.28)'
        }
    };

    function paintCSS(p) {
        function sel(list) {
            var out = [];
            for (var i = 0; i < list.length; i++) out.push('html body ' + list[i] + LIFT);
            return out.join(',');
        }
        return [
            /* accent-color inherits, so one declaration reaches every native
               checkbox and radio in the app. */
            'html,body{background:' + p.bg + '!important;color:' + p.fg + '!important;',
            'accent-color:' + p.link + ';scrollbar-color:' + p.muted + ' ' + p.surface + '}',
            'html body *:not(svg):not(svg *)' + SKIP + '{background-color:transparent!important;',
            'color:' + p.fg + '!important;border-color:' + p.line + '!important;',
            'box-shadow:none!important;text-shadow:none!important}',
            /* Manage paints its pod headers with a pale gradient, which a
               background COLOUR cannot cover. Two kinds of element keep their
               image because it IS their content: empty ones (a priority chip
               or status swatch is a coloured one-pixel gif) and anything
               check-ish, because the grid checkbox is an &nbsp;-filled div
               drawn entirely by a sprite, and this rule once deleted every
               checkbox on the board. Inline backgrounds are real pictures. */
            'html body *:not(svg):not(svg *):not(:empty):not([class*="check" i]):not([style*="background-image" i])' + SKIP +
                '{background-image:none!important}',
            /* GXT mounts every floating layer straight on <body>: the left
               menu's flyouts, the navigation search results, icon menus,
               combo dropdown lists, windows. The flatten would turn them all
               to glass and a hover menu then draws its text over whatever is
               behind it, so every top-level layer is made opaque again. The
               ones GXT is stacking carry an inline z-index and read as
               raised surfaces with depth; the rest (the shell) is the page.
               The modal mask is an empty div and must stay see-through. */
            'html body>*:not(svg):not(svg *):not(:empty)' + SKIP +
                '{background-color:' + p.bg + '!important}',
            'html body>[style*="z-index"]:not(svg):not(svg *):not(:empty)' + SKIP +
                '{background-color:' + p.raised + '!important;' +
                'box-shadow:0 14px 36px rgba(0,0,0,.55)!important;' +
                'border:1px solid ' + p.line + '!important}',
            /* things that have to read as a surface rather than as the page;
               native checkboxes and radios stay native, accent-color already
               dressed them, and a painted box would only hide their state */
            sel(['input:not([type="checkbox"]):not([type="radio"])', 'textarea', 'select', '.mm_comboBox', '.mm_button']) +
                '{background-color:' + p.surface + '!important}',
            /* The grid tick boxes are sprite-drawn divs made for a white
               page, so instead of patching the sprite they are redrawn in the
               palette: an outlined box when clear, the accent with a tick
               when the row is picked. The tick is two borders rotated 45
               degrees, in the page colour so it cuts out of the accent. */
            sel(['.x-grid-row-checker', '.x-grid-hd-checker']) +
                '{background-image:none!important;background-color:transparent!important;',
            'border:1.5px solid ' + p.muted + '!important;border-radius:4px!important;',
            'box-sizing:border-box!important;position:relative!important}',
            sel(['tr[class*="selected" i] .x-grid-row-checker', 'tr[aria-selected="true"] .x-grid-row-checker',
                 'tr[' + PICK_ATTR + '] .x-grid-row-checker']) +
                '{border-color:transparent!important;background-color:transparent!important}',
            /* raw, not through sel(): a :not() after ::after is invalid and
               the parser would drop the whole mark */
            'html body tr[class*="selected" i] .x-grid-row-checker::after,',
            'html body tr[aria-selected="true"] .x-grid-row-checker::after,',
            'html body tr[' + PICK_ATTR + '] .x-grid-row-checker::after,',
            'html body [class*="checker-on"].x-grid-hd-checker::after',
            '{content:"\\2713";position:absolute;left:50%;top:50%;transform:translate(-50%,-54%);',
            'font:900 15px/1 system-ui,sans-serif;color:' + p.link + '}',
            /* Ticked rows: Manage's own selection wash is flattened away, so
               the row is washed AND boxed in the accent, with the checkmark
               above replacing the checkbox. The frame is drawn with inset
               shadows on the cells: a border would move the layout, and a
               table row cannot reliably carry an outline of its own. */
            sel(['tr[class*="selected" i]', 'tr[aria-selected="true"]', 'tr[' + PICK_ATTR + ']']) +
                '{background-color:' + p.selected + '!important}',
            sel(['tr[class*="selected" i]>td', 'tr[aria-selected="true"]>td', 'tr[' + PICK_ATTR + ']>td']) +
                '{box-shadow:inset 0 2px 0 ' + p.link + ',inset 0 -2px 0 ' + p.link + '!important}',
            sel(['tr[class*="selected" i]>td:first-child', 'tr[aria-selected="true"]>td:first-child',
                 'tr[' + PICK_ATTR + ']>td:first-child']) +
                '{box-shadow:inset 0 2px 0 ' + p.link + ',inset 0 -2px 0 ' + p.link + ',inset 3px 0 0 ' + p.link + '!important}',
            sel(['tr[class*="selected" i]>td:last-child', 'tr[aria-selected="true"]>td:last-child',
                 'tr[' + PICK_ATTR + ']>td:last-child']) +
                '{box-shadow:inset 0 2px 0 ' + p.link + ',inset 0 -2px 0 ' + p.link + ',inset -3px 0 0 ' + p.link + '!important}',
            sel(['th', '.cw-ml-header']) + '{background-color:' + p.raised + '!important}',
            /* GXT floats its windows straight on <body>, over everything */
            sel(['.cw-gxt-wnd']) + '{background-color:' + p.raised + '!important;' +
                'border:1px solid ' + p.line + '!important;box-shadow:0 18px 44px rgba(0,0,0,.55)!important}',
            sel(['a', 'a *']) + '{color:' + p.link + '!important}',
            sel(['.mm_podElementLabel', '.mm_podElementLabel *']) + '{color:' + p.muted + '!important}',
            /* No zebra: a row stripe would have to outweigh the flatten, and
               anything that heavy also outranks the stale highlight. The row
               borders carry the separation instead. */
            sel(['tr.cw-ml-row:hover']) + '{background-color:' + p.hover + '!important}',
            NAV_SEL + '{background:' + p.raised + '!important}',
            NAV_SEL + ' svg{fill:' + p.muted + '!important}',
            '::placeholder{color:' + p.muted + '!important;opacity:1!important}',
            '::selection{background:' + p.accent + '!important;color:' + p.bg + '!important}'
        ].join('');
    }

    /* The preview card is ours, so it is not repainted with the page: it is
       given the palette directly. */
    function previewTint(p) {
        return '#rpg-preview{background:' + p.raised + ';color:' + p.fg + ';border-color:' + p.link + '}' +
            '#rpg-preview b{color:' + p.link + '}' +
            '#rpg-preview dt,#rpg-preview .rpg-pv-wait{color:' + p.muted + '}' +
            '#rpg-preview .rpg-pv-notes p{color:' + p.fg + '}' +
            '#rpg-preview .rpg-pv-notes{border-top-color:' + p.line + '}';
    }

    /* ---------------- picked rows under the painted themes ----------------
       When a row is ticked, Manage adds a class to it and swaps the checker
       sprite, but in this build that class is compiler-generated, so CSS
       cannot name it, and the flatten wipes the colour it painted. Selection
       is re-detected instead: the readable hooks are tried first, and beyond
       those every row's checker is compared against a baseline signature
       taken once while the whole grid agreed (nothing ticked). A checker
       that no longer matches the baseline is a ticked one: that reads GXT's
       own sprite swap without knowing what it is called. Rows are marked
       with our own attribute, which is what the palette styles. */
    var pickBaseline = null;
    var pickChannelLive = false;   // a checker has been seen deviating at least once
    var pickTimer = 0;

    function checkerSig(node) {
        var cs = getComputedStyle(node);
        return node.className + '|' + cs.backgroundImage + '|' + cs.backgroundPosition;
    }

    /* Our own sheet forces the checker's image off, which also blindfolds the
       comparison: GXT's checked state can be nothing but a different sprite
       URL. So the signatures are read with the paint sheet briefly disabled,
       the same trick the text scaler uses to read original font sizes. */
    function readSigs(rows) {
        var sheet = document.getElementById('rpg-paint');
        var live = sheet && sheet.sheet;
        var sigs = [], counts = {}, withChecker = 0;
        if (live) live.disabled = true;
        try {
            for (var i = 0; i < rows.length; i++) {
                var c = rows[i].querySelector('.x-grid-row-checker');
                var sig = null;
                if (c) { sig = checkerSig(c); counts[sig] = (counts[sig] || 0) + 1; withChecker++; }
                sigs.push(sig);
            }
        } finally {
            if (live) live.disabled = false;
        }
        return { sigs: sigs, counts: counts, withChecker: withChecker };
    }

    function pickSweep() {
        if (!themeById(CUR.theme).paint) return;
        var rows = document.querySelectorAll('tr[class*="ml-row"]');
        if (!rows.length) return;
        var read = readSigs(rows);
        var sigs = read.sigs, counts = read.counts;
        if (!pickBaseline && read.withChecker >= 3) {
            var uniform = null, many = false;
            for (var k in counts) { if (uniform) { many = true; break; } uniform = k; }
            var anyStd = false;
            for (var s = 0; s < rows.length; s++) {
                if (/selected/i.test(rows[s].className) || rows[s].getAttribute('aria-selected') === 'true') { anyStd = true; break; }
            }
            if (uniform && !many && !anyStd) pickBaseline = uniform;
        }
        for (var j = 0; j < rows.length; j++) {
            var row = rows[j];
            var std = /selected/i.test(row.className) || row.getAttribute('aria-selected') === 'true';
            if (std) { row.setAttribute(PICK_ATTR, ''); continue; }
            /* Without a baseline there is nothing to compare against, so the
               click bookkeeping's marks are left standing rather than wiped. */
            if (!pickBaseline || !sigs[j]) continue;
            var deviates = sigs[j] !== pickBaseline;
            if (deviates) pickChannelLive = true;
            /* GXT also restyles the checker under the pointer, so a hovered
               row is only trusted when it was already marked. */
            var hovered = /over|hover/i.test(row.className) || row.matches(':hover');
            if (deviates && (!hovered || row.hasAttribute(PICK_ATTR))) row.setAttribute(PICK_ATTR, '');
            /* An unmark needs proof this build's selection shows on the
               checker at all, or the sweep would erase the click marks. */
            else if (!deviates && pickChannelLive && !hovered) row.removeAttribute(PICK_ATTR);
        }
    }

    function clearPicked() {
        var marked = document.querySelectorAll('[' + PICK_ATTR + ']');
        for (var i = 0; i < marked.length; i++) marked[i].removeAttribute(PICK_ATTR);
    }

    function schedulePickSweep() {
        clearTimeout(pickTimer);
        pickTimer = setTimeout(pickSweep, 150);
    }

    function initPickWatch() {
        if (!document.body) return;
        /* The click is also mirrored directly, so the mark appears the moment
           the user acts even where the signature channel has no baseline:
           checker click toggles that row, header checker toggles the board,
           a plain row click selects that one row, Ctrl keeps the others. */
        document.addEventListener('click', function (e) {
            if (!themeById(CUR.theme).paint) return;
            var t = e.target;
            if (!t || !t.closest || t.closest('#rpg-root,#rpg-preview')) return;
            var checker = t.closest('.x-grid-row-checker,.x-grid-hd-checker');
            var row = t.closest('tr[class*="ml-row"]');
            if (checker && !row) {
                var rows = document.querySelectorAll('tr[class*="ml-row"]');
                var any = document.querySelector('tr[' + PICK_ATTR + ']');
                for (var i = 0; i < rows.length; i++) {
                    if (any) rows[i].removeAttribute(PICK_ATTR);
                    else rows[i].setAttribute(PICK_ATTR, '');
                }
            } else if (checker && row) {
                if (row.hasAttribute(PICK_ATTR)) row.removeAttribute(PICK_ATTR);
                else row.setAttribute(PICK_ATTR, '');
            } else if (row && !t.closest('a,button,input,select,textarea')) {
                if (!e.ctrlKey && !e.metaKey) {
                    var marked = document.querySelectorAll('tr[' + PICK_ATTR + ']');
                    for (var m = 0; m < marked.length; m++) {
                        if (marked[m] !== row) marked[m].removeAttribute(PICK_ATTR);
                    }
                }
                row.setAttribute(PICK_ATTR, '');
            }
            schedulePickSweep();               // the sweep reconciles with GXT's own state
        }, true);
        document.addEventListener('keyup', function () {
            if (themeById(CUR.theme).paint) schedulePickSweep();
        }, true);
        setInterval(function () { if (themeById(CUR.theme).paint) pickSweep(); }, 2500);
        schedulePickSweep();
    }

    /* ---------------- apply settings ---------------- */

    var CUR = DEFAULTS;                          // hot-path copy, refreshed by apply()

    function apply(s) {
        CUR = s;
        var theme = themeById(s.theme);
        var palette = theme.paint ? PALETTES[theme.paint] : null;
        setSheet('rpg-dark-media', theme.invert ? CSS.darkMedia : '');
        if (IS_TOP) setSheet('rpg-dark-root', theme.filter ? themeRootCSS(theme) : '');
        /* The filter is the top frame's business, but a repaint has to reach
           every frame: that is where the grids are. */
        setSheet('rpg-paint', palette ? paintCSS(palette) : '');
        if (palette) schedulePickSweep(); else clearPicked();
        setSheet('rpg-nav', (!palette && s.navDark) ? navCSS(!!theme.invert) : '');
        setSheet('rpg-login', s.login ? CSS.login : '');
        /* Our overlay lives inside the inverted page, so it needs the same
           counter-invert the panel gets. */
        setSheet('rpg-preview-css', s.preview
            ? CSS.preview
                + (theme.invert ? '#rpg-preview{filter:invert(1) hue-rotate(180deg)}' : '')
                + (palette ? previewTint(palette) : '')
            : '');
        if (!s.preview) hidePreview();
        setSheet('rpg-stale', s.stale ? staleCSS(s.staleColour) : '');
        if (!s.stale) clearStaleMarks();
        applyTextScale(s);
        if (IS_TOP) syncPanel(s);
    }

    /* ---------------- ticket preview ----------------
       Manage truncates almost every grid cell, so reading a row means opening
       the ticket. This shows the row's own full contents on hover instead:
       no request, no navigation, nothing to undo. */

    var pvEl = null, pvTimer = 0, pvRow = null, pvHoverRow = null;

    function pvClean(s) { return (s || '').replace(/\s+/g, ' ').trim(); }

    /* Cells are clipped with an ellipsis; the untruncated string usually hides
       in a title attribute on the cell or on the link inside it. */
    function pvFull(node) {
        var t = node.getAttribute && node.getAttribute('title');
        if (!t && node.querySelector) {
            var holder = node.querySelector('[title]');
            if (holder) t = holder.getAttribute('title');
        }
        return pvClean(t || node.textContent);
    }

    function rowCells(row) {
        var out = [];
        for (var i = 0; i < row.children.length; i++) {
            var c = row.children[i];
            var role = c.getAttribute && c.getAttribute('role');
            if (c.tagName === 'TD' || c.tagName === 'TH' ||
                role === 'gridcell' || role === 'cell' || role === 'rowheader') out.push(c);
        }
        return out;
    }

    /* Leaf elements carrying text, in document order, Manage renders each
       column header as its own <span> inside a header strip. */
    function leafElements(box) {
        var out = [];
        var nodes = box.querySelectorAll('*');
        for (var i = 0; i < nodes.length; i++) {
            if (!nodes[i].children.length && pvClean(nodes[i].textContent)) out.push(nodes[i]);
        }
        return out;
    }

    /* The guard that keeps the card off the rest of the app: a row only
       previews if we can resolve real column headers for its table. Manage
       builds pods, toolbars and page furniture out of tables too, and none
       of those have a header strip. */
    var HEADER_SEL = '[class*="ml-header"],[class*="grid-header"],[class*="gridHeader"],[class*="columnHeader"]';

    function headerCells(row) {
        var table = row.closest && row.closest('table');
        if (!table) return [];
        if (table.tHead && table.tHead.rows.length) {
            var head = rowCells(table.tHead.rows[table.tHead.rows.length - 1]);
            if (head.length >= 3) return head;
        }
        for (var scope = table, i = 0; scope && i < 6; scope = scope.parentElement, i++) {
            var hdr = scope.querySelector(HEADER_SEL);
            if (hdr && !hdr.contains(row)) {
                var leaves = leafElements(hdr);
                if (leaves.length >= 3) return leaves;
            }
        }
        return [];
    }

    /* Headers and body cells live in different elements (Manage draws the
       column strip as a sibling div), so pair them by horizontal position.
       That survives leading checkbox columns, trailing filler cells and
       hidden columns, where counting from either end does not. */
    function alignFields(cells, heads) {
        var cr = cells.map(function (c) { return c.getBoundingClientRect(); });
        var hr = heads.map(function (h) { return h.getBoundingClientRect(); });
        var out = [];
        var haveGeometry = cr.some(function (r) { return r.width > 0; }) &&
            hr.some(function (r) { return r.width > 0; });

        if (haveGeometry) {
            for (var i = 0; i < heads.length; i++) {
                if (!hr[i].width) continue;
                var centre = hr[i].left + hr[i].width / 2;
                for (var j = 0; j < cells.length; j++) {
                    if (cr[j].width && centre >= cr[j].left && centre < cr[j].right) {
                        out.push({ label: pvClean(heads[i].textContent), value: pvFull(cells[j]) });
                        break;
                    }
                }
            }
            if (out.length >= 3) return out;
            out = [];
        }

        var offset = (cells.length > heads.length && !pvClean(cells[0].textContent)) ? 1 : 0;
        for (var k = 0; k < heads.length; k++) {
            if (cells[k + offset]) {
                out.push({ label: pvClean(heads[k].textContent), value: pvFull(cells[k + offset]) });
            }
        }
        return out;
    }

    function findRow(node) {
        for (var cur = node, i = 0; cur && cur.nodeType === 1 && i < 12; cur = cur.parentElement, i++) {
            if (cur.id === 'rpg-preview' || cur.id === 'rpg-root') return null;
            var role = cur.getAttribute && cur.getAttribute('role');
            if (cur.tagName === 'TR' || role === 'row') return cur;
        }
        return null;
    }

    /* Column labels of the grid last hovered, so the panel can offer them.
       Published through localStorage because the panel may live in another
       frame from the grid. */
    function publishColumns(labels) {
        try {
            var prev = localStorage.getItem(COLS_KEY);
            var next = JSON.stringify(labels);
            if (prev !== next) {
                localStorage.setItem(COLS_KEY, next);
                if (IS_TOP && panelRefs) syncColumnPicker(labels);
            }
        } catch (e) { /* private mode */ }
    }

    function buildPreview(row) {
        var cells = rowCells(row);
        if (cells.length < 4) return null;
        if (cells.every(function (c) {
            return c.tagName === 'TH' || c.getAttribute('role') === 'columnheader';
        })) return null;

        var heads = headerCells(row);
        if (heads.length < 3) return null;                  // not a real grid row
        var all = alignFields(cells, heads);
        if (all.length < 3) return null;
        publishColumns(all.map(function (f) { return f.label; }));

        var fields = all.filter(function (f) { return f.value; });
        if (fields.length < 3) return null;                 // spacer or filter row

        function pick(re) {
            for (var j = 0; j < fields.length; j++) if (re.test(fields[j].label)) return fields[j];
            return null;
        }
        var summary = pick(/summary|description|subject/i);
        var ticket = pick(/ticket\s*#|^#$|^id$/i);
        var link = row.querySelector('a');
        var heading = (summary && summary.value) || pvClean(link && link.textContent) || fields[0].value;
        if (ticket && ticket.value) heading = '#' + ticket.value + ' \u00b7 ' + heading;

        var hidden = CUR.previewCols || [];
        var card = document.createElement('div');
        card.appendChild(el('b', { text: heading.slice(0, 200) }));
        if (CUR.previewFields) {
            var dl = document.createElement('dl');
            var shown = 0;
            fields.forEach(function (f) {
                if (f === summary || f === ticket) return;
                if (hidden.indexOf(f.label) !== -1) return;
                dl.appendChild(el('dt', { text: f.label.slice(0, 40) }));
                dl.appendChild(el('dd', { text: f.value.length > 320 ? f.value.slice(0, 320) + '\u2026' : f.value }));
                shown++;
            });
            if (shown) card.appendChild(dl);
        }
        return card;
    }

    /* ---------------- stale ticket highlight ----------------
       Rows whose "Last Update" is older than N days get tinted, so a board
       full of forgotten tickets shows itself at a glance. */

    var STALE_ATTR = 'data-rpg-stale';
    /* Whatever the tenant calls the column, in the languages Manage ships. */
    var STALE_COL = /last\s*upd|last\s*activ|updated|laatst|bijgewerkt|gewijzigd|zuletzt|aktualis|ge\u00e4ndert|derni|modifi|\u00faltima|actualiz/i;
    var DATE_RE = /(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/;

    /* Manage renders dates in the tenant's format; day-first here (30/05/2026),
       and a first number above 12 proves it either way. */
    function parseCellDate(text) {
        var m = DATE_RE.exec(text || '');
        if (!m) return null;
        var a = parseInt(m[1], 10), b = parseInt(m[2], 10), y = parseInt(m[3], 10);
        var day = a, month = b;
        if (a <= 12 && b > 12) { day = b; month = a; }
        var d = new Date(y, month - 1, day);
        /* Date rolls 31/02 or a 13th month into the next one: that is a
           serial number in the cell, not a date, and must not mark the row. */
        return (d.getFullYear() === y && d.getMonth() === month - 1 && d.getDate() === day) ? d : null;
    }

    function clearStaleMarks() {
        var marked = document.querySelectorAll('[' + STALE_ATTR + ']');
        for (var i = 0; i < marked.length; i++) marked[i].removeAttribute(STALE_ATTR);
    }

    /* What the last sweep managed, so the panel can say why nothing is tinted
       instead of leaving you guessing. Frames without a grid stay quiet rather
       than overwriting the answer from the frame that has one. */
    var STALE_STATE_KEY = 'rpGlamourCw.stale';

    /* A frame that can see the grid owns the answer. Without the guards a
       module frame that has strips but no Last Update column kept snatching
       the state back every sweep, and the panel text blinked between the two
       answers. */
    function publishStaleState(state, rows) {
        try {
            var cur = storedStaleState();
            var now = Date.now();
            if (cur && cur.state === state && cur.rows === rows && now - (cur.at || 0) < 5000) return;
            if (cur && cur.state === 'ok' && state !== 'ok' && now - (cur.at || 0) < 10000) return;
            localStorage.setItem(STALE_STATE_KEY, JSON.stringify({ state: state, rows: rows, at: now }));
            if (IS_TOP && panelRefs) syncStaleState();
        } catch (e) { /* private mode */ }
    }

    function storedStaleState() {
        try {
            var v = JSON.parse(localStorage.getItem(STALE_STATE_KEY));
            return (v && typeof v === 'object') ? v : null;
        } catch (e) { return null; }
    }

    function staleSweep() {
        if (!CUR.stale) return;
        var cutoff = Date.now() - CUR.staleDays * 86400000;
        var strips = document.querySelectorAll(HEADER_SEL);
        if (!strips.length) return;

        var state = 'nocol', marked = 0;

        for (var s = 0; s < strips.length; s++) {
            var heads = leafElements(strips[s]);
            var target = null;
            for (var h = 0; h < heads.length; h++) {
                if (STALE_COL.test(heads[h].textContent)) { target = heads[h]; break; }
            }
            if (!target) continue;
            if (state === 'nocol') state = 'hidden';       // the column exists, at least
            var hr = target.getBoundingClientRect();
            if (!hr.width) continue;                       // the grid is not laid out
            var centre = hr.left + hr.width / 2;

            /* Find the grid next to this strip, then resolve the column index
               once from its first row and reuse it for the rest. The header
               strip has little tables of its own, so take the biggest table
               that does not contain the strip. */
            var scope = strips[s].parentElement, table = null;
            for (var up = 0; up < 6 && scope && !table; up++, scope = scope.parentElement) {
                var candidates = scope.querySelectorAll('table');
                for (var ci = 0; ci < candidates.length; ci++) {
                    var t = candidates[ci];
                    if (t.rows.length < 3 || t.contains(strips[s])) continue;
                    if (!table || t.rows.length > table.rows.length) table = t;
                }
            }
            if (!table) continue;

            var rows = table.rows, index = -1;
            for (var r = 0; r < rows.length && index < 0; r++) {
                var cells = rows[r].cells;
                if (cells.length < 4) continue;
                for (var c = 0; c < cells.length; c++) {
                    var cr = cells[c].getBoundingClientRect();
                    if (cr.width && centre >= cr.left && centre < cr.right) { index = c; break; }
                }
            }
            if (index < 0) continue;
            state = 'ok';

            for (var k = 0; k < rows.length; k++) {
                var cell = rows[k].cells[index];
                if (!cell) continue;
                var when = parseCellDate(cell.textContent);
                if (when && when.getTime() < cutoff) { rows[k].setAttribute(STALE_ATTR, ''); marked++; }
                else rows[k].removeAttribute(STALE_ATTR);
            }
        }
        publishStaleState(state, marked);
    }

    function initStale() {
        if (!document.body) return;              // placeholder frames have none
        var pending = 0;
        function schedule() {
            clearTimeout(pending);
            pending = setTimeout(staleSweep, 400);
        }
        new MutationObserver(function () { if (CUR.stale) schedule(); })
            .observe(document.body, { childList: true, subtree: true });
        setInterval(function () { if (CUR.stale) staleSweep(); }, 4000);
        schedule();
    }

    /* ---------------- Change / Change / Change ----------------
       Setting Type to "Change" on a ticket always means Subtype and Item are
       "Change" too, so it may as well happen by itself. */

    var CHANGE_WORD = 'Change';

    function podRows(scope) {
        return (scope || document).querySelectorAll('tr.pod-element-row,[class*="pod-element-row"]');
    }

    function podLabel(row) {
        var lab = row.querySelector('[class*="podElementLabel"]');
        return lab ? pvClean(lab.textContent).replace(/[:*\s]+$/, '') : '';
    }

    function podControl(scope, labelRe, cwSelector) {
        var direct = cwSelector && scope.querySelector(cwSelector);
        if (direct) return direct;
        var rows = podRows(scope);
        for (var i = 0; i < rows.length; i++) {
            if (labelRe.test(podLabel(rows[i]))) {
                var input = rows[i].querySelector('input,select,textarea');
                if (input) return input;
            }
        }
        return null;
    }

    /* GXT combo boxes shadow the value property, so write through the native
       setter and then let the widget see a full type-and-leave sequence. */
    function setComboValue(input, text) {
        if (!input || input.disabled || input.readOnly) return false;
        if (pvClean(input.value).toLowerCase() === text.toLowerCase()) return false;
        try { input.focus(); } catch (e) { /* ignore */ }
        var setter = input.tagName === 'INPUT' &&
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
        if (setter && setter.set) setter.set.call(input, text); else input.value = text;
        input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'e' }));
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'e' }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new FocusEvent('blur', { bubbles: false }));
        return true;
    }

    /* Two tickets can be open at once, so only touch the pod that owns the
       Type field that changed. */
    function podScope(node) {
        for (var e = node, i = 0; e && i < 12; e = e.parentElement, i++) {
            if (e.tagName === 'TABLE' && e.querySelector('[class*="pod-element-row"],tr.pod-element-row')) return e;
        }
        return document;
    }

    function applyTripleChange(type) {
        if (!type || pvClean(type.value).toLowerCase() !== CHANGE_WORD.toLowerCase()) return;
        var scope = podScope(type);
        setComboValue(podControl(scope, /^sub\s*-?\s*type$/i, 'input.cw_subType'), CHANGE_WORD);
        setComboValue(podControl(scope, /^item$/i, 'input.cw_item'), CHANGE_WORD);
    }

    function initTripleChange() {
        function maybe(e) {
            if (!CUR.tripleChange) return;
            var t = e.target;
            if (!t || t.tagName !== 'INPUT') return;
            var row = t.closest && t.closest('tr');
            var isType = /cw_type\b/.test(t.className) || (row && /^type$/i.test(podLabel(row)));
            if (!isType) return;
            setTimeout(function () { applyTripleChange(t); }, 120);   // let Manage settle its own field first
        }
        ['change', 'blur'].forEach(function (evt) {
            document.addEventListener(evt, maybe, true);
        });
    }

    /* ---------------- ticket content (Manage's own note tooltip) ----------------
       The notes themselves are not in the grid: Manage fetches the latest one
       and renders it in a hover tooltip of its own. Rather than duplicate that
       request, the card adopts that tooltip's text and hides the original, so
       there is one popup instead of two overlapping ones. */

    /* "<weekday> <date> <time> / <author>" heads every note Manage renders.
       The author capture is lazy and stops at the line end or the next
       timestamp, so a run of notes counts as a run of notes. */
    var STAMP = '(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\\s+\\d{1,2}[\\/-]\\d{1,2}[\\/-]\\d{2,4}';
    var NOTE_STAMP = new RegExp(STAMP + '[^\\/\\n]{0,32}\\/\\s*([^\\n]{1,60}?)(?=$|\\n|\\s{2,}|' + STAMP + ')', 'g');

    function noteAuthor(raw) {
        return raw.trim().split(/\.\s/)[0].replace(/[.,;:\s]+$/, '').slice(0, 40);
    }

    var pvTip = null, pvHunt = null;

    /* Only something that appeared AFTER the hover began can be the tooltip
       for this row. Manage builds its tip out of nested divs and sometimes a
       table, so the test is about what it is NOT: not our own UI, not a form,
       not the grid, not the navigation. */
    function looksLikeNote(node, rowText) {
        if (!node.isConnected || node === pvEl || (pvEl && pvEl.contains(node))) return false;
        if (node.id === 'rpg-root' || (node.closest && node.closest('#rpg-root,#rpg-preview'))) return false;
        if (node.querySelector('input,select,textarea,iframe')) return false;
        if (node.querySelector('[class*="ml-row"],[class*="srboard"],[class*="ml-header"]')) return false;
        if (node.querySelectorAll('a').length > 3) return false;

        var floating = false;
        for (var e = node, i = 0; e && i < 4; e = e.parentElement, i++) {
            var pos = getComputedStyle(e).position;
            if (pos === 'absolute' || pos === 'fixed') { floating = true; break; }
            if (e.parentElement === document.body) { floating = true; break; }
        }
        if (!floating) return false;

        var t = pvClean(node.textContent);
        return t.length >= 40 && t.length <= 6000 && rowText.indexOf(t) === -1;
    }

    function noteText(node) {
        return (node.innerText || node.textContent || '')
            .replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    }

    function notePlaceholder() {
        var sec = el('div', { 'class': 'rpg-pv-notes', 'data-pending': '' });
        sec.appendChild(el('b', { text: 'Ticket content' }));
        sec.appendChild(el('p', { 'class': 'rpg-pv-wait', text: 'asking Manage for the note\u2026' }));
        return sec;
    }

    function dropPlaceholder() {
        var old = pvEl && pvEl.querySelector('.rpg-pv-notes[data-pending]');
        if (old) old.parentNode.removeChild(old);
    }

    function adoptNote(node, text) {
        dropPlaceholder();
        var sec = el('div', { 'class': 'rpg-pv-notes' });
        sec.appendChild(el('b', { text: 'Ticket content' }));

        NOTE_STAMP.lastIndex = 0;
        var authors = [], m;
        while ((m = NOTE_STAMP.exec(text))) authors.push(noteAuthor(m[1]));
        if (authors.length) {
            var dl = document.createElement('dl');
            dl.appendChild(el('dt', { text: 'Notes' }));
            dl.appendChild(el('dd', { text: String(authors.length) + (authors.length === 1 ? ' note' : ' notes') }));
            dl.appendChild(el('dt', { text: 'Last by' }));
            dl.appendChild(el('dd', { text: authors[0] }));
            sec.appendChild(dl);
        }
        if (text) sec.appendChild(el('p', { text: text.length > 900 ? text.slice(0, 900) + '\u2026' : text }));

        pvEl.appendChild(sec);
        pvTip = { node: node, vis: node.style.visibility };
        node.style.visibility = 'hidden';
    }

    function stopNoteHunt() {
        if (!pvHunt) return;
        clearInterval(pvHunt.timer);
        clearTimeout(pvHunt.pending);
        if (pvHunt.obs) pvHunt.obs.disconnect();
        pvHunt = null;
    }

    /* Adoption is driven by the mutation itself rather than a poll, so the
       notes land in the card on the same tick Manage renders them. Work is
       coalesced to one pass per task; the interval is only a safety net for
       tips revealed by a style change. */
    function scheduleAdopt() {
        var h = pvHunt;
        if (!h || h.done || h.pending) return;
        h.pending = setTimeout(function () { h.pending = 0; tryAdopt(); }, 0);
    }

    function tryAdopt() {
        var h = pvHunt;
        if (!h || !pvEl || h.done) return;
        if (Date.now() > h.deadline) {
            var wait = pvEl.querySelector('.rpg-pv-notes[data-pending] .rpg-pv-wait');
            if (wait) wait.textContent = 'Manage did not return a note for this row.';
            stopNoteHunt();
            return;
        }

        /* Manage reuses one tooltip element, so it can already be sitting in
           the page when the hover starts and never mutate again. Sweep the
           handful of floating containers as well as the observed additions. */
        var pool = [];
        for (var b = 0; b < document.body.children.length && b < 40; b++) pool.push(document.body.children[b]);
        var standing = pool.length;                  // everything after this arrived during the hover
        for (var j = h.seen.length - 1; j >= 0 && j > h.seen.length - 60; j--) pool.push(h.seen[j]);

        var fallback = null;
        for (var i = pool.length - 1; i >= 0; i--) {
            if (!looksLikeNote(pool[i], h.rowText)) continue;
            var text = noteText(pool[i]);
            NOTE_STAMP.lastIndex = 0;
            if (NOTE_STAMP.test(text)) {
                h.done = true;
                adoptNote(pool[i], text);
                stopNoteHunt();
                return;
            }
            /* Untimestamped text is only trusted when it genuinely appeared
               during this hover, and only once the wait is nearly over. */
            if (!fallback && i >= standing) fallback = { node: pool[i], text: text };
        }
        if (fallback && Date.now() > h.deadline - 1200) {
            h.done = true;
            adoptNote(fallback.node, fallback.text);
            stopNoteHunt();
        }
    }

    /* Manage only loads the note when you hover the cell its own tooltip is
       bound to: usually the summary. Hovering any other column produced no
       note at all, which read as "slow" when it was really "never", so the
       hover is echoed onto that cell. It runs only once the card is already
       up: echoing a hover can make Manage re-render the row, and the card
       must not depend on a row that Manage is about to replace. */
    var pvNudging = false;

    function nudgeNote(row) {
        if (!row.isConnected) return;
        var cells = rowCells(row);
        if (!cells.length) return;
        var heads = headerCells(row);
        var target = null;

        for (var i = 0; i < heads.length && !target; i++) {
            if (!/summary|description|subject/i.test(heads[i].textContent)) continue;
            var hr = heads[i].getBoundingClientRect();
            if (!hr.width) break;
            var centre = hr.left + hr.width / 2;
            for (var j = 0; j < cells.length; j++) {
                var cr = cells[j].getBoundingClientRect();
                if (cr.width && centre >= cr.left && centre < cr.right) { target = cells[j]; break; }
            }
        }
        if (!target) {                       // widest cell is the summary in practice
            var widest = 0;
            for (var k = 0; k < cells.length; k++) {
                var w = cells[k].getBoundingClientRect().width;
                if (w > widest) { widest = w; target = cells[k]; }
            }
        }
        if (!target) return;

        var r = target.getBoundingClientRect();
        var x = r.left + r.width / 2, y = r.top + r.height / 2;
        var inner = target.firstElementChild || target;
        pvNudging = true;
        try {
            ['mouseover', 'mousemove'].forEach(function (type) {
                inner.dispatchEvent(new MouseEvent(type, {
                    bubbles: true, cancelable: true, view: window, clientX: x, clientY: y
                }));
            });
        } finally {
            pvNudging = false;
        }
    }

    /* Started on hover, not when the card appears: Manage's tooltip can beat
       the card, and every millisecond of head start is one less to wait. */
    function huntNotes(row) {
        stopNoteHunt();
        var h = pvHunt = { rowText: pvClean(row.textContent), seen: [], obs: null, timer: 0, pending: 0,
            deadline: Date.now() + 8000, done: false };

        h.obs = new MutationObserver(function (records) {
            for (var r = 0; r < records.length; r++) {
                var rec = records[r];
                if (rec.type === 'characterData') {
                    if (rec.target.parentElement) h.seen.push(rec.target.parentElement);
                } else {
                    for (var i = 0; i < rec.addedNodes.length; i++) {
                        if (rec.addedNodes[i].nodeType === 1) h.seen.push(rec.addedNodes[i]);
                    }
                }
            }
            if (h.seen.length > 240) h.seen.splice(0, h.seen.length - 240);
            scheduleAdopt();
        });
        h.obs.observe(document.body, { childList: true, subtree: true, characterData: true });
        h.timer = setInterval(tryAdopt, 150);
    }

    /* Takes the card down; the note hunt outlives it, because showPreview
       clears the old card while the hunt for this row is already running. */
    function clearCard() {
        clearTimeout(pvTimer);
        pvRow = null;
        if (pvTip) { pvTip.node.style.visibility = pvTip.vis || ''; pvTip = null; }
        if (pvEl && pvEl.parentNode) pvEl.parentNode.removeChild(pvEl);
        pvEl = null;
    }

    function hidePreview() {
        stopNoteHunt();
        pvHoverRow = null;
        clearCard();
    }

    function showPreview(row, mode, x, y, retry) {
        var card = buildPreview(row);
        if (!card) {
            /* A recycled row can still be empty when the hover lands; look
               again once, or it stays blank until the row is re-entered.
               The note hunt survives the wait; a second miss ends it. */
            if (!retry && pvHoverRow === row) {
                pvTimer = setTimeout(function () { showPreview(row, mode, x, y, true); }, 450);
            } else {
                stopNoteHunt();
            }
            return;
        }
        clearCard();
        pvRow = row;
        pvEl = el('div', { id: 'rpg-preview', 'data-mode': mode });
        pvEl.appendChild(card);
        document.body.appendChild(pvEl);
        place(row, mode, x, y);
        pvEl.setAttribute('data-show', '');
        if (CUR.previewNotes) {
            pvEl.appendChild(notePlaceholder());
            try { nudgeNote(row); } catch (err) { /* the note is optional */ }
            tryAdopt();                          // the tooltip may already be up
        }

        /* Manage fills a recycled row's cells a beat after it appears, so a
           card built the instant you arrive can be missing columns. Rebuild a
           few times and keep whichever version knows more. */
        [400, 900, 1600].forEach(function (ms) {
            setTimeout(function () {
                if (!pvEl || pvRow !== row || !card.parentNode) return;
                var fresh = buildPreview(row);
                if (!fresh || fresh.querySelectorAll('dt').length <= card.querySelectorAll('dt').length) return;
                pvEl.replaceChild(fresh, card);
                card = fresh;
                place(row, mode, x, y);
            }, ms);
        });
    }

    function place(row, mode, x, y) {
        if (mode === 'inline') {
            var r = row.getBoundingClientRect();
            pvEl.style.width = Math.max(260, Math.min(r.width, 720)) + 'px';
            pvEl.style.left = (r.left + window.pageXOffset) + 'px';
            pvEl.style.top = (r.bottom + window.pageYOffset + 2) + 'px';
            return;
        }
        pvEl.style.left = '0px';
        pvEl.style.top = '0px';
        var w = pvEl.offsetWidth, h = pvEl.offsetHeight;
        var left = Math.min(x + 16, window.innerWidth - w - 8);
        var top = (y + 18 + h > window.innerHeight) ? Math.max(8, y - h - 12) : y + 18;
        pvEl.style.left = Math.max(8, left) + 'px';
        pvEl.style.top = top + 'px';
    }

    function initPreview() {
        document.addEventListener('mouseover', function (e) {
            if (!CUR.preview || pvNudging) return;
            var row = findRow(e.target);
            if (!row) { if (pvHoverRow || pvRow || pvHunt) hidePreview(); return; }
            /* Moving between cells of the same row is not a new hover: restarting
               here would throw away the note candidates collected so far. */
            if (row === pvHoverRow) return;
            pvHoverRow = row;
            clearTimeout(pvTimer);
            var x = e.clientX, y = e.clientY, mode = CUR.previewMode;
            /* The card is scheduled FIRST and on its own: the note machinery
               is optional, and nothing it does may keep the preview away. */
            pvTimer = setTimeout(function () { showPreview(row, mode, x, y); }, 180);
            if (CUR.previewNotes) {
                try { huntNotes(row); } catch (err) { stopNoteHunt(); }
            }
        }, true);

        /* A null relatedTarget means the pointer left the window entirely. */
        document.addEventListener('mouseout', function (e) {
            if (!pvHoverRow) return;
            var to = e.relatedTarget;
            if (!to || !findRow(to)) hidePreview();
        }, true);

        ['click', 'keydown', 'wheel'].forEach(function (evt) {
            document.addEventListener(evt, hidePreview, true);
        });
        window.addEventListener('scroll', hidePreview, true);
        window.addEventListener('blur', hidePreview);
    }

    /* ---------------- login page helpers ---------------- */

    function setVal(input, v) {
        input.value = v;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    /* Keeps a saved value in a field the browser keeps second-guessing.
       Focus is no signal, and autofill writes .value without firing anything,
       so instead: re-assert until an edit arrives that we did not make. */
    function keeper(input, wanted) {
        var stop = false, writing = false;
        input.addEventListener('input', function () { if (!writing) stop = true; }, true);
        input.addEventListener('keydown', function (e) { if (e.isTrusted) stop = true; }, true);
        function assert() {
            var want = wanted();
            if (stop || !want) return;
            if (pvClean(input.value).toLowerCase() === want.toLowerCase()) return;
            writing = true;
            setVal(input, want);
            writing = false;
        }
        assert();
        [150, 400, 900, 1600, 2600].forEach(function (ms) { setTimeout(assert, ms); });
    }

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

        /* Keep the saved company + username in place against whatever the
           browser remembered. The password is never stored. */
        keeper(company, function () { return s.loginCompany; });
        keeper(username, function () { return s.loginUser; });

        /* Focus the first empty field once init() reveals the container. */
        var box = document.getElementById('loginContainer');
        var watcher = null;
        function tryFocus() {
            if (!box || box.style.display === 'none') return;
            var target = [company, username, password].filter(function (f) {
                return f && !f.value;
            })[0] || company;
            try { target.focus(); } catch (e) { /* ignore */ }
            if (watcher) { watcher.disconnect(); watcher = null; }
        }
        if (box) {
            watcher = new MutationObserver(tryFocus);
            watcher.observe(box, { attributes: true, attributeFilter: ['style'] });
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
        '#rpg-panel{position:absolute;right:0;bottom:44px;width:268px;padding:14px;',
        'max-height:calc(100vh - 90px);overflow:auto;',
        'border-radius:14px;background:rgba(16,8,42,.96);border:1px solid rgba(168,85,247,.45);',
        'box-shadow:0 16px 40px rgba(0,0,0,.55)}',
        '#rpg-panel[hidden]{display:none}',
        '#rpg-panel h2{margin:0 0 10px;font:700 14px/1.2 system-ui,sans-serif;color:#e9d5ff}',
        '#rpg-panel label{display:flex;align-items:center;gap:8px;margin:7px 0;cursor:pointer}',
        '#rpg-panel input[type=checkbox]{accent-color:#a855f7;width:15px;height:15px;margin:0}',
        '#rpg-panel input[type=checkbox]:disabled{opacity:.4}',
        '#rpg-panel input[type=checkbox]:disabled~span{opacity:.45}',
        '#rpg-panel input[type=radio]{accent-color:#22d3ee;width:14px;height:14px;margin:0}',
        '#rpg-theme-row{display:flex;align-items:center;gap:8px;margin:8px 0 10px}',
        '#rpg-theme-row select{flex:1;min-width:0;padding:5px 8px;border-radius:8px;',
        'border:1px solid rgba(168,85,247,.5);background:#1d1240;color:#ece9ff;',
        'font:600 12.5px/1.2 system-ui,sans-serif;cursor:pointer}',
        '.rpg-sub{margin:2px 0 6px 9px;padding:2px 0 2px 12px;border-left:1px solid rgba(168,85,247,.3)}',
        '.rpg-sub[hidden]{display:none}',
        '.rpg-sub label{margin:5px 0}',
        '.rpg-field{display:flex;align-items:center;gap:8px;margin:6px 0}',
        '.rpg-field span{min-width:62px;color:#b9b3d9;font-size:12px}',
        '.rpg-field input{flex:1;min-width:0;padding:5px 8px;border-radius:8px;',
        'border:1px solid rgba(168,85,247,.4);background:rgba(13,7,38,.7);color:#ece9ff;',
        'font:400 12.5px/1.2 system-ui,sans-serif}',
        '.rpg-field input[type=number]{flex:0 0 58px}',
        '.rpg-field select{flex:1;min-width:0;padding:4px 7px;border-radius:8px;',
        'border:1px solid rgba(168,85,247,.45);background:#1d1240;color:#ece9ff;',
        'font:600 12px/1.2 system-ui,sans-serif;cursor:pointer}',
        '.rpg-subhint{margin:6px 0 2px;font-size:10.5px;color:#8f88b8}',
        '#rpg-cols{max-height:150px;overflow:auto;margin:4px 0 2px;padding-right:4px}',
        '#rpg-cols label{margin:4px 0;font-size:12px}',
        '#rpg-cols-head{display:flex;align-items:center;gap:8px;margin:8px 0 0;',
        'font-size:11.5px;color:#b9b3d9}',
        '#rpg-cols-head button{margin-left:auto;padding:3px 9px;border-radius:999px;',
        'border:1px solid rgba(168,85,247,.5);background:transparent;color:#ece9ff;',
        'font:600 10.5px/1 system-ui,sans-serif;cursor:pointer}',
        '#rpg-zoom{display:flex;align-items:center;gap:8px;margin:10px 0 4px}',
        '#rpg-zoom button{width:26px;height:26px;border-radius:8px;border:1px solid rgba(168,85,247,.5);',
        'background:rgba(168,85,247,.15);color:#ece9ff;font:700 14px/1 system-ui,sans-serif;cursor:pointer}',
        '#rpg-zoom output{min-width:44px;text-align:center;font-weight:700}',
        '#rpg-log{margin:10px 0 0;padding-top:8px;border-top:1px solid rgba(168,85,247,.25)}',
        '#rpg-log summary{cursor:pointer;font:600 11.5px/1.2 system-ui,sans-serif;color:#b9b3d9}',
        '#rpg-log summary:hover{color:#ece9ff}',
        '#rpg-log-list{margin:6px 0 0;max-height:130px;overflow:auto}',
        '#rpg-log-list div{padding:2px 0;border-bottom:1px solid rgba(168,85,247,.16);font-size:10.5px;color:#c9c1e8}',
        '#rpg-log-list time{color:#8f88b8;margin-right:6px}',
        '#rpg-log-list .rpg-log-empty{border-bottom:0;color:#8f88b8;font-style:italic}',
        '#rpg-note{margin:10px 0 0;font-size:11px;color:#b9b3d9}',
        '#rpg-note a{color:#22d3ee;text-decoration:none}',
        '#rpg-ver{margin-left:6px;padding:1px 6px;border-radius:999px;',
        'border:1px solid rgba(168,85,247,.45);color:#b9b3d9;font-size:10px;white-space:nowrap}'
    ].join('');

    var TOGGLES = [
        ['navDark', 'Darken the left menu bar'],
        ['preview', 'Ticket preview on hover'],
        ['stale', 'Highlight stale tickets'],
        ['tripleChange', 'Change change change'],
        ['login', 'Login helper'],
        ['pill', 'Show the \u2728 button']
    ];

    var PREVIEW_MODES = [
        ['cursor', 'Floating next to the pointer'],
        ['inline', 'In the page, under the row']
    ];

    /* Where the preview card appears, what it shows, and which columns.
       The two positions are checkboxes rather than radios so they read as
       plain on/off switches; picking one still turns the other off. */
    function buildPreviewSub(s) {
        var modes = {};
        var kids = PREVIEW_MODES.map(function (m) {
            var cb = el('input', { type: 'checkbox' });
            cb.checked = s.previewMode === m[0];
            cb.addEventListener('change', function () {
                cb.checked = true;                       // one position is always active
                update('previewMode', m[0]);
            });
            modes[m[0]] = cb;
            return el('label', null, [cb, el('span', { text: m[1] })]);
        });

        var fieldsCb = el('input', { type: 'checkbox' });
        fieldsCb.checked = !!s.previewFields;
        fieldsCb.addEventListener('change', function () { update('previewFields', fieldsCb.checked); });
        kids.push(el('label', null, [fieldsCb, el('span', { text: 'Show the row\u2019s columns' })]));

        var notes = el('input', { type: 'checkbox' });
        notes.checked = !!s.previewNotes;
        notes.addEventListener('change', function () { update('previewNotes', notes.checked); });
        kids.push(el('label', null, [notes, el('span', { text: 'Show ticket content (notes)' })]));
        kids.push(el('p', { 'class': 'rpg-subhint', text: 'Turn the columns off and the notes on for a card that shows nothing but the ticket text.' }));

        var reset = el('button', { type: 'button', text: 'Show all' });
        reset.addEventListener('click', function () { update('previewCols', []); });
        kids.push(el('div', { id: 'rpg-cols-head' }, [el('span', { text: 'Columns in the card' }), reset]));
        var cols = el('div', { id: 'rpg-cols' });
        kids.push(cols);
        kids.push(el('p', { 'class': 'rpg-subhint', text: 'Taken from the grid you last hovered. Add a column to your Manage view and it turns up here.' }));

        return { node: el('div', { id: 'rpg-preview-sub', 'class': 'rpg-sub' }, kids), modes: modes, fields: fieldsCb, notes: notes, cols: cols };
    }

    /* How old is too old, and in what colour. */
    function buildStaleSub(s) {
        var days = el('input', { type: 'number', min: '1', max: '365' });
        days.value = s.staleDays;
        days.addEventListener('change', function () { update('staleDays', parseInt(days.value, 10) || 5); });
        days.addEventListener('keydown', function (e) { e.stopPropagation(); });

        var colour = document.createElement('select');
        colour.setAttribute('aria-label', 'Highlight colour');
        Object.keys(STALE_COLOURS).forEach(function (id) {
            var o = document.createElement('option');
            o.value = id;
            o.textContent = STALE_COLOURS[id].label;
            colour.appendChild(o);
        });
        colour.value = s.staleColour;
        colour.addEventListener('change', function () { update('staleColour', colour.value); });

        var node = el('div', { id: 'rpg-stale-sub', 'class': 'rpg-sub' }, [
            el('div', { 'class': 'rpg-field' }, [el('span', { text: 'No update for' }), days, el('span', { text: 'days' })]),
            el('div', { 'class': 'rpg-field' }, [el('span', { text: 'Colour' }), colour]),
            el('p', { 'class': 'rpg-subhint', text: 'Reads the Last Update column of the grid you are looking at. What it finds is noted in the Log below.' })
        ]);
        return { node: node, days: days, colour: colour };
    }

    /* What the stale sweep found goes to the log, not the panel body: a line
       that rewrites itself as frames report in reads as flicker. Keyed on the
       state, not the row count, so paging a board does not fill the log. */
    var lastStaleKey = '';

    function syncStaleState() {
        if (!CUR.stale) { lastStaleKey = ''; return; }
        var s = storedStaleState();
        if (!s) return;
        var key = s.state + (s.rows ? '+' : '0');
        if (key === lastStaleKey) return;
        lastStaleKey = key;
        if (s.state === 'nocol') {
            glog('No Last Update column on the grid you are looking at. Add it to your Manage view and the stale highlight starts working.');
        } else if (s.state === 'hidden') {
            glog('Stale highlight: found the Last Update column, but that grid is not on screen.');
        } else if (!s.rows) {
            glog('Stale highlight: nothing on that grid is older than ' + CUR.staleDays + ' days.');
        } else {
            glog('Stale highlight: colouring ' + s.rows + (s.rows === 1 ? ' row.' : ' rows.'));
        }
    }

    /* Column checkboxes are rebuilt whenever a grid publishes its headers. */
    function syncColumnPicker(labels) {
        if (!panelRefs || !panelRefs.pvSub) return;
        var box = panelRefs.pvSub.cols;
        var hidden = loadSettings().previewCols || [];
        if (!labels || !labels.length) {
            box.textContent = '';
            box.removeAttribute('data-cols');     // let it rebuild once a grid reports in
            box.appendChild(el('p', { 'class': 'rpg-subhint', text: 'Hover a ticket grid once and its columns appear here.' }));
            return;
        }
        if (box.getAttribute('data-cols') !== labels.join('|')) {
            box.textContent = '';
            box.setAttribute('data-cols', labels.join('|'));
            labels.forEach(function (name) {
                var cb = el('input', { type: 'checkbox' });
                cb.checked = hidden.indexOf(name) === -1;
                cb.addEventListener('change', function () {
                    var list = (loadSettings().previewCols || []).filter(function (x) { return x !== name; });
                    if (!cb.checked) list.push(name);
                    update('previewCols', list);
                });
                cb.setAttribute('data-col', name);
                box.appendChild(el('label', null, [cb, el('span', { text: name })]));
            });
            return;
        }
        box.querySelectorAll('input[data-col]').forEach(function (cb) {
            cb.checked = hidden.indexOf(cb.getAttribute('data-col')) === -1;
        });
    }

    function storedColumns() {
        try {
            var v = JSON.parse(localStorage.getItem(COLS_KEY));
            return Array.isArray(v) ? v : [];
        } catch (e) { return []; }
    }

    /* Company / Username, shown right under the Login helper. */
    function buildLoginSub(s) {
        function field(labelText, key, value) {
            var input = el('input', { type: 'text', spellcheck: 'false', autocomplete: 'off' });
            input.value = value || '';
            input.addEventListener('change', function () { update(key, input.value.trim()); });
            input.addEventListener('keydown', function (e) { e.stopPropagation(); });
            return { row: el('div', { 'class': 'rpg-field' }, [el('span', { text: labelText }), input]), input: input };
        }
        var company = field('Company', 'loginCompany', s.loginCompany);
        var user = field('Username', 'loginUser', s.loginUser);
        var hint = el('p', { 'class': 'rpg-subhint', text: 'Filled in on the Manage sign-in screen and kept there against whatever your browser remembered. Your password is never stored: that stays with your password manager.' });
        var node = el('div', { id: 'rpg-login-sub', 'class': 'rpg-sub' }, [company.row, user.row, hint]);
        return { node: node, company: company.input, user: user.input };
    }

    /* ---------------- the log ----------------
       Notices used to appear and vanish in the panel body, which read as
       flicker. They land here instead: a fold at the bottom of the panel,
       closed by default, keeping the last 15. */
    var logEntries = [];

    function glog(text) {
        if (!IS_TOP) return;
        logEntries.push({ at: new Date(), text: String(text).slice(0, 200) });
        if (logEntries.length > 15) logEntries.shift();
        renderLog();
    }

    function renderLog() {
        if (!panelRefs || !panelRefs.logList) return;
        var box = panelRefs.logList;
        box.textContent = '';
        if (!logEntries.length) {
            box.appendChild(el('div', { 'class': 'rpg-log-empty', text: 'Nothing yet.' }));
            return;
        }
        logEntries.slice().reverse().forEach(function (e) {
            var row = el('div');
            row.appendChild(el('time', { text: ('0' + e.at.getHours()).slice(-2) + ':' + ('0' + e.at.getMinutes()).slice(-2) }));
            row.appendChild(document.createTextNode(e.text));
            box.appendChild(row);
        });
    }

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

        var themeSel = document.createElement('select');
        themeSel.setAttribute('aria-label', 'Theme');
        THEMES.forEach(function (t) {
            var o = document.createElement('option');
            o.value = t.id;
            o.textContent = t.label;
            themeSel.appendChild(o);
        });
        themeSel.value = s.theme;
        themeSel.addEventListener('change', function () {
            var v = themeSel.value;
            updateMany(v === 'none' ? { theme: v } : { theme: v, lastTheme: v });
        });
        panel.appendChild(el('div', { id: 'rpg-theme-row' }, [el('span', { text: 'Theme' }), themeSel]));

        var inputs = {};
        var sub = null;
        var pvSub = null;
        var staleSub = null;
        TOGGLES.forEach(function (t) {
            var cb = el('input', { type: 'checkbox' });
            cb.checked = !!s[t[0]];
            cb.addEventListener('change', function () { update(t[0], cb.checked); });
            inputs[t[0]] = cb;
            panel.appendChild(el('label', null, [cb, el('span', { text: t[1] })]));
            if (t[0] === 'preview') {
                pvSub = buildPreviewSub(s);
                panel.appendChild(pvSub.node);
            }
            if (t[0] === 'stale') {
                staleSub = buildStaleSub(s);
                panel.appendChild(staleSub.node);
            }
            if (t[0] === 'tripleChange') {
                panel.appendChild(el('p', { 'class': 'rpg-subhint', text: 'Set Type to Change on a ticket and Subtype + Item follow.' }));
            }
            if (t[0] === 'login') {
                sub = buildLoginSub(s);
                panel.appendChild(sub.node);
            }
        });

        var out = el('output', { text: s.zoom + '%' });
        var minus = el('button', { type: 'button', 'aria-label': 'Smaller text', text: '\u2212' });
        var plus = el('button', { type: 'button', 'aria-label': 'Larger text', text: '+' });
        minus.addEventListener('click', function () { update('zoom', loadSettings().zoom - 5); });
        plus.addEventListener('click', function () { update('zoom', loadSettings().zoom + 5); });
        var zoomRow = el('div', { id: 'rpg-zoom' }, [el('span', { text: 'Text size' }), minus, out, plus]);
        panel.appendChild(zoomRow);
        panel.appendChild(el('p', { 'class': 'rpg-subhint', text: 'Text only: buttons, icons and columns keep their size.' }));

        var logFold = el('details', { id: 'rpg-log' });
        logFold.appendChild(el('summary', { text: 'Log' }));
        var logList = el('div', { id: 'rpg-log-list' });
        logFold.appendChild(logList);
        panel.appendChild(logFold);

        var note = el('p', { id: 'rpg-note' });
        note.appendChild(document.createTextNode('Alt+Shift+G toggles this panel \u00b7 Alt+Shift+D toggles the theme. Settings stay in this browser. '));
        var home = el('a', { href: 'https://rami.party/workshop/glamours/', target: '_blank', rel: 'noopener', text: 'About this glamour \u2197' });
        note.appendChild(home);
        note.appendChild(el('span', { id: 'rpg-ver', title: 'Comfort Glamour version', text: 'v' + VERSION }));
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
                var cur = loadSettings();
                updateMany({ theme: cur.theme === 'none' ? (cur.lastTheme || 'goodit') : 'none' });
            }
            if (e.key === 'Escape' && !panel.hidden) {
                panel.hidden = true;
                pill.setAttribute('aria-expanded', 'false');
            }
        });

        root.appendChild(panel);
        root.appendChild(pill);
        document.body.appendChild(root);
        panelRefs = { root: root, panel: panel, pill: pill, inputs: inputs, zoomOut: out, themeSel: themeSel, sub: sub, pvSub: pvSub, staleSub: staleSub, logList: logList };
        renderLog();
        syncPanel(s);
    }

    function syncPanel(s) {
        if (!panelRefs) return;
        if (s.pill) panelRefs.root.removeAttribute('data-nopill');
        else panelRefs.root.setAttribute('data-nopill', '');
        TOGGLES.forEach(function (t) {
            if (panelRefs.inputs[t[0]]) panelRefs.inputs[t[0]].checked = !!s[t[0]];
        });
        /* The brand themes paint the menu bar themselves, so the toggle would
           do nothing; saying so beats leaving a dead switch. */
        var painted = !!themeById(s.theme).paint;
        var nav = panelRefs.inputs.navDark;
        if (nav) {
            nav.disabled = painted;
            nav.parentElement.title = painted ? 'This theme paints the menu bar itself.' : '';
        }
        panelRefs.zoomOut.textContent = s.zoom + '%';
        panelRefs.themeSel.value = s.theme;
        var pv = panelRefs.pvSub;
        if (pv) {
            pv.node.hidden = !s.preview;
            Object.keys(pv.modes).forEach(function (m) { pv.modes[m].checked = s.previewMode === m; });
            pv.fields.checked = !!s.previewFields;
            pv.notes.checked = !!s.previewNotes;
            syncColumnPicker(storedColumns());
        }
        var st = panelRefs.staleSub;
        if (st) {
            st.node.hidden = !s.stale;
            if (document.activeElement !== st.days) st.days.value = s.staleDays;
            st.colour.value = s.staleColour;
            syncStaleState();
        }
        var sub = panelRefs.sub;
        if (sub) {
            sub.node.hidden = !s.login;
            if (document.activeElement !== sub.company) sub.company.value = s.loginCompany || '';
            if (document.activeElement !== sub.user) sub.user.value = s.loginUser || '';
        }
    }

    function updateMany(patch) {
        var s = loadSettings();
        Object.keys(patch).forEach(function (k) { s[k] = patch[k]; });
        s.zoom = Math.max(80, Math.min(130, parseInt(s.zoom, 10) || 100));
        s.staleDays = Math.max(1, Math.min(365, parseInt(s.staleDays, 10) || 5));
        saveSettings(s);
        apply(s);
    }

    function update(key, value) {
        var patch = {};
        patch[key] = value;
        updateMany(patch);
    }

    /* ---------------- boot ---------------- */

    apply(loadSettings());                       // CSS as early as possible

    function onReady() {
        var s = loadSettings();
        apply(s);                                // body exists now → text scaling
        /* The panel goes up before the features do: it is the only way to
           switch one off, so it must not depend on all of them starting. */
        if (IS_TOP) {
            saveSettings(s);                     // rewrites the blob so settings dropped in an update stop being kept
            buildPanel(s);
        }
        enhanceLogin(s);
        initPreview();
        initStale();
        initTripleChange();
        initPickWatch();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        onReady();
    }

    /* Other frames (and other tabs) follow along live. */
    window.addEventListener('storage', function (e) {
        if (e.key === KEY) apply(loadSettings());
        if (e.key === COLS_KEY && IS_TOP) syncColumnPicker(storedColumns());
        if (e.key === STALE_STATE_KEY && IS_TOP) syncStaleState();
    });
})();
