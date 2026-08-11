// ==UserScript==
// @name         ConnectWise Manage · Ticket Autopilot
// @namespace    https://rami.party/workshop/glamours/
// @version      1.0.0
// @description  Stamp the same fields onto every ticket you open: Type and Subtype for incidents, Type/Subtype/Item for changes, a priority, yourself as ticket owner, a due date. Then have it switch itself off after the time you set. The option lists are read out of Manage's own dropdowns, every change is logged, and the countdown at the bottom means you cannot leave it running by accident. Alt+Shift+A.
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
   Type, the same Subtype, a priority, your own name in Ticket Owner, a due
   date. This does them as each ticket opens.

   It writes into a live PSA, so it is built to be timid:

   • It runs on a timer you set, shows the countdown, and switches ITSELF off.
     A stamping rule you forgot about is worse than no rule at all, which is
     why the clock is the one control you cannot skip.
   • It fills empty fields. Anything already answered is left alone unless you
     explicitly allow overwriting.
   • Every field it touches is written to the log in the panel, with the ticket
     number, so "what did it just do" always has an answer.
   • It stamps a ticket once. Manage pools and re-uses its pod widgets, so the
     guard is keyed to the ticket that is in the pod, not to the pod element.

   The option lists (Subtype, Item, Priority, Owner) are not guessed: they are
   read out of Manage's own dropdown the first time you open one, or on demand
   with the "pull in" button next to each list.
   -------------------------------------------------------------------------- */

(function () {
    'use strict';

    var NS = '__rpgAutopilot';
    if (window[NS]) { window[NS].toggle(); return; }

    var IS_TOP = window.self === window.top;
    var VERSION = '1.0.0';
    var KEY = 'rpGlamourCwAuto.v1';
    var OPTS_KEY = 'rpGlamourCwAuto.options';

    var DEFAULTS = {
        stamp: 'off',        // off | incident | change
        subtype: '',
        item: '',
        priority: '',
        prioOn: false,
        owner: '',
        ownerOn: false,
        due: 'off',          // off | 0 | 1 | 2 | 3 | 5 | 7 | 14  (days from today)
        skipWeekend: true,
        dateFormat: 'auto',  // auto | dmy | mdy | ymd
        overwrite: false,    // touch fields that already have a value
        minutes: 30,         // how long a run lasts
        until: 0,            // epoch ms; 0 = not running
        pill: true
    };

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

    /* Learned dropdown contents, per field, per tenant host. */
    function options(field) {
        var all = read(OPTS_KEY);
        return (all[location.hostname] && all[location.hostname][field]) || [];
    }

    function rememberOptions(field, list) {
        if (!list || !list.length) return false;
        var all = read(OPTS_KEY);
        if (!all[location.hostname]) all[location.hostname] = {};
        var old = all[location.hostname][field] || [];
        if (old.join('|') === list.join('|')) return false;
        all[location.hostname][field] = list.slice(0, 300);
        write(OPTS_KEY, all);
        return true;
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
        type: { label: 'Type', sel: 'input.cw_type', kind: 'combo' },
        subtype: { label: 'Subtype', sel: 'input.cw_subType', kind: 'combo' },
        item: { label: 'Item', sel: 'input.cw_item', kind: 'combo' },
        owner: { label: 'Ticket Owner', sel: 'input.cw_ticketOwner', kind: 'combo' },
        due: { label: 'Due Date', sel: '.cw_dueDate input', kind: 'text' },
        priority: { label: 'Priority', sel: '.cw_servicePriority', kind: 'menu' }
    };

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

    function field(scope, name) {
        var f = FIELDS[name];
        if (!f) return null;
        return (scope || document).querySelector(f.sel);
    }

    /* Manage writes its own “nothing chosen yet” text into some fields, and a
       placeholder is not an answer somebody gave. */
    var BLANKISH = /^\(?\s*(unassigned|none|no one|not assigned|select|choose)[\s.…]*\)?$/i;

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

    /* The arrow that opens a combo is the element after the input. */
    function triggerFor(input) {
        var wrap = input && input.parentElement;
        if (!wrap) return null;
        return wrap.querySelector('.cwsvg') || input.nextElementSibling;
    }

    /* ---------------- reading Manage's own dropdowns ----------------
       An open GXT list is a floating element that was not there a moment ago.
       Rather than guess at compiler-generated class names, watch for one to
       appear and take the leaf text out of it. */

    var listWatch = { field: null, started: 0, done: null };

    function floatingItems(node) {
        var items = [], nodes = node.querySelectorAll('*');
        for (var i = 0; i < nodes.length && items.length < 300; i++) {
            var n = nodes[i];
            if (n.children.length) continue;
            var t = clean(n.textContent);
            if (t && t.length <= 80 && items.indexOf(t) === -1) items.push(t);
        }
        return items;
    }

    function looksLikeList(node) {
        if (!node || node.nodeType !== 1 || !node.isConnected) return false;
        if (node.id === 'rpg-ap' || (node.closest && node.closest('#rpg-ap'))) return false;
        if (node.querySelector('input,textarea')) return false;
        var pos = getComputedStyle(node).position;
        if (pos !== 'absolute' && pos !== 'fixed' && node.parentElement !== document.body) return false;
        var items = floatingItems(node);
        return items.length >= 2 ? items : false;
    }

    function harvest(node) {
        if (!listWatch.field || Date.now() - listWatch.started > 6000) return;
        var items = looksLikeList(node);
        if (!items) return;
        var f = listWatch.field;
        listWatch.field = null;
        if (rememberOptions(f, items)) log('learned ' + items.length + ' ' + FIELDS[f].label + ' options');
        if (listWatch.done) { var cb = listWatch.done; listWatch.done = null; cb(items); }
        sync();
    }

    function watchLists() {
        new MutationObserver(function (records) {
            for (var r = 0; r < records.length; r++) {
                for (var i = 0; i < records[r].addedNodes.length; i++) {
                    var n = records[r].addedNodes[i];
                    if (n.nodeType === 1) { try { harvest(n); } catch (e) { /* never break Manage */ } }
                }
            }
        }).observe(document.body, { childList: true, subtree: true });

        /* Passive learning: whatever list opens while one of our fields has
           focus belongs to that field. Costs nothing and needs no clicking. */
        document.addEventListener('focusin', function (e) {
            var t = e.target;
            if (!t || t.tagName !== 'INPUT') return;
            Object.keys(FIELDS).forEach(function (name) {
                if (FIELDS[name].kind === 'combo' && t.matches(FIELDS[name].sel)) {
                    listWatch.field = name;
                    listWatch.started = Date.now();
                }
            });
        }, true);
    }

    /* Explicit "pull in": open the dropdown, read it, put it back. */
    function pullOptions(name, done) {
        var f = FIELDS[name];
        var scope = document;
        var node = field(scope, name);
        if (!node) { done('Open a ticket first: the ' + f.label + ' field is not on screen.'); return; }
        listWatch.field = name;
        listWatch.started = Date.now();
        listWatch.done = function (items) { done(null, items); };
        try {
            press(f.kind === 'menu' ? node : triggerFor(node));
        } catch (e) { /* ignore */ }
        setTimeout(function () {
            try {
                (node.tagName === 'INPUT' ? node : document.body).dispatchEvent(
                    new KeyboardEvent('keydown', { bubbles: true, key: 'Escape', code: 'Escape' }));
                press(f.kind === 'menu' ? node : triggerFor(node));
            } catch (e) { /* ignore */ }
            if (listWatch.field === name) {
                listWatch.field = null;
                listWatch.done = null;
                done('No list appeared. Open the ' + f.label + ' dropdown yourself once and it will be remembered.');
            }
        }, 900);
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

    function dueDate(days) {
        var d = new Date();
        d.setDate(d.getDate() + days);
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
    var pending = 0;

    function signature(scope) {
        var bits = [];
        ['input.cw_company', 'input.cw_status', 'input.cw_serviceBoard'].forEach(function (sel) {
            var n = scope.querySelector && scope.querySelector(sel);
            if (n) bits.push(clean(n.value));
        });
        var summary = scope.querySelector && scope.querySelector('[class*="summaryHeader"],input.cw_summary');
        if (summary) bits.push(clean(summary.value || summary.textContent).slice(0, 60));
        return bits.join('¦');
    }

    function ticketLabel(scope) {
        var n = scope.querySelector && scope.querySelector('[class*="summaryHeader"]');
        var t = n ? clean(n.textContent) : '';
        var m = /#?(\d{4,})/.exec(t);
        return m ? '#' + m[1] : (t.slice(0, 28) || 'ticket');
    }

    function setMenuValue(button, wanted, done) {
        listWatch.field = null;
        var picked = false;
        var obs = new MutationObserver(function (records) {
            if (picked) return;
            for (var r = 0; r < records.length; r++) {
                for (var i = 0; i < records[r].addedNodes.length; i++) {
                    var n = records[r].addedNodes[i];
                    if (n.nodeType !== 1) continue;
                    var items = looksLikeList(n);
                    if (!items) continue;
                    var leaves = n.querySelectorAll('*');
                    for (var k = 0; k < leaves.length; k++) {
                        if (leaves[k].children.length) continue;
                        if (clean(leaves[k].textContent).toLowerCase() === wanted.toLowerCase()) {
                            picked = true;
                            press(leaves[k]);
                            obs.disconnect();
                            done(true);
                            return;
                        }
                    }
                }
            }
        });
        obs.observe(document.body, { childList: true, subtree: true });
        press(button);
        setTimeout(function () {
            if (picked) return;
            obs.disconnect();
            try {
                document.body.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape', code: 'Escape' }));
            } catch (e) { /* ignore */ }
            done(false);
        }, 1200);
    }

    function fill(scope, name, value, changes) {
        if (!value) return;
        var f = FIELDS[name];
        var node = field(scope, name);
        if (!node) return;
        if (f.kind === 'menu') {
            var shown = clean(node.textContent);
            if (!CUR.overwrite && !blankish(shown) && shown.toLowerCase().indexOf(value.toLowerCase()) !== -1) return;
            setMenuValue(node, value, function (ok) {
                if (ok) log(changes.label + ': ' + f.label + ' → ' + value);
            });
            return;
        }
        var had = clean(node.value);
        if (!blankish(had) && !CUR.overwrite) return;
        if (had.toLowerCase() === value.toLowerCase()) return;
        if (setCombo(node, value)) changes.list.push(f.label + ' → ' + value);
    }

    function stamp(scope) {
        if (!running()) return;
        var sig = signature(scope);
        if (!sig) return;
        if (stamped.get(scope) === sig) return;
        stamped.set(scope, sig);

        var changes = { list: [], label: ticketLabel(scope) };

        if (CUR.stamp === 'incident') {
            fill(scope, 'type', 'Incident', changes);
            fill(scope, 'subtype', CUR.subtype, changes);
        } else if (CUR.stamp === 'change') {
            fill(scope, 'type', 'Change', changes);
            fill(scope, 'subtype', CUR.subtype, changes);
            fill(scope, 'item', CUR.item, changes);
        }
        if (CUR.ownerOn) fill(scope, 'owner', CUR.owner, changes);
        if (CUR.due !== 'off') fill(scope, 'due', dueDate(parseInt(CUR.due, 10) || 0), changes);
        if (CUR.prioOn) fill(scope, 'priority', CUR.priority, changes);

        if (changes.list.length) log(changes.label + ': ' + changes.list.join(', '));
    }

    function watchTickets() {
        function sweep() {
            if (!running()) return;
            var anchors = document.querySelectorAll('input.cw_type');
            for (var i = 0; i < anchors.length; i++) {
                try { stamp(ticketScope(anchors[i])); } catch (e) { /* one bad pod must not stop the rest */ }
            }
        }
        new MutationObserver(function () {
            if (!running() || pending) return;
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
        '#rpg-ap{position:fixed!important;right:14px;bottom:58px;z-index:2147483500;width:min(330px,calc(100vw - 28px));',
        'max-height:min(82vh,860px);overflow:auto;padding:14px;border-radius:14px;',
        'background:#150a33!important;border:1px solid rgba(168,85,247,.5);color:#ece9ff;font-size:13px;line-height:1.45;',
        'box-shadow:0 18px 46px rgba(0,0,0,.55)}',
        '#rpg-ap[hidden],#rpg-ap-pill[hidden]{display:none!important}',
        '#rpg-ap h2{margin:0 0 2px;font-weight:700;font-size:14px;line-height:1.2;color:#e9d5ff}',
        '#rpg-ap .sub{margin:0 0 10px;font-size:11px;color:#9d92c9}',
        '#rpg-ap fieldset{border:0;border-top:1px solid rgba(168,85,247,.25);margin:12px 0 0;padding:8px 0 0}',
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
        '#rpg-ap-pill{position:fixed!important;right:14px;bottom:14px;z-index:2147483499;display:inline-flex;',
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

    /* A remembered list plus a free-text box: the dropdown may not have been
       opened yet, and a value Manage accepts is a value you can type. */
    function optionRow(labelText, name, key) {
        var select = document.createElement('select');
        var text = el('input', { type: 'text', spellcheck: 'false', placeholder: 'or type it' });
        var pull = el('button', { type: 'button', title: 'Open the ' + FIELDS[name].label +
            ' dropdown on the ticket in front of you and remember what is in it', text: 'pull in' });

        function repaint() {
            var list = options(name);
            select.textContent = '';
            var blank = document.createElement('option');
            blank.value = '';
            blank.textContent = list.length ? ', choose, ' : ', nothing learned yet, ';
            select.appendChild(blank);
            list.forEach(function (v) {
                var o = document.createElement('option');
                o.value = v;
                o.textContent = v;
                select.appendChild(o);
            });
            select.value = list.indexOf(CUR[key]) === -1 ? '' : CUR[key];
            if (document.activeElement !== text) text.value = CUR[key] || '';
        }

        select.addEventListener('change', function () {
            if (select.value) { var p = {}; p[key] = select.value; update(p); }
        });
        text.addEventListener('change', function () {
            var p = {};
            p[key] = clean(text.value);
            update(p);
        });
        pull.addEventListener('click', function () {
            pull.textContent = '…';
            pullOptions(name, function (err) {
                pull.textContent = 'pull in';
                if (err) log(err);
                repaint();
            });
        });

        var node = el('div', null, [
            el('div', { 'class': 'row' }, [el('span', { text: labelText }), select, pull]),
            el('div', { 'class': 'row' }, [el('span', { text: '' }), text])
        ]);
        return { node: node, repaint: repaint };
    }

    function build() {
        setSheet('rpg-ap-css', PANEL_CSS);

        panel = el('div', { id: 'rpg-ap', role: 'dialog', 'aria-label': 'Ticket Autopilot' });
        panel.hidden = true;
        panel.appendChild(el('h2', { text: '🎯 Ticket Autopilot' }));
        panel.appendChild(el('p', { 'class': 'sub', text: 'Stamps the fields below onto each ticket you open.' }));

        /* --- Options 1 and 2: one Type, or neither --- */
        var typeSet = el('fieldset');
        typeSet.appendChild(el('legend', { text: 'What every ticket becomes' }));
        var stampBoxes = {};
        [['incident', 'All incidents'], ['change', 'All changes']].forEach(function (o) {
            var cb = el('input', { type: 'checkbox' });
            cb.checked = CUR.stamp === o[0];
            cb.addEventListener('change', function () {
                update({ stamp: cb.checked ? o[0] : 'off' });
            });
            stampBoxes[o[0]] = cb;
            typeSet.appendChild(el('label', { 'class': 'check' }, [cb, el('span', { text: o[1] })]));
        });
        var subRow = optionRow('Subtype', 'subtype', 'subtype');
        var itemRow = optionRow('Item', 'item', 'item');
        typeSet.appendChild(subRow.node);
        typeSet.appendChild(itemRow.node);
        typeSet.appendChild(el('p', { 'class': 'hint', text: 'Incidents get a Subtype; changes get a Subtype and an Item. Ticking one unticks the other: a ticket only has one Type.' }));
        panel.appendChild(typeSet);

        /* --- Option 3: priority --- */
        var prioSet = el('fieldset');
        prioSet.appendChild(el('legend', { text: 'Priority' }));
        var prioCb = el('input', { type: 'checkbox' });
        prioCb.checked = !!CUR.prioOn;
        prioCb.addEventListener('change', function () { update({ prioOn: prioCb.checked }); });
        prioSet.appendChild(el('label', { 'class': 'check' }, [prioCb, el('span', { text: 'Set the priority' })]));
        var prioRow = optionRow('Priority', 'priority', 'priority');
        prioSet.appendChild(prioRow.node);
        panel.appendChild(prioSet);

        /* --- Option 4: owner --- */
        var ownerSet = el('fieldset');
        ownerSet.appendChild(el('legend', { text: 'Ticket owner' }));
        var ownerCb = el('input', { type: 'checkbox' });
        ownerCb.checked = !!CUR.ownerOn;
        ownerCb.addEventListener('change', function () { update({ ownerOn: ownerCb.checked }); });
        ownerSet.appendChild(el('label', { 'class': 'check' }, [ownerCb, el('span', { text: 'Make me the ticket owner' })]));
        var ownerRow = optionRow('Name', 'owner', 'owner');
        ownerSet.appendChild(ownerRow.node);
        var mine = el('button', { type: 'button', text: 'use the name on screen' });
        mine.title = 'Copies the name out of a Member field if one is open.';
        mine.addEventListener('click', function () {
            var m = document.querySelector('input.cw_member,input.cw_memberIdentifier');
            if (m && clean(m.value)) { update({ owner: clean(m.value) }); ownerRow.repaint(); }
            else log('No Member field on screen: type your name as Manage spells it.');
        });
        ownerSet.appendChild(el('div', { 'class': 'row' }, [el('span', { text: '' }), mine]));
        panel.appendChild(ownerSet);

        /* --- Option 5: due date --- */
        var dueSet = el('fieldset');
        dueSet.appendChild(el('legend', { text: 'Due date' }));
        var dueSel = document.createElement('select');
        [['off', 'Leave it alone'], ['0', 'Today'], ['1', 'Tomorrow'], ['2', 'In 2 days'],
         ['3', 'In 3 days'], ['5', 'In 5 days'], ['7', 'In a week'], ['14', 'In two weeks']].forEach(function (o) {
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

        /* --- safety --- */
        var safeSet = el('fieldset');
        safeSet.appendChild(el('legend', { text: 'Care' }));
        var overCb = el('input', { type: 'checkbox' });
        overCb.checked = !!CUR.overwrite;
        overCb.addEventListener('change', function () { update({ overwrite: overCb.checked }); });
        safeSet.appendChild(el('label', { 'class': 'check' }, [overCb, el('span', { text: 'Also overwrite fields that already have a value' })]));
        safeSet.appendChild(el('p', { 'class': 'hint', text: 'Off by default: a field somebody already answered is left as it is.' }));
        panel.appendChild(safeSet);

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

        pillEl = el('button', { id: 'rpg-ap-pill', type: 'button', text: '🎯 Autopilot' });
        pillEl.addEventListener('click', toggle);

        var root = document.body || document.documentElement;
        root.appendChild(panel);
        root.appendChild(pillEl);

        refs = { stampBoxes: stampBoxes, subRow: subRow, itemRow: itemRow, prioCb: prioCb, prioRow: prioRow,
                 ownerCb: ownerCb, ownerRow: ownerRow, dueSel: dueSel, weekendCb: weekendCb, fmtSel: fmtSel,
                 overCb: overCb, minutes: minutes, big: big, small: small, clock: clock, log: logBox };
        sync();
        setInterval(tick, 1000);
    }

    function sync() {
        if (!refs) return;
        Object.keys(refs.stampBoxes).forEach(function (k) { refs.stampBoxes[k].checked = CUR.stamp === k; });
        refs.itemRow.node.hidden = CUR.stamp !== 'change';
        refs.subRow.node.hidden = CUR.stamp === 'off';
        refs.subRow.repaint();
        refs.itemRow.repaint();
        refs.prioCb.checked = !!CUR.prioOn;
        refs.prioRow.node.hidden = !CUR.prioOn;
        refs.prioRow.repaint();
        refs.ownerCb.checked = !!CUR.ownerOn;
        refs.ownerRow.node.hidden = !CUR.ownerOn;
        refs.ownerRow.repaint();
        if (document.activeElement !== refs.dueSel) refs.dueSel.value = CUR.due;
        refs.weekendCb.checked = !!CUR.skipWeekend;
        refs.fmtSel.value = CUR.dateFormat;
        refs.overCb.checked = !!CUR.overwrite;
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
            pillEl.textContent = live ? '🎯 Autopilot ' + mmss(remaining()) : '🎯 Autopilot';
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
        watchLists();
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
