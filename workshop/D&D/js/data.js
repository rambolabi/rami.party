/* =====================================================================
 * D&D Forge — Rules Data
 * Loaded as a global `DND`. Content based on the SRD / OGL & CC-BY SRD 5.1.
 * Full rules are implemented for D&D 5E (2014 & 2024). Older editions reuse
 * this data with edition-aware ability generation & proficiency, and are
 * clearly flagged as approximations.
 * ===================================================================== */
window.DND = (function () {
    'use strict';

    const editions = [
        { id: '5e24', name: 'D&D 5E', year: '2024', tag: 'One D&D', book: 'Player’s Handbook (2024)', full: true, default: true },
        { id: '5e14', name: 'D&D 5E', year: '2014', tag: 'PHB', book: 'Player’s Handbook (2014)', full: true },
        { id: '35',   name: 'D&D 3.5', year: '2003', tag: 'd20', book: 'Player’s Handbook v3.5', full: false },
        { id: '4e',   name: 'D&D 4E', year: '2008', tag: '4E', book: 'Player’s Handbook (4E)', full: false },
        { id: '2e',   name: 'AD&D', year: '1989', tag: '2nd Ed', book: 'AD&D 2nd Edition', full: false },
        { id: '1e',   name: 'AD&D', year: '1977', tag: '1st Ed', book: 'AD&D 1st Edition', full: false }
    ];

    const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    const abilityNames = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' };

    const alignments = [
        'Lawful Good', 'Neutral Good', 'Chaotic Good',
        'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
        'Lawful Evil', 'Neutral Evil', 'Chaotic Evil', 'Unaligned'
    ];

    const skills = [
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
    ];

    const pointBuyCost = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
    const standardArray = [15, 14, 13, 12, 10, 8];

    // Proficiency bonus by level (5e)
    const proficiencyByLevel = [0, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6];

    /* ---- Races -------------------------------------------------------- */
    const races = [
        { id: 'human', name: 'Human', asi: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 }, speed: 30, size: 'Medium',
          languages: ['Common', '+1 of choice'], traits: ['Versatile: +1 to every ability score', 'Extra language'] },
        { id: 'elf', name: 'Elf', asi: { dex: 2 }, speed: 30, size: 'Medium', darkvision: 60,
          languages: ['Common', 'Elvish'], skills: ['Perception'],
          traits: ['Darkvision 60 ft', 'Fey Ancestry (adv. vs charm, no magic sleep)', 'Trance (4h rest)', 'Keen Senses (Perception)'],
          subraces: [
            { id: 'high', name: 'High Elf', asi: { int: 1 }, traits: ['Cantrip (Wizard)', 'Extra language'] },
            { id: 'wood', name: 'Wood Elf', asi: { wis: 1 }, speed: 35, traits: ['Fleet of Foot (35 ft)', 'Mask of the Wild'] },
            { id: 'drow', name: 'Drow (Dark Elf)', asi: { cha: 1 }, darkvision: 120, traits: ['Superior Darkvision 120 ft', 'Sunlight Sensitivity', 'Drow Magic'] }
          ] },
        { id: 'dwarf', name: 'Dwarf', asi: { con: 2 }, speed: 25, size: 'Medium', darkvision: 60,
          languages: ['Common', 'Dwarvish'],
          traits: ['Darkvision 60 ft', 'Dwarven Resilience (adv. vs poison)', 'Dwarven Combat Training', 'Stonecunning'],
          subraces: [
            { id: 'hill', name: 'Hill Dwarf', asi: { wis: 1 }, traits: ['Dwarven Toughness (+1 HP/level)'] },
            { id: 'mountain', name: 'Mountain Dwarf', asi: { str: 2 }, traits: ['Dwarven Armor Training (light & medium)'] }
          ] },
        { id: 'halfling', name: 'Halfling', asi: { dex: 2 }, speed: 25, size: 'Small',
          languages: ['Common', 'Halfling'],
          traits: ['Lucky (reroll nat 1s)', 'Brave (adv. vs frightened)', 'Halfling Nimbleness'],
          subraces: [
            { id: 'lightfoot', name: 'Lightfoot', asi: { cha: 1 }, traits: ['Naturally Stealthy'] },
            { id: 'stout', name: 'Stout', asi: { con: 1 }, traits: ['Stout Resilience (adv. vs poison)'] }
          ] },
        { id: 'dragonborn', name: 'Dragonborn', asi: { str: 2, cha: 1 }, speed: 30, size: 'Medium',
          languages: ['Common', 'Draconic'],
          traits: ['Draconic Ancestry', 'Breath Weapon', 'Damage Resistance (by ancestry)'] },
        { id: 'gnome', name: 'Gnome', asi: { int: 2 }, speed: 25, size: 'Small', darkvision: 60,
          languages: ['Common', 'Gnomish'],
          traits: ['Darkvision 60 ft', 'Gnome Cunning (adv. on INT/WIS/CHA saves vs magic)'],
          subraces: [
            { id: 'forest', name: 'Forest Gnome', asi: { dex: 1 }, traits: ['Natural Illusionist (Minor Illusion)', 'Speak with Small Beasts'] },
            { id: 'rock', name: 'Rock Gnome', asi: { con: 1 }, traits: ['Artificer’s Lore', 'Tinker'] }
          ] },
        { id: 'half-elf', name: 'Half-Elf', asi: { cha: 2 }, asiChoice: { count: 2, amount: 1, exclude: ['cha'] }, speed: 30, size: 'Medium', darkvision: 60,
          languages: ['Common', 'Elvish', '+1 of choice'], skillChoice: { count: 2 },
          traits: ['Darkvision 60 ft', 'Fey Ancestry', 'Skill Versatility (2 skills)', '+1 to two abilities of choice'] },
        { id: 'half-orc', name: 'Half-Orc', asi: { str: 2, con: 1 }, speed: 30, size: 'Medium', darkvision: 60,
          languages: ['Common', 'Orc'], skills: ['Intimidation'],
          traits: ['Darkvision 60 ft', 'Relentless Endurance', 'Savage Attacks', 'Menacing (Intimidation)'] },
        { id: 'tiefling', name: 'Tiefling', asi: { cha: 2, int: 1 }, speed: 30, size: 'Medium', darkvision: 60,
          languages: ['Common', 'Infernal'],
          traits: ['Darkvision 60 ft', 'Hellish Resistance (fire)', 'Infernal Legacy (Thaumaturgy)'] },
        { id: 'aasimar', name: 'Aasimar', asi: { cha: 2 }, asiChoice: { count: 1, amount: 1, exclude: ['cha'] }, speed: 30, size: 'Medium', darkvision: 60,
          languages: ['Common', 'Celestial'],
          traits: ['Darkvision 60 ft', 'Celestial Resistance', 'Healing Hands', 'Light Bearer (Light cantrip)'] },
        { id: 'orc', name: 'Orc', asi: { str: 2, con: 1 }, speed: 30, size: 'Medium', darkvision: 60,
          languages: ['Common', 'Orc'],
          traits: ['Darkvision 60 ft', 'Adrenaline Rush', 'Powerful Build', 'Relentless Endurance'] }
    ];

    /* ---- Classes ------------------------------------------------------ */
    const C = (o) => o;
    const classes = [
        C({ id: 'barbarian', name: 'Barbarian', hd: 12, primary: ['str'], saves: ['str', 'con'],
            armor: ['Light', 'Medium', 'Shields'], weapons: ['Simple', 'Martial'],
            skillChoose: 2, skillList: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'],
            spellcasting: null,
            subclasses: ['Path of the Berserker', 'Path of the Totem Warrior', 'Path of the Wild Magic', 'Path of the Zealot'],
            features: [{ level: 1, name: 'Rage', desc: 'Bonus damage & resistance to physical damage while raging.' }, { level: 1, name: 'Unarmored Defense', desc: 'AC = 10 + DEX + CON when not wearing armor.' }, { level: 2, name: 'Reckless Attack / Danger Sense' }, { level: 3, name: 'Primal Path (subclass)' }] }),
        C({ id: 'bard', name: 'Bard', hd: 8, primary: ['cha'], saves: ['dex', 'cha'],
            armor: ['Light'], weapons: ['Simple', 'Hand crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
            skillChoose: 3, skillList: skills.map(s => s.name),
            spellcasting: { ability: 'cha', type: 'known', progression: 'full', ritual: true },
            subclasses: ['College of Lore', 'College of Valor', 'College of Glamour', 'College of Swords'],
            features: [{ level: 1, name: 'Spellcasting' }, { level: 1, name: 'Bardic Inspiration (d6)' }, { level: 2, name: 'Jack of All Trades', desc: 'Half proficiency to non-proficient checks.' }, { level: 3, name: 'Bard College (subclass)', desc: 'Expertise in 2 skills.' }] }),
        C({ id: 'cleric', name: 'Cleric', hd: 8, primary: ['wis'], saves: ['wis', 'cha'],
            armor: ['Light', 'Medium', 'Shields'], weapons: ['Simple'],
            skillChoose: 2, skillList: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'],
            spellcasting: { ability: 'wis', type: 'prepared', progression: 'full', ritual: true },
            subclasses: ['Life Domain', 'Light Domain', 'Trickery Domain', 'War Domain', 'Knowledge Domain', 'Tempest Domain'],
            features: [{ level: 1, name: 'Spellcasting' }, { level: 1, name: 'Divine Domain (subclass)' }, { level: 2, name: 'Channel Divinity' }] }),
        C({ id: 'druid', name: 'Druid', hd: 8, primary: ['wis'], saves: ['int', 'wis'],
            armor: ['Light', 'Medium', 'Shields (non-metal)'], weapons: ['Clubs', 'Daggers', 'Darts', 'Javelins', 'Maces', 'Quarterstaffs', 'Scimitars', 'Sickles', 'Slings', 'Spears'],
            skillChoose: 2, skillList: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'],
            spellcasting: { ability: 'wis', type: 'prepared', progression: 'full', ritual: true },
            subclasses: ['Circle of the Land', 'Circle of the Moon', 'Circle of Dreams', 'Circle of the Shepherd'],
            features: [{ level: 1, name: 'Druidic' }, { level: 1, name: 'Spellcasting' }, { level: 2, name: 'Wild Shape' }, { level: 2, name: 'Druid Circle (subclass)' }] }),
        C({ id: 'fighter', name: 'Fighter', hd: 10, primary: ['str', 'dex'], saves: ['str', 'con'],
            armor: ['Light', 'Medium', 'Heavy', 'Shields'], weapons: ['Simple', 'Martial'],
            skillChoose: 2, skillList: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'],
            spellcasting: null,
            subclasses: ['Champion', 'Battle Master', 'Eldritch Knight', 'Samurai', 'Cavalier'],
            features: [{ level: 1, name: 'Fighting Style' }, { level: 1, name: 'Second Wind' }, { level: 2, name: 'Action Surge' }, { level: 3, name: 'Martial Archetype (subclass)' }] }),
        C({ id: 'monk', name: 'Monk', hd: 8, primary: ['dex', 'wis'], saves: ['str', 'dex'],
            armor: [], weapons: ['Simple', 'Shortswords'],
            skillChoose: 2, skillList: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'],
            spellcasting: null,
            subclasses: ['Way of the Open Hand', 'Way of Shadow', 'Way of the Four Elements', 'Way of Mercy'],
            features: [{ level: 1, name: 'Unarmored Defense', desc: 'AC = 10 + DEX + WIS.' }, { level: 1, name: 'Martial Arts' }, { level: 2, name: 'Ki', desc: 'Ki points fuel special moves.' }, { level: 3, name: 'Monastic Tradition (subclass)' }] }),
        C({ id: 'paladin', name: 'Paladin', hd: 10, primary: ['str', 'cha'], saves: ['wis', 'cha'],
            armor: ['Light', 'Medium', 'Heavy', 'Shields'], weapons: ['Simple', 'Martial'],
            skillChoose: 2, skillList: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'],
            spellcasting: { ability: 'cha', type: 'prepared', progression: 'half', ritual: false },
            subclasses: ['Oath of Devotion', 'Oath of the Ancients', 'Oath of Vengeance', 'Oath of Conquest'],
            features: [{ level: 1, name: 'Divine Sense' }, { level: 1, name: 'Lay on Hands' }, { level: 2, name: 'Fighting Style & Spellcasting' }, { level: 2, name: 'Divine Smite' }, { level: 3, name: 'Sacred Oath (subclass)' }] }),
        C({ id: 'ranger', name: 'Ranger', hd: 10, primary: ['dex', 'wis'], saves: ['str', 'dex'],
            armor: ['Light', 'Medium', 'Shields'], weapons: ['Simple', 'Martial'],
            skillChoose: 3, skillList: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'],
            spellcasting: { ability: 'wis', type: 'known', progression: 'half', ritual: false },
            subclasses: ['Hunter', 'Beast Master', 'Gloom Stalker', 'Fey Wanderer'],
            features: [{ level: 1, name: 'Favored Enemy' }, { level: 1, name: 'Natural Explorer' }, { level: 2, name: 'Fighting Style & Spellcasting' }, { level: 3, name: 'Ranger Archetype (subclass)' }] }),
        C({ id: 'rogue', name: 'Rogue', hd: 8, primary: ['dex'], saves: ['dex', 'int'],
            armor: ['Light'], weapons: ['Simple', 'Hand crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
            skillChoose: 4, skillList: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'],
            spellcasting: null,
            subclasses: ['Thief', 'Assassin', 'Arcane Trickster', 'Swashbuckler', 'Mastermind'],
            features: [{ level: 1, name: 'Expertise', desc: 'Double proficiency on 2 skills.' }, { level: 1, name: 'Sneak Attack (1d6)' }, { level: 1, name: 'Thieves’ Cant' }, { level: 2, name: 'Cunning Action' }, { level: 3, name: 'Roguish Archetype (subclass)' }] }),
        C({ id: 'sorcerer', name: 'Sorcerer', hd: 6, primary: ['cha'], saves: ['con', 'cha'],
            armor: [], weapons: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light crossbows'],
            skillChoose: 2, skillList: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'],
            spellcasting: { ability: 'cha', type: 'known', progression: 'full', ritual: false },
            subclasses: ['Draconic Bloodline', 'Wild Magic', 'Divine Soul', 'Shadow Magic', 'Clockwork Soul'],
            features: [{ level: 1, name: 'Spellcasting' }, { level: 1, name: 'Sorcerous Origin (subclass)' }, { level: 2, name: 'Font of Magic (Sorcery Points)' }, { level: 3, name: 'Metamagic' }] }),
        C({ id: 'warlock', name: 'Warlock', hd: 8, primary: ['cha'], saves: ['wis', 'cha'],
            armor: ['Light'], weapons: ['Simple'],
            skillChoose: 2, skillList: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'],
            spellcasting: { ability: 'cha', type: 'known', progression: 'pact', ritual: true },
            subclasses: ['The Fiend', 'The Great Old One', 'The Archfey', 'The Celestial', 'The Hexblade'],
            features: [{ level: 1, name: 'Otherworldly Patron (subclass)' }, { level: 1, name: 'Pact Magic' }, { level: 2, name: 'Eldritch Invocations' }, { level: 3, name: 'Pact Boon' }] }),
        C({ id: 'wizard', name: 'Wizard', hd: 6, primary: ['int'], saves: ['int', 'wis'],
            armor: [], weapons: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light crossbows'],
            skillChoose: 2, skillList: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'],
            spellcasting: { ability: 'int', type: 'prepared', progression: 'full', ritual: true, spellbook: true },
            subclasses: ['School of Evocation', 'School of Abjuration', 'School of Divination', 'School of Illusion', 'School of Necromancy', 'Bladesinging'],
            features: [{ level: 1, name: 'Spellcasting (Spellbook)' }, { level: 1, name: 'Arcane Recovery' }, { level: 2, name: 'Arcane Tradition (subclass)' }] }),
        C({ id: 'artificer', name: 'Artificer', hd: 8, primary: ['int'], saves: ['con', 'int'],
            armor: ['Light', 'Medium', 'Shields'], weapons: ['Simple'],
            skillChoose: 2, skillList: ['Arcana', 'History', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Sleight of Hand'],
            spellcasting: { ability: 'int', type: 'prepared', progression: 'half', ritual: true },
            subclasses: ['Alchemist', 'Artillerist', 'Battle Smith', 'Armorer'],
            features: [{ level: 1, name: 'Magical Tinkering' }, { level: 1, name: 'Spellcasting' }, { level: 2, name: 'Infuse Item' }, { level: 3, name: 'Artificer Specialist (subclass)' }] })
    ];

    /* ---- Backgrounds -------------------------------------------------- */
    const backgrounds = [
        { id: 'acolyte', name: 'Acolyte', skills: ['Insight', 'Religion'], tools: [], languages: 2, feature: 'Shelter of the Faithful', feat: 'Magic Initiate (Cleric)' },
        { id: 'charlatan', name: 'Charlatan', skills: ['Deception', 'Sleight of Hand'], tools: ['Disguise kit', 'Forgery kit'], languages: 0, feature: 'False Identity', feat: 'Skilled' },
        { id: 'criminal', name: 'Criminal', skills: ['Deception', 'Stealth'], tools: ['Thieves’ tools', 'Gaming set'], languages: 0, feature: 'Criminal Contact', feat: 'Alert' },
        { id: 'entertainer', name: 'Entertainer', skills: ['Acrobatics', 'Performance'], tools: ['Disguise kit', 'Musical instrument'], languages: 0, feature: 'By Popular Demand', feat: 'Musician' },
        { id: 'folk-hero', name: 'Folk Hero', skills: ['Animal Handling', 'Survival'], tools: ['Artisan’s tools', 'Vehicles (land)'], languages: 0, feature: 'Rustic Hospitality', feat: 'Tough' },
        { id: 'guild-artisan', name: 'Guild Artisan', skills: ['Insight', 'Persuasion'], tools: ['Artisan’s tools'], languages: 1, feature: 'Guild Membership', feat: 'Crafter' },
        { id: 'hermit', name: 'Hermit', skills: ['Medicine', 'Religion'], tools: ['Herbalism kit'], languages: 1, feature: 'Discovery', feat: 'Healer' },
        { id: 'noble', name: 'Noble', skills: ['History', 'Persuasion'], tools: ['Gaming set'], languages: 1, feature: 'Position of Privilege', feat: 'Skilled' },
        { id: 'outlander', name: 'Outlander', skills: ['Athletics', 'Survival'], tools: ['Musical instrument'], languages: 1, feature: 'Wanderer', feat: 'Tough' },
        { id: 'sage', name: 'Sage', skills: ['Arcana', 'History'], tools: [], languages: 2, feature: 'Researcher', feat: 'Magic Initiate (Wizard)' },
        { id: 'sailor', name: 'Sailor', skills: ['Athletics', 'Perception'], tools: ['Navigator’s tools', 'Vehicles (water)'], languages: 0, feature: 'Ship’s Passage', feat: 'Tavern Brawler' },
        { id: 'soldier', name: 'Soldier', skills: ['Athletics', 'Intimidation'], tools: ['Gaming set', 'Vehicles (land)'], languages: 0, feature: 'Military Rank', feat: 'Savage Attacker' },
        { id: 'urchin', name: 'Urchin', skills: ['Sleight of Hand', 'Stealth'], tools: ['Disguise kit', 'Thieves’ tools'], languages: 0, feature: 'City Secrets', feat: 'Lucky' }
    ];

    /* ---- Weapons ------------------------------------------------------ */
    const weapons = [
        // Simple Melee
        { name: 'Club', cat: 'Simple', type: 'melee', damage: '1d4', dtype: 'Bludgeoning', props: ['Light'], cost: '1 sp', weight: 2 },
        { name: 'Dagger', cat: 'Simple', type: 'melee', damage: '1d4', dtype: 'Piercing', props: ['Finesse', 'Light', 'Thrown (20/60)'], cost: '2 gp', weight: 1 },
        { name: 'Greatclub', cat: 'Simple', type: 'melee', damage: '1d8', dtype: 'Bludgeoning', props: ['Two-handed'], cost: '2 sp', weight: 10 },
        { name: 'Handaxe', cat: 'Simple', type: 'melee', damage: '1d6', dtype: 'Slashing', props: ['Light', 'Thrown (20/60)'], cost: '5 gp', weight: 2 },
        { name: 'Javelin', cat: 'Simple', type: 'melee', damage: '1d6', dtype: 'Piercing', props: ['Thrown (30/120)'], cost: '5 sp', weight: 2 },
        { name: 'Light Hammer', cat: 'Simple', type: 'melee', damage: '1d4', dtype: 'Bludgeoning', props: ['Light', 'Thrown (20/60)'], cost: '2 gp', weight: 2 },
        { name: 'Mace', cat: 'Simple', type: 'melee', damage: '1d6', dtype: 'Bludgeoning', props: [], cost: '5 gp', weight: 4 },
        { name: 'Quarterstaff', cat: 'Simple', type: 'melee', damage: '1d6', dtype: 'Bludgeoning', props: ['Versatile (1d8)'], cost: '2 sp', weight: 4 },
        { name: 'Sickle', cat: 'Simple', type: 'melee', damage: '1d4', dtype: 'Slashing', props: ['Light'], cost: '1 gp', weight: 2 },
        { name: 'Spear', cat: 'Simple', type: 'melee', damage: '1d6', dtype: 'Piercing', props: ['Thrown (20/60)', 'Versatile (1d8)'], cost: '1 gp', weight: 3 },
        // Simple Ranged
        { name: 'Light Crossbow', cat: 'Simple', type: 'ranged', damage: '1d8', dtype: 'Piercing', props: ['Ammunition (80/320)', 'Loading', 'Two-handed'], cost: '25 gp', weight: 5 },
        { name: 'Dart', cat: 'Simple', type: 'ranged', damage: '1d4', dtype: 'Piercing', props: ['Finesse', 'Thrown (20/60)'], cost: '5 cp', weight: 0.25 },
        { name: 'Shortbow', cat: 'Simple', type: 'ranged', damage: '1d6', dtype: 'Piercing', props: ['Ammunition (80/320)', 'Two-handed'], cost: '25 gp', weight: 2 },
        { name: 'Sling', cat: 'Simple', type: 'ranged', damage: '1d4', dtype: 'Bludgeoning', props: ['Ammunition (30/120)'], cost: '1 sp', weight: 0 },
        // Martial Melee
        { name: 'Battleaxe', cat: 'Martial', type: 'melee', damage: '1d8', dtype: 'Slashing', props: ['Versatile (1d10)'], cost: '10 gp', weight: 4 },
        { name: 'Flail', cat: 'Martial', type: 'melee', damage: '1d8', dtype: 'Bludgeoning', props: [], cost: '10 gp', weight: 2 },
        { name: 'Glaive', cat: 'Martial', type: 'melee', damage: '1d10', dtype: 'Slashing', props: ['Heavy', 'Reach', 'Two-handed'], cost: '20 gp', weight: 6 },
        { name: 'Greataxe', cat: 'Martial', type: 'melee', damage: '1d12', dtype: 'Slashing', props: ['Heavy', 'Two-handed'], cost: '30 gp', weight: 7 },
        { name: 'Greatsword', cat: 'Martial', type: 'melee', damage: '2d6', dtype: 'Slashing', props: ['Heavy', 'Two-handed'], cost: '50 gp', weight: 6 },
        { name: 'Halberd', cat: 'Martial', type: 'melee', damage: '1d10', dtype: 'Slashing', props: ['Heavy', 'Reach', 'Two-handed'], cost: '20 gp', weight: 6 },
        { name: 'Longsword', cat: 'Martial', type: 'melee', damage: '1d8', dtype: 'Slashing', props: ['Versatile (1d10)'], cost: '15 gp', weight: 3 },
        { name: 'Maul', cat: 'Martial', type: 'melee', damage: '2d6', dtype: 'Bludgeoning', props: ['Heavy', 'Two-handed'], cost: '10 gp', weight: 10 },
        { name: 'Morningstar', cat: 'Martial', type: 'melee', damage: '1d8', dtype: 'Piercing', props: [], cost: '15 gp', weight: 4 },
        { name: 'Rapier', cat: 'Martial', type: 'melee', damage: '1d8', dtype: 'Piercing', props: ['Finesse'], cost: '25 gp', weight: 2 },
        { name: 'Scimitar', cat: 'Martial', type: 'melee', damage: '1d6', dtype: 'Slashing', props: ['Finesse', 'Light'], cost: '25 gp', weight: 3 },
        { name: 'Shortsword', cat: 'Martial', type: 'melee', damage: '1d6', dtype: 'Piercing', props: ['Finesse', 'Light'], cost: '10 gp', weight: 2 },
        { name: 'Trident', cat: 'Martial', type: 'melee', damage: '1d6', dtype: 'Piercing', props: ['Thrown (20/60)', 'Versatile (1d8)'], cost: '5 gp', weight: 4 },
        { name: 'War Pick', cat: 'Martial', type: 'melee', damage: '1d8', dtype: 'Piercing', props: [], cost: '5 gp', weight: 2 },
        { name: 'Warhammer', cat: 'Martial', type: 'melee', damage: '1d8', dtype: 'Bludgeoning', props: ['Versatile (1d10)'], cost: '15 gp', weight: 2 },
        { name: 'Whip', cat: 'Martial', type: 'melee', damage: '1d4', dtype: 'Slashing', props: ['Finesse', 'Reach'], cost: '2 gp', weight: 3 },
        // Martial Ranged
        { name: 'Hand Crossbow', cat: 'Martial', type: 'ranged', damage: '1d6', dtype: 'Piercing', props: ['Ammunition (30/120)', 'Light', 'Loading'], cost: '75 gp', weight: 3 },
        { name: 'Heavy Crossbow', cat: 'Martial', type: 'ranged', damage: '1d10', dtype: 'Piercing', props: ['Ammunition (100/400)', 'Heavy', 'Loading', 'Two-handed'], cost: '50 gp', weight: 18 },
        { name: 'Longbow', cat: 'Martial', type: 'ranged', damage: '1d8', dtype: 'Piercing', props: ['Ammunition (150/600)', 'Heavy', 'Two-handed'], cost: '50 gp', weight: 2 }
    ];

    /* ---- Armor -------------------------------------------------------- */
    const armor = [
        { name: 'Padded', cat: 'Light', ac: 11, dexCap: null, stealth: 'disadv', cost: '5 gp', weight: 8 },
        { name: 'Leather', cat: 'Light', ac: 11, dexCap: null, cost: '10 gp', weight: 10 },
        { name: 'Studded Leather', cat: 'Light', ac: 12, dexCap: null, cost: '45 gp', weight: 13 },
        { name: 'Hide', cat: 'Medium', ac: 12, dexCap: 2, cost: '10 gp', weight: 12 },
        { name: 'Chain Shirt', cat: 'Medium', ac: 13, dexCap: 2, cost: '50 gp', weight: 20 },
        { name: 'Scale Mail', cat: 'Medium', ac: 14, dexCap: 2, stealth: 'disadv', cost: '50 gp', weight: 45 },
        { name: 'Breastplate', cat: 'Medium', ac: 14, dexCap: 2, cost: '400 gp', weight: 20 },
        { name: 'Half Plate', cat: 'Medium', ac: 15, dexCap: 2, stealth: 'disadv', cost: '750 gp', weight: 40 },
        { name: 'Ring Mail', cat: 'Heavy', ac: 14, dexCap: 0, stealth: 'disadv', cost: '30 gp', weight: 40 },
        { name: 'Chain Mail', cat: 'Heavy', ac: 16, dexCap: 0, str: 13, stealth: 'disadv', cost: '75 gp', weight: 55 },
        { name: 'Splint', cat: 'Heavy', ac: 17, dexCap: 0, str: 15, stealth: 'disadv', cost: '200 gp', weight: 60 },
        { name: 'Plate', cat: 'Heavy', ac: 18, dexCap: 0, str: 15, stealth: 'disadv', cost: '1500 gp', weight: 65 },
        { name: 'Shield', cat: 'Shield', ac: 2, cost: '10 gp', weight: 6 }
    ];

    /* ---- Spells (curated SRD subset) ---------------------------------- */
    const sp = (name, level, school, classes, time, range, comp, dur, flags, desc) =>
        ({ name, level, school, classes, time, range, comp, dur,
           ritual: flags.indexOf('R') >= 0, concentration: flags.indexOf('C') >= 0, desc });
    const spells = [
        // Cantrips
        sp('Acid Splash', 0, 'Conjuration', ['sorcerer', 'wizard', 'artificer'], '1 action', '60 ft', 'V,S', 'Instant', [], 'Hurl a bubble of acid at one or two creatures (2d6 acid, DEX save).'),
        sp('Fire Bolt', 0, 'Evocation', ['sorcerer', 'wizard', 'artificer'], '1 action', '120 ft', 'V,S', 'Instant', [], 'Ranged spell attack for 1d10 fire damage; scales with level.'),
        sp('Mage Hand', 0, 'Conjuration', ['bard', 'sorcerer', 'warlock', 'wizard', 'artificer'], '1 action', '30 ft', 'V,S', '1 minute', [], 'A spectral hand manipulates objects up to 10 lb.'),
        sp('Minor Illusion', 0, 'Illusion', ['bard', 'sorcerer', 'warlock', 'wizard'], '1 action', '30 ft', 'S,M', '1 minute', [], 'Create a sound or image of an object.'),
        sp('Prestidigitation', 0, 'Transmutation', ['bard', 'sorcerer', 'warlock', 'wizard', 'artificer'], '1 action', '10 ft', 'V,S', 'Up to 1 hour', [], 'Minor magical tricks and effects.'),
        sp('Guidance', 0, 'Divination', ['cleric', 'druid', 'artificer'], '1 action', 'Touch', 'V,S', 'Conc. 1 min', ['C'], 'Target adds 1d4 to one ability check.'),
        sp('Sacred Flame', 0, 'Evocation', ['cleric'], '1 action', '60 ft', 'V,S', 'Instant', [], 'Radiant flame (1d8, DEX save, ignores cover).'),
        sp('Eldritch Blast', 0, 'Evocation', ['warlock'], '1 action', '120 ft', 'V,S', 'Instant', [], 'Beam of crackling energy (1d10 force); extra beams at higher level.'),
        sp('Vicious Mockery', 0, 'Enchantment', ['bard'], '1 action', '60 ft', 'V', 'Instant', [], 'Insult a creature (1d4 psychic, disadvantage on next attack, WIS save).'),
        sp('Ray of Frost', 0, 'Evocation', ['sorcerer', 'wizard'], '1 action', '60 ft', 'V,S', 'Instant', [], 'Frigid beam (1d8 cold, reduces speed by 10 ft).'),
        sp('Shillelagh', 0, 'Transmutation', ['druid'], '1 bonus action', 'Touch', 'V,S,M', '1 minute', [], 'Club/quarterstaff uses WIS and deals 1d8.'),
        sp('Druidcraft', 0, 'Transmutation', ['druid'], '1 action', '30 ft', 'V,S', 'Instant', [], 'Minor nature effects and weather prediction.'),
        // Level 1
        sp('Cure Wounds', 1, 'Evocation', ['bard', 'cleric', 'druid', 'paladin', 'ranger', 'artificer'], '1 action', 'Touch', 'V,S', 'Instant', [], 'Heal 1d8 + spellcasting modifier.'),
        sp('Healing Word', 1, 'Evocation', ['bard', 'cleric', 'druid'], '1 bonus action', '60 ft', 'V', 'Instant', [], 'Heal 1d4 + modifier at range (bonus action).'),
        sp('Magic Missile', 1, 'Evocation', ['sorcerer', 'wizard'], '1 action', '120 ft', 'V,S', 'Instant', [], 'Three darts, each 1d4+1 force, auto-hit.'),
        sp('Shield', 1, 'Abjuration', ['sorcerer', 'wizard'], '1 reaction', 'Self', 'V,S', '1 round', [], '+5 AC until your next turn; blocks Magic Missile.'),
        sp('Burning Hands', 1, 'Evocation', ['sorcerer', 'wizard'], '1 action', 'Self (15 ft cone)', 'V,S', 'Instant', [], '3d6 fire in a cone (DEX save).'),
        sp('Thunderwave', 1, 'Evocation', ['bard', 'druid', 'sorcerer', 'wizard'], '1 action', 'Self (15 ft cube)', 'V,S', 'Instant', [], '2d8 thunder and push (CON save).'),
        sp('Detect Magic', 1, 'Divination', ['bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'wizard', 'artificer'], '1 action', 'Self', 'V,S', 'Conc. 10 min', ['C', 'R'], 'Sense magic within 30 ft.'),
        sp('Faerie Fire', 1, 'Evocation', ['bard', 'druid'], '1 action', '60 ft', 'V', 'Conc. 1 min', ['C'], 'Outlines creatures; attacks vs them have advantage (DEX save).'),
        sp('Bless', 1, 'Enchantment', ['cleric', 'paladin'], '1 action', '30 ft', 'V,S,M', 'Conc. 1 min', ['C'], 'Up to 3 creatures add 1d4 to attacks and saves.'),
        sp('Sleep', 1, 'Enchantment', ['bard', 'sorcerer', 'wizard'], '1 action', '90 ft', 'V,S,M', '1 minute', [], '5d8 HP of creatures fall asleep.'),
        sp('Charm Person', 1, 'Enchantment', ['bard', 'druid', 'sorcerer', 'warlock', 'wizard'], '1 action', '30 ft', 'V,S', '1 hour', [], 'Charm a humanoid (WIS save).'),
        sp('Hex', 1, 'Enchantment', ['warlock'], '1 bonus action', '90 ft', 'V,S,M', 'Conc. 1 hr', ['C'], 'Extra 1d6 necrotic on hits; disadvantage on one ability.'),
        sp('Hunter’s Mark', 1, 'Divination', ['ranger'], '1 bonus action', '90 ft', 'V,S,M', 'Conc. 1 hr', ['C'], 'Extra 1d6 on weapon hits vs the marked target.'),
        // Level 2
        sp('Misty Step', 2, 'Conjuration', ['sorcerer', 'warlock', 'wizard'], '1 bonus action', 'Self', 'V', 'Instant', [], 'Teleport up to 30 ft to a seen space.'),
        sp('Scorching Ray', 2, 'Evocation', ['sorcerer', 'wizard'], '1 action', '120 ft', 'V,S', 'Instant', [], 'Three rays, each 2d6 fire (spell attack).'),
        sp('Hold Person', 2, 'Enchantment', ['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard'], '1 action', '60 ft', 'V,S,M', 'Conc. 1 min', ['C'], 'Paralyze a humanoid (WIS save each turn).'),
        sp('Invisibility', 2, 'Illusion', ['bard', 'sorcerer', 'warlock', 'wizard', 'artificer'], '1 action', 'Touch', 'V,S,M', 'Conc. 1 hr', ['C'], 'A creature becomes invisible until it attacks/casts.'),
        sp('Spiritual Weapon', 2, 'Evocation', ['cleric'], '1 bonus action', '60 ft', 'V,S', '1 minute', [], 'Floating weapon attacks for 1d8 + mod (bonus action).'),
        sp('Aid', 2, 'Abjuration', ['cleric', 'paladin', 'artificer'], '1 action', '30 ft', 'V,S,M', '8 hours', [], 'Raise max & current HP of 3 creatures by 5.'),
        sp('Lesser Restoration', 2, 'Abjuration', ['bard', 'cleric', 'druid', 'paladin', 'ranger', 'artificer'], '1 action', 'Touch', 'V,S', 'Instant', [], 'End one disease or condition.'),
        sp('Flaming Sphere', 2, 'Conjuration', ['druid', 'sorcerer', 'wizard'], '1 action', '60 ft', 'V,S,M', 'Conc. 1 min', ['C'], 'A rolling fiery sphere (2d6 fire).'),
        // Level 3
        sp('Fireball', 3, 'Evocation', ['sorcerer', 'wizard'], '1 action', '150 ft', 'V,S,M', 'Instant', [], '8d6 fire in a 20-ft radius (DEX save).'),
        sp('Counterspell', 3, 'Abjuration', ['sorcerer', 'warlock', 'wizard'], '1 reaction', '60 ft', 'S', 'Instant', [], 'Interrupt a spell being cast.'),
        sp('Fly', 3, 'Transmutation', ['sorcerer', 'warlock', 'wizard', 'artificer'], '1 action', 'Touch', 'V,S,M', 'Conc. 10 min', ['C'], 'Target gains 60 ft flying speed.'),
        sp('Lightning Bolt', 3, 'Evocation', ['sorcerer', 'wizard'], '1 action', 'Self (100 ft line)', 'V,S,M', 'Instant', [], '8d6 lightning in a line (DEX save).'),
        sp('Revivify', 3, 'Necromancy', ['cleric', 'paladin', 'ranger', 'artificer'], '1 action', 'Touch', 'V,S,M', 'Instant', [], 'Return a creature dead <1 min to life with 1 HP.'),
        sp('Dispel Magic', 3, 'Abjuration', ['bard', 'cleric', 'druid', 'paladin', 'sorcerer', 'warlock', 'wizard', 'artificer'], '1 action', '120 ft', 'V,S', 'Instant', [], 'End spells on a target.'),
        sp('Haste', 3, 'Transmutation', ['sorcerer', 'wizard', 'artificer'], '1 action', '30 ft', 'V,S,M', 'Conc. 1 min', ['C'], 'Double speed, +2 AC, extra action.'),
        // Level 4
        sp('Polymorph', 4, 'Transmutation', ['bard', 'druid', 'sorcerer', 'wizard'], '1 action', '60 ft', 'V,S,M', 'Conc. 1 hr', ['C'], 'Transform a creature into a beast.'),
        sp('Greater Invisibility', 4, 'Illusion', ['bard', 'sorcerer', 'wizard'], '1 action', 'Touch', 'V,S', 'Conc. 1 min', ['C'], 'Invisible even while attacking or casting.'),
        sp('Wall of Fire', 4, 'Evocation', ['druid', 'sorcerer', 'wizard'], '1 action', '120 ft', 'V,S,M', 'Conc. 1 min', ['C'], '5d8 fire wall.'),
        // Level 5
        sp('Cone of Cold', 5, 'Evocation', ['sorcerer', 'wizard'], '1 action', 'Self (60 ft cone)', 'V,S,M', 'Instant', [], '8d8 cold in a cone (CON save).'),
        sp('Mass Cure Wounds', 5, 'Evocation', ['bard', 'cleric', 'druid'], '1 action', '60 ft', 'V,S', 'Instant', [], 'Heal up to 6 creatures 3d8 + mod.'),
        sp('Raise Dead', 5, 'Necromancy', ['bard', 'cleric', 'paladin'], '1 hour', 'Touch', 'V,S,M', 'Instant', [], 'Return a creature dead <10 days to life.')
    ];

    // Full-caster spell slots per class level (index by level 1..20)
    const fullCasterSlots = {
        1: [2], 2: [3], 3: [4, 2], 4: [4, 3], 5: [4, 3, 2], 6: [4, 3, 3], 7: [4, 3, 3, 1], 8: [4, 3, 3, 2],
        9: [4, 3, 3, 3, 1], 10: [4, 3, 3, 3, 2], 11: [4, 3, 3, 3, 2, 1], 12: [4, 3, 3, 3, 2, 1],
        13: [4, 3, 3, 3, 2, 1, 1], 14: [4, 3, 3, 3, 2, 1, 1], 15: [4, 3, 3, 3, 2, 1, 1, 1], 16: [4, 3, 3, 3, 2, 1, 1, 1],
        17: [4, 3, 3, 3, 2, 1, 1, 1, 1], 18: [4, 3, 3, 3, 3, 1, 1, 1, 1], 19: [4, 3, 3, 3, 3, 2, 1, 1, 1], 20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
    };

    /* ---- Feats (curated popular SRD/PHB feats) ---- */
    const feats = [
        { name: 'Alert', desc: '+5 initiative; can’t be surprised while conscious; hidden attackers gain no advantage.' },
        { name: 'Actor', desc: '+1 CHA; advantage on Deception/Performance to impersonate; mimic speech and sounds.' },
        { name: 'Athlete', desc: '+1 STR or DEX; stand from prone with 5 ft; climb at normal speed; better running jumps.' },
        { name: 'Charger', desc: 'After a Dash, make a melee attack (+5 damage) or shove as a bonus action.' },
        { name: 'Crossbow Expert', desc: 'Ignore loading; no disadvantage in melee; bonus-action hand crossbow shot.' },
        { name: 'Defensive Duelist', desc: 'Use a reaction to add proficiency bonus to AC against one melee attack.' },
        { name: 'Dual Wielder', desc: '+1 AC while wielding two weapons; use non-light weapons for two-weapon fighting.' },
        { name: 'Durable', desc: '+1 CON; regain at least twice your CON modifier on Hit Dice rolls.' },
        { name: 'Great Weapon Master', desc: 'Bonus attack on crit/kill; take −5 to hit for +10 damage with heavy weapons.' },
        { name: 'Healer', desc: 'Use a healer’s kit to restore 1d6+4 HP + Hit Die value; stabilize with 1 HP.' },
        { name: 'Inspiring Leader', desc: 'Spend 10 minutes to grant up to 6 allies temporary HP equal to your level + CHA.' },
        { name: 'Keen Mind', desc: '+1 INT; always know which way is north and hours until sunrise; perfect month-long recall.' },
        { name: 'Lucky', desc: '3 luck points per day: reroll an attack, ability check, save, or a roll against you.' },
        { name: 'Mage Slayer', desc: 'Reaction attack vs adjacent casters; advantage on saves vs their spells.' },
        { name: 'Magic Initiate', desc: 'Learn two cantrips and one 1st-level spell from a chosen class.' },
        { name: 'Mobile', desc: '+10 ft speed; Dash ignores difficult terrain; no opportunity attacks from targets you hit.' },
        { name: 'Observant', desc: '+1 INT or WIS; +5 passive Perception & Investigation; read lips.' },
        { name: 'Polearm Master', desc: 'Bonus-action butt-end attack (1d4); opportunity attacks when foes enter your reach.' },
        { name: 'Resilient', desc: '+1 to one ability and gain proficiency in its saving throws.' },
        { name: 'Ritual Caster', desc: 'Gain a ritual book and can cast ritual spells from a chosen class.' },
        { name: 'Savage Attacker', desc: 'Once per turn, reroll melee weapon damage and use either total.' },
        { name: 'Sentinel', desc: 'Stop foes you hit; opportunity attacks even if they Disengage; punish attacks on allies.' },
        { name: 'Sharpshooter', desc: 'Ignore cover and long-range penalties; take −5 to hit for +10 ranged damage.' },
        { name: 'Shield Master', desc: 'Bonus-action shove; add shield AC to DEX saves; halve some damage.' },
        { name: 'Spell Sniper', desc: 'Double spell attack range; ignore cover; learn one attack cantrip.' },
        { name: 'Tough', desc: 'Your hit point maximum increases by 2 per character level.' },
        { name: 'War Caster', desc: 'Advantage on concentration saves; cast with hands full; cast as an opportunity attack.' }
    ];

    /* ---- Backstory Weaver tables (rerollable narrative lines) ---- */
    const story = {
        trait: {
            label: 'Personality Trait', icon: '🎭', options: [
                'I face problems head-on; the simplest, most direct path is usually best.',
                'I’m full of witty aphorisms and have a proverb for every occasion.',
                'I’ve seen too much of the world to be easily shocked.',
                'I can find common ground between the fiercest enemies.',
                'I quote (or misquote) ancient texts in almost every conversation.',
                'I feel far more at ease around animals than around people.',
                'I keep a joke ready for the darkest moment; laughter holds fear at bay.',
                'I’m always calm, no matter how dire things become.',
                'I judge every stranger by their bootstraps and the dirt on their hands.',
                'I never back down from a challenge, however foolish.',
                'I speak slowly and choose my words with great care.',
                'I collect trinkets and can’t help but pocket the shiny ones.'
            ]
        },
        ideal: {
            label: 'Ideal', icon: '⚖️', options: [
                'Freedom. Chains are meant to be broken, as are those who forge them.',
                'Charity. I help those in need, whatever the cost to myself.',
                'Greater Good. Our lot is to lay down our lives in defense of others.',
                'Knowledge. The path to power and betterment runs through understanding.',
                'Honor. My word is my bond, and I never break it.',
                'Glory. I must earn renown worthy of the songs.',
                'Nature. The wild world matters more than the works of civilization.',
                'Redemption. There is a spark of good in everyone.',
                'Might. The strong are meant to guide — or to rule.',
                'Justice. The guilty must answer for their crimes.'
            ]
        },
        bond: {
            label: 'Bond', icon: '🔗', options: [
                'I would die to recover an ancient relic that was lost long ago.',
                'I owe my life to the one who took me in when I had nothing.',
                'Everything I do, I do for the common folk.',
                'I will someday have revenge on those who wronged my family.',
                'I protect those who cannot protect themselves.',
                'My clan is the most important thing in my life — even when far from home.',
                'I’m in love with someone I can never truly be with.',
                'A sacred place shaped me, and I will defend it to my last breath.',
                'I carry a debt of mercy I can never fully repay.',
                'A mentor’s unfinished work is now mine to complete.'
            ]
        },
        flaw: {
            label: 'Flaw', icon: '💔', options: [
                'I judge others harshly, and myself even more severely.',
                'Once I set a goal, I pursue it to the ruin of all else.',
                'I put far too much trust in those who wield power.',
                'I can’t resist a pretty face — or a heavy coin purse.',
                'I’m too greedy for my own good.',
                'I turn tail and run the moment things truly turn grim.',
                'Secretly, I believe I’m unworthy of the loyalty I’m shown.',
                'I have a weakness for the vices of the city.',
                'My pride will one day be the death of me.',
                'I speak my mind, even when silence would serve far better.'
            ]
        },
        origin: {
            label: 'Where they came from', icon: '🏡', options: [
                'raised in a quiet farming village on the frontier',
                'orphaned young and taken in by a traveling caravan',
                'born to nobility, yet always drawn to the open road',
                'apprenticed to a reclusive mage in a mountain tower',
                'grew up amid the crowded, lawless alleys of a port city',
                'reared among monks in a remote cliffside monastery',
                'the sole survivor of a village razed by raiders',
                'born under a strange omen the elders still whisper about',
                'raised by druids in an ancient, whispering forest',
                'hardened in a mercenary company since childhood'
            ]
        },
        motivation: {
            label: 'What drives them', icon: '🎯', options: [
                'to prove themselves worthy of a name they never earned',
                'to avenge a wrong that still burns in their memory',
                'to uncover the truth behind their mysterious lineage',
                'to shield the innocent from the darkness they once faced',
                'to reclaim their family’s lost honor',
                'to master a power they barely understand',
                'to find a place where they finally belong',
                'to keep a promise made at a deathbed',
                'to see every far corner of the world',
                'to atone for one terrible mistake'
            ]
        },
        moment: {
            label: 'A defining moment', icon: '⚡', options: [
                'survived a battle that no one else walked away from',
                'made a desperate pact — and something answered',
                'watched a mentor fall and swore to carry on their work',
                'discovered a hidden talent at the moment it mattered most',
                'was betrayed by someone they trusted with everything',
                'stood alone against a monster and, somehow, won',
                'found an artifact that changed the course of their life',
                'broke free from chains, literal or otherwise',
                'was spared by an enemy who saw something worthy in them',
                'lost everything in a single night of fire and ruin'
            ]
        },
        secret: {
            label: 'A secret they keep', icon: '🤫', options: [
                'they carry a mark that brands them a heretic back home',
                'they are the last heir of a fallen house',
                'the power they wield came at a price not yet paid',
                'they once served the very evil they now fight',
                'a prophecy names them, and they wish it didn’t',
                'they faked their own death to escape a former life',
                'they owe a debt to a creature that will one day collect',
                'they aren’t quite who their companions believe',
                'they hear a voice that no one else can',
                'they buried a crime that could unravel everything'
            ]
        }
    };

    /* ---- Fantasy name generator parts ---- */
    const names = {
        a: ['Ael', 'Bran', 'Cor', 'Dra', 'El', 'Fen', 'Gor', 'Hal', 'Il', 'Jor', 'Kael', 'Lyr', 'Mor', 'Nym', 'Ory', 'Per', 'Quen', 'Rho', 'Syl', 'Thal', 'Ulr', 'Vex', 'Wyn', 'Xan', 'Yor', 'Zeph', 'Aer', 'Bel', 'Cael', 'Dun', 'Ser', 'Mae'],
        b: ['an', 'ara', 'oth', 'wyn', 'iel', 'dor', 'eth', 'is', 'ora', 'us', 'yn', 'ric', 'ael', 'ir', 'on', 'ana', 'wen', 'ax', 'ea', 'mar', 'ith', 'iel'],
        sur: ['Brightwood', 'Stormcrow', 'Ashford', 'Nightbreeze', 'Ironheart', 'Fairwind', 'Blackthorn', 'Silvervein', 'Ravensong', 'Emberfell', 'Duskwalker', 'Thornfield', 'Oakenshield', 'Frostmantle', 'Grimward', 'Hollowbrook', 'Windrider', 'Shadowmere', 'Goldmane', 'Stoneforge']
    };

    const portraits = ['🧝', '🧙', '🧛', '🧚', '🧜', '🐉', '⚔️', '🛡️', '🏹', '🗡️', '👑', '🔮', '🐺', '🦉', '🔥', '❄️', '☠️', '😈', '😇', '🥷'];

    return {
        editions, abilities, abilityNames, alignments, skills, pointBuyCost, standardArray,
        proficiencyByLevel, races, classes, backgrounds, weapons, armor, spells, fullCasterSlots,
        feats, story, names, portraits
    };
})();
