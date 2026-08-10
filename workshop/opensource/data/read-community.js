/* ==========================================================================
   Reading: Communities
   Everything on the reading shelf whose home subject is communities.
   Add an entry by appending one object below. Nothing else to touch.
   ========================================================================== */

OST.add('read', [
    {
        id: 'r-netsec',
        name: 'r/netsec',
        subs: ['security', 'community'],
        access: 'open', cost: 'free',
        desc: 'Moderated technical security subreddit. The rules keep out the noise, so the front page is usually worth reading.',
        links: [
            { t: 'r/netsec', u: 'https://www.reddit.com/r/netsec/', g: '💬' },
            { t: 'r/blueteamsec', u: 'https://www.reddit.com/r/blueteamsec/', g: '🛡️' },
        ],
        tags: 'reddit netsec blueteamsec community technical discussion moderated',
    },
    {
        id: 'r-sysadmin',
        name: 'r/sysadmin',
        subs: ['community'],
        access: 'open', cost: 'free',
        desc: 'Where the rest of IT finds out a vendor update broke production, roughly two hours before the vendor says so.',
        links: [{ t: 'r/sysadmin', u: 'https://www.reddit.com/r/sysadmin/', g: '💬' }],
        tags: 'reddit sysadmin operations outage patch broken update peers',
    },
    {
        id: 'security-se',
        name: 'Information Security Stack Exchange',
        subs: ['learning', 'community'],
        access: 'open', cost: 'free',
        desc: 'Question and answer site where the accepted answers on cryptography and authentication are usually the best short explanation anywhere.',
        links: [{ t: 'Main site', u: 'https://security.stackexchange.com/', g: '💬' }],
        tags: 'stack exchange question answer crypto authentication canonical explanation',
    },
    {
        id: 'defcon-groups',
        name: 'DEF CON Groups',
        subs: ['community'],
        access: 'open', cost: 'free',
        desc: 'The official directory of DEF CON chapters, listing the region, contact and meeting habit of each one.',
        links: [{ t: 'Find a group', u: 'https://defcongroups.org/', g: '💬' }],
        tags: 'defcon dc groups local chapter meetup monthly community worldwide directory',
    },
    {
        id: 'owasp-be',
        name: 'OWASP Belgium chapter',
        subs: ['community', 'belgium'],
        access: 'open', cost: 'free',
        desc: 'The Belgian OWASP chapter: free to join, vendor neutral, and the easiest way into the local application security community.',
        links: [{ t: 'Chapter page', u: 'https://owasp.org/www-chapter-belgium/', g: '💬' }],
        tags: 'owasp belgium chapter meeting appsec free evening leuven brussels',
    },
    {
        id: 'infosec-exchange',
        name: 'infosec.exchange',
        subs: ['community'],
        access: 'account', cost: 'free',
        desc: 'The Mastodon instance where a large part of the security research community landed, and stayed.',
        links: [{ t: 'Main site', u: 'https://infosec.exchange/', g: '💬' }],
        tags: 'infosec.exchange mastodon fediverse researcher community jerry bell social',
    },
    {
        id: 'isaca-belgium',
        name: 'ISACA Belgium chapter',
        subs: ['community', 'belgium'],
        access: 'open', cost: 'freemium',
        desc: 'Audit, governance and risk community in Belgium, running evening sessions and certification study groups.',
        links: [{ t: 'Chapter page', u: 'https://engage.isaca.org/belgiumchapter/home', g: '💬' }],
        tags: 'isaca belgium chapter audit governance risk cisa cism crisc study group brussels',
    },
]);
