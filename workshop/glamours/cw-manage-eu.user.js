// ==UserScript==
// @name         ConnectWise Manage · Comfort Glamour
// @namespace    https://rami.party/workshop/glamours/
// @version      1.6.1
// @description  Quality-of-life for ConnectWise Manage: four dark themes, a hover ticket preview with pickable columns plus the latest note and its screenshots, stale-ticket highlighting, one-click Change/Change/Change, auto-closing of company status-note popups, a password-manager-friendly login that carries you through single sign-on, and true text-only scaling. Every tweak is a toggle — press Alt+Shift+G for the panel.
// @author       rami.party
// @license      MIT
// @match        https://eu.myconnectwise.net/*
// @match        https://*.myconnectwise.net/*
// @match        https://auth.connectwise.com/*
// @icon         data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%230d0726'/%3E%3Cpath d='M50 18 L57 43 L82 50 L57 57 L50 82 L43 57 L18 50 L43 43 Z' fill='%23a855f7'/%3E%3Ccircle cx='75' cy='25' r='6' fill='%2322d3ee'/%3E%3C/svg%3E
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
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

   • Ticket preview, status-note auto-close and text scaling all mount per
     frame — that is where the grids and dialogs actually live.
   • The theme filter inverts ONLY the top document. A CSS filter on the top
     <html> composites over iframe content too; inverting each frame as well
     would double-invert them back to blinding white.
   • Images/video get a counter-invert in every frame so photos stay natural,
     and so do our own overlays.
   • The ✨ settings panel mounts only in the top frame. Settings live in the
     userscript manager's storage so they survive the hop to the sign-on
     domain, mirrored into localStorage whose 'storage' event syncs frames.
   -------------------------------------------------------------------------- */

(function () {
    'use strict';

    var IS_TOP = window.self === window.top;
    var VERSION = '1.6.1';               // keep in step with @version above
    var KEY = 'rpGlamourCw.v1';
    var COLS_KEY = 'rpGlamourCw.cols';   // columns of the grid last hovered
    var DEFAULTS = {
        theme: 'none',      // one of THEMES below
        lastTheme: 'midnight', // restored by the Alt+Shift+D toggle
        preview: true,      // hover a grid row → preview card
        previewMode: 'cursor', // 'cursor' (floats by the pointer) | 'inline' (under the row)
        previewFields: true, // list the row's columns in the card
        previewCols: [],    // column labels to LEAVE OUT of the card
        previewNotes: false, // fold Manage's own note tooltip into the card
        stale: false,       // colour rows nobody has touched lately
        staleDays: 5,
        staleColour: 'red', // red | amber | violet
        tripleChange: false, // Type = Change → Subtype + Item = Change
        statusNote: false,  // auto-close the company Status Note popup
        login: true,        // login page helper
        loginCompany: '',   // auto-filled into #company
        loginUser: '',      // auto-filled into #username (the password is NEVER stored)
        loginEmail: '',     // auto-filled into the auth.connectwise.com SSO step
        loginAuto: false,   // press LOGIN / NEXT once every field is filled
        zoom: 100,          // text-only scale %, 80–130
        pill: true          // show the floating ✨ button
    };

    /* Each theme is a CSS filter recipe applied to the top <html>. */
    var THEMES = [
        { id: 'none',     label: 'ConnectWise default',     filter: '', bg: '' },
        { id: 'midnight', label: 'Midnight · neutral dark', filter: 'invert(.92) hue-rotate(180deg)', bg: '#0b0d12' },
        { id: 'obsidian', label: 'Obsidian · deep black',   filter: 'invert(1) hue-rotate(180deg) contrast(.92)', bg: '#000' },
        { id: 'slate',    label: 'Slate · cool blue-grey',  filter: 'invert(.88) hue-rotate(200deg) saturate(.85)', bg: '#0d1218' },
        { id: 'ember',    label: 'Ember · warm amber',      filter: 'invert(.9) hue-rotate(180deg) sepia(.28) saturate(1.15)', bg: '#14100b' }
    ];
    function themeById(id) {
        for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return THEMES[i];
        return THEMES[0];
    }

    /* ---------------- settings I/O ----------------
       Manage and its sign-in page are different origins, so localStorage alone
       loses your settings the moment single sign-on hands you over. The
       manager's own storage spans both; localStorage is kept in step because
       its 'storage' event is what syncs the iframes live. */

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
            if (raw) s = JSON.parse(raw) || {};
        } catch (e) { s = {}; }
        var out = {};
        for (var k in DEFAULTS) out[k] = (k in s) ? s[k] : DEFAULTS[k];
        if (s.dark === true && !('theme' in s)) { out.theme = 'midnight'; out.lastTheme = 'midnight'; } // v1.0 migration
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
            '#rpg-preview .rpg-pv-shots{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}',
            '#rpg-preview .rpg-pv-shots img{max-height:92px;max-width:100%;border-radius:6px;',
            'border:1px solid rgba(159,176,201,.35);background:#0d1117}',
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

    /* The theme filters keep hue (invert + hue-rotate 180), so a red tint
       still reads as red once a dark theme is on — just lighter. */
    var STALE_COLOURS = {
        red: { label: 'Red', bar: '#dc2626', tint: 'rgba(220,38,38,.16)' },
        amber: { label: 'Amber', bar: '#d97706', tint: 'rgba(217,119,6,.18)' },
        violet: { label: 'Violet', bar: '#8b5cf6', tint: 'rgba(139,92,246,.18)' }
    };

    function staleCSS(name) {
        var c = STALE_COLOURS[name] || STALE_COLOURS.red;
        return '[data-rpg-stale]>td{background-color:' + c.tint + '!important}' +
            '[data-rpg-stale]>td:first-child{box-shadow:inset 3px 0 0 ' + c.bar + '}';
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

    function tagFontSizes(root) {
        if (root.nodeType === 1 && root.closest && root.closest('#rpg-root,#rpg-preview')) return;
        var sheet = document.getElementById('rpg-textscale');
        var live = sheet && sheet.sheet;
        if (live) live.disabled = true;          // measure the ORIGINAL sizes
        try {
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
        } finally {
            if (live) live.disabled = false;
        }
    }

    function fsSheetCSS() {
        var out = [];
        for (var v in fsBuckets) {
            out.push('[' + FS_ATTR + '="' + v + '"]{font-size:' +
                (Math.round(parseFloat(v) * fsFactor * 100) / 100) + 'px!important}');
        }
        return out.join('');
    }

    function scaleNewNodes(root) {
        tagFontSizes(root);
        setSheet('rpg-textscale', fsSheetCSS());
    }

    function applyTextScale(s) {
        fsFactor = s.zoom / 100;
        if (fsFactor === 1) {
            setSheet('rpg-textscale', '');
            return;
        }
        if (!document.body) return;
        scaleNewNodes(document.body);
        if (fsObserver) return;
        fsObserver = new MutationObserver(function (records) {
            if (fsFactor === 1 || fsPending) return;
            var fresh = [];
            records.forEach(function (r) {
                for (var i = 0; i < r.addedNodes.length; i++) {
                    if (r.addedNodes[i].nodeType === 1) fresh.push(r.addedNodes[i]);
                }
            });
            if (!fresh.length) return;
            fsPending = setTimeout(function () {
                fsPending = 0;
                fresh.forEach(function (node) {
                    if (node.isConnected) scaleNewNodes(node);
                });
            }, 350);
        });
        fsObserver.observe(document.body, { childList: true, subtree: true });
    }

    /* Top frame only. The filter makes <html> the containing block for
       position:fixed children — on ConnectWise the shell does not scroll,
       so nothing drifts. #rpg-root is counter-inverted to keep the panel
       in its true colours. */
    function themeRootCSS(t) {
        return 'html{filter:' + t.filter + '!important;background:' + t.bg + '!important}' +
            '#rpg-root{filter:invert(1) hue-rotate(180deg)}';
    }

    /* ---------------- apply settings ---------------- */

    var CUR = DEFAULTS;                          // hot-path copy, refreshed by apply()

    function apply(s) {
        CUR = s;
        var theme = themeById(s.theme);
        setSheet('rpg-dark-media', theme.filter ? CSS.darkMedia : '');
        if (IS_TOP) setSheet('rpg-dark-root', theme.filter ? themeRootCSS(theme) : '');
        setSheet('rpg-login', s.login ? CSS.login : '');
        /* Our overlay lives inside the inverted page, so it needs the same
           counter-invert the panel gets. */
        setSheet('rpg-preview-css', s.preview
            ? CSS.preview + (theme.filter
                ? '#rpg-preview{filter:invert(1) hue-rotate(180deg)}#rpg-preview img{filter:none!important}'
                : '')
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

    /* Leaf elements carrying text, in document order — Manage renders each
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
        for (var el = node, i = 0; el && el.nodeType === 1 && i < 12; el = el.parentElement, i++) {
            if (el.id === 'rpg-preview' || el.id === 'rpg-root') return null;
            var role = el.getAttribute && el.getAttribute('role');
            if (el.tagName === 'TR' || role === 'row') return el;
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
        var heading = (summary && summary.value) || pvClean(row.querySelector('a') && row.querySelector('a').textContent) || fields[0].value;
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
    var STALE_COL = /last\s*upd|updated|last\s*activ|laatste/i;
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
        return isNaN(d.getTime()) ? null : d;
    }

    function clearStaleMarks() {
        var marked = document.querySelectorAll('[' + STALE_ATTR + ']');
        for (var i = 0; i < marked.length; i++) marked[i].removeAttribute(STALE_ATTR);
    }

    function staleSweep() {
        if (!CUR.stale) return;
        var cutoff = Date.now() - CUR.staleDays * 86400000;
        var strips = document.querySelectorAll(HEADER_SEL);

        for (var s = 0; s < strips.length; s++) {
            var heads = leafElements(strips[s]);
            var target = null;
            for (var h = 0; h < heads.length; h++) {
                if (STALE_COL.test(heads[h].textContent)) { target = heads[h]; break; }
            }
            if (!target) continue;
            var hr = target.getBoundingClientRect();
            if (!hr.width) continue;
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

            for (var k = 0; k < rows.length; k++) {
                var cell = rows[k].cells[index];
                if (!cell) continue;
                var when = parseCellDate(cell.textContent);
                if (when && when.getTime() < cutoff) rows[k].setAttribute(STALE_ATTR, '');
                else rows[k].removeAttribute(STALE_ATTR);
            }
        }
    }

    function initStale() {
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

    /* Screenshots pasted into a note are worth seeing. Copy the source only —
       never markup — and leave out the spacer and shadow graphics GXT uses.
       Sources hide in three places: src, a lazy-loading attribute, or a CSS
       background on a plain div. */
    var NOTE_IMG_MAX = 4;
    var IMG_SRC_OK = /^(https?:|data:image\/|\/\/|\/)/i;

    function noteImages(node) {
        var out = [], seen = {};

        function add(src) {
            if (!src || !IMG_SRC_OK.test(src) || seen[src] || out.length >= NOTE_IMG_MAX) return;
            seen[src] = true;
            var copy = document.createElement('img');
            copy.src = src;
            copy.alt = '';
            copy.referrerPolicy = 'no-referrer';
            out.push(copy);
        }

        var imgs = node.querySelectorAll('img');
        for (var i = 0; i < imgs.length && out.length < NOTE_IMG_MAX; i++) {
            var im = imgs[i];
            var w = im.naturalWidth || im.width, h = im.naturalHeight || im.height;
            if (w && h && (w < 20 || h < 20)) continue;      // spacers, shadows, icons
            add(im.currentSrc || im.src || im.getAttribute('data-src') || im.getAttribute('data-original'));
        }

        if (out.length < NOTE_IMG_MAX) {
            var all = node.querySelectorAll('[style*="background-image"],[class]');
            for (var k = 0; k < all.length && out.length < NOTE_IMG_MAX; k++) {
                var r = all[k].getBoundingClientRect();
                if (r.width < 24 || r.height < 24) continue;
                var bg = getComputedStyle(all[k]).backgroundImage;
                var m = /url\(["']?([^"')]+)["']?\)/.exec(bg || '');
                if (m) add(m[1]);
            }
        }
        return out;
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

        var shots = noteImages(node);
        if (shots.length) {
            var strip = el('div', { 'class': 'rpg-pv-shots' });
            shots.forEach(function (img) { strip.appendChild(img); });
            sec.appendChild(strip);
        }

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
            if (!fallback && i >= document.body.children.length) fallback = { node: pool[i], text: text };
        }
        if (fallback && Date.now() > h.deadline - 1200) {
            h.done = true;
            adoptNote(fallback.node, fallback.text);
            stopNoteHunt();
        }
    }

    /* Manage only loads the note when you hover the cell its own tooltip is
       bound to — usually the summary. Hovering any other column produced no
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

    function showPreview(row, mode, x, y) {
        var card = buildPreview(row);
        if (!card) { stopNoteHunt(); return; }
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
            if (!row) { if (pvRow || pvHunt) hidePreview(); return; }
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

        document.addEventListener('mouseout', function (e) {
            if (pvRow && !findRow(e.relatedTarget || e.target)) hidePreview();
        }, true);

        ['click', 'keydown', 'wheel'].forEach(function (evt) {
            document.addEventListener(evt, hidePreview, true);
        });
        window.addEventListener('scroll', hidePreview, true);
        window.addEventListener('blur', hidePreview);
    }

    /* ---------------- status note auto-close ----------------
       Opening a ticket on some companies throws up a "Status Note for …"
       popup that must be dismissed before you can work. This presses its
       Close button, and ONLY that: the "Don't show this message again" box
       is never touched, because that is a server-side change for everyone. */

    var SN_DONE = 'data-rpg-sn';
    /* cw-gxt-wnd is Manage's own dialog class and is not obfuscated. */
    var DIALOG_SEL = '.cw-gxt-wnd,[role="dialog"],[class*="x-window"],[class*="cw-dialog"]';

    function findCloseControl(box) {
        var nodes = box.querySelectorAll('a,button,span,div,td,input[type="button"],input[type="submit"],[role="button"]');
        var fallback = null;
        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            if (n.tagName === 'INPUT' && n.type === 'checkbox') continue;
            var label = pvClean(n.value || n.textContent);
            if (/^close$/i.test(label) && !n.children.length) return n;
            if (!fallback && /close/i.test(n.getAttribute('aria-label') || n.getAttribute('title') || '')) fallback = n;
        }
        return fallback;
    }

    /* GWT listens through its own dispatcher, so a bare .click() on a <div>
       is not always enough — send the whole press, but exactly one click. */
    function pressControl(node) {
        ['mousedown', 'mouseup'].forEach(function (type) {
            node.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
        });
        if (typeof node.click === 'function') { try { node.click(); return; } catch (e) { /* fall through */ } }
        node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    }

    function isStatusNoteBox(box) {
        var label = box.querySelector('[id$="-label"],[class*="header"],[class*="title"]');
        var text = pvClean((label && label.textContent) || box.textContent).slice(0, 200);
        return /status note\b/i.test(text);
    }

    function closeStatusNote(box) {
        if (!box || box.hasAttribute(SN_DONE)) return false;
        if (box.offsetParent === null && getComputedStyle(box).display === 'none') return false;
        var btn = findCloseControl(box);
        if (!btn) return false;
        box.setAttribute(SN_DONE, '1');
        pressControl(btn);
        return true;
    }

    function scanStatusNote(root) {
        var boxes = [];
        if (root.nodeType === 1 && root.matches && root.matches(DIALOG_SEL)) boxes.push(root);
        if (root.querySelectorAll) {
            var found = root.querySelectorAll(DIALOG_SEL);
            for (var i = 0; i < found.length; i++) boxes.push(found[i]);
        }
        var handled = false;
        boxes.forEach(function (b) { if (isStatusNoteBox(b)) handled = closeStatusNote(b) || handled; });
        if (handled || boxes.length) return;

        /* Unknown dialog markup: fall back to finding the title text itself. */
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode: function (t) {
                return /^\s*status note\b/i.test(t.nodeValue || '') && t.nodeValue.length < 120
                    ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        });
        var hit = walker.nextNode();
        if (!hit) return;
        for (var box = hit.parentElement, n = 0; box && n < 8; box = box.parentElement, n++) {
            if (box.hasAttribute(SN_DONE)) return;
            if (closeStatusNote(box)) return;
        }
    }

    function initStatusNote() {
        var pending = 0;
        function sweep(nodes) {
            clearTimeout(pending);
            pending = setTimeout(function () {
                if (!CUR.statusNote) return;
                nodes.forEach(function (n) { if (n.isConnected) scanStatusNote(n); });
            }, 200);
        }
        new MutationObserver(function (records) {
            var fresh = [];
            records.forEach(function (r) {
                for (var i = 0; i < r.addedNodes.length; i++) {
                    if (r.addedNodes[i].nodeType === 1) fresh.push(r.addedNodes[i]);
                }
            });
            if (fresh.length) sweep(fresh);
        }).observe(document.body, { childList: true, subtree: true });

        /* Manage often builds the dialog once and merely re-shows it, which
           produces no mutation at all — so also look on a slow timer. */
        setInterval(function () {
            if (CUR.statusNote) scanStatusNote(document.body);
        }, 1000);
        sweep([document.body]);
    }

    /* ---------------- login page helpers ---------------- */

    var AUTOKEY = 'rpgAutoLoginTs';

    /* One automatic press per step per session-ish. Without this a failed
       login would retry in a loop and lock the account. sessionStorage is
       per origin, so the Manage step and the SSO step guard separately. */
    function autoAllowed() {
        try { return Date.now() - (parseInt(sessionStorage.getItem(AUTOKEY), 10) || 0) > 45000; }
        catch (e) { return true; }
    }
    function autoTaken() {
        try { sessionStorage.setItem(AUTOKEY, String(Date.now())); } catch (e) { /* ignore */ }
    }

    function setVal(input, v) {
        input.value = v;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function visible(node) {
        return !!(node && (node.offsetWidth || node.offsetHeight || node.getClientRects().length));
    }

    /* Keeps a saved value in a field that the browser keeps second-guessing.
       Focus is no signal here (ConnectWise puts autofocus on the e-mail box),
       and browser autofill writes .value without firing anything — so instead:
       re-assert until an edit arrives that we did not make ourselves. */
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

    /* Step two of SSO: auth.connectwise.com asks for the e-mail, then NEXT. */
    function enhanceSso(s) {
        var email = document.getElementById('Input_Email') ||
            document.querySelector('input[name="Input.Email"],input[type="email"]');
        if (!email) return;
        email.setAttribute('autocomplete', 'username');
        keeper(email, function () { return s.loginEmail; });

        if (!s.loginAuto || !autoAllowed()) return;

        var tries = 0;
        var watcher = setInterval(function () {
            var btn = document.querySelector('input[type="submit"][value="NEXT" i],button[value="NEXT" i]');
            if (email.value && visible(btn)) {
                clearInterval(watcher);
                autoTaken();
                btn.click();
            } else if (++tries > 40) {
                clearInterval(watcher);
            }
        }, 700);
    }

    function enhanceLogin(s) {
        if (!s.login) return;
        if (/(^|\.)auth\.connectwise\.com$/i.test(location.hostname)) return enhanceSso(s);

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

        /* Auto-LOGIN: press the button once everything it needs is there.
           With SSO switched on Manage hides the password field entirely and
           shows "Single Sign On is enabled", so waiting for a password would
           wait forever — an invisible password box counts as satisfied. */
        if (s.loginAuto && autoAllowed()) {
            var tries = 0;
            var watcher = setInterval(function () {
                var btn = document.getElementById('loginBtn');
                var needsPassword = visible(password) && !password.disabled;
                var ready = visible(box) && company.value && username.value &&
                    (!needsPassword || password.value) && visible(btn);
                if (ready) {
                    clearInterval(watcher);
                    autoTaken();
                    btn.click();
                } else if (++tries > 60) {
                    clearInterval(watcher); // ~18 s and still nothing: give up quietly
                }
            }, 300);
        }
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
        '#rpg-note{margin:10px 0 0;font-size:11px;color:#b9b3d9}',
        '#rpg-note a{color:#22d3ee;text-decoration:none}',
        '#rpg-ver{margin-left:6px;padding:1px 6px;border-radius:999px;',
        'border:1px solid rgba(168,85,247,.45);color:#b9b3d9;font-size:10px;white-space:nowrap}'
    ].join('');

    var TOGGLES = [
        ['preview', 'Ticket preview on hover'],
        ['stale', 'Highlight stale tickets'],
        ['tripleChange', 'Change change change'],
        ['statusNote', 'Auto-close status notes'],
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
        kids.push(el('p', { 'class': 'rpg-subhint', text: 'Turn the columns off and the notes on for a card that shows nothing but the ticket text and its screenshots.' }));

        var reset = el('button', { type: 'button', text: 'Show all' });
        reset.addEventListener('click', function () { update('previewCols', []); });
        kids.push(el('div', { id: 'rpg-cols-head' }, [el('span', { text: 'Columns in the card' }), reset]));
        var cols = el('div', { id: 'rpg-cols' });
        kids.push(cols);
        kids.push(el('p', { 'class': 'rpg-subhint', text: 'Taken from the grid you last hovered \u2014 add a column to your Manage view and it turns up here.' }));

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
            el('p', { 'class': 'rpg-subhint', text: 'Reads the Last Update column of the grid you are looking at.' })
        ]);
        return { node: node, days: days, colour: colour };
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
        try { return JSON.parse(localStorage.getItem(COLS_KEY)) || []; } catch (e) { return []; }
    }

    /* Company / Username / auto-LOGIN, shown right under the Login helper. */
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
        var mail = field('SSO e-mail', 'loginEmail', s.loginEmail);
        var auto = el('input', { type: 'checkbox' });
        auto.checked = !!s.loginAuto;
        auto.addEventListener('change', function () { update('loginAuto', auto.checked); });
        var autoRow = el('label', null, [auto, el('span', { text: 'Auto-LOGIN once filled' })]);
        var hint = el('p', { 'class': 'rpg-subhint', text: 'Auto-LOGIN also presses NEXT on the ConnectWise sign-in page with the e-mail above. Your password is never stored \u2014 that stays with your password manager.' });
        var node = el('div', { id: 'rpg-login-sub', 'class': 'rpg-sub' }, [company.row, user.row, mail.row, autoRow, hint]);
        return { node: node, company: company.input, user: user.input, mail: mail.input, auto: auto };
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
        panel.appendChild(el('p', { 'class': 'rpg-subhint', text: 'Text only \u2014 buttons, icons and columns keep their size.' }));

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
                updateMany({ theme: cur.theme === 'none' ? (cur.lastTheme || 'midnight') : 'none' });
            }
            if (e.key === 'Escape' && !panel.hidden) {
                panel.hidden = true;
                pill.setAttribute('aria-expanded', 'false');
            }
        });

        root.appendChild(panel);
        root.appendChild(pill);
        document.body.appendChild(root);
        panelRefs = { root: root, panel: panel, pill: pill, inputs: inputs, zoomOut: out, themeSel: themeSel, sub: sub, pvSub: pvSub, staleSub: staleSub };
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
        }
        var sub = panelRefs.sub;
        if (sub) {
            sub.node.hidden = !s.login;
            if (document.activeElement !== sub.company) sub.company.value = s.loginCompany || '';
            if (document.activeElement !== sub.user) sub.user.value = s.loginUser || '';
            if (document.activeElement !== sub.mail) sub.mail.value = s.loginEmail || '';
            sub.auto.checked = !!s.loginAuto;
        }
    }

    function updateMany(patch) {
        var s = loadSettings();
        Object.keys(patch).forEach(function (k) { s[k] = patch[k]; });
        s.zoom = Math.max(80, Math.min(130, parseInt(s.zoom, 10) || 100));
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
        enhanceLogin(s);
        initPreview();
        initStatusNote();
        initStale();
        initTripleChange();
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
        if (e.key === COLS_KEY && IS_TOP) syncColumnPicker(storedColumns());
    });
})();
