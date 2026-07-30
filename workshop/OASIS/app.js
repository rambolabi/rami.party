/* ==========================================================================
   O.A.S.I.S. — app.js
   --------------------------------------------------------------------------
   Router, renderer, search engine, field log, theme and offline plumbing.

   Rules this file keeps to:
     • No innerHTML anywhere. Everything is createElement + textContent, so
       nothing that ends up on screen can ever be executed.
     • No network calls. The only fetch in the project is the service worker's.
     • State lives in localStorage and degrades silently if it is unavailable.
   ========================================================================== */

(function () {
    'use strict';

    const VERSION = '1.2.0';

    /* --------------------------------------------------------------- config
       Everything environment-specific lives here. When this system moves to
       its own domain, this block is the only thing that has to change: every
       internal link is relative and every asset is local. */
    const CONFIG = {
        contact: 'oasis@labidi.eu',
        futureHome: 'oasis.labidi.eu',
        parentSite: '../../',            // set to null once it stands alone
        parentName: 'rami.party',
    };

    const K = window.OASIS_KNOWLEDGE || [];
    const T = window.OASIS_TABLES || [];
    const TOOLS = window.OASIS_TOOLS || [];
    const LINKS = window.OASIS_LINKS || [];
    const SCEN = window.OASIS_SCENARIOS || [];
    const BANDS = window.OASIS_BANDS || [];
    const SRC = window.OASIS_SOURCES || {};
    const TREES = window.OASIS_TREES || [];

    /* ------------------------------------------------------------ tiny DOM */

    function el(tag, attrs, kids) {
        const n = document.createElement(tag);
        if (attrs) for (const k in attrs) {
            const v = attrs[k];
            if (v == null || v === false) continue;
            if (k === 'class') n.className = v;
            else if (k === 'text') n.textContent = v;
            else if (k === 'html') throw new Error('no');
            else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
            else n.setAttribute(k, v === true ? '' : v);
        }
        if (kids) (Array.isArray(kids) ? kids : [kids]).forEach(c => {
            if (c == null || c === false) return;
            n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
        });
        return n;
    }

    /** Supports **bold** and `code` in authored content. Safe: text nodes only. */
    function rich(text) {
        const frag = document.createDocumentFragment();
        const re = /\*\*([^*]+)\*\*|`([^`]+)`/g;
        let last = 0, m;
        while ((m = re.exec(text)) !== null) {
            if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
            frag.appendChild(m[1] ? el('strong', { text: m[1] }) : el('code', { text: m[2] }));
            last = re.lastIndex;
        }
        if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
        return frag;
    }

    const $ = s => document.querySelector(s);
    const main = $('#main');

    /* -------------------------------------------------------------- storage */

    const store = {
        get(k, fb) {
            try {
                const v = localStorage.getItem('oasis.' + k);
                if (v == null) return fb;
                const parsed = JSON.parse(v);
                /* `v == null` only catches a *missing* key. A stored literal
                   "null", or a value whose shape no longer matches what the
                   caller expects — a half-finished write, another tab, an older
                   version of this app — parses fine and then explodes as a
                   TypeError somewhere far away from here. Match the fallback's
                   shape or hand back the fallback. */
                if (parsed == null) return fb;
                if (fb == null) return parsed;
                if (Array.isArray(fb) !== Array.isArray(parsed)) return fb;
                if (typeof parsed !== typeof fb) return fb;
                return parsed;
            }
            catch (e) { return fb; }
        },
        set(k, v) {
            try { localStorage.setItem('oasis.' + k, JSON.stringify(v)); } catch (e) { /* private mode */ }
        },
        del(k) { try { localStorage.removeItem('oasis.' + k); } catch (e) { } },
    };

    /**
     * The stored fix is used arithmetically in a few dozen places — toFixed,
     * MGRS, bearings, the plot canvas. A fix written by an older version, a
     * partial write, or a hand-edited value must degrade to "no fix" here,
     * not to a TypeError on the home screen when someone opens this in a
     * genuine emergency.
     */
    function readFix() {
        const f = store.get('fix', null);
        if (!f || typeof f !== 'object' || Array.isArray(f)) return null;
        const lat = Number(f.lat), lon = Number(f.lon);
        if (!isFinite(lat) || !isFinite(lon)) return null;
        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
        const acc = Number(f.acc), t = Number(f.t);
        return {
            lat, lon,
            acc: isFinite(acc) && acc >= 0 ? acc : 0,
            t: isFinite(t) && t > 0 ? t : Date.now(),
        };
    }

    let toastTimer = null;
    function toast(msg) {
        const t = $('#toast');
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => t.classList.remove('show'), 3400);
    }

    /* ---------------------------------------------------------------- pages */

    const PAGES = [
        { id: 'now', title: 'I need help now', glyph: '⌁', group: null },
        { id: 'home', title: 'Command', glyph: '◉', group: null },
        { id: 'play', title: 'Playbooks', glyph: '▤', group: null },
    ].concat(K.map(c => ({ id: 'c/' + c.id, title: c.title, glyph: c.glyph, group: 'Doctrine', chapter: c })))
        .concat([
            { id: 'tools', title: 'All tools', glyph: '⚙', group: 'Systems' },
            { id: 'card', title: 'Emergency card', glyph: '▭', group: 'Systems' },
            { id: 'log', title: 'Field log', glyph: '✎', group: 'Systems' },
            { id: 'library', title: 'Sources', glyph: '⛁', group: 'Systems' },
            { id: 'about', title: 'About & offline', glyph: 'ⓘ', group: 'Systems' },
        ]);

    function buildRail() {
        const rail = $('#rail');
        rail.textContent = '';
        let group = undefined;
        PAGES.forEach(p => {
            if (p.group !== group) {
                group = p.group;
                if (group) rail.appendChild(el('div', { class: 'rail-group', text: group }));
            }
            rail.appendChild(el('a', { href: '#/' + p.id, 'data-page': p.id }, [
                el('span', { class: 'g', 'aria-hidden': 'true', text: p.glyph }),
                el('span', { text: p.title }),
            ]));
        });
    }

    function markRail(id) {
        document.querySelectorAll('#rail a').forEach(a => {
            if (a.getAttribute('data-page') === id) a.setAttribute('aria-current', 'page');
            else a.removeAttribute('aria-current');
        });
    }

    /* ----------------------------------------------------------- components */

    function tagFor(tag) {
        if (!tag) return null;
        return el('span', { class: 'tag ' + tag, text: tag });
    }

    /**
     * Source attribution. Every claim in this system should be traceable to a
     * named body rather than to an anonymous page, so chapters, cards and
     * playbooks all render the authorities they are drawn from.
     */
    function sourceChips(keys, label) {
        if (!keys || !keys.length) return null;
        const wrap = el('div', { class: 'srcs' });
        wrap.appendChild(el('span', { class: 'srcs-label', text: label || 'Sources' }));
        keys.forEach(k => {
            const s = SRC[k];
            if (!s) return;
            wrap.appendChild(el('a', {
                class: 'src', href: s.url, title: s.full,
                target: '_blank', rel: 'noopener noreferrer external',
            }, s.name));
        });
        return wrap;
    }

    function renderCard(card) {
        const c = el('article', { class: 'card', id: 'card-' + card.id });
        const h = el('h3');
        h.appendChild(document.createTextNode(card.title));
        const t = tagFor(card.tag);
        if (t) h.appendChild(t);
        c.appendChild(h);

        if (card.lede) c.appendChild(el('p', { class: 'lede' }, rich(card.lede)));

        if (card.steps && card.steps.length) {
            const ol = el('ol');
            card.steps.forEach(s => ol.appendChild(el('li', null, rich(s))));
            c.appendChild(ol);
        }

        if (card.facts && card.facts.length) {
            const dl = el('dl', { class: 'facts' });
            card.facts.forEach(([k, v]) => dl.appendChild(el('div', null, [
                el('dt', null, rich(k)), el('dd', null, rich(v)),
            ])));
            c.appendChild(dl);
        }

        if (card.dont && card.dont.length) {
            const box = el('div', { class: 'dont' }, el('h4', { text: 'Do not' }));
            const ul = el('ul');
            card.dont.forEach(s => ul.appendChild(el('li', null, rich(s))));
            box.appendChild(ul);
            c.appendChild(box);
        }

        if (card.note) c.appendChild(el('p', { class: 'note' }, rich(card.note)));
        const s = sourceChips(card.sources);
        if (s) c.appendChild(s);
        return c;
    }

    function renderTable(tbl) {
        const wrap = el('section', { id: 'table-' + tbl.id });
        wrap.appendChild(sectionHead(tbl.title));
        if (tbl.note) wrap.appendChild(el('p', { class: 'note', style: 'margin-bottom:10px' }, rich(tbl.note)));

        const filter = el('input', {
            class: 'tbl-filter', type: 'search', placeholder: `Filter ${tbl.rows.length} rows…`,
            'aria-label': 'Filter ' + tbl.title,
        });
        wrap.appendChild(filter);

        const box = el('div', { class: 'table-wrap' });
        const table = el('table');
        const thead = el('thead');
        const hr = el('tr');
        tbl.cols.forEach(c => hr.appendChild(el('th', { scope: 'col', text: c })));
        thead.appendChild(hr);
        table.appendChild(thead);

        const tbody = el('tbody');
        tbl.rows.forEach(r => {
            const tr = el('tr');
            r.forEach(cell => tr.appendChild(el('td', null, rich(String(cell)))));
            tr.dataset.hay = r.join(' ').toLowerCase();
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        box.appendChild(table);
        wrap.appendChild(box);

        filter.addEventListener('input', () => {
            const q = filter.value.trim().toLowerCase();
            let shown = 0;
            tbody.querySelectorAll('tr').forEach(tr => {
                const hit = !q || tr.dataset.hay.includes(q);
                tr.hidden = !hit;
                if (hit) shown++;
            });
            filter.placeholder = `Filter ${shown} of ${tbl.rows.length} rows…`;
        });
        return wrap;
    }

    function sectionHead(text) {
        return el('div', { class: 'sec-head' }, [
            el('h2', { text }), el('span', { class: 'rule', 'aria-hidden': 'true' }),
        ]);
    }

    /* ------------------------------------------------------------ tool render */

    const POS_LABEL = /lat, lon|any position/i;
    /* Time fields must never be restored from storage: a saved timestamp would
       freeze the sun/moon and DTG tools at whenever you last opened them. */
    const VOLATILE = /^(datetime-local|date|time)$/;

    function renderTool(tool) {
        const sec = el('section', { class: 'tool', id: 'tool-' + tool.id });
        sec.appendChild(el('h3', null, [
            el('span', { class: 'g', 'aria-hidden': 'true', text: tool.glyph }),
            document.createTextNode(tool.title),
        ]));
        if (tool.blurb) sec.appendChild(el('p', { class: 'blurb', text: tool.blurb }));

        const saved = store.get('tool.' + tool.id, {});
        const fieldsBox = el('div', { class: 'fields' });
        const inputs = {};

        tool.fields.forEach(fd => {
            const wrap = el('label', { class: 'field' + (fd.wide ? ' span-all' : '') });
            wrap.appendChild(el('span', { text: fd.label }));

            let input;
            if (fd.type === 'select') {
                input = el('select', { name: fd.k });
                (fd.options || []).forEach(([val, lab]) => {
                    const o = el('option', { value: val, text: lab });
                    input.appendChild(o);
                });
            } else if (fd.type === 'textarea') {
                input = el('textarea', { name: fd.k, rows: 6, spellcheck: 'false' });
            } else {
                input = el('input', {
                    name: fd.k, type: fd.type || 'text', autocomplete: 'off', spellcheck: 'false',
                    step: fd.step, min: fd.min, max: fd.max,
                });
            }

            const initial = (!VOLATILE.test(fd.type || '') && saved[fd.k] != null) ? saved[fd.k] : fd.def;
            if (initial != null) input.value = initial;
            inputs[fd.k] = input;
            wrap.appendChild(input);

            if (fd.type === 'text' && POS_LABEL.test(fd.label)) {
                const btn = el('button', {
                    type: 'button', class: 'btn ghost', style: 'margin-top:6px;padding:4px 10px;font-size:.78em',
                    onclick: () => {
                        const fix = store.get('fix', null);
                        if (!fix) { toast('No stored position — take a fix from the status bar first.'); return; }
                        input.value = `${fix.lat.toFixed(6)}, ${fix.lon.toFixed(6)}`;
                        recompute();
                    },
                }, '⌖ Use my last fix');
                wrap.appendChild(btn);
            }
            if (fd.hint) wrap.appendChild(el('span', { class: 'muted', style: 'font-size:.74em;text-transform:none;letter-spacing:0', text: fd.hint }));

            fieldsBox.appendChild(wrap);
        });

        sec.appendChild(fieldsBox);
        const out = el('div', { class: 'out' });
        sec.appendChild(out);
        const extra = el('div', { class: 'extra' });
        sec.appendChild(extra);

        const values = () => {
            const v = {};
            for (const k in inputs) v[k] = inputs[k].value;
            return v;
        };

        /* Writing to localStorage on every keystroke janks low-end devices
           for no benefit — the value is only needed on the next visit. */
        let saveTimer = null;
        function persist(v) {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => {
                const keep = {};
                tool.fields.forEach(fd => { if (!VOLATILE.test(fd.type || '')) keep[fd.k] = v[fd.k]; });
                store.set('tool.' + tool.id, keep);
            }, 400);
        }

        function recompute() {
            const v = values();
            persist(v);
            out.textContent = '';
            let res;
            try { res = tool.run(v); }
            catch (err) { res = { rows: [], msg: 'Calculation failed: ' + err.message, alarm: true }; }

            (res.rows || []).forEach(([label, val, hero]) => {
                out.appendChild(el('div', { class: 'row' + (hero ? ' hero' : '') }, [
                    el('span', null, rich(String(label))),
                    el('b', null, rich(String(val))),
                ]));
            });
            if (res.msg) out.appendChild(el('p', { class: 'msg' + (res.alarm ? ' alarm' : '') }, rich(res.msg)));
            if (tool.draw) { try { tool.draw(extra, v); } catch (e) { /* canvas is optional */ } }
        }

        /* Canvases are painted with the theme's colours, so they have to be
           repainted when the theme changes. */
        if (tool.draw) sec._redraw = () => { try { tool.draw(extra, values()); } catch (e) { } };

        fieldsBox.addEventListener('input', recompute);
        fieldsBox.addEventListener('change', recompute);

        if (tool.mount) { try { tool.mount(extra, { values, recompute, out }); } catch (e) { } }
        recompute();
        return sec;
    }

    /* ------------------------------------------------------------- home page */

    function pageHome() {
        const frag = document.createDocumentFragment();

        const hero = el('section', { class: 'hero' });
        hero.appendChild(el('p', { class: 'eyebrow', text: 'Offline Advanced System for Information and Survival' }));
        hero.appendChild(el('h1', { text: 'O.A.S.I.S.' }));
        hero.appendChild(el('p', {
            class: 'sub',
            text: 'An air-gapped field reference. No servers, no accounts, no tracking, no network calls — '
                + 'once this page has loaded on your device it keeps working with the cable cut. '
                + 'Read it now, while it is a curiosity. It is written for the day it is not.',
        }));

        const threes = el('div', { class: 'threes' });
        [['3 min', 'without air, or bleeding'], ['3 hours', 'without shelter, badly exposed'],
        ['3 days', 'without water'], ['3 weeks', 'without food'], ['3 months', 'without hope']]
            .forEach(([a, b]) => threes.appendChild(el('div', { class: 'three' }, [
                el('b', { text: a }), el('span', { text: b }),
            ])));
        hero.appendChild(threes);

        const cta = el('div', { class: 'btn-row' }, [
            el('a', { class: 'btn', href: '#/c/triage' }, 'Start here → First Response'),
            el('a', { class: 'btn ghost', href: '#/play' }, 'Playbooks — before, during, after'),
            el('a', { class: 'btn ghost', href: '#/c/medical/bleeding' }, 'Stop the bleeding'),
            el('a', { class: 'btn ghost', href: '#/tools' }, 'All calculators'),
        ]);
        hero.appendChild(cta);
        frag.appendChild(hero);

        /* Install first: a copy on the device is worth more than anything below it. */
        frag.appendChild(sectionHead('Do this first'));
        const first = el('div', { class: 'grid' });
        first.appendChild(installCard());
        first.appendChild(el('div', { class: 'card' }, [
            el('h3', { text: 'Then, in order' }),
            el('ol', null, [
                el('li', null, rich('**Print** First Response, Medical and the frequency tables. Paper needs no battery.')),
                el('li', null, rich('**Copy the folder** to a second device and a USB stick.')),
                el('li', null, rich('**Take a position fix** now, while you have sky and battery.')),
                el('li', null, rich('**Read one playbook** for the thing most likely to happen where you live.')),
                el('li', null, rich('**Write the PACE plan** with your household and give everyone a copy.')),
            ]),
            el('div', { class: 'btn-row' }, [
                el('a', { class: 'btn ghost', href: '#/play' }, 'Open the playbooks'),
                el('a', { class: 'btn ghost', href: '#/c/triage/pace' }, 'PACE plan'),
            ]),
        ]));
        frag.appendChild(first);

        /* Critical cards, surfaced. */
        frag.appendChild(sectionHead('Immediate — the pages you may have seconds to find'));
        const crit = el('div', { class: 'grid' });
        K.forEach(ch => ch.cards.filter(c => c.tag === 'critical').forEach(c => {
            crit.appendChild(el('a', { class: 'chapter-card', href: `#/c/${ch.id}/${c.id}` }, [
                el('span', { class: 'g', 'aria-hidden': 'true', text: ch.glyph }),
                el('h3', { text: c.title }),
                el('p', { text: (c.lede || '').split('. ')[0] + '.' }),
                el('span', { class: 'count', text: ch.title.toUpperCase() }),
            ]));
        }));
        frag.appendChild(crit);

        /* Chapters. */
        frag.appendChild(sectionHead('Doctrine'));
        const grid = el('div', { class: 'grid' });
        K.forEach(ch => {
            const tools = TOOLS.filter(t => t.chapter === ch.id).length;
            const tables = T.filter(t => t.chapter === ch.id).length;
            const bits = [`${ch.cards.length} cards`];
            if (tables) bits.push(`${tables} tables`);
            if (tools) bits.push(`${tools} tools`);
            grid.appendChild(el('a', { class: 'chapter-card', href: '#/c/' + ch.id }, [
                el('span', { class: 'g', 'aria-hidden': 'true', text: ch.glyph }),
                el('h3', { text: ch.title }),
                el('p', { text: ch.blurb }),
                el('span', { class: 'count', text: bits.join(' · ') }),
            ]));
        });
        frag.appendChild(grid);

        /* Readiness. */
        frag.appendChild(sectionHead('Readiness'));
        const ready = el('div', { class: 'grid' });
        const fix = store.get('fix', null);
        const logCount = store.get('log', []).length;

        ready.appendChild(el('div', { class: 'card' }, [
            el('h3', { text: 'Offline package' }),
            el('p', { class: 'lede', id: 'readyCache', text: 'Checking…' }),
            el('div', { class: 'btn-row' }, [
                el('button', { class: 'btn ghost', type: 'button', onclick: precache }, 'Cache everything now'),
                el('a', { class: 'btn ghost', href: '#/about' }, 'Install as an app'),
            ]),
        ]));

        ready.appendChild(el('div', { class: 'card' }, [
            el('h3', { text: 'Last known position' }),
            el('p', { class: 'lede', text: fix ? `${fix.lat.toFixed(6)}, ${fix.lon.toFixed(6)}  (±${Math.round(fix.acc)} m)` : 'No position stored. Take a fix while you still have a clear sky and a charged battery.' }),
            fix ? el('dl', { class: 'facts' }, [
                el('div', null, [el('dt', { text: 'MGRS' }), el('dd', { text: window.GEO.toMGRS(fix.lat, fix.lon, 5) || '—' })]),
                el('div', null, [el('dt', { text: 'Deg + min' }), el('dd', { text: window.GEO.toDDM(fix.lat, fix.lon) })]),
                el('div', null, [el('dt', { text: 'Taken' }), el('dd', { text: new Date(fix.t).toLocaleString() })]),
            ]) : null,
            el('div', { class: 'btn-row' }, [
                el('button', { class: 'btn ghost', type: 'button', onclick: getFix }, '⌖ Take a fix'),
                el('a', { class: 'btn ghost', href: '#/pos' }, 'Position tools →'),
            ]),
        ]));

        ready.appendChild(el('div', { class: 'card' }, [
            el('h3', { text: 'Field log' }),
            el('p', { class: 'lede', text: logCount ? `${logCount} entries recorded. Under stress you will not remember what you did or when — the log will.` : 'Empty. Start it before you need it: times, decisions, doses, positions, who went where.' }),
            el('div', { class: 'btn-row' }, [el('a', { class: 'btn ghost', href: '#/log' }, 'Open the log')]),
        ]));
        frag.appendChild(ready);

        frag.appendChild(el('p', {
            class: 'note', style: 'margin-top:26px',
            text: 'This system is a reference written from published civilian and open military doctrine. '
                + 'It cannot examine your casualty, see your weather or know your local law. Where emergency '
                + 'services exist, call them. Where training exists, take it — a page you have read is worth '
                + 'a fraction of a skill you have practised.',
        }));

        setTimeout(cacheStatus, 60);
        return frag;
    }

    /* ---------------------------------------------------------- chapter page */

    function pageChapter(id, anchor) {
        const ch = K.find(c => c.id === id);
        if (!ch) return pageMissing();
        const frag = document.createDocumentFragment();

        const head = el('div', { class: 'page-head' });
        head.appendChild(el('p', { class: 'eyebrow', text: 'Doctrine' }));
        head.appendChild(el('h1', null, [
            el('span', { class: 'g', 'aria-hidden': 'true', text: ch.glyph }),
            document.createTextNode(ch.title),
        ]));
        head.appendChild(el('p', { text: ch.blurb }));
        head.appendChild(el('div', { class: 'btn-row' }, [
            el('button', { class: 'btn ghost', type: 'button', onclick: () => window.print() }, '🖨 Print this chapter'),
        ]));
        const chSrc = sourceChips(ch.sources, 'Chapter drawn from');
        if (chSrc) head.appendChild(chSrc);
        frag.appendChild(head);

        const grid = el('div', { class: 'grid' });
        ch.cards.forEach(c => grid.appendChild(renderCard(c)));
        frag.appendChild(grid);

        const tools = TOOLS.filter(t => t.chapter === id);
        if (tools.length) {
            frag.appendChild(sectionHead('Tools'));
            const tg = el('div', { class: 'grid wide' });
            tools.forEach(t => tg.appendChild(renderTool(t)));
            frag.appendChild(tg);
        }

        T.filter(t => t.chapter === id).forEach(t => frag.appendChild(renderTable(t)));

        const links = LINKS.filter(l => l.chapter === id);
        if (links.length) {
            frag.appendChild(sectionHead('Sources worth mirroring'));
            const lg = el('div', { class: 'grid' });
            links.forEach(l => lg.appendChild(linkCard(l)));
            frag.appendChild(lg);
        }

        if (anchor) setTimeout(() => {
            const target = document.getElementById('card-' + anchor) || document.getElementById('tool-' + anchor);
            if (target) target.scrollIntoView({ block: 'start' });
        }, 40);

        return frag;
    }

    function linkCard(l) {
        return el('div', { class: 'card' }, [
            el('h3', { text: l.title }),
            el('p', { class: 'lede', text: l.what }),
            el('dl', { class: 'facts' }, [
                el('div', null, [el('dt', { text: 'URL' }), el('dd', { text: l.url })]),
                el('div', null, [el('dt', { text: 'Verified' }), el('dd', { text: l.checked })]),
            ]),
            el('div', { class: 'btn-row' }, [
                el('a', { class: 'btn ghost', href: l.url, target: '_blank', rel: 'noopener noreferrer external' }, 'Open ↗'),
            ]),
        ]);
    }

    /* --------------------------------------------------------- decision trees */

    /**
     * An interactive walker. The reader answers a few questions and lands on a
     * specific instruction rather than a chapter. It is a router into the
     * doctrine, never a replacement for it — every result links onward.
     */
    function renderTree(tree, autoStart) {
        const sec = el('section', { class: 'tree card', id: 'tree-' + tree.id });
        sec.appendChild(el('h3', null, [
            el('span', { class: 'g', 'aria-hidden': 'true', text: tree.glyph }),
            document.createTextNode(tree.title),
        ]));
        if (tree.lede) sec.appendChild(el('p', { class: 'lede', text: tree.lede }));

        const trail = el('ol', { class: 'trail' });
        const body = el('div', { class: 'tree-body' });
        const controls = el('div', { class: 'btn-row' });
        sec.append(trail, body, controls);

        let stack = [];

        function goTo(id) {
            const node = tree.nodes[id];
            body.textContent = '';
            if (!node) {
                body.appendChild(el('p', { class: 'note', text: 'That branch is missing. Start again.' }));
                return;
            }

            if (node.result) {
                const r = el('div', { class: 'tree-result' });
                const h = el('h4', null, [document.createTextNode(node.result)]);
                const tg = tagFor(node.tag);
                if (tg) h.appendChild(tg);
                r.appendChild(h);
                const ol = el('ol');
                (node.steps || []).forEach(s => ol.appendChild(el('li', null, rich(s))));
                r.appendChild(ol);
                if (node.note) r.appendChild(el('p', { class: 'note' }, rich(node.note)));
                if (node.link) r.appendChild(el('div', { class: 'btn-row' }, [
                    el('a', { class: 'btn', href: node.link }, 'Open the full guidance →'),
                ]));
                body.appendChild(r);
            } else {
                const q = el('div', { class: 'tree-q' });
                q.appendChild(el('p', { class: 'tree-question' }, rich(node.q)));
                if (node.hint) q.appendChild(el('p', { class: 'note', text: node.hint }));
                const opts = el('div', { class: 'tree-opts' });
                (node.options || []).forEach(o => {
                    opts.appendChild(el('button', {
                        type: 'button', class: 'tree-opt',
                        onclick: () => { stack.push({ id: id, answer: o.a }); goTo(o.to); },
                    }, o.a));
                });
                q.appendChild(opts);
                body.appendChild(q);
            }

            /* Breadcrumb of what has been answered so far. */
            trail.textContent = '';
            stack.forEach(s => trail.appendChild(el('li', { text: s.answer })));
            trail.hidden = !stack.length;

            controls.textContent = '';
            if (stack.length) {
                controls.appendChild(el('button', {
                    class: 'btn ghost', type: 'button',
                    onclick: () => { const prev = stack.pop(); goTo(prev.id); },
                }, '← Back'));
                controls.appendChild(el('button', {
                    class: 'btn ghost', type: 'button',
                    onclick: () => { stack = []; goTo(tree.start); },
                }, 'Start again'));
            }
        }

        if (autoStart) goTo(tree.start);
        else {
            body.appendChild(el('div', { class: 'btn-row' }, [
                el('button', { class: 'btn', type: 'button', onclick: () => goTo(tree.start) }, 'Start ▸'),
            ]));
        }
        return sec;
    }

    function pageNow(treeId) {
        const frag = document.createDocumentFragment();

        const head = el('div', { class: 'page-head' });
        head.appendChild(el('p', { class: 'eyebrow', text: 'Immediate' }));
        head.appendChild(el('h1', null, [
            el('span', { class: 'g', 'aria-hidden': 'true', text: '⌁' }),
            document.createTextNode('I need help now'),
        ]));
        head.appendChild(el('p', {
            text: 'If you do not know what is happening or what to do, start with the first question below. '
                + 'Everything here is a few taps from an actual instruction.',
        }));
        frag.appendChild(head);

        frag.appendChild(sectionHead('Minutes matter — go straight there'));
        const fast = el('div', { class: 'jump' });
        [['Severe bleeding', '#/c/medical/bleeding'],
        ['Not breathing — CPR', '#/c/medical/cpr'],
        ['Choking', '#/c/medical/choking'],
        ['Unconscious but breathing', '#/c/medical/airway'],
        ['Stabbed or shot', '#/c/medical/penetrating'],
        ['Fire', '#/play/structure-fire'],
        ['Fumes, gas or poison', '#/c/medical/poisoning'],
        ['Drowning', '#/c/medical/drowning'],
        ['Electric shock', '#/c/medical/electrical'],
        ['Trapped or crushed', '#/c/medical/crush'],
        ['Someone is threatening us', '#/play/threat'],
        ['Send a distress call', '#/c/triage/mayday'],
        ['Lost', '#/c/nav/nav-lost']]
            .forEach(([t, h]) => fast.appendChild(el('a', { class: 'jump-link urgent', href: h }, t)));
        frag.appendChild(fast);

        const one = treeId && TREES.filter(t => t.id === treeId)[0];
        if (one) {
            frag.appendChild(sectionHead(one.title));
            frag.appendChild(renderTree(one, true));
            frag.appendChild(el('div', { class: 'btn-row' }, [
                el('a', { class: 'btn ghost', href: '#/now' }, '← All decision guides'),
            ]));
            return frag;
        }

        frag.appendChild(sectionHead('Work it out — answer a few questions'));
        const g = el('div', { class: 'grid wide' });
        TREES.forEach(t => g.appendChild(renderTree(t, t.id === 'unknown')));
        frag.appendChild(g);

        frag.appendChild(el('p', {
            class: 'note', style: 'margin-top:24px',
            text: 'These guides route you to the right page fast. They do not replace the chapters — '
                + 'read those on a calm day, because that is when the reading actually sticks.',
        }));
        return frag;
    }

    /* ------------------------------------------------------- position actions */

    /**
     * The stored fix is not just a number to look at — it is the input to half
     * the system. Clicking the chip opens what you can actually do with it,
     * including a locally drawn map. There are no tiles to fetch and never will
     * be, so the map is built from your own saved waypoints and a scale grid:
     * honest about what it is, and it works with the cable cut.
     */
    function positionPanel() {
        const fix = store.get('fix', null);
        const wrap = el('div', { class: 'card pos-panel' });

        wrap.appendChild(el('h3', null, [
            el('span', { class: 'g', 'aria-hidden': 'true', text: '⌖' }),
            document.createTextNode('Position'),
        ]));

        if (!fix) {
            wrap.appendChild(el('p', { class: 'lede', text: 'No position stored yet. Take a fix while you still have a clear sky and a charged battery — it costs nothing and it is the one thing you cannot reconstruct later.' }));
            wrap.appendChild(el('div', { class: 'btn-row' }, [
                el('button', { class: 'btn', type: 'button', onclick: getFix }, '⌖ Take a fix'),
            ]));
            return wrap;
        }

        const G = window.GEO;
        const age = Math.round((Date.now() - fix.t) / 60000);
        wrap.appendChild(el('dl', { class: 'facts' }, [
            el('div', null, [el('dt', { text: 'Decimal' }), el('dd', { text: `${fix.lat.toFixed(6)}, ${fix.lon.toFixed(6)}` })]),
            el('div', null, [el('dt', { text: 'Deg + min' }), el('dd', { text: G.toDDM(fix.lat, fix.lon) })]),
            el('div', null, [el('dt', { text: 'MGRS' }), el('dd', { text: G.toMGRS(fix.lat, fix.lon, 5) || '—' })]),
            el('div', null, [el('dt', { text: 'UTM' }), el('dd', { text: (u => u ? `${u.zone}${u.band} ${Math.round(u.easting)}E ${Math.round(u.northing)}N` : '—')(G.toUTM(fix.lat, fix.lon)) })]),
            el('div', null, [el('dt', { text: 'Grid square' }), el('dd', { text: G.toMaidenhead(fix.lat, fix.lon, 6) })]),
            el('div', null, [el('dt', { text: 'Accuracy' }), el('dd', { text: `±${Math.round(fix.acc)} m` })]),
            el('div', null, [el('dt', { text: 'Taken' }), el('dd', { text: `${new Date(fix.t).toLocaleString()} (${age < 60 ? age + ' min' : Math.round(age / 60) + ' h'} ago)` })]),
        ]));

        const sun = G.sunPosition(new Date(), fix.lat, fix.lon);
        const times = G.sunTimes(new Date(), fix.lat, fix.lon, [-0.833]);
        const day = times.events['-0.833'];
        wrap.appendChild(el('p', { class: 'note' }, rich(
            `Sun bearing here and now: **${sun.azimuth.toFixed(0)}° true** (${G.compassPoint(sun.azimuth)}), `
            + `altitude ${sun.altitude.toFixed(0)}°. `
            + (day.state === 'ok' && day.set
                ? `Sunset ${day.set.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}.`
                : '')
            + ' Point that bearing at the sun and you have found true north without a compass.'
        )));

        const map = el('div', { class: 'pos-map' });
        wrap.appendChild(map);
        drawLocalMap(map, fix);

        const actions = el('div', { class: 'btn-row' });
        const add = (label, fn, ghost) => actions.appendChild(
            el('button', { class: 'btn' + (ghost ? ' ghost' : ''), type: 'button', onclick: fn }, label));

        add('⌖ Update fix', getFix);
        add('⧉ Copy all formats', () => {
            const txt = [
                `${fix.lat.toFixed(6)}, ${fix.lon.toFixed(6)} (WGS84)`,
                G.toDDM(fix.lat, fix.lon),
                G.toDMS(fix.lat, fix.lon),
                'MGRS ' + (G.toMGRS(fix.lat, fix.lon, 5) || '—'),
                'Grid ' + G.toMaidenhead(fix.lat, fix.lon, 6),
                '±' + Math.round(fix.acc) + ' m, ' + new Date(fix.t).toISOString(),
            ].join('\n');
            copyText(txt, 'Position copied in every format.');
        }, true);
        add('✎ Log this position', () => {
            const entries = store.get('log', []);
            entries.push({ t: Date.now(), text: `POSITION ${fix.lat.toFixed(6)}, ${fix.lon.toFixed(6)} (WGS84) · ${G.toMGRS(fix.lat, fix.lon, 5) || ''} · ±${Math.round(fix.acc)} m` });
            store.set('log', entries);
            toast('Position written to the field log.');
        }, true);
        add('◎ Save as waypoint', () => {
            const name = prompt('Name for this waypoint:', 'WP ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
            if (name === null) return;
            const wps = store.get('waypoints', []);
            wps.push({ name: name || 'WP', lat: fix.lat, lon: fix.lon, t: Date.now() });
            store.set('waypoints', wps);
            toast(`Waypoint "${name}" saved. ${wps.length} stored.`);
            route();
        }, true);
        add('▤ Send to plot board', () => {
            const wps = store.get('waypoints', []);
            const lines = [`HERE, ${fix.lat.toFixed(6)}, ${fix.lon.toFixed(6)}`]
                .concat(wps.map(w => `${w.name}, ${w.lat.toFixed(6)}, ${w.lon.toFixed(6)}`));
            const saved = store.get('tool.plot', {});
            saved.wps = lines.join('\n');
            store.set('tool.plot', saved);
            toast('Loaded into the plot board.');
            location.hash = '#/c/nav/plot';
        }, true);
        add('⭳ Export GPX', () => exportGPX(fix), true);
        wrap.appendChild(actions);

        const wps = store.get('waypoints', []);
        if (wps.length) {
            wrap.appendChild(sectionHead('Saved waypoints'));
            const list = el('div', { class: 'wp-list' });
            wps.forEach((w, i) => {
                const d = G.distance(fix.lat, fix.lon, w.lat, w.lon);
                const b = G.bearing(fix.lat, fix.lon, w.lat, w.lon);
                list.appendChild(el('div', { class: 'wp-row' }, [
                    el('b', { text: w.name }),
                    el('span', { class: 'mono', text: `${G.fmtDistance(d)} · ${b.toFixed(0).padStart(3, '0')}° true (${G.compassPoint(b)})` }),
                    el('button', {
                        class: 'btn ghost', type: 'button', style: 'padding:2px 9px;font-size:.72em',
                        onclick: () => {
                            const all = store.get('waypoints', []);
                            all.splice(i, 1);
                            store.set('waypoints', all);
                            route();
                        },
                    }, 'Delete'),
                ]));
            });
            wrap.appendChild(list);
        }

        wrap.appendChild(el('p', { class: 'note' }, rich(
            'There are no map tiles here and there never will be — that would mean fetching from a server. '
            + 'The map above is drawn from your own fix and saved waypoints with a true scale bar and north '
            + 'arrow. For real terrain, print a paper map of your area **before** you need it.')));
        return wrap;
    }

    /** A scale plot of the fix and stored waypoints. No tiles, no network. */
    function drawLocalMap(host, fix) {
        const G = window.GEO;
        let cv = host.querySelector('canvas');
        if (!cv) {
            cv = el('canvas', { class: 'plot', width: 900, height: 560, role: 'img', 'aria-label': 'Local position plot' });
            host.appendChild(cv);
        }
        const g = cv.getContext('2d');
        const cs = getComputedStyle(document.documentElement);
        const ink = cs.getPropertyValue('--ink').trim() || '#ddd';
        const dim = cs.getPropertyValue('--ink-dim').trim() || '#888';
        const acc = cs.getPropertyValue('--accent').trim() || '#5f5';
        const warn = cs.getPropertyValue('--warn').trim() || '#fa4';
        const bg = cs.getPropertyValue('--bg-2').trim() || '#111';

        g.fillStyle = bg;
        g.fillRect(0, 0, cv.width, cv.height);

        const wps = store.get('waypoints', []);
        const pts = wps.map(w => Object.assign({}, w, G.project(fix.lat, fix.lon, w.lat, w.lon)));
        const far = pts.reduce((m, p) => Math.max(m, Math.hypot(p.x, p.y)), 0);
        const span = Math.max(far * 2.4, 400);                 // metres across
        const k = Math.min(cv.width, cv.height) / span;
        const cx = cv.width / 2, cy = cv.height / 2;
        const X = x => cx + x * k, Y = y => cy - y * k;

        /* Range rings at a round interval. */
        const raw = span / 5;
        const pow = Math.pow(10, Math.floor(Math.log10(raw)));
        let ring = [1, 2, 5, 10].map(m => m * pow).filter(s => s >= raw)[0] || pow * 10;
        if (!isFinite(ring) || ring <= 0) ring = 100;

        g.strokeStyle = dim;
        g.font = '600 12px ui-monospace, monospace';
        for (let r = ring; r <= span; r += ring) {
            g.globalAlpha = 0.22;
            g.beginPath(); g.arc(cx, cy, r * k, 0, Math.PI * 2); g.stroke();
            g.globalAlpha = 0.5;
            g.fillStyle = dim;
            g.fillText(r >= 1000 ? (r / 1000) + ' km' : r + ' m', cx + 4, cy - r * k - 4);
        }
        g.globalAlpha = 1;

        /* Cardinal spokes. */
        g.strokeStyle = dim; g.globalAlpha = 0.25;
        [0, 90, 180, 270].forEach(a => {
            const rad = a * Math.PI / 180;
            g.beginPath(); g.moveTo(cx, cy);
            g.lineTo(cx + Math.sin(rad) * cv.height, cy - Math.cos(rad) * cv.height);
            g.stroke();
        });
        g.globalAlpha = 1;
        g.fillStyle = ink;
        g.font = '700 15px ui-monospace, monospace';
        g.fillText('N', cx - 5, 20);
        g.fillText('S', cx - 5, cv.height - 8);
        g.fillText('E', cv.width - 18, cy + 5);
        g.fillText('W', 8, cy + 5);

        /* Waypoints. */
        g.font = '600 14px ui-monospace, monospace';
        pts.forEach(p => {
            const px = X(p.x), py = Y(p.y);
            g.fillStyle = acc;
            g.beginPath(); g.arc(px, py, 5, 0, Math.PI * 2); g.fill();
            g.strokeStyle = acc; g.globalAlpha = 0.45; g.lineWidth = 1;
            g.beginPath(); g.moveTo(cx, cy); g.lineTo(px, py); g.stroke();
            g.globalAlpha = 1;
            g.fillStyle = ink;
            g.fillText(p.name, px + 9, py + 4);
        });

        /* You. */
        g.fillStyle = warn;
        g.beginPath(); g.arc(cx, cy, 7, 0, Math.PI * 2); g.fill();
        g.strokeStyle = bg; g.lineWidth = 2; g.stroke();
        g.fillStyle = warn;
        g.font = '700 13px ui-monospace, monospace';
        g.fillText('YOU', cx + 11, cy - 9);

        /* Accuracy circle. */
        if (fix.acc && fix.acc * k > 3) {
            g.strokeStyle = warn; g.globalAlpha = 0.5; g.setLineDash([4, 4]);
            g.beginPath(); g.arc(cx, cy, fix.acc * k, 0, Math.PI * 2); g.stroke();
            g.setLineDash([]); g.globalAlpha = 1;
        }
    }

    function copyText(txt, msg) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(txt).then(() => toast(msg)).catch(() => toast('Could not copy.'));
        } else {
            const ta = el('textarea', { style: 'position:fixed;opacity:0' });
            ta.value = txt;
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); toast(msg); } catch (e) { toast('Could not copy.'); }
            ta.remove();
        }
    }

    /** GPX is the universal exchange format for GPS units and mapping apps. */
    function exportGPX(fix) {
        const wps = store.get('waypoints', []).slice();
        if (fix) wps.unshift({ name: 'CURRENT FIX', lat: fix.lat, lon: fix.lon, t: fix.t });
        if (!wps.length) { toast('No waypoints to export.'); return; }
        const esc = s => String(s).replace(/[<>&"']/g, c =>
            ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));
        const body = wps.map(w =>
            `  <wpt lat="${w.lat.toFixed(7)}" lon="${w.lon.toFixed(7)}">\n` +
            `    <name>${esc(w.name)}</name>\n` +
            (w.t ? `    <time>${new Date(w.t).toISOString()}</time>\n` : '') +
            `  </wpt>`).join('\n');
        const gpx = `<?xml version="1.0" encoding="UTF-8"?>\n`
            + `<gpx version="1.1" creator="OASIS" xmlns="http://www.topografix.com/GPX/1/1">\n`
            + `  <metadata><name>OASIS waypoints</name><time>${new Date().toISOString()}</time></metadata>\n`
            + body + `\n</gpx>\n`;
        downloadBlob(gpx, 'oasis-waypoints.gpx', 'application/gpx+xml');
        toast(`${wps.length} waypoints exported as GPX.`);
    }

    function downloadBlob(text, filename, type) {
        const blob = new Blob([text], { type: type || 'text/plain' });
        const a = el('a', { href: URL.createObjectURL(blob), download: filename });
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }

    function pagePosition() {
        const frag = document.createDocumentFragment();
        const head = el('div', { class: 'page-head' });
        head.appendChild(el('p', { class: 'eyebrow', text: 'Navigation' }));
        head.appendChild(el('h1', null, [
            el('span', { class: 'g', 'aria-hidden': 'true', text: '⌖' }),
            document.createTextNode('Where I am'),
        ]));
        head.appendChild(el('p', { text: 'Your stored fix, in every format anyone will ask for, with the things you can actually do with it.' }));
        frag.appendChild(head);
        frag.appendChild(positionPanel());
        frag.appendChild(el('div', { class: 'btn-row', style: 'margin-top:16px' }, [
            el('a', { class: 'btn ghost', href: '#/c/nav' }, 'Navigation chapter'),
            el('a', { class: 'btn ghost', href: '#/now/where' }, 'Which way is north?'),
            el('a', { class: 'btn ghost', href: '#/c/nav/plot' }, 'Plot board'),
        ]));
        return frag;
    }

    /* --------------------------------------------------- emergency card page */

    const CARD_FIELDS = [
        { k: 'name', label: 'Full name', ph: '' },
        { k: 'dob', label: 'Date of birth', ph: '' },
        { k: 'blood', label: 'Blood group', ph: 'e.g. O+' },
        { k: 'allergies', label: 'Allergies', ph: 'Drug, food, insect — or "none known"', big: true },
        { k: 'meds', label: 'Regular medication', ph: 'Generic names and doses — brand names differ between countries', big: true },
        { k: 'conditions', label: 'Medical conditions', ph: 'Asthma, diabetes, epilepsy, pacemaker, pregnancy…', big: true },
        { k: 'ice1', label: 'Emergency contact 1', ph: 'Name, relationship, phone' },
        { k: 'ice2', label: 'Emergency contact 2', ph: 'Name, relationship, phone' },
        { k: 'outArea', label: 'Out-of-area contact', ph: 'Someone far away — local circuits jam first' },
        { k: 'rally1', label: 'Rally point — near home', ph: 'Where you meet if the house is not usable' },
        { k: 'rally2', label: 'Rally point — outside the area', ph: 'Where you meet if the area is evacuated' },
        { k: 'pace', label: 'PACE plan', ph: 'Primary / Alternate / Contingency / Emergency — how you communicate', big: true },
        { k: 'radio', label: 'Radio plan', ph: 'Channel or frequency, and the times you listen', big: true },
        { k: 'notes', label: 'Other', ph: 'Insurance numbers, doctor, vet, anything you would want on paper', big: true },
    ];

    function pageCard() {
        const frag = document.createDocumentFragment();
        const data = store.get('card', {});

        const head = el('div', { class: 'page-head no-print' });
        head.appendChild(el('p', { class: 'eyebrow', text: 'Systems' }));
        head.appendChild(el('h1', null, [
            el('span', { class: 'g', 'aria-hidden': 'true', text: '▭' }),
            document.createTextNode('Emergency card'),
        ]));
        head.appendChild(el('p', {
            text: 'One page, on paper, in a wallet and a go bag and a glovebox. Paper needs no battery, no '
                + 'password and no signal, and it works when you are unconscious. Fill it in once, print it, '
                + 'and update it when something changes. It never leaves this device.',
        }));
        head.appendChild(el('div', { class: 'btn-row' }, [
            el('button', { class: 'btn', type: 'button', onclick: () => window.print() }, '🖨 Print the card'),
            el('button', {
                class: 'btn ghost', type: 'button', onclick: () => {
                    const lines = ['O.A.S.I.S. EMERGENCY CARD', ''];
                    CARD_FIELDS.forEach(f => lines.push(f.label + ': ' + (data[f.k] || '')));
                    downloadBlob(lines.join('\n'), 'emergency-card.txt', 'text/plain');
                },
            }, '⭳ Export as text'),
            el('button', {
                class: 'btn ghost', type: 'button', onclick: () => {
                    if (!confirm('Clear every field on this card?')) return;
                    store.set('card', {});
                    route();
                },
            }, 'Clear'),
        ]));
        frag.appendChild(head);

        const form = el('div', { class: 'card card-form' });
        const fields = el('div', { class: 'fields' });
        CARD_FIELDS.forEach(f => {
            const wrap = el('label', { class: 'field' + (f.big ? ' span-all' : '') });
            wrap.appendChild(el('span', { text: f.label }));
            const input = f.big
                ? el('textarea', { name: f.k, rows: 2, placeholder: f.ph })
                : el('input', { name: f.k, type: 'text', placeholder: f.ph, autocomplete: 'off' });
            input.value = data[f.k] || '';
            input.addEventListener('input', () => {
                const d = store.get('card', {});
                d[f.k] = input.value;
                store.set('card', d);
                const out = document.getElementById('cardline-' + f.k);
                if (out) out.textContent = input.value || '—';
            });
            wrap.appendChild(input);
            fields.appendChild(wrap);
        });
        form.appendChild(fields);
        frag.appendChild(form);

        /* The printable side. Hidden on screen, this is what comes out. */
        const sheet = el('div', { class: 'print-card' });
        sheet.appendChild(el('h2', { text: 'EMERGENCY CARD' }));
        const dl = el('dl', { class: 'facts' });
        CARD_FIELDS.forEach(f => dl.appendChild(el('div', null, [
            el('dt', { text: f.label }),
            el('dd', { id: 'cardline-' + f.k, text: data[f.k] || '—' }),
        ])));
        sheet.appendChild(dl);

        const fix = store.get('fix', null);
        sheet.appendChild(el('p', { class: 'note', text: fix
            ? `Home / last known position: ${fix.lat.toFixed(5)}, ${fix.lon.toFixed(5)} (WGS84) · ${window.GEO.toMGRS(fix.lat, fix.lon, 4) || ''}`
            : 'No position stored on this device.' }));
        sheet.appendChild(el('p', { class: 'note', text: 'Emergency numbers: 112 across the EU and much of the world · 911 in North America · 999 in the UK and Ireland · 000 in Australia. 112 reaches any available network, not only your own operator.' }));
        frag.appendChild(sheet);

        frag.appendChild(el('p', {
            class: 'note no-print', style: 'margin-top:18px',
            text: 'Print it, fold it, and put a copy in every bag. Write the date on it. '
                + 'If you carry nothing else from this system, carry this.',
        }));
        return frag;
    }

    /* ------------------------------------------------------- playbooks page */

    /** One scenario: what to do before, during and after. */
    function renderScenario(s) {
        const c = el('article', { class: 'card scenario', id: 'play-' + s.id });

        const h = el('h3', null, [
            el('span', { class: 'g', 'aria-hidden': 'true', text: s.glyph }),
            document.createTextNode(s.title),
        ]);
        c.appendChild(h);
        if (s.horizon) c.appendChild(el('p', { class: 'horizon', text: '⏱ ' + s.horizon }));
        if (s.lede) c.appendChild(el('p', { class: 'lede' }, rich(s.lede)));

        const phases = el('div', { class: 'phases' });
        [['before', 'Before', 'Prepare'], ['during', 'During', 'Act'], ['after', 'After', 'Recover']]
            .forEach(([key, title, sub]) => {
                const list = s[key];
                if (!list || !list.length) return;
                const box = el('section', { class: 'phase ' + key });
                box.appendChild(el('h4', null, [
                    document.createTextNode(title),
                    el('span', { class: 'phase-sub', text: sub }),
                ]));
                const ol = el('ol');
                list.forEach(x => ol.appendChild(el('li', null, rich(x))));
                box.appendChild(ol);
                phases.appendChild(box);
            });
        c.appendChild(phases);

        if (s.facts && s.facts.length) {
            const dl = el('dl', { class: 'facts' });
            s.facts.forEach(([k, v]) => dl.appendChild(el('div', null, [
                el('dt', null, rich(k)), el('dd', null, rich(v)),
            ])));
            c.appendChild(dl);
        }

        if (s.dont && s.dont.length) {
            const box = el('div', { class: 'dont' }, el('h4', { text: 'Do not' }));
            const ul = el('ul');
            s.dont.forEach(x => ul.appendChild(el('li', null, rich(x))));
            box.appendChild(ul);
            c.appendChild(box);
        }

        const src = sourceChips(s.sources);
        if (src) c.appendChild(src);
        return c;
    }

    function pagePlaybooks(anchor) {
        const frag = document.createDocumentFragment();

        const head = el('div', { class: 'page-head' });
        head.appendChild(el('p', { class: 'eyebrow', text: 'Playbooks' }));
        head.appendChild(el('h1', null, [
            el('span', { class: 'g', 'aria-hidden': 'true', text: '▤' }),
            document.createTextNode('Before · During · After'),
        ]));
        head.appendChild(el('p', {
            text: `${SCEN.length} situations, each answered in three parts. `
                + 'The "before" column is where survival is actually decided and it is the part almost '
                + 'nobody does. The "after" column matters more than people expect — in storms, floods '
                + 'and earthquakes a large share of the deaths happen once the event is over.',
        }));
        head.appendChild(el('div', { class: 'btn-row' }, [
            el('button', { class: 'btn ghost', type: 'button', onclick: () => window.print() }, '🖨 Print all playbooks'),
        ]));
        frag.appendChild(head);

        /* Jump grid — there are far too many playbooks to scroll blindly. */
        const jump = el('div', { class: 'jump' });
        SCEN.forEach(s => jump.appendChild(
            el('a', { class: 'jump-link', href: '#/play/' + s.id }, [
                el('span', { 'aria-hidden': 'true', text: s.glyph }),
                document.createTextNode(' ' + s.title),
            ])
        ));
        frag.appendChild(jump);

        BANDS.forEach(band => {
            const list = SCEN.filter(s => s.band === band.id);
            if (!list.length) return;
            frag.appendChild(sectionHead(band.title));
            if (band.blurb) frag.appendChild(el('p', { class: 'note', style: 'margin:-6px 0 14px', text: band.blurb }));
            const g = el('div', { class: 'grid wide' });
            list.forEach(s => g.appendChild(renderScenario(s)));
            frag.appendChild(g);
        });

        if (anchor) setTimeout(() => {
            const t = document.getElementById('play-' + anchor);
            if (t) t.scrollIntoView({ block: 'start' });
        }, 40);

        return frag;
    }

    /* -------------------------------------------------------------- tools page */

    function pageTools() {
        const frag = document.createDocumentFragment();
        const head = el('div', { class: 'page-head' });
        head.appendChild(el('p', { class: 'eyebrow', text: 'Systems' }));
        head.appendChild(el('h1', null, [el('span', { class: 'g', text: '⚙' }), document.createTextNode('All tools')]));
        head.appendChild(el('p', { text: `${TOOLS.length} calculators. Everything runs locally in your browser — no data leaves this device, and your inputs are remembered between visits.` }));
        frag.appendChild(head);

        const byChapter = {};
        TOOLS.forEach(t => (byChapter[t.chapter] = byChapter[t.chapter] || []).push(t));
        K.forEach(ch => {
            const list = byChapter[ch.id];
            if (!list) return;
            frag.appendChild(sectionHead(`${ch.glyph}  ${ch.title}`));
            const g = el('div', { class: 'grid wide' });
            list.forEach(t => g.appendChild(renderTool(t)));
            frag.appendChild(g);
        });
        return frag;
    }

    /* ---------------------------------------------------------------- log page */

    function pageLog() {
        const frag = document.createDocumentFragment();
        const head = el('div', { class: 'page-head' });
        head.appendChild(el('p', { class: 'eyebrow', text: 'Systems' }));
        head.appendChild(el('h1', null, [el('span', { class: 'g', text: '✎' }), document.createTextNode('Field log')]));
        head.appendChild(el('p', { text: 'Timestamped notes, stored only on this device. Record decisions, doses, positions, radio contacts and who went where. Memory is the first thing stress takes.' }));
        frag.appendChild(head);

        const ta = el('textarea', {
            rows: 3, placeholder: 'What happened? (Ctrl+Enter to save)',
            'aria-label': 'New log entry',
            style: 'width:100%;font:inherit;font-size:.95em;padding:11px;border-radius:10px;background:var(--panel-2);color:var(--ink);border:1px solid var(--line);resize:vertical',
        });
        frag.appendChild(ta);

        const list = el('div', { class: 'grid', style: 'margin-top:16px' });

        function draw() {
            list.textContent = '';
            const entries = store.get('log', []);
            if (!entries.length) {
                list.appendChild(el('p', { class: 'note', text: 'No entries yet.' }));
                return;
            }
            entries.slice().reverse().forEach(e => {
                list.appendChild(el('div', { class: 'log-entry' }, [
                    el('time', { datetime: new Date(e.t).toISOString(), text: new Date(e.t).toLocaleString() }),
                    el('p', { text: e.text }),
                    el('button', {
                        class: 'btn ghost', type: 'button', style: 'margin-top:8px;padding:3px 10px;font-size:.75em',
                        onclick: () => {
                            store.set('log', store.get('log', []).filter(x => x.t !== e.t));
                            draw();
                        },
                    }, 'Delete'),
                ]));
            });
        }

        function add() {
            const text = ta.value.trim();
            if (!text) return;
            const entries = store.get('log', []);
            entries.push({ t: Date.now(), text });
            store.set('log', entries);
            ta.value = '';
            draw();
            toast('Entry logged.');
        }

        ta.addEventListener('keydown', e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); add(); }
        });

        frag.appendChild(el('div', { class: 'btn-row' }, [
            el('button', { class: 'btn', type: 'button', onclick: add }, 'Save entry'),
            el('button', {
                class: 'btn ghost', type: 'button', onclick: () => {
                    const fix = store.get('fix', null);
                    ta.value = (ta.value ? ta.value + ' ' : '')
                        + (fix ? `POS ${fix.lat.toFixed(5)}, ${fix.lon.toFixed(5)}` : '[no stored fix]');
                    ta.focus();
                },
            }, '⌖ Insert position'),
            el('button', { class: 'btn ghost', type: 'button', onclick: exportLog }, '⭳ Export as text'),
            el('button', {
                class: 'btn ghost', type: 'button', onclick: () => {
                    if (!confirm('Delete every log entry on this device? This cannot be undone.')) return;
                    store.set('log', []); draw(); toast('Log cleared.');
                },
            }, 'Clear log'),
        ]));

        frag.appendChild(list);
        draw();
        return frag;
    }

    function exportLog() {
        const entries = store.get('log', []);
        if (!entries.length) { toast('Nothing to export.'); return; }
        const lines = ['O.A.S.I.S. FIELD LOG', 'Exported ' + new Date().toISOString(), ''.padEnd(48, '-')];
        entries.forEach(e => {
            lines.push(new Date(e.t).toISOString().replace('T', ' ').slice(0, 19) + 'Z');
            lines.push(e.text);
            lines.push('');
        });
        downloadBlob(lines.join('\n'), 'oasis-log.txt', 'text/plain');
    }

    /* ------------------------------------------------------------ library page */

    function pageLibrary() {
        const frag = document.createDocumentFragment();
        const head = el('div', { class: 'page-head' });
        head.appendChild(el('p', { class: 'eyebrow', text: 'Systems' }));
        head.appendChild(el('h1', null, [el('span', { class: 'g', text: '⛁' }), document.createTextNode('Sources')]));
        head.appendChild(el('p', {
            text: 'None of these are loaded by this page — it never touches the network. They are listed so that, '
                + 'while you still have connectivity, you know exactly what is worth downloading and keeping locally. '
                + 'Mirror them onto storage that does not need a data connection to read.',
        }));
        frag.appendChild(head);

        const byChapter = {};
        LINKS.forEach(l => (byChapter[l.chapter] = byChapter[l.chapter] || []).push(l));
        K.forEach(ch => {
            const list = byChapter[ch.id];
            if (!list) return;
            frag.appendChild(sectionHead(`${ch.glyph}  ${ch.title}`));
            const g = el('div', { class: 'grid' });
            list.forEach(l => g.appendChild(linkCard(l)));
            frag.appendChild(g);
        });
        return frag;
    }

    /* -------------------------------------------------------------- about page */

    function pageAbout() {
        const frag = document.createDocumentFragment();
        const head = el('div', { class: 'page-head' });
        head.appendChild(el('p', { class: 'eyebrow', text: 'Systems' }));
        head.appendChild(el('h1', null, [el('span', { class: 'g', text: 'ⓘ' }), document.createTextNode('About & offline')]));
        head.appendChild(el('p', { text: 'How to make sure this works when nothing else does.' }));
        frag.appendChild(head);

        const g = el('div', { class: 'grid' });

        g.appendChild(installCard());

        g.appendChild(el('div', { class: 'card' }, [
            el('h3', null, [document.createTextNode('Make it permanent'), tagFor('priority')]),
            el('p', { class: 'lede', text: 'Three minutes now buys you a reference that survives the network.' }),
            el('ol', null, [
                el('li', null, rich('**Install it.** In Chrome or Edge use the install icon in the address bar; on iOS use Share → Add to Home Screen. It then opens like an app, full screen, with no browser and no connection.')),
                el('li', null, rich('**Cache everything** with the button below, then turn off your Wi-Fi and mobile data and reload. If it still works, you are done.')),
                el('li', null, rich('**Print the pages you would want with a dead battery** — First Response, Medical, and the frequency tables. Every chapter has a print button that produces a clean two-column layout.')),
                el('li', null, rich('**Put a copy on a second device**, and on a USB stick. This whole system is a folder of plain files: copy the folder, open `index.html`, and it runs.')),
            ]),
            el('div', { class: 'btn-row' }, [
                el('button', { class: 'btn', type: 'button', onclick: precache }, 'Cache everything now'),
                el('button', { class: 'btn ghost', type: 'button', onclick: persist }, 'Ask for permanent storage'),
                el('button', { class: 'btn ghost', type: 'button', onclick: () => window.print() }, '🖨 Print'),
            ]),
            el('p', { class: 'note', id: 'aboutCache', text: '' }),
        ]));

        g.appendChild(el('div', { class: 'card' }, [
            el('h3', null, [document.createTextNode('Tell us what is missing'), tagFor('priority')]),
            el('p', { class: 'lede', text: 'This system is only as good as its gaps are reported. If something you needed was not here, was wrong, was out of date for your country, or was hard to find — say so. That is genuinely the most useful thing you can send.' }),
            el('dl', { class: 'facts' }, [
                el('div', null, [el('dt', { text: 'Contact' }), el('dd', null, [el('a', { href: 'mailto:' + CONFIG.contact }, CONFIG.contact)])]),
                el('div', null, [el('dt', { text: 'Most useful' }), el('dd', { text: 'the search word you tried that found nothing' })]),
                el('div', null, [el('dt', { text: 'Also useful' }), el('dd', { text: 'local alerting systems, national emergency numbers, regional hazards' })]),
                el('div', null, [el('dt', { text: 'Corrections' }), el('dd', { text: 'cite the authority — guidance differs by country and by year' })]),
            ]),
            el('div', { class: 'btn-row' }, [
                el('a', { class: 'btn', href: 'mailto:' + CONFIG.contact + '?subject=OASIS%20—%20missing%20information' }, '✉ Report a gap'),
            ]),
            el('p', { class: 'note', text: 'This system is moving to its own home at ' + CONFIG.futureHome + '. Everything is relative and self-contained, so an installed copy and any bookmark you keep locally will continue to work either way.' }),
        ]));

        g.appendChild(el('div', { class: 'card' }, [
            el('h3', { text: 'What this is' }),
            el('p', { class: 'lede', text: 'A single-folder, dependency-free reference system. No build step, no framework, no fonts, no analytics, no cookies, no accounts and no outbound request of any kind.' }),
            el('dl', { class: 'facts' }, [
                el('div', null, [el('dt', { text: 'Version' }), el('dd', { text: VERSION })]),
                el('div', null, [el('dt', { text: 'Chapters' }), el('dd', { text: String(K.length) })]),
                el('div', null, [el('dt', { text: 'Playbooks' }), el('dd', { text: String(SCEN.length) })]),
                el('div', null, [el('dt', { text: 'Cards' }), el('dd', { text: String(K.reduce((s, c) => s + c.cards.length, 0)) })]),
                el('div', null, [el('dt', { text: 'Tables' }), el('dd', { text: String(T.length) })]),
                el('div', null, [el('dt', { text: 'Tools' }), el('dd', { text: String(TOOLS.length) })]),
                el('div', null, [el('dt', { text: 'External requests' }), el('dd', { text: '0' })]),
            ]),
        ]));

        g.appendChild(el('div', { class: 'card' }, [
            el('h3', null, [document.createTextNode('Limits — read this'), tagFor('critical')]),
            el('p', { class: 'lede', text: 'Being honest about what a document cannot do is part of being useful.' }),
            el('ul', null, [
                el('li', null, rich('This is **general reference**, assembled from published civilian guidance and open military doctrine. It is not medical, legal or engineering advice for your specific situation.')),
                el('li', null, rich('Guidance **varies by country and by year**. Resuscitation ratios, radio allocations and legal duties all differ. Check your local authority where it matters.')),
                el('li', null, rich('**Training beats reading.** Take a first aid course. Get a radio licence. Walk with a map and compass on a clear day. A page you have read is worth a fraction of a skill you have practised.')),
                el('li', null, rich('The calculators are **decision aids**, not instruments. Cross-check anything that matters, and prefer a measurement over a model.')),
                el('li', null, rich('Where emergency services exist, **call them first**. This system is for the gap before they arrive, or the situation where they cannot.')),
            ]),
        ]));

        g.appendChild(el('div', { class: 'card' }, [
            el('h3', { text: 'Privacy' }),
            el('p', { class: 'lede', text: 'Everything you type stays in this browser, on this device.' }),
            el('ul', null, [
                el('li', { text: 'No analytics, no cookies, no fingerprinting, no third-party code.' }),
                el('li', { text: 'Tool inputs, your field log and your last position fix are stored in localStorage and never transmitted.' }),
                el('li', { text: 'Location is only read when you press "Get fix", and only stored locally.' }),
                el('li', { text: 'The external sources page contains plain links. Nothing is fetched unless you click one.' }),
            ]),
            el('div', { class: 'btn-row' }, [
                el('button', {
                    class: 'btn ghost', type: 'button', onclick: () => {
                        if (!confirm('Erase all O.A.S.I.S. data on this device — log, saved tool inputs, position and settings?')) return;
                        ['log', 'fix', 'theme', 'fs'].forEach(store.del);
                        TOOLS.forEach(t => store.del('tool.' + t.id));
                        toast('All local data erased.');
                        setTimeout(() => location.reload(), 700);
                    },
                }, 'Erase all local data'),
            ]),
        ]));

        g.appendChild(el('div', { class: 'card' }, [
            el('h3', { text: 'Keyboard' }),
            el('dl', { class: 'facts' }, [
                el('div', null, [el('dt', { text: '/' }), el('dd', { text: 'Focus search' })]),
                el('div', null, [el('dt', { text: 'Esc' }), el('dd', { text: 'Clear search, return to the page' })]),
                el('div', null, [el('dt', { text: 'Ctrl + Enter' }), el('dd', { text: 'Save a log entry' })]),
                el('div', null, [el('dt', { text: 'Ctrl + P' }), el('dd', { text: 'Print the current chapter' })]),
            ]),
        ]));

        frag.appendChild(g);
        setTimeout(cacheStatus, 60);
        return frag;
    }

    function pageMissing() {
        return el('div', { class: 'page-head' }, [
            el('h1', { text: 'No such page' }),
            el('p', { text: 'That route does not exist in this build.' }),
            el('div', { class: 'btn-row' }, [el('a', { class: 'btn', href: '#/home' }, 'Back to Command')]),
        ]);
    }

    /* ------------------------------------------------------------ search index */

    const INDEX = [];
    (function buildIndex() {
        K.forEach(ch => {
            INDEX.push({
                kind: 'Chapter', title: ch.title, sub: ch.blurb, href: '#/c/' + ch.id,
                hay: (ch.title + ' ' + ch.blurb).toLowerCase(), boost: 2,
            });
            ch.cards.forEach(c => {
                const body = [c.lede, (c.steps || []).join(' '), (c.dont || []).join(' '),
                (c.facts || []).map(f => f.join(' ')).join(' '), c.note]
                    .filter(Boolean).join(' ');
                INDEX.push({
                    kind: ch.title, title: c.title, sub: c.lede || '', href: `#/c/${ch.id}/${c.id}`,
                    hay: (c.title + ' ' + body).toLowerCase(), titleHay: c.title.toLowerCase(),
                    keyHay: (c.keys || '').toLowerCase(),
                    boost: c.tag === 'critical' ? 3 : 1,
                });
            });
        });
        T.forEach(t => INDEX.push({
            kind: 'Table', title: t.title, sub: t.note || '', href: `#/c/${t.chapter}#table-${t.id}`,
            hay: (t.title + ' ' + (t.note || '') + ' ' + t.cols.join(' ') + ' ' + t.rows.map(r => r.join(' ')).join(' ')).toLowerCase(),
            titleHay: t.title.toLowerCase(), boost: 1,
        }));
        TOOLS.forEach(t => INDEX.push({
            kind: 'Tool', title: t.title, sub: t.blurb || '', href: `#/c/${t.chapter}/${t.id}`,
            hay: (t.title + ' ' + (t.blurb || '') + ' ' + t.fields.map(f => f.label).join(' ')).toLowerCase(),
            titleHay: t.title.toLowerCase(), boost: 2,
        }));
        SCEN.forEach(s => {
            const body = [s.lede, s.horizon, (s.before || []).join(' '), (s.during || []).join(' '),
            (s.after || []).join(' '), (s.dont || []).join(' '),
            (s.facts || []).map(f => f.join(' ')).join(' ')].filter(Boolean).join(' ');
            INDEX.push({
                kind: 'Playbook', title: s.title, sub: s.lede || '', href: '#/play/' + s.id,
                hay: (s.title + ' ' + body).toLowerCase(), titleHay: s.title.toLowerCase(),
                keyHay: (s.keys || '').toLowerCase(), boost: 3,
            });
        });
        TREES.forEach(t => {
            const body = Object.keys(t.nodes).map(k => {
                const n = t.nodes[k];
                return n.result
                    ? n.result + ' ' + (n.steps || []).join(' ')
                    : n.q + ' ' + (n.options || []).map(o => o.a).join(' ');
            }).join(' ');
            INDEX.push({
                kind: 'Decision guide', title: t.title, sub: t.lede || '', href: '#/now/' + t.id,
                hay: (t.title + ' ' + (t.lede || '') + ' ' + body).toLowerCase(),
                titleHay: t.title.toLowerCase(), keyHay: (t.keys || '').toLowerCase(), boost: 3,
            });
        });
        LINKS.forEach(l => INDEX.push({
            kind: 'Source', title: l.title, sub: l.what, href: '#/library',
            hay: (l.title + ' ' + l.what + ' ' + l.url).toLowerCase(), titleHay: l.title.toLowerCase(), boost: 0.5,
        }));
    })();

    function search(q) {
        const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
        if (!terms.length) return [];

        /* Three weighted fields — title, curated keywords, body — and a strong
           preference for whole-word matches. Without that, "car" matches
           inside "cargo" and "carry", and a search for "car crash" surfaces
           the aircraft playbook ahead of the road traffic one. */
        const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const wordRes = terms.map(t => {
            try { return new RegExp('\\b' + esc(t) + '\\b'); } catch (e) { return null; }
        });

        const out = [];
        for (const item of INDEX) {
            let score = 0, all = true, allWholeWords = true;
            for (let i = 0; i < terms.length; i++) {
                const t = terms[i], re = wordRes[i];
                let s = 0, whole = false;
                if (item.titleHay && item.titleHay.indexOf(t) >= 0) {
                    const w = re && re.test(item.titleHay);
                    s += w ? 15 : 6; whole = whole || w;
                }
                if (item.keyHay && item.keyHay.indexOf(t) >= 0) {
                    const w = re && re.test(item.keyHay);
                    s += w ? 10 : 3; whole = whole || w;
                }
                if (item.hay.indexOf(t) >= 0) {
                    const w = re && re.test(item.hay);
                    s += w ? 4 : 1; whole = whole || w;
                }
                if (!s) { all = false; break; }
                if (!whole) allWholeWords = false;
                score += s;
            }
            if (!all) continue;
            if (allWholeWords) score *= 1.6;
            out.push({ item, score: score * (item.boost || 1) });
        }
        return out.sort((a, b) => b.score - a.score).slice(0, 50).map(x => x.item);
    }

    function highlight(text, terms) {
        const frag = document.createDocumentFragment();
        if (!terms.length) { frag.appendChild(document.createTextNode(text)); return frag; }
        const re = new RegExp('(' + terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'ig');
        let last = 0, m;
        while ((m = re.exec(text)) !== null) {
            if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
            frag.appendChild(el('mark', { text: m[0] }));
            last = re.lastIndex;
            if (re.lastIndex === m.index) re.lastIndex++;   // zero-length guard
        }
        frag.appendChild(document.createTextNode(text.slice(last)));
        return frag;
    }

    function pageSearch(q) {
        const frag = document.createDocumentFragment();
        const hits = search(q);
        const terms = q.toLowerCase().split(/\s+/).filter(Boolean);

        const head = el('div', { class: 'page-head' });
        head.appendChild(el('p', { class: 'eyebrow', text: 'Search' }));
        head.appendChild(el('h1', { text: `${hits.length} result${hits.length === 1 ? '' : 's'}` }));
        head.appendChild(el('p', { text: hits.length ? `Matching “${q}” across every card, table, tool and source.` : `Nothing matches “${q}”. Try a symptom, a piece of equipment, a frequency or a single word.` }));
        frag.appendChild(head);

        const g = el('div', { class: 'grid' });
        hits.forEach(h => {
            const a = el('a', { class: 'hit', href: h.href });
            a.appendChild(el('div', { class: 'kind', text: h.kind }));
            a.appendChild(el('h3', null, highlight(h.title, terms)));
            if (h.sub) a.appendChild(el('p', null, highlight(h.sub.slice(0, 190) + (h.sub.length > 190 ? '…' : ''), terms)));
            g.appendChild(a);
        });
        frag.appendChild(g);
        return frag;
    }

    /* ----------------------------------------------------------------- router */

    let currentRoute = '#/home';

    function render(node, railId) {
        main.textContent = '';
        main.appendChild(node);
        markRail(railId);
    }

    function route() {
        const hash = location.hash || '#/home';
        currentRoute = hash;
        const raw = hash.replace(/^#\//, '');
        const hashPart = raw.split('#')[1];
        const parts = raw.split('#')[0].split('/').filter(Boolean);

        window.scrollTo(0, 0);

        if (!parts.length || parts[0] === 'home') { render(pageHome(), 'home'); }
        else if (parts[0] === 'now') { render(pageNow(parts[1]), 'now'); }
        else if (parts[0] === 'tree') { render(pageNow(parts[1]), 'now'); }
        else if (parts[0] === 'play') { render(pagePlaybooks(parts[1]), 'play'); }
        else if (parts[0] === 'pos') { render(pagePosition(), null); }
        else if (parts[0] === 'card') { render(pageCard(), 'card'); }
        else if (parts[0] === 'c' && parts[1]) { render(pageChapter(parts[1], parts[2]), 'c/' + parts[1]); }
        else if (parts[0] === 'tools') { render(pageTools(), 'tools'); }
        else if (parts[0] === 'log') { render(pageLog(), 'log'); }
        else if (parts[0] === 'library') { render(pageLibrary(), 'library'); }
        else if (parts[0] === 'about') { render(pageAbout(), 'about'); }
        else { render(pageMissing(), null); }

        if (hashPart) setTimeout(() => {
            const t = document.getElementById(hashPart);
            if (t) t.scrollIntoView({ block: 'start' });
        }, 50);

        const page = PAGES.find(p => '#/' + p.id === hash.split('/').slice(0, 3).join('/'));
        document.title = (page ? page.title + ' · ' : '') + 'O.A.S.I.S.';
    }

    /* ---------------------------------------------------------------- chrome */

    function applyTheme(t) {
        document.documentElement.setAttribute('data-theme', t);
        const meta = document.querySelector('meta[name="theme-color"]');
        const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
        if (meta && bg) meta.setAttribute('content', bg);
        store.set('theme', t);
        document.querySelectorAll('.tool').forEach(el => { if (el._redraw) el._redraw(); });
    }

    function applyFontScale(s) {
        document.documentElement.style.setProperty('--fs', s);
        store.set('fs', s);
    }

    function tickClock() {
        const d = new Date();
        const p = x => String(x).padStart(2, '0');
        $('#clockChip').textContent = `⏱ ${p(d.getHours())}:${p(d.getMinutes())} · ${p(d.getUTCHours())}${p(d.getUTCMinutes())}Z`;
    }

    function netStatus() {
        const c = $('#netChip');
        if (navigator.onLine) { c.textContent = '◍ online'; c.className = 'chip ok'; }
        else { c.textContent = '◍ OFFLINE — full function'; c.className = 'chip bad'; }
    }

    function showFix(fix) {
        const c = $('#posChip');
        if (!fix) { c.textContent = '⌖ no fix'; c.className = 'chip ghost'; return; }
        c.textContent = `⌖ ${fix.lat.toFixed(4)}, ${fix.lon.toFixed(4)}`;
        c.className = 'chip ok';
        c.title = `${window.GEO.toMGRS(fix.lat, fix.lon, 5) || ''} · ±${Math.round(fix.acc)} m · ${new Date(fix.t).toLocaleString()}`;
    }

    function getFix() {
        if (!navigator.geolocation) { toast('This browser has no geolocation.'); return; }
        toast('Acquiring position…');
        navigator.geolocation.getCurrentPosition(
            p => {
                const fix = { lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy || 0, t: Date.now() };
                store.set('fix', fix);
                showFix(fix);
                toast(`Fix stored — ${window.GEO.toMGRS(fix.lat, fix.lon, 4) || fix.lat.toFixed(5)}`);
                if (location.hash === '#/home' || location.hash === '') route();
            },
            e => toast('No fix: ' + e.message),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
        );
    }

    let wakeLock = null;
    async function toggleWake() {
        const btn = $('#wakeBtn');
        if (wakeLock) {
            try { await wakeLock.release(); } catch (e) { }
            wakeLock = null;
            btn.setAttribute('aria-pressed', 'false');
            toast('Screen may sleep again.');
            return;
        }
        if (!('wakeLock' in navigator)) { toast('This browser cannot keep the screen awake.'); return; }
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            wakeLock.addEventListener('release', () => {
                wakeLock = null;
                btn.setAttribute('aria-pressed', 'false');
            });
            btn.setAttribute('aria-pressed', 'true');
            toast('Screen will stay awake. Watch your battery.');
        } catch (e) { toast('Could not hold the screen awake.'); }
    }

    /* ---------------------------------------------------------------- install */

    /**
     * Installing this as an app is the single most useful thing a reader can
     * do, so it gets a real button rather than a paragraph of instructions.
     * Chrome and Edge hand us a deferred prompt; Safari and Firefox do not, so
     * those platforms get exact manual steps instead.
     */
    let installPrompt = null;

    function isInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches
            || window.matchMedia('(display-mode: fullscreen)').matches
            || window.navigator.standalone === true;
    }

    function platform() {
        const ua = navigator.userAgent;
        const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        if (iOS) return /CriOS|FxiOS|EdgiOS/.test(ua) ? 'ios-other' : 'ios';
        if (/Android/.test(ua)) return /Firefox/.test(ua) ? 'android-ff' : 'android';
        if (/Firefox/.test(ua)) return 'firefox';
        return 'desktop';
    }

    const INSTALL_STEPS = {
        'ios': ['Tap the **Share** button at the bottom of Safari (the square with an arrow).',
            'Scroll down and tap **Add to Home Screen**.',
            'Tap **Add**. O.A.S.I.S. now opens full screen, like an app, with no browser and no connection.'],
        'ios-other': ['On iPhone and iPad, only **Safari** can install an app to the home screen.',
            'Open this page in Safari, then tap **Share → Add to Home Screen**.'],
        'android': ['Tap the **⋮ menu** in the top right.',
            'Tap **Install app** or **Add to Home screen**.',
            'Confirm. It then opens full screen with its own icon.'],
        'android-ff': ['Tap the **⋮ menu**.', 'Tap **Install** or **Add to Home screen**.'],
        'firefox': ['Firefox on the desktop does not install web apps.',
            'Either open this page in Chrome or Edge and install it there, or bookmark it — everything still works offline once loaded.'],
        'desktop': ['Look for the **install icon** in the address bar (a screen with a downward arrow), and click it.',
            'Or open the **⋮ menu → Cast, save and share → Install page as app**.',
            'It then opens in its own window, appears in your launcher, and works with no connection.'],
    };

    function installCard() {
        const card = el('div', { class: 'card install-card' });

        if (isInstalled()) {
            card.appendChild(el('h3', null, [document.createTextNode('Installed'), tagFor('routine')]));
            card.appendChild(el('p', { class: 'lede', text: 'You are running O.A.S.I.S. as an installed app. It will open and work with no connection. Now put a copy on a second device and print the pages you would want with a dead battery.' }));
            return card;
        }

        card.appendChild(el('h3', null, [document.createTextNode('Install it on this device'), tagFor('priority')]));
        card.appendChild(el('p', {
            class: 'lede',
            text: 'Installing takes about ten seconds and makes this work like an app: its own icon, full screen, '
                + 'and no connection required — ever again. This is the single most useful thing you can do with this page.',
        }));

        const row = el('div', { class: 'btn-row' });
        const btn = el('button', {
            class: 'btn', type: 'button', id: 'installCardBtn',
            onclick: () => doInstall(),
        }, '⤓ Install O.A.S.I.S.');
        if (!installPrompt) btn.disabled = true;
        row.appendChild(btn);
        row.appendChild(el('button', { class: 'btn ghost', type: 'button', onclick: precache }, 'Cache everything now'));
        card.appendChild(row);

        const steps = el('ol', { style: 'margin-top:12px' });
        (INSTALL_STEPS[platform()] || INSTALL_STEPS.desktop).forEach(s =>
            steps.appendChild(el('li', null, rich(s))));
        card.appendChild(el('p', { class: 'note', style: 'margin-top:12px' },
            rich(installPrompt
                ? 'Or do it manually:'
                : 'Your browser has not offered an automatic install, so do it manually:')));
        card.appendChild(steps);

        card.appendChild(el('p', { class: 'note' }, rich(
            'No app store, no account, no permissions, no tracking. It is the same folder of files, '
            + 'stored on your device. You can also copy the whole folder to a USB stick and open '
            + '`index.html` — it runs from anywhere.')));
        return card;
    }

    function doInstall() {
        if (!installPrompt) {
            toast('Use the manual steps below — this browser does not offer an install button.');
            return;
        }
        installPrompt.prompt();
        installPrompt.userChoice.then(res => {
            if (res.outcome === 'accepted') toast('Installing. Look for the O.A.S.I.S. icon.');
            installPrompt = null;
            refreshInstallUI();
        }).catch(() => { });
    }

    function refreshInstallUI() {
        const chip = $('#installBtn');
        if (!chip) return;
        chip.hidden = isInstalled() || !installPrompt;
        const cardBtn = $('#installCardBtn');
        if (cardBtn) cardBtn.disabled = !installPrompt;
    }

    /* ---------------------------------------------------------------- offline */

    async function cacheStatus() {
        const chip = $('#cacheChip');
        const line = $('#readyCache');
        const about = $('#aboutCache');
        let msg, ok = false;
        try {
            const keys = await caches.keys();
            const mine = keys.filter(k => k.startsWith('oasis-'));
            if (mine.length) {
                const c = await caches.open(mine[0]);
                const n = (await c.keys()).length;
                ok = true;
                chip.textContent = `⛁ ${n} files cached`;
                msg = `${n} files are stored on this device. Turn off your connection and reload to confirm — the page should behave identically.`;
            } else {
                chip.textContent = '⛁ not cached';
                msg = 'Nothing is cached yet. Press the button, then test it with your connection off.';
            }
        } catch (e) {
            chip.textContent = '⛁ cache unavailable';
            msg = 'This browser is blocking offline storage (private mode, or the page is opened from a file:// path). It still works, but only while the files are reachable.';
        }
        chip.className = 'chip ' + (ok ? 'ok' : 'bad');
        if (line) line.textContent = msg;
        if (about) about.textContent = msg;
    }

    function precache() {
        if (!('serviceWorker' in navigator)) { toast('This browser has no service worker support.'); return; }
        /* serviceWorker.ready never rejects — it just waits forever if the
           worker cannot activate. Race it so the user always gets an answer. */
        const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 6000));
        Promise.race([navigator.serviceWorker.ready, timeout]).then(reg => {
            if (reg.active) reg.active.postMessage({ type: 'PRECACHE' });
            toast('Caching every file…');
            setTimeout(cacheStatus, 1800);
        }).catch(() => {
            toast('The offline worker could not start. This page still works, but only while the files are reachable.');
            cacheStatus();
        });
    }

    async function persist() {
        if (!navigator.storage || !navigator.storage.persist) { toast('This browser cannot pin storage.'); return; }
        const granted = await navigator.storage.persist();
        toast(granted
            ? 'Storage pinned — the browser will not evict this system to reclaim space.'
            : 'The browser declined. Installing the app usually makes it grant this.');
    }

    function registerSW() {
        if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
        navigator.serviceWorker.register('sw.js').then(reg => {
            /* The status chip is computed at boot, before the worker has
               finished installing. Re-check once it is actually ready, or the
               user is told they have no offline copy when they do. */
            navigator.serviceWorker.ready.then(() => setTimeout(cacheStatus, 600));
            reg.addEventListener('updatefound', () => {
                const sw = reg.installing;
                if (!sw) return;
                sw.addEventListener('statechange', () => {
                    if (sw.state === 'activated') setTimeout(cacheStatus, 400);
                    if (sw.state === 'installed' && navigator.serviceWorker.controller) {
                        toast('An updated version is ready — reload to apply it.');
                    }
                });
            });
        }).catch(() => { /* offline first load, or blocked — not fatal */ });
        navigator.serviceWorker.addEventListener('controllerchange', () => setTimeout(cacheStatus, 300));
    }

    /* -------------------------------------------------------------------- boot */

    function boot() {
        applyTheme(store.get('theme', 'tactical'));
        applyFontScale(store.get('fs', 1));
        $('#themeSel').value = store.get('theme', 'tactical');
        $('#verLine').textContent = `Build ${VERSION} · ${K.reduce((s, c) => s + c.cards.length, 0)} cards · ${SCEN.length} playbooks · ${TREES.length} decision guides · ${TOOLS.length} tools · ${T.length} tables.`;
        const mail = $('#contactLink');
        if (mail) { mail.href = 'mailto:' + CONFIG.contact; mail.textContent = CONFIG.contact; }

        buildRail();
        route();

        const q = $('#q');

        /* Navigating away from a search should leave the box empty, or the
           next keystroke drags you back into results you had left. Move focus
           to the new content too, so keyboard and screen readers follow. */
        window.addEventListener('hashchange', () => {
            if (q.value) q.value = '';
            route();
            main.focus({ preventScroll: true });
        });

        /* Clicking the rail entry for the page you are already on fires no
           hashchange, so search results would sit there for ever. */
        $('#rail').addEventListener('click', e => {
            const a = e.target.closest('a');
            if (!a || a.getAttribute('href') !== location.hash) return;
            if (q.value) { q.value = ''; route(); }
        });

        $('#themeSel').addEventListener('change', e => applyTheme(e.target.value));
        $('#fontUp').addEventListener('click', () => applyFontScale(Math.min(1.6, +store.get('fs', 1) + 0.1)));
        $('#fontDown').addEventListener('click', () => applyFontScale(Math.max(0.8, +store.get('fs', 1) - 0.1)));
        $('#wakeBtn').addEventListener('click', toggleWake);
        $('#fixBtn').addEventListener('click', getFix);
        $('#posChip').addEventListener('click', () => { location.hash = '#/pos'; });

        let searchTimer = null;
        q.addEventListener('input', () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                const v = q.value.trim();
                if (v.length >= 2) { render(pageSearch(v), null); }
                else { route(); }
            }, 120);
        });
        q.addEventListener('keydown', e => {
            if (e.key === 'Escape') { q.value = ''; q.blur(); route(); }
        });

        document.addEventListener('keydown', e => {
            const tag = (e.target.tagName || '').toLowerCase();
            if (e.key === '/' && tag !== 'input' && tag !== 'textarea' && tag !== 'select') {
                e.preventDefault();
                q.focus();
                q.select();
            }
        });

        netStatus();
        window.addEventListener('online', netStatus);
        window.addEventListener('offline', netStatus);

        /* Install lifecycle. Chrome and Edge fire this when the app qualifies;
           we stash it so the user can install at a moment of their choosing
           rather than being interrupted by the browser's own banner. */
        window.addEventListener('beforeinstallprompt', e => {
            e.preventDefault();
            installPrompt = e;
            refreshInstallUI();
        });
        window.addEventListener('appinstalled', () => {
            installPrompt = null;
            refreshInstallUI();
            toast('Installed. It will now open and work with no connection.');
        });
        $('#installBtn').addEventListener('click', doInstall);
        refreshInstallUI();

        tickClock();
        setInterval(tickClock, 20000);
        showFix(store.get('fix', null));
        cacheStatus();
        registerSW();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
