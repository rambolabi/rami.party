# 🐉 D&D Custom Character Creator — Project TODO

A themed, browser-based **Dungeons & Dragons character builder** that supports multiple
editions/books, full character design, and skills/weapons/magic — with all the most
requested community features.

> Status legend: `[ ]` todo · `[~]` in progress · `[x]` done

---

## 🔥 BUILD NOTES — v1 shipped (2026-07-24)

**D&D Forge v1 is live and fully playable.** Files:
- [`index.html`](index.html) — app shell (edition bar, tabs, live sheet, dice roller).
- [`css/styles.css`](css/styles.css) — full parchment/dark-leather theme + responsive + print CSS.
- [`js/data.js`](js/data.js) — SRD/OGL rules data (`window.DND` global).
- [`js/app.js`](js/app.js) — state, rendering, calculations, dice, save/load, random generator.

### What works now
- **Edition selector** (top bar): 5E 2024 *(default)*, 5E 2014, 3.5, 4E, AD&D 2E, AD&D 1E. Persists; shows book source; 5E editions run the **full** rules engine, older editions reuse SRD data with an on-screen "approximation" note.
- **9-step wizard**: Identity → Race → Class → Abilities → Background → Skills → Equipment → Spells → Review, with a **live character sheet** that updates in real time.
- **Ability scores**: Standard Array, Point Buy (27), Roll 4d6-drop-lowest, and Manual — plus edition-aware boosts (2014 racial ASIs vs 2024 background +2/+1).
- **Skills**: class picks (enforced count), auto background/race profs, Rogue/Bard **expertise**, Bard Jack-of-All-Trades, live modifiers.
- **Weapons & armor**: full SRD tables w/ search + filters, auto attack/damage using finesse/ranged/proficiency logic, AC incl. Unarmored Defense (Barbarian/Monk) & shields.
- **Magic**: spellcasting engine (save DC, attack, slots incl. Warlock pact & half-casters), searchable spellbook filtered by class/level, prepared/known list.
- **Most-requested features shipped**: autosave, named save/load (localStorage), JSON export/import, print sheet, floating **dice roller** (adv/dis, crit/fumble, log), **"Surprise me"** random character generator, light/dark theme toggle, live auto-calculation everywhere, responsive/mobile layout.

### Verified in-browser
Random gen produced a valid *Lv5 Stout Halfling Warlock* (CHA correctly boosted to 19, AC/HP computed); all 9 tabs render; dice, theme toggle, and edition switching confirmed working; no console errors.

### v1.1 — Backstory Weaver + requested features (inspired by `character-forge`)
- **🪶 Backstory Weaver**: rerollable narrative lines (Trait · Ideal · Bond · Flaw · Origin · Motivation · Defining Moment · Secret) each with a 🎲, plus **Roll all** and **Weave into backstory** which composes an editable prose paragraph (grammar-aware a/an). Personality surfaces on the live sheet.
- **Fantasy name generator** (🎲 beside the name field) + **portrait emoji picker** shown on the sheet.
- **Feats**: searchable picker of 27 popular feats (Tough actually raises HP); shown on the sheet.
- **Hit points**: choose *fixed average* or *roll each level* (with a Roll HP button).
- **Copy to clipboard** (formatted text sheet) and **Share link** (state encoded in URL hash, round-trip loads on open).
- Random generator now also rolls personality, portrait, a name, an eligible feat, and a woven backstory.
- Verified: name-gen, portrait, weaver (8/8 lines), weave→733-char backstory, HP roll toggle, feat→sheet, share-link round-trip — all pass, no console errors.

### v1.2 — Fate Seed + DM's Charter (table controls)
- **🔮 Fate Seed**: every random hero is spun from a seedable PRNG (mulberry32). The Fate Seed modal shows the current seed, lets you *cast* any seed number, and copies a `#seed=` link so anyone reproduces the **exact** same character (verified: seed 123456 → identical hero twice; different seeds diverge). The dice roller stays truly random.
- **🛡️ The DM's Charter**: a DM modal to set table rules and mint a `#charter=` link for players. Constraints enforced live in the builder:
  - Lock **edition**; **fixed** or **maximum level**; allowed **ability-score methods**; point-buy **budget** & **max single score**; **max weapons** & **max spells**; **barred races** and **barred classes**; a decree note.
  - Players opening a Charter link see a **"Bound by the DM's Charter"** banner and the builder disables/greys out anything off-limits (🔒). Optionally bundle a Fate Seed (`Charter + Fate Seed` link) to hand players a ready-rolled *legal* character.
  - Quick-level chips (1–20) make picking a level-1 character one tap; respects the charter's cap/fixed level.
- Verified on a fresh load: banner + edition lock (5 others disabled), fixed level 1, pointbuy-only, Tiefling & Wizard barred, weapon cap — all enforced; seeded rolls honour the charter; no console errors.

### Known approximations / next up (see phases below)
- Older editions (1E/2E/3.5/4E) use adapted 5E SRD data — not native rulesets (THAC0, 3.x skill points, 4E powers not modeled yet).
- Spell list is a curated ~50-spell SRD subset (not the full list); no full per-level class-feature trees; multiclassing, feats catalog, and shareable-link export are still TODO.

---

## 0. Project Setup & Foundations
- [x] Decide tech stack: vanilla **HTML + CSS + JS**, no build step, single-page app to match the workshop style.
- [ ] Create folder structure:
  - [ ] `index.html` — app shell
  - [ ] `css/` → `variables.css`, `base.css`, `theme.css`, `layout.css`, `components.css`, `responsive.css`
  - [ ] `js/` → `main.js`, `state.js`, `router.js`, `rules/` (per-edition rule modules), `ui/` (render components)
  - [ ] `data/` → JSON rules data per edition (races, classes, backgrounds, spells, equipment, feats)
  - [ ] `assets/` → fonts, icons, textures, parchment/background images, dice sounds
- [x] Set up `localStorage` schema + versioning for saved characters.
- [ ] Add favicon, `site.webmanifest`, meta/SEO tags, Open Graph preview.
- [ ] Licensing/attribution note: base game rules on the **SRD / Open Game License (OGL)** and
      **Creative Commons SRD 5.1** content to stay legal; cite books referenced.

---

## 1. Edition Selector (Top of Page)
- [x] Prominent **Edition picker** bar pinned at the top of the page.
- [ ] Support the major editions/books:
  - [ ] **AD&D 1st Edition** (1977–1979)
  - [ ] **AD&D 2nd Edition** (1989)
  - [ ] **D&D 3.0 / 3.5 Edition** (2000 / 2003)
  - [ ] **D&D 4th Edition** (2008)
  - [ ] **D&D 5th Edition (2014)** — Player's Handbook
  - [ ] **D&D 5E (2024) "One D&D"** — revised Player's Handbook (Default selected)
  - [ ] Optional: **Pathfinder 1e/2e** as "3.5-compatible" bonus (clearly marked as separate system).
- [x] Each edition loads its own rules module + data set (races, classes, ability rules differ).
- [ ] Show edition-specific book source tags on each option (PHB, DMG, Xanathar's, Tasha's, Volo's, Mordenkainen's, etc.).
- [ ] Warn + optionally migrate when switching edition mid-build (data may not map 1:1).
- [x] Persist selected edition in state + `localStorage`.

---

## 2. Theme & "D&D Vibe" (Visual Design)
- [ ] Parchment / aged-paper background texture with subtle grain.
- [ ] Fantasy typography: display font for headings (e.g., *Cinzel / MedievalSharp*), readable serif for body.
- [ ] Color palette: deep reds, golds, dark browns, emerald accents; dark "spellbook" mode.
- [ ] Decorative elements: dragon motifs, corner flourishes, wax-seal buttons, ornate dividers.
- [ ] Dice-rolling animations + optional sound effects (d20 crit sparkle on nat 20).
- [ ] Ability/skill cards styled like a physical character sheet.
- [x] Light/dark theme toggle (parchment ↔ dark leather).
- [x] Respect `prefers-reduced-motion` and keep it accessible.

---

## 3. Core Character Design
- [ ] **Character identity**: name, player name, alignment, age, gender, height/weight, appearance, backstory, portrait upload/avatar.
- [ ] **Ability Scores** with multiple generation methods:
  - [ ] Standard Array
  - [ ] Point Buy (with per-edition point pools + cost tables)
  - [ ] Roll (4d6 drop lowest, 3d6, etc.) with animated dice
  - [ ] Manual entry
- [ ] Apply **racial/species** ability modifiers (edition-aware; 2024 uses background ASIs).
- [ ] **Race / Species** selection with subraces, traits, speed, size, darkvision, languages.
- [ ] **Class** selection with subclass/archetype, hit dice, proficiencies, class features by level.
- [ ] **Multiclassing** support (with prerequisite validation).
- [ ] **Background** selection (traits, ideals, bonds, flaws, background feature, proficiencies).
- [x] **Level** selection (1–20) auto-computing features, proficiency bonus, ASIs.
- [x] **Feats** / Ability Score Improvements at appropriate levels (edition-aware).
- [x] Derived stats: HP, AC, initiative, proficiency bonus, passive Perception, carrying capacity, speed.
- [ ] Saving throws + proficiencies.

---

## 4. Skills
- [ ] Full skill list per edition (5e: 18 skills; 3.5: skill points system; 4e: trained skills).
- [x] Auto-mark proficiencies from class + background + race.
- [x] Expertise / double-proficiency handling (Rogue/Bard, etc.).
- [ ] Skill point allocation UI for point-based editions (3.x).
- [ ] Passive skill calculations (Passive Perception/Investigation/Insight).
- [ ] Tool proficiencies + languages.
- [ ] Skill check roller (roll + relevant modifier, advantage/disadvantage).

---

## 5. Weapons & Equipment
- [ ] Weapon catalog per edition (simple/martial, melee/ranged, properties, damage dice, damage type).
- [ ] Armor catalog (light/medium/heavy, shields, AC calc incl. Dex cap).
- [ ] Starting equipment: choose class/background packs **or** roll gold and buy.
- [x] Attack/damage calculator (proficiency + ability mod, versatile, two-handed, finesse, thrown).
- [ ] Inventory management: weight/encumbrance, currency (cp/sp/ep/gp/pp), containers.
- [ ] Attunement tracking + magic item support (rarity, bonuses).
- [ ] Ammunition tracking.
- [ ] Homebrew custom weapon/item creator.

---

## 6. Magic & Spellcasting
- [ ] Spellcasting detection by class/subclass (full/half/third casters, pact magic, ritual casting).
- [ ] Spell slots per class/level table (edition-aware) + Pact Magic for Warlocks.
- [ ] Spellbook browser: searchable/filterable by level, school, class, casting time, concentration, ritual.
- [ ] Known/prepared spells UI with limits validation (prepared casters vs known casters).
- [ ] Cantrips handling + scaling.
- [ ] Spell detail cards (range, components V/S/M, duration, description, higher-level effects).
- [x] Spell save DC + spell attack bonus calculation.
- [ ] Concentration + ritual flags.
- [ ] Homebrew custom spell creator.

---

## 7. Most-Requested / Popular Features
- [x] **Save / Load** characters (localStorage) + name multiple slots.
- [x] **Export**: printable character sheet (PDF/print CSS), JSON, and shareable link.
- [ ] **Import**: JSON (and ideally D&D Beyond-style JSON) round-trip.
- [x] **Auto-calculation** of all derived stats with live updates.
- [ ] **Validation & guidance**: warn on illegal choices, show prerequisites, "point remaining" counters.
- [ ] **Level-up wizard**: step through gaining a level (features, ASIs, spells, HP roll/average).
- [x] **Random / Quick character** generator ("Surprise me").
- [x] **Dice roller** widget (any dice, advantage/disadvantage, modifiers, history log).
- [ ] **Rest tracking** (short/long rest resource resets).
- [ ] **Undo/redo** and autosave.
- [ ] **Search everything** (spells, feats, items, rules) global search.
- [ ] **Tooltips / rules reference** on hover for every term (SRD text).
- [ ] **Multiple characters / party manager**.
- [ ] **Mobile-friendly** responsive sheet + offline (PWA/service worker).
- [ ] **Accessibility**: keyboard nav, ARIA, high-contrast mode, screen-reader labels.
- [ ] **Homebrew mode**: custom races/classes/backgrounds/spells/items.
- [ ] Optional multi-language (i18n) support.

---

## 8. Data Modeling (per edition)
- [ ] `races.json`, `classes.json`, `subclasses.json`, `backgrounds.json`
- [ ] `spells.json`, `feats.json`, `weapons.json`, `armor.json`, `equipment.json`
- [ ] `skills.json`, `languages.json`, `conditions.json`, `rules-tables.json` (proficiency, XP/level, point-buy costs)
- [ ] Normalize schema so the UI is edition-agnostic; edition modules adapt the data.
- [ ] Cite source book per entry.

---

## 9. Architecture & State
- [ ] Central character **state object** (single source of truth) + change events → re-render.
- [ ] Edition **rules engine** interface (`getAbilityRules`, `getProficiencyBonus`, `getSpellSlots`, `validate`, …).
- [ ] Step-based **wizard flow** with a free-form "sheet" edit view.
- [ ] Derived-stat computation layer (pure functions, unit-testable).

---

## 10. Polish, Testing & Launch
- [ ] Cross-browser + mobile/tablet testing.
- [ ] Verify all calculations against official rules for each edition (sample characters).
- [ ] Print/PDF layout QA.
- [ ] Performance pass (lazy-load big spell/data JSON).
- [ ] Accessibility audit (Lighthouse / axe).
- [ ] Add legal/attribution page (OGL/CC-SRD notice).
- [ ] Write README + usage help / onboarding tips.
- [ ] Final visual polish and "wow" details (crit animations, sounds).

---

## Stretch Goals
- [ ] Cloud sync / accounts.
- [ ] Encounter/combat tracker & HP manager during play.
- [ ] NPC/monster stat-block generator.
- [ ] Campaign notes + inventory sharing with a party.
- [ ] Integration/export to Roll20, Foundry VTT, or D&D Beyond.
- [ ] AI-assisted backstory/portrait generation.
