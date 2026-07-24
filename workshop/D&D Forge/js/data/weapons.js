/* =====================================================================
 * D&D Forge — Weapons
 * Exposes window.DND_WEAPONS.
 * Fields: name, cat (Simple/Martial), type (melee/ranged), damage, dtype,
 *         props[], cost, weight
 * ===================================================================== */
window.DND_WEAPONS = [
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
    { name: 'Pike', cat: 'Martial', type: 'melee', damage: '1d10', dtype: 'Piercing', props: ['Heavy', 'Reach', 'Two-handed'], cost: '5 gp', weight: 18 },
    { name: 'Lance', cat: 'Martial', type: 'melee', damage: '1d12', dtype: 'Piercing', props: ['Reach', 'Special (disadv. within 5 ft)'], cost: '10 gp', weight: 6 },
    // Martial Ranged
    { name: 'Hand Crossbow', cat: 'Martial', type: 'ranged', damage: '1d6', dtype: 'Piercing', props: ['Ammunition (30/120)', 'Light', 'Loading'], cost: '75 gp', weight: 3 },
    { name: 'Heavy Crossbow', cat: 'Martial', type: 'ranged', damage: '1d10', dtype: 'Piercing', props: ['Ammunition (100/400)', 'Heavy', 'Loading', 'Two-handed'], cost: '50 gp', weight: 18 },
    { name: 'Longbow', cat: 'Martial', type: 'ranged', damage: '1d8', dtype: 'Piercing', props: ['Ammunition (150/600)', 'Heavy', 'Two-handed'], cost: '50 gp', weight: 2 },
    { name: 'Blowgun', cat: 'Martial', type: 'ranged', damage: '1', dtype: 'Piercing', props: ['Ammunition (25/100)', 'Loading'], cost: '10 gp', weight: 1 },
    { name: 'Net', cat: 'Martial', type: 'ranged', damage: '—', dtype: 'Restrain', props: ['Special', 'Thrown (5/15)'], cost: '1 gp', weight: 3 }
];
