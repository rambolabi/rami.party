/* ==========================================================================
   Personal Trainer Forge — UI layer
   --------------------------------------------------------------------------
   Renders the builder, the day-aware Today view, the full schedule and the
   exercise library. All DOM is built with createElement/textContent, so
   nothing that arrives from a share link or a pasted file is ever parsed as
   HTML.
   ========================================================================== */

(function () {
    'use strict';

    const D = window.TF_DATA;
    const E = window.TF_ENGINE;

    const STORE_KEY = 'tf.plan.v1';
    const VIEW_KEY = 'tf.view.v1';

    /* ------------------------------------------------------------- helpers */

    const $ = sel => document.querySelector(sel);
    const $$ = sel => Array.prototype.slice.call(document.querySelectorAll(sel));

    function h(tag, cls, text) {
        const n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text !== undefined && text !== null) n.textContent = String(text);
        return n;
    }

    function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

    let toastTimer = null;
    function toast(msg) {
        const t = $('#toast');
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
    }

    function b64e(str) {
        const bytes = new TextEncoder().encode(str);
        let bin = '';
        bytes.forEach(b => { bin += String.fromCharCode(b); });
        return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    function b64d(str) {
        const bin = atob(String(str).replace(/-/g, '+').replace(/_/g, '/'));
        const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
        return new TextDecoder().decode(bytes);
    }

    function prettyDate(iso) {
        const d = E.fromISO(iso);
        return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
    }

    function shortDate(iso) {
        const d = E.fromISO(iso);
        return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    }

    async function copy(text, okMsg) {
        try {
            await navigator.clipboard.writeText(text);
            toast(okMsg || 'Copied');
        } catch (err) {
            const box = $('#exportBox');
            box.value = text;
            box.select();
            toast('Copy blocked — the text is selected, press Ctrl/Cmd + C');
        }
    }

    /* --------------------------------------------------------------- state */

    const state = {
        draft: {
            goal: 'all-round', level: 1, perWeek: 3, mins: 45, length: 28,
            kit: ['none'], focus: [], start: E.toISO(new Date()), name: '', seed: '',
            overrides: {}
        },
        plan: null,
        progress: { items: {}, days: [] },
        view: 'today'
    };

    function save() {
        if (!state.plan) return;
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify({
                v: 1, config: state.plan.config, progress: state.progress
            }));
        } catch (err) { toast('Could not save — storage is full or blocked'); }
    }

    function load() {
        let raw;
        try { raw = localStorage.getItem(STORE_KEY); } catch (err) { return false; }
        if (!raw) return false;
        let obj;
        try { obj = JSON.parse(raw); } catch (err) { return false; }
        if (!obj || !obj.config) return false;
        state.plan = E.buildPlan(obj.config);
        state.draft = Object.assign({}, state.plan.config);
        const p = obj.progress || {};
        state.progress = {
            items: (p.items && typeof p.items === 'object') ? p.items : {},
            days: Array.isArray(p.days) ? p.days.filter(x => typeof x === 'string') : []
        };
        return true;
    }

    /* ---------------------------------------------------------------- tabs */

    function setView(name) {
        state.view = name;
        $$('.tab').forEach(function (t) {
            const on = t.dataset.view === name;
            t.setAttribute('aria-selected', on ? 'true' : 'false');
            t.classList.toggle('is-on', on);
        });
        $$('.view').forEach(function (v) { v.hidden = v.id !== 'view-' + name; });
        try { localStorage.setItem(VIEW_KEY, name); } catch (err) { /* ignore */ }
        const app = $('#app');
        if (app && window.scrollY > app.offsetTop + 240) {
            $('.tabs').scrollIntoView({ block: 'start', behavior: 'smooth' });
        }
    }

    /* -------------------------------------------------------- forge: build */

    function optionButton(label, note, on, onClick, extraClass) {
        const b = h('button', 'chip' + (on ? ' is-on' : '') + (extraClass ? ' ' + extraClass : ''));
        b.type = 'button';
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', on ? 'true' : 'false');
        b.appendChild(h('span', 'chip-label', label));
        if (note) b.appendChild(h('span', 'chip-note', note));
        b.addEventListener('click', onClick);
        return b;
    }

    function renderGoals() {
        const grid = $('#goalGrid');
        clear(grid);
        D.goals.forEach(function (g) {
            const on = state.draft.goal === g.id;
            const card = h('button', 'goal-card' + (on ? ' is-on' : ''));
            card.type = 'button';
            card.setAttribute('role', 'radio');
            card.setAttribute('aria-checked', on ? 'true' : 'false');
            const top = h('span', 'goal-top');
            top.appendChild(h('span', 'goal-glyph', g.glyph));
            const names = h('span', 'goal-names');
            names.appendChild(h('span', 'goal-name', g.name));
            names.appendChild(h('span', 'goal-short', g.short));
            top.appendChild(names);
            card.appendChild(top);
            card.appendChild(h('span', 'goal-blurb', g.blurb));
            card.addEventListener('click', function () {
                state.draft.goal = g.id;
                /* Not every goal offers every frequency or session length. */
                const freqs = E.frequenciesFor(g);
                const durs = E.durationsFor(g);
                if (freqs.indexOf(state.draft.perWeek) === -1) {
                    state.draft.perWeek = freqs.indexOf(3) !== -1 ? 3 : freqs[0];
                }
                if (durs.indexOf(state.draft.mins) === -1) {
                    state.draft.mins = durs.indexOf(45) !== -1 ? 45 : durs[Math.floor(durs.length / 2)];
                }
                renderGoals();
                renderPerWeek();
                renderMins();
                renderSummary();
            });
            grid.appendChild(card);
        });
        const g = D.goals.filter(x => x.id === state.draft.goal)[0];
        const why = $('#goalWhy');
        clear(why);
        if (g) {
            why.appendChild(h('strong', null, 'Why it works: '));
            why.appendChild(document.createTextNode(g.why));
        }
    }

    function renderLevels() {
        const row = $('#levelRow');
        clear(row);
        D.levels.forEach(function (l) {
            row.appendChild(optionButton(l.name, l.note, state.draft.level === l.id, function () {
                state.draft.level = l.id;
                renderLevels();
                renderSummary();
            }));
        });
    }

    function renderPerWeek() {
        const row = $('#perWeekRow');
        clear(row);
        E.frequenciesFor(E.goalById(state.draft.goal)).forEach(function (n) {
            row.appendChild(optionButton(n + ' days', D.perWeekNotes[n], state.draft.perWeek === n, function () {
                state.draft.perWeek = n;
                renderPerWeek();
                renderSummary();
            }));
        });
    }

    function renderMins() {
        const row = $('#minsRow');
        clear(row);
        const allowed = E.durationsFor(E.goalById(state.draft.goal));
        D.durations.filter(d => allowed.indexOf(d.mins) !== -1).forEach(function (d) {
            row.appendChild(optionButton(d.name, d.note, state.draft.mins === d.mins, function () {
                state.draft.mins = d.mins;
                renderMins();
                renderSummary();
            }));
        });
    }

    function renderKit() {
        const grid = $('#kitGrid');
        clear(grid);
        D.equipment.forEach(function (k) {
            const on = state.draft.kit.indexOf(k.id) !== -1;
            const b = h('button', 'kit' + (on ? ' is-on' : '') + (k.locked ? ' is-locked' : ''));
            b.type = 'button';
            b.setAttribute('aria-pressed', on ? 'true' : 'false');
            if (k.locked) b.setAttribute('aria-disabled', 'true');
            b.appendChild(h('span', 'kit-glyph', k.glyph));
            b.appendChild(h('span', 'kit-name', k.name));
            b.appendChild(h('span', 'kit-note', k.note));
            b.addEventListener('click', function () {
                if (k.locked) { toast('Bodyweight is always available'); return; }
                const i = state.draft.kit.indexOf(k.id);
                if (i === -1) state.draft.kit.push(k.id); else state.draft.kit.splice(i, 1);
                renderKit();
                renderSummary();
            });
            grid.appendChild(b);
        });
    }

    function renderFocus() {
        const row = $('#focusRow');
        clear(row);
        D.focus.forEach(function (f) {
            const on = state.draft.focus.indexOf(f.id) !== -1;
            const b = h('button', 'chip chip-sm' + (on ? ' is-on' : ''));
            b.type = 'button';
            b.setAttribute('aria-pressed', on ? 'true' : 'false');
            b.appendChild(h('span', 'chip-label', f.name));
            b.addEventListener('click', function () {
                const i = state.draft.focus.indexOf(f.id);
                if (i !== -1) state.draft.focus.splice(i, 1);
                else if (state.draft.focus.length >= 3) { toast('Three focus areas is the useful maximum'); return; }
                else state.draft.focus.push(f.id);
                renderFocus();
                renderSummary();
            });
            row.appendChild(b);
        });
    }

    function renderLength() {
        const row = $('#lengthRow');
        clear(row);
        D.lengths.forEach(function (l) {
            row.appendChild(optionButton(l.name, l.note, state.draft.length === l.days, function () {
                state.draft.length = l.days;
                renderLength();
                renderSummary();
            }));
        });
    }

    function renderSummary() {
        const box = $('#forgeSummary');
        clear(box);
        const cfg = E.validateConfig(state.draft);
        const goal = D.goals.filter(g => g.id === cfg.goal)[0];
        const weeks = Math.round(cfg.length / 7);
        const sessions = cfg.perWeek * weeks;

        box.appendChild(h('h3', 'summary-title', 'Your plan at a glance'));
        const grid = h('div', 'summary-grid');
        function stat(k, v) {
            const s = h('div', 'stat');
            s.appendChild(h('span', 'stat-v', v));
            s.appendChild(h('span', 'stat-k', k));
            grid.appendChild(s);
        }
        stat('Goal', goal ? goal.name : '—');
        stat('Sessions', '≈ ' + sessions);
        stat('Per session', cfg.mins + ' min');
        stat('Weekly time', '≈ ' + (cfg.perWeek * cfg.mins) + ' min');
        stat('Block', weeks + ' weeks');
        stat('Deloads', goal && goal.steady ? 'none needed' : String(Math.floor(weeks / 4)));
        box.appendChild(grid);

        const note = h('p', 'summary-note');
        note.appendChild(h('strong', null, goal ? goal.emphasis : ''));
        box.appendChild(note);

        const kitNames = D.equipment.filter(k => cfg.kit.indexOf(k.id) !== -1).map(k => k.name).join(', ');
        const focusNames = D.focus.filter(f => cfg.focus.indexOf(f.id) !== -1).map(f => f.name).join(', ');
        box.appendChild(h('p', 'summary-line',
            'Equipment: ' + kitNames + (focusNames ? ' · Focus: ' + focusNames : '') +
            ' · Starts ' + prettyDate(cfg.start)));

        const timeHint = $('#timeHint');
        if (cfg.mins <= 10) {
            timeHint.textContent = 'Movement snacks are meant to be doable on your worst day. Warm-up included — no changing rooms, no excuses.';
        } else if (cfg.mins <= 15) {
            timeHint.textContent = 'Fifteen minutes is a real session if you keep the rests honest — expect two or three exercises plus a short warm-up.';
        } else if (cfg.perWeek >= 5 && cfg.mins >= 60) {
            timeHint.textContent = 'That is a big weekly load. It works, but only if sleep and food keep up — the deload weeks are not optional at this volume.';
        } else {
            timeHint.textContent = 'Warm-up and cool-down are included in the time above, not added on top.';
        }

        $('#overwriteWarn').hidden = !state.plan;
    }

    function renderGoalExplainers() {
        const box = $('#goalExplainers');
        if (!box) return;
        clear(box);
        D.goals.forEach(function (g) {
            const art = h('article', 'card explainer');
            const head = h('h4', 'explainer-head');
            head.appendChild(h('span', 'explainer-glyph', g.glyph));
            head.appendChild(document.createTextNode(g.name));
            art.appendChild(head);
            art.appendChild(h('p', 'explainer-short', g.short));
            art.appendChild(h('p', null, g.why));
            art.appendChild(h('p', 'explainer-rule', g.emphasis));
            box.appendChild(art);
        });
    }

    /* ------------------------------------------------------ day overrides */

    function rebuild(cfg) {
        state.plan = E.buildPlan(cfg);
        state.draft = Object.assign({}, state.plan.config);
        save();
        renderToday();
        renderPlan();
    }

    /* Patch a single day. `patch` values of null remove that key. */
    function setOverride(dateISO, patch) {
        if (!state.plan) return;
        const cfg = Object.assign({}, state.plan.config);
        const all = Object.assign({}, cfg.overrides);
        const day = Object.assign({}, all[dateISO]);
        Object.keys(patch).forEach(function (k) {
            if (patch[k] === null) delete day[k]; else day[k] = patch[k];
        });
        if (Object.keys(day).length) all[dateISO] = day; else delete all[dateISO];
        cfg.overrides = all;
        rebuild(cfg);
    }

    function clearDay(dateISO) {
        if (!state.plan) return;
        const cfg = Object.assign({}, state.plan.config);
        const all = Object.assign({}, cfg.overrides);
        delete all[dateISO];
        cfg.overrides = all;
        rebuild(cfg);
        toast('Day restored to the original plan');
    }

    /* Re-roll one slot. The salt is part of the seed, so the swap is stable:
       the same plan on another device shows the same replacement. */
    function swapExercise(dateISO, slot) {
        const cur = (state.plan.config.overrides || {})[dateISO] || {};
        const swaps = Object.assign({}, cur.swaps);
        const key = String(slot);
        swaps[key] = ((swaps[key] || 0) % 98) + 1;
        setOverride(dateISO, { swaps: swaps });
        toast('Swapped for a different exercise');
    }

    function openDayDialog(dateISO) {
        const day = state.plan.days.filter(d => d.date === dateISO)[0];
        if (!day) return;
        $('#daySub').textContent = prettyDate(dateISO) + ' — currently: ' + day.title +
            (day.edited ? ' (edited)' : '');

        const box = $('#dayOptions');
        clear(box);

        function option(label, sub, tagText, onPick, current) {
            const b = h('button', 'day-option' + (current ? ' is-on' : ''));
            b.type = 'button';
            const top = h('span', 'day-option-top');
            top.appendChild(h('span', 'day-option-name', label));
            if (tagText) top.appendChild(h('span', 'tag tag-quiet', tagText));
            b.appendChild(top);
            if (sub) b.appendChild(h('span', 'day-option-sub', sub));
            b.addEventListener('click', function () {
                $('#dayDialog').close();
                onPick();
            });
            box.appendChild(b);
        }

        if (day.edited) {
            option('↺ Back to the original plan', 'Undo every change you made to this day', null,
                function () { clearDay(dateISO); });
        }

        option('😴 Make it a rest day', 'Recovery is part of the programme — taking one is not cheating.',
            'Rest', function () { setOverride(dateISO, { mode: 'rest', tpl: null, swaps: null }); toast('Turned into a rest day'); },
            day.type !== 'session');

        box.appendChild(h('p', 'day-option-head', 'Or train instead — sessions from your plan'));
        const opts = E.sessionOptionsFor(state.plan.config.goal);
        opts.filter(o => o.own).forEach(function (o) {
            option(o.name, o.focus, o.tag, function () {
                /* Swaps are per-slot, and slots belong to a template. */
                setOverride(dateISO, { mode: 'train', tpl: o.id, swaps: null });
                toast('Switched to ' + o.name);
            }, day.type === 'session' && day.templateId === o.id);
        });

        const micro = opts.filter(o => !o.own && o.micro);
        if (micro.length) {
            box.appendChild(h('p', 'day-option-head', 'Short on time? Movement snacks (5–15 min)'));
            micro.forEach(function (o) {
                option(o.name, o.focus, o.tag, function () {
                    setOverride(dateISO, { mode: 'train', tpl: o.id, swaps: null });
                    toast('Switched to ' + o.name);
                }, day.type === 'session' && day.templateId === o.id);
            });
        }

        openDialog($('#dayDialog'));
    }

    /* ------------------------------------------------------- session cards */

    function itemRow(item, dateISO, interactive) {
        const li = h('li', 'ex' + (item.role ? ' role-' + item.role : ''));

        const head = h('div', 'ex-head');

        if (interactive) {
            const key = dateISO + '|' + item.id + '|' + item.role;
            const doneList = state.progress.items[dateISO] || [];
            const on = doneList.indexOf(key) !== -1;
            const cb = h('button', 'tick' + (on ? ' is-on' : ''));
            cb.type = 'button';
            cb.setAttribute('aria-pressed', on ? 'true' : 'false');
            cb.setAttribute('aria-label', (on ? 'Mark not done: ' : 'Mark done: ') + item.name);
            cb.textContent = on ? '✓' : '';
            cb.addEventListener('click', function () {
                const list = state.progress.items[dateISO] || (state.progress.items[dateISO] = []);
                const i = list.indexOf(key);
                if (i === -1) list.push(key); else list.splice(i, 1);
                save();
                renderToday();
            });
            head.appendChild(cb);
            li.classList.toggle('is-done', on);
        }

        const main = h('div', 'ex-main');
        main.appendChild(h('span', 'ex-name', item.name));
        const meta = h('span', 'ex-meta');
        if (item.unit === 'mins') {
            meta.appendChild(h('span', 'pill pill-strong', item.minutes + ' min'));
        } else {
            meta.appendChild(h('span', 'pill pill-strong', item.sets + ' × ' + item.reps));
            if (item.rest) meta.appendChild(h('span', 'pill', 'rest ' + item.rest + ' s'));
            if (item.rpe) meta.appendChild(h('span', 'pill', 'RPE ' + item.rpe));
        }
        main.appendChild(meta);
        if (item.detail) main.appendChild(h('span', 'ex-detail', item.detail));
        if (item.note) main.appendChild(h('span', 'ex-detail ex-note', item.note));
        head.appendChild(main);

        if (interactive && typeof item.slot === 'number') {
            const swap = h('button', 'ex-swap', '⇄');
            swap.type = 'button';
            swap.title = 'Swap this exercise for another';
            swap.setAttribute('aria-label', 'Swap ' + item.name + ' for a different exercise');
            swap.addEventListener('click', function () { swapExercise(dateISO, item.slot); });
            head.appendChild(swap);
        }

        li.appendChild(head);

        if (item.role === 'warmup' || item.role === 'cooldown') {
            if (item.cue) li.appendChild(h('p', 'ex-cue ex-cue-inline', item.cue));
            return li;
        }

        if (item.cue || item.easier || item.harder) {
            const det = h('details', 'ex-more');
            const sum = h('summary', null, 'Technique & scaling');
            det.appendChild(sum);
            if (item.cue) det.appendChild(h('p', 'ex-cue', item.cue));
            if (item.easier || item.harder) {
                const ul = h('ul', 'ex-scale');
                if (item.easier) { const x = h('li'); x.appendChild(h('strong', null, 'Easier: ')); x.appendChild(document.createTextNode(item.easier)); ul.appendChild(x); }
                if (item.harder) { const x = h('li'); x.appendChild(h('strong', null, 'Harder: ')); x.appendChild(document.createTextNode(item.harder)); ul.appendChild(x); }
                det.appendChild(ul);
            }
            li.appendChild(det);
        }
        return li;
    }

    function sessionBlocks(day, interactive) {
        const wrap = h('div', 'blocks');
        (day.blocks || []).forEach(function (b) {
            if (!b.items || !b.items.length) return;
            const sec = h('section', 'block block-' + b.id);
            const head = h('div', 'block-head');
            head.appendChild(h('h4', 'block-name', b.name));
            if (b.minutes) head.appendChild(h('span', 'block-mins', '~' + b.minutes + ' min'));
            sec.appendChild(head);
            if (b.note) sec.appendChild(h('p', 'block-note', b.note));
            const ul = h('ul', 'ex-list');
            b.items.forEach(function (it) {
                ul.appendChild(itemRow(it, day.date, interactive && b.id === 'main'));
            });
            sec.appendChild(ul);
            wrap.appendChild(sec);
        });
        return wrap;
    }

    /* --------------------------------------------------------- today view */

    function sessionDaysBefore(idx) {
        const out = [];
        for (let i = 0; i < idx && i < state.plan.days.length; i++) {
            if (state.plan.days[i].type === 'session') out.push(state.plan.days[i]);
        }
        return out;
    }

    function firstIncompleteIndex() {
        for (let i = 0; i < state.plan.days.length; i++) {
            const d = state.plan.days[i];
            if (d.type === 'session' && state.progress.days.indexOf(d.date) === -1) return i;
        }
        return 0;
    }

    function shiftPlanToToday() {
        const idx = firstIncompleteIndex();
        const newStart = E.addDays(new Date(), -idx);
        const cfg = Object.assign({}, state.plan.config, { start: E.toISO(newStart) });
        /* Overrides are keyed by date, so they have to move with the plan. */
        const delta = E.dayDiff(E.fromISO(state.plan.config.start), newStart);
        const moved = {};
        Object.keys(cfg.overrides || {}).forEach(function (k) {
            moved[E.toISO(E.addDays(E.fromISO(k), delta))] = cfg.overrides[k];
        });
        cfg.overrides = moved;
        state.plan = E.buildPlan(cfg);
        state.draft = Object.assign({}, state.plan.config);
        save();
        renderAll();
        toast('Plan shifted — today is day ' + (idx + 1));
    }

    function statRow(stats) {
        const row = h('div', 'stat-row');
        stats.forEach(function (s) {
            const b = h('div', 'stat');
            b.appendChild(h('span', 'stat-v', s[1]));
            b.appendChild(h('span', 'stat-k', s[0]));
            row.appendChild(b);
        });
        return row;
    }

    function miniDay(day) {
        const li = h('li', 'mini mini-' + day.type);
        li.appendChild(h('span', 'mini-day', day.weekdayShort));
        li.appendChild(h('span', 'mini-title', day.title));
        li.appendChild(h('span', 'mini-date', shortDate(day.date)));
        return li;
    }

    function renderToday() {
        const empty = $('#todayEmpty');
        const body = $('#todayBody');
        if (!state.plan) { empty.hidden = false; body.hidden = true; return; }
        empty.hidden = true;
        body.hidden = false;
        clear(body);

        const plan = state.plan;
        const total = plan.days.length;
        const idx = E.dayIndexFor(plan, new Date());
        const cfg = plan.config;

        /* ---- plan header ---- */
        const head = h('header', 'card today-head');
        const titleRow = h('div', 'today-title-row');
        const tstack = h('div');
        tstack.appendChild(h('p', 'kicker', plan.goal.glyph + ' ' + plan.goal.name));
        tstack.appendChild(h('h2', 'today-name', cfg.name || 'Your training plan'));
        titleRow.appendChild(tstack);
        const shareBtn = h('button', 'btn btn-ghost btn-sm', '↗ Share');
        shareBtn.type = 'button';
        shareBtn.addEventListener('click', openExport);
        titleRow.appendChild(shareBtn);
        head.appendChild(titleRow);

        const doneSessions = state.progress.days.length;
        const totalSessions = plan.days.filter(d => d.type === 'session').length;

        if (idx < 0) {
            head.appendChild(h('p', 'notice notice-info',
                'This plan starts on ' + prettyDate(cfg.start) + ' — that is in ' + (-idx) + ' day' + (-idx === 1 ? '' : 's') + '.'));
        } else if (idx >= total) {
            head.appendChild(h('p', 'notice notice-good',
                'Block complete. You finished ' + doneSessions + ' of ' + totalSessions +
                ' sessions across ' + total + ' days. Forge the next block — same goal with a higher starting point, or something new.'));
        } else {
            const pct = Math.round(((idx + 1) / total) * 100);
            head.appendChild(statRow([
                ['Day', (idx + 1) + ' / ' + total],
                ['Days left', String(total - idx - 1)],
                ['Week', (plan.days[idx].week + 1) + ' · ' + plan.days[idx].phaseName],
                ['Sessions done', doneSessions + ' / ' + totalSessions]
            ]));
            const bar = h('div', 'bar');
            bar.setAttribute('role', 'progressbar');
            bar.setAttribute('aria-valuenow', String(pct));
            bar.setAttribute('aria-valuemin', '0');
            bar.setAttribute('aria-valuemax', '100');
            bar.setAttribute('aria-label', 'Plan progress');
            const fill = h('span', 'bar-fill');
            fill.style.width = pct + '%';
            bar.appendChild(fill);
            head.appendChild(bar);
        }
        body.appendChild(head);

        /* ---- missed sessions ---- */
        if (idx > 0 && idx < total) {
            const missed = sessionDaysBefore(idx).filter(d => state.progress.days.indexOf(d.date) === -1);
            if (missed.length >= 2) {
                const n = h('div', 'card notice-card');
                n.appendChild(h('p', null, missed.length + ' session' + (missed.length === 1 ? '' : 's') +
                    ' went by unticked. That is normal — life happens. Carry on from today, or slide the whole block forward so nothing is skipped.'));
                const b = h('button', 'btn btn-ghost btn-sm', '⟳ Shift plan to today');
                b.type = 'button';
                b.addEventListener('click', shiftPlanToToday);
                n.appendChild(b);
                body.appendChild(n);
            }
        }

        /* ---- today's card ---- */
        const day = (idx >= 0 && idx < total) ? plan.days[idx] : (idx < 0 ? plan.days[0] : null);
        if (day) {
            const card = h('article', 'card day-card day-' + day.type);
            const dh = h('header', 'day-head');
            const left = h('div');
            left.appendChild(h('p', 'kicker', (idx < 0 ? 'First session · ' : 'Today · ') + prettyDate(day.date)));
            left.appendChild(h('h3', 'day-title', day.title));
            left.appendChild(h('p', 'day-focus', day.focus));
            dh.appendChild(left);
            const tags = h('div', 'day-tags');
            if (day.tag) tags.appendChild(h('span', 'tag', day.tag));
            if (day.estimate) tags.appendChild(h('span', 'tag tag-quiet', '~' + day.estimate + ' min'));
            tags.appendChild(h('span', 'tag tag-quiet', day.weekLabel + ' · ' + day.phaseName));
            if (day.edited) tags.appendChild(h('span', 'tag tag-edit', '✎ Edited'));
            dh.appendChild(tags);
            card.appendChild(dh);

            if (day.phaseNote) card.appendChild(h('p', 'phase-note', day.phaseNote));

            /* Nothing here is set in stone — let people change the day. */
            const acts = h('div', 'day-actions');
            const changeBtn = h('button', 'btn btn-ghost btn-sm',
                day.type === 'session' ? '⇄ Change this session' : '🏋️ Train today instead');
            changeBtn.type = 'button';
            changeBtn.addEventListener('click', function () { openDayDialog(day.date); });
            acts.appendChild(changeBtn);
            if (day.type === 'session') {
                const restBtn = h('button', 'btn btn-ghost btn-sm', '😴 Rest instead');
                restBtn.type = 'button';
                restBtn.addEventListener('click', function () {
                    setOverride(day.date, { mode: 'rest', tpl: null, swaps: null });
                    toast('Turned into a rest day');
                });
                acts.appendChild(restBtn);
            }
            if (day.edited) {
                const undo = h('button', 'btn btn-ghost btn-sm', '↺ Undo changes');
                undo.type = 'button';
                undo.addEventListener('click', function () { clearDay(day.date); });
                acts.appendChild(undo);
            }
            card.appendChild(acts);

            if (day.type === 'session') {
                card.appendChild(sessionBlocks(day, true));
                const done = state.progress.days.indexOf(day.date) !== -1;
                const cta = h('button', 'btn ' + (done ? 'btn-ghost' : 'btn-primary') + ' btn-big full',
                    done ? '✓ Session logged — tap to undo' : 'Mark this session complete');
                cta.type = 'button';
                cta.addEventListener('click', function () {
                    const i = state.progress.days.indexOf(day.date);
                    if (i === -1) {
                        state.progress.days.push(day.date);
                        toast('Logged. That is the hard part done.');
                    } else {
                        state.progress.days.splice(i, 1);
                    }
                    save();
                    renderToday();
                });
                card.appendChild(cta);
            } else {
                const rest = h('div', 'rest-body');
                rest.appendChild(h('p', 'rest-lead', day.type === 'rest'
                    ? 'Nothing scheduled. Recovery is where the adaptation happens — take it.'
                    : 'Keep it gentle. Movement today, not training.'));
                if (day.tip) {
                    const tip = h('p', 'tip');
                    tip.appendChild(h('strong', null, 'Coach’s note: '));
                    tip.appendChild(document.createTextNode(day.tip));
                    rest.appendChild(tip);
                }
                card.appendChild(rest);
            }
            body.appendChild(card);
        }

        /* ---- what is coming ---- */
        if (idx < total) {
            const from = Math.max(0, idx + 1);
            const next = plan.days.slice(from, from + 4);
            if (next.length) {
                const up = h('section', 'card upcoming');
                up.appendChild(h('h3', 'card-title', 'Coming up'));
                const ul = h('ul', 'mini-list');
                next.forEach(d => ul.appendChild(miniDay(d)));
                up.appendChild(ul);
                const link = h('button', 'linkish', 'See the whole schedule →');
                link.type = 'button';
                link.addEventListener('click', () => setView('plan'));
                up.appendChild(link);
                body.appendChild(up);
            }
        }
    }

    /* ---------------------------------------------------------- plan view */

    function renderPlan() {
        const empty = $('#planEmpty');
        const body = $('#planBody');
        if (!state.plan) { empty.hidden = false; body.hidden = true; return; }
        empty.hidden = true;
        body.hidden = false;
        clear(body);

        const plan = state.plan;
        const cfg = plan.config;
        const sum = E.summarise(plan);
        const todayIdx = E.dayIndexFor(plan, new Date());

        const head = h('header', 'card plan-head');
        head.appendChild(h('p', 'kicker', plan.goal.glyph + ' ' + plan.goal.name));
        head.appendChild(h('h2', 'today-name', cfg.name || 'Your training plan'));
        head.appendChild(h('p', 'plan-meta',
            cfg.perWeek + ' days a week · ' + cfg.mins + ' min per session · ' + cfg.length +
            ' days from ' + prettyDate(cfg.start)));
        head.appendChild(statRow([
            ['Sessions', String(sum.total.sessions)],
            ['Training hours', String(Math.round(sum.total.minutes / 60))],
            ['Rest days', String(sum.total.rest)],
            ['Weeks', String(sum.weeks.length)]
        ]));

        const acts = h('div', 'plan-actions');
        function act(label, cls, fn) {
            const b = h('button', 'btn ' + cls + ' btn-sm', label);
            b.type = 'button';
            b.addEventListener('click', fn);
            acts.appendChild(b);
        }
        act('↗ Share / export', 'btn-primary', openExport);
        act('⟳ Shift to today', 'btn-ghost', shiftPlanToToday);
        act('⚒️ Rebuild', 'btn-ghost', function () { setView('forge'); });
        act('🗑 Delete plan', 'btn-danger', function () {
            if (!window.confirm('Delete this plan and its logged sessions from this device? This cannot be undone.')) return;
            try { localStorage.removeItem(STORE_KEY); } catch (err) { /* ignore */ }
            state.plan = null;
            state.progress = { items: {}, days: [] };
            renderAll();
            setView('forge');
            toast('Plan deleted');
        });
        head.appendChild(acts);
        body.appendChild(head);

        sum.weeks.forEach(function (w) {
            const det = h('details', 'week');
            const isCurrent = todayIdx >= 0 && Math.floor(todayIdx / 7) === w.index;
            det.open = isCurrent || (todayIdx < 0 && w.index === 0);
            if (isCurrent) det.classList.add('is-current');

            const s = h('summary', 'week-head');
            const wl = h('div', 'week-label');
            wl.appendChild(h('span', 'week-n', w.label));
            wl.appendChild(h('span', 'week-phase phase-' + w.phase.toLowerCase(), w.phase));
            s.appendChild(wl);
            s.appendChild(h('span', 'week-stat', w.sessions + ' sessions · ~' + Math.round(w.minutes / 60 * 10) / 10 + ' h'));
            det.appendChild(s);

            if (w.phaseNote) det.appendChild(h('p', 'week-note', w.phaseNote));

            const top = Object.keys(w.sets).map(m => [m, w.sets[m]]).sort((a, b) => b[1] - a[1]).slice(0, 6);
            if (top.length) {
                const vol = h('ul', 'vol-list');
                top.forEach(function (t) {
                    const li = h('li', 'vol');
                    li.appendChild(h('span', 'vol-m', t[0]));
                    li.appendChild(h('span', 'vol-n', t[1] + ' sets'));
                    vol.appendChild(li);
                });
                const volWrap = h('div', 'vol-wrap');
                volWrap.appendChild(h('p', 'vol-title', 'Weekly hard sets per muscle'));
                volWrap.appendChild(vol);
                det.appendChild(volWrap);
            }
            if (w.cardioMinutes) {
                det.appendChild(h('p', 'week-note', 'Cardio this week: about ' + w.cardioMinutes + ' minutes.'));
            }

            const list = h('ul', 'day-list');
            w.days.forEach(function (day) {
                const li = h('li', 'day-row day-' + day.type + (day.index === todayIdx ? ' is-today' : ''));
                const d = h('details', 'day-det');
                const ds = h('summary', 'day-sum');
                const dl = h('span', 'day-when');
                dl.appendChild(h('span', 'day-wd', day.weekdayShort));
                dl.appendChild(h('span', 'day-dt', shortDate(day.date)));
                ds.appendChild(dl);
                const dt = h('span', 'day-what');
                dt.appendChild(h('span', 'day-t', day.title));
                if (day.type === 'session') dt.appendChild(h('span', 'day-f', day.focus));
                ds.appendChild(dt);
                const badge = h('span', 'day-badge');
                if (day.edited) badge.appendChild(h('span', 'tag tag-edit', '✎'));
                if (day.index === todayIdx) badge.appendChild(h('span', 'tag tag-now', 'Today'));
                else if (day.type === 'session' && state.progress.days.indexOf(day.date) !== -1) badge.appendChild(h('span', 'tag tag-done', '✓'));
                else if (day.estimate) badge.appendChild(h('span', 'tag tag-quiet', day.estimate + "'"));
                ds.appendChild(badge);
                d.appendChild(ds);

                let filled = false;
                d.addEventListener('toggle', function () {
                    if (!d.open || filled) return;
                    filled = true;
                    if (day.type === 'session') d.appendChild(sessionBlocks(day, false));
                    else {
                        const p = h('div', 'rest-body');
                        p.appendChild(h('p', null, day.focus));
                        if (day.tip) p.appendChild(h('p', 'tip', day.tip));
                        d.appendChild(p);
                    }
                    const acts = h('div', 'day-actions day-actions-inline');
                    const edit = h('button', 'btn btn-ghost btn-sm',
                        day.type === 'session' ? '⇄ Change this day' : '🏋️ Train this day instead');
                    edit.type = 'button';
                    edit.addEventListener('click', function () { openDayDialog(day.date); });
                    acts.appendChild(edit);
                    if (day.edited) {
                        const undo = h('button', 'btn btn-ghost btn-sm', '↺ Undo');
                        undo.type = 'button';
                        undo.addEventListener('click', function () { clearDay(day.date); });
                        acts.appendChild(undo);
                    }
                    d.appendChild(acts);
                });
                li.appendChild(d);
                list.appendChild(li);
            });
            det.appendChild(list);
            body.appendChild(det);
        });
    }

    /* ------------------------------------------------------- library view */

    const LIB_CATS = [
        { id: 'all', name: 'All' },
        { id: 'push', name: 'Push' },
        { id: 'pull', name: 'Pull' },
        { id: 'squat', name: 'Squat' },
        { id: 'hinge', name: 'Hinge' },
        { id: 'lunge', name: 'Lunge' },
        { id: 'core', name: 'Core' },
        { id: 'carry', name: 'Carry' },
        { id: 'cardio', name: 'Cardio' },
        { id: 'mobility', name: 'Mobility' }
    ];
    let libCat = 'all';

    function renderLibrary() {
        const cats = $('#libCats');
        clear(cats);
        LIB_CATS.forEach(function (c) {
            const b = h('button', 'chip chip-sm' + (libCat === c.id ? ' is-on' : ''));
            b.type = 'button';
            b.setAttribute('aria-pressed', libCat === c.id ? 'true' : 'false');
            b.appendChild(h('span', 'chip-label', c.name));
            b.addEventListener('click', function () { libCat = c.id; renderLibrary(); });
            cats.appendChild(b);
        });

        const q = ($('#libSearch').value || '').trim().toLowerCase();
        const grid = $('#libGrid');
        clear(grid);

        const list = D.exercises.filter(function (ex) {
            if (libCat !== 'all' && ex.cat !== libCat) return false;
            if (!q) return true;
            return (ex.name + ' ' + ex.muscles.join(' ') + ' ' + ex.cat + ' ' + (ex.cue || '')).toLowerCase().indexOf(q) !== -1;
        });

        $('#libCount').textContent = list.length + ' of ' + D.exercises.length + ' exercises';

        const levelName = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };
        const equipName = { none: 'Bodyweight', bar: 'Pull-up bar', band: 'Band', dumbbell: 'Dumbbell', gym: 'Gym' };

        list.forEach(function (ex) {
            const card = h('article', 'card lib-card');
            const top = h('div', 'lib-top');
            top.appendChild(h('h3', 'lib-name', ex.name));
            const badges = h('div', 'lib-badges');
            badges.appendChild(h('span', 'pill pill-' + ex.cat, ex.cat));
            badges.appendChild(h('span', 'pill', equipName[ex.equip] || ex.equip));
            badges.appendChild(h('span', 'pill pill-lvl-' + ex.level, levelName[ex.level]));
            top.appendChild(badges);
            card.appendChild(top);
            if (ex.cue) card.appendChild(h('p', 'lib-cue', ex.cue));
            card.appendChild(h('p', 'lib-muscles', ex.muscles.join(' · ')));
            if (ex.easier || ex.harder) {
                const ul = h('ul', 'ex-scale');
                if (ex.easier) { const x = h('li'); x.appendChild(h('strong', null, 'Easier: ')); x.appendChild(document.createTextNode(ex.easier)); ul.appendChild(x); }
                if (ex.harder) { const x = h('li'); x.appendChild(h('strong', null, 'Harder: ')); x.appendChild(document.createTextNode(ex.harder)); ul.appendChild(x); }
                card.appendChild(ul);
            }
            grid.appendChild(card);
        });

        if (!list.length) {
            grid.appendChild(h('p', 'empty-note', 'Nothing matches that. Try a muscle name, or clear the filter.'));
        }
    }

    /* ------------------------------------------------------ export/import */

    function shareLink() {
        const base = location.origin + location.pathname;
        return base + '#p=' + b64e(JSON.stringify(state.plan.config));
    }

    function openDialog(dlg) {
        if (typeof dlg.showModal === 'function') dlg.showModal();
        else dlg.setAttribute('open', '');
    }

    function openExport() {
        if (!state.plan) { toast('Forge a plan first'); return; }
        $('#exportBox').value = shareLink();
        openDialog($('#exportDialog'));
    }

    function openImport() { openDialog($('#importDialog')); }

    function readImport(text) {
        const raw = String(text || '').trim();
        if (!raw) return null;
        const m = /[#?]p=([A-Za-z0-9\-_]+)/.exec(raw);
        if (m) {
            try { return JSON.parse(b64d(m[1])); } catch (err) { return null; }
        }
        if (raw.charAt(0) === '{') {
            try {
                const o = JSON.parse(raw);
                return o && o.config ? o.config : o;
            } catch (err) { return null; }
        }
        try { return JSON.parse(b64d(raw)); } catch (err) { return null; }
    }

    function adoptConfig(cfg, msg) {
        const clean = E.validateConfig(cfg);
        state.plan = E.buildPlan(clean);
        state.draft = Object.assign({}, state.plan.config);
        state.progress = { items: {}, days: [] };
        save();
        renderAll();
        setView('today');
        toast(msg || 'Plan loaded');
    }

    /* ----------------------------------------------------------- printing */

    function printPlan() {
        setView('plan');
        $$('#planBody details').forEach(function (d) {
            if (!d.open) { d.open = true; d.dispatchEvent(new Event('toggle')); }
        });
        const dlg = $('#exportDialog');
        if (dlg.open) dlg.close();
        setTimeout(function () { window.print(); }, 260);
    }

    /* --------------------------------------------------------------- wire */

    function renderAll() {
        renderGoals();
        renderLevels();
        renderPerWeek();
        renderMins();
        renderKit();
        renderFocus();
        renderLength();
        renderSummary();
        renderToday();
        renderPlan();
    }

    function init() {
        renderGoalExplainers();
        renderLibrary();

        $('#startDate').value = state.draft.start;
        $('#startDate').min = E.toISO(E.addDays(new Date(), -365));

        const hadPlan = load();

        /* A share link beats whatever is stored locally, but ask first. */
        const m = /[#&]p=([A-Za-z0-9\-_]+)/.exec(location.hash);
        if (m) {
            const cfg = readImport(location.hash);
            history.replaceState(null, '', location.pathname);
            if (cfg) {
                const ok = !hadPlan || window.confirm('This link contains a shared plan. Load it? Your current plan on this device will be replaced.');
                if (ok) { adoptConfig(cfg, 'Shared plan loaded'); }
            } else {
                toast('That share link could not be read');
            }
        }

        $('#planName').value = state.draft.name || '';
        $('#startDate').value = state.draft.start;

        renderAll();

        let startView = hadPlan || state.plan ? 'today' : 'forge';
        try {
            const saved = localStorage.getItem(VIEW_KEY);
            if (saved && state.plan && ['today', 'plan', 'library'].indexOf(saved) !== -1) startView = saved;
        } catch (err) { /* ignore */ }
        setView(startView);

        /* tabs */
        $$('.tab').forEach(t => t.addEventListener('click', () => setView(t.dataset.view)));
        $$('[data-goto]').forEach(b => b.addEventListener('click', () => setView(b.dataset.goto)));
        $$('[data-open="import"]').forEach(b => b.addEventListener('click', openImport));

        /* forge inputs */
        $('#planName').addEventListener('input', function () { state.draft.name = this.value; });
        $('#startDate').addEventListener('change', function () {
            if (this.value) { state.draft.start = this.value; renderSummary(); }
        });

        $('#forgeForm').addEventListener('submit', function (e) {
            e.preventDefault();
            state.draft.name = $('#planName').value;
            if ($('#startDate').value) state.draft.start = $('#startDate').value;
            state.draft.seed = Math.random().toString(36).slice(2, 10);
            state.draft.overrides = {};
            state.plan = E.buildPlan(state.draft);
            state.draft = Object.assign({}, state.plan.config);
            state.progress = { items: {}, days: [] };
            save();
            renderAll();
            setView('today');
            toast('Plan forged. Day one is waiting.');
        });

        /* library */
        $('#libSearch').addEventListener('input', renderLibrary);

        /* export */
        $('#copyLink').addEventListener('click', () => copy(shareLink(), 'Share link copied'));
        $('#copyText').addEventListener('click', () => copy(E.toText(state.plan), 'Plan copied as text'));
        $('#printPlan').addEventListener('click', printPlan);
        $('#downloadJson').addEventListener('click', function () {
            const payload = JSON.stringify({ v: 1, config: state.plan.config }, null, 2);
            const blob = new Blob([payload], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = (state.plan.config.name || 'training-plan').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            toast('Downloaded');
        });

        /* import */
        $('#doImport').addEventListener('click', function () {
            const cfg = readImport($('#importBox').value);
            const msg = $('#importMsg');
            if (!cfg) {
                msg.textContent = 'That does not look like a Trainer Forge plan. Paste the whole share link, or the whole JSON file.';
                msg.className = 'import-msg is-bad';
                return;
            }
            msg.textContent = '';
            $('#importDialog').close();
            $('#importBox').value = '';
            adoptConfig(cfg);
        });

        /* Rebuild the day view if the tab was left open past midnight. */
        document.addEventListener('visibilitychange', function () {
            if (!document.hidden && state.plan) renderToday();
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
