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
        summary: 'ConnectWise Manage ships one theme, truncates every grid cell, throws status-note popups in your way and fights your password manager. This glamour fixes all four — every tweak is a toggle.',
        what: [
            'Four dark themes — Midnight (neutral), Obsidian (deep black), Slate (cool blue-grey) and Ember (warm amber) — for an app that ships none. Off by default; Alt+Shift+D flips between your theme and the original.',
            'Ticket preview — hover any grid row and a small card shows that row in full: the ticket number and summary as a heading, then every column Manage clipped with an ellipsis. Choose where it appears: floating next to the pointer, or in the page just under the row.',
            'Pick your columns — the panel lists the columns of the grid you last hovered (Date Entered, Entered By, Updated By, Service Board, whatever your view has) and each one can be switched off. Switch the whole column list off and the notes on, and the card shows nothing but the ticket text.',
            'Ticket content — optionally folds the note Manage itself loads on hover into the same card: how many notes came back, who wrote the last one, the note text, and up to three of the screenshots pasted into it. One popup instead of two overlapping ones.',
            'Stale ticket highlight — rows nobody has touched for N days (5 by default) get tinted red, amber or violet with a coloured bar down the side, so a board full of forgotten tickets shows itself at a glance.',
            'Change change change — set Type to “Change” on a ticket and Subtype and Item are set to “Change” for you, because they always were going to be.',
            'Auto-close status notes — the “Status Note for …” popup that blocks a ticket on some companies gets its Close button pressed for you. Off by default, and it never ticks “Don’t show this message again”, because that setting is server-side and affects everyone.',
            'Login helper — restores password-manager autofill (Manage sets autocomplete="off" on every field), focuses the first empty field and warns when Caps Lock is on.',
            'Login auto-fill — remembers your company ID, username and SSO e-mail, and overrides whatever wrong address your browser decided to remember. Optional auto-LOGIN presses the button for you and carries straight through the ConnectWise sign-in page, single sign-on included. The password itself is never stored.',
            'Text size 80–130% — real text scaling, not page zoom: the glyphs grow while buttons, icons, toolbars and column widths stay exactly where they are.',
            'A tiny ✨ panel (bottom-right, Alt+Shift+G) where each tweak can be switched off. Settings persist per browser.'
        ],
        how: [
            'Manage is a GWT application: every class name is compiler-generated and changes between releases, so nothing here selects one. The few stable hooks it does expose (srboard-grid, cw-ml-row, cw-ml-header, cw-gxt-wnd) are matched loosely by substring, and everything else is generic DOM semantics.',
            'Columns are paired to cells by horizontal position, not by counting. Manage draws the header strip as a sibling div rather than a <thead>, and the rows carry a leading checkbox column plus trailing filler cells, so index arithmetic lands one column off; matching each header’s centre against the cell rectangles underneath it does not.',
            'That header lookup is also the guard that keeps the card off the rest of the app: no resolvable header strip, no preview. Manage builds pods, toolbars and page furniture out of tables too, and none of those have one. Hovering 61 pod rows produced zero popups in testing.',
            'The card is built from the row you are already looking at: no request, no navigation, nothing to undo. It waits 280 ms so it never flickers while you sweep the mouse, is pointer-events:none so it can never swallow a click, and vanishes on scroll, click or keypress. Manage recycles grid rows while you scroll and fills their cells a beat later, so the card rebuilds itself twice more and keeps whichever version knows the most columns.',
            'Ticket content is adopted, not fetched. Manage loads the latest note into a tooltip of its own on hover; the watch starts the moment the pointer lands on the row rather than when the card appears, and a MutationObserver hands the note over on the same tick it renders — about 30 ms, instead of waiting out a poll. Candidates are filtered by what they are not (no form controls, no grid, at most a few links), the one carrying a note timestamp wins, and the original tooltip is hidden so there is only one popup. Leaving the row puts it back.',
            'Images come across as fresh <img> elements with the source copied over — never markup — capped at three, sized down, and with the spacer and shadow graphics GXT scatters through its tooltips filtered out by size.',
            'The stale highlight reuses the same column matching: it finds the Last Update header, resolves that column’s index once per grid, parses the date out of each row and tags the old ones with an attribute that a generated stylesheet colours. Because the themes rotate hue rather than just inverting, red still reads as red once a dark theme is on.',
            'Change/Change/Change drives the real fields: Manage marks them with readable classes (cw_type, cw_subType, cw_item) inside tr.pod-element-row, with the label text as a fallback. The value is written through the native input setter and followed by a full type-and-leave event sequence, because GXT combo boxes shadow the value property and only notice a proper one.',
            'Status-note auto-close matches Manage’s own dialog class, checks the title for “Status Note” and clicks the one control whose label is exactly “Close” — a plain <div> in Manage, so the press is sent as mousedown/mouseup/click for GWT’s event dispatcher. Checkboxes are excluded by name, each dialog is handled once, and a slow sweep runs alongside the MutationObserver because Manage re-shows an existing dialog without mutating anything.',
            'Text scaling tags every element once with its ORIGINAL font size and generates a tiny stylesheet mapping each distinct original size to the scaled one. Changing the percentage rewrites a handful of rules instead of re-walking the DOM, re-applying never compounds, and because only font-size changes, layout boxes keep their dimensions.',
            'Auto-LOGIN treats an invisible password box as satisfied, which is what single sign-on produces — Manage swaps the field for “Single Sign On is enabled”, so waiting for a password would wait forever. On auth.connectwise.com it fills the e-mail and presses NEXT. Keeping the saved address there takes some doing: the field carries autofocus, and browser autofill writes into it without firing any event, so the value is re-asserted a few times and only steps aside once an edit arrives that the script did not make. Each step keeps its own session timestamp, so a failed attempt can never retry in a loop.',
            'Settings are one JSON blob kept in the userscript manager’s own storage, because Manage and its sign-in page are different origins and localStorage does not cross that line. It is mirrored into localStorage as well, whose storage event is what lets a toggle in the panel restyle every iframe live — and other open Manage tabs follow along. The column list travels the same way.',
            'No external requests, no analytics, nothing leaves the page. The only privileges it asks for are GM_getValue and GM_setValue, purely so your own settings survive the hop to the sign-on domain — that storage is local to your browser.'
        ],
        why: 'You stare at a PSA for eight hours a day; the least it can do is be comfortable. ConnectWise Manage offers no dark theme, no density options, no way to read a truncated summary without opening the ticket and no way to restyle it server-side — but it is still just a website, and your browser has the final word on how websites look. Nothing here changes functionally: tickets and time entries behave exactly the same, you just stop paying the tax of opening a record to read one line, and it is easier on the eyes at 17:30.',
        caveats: [
            'The dark themes are optical tricks (colour inversion recipes), not designed palettes — screenshots taken while one is on will look inverted to everyone else, and the odd colour-coded status may read differently. That is why they ship off by default.',
            'The card can only show what is already on screen. A column that is not in your Manage view is not in the card either, an empty cell is left out rather than shown blank, and “ticket content” only appears when Manage itself decides to load its note tooltip — usually the latest note, not the whole discussion.',
            'Auto-closing status notes dismisses a message somebody deliberately put on that company. It is off by default for that reason: switch it on only if you already know what those notes say.',
            'The stale highlight reads dates day-first (30/05/2026). A first number above 12 settles it either way, but a tenant on month-first dates would need that line changed.',
            'Change/Change/Change writes into ConnectWise’s own combo boxes. It is off by default, and if a future Manage build refuses the value you will see the field simply not change — nothing is saved behind your back.',
            'Text scaling changes font sizes inside fixed-width boxes, so at 125–130% a very tight cell can clip. Step back down 5% if a screen looks cramped.',
            'Auto-LOGIN presses a button on your behalf. It fires once per sign-in step per session, so a wrong password cannot loop and lock the account, but if you share the machine leave it off.',
            'Your company ID, username and SSO e-mail are stored by the userscript manager so they survive the hop to the sign-on domain. Nothing is sent anywhere, but if you have your manager’s cloud backup switched on, its backups include that storage — leave the fields empty if you would rather they did not.',
            'Developed against the live login page and against saved copies of a real Manage service board, status-note dialog included. Every tweak has an off switch if a future release breaks one.'
        ],
        bookmarklet: true
    }
];
