/* ==========================================================================
   The vocabulary
   --------------------------------------------------------------------------
   Every word the page filters and labels with. Nothing here is a catalogue
   entry: the entries live in ../data/, one file per shelf and subject.
   ========================================================================== */

window.OST = {

    /* When the links and dates in ../data/ were last verified. */
    checked: '9 August 2026',

    /* The three kinds of thing on the bench. */
    shelves: [
        { id: 'tool', glyph: '🧰', label: 'Tools', one: 'tool', many: 'tools' },
        { id: 'read', glyph: '📚', label: 'Reading', one: 'thing to read', many: 'things to read' },
        { id: 'event', glyph: '📅', label: 'Events', one: 'event', many: 'events' },
    ],

    /* The one list that spans all three shelves. Order decides the rail. */
    subjects: [
        { id: 'security', glyph: '🔒', label: 'Security' },
        { id: 'incident', glyph: '🚨', label: 'Incident response' },
        { id: 'osint', glyph: '🔍', label: 'OSINT & forensics' },
        { id: 'search', glyph: '🔎', label: 'Search engines' },
        { id: 'network', glyph: '🔌', label: 'Network' },
        { id: 'system', glyph: '⚙️', label: 'System & Windows' },
        { id: 'microsoft', glyph: '🔷', label: 'Microsoft & cloud' },
        { id: 'development', glyph: '💻', label: 'Development' },
        { id: 'opensource', glyph: '🐧', label: 'Open source & Linux' },
        { id: 'selfhost', glyph: '🏠', label: 'Self-host & hosting' },
        { id: 'learning', glyph: '📚', label: 'Learning' },
        { id: 'practice', glyph: '🚩', label: 'Labs & CTF' },
        { id: 'feeds', glyph: '📺', label: 'Podcasts, video & news' },
        { id: 'community', glyph: '💬', label: 'Communities' },
        { id: 'belgium', glyph: '🇧🇪', label: 'Belgium & EU' },
        { id: 'creative', glyph: '🎨', label: 'Media & creative' },
        { id: 'productivity', glyph: '🗂️', label: 'Office & notes' },
        { id: 'ai', glyph: '✨', label: 'AI assistants' },
        { id: 'browser', glyph: '🌍', label: 'Browsers & extensions' },
    ],

    /* How a tool runs. */
    types: [
        { id: 'online', glyph: '🌐', label: 'Online, no install' },
        { id: 'hybrid', glyph: '🔄', label: 'Online + app' },
        { id: 'download', glyph: '💾', label: 'Download' },
        { id: 'extension', glyph: '🧩', label: 'Browser extension' },
    ],

    /* What a resource asks of you before it is useful. */
    access: [
        { id: 'open', glyph: '🌐', label: 'Open to all' },
        { id: 'account', glyph: '🔐', label: 'Account needed' },
    ],

    /* What kind of event it is. */
    kinds: [
        { id: 'conference', glyph: '🎤', label: 'Conferences' },
        { id: 'camp', glyph: '⛺', label: 'Hacker camps' },
        { id: 'contest', glyph: '🚩', label: 'CTF contests' },
        { id: 'expo', glyph: '🏢', label: 'Trade fairs' },
        { id: 'training', glyph: '🎓', label: 'Trainings' },
        { id: 'meetup', glyph: '💬', label: 'Meetups' },
    ],

    /* Where an event happens. 'online' stands in for "anywhere". */
    countries: [
        { cc: 'be', name: 'Belgium', flag: '🇧🇪' },
        { cc: 'nl', name: 'Netherlands', flag: '🇳🇱' },
        { cc: 'lu', name: 'Luxembourg', flag: '🇱🇺' },
        { cc: 'fr', name: 'France', flag: '🇫🇷' },
        { cc: 'de', name: 'Germany', flag: '🇩🇪' },
        { cc: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
        { cc: 'ie', name: 'Ireland', flag: '🇮🇪' },
        { cc: 'ch', name: 'Switzerland', flag: '🇨🇭' },
        { cc: 'at', name: 'Austria', flag: '🇦🇹' },
        { cc: 'dk', name: 'Denmark', flag: '🇩🇰' },
        { cc: 'se', name: 'Sweden', flag: '🇸🇪' },
        { cc: 'fi', name: 'Finland', flag: '🇫🇮' },
        { cc: 'it', name: 'Italy', flag: '🇮🇹' },
        { cc: 'es', name: 'Spain', flag: '🇪🇸' },
        { cc: 'pt', name: 'Portugal', flag: '🇵🇹' },
        { cc: 'pl', name: 'Poland', flag: '🇵🇱' },
        { cc: 'hu', name: 'Hungary', flag: '🇭🇺' },
        { cc: 'ro', name: 'Romania', flag: '🇷🇴' },
        { cc: 'online', name: 'Online', flag: '🌐' },
    ],

    /* Shortcuts offered above the country list. */
    regions: [
        { id: 'be', label: '🇧🇪 Belgium only', ccs: ['be'] },
        { id: 'benelux', label: 'Benelux', ccs: ['be', 'nl', 'lu'] },
        { id: 'near', label: 'Belgium and its neighbours', ccs: ['be', 'nl', 'lu', 'fr', 'de', 'uk'] },
        { id: 'online', label: '🌐 Online only', ccs: ['online'] },
    ],

    costs: {
        free: { glyph: '💚', label: 'Free' },
        freemium: { glyph: '💎', label: 'Free tier' },
        trial: { glyph: '⏳', label: 'Trial' },
        paid: { glyph: '💳', label: 'Paid' },
    },

    cadences: {
        annual: 'every year',
        biennial: 'every two years',
        quadrennial: 'every four years',
        multi: 'several times a year',
        rolling: 'all year round',
    },

    sorts: [
        { id: 'best', label: 'Grouped by subject' },
        { id: 'name', label: 'Name, A to Z' },
        { id: 'name-desc', label: 'Name, Z to A' },
    ],

    /* Offered on the events shelf only. */
    sortSoonest: { id: 'soonest', label: 'Soonest first' },
};
