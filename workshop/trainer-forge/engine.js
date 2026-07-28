/* ==========================================================================
   Personal Trainer Forge — plan engine
   --------------------------------------------------------------------------
   Pure, deterministic plan generation. Given the same config it always
   produces the same plan, which is why a share link only needs to carry the
   config (a few dozen bytes) instead of the whole schedule.

   Public API on window.TF_ENGINE:
     buildPlan(config)      → full plan object
     dayIndexFor(plan,date) → which day of the plan a date is
     summarise(plan)        → weekly volume + minute totals
     toText(plan)           → plain-text / markdown export
     validateConfig(raw)    → whitelist-checked config (used for imports)
   ========================================================================== */

(function () {
    'use strict';

    const D = window.TF_DATA;
    const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const WEEKDAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    /* ------------------------------------------------------------ utilities */

    function hashStr(str) {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        return h >>> 0;
    }

    /* mulberry32 — tiny, fast, good enough seeded PRNG */
    function rngFrom(seedStr) {
        let a = hashStr(seedStr);
        return function () {
            a |= 0; a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function toISO(d) {
        const p = n => String(n).padStart(2, '0');
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
    }

    function fromISO(s) {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
        if (!m) return new Date();
        return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    }

    function addDays(d, n) {
        const c = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        c.setDate(c.getDate() + n);
        return c;
    }

    /* Monday = 0 … Sunday = 6 */
    function isoWeekday(d) { return (d.getDay() + 6) % 7; }

    function dayDiff(a, b) {
        const x = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
        const y = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
        return Math.round((y - x) / 86400000);
    }

    function midReps(reps) {
        const nums = String(reps).match(/\d+/g);
        if (!nums) return 10;
        if (nums.length === 1) return Number(nums[0]);
        return (Number(nums[0]) + Number(nums[1])) / 2;
    }

    function byId(id) {
        for (let i = 0; i < D.exercises.length; i++) if (D.exercises[i].id === id) return D.exercises[i];
        return null;
    }

    /* -------------------------------------------------------- config safety */

    const GOAL_IDS = D.goals.map(g => g.id);
    const KIT_IDS = D.equipment.map(e => e.id);
    const FOCUS_IDS = D.focus.map(f => f.id);
    const TPL_IDS = Object.keys(D.templates);
    const LEN_VALUES = D.lengths.map(l => l.days);

    function pickOne(value, allowed, fallback) {
        return allowed.indexOf(value) !== -1 ? value : fallback;
    }

    function goalById(id) {
        return D.goals.filter(g => g.id === id)[0] || D.goals[D.goals.length - 1];
    }

    /* Which session lengths and weekly frequencies a goal actually supports. */
    function durationsFor(goal) { return goal.durations || D.defaultDurations; }
    function frequenciesFor(goal) { return Object.keys(goal.splits).map(Number).sort((a, b) => a - b); }

    /* Per-day changes the user made by hand. Kept in the config so they survive
       a share link, a reload and an export. */
    function validateOverrides(raw) {
        const out = {};
        if (!raw || typeof raw !== 'object') return out;
        Object.keys(raw).slice(0, 400).forEach(function (key) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return;
            const v = raw[key];
            if (!v || typeof v !== 'object') return;
            const o = {};
            if (v.mode === 'rest') {
                o.mode = 'rest';
            } else if (v.mode === 'train') {
                o.mode = 'train';
                if (typeof v.tpl === 'string' && TPL_IDS.indexOf(v.tpl) !== -1) o.tpl = v.tpl;
            }
            if (v.swaps && typeof v.swaps === 'object') {
                const s = {};
                Object.keys(v.swaps).slice(0, 30).forEach(function (sk) {
                    if (!/^\d{1,2}$/.test(sk)) return;
                    const n = Math.floor(Number(v.swaps[sk]));
                    if (isFinite(n) && n > 0 && n <= 99) s[sk] = n;
                });
                if (Object.keys(s).length) o.swaps = s;
            }
            if (Object.keys(o).length) out[key] = o;
        });
        return out;
    }

    /* Everything that can arrive from a URL or a pasted file goes through here. */
    function validateConfig(raw) {
        const src = (raw && typeof raw === 'object') ? raw : {};
        const kitIn = Array.isArray(src.kit) ? src.kit : ['none'];
        const focusIn = Array.isArray(src.focus) ? src.focus : [];
        const kit = KIT_IDS.filter(id => id === 'none' || kitIn.indexOf(id) !== -1);
        const focus = FOCUS_IDS.filter(id => focusIn.indexOf(id) !== -1).slice(0, 6);

        let name = typeof src.name === 'string' ? src.name : '';
        name = name.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 60);

        let start = typeof src.start === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(src.start)
            ? src.start : toISO(new Date());

        let seed = typeof src.seed === 'string' ? src.seed.replace(/[^a-z0-9]/gi, '').slice(0, 16) : '';
        if (!seed) seed = Math.random().toString(36).slice(2, 10);

        const goalId = pickOne(src.goal, GOAL_IDS, 'all-round');
        const goal = goalById(goalId);
        const freqs = frequenciesFor(goal);
        const durs = durationsFor(goal);

        return {
            v: 1,
            name: name,
            goal: goalId,
            level: [1, 2, 3].indexOf(Number(src.level)) !== -1 ? Number(src.level) : 1,
            perWeek: pickOne(Number(src.perWeek), freqs, freqs.indexOf(3) !== -1 ? 3 : freqs[0]),
            mins: pickOne(Number(src.mins), durs, durs.indexOf(45) !== -1 ? 45 : durs[Math.floor(durs.length / 2)]),
            length: pickOne(Number(src.length), LEN_VALUES, 28),
            kit: kit,
            focus: focus,
            start: start,
            seed: seed,
            overrides: validateOverrides(src.overrides)
        };
    }

    /* ----------------------------------------------------- exercise picking */

    function equipOK(ex, kit) {
        if (ex.equip === 'none') return true;
        if (kit.indexOf('gym') !== -1 && (ex.equip === 'dumbbell' || ex.equip === 'bar' || ex.equip === 'gym')) return true;
        return kit.indexOf(ex.equip) !== -1;
    }

    function matches(ex, want) {
        if (!want) return true;
        if (want.cat && ex.cat !== want.cat) return false;
        if (want.type && ex.type !== want.type) return false;
        if (want.zone && ex.zone !== want.zone) return false;
        if (want.burst && !ex.burst) return false;
        if (want.muscles && want.muscles.length) {
            let hit = false;
            for (let i = 0; i < want.muscles.length; i++) {
                if (ex.muscles.indexOf(want.muscles[i]) !== -1) { hit = true; break; }
            }
            if (!hit) return false;
        }
        return true;
    }

    /* Rules that hold however far the filters get relaxed: a strength slot must
       never be filled with a hill-repeat session, and a mobility flow must never
       be filled with jumping jacks. */
    function allowedInSlot(ex, want) {
        const wantsCardio = !!(want && (want.cat === 'cardio' || want.type === 'cardio'));
        if (ex.type === 'cardio' && !wantsCardio) return false;
        const wantsMobility = !!(want && want.type === 'mobility');
        if (ex.prep && wantsMobility) return false;
        /* An ankle rock is not calf training. Mobility drills only fill mobility slots. */
        if (ex.type === 'mobility' && !wantsMobility) return false;
        return true;
    }

    /* Choose one exercise. Deterministic for a given seed string. */
    function choose(want, ctx, used, seedStr, preferFocus, role) {
        const kit = ctx.cfg.kit;
        const level = ctx.cfg.level;
        const free = ex => used.indexOf(ex.id) === -1 && allowedInSlot(ex, want);

        let pool = D.exercises.filter(ex => free(ex) && ex.level <= level && equipOK(ex, kit) && matches(ex, want));

        /* Relax, one rule at a time, rather than ever returning nothing. */
        if (!pool.length) {
            pool = D.exercises.filter(ex => free(ex) && equipOK(ex, kit) && matches(ex, want));
        }
        if (!pool.length && want && want.muscles) {
            const loose = { cat: want.cat, type: want.type };
            pool = D.exercises.filter(ex => free(ex) && ex.level <= level && equipOK(ex, kit) && matches(ex, loose));
        }
        if (!pool.length && want && want.cat) {
            pool = D.exercises.filter(ex => free(ex) && ex.level <= level && equipOK(ex, kit) && ex.cat === want.cat);
        }
        if (!pool.length) {
            pool = D.exercises.filter(ex => free(ex) && ex.level <= level && equipOK(ex, kit) && ex.type !== 'mobility');
        }
        if (!pool.length) return null;

        /* Score: harder-but-available variations first, focus muscles boosted. */
        const focus = ctx.cfg.focus || [];
        const scored = pool.map(function (ex) {
            let s = ex.level * 2;
            if (preferFocus !== false && focus.length) {
                for (let i = 0; i < focus.length; i++) if (ex.muscles.indexOf(focus[i]) !== -1) s += 6;
            }
            if (role === 'isolation' && ex.type === 'isolation') s += 5;
            if (role === 'compound' && ex.type === 'compound') s += 5;
            /* If you told us you own kit, use it. */
            if (ex.equip !== 'none' && kit.length > 1) s += 3;
            return { ex: ex, score: s };
        }).sort((a, b) => b.score - a.score || (a.ex.id < b.ex.id ? -1 : 1));

        /* Pick randomly from the strongest handful so plans stay varied. */
        const top = scored.slice(0, Math.max(1, Math.min(4, scored.length)));
        const r = rngFrom(seedStr)();
        return top[Math.floor(r * top.length) % top.length].ex;
    }

    /* --------------------------------------------------------- time budgets */

    function budgets(mins) {
        if (mins <= 5) return { warm: 1, main: 4, cool: 0 };
        if (mins <= 10) return { warm: 2, main: 7, cool: 1 };
        if (mins <= 15) return { warm: 3, main: 10, cool: 2 };
        if (mins <= 30) return { warm: 5, main: 21, cool: 4 };
        if (mins <= 45) return { warm: 6, main: 34, cool: 5 };
        if (mins <= 60) return { warm: 7, main: 46, cool: 7 };
        return { warm: 8, main: 60, cool: 7 };
    }

    /* A flat allowance per exercise for walking over, setting up and reading the
       cue. Keep it modest, or a five-minute session ends up with one movement. */
    const SETUP_SECONDS = 20;

    function itemSeconds(item) {
        if (item.unit === 'mins') return (item.minutes || 0) * 60;
        const sets = item.sets || 1;
        const work = item.unit === 'hold'
            ? (item.holdSeconds || 40)
            : midReps(item.reps) * (item.secPerRep || 3.5);
        return sets * work + (sets - 1) * (item.rest || 60) + SETUP_SECONDS;
    }

    function totalSeconds(items) {
        let t = 0;
        for (let i = 0; i < items.length; i++) t += itemSeconds(items[i]);
        return t;
    }

    /* Drop work from the middle rather than the tail. Cutting the tail is what
       makes a "bigger arms" plan quietly lose its arm work when the clock runs
       short, so accessory volume goes first and anything hitting a chosen focus
       muscle goes last. */
    const DROP_ORDER = ['secondary', 'accessory', 'isolation', 'mobility', 'core', 'skill', 'compound'];

    function trimToBudget(items, budgetSec, focus, keepFirst) {
        const hitsFocus = it => focus.some(f => it.muscles.indexOf(f) !== -1);
        const findVictim = function (onlyNonFocus) {
            for (let r = 0; r < DROP_ORDER.length; r++) {
                for (let i = items.length - 1; i >= keepFirst; i--) {
                    if (items[i].role !== DROP_ORDER[r]) continue;
                    if (onlyNonFocus && hitsFocus(items[i])) continue;
                    return i;
                }
            }
            return -1;
        };
        let guard = 0;
        while (items.length > keepFirst && totalSeconds(items) > budgetSec && guard++ < 40) {
            let idx = findVictim(true);
            if (idx === -1) idx = findVictim(false);
            if (idx === -1) break;
            items.splice(idx, 1);
        }
        return items;
    }

    /* ----------------------------------------------------- session building */

    function scheme(goal, role) {
        if (role === 'mobility' && !goal.schemes.mobility) {
            return { sets: 2, reps: '45–60 s', rest: 20, rpe: '4–5', hold: 50 };
        }
        return goal.schemes[role] || goal.schemes.accessory || goal.schemes.compound;
    }

    /* Habit goals are not periodised: the same small dose every week is the
       whole point, and a deload would just break the streak. */
    const STEADY_PHASE = {
        id: 'steady', name: 'Steady', setMult: 1, cardioMult: 1, rpeShift: 0,
        note: 'No peaks, no deloads — the same small dose every week. The streak is the training effect.'
    };

    function phaseFor(goal, week) {
        return goal.steady ? STEADY_PHASE : D.phases[week % D.phases.length];
    }

    function applyPhase(base, phase, role) {
        const out = {
            sets: Math.max(1, Math.round(base.sets * (role === 'core' || role === 'mobility' ? Math.max(0.6, phase.setMult) : phase.setMult))),
            reps: base.reps,
            rest: base.rest,
            rpe: base.rpe
        };
        /* A deload must never end up with more sets than the base week — which is
           exactly what happens to one-set mobility schemes if you only floor it. */
        if (phase.id === 'deload') out.sets = Math.max(1, Math.min(base.sets, Math.round(base.sets * 0.6)));
        if (phase.id === 'peak') out.sets = Math.max(base.sets, Math.round(base.sets * 1.25));
        return out;
    }

    function makeItem(ex, role, goal, phase, seedStr) {
        const base = scheme(goal, role);
        const s = applyPhase(base, phase, role);
        /* A scheme like "30–45 s" is a timed set, whatever the exercise's own
           natural unit is — otherwise "45" gets costed as forty-five reps. */
        const timedScheme = /\d\s*(–|-)?\s*\d*\s*(s\b|sec|min)/i.test(String(s.reps));
        const item = {
            id: ex.id,
            name: ex.name,
            cue: ex.cue,
            muscles: ex.muscles.slice(),
            equip: ex.equip,
            role: role,
            unit: ex.unit === 'mins' ? 'mins' : ((ex.unit === 'hold' || timedScheme) ? 'hold' : 'reps'),
            sets: s.sets,
            reps: s.reps,
            rest: s.rest,
            rpe: s.rpe,
            secPerRep: ex.sec || base.secPerRep || 3.5,
            holdSeconds: base.hold || 40,
            easier: ex.easier || '',
            harder: ex.harder || ''
        };
        if (item.unit === 'hold' && !timedScheme) {
            item.reps = item.holdSeconds + ' s hold';
        }
        if (item.unit === 'mins') {
            item.sets = 1;
            item.minutes = 8;
            item.reps = '8 min';
        }
        void seedStr;
        return item;
    }

    function warmupFor(ctx, muscles, minutes, seedStr) {
        const wanted = [];
        const generic = ['jog-in-place', 'jumping-jack', 'arm-circles', 'leg-swings', 'cat-cow', 'wgs'];
        const map = {
            chest: ['scap-pushup-mob', 'chest-doorway', 'arm-circles'],
            shoulders: ['shoulder-dislocate', 'wall-slide', 'arm-circles', 'scap-pushup-mob'],
            triceps: ['arm-circles', 'scap-pushup-mob'],
            back: ['cat-cow', 't-rotation', 'wall-slide'],
            biceps: ['arm-circles', 'wall-slide'],
            core: ['cat-cow', 'bird-dog', 'glute-activation'],
            quads: ['leg-swings', 'squat-hold', 'ankle-rock'],
            glutes: ['glute-activation', 'hip-circles', 'ninety-ninety'],
            hamstrings: ['hamstring-scoop', 'leg-swings', 'wgs'],
            calves: ['ankle-rock', 'calf-stretch'],
            hips: ['hip-circles', 'ninety-ninety', 'wgs'],
            spine: ['cat-cow', 't-rotation'],
            heart: ['jog-in-place', 'jumping-jack', 'a-skip']
        };
        muscles.forEach(function (m) {
            (map[m] || []).forEach(function (id) { if (wanted.indexOf(id) === -1) wanted.push(id); });
        });
        generic.forEach(function (id) { if (wanted.indexOf(id) === -1) wanted.push(id); });

        const count = minutes <= 1 ? 2 : (minutes <= 2 ? 3 : (minutes <= 3 ? 3 : (minutes <= 5 ? 4 : 5)));
        const short = minutes <= 2;
        const rng = rngFrom(seedStr + '|warm');
        const shuffled = wanted.slice(0, Math.max(count + 3, 6)).map(function (id, i) {
            return { id: id, k: rng() + (i < count ? 0 : 0.35) };
        }).sort((a, b) => a.k - b.k).slice(0, count);

        const items = [];
        shuffled.forEach(function (s) {
            const ex = byId(s.id);
            if (!ex) return;
            items.push({
                id: ex.id, name: ex.name, cue: ex.cue, muscles: ex.muscles.slice(), equip: ex.equip,
                role: 'warmup', unit: 'hold', sets: 1, reps: short ? '20–30 s' : '30–45 s', rest: 0, rpe: '3–4',
                holdSeconds: short ? 25 : 40, secPerRep: 3, easier: '', harder: ''
            });
        });
        void ctx;
        return items;
    }

    function cooldownFor(muscles, seedStr, minutes) {
        const count = minutes <= 0 ? 0 : (minutes <= 1 ? 1 : (minutes <= 2 ? 2 : 3));
        if (!count) return [];
        const map = {
            chest: 'chest-doorway', shoulders: 'chest-doorway', triceps: 'chest-doorway',
            back: 'childs-pose', biceps: 'chest-doorway', core: 'childs-pose',
            quads: 'couch-stretch', glutes: 'glute-figure4', hamstrings: 'down-dog',
            calves: 'calf-stretch', hips: 'hip-flexor', spine: 'cat-cow', heart: 'down-dog'
        };
        const ids = [];
        muscles.forEach(function (m) { const id = map[m]; if (id && ids.indexOf(id) === -1) ids.push(id); });
        ['childs-pose', 'down-dog', 'glute-figure4'].forEach(function (id) { if (ids.indexOf(id) === -1) ids.push(id); });
        const rng = rngFrom(seedStr + '|cool');
        const chosen = ids.slice(0, 5).map((id, i) => ({ id: id, k: rng() + i * 0.05 }))
            .sort((a, b) => a.k - b.k).slice(0, count);
        return chosen.map(function (c) {
            const ex = byId(c.id);
            return {
                id: ex.id, name: ex.name, cue: ex.cue, muscles: ex.muscles.slice(), equip: ex.equip,
                role: 'cooldown', unit: 'hold', sets: 1, reps: '45–60 s', rest: 0, rpe: '2–3',
                holdSeconds: 50, secPerRep: 3, easier: '', harder: ''
            };
        });
    }

    function cardioBlock(tpl, ctx, phase, week, seedStr) {
        const list = D.cardioSessions[tpl.cardio.pick] || D.cardioSessions.mixed;
        const kit = ctx.cfg.kit;
        const level = ctx.cfg.level;
        let pool = list.filter(function (o) {
            const ex = byId(o.ex);
            if (!ex) return false;
            if (o.maxLevel && level > o.maxLevel) return false;
            if (ex.level > level) return false;
            return equipOK(ex, kit);
        });
        if (!pool.length) pool = list.filter(o => { const e = byId(o.ex); return e && equipOK(e, kit); });
        if (!pool.length) pool = [list[0]];

        const rng = rngFrom(seedStr + '|cardio');
        const choice = pool[Math.floor(rng() * pool.length) % pool.length];
        const ex = byId(choice.ex);

        let minutes = Math.round(ctx.cfg.mins * tpl.cardio.share * phase.cardioMult);
        if (tpl.cardio.pick === 'long') minutes = Math.round(minutes * 1.35);
        if (tpl.cardio.pick === 'recovery') minutes = Math.min(minutes, 35);
        minutes = Math.max(10, Math.min(165, minutes));

        const notes = [];
        if (tpl.cardio.pick === 'long') {
            notes.push('Long runs are deliberately longer than your other sessions — that is what makes them work. Short on time? Cut it to your usual length rather than skipping it.');
        }
        if (week === 0) notes.push('First week of the block — start conservatively.');

        return [{
            id: ex.id, name: ex.name, cue: ex.cue, muscles: ex.muscles.slice(), equip: ex.equip,
            role: 'cardio', unit: 'mins', sets: 1, minutes: minutes,
            reps: minutes + ' min', rest: 0, rpe: ex.zone === 'hard' ? '8–9' : '4–5',
            detail: choice.detail, secPerRep: 3, holdSeconds: 0,
            easier: ex.easier || '', harder: ex.harder || '',
            note: notes.join(' ')
        }];
    }

    function buildSession(tplId, ctx, week, weekday, swaps) {
        const tpl = D.templates[tplId];
        if (!tpl) return null;
        const goal = ctx.goal;
        const phase = phaseFor(goal, week);
        const block = Math.floor(week / D.phases.length);
        const mins = tpl.cap ? Math.min(ctx.cfg.mins, tpl.cap) : ctx.cfg.mins;
        const b = budgets(mins);
        const baseSeed = ctx.cfg.seed + '|' + tplId + '|' + weekday;
        const salt = k => (swaps && swaps[String(k)]) ? '|v' + swaps[String(k)] : '';

        const main = [];
        const used = [];
        const focusList = ctx.cfg.focus || [];
        const budgetSec = b.main * 60;
        const keepFirst = mins <= 5 ? 1 : (mins <= 15 ? 2 : 3);

        if (tpl.cardio) {
            const items = cardioBlock(tpl, ctx, phase, week, baseSeed + '|w' + week + salt(98));
            items.forEach(i => { i.slot = 98; main.push(i); used.push(i.id); });
        }

        for (let i = 0; i < tpl.slots.length; i++) {
            const slot = tpl.slots[i];
            /* Big lifts stay put for a whole 4-week block so you can actually add
               weight to them; everything else rotates weekly for variety. */
            const stable = slot.role === 'compound' || slot.role === 'skill';
            const seedStr = baseSeed + '|s' + i + '|' + (stable ? 'b' + block : 'w' + week) + salt(i);
            const ex = choose(slot.want, ctx, used, seedStr, slot.role !== 'compound', slot.role);
            if (!ex) continue;
            const item = makeItem(ex, slot.role, goal, phase, seedStr);
            item.slot = i;
            if (tpl.circuit) {
                item.sets = phase.id === 'deload' ? 2 : (phase.id === 'peak' ? 4 : 3);
                item.reps = item.unit === 'mins' ? '40 s' : '40 s work / 20 s rest';
                item.unit = 'hold';
                item.holdSeconds = 40;
                item.rest = 20;
                item.rpe = '8';
            }
            main.push(item);
            used.push(ex.id);
        }

        /* A quarter of an hour cannot carry three-minute rests. Trade some rest
           and a set for having more than one exercise in the session. */
        let expressNote = '';
        if (mins <= 15 && !tpl.cardio && !tpl.circuit && !tpl.micro) {
            const maxSets = mins <= 5 ? 2 : 3;
            const maxRest = mins <= 5 ? 30 : (mins <= 10 ? 45 : 75);
            main.forEach(function (it) {
                if (it.unit === 'mins') return;
                it.sets = Math.min(it.sets, maxSets);
                it.rest = Math.min(it.rest, maxRest);
            });
            expressNote = 'Express session: sets and rests are trimmed so it fits. Given more time, add a set and rest longer on the first two movements.';
        }

        /* Snacks live or die on rest length — keep them brisk. */
        if (mins <= 10 && tpl.micro && !tpl.circuit) {
            const cap = mins <= 5 ? 20 : 30;
            main.forEach(function (it) { if (it.unit !== 'mins') it.rest = Math.min(it.rest, cap); });
        }

        trimToBudget(main, budgetSec, focusList, keepFirst);
        used.length = 0;
        main.forEach(i => used.push(i.id));
        let spent = totalSeconds(main);

        /* Spare time and a stated focus? Buy one extra set of focus work. */
        if (focusList.length && !tpl.cardio && !tpl.circuit && !tpl.micro && spent + 210 < budgetSec) {
            const seedStr = baseSeed + '|bonus|w' + week + salt(99);
            const ex = choose({ muscles: focusList }, ctx, used, seedStr, true);
            if (ex) {
                const item = makeItem(ex, goal.schemes.isolation ? 'isolation' : 'accessory', goal, phase, seedStr);
                item.note = 'Bonus set for your chosen focus.';
                item.slot = 99;
                main.push(item);
                used.push(ex.id);
                spent += itemSeconds(item);
            }
        }

        const muscles = [];
        main.forEach(i => i.muscles.forEach(m => { if (muscles.indexOf(m) === -1) muscles.push(m); }));

        const warm = warmupFor(ctx, muscles, b.warm, baseSeed + '|w' + week);
        const cool = cooldownFor(muscles, baseSeed + '|w' + week, b.cool);

        const blocks = [
            { id: 'warmup', name: 'Warm-up', minutes: b.warm, note: 'Raise the heart rate, open the joints you are about to use.', items: warm },
            {
                id: 'main', name: tpl.circuit ? 'Circuit' : 'Main session', minutes: Math.round(spent / 60),
                note: expressNote || (tpl.circuit
                    ? 'Move straight from one exercise to the next. Rest 90 seconds between rounds.'
                    : (tpl.cardio ? '' : 'Rest fully between sets — the rest is part of the prescription.')),
                items: main
            },
            { id: 'cooldown', name: 'Cool-down', minutes: b.cool, note: 'Easy breathing, long holds. Two minutes here saves a stiff tomorrow.', items: cool }
        ];

        return {
            type: 'session',
            templateId: tplId,
            title: tpl.name,
            focus: tpl.focus,
            tag: tpl.tag,
            phase: phase.id,
            phaseName: phase.name,
            phaseNote: phase.note,
            blocks: blocks,
            muscles: muscles,
            estimate: b.warm + Math.round(spent / 60) + b.cool
        };
    }

    function restDay(kind, ctx, week, weekday) {
        const rng = rngFrom(ctx.cfg.seed + '|rest|' + week + '|' + weekday);
        const tip = D.tips[Math.floor(rng() * D.tips.length) % D.tips.length];
        if (kind === 'walk') {
            return {
                type: 'walk', title: 'Walk & recover', tag: 'Active recovery',
                focus: 'Easy movement — 20 to 45 minutes on your feet',
                estimate: 30, tip: tip, blocks: [], muscles: ['heart']
            };
        }
        if (kind === 'active') {
            return {
                type: 'active', title: 'Active recovery', tag: 'Optional',
                focus: 'A walk, an easy bike, a stretch — anything gentle',
                estimate: 25, tip: tip, blocks: [], muscles: []
            };
        }
        return {
            type: 'rest', title: 'Rest day', tag: 'Rest',
            focus: 'Full rest. This is when the work you already did turns into results.',
            estimate: 0, tip: tip, blocks: []
        };
    }

    /* -------------------------------------------------------------- the plan */

    /* Every session template this goal can produce, plus the short "movement
       snack" templates, which any plan may drop onto a rest day. */
    function sessionOptionsFor(goalId) {
        const goal = goalById(goalId);
        const seen = [];
        const out = [];
        function add(id, own) {
            if (!id || seen.indexOf(id) !== -1) return;
            const tpl = D.templates[id];
            if (!tpl) return;
            seen.push(id);
            out.push({
                id: id, name: tpl.name, focus: tpl.focus, tag: tpl.tag,
                micro: !!tpl.micro, own: own
            });
        }
        Object.keys(goal.splits).forEach(function (k) {
            goal.splits[k].forEach(function (slot) {
                if (slot === 'rest' || slot === 'active' || slot === 'walk') return;
                add(slot, true);
            });
        });
        TPL_IDS.forEach(function (id) { if (D.templates[id].micro) add(id, false); });
        return out;
    }

    function defaultTemplateFor(goal, weekday) {
        const pattern = goal.splits[Object.keys(goal.splits)[0]] || [];
        for (let i = 0; i < 7; i++) {
            const slot = pattern[(weekday + i) % 7];
            if (slot && slot !== 'rest' && slot !== 'active' && slot !== 'walk') return slot;
        }
        return null;
    }

    function buildPlan(rawCfg) {
        const cfg = validateConfig(rawCfg);
        const goal = goalById(cfg.goal);
        const ctx = { cfg: cfg, goal: goal };
        const pattern = goal.splits[cfg.perWeek] || goal.splits[Object.keys(goal.splits)[0]];
        const start = fromISO(cfg.start);
        const days = [];

        for (let i = 0; i < cfg.length; i++) {
            const date = addDays(start, i);
            const iso = toISO(date);
            const wd = isoWeekday(date);
            const week = Math.floor(i / 7);
            const phase = phaseFor(goal, week);
            const ov = cfg.overrides[iso] || null;

            let slot = pattern[wd];
            const planned = slot;
            if (ov && ov.mode === 'rest') {
                slot = 'rest';
            } else if (ov && ov.mode === 'train') {
                slot = ov.tpl || (slot === 'rest' || slot === 'active' || slot === 'walk'
                    ? defaultTemplateFor(goal, wd) : slot);
            }

            let day;
            if (!slot || slot === 'rest' || slot === 'active' || slot === 'walk') {
                day = restDay(slot || 'rest', ctx, week, wd);
            } else {
                day = buildSession(slot, ctx, week, wd, ov && ov.swaps) || restDay('rest', ctx, week, wd);
            }

            day.index = i;
            day.date = iso;
            day.weekday = WEEKDAYS[wd];
            day.weekdayShort = WEEKDAYS_SHORT[wd];
            day.week = week;
            day.weekLabel = 'Week ' + (week + 1);
            day.phase = phase.id;
            day.phaseName = phase.name;
            day.phaseNote = phase.note;
            day.planned = planned;
            day.edited = !!ov;
            days.push(day);
        }

        return {
            v: 1,
            config: cfg,
            goal: { id: goal.id, name: goal.name, glyph: goal.glyph, blurb: goal.blurb, emphasis: goal.emphasis, why: goal.why },
            days: days,
            createdAt: new Date().toISOString()
        };
    }

    /* ------------------------------------------------------------- analysis */

    function summarise(plan) {
        const weeks = [];
        plan.days.forEach(function (d) {
            const w = weeks[d.week] || (weeks[d.week] = {
                index: d.week, label: 'Week ' + (d.week + 1), phase: d.phaseName, phaseNote: d.phaseNote,
                sessions: 0, rest: 0, minutes: 0, cardioMinutes: 0, sets: {}, days: []
            });
            w.days.push(d);
            if (d.type === 'session') {
                w.sessions++;
                w.minutes += d.estimate || 0;
                (d.blocks || []).forEach(function (b) {
                    if (b.id !== 'main') return;
                    b.items.forEach(function (it) {
                        if (it.unit === 'mins') { w.cardioMinutes += it.minutes || 0; return; }
                        if (it.role === 'warmup' || it.role === 'cooldown' || it.role === 'mobility') return;
                        it.muscles.forEach(function (m) {
                            if (m === 'heart' || m === 'spine' || m === 'hips') return;
                            w.sets[m] = (w.sets[m] || 0) + it.sets;
                        });
                    });
                });
            } else {
                w.rest++;
                w.minutes += d.estimate || 0;
            }
        });
        const total = { sessions: 0, minutes: 0, rest: 0 };
        weeks.forEach(function (w) { total.sessions += w.sessions; total.minutes += w.minutes; total.rest += w.rest; });
        return { weeks: weeks, total: total };
    }

    function dayIndexFor(plan, date) {
        return dayDiff(fromISO(plan.config.start), date || new Date());
    }

    /* --------------------------------------------------------------- export */

    function itemLine(it) {
        if (it.unit === 'mins') {
            return '- ' + it.name + ' — ' + it.minutes + ' min' + (it.detail ? ' (' + it.detail + ')' : '');
        }
        return '- ' + it.name + ' — ' + it.sets + ' × ' + it.reps +
            (it.rest ? ' · rest ' + it.rest + ' s' : '') + (it.rpe ? ' · RPE ' + it.rpe : '');
    }

    function toText(plan) {
        const c = plan.config;
        const lines = [];
        lines.push('# ' + (c.name || 'Training plan') + ' — ' + plan.goal.name);
        lines.push('');
        lines.push('Goal: ' + plan.goal.name + ' · Level ' + c.level + ' · ' + c.perWeek +
            ' days/week · ' + c.mins + ' min/session · ' + c.length + ' days');
        lines.push('Starts: ' + c.start + ' · Equipment: ' + c.kit.join(', ') +
            (c.focus.length ? ' · Focus: ' + c.focus.join(', ') : ''));
        lines.push('');
        let week = -1;
        plan.days.forEach(function (d) {
            if (d.week !== week) {
                week = d.week;
                lines.push('');
                lines.push('## Week ' + (week + 1) + ' — ' + d.phaseName);
                lines.push('_' + d.phaseNote + '_');
            }
            lines.push('');
            lines.push('### Day ' + (d.index + 1) + ' · ' + d.weekday + ' ' + d.date + ' — ' + d.title);
            if (d.type !== 'session') {
                lines.push(d.focus);
                if (d.tip) lines.push('Tip: ' + d.tip);
                return;
            }
            lines.push(d.focus + ' · about ' + d.estimate + ' min');
            (d.blocks || []).forEach(function (b) {
                if (!b.items.length) return;
                lines.push('');
                lines.push('**' + b.name + '**');
                b.items.forEach(function (it) { lines.push(itemLine(it)); });
            });
        });
        lines.push('');
        lines.push('---');
        lines.push('Built with Personal Trainer Forge · https://rami.party/workshop/trainer-forge/');
        return lines.join('\n');
    }

    window.TF_ENGINE = {
        buildPlan: buildPlan,
        validateConfig: validateConfig,
        summarise: summarise,
        dayIndexFor: dayIndexFor,
        toText: toText,
        toISO: toISO,
        fromISO: fromISO,
        addDays: addDays,
        dayDiff: dayDiff,
        weekdays: WEEKDAYS,
        weekdaysShort: WEEKDAYS_SHORT,
        equipOK: equipOK,
        goalById: goalById,
        durationsFor: durationsFor,
        frequenciesFor: frequenciesFor,
        sessionOptionsFor: sessionOptionsFor
    };
})();
