/* ==========================================================================
   Towerwatch — rogue cell tower spotter
   --------------------------------------------------------------------------
   Vanilla JS, no dependencies, no network calls except the *optional*
   OpenCelliD lookup the user explicitly asks for. All state lives in
   localStorage on this device.

   Two halves:
     1. LIVE WATCH  — what the browser is actually allowed to know about the
        mobile connection (Network Information API, online/offline events,
        geolocation). Sudden downgrades are logged as alerts.
     2. CELL LOG    — cell identities typed in or imported from a netmonitor
        app, scored by a set of heuristics that describe how an IMSI catcher
        differs from a real macro cell.
   ========================================================================== */
(function () {
    'use strict';

    var STORE_CELLS = 'towerwatch:cells';
    var STORE_KEY = 'towerwatch:ocid-key';

    var RADIO_RANK = { GSM: 1, UMTS: 2, LTE: 3, NR: 4 };
    var RISK_HIGH = 50;
    var RISK_MEDIUM = 20;

    var cells = [];
    var watching = false;
    var geoWatchId = null;
    var lastPosition = null;
    var lastEffectiveType = null;

    /* ------------------------------------------------------------- helpers */
    var $ = function (id) { return document.getElementById(id); };

    function conn() {
        return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
    }

    function num(value) {
        if (value === null || value === undefined || value === '') return null;
        var n = Number(String(value).trim());
        return Number.isFinite(n) ? n : null;
    }

    function clockTime(ts) {
        return new Date(ts).toLocaleTimeString();
    }

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    /** Great-circle distance in kilometres. */
    function distanceKm(a, b) {
        var R = 6371;
        var toRad = function (d) { return d * Math.PI / 180; };
        var dLat = toRad(b.lat - a.lat);
        var dLon = toRad(b.lon - a.lon);
        var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
    }

    function save() {
        try {
            localStorage.setItem(STORE_CELLS, JSON.stringify(cells));
        } catch (err) {
            /* storage full or blocked — the page still works for this session */
        }
    }

    function load() {
        try {
            var raw = localStorage.getItem(STORE_CELLS);
            var parsed = raw ? JSON.parse(raw) : [];
            if (Array.isArray(parsed)) cells = parsed.filter(isCell);
        } catch (err) {
            cells = [];
        }
    }

    function isCell(c) {
        return c && typeof c === 'object' &&
            num(c.mcc) !== null && num(c.mnc) !== null &&
            num(c.lac) !== null && num(c.cid) !== null;
    }

    /* ============================================================ live watch */
    function pushEvent(text, isAlert) {
        var list = $('timeline');
        var empty = list.querySelector('.empty');
        if (empty) empty.remove();

        var li = el('li', isAlert ? 'alert' : '');
        li.appendChild(el('span', 'time', clockTime(Date.now())));
        li.appendChild(el('span', 'text', text));
        list.prepend(li);

        while (list.children.length > 60) list.lastElementChild.remove();
    }

    function renderConnection(logChange) {
        var c = conn();
        if (!c) {
            $('statNet').textContent = 'unsupported';
            $('statDown').textContent = '—';
            $('statRtt').textContent = '—';
            return;
        }

        var effective = c.effectiveType || 'unknown';
        $('statNet').textContent = (c.type && c.type !== 'unknown' ? c.type + ' · ' : '') + effective;
        $('statDown').textContent = typeof c.downlink === 'number' ? c.downlink + ' Mb/s' : '—';
        $('statRtt').textContent = typeof c.rtt === 'number' ? c.rtt + ' ms' : '—';

        if (!logChange) { lastEffectiveType = effective; return; }
        if (effective === lastEffectiveType) return;

        var slow = effective === '2g' || effective === 'slow-2g';
        var wasFast = lastEffectiveType === '4g' || lastEffectiveType === '3g';
        pushEvent('Connection class ' + (lastEffectiveType || '?') + ' → ' + effective +
            (slow && wasFast ? ' — a downgrade like this is the classic IMSI-catcher tell.' : ''),
            slow && wasFast);
        lastEffectiveType = effective;
    }

    function onOnline() { pushEvent('Back online.', false); renderConnection(true); }
    function onOffline() { pushEvent('Connection lost — a forced re-registration looks exactly like this.', true); }

    function onPosition(pos) {
        lastPosition = { lat: pos.coords.latitude, lon: pos.coords.longitude, acc: pos.coords.accuracy };
        $('statPos').textContent = lastPosition.lat.toFixed(4) + ', ' + lastPosition.lon.toFixed(4);
    }

    function onPositionError() {
        $('statPos').textContent = 'denied';
    }

    function startWatch() {
        watching = true;
        $('watchBtn').textContent = 'Stop watching';
        $('watchBtn').setAttribute('aria-pressed', 'true');

        var c = conn();
        renderConnection(false);
        if (c && c.addEventListener) c.addEventListener('change', onConnectionChange);
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);

        if (navigator.geolocation) {
            geoWatchId = navigator.geolocation.watchPosition(onPosition, onPositionError, {
                enableHighAccuracy: false,
                maximumAge: 30000,
                timeout: 20000,
            });
        }

        setStatus($('liveStatus'), c
            ? 'Watching. Keep this tab open and walk around — every change to the mobile connection is logged below.'
            : 'Watching, but this browser has no Network Information API (Safari and Firefox do not). Online/offline events and position still work; log cells manually below.',
            c ? 'good' : '');
        pushEvent('Watch started.', false);
    }

    function onConnectionChange() { renderConnection(true); }

    function stopWatch() {
        watching = false;
        $('watchBtn').textContent = 'Start watching';
        $('watchBtn').setAttribute('aria-pressed', 'false');

        var c = conn();
        if (c && c.removeEventListener) c.removeEventListener('change', onConnectionChange);
        window.removeEventListener('online', onOnline);
        window.removeEventListener('offline', onOffline);
        if (geoWatchId !== null && navigator.geolocation) {
            navigator.geolocation.clearWatch(geoWatchId);
            geoWatchId = null;
        }
        setStatus($('liveStatus'), 'Stopped. The timeline is kept until you reload.', '');
        pushEvent('Watch stopped.', false);
    }

    function setStatus(node, text, kind) {
        node.textContent = text;
        node.className = 'notice' + (kind ? ' ' + kind : '');
        node.hidden = false;
    }

    /* ============================================================ heuristics */
    /**
     * Score one cell against the rest of the log.
     * Every flag carries a weight; the total is capped at 100.
     * Weights are deliberately conservative — nothing here is proof, all of it
     * is "worth a second look".
     */
    function analyse(cell, all) {
        var flags = [];
        var siblings = all.filter(function (c) {
            return c !== cell && num(c.mcc) === num(cell.mcc) && num(c.mnc) === num(cell.mnc);
        });

        var radio = (cell.radio || 'LTE').toUpperCase();
        var cid = num(cell.cid);
        var lac = num(cell.lac);
        var signal = num(cell.signal);

        /* 1 — 2G is where catchers live: no mutual authentication, no encryption. */
        if (radio === 'GSM') {
            flags.push(flag(30, 'Serving cell is 2G (GSM)',
                'GSM has no mutual authentication and can be forced to drop encryption. Most catchers push you here.'));
        } else if (radio === 'UMTS') {
            flags.push(flag(8, 'Serving cell is 3G (UMTS)',
                'Being pushed off 4G/5G is worth noticing, though 3G fallback is often just poor coverage.'));
        }

        /* 2 — a downgrade relative to what this operator normally gives you. */
        var bestSibling = siblings.reduce(function (best, c) {
            var r = RADIO_RANK[(c.radio || '').toUpperCase()] || 0;
            return r > best ? r : best;
        }, 0);
        if (bestSibling && (RADIO_RANK[radio] || 0) < bestSibling - 1) {
            flags.push(flag(15, 'Downgrade from this operator\'s usual radio',
                'Elsewhere in your log this operator serves a newer radio. A sudden step down is a catcher signature.'));
        }

        /* 3 — a mast you could touch. Real macro cells rarely exceed ~-50 dBm. */
        if (signal !== null && signal > -50) {
            flags.push(flag(25, 'Implausibly strong signal (' + signal + ' dBm)',
                'Catchers shout to win the cell-selection race. Only a metres-away antenna is legitimately this loud.'));
        }

        /* 4 — reserved or nonsense identifiers. */
        if (lac === 0 || lac === 65534 || lac === 65535) {
            flags.push(flag(20, 'Reserved area code (' + lac + ')',
                'LAC/TAC 0, 65534 and 65535 are reserved values that a production network should not broadcast.'));
        }
        if (cid !== null && (cid === 0 || cid > 268435455)) {
            flags.push(flag(15, 'Cell ID outside the usable range',
                'Improvised base stations often ship with a placeholder or out-of-spec cell identity.'));
        }

        /* 5 — a lone area code among many cells of the same operator. */
        if (siblings.length >= 2) {
            var sharesLac = siblings.some(function (c) { return num(c.lac) === lac; });
            if (!sharesLac) {
                flags.push(flag(20, 'Area code used by no other cell of this operator',
                    'Neighbouring cells normally share a LAC/TAC. A unique one forces your phone to re-register — exactly what a catcher wants.'));
            }
        }

        /* 6 — the same cell ID claiming a different area code. */
        var identitySwap = all.some(function (c) {
            return c !== cell && num(c.cid) === cid && num(c.mcc) === num(cell.mcc) &&
                num(c.mnc) === num(cell.mnc) && num(c.lac) !== lac;
        });
        if (identitySwap) {
            flags.push(flag(25, 'Same cell ID seen under a different area code',
                'A fixed cell keeps its identity. Changing LAC/TAC under the same CID suggests something is impersonating it.'));
        }

        /* 7 — the same identity observed impossibly far away. */
        if (num(cell.lat) !== null && num(cell.lon) !== null) {
            var here = { lat: num(cell.lat), lon: num(cell.lon) };
            var far = all.some(function (c) {
                if (c === cell || num(c.cid) !== cid || num(c.lac) !== lac) return false;
                if (num(c.lat) === null || num(c.lon) === null) return false;
                return distanceKm(here, { lat: num(c.lat), lon: num(c.lon) }) > 5;
            });
            if (far) {
                flags.push(flag(20, 'Identical cell seen more than 5 km away',
                    'One cell cannot cover both spots. Either the identity is cloned, or the base station is mobile.'));
            }
        }

        /* 8 — operator mismatch against the rest of the log. */
        var majority = majorityOperator(all);
        if (majority && (num(cell.mcc) !== majority.mcc || num(cell.mnc) !== majority.mnc) && all.length >= 3) {
            flags.push(flag(10, 'Different operator than most of your log',
                'Could be roaming or a genuine neighbour — but a catcher often advertises an unexpected MCC/MNC.'));
        }

        /* 9 — optional OpenCelliD verdict. */
        if (cell.ocid === 'unknown') {
            flags.push(flag(35, 'Not found in OpenCelliD',
                'No public survey has ever recorded this cell. Real macro cells are mapped many times over.'));
        } else if (cell.ocid === 'known') {
            flags.push(flag(0, 'Known to OpenCelliD', 'This cell exists in the public database — reassuring.', true));
        }

        var score = Math.min(100, flags.reduce(function (sum, f) { return sum + f.weight; }, 0));
        return { score: score, flags: flags, level: score >= RISK_HIGH ? 'high' : score >= RISK_MEDIUM ? 'medium' : 'low' };
    }

    function flag(weight, title, why, good) {
        return { weight: weight, title: title, why: why, good: !!good };
    }

    function majorityOperator(all) {
        var counts = {};
        var best = null;
        all.forEach(function (c) {
            var key = num(c.mcc) + '-' + num(c.mnc);
            counts[key] = (counts[key] || 0) + 1;
            if (!best || counts[key] > counts[best]) best = key;
        });
        if (!best) return null;
        var parts = best.split('-');
        return { mcc: Number(parts[0]), mnc: Number(parts[1]) };
    }

    /* ================================================================ render */
    function render() {
        var list = $('cellList');
        list.textContent = '';

        var results = cells.map(function (c) { return { cell: c, verdict: analyse(c, cells) }; });
        renderSummary(results);

        results
            .slice()
            .sort(function (a, b) { return b.verdict.score - a.verdict.score; })
            .forEach(function (row) { list.appendChild(renderCard(row.cell, row.verdict)); });
    }

    function renderSummary(results) {
        var box = $('summary');
        box.textContent = '';

        if (!results.length) {
            var p = el('p', 'empty');
            p.appendChild(document.createTextNode('No cells logged yet — add one above, or press '));
            p.appendChild(el('strong', '', 'Load demo data'));
            p.appendChild(document.createTextNode(' to see how a caught IMSI catcher looks.'));
            box.appendChild(p);
            return;
        }

        var high = results.filter(function (r) { return r.verdict.level === 'high'; }).length;
        var medium = results.filter(function (r) { return r.verdict.level === 'medium'; }).length;
        var low = results.length - high - medium;

        var head = el('div', 'summary-head');
        head.appendChild(el('span', 'risk-badge risk-' + (high ? 'high' : medium ? 'medium' : 'low'),
            high ? 'Suspicious' : medium ? 'Worth a look' : 'Nothing odd'));
        head.appendChild(el('span', '', high
            ? high + ' cell' + (high === 1 ? ' shows' : 's show') + ' the fingerprints of a rogue base station.'
            : medium
                ? 'Nothing damning, but ' + medium + ' cell' + (medium === 1 ? ' deserves' : 's deserve') + ' a second measurement.'
                : 'Every logged cell looks like an ordinary macro cell.'));
        box.appendChild(head);

        var counts = el('div', 'summary-counts');
        counts.appendChild(el('span', '', results.length + ' logged'));
        counts.appendChild(el('span', '', high + ' high risk'));
        counts.appendChild(el('span', '', medium + ' medium'));
        counts.appendChild(el('span', '', low + ' low'));
        box.appendChild(counts);
    }

    function renderCard(cell, verdict) {
        var node = $('cellCardTpl').content.firstElementChild.cloneNode(true);

        var badge = node.querySelector('.risk-badge');
        badge.classList.add('risk-' + verdict.level);
        badge.textContent = verdict.level === 'high' ? 'High' : verdict.level === 'medium' ? 'Medium' : 'Low';

        node.querySelector('.cell-title').textContent =
            (cell.radio || 'LTE') + ' · ' + num(cell.mcc) + '-' + num(cell.mnc) +
            ' · LAC ' + num(cell.lac) + ' · CID ' + num(cell.cid);

        var meta = ['risk score ' + verdict.score + '/100'];
        if (num(cell.signal) !== null) meta.push(num(cell.signal) + ' dBm');
        if (num(cell.lat) !== null && num(cell.lon) !== null) {
            meta.push(num(cell.lat).toFixed(4) + ', ' + num(cell.lon).toFixed(4));
        }
        if (cell.seen) meta.push('logged ' + new Date(cell.seen).toLocaleString());
        node.querySelector('.cell-meta').textContent = meta.join(' · ');

        node.querySelector('.score-fill').style.width = Math.max(3, verdict.score) + '%';

        var flags = node.querySelector('.flags');
        if (!verdict.flags.length) {
            flags.appendChild(el('li', '', '✅ Nothing unusual about this cell.'));
        } else {
            verdict.flags.forEach(function (f) {
                var li = el('li');
                li.appendChild(el('span', 'flag-mark', f.good ? '✅' : f.weight >= 25 ? '🚩' : '⚠️'));
                var body = el('span');
                body.appendChild(el('strong', '', f.title));
                body.appendChild(el('span', 'flag-why', f.why));
                li.appendChild(body);
                flags.appendChild(li);
            });
        }

        node.querySelector('.cell-remove').addEventListener('click', function () {
            var index = cells.indexOf(cell);
            if (index > -1) {
                cells.splice(index, 1);
                save();
                render();
            }
        });

        return node;
    }

    /* ================================================================ inputs */
    function addCell(cell) {
        cells.push(cell);
        save();
        render();
    }

    function readForm() {
        var form = $('cellForm');
        var get = function (name) { return form.elements[name].value.trim(); };
        return {
            mcc: num(get('mcc')),
            mnc: num(get('mnc')),
            lac: num(get('lac')),
            cid: num(get('cid')),
            radio: get('radio') || 'LTE',
            signal: num(get('signal')),
            lat: num(get('lat')),
            lon: num(get('lon')),
            seen: Date.now(),
        };
    }

    function showFormError(message) {
        var box = $('formError');
        box.textContent = message || '';
        box.hidden = !message;
    }

    /* ------------------------------------------------------------- importing */
    var FIELD_ALIASES = {
        mcc: ['mcc', 'countrycode', 'country'],
        mnc: ['mnc', 'networkcode', 'network', 'operator'],
        lac: ['lac', 'tac', 'area', 'areacode', 'lactac'],
        cid: ['cid', 'cellid', 'ci', 'eci', 'nci', 'cell'],
        radio: ['radio', 'rat', 'type', 'nettype', 'technology'],
        signal: ['signal', 'dbm', 'rssi', 'rsrp', 'strength', 'averagesignalstrength'],
        lat: ['lat', 'latitude'],
        lon: ['lon', 'lng', 'long', 'longitude'],
    };

    function normaliseKey(key) {
        return String(key).toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    function mapRecord(record) {
        var out = {};
        var normalised = {};
        Object.keys(record).forEach(function (k) { normalised[normaliseKey(k)] = record[k]; });

        Object.keys(FIELD_ALIASES).forEach(function (field) {
            FIELD_ALIASES[field].some(function (alias) {
                if (normalised[alias] !== undefined && normalised[alias] !== '') {
                    out[field] = normalised[alias];
                    return true;
                }
                return false;
            });
        });

        var cell = {
            mcc: num(out.mcc),
            mnc: num(out.mnc),
            lac: num(out.lac),
            cid: num(out.cid),
            radio: normaliseRadio(out.radio),
            signal: num(out.signal),
            lat: num(out.lat),
            lon: num(out.lon),
            seen: Date.now(),
        };
        return isCell(cell) ? cell : null;
    }

    function normaliseRadio(value) {
        var v = String(value || '').toUpperCase();
        if (v.indexOf('NR') > -1 || v.indexOf('5G') > -1) return 'NR';
        if (v.indexOf('LTE') > -1 || v.indexOf('4G') > -1) return 'LTE';
        if (v.indexOf('UMTS') > -1 || v.indexOf('WCDMA') > -1 || v.indexOf('3G') > -1) return 'UMTS';
        if (v.indexOf('GSM') > -1 || v.indexOf('EDGE') > -1 || v.indexOf('2G') > -1) return 'GSM';
        return 'LTE';
    }

    function parseCsv(text) {
        var lines = text.split(/\r?\n/).filter(function (l) { return l.trim() !== ''; });
        if (lines.length < 2) return [];
        var delimiter = (lines[0].split(';').length > lines[0].split(',').length) ? ';' : ',';
        var header = lines[0].split(delimiter).map(function (h) { return h.trim().replace(/^"|"$/g, ''); });

        return lines.slice(1).map(function (line) {
            var values = line.split(delimiter);
            var record = {};
            header.forEach(function (key, i) {
                record[key] = (values[i] || '').trim().replace(/^"|"$/g, '');
            });
            return record;
        });
    }

    function importText(text, filename) {
        var records = [];
        var trimmed = text.trim();

        if (trimmed.charAt(0) === '[' || trimmed.charAt(0) === '{') {
            var parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) records = parsed;
            else if (Array.isArray(parsed.cells)) records = parsed.cells;
            else records = [parsed];
        } else {
            records = parseCsv(trimmed);
        }

        var added = records
            .map(function (r) { return (r && typeof r === 'object') ? mapRecord(r) : null; })
            .filter(Boolean);

        added.forEach(function (c) { cells.push(c); });
        save();
        render();

        showFormError(added.length
            ? ''
            : 'Nothing usable in ' + filename + ' — the file needs MCC, MNC, LAC/TAC and CID columns.');
        if (added.length) {
            pushEvent('Imported ' + added.length + ' cell' + (added.length === 1 ? '' : 's') + ' from ' + filename + '.', false);
        }
    }

    /* -------------------------------------------------------------- demo set */
    function demoCells() {
        var now = Date.now();
        return [
            { mcc: 206, mnc: 1, lac: 4501, cid: 12345678, radio: 'LTE', signal: -87, lat: 50.8503, lon: 4.3517, seen: now - 360000 },
            { mcc: 206, mnc: 1, lac: 4501, cid: 12345679, radio: 'LTE', signal: -93, lat: 50.8506, lon: 4.3520, seen: now - 300000 },
            { mcc: 206, mnc: 1, lac: 4501, cid: 12345680, radio: 'LTE', signal: -101, lat: 50.8499, lon: 4.3509, seen: now - 240000 },
            { mcc: 206, mnc: 1, lac: 65534, cid: 1, radio: 'GSM', signal: -41, lat: 50.8504, lon: 4.3515, seen: now - 120000 },
        ];
    }

    /* ---------------------------------------------------------- opencellid */
    function ocidLookup(cell, token) {
        var url = 'https://opencellid.org/cell/get?key=' + encodeURIComponent(token) +
            '&mcc=' + encodeURIComponent(num(cell.mcc)) +
            '&mnc=' + encodeURIComponent(num(cell.mnc)) +
            '&lac=' + encodeURIComponent(num(cell.lac)) +
            '&cellid=' + encodeURIComponent(num(cell.cid)) +
            '&radio=' + encodeURIComponent(cell.radio || 'LTE') +
            '&format=json';

        return fetch(url, { mode: 'cors', credentials: 'omit' })
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function (data) {
                if (data && data.error) return 'unknown';
                return (data && typeof data.lat === 'number') ? 'known' : 'unknown';
            });
    }

    function runOcidCheck() {
        var token = $('ocidKey').value.trim();
        var status = $('ocidStatus');

        if (!token) { setStatus(status, 'Paste your OpenCelliD API token first.', 'bad'); return; }
        if (!cells.length) { setStatus(status, 'Log at least one cell before checking.', 'bad'); return; }

        setStatus(status, 'Checking ' + cells.length + ' cell' + (cells.length === 1 ? '' : 's') + '…', '');
        $('ocidCheck').disabled = true;

        var failures = 0;
        var queue = cells.slice();

        Promise.all(queue.map(function (cell) {
            return ocidLookup(cell, token)
                .then(function (verdict) { cell.ocid = verdict; })
                .catch(function () { failures += 1; delete cell.ocid; });
        })).then(function () {
            $('ocidCheck').disabled = false;
            save();
            render();
            if (failures === queue.length) {
                setStatus(status, 'Every lookup failed — the browser most likely blocked the cross-origin request, or the token is wrong. All other heuristics still apply.', 'bad');
            } else if (failures) {
                setStatus(status, (queue.length - failures) + ' of ' + queue.length + ' cells checked; ' + failures + ' lookups failed.', '');
            } else {
                setStatus(status, 'All ' + queue.length + ' cells checked against OpenCelliD.', 'good');
            }
        });
    }

    /* ================================================================ export */
    function exportReport() {
        var report = {
            tool: 'Towerwatch',
            generated: new Date().toISOString(),
            userAgent: navigator.userAgent,
            cells: cells.map(function (c) {
                var verdict = analyse(c, cells);
                return {
                    mcc: num(c.mcc), mnc: num(c.mnc), lac: num(c.lac), cid: num(c.cid),
                    radio: c.radio || 'LTE',
                    signalDbm: num(c.signal),
                    lat: num(c.lat), lon: num(c.lon),
                    loggedAt: c.seen ? new Date(c.seen).toISOString() : null,
                    riskScore: verdict.score,
                    riskLevel: verdict.level,
                    findings: verdict.flags.map(function (f) { return f.title; }),
                };
            }),
        };

        var blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'towerwatch-report.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    /* ================================================================= wiring */
    function init() {
        load();
        render();
        renderConnection(false);

        try {
            var savedKey = localStorage.getItem(STORE_KEY);
            if (savedKey) $('ocidKey').value = savedKey;
        } catch (err) { /* storage blocked */ }

        $('watchBtn').addEventListener('click', function () {
            if (watching) stopWatch(); else startWatch();
        });

        $('cellForm').addEventListener('submit', function (e) {
            e.preventDefault();
            var cell = readForm();
            if (!isCell(cell)) {
                showFormError('MCC, MNC, LAC/TAC and Cell ID are all required and must be numbers.');
                return;
            }
            showFormError('');
            addCell(cell);
            ['f-cid', 'f-signal'].forEach(function (id) { $(id).value = ''; });
            $('f-cid').focus();
        });

        $('hereBtn').addEventListener('click', function () {
            if (!navigator.geolocation) {
                showFormError('This browser has no geolocation support — type the coordinates manually.');
                return;
            }
            if (lastPosition) {
                $('f-lat').value = lastPosition.lat.toFixed(6);
                $('f-lon').value = lastPosition.lon.toFixed(6);
                return;
            }
            navigator.geolocation.getCurrentPosition(function (pos) {
                onPosition(pos);
                $('f-lat').value = pos.coords.latitude.toFixed(6);
                $('f-lon').value = pos.coords.longitude.toFixed(6);
                showFormError('');
            }, function () {
                showFormError('Location permission denied — type the coordinates manually if you want them.');
            }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 });
        });

        $('demoBtn').addEventListener('click', function () {
            cells = demoCells();
            save();
            render();
            document.getElementById('verdict-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        $('importBtn').addEventListener('click', function () { $('importFile').click(); });

        $('importFile').addEventListener('change', function (e) {
            var file = e.target.files && e.target.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function () {
                try {
                    importText(String(reader.result), file.name);
                } catch (err) {
                    showFormError('Could not read ' + file.name + ' — expected CSV or JSON.');
                }
            };
            reader.onerror = function () { showFormError('Could not read ' + file.name + '.'); };
            reader.readAsText(file);
            e.target.value = '';
        });

        $('exportBtn').addEventListener('click', function () {
            if (!cells.length) { showFormError('Nothing to export yet.'); return; }
            showFormError('');
            exportReport();
        });

        $('clearBtn').addEventListener('click', function () {
            if (!cells.length) return;
            if (!window.confirm('Delete every logged cell from this browser?')) return;
            cells = [];
            save();
            render();
        });

        $('ocidSave').addEventListener('click', function () {
            var status = $('ocidStatus');
            try {
                var value = $('ocidKey').value.trim();
                if (value) localStorage.setItem(STORE_KEY, value);
                else localStorage.removeItem(STORE_KEY);
                setStatus(status, value ? 'Token stored in this browser only.' : 'Token removed.', 'good');
            } catch (err) {
                setStatus(status, 'This browser refused to store the token — it will work for this session only.', 'bad');
            }
        });

        $('ocidCheck').addEventListener('click', runOcidCheck);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
