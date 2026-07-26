/* ============================================================================
   lookups.js — all EXTERNAL lookup intelligence (opt-in, click-only).

   Nothing in this file runs automatically. It only builds links / buttons that
   the user clicks to send a domain, IP or hash to a third-party service, plus
   one explicit "Check live ICANN list" button that fetches the official IANA
   TLD file on demand.

   Depends on globals from the data-*.js files (IANA_TLDS, IANA_TLDS_VERSION,
   NON_PUBLIC_TLDS) and helpers from analyzer.js (escapeHtml, getHeader,
   extractDomain, getAllHeaderValues) — all resolved at click/analysis time.
   ============================================================================ */

// --- Third-party URL builders --------------------------------------------

function mxUrl(action, arg) {
    return `https://mxtoolbox.com/SuperTool.aspx?action=${action}%3a${encodeURIComponent(arg)}&run=toolpage`;
}
function whoisUrl(domain) {
    return `https://who.is/whois/${encodeURIComponent(domain)}`;
}
function virusTotalDomainUrl(domain) {
    return `https://www.virustotal.com/gui/domain/${encodeURIComponent(domain)}`;
}
function virusTotalIpUrl(ip) {
    return `https://www.virustotal.com/gui/ip-address/${encodeURIComponent(ip)}`;
}
function virusTotalFileUrl(hash) {
    return `https://www.virustotal.com/gui/file/${encodeURIComponent(hash)}`;
}
function abuseIpDbUrl(ip) {
    return `https://www.abuseipdb.com/check/${encodeURIComponent(ip)}`;
}

// --- IP classification -----------------------------------------------------

function isPublicIp(ip) {
    const p = ip.split('.').map(Number);
    if (p.length !== 4 || p.some(n => isNaN(n) || n < 0 || n > 255)) return false;
    if (p[0] === 10 || p[0] === 127 || p[0] === 0) return false;
    if (p[0] === 169 && p[1] === 254) return false;
    if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return false;
    if (p[0] === 192 && p[1] === 168) return false;
    if (p[0] === 100 && p[1] >= 64 && p[1] <= 127) return false; // CGNAT
    return true;
}

// --- UI builders -----------------------------------------------------------

function lookupAnchor(label, href, cls) {
    const a = document.createElement('a');
    a.className = 'lookup-link' + (cls ? ' ' + cls : '');
    a.textContent = label;
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
}

function buildDomainCard(d) {
    const card = document.createElement('div');
    card.className = 'lookup-card';
    const title = document.createElement('div');
    title.className = 'lookup-title';
    title.innerHTML = `<span class="lookup-type">domain</span> ${escapeHtml(d)}`;
    const row = document.createElement('div');
    row.className = 'lookup-links';
    row.appendChild(lookupAnchor('WHOIS / Age', whoisUrl(d)));
    row.appendChild(lookupAnchor('MX / DNS', mxUrl('mx', d)));
    row.appendChild(lookupAnchor('SPF', mxUrl('spf', d)));
    row.appendChild(lookupAnchor('DMARC', mxUrl('dmarc', d)));
    row.appendChild(lookupAnchor('Blacklist', mxUrl('blacklist', d)));
    row.appendChild(lookupAnchor('VirusTotal ↗', virusTotalDomainUrl(d), 'vt'));
    card.appendChild(title);
    card.appendChild(row);
    return card;
}

function buildIpCard(ip) {
    const card = document.createElement('div');
    card.className = 'lookup-card';
    const title = document.createElement('div');
    title.className = 'lookup-title';
    title.innerHTML = `<span class="lookup-type">IP</span> ${escapeHtml(ip)}`;
    const row = document.createElement('div');
    row.className = 'lookup-links';
    row.appendChild(lookupAnchor('Blacklist', mxUrl('blacklist', ip)));
    row.appendChild(lookupAnchor('Reverse DNS', mxUrl('ptr', ip)));
    row.appendChild(lookupAnchor('ARIN / WHOIS', mxUrl('arin', ip)));
    row.appendChild(lookupAnchor('AbuseIPDB ↗', abuseIpDbUrl(ip)));
    row.appendChild(lookupAnchor('VirusTotal ↗', virusTotalIpUrl(ip), 'vt'));
    card.appendChild(title);
    card.appendChild(row);
    return card;
}

// --- Live ICANN TLD verification (opt-in) ---------------------------------

const ICANN_TLD_LIST_URL = 'https://data.iana.org/TLD/tlds-alpha-by-domain.txt';
let _icannLivePromise = null;

// Fetch + parse the official IANA TLD file once, memoised for the session.
function fetchIcannTlds() {
    if (_icannLivePromise) return _icannLivePromise;
    _icannLivePromise = fetch(ICANN_TLD_LIST_URL, { cache: 'no-store' })
        .then(r => {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.text();
        })
        .then(text => {
            const set = new Set();
            let version = '';
            text.split(/\r?\n/).forEach(line => {
                if (!line) return;
                if (line.startsWith('#')) {
                    const m = line.match(/Version\s+(\d+)/);
                    if (m) version = m[1];
                    return;
                }
                set.add(line.trim().toLowerCase());
            });
            return { set, version };
        })
        .catch(err => {
            // Reset so a later click can retry
            _icannLivePromise = null;
            throw err;
        });
    return _icannLivePromise;
}

async function verifyTldsLive(tlds, btn, resultEl) {
    btn.disabled = true;
    resultEl.textContent = 'Fetching live ICANN list…';
    try {
        const { set, version } = await fetchIcannTlds();
        const lines = tlds.map(t => `.${t}: ${set.has(t) ? 'exists ✓' : 'NOT found ✗'}`);
        resultEl.textContent = `Live ICANN list (v${version}) — ` + lines.join('  ·  ');
    } catch (e) {
        resultEl.textContent =
            'Could not fetch the list directly (offline, or blocked by CORS). ' +
            'Use the "Open ICANN list ↗" link to verify manually.';
    } finally {
        btn.disabled = false;
    }
}

function buildIcannCheckCard(tlds) {
    const ver = typeof IANA_TLDS_VERSION !== 'undefined' ? IANA_TLDS_VERSION : '?';
    const card = document.createElement('div');
    card.className = 'lookup-card icann-card';

    const title = document.createElement('div');
    title.className = 'lookup-title';
    title.innerHTML =
        `<span class="lookup-type warn">unknown TLD</span> ` +
        escapeHtml(tlds.map(t => '.' + t).join(', '));

    const note = document.createElement('div');
    note.className = 'lookup-note';
    note.textContent = `Not present in the bundled ICANN snapshot (v${ver}).`;

    const row = document.createElement('div');
    row.className = 'lookup-links';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lookup-link';
    btn.textContent = 'Check live ICANN list';

    const result = document.createElement('div');
    result.className = 'lookup-note';

    btn.addEventListener('click', () => verifyTldsLive(tlds, btn, result));

    row.appendChild(btn);
    row.appendChild(lookupAnchor('Open ICANN list ↗', ICANN_TLD_LIST_URL));

    card.appendChild(title);
    card.appendChild(note);
    card.appendChild(row);
    card.appendChild(result);
    return card;
}

// --- Investigation panel ---------------------------------------------------

function displayInvestigation(headers) {
    if (!investigationSection || !investigationContent) return;
    investigationContent.innerHTML = '';

    const domains = new Set();
    const ips = new Set();
    const nonPublic = typeof NON_PUBLIC_TLDS !== 'undefined'
        ? NON_PUBLIC_TLDS
        : new Set(['internal', 'local', 'localhost', 'lan', 'corp', 'home', 'arpa']);

    const addDomain = d => {
        if (!d) return;
        d = d.toLowerCase();
        const tld = d.split('.').pop();
        if (/\.[a-z]{2,}$/i.test(d) && !nonPublic.has(tld)) domains.add(d);
    };

    addDomain(extractDomain(getHeader(headers, 'From') || ''));
    addDomain(extractDomain(getHeader(headers, 'Return-Path') || ''));
    addDomain(extractDomain(getHeader(headers, 'Reply-To') || ''));
    addDomain(extractDomain(getHeader(headers, 'Sender') || ''));

    getAllHeaderValues(headers, 'DKIM-Signature').forEach(sig => {
        const m = sig.match(/d=([^;\s]+)/i);
        if (m) addDomain(m[1]);
    });

    getAllHeaderValues(headers, 'Received').forEach(r => {
        const host = r.match(/from\s+([A-Za-z0-9.-]+\.[A-Za-z]{2,})/i);
        if (host) addDomain(host[1]);
        (r.match(/\[?(\d{1,3}(?:\.\d{1,3}){3})\]?/g) || []).forEach(ip => {
            const clean = ip.replace(/[\[\]]/g, '');
            if (isPublicIp(clean)) ips.add(clean);
        });
    });

    ['X-Originating-IP', 'X-Sender-IP', 'X-Source-IP'].forEach(h => {
        const v = getHeader(headers, h);
        if (v) {
            const m = v.match(/(\d{1,3}(?:\.\d{1,3}){3})/);
            if (m && isPublicIp(m[1])) ips.add(m[1]);
        }
    });

    // Any discovered TLD not in our bundled ICANN snapshot?
    const unknownTlds = new Set();
    if (typeof IANA_TLDS !== 'undefined') {
        domains.forEach(d => {
            const tld = d.split('.').pop();
            if (!IANA_TLDS.has(tld) && !tld.startsWith('xn--')) unknownTlds.add(tld);
        });
    }

    if (!domains.size && !ips.size) {
        investigationSection.classList.add('hidden');
        return;
    }
    investigationSection.classList.remove('hidden');

    if (unknownTlds.size) {
        investigationContent.appendChild(buildIcannCheckCard([...unknownTlds]));
    }
    domains.forEach(d => investigationContent.appendChild(buildDomainCard(d)));
    ips.forEach(ip => investigationContent.appendChild(buildIpCard(ip)));
}
