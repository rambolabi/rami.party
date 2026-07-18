/* ==========================================================================
   rami.party — Realm registry
   --------------------------------------------------------------------------
   The single source of truth for every realm shown on the hub.

   • RAMI_GROUPS  → the three great realms (categories), rendered in order.
   • RAMI_REALMS  → individual portals. Set `category` to a group id.

   ➕ To add a project: append one object to RAMI_REALMS. Order within a group
      = ranking (top of the array shows first). Nothing else to touch.
      status: 'live' (clickable) · 'soon' (locked teaser)
      external: true opens in a new tab and shows an ↗ marker.
   ========================================================================== */

window.RAMI_GROUPS = [
    {
        id: 'gallery',
        emoji: '🏛️',
        title: 'The Gallery of Wonders',
        blurb: 'Finished realms, polished and ready to explore.',
    },
    {
        id: 'workshop',
        emoji: '⚗️',
        title: 'The Workshop',
        blurb: 'Spells still being brewed — works in progress & playthings.',
    },
    {
        id: 'wastes',
        emoji: '☄️',
        title: 'The Wastelands',
        blurb: 'Fallen, forgotten and abandoned experiments. Enter the ruins.',
    },
];

window.RAMI_REALMS = [
    /* ---- The Gallery of Wonders (finished) ---- */
    {
        category: 'gallery',
        title: 'Lore Gallery',
        href: './gallery/lore/',
        glyph: '📜',
        tagline: 'A grimoire of images',
        description: 'Leaf through a living grimoire of magical lore, muggle mischief and impossibly cute creatures.',
        tags: ['gallery', 'magic'],
        aura: 'violet',
        status: 'live',
    },
    {
        category: 'gallery',
        title: 'Prank Screens',
        href: './gallery/prankscreens/',
        glyph: '🖥️',
        tagline: 'Full-screen illusions',
        description: 'Conjure convincing fake boot screens, BIOS spells and “hacked” terminals to bewitch your friends.',
        tags: ['prank', 'fullscreen'],
        aura: 'cyan',
        status: 'live',
    },
    {
        category: 'gallery',
        title: 'Phonetic Codex',
        href: './gallery/militaryalphabet/',
        glyph: '🔤',
        tagline: 'Alpha, Bravo, Charlie…',
        description: 'A terminal-styled NATO phonetic alphabet reference and live text-to-phonetic translator — tap any letter to hear it, and it keeps your screen awake while you learn.',
        tags: ['reference', 'tool'],
        aura: 'cyan',
        status: 'live',
    },
    {
        category: 'gallery',
        title: 'The BBQ',
        href: 'https://lebon.info/bbq',
        glyph: '🔥',
        tagline: 'A feast of flames',
        description: 'Gather round the coals — a crackling little BBQ companion living over on lebon.info.',
        tags: ['tool', 'food'],
        aura: 'gold',
        status: 'live',
        external: true,
    },

    /* ---- The Workshop (WIP / playthings) ---- */
    {
        category: 'workshop',
        title: 'Enter the Workshop',
        href: './workshop/',
        glyph: '⚗️',
        tagline: '20 spells brewing',
        description: 'A whole cauldron of half-finished spells — tools, toys and curiosities still being brewed. Step inside to browse the full workbench.',
        tags: ['wip', 'tools'],
        aura: 'pink',
        status: 'live',
    },
    {
        category: 'workshop',
        title: 'Demoscene Generator',
        href: './workshop/video-generator/',
        glyph: '🌈',
        tagline: 'Conjure video & music',
        description: 'A retro-futuristic forge for short demoscene visuals and chiptune music — shapes, plasma, kaleidoscopes and a WebAudio synth, exportable to video & audio.',
        tags: ['demoscene', 'canvas', 'audio'],
        aura: 'violet',
        status: 'live',
    },

    /* ---- The Wastelands (archived / fallen) ---- */
    {
        category: 'wastes',
        title: 'Neko Paradise',
        href: './wasteland/neko/',
        glyph: '🐱',
        tagline: 'A clowder of sprites',
        description: 'A mischievous clowder of chibi neko familiars — retired to the ruins, but still purring.',
        tags: ['toy', 'cats'],
        aura: 'ash',
        status: 'live',
    },
    {
        category: 'wastes',
        title: 'Old rami.party',
        href: './wasteland/old-rami.party/',
        glyph: '🏚️',
        tagline: 'The jQuery era',
        description: 'The previous incarnation of this domain — a paws-and-cats relic, preserved as it was found.',
        tags: ['legacy', 'jquery'],
        aura: 'ash',
        status: 'live',
    },
    {
        category: 'wastes',
        title: 'ADHD experiment',
        href: '#',
        glyph: '🌀',
        tagline: 'Never drew breath',
        description: 'An empty husk — a project that was conjured but never filled. A reminder that not every spell takes.',
        tags: ['empty'],
        aura: 'ash',
        status: 'soon',
    },
];

/* ==========================================================================
   The Workshop catalogue
   --------------------------------------------------------------------------
   Rendered on /workshop/ (see workshop/index.html). These are the works in
   progress — each lives in its own folder under /workshop/<name>/.

   ➕ To add a workshop project: drop its folder in /workshop/ and append an
      object here. Order within the array = ranking (top shows first).
      status: 'live' (clickable) · 'soon' (locked teaser).
   ========================================================================== */
window.RAMI_WORKSHOP = [
    {
        title: 'Webcheck',
        href: './webcheck/',
        glyph: '🔍',
        tagline: 'Website audit oracle',
        description: 'Scry any site for robots.txt, sitemaps, security.txt, favicons and meta-runes — then reveal what is missing.',
        tags: ['tool', 'seo'],
        aura: 'cyan',
        status: 'live',
    },
    {
        title: 'Mail Headers',
        href: './mailheaders/',
        glyph: '✉️',
        tagline: 'Header diviner',
        description: 'Decode the tangled runes of email headers to trace a message’s journey and unmask delivery curses.',
        tags: ['tool', 'email'],
        aura: 'violet',
        status: 'live',
    },
    {
        title: 'Subnet Calculator',
        href: './subnets/',
        glyph: '🧮',
        tagline: 'Network cartographer',
        description: 'Carve IP space into tidy subnets with an interactive calculator and a grand reference table.',
        tags: ['tool', 'network'],
        aura: 'gold',
        status: 'live',
    },
    {
        title: 'DNS Sinkhole',
        href: './DNS-sinkhole/',
        glyph: '🕳️',
        tagline: 'The void gate',
        description: 'Curated blocklists with regex black- and white-listing to banish unwanted domains into the abyss.',
        tags: ['tool', 'network'],
        aura: 'pink',
        status: 'live',
    },
    {
        title: 'Scoreboard',
        href: './scoreboard/',
        glyph: '🏆',
        tagline: 'Arena of champions',
        description: 'A live registration and leaderboard system with a gamemaster’s control room for events and tournaments.',
        tags: ['app', 'games'],
        aura: 'gold',
        status: 'live',
    },
    {
        title: 'Random First Player',
        href: './random-first-player/',
        glyph: '🎲',
        tagline: 'The fate roller',
        description: 'Let the dice-spirits decide who goes first, with team modes and colour-blind-friendly picks.',
        tags: ['toy', 'games'],
        aura: 'violet',
        status: 'live',
    },
    {
        title: 'Bluetooth Radar',
        href: './bluetooth/',
        glyph: '📡',
        tagline: 'Ghost radar',
        description: 'Sniff the airwaves for nearby Bluetooth familiars and trackers using the Web Bluetooth API.',
        tags: ['tool', 'bluetooth'],
        aura: 'cyan',
        status: 'live',
    },
    {
        title: 'Engraving Gallery',
        href: './Engraving/',
        glyph: '⚙️',
        tagline: 'The etching bench',
        description: 'A searchable gallery of laser-engraving designs, ready to preview and download as PNG or SVG.',
        tags: ['gallery', 'laser'],
        aura: 'gold',
        status: 'live',
    },
    {
        title: 'Laser Works',
        href: './laser/',
        glyph: '🔦',
        tagline: 'Precision atelier',
        description: 'A full storefront for a laser-cutting workshop — hero, services and all — still finding its words.',
        tags: ['site', 'laser'],
        aura: 'cyan',
        status: 'live',
    },
    {
        title: 'Window View',
        href: './dashboard_v1/',
        glyph: '🪟',
        tagline: 'A shelf with a view',
        description: 'A decorative shelf-and-bracket dashboard component — an early cut of a personal cockpit.',
        tags: ['ui', 'wip'],
        aura: 'violet',
        status: 'live',
    },
    {
        title: 'IT News Scroll',
        href: './news/',
        glyph: '📰',
        tagline: 'The daily scroll',
        description: 'A curated aggregator of IT learning quests, trainings and resources, filterable by whim.',
        tags: ['app', 'learning'],
        aura: 'pink',
        status: 'live',
    },
    {
        title: 'Mischief Kit',
        href: './prank/',
        glyph: '🃏',
        tagline: 'For unlocked machines',
        description: 'A grimoire of harmless pranks — screen flips, mouse swaps and other gentle chaos.',
        tags: ['prank', 'fun'],
        aura: 'pink',
        status: 'live',
    },
    {
        title: 'Markdown Scribe',
        href: './md/',
        glyph: '📝',
        tagline: 'Rune scribe',
        description: 'A split-view Markdown editor with live preview, powered by showdown.',
        tags: ['tool', 'text'],
        aura: 'violet',
        status: 'live',
    },
    {
        title: 'Fake Update',
        href: './fakeupdate/',
        glyph: '💾',
        tagline: 'The frozen screen',
        description: 'A gallery of convincing fake system-update screens for a classic, harmless prank.',
        tags: ['prank', 'fullscreen'],
        aura: 'gold',
        status: 'live',
    },
    {
        title: 'Document Censor',
        href: './blur/',
        glyph: '🫥',
        tagline: 'Hide the secrets',
        description: 'Mask sensitive text and pixels before you share a screenshot with the world.',
        tags: ['tool', 'privacy'],
        aura: 'violet',
        status: 'live',
    },
    {
        title: 'Privacy Broom',
        href: './clear/',
        glyph: '🧹',
        tagline: 'Sweep your traces',
        description: 'A one-click sweep for browser caches and lingering traces.',
        tags: ['tool', 'privacy'],
        aura: 'cyan',
        status: 'live',
    },
    {
        title: 'Volume Seer',
        href: './trace-results/',
        glyph: '📊',
        tagline: 'Charts of the flow',
        description: 'A Chart.js dashboard visualising email traffic over time.',
        tags: ['tool', 'data'],
        aura: 'pink',
        status: 'live',
    },
    {
        title: 'Wishlist Scroll',
        href: './to-check/',
        glyph: '🔖',
        tagline: 'Tools to explore',
        description: 'A searchable table of intriguing GitHub tools waiting to be tried and tested.',
        tags: ['links', 'reference'],
        aura: 'gold',
        status: 'live',
    },
    {
        title: 'Tinkerer’s Desk',
        href: './rami/',
        glyph: '🧑‍🔬',
        tagline: 'A scratch page',
        description: 'A personal scratch page with handy little utilities and links.',
        tags: ['personal', 'wip'],
        aura: 'violet',
        status: 'live',
    },
    {
        title: 'The Little House',
        href: './house/',
        glyph: '🏠',
        tagline: 'A tiny build',
        description: 'A small experimental house build — freshly unpacked from the archives.',
        tags: ['experiment', 'wip'],
        aura: 'gold',
        status: 'live',
    },
];

/* ==========================================================================
   Planned projects — the hidden fourth realm.
   Names of spells not yet begun. Shown as a chip-list on /workshop/.
   Move a name up into RAMI_WORKSHOP once its folder exists and has content.
   ========================================================================== */
window.RAMI_PLANNED = [
    { name: 'Screen Fill', note: 'Fill the screen with solid colours to hunt dead pixels.' },
];
