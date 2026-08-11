// ==UserScript==
// @name         Truesight · Page Inspector
// @namespace    https://rami.party/workshop/glamours/
// @version      1.0.0
// @description  See what a page is actually doing: every host and IP it talks to, first- or third-party, the scripts and frames it loads, the storage it keeps, the APIs it reaches for, and a findings list of the things worth a second look: mixed content, IP-literal hosts, look-alike links, cross-origin form posts, WebRTC address leaks. Read-only, nothing leaves the browser, one keystroke to a report you can paste into a ticket. Alt+Shift+I.
// @author       rami.party
// @license      MIT
// @match        *://*/*
// @icon         data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%230b1020'/%3E%3Cpath d='M12 50s14-22 38-22 38 22 38 22-14 22-38 22S12 50 12 50Z' fill='none' stroke='%2322d3ee' stroke-width='6'/%3E%3Ccircle cx='50' cy='50' r='11' fill='%23a855f7'/%3E%3C/svg%3E
// @run-at       document-start
// @grant        none
// @homepageURL  https://rami.party/workshop/glamours/
// @supportURL   https://rami.party/workshop/glamours/
// @downloadURL  https://rami.party/workshop/glamours/user-scripts/truesight.user.js
// @updateURL    https://rami.party/workshop/glamours/user-scripts/truesight.user.js
// ==/UserScript==

/* --------------------------------------------------------------------------
   Truesight: what is this page really doing?
   --------------------------------------------------------------------------
   A page tells you almost nothing about the company it keeps. This watches
   the traffic it generates and the browser features it reaches for, and puts
   the answer in one panel: hosts, frames, scripts, storage, and a findings
   list of the things an analyst would want to look at twice.

   Three rules it keeps:

   • It never sends anything anywhere. There is no fetch, no beacon, no
     analytics, no DNS lookup. Everything it knows came from this tab.
   • It never changes what the page does. Every hook passes straight through
     to the original and is wrapped in try/catch; if a hook throws, the page
     still wins.
   • It says what it cannot see. Cross-origin frames, HttpOnly cookies and
     anything that loaded before it did are called out rather than guessed at.

   It runs in every frame but only draws in the top one; same-origin frames
   hand their records up, cross-origin frames keep theirs to themselves,
   because posting them out would mean handing them to the page.
   -------------------------------------------------------------------------- */

(function () {
    'use strict';

    var NS = '__rpgTruesight';
    if (window[NS]) { window[NS].toggle(); return; }      // re-clicked bookmarklet

    var IS_TOP = window.self === window.top;
    var VERSION = '1.0.0';
    var MAX_EVENTS = 600;
    var MAX_SAMPLES = 6;
    /* Started before the page did = a userscript on every page, so stay out of
       the way behind the badge. Started after = somebody clicked, so open. */
    var onDemand = document.readyState !== 'loading';

    /* ---------------- state ---------------- */

    var hosts = {};          // host -> record
    var events = [];         // timeline
    var apiHits = {};        // api name -> count
    var paused = false;
    var startedAt = Date.now();
    var panel = null, refs = null, dirty = false;

    function now() { return Date.now() - startedAt; }

    /* ---------------- host bookkeeping ---------------- */

    /* Enough of the public suffix list to tell "bbc.co.uk" from "evil.co.uk".
       A full list would be 200 kB; these cover the shapes that actually turn
       up in a first- vs third-party call. */
    var TWO_LEVEL = /\.(co|com|net|org|gov|edu|ac|or|ne|in|mil|sch)\.[a-z]{2,3}$/i;

    function registrable(host) {
        var parts = String(host).split('.');
        if (parts.length < 3) return host;
        return TWO_LEVEL.test(host) ? parts.slice(-3).join('.') : parts.slice(-2).join('.');
    }

    var IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

    function isIp(host) {
        return IPV4.test(host) || host.indexOf('[') === 0 || /^[0-9a-f]*:[0-9a-f:]+$/i.test(host);
    }

    var pageHost = '';
    var pageSite = '';
    try { pageHost = location.hostname; pageSite = registrable(pageHost); } catch (e) { /* opaque origin */ }

    function record(rawUrl, kind, bytes, note) {
        if (paused || !rawUrl) return null;
        var url, host, scheme;
        try {
            url = new URL(String(rawUrl), location.href);
            scheme = url.protocol;
            host = url.hostname;
        } catch (e) { return null; }

        if (scheme === 'data:' || scheme === 'blob:' || scheme === 'javascript:' ||
            scheme === 'about:' || scheme === 'chrome-extension:' || scheme === 'moz-extension:') {
            host = '(' + scheme.replace(':', '') + ')';
        }
        if (!host) return null;

        var rec = hosts[host];
        if (!rec) {
            rec = hosts[host] = {
                host: host,
                site: host.charAt(0) === '(' ? host : registrable(host),
                third: host.charAt(0) !== '(' && registrable(host) !== pageSite,
                ip: isIp(host),
                insecure: false,
                count: 0,
                bytes: 0,
                kinds: {},
                first: now(),
                last: now(),
                samples: []
            };
        }
        rec.count++;
        rec.last = now();
        rec.bytes += bytes || 0;
        rec.kinds[kind] = (rec.kinds[kind] || 0) + 1;
        if (scheme === 'http:') rec.insecure = true;
        if (rec.samples.length < MAX_SAMPLES) {
            var short = url.pathname + (url.search ? url.search.slice(0, 60) : '');
            if (rec.samples.indexOf(short) === -1) rec.samples.push(short);
        }
        if (note) log(kind, note, 'info');
        mark();
        return rec;
    }

    function log(kind, text, level) {
        events.push({ t: now(), kind: kind, text: String(text).slice(0, 300), level: level || 'info' });
        if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
        mark();
    }

    function api(name, detail) {
        apiHits[name] = (apiHits[name] || 0) + 1;
        if (apiHits[name] <= 3) log('api', name + (detail ? ', ' + detail : ''), 'warn');
        mark();
    }

    /* ---------------- frames ----------------
       A same-origin child can hand its records to the top document directly.
       A cross-origin child cannot without posting them into the page, so it
       keeps them and the panel says so. */

    var upstream = null;

    function findUpstream() {
        if (IS_TOP) return null;
        try {
            var t = window.top;
            if (t && t[NS] && typeof t[NS].ingest === 'function') return t[NS];
        } catch (e) { /* cross-origin */ }
        return null;
    }

    var outbox = [];

    function relay(type, payload) {
        upstream = upstream || findUpstream();
        if (upstream) { try { upstream.ingest(type, payload, location.href); return true; } catch (e) { /* gone */ } }
        outbox.push([type, payload]);
        if (outbox.length > 200) outbox.shift();
        return false;
    }

    /* ---------------- hooks ----------------
       Every one of these calls through to the original and swallows its own
       errors: instrumentation must never be the reason a page breaks. */

    function safe(fn) {
        return function () {
            try { return fn.apply(this, arguments); } catch (e) { return undefined; }
        };
    }

    var seen = safe(function (url, kind, bytes, note) {
        if (IS_TOP) record(url, kind, bytes, note);
        else if (!relay('req', { url: String(url), kind: kind, bytes: bytes || 0 })) record(url, kind, bytes, note);
    });

    var noticed = safe(function (name, detail) {
        if (IS_TOP) api(name, detail);
        else if (!relay('api', { name: name, detail: detail })) api(name, detail);
    });

    /* fetch */
    if (window.fetch) {
        var nativeFetch = window.fetch;
        window.fetch = function (input, init) {
            var url = (input && input.url) ? input.url : input;
            seen(url, 'fetch', 0);
            return nativeFetch.apply(this, arguments);
        };
    }

    /* XMLHttpRequest */
    if (window.XMLHttpRequest && XMLHttpRequest.prototype) {
        var xhrOpen = XMLHttpRequest.prototype.open;
        var xhrSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.open = function (method, url) {
            try { this.__rpgUrl = url; this.__rpgMethod = method; } catch (e) { /* frozen */ }
            return xhrOpen.apply(this, arguments);
        };
        XMLHttpRequest.prototype.send = function (body) {
            seen(this.__rpgUrl, 'xhr', 0);
            if (body && typeof body === 'string' && body.length > 2000) {
                noticed('XHR body ' + Math.round(body.length / 1024) + ' kB');
            }
            return xhrSend.apply(this, arguments);
        };
    }

    /* sendBeacon: the one that fires while you are leaving */
    if (navigator.sendBeacon) {
        var nativeBeacon = navigator.sendBeacon.bind(navigator);
        navigator.sendBeacon = function (url, data) {
            seen(url, 'beacon', (data && data.length) || 0);
            return nativeBeacon(url, data);
        };
    }

    /* WebSocket / EventSource / RTCPeerConnection */
    function wrapCtor(name, after) {
        var Native = window[name];
        if (typeof Native !== 'function') return;
        function Wrapped() {
            var args = [null].concat([].slice.call(arguments));
            var obj = new (Function.prototype.bind.apply(Native, args))();
            try { after(obj, arguments); } catch (e) { /* never break the page */ }
            return obj;
        }
        Wrapped.prototype = Native.prototype;
        try { window[name] = Wrapped; } catch (e) { /* read-only */ }
    }

    wrapCtor('WebSocket', function (ws, args) { seen(args[0], 'websocket', 0); });
    wrapCtor('EventSource', function (es, args) { seen(args[0], 'eventsource', 0); });
    wrapCtor('RTCPeerConnection', function (pc) {
        noticed('RTCPeerConnection');
        pc.addEventListener('icecandidate', function (e) {
            var c = e && e.candidate && e.candidate.candidate;
            if (!c) return;
            var m = /(\d{1,3}(?:\.\d{1,3}){3}|[0-9a-f]{1,4}(?::[0-9a-f]{0,4}){2,7})/i.exec(c);
            if (m) noticed('WebRTC address', m[1]);
        });
    });

    /* Code that writes code */
    var NativeFunction = window.Function;
    try {
        var WrappedFunction = function () {
            noticed('new Function()');
            return NativeFunction.apply(this, arguments);
        };
        WrappedFunction.prototype = NativeFunction.prototype;
        window.Function = WrappedFunction;
    } catch (e) { /* leave it */ }

    ['setTimeout', 'setInterval'].forEach(function (name) {
        var native = window[name];
        if (typeof native !== 'function') return;
        window[name] = function (handler) {
            if (typeof handler === 'string') noticed(name + '(string)', handler.slice(0, 60));
            return native.apply(this, arguments);
        };
    });

    /* Navigation and permission-flavoured APIs */
    var nativeOpen = window.open;
    window.open = function (url) {
        noticed('window.open', String(url || '').slice(0, 80));
        seen(url, 'window.open', 0);
        if (held) { log('hold', 'blocked window.open ' + String(url || ''), 'warn'); return null; }
        return nativeOpen.apply(this, arguments);
    };

    function watchMethod(obj, name, label) {
        if (!obj || typeof obj[name] !== 'function') return;
        var native = obj[name];
        try {
            obj[name] = function () { noticed(label); return native.apply(this, arguments); };
        } catch (e) { /* getter-only */ }
    }

    watchMethod(navigator.geolocation, 'getCurrentPosition', 'geolocation.getCurrentPosition');
    watchMethod(navigator.geolocation, 'watchPosition', 'geolocation.watchPosition');
    watchMethod(navigator.mediaDevices, 'getUserMedia', 'getUserMedia (camera/mic)');
    watchMethod(navigator.clipboard, 'readText', 'clipboard.readText');
    watchMethod(navigator.clipboard, 'writeText', 'clipboard.writeText');
    watchMethod(navigator.permissions, 'query', 'permissions.query');
    watchMethod(navigator.credentials, 'get', 'credentials.get');
    watchMethod(window.Notification, 'requestPermission', 'Notification.requestPermission');
    watchMethod(document, 'write', 'document.write');
    watchMethod(document, 'writeln', 'document.writeln');

    /* Everything the browser fetched on its own: images, styles, fonts, and
       anything that loaded before this script did (buffered:true is the whole
       reason the bookmarklet is worth clicking on an already-open page). */
    if (window.PerformanceObserver) {
        try {
            new PerformanceObserver(function (list) {
                list.getEntries().forEach(function (e) {
                    seen(e.name, e.initiatorType || 'resource', e.transferSize || 0);
                });
            }).observe({ type: 'resource', buffered: true });
        } catch (e) {
            try {
                (performance.getEntriesByType('resource') || []).forEach(function (e) {
                    seen(e.name, e.initiatorType || 'resource', e.transferSize || 0);
                });
            } catch (e2) { /* no resource timing */ }
        }
    }

    /* ---------------- hold the page ----------------
       Stops a redirect chain long enough to read it. It cannot lock down
       location assignment: nothing in a page can, so it takes away the
       exits it can reach and logs the rest. */

    var held = false;
    var holdGuard = null;

    function holdBeforeUnload(e) { e.preventDefault(); e.returnValue = ''; }

    function setHold(on) {
        held = !!on;
        if (held) {
            window.addEventListener('beforeunload', holdBeforeUnload);
            holdGuard = setInterval(stripRefresh, 500);
            stripRefresh();
            log('hold', 'holding the page: meta refresh removed, window.open blocked', 'warn');
        } else {
            window.removeEventListener('beforeunload', holdBeforeUnload);
            clearInterval(holdGuard);
            holdGuard = null;
        }
    }

    function stripRefresh() {
        var metas = document.querySelectorAll('meta[http-equiv="refresh" i]');
        for (var i = 0; i < metas.length; i++) {
            log('hold', 'meta refresh: ' + (metas[i].getAttribute('content') || ''), 'warn');
            metas[i].parentNode.removeChild(metas[i]);
        }
    }

    /* ---------------- page scan ---------------- */

    function txt(node) { return (node.textContent || '').replace(/\s+/g, ' ').trim(); }

    function hostOf(url) {
        try { return new URL(url, location.href).hostname; } catch (e) { return ''; }
    }

    function scanPage() {
        var out = {
            scripts: [], inlineScripts: 0, inlineBytes: 0,
            frames: [], forms: [], lookalikes: [], unsafeBlank: 0,
            pixels: 0, hiddenInputs: 0
        };
        var i, n;

        var scripts = document.querySelectorAll('script');
        for (i = 0; i < scripts.length; i++) {
            n = scripts[i];
            if (n.src) {
                var h = hostOf(n.src);
                if (h) out.scripts.push({ host: h, third: registrable(h) !== pageSite, src: n.src.slice(0, 160) });
            } else if (txt(n)) {
                out.inlineScripts++;
                out.inlineBytes += (n.textContent || '').length;
            }
        }

        var frames = document.querySelectorAll('iframe,frame');
        for (i = 0; i < frames.length; i++) {
            n = frames[i];
            var fh = hostOf(n.src || '');
            out.frames.push({
                host: fh || '(inline)',
                third: !!fh && registrable(fh) !== pageSite,
                sandbox: n.getAttribute('sandbox'),
                allow: n.getAttribute('allow'),
                src: (n.src || '').slice(0, 160)
            });
        }

        var forms = document.querySelectorAll('form');
        for (i = 0; i < forms.length; i++) {
            n = forms[i];
            var action = n.getAttribute('action') || location.href;
            var ah = hostOf(action);
            out.forms.push({
                host: ah || pageHost,
                cross: !!ah && registrable(ah) !== pageSite,
                method: (n.getAttribute('method') || 'get').toLowerCase(),
                password: !!n.querySelector('input[type="password" i]'),
                insecure: /^http:/i.test(action) || location.protocol === 'http:'
            });
        }

        var links = document.querySelectorAll('a[href]');
        for (i = 0; i < links.length && out.lookalikes.length < 40; i++) {
            n = links[i];
            var lh = hostOf(n.getAttribute('href'));
            if (!lh) continue;
            if (n.target === '_blank' && !/noopener|noreferrer/i.test(n.rel || '')) out.unsafeBlank++;
            /* Text that names a domain the link does not go to, the oldest
               trick there is, and still the most common one. */
            var label = txt(n);
            var claimed = /(?:^|\s|\/\/)([a-z0-9-]+(?:\.[a-z0-9-]+)+)/i.exec(label);
            if (claimed && registrable(claimed[1].toLowerCase()) !== registrable(lh)) {
                out.lookalikes.push({ text: label.slice(0, 60), href: lh });
            }
        }

        var imgs = document.querySelectorAll('img');
        for (i = 0; i < imgs.length; i++) {
            var w = imgs[i].naturalWidth, hgt = imgs[i].naturalHeight;
            if (w && hgt && w <= 2 && hgt <= 2) out.pixels++;
        }
        out.hiddenInputs = document.querySelectorAll('input[type="hidden" i]').length;
        return out;
    }

    function readStorage() {
        var out = { cookies: [], cookieBytes: 0, local: [], localBytes: 0, session: [], sessionBytes: 0, idb: [] };
        try {
            (document.cookie ? document.cookie.split(';') : []).forEach(function (c) {
                var name = c.split('=')[0].trim();
                if (name) { out.cookies.push(name); out.cookieBytes += c.length; }
            });
        } catch (e) { out.cookies = null; }
        ['local', 'session'].forEach(function (which) {
            try {
                var store = which === 'local' ? localStorage : sessionStorage;
                for (var i = 0; i < store.length; i++) {
                    var k = store.key(i);
                    out[which].push(k);
                    out[which + 'Bytes'] += k.length + (store.getItem(k) || '').length;
                }
            } catch (e) { out[which] = null; }
        });
        if (window.indexedDB && indexedDB.databases) {
            try {
                indexedDB.databases().then(function (dbs) {
                    out.idb = (dbs || []).map(function (d) { return d.name; });
                    mark();
                }, function () { /* denied */ });
            } catch (e) { /* older browser */ }
        }
        return out;
    }

    /* ---------------- findings ---------------- */

    function findings() {
        var page = scanPage();
        var store = readStorage();
        var out = [];

        function add(level, title, detail) { out.push({ level: level, title: title, detail: detail }); }

        var thirdHosts = [], ipHosts = [], insecure = [];
        Object.keys(hosts).forEach(function (h) {
            var r = hosts[h];
            if (r.third && h.charAt(0) !== '(') thirdHosts.push(h);
            if (r.ip) ipHosts.push(h);
            if (r.insecure) insecure.push(h);
        });

        if (ipHosts.length) {
            add('high', 'Requests straight to an IP address', ipHosts.join(', ') +
                '. No hostname means no certificate name to check and nothing for a domain block-list to catch.');
        }
        if (location.protocol === 'https:' && insecure.length) {
            add('high', 'Mixed content', insecure.length + ' host(s) contacted over plain http on an https page: ' + insecure.join(', '));
        }
        if (location.protocol === 'http:') {
            add('high', 'Page itself is not encrypted', 'Everything on this page, including anything typed into it, travels in the clear.');
        }
        page.forms.forEach(function (f) {
            if (f.password && f.insecure) add('high', 'Password field on an unencrypted form', 'Form posts to ' + f.host + ' over http.');
            else if (f.password && f.cross) add('high', 'Password form posts to another domain', 'Action host: ' + f.host);
            else if (f.cross) add('medium', 'Form posts to another domain', 'Action host: ' + f.host + ' (' + f.method.toUpperCase() + ')');
            if (f.password && f.method === 'get') add('high', 'Password submitted by GET', 'Credentials would end up in the URL, history and logs.');
        });
        if (page.lookalikes.length) {
            add('high', 'Link text does not match its destination', page.lookalikes.slice(0, 5).map(function (l) {
                return '"' + l.text + '" → ' + l.href;
            }).join(' · '));
        }
        if (apiHits['WebRTC address']) {
            add('medium', 'WebRTC exposed a network address', 'A peer connection produced ICE candidates; these carry local and public IP addresses.');
        }
        if (apiHits['new Function()']) {
            add('medium', 'Code built at runtime', 'new Function() called ' + apiHits['new Function()'] + '×. Common in bundlers and in obfuscated loaders alike.');
        }
        if (apiHits['document.write'] || apiHits['document.writeln']) {
            add('medium', 'document.write in use', 'Legacy injection point, and a favourite of tag-manager style loaders.');
        }
        if (apiHits['setTimeout(string)'] || apiHits['setInterval(string)']) {
            add('high', 'Timer given code as a string', 'setTimeout/setInterval with a string argument is eval by another name.');
        }
        var thirdScripts = page.scripts.filter(function (s) { return s.third; });
        if (thirdScripts.length) {
            var byHost = {};
            thirdScripts.forEach(function (s) { byHost[s.host] = (byHost[s.host] || 0) + 1; });
            add('medium', 'Third-party script hosts', Object.keys(byHost).map(function (h) {
                return h + ' ×' + byHost[h];
            }).join(', ') + '. Each one can do anything this page can.');
        }
        var openFrames = page.frames.filter(function (f) { return f.third && !f.sandbox; });
        if (openFrames.length) {
            add('medium', 'Cross-origin frame without sandbox', openFrames.map(function (f) { return f.host; }).join(', '));
        }
        if (page.unsafeBlank) {
            add('low', 'target="_blank" without rel="noopener"', page.unsafeBlank + ' link(s) hand the opener window to the destination.');
        }
        if (page.pixels) add('low', 'Tracking pixels', page.pixels + ' image(s) of 1 to 2 px.');
        if (page.inlineScripts) {
            add('low', 'Inline script', page.inlineScripts + ' block(s), ' + Math.round(page.inlineBytes / 1024) + ' kB: not covered by a script-src allow-list unless nonced.');
        }
        if (!document.querySelector('meta[http-equiv="Content-Security-Policy" i]')) {
            add('low', 'No CSP meta tag', 'A header may still set one: headers are not readable from here.');
        }
        if (store.cookies && store.cookies.length) {
            add('info', 'Cookies readable by script', store.cookies.length + ' cookie(s), ' + store.cookieBytes +
                ' bytes: ' + store.cookies.slice(0, 12).join(', ') + '. HttpOnly cookies are deliberately not in this list.');
        }
        if (store.local && store.local.length) {
            add('info', 'localStorage', store.local.length + ' key(s), ' + Math.round(store.localBytes / 1024) + ' kB: survives the tab closing.');
        }
        if (!IS_TOP) add('info', 'Running inside a frame', 'This report covers this frame only.');
        var crossFrames = page.frames.filter(function (f) { return f.third; }).length;
        if (crossFrames && IS_TOP) {
            add('info', 'Cross-origin frames present', crossFrames + ' frame(s) run in their own world; their traffic is not visible from this document.');
        }
        return { list: out, page: page, store: store };
    }

    /* ---------------- report ---------------- */

    function hostRows() {
        return Object.keys(hosts).map(function (h) { return hosts[h]; }).sort(function (a, b) {
            if (a.third !== b.third) return a.third ? -1 : 1;
            return b.count - a.count;
        });
    }

    function kindList(rec) {
        return Object.keys(rec.kinds).map(function (k) { return k + '×' + rec.kinds[k]; }).join(' ');
    }

    function report() {
        var f = findings();
        var lines = [];
        lines.push('# Truesight report');
        lines.push('');
        lines.push('- Page: ' + location.href);
        lines.push('- Captured: ' + new Date().toISOString() + ' (this device\u2019s clock)');
        lines.push('- Secure context: ' + (window.isSecureContext ? 'yes' : 'no') + ' · protocol ' + location.protocol);
        lines.push('- Referrer: ' + (document.referrer || '(none)'));
        lines.push('- Truesight ' + VERSION + ', observed for ' + Math.round(now() / 1000) + ' s');
        lines.push('');
        lines.push('## Hosts');
        lines.push('');
        lines.push('| host | party | requests | kinds | kB |');
        lines.push('| --- | --- | --- | --- | --- |');
        hostRows().forEach(function (r) {
            lines.push('| ' + r.host + (r.ip ? ' (IP)' : '') + ' | ' + (r.third ? 'third' : 'first') +
                ' | ' + r.count + ' | ' + kindList(r) + ' | ' + (r.bytes ? Math.round(r.bytes / 1024) : '') + ' |');
        });
        lines.push('');
        lines.push('## Findings');
        lines.push('');
        if (!f.list.length) lines.push('- Nothing flagged.');
        f.list.forEach(function (x) { lines.push('- **[' + x.level + ']** ' + x.title + ', ' + x.detail); });
        lines.push('');
        lines.push('## Browser APIs used');
        lines.push('');
        var keys = Object.keys(apiHits);
        if (!keys.length) lines.push('- None of the watched APIs were called.');
        keys.forEach(function (k) { lines.push('- ' + k + ' ×' + apiHits[k]); });
        lines.push('');
        lines.push('## Timeline');
        lines.push('');
        events.slice(-120).forEach(function (e) {
            lines.push('- `' + (e.t / 1000).toFixed(2) + 's` [' + e.kind + '] ' + e.text);
        });
        lines.push('');
        lines.push('_Collected in the browser by Truesight. Nothing was sent anywhere._');
        return lines.join('\n');
    }

    function iocs() {
        var out = [];
        hostRows().forEach(function (r) {
            if (r.host.charAt(0) === '(') return;
            out.push(r.host);
        });
        return out.join('\n');
    }

    function copy(text, button, okLabel) {
        var done = function (ok) {
            var old = button.textContent;
            button.textContent = ok ? (okLabel || 'Copied ✓') : 'Copy failed';
            setTimeout(function () { button.textContent = old; }, 1500);
        };
        try {
            navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
        } catch (e) { done(false); }
    }

    /* ---------------- x-ray overlays ---------------- */

    var XRAY = {
        frames: 'iframe,frame{outline:3px solid #f59e0b!important;outline-offset:-3px!important}',
        hidden: '[hidden],[style*="display:none" i],[style*="visibility:hidden" i],[aria-hidden="true"]{' +
            'display:revert!important;visibility:visible!important;opacity:1!important;' +
            'outline:2px dashed #ef4444!important;min-height:4px!important}',
        pixels: 'img{outline:1px solid rgba(34,211,238,.5)!important}' +
            'img[width="1"],img[height="1"]{outline:3px solid #ef4444!important;min-width:12px!important;min-height:12px!important}'
    };

    function setXray(name, on) {
        var id = 'rpg-ts-xray-' + name;
        var node = document.getElementById(id);
        if (!on) { if (node) node.parentNode.removeChild(node); return; }
        if (!node) {
            node = document.createElement('style');
            node.id = id;
            (document.head || document.documentElement).appendChild(node);
        }
        node.textContent = XRAY[name];
    }

    /* ---------------- panel ---------------- */

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
        '#rpg-ts,#rpg-ts *{box-sizing:border-box;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}',
        '#rpg-ts{position:fixed!important;right:12px!important;bottom:12px!important;z-index:2147483600!important;',
        'width:min(560px,calc(100vw - 24px));',
        'max-height:min(70vh,720px);display:flex;flex-direction:column;color:#e6ecf7;',
        'background:#0b1020!important;border:1px solid #22d3ee;border-radius:12px;font-size:12px;line-height:1.45;',
        'box-shadow:0 18px 50px rgba(0,0,0,.6)}',
        '#rpg-ts[hidden]{display:none!important}',
        '#rpg-ts header{display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid #1e293b}',
        '#rpg-ts header b{color:#22d3ee;font-size:13px}',
        '#rpg-ts .sp{margin-left:auto}',
        '#rpg-ts button{background:#132038;color:#e6ecf7;border:1px solid #24405f;border-radius:7px;',
        'padding:4px 8px;font:inherit;cursor:pointer}',
        '#rpg-ts button:hover{border-color:#22d3ee}',
        '#rpg-ts button[aria-pressed="true"]{background:#22d3ee;color:#04121f;border-color:#22d3ee}',
        '#rpg-ts nav{display:flex;gap:4px;padding:6px 8px;border-bottom:1px solid #1e293b;flex-wrap:wrap}',
        '#rpg-ts .tools{display:flex;gap:6px;padding:6px 8px;border-bottom:1px solid #1e293b;align-items:center;flex-wrap:wrap}',
        '#rpg-ts input[type=search]{flex:1;min-width:90px;background:#08101e;border:1px solid #24405f;',
        'border-radius:7px;color:#e6ecf7;padding:4px 7px;font:inherit}',
        '#rpg-ts label{display:inline-flex;align-items:center;gap:4px;color:#9fb3cd;white-space:nowrap}',
        '#rpg-ts .body{overflow:auto;padding:8px 10px}',
        '#rpg-ts table{width:100%;border-collapse:collapse}',
        '#rpg-ts th{text-align:left;color:#7f9ec0;font-weight:600;border-bottom:1px solid #1e293b;padding:3px 4px}',
        '#rpg-ts td{padding:3px 4px;border-bottom:1px solid #131f33;vertical-align:top;word-break:break-all}',
        '#rpg-ts .third{color:#fbbf24}',
        '#rpg-ts .ip{color:#f87171;font-weight:700}',
        '#rpg-ts .num{text-align:right;color:#9fb3cd;white-space:nowrap}',
        '#rpg-ts .sample{color:#64748b;font-size:11px;margin-top:2px}',
        '#rpg-ts .f{border-left:3px solid #475569;padding:5px 8px;margin:0 0 6px;background:#0e1729;border-radius:0 7px 7px 0}',
        '#rpg-ts .f.high{border-left-color:#ef4444}',
        '#rpg-ts .f.medium{border-left-color:#f59e0b}',
        '#rpg-ts .f.low{border-left-color:#38bdf8}',
        '#rpg-ts .f.info{border-left-color:#475569}',
        '#rpg-ts .f b{display:block;color:#f1f5f9}',
        '#rpg-ts .f span{color:#9fb3cd}',
        '#rpg-ts .ev{display:grid;grid-template-columns:52px 76px minmax(0,1fr);gap:6px;padding:2px 0;',
        'border-bottom:1px solid #131f33}',
        '#rpg-ts .ev .t{color:#64748b;text-align:right}',
        '#rpg-ts .ev .k{color:#22d3ee}',
        '#rpg-ts .ev.warn .k{color:#fbbf24}',
        '#rpg-ts .empty{color:#64748b;padding:14px 2px}',
        '#rpg-ts footer{padding:6px 10px;border-top:1px solid #1e293b;color:#64748b;display:flex;gap:8px;align-items:center}',
        '#rpg-ts-pill{position:fixed!important;right:12px!important;bottom:12px!important;z-index:2147483599!important;',
        'background:#0b1020;color:#22d3ee;',
        'border:1px solid #22d3ee;border-radius:999px;padding:7px 12px;cursor:pointer;',
        'font:600 12px/1 ui-monospace,Menlo,Consolas,monospace;box-shadow:0 8px 22px rgba(0,0,0,.5)}',
        '#rpg-ts-pill[hidden]{display:none!important}'
    ].join('');

    var TABS = [
        ['findings', 'Findings'],
        ['hosts', 'Hosts'],
        ['timeline', 'Timeline'],
        ['page', 'Page'],
        ['storage', 'Storage']
    ];

    var tab = 'findings';

    function mark() {
        if (!panel || panel.hidden) return;
        dirty = true;
    }

    function pill(count) {
        return el('span', { 'class': 'num', text: String(count) });
    }

    function renderHosts(body, filter, thirdOnly) {
        var rows = hostRows().filter(function (r) {
            if (thirdOnly && !r.third) return false;
            return !filter || r.host.indexOf(filter) !== -1;
        });
        if (!rows.length) { body.appendChild(el('p', { 'class': 'empty', text: 'No requests captured yet.' })); return; }
        var table = el('table');
        table.appendChild(el('tr', null, [
            el('th', { text: 'host' }), el('th', { text: 'kinds' }),
            el('th', { 'class': 'num', text: 'n' }), el('th', { 'class': 'num', text: 'kB' })
        ]));
        rows.forEach(function (r) {
            var name = el('td');
            var b = el('b', { text: r.host });
            if (r.ip) b.className = 'ip'; else if (r.third) b.className = 'third';
            name.appendChild(b);
            if (r.insecure) name.appendChild(el('span', { 'class': 'ip', text: ' http' }));
            if (r.samples.length) {
                name.appendChild(el('div', { 'class': 'sample', text: r.samples.slice(0, 2).join('  ') }));
            }
            table.appendChild(el('tr', null, [
                name,
                el('td', { text: kindList(r) }),
                el('td', { 'class': 'num', text: String(r.count) }),
                el('td', { 'class': 'num', text: r.bytes ? String(Math.round(r.bytes / 1024)) : '·' })
            ]));
        });
        body.appendChild(table);
    }

    function renderFindings(body) {
        var f = findings().list;
        if (!f.length) { body.appendChild(el('p', { 'class': 'empty', text: 'Nothing flagged so far.' })); return; }
        var order = { high: 0, medium: 1, low: 2, info: 3 };
        f.sort(function (a, b) { return order[a.level] - order[b.level]; });
        f.forEach(function (x) {
            body.appendChild(el('div', { 'class': 'f ' + x.level }, [
                el('b', { text: x.title }),
                el('span', { text: x.detail })
            ]));
        });
    }

    function renderTimeline(body, filter) {
        var rows = events.filter(function (e) {
            return !filter || (e.text + e.kind).indexOf(filter) !== -1;
        }).slice(-250).reverse();
        if (!rows.length) { body.appendChild(el('p', { 'class': 'empty', text: 'Nothing logged yet.' })); return; }
        rows.forEach(function (e) {
            body.appendChild(el('div', { 'class': 'ev ' + e.level }, [
                el('span', { 'class': 't', text: (e.t / 1000).toFixed(1) + 's' }),
                el('span', { 'class': 'k', text: e.kind }),
                el('span', { text: e.text })
            ]));
        });
    }

    function line(label, value) {
        return el('div', { 'class': 'f info' }, [el('b', { text: label }), el('span', { text: value })]);
    }

    function renderPage(body) {
        var p = scanPage();
        body.appendChild(line('URL', location.href));
        body.appendChild(line('Secure context', (window.isSecureContext ? 'yes' : 'no') + ' · ' + location.protocol +
            ' · referrer policy: ' + (document.referrerPolicy || 'default')));
        body.appendChild(line('Referrer', document.referrer || '(none)'));
        body.appendChild(line('Scripts', p.scripts.length + ' external (' +
            p.scripts.filter(function (s) { return s.third; }).length + ' third-party), ' +
            p.inlineScripts + ' inline / ' + Math.round(p.inlineBytes / 1024) + ' kB'));
        body.appendChild(line('Frames', p.frames.length ? p.frames.map(function (f) {
            return f.host + (f.sandbox === null ? '' : ' [sandbox]');
        }).join(', ') : 'none'));
        body.appendChild(line('Forms', p.forms.length ? p.forms.map(function (f) {
            return f.method.toUpperCase() + ' → ' + f.host + (f.password ? ' (password)' : '');
        }).join(' · ') : 'none'));
        body.appendChild(line('Hidden inputs', String(p.hiddenInputs)));
        body.appendChild(line('APIs used', Object.keys(apiHits).length
            ? Object.keys(apiHits).map(function (k) { return k + '×' + apiHits[k]; }).join(', ')
            : 'none of the watched ones'));
    }

    function renderStorage(body) {
        var s = readStorage();
        body.appendChild(line('Cookies (script-readable)', s.cookies === null ? 'blocked'
            : s.cookies.length + ', ' + (s.cookies.join(', ') || 'none') + '  ·  HttpOnly cookies cannot be listed from JavaScript.'));
        body.appendChild(line('localStorage', s.local === null ? 'blocked'
            : s.local.length + ' key(s), ' + Math.round(s.localBytes / 1024) + ' kB: ' + (s.local.slice(0, 25).join(', ') || 'none')));
        body.appendChild(line('sessionStorage', s.session === null ? 'blocked'
            : s.session.length + ' key(s), ' + Math.round(s.sessionBytes / 1024) + ' kB: ' + (s.session.slice(0, 25).join(', ') || 'none')));
        body.appendChild(line('IndexedDB', s.idb.length ? s.idb.join(', ') : '(none reported)'));
        body.appendChild(line('Service workers', navigator.serviceWorker ? 'API present: check the Application panel for registrations' : 'unsupported'));
    }

    function draw() {
        if (!refs) return;
        dirty = false;
        var body = refs.body;
        body.textContent = '';
        var filter = refs.filter.value.trim().toLowerCase();
        if (tab === 'hosts') renderHosts(body, filter, refs.thirdOnly.checked);
        else if (tab === 'findings') renderFindings(body);
        else if (tab === 'timeline') renderTimeline(body, filter);
        else if (tab === 'page') renderPage(body);
        else renderStorage(body);
        refs.count.textContent = Object.keys(hosts).length + ' hosts · ' + events.length + ' events' +
            (paused ? ' · paused' : '');
        refs.tabs.forEach(function (t) {
            t.button.setAttribute('aria-pressed', String(t.id === tab));
        });
    }

    function build() {
        var style = document.createElement('style');
        style.id = 'rpg-ts-css';
        style.textContent = PANEL_CSS;
        (document.head || document.documentElement).appendChild(style);

        panel = el('div', { id: 'rpg-ts', role: 'dialog', 'aria-label': 'Truesight page inspector' });

        var head = el('header', null, [
            el('b', { text: '👁 Truesight' }),
            el('span', { 'class': 'sp' })
        ]);
        var pauseBtn = el('button', { type: 'button', text: 'Pause' });
        var clearBtn = el('button', { type: 'button', text: 'Clear' });
        var hideBtn = el('button', { type: 'button', 'aria-label': 'Hide panel', text: ', ' });
        head.appendChild(pauseBtn);
        head.appendChild(clearBtn);
        head.appendChild(hideBtn);

        var nav = el('nav');
        var tabs = TABS.map(function (t) {
            var b = el('button', { type: 'button', text: t[1] });
            b.addEventListener('click', function () { tab = t[0]; draw(); });
            nav.appendChild(b);
            return { id: t[0], button: b };
        });

        var tools = el('div', { 'class': 'tools' });
        var filter = el('input', { type: 'search', placeholder: 'filter…', 'aria-label': 'Filter' });
        var thirdWrap = el('label');
        var thirdOnly = el('input', { type: 'checkbox' });
        thirdWrap.appendChild(thirdOnly);
        thirdWrap.appendChild(el('span', { text: '3rd-party only' }));
        var copyBtn = el('button', { type: 'button', text: 'Copy report' });
        var iocBtn = el('button', { type: 'button', text: 'Copy hosts' });
        tools.appendChild(filter);
        tools.appendChild(thirdWrap);
        tools.appendChild(copyBtn);
        tools.appendChild(iocBtn);

        var xrayRow = el('div', { 'class': 'tools' });
        xrayRow.appendChild(el('label', { text: 'X-ray:' }));
        [['frames', 'frames'], ['hidden', 'hidden nodes'], ['pixels', 'pixels']].forEach(function (x) {
            var b = el('button', { type: 'button', 'aria-pressed': 'false', text: x[1] });
            b.addEventListener('click', function () {
                var on = b.getAttribute('aria-pressed') !== 'true';
                b.setAttribute('aria-pressed', String(on));
                setXray(x[0], on);
            });
            xrayRow.appendChild(b);
        });
        var holdBtn = el('button', { type: 'button', 'aria-pressed': 'false', text: 'hold page' });
        holdBtn.title = 'Blocks window.open and strips meta refresh so a redirect chain can be read.';
        holdBtn.addEventListener('click', function () {
            var on = holdBtn.getAttribute('aria-pressed') !== 'true';
            holdBtn.setAttribute('aria-pressed', String(on));
            setHold(on);
            draw();
        });
        xrayRow.appendChild(holdBtn);

        var body = el('div', { 'class': 'body' });
        var count = el('span', { text: '' });
        var foot = el('footer', null, [count, el('span', { 'class': 'sp' }),
            el('span', { text: 'v' + VERSION + ' · nothing leaves this browser' })]);

        panel.appendChild(head);
        panel.appendChild(nav);
        panel.appendChild(tools);
        panel.appendChild(xrayRow);
        panel.appendChild(body);
        panel.appendChild(foot);

        var badge = el('button', { id: 'rpg-ts-pill', type: 'button', text: '👁 Truesight' });
        badge.hidden = onDemand;
        panel.hidden = !onDemand;
        badge.addEventListener('click', function () { panel.hidden = false; badge.hidden = true; draw(); });

        hideBtn.addEventListener('click', function () { panel.hidden = true; badge.hidden = false; });
        pauseBtn.addEventListener('click', function () {
            paused = !paused;
            pauseBtn.textContent = paused ? 'Resume' : 'Pause';
            draw();
        });
        clearBtn.addEventListener('click', function () {
            hosts = {}; events = []; apiHits = {}; startedAt = Date.now();
            draw();
        });
        copyBtn.addEventListener('click', function () { copy(report(), copyBtn, 'Report copied ✓'); });
        iocBtn.addEventListener('click', function () { copy(iocs(), iocBtn, 'Hosts copied ✓'); });
        filter.addEventListener('input', draw);
        thirdOnly.addEventListener('change', draw);

        refs = { body: body, filter: filter, thirdOnly: thirdOnly, count: count, tabs: tabs };

        var root = document.body || document.documentElement;
        root.appendChild(panel);
        root.appendChild(badge);
        draw();

        setInterval(function () { if (dirty && panel && !panel.hidden) draw(); }, 700);
        return { panel: panel, badge: badge };
    }

    /* ---------------- public handle ---------------- */

    var ui = null;

    var handle = {
        version: VERSION,
        toggle: function () {
            if (!ui) return;
            var showing = !ui.panel.hidden;
            ui.panel.hidden = showing;
            ui.badge.hidden = !showing;
            if (!showing) draw();
        },
        ingest: function (type, payload) {
            if (type === 'req') record(payload.url, payload.kind, payload.bytes);
            else if (type === 'api') api(payload.name, payload.detail);
        },
        report: report
    };

    try {
        Object.defineProperty(window, NS, { value: handle, enumerable: false, configurable: true });
    } catch (e) { window[NS] = handle; }

    function start() {
        if (IS_TOP) {
            ui = build();
            log('page', 'watching ' + location.href, 'info');
        } else {
            /* Child frames keep trying to hand their records upstairs: the top
               document may not have run its script yet when this one starts. */
            var tries = 0;
            var flush = setInterval(function () {
                upstream = findUpstream();
                if (upstream) {
                    outbox.splice(0).forEach(function (item) {
                        try { upstream.ingest(item[0], item[1], location.href); } catch (e) { /* gone */ }
                    });
                    clearInterval(flush);
                } else if (++tries > 20) {
                    clearInterval(flush);
                }
            }, 500);
        }

        document.addEventListener('keydown', function (e) {
            if (e.altKey && e.shiftKey && e.code === 'KeyI') {
                e.preventDefault();
                handle.toggle();
            }
        }, true);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();
