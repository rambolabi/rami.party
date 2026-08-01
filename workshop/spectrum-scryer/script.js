/* ==========================================================================
   Spectrum Scryer — read a Wi-Fi scan, reveal every access point (hidden
   ones included), map the bands and hunt a signal down.

   Everything is local: parsing, charting and locating happen in the page.
   No network requests are made with any of your data.
   ========================================================================== */

(function () {
    'use strict';

    /* ---------------------------------------------------------------- utils */
    var $ = function (id) { return document.getElementById(id); };
    var clamp = function (v, lo, hi) { return Math.min(hi, Math.max(lo, v)); };

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    /* ------------------------------------------------------------- OS recipes */
    var RECIPES = {
        windows: {
            where: 'Open <strong>Command Prompt</strong> or PowerShell (no admin rights needed).',
            cmd: 'netsh wlan show networks mode=bssid',
            note: 'Windows lists only what it can hear right now, so give the adapter a few seconds after switching Wi-Fi on. Hidden networks appear with an empty SSID line.'
        },
        mac: {
            where: 'Open <strong>Terminal</strong>. On macOS Sonoma and newer, <code>airport</code> is gone — use the <code>wdutil</code> line instead.',
            cmd: '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s',
            note: 'Newer macOS: run <code>sudo wdutil info</code> for your own link, or install <code>wifiscanner</code>/<code>WiFi Explorer</code> and paste its export. macOS asks for Location permission before it will reveal network names.'
        },
        linux: {
            where: 'Open a <strong>terminal</strong>. Any of these work — nmcli is the friendliest.',
            cmd: 'nmcli -f SSID,BSSID,CHAN,FREQ,SIGNAL,SECURITY device wifi list --rescan yes',
            note: 'Also understood: <code>sudo iw dev wlan0 scan</code> and <code>sudo iwlist wlan0 scan</code>. A full scan usually needs root; without it you may only see cached results.'
        },
        phone: {
            where: '<strong>Android:</strong> install a Wi-Fi analyser app that can export or share a scan, then paste it here. <strong>iOS:</strong> Apple blocks Wi-Fi scanning entirely — use a laptop, or the AirPort Utility app with its Wi-Fi Scanner setting enabled and type in what you see.',
            cmd: 'Paste any list containing MAC addresses, channels and signal levels',
            note: 'The Scryer only needs the essentials: a name (or nothing, for hidden networks), a MAC address, a channel or frequency, and a signal level in dBm or percent.'
        }
    };

    /* ------------------------------------------------------------ OUI vendors */
    /* A small, hand-picked prefix table — enough to make hidden networks
       recognisable ("that nameless one is a FRITZ!Box"). */
    var OUI = {
        '00:1A:11': 'Google', '3C:5A:B4': 'Google', 'F4:F5:E8': 'Google',
        '00:17:88': 'Philips Hue', 'EC:B5:FA': 'Philips',
        '00:1D:7E': 'Cisco-Linksys', '00:25:9C': 'Cisco-Linksys', '68:7F:74': 'Cisco-Linksys',
        'B0:BE:76': 'TP-Link', '50:C7:BF': 'TP-Link', 'A4:2B:B0': 'TP-Link', 'AC:84:C6': 'TP-Link',
        '00:24:B2': 'Netgear', '20:4E:7F': 'Netgear', 'A0:40:A0': 'Netgear',
        '9C:C7:A6': 'AVM (FRITZ!Box)', '38:10:D5': 'AVM (FRITZ!Box)', 'C8:0E:14': 'AVM (FRITZ!Box)',
        'BC:30:7D': 'AVM (FRITZ!Box)', '5C:49:79': 'AVM (FRITZ!Box)',
        '00:0C:29': 'VMware', '00:50:56': 'VMware',
        '00:03:93': 'Apple', '00:1B:63': 'Apple', 'F0:18:98': 'Apple', 'A4:83:E7': 'Apple',
        'DC:A6:32': 'Raspberry Pi', 'B8:27:EB': 'Raspberry Pi', 'E4:5F:01': 'Raspberry Pi',
        '18:FE:34': 'Espressif (ESP)', '24:0A:C4': 'Espressif (ESP)', '8C:AA:B5': 'Espressif (ESP)',
        '00:1E:58': 'D-Link', '1C:7E:E5': 'D-Link', '78:32:1B': 'D-Link',
        '04:18:D6': 'Ubiquiti', '78:8A:20': 'Ubiquiti', 'FC:EC:DA': 'Ubiquiti',
        '00:26:5A': 'Zyxel', '5C:F4:AB': 'Zyxel',
        '38:43:7D': 'Technicolor', '00:1D:D5': 'Technicolor',
        '00:1F:9F': 'Thomson', 'E4:C1:46': 'Sagemcom', '4C:17:EB': 'Sagemcom',
        '3C:A6:2F': 'Huawei', '80:B6:86': 'Huawei', '00:E0:FC': 'Huawei',
        '68:3E:26': 'Xiaomi', '64:09:80': 'Xiaomi',
        '00:24:01': 'Belkin', '94:10:3E': 'Belkin',
        '00:15:6D': 'Ubiquiti', '00:90:4C': 'Epigram/Broadcom'
    };

    function vendorFor(bssid) {
        if (!bssid) return '';
        var pre = bssid.toUpperCase().replace(/-/g, ':').slice(0, 8);
        return OUI[pre] || '';
    }

    /* -------------------------------------------------------- radio helpers */
    function freqToChannel(mhz) {
        if (!mhz) return null;
        if (mhz === 2484) return 14;
        if (mhz >= 2412 && mhz <= 2472) return (mhz - 2407) / 5;
        if (mhz >= 5160 && mhz <= 5885) return (mhz - 5000) / 5;
        if (mhz >= 5955 && mhz <= 7115) return (mhz - 5950) / 5;
        return null;
    }

    function channelToFreq(ch, band) {
        if (ch == null) return null;
        if (band === '2.4') return ch === 14 ? 2484 : 2407 + ch * 5;
        if (band === '6') return 5950 + ch * 5;
        return 5000 + ch * 5;
    }

    function bandFor(ch, mhz, hint) {
        if (hint) {
            if (/6\s*ghz/i.test(hint)) return '6';
            if (/5\s*ghz/i.test(hint)) return '5';
            if (/2[.,]4\s*ghz/i.test(hint)) return '2.4';
        }
        if (mhz) {
            if (mhz >= 2400 && mhz < 2500) return '2.4';
            if (mhz >= 5150 && mhz < 5900) return '5';
            if (mhz >= 5925) return '6';
        }
        if (ch != null) {
            if (ch >= 1 && ch <= 14) return '2.4';
            if (ch >= 32 && ch <= 177) return '5';
            if (ch >= 181) return '6';
        }
        return '?';
    }

    function pctToDbm(pct) { return Math.round(pct / 2 - 100); }
    function dbmToPct(dbm) { return clamp(Math.round((dbm + 100) * 2), 0, 100); }

    function qualityWord(dbm) {
        if (dbm >= -50) return 'excellent';
        if (dbm >= -60) return 'very good';
        if (dbm >= -67) return 'good';
        if (dbm >= -75) return 'weak';
        if (dbm >= -85) return 'very weak';
        return 'barely there';
    }

    function isOpen(sec) {
        if (!sec) return false;
        return /^(open|none|--|esp)/i.test(sec.trim()) || /\bopen\b/i.test(sec);
    }

    /* ============================================================== PARSERS */
    var MAC_RE = /\b([0-9a-f]{2}[:-]){5}[0-9a-f]{2}\b/i;

    function normaliseMac(m) {
        return m.replace(/\\/g, '').replace(/-/g, ':').toUpperCase();
    }

    function makeAp(o) {
        var ch = o.channel != null ? o.channel : freqToChannel(o.freq);
        var band = bandFor(ch, o.freq, o.bandHint);
        var freq = o.freq || channelToFreq(ch, band);
        var ssid = (o.ssid || '').replace(/\u0000/g, '').trim();
        var hidden = !ssid || ssid === '--' || /^<?hidden>?$/i.test(ssid) || /^\\x00/.test(ssid);
        var dbm = o.dbm;
        if (dbm == null && o.pct != null) dbm = pctToDbm(o.pct);
        return {
            ssid: hidden ? '' : ssid,
            hidden: hidden,
            bssid: o.bssid ? normaliseMac(o.bssid) : '',
            vendor: vendorFor(o.bssid),
            channel: ch,
            freq: freq,
            band: band,
            width: o.width || null,
            radio: o.radio || '',
            security: (o.security || '').trim(),
            dbm: dbm == null ? null : Math.round(dbm),
            pct: dbm == null ? (o.pct == null ? null : o.pct) : dbmToPct(dbm)
        };
    }

    /* --- Windows: netsh wlan show networks mode=bssid ---------------------- */
    function parseNetsh(text) {
        var out = [], lines = text.split(/\r?\n/);
        var cur = null, ap = null;
        function flushAp() { if (ap) { out.push(makeAp(ap)); ap = null; } }
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var m;
            if ((m = line.match(/^\s*SSID\s+\d+\s*:\s*(.*)$/i))) {
                flushAp();
                cur = { ssid: m[1].trim(), security: '' };
                continue;
            }
            if (!cur) continue;
            if ((m = line.match(/^\s*(?:Authentication|Verificatie|Authentifizierung)\s*:\s*(.+)$/i))) {
                cur.security = m[1].trim();
                continue;
            }
            if ((m = line.match(/^\s*BSSID\s+\d+\s*:\s*(.+)$/i))) {
                flushAp();
                ap = { ssid: cur.ssid, security: cur.security, bssid: m[1].trim() };
                continue;
            }
            if (!ap) continue;
            if ((m = line.match(/^\s*(?:Signal|Signaal)\s*:\s*(\d+)\s*%/i))) { ap.pct = parseInt(m[1], 10); continue; }
            if ((m = line.match(/^\s*(?:Radio type|Radiotype|Funktyp)\s*:\s*(.+)$/i))) { ap.radio = m[1].trim(); continue; }
            if ((m = line.match(/^\s*Band\s*:\s*(.+)$/i))) { ap.bandHint = m[1].trim(); continue; }
            if ((m = line.match(/^\s*(?:Channel|Kanaal|Kanal)\s*:\s*(\d+)/i))) { ap.channel = parseInt(m[1], 10); continue; }
        }
        flushAp();
        return out;
    }

    /* --- Linux: iw dev wlanX scan ----------------------------------------- */
    function parseIw(text) {
        var out = [], blocks = text.split(/^BSS\s+/mi).slice(1);
        blocks.forEach(function (b) {
            var mac = b.match(MAC_RE);
            if (!mac) return;
            var ap = { bssid: mac[0] };
            var f = b.match(/freq:\s*([\d.]+)/i);
            if (f) {
                var v = parseFloat(f[1]);
                ap.freq = v < 100 ? Math.round(v * 1000) : Math.round(v);
            }
            var s = b.match(/signal:\s*(-?[\d.]+)\s*dBm/i);
            if (s) ap.dbm = parseFloat(s[1]);
            var ssid = b.match(/\n\s*SSID:\s?(.*)/);
            if (ssid) ap.ssid = ssid[1].replace(/\\x00/g, '').trim();
            var ch = b.match(/(?:DS Parameter set|primary channel):\s*(?:channel\s*)?(\d+)/i);
            if (ch) ap.channel = parseInt(ch[1], 10);
            var w = b.match(/STA channel width:\s*(\d+)\s*MHz/i);
            if (w) ap.width = parseInt(w[1], 10);
            var sec = [];
            if (/\bRSN:/.test(b)) sec.push(/SAE/.test(b) ? 'WPA3' : 'WPA2');
            if (/\bWPA:/.test(b)) sec.push('WPA');
            if (!sec.length) sec.push(/Privacy/.test(b) ? 'WEP' : 'Open');
            ap.security = sec.join('/');
            out.push(makeAp(ap));
        });
        return out;
    }

    /* --- Linux: iwlist wlanX scan ----------------------------------------- */
    function parseIwlist(text) {
        var out = [], blocks = text.split(/Cell\s+\d+\s+-\s+/i).slice(1);
        blocks.forEach(function (b) {
            var mac = b.match(MAC_RE);
            if (!mac) return;
            var ap = { bssid: mac[0] };
            var ch = b.match(/Channel[:=]\s*(\d+)/i);
            if (ch) ap.channel = parseInt(ch[1], 10);
            var fr = b.match(/Frequency[:=]\s*([\d.]+)\s*GHz/i);
            if (fr) ap.freq = Math.round(parseFloat(fr[1]) * 1000);
            var sg = b.match(/Signal level[:=]\s*(-?\d+)\s*dBm/i);
            if (sg) ap.dbm = parseInt(sg[1], 10);
            var es = b.match(/ESSID[:=]\s*"(.*)"/i);
            if (es) ap.ssid = es[1].replace(/\\x00/g, '').trim();
            var sec = [];
            if (/WPA2|IEEE 802\.11i/i.test(b)) sec.push('WPA2');
            if (/WPA Version 1/i.test(b)) sec.push('WPA');
            if (!sec.length) sec.push(/Encryption key:on/i.test(b) ? 'WEP' : 'Open');
            ap.security = sec.join('/');
            out.push(makeAp(ap));
        });
        return out;
    }

    /* --- Anything tabular (nmcli, airport, most analyser exports) ----------
       Strategy: find the MAC on the line, take everything before it as the
       SSID and read the remaining columns by shape. Robust against names
       containing spaces and against column order shuffling.                */
    function parseTabular(text) {
        var out = [];
        text.split(/\r?\n/).forEach(function (raw) {
            var line = raw.replace(/\\:/g, ':');
            var mac = line.match(MAC_RE);
            if (!mac) return;
            if (/^\s*(BSSID|MAC)\b/i.test(line) && !/-?\d/.test(line.replace(MAC_RE, ''))) return;
            var idx = line.indexOf(mac[0]);
            var before = line.slice(0, idx).trim();
            var after = line.slice(idx + mac[0].length).trim();
            var ap = { bssid: mac[0], ssid: before.replace(/^[*>\-|]+\s*/, '').trim() };

            var fm = after.match(/(\d{4})\s*MHz/i) || after.match(/\b(2\.4|5|6)\s*GHz\b/i);
            if (fm) {
                if (/MHz/i.test(fm[0])) ap.freq = parseInt(fm[1], 10);
                else ap.bandHint = fm[1] + ' GHz';
            }
            var wm = after.match(/\b(20|40|80|160|320)\s*MHz\b/i);
            if (wm) ap.width = parseInt(wm[1], 10);

            var rest = after
                .replace(/\d{4}\s*MHz/ig, ' ')
                .replace(/\b(20|40|80|160|320)\s*MHz\b/ig, ' ');
            var tokens = rest.split(/\s+/).filter(Boolean);
            var numbers = [];
            tokens.forEach(function (t) {
                var m = t.match(/^(-?\d+)(?:,[+-]\d+)?$/);
                if (m) numbers.push({ val: parseInt(m[1], 10), token: t });
            });
            numbers.forEach(function (n) {
                if (n.val <= -20 && n.val >= -110 && ap.dbm == null) ap.dbm = n.val;
            });
            numbers.forEach(function (n) {
                if (n.val >= 0 && n.val <= 233 && ap.channel == null && n.val > 0) ap.channel = n.val;
            });
            if (ap.dbm == null) {
                for (var i = numbers.length - 1; i >= 0; i--) {
                    if (numbers[i].val >= 0 && numbers[i].val <= 100 && numbers[i].val !== ap.channel) {
                        ap.pct = numbers[i].val;
                        break;
                    }
                }
            }
            var sec = after.match(/(WPA3\S*|WPA2\S*|WPA\S*|WEP\S*|802\.1X|OWE|SAE|Open)/i);
            if (sec) ap.security = sec[0];
            else if (/(^|\s)--(\s|$)/.test(after)) ap.security = 'Open';
            out.push(makeAp(ap));
        });
        return out;
    }

    /* --- Our own JSON export ---------------------------------------------- */
    function parseJson(text) {
        var data = JSON.parse(text);
        var list = Array.isArray(data) ? data : (data && data.accessPoints) || [];
        return list.map(function (a) {
            return makeAp({
                ssid: a.ssid, bssid: a.bssid, channel: a.channel, freq: a.freq,
                dbm: a.dbm, pct: a.pct, security: a.security, width: a.width,
                radio: a.radio, bandHint: a.band ? a.band + ' GHz' : null
            });
        });
    }

    function parseScan(text) {
        var trimmed = text.trim();
        if (!trimmed) return { aps: [], format: null };
        if (/^[[{]/.test(trimmed)) {
            try { return { aps: parseJson(trimmed), format: 'a Spectrum Scryer export' }; }
            catch (e) { /* fall through to the text parsers */ }
        }
        if (/^\s*SSID\s+\d+\s*:/mi.test(trimmed)) return { aps: parseNetsh(trimmed), format: 'a Windows netsh scan' };
        if (/^BSS\s+([0-9a-f]{2}:){5}/mi.test(trimmed)) return { aps: parseIw(trimmed), format: 'an iw scan' };
        if (/Cell\s+\d+\s+-\s+Address/i.test(trimmed)) return { aps: parseIwlist(trimmed), format: 'an iwlist scan' };
        var tab = parseTabular(trimmed);
        if (tab.length) return { aps: tab, format: 'a table of networks' };
        return { aps: [], format: null };
    }

    /* ============================================================== STATE */
    var state = {
        aps: [],
        band: 'all',
        flags: { hidden: false, open: false },
        query: '',
        chartBand: '2.4',
        target: '',
        history: [],
        pathLoss: 3.0
    };

    /* ============================================================ RENDER */
    function filtered() {
        var q = state.query.toLowerCase();
        return state.aps.filter(function (a) {
            if (state.band !== 'all' && a.band !== state.band) return false;
            if (state.flags.hidden && !a.hidden) return false;
            if (state.flags.open && !isOpen(a.security)) return false;
            if (q) {
                var hay = (a.ssid + ' ' + a.bssid + ' ' + a.vendor + ' ' + a.security).toLowerCase();
                if (hay.indexOf(q) === -1) return false;
            }
            return true;
        }).sort(function (x, y) { return (y.dbm == null ? -999 : y.dbm) - (x.dbm == null ? -999 : x.dbm); });
    }

    function apLabel(a) {
        if (!a.hidden) return a.ssid;
        return a.vendor ? 'Hidden network · ' + a.vendor : 'Hidden network';
    }

    function renderStats() {
        var names = {};
        state.aps.forEach(function (a) { if (!a.hidden) names[a.ssid] = 1; });
        var hidden = state.aps.filter(function (a) { return a.hidden; }).length;
        var open = state.aps.filter(function (a) { return isOpen(a.security); }).length;
        var bands = {};
        state.aps.forEach(function (a) { if (a.band !== '?') bands[a.band] = 1; });
        var bandList = Object.keys(bands).sort();
        $('statNetworks').textContent = Object.keys(names).length + hidden;
        $('statAps').textContent = state.aps.length;
        $('statHidden').textContent = hidden;
        $('statOpen').textContent = open;
        $('statBands').textContent = bandList.length ? bandList.join(' · ') : '—';
    }

    function renderList() {
        var list = filtered();
        var host = $('apList');
        $('emptyMsg').hidden = list.length > 0;
        host.innerHTML = list.map(function (a) {
            var pct = a.pct == null ? 0 : a.pct;
            var badges = '';
            if (a.hidden) badges += '<span class="badge badge-hidden">hidden</span>';
            if (isOpen(a.security)) badges += '<span class="badge badge-open">unsecured</span>';
            if (a.band !== '?') badges += '<span class="badge badge-band">' + a.band + ' GHz</span>';
            var meta = [];
            if (a.channel != null) meta.push('ch ' + a.channel);
            if (a.freq) meta.push(a.freq + ' MHz');
            if (a.width) meta.push(a.width + ' MHz wide');
            if (a.security) meta.push(a.security);
            var sub = [];
            if (a.bssid) sub.push(a.bssid);
            if (a.vendor) sub.push(a.vendor);
            if (a.radio) sub.push(a.radio);
            if (a.dbm != null) sub.push(qualityWord(a.dbm) + ' signal');
            return '' +
                '<article class="ap' + (a.hidden ? ' is-hidden-net' : '') + '">' +
                '<div class="ap-main">' +
                '<h3 class="ap-name">' +
                (a.hidden ? '<span class="ghost">' + escapeHtml(apLabel(a)) + '</span>' : escapeHtml(a.ssid)) +
                badges + '</h3>' +
                '<p class="ap-meta">' + meta.map(escapeHtml).join(' · ') + '</p>' +
                '</div>' +
                '<div class="ap-signal">' +
                '<span class="ap-rssi">' + (a.dbm == null ? '—' : a.dbm + ' dBm') + '</span>' +
                '<span class="bar"><span style="width:' + pct + '%"></span></span>' +
                '</div>' +
                '<div class="ap-sub"><p class="ap-sub-row">' + sub.map(escapeHtml).join(' · ') + '</p></div>' +
                '</article>';
        }).join('');
    }

    /* ------------------------------------------------------------- charting */
    var CHANNELS = {
        '2.4': { from: 1, to: 14, tick: 1 },
        '5': { from: 32, to: 177, tick: 8 },
        '6': { from: 1, to: 233, tick: 16 }
    };

    function chartAps() {
        return state.aps.filter(function (a) { return a.band === state.chartBand && a.channel != null; });
    }

    function drawChart() {
        var cv = $('chart'), ctx = cv.getContext('2d');
        var aps = chartAps();
        $('chartEmpty').hidden = aps.length > 0;
        ctx.clearRect(0, 0, cv.width, cv.height);

        var padL = 54, padR = 20, padT = 20, padB = 42;
        var w = cv.width - padL - padR, h = cv.height - padT - padB;
        var range = CHANNELS[state.chartBand];
        var lo = range.from, hi = range.to;
        var minDbm = -100, maxDbm = -20;

        var x = function (ch) { return padL + ((ch - lo) / (hi - lo)) * w; };
        var y = function (d) { return padT + (1 - (clamp(d, minDbm, maxDbm) - minDbm) / (maxDbm - minDbm)) * h; };

        /* grid */
        ctx.strokeStyle = '#1b2537';
        ctx.fillStyle = '#64728b';
        ctx.lineWidth = 1;
        ctx.font = '16px "JetBrains Mono", monospace';
        for (var d = minDbm; d <= maxDbm; d += 20) {
            ctx.beginPath();
            ctx.moveTo(padL, y(d));
            ctx.lineTo(cv.width - padR, y(d));
            ctx.stroke();
            ctx.textAlign = 'right';
            ctx.fillText(d + '', padL - 8, y(d) + 5);
        }
        ctx.textAlign = 'center';
        for (var c = lo; c <= hi; c += range.tick) {
            ctx.fillText(c + '', x(c), cv.height - 14);
        }
        ctx.fillText('channel', cv.width / 2, cv.height - 1);

        var hues = ['#38bdf8', '#a78bfa', '#34d399', '#fbbf24', '#fb7185', '#f472b6', '#22d3ee', '#c084fc'];
        aps.forEach(function (a, i) {
            var colour = hues[i % hues.length];
            var dbm = a.dbm == null ? -90 : a.dbm;
            var widthCh = (a.width ? a.width : (state.chartBand === '2.4' ? 20 : 40)) / 5;
            var cx = x(a.channel), left = x(a.channel - widthCh / 2), right = x(a.channel + widthCh / 2);
            var top = y(dbm), base = y(minDbm);

            ctx.beginPath();
            ctx.moveTo(left, base);
            ctx.bezierCurveTo(cx - widthCh * 2, base, cx - widthCh * 2, top, cx, top);
            ctx.bezierCurveTo(cx + widthCh * 2, top, cx + widthCh * 2, base, right, base);
            ctx.closePath();
            ctx.fillStyle = colour + '26';
            ctx.fill();
            ctx.strokeStyle = colour;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = colour;
            ctx.font = '16px "Space Grotesk", sans-serif';
            ctx.textAlign = 'center';
            var label = a.hidden ? '· hidden ·' : a.ssid;
            if (label.length > 18) label = label.slice(0, 17) + '…';
            ctx.fillText(label, clamp(cx, padL + 30, cv.width - padR - 30), Math.max(padT + 14, top - 8));
        });

        renderAdvice(aps);
    }

    function renderAdvice(aps) {
        var host = $('advice');
        if (!aps.length) { host.innerHTML = ''; return; }
        var load = {};
        aps.forEach(function (a) {
            var spread = state.chartBand === '2.4' ? 2 : 0;
            for (var c = a.channel - spread; c <= a.channel + spread; c++) {
                load[c] = (load[c] || 0) + (a.dbm == null ? 1 : Math.max(0.2, (a.dbm + 100) / 50));
            }
        });
        var candidates = state.chartBand === '2.4' ? [1, 6, 11] :
            Object.keys(load).map(Number).sort(function (a, b) { return a - b; });
        var best = null;
        candidates.forEach(function (c) {
            var score = load[c] || 0;
            if (best === null || score < best.score) best = { ch: c, score: score };
        });
        var counts = {};
        aps.forEach(function (a) { counts[a.channel] = (counts[a.channel] || 0) + 1; });
        var busiest = null;
        Object.keys(counts).forEach(function (c) {
            if (busiest === null || counts[c] > busiest.count) busiest = { ch: Number(c), count: counts[c] };
        });
        var pills = [
            '<span class="advice-pill">' + aps.length + ' access point' + (aps.length === 1 ? '' : 's') +
            ' on ' + state.chartBand + ' GHz</span>'
        ];
        if (best) pills.push('<span class="advice-pill">Quietest of the usual choices: <strong>channel ' + best.ch + '</strong></span>');
        if (busiest && busiest.count > 1) {
            pills.push('<span class="advice-pill">Busiest: channel ' + busiest.ch +
                ' (' + busiest.count + ' access points)</span>');
        }
        if (state.chartBand === '2.4') pills.push('<span class="advice-pill">Only 1, 6 and 11 avoid overlapping each other</span>');
        if (state.chartBand === '6') pills.push('<span class="advice-pill">6 GHz is short-range but usually empty — grab it</span>');
        host.innerHTML = pills.join('');
    }

    /* ------------------------------------------------------------- locator */
    function targetOptions() {
        var sel = $('targetSelect');
        var prev = state.target;
        var opts = ['<option value="">— choose an access point —</option>'];
        state.aps.slice().sort(function (x, y) {
            return (y.dbm == null ? -999 : y.dbm) - (x.dbm == null ? -999 : x.dbm);
        }).forEach(function (a) {
            if (!a.bssid) return;
            var label = apLabel(a) + ' · ' + a.bssid + (a.channel != null ? ' · ch ' + a.channel : '');
            opts.push('<option value="' + escapeHtml(a.bssid) + '">' + escapeHtml(label) + '</option>');
        });
        sel.innerHTML = opts.join('');
        if (prev && state.aps.some(function (a) { return a.bssid === prev; })) sel.value = prev;
        else state.target = sel.value;
    }

    function currentTargetAp() {
        if (!state.target) return null;
        for (var i = 0; i < state.aps.length; i++) {
            if (state.aps[i].bssid === state.target) return state.aps[i];
        }
        return null;
    }

    function estimateDistance(dbm, band) {
        if (dbm == null) return null;
        var ref = band === '6' ? -47 : band === '5' ? -45 : -40; /* dBm at 1 m */
        var d = Math.pow(10, (ref - dbm) / (10 * state.pathLoss));
        return d;
    }

    function formatDistance(d) {
        if (d == null) return '—';
        if (d < 1) return Math.round(d * 100) + ' cm';
        if (d < 10) return d.toFixed(1) + ' m';
        if (d < 1000) return Math.round(d) + ' m';
        return (d / 1000).toFixed(1) + ' km';
    }

    function recordSample() {
        var ap = currentTargetAp();
        if (!ap || ap.dbm == null) return;
        var last = state.history[state.history.length - 1];
        if (last && last.dbm === ap.dbm && Date.now() - last.at < 400) return;
        state.history.push({ dbm: ap.dbm, at: Date.now() });
        if (state.history.length > 60) state.history.shift();
    }

    function drawDial() {
        var cv = $('dial'), ctx = cv.getContext('2d');
        var ap = currentTargetAp();
        var dbm = ap ? ap.dbm : null;
        var cx = cv.width / 2, cy = cv.height / 2, r = cv.width * 0.38;
        ctx.clearRect(0, 0, cv.width, cv.height);

        ctx.lineWidth = 26;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#16203a';
        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 2.25);
        ctx.stroke();

        if (dbm != null) {
            var t = clamp((dbm + 100) / 60, 0, 1);
            var grad = ctx.createLinearGradient(0, cv.height, cv.width, 0);
            grad.addColorStop(0, '#fb7185');
            grad.addColorStop(0.5, '#fbbf24');
            grad.addColorStop(1, '#34d399');
            ctx.strokeStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 0.75 + t * Math.PI * 1.5);
            ctx.stroke();
        }

        $('dialRssi').textContent = dbm == null ? '—' : dbm;
        drawSpark();
        updateVerdict();
    }

    function drawSpark() {
        var cv = $('spark'), ctx = cv.getContext('2d');
        ctx.clearRect(0, 0, cv.width, cv.height);
        var h = state.history;
        ctx.strokeStyle = '#1b2537';
        ctx.beginPath();
        ctx.moveTo(0, cv.height / 2);
        ctx.lineTo(cv.width, cv.height / 2);
        ctx.stroke();
        if (h.length < 2) return;
        var pad = 8;
        var x = function (i) { return pad + (i / (h.length - 1)) * (cv.width - pad * 2); };
        var y = function (d) { return pad + (1 - clamp((d + 100) / 60, 0, 1)) * (cv.height - pad * 2); };
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        h.forEach(function (s, i) { i ? ctx.lineTo(x(i), y(s.dbm)) : ctx.moveTo(x(i), y(s.dbm)); });
        ctx.stroke();
        ctx.fillStyle = '#a78bfa';
        h.forEach(function (s, i) {
            ctx.beginPath();
            ctx.arc(x(i), y(s.dbm), 3.5, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function updateVerdict() {
        var ap = currentTargetAp();
        if (!ap) {
            $('verdict').textContent = 'Pick a target to begin the hunt.';
            $('readDist').textContent = '—';
            $('readTrend').textContent = '—';
            $('readSamples').textContent = state.history.length;
            $('readBest').textContent = '—';
            return;
        }
        var dbm = ap.dbm;
        var dist = estimateDistance(dbm, ap.band);
        $('readDist').textContent = formatDistance(dist);
        $('readSamples').textContent = state.history.length;
        var best = state.history.reduce(function (acc, s) {
            return acc == null || s.dbm > acc ? s.dbm : acc;
        }, dbm);
        $('readBest').textContent = best == null ? '—' : best + ' dBm';

        var trend = '—', verdict;
        if (state.history.length >= 2) {
            var a = state.history[state.history.length - 2].dbm;
            var b = state.history[state.history.length - 1].dbm;
            var delta = b - a;
            if (delta >= 3) trend = '↑ warmer (+' + delta + ' dB)';
            else if (delta <= -3) trend = '↓ colder (' + delta + ' dB)';
            else trend = '→ about the same';
        }
        $('readTrend').textContent = trend;

        if (dbm == null) verdict = 'No signal reading for this one — the scan did not include a level.';
        else if (dbm >= -45) verdict = '🔥 Red hot — you are practically standing next to ' + apLabel(ap) + '.';
        else if (dbm >= -60) verdict = '🌡️ Warm — same room or one thin wall away.';
        else if (dbm >= -70) verdict = '🙂 Getting there — a room or two off.';
        else if (dbm >= -80) verdict = '🧊 Cold — a few walls or a floor between you.';
        else verdict = '❄️ Freezing — far away, or heavily shielded.';
        $('verdict').textContent = verdict + (state.history.length < 2
            ? ' Walk a few steps, run the scan again and paste it to compare.' : '');
    }

    /* ------------------------------------------------------------- exports */
    function download(name, mime, text) {
        var blob = new Blob([text], { type: mime });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    function csvCell(v) {
        var s = v == null ? '' : String(v);
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }

    /* ------------------------------------------------------------ live info */
    function renderConnection() {
        var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (!c) {
            $('netType').textContent = 'not exposed';
            $('netClass').textContent = navigator.onLine ? 'online' : 'offline';
            $('netDown').textContent = '—';
            $('netRtt').textContent = '—';
            return;
        }
        $('netType').textContent = c.type || (navigator.onLine ? 'online' : 'offline');
        $('netClass').textContent = c.effectiveType || '—';
        $('netDown').textContent = c.downlink != null ? c.downlink + ' Mb/s' : '—';
        $('netRtt').textContent = c.rtt != null ? c.rtt + ' ms' : '—';
    }

    var bleSeen = {};

    function addBleDevice(name, id, rssi) {
        bleSeen[id] = { name: name || 'Unnamed device', rssi: rssi };
        var host = $('bleList');
        host.innerHTML = Object.keys(bleSeen).map(function (k) {
            var d = bleSeen[k];
            return '<li><span>' + escapeHtml(d.name) + '</span><span>' +
                (d.rssi != null ? d.rssi + ' dBm' : '2.4 GHz') + '</span></li>';
        }).join('');
    }

    function scanBluetooth() {
        var msg = $('bleMsg');
        if (!navigator.bluetooth) {
            msg.textContent = 'This browser has no Web Bluetooth. Chrome, Edge or Opera on desktop and Android can do it.';
            return;
        }
        if (navigator.bluetooth.requestLEScan) {
            msg.textContent = 'Listening for advertisements…';
            navigator.bluetooth.requestLEScan({ acceptAllAdvertisements: true }).then(function () {
                navigator.bluetooth.addEventListener('advertisementreceived', function (ev) {
                    addBleDevice(ev.device && ev.device.name, ev.device ? ev.device.id : String(Math.random()), ev.rssi);
                });
                msg.textContent = 'Listening — nearby beacons will appear as they shout.';
            }).catch(function (err) {
                fallbackChooser(err);
            });
            return;
        }
        fallbackChooser();

        function fallbackChooser(err) {
            if (err && err.name === 'NotFoundError') {
                msg.textContent = 'No devices picked. Try again and choose one from the list.';
                return;
            }
            navigator.bluetooth.requestDevice({ acceptAllDevices: true }).then(function (device) {
                addBleDevice(device.name, device.id, null);
                msg.textContent = 'Added. Your browser only reveals devices you pick — run it again for more.';
            }).catch(function (e) {
                msg.textContent = e && e.name === 'NotFoundError'
                    ? 'No device chosen.'
                    : 'Bluetooth scan unavailable: ' + (e && e.message ? e.message : 'permission denied') + '.';
            });
        }
    }

    /* ---------------------------------------------------------------- demo */
    var DEMO = [
        'Interface name : Wi-Fi',
        'There are 9 networks currently visible.',
        '',
        'SSID 1 : Bramblewood Cottage',
        '    Authentication          : WPA2-Personal',
        '    BSSID 1                 : 9c:c7:a6:11:22:33',
        '         Signal             : 88%',
        '         Radio type         : 802.11ax',
        '         Band               : 2.4 GHz',
        '         Channel            : 6',
        '    BSSID 2                 : 9c:c7:a6:11:22:34',
        '         Signal             : 76%',
        '         Radio type         : 802.11ax',
        '         Band               : 5 GHz',
        '         Channel            : 44',
        '',
        'SSID 2 : ',
        '    Authentication          : WPA2-Personal',
        '    BSSID 1                 : b0:be:76:aa:bb:cc',
        '         Signal             : 62%',
        '         Radio type         : 802.11n',
        '         Band               : 2.4 GHz',
        '         Channel            : 11',
        '',
        'SSID 3 : Pretty Fly for a Wi-Fi',
        '    Authentication          : WPA3-Personal',
        '    BSSID 1                 : 04:18:d6:77:88:99',
        '         Signal             : 54%',
        '         Radio type         : 802.11ax',
        '         Band               : 6 GHz',
        '         Channel            : 37',
        '',
        'SSID 4 : CoffeeHouse Guest',
        '    Authentication          : Open',
        '    BSSID 1                 : 00:24:b2:de:ad:01',
        '         Signal             : 46%',
        '         Radio type         : 802.11n',
        '         Band               : 2.4 GHz',
        '         Channel            : 1',
        '',
        'SSID 5 : Telenet-A4C1',
        '    Authentication          : WPA2-Personal',
        '    BSSID 1                 : e4:c1:46:31:41:59',
        '         Signal             : 38%',
        '         Radio type         : 802.11ac',
        '         Band               : 5 GHz',
        '         Channel            : 108',
        '',
        'SSID 6 : ',
        '    Authentication          : WPA2-Personal',
        '    BSSID 1                 : dc:a6:32:0f:0f:0f',
        '         Signal             : 30%',
        '         Radio type         : 802.11n',
        '         Band               : 5 GHz',
        '         Channel            : 149',
        '',
        'SSID 7 : Sky-Broadband-7GT2',
        '    Authentication          : WPA2-Personal',
        '    BSSID 1                 : 38:43:7d:ab:cd:ef',
        '         Signal             : 24%',
        '         Radio type         : 802.11n',
        '         Band               : 2.4 GHz',
        '         Channel            : 6',
        '',
        'SSID 8 : Hue Bridge Setup',
        '    Authentication          : Open',
        '    BSSID 1                 : 00:17:88:12:34:56',
        '         Signal             : 20%',
        '         Radio type         : 802.11n',
        '         Band               : 2.4 GHz',
        '         Channel            : 11'
    ].join('\n');

    /* ============================================================== WIRING */
    function setMessage(text, kind) {
        var el = $('parseMsg');
        el.textContent = text;
        el.className = 'parse-msg' + (kind ? ' is-' + kind : '');
    }

    function showResults(show) {
        $('step-results').hidden = !show;
        $('step-map').hidden = !show;
        $('step-locate').hidden = !show;
    }

    function refreshAll() {
        renderStats();
        renderList();
        drawChart();
        targetOptions();
        recordSample();
        drawDial();
    }

    function readScan(text, quiet) {
        var result = parseScan(text);
        if (!result.aps.length) {
            if (!quiet) setMessage('Could not find any access points in that. Make sure you pasted the whole output — it needs at least a MAC address per network.', 'bad');
            return false;
        }
        state.aps = result.aps;
        showResults(true);
        refreshAll();
        var hidden = result.aps.filter(function (a) { return a.hidden; }).length;
        setMessage('Read ' + result.aps.length + ' access point' + (result.aps.length === 1 ? '' : 's') +
            ' from ' + result.format + (hidden ? ' — including ' + hidden + ' hidden network' + (hidden === 1 ? '' : 's') : '') + '.', 'ok');
        return true;
    }

    function setOs(os) {
        var r = RECIPES[os];
        if (!r) return;
        $('osWhere').innerHTML = r.where;
        $('osCmd').textContent = r.cmd;
        $('osNote').innerHTML = r.note;
        document.querySelectorAll('.os-tab').forEach(function (t) {
            var on = t.dataset.os === os;
            t.classList.toggle('is-active', on);
            t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        $('panel-os').setAttribute('aria-labelledby', 'tab-' + os);
    }

    function guessOs() {
        var ua = navigator.userAgent;
        if (/Android|iPhone|iPad/i.test(ua)) return 'phone';
        if (/Mac OS X/i.test(ua)) return 'mac';
        if (/Linux|X11/i.test(ua)) return 'linux';
        return 'windows';
    }

    function init() {
        setOs(guessOs());

        document.querySelectorAll('.os-tab').forEach(function (t) {
            t.addEventListener('click', function () { setOs(t.dataset.os); });
        });

        $('copyCmd').addEventListener('click', function () {
            var text = $('osCmd').textContent;
            var done = function () {
                $('copyCmd').textContent = 'Copied!';
                setTimeout(function () { $('copyCmd').textContent = 'Copy'; }, 1600);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done, function () { done(); });
            } else {
                done();
            }
        });

        $('readBtn').addEventListener('click', function () { readScan($('scanInput').value); });

        $('scanInput').addEventListener('paste', function () {
            setTimeout(function () { readScan($('scanInput').value, true); }, 30);
        });

        $('demoBtn').addEventListener('click', function () {
            $('scanInput').value = DEMO;
            readScan(DEMO);
        });

        $('clearBtn').addEventListener('click', function () {
            $('scanInput').value = '';
            state.aps = [];
            state.history = [];
            state.target = '';
            showResults(false);
            setMessage('');
        });

        $('searchInput').addEventListener('input', function () {
            state.query = this.value.trim();
            renderList();
        });

        document.querySelectorAll('[data-band]').forEach(function (b) {
            b.addEventListener('click', function () {
                state.band = b.dataset.band;
                document.querySelectorAll('[data-band]').forEach(function (o) {
                    o.classList.toggle('is-active', o === b);
                });
                renderList();
            });
        });

        document.querySelectorAll('[data-flag]').forEach(function (b) {
            b.addEventListener('click', function () {
                var f = b.dataset.flag;
                state.flags[f] = !state.flags[f];
                b.classList.toggle('is-active', state.flags[f]);
                renderList();
            });
        });

        document.querySelectorAll('[data-chart]').forEach(function (b) {
            b.addEventListener('click', function () {
                state.chartBand = b.dataset.chart;
                document.querySelectorAll('[data-chart]').forEach(function (o) {
                    o.classList.toggle('is-active', o === b);
                });
                drawChart();
            });
        });

        $('targetSelect').addEventListener('change', function () {
            state.target = this.value;
            state.history = [];
            recordSample();
            drawDial();
        });

        $('resetHunt').addEventListener('click', function () {
            state.history = [];
            recordSample();
            drawDial();
        });

        $('envSlider').addEventListener('input', function () {
            state.pathLoss = parseInt(this.value, 10) / 10;
            var word = state.pathLoss <= 2.2 ? 'open air, line of sight'
                : state.pathLoss <= 2.8 ? 'open-plan, few obstacles'
                    : state.pathLoss <= 3.4 ? 'indoors, normal walls'
                        : 'thick walls, concrete or steel';
            $('envVal').textContent = word;
            updateVerdict();
        });

        $('exportJson').addEventListener('click', function () {
            download('spectrum-scryer-scan.json', 'application/json',
                JSON.stringify({ scannedAt: new Date().toISOString(), accessPoints: state.aps }, null, 2));
        });

        $('exportCsv').addEventListener('click', function () {
            var head = ['ssid', 'hidden', 'bssid', 'vendor', 'band', 'channel', 'freq', 'width', 'dbm', 'pct', 'security', 'radio'];
            var rows = [head.join(',')].concat(state.aps.map(function (a) {
                return head.map(function (k) { return csvCell(a[k]); }).join(',');
            }));
            download('spectrum-scryer-scan.csv', 'text/csv', rows.join('\n'));
        });

        $('bleBtn').addEventListener('click', scanBluetooth);

        renderConnection();
        var conn = navigator.connection;
        if (conn && conn.addEventListener) conn.addEventListener('change', renderConnection);
        window.addEventListener('online', renderConnection);
        window.addEventListener('offline', renderConnection);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
