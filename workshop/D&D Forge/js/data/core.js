/* =====================================================================
 * D&D Forge — Core tables (abilities, skills, point-buy, slots)
 * Exposes window.DND_CORE. Loaded before js/data.js (the assembler).
 * ===================================================================== */
window.DND_CORE = {
    abilities: ['str', 'dex', 'con', 'int', 'wis', 'cha'],
    abilityNames: { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' },

    alignments: [
        'Lawful Good', 'Neutral Good', 'Chaotic Good',
        'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
        'Lawful Evil', 'Neutral Evil', 'Chaotic Evil', 'Unaligned'
    ],

    skills: [
        { name: 'Acrobatics', ability: 'dex' },
        { name: 'Animal Handling', ability: 'wis' },
        { name: 'Arcana', ability: 'int' },
        { name: 'Athletics', ability: 'str' },
        { name: 'Deception', ability: 'cha' },
        { name: 'History', ability: 'int' },
        { name: 'Insight', ability: 'wis' },
        { name: 'Intimidation', ability: 'cha' },
        { name: 'Investigation', ability: 'int' },
        { name: 'Medicine', ability: 'wis' },
        { name: 'Nature', ability: 'int' },
        { name: 'Perception', ability: 'wis' },
        { name: 'Performance', ability: 'cha' },
        { name: 'Persuasion', ability: 'cha' },
        { name: 'Religion', ability: 'int' },
        { name: 'Sleight of Hand', ability: 'dex' },
        { name: 'Stealth', ability: 'dex' },
        { name: 'Survival', ability: 'wis' }
    ],

    pointBuyCost: { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 },
    standardArray: [15, 14, 13, 12, 10, 8],

    // Proficiency bonus by level (5e), index 1..20
    proficiencyByLevel: [0, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6],

    // Full-caster spell slots per class level (index by level 1..20)
    fullCasterSlots: {
        1: [2], 2: [3], 3: [4, 2], 4: [4, 3], 5: [4, 3, 2], 6: [4, 3, 3], 7: [4, 3, 3, 1], 8: [4, 3, 3, 2],
        9: [4, 3, 3, 3, 1], 10: [4, 3, 3, 3, 2], 11: [4, 3, 3, 3, 2, 1], 12: [4, 3, 3, 3, 2, 1],
        13: [4, 3, 3, 3, 2, 1, 1], 14: [4, 3, 3, 3, 2, 1, 1], 15: [4, 3, 3, 3, 2, 1, 1, 1], 16: [4, 3, 3, 3, 2, 1, 1, 1],
        17: [4, 3, 3, 3, 2, 1, 1, 1, 1], 18: [4, 3, 3, 3, 3, 1, 1, 1, 1], 19: [4, 3, 3, 3, 3, 2, 1, 1, 1], 20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
    }
};
