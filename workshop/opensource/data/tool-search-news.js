/* ==========================================================================
   Search engines: news, alerts and the developer indexes
   What is being said right now, what changed while you were away, and the
   registries and references you query all day without calling them search.
   Add an entry by appending one object below. Nothing else to touch.
   ========================================================================== */

OST.add('tool', [
    /* ---- News and watching for change ---- */
    {
        id: 'google-news',
        name: 'Google News',
        subs: ['search', 'feeds'],
        type: 'online', cost: 'free',
        desc: 'News search with a real archive behind it, and a date filter that goes back far enough to reconstruct when a story actually broke.',
        links: [{ t: 'Google News', u: 'https://news.google.com/', g: '📰' }],
        tags: 'google news search archive date filter story coverage headline outlet engine',
    },
    {
        id: 'google-alerts',
        name: 'Google Alerts',
        subs: ['search', 'feeds'],
        type: 'online', cost: 'free',
        desc: 'A saved search that mails you when something new matches. The lazy way to monitor your own company name, your domains or a vendor you depend on.',
        links: [{ t: 'Google Alerts', u: 'https://www.google.com/alerts', g: '🔔' }],
        tags: 'google alerts monitoring saved search notification brand domain mention rss email',
    },
    {
        id: 'google-trends',
        name: 'Google Trends',
        subs: ['search', 'osint'],
        type: 'online', cost: 'free',
        desc: 'Searches the searching: relative interest in a term over time and by region. Good for dating an event and for spotting a campaign.',
        links: [{ t: 'Google Trends', u: 'https://trends.google.com/', g: '📈' }],
        tags: 'google trends interest over time region compare term seasonality spike osint',
    },
    {
        id: 'dataset-search',
        name: 'Google Dataset Search',
        subs: ['search', 'learning'],
        type: 'online', cost: 'free',
        desc: 'Finds published datasets rather than pages about them, across governments, universities and open data portals.',
        links: [{ t: 'Dataset Search', u: 'https://datasetsearch.research.google.com/', g: '📊' }],
        tags: 'google dataset search open data csv research repository government statistics engine',
    },

    /* ---- Developer references ---- */
    {
        id: 'stack-overflow',
        name: 'Stack Overflow',
        subs: ['search', 'development'],
        type: 'online', cost: 'free',
        desc: 'Still the index of solved problems. Its own search takes operators, and sorting an old question by votes beats reading the accepted answer.',
        links: [{ t: 'Stack Overflow', u: 'https://stackoverflow.com/', g: '💬' }],
        tags: 'stack overflow question answer error message code problem votes tag search',
    },
    {
        id: 'devdocs',
        name: 'DevDocs',
        subs: ['search', 'development'],
        type: 'hybrid', cost: 'free',
        desc: 'The documentation of hundreds of languages and libraries in one instant, keyboard-driven search, and it works offline once loaded.',
        links: [
            { t: 'DevDocs', u: 'https://devdocs.io/', g: '📖' },
            { t: 'GitHub', u: 'https://github.com/freeCodeCamp/devdocs', g: '📦' },
        ],
        tags: 'devdocs documentation api reference offline instant search language library keyboard',
    },
    {
        id: 'package-registries',
        name: 'Package registry search',
        subs: ['search', 'development'],
        type: 'online', cost: 'free',
        desc: 'One door per ecosystem. Check what a dependency actually is, who publishes it, when it last moved and whether the name is a typo of a real one.',
        links: [
            { t: 'npm', u: 'https://www.npmjs.com/', g: '📦' },
            { t: 'PyPI', u: 'https://pypi.org/', g: '📦' },
            { t: 'Maven Central', u: 'https://central.sonatype.com/', g: '📦' },
            { t: 'NuGet', u: 'https://www.nuget.org/', g: '📦' },
            { t: 'crates.io', u: 'https://crates.io/', g: '📦' },
            { t: 'pkg.go.dev', u: 'https://pkg.go.dev/', g: '📦' },
            { t: 'Packagist', u: 'https://packagist.org/', g: '📦' },
            { t: 'RubyGems', u: 'https://rubygems.org/', g: '📦' },
            { t: 'Docker Hub', u: 'https://hub.docker.com/', g: '📦' },
        ],
        tags: 'npm pypi maven nuget crates go packagist rubygems docker registry dependency typosquat search',
    },

    /* ---- What is this thing made of ---- */
    {
        id: 'builtwith',
        name: 'BuiltWith',
        subs: ['osint', 'search'],
        type: 'online', cost: 'freemium',
        desc: 'Reports the stack behind a site and, more usefully, lists every other site sharing the same analytics or advert id.',
        links: [{ t: 'BuiltWith', u: 'https://builtwith.com/', g: '🔍' }],
        tags: 'builtwith technology profile stack analytics id relationship cms hosting fingerprint osint',
    },
    {
        id: 'alternativeto',
        name: 'AlternativeTo',
        subs: ['search', 'productivity'],
        type: 'online', cost: 'free',
        desc: 'Crowd-ranked replacements for any piece of software, filterable to free, open source or self-hosted. The fastest answer to "what else does this".',
        links: [{ t: 'AlternativeTo', u: 'https://alternativeto.net/', g: '🔄' }],
        tags: 'alternativeto alternative replacement software open source self hosted free comparison search',
    },
    {
        id: 'alienvault-otx',
        name: 'AlienVault OTX',
        subs: ['incident', 'search'],
        type: 'online', cost: 'free',
        desc: 'An open threat exchange you can query by indicator: pulses from other analysts, with the context of who reported it and when.',
        links: [{ t: 'Open Threat Exchange', u: 'https://otx.alienvault.com/', g: '🔎' }],
        tags: 'alienvault otx open threat exchange pulse indicator ioc hash domain community search',
    },
]);
