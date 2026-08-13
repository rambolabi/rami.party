/* ==========================================================================
   Glamours: the spell registry
   --------------------------------------------------------------------------
   One object per glamour. The page renders everything from this array, so
   adding a new site-restyling spell is:

     1. Drop the .user.js (and optionally .user.css) file in user-scripts/.
     2. Append one object here. Done: cards, code viewers, install buttons
        and the bookmarklet are generated.

   Fields:
     id: folder-unique slug, used for anchors (#cw-manage-eu)
     title: display name of the glamour, matching the file's own @name
     site: the hostname it enchants (shown as a badge, and the filter chips)
     siteName: longer name, searched and used as a fallback bookmarklet label
     status: 'complete' (shown as Completed) or 'wip' (shown as WIP)
     glyph: an emoji for the card
     kinds: ['userscript'] and/or ['usercss']: which files exist
     tags: free words the search should match, shown on the card
     files: { userscript: '...', usercss: '...' } relative file names
     summary: one-line pitch shown under the title
     what: bullet list: what it does, feature by feature
     how: bullet list: how it works under the hood
     why: a short paragraph: why this is nice / what problem it solves
     caveats: bullet list of honest limitations (optional)
     markName: label for the bookmarklet button (optional)
     bookmarklet: 'usercss' (or true) builds it from the .user.css rules
                  between the bookmarklet:start/end markers, 'userscript'
                  carries the whole .user.js inside the bookmark
   ========================================================================== */

window.GLAMOURS = [
    {
        id: 'truesight',
        title: 'Truesight · Page Inspector',
        status: 'wip',
        site: 'any site',
        siteName: 'Truesight',
        markName: 'Truesight',
        glyph: '👁',
        kinds: ['userscript'],
        tags: ['security', 'incident response', 'phishing', 'privacy', 'network', 'audit',
               'forensics', 'trackers', 'diagnostics', 'any site'],
        files: { userscript: 'user-scripts/truesight.user.js' },
        summary: 'A page tells you nothing about the company it keeps. Truesight watches the traffic it generates and the browser features it reaches for, and answers the first question of any investigation: what is this thing actually talking to?',
        what: [
            'Host map: every request the page makes, grouped by host, with the count, the kind (script, image, XHR, fetch, beacon, WebSocket, frame), the kilobytes, and when it first appeared. First-party and third-party are separated, and a host that is a bare IP address is flagged in red, because a request to 203.0.113.7 has no certificate name to check and nothing for a domain block-list to catch.',
            'Findings, the list an analyst would otherwise write out by hand: mixed content on an https page, password fields posting to another domain or over plain http, credentials submitted by GET, link text naming a domain the link does not go to, cross-origin frames without a sandbox, code assembled at runtime, timers handed a string to execute, tracking pixels, third-party script hosts, inline script volume, missing CSP meta.',
            'API watch. The page is asked, not trusted: geolocation, camera and microphone, clipboard reads, notification prompts, credential requests, window.open, document.write. Each one is logged the moment it is called, with a count.',
            'WebRTC address leaks: a peer connection quietly produces ICE candidates carrying local and public IP addresses. Truesight reads them out of the candidate strings and shows you the addresses the page just learned about you.',
            'Storage: cookies visible to script with their total size, localStorage and sessionStorage keys and volume, IndexedDB database names. HttpOnly cookies are deliberately absent from that list, and the panel says so rather than pretending it saw everything.',
            'Timeline: a running log with timestamps, filterable, so "what happened when I clicked that" has an answer.',
            'X-ray overlays: outline every frame, force hidden nodes into view (hidden inputs and 1×1 pixels are where the interesting things live), or ring every image so the trackers stand out.',
            'Hold the page: strips meta refresh and blocks window.open so a redirect chain stops long enough to be read.',
            'Copy report. The whole thing as Markdown, ready to paste into a ticket: page, protocol, referrer, host table, findings, APIs used, timeline. Or copy just the host list, for pasting into a search bar somewhere else.',
            'Alt+Shift+I opens and closes the panel. Installed as a userscript it waits behind a small badge in the corner so it is never in the way; run from the bookmark it opens straight away, because you just asked for it.'
        ],
        how: [
            'Requests are caught two ways at once. fetch, XMLHttpRequest, sendBeacon, WebSocket, EventSource and RTCPeerConnection are wrapped so the call is seen as it is made; a PerformanceObserver on resource entries catches everything else the browser fetched on its own: images, stylesheets, fonts, preloads. That observer is created with buffered:true, which is what makes the bookmarklet worth clicking on a page that loaded ten minutes ago: the entries that already happened are replayed into it.',
            'Every wrapper calls straight through to the original and is wrapped in try/catch. Instrumentation that changes behaviour is worse than no instrumentation, so a hook that throws is swallowed and the page carries on. eval is deliberately left alone: replacing it would turn every direct eval into an indirect one and quietly change the scope a page\u2019s code runs in. new Function, document.write and string-argument timers give the same signal without that risk.',
            'First-party versus third-party is decided on the registrable domain, not the hostname, so cdn.example.com is not reported as a stranger on example.com. A compact public-suffix rule keeps bbc.co.uk from being read as "co.uk".',
            'The look-alike link check compares the domain a link\u2019s visible text claims with the domain its href actually resolves to. That is the oldest trick in phishing, and still the most common one.',
            'It runs in every frame but draws in the top one. A same-origin frame hands its records upstairs directly; a cross-origin frame cannot, because the only channel out is postMessage and that would mean handing the findings to the page. So it keeps them, and the panel tells you a frame you cannot see is there.',
            'No network calls, no storage writes, no page mutation beyond its own panel and the overlays you switch on. The report is built as text and put on your clipboard; where it goes next is your decision, not the tool\u2019s.'
        ],
        why: 'The interesting question about a suspicious page is rarely "what does it look like". It is "who is it talking to, and what is it asking my browser for". DevTools answers that, but only if you had it open before the page loaded, and only in a shape you have to read as raw rows. This is the same information arranged as an answer: a host list you can hand to someone, a findings list you did not have to remember to check, and a report you can paste into the ticket while the tab is still open. It is read-only and offline by design, so it is safe to run on the page you were about to warn someone else not to click.',
        caveats: [
            'It sees this tab, not the network. There is no DNS resolution and no passive DNS; a hostname is reported as the hostname the page used. Resolving it to an address is a job for a tool that is allowed to make requests, which this one is not.',
            'Cross-origin frames run in their own world. Their traffic is invisible from the parent document by design; the panel lists the frame and says so. Open it directly to inspect it.',
            'A page that loaded before the script did is reconstructed from resource timing, which knows the URL but not the request body or headers. Sizes read zero for cross-origin responses that do not send Timing-Allow-Origin.',
            'HttpOnly cookies cannot be listed from JavaScript. That is the point of HttpOnly, and their absence in the panel is not evidence they are absent from the browser.',
            'A page that is actively hostile could feed the collector nonsense, because everything here runs in the same world the page does. Treat it as a fast first look, not as forensic evidence, and use a proxy or a recording browser profile when the answer has to hold up.',
            '"Hold the page" removes the exits it can reach: meta refresh and window.open. Nothing running inside a page can stop a script assigning to location, so a determined redirect will still get away.'
        ],
        bookmarklet: 'userscript'
    },
    {
        id: 'prism',
        title: 'Prism · Reading Comfort',
        status: 'wip',
        site: 'any site',
        siteName: 'Prism',
        markName: 'Prism',
        glyph: '🔺',
        kinds: ['userscript'],
        tags: ['accessibility', 'dark mode', 'reading', 'contrast', 'typography', 'text size',
               'theme', 'colours', 'eye strain', 'any site'],
        files: { userscript: 'user-scripts/prism.user.js' },
        summary: 'Every site has opinions about how you should read: 13-pixel grey type, lines that run the width of a cinema screen, and a theme picker with one option. Prism takes those decisions back: colours, size, spacing, line length and font, all remembered per site.',
        what: [
            'Six ways to change the colours: leave them, invert the whole page, or repaint it in dark, sepia, high contrast, or a background, text and link colour you pick yourself.',
            'Text size from 70% to 200%: real text scaling, not browser zoom. The glyphs grow while buttons, icons, toolbars and column widths stay exactly where they were, so a layout does not start wrapping just because you wanted bigger words.',
            'Line height, letter spacing and line length. Capping paragraphs at 60 to 80 characters is the single biggest readability win on most sites, and it takes one slider.',
            'Font override: the page\u2019s own, system sans, serif, monospace, or a high-legibility face for when the site chose something with a thin stroke and tight spacing.',
            'Underline every link, so "which of these grey words is clickable" stops being a guessing game.',
            'Stop animations: carousels, parallax, fade-ins and smooth scrolling all reduced to nothing, for reading, for screenshots, or because they make you queasy.',
            'Dim or hide images: turn a page into text when the pictures are decoration, or when you would rather not have them load into view over your shoulder.',
            'Settings are saved per site and applied before the first paint, so a page you have set up comes back the way you left it with no flash of the original. "Use everywhere" makes the current setup the default on sites you have not touched yet.',
            'Alt+Shift+P opens and closes the panel, Alt+Shift+O steps through the colour modes without opening anything. Otherwise it waits behind a small badge in the corner.'
        ],
        how: [
            'Invert and repaint are two different mechanisms, and the panel keeps them apart on purpose. Invert is one CSS filter on the root element. It costs nothing and works on a site it has never seen, but it flips photographs into negatives, so images, video, canvas and frames get a counter-invert to put them back. Repaint forces a palette instead: one background on the root, everything else flattened to transparent, one text colour, one link colour. Blunter, but a photograph survives it and the contrast ratio is exactly the one you chose.',
            'The filter never gets a background colour of its own. A dark colour painted on the element being inverted comes back out pale, because the element\u2019s own background is inverted along with its contents. So the page\u2019s existing backdrop is left to invert naturally.',
            'Form controls, code blocks and table cells are lifted off the repainted background by a shade mixed from it, so a text box still looks like a text box. Borders get their own mix, placeholders a faded one.',
            'Text scaling tags every element once with its ORIGINAL font size and generates a small stylesheet mapping each distinct size to the scaled one, so changing the percentage rewrites a handful of rules instead of re-walking the page, and re-applying never compounds. The measuring pass runs with that stylesheet switched off, or it would measure its own output. The generated selector repeats three times: plenty of sites pin their type with an !important rule that a single attribute selector would lose the cascade to.',
            'The font override carries an exclusion list for icon fonts. They draw glyphs from a private character range, so swapping their family turns a toolbar into a row of empty boxes.',
            'New content is caught by a MutationObserver that queues nodes rather than replacing the batch, so elements that arrive while a batch is waiting are scaled too instead of being dropped.',
            'Settings live in localStorage under one key, per hostname, with a global default. Other tabs on the same site follow along through the storage event.'
        ],
        why: 'Reading is the thing you do on a computer more than anything else, and the amount of control the average site gives you over it is a dark-mode toggle, if that. Browser zoom is a blunt instrument: it reflows the layout as much as the text. Reader modes are all-or-nothing and give up on anything interactive. This sits in between: it is the set of adjustments you would make in a stylesheet if the site were yours, available on every site, remembered per site, and reversible in one click. It is also the accessible answer for anyone who needs bigger type, more spacing or fewer moving things and does not want to change it for the whole operating system.',
        caveats: [
            'Repaint is deliberately blunt. A site built on layered translucent panels and background images will lose some of its depth, because flattening every background is exactly how the contrast gets guaranteed. Invert keeps the layers; pick whichever one the site survives better.',
            'Inverting flips colour-coded meaning along with everything else. A red status pill goes on being red, since the hue is rotated back, but screenshots taken with a theme on will look inverted to everyone you send them to.',
            'Capping line length applies to paragraphs and list items. On an application rather than an article that can look odd, which is why it is off by default and set to zero.',
            'Text scaling changes font sizes inside boxes that were sized for the old ones, so above about 150% a tight cell can clip. Step back down if a screen looks cramped.',
            'The icon-font exclusion list matches the common naming conventions. A site with an unusual one may show a few empty boxes when the font is overridden. Switch the font back to "page\u2019s own" and they return.',
            'Settings are stored per hostname in this browser. A different browser, profile or device starts fresh, and clearing site data clears them.'
        ],
        bookmarklet: 'userscript'
    },
    {
        id: 'cw-manage-eu',
        title: 'ConnectWise Manage · Comfort Glamour',
        status: 'complete',
        site: 'myconnectwise.net',
        siteName: 'ConnectWise Manage',
        markName: 'Manage comfort (CSS only)',
        glyph: '🎫',
        kinds: ['userscript', 'usercss'],
        tags: ['connectwise', 'psa', 'service desk', 'tickets', 'dark mode', 'productivity',
               'login', 'text size'],
        files: {
            userscript: 'user-scripts/cw-manage-eu.user.js',
            usercss: 'user-scripts/cw-manage-eu.user.css'
        },
        summary: 'ConnectWise Manage ships one theme, truncates every grid cell and fights your password manager. This glamour fixes all three, and every tweak is a toggle.',
        what: [
            'Seven themes for an app that ships none. Three repaint it outright rather than filtering it, and carry a Beta tag while that beds in: Good IT green (deep green surfaces, warm off-white text, the periwinkle 7452 #9898FF as the accent), Good IT purple (the same sheet reversed: periwinkle-dark surfaces with the mint 7478 as accent) and Hot Pink. Hovering a row marks it in the theme’s accent colour, ticked rows wash in it, and native checkboxes take it too. Two are dark filters, Obsidian (deep black) and Ember (warm amber). Then Daylight, which keeps the page pale and pushes the colour hard, so priorities and status pills separate at a glance, and Graphite, a soft greyscale that sits between the two: the glare is gone but the screen is still light. Off by default; Alt+Shift+D flips between your theme and the original.',
            'Dark left menu: the navigation column is the one surface ConnectWise already paints dark, so a dark theme inverts it into a bright white bar down the side of the screen. One toggle puts it back to near-black, icons and labels included, and it works under any theme or none.',
            'Ticket preview. Hover any grid row and a small card shows that row in full: the ticket number and summary as a heading, then every column Manage clipped with an ellipsis. Choose where it appears: floating next to the pointer, or in the page just under the row.',
            'Pick your columns: the panel lists the columns of the grid you last hovered (Date Entered, Entered By, Updated By, Service Board, whatever your view has) and each one can be switched off. Switch the whole column list off and the notes on, and the card shows nothing but the ticket text.',
            'Ticket content. Optionally folds the note Manage itself loads on hover into the same card: how many notes came back, who wrote the last one, and the note text. The card says it is waiting while Manage fetches, and says so plainly if nothing comes back, so you are never left staring at a gap.',
            'Stale ticket highlight: rows nobody has touched for N days (5 by default) get tinted red, amber or violet with a coloured bar down the side, so a board full of forgotten tickets shows itself at a glance.',
            'Change change change: set Type to “Change” on a ticket and Subtype and Item are set to “Change” for you, because they always were going to be.',
            'Login helper: restores password-manager autofill (Manage sets autocomplete="off" on every field), focuses the first empty field and warns when Caps Lock is on.',
            'Login auto-fill: remembers your company ID and username and keeps them in place against whatever your browser decided to remember instead. Nothing is ever submitted for you, and the password is never stored: that stays with your password manager.',
            'Text size 80 to 130%. Real text scaling, not page zoom: the glyphs grow while buttons, icons, toolbars and column widths stay exactly where they are.',
            'A tiny ✨ panel (bottom-right, Alt+Shift+G) where each tweak can be switched off. One set of settings covers every ConnectWise region, so a tenant on eu., na. or au. gets the same setup rather than one per hostname. At the bottom sits a Log, folded shut by default, keeping the last 15 notices, such as what the stale highlight found, so status text no longer appears and disappears in the panel itself.'
        ],
        how: [
            'A filter theme is one CSS filter on the root element, so the page backdrop is filtered along with everything else. That means the backdrop has to be left alone rather than painted dark: a dark colour set there comes back out pale, which is why half-empty screens such as a time entry used to sit behind a cream wash.',
            'The brand themes take the other road, because a filter cannot do that job. Landing the greys on a green means rotating every hue by about 95 degrees, which turns a red priority green and a green one blue; pink needs 275 and is worse. So they overwrite ConnectWise’s own colours instead: every surface is flattened and the handful that have to read as a surface are lifted back out. That works because almost everything in Manage is already transparent and inherits from a few painted elements. Flatten and lifts are all !important, so specificity decides rather than source order: they are written to the same weight and ordered, and both carry a guard so nothing this script put on the page is repainted with it.',
            'Three details are what make that hold up. GXT mounts every floating layer straight on the page body: the left menu’s flyouts, the navigation search results, icon menus, dropdown lists, whole windows. Flattened, those turn to glass and a hover menu draws its text over whatever sits behind it, so every top-level layer is lifted back to an opaque surface, and the ones being stacked, recognisable by their inline z-index, get a border and a shadow so they read as panels. Manage also paints its pod headers with a pale gradient, which no background colour can cover, so background images are dropped as well, sparing the elements whose image is their content, such as a priority chip, which is a single coloured pixel stretched into a swatch. The grid’s tick boxes were sprites drawn for a white page, so they are redrawn in the palette instead: an outlined box when clear, the accent with a cut-out tick when the row is picked, and the picked row washes in the accent so a selection reads from across the room. And there is deliberately no zebra stripe, because a row colour heavy enough to outweigh the flatten would also outrank the stale highlight.',
            'The four dark themes work by inversion, so photographs, the settings panel and the preview card are flipped back to stay natural. Daylight and Graphite do not invert anything, so they get no counter-flip: Daylight is saturation and contrast on top of the colours ConnectWise already uses, and Graphite drains the colour and pulls white down to a mid grey. Greyscale is one-way, so under Graphite screenshots in a ticket are grey too.',
            'The left menu carries nothing but compiler-generated class names, but the sections inside it do not, so it is found with :has(> .cw-lcm-section). Its colours are written pre-filter, which is what lets one rule land dark under an inverting theme, and the direct colours are used under the themes that do not invert. Only the <svg> element is given a fill, because half the icon paths carry fill="none" and would turn into solid blocks if the rule reached them.',
            'Manage is a GWT application: every class name is compiler-generated and changes between releases, so nothing here selects one. The few stable hooks it does expose (srboard-grid, cw-ml-row, cw-ml-header, cw-lcm-section, pod-element-row) are matched loosely by substring, and everything else is generic DOM semantics.',
            'Columns are paired to cells by horizontal position, not by counting. Manage draws the header strip as a sibling div rather than a <thead>, and the rows carry a leading checkbox column plus trailing filler cells, so index arithmetic lands one column off; matching each header’s centre against the cell rectangles underneath it does not.',
            'That header lookup is also the guard that keeps the card off the rest of the app: no resolvable header strip, no preview. Manage builds pods, toolbars and page furniture out of tables too, and none of those have one. Hovering 61 pod rows produced zero popups in testing.',
            'The card is built from the row you are already looking at: no request, no navigation, nothing to undo. It waits 180 ms so it never flickers while you sweep the mouse, is pointer-events:none so it can never swallow a click, and vanishes on scroll, click or keypress. Manage recycles grid rows while you scroll and fills their cells a beat later, so the card rebuilds itself a few more times over the next second and a half and keeps whichever version knows the most columns.',
            'Ticket content is adopted, not fetched. Manage loads the note into a tooltip of its own, but only for the summary cell. Hover any other column and it never looks it up at all, which reads as “slow” when it is really “never”. So the hover is echoed onto that cell once the card is up, while the watch itself starts the instant you arrive. A MutationObserver hands the note over on the same tick it renders, and the floating containers already on screen are swept too, because Manage reuses one tooltip element that may never mutate again. All of this is optional machinery: the card is scheduled first and on its own, so nothing the notes do can keep the preview away.',
            'Candidates are filtered by what they are not (no form controls, no grid, at most a few links), the one carrying a note timestamp wins, and the original tooltip is hidden so there is only one popup. Leaving the row puts it back.',
            'The stale highlight reuses the same column matching: it finds the Last Update header, resolves that column’s index once per grid, parses the date out of each row and tags the old ones with an attribute that a generated stylesheet colours. That selector is repeated three times, because Manage paints its own grid cells from long !important rules and a single attribute loses to them: the rows would be marked and stay uncoloured. The header is matched in several languages, and if it cannot be found at all the panel says so rather than leaving you wondering. Because the dark themes rotate hue rather than just inverting, red still reads as red once one is on.',
            'Change/Change/Change drives the real fields: Manage marks them with readable classes (cw_type, cw_subType, cw_item) inside tr.pod-element-row, with the label text as a fallback. The value is written through the native input setter and followed by a full type-and-leave event sequence, because GXT combo boxes shadow the value property and only notice a proper one.',
            'Text scaling tags every element once with its ORIGINAL font size and generates a tiny stylesheet mapping each distinct original size to the scaled one. Changing the percentage rewrites a handful of rules instead of re-walking the DOM, re-applying never compounds, and because only font-size changes, layout boxes keep their dimensions. The generated selector is deliberately repeated three times, because Manage pins its grid text with an !important rule of its own that a single attribute selector loses to.',
            'The login helper only fills and only waits: it re-asserts the saved company and username a few times over the first couple of seconds and then steps aside for good the moment an edit arrives that it did not make. That indirection is needed because browser autofill writes into a field without firing any event, so there is nothing to listen for; only the value can be watched. Nothing is clicked and no key is pressed on your behalf.',
            'Settings are one JSON blob kept in the userscript manager’s own storage, so one set of preferences covers every regional tenant rather than one per hostname. It is mirrored into localStorage as well, whose storage event is what lets a toggle in the panel restyle every iframe live, and other open Manage tabs follow along. The column list travels the same way.',
            'No external requests, no analytics, nothing leaves the page. The only privileges it asks for are GM_getValue and GM_setValue, purely so your own settings are not tied to a single tenant hostname. That storage is local to your browser.'
        ],
        why: 'You stare at a PSA for eight hours a day; the least it can do is be comfortable. ConnectWise Manage offers no dark theme, no density options, no way to read a truncated summary without opening the ticket and no way to restyle it server-side, but it is still just a website, and your browser has the final word on how websites look. Nothing here changes functionally: tickets and time entries behave exactly the same, you just stop paying the tax of opening a record to read one line, and it is easier on the eyes at 17:30.',
        caveats: [
            'The filter themes are optical tricks (colour inversion recipes), not designed palettes. Screenshots taken while one is on will look inverted to everyone else, and the odd colour-coded status may read differently. Daylight pushes saturation instead, which makes a washed-out screen legible but an already-bright one loud. Graphite removes colour altogether, so anything ConnectWise says only in colour stops saying it. That is why they all ship off by default.',
            'The three repainted themes are exact where they land and unchanged where they do not, so a corner of the app nobody has looked at yet may still show a light patch: that is what the Beta tag means. They were built against saved copies of a real service board and a real ticket window, including a status-note dialog, and the fix for a stray patch is one more line rather than a redesign. What they do promise, and the filters cannot, is that colour coding survives: priority chips and status swatches keep their own colours.',
            'The card can only show what is already on screen. A column that is not in your Manage view is not in the card either, an empty cell is left out rather than shown blank, and “ticket content” is whatever Manage’s own note tooltip returns: usually the latest note, not the whole discussion, and its text only. Its speed is Manage’s speed: the card can start the lookup early and show the answer instantly, but it cannot make the server reply sooner.',
            'The stale highlight reads dates day-first (30/05/2026). A first number above 12 settles it either way, but a tenant on month-first dates would need that line changed. It also needs the Last Update column to be in your Manage view: it reads what is on screen, not the database, so a column you have not added is a column it cannot see. The Log in the panel says which of those you are looking at.',
            'Change/Change/Change writes into ConnectWise’s own combo boxes. It is off by default, and if a future Manage build refuses the value you will see the field simply not change. Nothing is saved behind your back.',
            'Text scaling changes font sizes inside fixed-width boxes, so at 125 to 130% a very tight cell can clip. Step back down 5% if a screen looks cramped.',
            'Your company ID and username are stored by the userscript manager. Nothing is sent anywhere, but if you have your manager’s cloud backup switched on, its backups include that storage. Leave the fields empty if you would rather they did not.',
            'Developed against the live login page and against saved copies of a real Manage service board. Every tweak has an off switch if a future release breaks one.'
        ],
        bookmarklet: true
    },
    {
        id: 'cw-manage-autopilot',
        title: 'ConnectWise Manage · Ticket Autopilot',
        status: 'complete',
        site: 'myconnectwise.net',
        siteName: 'ConnectWise Manage',
        markName: 'Ticket Autopilot',
        glyph: '🎯',
        kinds: ['userscript'],
        tags: ['connectwise', 'psa', 'service desk', 'tickets', 'triage', 'automation',
               'productivity', 'bulk edit', 'status', 'due date'],
        files: { userscript: 'user-scripts/cw-manage-autopilot.user.js' },
        summary: 'A morning of triage is the same five keystrokes on every ticket. Press one button in the ticket to do them all, or set a countdown and have every ticket you open stamped until it switches itself off.',
        what: [
            'Board, Status, Type, Subtype and Item, each a dropdown you fill from your own Manage rather than one written into the script. Pick one and every ticket you open gets it; leave it on “Leave it alone” and that field is never touched.',
            'The lists start empty, because what belongs in them is a fact about your Manage and not about this script. With a ticket open, press Read beside a field and its dropdown is opened, copied and closed again. Or open that dropdown yourself in the course of working, and it is read as you do, so a board added next year arrives on its own. A value can also be typed in by hand, and it joins the list. All of it stays in your browser, filed under the hostname it came from, so a sandbox tenant in the next tab keeps its own boards.',
            'They are applied in that order, and the order is the point: in Manage the Board decides which Statuses and Types exist, and the Type decides the Subtypes. Set them the wrong way round and the values are rejected. Each one is written, then given a moment for Manage to reload the lists behind it.',
            'A switch to put your own name in the ticket’s Ticket Owner field, so triaging a ticket and taking it are one action rather than two. The name is set once, either typed or copied off a ticket you assigned to yourself, and it is written after the Board, because the Board decides which people that field will accept.',
            'Priority: pick the priority every ticket should get, from the same kind of list. It is a menu button in Manage rather than a dropdown, so it is opened and the matching entry is clicked, exactly as you would.',
            'Due date: today, tomorrow, anything from two to nine days out, or one, two, three or six months, with an option never to land on a weekend. A month means the same day next month, pulled back to the last day when that month is shorter, so the 31st never spills into the month after. The date format is read off the tenant rather than assumed, so a day-first board gets 13/08/2026 and a month-first board gets 08/13/2026.',
            'A Run autopilot button in the ticket’s own toolbar. Open a ticket, press it, and the fields above are applied to that one ticket. Nothing happens until you press it, which is the version most people want: no clock, no rule running in the background, just the five clicks done for you on the ticket in front of you.',
            'A countdown for the other way round: you choose 15 minutes to 8 hours, every ticket you open is stamped as it opens, the time left shows on the panel and on the floating button, and it stops by itself when the clock runs out. That is the whole point: the tool you forgot to switch off is worse than no tool, and this one cannot be forgotten because it is already counting down.',
            'A log of everything it touched, ticket by ticket, so “what did it just do” always has an answer.',
            'Alt+Shift+A opens and closes the panel. Otherwise it waits behind a small button in the corner, which doubles as the countdown once a run is going.'
        ],
        how: [
            'The fields are found through the class names Manage does not obfuscate: input.cw_serviceBoard, cw_status, cw_type, cw_subType and cw_item are combo boxes, .cw_dueDate holds a date box, and .cw_servicePriority is an icon-menu button. Everything around them is compiler-generated and changes between releases, so nothing here depends on it, and if one of those names is ever renamed the field is found again by the plain-text label beside it.',
            'Writing to a GXT combo takes more than setting .value: the widget shadows the property. The value goes in through the native input setter and is followed by a full type-and-leave sequence, which is the only way the widget notices. Then it is read back: a value handed to a list that is still reloading is accepted and then quietly cleared, which is how a status could look like it was chosen and end up blank. It is retried a few times before the field is given up on, and either way the log says what happened.',
            'The priority is the odd one out. It is an icon menu rather than a field, so it is set last, once everything else has settled, by pressing the button and clicking the entry. Two details decide whether that works at all: the press has to land on the button inside the wrapper rather than on the wrapper itself, and the menu has to be looked for rather than waited on, because Manage builds it once and merely re-shows it afterwards, which changes nothing on the page to notice.',
            'Type, Subtype and Item live in one pod table while Due Date and Priority sit in other sections of the same form, so the lookup climbs from the Type field until it has an ancestor holding both: far enough to see the whole ticket, not so far that a second ticket open beside it on the same screen gets stamped by accident.',
            'A ticket is stamped once. Manage pools and re-uses its pod widgets, so “already done” is keyed to the ticket number rather than to the pod element. That number is read out of the window header above the fields, taking the nearest one so two tickets open side by side stay apart, and it is the one thing on the pod this script never writes: a guard built from the fields it sets would change under its own hand and fire again.',
            'Fields that already have an answer are left alone unless you allow overwriting, and a placeholder does not count as an answer: Manage’s own “(Unassigned)” and friends are treated as empty, and so is a shouted “must change”, which is what some boards leave in a field nobody has filled in yet. Anything it does leave alone is named in the log along with the value it kept, so “it only changed one field” is always answerable.',
            'Reading a list is done by opening it. A combo box in Manage is an input with its arrow beside it inside .mm_comboBox, one of the few class names here that a release does not rename, so the arrow is pressed and whatever floats up is read: each entry is its own childless element, so the list is the leaves. Whatever was already floating before the press is ignored, which is what keeps a tooltip that happened to be open from being mistaken for the list that was asked for. The same reading runs when you open a dropdown yourself, and that is the half that matters: the arrow you press is a sibling of the field rather than its parent, so the walk out of what was clicked also looks inside a combo box once it is standing in one.',
            'The button is put in the ticket\u2019s own action bar, right after Delete. The bar itself carries nothing but compiler-generated class names, so it is found through its buttons instead: Manage names those cw_ToolbarButton_Save, cw_ToolbarButton_Delete and so on. Requiring a Delete or Save button is also what tells a ticket bar apart from the application\u2019s own chrome, which has toolbar buttons too. Which ticket the press applies to is worked out at the moment you press it, because Manage re-uses a ticket window for the next ticket you open. A press ignores the clock and the once-per-ticket guard, because pressing it means \u201cdo it now\u201d.',
            'The clock is stored as an absolute moment, not a duration, so closing the tab, reloading the page or coming back tomorrow cannot resurrect a run that should have ended. Every frame and tab shares it through the storage event.'
        ],
        why: 'Bulk-editing a board is fine when you already know what the tickets are. Triage is the opposite: you open them one at a time, read them, and set the same three fields with the same three clicks, forty times before lunch. That is the work this removes. Not the judgement, just the typing. And it is built around the thing that makes people distrust automation in a PSA: not that it does the wrong thing, but that it keeps doing the right thing long after you stopped wanting it. Hence the countdown, in the largest type on the panel.',
        caveats: [
            'It writes into live tickets. Nothing happens until you press Run autopilot on a ticket or start the clock, it only fills empty fields unless you say otherwise, and it logs everything, but read the log the first few times rather than trusting it blindly.',
            'Status and Priority are never empty on a real ticket, and neither is the Board, so those need “also overwrite” switched on before they will change. The log says which fields it kept and why, so an unchanged field is never a mystery.',
            'Stamping a full set takes a couple of seconds, because each field waits for Manage to reload the one after it. Nothing is lost if you start typing in the meantime: a field you have already answered is one it leaves alone.',
            'A list you have not read yet is empty, and a field with an empty list is one it leaves alone. Reading it is one press with a ticket open. If a dropdown pages its options rather than showing them all at once, what is read is what was on screen, so press Read again after scrolling, or type the missing value in by hand.',
            'Assigning a ticket to yourself writes a name into a field, so the name has to be spelled the way Manage spells it. Assign one ticket to yourself by hand and press the button that copies the name out of it, and it will be right.',
            'A field it cannot set is named in the log rather than passed over. Manage refuses a value that is not on the list the field currently holds, which usually means the Board it depends on is not the one you expected.',
            'The priority menu needs a live Manage to open. That path is written defensively and gives up quietly rather than clicking something else, and says so in the log, but it is the one part that can only be proved on the real thing.',
            'A ticket is stamped when it opens. Change your mind about the Subtype afterwards and the ticket keeps yours. It will not be stamped a second time.',
            'Date formats are read off the tenant by looking at a date already on screen. If a board shows nothing dated, the default is day-first; there is a manual override in the panel.',
            'Everything happens in your browser, as your user, with your permissions. It is a faster way to click the fields you can already click, not a way to change anything you could not change by hand.'
        ],
        bookmarklet: 'userscript'
    }
];
