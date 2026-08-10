/* ==========================================================================
   Events in the Nordics
   Conferences, camps, contests and meetups held in the Nordics.
   Add an entry by appending one object below. Nothing else to touch.
   ========================================================================== */

OST.add('event', [
    {
        id: 'bornhack',
        name: 'BornHack',
        kind: 'camp', cc: 'dk', place: 'Funen, Denmark',
        subs: ['security'],
        when: 'July or August', cadence: 'annual', cost: 'paid',
        held: '15 to 22 July 2026',
        desc: 'Eight days of outdoor hacker camp on a Danish island, volunteer run, and the only annual camp of its kind in the Nordics.',
        links: [{ t: 'Main site', u: 'https://bornhack.dk/', g: '🌐' }],
        tags: 'bornhack denmark funen fyn hylkedamvej eight days tent village camp annual',
    },
    {
        id: 'sec-t',
        name: 'SEC-T',
        kind: 'conference', cc: 'se', place: 'Stockholm',
        subs: ['security'],
        when: 'September', cadence: 'annual', cost: 'freemium',
        next: '9 to 11 September 2026', nextIso: '2026-09-09',
        desc: 'Research-driven Swedish conference with a strict no-sales-pitch rule, preceded by a free community day.',
        links: [{ t: 'Main site', u: 'https://www.sec-t.org/', g: '🌐' }],
        tags: 'sec-t stockholm sweden 0x0 community day free workshops research september',
    },
    {
        id: 'security-fest',
        name: 'Security Fest',
        kind: 'conference', cc: 'se', place: 'Gothenburg',
        subs: ['security'],
        when: 'Late May or June', cadence: 'annual', cost: 'paid',
        held: '28 and 29 May 2026',
        desc: 'Two day Swedish security conference with international speakers and a deliberately festival-shaped social programme.',
        links: [{ t: 'Main site', u: 'https://securityfest.com/', g: '🌐' }],
        tags: 'security fest gothenburg goteborg sweden elite park avenue two day may',
    },
    {
        id: 'disobey',
        name: 'Disobey',
        kind: 'conference', cc: 'fi', place: 'Helsinki',
        subs: ['security'],
        when: 'February', cadence: 'annual', cost: 'paid',
        next: '19 and 20 February 2027', nextIso: '2027-02-19',
        held: '13 and 14 February 2026',
        desc: 'The Nordic hacker conference at Kaapelitehdas: talks, an elaborate electronic badge, villages and competitions.',
        links: [{ t: 'Main site', u: 'https://disobey.fi/', g: '🌐' }],
        tags: 'disobey helsinki finland kaapelitehdas badge villages nordic february anniversary',
    },
    {
        id: 'helsec',
        name: 'HelSec',
        kind: 'meetup', cc: 'fi', place: 'Helsinki',
        subs: ['security', 'community'],
        when: 'Year round', cadence: 'multi', cost: 'free',
        desc: 'Finnish association running open security meetups, workshops and streams, free to attend and welcoming to newcomers.',
        links: [{ t: 'Main site', u: 'https://helsec.fi/', g: '🌐' }],
        tags: 'helsec helsinki finland meetup association twitch workshop free community',
    },
]);
