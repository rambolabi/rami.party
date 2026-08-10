/* ==========================================================================
   Events in Switzerland
   Conferences, camps, contests and meetups held in Switzerland.
   Add an entry by appending one object below. Nothing else to touch.
   ========================================================================== */

OST.add('event', [
    {
        id: 'insomnihack',
        name: 'Insomni\u2019hack',
        kind: 'conference', cc: 'ch', place: 'Lausanne',
        subs: ['security', 'practice'],
        when: 'February or March', cadence: 'annual', cost: 'paid',
        next: '1 to 5 February 2027', nextIso: '2027-02-01',
        held: '19 and 20 March 2026',
        desc: 'Swiss conference at the EPFL convention centre, best known for the huge overnight on-site CTF that closes it.',
        links: [{ t: 'Main site', u: 'https://insomnihack.ch/', g: '🌐' }],
        tags: 'insomnihack lausanne epfl swisstech orange cyberdefense overnight ctf switzerland',
    },
    {
        id: 'black-alps',
        name: 'Black Alps',
        kind: 'conference', cc: 'ch', place: 'Yverdon-les-Bains',
        subs: ['security', 'practice'],
        when: 'November', cadence: 'annual', cost: 'paid',
        next: '5 and 6 November 2026', nextIso: '2026-11-05',
        desc: 'Swiss security conference with technical talks and a free ethical hacking contest running alongside.',
        links: [{ t: 'Main site', u: 'https://www.blackalps.ch/', g: '🌐' }],
        tags: 'black alps yverdon la marive switzerland november ctf free contest technical',
    },
    {
        id: 'swiss-cyber-storm',
        name: 'Swiss Cyber Storm',
        kind: 'conference', cc: 'ch', place: 'Bern',
        subs: ['security'],
        when: 'October', cadence: 'annual', cost: 'paid',
        next: '20 October 2026', nextIso: '2026-10-20',
        desc: 'One day international conference at the Kursaal Bern, and the organisation behind Switzerland\u2019s ECSC team selection.',
        links: [{ t: 'Main site', u: 'https://www.swisscyberstorm.com/', g: '🌐' }],
        tags: 'swiss cyber storm bern kursaal shadow it ecsc switzerland october one day',
    },
    {
        id: 'area41',
        name: 'Area41',
        kind: 'conference', cc: 'ch', place: 'Dübendorf, near Zurich',
        subs: ['security'],
        when: 'June', cadence: 'biennial', cost: 'paid',
        held: '18 and 19 June 2026',
        desc: 'Technical conference by the Swiss DEF CON group, deliberately capped at six hundred attendees. Held every two years.',
        links: [{ t: 'Main site', u: 'https://area41.io/', g: '🌐' }],
        tags: 'area41 defcon switzerland dc4131 zurich dubendorf thehall biennial 600 people',
    },
    {
        id: 'cosin',
        name: 'Chaos Singularity',
        kind: 'conference', cc: 'ch', place: 'Biel/Bienne',
        subs: ['security', 'opensource'],
        when: 'June', cadence: 'annual', cost: 'paid',
        held: '12 to 14 June 2026',
        desc: 'The small Swiss Chaos congress, run jointly by the country\u2019s hackspaces, with talks, workshops and a demoshow.',
        links: [{ t: 'Main site', u: 'https://cosin.ch/', g: '🌐' }],
        tags: 'cosin chaos singularity biel bienne switzerland hackspace demoshow small congress',
    },
]);
