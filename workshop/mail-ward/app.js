/* ==========================================================================
   Mail Ward — SPF / DKIM / DMARC guide, record builder, inspector, triage.
   No dependencies. Everything is local except the explicitly opt-in DNS
   lookup, which only runs when the user presses the button.
   All generated DOM is built with createElement/textContent — never innerHTML.
   ========================================================================== */
(function () {
    'use strict';

    var K_THEME = 'mail-ward:theme';
    var K_CHECK = 'mail-ward:checklist';

    var $ = function (sel, root) { return (root || document).querySelector(sel); };
    var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = text;
        return n;
    }
    function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

    /* ====================================================================== *
     * 1. Theme
     * ====================================================================== */
    var THEMES = [
        { id: 'aurora', name: 'Aurora', sw: ['#a855f7', '#22d3ee'] },
        { id: 'midnight', name: 'Midnight', sw: ['#3b82f6', '#38bdf8'] },
        { id: 'solar', name: 'Solar', sw: ['#b58900', '#cb4b16'] },
        { id: 'nord', name: 'Nord', sw: ['#5e81ac', '#88c0d0'] },
        { id: 'dracula', name: 'Dracula', sw: ['#bd93f9', '#ff79c6'] },
        { id: 'rose', name: 'Rosé Pine', sw: ['#c4a7e7', '#ebbcba'] },
        { id: 'matrix', name: 'Matrix', sw: ['#00ff66', '#008f39'] },
        { id: 'paper', name: 'Paper', sw: ['#2563eb', '#db2777'] },
        { id: 'sunset', name: 'Sunset', sw: ['#fb923c', '#f472b6'] },
        { id: 'cyberpunk', name: 'Cyberpunk', sw: ['#ff00c8', '#00f0ff'] }
    ];
    var THEME_META = {
        aurora: '#0d0726', midnight: '#0a1020', solar: '#f4ecd6', nord: '#3b4252',
        dracula: '#282a36', rose: '#1f1d2e', matrix: '#030f03', paper: '#f5f6f8',
        sunset: '#2b0f2e', cyberpunk: '#12071e'
    };

    function store(key, val) {
        try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); }
        catch (e) { return null; }
    }

    function applyTheme(id) {
        var t = THEMES.filter(function (x) { return x.id === id; })[0] || THEMES[0];
        document.documentElement.setAttribute('data-theme', t.id);
        var nm = $('#theme-name'); if (nm) nm.textContent = t.name;
        var meta = $('#meta-theme'); if (meta) meta.setAttribute('content', THEME_META[t.id] || '#0d0726');
        store(K_THEME, t.id);
        $$('#theme-menu button').forEach(function (b) {
            b.setAttribute('aria-checked', String(b.dataset.theme === t.id));
        });
    }

    function initTheme() {
        var menu = $('#theme-menu'), btn = $('#theme-btn');
        if (!menu || !btn) return;
        THEMES.forEach(function (t) {
            var b = el('button', null);
            b.type = 'button';
            b.setAttribute('role', 'menuitemradio');
            b.dataset.theme = t.id;
            var sw = el('span', 'swatch');
            sw.style.background = 'linear-gradient(135deg,' + t.sw[0] + ',' + t.sw[1] + ')';
            b.appendChild(sw);
            b.appendChild(document.createTextNode(t.name));
            b.addEventListener('click', function () { applyTheme(t.id); menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); });
            menu.appendChild(b);
        });
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            menu.hidden = !menu.hidden;
            btn.setAttribute('aria-expanded', String(!menu.hidden));
        });
        document.addEventListener('click', function () { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') menu.hidden = true; });
        applyTheme(store(K_THEME) || 'aurora');
    }

    /* ====================================================================== *
     * 2. Section nav + back to top
     * ====================================================================== */
    function initNav() {
        var links = $$('.toc-scroll a');
        var targets = links.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
        if ('IntersectionObserver' in window && targets.length) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) {
                    if (!en.isIntersecting) return;
                    links.forEach(function (a) {
                        a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id);
                    });
                    var act = document.querySelector('.toc-scroll a.active');
                    if (act && act.parentNode.scrollWidth > act.parentNode.clientWidth) {
                        act.scrollIntoView({ block: 'nearest', inline: 'center' });
                    }
                });
            }, { rootMargin: '-130px 0px -65% 0px', threshold: 0 });
            targets.forEach(function (t) { io.observe(t); });
        }
        var top = $('#to-top');
        if (top) {
            top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
            window.addEventListener('scroll', function () { top.hidden = window.scrollY < 600; }, { passive: true });
        }
    }

    /* ====================================================================== *
     * 3. Provider knowledge
     *    `lk` = rough number of DNS lookups the include costs (itself +
     *    whatever it nests). Providers change these; treat as an estimate.
     * ====================================================================== */
    var PROVIDERS = [
        { id: 'm365', name: 'Microsoft 365 / Exchange Online', spf: 'spf.protection.outlook.com', lk: 1, sel: 'selector1, selector2 (CNAMEs)' },
        { id: 'gws', name: 'Google Workspace', spf: '_spf.google.com', lk: 4, sel: 'google' },
        { id: 'zoho', name: 'Zoho Mail', spf: 'zoho.eu', lk: 2, sel: 'zoho / zmail' },
        { id: 'proton', name: 'Proton Mail', spf: '_spf.protonmail.ch', lk: 1, sel: 'protonmail, protonmail2, protonmail3' },
        { id: 'fastmail', name: 'Fastmail', spf: 'spf.messagingengine.com', lk: 1, sel: 'fm1, fm2, fm3 (CNAMEs)' },
        { id: 'sendgrid', name: 'SendGrid', spf: 'sendgrid.net', lk: 1, sel: 's1, s2 (CNAMEs)' },
        { id: 'mailgun', name: 'Mailgun', spf: 'mailgun.org', lk: 1, sel: 'mx or smtp' },
        { id: 'ses', name: 'Amazon SES', spf: 'amazonses.com', lk: 1, sel: 'three token CNAMEs' },
        { id: 'postmark', name: 'Postmark', spf: 'spf.mtasv.net', lk: 1, sel: 'shown in the dashboard' },
        { id: 'brevo', name: 'Brevo (ex-Sendinblue)', spf: 'spf.brevo.com', lk: 1, sel: 'mail' },
        { id: 'mailchimp', name: 'Mailchimp / Mandrill', spf: 'servers.mcsv.net', lk: 1, sel: 'k1, k2 (CNAMEs)' },
        { id: 'salesforce', name: 'Salesforce', spf: '_spf.salesforce.com', lk: 2, sel: 'per-org, from Setup' }
    ];

    /* ====================================================================== *
     * 4. Record builder
     * ====================================================================== */
    var RE_DOMAIN = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
    var RE_EMAIL = /^[a-z0-9._%+-]{1,64}@(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
    var RE_IP4 = /^(?:\d{1,3}\.){3}\d{1,3}(?:\/\d{1,2})?$/;
    var RE_IP6 = /^[0-9a-f:]+(?:\/\d{1,3})?$/i;

    function copyBtn(getText) {
        var b = el('button', 'btn copy', 'Copy');
        b.type = 'button';
        b.addEventListener('click', function () {
            var txt = getText();
            var done = function () { b.textContent = 'Copied ✓'; setTimeout(function () { b.textContent = 'Copy'; }, 1600); };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(txt).then(done, function () { b.textContent = 'Press Ctrl+C'; });
            } else {
                var ta = el('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select();
                try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
                document.body.removeChild(ta);
            }
        });
        return b;
    }

    function recordCard(title, host, type, value, note) {
        var wrap = el('div', 'rec');
        var head = el('div', 'rec-head');
        head.appendChild(el('strong', null, title));
        head.appendChild(el('span', 'meta', host + '  ·  ' + type));
        head.appendChild(copyBtn(function () { return value; }));
        wrap.appendChild(head);
        wrap.appendChild(el('div', 'rec-body', value));
        if (note) wrap.appendChild(el('div', 'rec-note', note));
        return wrap;
    }

    function msg(kind, icon, text) {
        var m = el('div', 'msg m-' + kind);
        m.appendChild(el('span', 'm-ic', icon));
        m.appendChild(el('span', null, text));
        return m;
    }

    function initBuilder() {
        var grid = $('#b-providers');
        if (!grid) return;

        PROVIDERS.forEach(function (p) {
            var lab = el('label', 'chip');
            var cb = el('input'); cb.type = 'checkbox'; cb.value = p.id;
            var span = el('span');
            span.appendChild(document.createTextNode(p.name));
            span.appendChild(el('small', null, 'include:' + p.spf));
            lab.appendChild(cb); lab.appendChild(span);
            cb.addEventListener('change', render);
            grid.appendChild(lab);
        });

        var stage = 'monitor';
        $$('#b-stage .stage').forEach(function (b) {
            b.addEventListener('click', function () {
                stage = b.dataset.stage;
                $$('#b-stage .stage').forEach(function (o) { o.setAttribute('aria-checked', String(o === b)); });
                render();
            });
        });

        ['#b-domain', '#b-rua', '#b-ips', '#b-extra'].forEach(function (s) {
            var n = $(s); if (n) n.addEventListener('input', render);
        });
        ['#b-strict', '#b-park'].forEach(function (s) {
            var n = $(s); if (n) n.addEventListener('change', render);
        });

        function splitList(v) {
            return (v || '').split(/[,\s]+/).map(function (x) { return x.trim(); }).filter(Boolean);
        }

        function render() {
            var out = $('#b-output'), warn = $('#b-warnings');
            clear(out); clear(warn);

            var domain = ($('#b-domain').value || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
            var rua = ($('#b-rua').value || '').trim();
            var park = $('#b-park').checked;
            var strict = $('#b-strict').checked;
            var chosen = PROVIDERS.filter(function (p) {
                var cb = grid.querySelector('input[value="' + p.id + '"]');
                return cb && cb.checked;
            });
            var ips = splitList($('#b-ips').value);
            var extra = splitList($('#b-extra').value).map(function (x) { return x.replace(/^include:/i, '').toLowerCase(); });

            if (!domain) { out.appendChild(msg('info', 'ℹ️', 'Type your domain to generate the records.')); return; }
            if (!RE_DOMAIN.test(domain)) warn.appendChild(msg('warn', '⚠️', '“' + domain + '” does not look like a valid domain name.'));

            /* ---- parked domain --------------------------------------------- */
            if (park) {
                out.appendChild(recordCard('SPF — nothing may send', domain, 'TXT', 'v=spf1 -all',
                    'Publish on the domain apex (host “@”).'));
                out.appendChild(recordCard('DMARC — reject everything', '_dmarc.' + domain, 'TXT',
                    'v=DMARC1; p=reject; sp=reject;' + (rua ? ' rua=mailto:' + rua + ';' : ''),
                    'Add rua only if you actually want reports from a domain that never sends.'));
                out.appendChild(recordCard('DKIM — revoke all keys', '*._domainkey.' + domain, 'TXT', 'v=DKIM1; p=',
                    'A wildcard with an empty public key means “every selector on this domain is revoked”.'));
                out.appendChild(recordCard('Null MX — receives no mail', domain, 'MX', '0 .',
                    'Priority 0, value a single dot. Senders fail immediately instead of queueing for days.'));
                warn.appendChild(msg('ok', '✅', 'This is the correct configuration for a parked, legacy or defensive domain. Do this for every domain you own and do not send from.'));
                return;
            }

            /* ---- SPF -------------------------------------------------------- */
            var terms = [];
            var lookups = 0;
            ips.forEach(function (ip) {
                if (RE_IP4.test(ip)) terms.push('ip4:' + ip);
                else if (ip.indexOf(':') > -1 && RE_IP6.test(ip)) terms.push('ip6:' + ip);
                else warn.appendChild(msg('warn', '⚠️', '“' + ip + '” is not a valid IPv4/IPv6 address or range and was skipped.'));
            });
            chosen.forEach(function (p) { terms.push('include:' + p.spf); lookups += p.lk; });
            extra.forEach(function (d) {
                if (RE_DOMAIN.test(d)) { terms.push('include:' + d); lookups += 1; }
                else warn.appendChild(msg('warn', '⚠️', '“' + d + '” is not a valid domain for an include: and was skipped.'));
            });

            var allQ = stage === 'monitor' ? '~all' : '-all';
            var spf = 'v=spf1' + (terms.length ? ' ' + terms.join(' ') : '') + ' ' + allQ;

            out.appendChild(recordCard('SPF', domain, 'TXT', spf,
                'One record only, on the domain apex (host “@”). Estimated DNS lookups: ' + lookups + ' of 10.'));

            /* ---- DKIM ------------------------------------------------------- */
            var dkimNote = chosen.length
                ? chosen.map(function (p) { return p.name + ' → ' + p.sel; }).join('  ·  ')
                : 'Enable DKIM in every platform you send from and publish the record it gives you.';
            out.appendChild(recordCard('DKIM (per platform)', 'selector._domainkey.' + domain, 'TXT or CNAME',
                'v=DKIM1; k=rsa; p=<the public key your provider gives you>',
                'Never invent this value — each platform generates its own key. Typical selectors: ' + dkimNote));

            /* ---- DMARC ------------------------------------------------------ */
            var d = ['v=DMARC1'];
            if (stage === 'monitor') d.push('p=none');
            else if (stage === 'quarantine') { d.push('p=quarantine'); d.push('sp=quarantine'); d.push('pct=25'); }
            else { d.push('p=reject'); d.push('sp=reject'); }
            if (rua) d.push('rua=mailto:' + rua);
            d.push('fo=1');
            if (strict) { d.push('adkim=s'); d.push('aspf=s'); }
            var dmarc = d.join('; ') + ';';

            out.appendChild(recordCard('DMARC', '_dmarc.' + domain, 'TXT', dmarc,
                stage === 'quarantine'
                    ? 'Raise pct to 50, then 100, waiting a few days and reading the reports between each step.'
                    : (stage === 'reject' ? 'Only publish this once a full reporting cycle at quarantine/pct=100 was clean.'
                        : 'Completely safe: p=none changes nothing about delivery, it only asks for reports.')));

            /* ---- warnings --------------------------------------------------- */
            if (rua && !RE_EMAIL.test(rua)) {
                warn.appendChild(msg('warn', '⚠️', 'The report address does not look like a valid email address.'));
            } else if (rua && domain && rua.split('@')[1] !== domain) {
                warn.appendChild(msg('warn', '⚠️', 'Your rua address is on a different domain (' + rua.split('@')[1] + '). That domain must publish ' +
                    domain + '._report._dmarc.' + rua.split('@')[1] + ' TXT "v=DMARC1" or you will never receive a single report.'));
            }
            if (!rua) warn.appendChild(msg('bad', '⛔', 'Without a rua address you get no reports, and without reports you are guessing. Add one before you go further.'));
            if (lookups > 10) warn.appendChild(msg('bad', '⛔', 'Estimated ' + lookups + ' DNS lookups — over the limit of 10. SPF will return permerror and be ignored. Remove providers you no longer use, or replace an include with the ip4: ranges behind it.'));
            else if (lookups > 7) warn.appendChild(msg('warn', '⚠️', 'Estimated ' + lookups + ' of 10 DNS lookups. You are close to the ceiling — adding one more provider may break SPF.'));
            if (!terms.length) warn.appendChild(msg('warn', '⚠️', 'No senders selected, so this record says “nobody may send as me”. That is correct for a parked domain — tick the parked option — but wrong for a domain you send from.'));
            if (stage === 'reject' && !strict) warn.appendChild(msg('info', 'ℹ️', 'Relaxed alignment (the default) lets subdomains align with the parent. That is usually what you want; strict alignment is a final polish, not a starting point.'));
            if (strict) warn.appendChild(msg('warn', '⚠️', 'Strict alignment means mail signed as mail.' + domain + ' no longer aligns with ' + domain + '. Verify every stream signs with the exact domain first.'));
            if (stage !== 'monitor') warn.appendChild(msg('warn', '⚠️', 'This stage can affect delivery of your own mail. Do not publish it until DMARC reports show every legitimate sender aligned.'));
            warn.appendChild(msg('info', 'ℹ️', 'Lookup counts and include: values are estimates from public documentation. Confirm both against your provider’s current instructions before publishing.'));
        }

        render();
    }

    /* ====================================================================== *
     * 5. Record inspector
     * ====================================================================== */
    var SPF_MECH = {
        all: 'Matches everything. Must be the last term — anything after it is ignored.',
        include: 'Also accept whatever this domain’s SPF record accepts. Costs one DNS lookup plus everything nested inside it.',
        a: 'Accept the IP addresses this domain’s A/AAAA records resolve to. Costs one lookup.',
        mx: 'Accept the IP addresses of this domain’s MX (incoming mail) hosts. Costs at least one lookup — and your inbound servers are rarely your outbound ones.',
        ip4: 'Accept this IPv4 address or range. Costs no DNS lookup.',
        ip6: 'Accept this IPv6 address or range. Costs no DNS lookup.',
        ptr: 'Match by reverse DNS. Deprecated by RFC 7208 — slow, unreliable and should be removed.',
        exists: 'Match if a macro-expanded name resolves. Advanced, costs a lookup.'
    };
    var SPF_QUAL = { '+': 'Pass (allow)', '-': 'Fail (reject)', '~': 'SoftFail (accept but mark)', '?': 'Neutral (no opinion)' };
    var SPF_LOOKUP_MECH = ['include', 'a', 'mx', 'ptr', 'exists', 'redirect'];

    var DMARC_TAGS = {
        v: function (v) { return v === 'DMARC1' ? 'Version marker — correct.' : 'Version must be exactly DMARC1; “' + v + '” makes the whole record invalid.'; },
        p: function (v) {
            if (v === 'none') return 'Monitor only. Nothing is blocked — you are collecting evidence. Safe, but it protects nobody yet.';
            if (v === 'quarantine') return 'Failing mail should be treated as suspicious, normally delivered to the junk folder.';
            if (v === 'reject') return 'Failing mail should be refused outright. This is full protection against forgery of your exact domain.';
            return 'Invalid policy “' + v + '” — must be none, quarantine or reject.';
        },
        sp: function (v) { return 'Subdomain policy: ' + v + '. Without this tag, subdomains inherit p. Set it explicitly — attackers reach for invoices.yourdomain.com.'; },
        rua: function (v) { return 'Daily aggregate XML reports go to ' + v + '. If that address is on another domain, that domain must publish an authorisation record or the reports are never sent.'; },
        ruf: function (v) { return 'Forensic/failure reports (copies of failing messages) go to ' + v + '. Few receivers send these, and they can contain personal data — check your privacy position first.'; },
        fo: function (v) { return 'Failure-report trigger “' + v + '”. 0 = only when everything fails, 1 = when any check fails (most useful), d = DKIM failure, s = SPF failure.'; },
        pct: function (v) {
            var n = parseInt(v, 10);
            if (isNaN(n) || n < 1 || n > 100) return 'Invalid percentage “' + v + '” — must be 1–100.';
            return 'Apply the policy to ' + n + '% of failing mail. The remaining ' + (100 - n) + '% is treated one step softer. Your ramp-up dimmer switch.';
        },
        adkim: function (v) { return v === 's' ? 'DKIM alignment is STRICT: the signing domain must equal the From domain exactly.' : 'DKIM alignment is relaxed: a subdomain counts as a match. This is the default and usually correct.'; },
        aspf: function (v) { return v === 's' ? 'SPF alignment is STRICT: the envelope domain must equal the From domain exactly.' : 'SPF alignment is relaxed: a subdomain counts as a match. This is the default and usually correct.'; },
        ri: function (v) { return 'Requested reporting interval: ' + v + ' seconds. In practice everyone sends daily (86400) regardless.'; },
        rf: function (v) { return 'Requested failure report format (' + v + '). Almost always afrf; safe to leave out.'; }
    };

    var DKIM_TAGS = {
        v: function (v) { return v === 'DKIM1' ? 'Version marker — correct.' : 'Should be DKIM1.'; },
        k: function (v) { return 'Key type: ' + v + '. rsa is universally supported; ed25519 is smaller but not yet understood everywhere — publish it alongside RSA, not instead of it.'; },
        h: function (v) { return 'Acceptable hash algorithms: ' + v + '. sha256 is the modern choice; sha1 is obsolete.'; },
        t: function (v) {
            if (v.indexOf('y') > -1) return 'TEST MODE (t=y): receivers are told to ignore failures of this key. Useful for a week, dangerous to leave behind.';
            if (v.indexOf('s') > -1) return 'Strict (t=s): this key may not be used by subdomains.';
            return 'Flags: ' + v;
        },
        s: function (v) { return 'Service type: ' + v + '. “email” or “*”.'; },
        n: function (v) { return 'Human-readable note: ' + v; },
        p: function (v) {
            if (!v) return 'REVOKED — an empty public key means this selector is deliberately dead. Correct after rotating a key away, alarming otherwise.';
            var size = v.length < 250 ? 'about 1024-bit' : (v.length < 500 ? 'about 2048-bit' : 'large (3072-bit or more)');
            return 'The public key (' + v.length + ' base64 characters — ' + size + '). 2048-bit is the modern minimum for new keys.';
        }
    };

    function explainRow(token, text) {
        var li = el('li');
        li.appendChild(el('span', 'tok', token));
        li.appendChild(el('span', null, text));
        return li;
    }

    function inspect(raw) {
        var out = $('#i-out');
        clear(out);
        var value = (raw || '').trim().replace(/\s+/g, ' ');
        // Tolerate a full DNS answer line: name TTL IN TXT "…"
        var quoted = value.match(/"([^"]*)"/g);
        if (quoted && quoted.length) value = quoted.map(function (q) { return q.slice(1, -1); }).join('');
        value = value.trim();

        if (!value) { out.appendChild(msg('info', 'ℹ️', 'Paste a record first.')); return; }

        var lower = value.toLowerCase();
        if (lower.indexOf('v=spf1') === 0) return inspectSPF(value, out);
        if (lower.indexOf('v=dmarc1') === 0) return inspectTagged(value, out, 'DMARC', DMARC_TAGS);
        if (lower.indexOf('v=dkim1') === 0) return inspectTagged(value, out, 'DKIM', DKIM_TAGS);
        if (lower.indexOf('v=bimi1') === 0) {
            out.appendChild(msg('info', '🎨', 'A BIMI record. l= is the HTTPS URL of your SVG Tiny PS logo; a= is the Verified Mark Certificate that Gmail and Apple require. BIMI only takes effect once DMARC is at quarantine or reject.'));
            return;
        }
        if (lower.indexOf('version: stsv1') === 0 || lower.indexOf('version=stsv1') === 0 || lower.indexOf('v=stsv1') === 0) {
            out.appendChild(msg('info', '🔐', 'An MTA-STS record or policy. Run mode: testing first and read your TLS-RPT reports; mode: enforce with a wrong MX list will stop your incoming mail.'));
            return;
        }
        if (lower.indexOf('v=tlsrptv1') === 0) {
            out.appendChild(msg('info', '📊', 'A TLS-RPT record — senders will report failed TLS connections to the rua address. Zero risk, always worth having.'));
            return;
        }
        out.appendChild(msg('warn', '🤔', 'That does not start with a recognised version tag (v=spf1, v=DMARC1, v=DKIM1, v=BIMI1, v=TLSRPTv1). If it is meant to be an SPF record, note that v=spf1 must be the very first thing in the value.'));
    }

    function inspectSPF(value, out) {
        var terms = value.split(/\s+/);
        var list = el('ul', 'explain');
        var lookups = 0, sawAll = false, afterAll = 0, hasPtr = false, allQual = null;

        terms.forEach(function (t, i) {
            if (i === 0) { list.appendChild(explainRow('v=spf1', 'This is an SPF version 1 record. Must be first, and must appear exactly once.')); return; }
            if (sawAll) afterAll++;
            var qual = '+';
            var body = t;
            if (/^[+\-~?]/.test(t)) { qual = t.charAt(0); body = t.slice(1); }
            var name = body.split(/[:=/]/)[0].toLowerCase();
            var arg = body.slice(name.length).replace(/^[:=]/, '');

            if (name === 'redirect') {
                lookups += 1;
                list.appendChild(explainRow(t, 'Hand evaluation over to ' + arg + '’s SPF record entirely. Only used when there is no “all” term — easy to confuse with include:. Costs one lookup.'));
                return;
            }
            if (SPF_LOOKUP_MECH.indexOf(name) > -1) lookups += 1;
            if (name === 'ptr') hasPtr = true;
            if (name === 'all') { sawAll = true; allQual = qual; }

            var desc = SPF_MECH[name];
            if (!desc) {
                list.appendChild(explainRow(t, 'Unrecognised term. Anything SPF cannot parse makes the whole record a permanent error, which most receivers treat as having no SPF at all.'));
                return;
            }
            var q = SPF_QUAL[qual] || '';
            list.appendChild(explainRow(t, q + ' — ' + desc + (arg ? ' (' + arg + ')' : '')));
        });

        var card = el('div', 'rec');
        var head = el('div', 'rec-head');
        head.appendChild(el('strong', null, 'SPF record'));
        head.appendChild(el('span', 'meta', terms.length - 1 + ' terms · ' + lookups + ' DNS lookups (not counting nesting)'));
        card.appendChild(head);
        card.appendChild(list);
        out.appendChild(card);

        if (allQual === '+') out.appendChild(msg('bad', '⛔', 'This record ends in +all. It authorises every server on the internet to send mail as this domain — the single worst thing an SPF record can say. Remove it today.'));
        if (allQual === '?') out.appendChild(msg('warn', '⚠️', '?all is Neutral: it explicitly states you have no opinion. Functionally the same as publishing nothing.'));
        if (allQual === '~') out.appendChild(msg('info', 'ℹ️', '~all (softfail) is the right place to start, but it is a waypoint. Once your DMARC reports are clean, move to -all.'));
        if (allQual === '-') out.appendChild(msg('ok', '✅', '-all is the goal: anything not listed is declared forged.'));
        if (!sawAll) out.appendChild(msg('warn', '⚠️', 'There is no “all” term. Evaluation ends in Neutral, so the record constrains nothing. Add ~all or -all at the end.'));
        if (afterAll) out.appendChild(msg('warn', '⚠️', afterAll + ' term(s) appear after “all” and are silently ignored. Everything you want to authorise must come before it.'));
        if (hasPtr) out.appendChild(msg('warn', '⚠️', 'The ptr mechanism is deprecated: it is slow, some receivers ignore it, and it can even cause the record to be skipped. Replace it with ip4:/ip6: or include:.'));
        if (lookups > 10) out.appendChild(msg('bad', '⛔', lookups + ' direct DNS lookups — already over the limit of 10 before counting anything nested inside those includes. This record almost certainly evaluates to permerror.'));
        else if (lookups >= 8) out.appendChild(msg('warn', '⚠️', lookups + ' direct DNS lookups. Each include: also drags in whatever it nests, so the real total is higher. Verify with a lookup-count checker.'));
        else out.appendChild(msg('info', 'ℹ️', lookups + ' direct DNS lookups here. Remember the true count is recursive — a single include: can cost four or five on its own.'));
        out.appendChild(msg('info', '💡', 'SPF only validates the hidden envelope sender. On its own it protects nothing your readers can see — it needs DMARC to mean anything.'));
    }

    function inspectTagged(value, out, kind, dict) {
        var parts = value.split(';').map(function (s) { return s.trim(); }).filter(Boolean);
        var list = el('ul', 'explain');
        var seen = {};
        parts.forEach(function (part) {
            var eq = part.indexOf('=');
            if (eq < 0) { list.appendChild(explainRow(part, 'Not a tag=value pair — likely a syntax error.')); return; }
            var tag = part.slice(0, eq).trim();
            var val = part.slice(eq + 1).trim();
            seen[tag.toLowerCase()] = val;
            var fn = dict[tag.toLowerCase()];
            list.appendChild(explainRow(tag + '=' + (val.length > 44 ? val.slice(0, 44) + '…' : val),
                fn ? fn(val) : 'Unknown tag for a ' + kind + ' record — receivers will ignore it, but check for a typo.'));
        });

        var card = el('div', 'rec');
        var head = el('div', 'rec-head');
        head.appendChild(el('strong', null, kind + ' record'));
        head.appendChild(el('span', 'meta', parts.length + ' tags'));
        card.appendChild(head);
        card.appendChild(list);
        out.appendChild(card);

        if (kind === 'DMARC') {
            if (!seen.p) out.appendChild(msg('bad', '⛔', 'No p= tag. A DMARC record without a policy is invalid and will be ignored entirely.'));
            if (seen.p === 'none') out.appendChild(msg('warn', '⚠️', 'p=none protects nobody — it is monitoring only. It is the correct first step, but it is a step, not a destination.'));
            if (seen.p === 'reject') out.appendChild(msg('ok', '✅', 'p=reject is full protection against forgery of this exact domain. Make sure sp= is set too, or check that subdomains inherit as you expect.'));
            if (!seen.rua) out.appendChild(msg('warn', '⚠️', 'No rua= address, so you receive no reports. You will have no idea who is sending as you, or what your policy is doing.'));
            if (!seen.sp && seen.p && seen.p !== 'none') out.appendChild(msg('info', 'ℹ️', 'No sp= tag: subdomains inherit p=' + seen.p + '. That is usually fine, but state it explicitly so a future edit cannot open a hole.'));
            if (seen.sp === 'none' && seen.p !== 'none') out.appendChild(msg('bad', '⛔', 'sp=none while p=' + seen.p + ' leaves every subdomain wide open. Attackers will simply use billing.yourdomain.com.'));
            if (seen.pct && parseInt(seen.pct, 10) < 100) out.appendChild(msg('info', 'ℹ️', 'pct=' + seen.pct + ' means most failing mail is still let through. Correct during a ramp; make sure someone owns the date it reaches 100.'));
            if (seen.ruf) out.appendChild(msg('warn', '⚠️', 'ruf= is enabled. Failure reports can contain message content and recipient addresses — treat that as a privacy/GDPR decision, not a technical one.'));
            var order = value.replace(/\s/g, '').toLowerCase();
            if (order.indexOf('v=dmarc1;p=') !== 0) out.appendChild(msg('warn', '⚠️', 'Strictly, v= must be the first tag and p= the second. Some parsers are forgiving; do not rely on it.'));
        }
        if (kind === 'DKIM') {
            if (seen.p === '') out.appendChild(msg('warn', '⚠️', 'The key is revoked (empty p=). If you did not just rotate this selector away, something is wrong.'));
            if (seen.t && seen.t.indexOf('y') > -1) out.appendChild(msg('warn', '⚠️', 't=y is test mode — receivers are asked to ignore failures. Remove it once you are confident, or the signature is decorative.'));
            if (seen.p && seen.p.length && seen.p.length < 250) out.appendChild(msg('warn', '⚠️', 'This looks like a 1024-bit key. Regenerate at 2048-bit if your platform allows it.'));
            if (seen.p && /[^A-Za-z0-9+/=]/.test(seen.p)) out.appendChild(msg('bad', '⛔', 'The key contains characters that are not valid base64 — the record was probably truncated or mangled by the DNS panel. Long TXT values must be split into quoted chunks of 255 characters or fewer.'));
            out.appendChild(msg('info', '💡', 'A DKIM record in DNS says nothing about whether mail is actually being signed. Send a test message and check that the header shows dkim=pass with header.d= your own domain.'));
        }
    }

    function initInspector() {
        var go = $('#i-go'), input = $('#i-input');
        if (!go || !input) return;
        go.addEventListener('click', function () { inspect(input.value); });
        input.addEventListener('keydown', function (e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') inspect(input.value);
        });
        $$('.sample').forEach(function (b) {
            b.addEventListener('click', function () { input.value = b.dataset.sample; inspect(input.value); });
        });
    }

    /* ====================================================================== *
     * 6. Opt-in DNS-over-HTTPS lookup (Cloudflare)
     * ====================================================================== */
    var DOH = [
        { name: 'Cloudflare', url: 'https://cloudflare-dns.com/dns-query?type=TXT&name=' },
        { name: 'Google', url: 'https://dns.google/resolve?type=TXT&name=' }
    ];

    function parseTxt(json) {
        var answers = (json && json.Answer) || [];
        return answers.map(function (a) {
            var d = String(a.data || '');
            var q = d.match(/"([^"]*)"/g);
            return q ? q.map(function (s) { return s.slice(1, -1); }).join('') : d.replace(/^"|"$/g, '');
        }).filter(Boolean);
    }

    function dohTxt(name, idx) {
        idx = idx || 0;
        if (idx >= DOH.length) {
            return Promise.reject(new Error('no resolver could be reached — this network, a proxy or a browser extension is probably blocking DNS-over-HTTPS. The rest of the page works offline; use dig, nslookup or an online DNS tool instead.'));
        }
        return fetch(DOH[idx].url + encodeURIComponent(name), { headers: { accept: 'application/dns-json' } })
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(parseTxt)
            .catch(function () { return dohTxt(name, idx + 1); });
    }

    function initLookup() {
        var go = $('#l-go');
        if (!go) return;
        go.addEventListener('click', function () {
            var out = $('#l-out');
            clear(out);
            var domain = ($('#l-domain').value || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
            var sel = ($('#l-sel').value || '').trim().toLowerCase();
            if (!RE_DOMAIN.test(domain)) { out.appendChild(msg('bad', '⛔', 'Enter a valid domain name, for example example.com.')); return; }
            if (sel && !/^[a-z0-9_-]{1,63}$/.test(sel)) { out.appendChild(msg('bad', '⛔', 'That selector contains characters a DNS label cannot hold.')); return; }

            out.appendChild(msg('info', '⏳', 'Asking a public DNS-over-HTTPS resolver for the TXT records of ' + domain + '…'));
            var queries = [
                { label: 'SPF', name: domain, hint: 'looking for a value starting with v=spf1' },
                { label: 'DMARC', name: '_dmarc.' + domain, hint: 'looking for a value starting with v=DMARC1' }
            ];
            if (sel) queries.push({ label: 'DKIM', name: sel + '._domainkey.' + domain, hint: 'looking for a value starting with v=DKIM1' });

            Promise.all(queries.map(function (q) {
                return dohTxt(q.name).then(
                    function (recs) { return { q: q, recs: recs }; },
                    function (err) { return { q: q, err: err.message || 'lookup failed' }; }
                );
            })).then(function (results) {
                clear(out);
                results.forEach(function (r) {
                    if (r.err) { out.appendChild(msg('bad', '⛔', r.q.label + ' (' + r.q.name + '): ' + r.err)); return; }                    var wanted = r.recs.filter(function (t) {
                        var l = t.toLowerCase();
                        return r.q.label === 'SPF' ? l.indexOf('v=spf1') === 0
                            : r.q.label === 'DMARC' ? l.indexOf('v=dmarc1') === 0
                                : l.indexOf('v=dkim1') === 0 || l.indexOf('k=') === 0 || l.indexOf('p=') === 0;
                    });
                    if (!wanted.length) {
                        out.appendChild(msg('warn', '⚠️', 'No ' + r.q.label + ' record found at ' + r.q.name +
                            (r.q.label === 'DKIM' ? ' — the selector is probably different. Send yourself a message and read s= in the DKIM-Signature header.' : '.')));
                        return;
                    }
                    if (wanted.length > 1 && r.q.label === 'SPF') {
                        out.appendChild(msg('bad', '⛔', wanted.length + ' SPF records found on ' + r.q.name + '. More than one is a permanent error — SPF stops working entirely. Merge them into a single record.'));
                    }
                    wanted.forEach(function (t) {
                        var card = recordCard(r.q.label + ' found', r.q.name, 'TXT', t, null);
                        var btn = el('button', 'btn', 'Explain this →');
                        btn.type = 'button';
                        btn.addEventListener('click', function () {
                            $('#i-input').value = t;
                            inspect(t);
                            $('#i-out').scrollIntoView({ block: 'center' });
                        });
                        var foot = el('div', 'rec-note');
                        foot.appendChild(btn);
                        card.appendChild(foot);
                        out.appendChild(card);
                    });
                });
                out.appendChild(msg('info', 'ℹ️', 'These are public DNS records; anyone can read them. A DNS record existing does not prove mail is actually signed — always confirm with a test message.'));
            });
        });
    }

    /* ====================================================================== *
     * 7. Spoofing triage wizard
     * ====================================================================== */
    var TRIAGE = {
        start: {
            q: 'Look at the From line of the suspicious message. What is actually there?',
            opts: [
                { t: 'Exactly our own domain (name@ourdomain.com)', go: 'auth' },
                { t: 'A domain that only looks like ours (an extra letter, a hyphen, a different ending)', go: 'lookalike' },
                { t: 'Our name or a colleague’s name, but a Gmail/Outlook/other outside address', go: 'display' },
                { t: 'I only have a screenshot / I cannot see the real address', go: 'evidence' }
            ]
        },
        auth: {
            q: 'Open the raw headers. What does the Authentication-Results line say?',
            opts: [
                { t: 'dmarc=fail, or spf=fail / dkim=fail', go: 'forged' },
                { t: 'Everything passes (spf=pass, dkim=pass, dmarc=pass)', go: 'sent' },
                { t: 'There is no Authentication-Results line, or I cannot get the headers', go: 'evidence' }
            ]
        },
        sent: {
            q: 'It authenticated as us, so it probably really left our systems. Check the mailbox it claims to come from — is the message in Sent Items, are there sign-ins from unusual places, or inbox rules nobody created?',
            opts: [
                { t: 'Yes — or something there looks wrong', go: 'compromised' },
                { t: 'No: nothing in Sent Items, sign-in logs clean, no strange rules', go: 'replyto' }
            ]
        },
        replyto: {
            q: 'Compare the Reply-To address and the link destinations with the From address.',
            opts: [
                { t: 'They point somewhere else', go: 'replyhijack' },
                { t: 'They match — it really does look like our own mail', go: 'internal' }
            ]
        }
    };

    var OUTCOMES = {
        forged: {
            title: 'Type 1 — your domain was forged. This one you can stop for good.',
            cls: 'good',
            lead: 'Someone wrote your domain into the From header of mail they sent from their own infrastructure. Authentication caught it, which means the receiver already knows it is fake — but a p=none policy tells them to deliver it anyway.',
            steps: [
                'Check your _dmarc record now. If it says p=none, this is the moment to move to p=quarantine, and to p=reject if your reports are already clean.',
                'If you have no DMARC record at all, publish v=DMARC1; p=none; rua=mailto:dmarc@yourdomain; fo=1; today and start the ramp described above.',
                'Pull the sending IPs out of the headers and look for them in your last few DMARC reports — that tells you how long this has been going on and how big it is.',
                'Warn the recipients that were targeted, and publish a short notice if customers are involved.',
                'Nothing was breached: your systems are not involved at all. Say so clearly, so nobody panics about a “hack”.'
            ]
        },
        lookalike: {
            title: 'Type 3 — a lookalike domain. DMARC cannot touch it.',
            cls: 'warn',
            lead: 'The mail is perfectly authenticated — for a domain the attacker owns. No record you publish on your domain has any effect on theirs. You fight this with abuse reports and filtering.',
            steps: [
                'Write down the exact domain, when it was registered, its registrar, its DNS host and the IP of any web page it points at.',
                'File abuse reports with the registrar and the hosting provider, attaching the full headers and a timestamp. Phishing pages at mainstream hosts often disappear within hours.',
                'Submit any URL to Google Safe Browsing, Microsoft’s report page, Netcraft and the APWG so browsers start warning people.',
                'Block the domain in your own mail filter, and add a rule that flags near-miss variants of your name arriving from outside.',
                'Tell customers and suppliers what the fake domain looks like — spell it out, letter by letter.',
                'Consider registering the two or three most convincing variants yourself, and set up monitoring for newly registered similar names.'
            ]
        },
        display: {
            title: 'Type 2 — a display-name spoof. Technically flawless, humanly deceptive.',
            cls: 'warn',
            lead: 'The attacker put a familiar name in front of an address they legitimately control. Every check passes, because nothing is being forged — and phones show only the friendly name.',
            steps: [
                'Nothing in SPF, DKIM or DMARC prevents this. Do not spend the day on DNS.',
                'Turn on an external-sender warning banner in your mail platform if you have not already.',
                'Add a transport rule that flags inbound mail whose display name matches one of your executives or finance staff but comes from outside.',
                'Tell staff what it looks like, with a screenshot, and remind them that a name is not an address.',
                'Fix the process behind it: bank-detail changes and unusual payments must be confirmed by phone on a number already on file.'
            ]
        },
        compromised: {
            title: 'Type 5 — treat this as an account compromise, right now.',
            cls: 'bad',
            lead: 'If the mail genuinely came from your tenant, the attacker has a session or credentials. This is an incident, not an email configuration question, and the clock matters.',
            steps: [
                'Reset the password AND revoke all active sessions and refresh tokens — a password reset alone does not log the attacker out.',
                'Delete any inbox rules or forwarders you did not create. Look especially for rules moving mail to RSS Feeds, Notes or Deleted Items, and for external auto-forwarding.',
                'Review connected OAuth applications and app passwords; remove anything unfamiliar.',
                'Re-register MFA for that user and check whether the same password was reused elsewhere.',
                'Preserve evidence first: export the messages with full headers, and take copies of the sign-in logs and the mailbox rules before you change anything.',
                'Run a message trace to see what else was sent from the account, and to whom.',
                'If personal data was reachable, involve your DPO — a compromised mailbox is very often a notifiable breach with a 72-hour clock.',
                'If money has moved, call the bank immediately; recall is only realistic in the first hours.'
            ]
        },
        replyhijack: {
            title: 'Type 4 — a Reply-To hijack.',
            cls: 'warn',
            lead: 'The visible sender looks right, but your answer would go somewhere else. It is usually combined with a display-name spoof or a lookalike domain.',
            steps: [
                'Confirm which domain the Reply-To and the links actually point at, and treat that as the real attacker domain — then follow the lookalike steps for it.',
                'Add a filter rule that flags messages whose Reply-To domain differs from the From domain.',
                'Warn anyone who may have replied, and check whether a conversation is already running.',
                'Reinforce the habit: check the recipient after pressing Reply, before typing anything about money.'
            ]
        },
        internal: {
            title: 'It authenticates, the mailbox looks clean — dig one level deeper.',
            cls: 'warn',
            lead: 'Everything says this is your mail, yet it should not exist. Two explanations remain.',
            steps: [
                'A third-party platform you authorised is being abused — a marketing tool, a form, a CRM or a compromised vendor account. Check who else can send as you, and rotate that platform’s credentials and API keys.',
                'Or the mailbox really is compromised and the attacker cleaned up after themselves. Deleted Items being empty is not evidence of innocence. Check sign-in logs for impossible travel and legacy protocol use.',
                'Look at the Message-ID and the earliest Received header — they usually name the real sending platform.',
                'While you investigate, restrict the affected sender: rotate the credentials or pause the platform.',
                'Paste the whole message into the header analyzer next door; the relay path is often the giveaway.'
            ]
        },
        evidence: {
            title: 'First get real evidence — a screenshot proves nothing.',
            cls: 'warn',
            lead: 'Every decision below depends on the headers. Without them you are guessing, and you may spend a day fixing DNS for an attack that never touched your domain.',
            steps: [
                'Ask the recipient to forward the message AS AN ATTACHMENT (.eml/.msg), or to send you “Show original” from Gmail or “View message source” from Outlook.',
                'If it went to one of your own users, pull the copy from the mail platform yourself with a message trace.',
                'Read three things: the full From address, the Return-Path and the Authentication-Results line.',
                'Then come back and answer the first question again — the answer determines everything else.',
                'In the meantime, tell people not to reply, not to click and not to pay, and keep the message rather than deleting it.'
            ]
        }
    };

    function initTriage() {
        var qBox = $('#triage-q'), oBox = $('#triage-out'), reset = $('#triage-reset');
        if (!qBox) return;
        var trail = [];

        function showQuestion(key) {
            clear(qBox); clear(oBox);
            var node = TRIAGE[key];
            if (trail.length) {
                qBox.appendChild(el('p', 'triage-crumbs', 'Question ' + (trail.length + 1)));
            }
            qBox.appendChild(el('h4', null, node.q));
            var opts = el('div', 'triage-opts');
            node.opts.forEach(function (o) {
                var b = el('button', null, o.t);
                b.type = 'button';
                b.addEventListener('click', function () {
                    trail.push(key);
                    if (TRIAGE[o.go]) showQuestion(o.go); else showOutcome(o.go);
                });
                opts.appendChild(b);
            });
            qBox.appendChild(opts);
            reset.hidden = trail.length === 0;
        }

        function showOutcome(key) {
            var o = OUTCOMES[key];
            clear(qBox); clear(oBox);
            if (!o) return;
            var v = el('div', 'verdict ' + o.cls);
            v.appendChild(el('strong', null, o.title));
            oBox.appendChild(v);
            oBox.appendChild(el('p', null, o.lead));
            var ul = el('ul');
            o.steps.forEach(function (s) { ul.appendChild(el('li', null, s)); });
            oBox.appendChild(ul);
            var foot = el('p', 'tip', 'Then work through the runbook below — the phases apply to every type. If money has already moved, call the bank before anything else.');
            oBox.appendChild(foot);
            reset.hidden = false;
        }

        reset.addEventListener('click', function () { trail = []; showQuestion('start'); });
        showQuestion('start');
    }

    /* ====================================================================== *
     * 8. Checklist
     * ====================================================================== */
    var CHECKLIST = [
        { group: 'Discovery', items: [
            ['inv', 'Listed every system that sends mail as our domain (incl. finance, HR, marketing tools, printers)'],
            ['dns', 'Have administrative access to the DNS zone'],
            ['ttl', 'Lowered TTLs to ~300 s before the change window']
        ]},
        { group: 'SPF', items: [
            ['spf1', 'Exactly one v=spf1 TXT record on the apex'],
            ['spf2', 'Every legitimate sender is authorised'],
            ['spf3', 'Recursive DNS lookup count is 10 or fewer'],
            ['spf4', 'No ptr, no +all'],
            ['spf5', 'Ends in ~all today, -all once reports are clean']
        ]},
        { group: 'DKIM', items: [
            ['dk1', 'DKIM enabled on every sending platform'],
            ['dk2', 'Every signature shows d= our own domain, not the vendor’s'],
            ['dk3', 'Keys are 2048-bit where the platform allows'],
            ['dk4', 'No t=y test mode left behind'],
            ['dk5', 'A key rotation date is in the calendar']
        ]},
        { group: 'DMARC', items: [
            ['dm1', '_dmarc record published with rua and fo=1'],
            ['dm2', 'Reports are actually arriving and someone reads them'],
            ['dm3', 'External reporting address authorised with a _report._dmarc record (if applicable)'],
            ['dm4', 'Every legitimate source is aligned in the reports'],
            ['dm5', 'Moved through quarantine with pct ramp'],
            ['dm6', 'p=reject and sp=reject published'],
            ['dm7', 'Rollback plan agreed and TTL kept low during the ramp']
        ]},
        { group: 'Everything else you own', items: [
            ['pk1', 'Every non-sending domain has v=spf1 -all, p=reject, null MX and a revoked DKIM wildcard'],
            ['pk2', 'Subdomains audited for stray _dmarc records'],
            ['pk3', 'Bulk mail moved to its own subdomain']
        ]},
        { group: 'Hardening & process', items: [
            ['h1', 'DNSSEC enabled at the registrar'],
            ['h2', 'MTA-STS (testing → enforce) and TLS-RPT published'],
            ['h3', 'Reverse DNS correct for any self-hosted MTA'],
            ['h4', 'External-sender banner and executive display-name rule in place'],
            ['h5', 'Bank-detail changes require a call-back to a known number'],
            ['h6', 'Staff know how to report a suspicious mail, and to whom'],
            ['h7', 'Quarterly review of SPF lookups and unused vendor includes booked']
        ]}
    ];

    function initChecklist() {
        var list = $('#ck-list');
        if (!list) return;
        var state = {};
        try { state = JSON.parse(store(K_CHECK) || '{}') || {}; } catch (e) { state = {}; }

        var total = 0;
        CHECKLIST.forEach(function (grp) {
            list.appendChild(el('div', 'ck-group', grp.group));
            grp.items.forEach(function (it) {
                total++;
                var lab = el('label', 'ck-item');
                var cb = el('input'); cb.type = 'checkbox'; cb.checked = !!state[it[0]];
                if (cb.checked) lab.classList.add('done');
                cb.addEventListener('change', function () {
                    state[it[0]] = cb.checked;
                    lab.classList.toggle('done', cb.checked);
                    store(K_CHECK, JSON.stringify(state));
                    update();
                });
                lab.appendChild(cb);
                lab.appendChild(el('span', null, it[1]));
                list.appendChild(lab);
            });
        });

        function update() {
            var done = 0;
            Object.keys(state).forEach(function (k) { if (state[k]) done++; });
            var bar = $('#ck-bar'), cnt = $('#ck-count');
            if (bar) bar.style.width = (total ? (done / total * 100) : 0).toFixed(1) + '%';
            if (cnt) cnt.textContent = done + ' / ' + total;
        }

        $('#ck-reset').addEventListener('click', function () {
            state = {};
            store(K_CHECK, '{}');
            $$('#ck-list input').forEach(function (c) { c.checked = false; c.parentNode.classList.remove('done'); });
            update();
        });
        update();
    }

    /* ====================================================================== *
     * Boot
     * ====================================================================== */
    function boot() {
        initTheme();
        initNav();
        initBuilder();
        initInspector();
        initLookup();
        initTriage();
        initChecklist();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
