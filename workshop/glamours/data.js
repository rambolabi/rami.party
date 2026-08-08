/* ==========================================================================
   Glamours — the spell registry
   --------------------------------------------------------------------------
   One object per glamour. The page renders everything from this array, so
   adding a new site-restyling spell is:

     1. Drop the .user.js (and optionally .user.css) file in this folder.
     2. Append one object here. Done — cards, code viewers, install buttons
        and the bookmarklet are generated.

   Fields:
     id        — folder-unique slug, used for anchors (#cw-manage-eu)
     title     — display name of the glamour
     site      — the hostname it enchants (shown as a badge)
     siteName  — human name of the target application
     glyph     — an emoji for the card
     kinds     — ['userscript'] and/or ['usercss']: which files exist
     files     — { userscript: '...', usercss: '...' } relative file names
     summary   — one-line pitch shown under the title
     what      — bullet list: what it does, feature by feature
     how       — bullet list: how it works under the hood
     why       — a short paragraph: why this is nice / what problem it solves
     caveats   — bullet list of honest limitations (optional)
     bookmarklet — true → build a one-click bookmarklet from the usercss
                   (the rules between the bookmarklet:start/end markers)
   ========================================================================== */

window.GLAMOURS = [
    {
        id: 'cw-manage-eu',
        title: 'ConnectWise Manage · Comfort Pack',
        site: 'eu.myconnectwise.net',
        siteName: 'ConnectWise Manage (EU)',
        glyph: '🎫',
        kinds: ['userscript', 'usercss'],
        files: {
            userscript: 'cw-manage-eu.user.js',
            usercss: 'cw-manage-eu.user.css'
        },
        summary: 'ConnectWise Manage ships one theme, tiny scrollbars and a login form that fights your password manager. This glamour fixes all three — every tweak is a toggle.',
        what: [
            'Midnight veil — a proper dark mode for an app that has none (off by default, Alt+Shift+D).',
            'Comfy scrollbars — thick, high-contrast scrollbars in every pane; Manage is scroll-heavy and the stock thumbs are nearly invisible.',
            'Row hover highlight — a soft tint follows your pointer through wide ticket and time-entry grids so you never read the wrong line.',
            'Keyboard focus rings — a clear outline on whatever has focus, for tabbing through forms.',
            'Login helper — restores password-manager autofill (Manage sets autocomplete="off" on every field), focuses the first empty field and warns when Caps Lock is on.',
            'Text zoom — 80% to 130% in 5% steps, because “density: take it or leave it” is not a setting.',
            'A tiny ✨ panel (bottom-right, Alt+Shift+G) where each tweak can be switched off. Settings persist per browser.'
        ],
        how: [
            'Almost everything is injected CSS. Manage’s internal class names are obfuscated and change between releases, so the selectors are deliberately generic (scrollbar pseudo-elements, tr:hover, :focus-visible) — version-proof by design.',
            'Manage hosts its modules in same-origin iframes. The script runs in every frame: comfort CSS mounts per frame, while the dark filter (invert + hue-rotate on <html>) applies only in the top document — a parent filter already composites over iframe content, and inverting twice would flip it back.',
            'Images, video and canvas get a counter-invert in every frame, so logos and photos stay natural in dark mode.',
            'The login helper rewrites autocomplete="off" to real tokens (organization / username / current-password) on the #company, #username and #password fields, and a MutationObserver waits for ConnectWise’s own init() to reveal the form before focusing it.',
            'Settings are one JSON blob in localStorage; frames listen to the storage event, so a toggle in the panel restyles every pane live — and other open Manage tabs follow along.',
            'No external requests, no analytics, no data leaves the page. @grant none — the script asks for zero special privileges.'
        ],
        why: 'You stare at a PSA for eight hours a day; the least it can do is be comfortable. ConnectWise Manage offers no dark theme, no density options and no way to restyle it server-side — but it is still just a website, and your browser has the final word on how websites look. This pack is the “make it bearable” starter: nothing changes functionally, tickets and time entries behave exactly the same, it is just easier on the eyes at 17:30.',
        caveats: [
            'The dark veil is an optical trick (colour inversion), not a designed theme — screenshots taken while it is on will look inverted to everyone else, and the odd colour-coded status may read differently. That is why it ships off by default.',
            'Generic selectors mean the row highlight also tints layout tables ConnectWise builds its login page with — harmless, but you may spot it.',
            'Tested against the login page of eu.myconnectwise.net (2026-08). Inside the app the tweaks are intentionally generic; if a future Manage release breaks one, every tweak has an off switch.'
        ],
        bookmarklet: true
    }
];
