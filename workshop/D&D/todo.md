# 🐉 D&D Custom Character Creator — Project TODO

A themed, browser-based **Dungeons & Dragons character builder** that supports multiple
editions/books, full character design, and skills/weapons/magic — with all the most
requested community features.

> Status legend: `[ ]` todo · `[~]` in progress · `[x]` done

---

## 0. Project Setup & Foundations
- [ ] Decide tech stack: vanilla **HTML + CSS + JS**, no build step, single-page app to match the workshop style.
- [ ] Create folder structure:
  - [ ] `index.html` — app shell
  - [ ] `css/` → `variables.css`, `base.css`, `theme.css`, `layout.css`, `components.css`, `responsive.css`
  - [ ] `js/` → `main.js`, `state.js`, `router.js`, `rules/` (per-edition rule modules), `ui/` (render components)
  - [ ] `data/` → JSON rules data per edition (races, classes, backgrounds, spells, equipment, feats)
  - [ ] `assets/` → fonts, icons, textures, parchment/background images, dice sounds
- [ ] Set up `localStorage` schema + versioning for saved characters.
- [ ] Add favicon, `site.webmanifest`, meta/SEO tags, Open Graph preview.
- [ ] Licensing/attribution note: base game rules on the **SRD / Open Game License (OGL)** and
      **Creative Commons SRD 5.1** content to stay legal; cite books referenced.

---

## 1. Edition Selector (Top of Page)
- [ ] Prominent **Edition picker** bar pinned at the top of the page.
- [ ] Support the major editions/books:
  - [ ] **AD&D 1st Edition** (1977–1979)
  - [ ] **AD&D 2nd Edition** (1989)
  - [ ] **D&D 3.0 / 3.5 Edition** (2000 / 2003)
  - [ ] **D&D 4th Edition** (2008)
  - [ ] **D&D 5th Edition (2014)** — Player's Handbook
  - [ ] **D&D 5E (2024) "One D&D"** — revised Player's Handbook (Default selected)
  - [ ] Optional: **Pathfinder 1e/2e** as "3.5-compatible" bonus (clearly marked as separate system).
- [ ] Each edition loads its own rules module + data set (races, classes, ability rules differ).
- [ ] Show edition-specific book source tags on each option (PHB, DMG, Xanathar's, Tasha's, Volo's, Mordenkainen's, etc.).
- [ ] Warn + optionally migrate when switching edition mid-build (data may not map 1:1).
- [ ] Persist selected edition in state + `localStorage`.

---

## 2. Theme & "D&D Vibe" (Visual Design)
- [ ] Parchment / aged-paper background texture with subtle grain.
- [ ] Fantasy typography: display font for headings (e.g., *Cinzel / MedievalSharp*), readable serif for body.
- [ ] Color palette: deep reds, golds, dark browns, emerald accents; dark "spellbook" mode.
- [ ] Decorative elements: dragon motifs, corner flourishes, wax-seal buttons, ornate dividers.
- [ ] Dice-rolling animations + optional sound effects (d20 crit sparkle on nat 20).
- [ ] Ability/skill cards styled like a physical character sheet.
- [ ] Light/dark theme toggle (parchment ↔ dark leather).
- [ ] Respect `prefers-reduced-motion` and keep it accessible.

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
- [ ] **Level** selection (1–20) auto-computing features, proficiency bonus, ASIs.
- [ ] **Feats** / Ability Score Improvements at appropriate levels (edition-aware).
- [ ] Derived stats: HP, AC, initiative, proficiency bonus, passive Perception, carrying capacity, speed.
- [ ] Saving throws + proficiencies.

---

## 4. Skills
- [ ] Full skill list per edition (5e: 18 skills; 3.5: skill points system; 4e: trained skills).
- [ ] Auto-mark proficiencies from class + background + race.
- [ ] Expertise / double-proficiency handling (Rogue/Bard, etc.).
- [ ] Skill point allocation UI for point-based editions (3.x).
- [ ] Passive skill calculations (Passive Perception/Investigation/Insight).
- [ ] Tool proficiencies + languages.
- [ ] Skill check roller (roll + relevant modifier, advantage/disadvantage).

---

## 5. Weapons & Equipment
- [ ] Weapon catalog per edition (simple/martial, melee/ranged, properties, damage dice, damage type).
- [ ] Armor catalog (light/medium/heavy, shields, AC calc incl. Dex cap).
- [ ] Starting equipment: choose class/background packs **or** roll gold and buy.
- [ ] Attack/damage calculator (proficiency + ability mod, versatile, two-handed, finesse, thrown).
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
- [ ] Spell save DC + spell attack bonus calculation.
- [ ] Concentration + ritual flags.
- [ ] Homebrew custom spell creator.

---

## 7. Most-Requested / Popular Features
- [ ] **Save / Load** characters (localStorage) + name multiple slots.
- [ ] **Export**: printable character sheet (PDF/print CSS), JSON, and shareable link.
- [ ] **Import**: JSON (and ideally D&D Beyond-style JSON) round-trip.
- [ ] **Auto-calculation** of all derived stats with live updates.
- [ ] **Validation & guidance**: warn on illegal choices, show prerequisites, "point remaining" counters.
- [ ] **Level-up wizard**: step through gaining a level (features, ASIs, spells, HP roll/average).
- [ ] **Random / Quick character** generator ("Surprise me").
- [ ] **Dice roller** widget (any dice, advantage/disadvantage, modifiers, history log).
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
