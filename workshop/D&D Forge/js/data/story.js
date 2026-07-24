/* =====================================================================
 * D&D Forge — Backstory Weaver tables, name generator, portraits
 * Exposes window.DND_STORY, window.DND_NAMES, window.DND_PORTRAITS.
 * Each story part: { label, icon, options[] } — add lines freely; every
 * part becomes a rerollable 🎲 line in the Backstory Weaver and feeds the
 * "Weave into backstory" writer and the Surprise-me generator.
 * ===================================================================== */
window.DND_STORY = {
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
            'I collect trinkets and can’t help but pocket the shiny ones.',
            'I flirt shamelessly with anyone even remotely dangerous.',
            'I keep meticulous notes on everyone I meet — allies and marks alike.',
            'I’m endlessly optimistic, even when the dungeon is clearly collapsing.',
            'I have to be the smartest person in the room, and I’ll prove it.',
            'I treat every meal like it might be my last — and eat accordingly.',
            'I can’t abide a bully, and I have the scars to show for it.',
            'I befriend the villain before I fight them; it’s only polite.',
            'I narrate dramatic moments under my breath as they happen.'
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
            'Justice. The guilty must answer for their crimes.',
            'Chaos. The world is more interesting when the rules are on fire.',
            'Loyalty. I will follow my companions into the abyss and back.',
            'Curiosity. Every locked door is a personal invitation.',
            'Coin. Everything has a price, and I intend to be paid.',
            'Balance. Neither light nor dark should ever rule alone.',
            'Legacy. I will leave a mark the ages cannot erase.'
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
            'A mentor’s unfinished work is now mine to complete.',
            'My weapon was my father’s; I will never let it fall into the mud.',
            'A childhood friend vanished, and I have never stopped searching.',
            'The party is the only family I have ever truly had.',
            'I swore an oath to a dying stranger, and I mean to keep it.',
            'One town remembers me as a hero, and I refuse to disappoint them.',
            'My god speaks to me, and I would rather die than fail them.'
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
            'I speak my mind, even when silence would serve far better.',
            'I cannot walk past a gambling table without sitting down.',
            'I hold grudges the way misers hold gold.',
            'I’d rather improvise a plan than admit I don’t have one.',
            'I trust my gut over any evidence — and my gut is often wrong.',
            'I can’t keep a secret to save my life (sometimes literally).',
            'I assume any problem can be solved by hitting it harder.',
            'I’m convinced the rules simply don’t apply to me.',
            'I freeze when someone I love is in danger.'
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
            'hardened in a mercenary company since childhood',
            'brought up backstage in a traveling circus of misfits',
            'schooled in a grand academy they were expelled from',
            'raised on a smuggler’s ship that never made port twice',
            'born in a prison and freed only by a jailbreak',
            'fostered by a kindly witch at the edge of a haunted wood',
            'the youngest of thirteen, and forgotten by most of them'
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
            'to atone for one terrible mistake',
            'to become rich enough that no one can ever command them again',
            'to slay the monster that took everything from them',
            'to earn a legend that outlives their mortal years',
            'to find a cure for a curse that runs in their blood',
            'to simply survive one more day — and maybe find joy in it',
            'to bring a scattered family back together'
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
            'lost everything in a single night of fire and ruin',
            'cheated death on an operating table — or an altar',
            'took the blame for a crime to save someone they loved',
            'heard a prophecy and has been running from it ever since',
            'won a duel they had absolutely no business winning',
            'walked out of a place no one is supposed to walk out of',
            'made a single choice that split their life into before and after'
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
            'they buried a crime that could unravel everything',
            'they can’t actually read, and have bluffed it for years',
            'their famous deed was really someone else’s doing',
            'they’re secretly terrified of the very thing they hunt',
            'a piece of them was traded away and they want it back',
            'they’ve already met their own death — and made a deal',
            'the bounty on their head is larger than the party’s treasury'
        ]
    },
    quirk: {
        label: 'A telling quirk', icon: '🤪', options: [
            'insists on naming every weapon — and mourning it when it breaks',
            'narrates their own heroics in the third person',
            'refuses to enter a tavern without ordering the house special',
            'keeps a running tally of every debt anyone owes them',
            'sleeps with one eye open and a dagger even closer',
            'collects a small souvenir from every fallen foe',
            'distrusts anything they can’t befriend, bribe, or set on fire',
            'talks to their pet as if it gives excellent advice (it might)',
            'always haggles, even over a cup of water in a desert',
            'cannot resist finishing other people’s sentences — badly',
            'insists on lighting a candle for luck before every fight',
            'keeps a diary written entirely in a code only they know',
            'compulsively tidies a room before ransacking it',
            'refers to every stranger by an affectionate made-up nickname',
            'won’t make a decision without flipping a very old coin'
        ]
    },
    prized: {
        label: 'Their prized possession', icon: '🎁', options: [
            'a cracked pocket-watch that no longer ticks',
            'a wolf-tooth necklace from their very first hunt',
            'a love letter that was never sent',
            'a hand-drawn map to a place that may not exist',
            'a tarnished medal for a battle they’d rather forget',
            'a child’s wooden toy, worn smooth by worry',
            'a single playing card that always turns up when it shouldn’t',
            'a locket holding a portrait of someone they’ve never met',
            'a flask that somehow refills itself when no one is looking',
            'a ring two sizes too big, meant for a hand now gone',
            'a feather that never gets wet, dirty, or bent',
            'a bundle of letters tied with a faded ribbon'
        ]
    },
    style: {
        label: 'How they fight', icon: '⚔️', options: [
            'reckless and loud — all fury, no plan',
            'patient, waiting for the one perfect opening',
            'dirty tricks and sand in the eyes, whatever wins',
            'always positioning to shield an ally first',
            'a flashy duelist who plays to the crowd',
            'coldly efficient — no wasted motion, no mercy',
            'chatty, taunting foes until they make a mistake',
            'defensive to a fault, daring enemies to tire themselves out',
            'improvises with whatever’s lying around the room',
            'strikes once, decisively, then vanishes',
            'protective of the weak and merciless to the cruel',
            'terrifyingly calm, humming a tune the whole time'
        ]
    },
    companion: {
        label: 'A constant companion', icon: '🐾', options: [
            'a scruffy dog that adopted them and never left',
            'a raven that mutters half-formed words',
            'a mule with a far worse attitude than its owner',
            'a house cat utterly convinced it is a dragon',
            'an imaginary friend they insist is entirely real',
            'a battered spellbook that occasionally argues back',
            'a former enemy who owes them a life-debt',
            'no one — they travel alone, and prefer it that way',
            'a tiny lizard that lives in their pocket and judges everyone',
            'the ghost of a mentor only they can see',
            'a wind-up mechanical songbird that’s seen better days',
            'a goat. Just… a goat. Don’t ask.'
        ]
    },
    reputation: {
        label: 'What people whisper', icon: '📣', options: [
            'rumored to have cheated death at least once already',
            'known in three towns for a tab they never paid',
            'whispered to be the lost heir of somewhere important',
            'famous for a tavern brawl that levelled a barn',
            'said to be luckier than any mortal has a right to be',
            'blamed for a disaster they had almost nothing to do with',
            'quietly credited with a rescue they’ll never admit to',
            'believed to be cursed — and half convinced of it themselves',
            'the subject of a bard’s song that gets the facts hilariously wrong',
            'wanted in two kingdoms for reasons that don’t quite add up'
        ]
    }
};

// Fantasy name generator parts (syllable-based first + surnames)
window.DND_NAMES = {
    a: ['Ael', 'Bran', 'Cor', 'Dra', 'El', 'Fen', 'Gor', 'Hal', 'Il', 'Jor', 'Kael', 'Lyr', 'Mor', 'Nym', 'Ory', 'Per', 'Quen', 'Rho', 'Syl', 'Thal', 'Ulr', 'Vex', 'Wyn', 'Xan', 'Yor', 'Zeph', 'Aer', 'Bel', 'Cael', 'Dun', 'Ser', 'Mae', 'Ash', 'Bry', 'Cael', 'Dorn', 'Eir', 'Fael', 'Gwen', 'Hesh', 'Ith', 'Kor', 'Lys', 'Mira', 'Níl', 'Oberon', 'Ravi', 'Skar', 'Tam', 'Var'],
    b: ['an', 'ara', 'oth', 'wyn', 'iel', 'dor', 'eth', 'is', 'ora', 'us', 'yn', 'ric', 'ael', 'ir', 'on', 'ana', 'wen', 'ax', 'ea', 'mar', 'ith', 'iel', 'ius', 'wick', 'lyn', 'dris', 'ove', 'ash', 'enn', 'oor'],
    sur: ['Brightwood', 'Stormcrow', 'Ashford', 'Nightbreeze', 'Ironheart', 'Fairwind', 'Blackthorn', 'Silvervein', 'Ravensong', 'Emberfell', 'Duskwalker', 'Thornfield', 'Oakenshield', 'Frostmantle', 'Grimward', 'Hollowbrook', 'Windrider', 'Shadowmere', 'Goldmane', 'Stoneforge', 'Wintermoot', 'Cinderfall', 'Larkspur', 'Ravengard', 'Moonwhisper', 'Bramblefoot', 'Copperkettle', 'Hearthglow', 'Stormvale', 'Dawnbringer', 'Underbough', 'Quickfingers', 'Ironquill', 'Saltmarsh', 'Wyrmsbane']
};

window.DND_PORTRAITS = ['🧝', '🧙', '🧛', '🧚', '🧜', '🐉', '⚔️', '🛡️', '🏹', '🗡️', '👑', '🔮', '🐺', '🦉', '🔥', '❄️', '☠️', '😈', '😇', '🥷', '🧟', '🧌', '🐲', '🦇', '🌙', '⭐', '🍄', '🗿', '🎭', '🧞'];
