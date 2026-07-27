/* =====================================================================
 * D&D Forge — Spells (curated SRD subset, cantrips → level 9)
 * Exposes window.DND_SPELLS. Add spells with the sp() helper:
 *   sp(name, level, school, classes[], time, range, comp, dur, flags[], desc)
 *   flags: 'R' = ritual, 'C' = concentration
 * ===================================================================== */
(function () {
    'use strict';
    const sp = (name, level, school, classes, time, range, comp, dur, flags, desc) =>
        ({ name, level, school, classes, time, range, comp, dur,
           ritual: flags.indexOf('R') >= 0, concentration: flags.indexOf('C') >= 0, desc });

    window.DND_SPELLS = [
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
        sp('Raise Dead', 5, 'Necromancy', ['bard', 'cleric', 'paladin'], '1 hour', 'Touch', 'V,S,M', 'Instant', [], 'Return a creature dead <10 days to life.'),
        sp('Hold Monster', 5, 'Enchantment', ['bard', 'sorcerer', 'warlock', 'wizard'], '1 action', '90 ft', 'V,S,M', 'Conc. 1 min', ['C'], 'Paralyze any creature (WIS save each turn).'),
        sp('Wall of Force', 5, 'Evocation', ['wizard'], '1 action', '120 ft', 'V,S,M', 'Conc. 10 min', ['C'], 'An invisible, near-indestructible wall.'),
        sp('Scrying', 5, 'Divination', ['bard', 'cleric', 'druid', 'warlock', 'wizard'], '10 minutes', 'Self', 'V,S,M', 'Conc. 10 min', ['C'], 'Spy on a creature you choose.'),
        // Level 6
        sp('Chain Lightning', 6, 'Evocation', ['sorcerer', 'wizard'], '1 action', '150 ft', 'V,S,M', 'Instant', [], '10d8 lightning that leaps to 3 extra targets.'),
        sp('Disintegrate', 6, 'Transmutation', ['sorcerer', 'wizard'], '1 action', '60 ft', 'V,S,M', 'Instant', [], '10d6+40 force; reduces to dust if it drops to 0.'),
        sp('Heal', 6, 'Evocation', ['cleric', 'druid'], '1 action', '60 ft', 'V,S', 'Instant', [], 'Restore 70 HP and end blindness/deafness/disease.'),
        sp('Sunbeam', 6, 'Evocation', ['druid', 'sorcerer', 'wizard'], '1 action', 'Self (60 ft line)', 'V,S,M', 'Conc. 1 min', ['C'], '6d8 radiant in a line; can repeat each turn.'),
        sp('True Seeing', 6, 'Divination', ['bard', 'cleric', 'sorcerer', 'warlock', 'wizard'], '1 action', 'Touch', 'V,S,M', '1 hour', [], 'See in darkness, through illusions and invisibility.'),
        // Level 7
        sp('Finger of Death', 7, 'Necromancy', ['sorcerer', 'warlock', 'wizard'], '1 action', '60 ft', 'V,S', 'Instant', [], '7d8+30 necrotic; slain humanoids rise as zombies.'),
        sp('Fire Storm', 7, 'Evocation', ['cleric', 'druid', 'sorcerer'], '1 action', '150 ft', 'V,S', 'Instant', [], '7d10 fire across chosen cubes.'),
        sp('Teleport', 7, 'Conjuration', ['bard', 'sorcerer', 'wizard'], '1 action', '10 ft', 'V', 'Instant', [], 'Instantly travel a great distance.'),
        sp('Regenerate', 7, 'Transmutation', ['bard', 'cleric', 'druid'], '1 minute', 'Touch', 'V,S,M', '1 hour', [], 'Heal and regrow lost limbs over time.'),
        // Level 8
        sp('Sunburst', 8, 'Evocation', ['druid', 'sorcerer', 'wizard'], '1 action', '150 ft', 'V,S,M', 'Instant', [], '12d6 radiant in a 60-ft sphere; blinds.'),
        sp('Power Word Stun', 8, 'Enchantment', ['bard', 'sorcerer', 'warlock', 'wizard'], '1 action', '60 ft', 'V', 'Instant', [], 'Stun a creature with 150 HP or fewer.'),
        sp('Dominate Monster', 8, 'Enchantment', ['bard', 'sorcerer', 'warlock', 'wizard'], '1 action', '60 ft', 'V,S', 'Conc. 1 hr', ['C'], 'Control any creature (WIS save).'),
        // Level 9
        sp('Wish', 9, 'Conjuration', ['sorcerer', 'wizard'], '1 action', 'Self', 'V', 'Instant', [], 'The mightiest spell — duplicate any 8th-level spell or alter reality.'),
        sp('Meteor Swarm', 9, 'Evocation', ['sorcerer', 'wizard'], '1 action', '1 mile', 'V,S', 'Instant', [], '40d6 fire & bludgeoning across four blazing spheres.'),
        sp('Power Word Kill', 9, 'Enchantment', ['bard', 'sorcerer', 'warlock', 'wizard'], '1 action', '60 ft', 'V', 'Instant', [], 'Slay a creature with 100 HP or fewer outright.'),
        sp('True Resurrection', 9, 'Necromancy', ['cleric', 'druid'], '1 hour', 'Touch', 'V,S,M', 'Instant', [], 'Restore a creature dead up to 200 years, even without a body.'),
        sp('Time Stop', 9, 'Transmutation', ['sorcerer', 'wizard'], '1 action', 'Self', 'V', 'Instant', [], 'Take 1d4+1 turns while everyone else is frozen.'),

        // ---- Additional cantrips ----
        sp('Light', 0, 'Evocation', ['bard', 'cleric', 'sorcerer', 'wizard', 'artificer'], '1 action', 'Touch', 'V,M', '1 hour', [], 'An object sheds bright light in a 20-ft radius.'),
        sp('Dancing Lights', 0, 'Evocation', ['bard', 'sorcerer', 'wizard', 'artificer'], '1 action', '120 ft', 'V,S,M', 'Conc. 1 min', ['C'], 'Create up to four floating lights.'),
        sp('Mending', 0, 'Transmutation', ['bard', 'cleric', 'druid', 'sorcerer', 'wizard', 'artificer'], '1 minute', 'Touch', 'V,S,M', 'Instant', [], 'Repair a single break or tear in an object.'),
        sp('Message', 0, 'Transmutation', ['bard', 'sorcerer', 'wizard', 'artificer'], '1 action', '120 ft', 'V,S,M', '1 round', [], 'Whisper a message that only the target hears.'),
        sp('Poison Spray', 0, 'Conjuration', ['druid', 'sorcerer', 'warlock', 'wizard', 'artificer'], '1 action', '10 ft', 'V,S', 'Instant', [], '1d12 poison (CON save).'),
        sp('Chill Touch', 0, 'Necromancy', ['sorcerer', 'warlock', 'wizard'], '1 action', '120 ft', 'V,S', '1 round', [], '1d8 necrotic; target can’t regain HP this turn.'),
        sp('Thaumaturgy', 0, 'Transmutation', ['cleric'], '1 action', '30 ft', 'V', 'Up to 1 min', [], 'Manifest minor wonders — booming voice, tremors, flickering flames.'),
        sp('Spare the Dying', 0, 'Necromancy', ['cleric', 'artificer'], '1 action', 'Touch', 'V,S', 'Instant', [], 'Stabilize a dying creature at 0 HP.'),
        sp('Toll the Dead', 0, 'Necromancy', ['cleric', 'warlock', 'wizard'], '1 action', '60 ft', 'V,S', 'Instant', [], '1d8 (or 1d12 if hurt) necrotic (WIS save).'),
        sp('Produce Flame', 0, 'Conjuration', ['druid'], '1 action', 'Self', 'V,S', '10 minutes', [], 'A flame for light or to hurl for 1d8 fire.'),
        sp('Thorn Whip', 0, 'Transmutation', ['druid', 'artificer'], '1 action', '30 ft', 'V,S,M', 'Instant', [], '1d6 piercing and pull the target 10 ft closer.'),
        sp('True Strike', 0, 'Divination', ['bard', 'sorcerer', 'warlock', 'wizard'], '1 action', '30 ft', 'S', 'Conc. 1 round', ['C'], 'Advantage on your next attack against the target.'),
        sp('Blade Ward', 0, 'Abjuration', ['bard', 'sorcerer', 'warlock', 'wizard'], '1 action', 'Self', 'V,S', '1 round', [], 'Resistance to bludgeoning, piercing and slashing from weapons.'),

        // ---- More Level 1 ----
        sp('Feather Fall', 1, 'Transmutation', ['bard', 'sorcerer', 'wizard', 'artificer'], '1 reaction', '60 ft', 'V,M', '1 minute', [], 'Up to five falling creatures descend gently.'),
        sp('Mage Armor', 1, 'Abjuration', ['sorcerer', 'wizard'], '1 action', 'Touch', 'V,S,M', '8 hours', [], 'Base AC becomes 13 + Dex for an unarmored creature.'),
        sp('Command', 1, 'Enchantment', ['cleric', 'paladin'], '1 action', '60 ft', 'V', '1 round', [], 'Force a one-word command on a creature (WIS save).'),
        sp('Guiding Bolt', 1, 'Evocation', ['cleric'], '1 action', '120 ft', 'V,S', '1 round', [], '4d6 radiant and grant advantage on the next attack.'),
        sp('Goodberry', 1, 'Transmutation', ['druid', 'ranger'], '1 action', 'Touch', 'V,S,M', 'Instant', [], 'Create 10 berries, each healing 1 HP.'),
        sp('Entangle', 1, 'Conjuration', ['druid'], '1 action', '90 ft', 'V,S', 'Conc. 1 min', ['C'], 'Grasping weeds restrain creatures in a 20-ft square.'),
        sp('Fog Cloud', 1, 'Conjuration', ['druid', 'ranger', 'sorcerer', 'wizard'], '1 action', '120 ft', 'V,S', 'Conc. 1 hr', ['C'], 'A 20-ft sphere of heavily obscuring fog.'),
        sp('Disguise Self', 1, 'Illusion', ['bard', 'sorcerer', 'wizard', 'artificer'], '1 action', 'Self', 'V,S', '1 hour', [], 'Change your appearance until dispelled.'),
        sp('Tasha’s Hideous Laughter', 1, 'Enchantment', ['bard', 'sorcerer', 'wizard'], '1 action', '30 ft', 'V,S,M', 'Conc. 1 min', ['C'], 'A creature falls prone with laughter (WIS save).'),
        sp('Protection from Evil and Good', 1, 'Abjuration', ['cleric', 'paladin', 'warlock', 'wizard'], '1 action', 'Touch', 'V,S,M', 'Conc. 10 min', ['C'], 'Ward a creature against aberrations, fiends, undead and more.'),
        sp('Purify Food and Drink', 1, 'Transmutation', ['cleric', 'druid', 'paladin', 'artificer'], '1 action', '10 ft', 'V,S', 'Instant', ['R'], 'Remove poison and rot from food and water.'),
        sp('Longstrider', 1, 'Transmutation', ['bard', 'druid', 'ranger', 'wizard', 'artificer'], '1 action', 'Touch', 'V,S,M', '1 hour', [], 'A creature’s speed increases by 10 ft.'),

        // ---- More Level 2 ----
        sp('Darkness', 2, 'Evocation', ['sorcerer', 'warlock', 'wizard'], '1 action', '60 ft', 'V,M', 'Conc. 10 min', ['C'], 'Magical darkness fills a 15-ft radius.'),
        sp('Web', 2, 'Conjuration', ['sorcerer', 'wizard', 'artificer'], '1 action', '60 ft', 'V,S,M', 'Conc. 1 hr', ['C'], 'Sticky webs fill a 20-ft cube and restrain (DEX save).'),
        sp('Blur', 2, 'Illusion', ['sorcerer', 'wizard', 'artificer'], '1 action', 'Self', 'V', 'Conc. 1 min', ['C'], 'Attacks against you have disadvantage.'),
        sp('Mirror Image', 2, 'Illusion', ['sorcerer', 'warlock', 'wizard'], '1 action', 'Self', 'V,S', '1 minute', [], 'Three illusory duplicates confuse attackers.'),
        sp('Silence', 2, 'Illusion', ['bard', 'cleric', 'ranger'], '1 action', '120 ft', 'V,S', 'Conc. 10 min', ['C', 'R'], 'No sound can be created within a 20-ft sphere.'),
        sp('Enhance Ability', 2, 'Transmutation', ['bard', 'cleric', 'druid', 'sorcerer', 'artificer'], '1 action', 'Touch', 'V,S,M', 'Conc. 1 hr', ['C'], 'Grant advantage on checks with one ability.'),
        sp('Suggestion', 2, 'Enchantment', ['bard', 'sorcerer', 'warlock', 'wizard'], '1 action', '30 ft', 'V,M', 'Conc. 8 hr', ['C'], 'Magically suggest a reasonable course of action (WIS save).'),
        sp('Shatter', 2, 'Evocation', ['bard', 'sorcerer', 'warlock', 'wizard', 'artificer'], '1 action', '60 ft', 'V,S,M', 'Instant', [], '3d8 thunder in a 10-ft sphere (CON save).'),
        sp('Levitate', 2, 'Transmutation', ['sorcerer', 'wizard', 'artificer'], '1 action', '60 ft', 'V,S,M', 'Conc. 10 min', ['C'], 'Raise a creature or object up to 20 ft into the air.'),
        sp('See Invisibility', 2, 'Divination', ['bard', 'sorcerer', 'wizard', 'artificer'], '1 action', 'Self', 'V,S,M', '1 hour', [], 'See invisible creatures and objects.'),
        sp('Pass without Trace', 2, 'Abjuration', ['druid', 'ranger'], '1 action', 'Self', 'V,S,M', 'Conc. 1 hr', ['C'], 'You and allies gain +10 to Stealth and leave no tracks.'),
        sp('Moonbeam', 2, 'Evocation', ['druid'], '1 action', '120 ft', 'V,S,M', 'Conc. 1 min', ['C'], 'A beam of moonlight deals 2d10 radiant (CON save).'),

        // ---- More Level 3 ----
        sp('Spirit Guardians', 3, 'Conjuration', ['cleric'], '1 action', 'Self (15 ft)', 'V,S,M', 'Conc. 10 min', ['C'], 'Spectral guardians deal 3d8 and slow foes.'),
        sp('Mass Healing Word', 3, 'Evocation', ['cleric'], '1 bonus action', '60 ft', 'V', 'Instant', [], 'Heal up to six creatures 1d4 + mod.'),
        sp('Sleet Storm', 3, 'Conjuration', ['druid', 'sorcerer', 'wizard'], '1 action', '150 ft', 'V,S,M', 'Conc. 1 min', ['C'], 'Freezing rain douses flames and knocks foes prone.'),
        sp('Stinking Cloud', 3, 'Conjuration', ['bard', 'sorcerer', 'wizard'], '1 action', '90 ft', 'V,S,M', 'Conc. 1 min', ['C'], 'Nauseating gas makes creatures waste their action (CON save).'),
        sp('Hypnotic Pattern', 3, 'Illusion', ['bard', 'sorcerer', 'warlock', 'wizard'], '1 action', '120 ft', 'S,M', 'Conc. 1 min', ['C'], 'A twisting pattern charms creatures in a 30-ft cube.'),
        sp('Water Breathing', 3, 'Transmutation', ['druid', 'ranger', 'sorcerer', 'wizard', 'artificer'], '1 action', '30 ft', 'V,S,M', '24 hours', ['R'], 'Up to ten creatures can breathe underwater.'),
        sp('Bestow Curse', 3, 'Necromancy', ['bard', 'cleric', 'wizard'], '1 action', 'Touch', 'V,S', 'Conc. 1 min', ['C'], 'Afflict a touched creature with a curse (WIS save).'),
        sp('Vampiric Touch', 3, 'Necromancy', ['sorcerer', 'warlock', 'wizard'], '1 action', 'Self', 'V,S', 'Conc. 1 min', ['C'], '3d6 necrotic and heal for half.'),
        sp('Daylight', 3, 'Evocation', ['cleric', 'druid', 'paladin', 'ranger', 'sorcerer'], '1 action', '60 ft', 'V,S', '1 hour', [], 'Bright sunlight fills a 60-ft radius.'),
        sp('Tongues', 3, 'Divination', ['bard', 'cleric', 'sorcerer', 'warlock', 'wizard'], '1 action', 'Touch', 'V,M', '1 hour', [], 'A creature understands and is understood in any language.'),

        // ---- More Level 4 ----
        sp('Dimension Door', 4, 'Conjuration', ['bard', 'sorcerer', 'warlock', 'wizard'], '1 action', '500 ft', 'V', 'Instant', [], 'Teleport yourself (and one ally) up to 500 ft.'),
        sp('Banishment', 4, 'Abjuration', ['cleric', 'paladin', 'sorcerer', 'warlock', 'wizard'], '1 action', '60 ft', 'V,S,M', 'Conc. 1 min', ['C'], 'Banish a creature to another plane (CHA save).'),
        sp('Ice Storm', 4, 'Evocation', ['druid', 'sorcerer', 'wizard'], '1 action', '300 ft', 'V,S,M', 'Instant', [], '2d8 bludgeoning + 4d6 cold in a 20-ft cylinder.'),
        sp('Stoneskin', 4, 'Abjuration', ['artificer', 'druid', 'ranger', 'sorcerer', 'wizard'], '1 action', 'Touch', 'V,S,M', 'Conc. 1 hr', ['C'], 'Resistance to nonmagical bludgeoning, piercing and slashing.'),
        sp('Freedom of Movement', 4, 'Abjuration', ['bard', 'cleric', 'druid', 'ranger', 'artificer'], '1 action', 'Touch', 'V,S,M', '1 hour', [], 'Movement is unhindered by difficult terrain, restraints and more.'),
        sp('Confusion', 4, 'Enchantment', ['bard', 'druid', 'sorcerer', 'wizard'], '1 action', '90 ft', 'V,S,M', 'Conc. 1 min', ['C'], 'Assail minds in a 10-ft sphere with madness (WIS save).'),
        sp('Guardian of Faith', 4, 'Conjuration', ['cleric'], '1 action', '30 ft', 'V', '8 hours', [], 'A spectral guardian deals 20 radiant to foes that approach.'),
        sp('Blight', 4, 'Necromancy', ['druid', 'sorcerer', 'wizard'], '1 action', '30 ft', 'V,S', 'Instant', [], '8d8 necrotic; especially deadly to plants (CON save).'),

        // ---- More Level 5 ----
        sp('Greater Restoration', 5, 'Abjuration', ['bard', 'cleric', 'druid', 'artificer'], '1 action', 'Touch', 'V,S,M', 'Instant', [], 'End exhaustion, charm, petrification or a reduction effect.'),
        sp('Flame Strike', 5, 'Evocation', ['cleric'], '1 action', '60 ft', 'V,S,M', 'Instant', [], '4d6 fire + 4d6 radiant in a column (DEX save).'),
        sp('Telekinesis', 5, 'Transmutation', ['sorcerer', 'wizard'], '1 action', '60 ft', 'V,S', 'Conc. 10 min', ['C'], 'Move creatures and objects with your mind.'),
        sp('Dominate Person', 5, 'Enchantment', ['bard', 'sorcerer', 'wizard'], '1 action', '60 ft', 'V,S', 'Conc. 1 min', ['C'], 'Control a humanoid’s actions (WIS save).'),
        sp('Insect Plague', 5, 'Conjuration', ['cleric', 'druid', 'sorcerer'], '1 action', '300 ft', 'V,S,M', 'Conc. 10 min', ['C'], 'A swarm of biting locusts fills a 20-ft sphere (4d10).'),
        sp('Wall of Stone', 5, 'Evocation', ['druid', 'sorcerer', 'wizard', 'artificer'], '1 action', '120 ft', 'V,S,M', 'Conc. 10 min', ['C'], 'Shape a wall of solid stone.'),

        // ---- More Level 6 ----
        sp('Mass Suggestion', 6, 'Enchantment', ['bard', 'sorcerer', 'warlock', 'wizard'], '1 action', '60 ft', 'V,M', '24 hours', [], 'Suggest a course of action to up to twelve creatures.'),
        sp('Circle of Death', 6, 'Necromancy', ['sorcerer', 'warlock', 'wizard'], '1 action', '150 ft', 'V,S,M', 'Instant', [], '8d6 necrotic in a 60-ft sphere (CON save).'),
        sp('Wall of Ice', 6, 'Evocation', ['wizard'], '1 action', '120 ft', 'V,S,M', 'Conc. 10 min', ['C'], 'Create a wall of ice on a solid surface.'),
        sp('Contingency', 6, 'Evocation', ['wizard'], '10 minutes', 'Self', 'V,S,M', '10 days', [], 'Store a spell to trigger on a condition you set.'),

        // ---- More Level 7 ----
        sp('Plane Shift', 7, 'Conjuration', ['cleric', 'druid', 'sorcerer', 'warlock', 'wizard'], '1 action', 'Touch', 'V,S,M', 'Instant', [], 'Travel to another plane of existence.'),
        sp('Prismatic Spray', 7, 'Evocation', ['sorcerer', 'wizard'], '1 action', 'Self (60 ft cone)', 'V,S', 'Instant', [], 'Eight rays of random, deadly colours.'),
        sp('Forcecage', 7, 'Evocation', ['bard', 'warlock', 'wizard'], '1 action', '100 ft', 'V,S,M', '1 hour', [], 'An inescapable prison of force.'),
        sp('Etherealness', 7, 'Transmutation', ['bard', 'cleric', 'sorcerer', 'warlock', 'wizard'], '1 action', 'Self', 'V,S', 'Up to 8 hr', [], 'Step into the Ethereal Plane.'),

        // ---- More Level 8 ----
        sp('Feeblemind', 8, 'Enchantment', ['bard', 'druid', 'warlock', 'wizard'], '1 action', '150 ft', 'V,S,M', 'Instant', [], 'Shatter a creature’s intellect (4d6 psychic, INT to 1).'),
        sp('Maze', 8, 'Conjuration', ['wizard'], '1 action', '60 ft', 'V,S', 'Conc. 10 min', ['C'], 'Banish a creature into a labyrinthine demiplane.'),
        sp('Antimagic Field', 8, 'Abjuration', ['cleric', 'wizard'], '1 action', 'Self (10 ft)', 'V,S,M', 'Conc. 1 hr', ['C'], 'A sphere where magic simply does not work.'),

        // ---- More Level 9 ----
        sp('Mass Heal', 9, 'Evocation', ['cleric'], '1 action', '60 ft', 'V,S', 'Instant', [], 'Restore up to 700 HP divided among creatures.'),
        sp('Gate', 9, 'Conjuration', ['cleric', 'sorcerer', 'wizard'], '1 action', '60 ft', 'V,S,M', 'Conc. 1 min', ['C'], 'Open a portal to another plane and summon a being.'),
        sp('Foresight', 9, 'Divination', ['bard', 'druid', 'warlock', 'wizard'], '1 minute', 'Touch', 'V,S,M', '8 hours', [], 'A creature gains advantage on everything; foes have disadvantage vs it.')
    ];
})();
