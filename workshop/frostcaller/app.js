/* ==========================================================================
   Frostcaller — workshop/frostcaller/app.js
   --------------------------------------------------------------------------
   A guide, not an app: everything below is content data + a small renderer.
   No dependencies, no build step, no network calls.

   Structure
     PARTS     → the shopping bench (prices are rough EUR bands)
     PATHS     → the five routes, each with its own numbered steps
     CHAPTERS  → shared knowledge every path links into
     FAQ       → the awkward questions
     QUESTIONS → the picker, which scores PATHS and writes a shopping list

   Rendering rule: nothing here uses innerHTML. Text goes in through
   textContent, and the tiny `rich()` formatter below only ever produces
   <code>, <strong> and vetted <a> nodes. Keep it that way.
   ========================================================================== */

'use strict';

const PART = Object.fromEntries(PARTS.map(p => [p.id, p]));

/* Reading order: easiest builds first, the risky one last. */
const PATH_ORDER = ['wand', 'bench', 'ready', 'djinn', 'whisper', 'hijack'];
PATHS.sort((a, b) => PATH_ORDER.indexOf(a.id) - PATH_ORDER.indexOf(b.id));

const PATH = Object.fromEntries(PATHS.map(p => [p.id, p]));

/* Which drawer capability makes a shopping-list part unnecessary. */
const PART_CAP = {
    atom: 'm5', stickc: 'm5', esp32: 'esp32', d1mini: 'esp8266',
    ky005: 'irled', blaster: 'irled', irrx: 'irrx', dupont: 'wires',
    psu: 'psu', m5ir: 'irled', tuyair: 'tuyapuck', zbir: 'zigbeeir',
    broadlink: 'broadlink', athom: 'readymade', th: 'th', plug: 'plug',
    zbdongle: 'zbcoord', serial: 'serial',
};

/* ── Where the words live ───────────────────────────────────────────────── */
/* PARTS, PATHS, INVENTORY, READYMADE, SOFTWARE, FLASH_ROUTES, FEATURES,
   BRANDS, CHAPTERS, FAQ and QUESTIONS are in data-guide.js. This file is the
   machinery; that one is the writing. Editing prose should never mean opening
   a file full of event listeners. */

/* ── Tiny safe renderer ──────────────────────────────────────────────────── */
/* `el`, `rich`, `para`, `safeUrl` and INLINE now live in text.js, shared with
   The Scribe so there is only one place a string can become an element. */

function list(kind, items, cls) {
    const l = el(kind, cls || null);
    items.forEach(i => l.appendChild(rich(el('li'), i)));
    return l;
}

function codeBlock(spec) {
    const wrap = el('div', 'code');
    const head = el('div', 'code-head');
    head.appendChild(el('span', 'code-label', spec.label || 'yaml'));
    const btn = el('button', 'copy-btn', 'Copy');
    btn.type = 'button';
    btn.addEventListener('click', () => copyText(spec.text, btn));
    head.appendChild(btn);
    const pre = el('pre');
    pre.appendChild(el('code', null, spec.text));
    wrap.append(head, pre);
    return wrap;
}

function brandTable() {
    const wrap = el('div', 'table-wrap');
    const table = el('table', 'brand-table');
    const thead = el('thead');
    const hr = el('tr');
    ['Your unit', 'platform:', 'Hears back'].forEach(h => hr.appendChild(el('th', null, h)));
    thead.appendChild(hr);
    const tbody = el('tbody');
    BRANDS.forEach(([name, plat, rx]) => {
        const tr = el('tr');
        tr.append(el('td', null, name), el('td', 'is-mono', plat), el('td', null, rx));
        tbody.appendChild(tr);
    });
    table.append(thead, tbody);
    wrap.appendChild(table);
    return wrap;
}

function renderBlocks(host, blocks) {
    blocks.forEach(b => {
        if (b.h) host.appendChild(rich(el('h4'), b.h));
        if (b.p) host.appendChild(para(b.p));
        if (b.ul) host.appendChild(list('ul', b.ul));
        if (b.ol) host.appendChild(list('ol', b.ol));
        if (b.code) host.appendChild(codeBlock(b.code));
        if (b.note) host.appendChild(para(b.note, 'step-note'));
        if (b.table) host.appendChild(brandTable());
        if (b.svg) {
            const fig = drawFigure(b.svg);
            if (fig) host.appendChild(fig);
        }
    });
}

/** Resolve a named drawing from diagrams.js, with a caption. */
function drawFigure(spec) {
    if (typeof svgWiring !== 'function') return null;
    const [kind, arg] = String(spec).split(':');
    let node = null;
    if (kind === 'wiring') node = svgWiring();
    else if (kind === 'board') node = svgBoard(arg);
    else if (kind === 'beam') node = svgBeam();
    if (!node) return null;
    const figure = el('figure', 'figure');
    figure.appendChild(node);
    return figure;
}

/* ── Paths ───────────────────────────────────────────────────────────────── */
function renderPaths() {
    const host = document.getElementById('pathList');
    if (!host) return;
    /* Re-rendering (a currency change, say) must not fold up what you were reading. */
    const wasOpen = new Set([...host.querySelectorAll('.path-head[aria-expanded="true"]')]
        .map(h => h.closest('.path').dataset.path));
    host.textContent = '';
    PATHS.forEach(p => {
        const card = el('article', 'path');
        card.id = 'p-' + p.id;
        card.dataset.path = p.id;

        /* head ------------------------------------------------------------ */
        const head = el('button', 'path-head');
        head.type = 'button';
        head.setAttribute('aria-expanded', 'false');
        head.setAttribute('aria-controls', 'body-' + p.id);
        head.appendChild(el('span', 'path-glyph', p.glyph));

        const mid = el('span');
        const nameRow = el('span', 'path-name');
        const tr = tc('path.' + p.id, null);
        nameRow.appendChild(document.createTextNode(tr ? tr[0] : p.name));
        mid.appendChild(nameRow);
        mid.appendChild(el('span', 'path-sub', tr ? tr[1] : p.sub));
        const meta = el('span', 'path-meta');
        meta.appendChild(el('span', 'tag cost', priceRange(p.low, p.high)));
        meta.appendChild(el('span', 'tag', tc('lvl.' + p.level, p.level)));
        meta.appendChild(el('span', 'tag', tc('time.' + p.time, p.time)));
        p.tags.forEach(x => meta.appendChild(el('span', 'tag ' + (x.c || ''), tc('tag.' + x.t, x.t))));
        mid.appendChild(meta);
        head.appendChild(mid);

        const toggle = el('span', 'path-toggle');
        toggle.appendChild(el('span', null, 'Steps'));
        toggle.appendChild(el('span', 'caret', '▾'));
        head.appendChild(toggle);
        card.appendChild(head);

        /* body ------------------------------------------------------------ */
        const body = el('div', 'path-body');
        body.id = 'body-' + p.id;
        body.hidden = true;

        body.appendChild(rich(el('p', 'ends'), tv('path.ends', { x: p.ends })));

        const pc = el('div', 'pro-con');
        const pros = el('div', 'pros');
        pros.appendChild(el('h4', null, t('path.pros')));
        pros.appendChild(list('ul', p.pros));
        const cons = el('div', 'cons');
        cons.appendChild(el('h4', null, t('path.cons')));
        cons.appendChild(list('ul', p.cons));
        pc.append(pros, cons);
        body.appendChild(pc);

        const shop = el('p', 'step-note');
        rich(shop, tv('path.need', { list: p.needs.map(id => PART[id].name).join(', ') }) +
            (p.extras && p.extras.length
                ? ' ' + tv('path.opt', { list: p.extras.map(id => PART[id].name).join(', ') })
                : '') + ' ' + t('path.prices'));
        body.appendChild(shop);

        const steps = el('ol', 'steps');
        p.steps.forEach(s => {
            const li = el('li');
            li.appendChild(rich(el('h4', 'step-title'), s.t));
            (s.p || []).forEach(t => li.appendChild(para(t)));
            if (s.list) li.appendChild(list('ul', s.list));
            if (s.svg) {
                const fig = drawFigure(s.svg);
                if (fig) li.appendChild(fig);
            }
            if (s.code) li.appendChild(codeBlock(s.code));
            if (s.note) li.appendChild(para(s.note, 'step-note'));
            steps.appendChild(li);
        });
        body.appendChild(steps);
        card.appendChild(body);

        head.addEventListener('click', () => {
            const open = head.getAttribute('aria-expanded') === 'true';
            head.setAttribute('aria-expanded', String(!open));
            body.hidden = open;
            if (!open) setHash('#p-' + p.id);
        });

        card.appendChild(deepLink('#p-' + p.id, tv('path.deeplink', { name: pathName(p) })));
        host.appendChild(card);

        if (wasOpen.has(p.id)) {
            head.setAttribute('aria-expanded', 'true');
            body.hidden = false;
        }
    });
}

/** A little chain-link button that copies a deep link to this block. */
function deepLink(hash, title) {
    const a = el('a', 'deep-link', '⚓');
    a.href = hash;
    a.title = title;
    a.setAttribute('aria-label', title);
    a.addEventListener('click', ev => {
        ev.preventDefault();
        ev.stopPropagation();
        const url = new URL(location.href);
        url.hash = hash;
        copyText(url.toString());
        setHash(hash);
    });
    return a;
}

function setHash(hash) {
    try { history.replaceState(null, '', location.pathname + location.search + hash); } catch (e) { /* ignore */ }
}

function openPath(id, scroll) {
    const card = document.getElementById('p-' + id);
    if (!card) return;
    const head = card.querySelector('.path-head');
    const body = card.querySelector('.path-body');
    head.setAttribute('aria-expanded', 'true');
    body.hidden = false;
    if (scroll) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Parts ───────────────────────────────────────────────────────────────── */
function usedBy(partId) {
    const req = PATHS.filter(p => p.needs.includes(partId)).map(pathName);
    const opt = PATHS.filter(p => (p.extras || []).includes(partId)).map(pathName);
    const bits = [];
    if (req.length) bits.push(tv('part.needed', { list: req.join(', ') }));
    if (opt.length) bits.push(tv('part.optfor', { list: opt.join(', ') }));
    return bits.length ? bits.join(' · ') : t('part.optextra');
}

function aliLink(q) {
    return 'https://www.aliexpress.com/w/wholesale-' +
        encodeURIComponent(q.trim().replace(/\s+/g, '-')) + '.html';
}

/* Where else to look for a part. Searches only — no affiliate links, ever. */
const SHOPS = [
    { name: 'AliExpress', url: q => aliLink(q) },
    { name: 'Amazon', url: q => 'https://www.amazon.com/s?k=' + encodeURIComponent(q) },
    { name: 'eBay', url: q => 'https://www.ebay.com/sch/i.html?_nkw=' + encodeURIComponent(q) },
    { name: 'Google', url: q => 'https://www.google.com/search?q=' + encodeURIComponent(q) },
    { name: 'DuckDuckGo', url: q => 'https://duckduckgo.com/?q=' + encodeURIComponent(q) },
    { name: 'Bing', url: q => 'https://www.bing.com/search?q=' + encodeURIComponent(q) },
];

/** "Find it on …" menu + a copy button, shared by parts and finished devices. */
function shopLinks(query, copyName) {
    const wrap = el('div', 'part-links');

    const det = el('details', 'find');
    const sum = el('summary', 'mini-btn', t('part.find'));
    det.appendChild(sum);
    const menu = el('div', 'find-menu');
    SHOPS.forEach(s => {
        const a = el('a', 'find-link', s.name + ' ↗');
        a.href = s.url(query);
        a.target = '_blank';
        a.rel = 'noopener nofollow';
        menu.appendChild(a);
    });
    det.appendChild(menu);
    wrap.appendChild(det);

    const copy = el('button', 'mini-btn', t('part.copy'));
    copy.type = 'button';
    copy.addEventListener('click', () => copyText(copyName || query, copy));
    wrap.appendChild(copy);
    return wrap;
}

function renderParts() {
    const host = document.getElementById('partList');
    if (!host) return;
    host.textContent = '';
    PARTS.forEach(p => {
        const card = el('article', 'part');
        card.id = 'part-' + p.id;
        const top = el('div', 'part-top');
        top.appendChild(el('h3', 'part-name', p.name));
        top.appendChild(el('span', 'part-price', priceRange(p.low, p.high)));
        card.appendChild(top);
        card.appendChild(rich(el('p', 'part-why'), p.why));
        card.appendChild(shopLinks(p.q, p.name));
        card.appendChild(el('p', 'part-used', usedBy(p.id)));
        host.appendChild(card);
    });
}

/* ── Fully built devices ─────────────────────────────────────────────────── */
function renderReadymade() {
    const host = document.getElementById('readyList');
    if (!host) return;
    host.textContent = '';
    READYMADE.forEach((d, i) => {
        const card = el('article', 'ready-card' + (d.best ? ' is-best' : '') + (d.warn ? ' is-warn' : ''));
        card.id = 'rm-' + i;
        const top = el('div', 'part-top');
        const name = el('h3', 'part-name');
        name.appendChild(document.createTextNode(d.name));
        if (d.best) name.appendChild(el('span', 'best-flag', t('ready.best')));
        top.appendChild(name);
        top.appendChild(el('span', 'part-price', priceRange(d.low, d.high)));
        card.appendChild(top);

        const meta = el('div', 'path-meta');
        meta.appendChild(el('span', 'tag ' + (/^Fully local/.test(d.local) ? 'good' : (d.local === 'Cloud only' ? 'warn' : '')), d.local));
        meta.appendChild(el('span', 'tag', tv('ready.card', { x: d.card })));
        card.appendChild(meta);

        card.appendChild(rich(el('p', 'part-why'), d.note));
        card.appendChild(shopLinks(d.q, d.name));
        host.appendChild(card);
    });
}

/* ── Software bench ──────────────────────────────────────────────────────── */
function renderSoftware() {
    const host = document.getElementById('swList');
    if (!host) return;
    host.textContent = '';
    SOFTWARE.forEach((s, i) => {
        const card = el('article', 'sw-card' + (s.key ? ' is-key' : ''));
        card.id = 'sw-' + i;
        card.appendChild(el('h3', 'sw-name', s.name));
        card.appendChild(rich(el('p', 'sw-what'), s.what));
        const a = el('a', 'mini-btn', s.link + ' ↗');
        a.href = s.url;
        a.target = '_blank';
        a.rel = 'noopener';
        card.appendChild(a);
        card.appendChild(el('p', 'part-used', s.who));
        host.appendChild(card);
    });
}

/* ── Chapters & FAQ ──────────────────────────────────────────────────────── */
/* ── Brand & device catalogue ────────────────────────────────────────────── */
const HOW_LABEL = {
    native: ['Native', 'good'],
    library: ['Via heatpumpir', ''],
    try: ['Try it', ''],
    capture: ['Capture it', 'warn'],
};

const brandFilter = { q: '', be: false };

/** A path's display name in the current language. */
function pathName(p) {
    const tr = tc('path.' + p.id, null);
    return tr ? tr[0] : p.name;
}

/* Chapters live in two files: the core ones in this one, the longer ones in
   data-chapters.js. Merged in reading order, not file order. */
function allChapters() {
    if (typeof EXTRA_CHAPTERS === 'undefined') return CHAPTERS;
    const order = ['ch-ha', 'ch-brands', 'ch-learn', 'ch-walkthrough', 'ch-heatpumpir',
        'ch-toggle', 'ch-place', 'ch-automate', 'ch-winter', 'ch-trouble', 'ch-midea', 'ch-safe'];
    return CHAPTERS.concat(EXTRA_CHAPTERS).slice().sort((a, b) => {
        const ai = order.indexOf(a.id), bi = order.indexOf(b.id);
        return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
    });
}

function renderBrandTables() {
    const host = document.getElementById('brandTable');
    if (!host || typeof CLIMATE === 'undefined') return;

    const draw = () => {
        host.textContent = '';
        const needle = brandFilter.q.trim().toLowerCase();
        const rows = CLIMATE.filter(b =>
            (!brandFilter.be || b.be) &&
            (!needle || (b.name + ' ' + b.plat + ' ' + (b.note || '')).toLowerCase().includes(needle)));

        host.appendChild(el('p', 'q-hint', tv('brand.count', { n: rows.length, total: CLIMATE.length })));

        const wrap = el('div', 'table-wrap');
        const table = el('table', 'brand-table');
        const thead = el('thead');
        const hr = el('tr');
        ['th.brand', 'th.plat', 'th.how', 'th.notes']
            .forEach(k => hr.appendChild(el('th', null, t(k))));
        thead.appendChild(hr);
        const tbody = el('tbody');

        rows.forEach(b => {
            const tr = el('tr');
            const nameCell = el('td');
            nameCell.appendChild(document.createTextNode(b.name));
            if (b.be) {
                const flag = el('span', 'be-flag', '🇧🇪');
                flag.title = t('brand.beflag');
                nameCell.appendChild(flag);
            }
            tr.appendChild(nameCell);
            tr.appendChild(el('td', 'is-mono', b.plat));
            const [label, cls] = HOW_LABEL[b.how] || ['?', ''];
            const how = el('td');
            how.appendChild(el('span', 'tag ' + cls, HOW_LABEL[b.how] ? t('how.' + b.how) : label));
            tr.appendChild(how);
            tr.appendChild(rich(el('td'), b.note || ''));
            tbody.appendChild(tr);
        });

        table.append(thead, tbody);
        wrap.appendChild(table);
        host.appendChild(wrap);
    };

    const search = document.getElementById('brandSearch');
    if (search && !search.dataset.wired) {
        search.dataset.wired = '1';
        search.addEventListener('input', () => { brandFilter.q = search.value; draw(); });
    }
    const beOnly = document.getElementById('brandBe');
    if (beOnly && !beOnly.dataset.wired) {
        beOnly.dataset.wired = '1';
        beOnly.addEventListener('change', () => { brandFilter.be = beOnly.checked; draw(); });
    }

    draw();
    renderDeviceTable();
}

function renderDeviceTable() {
    const host = document.getElementById('deviceTable');
    if (!host || typeof DEVICES === 'undefined') return;
    host.textContent = '';

    DEVICES.forEach(group => {
        const sec = el('div', 'dev-group');
        sec.appendChild(el('h4', null, group.group));
        const wrap = el('div', 'table-wrap');
        const table = el('table', 'brand-table');
        const thead = el('thead');
        const hr = el('tr');
        ['th.device', 'th.proto', 'th.action', 'th.notes']
            .forEach(k => hr.appendChild(el('th', null, t(k))));
        thead.appendChild(hr);
        const tbody = el('tbody');
        group.items.forEach(d => {
            const tr = el('tr');
            const nameCell = el('td');
            nameCell.appendChild(document.createTextNode(d.name));
            if (d.be) {
                const flag = el('span', 'be-flag', '🇧🇪');
                flag.title = t('dev.beflag');
                nameCell.appendChild(flag);
            }
            tr.appendChild(nameCell);
            tr.appendChild(el('td', null, d.proto));
            tr.appendChild(el('td', null, d.act));
            tr.appendChild(rich(el('td'), d.note || ''));
            tbody.appendChild(tr);
        });
        table.append(thead, tbody);
        wrap.appendChild(table);
        sec.appendChild(wrap);
        host.appendChild(sec);
    });
}

function renderAccordion(hostId, items) {
    const host = document.getElementById(hostId);
    if (!host) return;
    host.textContent = '';
    items.forEach(c => {
        const wrap = el('section', 'chapter');
        wrap.id = c.id;
        const head = el('button', 'chapter-head');
        head.type = 'button';
        head.setAttribute('aria-expanded', 'false');
        head.setAttribute('aria-controls', c.id + '-body');
        head.appendChild(rich(el('span'), c.t));
        head.appendChild(el('span', 'caret', '▾'));
        const body = el('div', 'chapter-body');
        body.id = c.id + '-body';
        body.hidden = true;
        renderBlocks(body, c.blocks);
        head.addEventListener('click', () => {
            const open = head.getAttribute('aria-expanded') === 'true';
            head.setAttribute('aria-expanded', String(!open));
            body.hidden = open;
            if (!open) setHash('#' + c.id);
        });
        wrap.append(head, body);
        wrap.appendChild(deepLink('#' + c.id, t('deep.section')));
        host.appendChild(wrap);
    });
}

function openAnchor(hash) {
    const id = hash.replace('#', '');
    if (id.startsWith('p-')) { openPath(id.slice(2), true); return; }

    const node = document.getElementById(id);
    if (!node) return;

    if (node.classList.contains('chapter')) {
        node.querySelector('.chapter-head').setAttribute('aria-expanded', 'true');
        node.querySelector('.chapter-body').hidden = false;
    }
    node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (node.matches('.part, .sw-card, .ready-card, .chapter')) flash(node);
}

/** A brief glow so a jumped-to card is findable in a long list. */
function flash(node) {
    node.classList.remove('flash');
    void node.offsetWidth;
    node.classList.add('flash');
    setTimeout(() => node.classList.remove('flash'), 1600);
}

/* ── Currencies ──────────────────────────────────────────────────────────── */
/* Fixed, deliberately rounded rates. This page makes no network calls, so
   these cannot be live — the UI says so plainly. EUR is the source of truth. */
const CURRENCIES = {
    EUR: { name: 'Euro', sym: '€', rate: 1, dp: 2 },
    USD: { name: 'US dollar', sym: '$', rate: 1.09, dp: 2 },
    GBP: { name: 'Pound sterling', sym: '£', rate: 0.85, dp: 2 },
    CHF: { name: 'Swiss franc', sym: 'CHF ', rate: 0.95, dp: 2 },
    AUD: { name: 'Australian dollar', sym: 'A$', rate: 1.65, dp: 2 },
    CAD: { name: 'Canadian dollar', sym: 'C$', rate: 1.48, dp: 2 },
    PLN: { name: 'Polish złoty', sym: ' zł', rate: 4.3, dp: 0, suffix: true },
    SEK: { name: 'Swedish krona', sym: ' kr', rate: 11.3, dp: 0, suffix: true },
    CZK: { name: 'Czech koruna', sym: ' Kč', rate: 25, dp: 0, suffix: true },
    ZAR: { name: 'South African rand', sym: 'R', rate: 20, dp: 0 },
};

/* ── Themes ──────────────────────────────────────────────────────────────── */
/* THEMES and STORE_KEY live in data-themes.js, because The Scribe offers the
   same list and the choice carries between the two pages. */

/* ── Boards, for the YAML builder ────────────────────────────────────────── */
const BOARDS = [
    {
        id: 'atom', name: 'M5Stack Atom Lite', chip: 'esp32', board: 'm5stack-atom',
        tx: 'GPIO12', rx: 'GPIO32', sda: 'GPIO26', scl: 'GPIO32', btn: 'GPIO39',
        note: 'The infrared LED is built in on GPIO12 — nothing to wire.',
    },
    {
        id: 'stickc', name: 'M5StickC / StickC Plus', chip: 'esp32', board: 'm5stick-c',
        tx: 'GPIO9', rx: 'GPIO33', sda: 'GPIO32', scl: 'GPIO33', btn: 'GPIO37',
        note: 'Infrared LED built in on GPIO9. Check your revision if it stays silent.',
    },
    {
        id: 'esp32dev', name: 'ESP32 dev board (DevKit)', chip: 'esp32', board: 'esp32dev',
        tx: 'GPIO14', rx: 'GPIO32', sda: 'GPIO21', scl: 'GPIO22', btn: '',
        note: 'Wire the module’s S pin to GPIO14, the middle pin to 3V3, and − to GND.',
    },
    {
        id: 'esp32c3', name: 'ESP32-C3 SuperMini', chip: 'esp32', board: 'esp32-c3-devkitm-1',
        variant: 'esp32c3', tx: 'GPIO4', rx: 'GPIO5', sda: 'GPIO8', scl: 'GPIO9', btn: '',
        note: 'Cheapest of all, but the headers usually arrive unsoldered. Check the listing.',
    },
    {
        id: 'd1mini', name: 'Wemos D1 mini (ESP8266)', chip: 'esp8266', board: 'd1_mini',
        tx: 'D2', rx: 'D5', sda: 'D6', scl: 'D7', btn: '',
        note: 'Works, but the ESP8266 has no hardware timer for infrared — the odd command may be dropped.',
    },
    {
        id: 'adopted', name: 'A ready-made blaster I adopted', chip: 'adopted',
        tx: '', rx: '', sda: '', scl: '', btn: '',
        note: 'The maker already defined the transmitter, so you only add the climate block.',
    },
];

/* ── Picker ──────────────────────────────────────────────────────────────── */
const answers = {};
const owned = {};
const ownedHistory = [];
const settings = { cur: 'EUR', theme: 'frost', lang: 'en' };
/* STORE_KEY comes from data-themes.js — The Scribe writes to the same blob. */

const INV_ITEMS = INVENTORY.flatMap(g => g.items);
const INV = Object.fromEntries(INV_ITEMS.map(i => [i.id, i]));

function ownedCount() { return Object.values(owned).filter(Boolean).length; }

/** What a path still needs, given what is in the drawer. */
function readiness(path) {
    const all = (path.inv || []).filter(r => !r.any.some(c => owned[c]));
    const missing = all.filter(r => !r.soft);
    let lo = 0, hi = 0;
    missing.forEach(r => {
        const part = r.part && PART[r.part];
        if (part) { lo += part.low; hi += part.high; }
    });
    return { missing, soft: all.filter(r => r.soft), lo, hi, ready: missing.length === 0 };
}

function renderInventory() {
    const form = document.getElementById('invForm');
    if (!form) return;
    form.textContent = '';

    INVENTORY.forEach(group => {
        const fs = el('fieldset', 'q inv-group');
        fs.appendChild(el('h3', 'q-title', tc('inv.' + group.group, group.group)));
        const chips = el('div', 'chips');
        chips.setAttribute('role', 'group');
        chips.setAttribute('aria-label', group.group);
        group.items.forEach(item => {
            const b = el('button', 'chip', tc('inv.i.' + item.id, item.label));
            b.type = 'button';
            b.setAttribute('aria-pressed', String(!!owned[item.id]));
            b.dataset.inv = item.id;
            b.addEventListener('click', () => {
                ownedHistory.push({ ...owned });
                if (ownedHistory.length > 30) ownedHistory.shift();
                owned[item.id] = !owned[item.id];
                b.setAttribute('aria-pressed', String(!!owned[item.id]));
                renderInvStatus();
                renderResult();
                if (typeof renderCompare === 'function') renderCompare();
                saveState();
            });
            chips.appendChild(b);
        });
        fs.appendChild(chips);
        form.appendChild(fs);
    });

    const actions = el('div', 'picker-actions');
    const clear = el('button', 'btn btn-ghost', t('btn.empty'));
    clear.type = 'button';
    clear.addEventListener('click', () => {
        ownedHistory.push({ ...owned });
        Object.keys(owned).forEach(k => delete owned[k]);
        redrawDrawer();
    });

    const undo = el('button', 'btn btn-ghost', '↶ ' + t('btn.undo'));
    undo.type = 'button';
    undo.id = 'invUndo';
    undo.disabled = !ownedHistory.length;
    undo.addEventListener('click', () => {
        const prev = ownedHistory.pop();
        if (!prev) return;
        Object.keys(owned).forEach(k => delete owned[k]);
        Object.assign(owned, prev);
        redrawDrawer();
    });

    const next = el('a', 'btn btn-primary', t('btn.next'));
    next.href = '#picker';
    actions.append(clear, undo, next);
    form.appendChild(actions);
}

function redrawDrawer() {
    renderInventory();
    renderInvStatus();
    renderResult();
    if (typeof renderCompare === 'function') renderCompare();
    saveState();
}

function renderInvStatus() {
    const host = document.getElementById('invStatus');
    if (!host) return;
    host.textContent = '';
    const n = ownedCount();

    /* The undo button lives in the other panel, which is not redrawn on every
       tick — so its enabled state has to be refreshed from here. */
    const undo = document.getElementById('invUndo');
    if (undo) undo.disabled = !ownedHistory.length;

    host.appendChild(el('p', 'result-lead', n ? tv('inv.count', { n: n }) : t('inv.none')));
    host.appendChild(para(n ? t('inv.lead') : t('inv.lead0')));

    const rows = el('div', 'ready-rows');
    PATHS.forEach(p => {
        const r = readiness(p);
        const row = el('button', 'ready-row' + (r.ready && n ? ' is-ready' : ''));
        row.type = 'button';
        row.addEventListener('click', () => openPath(p.id, true));

        const left = el('span', 'rr-left');
        left.appendChild(el('span', 'rr-glyph', p.glyph));
        const names = el('span', 'rr-text');
        names.appendChild(el('span', 'rr-name', pathName(p)));
        names.appendChild(el('span', 'rr-need', r.ready
            ? t('inv.ready')
            : tv('inv.needs', {
                list: r.missing.map(m => tc('need.' + m.label, m.label)).join(' · '),
            })));
        left.appendChild(names);
        row.appendChild(left);

        row.appendChild(el('span', 'rr-cost' + (r.ready ? ' free' : ''),
            r.ready ? t('inv.free') : (r.lo ? priceRange(r.lo, r.hi) : t('inv.setup'))));
        rows.appendChild(row);
    });
    host.appendChild(rows);
    host.appendChild(para(t('inv.setupnote'), 'q-hint'));
}

function renderPicker() {
    const form = document.getElementById('pickerForm');
    form.textContent = '';

    QUESTIONS.forEach((q, qi) => {
        const qText = tc('q.' + q.id + '.q', q.q);
        const fs = el('fieldset', 'q');
        const legend = el('legend', 'sr-only', qText);
        legend.style.position = 'absolute';
        legend.style.width = '1px';
        legend.style.height = '1px';
        legend.style.overflow = 'hidden';
        legend.style.clip = 'rect(0 0 0 0)';
        fs.appendChild(legend);
        fs.appendChild(el('h3', 'q-title', (qi + 1) + '. ' + qText));
        if (q.hint) fs.appendChild(el('p', 'q-hint', tc('q.' + q.id + '.hint', q.hint)));

        /* Options are keyed by their stored value; a blank value is the
           “leave it alone” entry on the brand dropdown. */
        const optLabel = o => tc('q.' + q.id + '.' + (o.v || 'blank'), o.label);

        if (q.select) {
            const sel = el('select');
            sel.id = 'q-' + q.id;
            sel.setAttribute('aria-label', qText);
            q.opts.forEach(o => {
                const opt = el('option', null, optLabel(o));
                opt.value = o.v;
                sel.appendChild(opt);
            });
            sel.value = answers[q.id] || '';
            sel.addEventListener('change', () => {
                answers[q.id] = sel.value || null;
                renderResult();
                saveState();
            });
            fs.appendChild(sel);
        } else {
            const group = el('div', 'chips');
            group.setAttribute('role', 'radiogroup');
            group.setAttribute('aria-label', qText);
            q.opts.forEach(o => {
                const b = el('button', 'chip', optLabel(o));
                b.type = 'button';
                b.setAttribute('role', 'radio');
                b.setAttribute('aria-checked', String(answers[q.id] === o.v));
                b.dataset.v = o.v;
                b.addEventListener('click', () => {
                    const isOn = answers[q.id] === o.v;
                    answers[q.id] = isOn ? null : o.v;
                    group.querySelectorAll('.chip').forEach(c =>
                        c.setAttribute('aria-checked', String(!isOn && c.dataset.v === o.v)));
                    renderResult();
                    saveState();
                });
                group.appendChild(b);
            });
            fs.appendChild(group);
        }
        form.appendChild(fs);
    });

    const actions = el('div', 'picker-actions');
    const reset = el('button', 'btn btn-ghost', t('btn.reset'));
    reset.type = 'button';
    reset.addEventListener('click', () => {
        Object.keys(answers).forEach(k => delete answers[k]);
        renderPicker();
        renderResult();
        saveState();
    });
    const jump = el('a', 'btn btn-primary', t('btn.allpaths'));
    jump.href = '#paths';
    actions.append(reset, jump);
    form.appendChild(actions);
}

function score() {
    const totals = {};
    PATHS.forEach(p => { totals[p.id] = 0; });

    /* What you own counts for more than what you fancy. */
    Object.keys(owned).forEach(id => {
        if (!owned[id] || !INV[id]) return;
        Object.entries(INV[id].w || {}).forEach(([k, n]) => { totals[k] = (totals[k] || 0) + n; });
    });

    QUESTIONS.forEach(q => {
        const v = answers[q.id];
        if (!v) return;
        const opt = q.opts.find(o => o.v === v);
        if (!opt || !opt.w) return;
        Object.entries(opt.w).forEach(([k, n]) => { totals[k] = (totals[k] || 0) + n; });
    });

    /* No Zigbee network and no blaster: stop recommending a whole new radio. */
    if (!owned.zbcoord && !owned.zigbeeir) totals.whisper -= 4;
    /* No Home Assistant at all: the ESPHome paths lose most of their point. */
    if (answers.ha === 'never') { totals.wand -= 3; totals.bench -= 3; totals.hijack -= 3; totals.ready -= 3; }

    return PATHS
        .map(p => ({ p, n: totals[p.id] }))
        .sort((a, b) => b.n - a.n || PATHS.indexOf(a.p) - PATHS.indexOf(b.p));
}

function reasons(winner) {
    const out = [];
    const a = answers;
    const r = readiness(winner);

    /* The labels are translated first, then the leading article is stripped in
       whichever language it arrived in — the list reads as a run-on. */
    const have = (winner.inv || [])
        .filter(req => req.any.some(c => owned[c]) && req.part)
        .map(req => tc('need.' + req.label, req.label)
            .replace(/^(an?|the|een|het|de|une?|des|l’|l')\s?/i, ''));
    if (have.length) {
        out.push(tv('why.own', {
            list: have.slice(0, 3).join(', ') + (have.length > 3 ? t('why.andmore') : ''),
        }));
    }
    if (r.ready && ownedCount()) out.push(t('why.nothingleft'));

    if (a.fiddle === 'none') out.push(t('why.fiddle.none'));
    if (a.fiddle === 'some') out.push(t('why.fiddle.some'));
    if (a.fiddle === 'lots') out.push(t('why.fiddle.lots'));
    if (a.dist === 'far') out.push(t('why.dist.far'));
    if (a.dist === 'near') out.push(t('why.dist.near'));
    if (a.ha === 'yes' || owned.haserver) out.push(t('why.ha.yes'));
    if (a.ha === 'never') out.push(t('why.ha.never'));
    if (a.ha === 'soon') out.push(t('why.ha.soon'));
    if (owned.zbcoord) out.push(t('why.zigbee'));
    if (!out.length) out.push(t('why.blank'));
    out.push(tv('path.ends', { x: winner.ends.replace(/\*\*/g, '') }));
    return out;
}

function notesFor(winner) {
    const out = [];
    const a = answers;
    const esphome = ['wand', 'bench', 'hijack', 'ready'].includes(winner.id);

    if (a.brand && a.brand !== 'unknown' && a.brand !== 'heatpumpir') {
        out.push(esphome
            ? tv('note.plat', { brand: a.brand })
            : tv('note.smartir', { brand: a.brand }));
    } else if (a.brand === 'heatpumpir') {
        out.push(t('note.heatpumpir'));
    } else if (a.brand === 'unknown') {
        out.push(t('note.unknown'));
    }

    if (a.dist === 'far' && (winner.id === 'bench')) {
        out.push(t('note.farbench'));
    }
    if (a.dist === 'far' && winner.id === 'wand') {
        out.push(t('note.farwand'));
    }
    if (a.dist === 'mid' && winner.id === 'bench') {
        out.push(t('note.midbench'));
    }
    if (a.temp === 'yes') {
        out.push(esphome ? t('note.sensor') : t('note.sensorother'));
    }
    if (a.ha === 'soon' || a.ha === 'never') {
        out.push(t('note.hazero'));
    }
    if (winner.id === 'hijack') {
        out.push(t('note.hijack'));
    }
    out.push(t('note.keep'));
    return out;
}

function shoppingList(winner) {
    const ids = winner.needs.slice();
    if (answers.temp === 'yes' && (winner.extras || []).includes('th')) ids.push('th');
    if (answers.dist === 'far' && winner.id === 'bench') ids.push('blaster');
    if (winner.id === 'whisper' && !owned.zbcoord) ids.push('zbdongle');
    const all = [...new Set(ids)].map(id => PART[id]).filter(Boolean);
    return {
        buy: all.filter(p => !owned[PART_CAP[p.id]]),
        have: all.filter(p => owned[PART_CAP[p.id]]),
    };
}

function money(n) {
    const c = CURRENCIES[settings.cur] || CURRENCIES.EUR;
    const v = n * c.rate;
    const s = c.dp ? (Math.round(v * 100) / 100).toFixed(2).replace(/\.00$/, '') : String(Math.round(v));
    return c.suffix ? s + c.sym : c.sym + s;
}

/** "€7 – 10" — symbol printed once. */
function priceRange(lo, hi) {
    const c = CURRENCIES[settings.cur] || CURRENCIES.EUR;
    const a = money(lo), b = money(hi);
    return c.suffix ? a + ' – ' + b : a + ' – ' + b.replace(c.sym, '');
}

/* ── Saved state, permalinks ─────────────────────────────────────────────── */
/* The defaults every fresh visit starts from. Anything still equal to one of
   these is left out of the share link — otherwise a link with nothing chosen
   was 330 characters of encoded "no thanks", which is both ugly to paste and
   too long to fit in a QR code. */
const BUILDER_DEFAULTS = {
    board: 'atom', name: 'ac-blaster', friendly: 'Air conditioner',
    platform: 'coolix', tx: '',
    receiver: false, sensor: false, web: false, button: false, tv: false,
};

function collectState() {
    const s = {};

    const o = Object.keys(owned).filter(k => owned[k]);
    if (o.length) s.o = o;

    const a = {};
    Object.keys(answers).forEach(k => { if (answers[k]) a[k] = answers[k]; });
    if (Object.keys(a).length) s.a = a;

    if (settings.cur !== 'EUR') s.c = settings.cur;
    if (settings.theme !== 'frost') s.t = settings.theme;
    if (settings.lang !== 'en') s.l = settings.lang;

    const b = {};
    Object.keys(BUILDER_DEFAULTS).forEach(k => {
        if (builder[k] !== BUILDER_DEFAULTS[k]) b[k] = builder[k];
    });
    if (Object.keys(b).length) s.b = b;

    return s;
}

function applyState(s) {
    if (!s || typeof s !== 'object') return;
    Object.keys(owned).forEach(k => delete owned[k]);
    (Array.isArray(s.o) ? s.o : []).forEach(id => { if (INV[id]) owned[id] = true; });

    Object.keys(answers).forEach(k => delete answers[k]);
    const qIds = QUESTIONS.map(q => q.id);
    Object.entries(s.a || {}).forEach(([k, v]) => {
        if (!qIds.includes(k)) return;
        const q = QUESTIONS.find(x => x.id === k);
        if (q.opts.some(o => o.v === v)) answers[k] = v;
    });

    if (CURRENCIES[s.c]) settings.cur = s.c;
    if (THEMES.some(t => t.id === s.t)) settings.theme = s.t;
    if (typeof LANGS !== 'undefined' && LANGS.some(l => l.id === s.l)) settings.lang = s.l;
    if (s.b && typeof s.b === 'object') Object.assign(builder, sanitiseBuilder(s.b));
}

function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(collectState())); } catch (e) { /* private mode */ }
    updateUrlState();
}

function loadState() {
    /* A link beats the drawer: someone shared this on purpose. */
    const fromUrl = decodeState(new URLSearchParams(location.search).get('s'));
    if (fromUrl) { applyState(fromUrl); return true; }
    try {
        const raw = localStorage.getItem(STORE_KEY);
        if (raw) { applyState(JSON.parse(raw)); return true; }
    } catch (e) { /* ignore */ }
    return false;
}

function encodeState(obj) {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json);
    let bin = '';
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeState(str) {
    if (!str) return null;
    try {
        const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
        const bin = atob(b64 + '='.repeat((4 - b64.length % 4) % 4));
        const bytes = Uint8Array.from(bin, ch => ch.charCodeAt(0));
        return JSON.parse(new TextDecoder().decode(bytes));
    } catch (e) { return null; }
}

function shareUrl() {
    const url = new URL(location.href);
    url.search = '?s=' + encodeState(collectState());
    return url.toString();
}

let urlTimer;
function updateUrlState() {
    clearTimeout(urlTimer);
    urlTimer = setTimeout(() => {
        try {
            const url = new URL(location.href);
            url.search = '?s=' + encodeState(collectState());
            history.replaceState(null, '', url.pathname + url.search + url.hash);
        } catch (e) { /* ignore */ }
    }, 400);
}

function renderResult() {
    const host = document.getElementById('result');
    host.textContent = '';
    const ranked = score();
    const answered = Object.values(answers).filter(Boolean).length + ownedCount();

    document.querySelectorAll('.path').forEach(c => c.classList.remove('is-pick'));
    document.querySelectorAll('.path .pick-flag').forEach(f => f.remove());

    host.appendChild(el('p', 'result-lead', answered ? t('res.your') : t('res.start')));

    if (!answered) {
        host.appendChild(para(t('res.empty1')));
        host.appendChild(para(t('res.empty2')));
        return;
    }

    const winner = ranked[0].p;
    const wtr = tc('path.' + winner.id, null);

    const box = el('div', 'winner');
    const nm = el('div', 'winner-name');
    nm.appendChild(el('span', null, winner.glyph));
    nm.appendChild(el('span', null, wtr ? wtr[0] : winner.name));
    box.appendChild(nm);
    box.appendChild(el('p', 'winner-sub', wtr ? wtr[1] : winner.sub));
    box.appendChild(list('ul', reasons(winner), 'why'));
    const go = el('button', 'btn btn-primary', t('res.open'));
    go.type = 'button';
    go.addEventListener('click', () => openPath(winner.id, true));
    box.appendChild(go);
    host.appendChild(box);

    /* Shopping list --------------------------------------------------- */
    const bag = shoppingList(winner);
    host.appendChild(el('h4', null, bag.buy.length ? t('res.buy') : t('res.nobuy')));
    if (bag.buy.length) {
        const ul = el('ul', 'shop');
        let lo = 0, hi = 0;
        bag.buy.forEach(p => {
            lo += p.low; hi += p.high;
            const li = el('li');
            const nm2 = el('span', 's-name');
            nm2.appendChild(document.createTextNode(p.name));
            const jump = el('a', 's-jump', '↗');
            jump.href = '#part-' + p.id;
            jump.title = tv('res.wheretobuy', { name: p.name });
            jump.addEventListener('click', ev => { ev.preventDefault(); openAnchor('#part-' + p.id); });
            nm2.appendChild(jump);
            li.appendChild(nm2);
            li.appendChild(el('span', 's-cost', priceRange(p.low, p.high)));
            ul.appendChild(li);
        });
        host.appendChild(ul);
        const total = el('div', 'shop-total');
        total.appendChild(el('span', null, t('res.roughly')));
        total.appendChild(el('span', null, priceRange(lo, hi)));
        host.appendChild(total);

        const copyRow = el('div', 'mini-row');
        const copyList = el('button', 'mini-btn', t('res.copylist'));
        copyList.type = 'button';
        copyList.addEventListener('click', () => copyText(shoppingText(winner, bag), copyList));
        copyRow.appendChild(copyList);
        const openAll = el('button', 'mini-btn', t('res.searchall'));
        openAll.type = 'button';
        openAll.addEventListener('click', () => {
            bag.buy.forEach(p => window.open(aliLink(p.q), '_blank', 'noopener'));
        });
        copyRow.appendChild(openAll);
        host.appendChild(copyRow);
    } else {
        host.appendChild(para(t('res.allyours'), 'step-note'));
    }
    if (bag.have.length) {
        host.appendChild(el('h4', null, t('res.have')));
        const hl = el('ul', 'shop have');
        bag.have.forEach(p => {
            const li = el('li');
            li.appendChild(el('span', 's-name', p.name));
            li.appendChild(el('span', 's-cost free', '✓'));
            hl.appendChild(li);
        });
        host.appendChild(hl);
    }

    /* Notes ----------------------------------------------------------- */
    host.appendChild(el('h4', null, t('res.notes')));
    host.appendChild(list('ul', notesFor(winner), 'notes'));

    /* Runners-up ------------------------------------------------------ */
    const runners = ranked.slice(1, 3).filter(r => r.n > -5);
    if (runners.length) {
        host.appendChild(el('h4', null, t('res.also')));
        const rl = el('div', 'runners');
        runners.forEach(r => {
            const b = el('button', 'runner');
            b.type = 'button';
            b.appendChild(el('span', null, r.p.glyph + '  ' + pathName(r.p)));
            b.appendChild(el('span', 'r-cost', priceRange(r.p.low, r.p.high)));
            b.addEventListener('click', () => openPath(r.p.id, true));
            rl.appendChild(b);
        });
        host.appendChild(rl);
    }

    /* Take it away ---------------------------------------------------- */
    host.appendChild(el('h4', null, t('res.take')));
    const acts = el('div', 'mini-row');

    const shareBtn = el('button', 'mini-btn', t('res.sharelink'));
    shareBtn.type = 'button';
    shareBtn.addEventListener('click', () => copyText(shareUrl(), shareBtn));
    acts.appendChild(shareBtn);

    if (typeof showQr === 'function') {
        const qrBtn = el('button', 'mini-btn', t('res.qr'));
        qrBtn.type = 'button';
        qrBtn.addEventListener('click', showQr);
        acts.appendChild(qrBtn);
    }

    if (typeof showCard === 'function') {
        const cardBtn = el('button', 'mini-btn', t('res.card'));
        cardBtn.type = 'button';
        cardBtn.addEventListener('click', showCard);
        acts.appendChild(cardBtn);
    }

    if (typeof planMarkdown === 'function') {
        const mdBtn = el('button', 'mini-btn', t('res.md'));
        mdBtn.type = 'button';
        mdBtn.addEventListener('click', () => copyText(planMarkdown(), mdBtn));
        acts.appendChild(mdBtn);

        const mdDl = el('button', 'mini-btn', t('res.savemd'));
        mdDl.type = 'button';
        mdDl.addEventListener('click', () => downloadText('frostcaller-' + winner.id + '.md', planMarkdown(), 'text/markdown'));
        acts.appendChild(mdDl);
    }

    if (navigator.share) {
        const nativeShare = el('button', 'mini-btn', t('res.share'));
        nativeShare.type = 'button';
        nativeShare.addEventListener('click', () => {
            navigator.share({ title: 'Frostcaller — my AC plan', url: shareUrl() }).catch(() => { });
        });
        acts.appendChild(nativeShare);
    }

    const printBtn = el('button', 'mini-btn', t('res.print'));
    printBtn.type = 'button';
    printBtn.addEventListener('click', () => printPlan(winner));
    acts.appendChild(printBtn);

    const yamlBtn = el('button', 'mini-btn', t('res.yaml'));
    yamlBtn.type = 'button';
    yamlBtn.addEventListener('click', () => {
        prefillBuilder(winner);
        const b = document.getElementById('builder');
        if (b) b.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    acts.appendChild(yamlBtn);

    host.appendChild(acts);
    host.appendChild(para(t('res.privacy'), 'q-hint'));

    /* Highlight the winning card in the list below --------------------- */
    document.querySelectorAll('.path').forEach(c =>
        c.classList.toggle('is-pick', c.dataset.path === winner.id));
    const nameRow = document.querySelector('#p-' + winner.id + ' .path-name');
    if (nameRow) nameRow.appendChild(el('span', 'pick-flag', t('res.yourpick')));
}

/** A plain-text version of the shopping list, for pasting anywhere. */
function shoppingText(winner, bag) {
    const lines = [
        'Frostcaller — ' + winner.name,
        winner.sub,
        '',
        'Still to buy:',
    ];
    let lo = 0, hi = 0;
    bag.buy.forEach(p => {
        lo += p.low; hi += p.high;
        lines.push('- ' + p.name + '  (' + priceRange(p.low, p.high) + ')');
        lines.push('  ' + aliLink(p.q));
    });
    lines.push('', 'Roughly ' + priceRange(lo, hi) + ' in total (' + settings.cur + ', approximate).');
    if (bag.have.length) {
        lines.push('', 'Already have: ' + bag.have.map(p => p.name).join(', '));
    }
    lines.push('', 'Guide: ' + shareUrl());
    return lines.join('\n');
}

/* ── YAML builder ────────────────────────────────────────────────────────── */
const builder = {
    board: 'atom',
    name: 'ac-blaster',
    friendly: 'Air conditioner',
    platform: 'coolix',
    tx: '',
    receiver: false,
    sensor: false,
    web: false,
    button: false,
    tv: false,
};

function sanitiseBuilder(b) {
    const out = {};
    if (BOARDS.some(x => x.id === b.board)) out.board = b.board;
    if (typeof b.name === 'string') out.name = slug(b.name).slice(0, 40) || 'ac-blaster';
    if (typeof b.friendly === 'string') out.friendly = b.friendly.slice(0, 60);
    if (BRANDS.some(x => x[1].split(',')[0].trim() === b.platform) || b.platform === 'coolix') out.platform = b.platform;
    if (typeof b.tx === 'string') out.tx = b.tx.replace(/[^A-Za-z0-9_]/g, '').slice(0, 12);
    ['receiver', 'sensor', 'web', 'button', 'tv'].forEach(k => { out[k] = !!b[k]; });
    return out;
}

function slug(s) {
    return String(s).toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function boardOf() { return BOARDS.find(b => b.id === builder.board) || BOARDS[0]; }

function buildYaml() {
    const b = boardOf();
    const tx = builder.tx || b.tx;
    const name = slug(builder.name) || 'ac-blaster';
    const friendly = builder.friendly || 'Air conditioner';
    const L = [];

    if (b.chip === 'adopted') {
        L.push('# Append this to the configuration ESPHome imported when you');
        L.push('# adopted the device. Everything else is already there.');
        L.push('');
    } else {
        L.push('esphome:');
        L.push('  name: ' + name);
        L.push('  friendly_name: ' + friendly);
        L.push('');
        if (b.chip === 'esp32') {
            L.push('esp32:');
            L.push('  board: ' + b.board);
            if (b.variant) {
                L.push('  variant: ' + b.variant);
            }
            L.push('  framework:');
            L.push('    type: esp-idf');
        } else {
            L.push('esp8266:');
            L.push('  board: ' + b.board);
        }
        L.push('');
        L.push('wifi:');
        L.push('  ssid: !secret wifi_ssid');
        L.push('  password: !secret wifi_password');
        L.push('  ap:');
        L.push('    ssid: "' + friendly + ' fallback"');
        L.push('');
        L.push('captive_portal:');
        L.push('logger:');
        L.push('');
        L.push('api:');
        L.push('  encryption:');
        L.push('    key: !secret api_encryption_key   # ESPHome generates this for you');
        L.push('');
        L.push('ota:');
        L.push('  - platform: esphome');
        L.push('    password: !secret ota_password');
        L.push('');
        L.push('remote_transmitter:');
        L.push('  pin: ' + tx);
        L.push('  carrier_duty_percent: 50%');
        L.push('');
    }

    if (builder.receiver && b.chip !== 'adopted') {
        L.push('remote_receiver:');
        L.push('  id: rcvr');
        L.push('  pin:');
        L.push('    number: ' + (b.rx || 'GPIO32'));
        L.push('    inverted: true');
        L.push('    mode:');
        L.push('      input: true');
        L.push('      pullup: true');
        L.push('  tolerance: 55%');
        L.push('');
    }

    if (builder.sensor && b.chip !== 'adopted') {
        L.push('i2c:');
        L.push('  sda: ' + b.sda);
        L.push('  scl: ' + b.scl);
        L.push('');
        L.push('sensor:');
        L.push('  - platform: aht10');
        L.push('    variant: AHT20');
        L.push('    temperature:');
        L.push('      name: "Room temperature"');
        L.push('      id: room_temp');
        L.push('    humidity:');
        L.push('      name: "Room humidity"');
        L.push('    update_interval: 60s');
        L.push('');
    }

    L.push('climate:');
    L.push('  - platform: ' + builder.platform);
    L.push('    id: ac');
    L.push('    name: "' + friendly + '"');
    if (builder.platform === 'gree') L.push('    model: yan          # generic / yan / yaa / yac / yag');
    if (builder.platform === 'heatpumpir') {
        L.push('    protocol: panasonic_dke   # pick yours from the ESPHome list');
        L.push('    horizontal_default: middle');
        L.push('    vertical_default: middle');
        L.push('    min_temperature: 16');
        L.push('    max_temperature: 30');
    }
    if (builder.sensor && b.chip !== 'adopted') L.push('    sensor: room_temp');
    if (builder.receiver && b.chip !== 'adopted') L.push('    receiver_id: rcvr');
    L.push('');

    if (builder.button && b.btn && b.chip !== 'adopted') {
        L.push('# The button on the device becomes a panic "off" switch.');
        L.push('binary_sensor:');
        L.push('  - platform: gpio');
        L.push('    pin:');
        L.push('      number: ' + b.btn);
        L.push('      inverted: true');
        L.push('    name: "Panic off"');
        L.push('    on_press:');
        L.push('      - climate.control:');
        L.push('          id: ac');
        L.push('          mode: "OFF"');
        L.push('');
    }

    if (builder.tv) {
        L.push('# One blaster, every gadget in the room.');
        L.push('button:');
        L.push('  - platform: template');
        L.push('    name: "TV power"');
        L.push('    on_press:');
        L.push('      - remote_transmitter.transmit_nec:');
        L.push('          address: 0x1234        # from your own capture');
        L.push('          command: 0x78AB');
        L.push('');
    }

    if (builder.web) {
        L.push('# Its own control page, so it still works if Home Assistant is down.');
        L.push('web_server:');
        L.push('  port: 80');
        L.push('');
    }

    return L.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function prefillBuilder(winner) {
    if (answers.brand && answers.brand !== 'unknown') builder.platform = answers.brand;
    if (winner) {
        if (winner.id === 'wand') builder.board = 'atom';
        else if (winner.id === 'bench') builder.board = owned.esp8266 && !owned.esp32 ? 'd1mini' : 'esp32dev';
        else if (winner.id === 'ready' || winner.id === 'hijack') builder.board = 'adopted';
    }
    if (answers.temp === 'yes') builder.sensor = true;
    renderBuilder();
    saveState();
}

function renderBuilder() {
    const form = document.getElementById('builderForm');
    const out = document.getElementById('builderOut');
    if (!form || !out) return;
    form.textContent = '';
    const b = boardOf();

    const field = (labelText, control, hint) => {
        const w = el('label', 'bf');
        w.appendChild(el('span', 'bf-label', labelText));
        w.appendChild(control);
        if (hint) w.appendChild(el('span', 'bf-hint', hint));
        return w;
    };

    /* Board ------------------------------------------------------------ */
    const boardSel = el('select');
    BOARDS.forEach(x => {
        const o = el('option', null, x.name);
        o.value = x.id;
        boardSel.appendChild(o);
    });
    boardSel.value = builder.board;
    boardSel.addEventListener('change', () => {
        builder.board = boardSel.value;
        builder.tx = '';
        renderBuilder();
        if (typeof renderPinMap === 'function') renderPinMap();
        saveState();
    });
    form.appendChild(field(t('bld.board'), boardSel, tc('board.' + b.id, b.note)));

    /* Brand ------------------------------------------------------------ */
    const brandSel = el('select');
    BRANDS.forEach(([label, plat]) => {
        const first = plat.split(',')[0].trim();
        const o = el('option', null, label);
        o.value = first;
        brandSel.appendChild(o);
    });
    brandSel.value = builder.platform;
    brandSel.addEventListener('change', () => {
        builder.platform = brandSel.value;
        renderBuilder();
        saveState();
    });
    form.appendChild(field(t('bld.brand'), brandSel, t('bld.brand.h')));

    /* Names ------------------------------------------------------------ */
    const nameIn = el('input');
    nameIn.type = 'text';
    nameIn.value = builder.name;
    nameIn.maxLength = 40;
    nameIn.addEventListener('input', () => {
        builder.name = nameIn.value;
        updateBuilderOut();
    });
    nameIn.addEventListener('blur', saveState);
    form.appendChild(field(t('bld.name'), nameIn, t('bld.name.h')));

    const friendlyIn = el('input');
    friendlyIn.type = 'text';
    friendlyIn.value = builder.friendly;
    friendlyIn.maxLength = 60;
    friendlyIn.addEventListener('input', () => {
        builder.friendly = friendlyIn.value;
        updateBuilderOut();
    });
    friendlyIn.addEventListener('blur', saveState);
    form.appendChild(field(t('bld.friendly'), friendlyIn, t('bld.friendly.h')));

    /* Pin -------------------------------------------------------------- */
    if (b.chip !== 'adopted') {
        const pinIn = el('input');
        pinIn.type = 'text';
        pinIn.value = builder.tx || b.tx;
        pinIn.maxLength = 12;
        pinIn.addEventListener('input', () => {
            builder.tx = pinIn.value;
            updateBuilderOut();
        });
        pinIn.addEventListener('blur', saveState);
        form.appendChild(field(t('bld.pin'), pinIn,
            b.id === 'atom' || b.id === 'stickc' ? t('bld.pin.fixed') : t('bld.pin.h')));
    }

    /* Extras ----------------------------------------------------------- */
    const extras = el('div', 'bf-checks');
    const check = (key, label, hint, disabled) => {
        const w = el('label', 'bf-check' + (disabled ? ' is-off' : ''));
        const cb = el('input');
        cb.type = 'checkbox';
        cb.checked = !!builder[key] && !disabled;
        cb.disabled = !!disabled;
        cb.addEventListener('change', () => {
            builder[key] = cb.checked;
            updateBuilderOut();
            saveState();
        });
        w.appendChild(cb);
        const t = el('span');
        t.appendChild(el('span', 'bf-check-label', label));
        if (hint) t.appendChild(el('span', 'bf-hint', hint));
        w.appendChild(t);
        return w;
    };
    const adopted = b.chip === 'adopted';
    extras.appendChild(check('sensor', t('bld.sensor'),
        adopted ? t('bld.notadopted') : tv('bld.sensor.h', { sda: b.sda, scl: b.scl }), adopted));
    extras.appendChild(check('receiver', t('bld.receiver'),
        adopted ? t('bld.notadopted') : tv('bld.receiver.h', { rx: b.rx }), adopted));
    extras.appendChild(check('button', t('bld.button'),
        b.btn ? tv('bld.button.h', { btn: b.btn }) : t('bld.button.none'), !b.btn || adopted));
    extras.appendChild(check('tv', t('bld.tv'), t('bld.tv.h')));
    extras.appendChild(check('web', t('bld.web'), t('bld.web.h')));
    form.appendChild(extras);

    updateBuilderOut();
}

function updateBuilderOut() {
    const out = document.getElementById('builderOut');
    if (!out) return;
    const yaml = buildYaml();
    out.textContent = '';

    const wrap = el('div', 'code');
    const head = el('div', 'code-head');
    head.appendChild(el('span', 'code-label', (slug(builder.name) || 'ac-blaster') + '.yaml'));

    const btns = el('span', 'code-btns');
    const copy = el('button', 'copy-btn', 'Copy');
    copy.type = 'button';
    copy.addEventListener('click', () => copyText(yaml, copy));
    btns.appendChild(copy);

    const dl = el('button', 'copy-btn', 'Download');
    dl.type = 'button';
    dl.addEventListener('click', () => downloadText((slug(builder.name) || 'ac-blaster') + '.yaml', yaml, 'text/yaml'));
    btns.appendChild(dl);
    head.appendChild(btns);

    const pre = el('pre');
    pre.appendChild(el('code', null, yaml));
    wrap.append(head, pre);
    out.appendChild(wrap);

    const b = boardOf();
    out.appendChild(para(b.chip === 'adopted'
        ? 'Paste this at the **bottom** of the configuration ESPHome imported when you adopted the device — do not delete what the maker wrote above it.'
        : 'Paste this over the whole file in ESPHome Builder, then press **Install**. The three `!secret` lines are filled in from your `secrets.yaml`, which ESPHome wrote when you first set it up.', 'step-note'));
}

/* ── Search across everything ────────────────────────────────────────────── */
let SEARCH_INDEX = [];

function textOfBlocks(blocks) {
    return (blocks || []).map(b => [b.h, b.p, b.note,
    (b.ul || []).join(' '), (b.ol || []).join(' '), b.code && b.code.text]
        .filter(Boolean).join(' ')).join(' ');
}

function buildSearchIndex() {
    const idx = [];
    PATHS.forEach(p => idx.push({
        id: 'p-' + p.id, kind: 'Path', title: p.name,
        text: [p.sub, p.ends, p.pros.join(' '), p.cons.join(' '),
        p.steps.map(s => [s.t, (s.p || []).join(' '), (s.list || []).join(' '), s.note,
        s.code && s.code.text].filter(Boolean).join(' ')).join(' ')].join(' '),
    }));
    [[CHAPTERS, 'Chapter'], [FAQ, 'Question'], [FEATURES, 'Extra'], [FLASH_ROUTES, 'Flashing']]
        .forEach(([set, kind]) => set.forEach(c => idx.push({
            id: c.id, kind, title: c.t, text: textOfBlocks(c.blocks),
        })));
    PARTS.forEach(p => idx.push({
        id: 'part-' + p.id, kind: 'Part', title: p.name, text: p.why + ' ' + p.q,
    }));
    if (typeof EXTRA_CHAPTERS !== 'undefined') {
        EXTRA_CHAPTERS.forEach(c => idx.push({
            id: c.id, kind: 'Chapter', title: c.t, text: textOfBlocks(c.blocks),
        }));
    }
    if (typeof CLIMATE !== 'undefined') {
        CLIMATE.forEach(b => idx.push({
            id: 'brands', kind: 'Brand', title: b.name,
            text: 'air conditioner platform ' + b.plat + ' ' + (b.note || ''),
        }));
    }
    SOFTWARE.forEach((s, i) => idx.push({
        id: 'sw-' + i, kind: 'Software', title: s.name, text: s.what + ' ' + s.who,
    }));
    READYMADE.forEach((d, i) => idx.push({
        id: 'rm-' + i, kind: 'Ready-made', title: d.name, text: d.note + ' ' + d.local + ' ' + d.q,
    }));
    BRANDS.forEach(([name, plat]) => idx.push({
        id: 'ch-brands', kind: 'Brand', title: name, text: 'platform ' + plat + ' air conditioner brand',
    }));
    idx.forEach(e => { e.hay = (e.title + ' ' + e.text).toLowerCase(); });
    return idx;
}

function runSearch(q) {
    const needle = q.trim().toLowerCase();
    const box = document.getElementById('searchResults');
    if (!box) return;
    box.textContent = '';
    if (needle.length < 2) { box.hidden = true; return; }

    const words = needle.split(/\s+/).filter(Boolean);
    const hits = SEARCH_INDEX
        .map(e => {
            let s = 0;
            words.forEach(w => {
                if (!e.hay.includes(w)) { s = -1000; return; }
                s += 1;
                if (e.title.toLowerCase().includes(w)) s += 4;
            });
            return { e, s };
        })
        .filter(h => h.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 12);

    if (!hits.length) {
        box.appendChild(el('p', 'search-empty', tv('search.none', { q: q.trim() })));
        box.hidden = false;
        return;
    }

    hits.forEach(({ e }) => {
        const item = el('button', 'search-hit');
        item.type = 'button';
        const top = el('span', 'sh-top');
        top.appendChild(el('span', 'sh-kind', e.kind));
        top.appendChild(el('span', 'sh-title', e.title));
        item.appendChild(top);
        item.appendChild(el('span', 'sh-snip', snippet(e.text, words[0])));
        item.addEventListener('click', () => {
            closeSearch();
            openAnchor('#' + e.id);
        });
        box.appendChild(item);
    });
    box.hidden = false;
}

function snippet(text, word) {
    /* Search snippets are plain text, so the author's markup has to come out:
       links keep their label, backticks and asterisks simply go. */
    const flat = String(text)
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/[`*]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    const i = flat.toLowerCase().indexOf(word);
    if (i < 0) return flat.slice(0, 110) + '…';
    const from = Math.max(0, i - 40);
    return (from ? '…' : '') + flat.slice(from, from + 130).trim() + '…';
}

function closeSearch() {
    const box = document.getElementById('searchResults');
    const input = document.getElementById('searchInput');
    if (box) { box.hidden = true; box.textContent = ''; }
    if (input) input.value = '';
}

/* ── Toolbar: search, currency, theme, share, print ──────────────────────── */
function applyTheme() {
    applyThemeId(settings.theme);
}

function repriceEverything() {
    renderPaths();
    renderParts();
    renderReadymade();
    renderInvStatus();
    renderResult();
    if (typeof renderCompare === 'function') renderCompare();
    if (typeof renderCost === 'function') renderCost();
}

/** After a language change: everything the interface draws itself. */
function rerenderEverything() {
    renderPaths();
    renderParts();
    renderReadymade();
    renderInventory();
    renderInvStatus();
    renderPicker();
    renderResult();
    renderBuilder();
    renderBrandTables();
    if (typeof renderCompare === 'function') renderCompare();
    if (typeof renderTrouble === 'function') renderTrouble();
    if (typeof renderCost === 'function') renderCost();
    if (typeof renderPinMap === 'function') renderPinMap();
    if (typeof renderLogReader === 'function') renderLogReader();
    if (typeof renderRawTool === 'function') renderRawTool();
    if (typeof renderJournal === 'function') renderJournal();
    if (typeof renderRooms === 'function') renderRooms();
    if (typeof renderRemoteId === 'function') renderRemoteId();
    if (typeof renderLibrary === 'function') renderLibrary();
}

function setupToolbar() {
    /* Search ----------------------------------------------------------- */
    SEARCH_INDEX = buildSearchIndex();
    const input = document.getElementById('searchInput');
    const box = document.getElementById('searchResults');
    if (input) {
        let t;
        input.addEventListener('input', () => {
            clearTimeout(t);
            t = setTimeout(() => runSearch(input.value), 120);
        });
        input.addEventListener('keydown', ev => {
            if (ev.key === 'Escape') { closeSearch(); input.blur(); }
            if (ev.key === 'Enter') {
                const first = box && box.querySelector('.search-hit');
                if (first) { ev.preventDefault(); first.click(); }
            }
        });
        document.addEventListener('keydown', ev => {
            const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
            if (ev.key === '/' && !typing) { ev.preventDefault(); input.focus(); }
        });
        document.addEventListener('click', ev => {
            if (box && !box.hidden && !ev.target.closest('.search-wrap')) box.hidden = true;
        });
    }

    /* Currency --------------------------------------------------------- */
    const cur = document.getElementById('curSelect');
    if (cur) {
        Object.entries(CURRENCIES).forEach(([code, c]) => {
            const o = el('option', null, code + ' · ' + c.name);
            o.value = code;
            cur.appendChild(o);
        });
        cur.value = settings.cur;
        cur.addEventListener('change', () => {
            settings.cur = cur.value;
            repriceEverything();
            saveState();
        });
    }

    /* Theme ------------------------------------------------------------ */
    const th = document.getElementById('themeSelect');
    if (th) {
        [['pro', 'Professional'], ['fun', 'Playful']].forEach(([g, label]) => {
            const grp = document.createElement('optgroup');
            grp.label = label;
            THEMES.filter(x => x.group === g).forEach(x => {
                const o = el('option', null, x.name);
                o.value = x.id;
                o.title = x.note;
                grp.appendChild(o);
            });
            th.appendChild(grp);
        });
        th.value = settings.theme;
        th.addEventListener('change', () => {
            settings.theme = th.value;
            applyTheme();
            saveState();
        });
    }

    /* Language --------------------------------------------------------- */
    const lg = document.getElementById('langSelect');
    if (lg && typeof LANGS !== 'undefined') {
        LANGS.forEach(l => {
            const o = el('option', null, l.flag + '  ' + l.name);
            o.value = l.id;
            lg.appendChild(o);
        });
        lg.value = settings.lang;
        lg.addEventListener('change', () => {
            settings.lang = lg.value;
            setLang(settings.lang);
            rerenderEverything();
            saveState();
        });
    }

    /* Share & print ---------------------------------------------------- */
    const share = document.getElementById('shareBtn');
    if (share) share.addEventListener('click', () => copyText(shareUrl(), share));

    const print = document.getElementById('printBtn');
    if (print) print.addEventListener('click', () => printAll());
}

/* ── Printing ────────────────────────────────────────────────────────────── */
function expandAll(on) {
    document.querySelectorAll('.chapter-head, .path-head').forEach(h => {
        h.setAttribute('aria-expanded', String(on));
        const body = h.parentElement.querySelector('.chapter-body, .path-body');
        if (body) body.hidden = !on;
    });
    document.querySelectorAll('details.find').forEach(d => { d.open = false; });
}

let printCleanup = null;

function beforePrint(mode, keepPathId) {
    const opened = [...document.querySelectorAll('[aria-expanded="true"]')];
    document.body.classList.add(mode);
    if (mode === 'print-all') {
        expandAll(true);
    } else if (keepPathId) {
        document.querySelectorAll('.path').forEach(c =>
            c.classList.toggle('print-keep', c.dataset.path === keepPathId));
        openPath(keepPathId, false);
    }
    printCleanup = () => {
        document.body.classList.remove('print-all', 'print-plan');
        document.querySelectorAll('.path').forEach(c => c.classList.remove('print-keep'));
        if (mode === 'print-all') {
            expandAll(false);
            opened.forEach(h => {
                h.setAttribute('aria-expanded', 'true');
                const body = h.parentElement.querySelector('.chapter-body, .path-body');
                if (body) body.hidden = false;
            });
        }
        printCleanup = null;
    };
}

function doPrint() {
    window.print();
    setTimeout(() => { if (printCleanup) printCleanup(); }, 800);
}

function printAll() {
    beforePrint('print-all');
    doPrint();
}

function printPlan(winner) {
    beforePrint('print-plan', winner.id);
    doPrint();
}

/* ── Page chrome ─────────────────────────────────────────────────────────── */
/* Toast, clipboard, downloads and the starfield live in ui.js, shared with
   The Scribe so there is one copy of each. */

function setupChrome() {
    setupPageFurniture();

    /* In-page links to chapters should open the chapter they point at. */
    document.addEventListener('click', ev => {
        const a = ev.target.closest('a[href^="#"]');
        if (!a || a.classList.contains('deep-link')) return;
        const hash = a.getAttribute('href');
        if (hash.length < 2) return;
        const target = document.getElementById(hash.slice(1));
        if (target && (target.matches('.chapter, .part, .sw-card, .ready-card') || hash.startsWith('#p-'))) {
            ev.preventDefault();
            openAnchor(hash);
            setHash(hash);
        }
    });

    window.addEventListener('hashchange', () => {
        if (location.hash) openAnchor(location.hash);
    });

    window.addEventListener('afterprint', () => { if (printCleanup) printCleanup(); });
}

/* ── Init ────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    const restored = loadState();
    if (typeof setLang === 'function') setLang(settings.lang);
    applyTheme();

    renderPaths();
    renderParts();
    renderReadymade();
    renderSoftware();
    renderBrandTables();
    renderAccordion('flashList', FLASH_ROUTES);
    renderAccordion('featureList', FEATURES);
    renderAccordion('chapterList', allChapters());
    renderAccordion('faqList', FAQ);
    renderInventory();
    renderInvStatus();
    renderPicker();
    renderBuilder();
    renderResult();
    setupToolbar();
    setupChrome();
    startStarfield();

    if (restored && ownedCount()) showToast(t('ui.restored'));
    if (location.hash) setTimeout(() => openAnchor(location.hash), 60);
});
