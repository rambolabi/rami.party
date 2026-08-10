/* ==========================================================================
   Tools: Office and notes
   Everything on the tools shelf whose home subject is office and notes.
   Add an entry by appending one object below. Nothing else to touch.
   ========================================================================== */

OST.add('tool', [
    {
        id: 'clockify',
        name: 'Clockify',
        subs: ['productivity'],
        type: 'hybrid', cost: 'freemium',
        gdpr: true,
        desc: 'Time tracking software for teams and freelancers with reporting and project management. Available as web app and desktop/mobile apps.',
        links: [
            { t: 'Official Site', u: 'https://clockify.me/', g: '🌐' },
            { t: 'Web App', u: 'https://app.clockify.me/', g: '🔗' },
            { t: 'Download Apps', u: 'https://clockify.me/apps', g: '⬇️' },
        ],
        tags: 'time tracking timesheet hours',
    },
    {
        id: 'obsidian',
        name: 'Obsidian',
        subs: ['productivity'],
        type: 'download', cost: 'freemium',
        desc: 'Markdown knowledge base on top of a local folder of plain-text files, with backlinks, graph view and a huge plugin ecosystem. Free for personal use; sync is optional and paid.',
        links: [
            { t: 'Official Site', u: 'https://obsidian.md/', g: '🌐' },
            { t: 'Download', u: 'https://obsidian.md/download', g: '⬇️' },
        ],
        tags: 'notes markdown knowledge base second brain vault',
    },
    {
        id: 'discord',
        name: 'Discord',
        subs: ['productivity'],
        type: 'hybrid', cost: 'freemium',
        gdpr: true,
        desc: 'Voice, video, and text communication platform for communities and teams. Available as web app and desktop/mobile apps.',
        links: [
            { t: 'Official Site', u: 'https://discord.com/', g: '🌐' },
            { t: 'Web App', u: 'https://discord.com/app', g: '🔗' },
            { t: 'Download Apps', u: 'https://discord.com/download', g: '⬇️' },
        ],
        tags: 'chat voice community server',
    },
    {
        id: 'notes',
        name: 'Notes',
        subs: ['productivity'],
        type: 'online', cost: 'free',
        local: true,
        desc: 'Local storage notes and todo list manager.',
        links: [
            { t: 'Open Tool', u: 'https://note.labidi.eu', g: '🔗' },
        ],
        tags: 'notes todo list localstorage labidi',
    },
]);
