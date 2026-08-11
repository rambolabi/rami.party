// ==UserScript==
// @name         ConnectWise Manage · Ticket Autopilot
// @namespace    https://rami.party/workshop/glamours/
// @version      1.5.2
// @description  Stamp the same fields onto every ticket you open: Board, Status, Type, Subtype, Item, a priority and a due date, applied in that order because each one decides what the next may contain. Press the Run autopilot button in a ticket's toolbar to apply them to that one ticket, or set the clock running to have every ticket you open stamped until it switches itself off. Every change is logged. Alt+Shift+A.
// @author       rami.party
// @license      MIT
// @match        https://eu.myconnectwise.net/*
// @match        https://*.myconnectwise.net/*
// @icon         data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%230d0726'/%3E%3Ccircle cx='50' cy='50' r='28' fill='none' stroke='%2322d3ee' stroke-width='6'/%3E%3Ccircle cx='50' cy='50' r='9' fill='%23a855f7'/%3E%3Cpath d='M50 8v14M50 78v14M8 50h14M78 50h14' stroke='%23a855f7' stroke-width='6' stroke-linecap='round'/%3E%3C/svg%3E
// @run-at       document-start
// @grant        none
// @homepageURL  https://rami.party/workshop/glamours/
// @supportURL   https://rami.party/workshop/glamours/
// @downloadURL  https://rami.party/workshop/glamours/user-scripts/cw-manage-autopilot.user.js
// @updateURL    https://rami.party/workshop/glamours/user-scripts/cw-manage-autopilot.user.js
// ==/UserScript==

/* --------------------------------------------------------------------------
   Ticket Autopilot: the fields you set the same way every time
   --------------------------------------------------------------------------
   A morning of triage is the same five keystrokes on every ticket: the same
   board, the same status, the same Type and Subtype, a due date. This does
   them as each ticket opens.

   Order matters and is not cosmetic. Manage rebuilds each field's option list
   from the fields before it, so Board is set first, then Status, Type,
   Subtype, Item, and finally the due date. Every write is read back before the
   next one is attempted, and retried if it did not stick: a value offered to a
   list that is still reloading is taken and then quietly cleared.

   It writes into a live PSA, so it is built to be timid:

   • There are two ways to run it, and neither is on by accident. A Run
     autopilot button sits in the ticket's own toolbar and stamps that one
     ticket when you press it. The clock is the other way: it stamps every
     ticket you open and switches ITSELF off when the time is up, because a
     stamping rule you forgot about is worse than no rule at all.
   • Every field is "leave it alone" until you pick something.
   • It fills empty fields. Anything already answered is left alone unless you
     explicitly allow overwriting.
   • Every field it touches is written to the log in the panel, with the ticket
     number, so "what did it just do" always has an answer.
   • It stamps a ticket once. Manage pools and re-uses its pod widgets, so the
     guard is keyed to the ticket that is in the pod, not to the pod element.

   The option lists are the values this tenant uses, listed in CHOICES below.
   Add to them there rather than teaching the script to read Manage's own
   dropdowns: the lists are short, and a fixed list cannot arrive half-loaded.
   -------------------------------------------------------------------------- */

(function () {
    'use strict';

    var NS = '__rpgAutopilot';
    if (window[NS]) { window[NS].toggle(); return; }

    var IS_TOP = window.self === window.top;
    var VERSION = '1.5.2';
    var KEY = 'rpGlamourCwAuto.v1';

    var DEFAULTS = {
        board: '',           // every field: '' means leave it alone
        type: '',
        subtype: '',
        item: '',
        status: '',
        priority: '',
        due: 'off',          // off | 0 to 9 days from today | m1 | m2 | m3 | m6
        skipWeekend: true,
        dateFormat: 'auto',  // auto | dmy | mdy | ymd
        overwrite: false,    // touch fields that already have a value
        button: true,        // put a Run autopilot button in the ticket toolbar
        minutes: 30,         // how long a run lasts
        until: 0,            // epoch ms; 0 = not running
        pill: true
    };

    /* The values this tenant uses. */
    var CHOICES = {
        board: ['IN - Managed', 'IN - Services', 'Internal Change Request', 'Managed Services',
                'PreSales', 'Projecten', 'SecOps - Managed', 'SecOps - Services'],
        type: ['Change', 'Incident', 'MUST CHANGE', 'Request', 'Vraag'],
        subtype: ['Backup', 'Change', 'Digital Workplace', 'MUST CHANGE', 'Office.ONE', 'Renewal'],
        item: ['Change'],
        status: ['1-st check', 'Klant heeft gereageerd', 'Open', 'Gepland', 'Wachten op collega',
                 'Wachten op leverancier', 'Wachten op reactie klant',
                 'Wachten op reactie klant - do not close', 'Afgewerkt', 'Gesloten'],
        priority: ['Priority 1 - Critical', 'Priority 2 - High', 'Priority 3 - Medium', 'Priority 4 - Low']
    };

    var DUE_CHOICES = [['off', 'Leave it alone'], ['0', 'Today'], ['1', 'Tomorrow']];
    for (var dd = 2; dd <= 9; dd++) DUE_CHOICES.push([String(dd), 'In ' + dd + ' days']);
    [1, 2, 3, 6].forEach(function (n) {
        DUE_CHOICES.push(['m' + n, 'In ' + n + (n === 1 ? ' month' : ' months')]);
    });

    /* ---------------- settings ---------------- */

    function read(key) {
        try { return JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { return {}; }
    }
    function write(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ }
    }

    function load() {
        var s = read(KEY), out = {};
        for (var k in DEFAULTS) out[k] = (k in s) ? s[k] : DEFAULTS[k];
        out.minutes = Math.max(5, Math.min(480, parseInt(out.minutes, 10) || 30));
        return out;
    }

    function save(s) { write(KEY, s); }

    var CUR = load();

    function update(patch) {
        var s = load();
        Object.keys(patch).forEach(function (k) { s[k] = patch[k]; });
        s.minutes = Math.max(5, Math.min(480, parseInt(s.minutes, 10) || 30));
        save(s);
        CUR = s;
        sync();
    }

    /* ---------------- the clock ----------------
       Stored as an absolute moment, so closing the tab, reloading or coming
       back tomorrow cannot resurrect a run that should have ended. */

    function running() { return CUR.until > Date.now(); }

    function remaining() { return Math.max(0, CUR.until - Date.now()); }

    function startRun() { update({ until: Date.now() + CUR.minutes * 60000 }); }

    function stopRun() { update({ until: 0 }); }

    function mmss(ms) {
        var total = Math.round(ms / 1000);
        var m = Math.floor(total / 60), s = total % 60;
        return m + ':' + ('0' + s).slice(-2);
    }

    /* ---------------- the fields ---------------- */

    function clean(s) { return (s || '').replace(/\s+/g, ' ').trim(); }

    var FIELDS = {
        board: { label: 'Board', sel: 'input.cw_serviceBoard', row: 'Board', kind: 'combo' },
        status: { label: 'Status', sel: 'input.cw_status', row: 'Status', kind: 'combo' },
        type: { label: 'Type', sel: 'input.cw_type', row: 'Type', kind: 'combo' },
        subtype: { label: 'Subtype', sel: 'input.cw_subType', row: 'Subtype', kind: 'combo' },
        item: { label: 'Item', sel: 'input.cw_item', row: 'Item', kind: 'combo' },
        due: { label: 'Due Date', sel: '.cw_dueDate input', row: 'Due Date', kind: 'text' },
        priority: { label: 'Priority', sel: '.cw_servicePriority', row: 'Priority', kind: 'menu' }
    };

    /* Manage reloads each field's options from the ones before it, so this
       order is load-bearing: Board decides which Statuses and Types exist,
       Type decides the Subtypes, Subtype decides the Items. Priority is last:
       it is a menu rather than a field and depends on nothing. */
    var ORDER = ['board', 'status', 'type', 'subtype', 'item', 'due', 'priority'];
    var STEP_MS = 500;      // pause after a write before checking it stuck
    var MENU_OPEN_MS = 1500; // how long to wait for an icon menu to appear
    var MENU_MS = 2000;     // and how long before its result is read back
    var TRIES = 3;          // a dependent list may still have been loading

    /* One ticket pod may be one of several open at once, so every lookup is
       scoped to the ticket that raised the event rather than to the document.
       Type, Subtype and Item share a table; Due Date and Priority sit in other
       sections of the same form, so the scope climbs until it has both. */
    function ticketScope(node) {
        var fallback = null;
        for (var e = node, i = 0; e && e.tagName !== 'BODY' && i < 20; e = e.parentElement, i++) {
            if (!e.querySelector) continue;
            if (!fallback && e.tagName === 'TABLE' && e.querySelector('tr.pod-element-row,[class*="pod-element-row"]')) fallback = e;
            if (e.querySelector('.cw_dueDate') || e.querySelector('.cw_servicePriority')) return e;
        }
        return fallback || document;
    }

    /* Every class around a pod row is compiler-generated and changes between
       releases, but the label beside the field is plain text. It is the way
       back in when a cw_ class is renamed. */
    function byRowLabel(scope, label) {
        if (!label) return null;
        var rows = (scope || document).querySelectorAll('tr.pod-element-row,[class*="pod-element-row"]');
        for (var i = 0; i < rows.length; i++) {
            var lab = rows[i].querySelector('.mm_podElementLabel,[class*="podElementLabel"]') || rows[i].children[0];
            if (!lab) continue;
            if (clean(lab.textContent).replace(/:$/, '').toLowerCase() !== label.toLowerCase()) continue;
            var cells = rows[i].children;
            var last = cells[cells.length - 1];
            return last.querySelector('input') || last.firstElementChild || last;
        }
        return null;
    }

    function field(scope, name) {
        var f = FIELDS[name];
        if (!f) return null;
        return (scope || document).querySelector(f.sel) || byRowLabel(scope, f.row);
    }

    /* Manage writes its own “nothing chosen yet” text into some fields, and a
       placeholder is not an answer somebody gave. "MUST CHANGE" is this
       board's own version of that, so it counts as empty too. */
    var BLANKISH = /^\(?\s*(unassigned|none|no one|not assigned|select|choose|must change)[\s.…]*\)?$/i;

    function blankish(v) { return !v || BLANKISH.test(v); }

    /* GXT combo boxes shadow the value property, so write through the native
       setter and then let the widget see a full type-and-leave sequence. */
    function setCombo(input, text) {
        if (!input || input.disabled || input.readOnly) return false;
        var setter = input.tagName === 'INPUT' &&
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
        try { input.focus(); } catch (e) { /* detached */ }
        if (setter && setter.set) setter.set.call(input, text); else input.value = text;
        input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'e' }));
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'e' }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new FocusEvent('blur', { bubbles: false }));
        return true;
    }

    function press(node) {
        if (!node) return;
        ['mousedown', 'mouseup'].forEach(function (t) {
            node.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window }));
        });
        if (typeof node.click === 'function') { try { node.click(); return; } catch (e) { /* fall through */ } }
        node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    }

    /* ---------------- dates ---------------- */

    function detectFormat() {
        if (CUR.dateFormat !== 'auto') return CUR.dateFormat;
        var text = clean(document.body ? document.body.textContent : '').slice(0, 40000);
        var m = /\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})\b/.exec(text);
        if (m) {
            if (parseInt(m[1], 10) > 12) return 'dmy';
            if (parseInt(m[2], 10) > 12) return 'mdy';
        }
        return 'dmy';
    }

    /* "In a month" from the 31st has to land on the last day of a short month,
       not spill into the next one the way setMonth does on its own. */
    function addMonths(d, n) {
        var day = d.getDate();
        d.setDate(1);
        d.setMonth(d.getMonth() + n);
        d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
    }

    function dueDate(spec) {
        var d = new Date();
        if (String(spec).charAt(0) === 'm') addMonths(d, parseInt(String(spec).slice(1), 10) || 0);
        else d.setDate(d.getDate() + (parseInt(spec, 10) || 0));
        if (CUR.skipWeekend) {
            while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
        }
        var dd = ('0' + d.getDate()).slice(-2);
        var mm = ('0' + (d.getMonth() + 1)).slice(-2);
        var yy = d.getFullYear();
        var f = detectFormat();
        if (f === 'mdy') return mm + '/' + dd + '/' + yy;
        if (f === 'ymd') return yy + '-' + mm + '-' + dd;
        return dd + '/' + mm + '/' + yy;
    }

    /* ---------------- the log ---------------- */

    var entries = [];

    function log(text) {
        entries.push({ at: new Date(), text: String(text).slice(0, 160) });
        if (entries.length > 60) entries.shift();
        sync();
    }

    /* ---------------- stamping ----------------
       Manage re-uses one pod widget for every ticket you open, so "already
       done" is keyed to the ticket sitting in the pod. When the pod is filled
       with a different ticket the guard re-arms by itself. */

    var stamped = new WeakMap();
    var busy = new WeakMap();
    var pending = 0;

    /* The ticket number is the one thing on the pod this script never writes,
       so the once-per-ticket guard is built from it. It sits in the window
       header several levels above the fields, so the search climbs outwards
       and takes the nearest one: two tickets open side by side stay apart. */
    var TICKET_RE = /#\s?(\d{4,})/;

    function ticketId(scope) {
        for (var e = scope, i = 0; e && e.tagName !== 'BODY' && i < 14; e = e.parentElement, i++) {
            var m = TICKET_RE.exec(e.textContent || '');
            if (m) return '#' + m[1];
        }
        for (var p = scope, j = 0; p && p.tagName !== 'BODY' && j < 12; p = p.parentElement, j++) {
            var c = p.querySelector && p.querySelector('input.cw_company');
            if (c && clean(c.value)) return clean(c.value);
        }
        return 'ticket';
    }

    /* ---------------- the priority menu ----------------
       Priority is an icon menu, not a combo, so the only way to set it is to
       open it and click the entry. Two things make that harder than it looks:
       the wrapper is not the button, and GXT builds a menu once and merely
       re-shows it afterwards, which produces no mutation at all. So the real
       button is pressed and the open menu is polled for rather than observed. */

    /* cw_CwIconTextMenuButton wraps the div.mm_button[tabindex=0] that GXT
       actually listens on; a press on the wrapper never reaches it. */
    function menuButton(node) {
        return node.querySelector('.mm_button,[class*="mm_button"],[tabindex]') || node;
    }

    function floatingPanels() {
        var out = [], kids = document.body ? document.body.children : [];
        for (var i = 0; i < kids.length; i++) {
            var n = kids[i];
            if (n.nodeType !== 1 || String(n.id).indexOf('rpg-') === 0) continue;
            if (!n.getClientRects().length) continue;
            var pos = getComputedStyle(n).position;
            if (pos === 'absolute' || pos === 'fixed') out.push(n);
        }
        return out;
    }

    /* The entry carries a colour swatch beside its text, so the match is the
       innermost element whose whole text is the value, not a childless leaf. */
    function entryWithText(root, text) {
        var nodes = root.querySelectorAll('*'), hit = null, want = text.toLowerCase();
        for (var i = 0; i < nodes.length; i++) {
            if (clean(nodes[i].textContent).toLowerCase() === want) hit = nodes[i];
        }
        return hit;
    }

    function setMenuValue(button, wanted, done) {
        press(menuButton(button));
        var deadline = Date.now() + MENU_OPEN_MS;
        (function look() {
            var panels = floatingPanels();
            for (var i = 0; i < panels.length; i++) {
                var hit = entryWithText(panels[i], wanted);
                if (hit) { press(hit); done(true); return; }
            }
            if (Date.now() < deadline) { setTimeout(look, 120); return; }
            try {
                document.body.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape', code: 'Escape' }));
            } catch (e) { /* ignore */ }
            done(false);
        })();
    }

    function shownValue(scope, name) {
        var node = field(scope, name);
        if (!node) return null;
        return clean(FIELDS[name].kind === 'menu' ? node.textContent : node.value);
    }

    /* A menu button shows more than the value it holds, so it is matched
       loosely; a combo has to read back exactly what was asked for. */
    function holds(name, had, value) {
        if (had === null) return false;
        return FIELDS[name].kind === 'menu'
            ? had.toLowerCase().indexOf(value.toLowerCase()) !== -1
            : had.toLowerCase() === value.toLowerCase();
    }

    /* 'done' already right, 'kept' left alone on purpose, 'wrote' a write was
       attempted and still has to be read back, 'absent' nothing to write to. */
    function writeField(scope, name, value, changes) {
        if (!value) return 'done';
        var f = FIELDS[name];
        var node = field(scope, name);
        if (!node) return 'absent';
        var had = clean(f.kind === 'menu' ? node.textContent : node.value);
        if (holds(name, had, value)) return 'done';
        if (!blankish(had) && !CUR.overwrite) {
            var note = f.label + ' \u201c' + had + '\u201d';
            if (changes.kept.indexOf(note) === -1) changes.kept.push(note);
            return 'kept';
        }
        if (f.kind === 'menu') { setMenuValue(node, value, function () { /* read back below */ }); return 'wrote'; }
        return setCombo(node, value) ? 'wrote' : 'absent';
    }

    function targetValue(name) {
        if (name === 'due') return CUR.due === 'off' ? '' : dueDate(CUR.due);
        return CUR[name];
    }

    /* Pressing the button in a ticket means "do it now", so a manual run
       ignores both the clock and the once-per-ticket guard. */
    function stamp(scope, manual, whenDone) {
        if (busy.get(scope)) { if (whenDone) whenDone(); return; }
        var id = ticketId(scope);
        if (!manual) {
            if (!running()) return;
            if (stamped.get(scope) === id) return;
        }
        stamped.set(scope, id);
        busy.set(scope, true);

        var changes = { list: [], kept: [], failed: [], label: id };

        /* One field at a time, in ORDER, and every write is read back before
           moving on. Manage rebuilds the list behind a dependent field after
           each change, and a value offered to a list that is still loading is
           taken and then quietly cleared: retrying is what makes Status stick
           when the Board has just been set under it. */
        (function step(i, tries) {
            if (i >= ORDER.length) {
                busy['delete'](scope);
                if (changes.list.length) log(changes.label + ': ' + changes.list.join(', '));
                if (changes.kept.length) {
                    log(changes.label + ': kept ' + changes.kept.join(', ') +
                        '. Already filled in, so tick \u201calso overwrite\u201d to replace them.');
                }
                if (changes.failed.length) {
                    log(changes.label + ': could not set ' + changes.failed.join(', ') +
                        '. Manage would not take the value on this ticket.');
                }
                if (manual && !changes.list.length && !changes.kept.length && !changes.failed.length) {
                    log(changes.label + ': nothing to do, every field already reads that way.');
                }
                if (whenDone) whenDone();
                return;
            }

            var name = ORDER[i];
            var value = targetValue(name);
            var outcome = 'absent';
            try { outcome = writeField(scope, name, value, changes); } catch (e) { /* one field must not stop the rest */ }
            if (outcome !== 'wrote') { step(i + 1, 0); return; }

            setTimeout(function () {
                if (holds(name, shownValue(scope, name), value)) {
                    changes.list.push(FIELDS[name].label + ' \u2192 ' + value);
                    step(i + 1, 0);
                } else if (tries + 1 < TRIES) {
                    step(i, tries + 1);
                } else {
                    changes.failed.push(FIELDS[name].label);
                    step(i + 1, 0);
                }
            }, FIELDS[name].kind === 'menu' ? MENU_MS : STEP_MS);
        })(0, 0);
    }

    /* ---------------- the button in the ticket toolbar ----------------
       The bar itself carries nothing but compiler-generated classes and is not
       even an x-toolbar, but the buttons in it are named cw_ToolbarButton_Save,
       _Delete and so on. So the anchor is a button, not the bar: ours goes in
       beside Delete, in whatever element happens to be holding it. */

    /* Inherits the toolbar's own font and colour rather than bringing its own,
       so it also follows along when a theme inverts the page. */
    var BUTTON_CSS = [
        '.rpg-ap-run{appearance:none;-webkit-appearance:none;',
        'display:inline-block!important;height:20px!important;line-height:18px!important;',
        'margin:0 5px!important;padding:0 8px!important;',
        'border:1px solid rgba(0,0,0,.2)!important;border-radius:3px!important;',
        'background:transparent!important;color:inherit!important;',
        'font:inherit!important;font-size:12px!important;font-weight:600!important;',
        'cursor:pointer!important;vertical-align:middle!important;white-space:nowrap!important}',
        '.rpg-ap-run:hover{background:rgba(0,0,0,.07)!important}',
        '.rpg-ap-run[disabled]{opacity:.55!important;cursor:default!important}'
    ].join('');

    function scopeAbove(node) {
        for (var e = node, i = 0; e && e.tagName !== 'BODY' && i < 20; e = e.parentElement, i++) {
            var anchor = e.querySelector && e.querySelector('input.cw_type');
            if (anchor) return ticketScope(anchor);
        }
        return null;
    }

    /* A ticket's action bar is the one holding Delete (or failing that Save).
       The app chrome has toolbar buttons of its own, and "is there a ticket
       somewhere above me" is far too loose to tell them apart. */
    var ANCHORS = ['Delete', 'SaveAndClose', 'Save'];

    function toolbarAnchors() {
        var bars = [], out = [];
        for (var a = 0; a < ANCHORS.length; a++) {
            var btns = document.querySelectorAll('[class*="cw_ToolbarButton_' + ANCHORS[a] + '"]');
            for (var i = 0; i < btns.length; i++) {
                var b = btns[i];
                if (!b.getClientRects().length || !b.parentElement) continue;
                if (bars.indexOf(b.parentElement) !== -1) continue;
                if (!scopeAbove(b)) continue;
                bars.push(b.parentElement);
                out.push(b);
            }
        }
        return out;
    }

    function runButton() {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'rpg-ap-run';
        btn.textContent = 'Run autopilot';
        btn.title = 'Apply the Ticket Autopilot settings to this ticket now.';
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (btn.disabled) return;
            /* Resolved on the press, not when the button was made: Manage
               re-uses a ticket window for the next ticket you open. */
            var scope = scopeAbove(btn);
            if (!scope) { log('could not find the ticket that button belongs to'); return; }
            btn.disabled = true;
            btn.textContent = 'Running...';
            stamp(scope, true, function () {
                btn.disabled = false;
                btn.textContent = 'Run autopilot';
            });
        });
        return btn;
    }

    /* GXT lays the bar out by coordinates: every button is absolutely
       positioned with its own left, so a button added to the flow lands on top
       of the others at the origin. Ours is given a place of its own after the
       right-most button, and re-placed on every sweep in case the bar has been
       laid out again. */
    function placeButton(bar, anchor, btn) {
        if (getComputedStyle(anchor).position !== 'absolute') return;
        btn.style.position = 'absolute';
        btn.style.top = anchor.offsetTop + 'px';
        var width = btn.offsetWidth || 90;
        var left = anchor.offsetLeft + anchor.offsetWidth + 10;
        for (var pass = 0; pass < 8; pass++) {
            var hit = null;
            for (var i = 0; i < bar.children.length; i++) {
                var c = bar.children[i];
                if (c === btn || getComputedStyle(c).position !== 'absolute') continue;
                if (c.offsetWidth > 300 || !c.offsetWidth) continue;   // a spacer filling the bar
                if (c.offsetLeft < left + width + 6 && c.offsetLeft + c.offsetWidth > left - 6) { hit = c; break; }
            }
            if (!hit) break;
            left = hit.offsetLeft + hit.offsetWidth + 10;
        }
        btn.style.left = left + 'px';
    }

    function syncRunButtons() {
        if (!CUR.button) {
            var old = document.querySelectorAll('.rpg-ap-run');
            for (var i = 0; i < old.length; i++) old[i].parentNode.removeChild(old[i]);
            return;
        }
        setSheet('rpg-ap-btn-css', BUTTON_CSS);
        var anchors = toolbarAnchors();
        for (var a = 0; a < anchors.length; a++) {
            var bar = anchors[a].parentElement;
            var btn = bar.querySelector('.rpg-ap-run');
            if (!btn) {
                btn = runButton();
                bar.insertBefore(btn, anchors[a].nextSibling);
            }
            placeButton(bar, anchors[a], btn);
        }
    }

    function watchTickets() {
        function sweep() {
            try { syncRunButtons(); } catch (e) { /* the button is optional */ }
            if (!running()) return;
            var anchors = document.querySelectorAll('input.cw_type');
            for (var i = 0; i < anchors.length; i++) {
                try { stamp(ticketScope(anchors[i])); } catch (e) { /* one bad pod must not stop the rest */ }
            }
        }
        new MutationObserver(function () {
            if (pending || (!running() && !CUR.button)) return;
            pending = setTimeout(function () { pending = 0; sweep(); }, 700);
        }).observe(document.body, { childList: true, subtree: true });
        setInterval(sweep, 2500);
        setTimeout(sweep, 1200);
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
        '#rpg-ap,#rpg-ap *{box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}',
        /* The Comfort Glamour keeps the bottom-right corner, so this stacks above it. */
        '#rpg-ap{position:fixed!important;right:14px;bottom:102px;z-index:2147483500;width:min(330px,calc(100vw - 28px));',
        'max-height:min(78vh,860px);overflow:auto;padding:14px;border-radius:14px;',
        'background:#150a33!important;border:1px solid rgba(168,85,247,.5);color:#ece9ff;font-size:13px;line-height:1.45;',
        'box-shadow:0 18px 46px rgba(0,0,0,.55)}',
        '#rpg-ap[hidden],#rpg-ap-pill[hidden]{display:none!important}',
        '#rpg-ap h2{margin:0 0 2px;font-weight:700;font-size:14px;line-height:1.2;color:#e9d5ff}',
        '#rpg-ap .sub{margin:0 0 10px;font-size:11px;color:#9d92c9}',
        /* fieldset defaults to min-width:min-content, so a long option in one
           of the selects would otherwise widen the whole panel. */
        '#rpg-ap fieldset{border:0;border-top:1px solid rgba(168,85,247,.25);margin:12px 0 0;padding:8px 0 0;min-width:0}',
        '#rpg-ap legend{padding:0;font-size:11px;color:#9d92c9;letter-spacing:.04em;text-transform:uppercase}',
        '#rpg-ap label.check{display:flex;align-items:center;gap:8px;margin:7px 0;cursor:pointer;font-size:12.5px}',
        '#rpg-ap input[type=checkbox]{accent-color:#a855f7;width:15px;height:15px;margin:0;flex:0 0 auto}',
        '#rpg-ap .row{display:flex;align-items:center;gap:6px;margin:7px 0}',
        '#rpg-ap .row>span{min-width:58px;font-size:12px;color:#b9b3d9}',
        '#rpg-ap select,#rpg-ap input[type=text],#rpg-ap input[type=number]{flex:1;min-width:0;padding:5px 7px;',
        'border-radius:8px;border:1px solid rgba(168,85,247,.45);background:#1e1145;color:#ece9ff;',
        'font:inherit;font-size:12px}',
        '#rpg-ap button{padding:5px 9px;border-radius:8px;border:1px solid rgba(168,85,247,.45);',
        'background:rgba(168,85,247,.14);color:#ece9ff;font:inherit;font-size:11.5px;cursor:pointer;white-space:nowrap}',
        '#rpg-ap button:hover{border-color:#a855f7}',
        '#rpg-ap button.go{background:#22d3ee;color:#04121f;border-color:#22d3ee;font-weight:700}',
        '#rpg-ap button.stop{background:#f87171;color:#2a0707;border-color:#f87171;font-weight:700}',
        '#rpg-ap .hint{margin:4px 0 0;font-size:10.5px;color:#8f88b8}',
        '#rpg-ap .clock{margin-top:10px;padding:10px;border-radius:10px;background:#1e1145;',
        'border:1px solid rgba(168,85,247,.35);text-align:center}',
        '#rpg-ap .clock b{display:block;font-size:26px;font-variant-numeric:tabular-nums;line-height:1.1;color:#22d3ee}',
        '#rpg-ap .clock.off b{color:#9d92c9}',
        '#rpg-ap .clock small{display:block;margin-top:2px;font-size:10.5px;color:#9d92c9}',
        '#rpg-ap .clock .btns{display:flex;gap:6px;margin-top:8px}',
        '#rpg-ap .clock .btns button{flex:1}',
        '#rpg-ap .log{margin-top:8px;max-height:120px;overflow:auto;font-size:11px;color:#c9c1e8}',
        '#rpg-ap .log div{padding:2px 0;border-bottom:1px solid rgba(168,85,247,.16)}',
        '#rpg-ap .log time{color:#8f88b8;margin-right:6px}',
        '#rpg-ap .note{margin:10px 0 0;font-size:10.5px;color:#8f88b8}',
        '#rpg-ap .note a{color:#22d3ee;text-decoration:none}',
        '#rpg-ap-pill{position:fixed!important;right:14px;bottom:58px;z-index:2147483499;display:inline-flex;',
        'align-items:center;gap:6px;padding:8px 13px;border-radius:999px;cursor:pointer;opacity:.85;',
        'background:rgba(21,10,51,.94);color:#ece9ff;border:1px solid rgba(168,85,247,.5);',
        'font:600 12.5px/1 system-ui,sans-serif;box-shadow:0 8px 22px rgba(0,0,0,.45)}',
        '#rpg-ap-pill:hover{opacity:1}',
        '#rpg-ap-pill.live{border-color:#22d3ee;color:#22d3ee}'
    ].join('');

    function setSheet(id, css) {
        var node = document.getElementById(id);
        if (!node) {
            node = document.createElement('style');
            node.id = id;
            (document.head || document.documentElement).appendChild(node);
        }
        node.textContent = css;
    }

    /* A field with a known list gets a dropdown, one without gets a text box.
       Either way, empty means "leave that field alone". */
    function optionRow(labelText, name) {
        var list = CHOICES[name] || [];
        var input;
        if (list.length) {
            input = document.createElement('select');
            var blank = document.createElement('option');
            blank.value = '';
            blank.textContent = 'Leave it alone';
            input.appendChild(blank);
            list.forEach(function (v) {
                var o = document.createElement('option');
                o.value = v;
                o.textContent = v;
                input.appendChild(o);
            });
        } else {
            input = el('input', { type: 'text', spellcheck: 'false', placeholder: 'leave empty to skip' });
        }

        input.addEventListener('change', function () {
            var patch = {};
            patch[name] = clean(input.value);
            update(patch);
        });

        function repaint() {
            if (document.activeElement === input) return;
            input.value = CUR[name] || '';
        }

        repaint();
        return { node: el('div', { 'class': 'row' }, [el('span', { text: labelText }), input]), repaint: repaint };
    }

    function build() {
        setSheet('rpg-ap-css', PANEL_CSS);

        panel = el('div', { id: 'rpg-ap', role: 'dialog', 'aria-label': 'Ticket Autopilot' });
        panel.hidden = true;
        panel.appendChild(el('h2', { text: 'Ticket Autopilot' }));
        panel.appendChild(el('p', { 'class': 'sub', text: 'Stamps the fields below onto each ticket you open.' }));

        /* --- the fields, in the order they are applied --- */
        var fieldSet = el('fieldset');
        fieldSet.appendChild(el('legend', { text: 'What every ticket becomes' }));
        var rows = [
            optionRow('Board', 'board'),
            optionRow('Status', 'status'),
            optionRow('Type', 'type'),
            optionRow('Subtype', 'subtype'),
            optionRow('Item', 'item')
        ];
        rows.forEach(function (r) { fieldSet.appendChild(r.node); });
        fieldSet.appendChild(el('p', { 'class': 'hint', text: 'Applied top to bottom, because the Board decides which Statuses and Types exist and the Type decides the Subtypes. Anything left on "Leave it alone" is not touched.' }));
        panel.appendChild(fieldSet);

        /* --- priority --- */
        var prioSet = el('fieldset');
        prioSet.appendChild(el('legend', { text: 'Priority' }));
        var prioRow = optionRow('Priority', 'priority');
        rows.push(prioRow);
        prioSet.appendChild(prioRow.node);
        prioSet.appendChild(el('p', { 'class': 'hint', text: 'Manage draws the priority as a menu rather than a list, so it is opened and the entry is clicked. That takes a moment longer than the others.' }));

        /* --- due date --- */
        var dueSet = el('fieldset');
        dueSet.appendChild(el('legend', { text: 'Due date' }));
        var dueSel = document.createElement('select');
        DUE_CHOICES.forEach(function (o) {
            var opt = document.createElement('option');
            opt.value = o[0];
            opt.textContent = o[1];
            dueSel.appendChild(opt);
        });
        dueSel.value = CUR.due;
        dueSel.addEventListener('change', function () { update({ due: dueSel.value }); });
        dueSet.appendChild(el('div', { 'class': 'row' }, [el('span', { text: 'Due' }), dueSel]));
        var weekendCb = el('input', { type: 'checkbox' });
        weekendCb.checked = !!CUR.skipWeekend;
        weekendCb.addEventListener('change', function () { update({ skipWeekend: weekendCb.checked }); });
        dueSet.appendChild(el('label', { 'class': 'check' }, [weekendCb, el('span', { text: 'Never land on a weekend' })]));
        var fmtSel = document.createElement('select');
        [['auto', 'Date format: match this tenant'], ['dmy', 'Date format: 31/12/2026'],
         ['mdy', 'Date format: 12/31/2026'], ['ymd', 'Date format: 2026-12-31']].forEach(function (o) {
            var opt = document.createElement('option');
            opt.value = o[0];
            opt.textContent = o[1];
            fmtSel.appendChild(opt);
        });
        fmtSel.value = CUR.dateFormat;
        fmtSel.addEventListener('change', function () { update({ dateFormat: fmtSel.value }); });
        dueSet.appendChild(el('div', { 'class': 'row' }, [fmtSel]));
        panel.appendChild(dueSet);
        panel.appendChild(prioSet);

        /* --- safety --- */
        var safeSet = el('fieldset');
        safeSet.appendChild(el('legend', { text: 'Care' }));
        var overCb = el('input', { type: 'checkbox' });
        overCb.checked = !!CUR.overwrite;
        overCb.addEventListener('change', function () { update({ overwrite: overCb.checked }); });
        safeSet.appendChild(el('label', { 'class': 'check' }, [overCb, el('span', { text: 'Also overwrite fields that already have a value' })]));
        safeSet.appendChild(el('p', { 'class': 'hint', text: 'Off by default: a field somebody already answered is left as it is, and the log says which. Status and Priority almost always hold a value already, so they need this on.' }));
        panel.appendChild(safeSet);

        /* --- how it is run --- */
        var runSet = el('fieldset');
        runSet.appendChild(el('legend', { text: 'Run it' }));
        var btnCb = el('input', { type: 'checkbox' });
        btnCb.checked = !!CUR.button;
        btnCb.addEventListener('change', function () { update({ button: btnCb.checked }); syncRunButtons(); });
        runSet.appendChild(el('label', { 'class': 'check' }, [btnCb, el('span', { text: 'Run autopilot button in the ticket toolbar' })]));
        runSet.appendChild(el('p', { 'class': 'hint', text: 'Press it on a ticket and the fields above are applied to that ticket, once. Use the clock below instead to have every ticket you open stamped automatically.' }));
        panel.appendChild(runSet);

        /* --- the clock --- */
        var clock = el('div', { 'class': 'clock' });
        var big = el('b', { text: ', ' });
        var small = el('small', { text: '' });
        var minutes = document.createElement('select');
        [15, 30, 45, 60, 120, 240, 480].forEach(function (m) {
            var o = document.createElement('option');
            o.value = String(m);
            o.textContent = m < 60 ? m + ' minutes' : (m / 60) + (m === 60 ? ' hour' : ' hours');
            minutes.appendChild(o);
        });
        minutes.value = String(CUR.minutes);
        minutes.addEventListener('change', function () { update({ minutes: parseInt(minutes.value, 10) }); });
        var go = el('button', { type: 'button', 'class': 'go', text: 'Start' });
        go.addEventListener('click', function () { startRun(); log('autopilot on for ' + CUR.minutes + ' minutes'); });
        var stop = el('button', { type: 'button', 'class': 'stop', text: 'Stop now' });
        stop.addEventListener('click', function () { stopRun(); log('autopilot off'); });
        clock.appendChild(big);
        clock.appendChild(small);
        clock.appendChild(el('div', { 'class': 'row' }, [el('span', { text: 'Run for' }), minutes]));
        clock.appendChild(el('div', { 'class': 'btns' }, [go, stop]));
        panel.appendChild(clock);

        var logBox = el('div', { 'class': 'log' });
        panel.appendChild(logBox);

        var note = el('p', { 'class': 'note' });
        note.appendChild(document.createTextNode('Alt+Shift+A opens this. Settings stay in this browser. '));
        note.appendChild(el('a', { href: 'https://rami.party/workshop/glamours/', target: '_blank',
            rel: 'noopener', text: 'About ↗' }));
        note.appendChild(el('span', { text: '  v' + VERSION }));
        panel.appendChild(note);

        pillEl = el('button', { id: 'rpg-ap-pill', type: 'button', text: 'Autopilot' });
        pillEl.addEventListener('click', toggle);

        var root = document.body || document.documentElement;
        root.appendChild(panel);
        root.appendChild(pillEl);

        refs = { rows: rows, dueSel: dueSel, weekendCb: weekendCb, fmtSel: fmtSel,
                 overCb: overCb, btnCb: btnCb, minutes: minutes, big: big, small: small,
                 clock: clock, log: logBox };
        sync();
        setInterval(tick, 1000);
    }

    function sync() {
        if (!refs) return;
        refs.rows.forEach(function (r) { r.repaint(); });
        if (document.activeElement !== refs.dueSel) refs.dueSel.value = CUR.due;
        refs.weekendCb.checked = !!CUR.skipWeekend;
        refs.fmtSel.value = CUR.dateFormat;
        refs.overCb.checked = !!CUR.overwrite;
        refs.btnCb.checked = !!CUR.button;
        refs.minutes.value = String(CUR.minutes);
        drawLog();
        tick();
    }

    function drawLog() {
        if (!refs) return;
        refs.log.textContent = '';
        entries.slice(-14).reverse().forEach(function (e) {
            var row = el('div');
            row.appendChild(el('time', { text: ('0' + e.at.getHours()).slice(-2) + ':' + ('0' + e.at.getMinutes()).slice(-2) }));
            row.appendChild(document.createTextNode(e.text));
            refs.log.appendChild(row);
        });
    }

    var wasRunning = false;

    function tick() {
        var live = running();
        if (wasRunning && !live) {
            wasRunning = false;
            log('time is up: autopilot switched itself off');
        }
        if (live) wasRunning = true;
        if (pillEl) {
            pillEl.textContent = live ? 'Autopilot ' + mmss(remaining()) : 'Autopilot';
            if (live) pillEl.classList.add('live'); else pillEl.classList.remove('live');
        }
        if (!refs) return;
        refs.clock.className = live ? 'clock' : 'clock off';
        refs.big.textContent = live ? mmss(remaining()) : 'off';
        refs.small.textContent = live
            ? 'stops at ' + new Date(CUR.until).toLocaleTimeString()
            : 'nothing is being changed';
    }

    function toggle() {
        if (!panel) return;
        panel.hidden = !panel.hidden;
        if (!panel.hidden) sync();
    }

    /* ---------------- boot ---------------- */

    try {
        Object.defineProperty(window, NS, {
            value: { version: VERSION, toggle: toggle, running: running },
            enumerable: false, configurable: true
        });
    } catch (e) { window[NS] = { toggle: toggle }; }

    function start() {
        CUR = load();
        wasRunning = running();
        if (IS_TOP) build();
        watchTickets();
        document.addEventListener('keydown', function (e) {
            if (e.altKey && e.shiftKey && e.code === 'KeyA') { e.preventDefault(); toggle(); }
        }, true);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();

    /* Other frames and tabs share the clock. */
    window.addEventListener('storage', function (e) {
        if (e.key === KEY) { CUR = load(); sync(); }
    });
})();
