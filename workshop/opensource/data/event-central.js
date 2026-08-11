/* ==========================================================================
   Events in central Europe
   Conferences, camps, contests and meetups held in central Europe.
   Add an entry by appending one object below. Nothing else to touch.
   ========================================================================== */

OST.add('event', [
    {
        id: 'confidence',
        name: 'CONFidence',
        kind: 'conference', cc: 'pl', place: 'Kraków',
        subs: ['security'],
        when: 'May', cadence: 'annual', cost: 'paid',
        next: '24 and 25 May 2027', nextIso: '2027-05-24',
        desc: 'Long-running Central European conference with offence, defence, future tech and executive tracks, plus villages.',
        links: [{ t: 'Main site', u: 'https://confidence-conference.org/', g: '🌐' }],
        tags: 'confidence krakow cracow poland central europe tracks villages may',
    },
    {
        id: 'x33fcon',
        name: 'x33fcon',
        kind: 'conference', cc: 'pl', place: 'Gdynia',
        subs: ['security', 'learning'],
        when: 'June', cadence: 'annual', cost: 'paid',
        held: '11 and 12 June 2026',
        desc: 'Purple team conference where red and blue speakers are deliberately programmed against each other. Hybrid and streamed.',
        links: [{ t: 'Main site', u: 'https://x33fcon.com/', g: '🌐' }],
        tags: 'x33fcon gdynia poland red team blue purple hybrid streamed june training',
    },
    {
        id: 'ohmyhack',
        name: 'Oh My H@ck',
        kind: 'conference', cc: 'pl', place: 'Warsaw',
        subs: ['security'],
        when: 'December', cadence: 'annual', cost: 'paid',
        next: '2 December 2026', nextIso: '2026-12-02',
        desc: 'Polish-language conference at the national stadium, curated by the team behind Zaufana Trzecia Strona.',
        links: [{ t: 'Main site', u: 'https://omhconf.pl/', g: '🌐' }],
        tags: 'oh my hack warsaw poland pge narodowy zaufana trzecia strona polish december',
    },
    {
        id: 'hacktivity',
        name: 'Hacktivity',
        kind: 'conference', cc: 'hu', place: 'Budapest',
        subs: ['security'],
        when: 'October', cadence: 'annual', cost: 'freemium',
        next: '21 October 2026', nextIso: '2026-10-21',
        desc: 'The longest-running Central and Eastern European IT security festival, with a free expo area next to the paid conference.',
        links: [{ t: 'Main site', u: 'https://hacktivity.com/', g: '🌐' }],
        tags: 'hacktivity budapest hungary festival expo free area workshops october',
    },
    {
        id: 'defcamp',
        name: 'DefCamp',
        kind: 'conference', cc: 'ro', place: 'Bucharest',
        subs: ['security', 'practice'],
        when: 'November', cadence: 'annual', cost: 'paid',
        next: '19 and 20 November 2026', nextIso: '2026-11-19',
        desc: 'The largest security conference in Central and Eastern Europe, with a Hacking Village of hands-on competitions.',
        links: [{ t: 'Main site', u: 'https://def.camp/', g: '🌐' }],
        tags: 'defcamp bucharest romania hacking village d-ctf palace parliament november',
    },
]);
