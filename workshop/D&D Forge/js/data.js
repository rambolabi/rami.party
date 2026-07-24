/* =====================================================================
 * D&D Forge — Data assembler
 * Combines the per-subject data files into a single `window.DND` object
 * (the shape the app expects). Load ORDER matters — all js/data/*.js must
 * load BEFORE this file, which must load before js/app.js.
 *
 *   js/data/core.js        -> DND_CORE  (abilities, skills, slots, tables)
 *   js/data/editions.js    -> DND_EDITIONS
 *   js/data/races.js       -> DND_RACES
 *   js/data/classes.js     -> DND_CLASSES
 *   js/data/backgrounds.js -> DND_BACKGROUNDS
 *   js/data/weapons.js     -> DND_WEAPONS
 *   js/data/armor.js       -> DND_ARMOR
 *   js/data/spells.js      -> DND_SPELLS
 *   js/data/feats.js       -> DND_FEATS
 *   js/data/story.js       -> DND_STORY, DND_NAMES, DND_PORTRAITS
 *   js/data/gear.js        -> DND_GEAR, DND_STARTING_GOLD, DND_LANGUAGES
 *
 * Content is based on the SRD / OGL v1.0a & CC-BY-4.0 SRD 5.1. The full
 * rules engine targets D&D 5E (2014 & 2024); older editions reuse this data
 * with edition-aware handling and are flagged as approximations in-app.
 * ===================================================================== */
window.DND = (function () {
    'use strict';
    const core = window.DND_CORE || {};
    const need = (v, name) => { if (!v) console.error('[D&D Forge] Missing data module: ' + name + '. Check script load order.'); return v; };

    return {
        // core tables
        abilities: core.abilities,
        abilityNames: core.abilityNames,
        alignments: core.alignments,
        skills: core.skills,
        pointBuyCost: core.pointBuyCost,
        standardArray: core.standardArray,
        proficiencyByLevel: core.proficiencyByLevel,
        fullCasterSlots: core.fullCasterSlots,
        // per-subject collections
        editions: need(window.DND_EDITIONS, 'editions'),
        races: need(window.DND_RACES, 'races'),
        classes: need(window.DND_CLASSES, 'classes'),
        backgrounds: need(window.DND_BACKGROUNDS, 'backgrounds'),
        weapons: need(window.DND_WEAPONS, 'weapons'),
        armor: need(window.DND_ARMOR, 'armor'),
        spells: need(window.DND_SPELLS, 'spells'),
        feats: need(window.DND_FEATS, 'feats'),
        story: need(window.DND_STORY, 'story'),
        names: need(window.DND_NAMES, 'names'),
        portraits: need(window.DND_PORTRAITS, 'portraits'),
        gear: need(window.DND_GEAR, 'gear'),
        startingGold: need(window.DND_STARTING_GOLD, 'startingGold'),
        languages: need(window.DND_LANGUAGES, 'languages')
    };
})();
