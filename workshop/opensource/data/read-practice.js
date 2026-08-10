/* ==========================================================================
   Reading: Labs and CTF
   Everything on the reading shelf whose home subject is labs and ctf.
   Add an entry by appending one object below. Nothing else to touch.
   ========================================================================== */

OST.add('read', [
    {
        id: 'ctftime',
        name: 'CTFtime',
        subs: ['practice'],
        access: 'open', cost: 'free',
        desc: 'The calendar and ranking system the CTF scene actually runs on. Start here to find a competition this weekend.',
        links: [
            { t: 'Main site', u: 'https://ctftime.org/', g: '🌐' },
            { t: 'Upcoming events', u: 'https://ctftime.org/event/list/upcoming', g: '📅' },
        ],
        tags: 'ctftime calendar ranking team jeopardy attack defense weekend',
    },
    {
        id: 'pwn-college',
        name: 'pwn.college',
        subs: ['learning', 'practice'],
        access: 'account', cost: 'free',
        desc: 'Arizona State\u2019s free binary exploitation curriculum with hundreds of graded challenges. Brutal and excellent.',
        links: [{ t: 'Main site', u: 'https://pwn.college/', g: '🚩' }],
        tags: 'pwn.college asu binary exploitation pwn kernel assembly dojo free curriculum',
    },
    {
        id: 'cryptohack',
        name: 'CryptoHack',
        subs: ['learning', 'practice'],
        access: 'account', cost: 'free',
        desc: 'Learn cryptography by breaking it: hundreds of challenges from XOR up to elliptic curves and lattices.',
        links: [{ t: 'Main site', u: 'https://cryptohack.org/', g: '🔐' }],
        tags: 'cryptohack cryptography rsa aes elliptic curve lattice challenge python free',
    },
    {
        id: 'microcorruption',
        name: 'Microcorruption',
        subs: ['learning', 'practice'],
        access: 'account', cost: 'free',
        desc: 'An embedded security CTF in the browser: debug a lock\u2019s MSP430 firmware and talk your way past it.',
        links: [{ t: 'Main site', u: 'https://microcorruption.com/', g: '🔒' }],
        tags: 'microcorruption embedded msp430 assembly debugger lock ctf browser matasano free',
    },
    {
        id: 'crackmes',
        name: 'crackmes.one',
        subs: ['learning', 'practice'],
        access: 'account', cost: 'free',
        desc: 'A community archive of small reverse engineering puzzles, graded by difficulty and platform.',
        links: [{ t: 'Main site', u: 'https://crackmes.one/', g: '🔧' }],
        tags: 'crackmes reverse engineering keygen difficulty archive community binary practice',
    },
    {
        id: 'killercoda',
        name: 'Killercoda',
        subs: ['learning', 'practice'],
        access: 'open', cost: 'free',
        desc: 'Free browser terminals with real Kubernetes, Linux and Docker environments, and the scenarios to go with them.',
        links: [{ t: 'Main site', u: 'https://killercoda.com/', g: '🧪' }],
        tags: 'killercoda katacoda kubernetes linux docker browser terminal scenario free sandbox',
    },
    {
        id: 'play-with-docker',
        name: 'Play with Docker',
        subs: ['learning', 'practice'],
        access: 'account', cost: 'free',
        desc: 'A throwaway Docker host in the browser for four hours. Perfect for trying a container image you do not trust locally.',
        links: [{ t: 'Main site', u: 'https://labs.play-with-docker.com/', g: '🐳' }],
        tags: 'play with docker pwd throwaway container sandbox browser four hours free swarm',
    },
    {
        id: 'security-onion',
        name: 'Security Onion',
        subs: ['incident', 'practice'],
        access: 'open', cost: 'free',
        desc: 'A free monitoring distribution bundling Suricata, Zeek, Elastic and case management. The classic home SOC lab.',
        links: [{ t: 'Main site', u: 'https://securityonionsolutions.com/', g: '🧅' }],
        tags: 'security onion suricata zeek elastic nsm home lab soc distribution free',
    },
]);
