/* =====================================================================
 * D&D Forge — Backgrounds
 * Exposes window.DND_BACKGROUNDS.
 * Fields: id, name, skills[], tools[], languages(number of choices),
 *         feature, feat (2024 origin feat)
 * ===================================================================== */
window.DND_BACKGROUNDS = [
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
    { id: 'urchin', name: 'Urchin', skills: ['Sleight of Hand', 'Stealth'], tools: ['Disguise kit', 'Thieves’ tools'], languages: 0, feature: 'City Secrets', feat: 'Lucky' },
    { id: 'far-traveler', name: 'Far Traveler', skills: ['Insight', 'Perception'], tools: ['Musical instrument or gaming set'], languages: 1, feature: 'All Eyes on You', feat: 'Skilled' },
    { id: 'haunted-one', name: 'Haunted One', skills: ['Arcana', 'Religion'], tools: [], languages: 2, feature: 'Heart of Darkness', feat: 'Tough' },
    { id: 'city-watch', name: 'City Watch', skills: ['Athletics', 'Insight'], tools: [], languages: 2, feature: 'Watcher’s Eye', feat: 'Alert' },
    { id: 'courtier', name: 'Courtier', skills: ['Insight', 'Persuasion'], tools: [], languages: 2, feature: 'Court Functionary', feat: 'Actor' },
    { id: 'faction-agent', name: 'Faction Agent', skills: ['Insight', 'Religion'], tools: [], languages: 2, feature: 'Safe Haven', feat: 'Observant' },
    { id: 'knight', name: 'Knight', skills: ['History', 'Persuasion'], tools: ['Gaming set'], languages: 1, feature: 'Retainers', feat: 'Sentinel' },
    { id: 'pirate', name: 'Pirate', skills: ['Athletics', 'Perception'], tools: ['Navigator’s tools', 'Vehicles (water)'], languages: 0, feature: 'Bad Reputation', feat: 'Tavern Brawler' },
    { id: 'gladiator', name: 'Gladiator', skills: ['Acrobatics', 'Performance'], tools: ['Disguise kit'], languages: 0, feature: 'By Popular Demand', feat: 'Savage Attacker' },
    { id: 'archaeologist', name: 'Archaeologist', skills: ['History', 'Survival'], tools: ['Cartographer’s or navigator’s tools'], languages: 1, feature: 'Historical Knowledge', feat: 'Keen Mind' },
    { id: 'anthropologist', name: 'Anthropologist', skills: ['Insight', 'Religion'], tools: [], languages: 2, feature: 'Cultural Chameleon', feat: 'Observant' },
    { id: 'athlete', name: 'Athlete', skills: ['Acrobatics', 'Athletics'], tools: ['Vehicles (land)'], languages: 1, feature: 'Echoes of Victory', feat: 'Athlete' },
    { id: 'cloistered-scholar', name: 'Cloistered Scholar', skills: ['History', 'Arcana'], tools: [], languages: 2, feature: 'Library Access', feat: 'Keen Mind' },
    { id: 'feylost', name: 'Feylost', skills: ['Deception', 'Survival'], tools: ['Musical instrument'], languages: 2, feature: 'Feywild Connection', feat: 'Fey Touched' },
    { id: 'investigator', name: 'Investigator', skills: ['Insight', 'Investigation'], tools: ['Disguise kit'], languages: 0, feature: 'Official Inquiry', feat: 'Observant' },
    { id: 'marine', name: 'Marine', skills: ['Athletics', 'Survival'], tools: ['Vehicles (water)'], languages: 0, feature: 'Steady', feat: 'Tough' },
    { id: 'mercenary', name: 'Mercenary Veteran', skills: ['Athletics', 'Persuasion'], tools: ['Gaming set', 'Vehicles (land)'], languages: 0, feature: 'Mercenary Life', feat: 'Savage Attacker' },
    { id: 'smuggler', name: 'Smuggler', skills: ['Athletics', 'Deception'], tools: ['Vehicles (water)'], languages: 0, feature: 'Down Low', feat: 'Alert' },
    { id: 'spy', name: 'Spy', skills: ['Deception', 'Stealth'], tools: ['Disguise kit', 'Thieves’ tools'], languages: 0, feature: 'Ear to the Ground', feat: 'Skulker' },
    { id: 'noble-scion', name: 'Waterdhavian Noble', skills: ['History', 'Persuasion'], tools: ['Gaming set', 'Musical instrument'], languages: 1, feature: 'Kept in Style', feat: 'Actor' }
];
