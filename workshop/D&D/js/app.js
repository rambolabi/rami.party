/* =====================================================================
 * D&D Forge — Application logic
 * ===================================================================== */
(function () {
    'use strict';
    const D = window.DND;

    /* ---------- tiny helpers ---------- */
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const mod = (score) => Math.floor((score - 10) / 2);
    const signed = (n) => (n >= 0 ? '+' : '') + n;
    const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
    // Swappable RNG: defaults to Math.random; seeded (mulberry32) during Fate-Seed rolls.
    const RNG = { next: Math.random };
    function mulberry32(a) {
        return function () {
            a |= 0; a = a + 0x6D2B79F5 | 0;
            let t = Math.imul(a ^ a >>> 15, 1 | a);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }
    const rint = (n) => Math.floor(RNG.next() * n);
    const pick = (arr) => arr[rint(arr.length)];
    const esc = (s) => String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));

    const TABS = ['Identity', 'Race', 'Class', 'Abilities', 'Background', 'Skills', 'Equipment', 'Spells', 'Review'];
    const TAB_ICONS = ['📜', '🧝', '⚔️', '🎯', '🎭', '📚', '🛡️', '✨', '📖'];
    const EDITIONS_WITH_RACE_ASI = ['5e14', '35', '4e', '2e', '1e'];

    /* ---------- default state ---------- */
    function freshState() {
        return {
            edition: '5e24',
            tab: 0,
            identity: { name: '', player: '', alignment: 'True Neutral', age: '', gender: '', height: '', weight: '', appearance: '', backstory: '', portrait: '🧝' },
            personality: {},
            raceId: null, subraceId: null,
            classId: null, subclass: '', level: 1,
            backgroundId: null,
            abilityMethod: 'array',
            baseScores: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
            pool: [], assign: {},            // for array/roll methods
            boosts: {},                       // slotIndex -> ability (racial/2024 ability boosts)
            classSkills: [], raceSkills: [], expertise: [],
            weapons: [], armor: [], spells: [], feats: [],
            hpMode: 'average', hpRolls: [],
            seed: null,
            charter: {
                active: false, edition: '', levelMode: 'any', level: 20,
                methods: ['array', 'pointbuy', 'roll', 'manual'],
                maxAbilityTotal: 0, maxAbilityScore: 0, maxWeapons: 0, maxSpells: 0,
                bannedRaces: [], bannedClasses: [], note: ''
            }
        };
    }
    let state = freshState();

    /* ---------- persistence ---------- */
    const AUTOSAVE = 'dndforge:autosave';
    const SAVES = 'dndforge:saves';
    const THEME = 'dndforge:theme';
    function persist() { try { localStorage.setItem(AUTOSAVE, JSON.stringify(state)); } catch (e) {} }
    function loadAutosave() {
        try { const s = localStorage.getItem(AUTOSAVE); if (s) state = Object.assign(freshState(), JSON.parse(s)); } catch (e) {}
    }

    /* ---------- lookups ---------- */
    const getRace = () => D.races.find(r => r.id === state.raceId) || null;
    const getSubrace = () => { const r = getRace(); return r && r.subraces ? r.subraces.find(s => s.id === state.subraceId) : null; };
    const getClass = () => D.classes.find(c => c.id === state.classId) || null;
    const getBackground = () => D.backgrounds.find(b => b.id === state.backgroundId) || null;
    const edition = () => D.editions.find(e => e.id === state.edition);
    const usesRaceAsi = () => EDITIONS_WITH_RACE_ASI.indexOf(state.edition) >= 0;

    /* ---------- DM Charter constraints ---------- */
    const CH = () => state.charter || {};
    const charterOn = () => !!(state.charter && state.charter.active);
    const raceAllowed = (id) => !charterOn() || (CH().bannedRaces || []).indexOf(id) < 0;
    const classAllowed = (id) => !charterOn() || (CH().bannedClasses || []).indexOf(id) < 0;
    const methodAllowed = (m) => !charterOn() || !CH().methods || !CH().methods.length || CH().methods.indexOf(m) >= 0;
    const levelFixed = () => charterOn() && CH().levelMode === 'fixed';
    const effLevelMax = () => (charterOn() && CH().levelMode !== 'any') ? CH().level : 20;
    const pointBudget = () => (charterOn() && CH().maxAbilityTotal) ? CH().maxAbilityTotal : 27;
    const abilityScoreCap = (dflt) => (charterOn() && CH().maxAbilityScore) ? Math.min(dflt, CH().maxAbilityScore) : dflt;
    const maxWeaponsAllowed = () => (charterOn() && CH().maxWeapons) ? CH().maxWeapons : Infinity;
    const maxSpellsAllowed = () => (charterOn() && CH().maxSpells) ? CH().maxSpells : Infinity;

    function normalizeToCharter() {
        if (!charterOn()) return;
        const ch = state.charter;
        if (ch.edition) state.edition = ch.edition;
        if (ch.levelMode === 'fixed') state.level = ch.level;
        else if (ch.levelMode === 'max') state.level = Math.min(state.level, ch.level);
        if (ch.methods && ch.methods.length && ch.methods.indexOf(state.abilityMethod) < 0) setMethod(ch.methods[0]);
        if (ch.maxWeapons && state.weapons.length > ch.maxWeapons) state.weapons = state.weapons.slice(0, ch.maxWeapons);
        if (ch.maxSpells && state.spells.length > ch.maxSpells) state.spells = state.spells.slice(0, ch.maxSpells);
        if (ch.maxAbilityScore) D.abilities.forEach(a => { if (state.baseScores[a] > ch.maxAbilityScore) state.baseScores[a] = ch.maxAbilityScore; });
        if ((ch.bannedRaces || []).indexOf(state.raceId) >= 0) { state.raceId = null; state.subraceId = null; }
        if ((ch.bannedClasses || []).indexOf(state.classId) >= 0) { state.classId = null; }
    }

    /* ---------- ability boost plan (racial ASI / 2024 boosts) ---------- */
    function fixedAsi() {
        if (!usesRaceAsi()) return {};       // 2024: boosts come from background/choice instead
        const race = getRace(), sub = getSubrace();
        const out = {};
        if (race && race.asi) for (const k in race.asi) out[k] = (out[k] || 0) + race.asi[k];
        if (sub && sub.asi) for (const k in sub.asi) out[k] = (out[k] || 0) + sub.asi[k];
        return out;
    }
    // Choice slots the player assigns manually
    function boostSlots() {
        if (!usesRaceAsi()) {
            // 2024-style: +2 and +1 to two different abilities
            return [{ amount: 2, label: '+2 Boost' }, { amount: 1, label: '+1 Boost' }];
        }
        const race = getRace();
        const slots = [];
        if (race && race.asiChoice) {
            for (let i = 0; i < race.asiChoice.count; i++) slots.push({ amount: race.asiChoice.amount, label: '+' + race.asiChoice.amount + ' (racial)', exclude: race.asiChoice.exclude || [] });
        }
        return slots;
    }
    function boostsByAbility() {
        const out = {};
        const slots = boostSlots();
        Object.keys(state.boosts).forEach(i => {
            const ab = state.boosts[i];
            const slot = slots[i];
            if (ab && slot) out[ab] = (out[ab] || 0) + slot.amount;
        });
        return out;
    }
    function finalScore(ab) {
        return (state.baseScores[ab] || 8) + (fixedAsi()[ab] || 0) + (boostsByAbility()[ab] || 0);
    }
    const finalScores = () => { const o = {}; D.abilities.forEach(a => o[a] = finalScore(a)); return o; };

    /* ---------- derived stats ---------- */
    function profBonus() { return D.proficiencyByLevel[Math.max(1, Math.min(20, state.level))]; }
    function hpTotal() {
        const cls = getClass(); if (!cls) return null;
        const conMod = mod(finalScore('con'));
        const lvl = state.level;
        const sub = getSubrace();
        let hp;
        if (state.hpMode === 'rolled' && state.hpRolls.length) {
            hp = cls.hd + conMod; // level 1 is always max
            for (let i = 1; i < lvl; i++) hp += (state.hpRolls[i - 1] || Math.floor(cls.hd / 2) + 1) + conMod;
        } else {
            const avg = Math.floor(cls.hd / 2) + 1;
            hp = cls.hd + conMod + (lvl - 1) * (avg + conMod);
        }
        if (sub && sub.id === 'hill') hp += lvl; // Dwarven Toughness
        if (state.feats.indexOf('Tough') >= 0) hp += lvl * 2; // Tough feat
        return Math.max(1, hp);
    }
    function rollHp() {
        const cls = getClass(); if (!cls) return;
        state.hpRolls = [];
        for (let i = 1; i < state.level; i++) state.hpRolls.push(d(cls.hd));
    }
    function bestArmor() {
        let body = null;
        state.armor.forEach(n => { const a = D.armor.find(x => x.name === n); if (a && a.cat !== 'Shield') { if (!body || a.ac > body.ac) body = a; } });
        return body;
    }
    function hasShield() { return state.armor.some(n => { const a = D.armor.find(x => x.name === n); return a && a.cat === 'Shield'; }); }
    function acTotal() {
        const dex = mod(finalScore('dex'));
        const body = bestArmor();
        let ac;
        if (body) {
            ac = body.ac + (body.dexCap === null ? dex : Math.min(dex, body.dexCap));
        } else {
            const cls = getClass();
            if (cls && cls.id === 'barbarian') ac = 10 + dex + mod(finalScore('con'));
            else if (cls && cls.id === 'monk') ac = 10 + dex + mod(finalScore('wis'));
            else ac = 10 + dex;
        }
        if (hasShield()) ac += 2;
        return ac;
    }
    function spellcasting() {
        const cls = getClass();
        if (!cls || !cls.spellcasting) return null;
        const ab = cls.spellcasting.ability;
        const m = mod(finalScore(ab));
        return {
            ability: ab, abilityName: D.abilityNames[ab],
            saveDC: 8 + profBonus() + m,
            attack: profBonus() + m,
            type: cls.spellcasting.type, progression: cls.spellcasting.progression,
            slots: spellSlots(cls)
        };
    }
    function spellSlots(cls) {
        const lvl = state.level, p = cls.spellcasting.progression;
        if (p === 'full') return D.fullCasterSlots[lvl] || [];
        if (p === 'half') { const cl = Math.floor(lvl / 2); return cl >= 1 ? D.fullCasterSlots[cl] : []; }
        if (p === 'pact') { // Warlock approximation
            const slotLvl = Math.min(5, Math.ceil(Math.min(lvl, 9) / 2));
            const count = lvl >= 17 ? 4 : lvl >= 11 ? 3 : lvl >= 2 ? 2 : 1;
            const arr = []; for (let i = 1; i < slotLvl; i++) arr.push(0); arr[slotLvl - 1] = count;
            return arr;
        }
        return [];
    }
    // proficiency across skills
    function skillProfSet() {
        const set = {};
        (state.classSkills || []).forEach(s => set[s] = 'prof');
        const bg = getBackground(); if (bg) bg.skills.forEach(s => set[s] = 'prof');
        const race = getRace(); if (race && race.skills) race.skills.forEach(s => set[s] = 'prof');
        (state.raceSkills || []).forEach(s => set[s] = 'prof');
        (state.expertise || []).forEach(s => { if (set[s]) set[s] = 'expertise'; });
        return set;
    }
    function skillMod(skill) {
        const profs = skillProfSet();
        const abMod = mod(finalScore(skill.ability));
        const p = profBonus();
        let bonus = 0;
        if (profs[skill.name] === 'prof') bonus = p;
        else if (profs[skill.name] === 'expertise') bonus = p * 2;
        else { const cls = getClass(); if (cls && cls.id === 'bard' && state.level >= 2) bonus = Math.floor(p / 2); } // Jack of All Trades
        return abMod + bonus;
    }
    function passivePerception() {
        const per = D.skills.find(s => s.name === 'Perception');
        return 10 + skillMod(per);
    }

    /* =====================================================================
     * RENDERING
     * ===================================================================== */
    function renderAll() { normalizeToCharter(); renderEditionBar(); renderBanner(); renderTabs(); renderTab(); renderSheet(); persist(); }

    function renderBanner() {
        const b = $('#charterBanner');
        if (!charterOn()) { b.hidden = true; return; }
        const ch = state.charter;
        const chips = [];
        if (ch.edition) { const e = D.editions.find(x => x.id === ch.edition); chips.push('Edition: ' + (e ? e.name + ' ' + e.year : ch.edition)); }
        if (ch.levelMode === 'fixed') chips.push('Fixed level ' + ch.level);
        else if (ch.levelMode === 'max') chips.push('Max level ' + ch.level);
        if (ch.methods && ch.methods.length < 4) chips.push('Ability: ' + ch.methods.join('/'));
        if (ch.maxAbilityTotal) chips.push('Point budget ' + ch.maxAbilityTotal);
        if (ch.maxAbilityScore) chips.push('Max score ' + ch.maxAbilityScore);
        if (ch.maxWeapons) chips.push('Max weapons ' + ch.maxWeapons);
        if (ch.maxSpells) chips.push('Max spells ' + ch.maxSpells);
        if ((ch.bannedRaces || []).length) chips.push(ch.bannedRaces.length + ' race(s) barred');
        if ((ch.bannedClasses || []).length) chips.push(ch.bannedClasses.length + ' class(es) barred');
        b.hidden = false;
        b.innerHTML = `<span class="cb-title">🛡️ Bound by the DM’s Charter</span>
            <span class="cb-chips">${chips.map(c => `<span class="cb-chip">${esc(c)}</span>`).join('')}</span>
            ${ch.note ? `<span class="cb-chip" style="font-style:italic">“${esc(ch.note)}”</span>` : ''}
            <button class="cb-view" id="cbView">View / edit</button>`;
        $('#cbView').addEventListener('click', openCharterModal);
    }

    function renderEditionBar() {
        const bar = $('#editionBar');
        bar.innerHTML = '';
        D.editions.forEach(e => {
            const b = document.createElement('button');
            const locked = charterOn() && CH().edition && CH().edition !== e.id;
            b.className = 'edition-btn' + (e.id === state.edition ? ' active' : '');
            b.innerHTML = `${esc(e.name)}<small>${esc(e.year)} · ${esc(e.tag)}</small>`;
            b.title = locked ? 'Locked by the DM’s Charter' : e.book;
            if (locked) { b.disabled = true; b.style.opacity = '.4'; b.style.cursor = 'not-allowed'; }
            b.addEventListener('click', () => {
                if (locked) { toast('The DM’s Charter locks the edition.', true); return; }
                if (e.id === state.edition) return;
                state.edition = e.id; state.boosts = {};
                toast('Switched to ' + e.name + ' (' + e.year + ')');
                renderAll();
            });
            bar.appendChild(b);
        });
        const e = edition();
        $('#editionNote').textContent = e.full
            ? `${e.book} — full rules engine active.`
            : `${e.book} — builder uses SRD 5e content adapted to this edition; some rules are approximations.`;
    }

    function renderTabs() {
        const t = $('#tabs'); t.innerHTML = '';
        TABS.forEach((name, i) => {
            const b = document.createElement('button');
            b.className = 'tab' + (i === state.tab ? ' active' : '');
            b.innerHTML = `<span class="step-no">${i + 1}</span> ${TAB_ICONS[i]} ${name}`;
            b.addEventListener('click', () => { state.tab = i; renderAll(); });
            t.appendChild(b);
        });
        $('#prevBtn').disabled = state.tab === 0;
        $('#nextBtn').disabled = state.tab === TABS.length - 1;
    }

    function renderTab() {
        const c = $('#tabContent');
        const fns = [tabIdentity, tabRace, tabClass, tabAbilities, tabBackground, tabSkills, tabEquipment, tabSpells, tabReview];
        c.innerHTML = '';
        c.appendChild(fns[state.tab]());
    }

    function panel(title, lead) {
        const p = document.createElement('div'); p.className = 'panel';
        p.innerHTML = `<h2>${title}</h2>` + (lead ? `<p class="lead">${lead}</p>` : '');
        return p;
    }

    /* ---------- Tab: Identity ---------- */
    function tabIdentity() {
        const p = panel('📜 Identity & Backstory', 'Give your hero a name, a face, and a story worth telling.');
        const id = state.identity;
        const wrap = document.createElement('div');
        wrap.innerHTML = `
            <label class="fld">Portrait</label>
            <div class="portrait-row" id="portraitRow">${D.portraits.map(e => `<button type="button" class="portrait-opt${e === id.portrait ? ' selected' : ''}" data-emoji="${e}">${e}</button>`).join('')}</div>
            <div class="row2">
                <div>
                    <label class="fld">Character Name</label>
                    <div class="name-row">
                        <input type="text" data-id="name" value="${esc(id.name)}" placeholder="e.g. Thalia Brightwood">
                        <button type="button" class="btn btn-gold" id="genNameBtn" title="Generate a fantasy name">🎲</button>
                    </div>
                </div>
                <div><label class="fld">Player Name</label><input type="text" data-id="player" value="${esc(id.player)}"></div>
            </div>
            <div class="row3">
                <div><label class="fld">Alignment</label><select data-id="alignment">${D.alignments.map(a => `<option ${a === id.alignment ? 'selected' : ''}>${a}</option>`).join('')}</select></div>
                <div><label class="fld">Age</label><input type="text" data-id="age" value="${esc(id.age)}"></div>
                <div><label class="fld">Gender</label><input type="text" data-id="gender" value="${esc(id.gender)}"></div>
            </div>
            <div class="row2">
                <div><label class="fld">Height</label><input type="text" data-id="height" value="${esc(id.height)}"></div>
                <div><label class="fld">Weight</label><input type="text" data-id="weight" value="${esc(id.weight)}"></div>
            </div>
            <label class="fld">Appearance</label><textarea data-id="appearance" placeholder="Eyes, hair, distinguishing marks…">${esc(id.appearance)}</textarea>
        `;
        wrap.querySelectorAll('[data-id]').forEach(el => {
            el.addEventListener('input', () => { state.identity[el.dataset.id] = el.value; renderSheet(); persist(); });
        });
        wrap.querySelector('#portraitRow').addEventListener('click', e => {
            const b = e.target.closest('.portrait-opt'); if (!b) return;
            state.identity.portrait = b.dataset.emoji;
            wrap.querySelectorAll('.portrait-opt').forEach(o => o.classList.toggle('selected', o === b));
            renderSheet(); persist();
        });
        wrap.querySelector('#genNameBtn').addEventListener('click', () => {
            state.identity.name = generateName();
            wrap.querySelector('[data-id="name"]').value = state.identity.name;
            renderSheet(); persist();
        });
        p.appendChild(wrap);

        /* Backstory Weaver (inspired by character-forge) */
        p.appendChild(Object.assign(document.createElement('div'), { className: 'divider' }));
        const weaver = document.createElement('div');
        const keys = Object.keys(D.story);
        weaver.innerHTML = `
            <div class="weaver-head">
                <h3>🪶 Backstory Weaver</h3>
                <div class="weaver-actions">
                    <button type="button" class="btn btn-sm" id="rollAllStory">🎲 Roll all</button>
                    <button type="button" class="btn btn-sm btn-primary" id="weaveStory">🖋️ Weave into backstory</button>
                </div>
            </div>
            <p class="lead" style="margin:6px 0 12px">Reroll any line with its 🎲, or roll the whole tapestry at once — then weave it into a written backstory you can edit.</p>
            <div class="weaver-list" id="weaverList">
                ${keys.map(k => {
                    const part = D.story[k]; const val = state.personality[k];
                    return `<div class="weave-part"><div class="wp-icon">${part.icon}</div>
                        <div class="wp-body"><span class="wp-label">${part.label}</span><span class="wp-value" data-key="${k}">${val ? esc(val) : '<span class="empty">— roll for one —</span>'}</span></div>
                        <button type="button" class="wp-reroll" data-roll="${k}" title="Reroll ${part.label}">🎲</button></div>`;
                }).join('')}
            </div>`;
        weaver.querySelector('#weaverList').addEventListener('click', e => {
            const b = e.target.closest('.wp-reroll'); if (!b) return;
            rollStoryPart(b.dataset.roll);
            weaver.querySelector(`.wp-value[data-key="${b.dataset.roll}"]`).textContent = state.personality[b.dataset.roll];
            b.classList.remove('spin'); void b.offsetWidth; b.classList.add('spin');
            renderSheet(); persist();
        });
        weaver.querySelector('#rollAllStory').addEventListener('click', () => { keys.forEach(rollStoryPart); renderAll(); toast('🪶 A new tale takes shape!'); });
        weaver.querySelector('#weaveStory').addEventListener('click', () => {
            if (state.identity.backstory && !confirm('Replace the current backstory text with a freshly woven one?')) return;
            state.identity.backstory = weaveBackstory();
            renderTab(); renderSheet(); persist(); toast('🖋️ Backstory woven');
        });
        p.appendChild(weaver);

        const bsWrap = document.createElement('div');
        bsWrap.innerHTML = `<label class="fld">Backstory</label><textarea data-bs="1" style="min-height:150px" placeholder="Write your hero’s history, or weave one above…">${esc(id.backstory)}</textarea>`;
        bsWrap.querySelector('textarea').addEventListener('input', e => { state.identity.backstory = e.target.value; renderSheet(); persist(); });
        p.appendChild(bsWrap);
        return p;
    }
    function rollStoryPart(k) {
        const part = D.story[k]; if (!part) return;
        let v; do { v = pick(part.options); } while (part.options.length > 1 && v === state.personality[k]);
        state.personality[k] = v;
    }
    function generateName() {
        const n = D.names;
        let first = pick(n.a) + pick(n.b);
        if (RNG.next() < 0.35) first += pick(n.b);
        return first + ' ' + pick(n.sur);
    }
    function weaveBackstory() {
        const P = state.personality, id = state.identity;
        const race = getRace(), sr = getSubrace(), cls = getClass(), bg = getBackground();
        const name = id.name || 'This hero';
        const desc = [sr && sr.name, race && race.name, cls && cls.name].filter(Boolean).join(' ');
        const parts = [];
        parts.push(`${name}${desc ? `, ${aan(desc)} ${desc.toLowerCase()}${bg ? ` of ${bg.name.toLowerCase()} stock` : ''},` : ''} was ${P.origin || 'raised far from here'}.`);
        if (P.moment) parts.push(`Their life turned the day they ${P.moment}.`);
        if (P.motivation) parts.push(`Ever since, they have been driven ${P.motivation}.`);
        if (P.ideal) parts.push(`They hold to one ideal above all: ${P.ideal.replace(/\.$/, '')}.`);
        if (P.bond) parts.push(`One bond anchors them — ${lc(P.bond)}`);
        if (P.flaw) parts.push(`Yet they are far from perfect: ${lc(P.flaw)}`);
        if (P.trait) parts.push(`Those who travel with them soon learn: ${lc(P.trait)}`);
        if (P.secret) parts.push(`And there is a secret they guard closely — ${P.secret}.`);
        return parts.join(' ');
    }
    const lc = (s) => s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
    const aan = (s) => (s && 'aeiouAEIOU'.indexOf(s.charAt(0)) >= 0) ? 'an' : 'a';

    /* ---------- Tab: Race ---------- */
    const RACE_ICONS = { human: '🧑', elf: '🧝', dwarf: '🧔', halfling: '🧑‍🌾', dragonborn: '🐲', gnome: '🧙', 'half-elf': '🧝‍♂️', 'half-orc': '🧟', tiefling: '😈', aasimar: '😇', orc: '👹' };
    function tabRace() {
        const p = panel('🧝 Choose Your Race', usesRaceAsi() ? 'Your race grants ability bonuses and traits.' : 'In the 2024 rules, ability boosts come from your background — race grants traits & features.');
        const grid = document.createElement('div'); grid.className = 'option-grid';
        D.races.forEach(r => {
            const card = document.createElement('div');
            const allowed = raceAllowed(r.id);
            card.className = 'opt-card' + (r.id === state.raceId ? ' selected' : '') + (allowed ? '' : ' locked-out');
            const asiTxt = usesRaceAsi() && r.asi ? Object.keys(r.asi).map(k => `${cap(k)} +${r.asi[k]}`).join(', ') : `${r.size}`;
            card.innerHTML = `<span class="oc-icon">${RACE_ICONS[r.id] || '⚔️'}</span><div class="oc-title">${esc(r.name)}</div><div class="oc-sub">${allowed ? esc(asiTxt) : 'Barred by DM'}</div>`;
            card.addEventListener('click', () => {
                if (!allowed) { toast(r.name + ' is barred by the DM’s Charter.', true); return; }
                state.raceId = r.id; state.subraceId = null; state.raceSkills = []; state.boosts = {}; renderAll();
            });
            grid.appendChild(card);
        });
        p.appendChild(grid);

        const race = getRace();
        if (race) {
            if (race.subraces) {
                const sub = document.createElement('div');
                sub.innerHTML = `<div class="divider"></div><label class="fld">Subrace</label>`;
                const sg = document.createElement('div'); sg.className = 'option-grid';
                race.subraces.forEach(s => {
                    const card = document.createElement('div');
                    card.className = 'opt-card' + (s.id === state.subraceId ? ' selected' : '');
                    const asiTxt = usesRaceAsi() && s.asi ? Object.keys(s.asi).map(k => `${cap(k)} +${s.asi[k]}`).join(', ') : '';
                    card.innerHTML = `<div class="oc-title">${esc(s.name)}</div><div class="oc-sub">${esc(asiTxt)}</div>`;
                    card.addEventListener('click', () => { state.subraceId = s.id; renderAll(); });
                    sg.appendChild(card);
                });
                sub.appendChild(sg); p.appendChild(sub);
            }
            const det = document.createElement('div'); det.className = 'detail-box';
            const sr = getSubrace();
            const traits = [...(race.traits || []), ...(sr && sr.traits ? sr.traits : [])];
            det.innerHTML = `<h4>${esc(race.name)}${sr ? ' — ' + esc(sr.name) : ''}</h4>
                <div class="chips-inline" style="margin-bottom:10px">
                    <span class="ci">Speed ${(sr && sr.speed) || race.speed} ft</span>
                    <span class="ci">Size ${race.size}</span>
                    ${race.darkvision ? `<span class="ci">Darkvision ${(sr && sr.darkvision) || race.darkvision} ft</span>` : ''}
                    <span class="ci">Languages: ${(race.languages || []).join(', ')}</span>
                </div>
                <ul class="trait-list">${traits.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
            p.appendChild(det);
        }
        return p;
    }

    /* ---------- Tab: Class ---------- */
    const CLASS_ICONS = { barbarian: '🪓', bard: '🎻', cleric: '⛪', druid: '🍃', fighter: '⚔️', monk: '👊', paladin: '🛡️', ranger: '🏹', rogue: '🗡️', sorcerer: '🔮', warlock: '👁️', wizard: '📖', artificer: '⚙️' };
    function tabClass() {
        const p = panel('⚔️ Choose Your Class', 'Your class defines your abilities, hit points, and role.');
        const grid = document.createElement('div'); grid.className = 'option-grid';
        D.classes.forEach(c => {
            const card = document.createElement('div');
            const allowed = classAllowed(c.id);
            card.className = 'opt-card' + (c.id === state.classId ? ' selected' : '') + (allowed ? '' : ' locked-out');
            card.innerHTML = `<span class="oc-icon">${CLASS_ICONS[c.id]}</span><div class="oc-title">${esc(c.name)}</div><div class="oc-sub">${allowed ? 'd' + c.hd + ' · ' + c.primary.map(cap).join('/') : 'Barred by DM'}</div>`;
            card.addEventListener('click', () => {
                if (!allowed) { toast(c.name + ' is barred by the DM’s Charter.', true); return; }
                state.classId = c.id; state.subclass = ''; state.classSkills = []; state.expertise = []; renderAll();
            });
            grid.appendChild(card);
        });
        p.appendChild(grid);

        const cls = getClass();
        if (cls) {
            const lvlMax = effLevelMax();
            const fixed = levelFixed();
            const commonLevels = [1, 2, 3, 4, 5, 8, 10, 12, 15, 20].filter(l => l <= lvlMax);
            const wrap = document.createElement('div');
            wrap.innerHTML = `<div class="divider"></div>
                <label class="fld">Level ${fixed ? '(fixed by DM at ' + lvlMax + ')' : '(1–' + lvlMax + ')'}</label>
                <div class="quick-levels">${commonLevels.map(l => `<button type="button" class="quick-lvl${state.level === l ? ' active' : ''}" data-lvl="${l}" ${fixed ? 'disabled' : ''}>${l}</button>`).join('')}</div>
                <div class="row2" style="margin-top:6px">
                    <div><input type="number" min="1" max="${lvlMax}" value="${state.level}" id="lvlInput" ${fixed ? 'disabled' : ''}></div>
                    <div><label class="fld" style="margin-top:0">Subclass</label><select id="subclassSel"><option value="">— choose —</option>${cls.subclasses.map(s => `<option ${s === state.subclass ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></div>
                </div>`;
            p.appendChild(wrap);
            wrap.querySelectorAll('.quick-lvl').forEach(q => q.addEventListener('click', () => { if (fixed) return; state.level = parseInt(q.dataset.lvl); renderAll(); }));
            $('#lvlInput', wrap).addEventListener('input', e => { state.level = Math.max(1, Math.min(lvlMax, parseInt(e.target.value) || 1)); renderSheet(); persist(); });
            $('#lvlInput', wrap).addEventListener('change', () => renderAll());
            $('#subclassSel', wrap).addEventListener('change', e => { state.subclass = e.target.value; renderAll(); });

            // Hit points method
            const hp = document.createElement('div'); hp.style.marginTop = '4px';
            hp.innerHTML = `<label class="fld">Hit Points</label>
                <div class="method-row" style="margin-bottom:8px">
                    <span class="chip ${state.hpMode === 'average' ? 'active' : ''}" data-hp="average">Fixed average</span>
                    <span class="chip ${state.hpMode === 'rolled' ? 'active' : ''}" data-hp="rolled">Roll each level</span>
                    ${state.hpMode === 'rolled' ? `<button class="btn btn-gold btn-sm" id="rollHpBtn" style="margin-left:auto">🎲 Roll HP</button>` : ''}
                    <span class="points-left" style="margin-left:${state.hpMode === 'rolled' ? '10px' : 'auto'}">Total HP: <b>${hpTotal() ?? '—'}</b></span>
                </div>`;
            hp.querySelectorAll('[data-hp]').forEach(ch => ch.addEventListener('click', () => { state.hpMode = ch.dataset.hp; if (state.hpMode === 'rolled' && !state.hpRolls.length) rollHp(); renderAll(); }));
            const rb = $('#rollHpBtn', hp); if (rb) rb.addEventListener('click', () => { rollHp(); renderAll(); toast('🎲 Rolled hit points!'); });
            p.appendChild(hp);

            const det = document.createElement('div'); det.className = 'detail-box';
            det.innerHTML = `<h4>${esc(cls.name)}</h4>
                <div class="chips-inline" style="margin-bottom:10px">
                    <span class="ci">Hit Die d${cls.hd}</span>
                    <span class="ci">Saves: ${cls.saves.map(cap).join(', ')}</span>
                    <span class="ci">Armor: ${cls.armor.length ? cls.armor.join(', ') : 'None'}</span>
                    ${cls.spellcasting ? `<span class="ci">Spellcasting: ${cap(cls.spellcasting.ability)}</span>` : '<span class="ci">Non-caster</span>'}
                </div>
                <ul class="trait-list">${cls.features.filter(f => f.level <= state.level).map(f => `<li><b>Lv${f.level} ${esc(f.name)}</b>${f.desc ? ' — ' + esc(f.desc) : ''}</li>`).join('')}</ul>`;
            p.appendChild(det);
        }
        return p;
    }

    /* ---------- Tab: Abilities ---------- */
    function tabAbilities() {
        const p = panel('🎯 Ability Scores', 'Set your six ability scores, then apply boosts.');
        // method chips
        const methods = [['array', 'Standard Array'], ['pointbuy', 'Point Buy'], ['roll', 'Roll 4d6'], ['manual', 'Manual']];
        const mr = document.createElement('div'); mr.className = 'method-row';
        methods.forEach(([id, label]) => {
            const chip = document.createElement('span');
            const ok = methodAllowed(id);
            chip.className = 'chip' + (state.abilityMethod === id ? ' active' : '');
            chip.textContent = label;
            if (!ok) { chip.style.opacity = '.35'; chip.style.cursor = 'not-allowed'; chip.title = 'Not allowed by the DM’s Charter'; }
            chip.addEventListener('click', () => { if (!ok) { toast('The DM’s Charter restricts ability methods.', true); return; } setMethod(id); renderAll(); });
            mr.appendChild(chip);
        });
        if (state.abilityMethod === 'pointbuy') {
            const budget = pointBudget();
            const used = D.abilities.reduce((s, a) => s + (D.pointBuyCost[state.baseScores[a]] || 0), 0);
            const left = document.createElement('span'); left.className = 'points-left';
            left.innerHTML = `Points left: <b>${budget - used}</b> / ${budget}`;
            mr.appendChild(left);
        }
        if (state.abilityMethod === 'manual' && charterOn() && CH().maxAbilityTotal) {
            const tot = D.abilities.reduce((s, a) => s + (state.baseScores[a] || 0), 0);
            const left = document.createElement('span'); left.className = 'points-left';
            left.innerHTML = `Ability total: <b>${tot}</b> / ${CH().maxAbilityTotal}`;
            mr.appendChild(left);
        }
        if (state.abilityMethod === 'roll') {
            const btn = document.createElement('button'); btn.className = 'btn btn-gold'; btn.textContent = '🎲 Roll new set';
            btn.style.marginLeft = 'auto';
            btn.addEventListener('click', () => { rollPool(); renderAll(); toast('Rolled a fresh set of scores!'); });
            mr.appendChild(btn);
        }
        p.appendChild(mr);

        const grid = document.createElement('div'); grid.className = 'abilities-grid';
        D.abilities.forEach(ab => grid.appendChild(abilityCard(ab)));
        p.appendChild(grid);

        // boosts section
        const slots = boostSlots();
        if (slots.length) {
            const bx = document.createElement('div'); bx.className = 'detail-box';
            bx.innerHTML = `<h4>${usesRaceAsi() ? 'Racial Ability Boost' : 'Ability Boosts (2024 Background)'}</h4>`;
            slots.forEach((slot, i) => {
                const row = document.createElement('div'); row.style.margin = '8px 0';
                const excluded = slot.exclude || [];
                const options = D.abilities.filter(a => excluded.indexOf(a) < 0)
                    .map(a => `<option value="${a}" ${state.boosts[i] === a ? 'selected' : ''}>${D.abilityNames[a]}</option>`).join('');
                row.innerHTML = `<label class="fld" style="display:inline-block;margin-right:8px">${slot.label} →</label>
                    <select data-slot="${i}" style="width:auto;display:inline-block"><option value="">— none —</option>${options}</select>`;
                bx.appendChild(row);
            });
            bx.querySelectorAll('[data-slot]').forEach(sel => sel.addEventListener('change', () => {
                const i = sel.dataset.slot, val = sel.value;
                // prevent assigning same ability to two slots
                if (val) Object.keys(state.boosts).forEach(k => { if (k !== i && state.boosts[k] === val) delete state.boosts[k]; });
                if (val) state.boosts[i] = val; else delete state.boosts[i];
                renderAll();
            }));
            p.appendChild(bx);
        }

        // Feats section
        const featMax = [0, 4, 8, 12, 16, 19].filter(l => state.level >= l).length; // ASI/feat opportunities
        const fx = document.createElement('div'); fx.className = 'detail-box';
        fx.innerHTML = `<h4>⭐ Feats <span style="font-weight:400;font-size:.85em;color:var(--ink-dim)">— you’ve gained ${featMax} ASI/feat slot${featMax !== 1 ? 's' : ''} by level ${state.level}</span></h4>
            <div class="filter-row"><input type="search" class="search-grow" id="featSearch" placeholder="Search feats…"></div>
            <div class="feat-grid" id="featGrid"></div>`;
        p.appendChild(fx);
        const drawFeats = () => {
            const q = ($('#featSearch', fx).value || '').toLowerCase();
            const grid2 = $('#featGrid', fx); grid2.innerHTML = '';
            D.feats.filter(f => !q || f.name.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q)).forEach(f => {
                const on = state.feats.indexOf(f.name) >= 0;
                const card = document.createElement('label');
                card.className = 'feat-card' + (on ? ' selected' : '');
                card.innerHTML = `<input type="checkbox" ${on ? 'checked' : ''}><div><strong>${esc(f.name)}</strong><span>${esc(f.desc)}</span></div>`;
                card.querySelector('input').addEventListener('change', ev => {
                    if (ev.target.checked) { if (!on) state.feats.push(f.name); }
                    else state.feats = state.feats.filter(x => x !== f.name);
                    renderSheet(); persist(); card.classList.toggle('selected', ev.target.checked);
                });
                grid2.appendChild(card);
            });
        };
        $('#featSearch', fx).addEventListener('input', drawFeats);
        drawFeats();
        return p;
    }
    function abilityCard(ab) {
        const card = document.createElement('div'); card.className = 'ability-card';
        const total = finalScore(ab);
        const bonus = (fixedAsi()[ab] || 0) + (boostsByAbility()[ab] || 0);
        let controls = '';
        const method = state.abilityMethod;
        card.innerHTML = `<div class="ab-name">${D.abilityNames[ab]}</div>`;
        if (method === 'pointbuy') {
            const v = state.baseScores[ab];
            const scoreCap = abilityScoreCap(15);
            card.innerHTML += `<div class="ab-score">${total}</div><div class="ab-mod">${signed(mod(total))}</div>
                <div class="ab-total">base ${v}${bonus ? ' +' + bonus : ''}</div>
                <div class="ab-controls"><button data-dec ${v <= 8 ? 'disabled' : ''}>−</button><span style="align-self:center;min-width:20px">${v}</span><button data-inc ${v >= scoreCap ? 'disabled' : ''}>+</button></div>`;
            card.querySelector('[data-dec]').addEventListener('click', () => { if (state.baseScores[ab] > 8) { state.baseScores[ab]--; renderAll(); } });
            card.querySelector('[data-inc]').addEventListener('click', () => {
                const budget = pointBudget();
                const used = D.abilities.reduce((s, a) => s + (D.pointBuyCost[state.baseScores[a]] || 0), 0);
                const next = state.baseScores[ab] + 1;
                const cost = (D.pointBuyCost[next] || 99) - (D.pointBuyCost[state.baseScores[ab]] || 0);
                if (next <= scoreCap && used + cost <= budget) { state.baseScores[ab] = next; renderAll(); } else toast('Not enough points.', true);
            });
        } else if (method === 'manual') {
            const scoreCap = abilityScoreCap(30);
            card.innerHTML += `<div class="ab-score">${total}</div><div class="ab-mod">${signed(mod(total))}</div><div class="ab-total">${bonus ? 'base +' + bonus : ''}</div>
                <div class="ab-controls"><input type="number" class="ab-input" min="1" max="${scoreCap}" value="${state.baseScores[ab]}"></div>`;
            card.querySelector('input').addEventListener('input', e => {
                let val = Math.max(1, Math.min(scoreCap, parseInt(e.target.value) || 1));
                if (charterOn() && CH().maxAbilityTotal) {
                    const others = D.abilities.reduce((s, a) => s + (a === ab ? 0 : state.baseScores[a]), 0);
                    if (others + val > CH().maxAbilityTotal) { val = Math.max(1, CH().maxAbilityTotal - others); e.target.value = val; toast('Ability total is capped at ' + CH().maxAbilityTotal + '.', true); }
                }
                state.baseScores[ab] = val; renderSheet(); persist();
            });
            card.querySelector('input').addEventListener('change', () => renderAll());
        } else { // array / roll: assign from pool
            const usedIdx = Object.keys(state.assign).filter(a => a !== ab).map(a => state.assign[a]);
            const opts = state.pool.map((v, i) => `<option value="${i}" ${state.assign[ab] === i ? 'selected' : ''} ${usedIdx.indexOf(i) >= 0 ? 'disabled' : ''}>${v}</option>`).join('');
            card.innerHTML += `<div class="ab-score">${state.assign[ab] != null ? total : '—'}</div>
                <div class="ab-mod">${state.assign[ab] != null ? signed(mod(total)) : ''}</div>
                <div class="ab-total">${bonus ? '+' + bonus + ' bonus' : ''}</div>
                <div class="ab-controls"><select style="width:auto"><option value="">—</option>${opts}</select></div>`;
            card.querySelector('select').addEventListener('change', e => {
                const val = e.target.value;
                if (val === '') delete state.assign[ab];
                else state.assign[ab] = parseInt(val);
                syncAssign(); renderAll();
            });
        }
        return card;
    }
    function setMethod(m) {
        state.abilityMethod = m;
        if (m === 'array') { state.pool = D.standardArray.slice(); state.assign = {}; }
        else if (m === 'roll') { if (!state.pool.length) rollPool(); state.assign = {}; }
        else if (m === 'pointbuy') { D.abilities.forEach(a => state.baseScores[a] = 8); }
        else if (m === 'manual') { /* keep */ }
        syncAssign();
    }
    function rollPool() { state.pool = []; for (let i = 0; i < 6; i++) { const r = [d(6), d(6), d(6), d(6)].sort((a, b) => a - b); state.pool.push(r[1] + r[2] + r[3]); } state.assign = {}; syncAssign(); }
    function syncAssign() {
        if (state.abilityMethod === 'array' || state.abilityMethod === 'roll') {
            D.abilities.forEach(a => { state.baseScores[a] = (state.assign[a] != null) ? state.pool[state.assign[a]] : 8; });
        }
    }

    /* ---------- Tab: Background ---------- */
    function tabBackground() {
        const p = panel('🎭 Background', 'Your background grants skills, tools, and a special feature.');
        const grid = document.createElement('div'); grid.className = 'option-grid';
        D.backgrounds.forEach(b => {
            const card = document.createElement('div');
            card.className = 'opt-card' + (b.id === state.backgroundId ? ' selected' : '');
            card.innerHTML = `<div class="oc-title">${esc(b.name)}</div><div class="oc-sub">${b.skills.join(', ')}</div>`;
            card.addEventListener('click', () => { state.backgroundId = b.id; renderAll(); });
            grid.appendChild(card);
        });
        p.appendChild(grid);
        const bg = getBackground();
        if (bg) {
            const det = document.createElement('div'); det.className = 'detail-box';
            det.innerHTML = `<h4>${esc(bg.name)}</h4>
                <ul class="trait-list">
                    <li><b>Skill Proficiencies:</b> ${bg.skills.join(', ')}</li>
                    ${bg.tools && bg.tools.length ? `<li><b>Tools:</b> ${bg.tools.join(', ')}</li>` : ''}
                    ${bg.languages ? `<li><b>Languages:</b> ${bg.languages} of choice</li>` : ''}
                    <li><b>Feature:</b> ${esc(bg.feature)}</li>
                    ${!usesRaceAsi() && bg.feat ? `<li><b>Origin Feat (2024):</b> ${esc(bg.feat)}</li>` : ''}
                </ul>`;
            p.appendChild(det);
        }
        return p;
    }

    /* ---------- Tab: Skills ---------- */
    function tabSkills() {
        const cls = getClass();
        const p = panel('📚 Skills', cls ? `Choose <b>${cls.skillChoose}</b> class skills. Background & race skills are added automatically.` : 'Pick a class first to choose skills.');
        if (!cls) return p;

        const bgSet = {}; const bg = getBackground(); if (bg) bg.skills.forEach(s => bgSet[s] = 1);
        const race = getRace(); const raceFixed = {}; if (race && race.skills) race.skills.forEach(s => raceFixed[s] = 1);

        const counter = document.createElement('div'); counter.className = 'pick-counter';
        counter.innerHTML = `Class skills chosen: <b>${state.classSkills.length}</b> / ${cls.skillChoose}`;
        p.appendChild(counter);

        const list = document.createElement('div'); list.className = 'skill-list';
        const profs = skillProfSet();
        D.skills.forEach(skill => {
            const inClassList = cls.skillList.indexOf(skill.name) >= 0;
            const fromBg = bgSet[skill.name], fromRace = raceFixed[skill.name];
            const chosen = state.classSkills.indexOf(skill.name) >= 0;
            const locked = fromBg || fromRace;
            const isProf = !!profs[skill.name];
            const item = document.createElement('label');
            item.className = 'skill-item' + (isProf ? ' prof' : '') + (profs[skill.name] === 'expertise' ? ' expertise' : '') + (locked ? ' locked' : '');
            const disabled = locked || (!inClassList) || (!chosen && state.classSkills.length >= cls.skillChoose);
            item.innerHTML = `<span class="prof-dot"></span>
                <input type="checkbox" ${chosen || locked ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
                <span>${esc(skill.name)} <span class="sk-ab">${skill.ability}</span></span>
                <span class="sk-mod">${signed(skillMod(skill))}</span>`;
            const cb = item.querySelector('input');
            if (!disabled) cb.addEventListener('change', () => {
                if (cb.checked) { if (state.classSkills.length < cls.skillChoose) state.classSkills.push(skill.name); }
                else state.classSkills = state.classSkills.filter(s => s !== skill.name);
                renderAll();
            });
            item.title = locked ? 'Granted by background/race' : (!inClassList ? 'Not available to this class' : '');
            list.appendChild(item);
        });
        p.appendChild(list);

        // Expertise (Rogue/Bard)
        if (cls.id === 'rogue' || cls.id === 'bard') {
            const maxExp = 2;
            const ex = document.createElement('div'); ex.className = 'detail-box';
            ex.innerHTML = `<h4>Expertise (double proficiency) — choose ${maxExp}</h4>`;
            const proficientSkills = Object.keys(profs).filter(s => profs[s]);
            const eg = document.createElement('div'); eg.className = 'skill-list';
            proficientSkills.forEach(sn => {
                const on = state.expertise.indexOf(sn) >= 0;
                const dis = !on && state.expertise.length >= maxExp;
                const it = document.createElement('label'); it.className = 'skill-item' + (on ? ' expertise' : '');
                it.innerHTML = `<span class="prof-dot"></span><input type="checkbox" ${on ? 'checked' : ''} ${dis ? 'disabled' : ''}><span>${esc(sn)}</span>`;
                const cb = it.querySelector('input');
                if (!dis) cb.addEventListener('change', () => {
                    if (cb.checked) state.expertise.push(sn); else state.expertise = state.expertise.filter(s => s !== sn);
                    renderAll();
                });
                eg.appendChild(it);
            });
            ex.appendChild(eg); p.appendChild(ex);
        }
        return p;
    }

    /* ---------- Tab: Equipment ---------- */
    function tabEquipment() {
        const p = panel('🛡️ Weapons & Armor', 'Build your loadout. Attack bonuses use your proficiency and ability modifiers.');

        // chosen loadout
        const chosen = document.createElement('div');
        chosen.innerHTML = `<h4 style="color:var(--red);margin-bottom:6px">Your Loadout</h4>`;
        const cl = document.createElement('div'); cl.className = 'chosen-list';
        if (!state.weapons.length && !state.armor.length) cl.innerHTML = `<div class="empty">Nothing equipped yet — add from the tables below.</div>`;
        state.weapons.forEach(n => {
            const w = D.weapons.find(x => x.name === n); if (!w) return;
            const atk = attackBonus(w), dmg = damageString(w);
            const row = document.createElement('div'); row.className = 'chosen';
            row.innerHTML = `<span class="cx-name">⚔️ ${esc(w.name)}</span><span class="cx-meta">${atk} to hit · ${dmg} ${w.dtype}</span><button class="cx-remove" title="Remove">✕</button>`;
            row.querySelector('.cx-remove').addEventListener('click', () => { state.weapons = state.weapons.filter(x => x !== n); renderAll(); });
            cl.appendChild(row);
        });
        state.armor.forEach(n => {
            const a = D.armor.find(x => x.name === n); if (!a) return;
            const row = document.createElement('div'); row.className = 'chosen';
            row.innerHTML = `<span class="cx-name">🛡️ ${esc(a.name)}</span><span class="cx-meta">${a.cat === 'Shield' ? '+2 AC' : 'AC ' + a.ac}</span><button class="cx-remove">✕</button>`;
            row.querySelector('.cx-remove').addEventListener('click', () => { state.armor = state.armor.filter(x => x !== n); renderAll(); });
            cl.appendChild(row);
        });
        chosen.appendChild(cl); p.appendChild(chosen);
        p.appendChild(Object.assign(document.createElement('div'), { className: 'divider' }));

        // weapon table with filter
        const wSearch = { q: '', cat: '' };
        const wFilter = document.createElement('div'); wFilter.className = 'filter-row';
        wFilter.innerHTML = `<input type="search" class="search-grow" placeholder="Search weapons…" id="wq">
            <select id="wcat"><option value="">All categories</option><option>Simple</option><option>Martial</option></select>`;
        p.appendChild(wFilter);
        const wTableWrap = document.createElement('div'); wTableWrap.className = 'table-wrap';
        p.appendChild(wTableWrap);
        function drawWeapons() {
            const q = $('#wq', wFilter).value.toLowerCase(), cat = $('#wcat', wFilter).value;
            const rows = D.weapons.filter(w => (!cat || w.cat === cat) && (!q || w.name.toLowerCase().includes(q)));
            const atCap = state.weapons.length >= maxWeaponsAllowed();
            wTableWrap.innerHTML = `<table class="data"><thead><tr><th>Weapon</th><th>Cat</th><th>Damage</th><th>Properties</th><th></th></tr></thead>
                <tbody>${rows.map(w => { const has = state.weapons.indexOf(w.name) >= 0; return `<tr><td>${esc(w.name)}</td><td>${w.cat}</td><td>${w.damage} ${w.dtype}</td><td>${(w.props || []).join(', ') || '—'}</td>
                <td><button class="btn add-btn" data-add="${esc(w.name)}" ${has || (atCap && !has) ? 'disabled' : ''}>${has ? '✓' : (atCap ? '🔒' : '+ Add')}</button></td></tr>`; }).join('')}</tbody></table>`;
            wTableWrap.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', () => {
                if (state.weapons.length >= maxWeaponsAllowed()) { toast('The DM’s Charter allows at most ' + CH().maxWeapons + ' weapon(s).', true); return; }
                state.weapons.push(b.dataset.add); renderAll();
            }));
        }
        $('#wq', wFilter).addEventListener('input', drawWeapons);
        $('#wcat', wFilter).addEventListener('change', drawWeapons);
        drawWeapons();

        // armor table
        const aTitle = document.createElement('h4'); aTitle.style.cssText = 'color:var(--red);margin:18px 0 8px'; aTitle.textContent = 'Armor';
        p.appendChild(aTitle);
        const aWrap = document.createElement('div'); aWrap.className = 'table-wrap';
        aWrap.innerHTML = `<table class="data"><thead><tr><th>Armor</th><th>Type</th><th>AC</th><th>Stealth</th><th></th></tr></thead>
            <tbody>${D.armor.map(a => `<tr><td>${esc(a.name)}</td><td>${a.cat}</td><td>${a.cat === 'Shield' ? '+2' : a.ac + (a.dexCap === null ? ' + Dex' : a.dexCap ? ' + Dex(max ' + a.dexCap + ')' : '')}</td><td>${a.stealth ? '⚠️ Disadv.' : '—'}</td>
            <td><button class="btn add-btn" data-add="${esc(a.name)}" ${state.armor.indexOf(a.name) >= 0 ? 'disabled' : ''}>${state.armor.indexOf(a.name) >= 0 ? '✓' : '+ Add'}</button></td></tr>`).join('')}</tbody></table>`;
        aWrap.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', () => { state.armor.push(b.dataset.add); renderAll(); }));
        p.appendChild(aWrap);
        return p;
    }
    function weaponAbility(w) {
        const finesse = (w.props || []).some(x => x.startsWith('Finesse'));
        if (w.type === 'ranged') return 'dex';
        if (finesse) return mod(finalScore('dex')) >= mod(finalScore('str')) ? 'dex' : 'str';
        return 'str';
    }
    function isProficientWithWeapon(w) {
        const cls = getClass(); if (!cls) return false;
        const list = cls.weapons || [];
        if (list.indexOf('Simple') >= 0 && w.cat === 'Simple') return true;
        if (list.indexOf('Martial') >= 0 && w.cat === 'Martial') return true;
        return list.indexOf(w.name) >= 0 || list.some(x => w.name.indexOf(x.replace(/s$/, '')) >= 0);
    }
    function attackBonus(w) {
        const ab = weaponAbility(w);
        return signed(mod(finalScore(ab)) + (isProficientWithWeapon(w) ? profBonus() : 0));
    }
    function damageString(w) {
        const ab = weaponAbility(w);
        return `${w.damage}${signed(mod(finalScore(ab)))}`;
    }

    /* ---------- Tab: Spells ---------- */
    function tabSpells() {
        const cls = getClass();
        const sc = spellcasting();
        const p = panel('✨ Spellcasting', sc ? `As a ${esc(cls.name)} you cast using <b>${sc.abilityName}</b>. Spell save DC <b>${sc.saveDC}</b>, attack <b>${signed(sc.attack)}</b>.` : 'Your class doesn’t cast spells — choose a spellcasting class to unlock this.');
        if (!cls) return p;
        if (!sc) {
            const d = document.createElement('div'); d.className = 'detail-box';
            d.innerHTML = `<h4>No spellcasting</h4><p>${esc(cls.name)}s rely on martial prowess. Some subclasses (e.g. Eldritch Knight, Arcane Trickster) gain limited spells at higher levels.</p>`;
            p.appendChild(d);
            return p;
        }

        // slots display
        const slots = sc.slots;
        const slotBox = document.createElement('div'); slotBox.className = 'detail-box';
        slotBox.innerHTML = `<h4>Spell Slots (Level ${state.level})</h4><div class="chips-inline">${slots.length ? slots.map((n, i) => n ? `<span class="ci">Lv${i + 1}: ${n} slot${n > 1 ? 's' : ''}</span>` : '').join('') : '<span class="ci">Cantrips only at this level</span>'}</div>`;
        p.appendChild(slotBox);

        // chosen spells
        const chosenWrap = document.createElement('div');
        chosenWrap.innerHTML = `<div class="divider"></div><h4 style="color:var(--red);margin-bottom:6px">Prepared / Known — ${state.spells.length} spell${state.spells.length !== 1 ? 's' : ''}</h4>`;
        const chosen = document.createElement('div'); chosen.className = 'chosen-list';
        if (!state.spells.length) chosen.innerHTML = `<div class="empty">No spells chosen yet.</div>`;
        state.spells.slice().sort((a, b) => spLevel(a) - spLevel(b)).forEach(n => {
            const s = D.spells.find(x => x.name === n); if (!s) return;
            const row = document.createElement('div'); row.className = 'chosen';
            row.innerHTML = `<span class="spell-level-badge">${s.level === 0 ? 'C' : s.level}</span><span class="cx-name">${esc(s.name)}</span><span class="cx-meta">${s.school}${s.concentration ? ' · Conc' : ''}${s.ritual ? ' · Ritual' : ''}</span><button class="cx-remove">✕</button>`;
            row.querySelector('.cx-remove').addEventListener('click', () => { state.spells = state.spells.filter(x => x !== n); renderAll(); });
            chosen.appendChild(row);
        });
        chosenWrap.appendChild(chosen); p.appendChild(chosenWrap);
        p.appendChild(Object.assign(document.createElement('div'), { className: 'divider' }));

        // browser with filters
        const filter = document.createElement('div'); filter.className = 'filter-row';
        filter.innerHTML = `<input type="search" class="search-grow" placeholder="Search spells…" id="sq">
            <select id="slvl"><option value="">All levels</option><option value="0">Cantrip</option>${[1,2,3,4,5].map(l => `<option value="${l}">Level ${l}</option>`).join('')}</select>
            <label class="chip" style="cursor:pointer"><input type="checkbox" id="classOnly" checked style="margin-right:5px">${esc(cls.name)} list only</label>`;
        p.appendChild(filter);
        const wrap = document.createElement('div'); wrap.className = 'table-wrap'; p.appendChild(wrap);
        function draw() {
            const q = $('#sq', filter).value.toLowerCase();
            const lvl = $('#slvl', filter).value;
            const classOnly = $('#classOnly', filter).checked;
            const rows = D.spells.filter(s =>
                (!classOnly || (s.classes || []).indexOf(cls.id) >= 0) &&
                (lvl === '' || s.level === parseInt(lvl)) &&
                (!q || s.name.toLowerCase().includes(q) || s.school.toLowerCase().includes(q))
            ).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
            wrap.innerHTML = `<table class="data"><thead><tr><th>Lv</th><th>Name</th><th>School</th><th>Time</th><th>Range</th><th></th></tr></thead>
                <tbody>${rows.map(s => { const has = state.spells.indexOf(s.name) >= 0; const atCap = state.spells.length >= maxSpellsAllowed(); return `<tr title="${esc(s.desc)}"><td class="spell-level-badge">${s.level === 0 ? 'C' : s.level}</td><td>${esc(s.name)}${s.concentration ? ' <span class="tag">C</span>' : ''}${s.ritual ? ' <span class="tag">R</span>' : ''}</td><td>${s.school}</td><td>${s.time}</td><td>${s.range}</td>
                <td><button class="btn add-btn" data-add="${esc(s.name)}" ${has || (atCap && !has) ? 'disabled' : ''}>${has ? '✓' : (atCap ? '🔒' : '+ Add')}</button></td></tr>`; }).join('') || '<tr><td colspan="6" class="empty">No spells match.</td></tr>'}</tbody></table>`;
            wrap.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', () => {
                if (state.spells.length >= maxSpellsAllowed()) { toast('The DM’s Charter allows at most ' + CH().maxSpells + ' spell(s).', true); return; }
                state.spells.push(b.dataset.add); renderAll();
            }));
        }
        $('#sq', filter).addEventListener('input', draw);
        $('#slvl', filter).addEventListener('change', draw);
        $('#classOnly', filter).addEventListener('change', draw);
        draw();
        return p;
    }
    const spLevel = (name) => { const s = D.spells.find(x => x.name === name); return s ? s.level : 0; };

    /* ---------- Tab: Review ---------- */
    function tabReview() {
        const p = panel('📖 Review & Finish', 'A summary of your hero. Save, export, or print from the buttons below.');
        const cls = getClass(), race = getRace(), bg = getBackground(), sr = getSubrace();
        const missing = [];
        if (!state.identity.name) missing.push('a name');
        if (!race) missing.push('a race');
        if (!cls) missing.push('a class');
        if (!bg) missing.push('a background');
        const box = document.createElement('div'); box.className = 'detail-box';
        box.innerHTML = missing.length
            ? `<h4>Almost there…</h4><p>Add ${missing.join(', ')} to complete your character.</p>`
            : `<h4>✅ ${esc(state.identity.name)} is ready for adventure!</h4><p>A level ${state.level} ${sr ? esc(sr.name) + ' ' : ''}${race ? esc(race.name) : ''} ${cls ? esc(cls.name) : ''}${state.subclass ? ' (' + esc(state.subclass) + ')' : ''}, ${esc(bg ? bg.name : '')}.</p>`;
        p.appendChild(box);

        const grid = document.createElement('div'); grid.className = 'skill-list'; grid.style.marginTop = '14px';
        const sc = spellcasting();
        const items = [
            ['Armor Class', acTotal()], ['Hit Points', hpTotal() ?? '—'], ['Initiative', signed(mod(finalScore('dex')))],
            ['Proficiency', signed(profBonus())], ['Passive Perception', passivePerception()], ['Speed', ((sr && sr.speed) || (race && race.speed) || 30) + ' ft']
        ];
        if (sc) { items.push(['Spell Save DC', sc.saveDC]); items.push(['Spell Attack', signed(sc.attack)]); }
        items.forEach(([k, v]) => {
            const it = document.createElement('div'); it.className = 'skill-item';
            it.innerHTML = `<span>${k}</span><span class="sk-mod">${v}</span>`;
            grid.appendChild(it);
        });
        p.appendChild(grid);
        return p;
    }

    /* =====================================================================
     * CHARACTER SHEET (right column)
     * ===================================================================== */
    function renderSheet() {
        const cls = getClass(), race = getRace(), bg = getBackground(), sr = getSubrace();
        const sc = spellcasting();
        const scores = finalScores();
        const subtitleParts = [];
        if (race) subtitleParts.push((sr ? sr.name + ' ' : '') + race.name);
        if (cls) subtitleParts.push('Lv ' + state.level + ' ' + cls.name);
        const sheet = $('#sheet');
        sheet.innerHTML = `
            <div class="sheet-head">
                <div class="sheet-portrait">${esc(state.identity.portrait || '🧝')}</div>
                <div class="ch-name">${esc(state.identity.name || 'Unnamed Hero')}</div>
                <div class="ch-sub">${esc(subtitleParts.join(' · ') || 'Begin your legend')}</div>
                <div class="ch-sub">${esc(state.identity.alignment)}${bg ? ' · ' + esc(bg.name) : ''}</div>
            </div>
            <div class="sheet-body">
                <div class="mini-stats">
                    <div class="mini-stat"><div class="ms-num">${acTotal()}</div><div class="ms-label">Armor</div></div>
                    <div class="mini-stat"><div class="ms-num">${hpTotal() ?? '—'}</div><div class="ms-label">Hit Pts</div></div>
                    <div class="mini-stat"><div class="ms-num">${signed(profBonus())}</div><div class="ms-label">Prof</div></div>
                </div>
                <div class="sheet-abilities">
                    ${D.abilities.map(a => `<div class="sa"><div class="sa-name">${a}</div><div class="sa-mod">${signed(mod(scores[a]))}</div><div class="sa-score">${scores[a]}</div></div>`).join('')}
                </div>
                <div class="mini-stats">
                    <div class="mini-stat"><div class="ms-num">${signed(mod(scores.dex))}</div><div class="ms-label">Init</div></div>
                    <div class="mini-stat"><div class="ms-num">${passivePerception()}</div><div class="ms-label">Pass. Per</div></div>
                    <div class="mini-stat"><div class="ms-num">${((sr && sr.speed) || (race && race.speed) || 30)}</div><div class="ms-label">Speed</div></div>
                </div>
                ${sc ? `<div><div class="sheet-section-title">Spellcasting</div>
                    <div class="sheet-line"><span>Save DC</span><span class="sl-val">${sc.saveDC}</span></div>
                    <div class="sheet-line"><span>Attack</span><span class="sl-val">${signed(sc.attack)}</span></div>
                    <div class="sheet-line"><span>Spells</span><span class="sl-val">${state.spells.length}</span></div></div>` : ''}
                <div><div class="sheet-section-title">Saving Throws</div>
                    <div class="chips-inline">${cls ? D.abilities.map(a => `<span class="ci">${cap(a)} ${signed(mod(scores[a]) + (cls.saves.indexOf(a) >= 0 ? profBonus() : 0))}${cls.saves.indexOf(a) >= 0 ? '●' : ''}</span>`).join('') : '<span class="empty">—</span>'}</div></div>
                <div><div class="sheet-section-title">Skill Proficiencies</div>
                    <div class="chips-inline">${(() => { const ps = skillProfSet(); const ks = Object.keys(ps); return ks.length ? ks.map(s => `<span class="ci">${esc(s)}${ps[s] === 'expertise' ? ' ◆◆' : ''}</span>`).join('') : '<span class="empty">None yet</span>'; })()}</div></div>
                <div><div class="sheet-section-title">Equipment</div>
                    <div class="chips-inline">${[...state.weapons, ...state.armor].length ? [...state.weapons, ...state.armor].map(n => `<span class="ci">${esc(n)}</span>`).join('') : '<span class="empty">None</span>'}</div></div>
                ${state.feats.length ? `<div><div class="sheet-section-title">Feats</div><div class="chips-inline">${state.feats.map(f => `<span class="ci">${esc(f)}</span>`).join('')}</div></div>` : ''}
                ${(() => { const P = state.personality; const rows = [['Trait', P.trait], ['Ideal', P.ideal], ['Bond', P.bond], ['Flaw', P.flaw]].filter(r => r[1]); return rows.length ? `<div><div class="sheet-section-title">Personality</div>${rows.map(r => `<div class="sheet-personality"><b>${r[0]}:</b> ${esc(r[1])}</div>`).join('')}</div>` : ''; })()}
            </div>`;
    }

    /* =====================================================================
     * DICE ROLLER
     * ===================================================================== */
    function d(sides) { return 1 + rint(sides); }
    let diceMode = 'normal';
    function setupDice() {
        const fab = $('#diceFab'), panelEl = $('#dicePanel'), result = $('#diceResult'), logEl = $('#diceLog');
        fab.addEventListener('click', () => panelEl.classList.toggle('open'));
        $$('.dice-adv .chip', panelEl).forEach(chip => chip.addEventListener('click', () => {
            $$('.dice-adv .chip', panelEl).forEach(c => c.classList.remove('active'));
            chip.classList.add('active'); diceMode = chip.dataset.mode;
        }));
        $$('.dice-btns button', panelEl).forEach(btn => btn.addEventListener('click', () => {
            let sides = parseInt(btn.dataset.die);
            if (sides === 0) { const c = prompt('How many sides?', '20'); sides = parseInt(c); if (!sides || sides < 2) return; }
            rollDice(sides, result, logEl);
        }));
    }
    function rollDice(sides, result, logEl) {
        let rolls = [d(sides)];
        let detail = `d${sides}: ${rolls[0]}`;
        if (sides === 20 && diceMode !== 'normal') {
            const second = d(20); rolls.push(second);
            const chosen = diceMode === 'adv' ? Math.max(rolls[0], second) : Math.min(rolls[0], second);
            detail = `d20 ${diceMode === 'adv' ? '(adv)' : '(dis)'}: [${rolls[0]}, ${second}] → ${chosen}`;
            rolls = [chosen];
        }
        const total = rolls[0];
        const crit = sides === 20 && total === 20, fumble = sides === 20 && total === 1;
        result.innerHTML = `<div class="dr-total ${crit ? 'crit' : ''}${fumble ? 'fumble' : ''}">${total}${crit ? ' ⭐' : ''}${fumble ? ' 💀' : ''}</div><div class="dr-detail">${detail}</div>`;
        const line = document.createElement('div'); line.textContent = `d${sides} → ${total}${crit ? ' (crit!)' : ''}${fumble ? ' (fumble)' : ''}`;
        logEl.prepend(line);
        while (logEl.children.length > 12) logEl.removeChild(logEl.lastChild);
    }

    /* =====================================================================
     * RANDOM CHARACTER
     * ===================================================================== */
    const FIRST_NAMES = ['Thalia', 'Kael', 'Mirabel', 'Dorn', 'Sylas', 'Vesper', 'Bram', 'Isolde', 'Garrick', 'Nyx', 'Rowan', 'Elara', 'Fenwick', 'Seraphine', 'Ozric', 'Lyra', 'Torvald', 'Wren', 'Aldric', 'Maeve'];
    const SURNAMES = ['Brightwood', 'Stormcrow', 'Ashford', 'Nightbreeze', 'Ironheart', 'Fairwind', 'Blackthorn', 'Silvervein', 'Ravensong', 'Emberfell', 'Duskwalker', 'Thornfield'];
    function randomCharacter(seed) {
        // Preserve any active DM Charter across the reroll.
        const keepCharter = (state.charter && state.charter.active) ? JSON.parse(JSON.stringify(state.charter)) : null;
        if (seed == null || isNaN(seed)) seed = Math.floor(Math.random() * 1e9);
        seed = seed >>> 0;
        RNG.next = mulberry32(seed);   // deterministic from here

        state = freshState();
        if (keepCharter) state.charter = keepCharter;
        state.edition = (keepCharter && keepCharter.edition) ? keepCharter.edition : '5e24';
        state.identity.name = generateName();
        state.identity.portrait = pick(D.portraits);
        state.identity.alignment = pick(D.alignments);
        Object.keys(D.story).forEach(rollStoryPart);

        const races = D.races.filter(r => raceAllowed(r.id));
        const race = pick(races.length ? races : D.races); state.raceId = race.id;
        if (race.subraces) state.subraceId = pick(race.subraces).id;
        const classes = D.classes.filter(c => classAllowed(c.id));
        const cls = pick(classes.length ? classes : D.classes); state.classId = cls.id; state.subclass = pick(cls.subclasses);
        if (levelFixed()) state.level = keepCharter.level;
        else { const maxL = effLevelMax(); state.level = Math.min(maxL, 1 + rint(Math.min(8, maxL))); }
        state.backgroundId = pick(D.backgrounds).id;

        // abilities: use an allowed method; roll numbers and assign best to primary
        const allowed = (keepCharter && keepCharter.active && keepCharter.methods.length) ? keepCharter.methods : ['array', 'pointbuy', 'roll', 'manual'];
        const useRoll = allowed.indexOf('roll') >= 0;
        state.abilityMethod = useRoll ? 'roll' : (allowed.indexOf('array') >= 0 ? 'array' : allowed[0]);
        if (useRoll) rollPool(); else { state.pool = D.standardArray.slice(); state.assign = {}; }
        const order = [...cls.primary, ...D.abilities.filter(a => cls.primary.indexOf(a) < 0)];
        const sortedIdx = state.pool.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).map(x => x[1]);
        order.forEach((ab, i) => { state.assign[ab] = sortedIdx[i]; state.baseScores[ab] = state.pool[sortedIdx[i]]; });
        // boosts
        if (!usesRaceAsi()) { state.boosts = { 0: cls.primary[0], 1: cls.primary[1] || pick(D.abilities.filter(a => a !== cls.primary[0])) }; }
        // skills
        const pool = cls.skillList.slice();
        for (let i = 0; i < cls.skillChoose && pool.length; i++) { const s = pool.splice(rint(pool.length), 1)[0]; state.classSkills.push(s); }
        if (cls.id === 'rogue' || cls.id === 'bard') state.expertise = state.classSkills.slice(0, 2);
        // equipment (respect weapon cap)
        const weap = D.weapons.filter(w => cls.weapons.indexOf('Martial') >= 0 ? w.cat === 'Martial' : w.cat === 'Simple');
        state.weapons = [pick(weap.length ? weap : D.weapons).name];
        if (state.weapons.length > maxWeaponsAllowed()) state.weapons = state.weapons.slice(0, maxWeaponsAllowed());
        const wearable = D.armor.filter(a => a.cat !== 'Shield' && cls.armor.indexOf(a.cat) >= 0);
        if (wearable.length) state.armor = [pick(wearable).name];
        if (cls.armor.indexOf('Shields') >= 0 && RNG.next() < 0.5) state.armor.push('Shield');
        // spells (respect spell cap)
        const sc = cls.spellcasting;
        if (sc) {
            const list = D.spells.filter(s => (s.classes || []).indexOf(cls.id) >= 0);
            const cantrips = list.filter(s => s.level === 0), lvl1 = list.filter(s => s.level === 1 || s.level === 2);
            for (let i = 0; i < 2 && cantrips.length; i++) { const s = cantrips.splice(rint(cantrips.length), 1)[0]; state.spells.push(s.name); }
            for (let i = 0; i < 3 && lvl1.length; i++) { const s = lvl1.splice(rint(lvl1.length), 1)[0]; state.spells.push(s.name); }
            if (state.spells.length > maxSpellsAllowed()) state.spells = state.spells.slice(0, maxSpellsAllowed());
        }
        // a feat if eligible, and a woven backstory
        if (state.level >= 4 && RNG.next() < 0.8) state.feats = [pick(D.feats).name];
        state.identity.backstory = weaveBackstory();

        RNG.next = Math.random;        // restore live randomness for the dice roller
        state.seed = seed;
        state.tab = TABS.length - 1;
        renderAll();
        toast('🔮 Fate Seed ' + seed + ' → ' + state.identity.name);
    }

    /* =====================================================================
     * SAVE / LOAD / EXPORT / IMPORT / PRINT
     * ===================================================================== */
    function getSaves() { try { return JSON.parse(localStorage.getItem(SAVES) || '{}'); } catch (e) { return {}; } }
    function saveCharacter() {
        const name = prompt('Save as:', state.identity.name || 'My Hero');
        if (!name) return;
        const saves = getSaves(); saves[name] = JSON.parse(JSON.stringify(state));
        try { localStorage.setItem(SAVES, JSON.stringify(saves)); toast('💾 Saved “' + name + '”'); } catch (e) { toast('Save failed (storage full).', true); }
    }
    function loadCharacter() {
        const saves = getSaves(); const names = Object.keys(saves);
        if (!names.length) { toast('No saved characters yet.', true); return; }
        const name = prompt('Load which character?\n\n' + names.map((n, i) => (i + 1) + '. ' + n).join('\n') + '\n\nType the name:', names[0]);
        if (!name || !saves[name]) { if (name) toast('No character named “' + name + '”.', true); return; }
        state = Object.assign(freshState(), saves[name]); renderAll(); toast('📂 Loaded “' + name + '”');
    }
    function exportCharacter() {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = (state.identity.name || 'character').replace(/[^a-z0-9]+/gi, '_') + '_dndforge.json';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast('⬇️ Exported JSON');
    }
    function importCharacter(file) {
        const reader = new FileReader();
        reader.onload = e => {
            try { state = Object.assign(freshState(), JSON.parse(e.target.result)); renderAll(); toast('⬆️ Character imported'); }
            catch (err) { toast('Invalid character file.', true); }
        };
        reader.readAsText(file);
    }
    function characterText() {
        const cls = getClass(), race = getRace(), sr = getSubrace(), bg = getBackground(), sc = spellcasting();
        const scores = finalScores(), P = state.personality;
        const L = [];
        L.push(`${state.identity.portrait || ''} ${state.identity.name || 'Unnamed Hero'}`.trim());
        L.push([sr && sr.name, race && race.name, cls && ('Level ' + state.level + ' ' + cls.name), state.subclass].filter(Boolean).join(' · '));
        L.push(`${state.identity.alignment}${bg ? ' · ' + bg.name : ''} · ${edition().name} (${edition().year})`);
        L.push('');
        L.push('ABILITIES: ' + D.abilities.map(a => `${cap(a)} ${scores[a]} (${signed(mod(scores[a]))})`).join('  '));
        L.push(`AC ${acTotal()} · HP ${hpTotal() ?? '—'} · Init ${signed(mod(scores.dex))} · Prof ${signed(profBonus())} · Passive Per ${passivePerception()}`);
        if (sc) L.push(`Spellcasting: ${sc.abilityName} · Save DC ${sc.saveDC} · Attack ${signed(sc.attack)}`);
        const profs = Object.keys(skillProfSet()); if (profs.length) L.push('Skills: ' + profs.join(', '));
        if (state.feats.length) L.push('Feats: ' + state.feats.join(', '));
        if (state.weapons.length || state.armor.length) L.push('Equipment: ' + [...state.weapons, ...state.armor].join(', '));
        if (state.spells.length) L.push('Spells: ' + state.spells.join(', '));
        const prows = [['Trait', P.trait], ['Ideal', P.ideal], ['Bond', P.bond], ['Flaw', P.flaw]].filter(r => r[1]);
        if (prows.length) { L.push(''); prows.forEach(r => L.push(`${r[0]}: ${r[1]}`)); }
        if (state.identity.backstory) { L.push(''); L.push('BACKSTORY:'); L.push(state.identity.backstory); }
        return L.join('\n');
    }
    async function copyCharacter() {
        const text = characterText();
        try { await navigator.clipboard.writeText(text); toast('📋 Character copied to clipboard'); }
        catch (e) {
            const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
            try { document.execCommand('copy'); toast('📋 Character copied'); } catch (e2) { toast('Copy failed.', true); }
            ta.remove();
        }
    }
    async function shareLink() {
        try {
            const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
            const url = location.origin + location.pathname + '#c=' + encoded;
            if (url.length > 8000) { toast('Character too large to share by link — use Export instead.', true); return; }
            try { await navigator.clipboard.writeText(url); toast('🔗 Share link copied to clipboard'); }
            catch (e) { location.hash = 'c=' + encoded; toast('🔗 Link is in the address bar'); }
            location.hash = 'c=' + encoded;
        } catch (e) { toast('Could not create share link.', true); }
    }
    function loadFromHash() {
        const h = location.hash;
        if (h.indexOf('#c=') === 0) {
            try { state = Object.assign(freshState(), JSON.parse(decodeURIComponent(escape(atob(h.slice(3)))))); return 'char'; }
            catch (e) { return false; }
        }
        if (h.indexOf('#charter=') === 0) {
            try {
                const payload = JSON.parse(decodeURIComponent(escape(atob(h.slice(9)))));
                state = freshState();
                state.charter = Object.assign(state.charter, payload.charter || payload);
                state.charter.active = true;
                if (payload.seed != null) { normalizeToCharter(); randomCharacter(payload.seed); return 'charter+seed'; }
                return 'charter';
            } catch (e) { return false; }
        }
        if (h.indexOf('#seed=') === 0) {
            const n = parseInt(h.slice(6));
            if (!isNaN(n)) { randomCharacter(n); return 'seed'; }
        }
        return false;
    }

    /* =====================================================================
     * MODAL + FATE SEED + DM CHARTER
     * ===================================================================== */
    function openModal(title, bodyHTML) {
        const overlay = $('#modalOverlay'), m = $('#modal');
        m.innerHTML = `<div class="modal-head"><h2>${title}</h2><button class="modal-close" aria-label="Close">✕</button></div><div class="modal-body">${bodyHTML}</div>`;
        overlay.hidden = false;
        m.querySelector('.modal-close').addEventListener('click', closeModal);
        return m;
    }
    function closeModal() { $('#modalOverlay').hidden = true; $('#modal').innerHTML = ''; }
    $('#modalOverlay') && document.addEventListener('click', e => { if (e.target === $('#modalOverlay')) closeModal(); });

    function openSeedModal() {
        const seed = state.seed != null ? state.seed : '—';
        const m = openModal('🔮 Fate Seed', `
            <p class="lead">Every random hero is spun from a single <b>Fate Seed</b>. Share the seed and anyone can conjure the exact same character — the dice of fate fall the same way twice.</p>
            <div class="modal-section-title">This character’s seed</div>
            <div class="seed-display" id="seedDisplay">${seed}</div>
            <div class="btn-row" style="margin-top:0">
                <button class="btn btn-primary" id="rerollSeed">🎲 Roll a new fate</button>
                <button class="btn btn-gold" id="copySeedLink">🔗 Copy Fate Seed link</button>
            </div>
            <div class="modal-section-title">Summon a specific fate</div>
            <label class="fld">Enter a Fate Seed number</label>
            <div class="share-out">
                <input type="number" id="seedInput" placeholder="e.g. 424242" value="${state.seed != null ? state.seed : ''}">
                <button class="btn" id="castSeed">Cast</button>
            </div>
            <p class="lead" style="margin-top:10px">${charterOn() ? '🛡️ Rolls will honour the active DM’s Charter.' : ''}</p>
        `);
        m.querySelector('#rerollSeed').addEventListener('click', () => { randomCharacter(); m.querySelector('#seedDisplay').textContent = state.seed; m.querySelector('#seedInput').value = state.seed; });
        m.querySelector('#castSeed').addEventListener('click', () => { const n = parseInt(m.querySelector('#seedInput').value); if (isNaN(n)) { toast('Enter a seed number.', true); return; } randomCharacter(n); m.querySelector('#seedDisplay').textContent = state.seed; });
        m.querySelector('#copySeedLink').addEventListener('click', () => {
            if (state.seed == null) { toast('Roll a character first.', true); return; }
            const url = location.origin + location.pathname + '#seed=' + state.seed;
            navigator.clipboard.writeText(url).then(() => toast('🔗 Fate Seed link copied'), () => { location.hash = 'seed=' + state.seed; toast('🔗 Link is in the address bar'); });
        });
    }

    function openCharterModal() {
        const ch = state.charter;
        const raceChecks = D.races.map(r => `<label class="ban-item"><input type="checkbox" data-ban-race="${r.id}" ${(ch.bannedRaces || []).indexOf(r.id) >= 0 ? 'checked' : ''}>${esc(r.name)}</label>`).join('');
        const classChecks = D.classes.map(c => `<label class="ban-item"><input type="checkbox" data-ban-class="${c.id}" ${(ch.bannedClasses || []).indexOf(c.id) >= 0 ? 'checked' : ''}>${esc(c.name)}</label>`).join('');
        const methodChecks = [['array', 'Standard Array'], ['pointbuy', 'Point Buy'], ['roll', 'Roll 4d6'], ['manual', 'Manual']]
            .map(([id, l]) => `<label class="ban-item"><input type="checkbox" data-method="${id}" ${(ch.methods || []).indexOf(id) >= 0 ? 'checked' : ''}>${l}</label>`).join('');
        const m = openModal('🛡️ The DM’s Charter', `
            <p class="lead">Set the rules of your table, then send players a <b>Charter link</b>. Their builder will be bound to your decree — locked edition, level caps, ability limits, weapon counts and barred races or classes.</p>

            <div class="modal-section-title">Edition & Level</div>
            <div class="row2">
                <div><label class="fld">Lock edition</label><select id="chEdition"><option value="">Any edition</option>${D.editions.map(e => `<option value="${e.id}" ${ch.edition === e.id ? 'selected' : ''}>${esc(e.name)} ${e.year}</option>`).join('')}</select></div>
                <div><label class="fld">Level rule</label><select id="chLevelMode"><option value="any" ${ch.levelMode === 'any' ? 'selected' : ''}>No limit</option><option value="max" ${ch.levelMode === 'max' ? 'selected' : ''}>Maximum level</option><option value="fixed" ${ch.levelMode === 'fixed' ? 'selected' : ''}>Fixed level</option></select></div>
            </div>
            <label class="fld">Level value (1–20)</label><input type="number" id="chLevel" min="1" max="20" value="${ch.level}">

            <div class="modal-section-title">Ability Scores</div>
            <label class="fld">Allowed generation methods</label>
            <div class="ban-grid">${methodChecks}</div>
            <div class="row2">
                <div><label class="fld">Point-buy budget (0 = default 27)</label><input type="number" id="chMaxTotal" min="0" value="${ch.maxAbilityTotal || 0}"></div>
                <div><label class="fld">Max single score (0 = none)</label><input type="number" id="chMaxScore" min="0" max="20" value="${ch.maxAbilityScore || 0}"></div>
            </div>

            <div class="modal-section-title">Limits</div>
            <div class="row2">
                <div><label class="fld">Max weapons (0 = none)</label><input type="number" id="chMaxWeapons" min="0" value="${ch.maxWeapons || 0}"></div>
                <div><label class="fld">Max spells (0 = none)</label><input type="number" id="chMaxSpells" min="0" value="${ch.maxSpells || 0}"></div>
            </div>

            <div class="modal-section-title">Barred Races</div>
            <div class="ban-grid">${raceChecks}</div>
            <div class="modal-section-title">Barred Classes</div>
            <div class="ban-grid">${classChecks}</div>

            <div class="modal-section-title">Decree note (optional)</div>
            <input type="text" id="chNote" maxlength="80" placeholder="e.g. Level-1 one-shot, no full casters" value="${esc(ch.note || '')}">

            <div class="btn-row">
                <button class="btn ${ch.active ? 'btn-gold' : 'btn-primary'}" id="chToggle">${ch.active ? '✔ Charter active (click to lift)' : '🛡️ Apply to my builder'}</button>
                <button class="btn btn-primary" id="chCopyLink">📜 Copy Charter link</button>
                <button class="btn" id="chCopySeedLink">🔮 Charter + Fate Seed link</button>
            </div>
            <p class="lead" style="margin-top:10px">Players who open a Charter link build within these limits. Add a Fate Seed to also hand them a ready-rolled (but still legal) character.</p>
        `);

        const collect = () => {
            ch.edition = $('#chEdition', m).value;
            ch.levelMode = $('#chLevelMode', m).value;
            ch.level = Math.max(1, Math.min(20, parseInt($('#chLevel', m).value) || 1));
            ch.methods = $$('[data-method]', m).filter(c => c.checked).map(c => c.dataset.method);
            if (!ch.methods.length) ch.methods = ['array', 'pointbuy', 'roll', 'manual'];
            ch.maxAbilityTotal = Math.max(0, parseInt($('#chMaxTotal', m).value) || 0);
            ch.maxAbilityScore = Math.max(0, parseInt($('#chMaxScore', m).value) || 0);
            ch.maxWeapons = Math.max(0, parseInt($('#chMaxWeapons', m).value) || 0);
            ch.maxSpells = Math.max(0, parseInt($('#chMaxSpells', m).value) || 0);
            ch.bannedRaces = $$('[data-ban-race]', m).filter(c => c.checked).map(c => c.dataset.banRace);
            ch.bannedClasses = $$('[data-ban-class]', m).filter(c => c.checked).map(c => c.dataset.banClass);
            ch.note = $('#chNote', m).value.trim();
        };
        const charterPayload = () => { collect(); const c = JSON.parse(JSON.stringify(ch)); c.active = true; return c; };
        m.querySelector('#chToggle').addEventListener('click', () => {
            collect(); ch.active = !ch.active; closeModal(); renderAll();
            toast(ch.active ? '🛡️ Charter applied to your builder' : 'Charter lifted');
        });
        m.querySelector('#chCopyLink').addEventListener('click', () => {
            const enc = btoa(unescape(encodeURIComponent(JSON.stringify({ charter: charterPayload() }))));
            const url = location.origin + location.pathname + '#charter=' + enc;
            navigator.clipboard.writeText(url).then(() => toast('📜 Charter link copied — send it to your players'), () => { location.hash = 'charter=' + enc; toast('📜 Link is in the address bar'); });
        });
        m.querySelector('#chCopySeedLink').addEventListener('click', () => {
            const seed = state.seed != null ? state.seed : Math.floor(Math.random() * 1e9);
            const enc = btoa(unescape(encodeURIComponent(JSON.stringify({ charter: charterPayload(), seed }))));
            const url = location.origin + location.pathname + '#charter=' + enc;
            navigator.clipboard.writeText(url).then(() => toast('🔮 Charter + Fate Seed link copied'), () => { location.hash = 'charter=' + enc; toast('🔮 Link is in the address bar'); });
        });
    }

    /* =====================================================================
     * THEME + TOAST
     * ===================================================================== */
    function applyTheme(t) {
        document.documentElement.setAttribute('data-theme', t);
        $('#themeBtn').textContent = t === 'dark' ? '☀️ Theme' : '🌙 Theme';
        try { localStorage.setItem(THEME, t); } catch (e) {}
    }
    function toast(msg, danger) {
        const el = document.createElement('div'); el.className = 'toast'; if (danger) el.style.borderColor = 'var(--red-bright)';
        el.textContent = msg; $('#toastWrap').appendChild(el); setTimeout(() => el.remove(), 3000);
    }

    /* =====================================================================
     * INIT
     * ===================================================================== */
    function init() {
        loadAutosave();
        const loaded = loadFromHash();
        if (loaded) {
            history.replaceState(null, '', location.pathname);
            if (loaded === 'charter' || loaded === 'charter+seed') toast('🛡️ You are bound by a DM’s Charter');
            else toast('🔗 Loaded shared character');
        }
        let theme = 'parchment';
        try { theme = localStorage.getItem(THEME) || 'parchment'; } catch (e) {}
        applyTheme(theme);
        if (!state.pool.length && state.abilityMethod === 'array') { state.pool = D.standardArray.slice(); }

        $('#themeBtn').addEventListener('click', () => applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'parchment' : 'dark'));
        $('#randomBtn').addEventListener('click', () => randomCharacter());
        $('#seedBtn').addEventListener('click', openSeedModal);
        $('#charterBtn').addEventListener('click', openCharterModal);
        $('#prevBtn').addEventListener('click', () => { if (state.tab > 0) { state.tab--; renderAll(); } });
        $('#nextBtn').addEventListener('click', () => { if (state.tab < TABS.length - 1) { state.tab++; renderAll(); } });
        $('#saveBtn').addEventListener('click', saveCharacter);
        $('#loadBtn').addEventListener('click', loadCharacter);
        $('#exportBtn').addEventListener('click', exportCharacter);
        $('#importBtn').addEventListener('click', () => $('#importFile').click());
        $('#importFile').addEventListener('change', e => { if (e.target.files[0]) importCharacter(e.target.files[0]); });
        $('#printBtn').addEventListener('click', () => window.print());
        const cb = $('#copyBtn'); if (cb) cb.addEventListener('click', copyCharacter);
        const sb = $('#shareBtn'); if (sb) sb.addEventListener('click', shareLink);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

        setupDice();
        renderAll();
    }
    document.addEventListener('DOMContentLoaded', init);
})();
