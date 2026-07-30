/* ==========================================================================
   Frostcaller — the planner suite
   --------------------------------------------------------------------------
   Four tools that only make sense once you have decided what to build:

     ROOMS      several units, several rooms, one shopping list
     JOURNAL    a build log you keep yourself — honest about why it is local
     HANDOVER   a one-page sheet for whoever lives with this after you
     REMOTE ID  match your handset by shape, which beats matching by badge
     LIBRARY    your own captured codes, stored locally, exportable

   Loaded after app.js and tools.js; uses their helpers. Everything persists
   to localStorage under its own key so one feature cannot corrupt another.
   ========================================================================== */

'use strict';

/* ── Room-by-room planner ────────────────────────────────────────────────── */
const ROOMS_KEY = 'frostcaller.rooms.v1';
let rooms = [];

function loadRooms() {
    try {
        const raw = localStorage.getItem(ROOMS_KEY);
        if (raw) rooms = JSON.parse(raw).slice(0, 12);
    } catch (e) { /* ignore */ }
}

function saveRooms() {
    try { localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms)); } catch (e) { /* ignore */ }
}

function newRoom() {
    return {
        id: 'r' + Date.now() + Math.floor(Math.random() * 1000),
        name: '',
        path: score()[0].p.id,
        brand: answers.brand || '',
        dist: 'near',
        sensor: false,
        plug: false,
    };
}

function renderRooms() {
    const host = document.getElementById('roomList');
    const sum = document.getElementById('roomSummary');
    if (!host || !sum) return;
    host.textContent = '';

    if (!rooms.length) {
        host.appendChild(para(t('room.empty'), 'q-hint'));
    }

    rooms.forEach((room, i) => {
        const card = el('article', 'room');

        /* Filled in at the bottom of this card, but the name field updates it
           as you type — so it is declared before the handler that needs it. */
        const names = el('p', 'q-hint');
        const showNames = () => {
            const s = roomSlug(room, i);
            names.textContent = '';
            rich(names, tv('room.names', { dev: 'ac-' + s, ent: 'climate.' + s.replace(/-/g, '_') }));
        };

        const top = el('div', 'room-top');
        const name = el('input', 'room-name');
        name.type = 'text';
        name.placeholder = t('room.ph');
        name.value = room.name;
        name.setAttribute('aria-label', tv('room.aria', { n: i + 1 }));
        name.addEventListener('input', () => {
            room.name = name.value;
            showNames();          /* the whole point of that line is to preview this */
            saveRooms();
            updateRoomSummary();
        });
        top.appendChild(name);

        const del = el('button', 'mini-btn', t('room.remove'));
        del.type = 'button';
        del.addEventListener('click', () => {
            rooms.splice(i, 1);
            saveRooms();
            renderRooms();
        });
        top.appendChild(del);
        card.appendChild(top);

        const grid = el('div', 'room-grid');

        const pathSel = el('select');
        PATHS.forEach(p => {
            const tr = tc('path.' + p.id, null);
            const o = el('option', null, p.glyph + '  ' + (tr ? tr[0] : p.name));
            o.value = p.id;
            pathSel.appendChild(o);
        });
        pathSel.value = room.path;
        pathSel.setAttribute('aria-label', t('room.build.aria'));
        pathSel.addEventListener('change', () => { room.path = pathSel.value; saveRooms(); updateRoomSummary(); });
        grid.appendChild(roomField(t('room.build'), pathSel));

        const brandSel = el('select');
        const blank = el('option', null, t('room.brand.blank'));
        blank.value = '';
        brandSel.appendChild(blank);
        (typeof CLIMATE !== 'undefined' ? CLIMATE : []).forEach(b => {
            const o = el('option', null, b.name);
            o.value = b.plat;
            brandSel.appendChild(o);
        });
        brandSel.value = room.brand;
        brandSel.setAttribute('aria-label', t('room.brand.aria'));
        brandSel.addEventListener('change', () => { room.brand = brandSel.value; saveRooms(); updateRoomSummary(); });
        grid.appendChild(roomField(t('room.brand'), brandSel));

        const distSel = el('select');
        [['near', t('room.near')], ['mid', '2–5 m'], ['far', t('room.far')]].forEach(([v, l]) => {
            const o = el('option', null, l);
            o.value = v;
            distSel.appendChild(o);
        });
        distSel.value = room.dist;
        distSel.setAttribute('aria-label', t('room.dist.aria'));
        distSel.addEventListener('change', () => { room.dist = distSel.value; saveRooms(); updateRoomSummary(); });
        grid.appendChild(roomField(t('room.dist'), distSel));

        card.appendChild(grid);

        const extras = el('div', 'room-checks');
        [['sensor', t('room.sensor')], ['plug', t('room.plug')]].forEach(([key, label]) => {
            const w = el('label', 'deck-check');
            const cb = el('input');
            cb.type = 'checkbox';
            cb.checked = !!room[key];
            cb.addEventListener('change', () => { room[key] = cb.checked; saveRooms(); updateRoomSummary(); });
            w.appendChild(cb);
            w.appendChild(el('span', null, label));
            extras.appendChild(w);
        });
        card.appendChild(extras);

        showNames();
        card.appendChild(names);

        host.appendChild(card);
    });

    updateRoomSummary();
}

function roomField(label, control) {
    const w = el('label', 'bf');
    w.appendChild(el('span', 'bf-label', label));
    w.appendChild(control);
    return w;
}

function roomSlug(room, i) {
    return slug(room.name) || ('room-' + (i + 1));
}

function updateRoomSummary() {
    const sum = document.getElementById('roomSummary');
    if (!sum) return;
    sum.textContent = '';

    if (!rooms.length) {
        sum.appendChild(el('p', 'result-lead', t('room.none')));
        sum.appendChild(para(t('room.none.d')));
        return;
    }

    /* Combine every room's needs into one basket. */
    const basket = new Map();
    let lo = 0, hi = 0;
    rooms.forEach(room => {
        const path = PATH[room.path];
        if (!path) return;
        const ids = path.needs.slice();
        if (room.dist === 'far' && room.path === 'bench') ids.push('blaster');
        if (room.sensor) ids.push('th');
        if (room.plug) ids.push('plug');
        ids.forEach(id => {
            const part = PART[id];
            if (!part) return;
            /* One drawer item covers one room only — count them up. */
            const owned0 = owned[PART_CAP[id]] && !basket.has(id);
            if (owned0) return;
            basket.set(id, (basket.get(id) || 0) + 1);
        });
    });

    sum.appendChild(el('p', 'result-lead',
        tv(rooms.length === 1 ? 'room.count1' : 'room.countn', { n: rooms.length })));

    sum.appendChild(el('h4', null, t('room.basket')));
    const ul = el('ul', 'shop');
    [...basket.entries()].forEach(([id, n]) => {
        const p = PART[id];
        lo += p.low * n;
        hi += p.high * n;
        const li = el('li');
        li.appendChild(el('span', 's-name', (n > 1 ? n + ' × ' : '') + p.name));
        li.appendChild(el('span', 's-cost', priceRange(p.low * n, p.high * n)));
        ul.appendChild(li);
    });
    sum.appendChild(ul);

    const total = el('div', 'shop-total');
    total.appendChild(el('span', null, t('res.roughly')));
    total.appendChild(el('span', null, priceRange(lo, hi)));
    sum.appendChild(total);

    sum.appendChild(el('h4', null, t('room.naming')));
    sum.appendChild(para(t('room.naming.d'), 'q-hint'));

    const acts = el('div', 'mini-row');
    const copyAll = el('button', 'mini-btn', t('room.copyplan'));
    copyAll.type = 'button';
    copyAll.addEventListener('click', () => copyText(roomsMarkdown(), copyAll));
    acts.appendChild(copyAll);

    const yamlAll = el('button', 'mini-btn', t('room.allyaml'));
    yamlAll.type = 'button';
    yamlAll.addEventListener('click', () => copyText(roomsYaml(), yamlAll));
    acts.appendChild(yamlAll);

    const autoAll = el('button', 'mini-btn', t('room.autos'));
    autoAll.type = 'button';
    autoAll.addEventListener('click', () => copyText(roomsAutomations(), autoAll));
    acts.appendChild(autoAll);
    sum.appendChild(acts);

    sum.appendChild(rich(el('p', 'step-note'), t('room.areas')));
}

function roomsYaml() {
    return rooms.map((room, i) => {
        const s = roomSlug(room, i);
        const path = PATH[room.path];
        const board = room.path === 'wand' ? BOARDS.find(b => b.id === 'atom')
            : room.path === 'bench' ? BOARDS.find(b => b.id === 'esp32dev')
                : BOARDS.find(b => b.id === 'adopted');
        const lines = [
            '# ─── ' + (room.name || 'Room ' + (i + 1)) + ' — ' + (path ? path.name : '') + ' ───',
            'esphome:',
            '  name: ac-' + s,
            '  friendly_name: ' + (room.name || 'Room ' + (i + 1)) + ' air conditioner',
            '',
        ];
        if (board && board.chip !== 'adopted') {
            lines.push('remote_transmitter:', '  pin: ' + board.tx, '  carrier_duty_percent: 50%', '');
        }
        lines.push('climate:', '  - platform: ' + (room.brand || 'coolix'),
            '    id: ac', '    name: "' + (room.name || 'Room ' + (i + 1)) + ' AC"');
        if (room.sensor) lines.push('    sensor: room_temp');
        return lines.join('\n');
    }).join('\n\n') + '\n';
}

function roomsAutomations() {
    const ents = rooms.map((r, i) => 'climate.' + roomSlug(r, i).replace(/-/g, '_') + '_ac');
    return [
        '# Everything off when the house empties. One automation, every room.',
        'alias: All air conditioning off when nobody is home',
        'triggers:',
        '  - trigger: state',
        '    entity_id: zone.home',
        '    to: "0"',
        '    for: "00:10:00"',
        'actions:',
        '  - action: climate.turn_off',
        '    target:',
        '      entity_id:',
        ...ents.map(e => '        - ' + e),
        '',
        '# Or, once every unit is in an Area, simply:',
        '#   target:',
        '#     area_id: [bedroom, living_room]',
    ].join('\n');
}

function roomsMarkdown() {
    const L = ['# Frostcaller — house plan', ''];
    rooms.forEach((room, i) => {
        const path = PATH[room.path];
        L.push('## ' + (room.name || 'Room ' + (i + 1)));
        L.push('');
        L.push('- Build: ' + (path ? path.name : '?'));
        L.push('- Unit: ' + (room.brand || 'not chosen') + '');
        L.push('- Distance: ' + room.dist);
        if (room.sensor) L.push('- Plus a room temperature sensor');
        if (room.plug) L.push('- Plus a metering plug');
        L.push('- Device name: `ac-' + roomSlug(room, i) + '`');
        L.push('');
    });
    L.push('---', '', 'Generated by Frostcaller · ' + shareUrl());
    return L.join('\n');
}

function setupRooms() {
    loadRooms();
    const add = document.getElementById('roomAdd');
    if (add) {
        add.addEventListener('click', () => {
            if (rooms.length >= 12) { showToast(t('room.max')); return; }
            rooms.push(newRoom());
            saveRooms();
            renderRooms();
        });
    }
    const clear = document.getElementById('roomClear');
    if (clear) {
        clear.addEventListener('click', () => {
            if (rooms.length && !confirm(t('room.forget'))) return;
            rooms = [];
            saveRooms();
            renderRooms();
        });
    }
    renderRooms();
}

/* ── Build journal ───────────────────────────────────────────────────────── */
/* The honest version of a "difficulty meter": it is your log, kept on your
   machine. There is no server here to collect anybody's timings, and saying
   "average build time: 2h" from invented data would be worse than saying
   nothing. So this measures your build, and you can publish it if you like. */
const JOURNAL_KEY = 'frostcaller.journal.v1';
let journal = { started: null, entries: [] };

function loadJournal() {
    try {
        const raw = localStorage.getItem(JOURNAL_KEY);
        if (raw) journal = JSON.parse(raw);
    } catch (e) { /* ignore */ }
}

function saveJournal() {
    try { localStorage.setItem(JOURNAL_KEY, JSON.stringify(journal)); } catch (e) { /* ignore */ }
}

const JOURNAL_STAGES = [
    { id: 'ordered', label: 'Parts ordered' },
    { id: 'arrived', label: 'Parts arrived' },
    { id: 'ha', label: 'Home Assistant ready' },
    { id: 'flashed', label: 'Firmware on the board' },
    { id: 'adopted', label: 'Showing in Home Assistant' },
    { id: 'beeped', label: 'The air conditioner beeped' },
    { id: 'placed', label: 'Mounted where it lives' },
    { id: 'automated', label: 'First automation running' },
];

function renderJournal() {
    const host = document.getElementById('journalBody');
    if (!host) return;
    host.textContent = '';

    const done = journal.entries.length;
    host.appendChild(el('p', 'result-lead', done
        ? tv('jrn.count', { n: done, total: JOURNAL_STAGES.length })
        : t('jrn.none')));

    const list = el('ol', 'journal-list');
    JOURNAL_STAGES.forEach(stage => {
        const label = tc('jrn.s.' + stage.id, stage.label);
        const entry = journal.entries.find(e => e.id === stage.id);
        const li = el('li', 'journal-step' + (entry ? ' is-done' : ''));

        const btn = el('button', 'journal-tick');
        btn.type = 'button';
        btn.setAttribute('aria-pressed', String(!!entry));
        btn.textContent = entry ? '✓' : '';
        btn.setAttribute('aria-label', tv('jrn.mark', { step: label }));
        btn.addEventListener('click', () => {
            const at = journal.entries.findIndex(e => e.id === stage.id);
            if (at >= 0) {
                journal.entries.splice(at, 1);
            } else {
                if (!journal.started) journal.started = Date.now();
                journal.entries.push({ id: stage.id, at: Date.now() });
            }
            saveJournal();
            renderJournal();
        });
        li.appendChild(btn);

        const body = el('span', 'journal-text');
        body.appendChild(el('span', 'journal-label', label));
        if (entry) {
            const d = new Date(entry.at);
            const since = journal.started ? humanGap(entry.at - journal.started) : '';
            body.appendChild(el('span', 'journal-when',
                d.toLocaleString() + (since ? ' · ' + since + ' in' : '')));
        }
        li.appendChild(body);
        list.appendChild(li);
    });
    host.appendChild(list);

    if (done >= 2) {
        const first = Math.min(...journal.entries.map(e => e.at));
        const last = Math.max(...journal.entries.map(e => e.at));
        host.appendChild(rich(el('p', 'step-note'), tv('jrn.elapsed', { gap: humanGap(last - first) })));
    }

    const row = el('div', 'mini-row');
    const copy = el('button', 'mini-btn', t('jrn.copy'));
    copy.type = 'button';
    copy.addEventListener('click', () => copyText(journalText(), copy));
    row.appendChild(copy);

    const reset = el('button', 'mini-btn', t('jrn.reset'));
    reset.type = 'button';
    reset.addEventListener('click', () => {
        if (journal.entries.length && !confirm(t('jrn.confirm'))) return;
        journal = { started: null, entries: [] };
        saveJournal();
        renderJournal();
    });
    row.appendChild(reset);
    host.appendChild(row);

    host.appendChild(para(t('jrn.note'), 'q-hint'));
}

function humanGap(ms) {
    const m = Math.round(ms / 60000);
    if (m < 60) return m + ' min';
    const h = Math.round(m / 6) / 10;
    if (h < 48) return h + ' h';
    return Math.round(h / 24) + ' days';
}

function journalText() {
    const L = ['Frostcaller build log', ''];
    JOURNAL_STAGES.forEach(s => {
        const e = journal.entries.find(x => x.id === s.id);
        L.push((e ? '[x] ' : '[ ] ') + s.label + (e ? '  — ' + new Date(e.at).toLocaleString() : ''));
    });
    if (journal.entries.length >= 2) {
        const first = Math.min(...journal.entries.map(e => e.at));
        const last = Math.max(...journal.entries.map(e => e.at));
        L.push('', 'Elapsed: ' + humanGap(last - first));
    }
    return L.join('\n');
}

/* ── Handover sheet ──────────────────────────────────────────────────────── */
/* For whoever lives with this after you built it — which is often you, in
   two years, having forgotten everything. */
function showHandover() {
    const dlg = document.getElementById('handoverPanel');
    const box = document.getElementById('handoverBox');
    if (!dlg || !box) return;
    box.textContent = '';

    const winner = score()[0].p;
    const tr = tc('path.' + winner.id, null);
    const plat = answers.brand && answers.brand !== 'unknown' ? answers.brand : 'coolix';

    const sheet = el('div', 'handover');
    sheet.appendChild(el('h3', 'ho-title', t('ho.title')));

    const rows = [
        [t('ho.k1'), t('ho.v1')],
        [t('ho.k2'), (tr ? tr[0] : winner.name) + ' — ' + (tr ? tr[1] : winner.sub)],
        [t('ho.k3'), plat],
        [t('ho.k4'), t('ho.v4')],
        [t('ho.k5'), t('ho.v5')],
        [t('ho.k6'), t('ho.v6')],
        [t('ho.k7'), t('ho.v7')],
        [t('ho.k8'), t('ho.v8')],
    ];
    const dl = el('dl', 'ho-list');
    rows.forEach(([k, v]) => {
        dl.appendChild(el('dt', null, k));
        dl.appendChild(el('dd', null, v));
    });
    sheet.appendChild(dl);

    sheet.appendChild(el('p', 'ho-foot',
        tv('ho.foot', { date: new Date().toLocaleDateString() })));
    box.appendChild(sheet);

    const qr = typeof qrEncode === 'function' ? qrEncode('https://rami.party/workshop/frostcaller/') : null;
    if (qr) box.appendChild(qrSvg(qr, 110));

    const print = el('button', 'btn btn-primary', t('ho.print'));
    print.type = 'button';
    print.addEventListener('click', () => {
        document.body.classList.add('print-card');
        window.print();
        setTimeout(() => document.body.classList.remove('print-card'), 800);
    });
    box.appendChild(print);

    dlg.hidden = false;
    const close = document.getElementById('handoverClose');
    if (close) close.focus();
}

function hideHandover() {
    const dlg = document.getElementById('handoverPanel');
    if (dlg) dlg.hidden = true;
}

/* ── Which remote is this? ───────────────────────────────────────────────── */
function renderRemoteId() {
    const host = document.getElementById('remoteId');
    if (!host || typeof REMOTE_SHAPES === 'undefined') return;
    host.textContent = '';

    REMOTE_SHAPES.forEach(shape => {
        const card = el('button', 'remote-card');
        card.type = 'button';
        const fig = svgRemote(shape.id);
        if (fig) card.appendChild(fig);
        card.appendChild(el('span', 'remote-name', tc('shape.' + shape.id, shape.name)));
        card.appendChild(el('span', 'remote-plat', 'platform: ' + shape.plat));
        card.addEventListener('click', () => {
            answers.brand = shape.plat;
            const sel = document.getElementById('q-brand');
            if (sel) sel.value = shape.plat;
            builder.platform = shape.plat;
            renderBuilder();
            renderResult();
            saveState();
            showToast(tv('remote.set', { plat: shape.plat }));
            const note = document.getElementById('remoteSay');
            if (note) { note.textContent = ''; rich(note, tc('shape.' + shape.id + '.say', shape.say)); }
        });
        host.appendChild(card);
    });
}

/* ── Your own codes library ──────────────────────────────────────────────── */
/* The community-codes idea, done honestly: there is no server here, so this
   is your shelf. It exports the exact formats the community projects accept,
   and tells you where to send them. */
const LIB_KEY = 'frostcaller.captures.v1';   /* shared with The Scribe, on purpose */

function renderLibrary() {
    const host = document.getElementById('libBody');
    if (!host) return;
    host.textContent = '';

    let saved = [];
    try {
        const raw = localStorage.getItem(LIB_KEY);
        if (raw) saved = JSON.parse(raw);
    } catch (e) { /* ignore */ }

    if (!saved.length) {
        host.appendChild(para(t('lib.empty'), 'q-hint'));
    } else {
        host.appendChild(el('p', 'result-lead',
            tv(saved.length === 1 ? 'lib.count1' : 'lib.countn', { n: saved.length })));
        const ul = el('ul', 'lib-list');
        saved.slice(0, 40).forEach(c => {
            const li = el('li');
            li.appendChild(el('span', 'lib-name', c.label || t('lib.unnamed')));
            li.appendChild(el('span', 'lib-kind',
                c.kind === 'raw' ? (c.codes ? tv('lib.pulses', { n: c.codes.length }) : 'raw')
                    : (c.protocol || c.kind)));
            ul.appendChild(li);
        });
        host.appendChild(ul);

        const row = el('div', 'mini-row');
        const open = el('a', 'mini-btn', t('lib.open'));
        open.href = 'writer/#captures';
        row.appendChild(open);
        host.appendChild(row);
    }

    host.appendChild(el('h4', null, t('lib.where')));
    host.appendChild(para(t('lib.where.d'), 'q-hint'));
    const ol = el('ol');
    /* Note: `rich()` does not nest, so no **[link](url)** — the bold wins and
       you get the raw markup on screen. Bold or link, never both. */
    ['lib.c1', 'lib.c2', 'lib.c3'].forEach(k => ol.appendChild(rich(el('li'), t(k))));
    host.appendChild(ol);
}

/* ── Init ────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    setupRooms();
    loadJournal();
    renderJournal();
    renderRemoteId();
    renderLibrary();

    const hoBtn = document.getElementById('handoverBtn');
    if (hoBtn) hoBtn.addEventListener('click', showHandover);

    const close = document.getElementById('handoverClose');
    if (close) close.addEventListener('click', hideHandover);
    const back = document.getElementById('handoverPanel');
    if (back) back.addEventListener('click', ev => { if (ev.target === back) hideHandover(); });
});
