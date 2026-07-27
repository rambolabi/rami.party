/* =====================================================================
 * D&D Forge — Armor
 * Exposes window.DND_ARMOR.
 * Fields: name, cat (Light/Medium/Heavy/Shield), ac, dexCap (null=full Dex,
 *         0=none), str (min STR), stealth ('disadv'), cost, weight
 * ===================================================================== */
window.DND_ARMOR = [
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
