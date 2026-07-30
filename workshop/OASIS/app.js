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

    const VERSION = '1.0.0';
    const K = window.OASIS_KNOWLEDGE || [];
    const T = window.OASIS_TABLES || [];
    const TOOLS = window.OASIS_TOOLS || [];
    const LINKS = window.OASIS_LINKS || [];

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
            try { const v = localStorage.getItem('oasis.' + k); return v == null ? fb : JSON.parse(v); }
            catch (e) { return fb; }
        },
        set(k, v) {
            try { localStorage.setItem('oasis.' + k, JSON.stringify(v)); } catch (e) { /* private mode */ }
        },
        del(k) { try { localStorage.removeItem('oasis.' + k); } catch (e) { } },
    };

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
        { id: 'home', title: 'Command', glyph: '◉', group: null },
    ].concat(K.map(c => ({ id: 'c/' + c.id, title: c.title, glyph: c.glyph, group: 'Doctrine', chapter: c })))
        .concat([
            { id: 'tools', title: 'All tools', glyph: '⚙', group: 'Systems' },
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
            el('a', { class: 'btn ghost', href: '#/c/medical/bleeding' }, 'Stop the bleeding'),
            el('a', { class: 'btn ghost', href: '#/tools' }, 'All calculators'),
            el('a', { class: 'btn ghost', href: '#/about' }, 'Make it work offline'),
        ]);
        hero.appendChild(cta);
        frag.appendChild(hero);

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
                el('a', { class: 'btn ghost', href: '#/tools' }, 'Convert it'),
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
        const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
        const a = el('a', { href: URL.createObjectURL(blob), download: 'oasis-log.txt' });
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
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
            el('h3', { text: 'What this is' }),
            el('p', { class: 'lede', text: 'A single-folder, dependency-free reference system. No build step, no framework, no fonts, no analytics, no cookies, no accounts and no outbound request of any kind.' }),
            el('dl', { class: 'facts' }, [
                el('div', null, [el('dt', { text: 'Version' }), el('dd', { text: VERSION })]),
                el('div', null, [el('dt', { text: 'Chapters' }), el('dd', { text: String(K.length) })]),
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
                (c.facts || []).map(f => f.join(' ')).join(' '), c.note, c.keys]
                    .filter(Boolean).join(' ');
                INDEX.push({
                    kind: ch.title, title: c.title, sub: c.lede || '', href: `#/c/${ch.id}/${c.id}`,
                    hay: (c.title + ' ' + body).toLowerCase(), titleHay: c.title.toLowerCase(),
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
        LINKS.forEach(l => INDEX.push({
            kind: 'Source', title: l.title, sub: l.what, href: '#/library',
            hay: (l.title + ' ' + l.what + ' ' + l.url).toLowerCase(), titleHay: l.title.toLowerCase(), boost: 0.5,
        }));
    })();

    function search(q) {
        const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
        if (!terms.length) return [];
        const out = [];
        for (const item of INDEX) {
            let score = 0, all = true;
            for (const t of terms) {
                let s = 0;
                if (item.titleHay && item.titleHay.includes(t)) s += 8;
                if (item.hay.includes(t)) s += 2;
                if (item.hay.includes(' ' + t)) s += 1;
                if (!s) { all = false; break; }
                score += s;
            }
            if (all) out.push({ item, score: score * (item.boost || 1) });
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
        $('#verLine').textContent = `Build ${VERSION} · ${K.reduce((s, c) => s + c.cards.length, 0)} cards · ${TOOLS.length} tools · ${T.length} tables.`;

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
        tickClock();
        setInterval(tickClock, 20000);
        showFix(store.get('fix', null));
        cacheStatus();
        registerSW();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
