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
      search: a plain, keyword-rich description used ONLY by the on-site search
              (never displayed) — write the real, boring explanation here so
              projects are findable without knowing the whimsical copy.
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
        search: 'An image gallery of fantasy and Harry Potter themed artwork, magical creatures, wizards and humorous memes. Browse and view a curated picture collection of magic art and cute animals.',
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
        search: 'A collection of full-screen fake operating system boot screens, fake BIOS screens and fake hacked hacker terminal screens to prank and trick friends. Windows, Linux and hacking simulator prank screens.',
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
        search: 'NATO phonetic alphabet reference and text to phonetic converter. Learn the Alpha Bravo Charlie military spelling alphabet, click letters to hear the pronunciation with audio, and it keeps the screen awake with a wake lock.',
        tags: ['reference', 'tool'],
        aura: 'cyan',
        status: 'live',
    },

    /* ---- The Workshop (WIP / playthings) ---- */
    {
        category: 'workshop',
        title: 'Enter the Workshop',
        href: './workshop/',
        glyph: '⚗️',
        tagline: 'spells brewing',
        description: 'A whole cauldron of half-finished spells — tools, toys and curiosities still being brewed. Step inside to browse the full workbench.',
        search: 'The workshop index page listing all work in progress tools, toys, utilities and experiments hosted on rami.party.',
        tags: ['wip', 'tools'],
        aura: 'pink',
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
        search: 'An interactive toy with draggable chibi cat sprites (neko). A cute cats animation playground. Archived and retired.',
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
        search: 'The previous old version of the rami.party website, built with jQuery and cat themed. Archived legacy website preserved as it was.',
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
        search: 'An empty, abandoned and dropped project folder that was never built or finished. Placeholder that never drew breath.',
        tags: ['empty'],
        aura: 'ash',
        status: 'soon',
    },
    {
        category: 'wastes',
        title: 'Bluetooth Radar',
        href: 'https://ghosttooth.labidi.eu/',
        glyph: '📡',
        tagline: 'Reborn as GhostTooth',
        description: 'The old ghost radar has left the ruins — a brand-new version now runs at ghosttooth.labidi.eu. This husk stays behind as a memento.',
        search: 'A Bluetooth surveillance and tracker detector using the Web Bluetooth API to scan for nearby Bluetooth Low Energy BLE devices, AirTags and trackers. Dropped and replaced by GhostTooth, the finished new version now running at ghosttooth.labidi.eu.',
        tags: ['tool', 'bluetooth'],
        aura: 'ash',
        status: 'live',
        external: true,
    },
    {
        category: 'wastes',
        title: 'The Little House',
        href: 'https://huiskeuring.be/',
        glyph: '🏠',
        tagline: 'Rebuilt as Huiskeuring',
        description: 'The little experimental house has moved out of the workshop — a brand-new version now lives at huiskeuring.be, offering home-inspection services. This husk stays behind as a memento.',
        search: 'A home inspection website project. Dropped and replaced by the finished version running at huiskeuring.be, a Dutch home inspection and huiskeuring service in Belgium.',
        tags: ['experiment', 'home'],
        aura: 'ash',
        status: 'live',
        external: true,
    },
    {
        category: 'wastes',
        title: 'Random First Player',
        href: 'https://tapfate.labidi.eu/',
        glyph: '🎲',
        tagline: 'Reborn as TapFate',
        description: 'The fate roller graduated from the workshop — the finished version now runs in production as TapFate at tapfate.labidi.eu. This husk stays behind as a memento.',
        search: 'A random first player picker and turn order randomizer for board games and tabletop games, with team modes and colour-blind friendly options. Graduated and reimplemented in production as TapFate at tapfate.labidi.eu. Decide who goes first.',
        tags: ['toy', 'games'],
        aura: 'ash',
        status: 'live',
        external: true,
    },
    {
        category: 'wastes',
        title: 'Notes & Todo',
        href: './wasteland/notes/',
        glyph: '🗒️',
        tagline: 'Reborn as Daybook',
        description: 'The original plain notes-and-todo scratchpad. Its cleaner, faster descendant now lives in the workshop as Daybook — this first draft rests here in the ruins.',
        search: 'The original simple notes and todo list page with autosaving notes, a checklist, dark mode and a new day reset. Archived and replaced by the cleaner Daybook version in the workshop.',
        tags: ['tool', 'legacy'],
        aura: 'ash',
        status: 'live',
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
        title: 'Loregate',
        href: './dm-screen/',
        glyph: '🐉',
        tagline: 'Dual-screen DM table',
        description: 'A Dungeon Master\u2019s command table for tabletop RPGs — build battlemaps with painted terrain, props and pre-made locations, move tokens, sculpt fog of war, run initiative and the big bad, all mirrored live onto a second screen for your players.',
        search: 'A Dungeon Master screen and virtual tabletop for Dungeons and Dragons and other tabletop RPGs. Two screens: a DM control page and a separate player map page for an external monitor or TV. Build multiple saved locations, paint realistic terrain (grass, stone, water, lava, snow) cell by cell, place and drag props and items like chests doors traps torches and mimics, choose which items and creatures are visible to players, move player and monster tokens on a battlemap grid, paint fog of war and dynamic light to reveal the map, track hit points armour class conditions and initiative turn order, resize the big bad boss, keep a bestiary and a party inventory, roll dice, use pre-generated maps (tavern, fields, cavern, traps and treasure, mimic hall), a party HP sidebar for players, weather and animation effects, and export or import the whole campaign. Live synced between both screens, runs locally in the browser.',
        tags: ['app', 'ttrpg'],
        aura: 'gold',
        status: 'live',
    },
    {
        title: 'Daybook',
        href: './todo/',
        glyph: '🗒️',
        tagline: 'Notes &amp; tasks, saved',
        description: 'A calm, offline notes-and-to-do companion — jot the day down, tick tasks off, then start a fresh page each morning. Everything autosaves to your browser.',
        search: 'A clean minimal notes and todo list app. Write notes and manage a checklist of tasks that autosave to localStorage in the browser, with dark mode, timestamps, a new day reset that archives yesterday and keeps unfinished tasks. A leaner rewrite of the old notes and todo page.',
        tags: ['tool', 'productivity'],
        aura: 'violet',
        status: 'live',
    },
    {
        title: 'Echo',
        href: './batlistener/',
        glyph: '🦇',
        tagline: 'Bat-sound listener',
        description: 'Point your microphone at the night and Echo watches the top of the audible band for bat-like clicks and chirps — capturing calls, replaying them aloud, or letting you study the waveforms in silence.',
        search: 'A bat sound detector and listener that uses the device microphone and the Web Audio API to watch for high-frequency ultrasonic bat calls, clicks and chirps. Shows a live spectrogram, captures and records detected calls, plays them out loud, and lets you view the soundwaves and waveforms without playing the sound. Runs locally in the browser.',
        tags: ['audio', 'tool'],
        aura: 'cyan',
        status: 'live',
    },
    {
        title: 'Isekai Forge',
        href: './character-forge/',
        glyph: '🎲',
        tagline: 'Roll a whole hero',
        description: 'A one-tap character and background roller for other-world stories — how they got dragged in, who they used to be, the power they woke up with and the world that caught them. Reroll one line or shuffle an entire destiny.',
        search: 'A random character generator and creator for isekai and reincarnation stories. Shuffles and randomizes a background and character: how they were transported or isekaid, their past life, the being they were reborn as, the ability or power they gained, and the world they landed in. Reroll each part individually or shuffle everything at once.',
        tags: ['toy', 'generator'],
        aura: 'pink',
        status: 'live',
    },
    {
        title: 'Demoscene Generator',
        href: './demoscene-forge/',
        glyph: '🌈',
        tagline: 'Conjure video & music',
        description: 'A retro-futuristic forge for short demoscene visuals and chiptune music — shapes, plasma, kaleidoscopes and a WebAudio synth, exportable to video & audio.',
        search: 'A browser based demoscene video and music generator. Create animated visuals with shapes, plasma, kaleidoscope, glow, scanlines and CRT effects plus a chiptune music synthesizer, then export to video and audio. Built with Canvas, WebAudio and MediaRecorder.',
        tags: ['demoscene', 'canvas', 'audio'],
        aura: 'violet',
        status: 'live',
    },
    {
        title: '3D Forge',
        href: './3d-forge/',
        glyph: '🧊',
        tagline: 'Text & pics → 3D prints',
        description: 'Turn text, emoji, shapes, QR codes and photos into watertight, 3D-printable models — export as STL, 3MF, OBJ, PLY or AMF.',
        search: 'A 3D model generator that converts text, emoji, shapes, QR codes and photos into watertight 3D printable models and meshes, exportable as STL, 3MF, OBJ, PLY and AMF files for 3D printing.',
        tags: ['tool', '3d'],
        aura: 'cyan',
        status: 'live',
    },
    {
        title: 'Webcheck',
        href: './webcheck/',
        glyph: '🔍',
        tagline: 'Website audit oracle',
        description: 'Scry any site for robots.txt, sitemaps, security.txt, favicons and meta-runes — then reveal what is missing.',
        search: 'A website audit and SEO checker tool. Scans a website for robots.txt, sitemap.xml, security.txt, favicons and meta tags and reports what is present or missing.',
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
        search: 'An email header analyzer and parser. Decode raw email headers to trace the delivery path and hops and diagnose spam or email delivery problems.',
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
        search: 'An IP subnet calculator for IPv4 networks. Compute subnet masks, CIDR ranges, network and broadcast addresses and host counts, with a subnetting reference table.',
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
        search: 'A DNS blocklist manager for ad blocking and tracker blocking with regex allowlist and blocklist support. Pi-hole style domain blocking and sinkhole.',
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
        search: 'A live event registration and leaderboard scoreboard application with an admin gamemaster control panel for tournaments, competitions and games.',
        tags: ['app', 'games'],
        aura: 'gold',
        status: 'live',
    },
    {
        title: 'Engraving Gallery',
        href: './Engraving/',
        glyph: '⚙️',
        tagline: 'The etching bench',
        description: 'A searchable gallery of laser-engraving designs, ready to preview and download as PNG or SVG.',
        search: 'A searchable gallery of laser engraving designs and templates, previewable and downloadable as PNG or SVG image files.',
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
        search: 'A business website and storefront for a laser cutting and engraving workshop, with hero section and services. Work in progress company site.',
        tags: ['site', 'laser'],
        aura: 'cyan',
        status: 'live',
    },
    {
        title: 'Laser Forge',
        href: './laser-forge/',
        glyph: '📐',
        tagline: 'Design → machine files',
        description: 'Turn text, images, emoji and QR codes into machine-ready laser files, exportable as DXF, SVG and more.',
        search: 'A laser engraver and laser cutter design tool that generates machine ready files like DXF and SVG from text, images, emoji and QR codes.',
        tags: ['tool', 'laser'],
        aura: 'gold',
        status: 'live',
    },
    {
        title: 'Laser Forge · Direct Control',
        href: './laser-forge-v2/',
        glyph: '🎛️',
        tagline: 'Drive the laser live',
        description: 'The Laser Forge, upgraded with Web Serial — design and export machine-ready files, or drive a connected laser engraver directly from the browser.',
        search: 'An enhanced laser engraver design tool with Web Serial direct machine control. Design and export machine ready laser files (DXF, SVG) and control a connected laser engraver directly from the browser.',
        tags: ['tool', 'laser'],
        aura: 'cyan',
        status: 'live',
    },
    {
        title: 'Window View',
        href: './dashboard_v1/',
        glyph: '🪟',
        tagline: 'A shelf with a view',
        description: 'A decorative shelf-and-bracket dashboard component — an early cut of a personal cockpit.',
        search: 'An early dashboard user interface component: a decorative shelf and bracket widget, a prototype of a personal dashboard cockpit and homepage.',
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
        search: 'An aggregator of IT learning resources, courses, trainings and tech news, filterable by topic. A technology learning feed and reading list.',
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
        search: 'A collection of harmless browser pranks for unlocked computers: flip the screen upside down, swap the mouse buttons and other gentle office jokes.',
        tags: ['prank', 'fun'],
        aura: 'pink',
        status: 'live',
    },
    {
        title: 'Disk Filler',
        href: './fill/',
        glyph: '🗄️',
        tagline: 'A harmless storage prank',
        description: 'A gentle troll that stuffs the browser’s localStorage with cat pictures — fully reversible with a single click.',
        search: 'A harmless prank tool that fills up the browser localStorage and disk space with cat images as a joke, fully reversible with a stop button to clear it.',
        tags: ['prank', 'fun'],
        aura: 'gold',
        status: 'live',
    },
    {
        title: 'BBQ Mailer',
        href: './bbq/',
        glyph: '🍖',
        tagline: 'Tax the unlocked',
        description: 'Left a computer unlocked? A cheeky Dutch mailer fires off a funny “I forgot to lock my PC” confession — the classic office BBQ tax.',
        search: 'A prank email tool in Dutch for unlocked computers. When someone leaves their computer unlocked, send a funny joke confession email that they forgot to lock their PC, with random prank messages. The office BBQ punishment tradition.',
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
        search: 'A Markdown editor with live side by side HTML preview, powered by Showdown. Write, edit and preview markdown text.',
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
        search: 'A gallery of fake system update and installing updates full screen screens, like a Windows update prank, to freeze a screen as a harmless joke.',
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
        search: 'A tool to redact, censor and blur sensitive text and pixels in images and screenshots before sharing. Hide private or confidential information.',
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
        search: 'A one-click tool to clear the browser cache, cookies and lingering browsing traces for privacy and cleanup.',
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
        search: 'A Chart.js dashboard that visualizes email traffic volume over time with graphs. Email statistics and analytics charts.',
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
        search: 'A searchable table of interesting GitHub tools and open source projects to try and evaluate later. A software bookmarks and wishlist list.',
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
        search: 'A personal scratch and sandbox page with small utilities, handy links and experiments.',
        tags: ['personal', 'wip'],
        aura: 'violet',
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
    { name: 'D&D', note: 'A Dungeons & Dragons companion — folder claimed, spell not yet cast.' },
    { name: 'DISC Profile', note: 'A “Surrounded by Idiots” DISC personality colour quiz.' },
];

/* ==========================================================================
   Auto-count — keep the Workshop realm’s tagline in sync with the number of
   live projects in RAMI_WORKSHOP. Add a project above and the count updates
   itself; nothing else to touch.
   ========================================================================== */
(function () {
    var count = window.RAMI_WORKSHOP.length;
    var workshop = window.RAMI_REALMS.find(function (r) {
        return r.category === 'workshop' && r.href === './workshop/';
    });
    if (workshop) {
        workshop.tagline = count + ' spell' + (count === 1 ? '' : 's') + ' brewing';
    }
})();
