# Frostcaller — todo & changelog

`/workshop/frostcaller/` on rami.party — a beginner's guide to building a Wi-Fi
infrared blaster so Home Assistant can drive an air conditioner, without soldering.

Static: `index.html` + `style.css` + `app.js`. No build step, no dependencies,
**no network calls at all**. All content lives as data objects at the top of `app.js`.

---

## Changelog

### 2026-07-30 — v7.5 · the last English, and a corrupted file

- **sw.js had been silently corrupted** — a BOM at the front and `â€”` where the
  em-dashes belonged. The cause was my own release habit: bumping the cache version
  with a PowerShell `-replace`, which read the UTF-8 file as ANSI and wrote the
  damage back. A scan of all 22 files found no other casualties, the file is
  repaired, and version bumps now go through Python with explicit UTF-8. Rule added
  below.
- **The last ~110 interface strings are translated.** The fix-it wizard's 32 causes
  (title and explanation), the picker's reasons and notes, the whole comparison
  table (12 row labels and every cell), the path-card tags, difficulty and time
  badges, the accordion deep-link tooltip, and the writer's protocol-quiz notes.
  A Dutch user in the fix-it wizard now reads Dutch advice under a Dutch heading.
- Two details worth keeping: the comparison table's ✓-highlighting judges the
  **English** value and only the display is translated, so `good('None')` keeps
  working in French; and the fix-it causes are keyed by symptom-id + position
  (`fix.noport.0.t`), so rewording the English does not orphan the translations —
  reordering them would, and is the thing not to do.
- **What remains English, as policy rather than debt:** the long chapters and path
  steps (~14,000 words — wants a human translator, the page says so), the generated
  YAML/automation comments (config files are conventionally English), the currency
  names, and the log reader's per-line explanations — they annotate log lines that
  ESPHome itself prints in English, though translating them would still help and is
  listed below.

### 2026-07-30 — v7.4 · the regression pass, and three real bugs

Every feature exercised end to end after the refactor: all six paths, the drawer with
undo and clear, the picker, the result panel, the comparison table, the brand search
and Belgian filter, the handset identifier, all six boards in the config writer, the
pin map, the three bench tools, all seven fix-it symptoms, the room planner, the
journal, the four overlays, search, all ten themes, all ten currencies, the share
round-trip, and the whole of The Scribe. Nothing the refactor touched had broken.

Three bugs that were there before it, though:

- **The checksum guesser decoded every message one bit out — again.** v6 fixed the
  *measurement* (the header space no longer skews the short/long boundary) but not the
  *bit collection*: the header was still being filtered by length, `> split × 2.5`,
  and a typical air-conditioner header gap is not that much longer than a long bit.
  So it was read as a leading `1` and every byte after it shifted. `C3 64 80 00 16 BD`
  came back as `87 C9 00 01 2C 7A` — confident nonsense, which is the worst kind.
  The header is now skipped because of *where* it sits, not how long it is. Verified
  byte-for-byte against four header shapes, including a tight 3000/1500 one that the
  old code got wrong, plus sum-8 and XOR protocols end to end.

- **The QR code never once carried a plan.** Every share link was over 330 characters
  even with nothing selected, because the state always included the full builder
  object and the currency, theme and language whether or not they had been changed —
  and the encoder tops out around 271 bytes. So "Take it to your phone" silently fell
  back to the plain guide address every single time, and the shopping card just left
  a blank space where the QR should be. The link now carries only what differs from
  the defaults: **332 → 49 characters** for a fresh visit, 265 with ten drawer items
  and every question answered. The QR fits in all the ordinary cases and the card
  explains itself in the one case it does not. Old saved states still load.

- **The room planner's device-name preview did not follow what you typed.** Type
  "Bedroom" and the line whose entire job is to show you the device name still said
  `ac-room-1`, while the exported YAML correctly said `ac-bedroom`. Two answers to the
  same question on one screen.

**Also translated** the config writer's form — fifteen labels and hints, plus the six
board notes. It is a form the user fills in, and it was entirely English.

**Still English, and now listed honestly:** the fix-it wizard's cause explanations,
the picker's per-answer notes, the comparison table's row labels, and the generated
YAML comments. Roughly 110 strings. The first three are interface and should be done;
the YAML comments are arguably better left as they are, since config files are
conventionally English.

### 2026-07-30 — v7.3 · dead code, duplication and where things live

An audit for unused code, then a tidy-up. The dead-code result was almost boring,
which is the good outcome: **one** unused symbol in the whole project
(`FLIPPER_PROMPT`, a regex nobody ever matched against). No unused functions, no
unused translation keys, and no dead CSS — the seven class selectors that looked
orphaned are all built by string concatenation (`'pin-key is-' + k`), so the checker
had to be taught about that rather than the CSS deleted.

**Duplication, removed**

Both pages had grown their own copy of the same five helpers — toast, clipboard copy,
the copy fallback, file download and the starfield — about 115 lines, drifting apart.
They are now in `ui.js`, loaded by both. That also fixed a translation gap nobody had
noticed: the guide's *“Copied to clipboard”*, *“Copy failed”* and *“Saved …”* were
still English in every language, because the earlier sweep scanned for `toast(` and
the guide calls it `showToast(`.

`setupChrome` existed in both `app.js` and `writer/app.js`. They never load together,
so nothing was broken, but two globals with one name is a trap; the writer's is now
`setupConsole`.

**Splits**

- **`i18n-writer.js`** — the 212 console strings × 3 languages moved out of `i18n.js`.
  The guide was downloading and parsing 58 KB of vocabulary for a page it is not.
  That is a **10% cut to the guide's payload** for no loss of function; the writer
  loads both files and merges them.
- **`data-guide.js`** — the six paths, parts, drawer, ready-made devices, software,
  flashing routes, extras, chapters, FAQ and picker questions. `app.js` was 3 657
  lines and 55% of it was prose. It is now **1 890 lines of machinery** beside 1 678
  lines of writing, which matches how the project already treats brands and chapters.
  No byte saving — both still load on the guide — but editing a price no longer means
  scrolling past event listeners.

**Shape now**

| | before | after |
|---|---|---|
| `app.js` | 172.7 KB / 3 657 lines | 74.5 KB / 1 890 lines |
| `i18n.js` | 149.1 KB (both pages) | 93.2 KB (both pages) |
| guide payload | — | **−58 KB** |
| duplicated helper lines | 115 | 0 |

### 2026-07-30 — v7.2 · the half that was never wired up

The previous pass translated what the HTML says. This one translated what the
**JavaScript** says, which turned out to be most of the words on the site: 94
hard-coded English strings across six files, found by scanning for prose passed to
element constructors rather than by looking at the page.

- **Every path card** — “In its favour”, “The honest downsides”, “You will need”,
  “Where it ends”, the deep-link tooltips.
- **The parts bench** — “Find it”, “Copy name”, “needed by”, “optional for”.
- **All three bench tools** — the log reader, the raw-code converter and the cost
  estimator, including every field label and the savings explanation.
- **The room planner, handover sheet, codes shelf and handset picker**, including
  the four handset descriptions.
- **The whole of The Scribe**: console messages, chip identification, capture list,
  diff commentary, protocol quiz, checksum guesser, session replay and the IRDB
  fetch. Its browser-support verdict too.

**Bugs this uncovered**

- **Seven panels never re-rendered on a language change.** They drew once at load,
  so they showed whatever language was saved from last time and then stayed there —
  the log reader, the raw tool, the codes shelf, the handset picker, the checksum
  guesser, the component generator and the IRDB panel. Now all in the redraw list.
- **Re-rendering the two paste tools added a second `input` listener each time**,
  which would have run them twice per keystroke. Wired once, redrawn as often as
  needed.
- **`renderInvStatus` built keys from a field that does not exist** — the readiness
  rows have `label`, not `id`, so it was asking for `inv.i.undefined` on every line
  and silently falling back to English. It worked by accident.
- **The quiz's “Found it” note used `textContent` on a string containing backticks**,
  so it printed `` `platform: coolix` `` literally.
- **The Scribe's status pill and pause button** must never carry `data-i18n` — the
  static pass runs on every language change and would wipe a live connection
  message. Both are set from code.

**Now:** 497 interface strings × 3 languages, plus 92 content strings × 2. No
duplicates, no gaps, no unused keys, and nothing user-facing left in English outside
the long chapters — which say so themselves.

### 2026-07-30 — v7.1 · the audit that should have come first

A key-by-key audit of the translation tables against every use site, rather than
spot-checking the rendered page. It found the opposite of what I expected: the
translations were **written but never applied**.

- **The hero was entirely English** in Dutch and French \u2014 eyebrow, headline
  paragraph, both buttons, all four facts. Every one of those strings had existed in
  `i18n.js` since the first pass; nothing in the HTML ever asked for them.
- **The result panel** \u2014 the whole payoff of the picker \u2014 was hard-coded English
  despite a complete set of `res.*` keys sitting unused.
- **21 section subtitles, caveats and sub-heads** had no key at all: the comparison
  table, the ready-made caveat, the parts note, the brand caveat, the writer card, the
  pin map, the flashing list, the extras section, the handover panel, the footer and
  all four overlay dialogs.
- **`sec.remote` was defined twice** with different text, so the first definition was
  silently dead.
- **Four keys were dead weight** (`back`, `nav.ready`, `loading`, and the duplicate),
  referring to markup that does not exist.
- **`lang.partial` \u2014 the note admitting the chapters are English-only \u2014 was never
  displayed anywhere.** The previous changelog claimed \u201cthe page says so plainly\u201d.
  It did not. It does now, and only to people not reading it in English.
- **The Scribe had four visible markup leaks**: the Flipper repository blurbs and the
  empty-captures hint printed raw backticks, because four renderers used `textContent`
  where they should have used `rich()`. Same class of bug as the guide's v6, missed
  because the writer had no formatter of its own until v7 gave it one.
- **The console status pill** said \u201cNot connected\u201d in every language, and marking it
  `data-i18n` would have let a language switch wipe a live connection message. It is
  set from JavaScript instead, at startup and on every state change.
- **Three result buttons** (`Share…`, `Print my plan`, `Build my YAML →`) were missed
  in the first pass because they sit after an early `return`.

The audit now runs as a script rather than by eye: it parses `i18n.js`, checks the
three blocks for duplicate and missing keys, then cross-references every `t()`, `tv()`
and `data-i18n*` in the codebase. Current state: **261 keys × 3 languages, zero
duplicates, zero gaps, zero unused**.

### 2026-07-30 — v7 · three reported bugs, and the translation they exposed

**Reported**

- **The search results panel never went away.** The browser's own rule is only
  `[hidden] { display: none }`, and `.search-results { display: grid }` beats it —
  author styles win over the user-agent sheet regardless of specificity. So an empty
  931 px panel floated under the search box permanently while the JavaScript happily
  believed it had hidden it. Fixed with `[hidden] { display: none !important; }`,
  applied globally rather than to the one panel, because 48 elements on that page use
  the attribute and any of them could have grown the same bug.
- **The search field ballooned when the language changed.** The tool group is wider
  in Dutch and French, so at some widths it wrapped onto its own line and left the
  search field stretching the full width of the page — a different-looking control in
  each language. Capped at 420 px.
- **Long steps were clipped on a phone.** `ol.steps` is a grid, and a grid item's
  automatic minimum size is its min-content width — which for a step containing a
  YAML block is the longest line in it. The track grew to 575 px inside a 234 px
  container and `.path` clipped the overflow, so text was simply *gone* on a phone.
  `minmax(0, 1fr)` plus `min-width: 0`, and the code blocks now scroll inside
  themselves as they were always meant to.

**Then the translation, since the second bug was really about language**

The interface headline strings were translated; almost everything under them was not.
Now in all three languages: the four “how this works” cards, every drawer item, all
five picker questions with their hints and answers, the seven fix-it symptoms, the
brand and device table headers and quality tags, the Belgian filter, the three bench
tools, the drawer readout, the eight build-journal steps, and the search's
“nothing matches”. Two bugs fell out of doing it: `renderPicker` had translations for
its buttons and used hard-coded English anyway, and search snippets printed raw
`[label](url)` markup.

**The Scribe was worse off than the guide**

It had **no theme picker at all** — its own stylesheet carried `[data-theme="paper"]`
rules that could never fire — and no language picker either. Both added, and the
choice now carries between the two pages through one settings blob, read-modify-write
so switching a theme in the writer cannot disturb the drawer next door.

**Two files came out of the duplication**

- `text.js` — `el`, `rich`, `para`, `safeUrl`. One audited place where a string turns
  into an element, instead of the writer growing a near-copy for its own headings.
- `data-themes.js` — the theme list and the shared storage key, so both pages offer
  the same ten and neither owns the list.

### 2026-07-29 — v6 · the backlog, cleared

**Bugs found in review** — all of these were caught by reading the rendered page
as a stranger would, not by reading the source.

- **`safeUrl()` rejected ordinary relative links.** Only `https://`, `#`, `./` and
  `../` passed, so `[The Scribe](writer/)` rendered as raw markup on screen. It now
  accepts bare relative paths and still blocks `javascript:`, `data:` and
  protocol-relative URLs. Verified against eight cases.
- **`rich()` does not nest, and three strings assumed it did.** `**[SmartIR](url)**`
  rendered the link markup in bold rather than a bold link. Fixed at the call sites
  and documented on the function — bold or link, never both.
- **Three renderers bypassed the formatter**: the brand notes, the device notes, the
  pin-map notes and the accordion titles all used `textContent`, so backticks and
  asterisks showed literally. 37 visible leaks; now zero, checked by walking every
  text node outside `<code>` with all accordions open.
- **The checksum guesser decoded every message one bit out of position**, because it
  counted the header space as a data bit. Caught by encoding synthetic messages with
  a known checksum and finding the decode did not round-trip. The bit boundary is now
  measured from the message body, with the header and frame gaps excluded.
- **The offset checksum scheme duplicated the plain sum** (k=0 is the same thing) and
  had 255 chances to fit by luck. It now starts at k=1, ranks last, and the UI says
  plainly when several schemes fit and that more captures will narrow it.
- **Long URLs pushed the page sideways on a phone.** `overflow-wrap` on body text.
- **The pin map titled itself “ESP32” while drawing an Atom.** It now names the board
  and says which chip the pin list belongs to.
- Moving the handset identifier created **duplicate `id` attributes** for a moment —
  caught by an automated check that now runs in the test pass.

**Content, the real gap**

- **Drawings, in SVG** — no image files, and they re-colour with the theme. The
  three-wire bench wired up properly; a pinout card per board with the infrared pin
  lit; and a line-of-sight diagram showing a clear shot, a ceiling bounce and a
  blocked one.
- **❄️ Heating in winter** — the half of the year the guide kept forgetting. Defrost
  cycles that look like failure, why pre-heating needs a longer run-up, and a
  seasonal mode-switch automation with a six-hour delay so one sunny February
  afternoon does not flip the house.
- **📚 The full `heatpumpir` example** — the four settings it refuses to compile
  without, which is exactly where beginners stall, plus the protocol names worth
  trying per manufacturer.
- **🔁 Toggle or statement?** — a five-minute test that decides whether repeat-sending
  is safe. Nothing else in the guide matters as much and it needed saying plainly.
- **🔌 The wired Midea option** — with the warnings first, and the honest middle road
  of buying the maker's own dongle and putting it on a VLAN.
- **🎬 A capture, start to finish** — with the log text you will actually see, both
  the recognised case and the hundred-pulse air-conditioner case.

**Features**

- **Handset identifier** — four silhouettes drawn in SVG. Shape beats badge, because
  the same handset ships under a dozen names. Click one and the protocol is set.
- **Room-by-room planner** — several units, one basket, one naming scheme, and
  house-wide automations generated from it.
- **Build journal** — the honest version of a difficulty meter. There is no server
  here to collect anybody's timings, so it measures yours and says so.
- **Handover sheet** — one printable page for whoever lives with this next, including
  “if you want it gone, unplug it; nothing was modified”.
- **Your codes shelf** — what The Scribe captured, and where to contribute it.

**The Scribe's laboratory**

- **Checksum guesser** — decodes captures to bytes, highlights what moves, and tries
  six schemes until one explains every message. Verified against synthetic messages
  with known checksums, including the awkward mostly-zeros case.
- **ESPHome component generator** — a `climate_ir` skeleton with timings measured
  from your own captures, so a protocol nobody supports can go upstream.
- **Record and replay** — save the log and captures to one file; somebody else can
  load it and see exactly what you saw.
- **Flipper-IRDB fetch** — opt-in, clearly labelled as the only network call on the
  site, with a manual-download fallback in the failure message.
- **The console explains itself** — recognised log lines get a plain-language note.

### 2026-07-29 — v5 · languages, brands, and a dolphin

**Bugs found and fixed**

- **The service worker was serving stale JavaScript.** Cache-first meant a returning
  reader kept yesterday's `app.js` until the *second* reload after any update — and
  it bit me repeatedly while testing, which is exactly how a user would meet it.
  Now network-first with cache fallback: fresh when online, still works offline.
- The drawer's **Undo button stayed disabled** after the first tick, because the
  button is rendered once but the history changes on every toggle. Its state is now
  refreshed from `renderInvStatus()`, which runs on every change.
- **Section headings ignored the language switch** — only the navigation and toolbar
  carried `data-i18n`. Every heading and lead paragraph is marked up now.

**Languages**

- Full interface in **English, Dutch and French**, with the language carried in the
  share link and remembered between visits. Path names and drawer categories are
  translated too. Missing keys fall through to English, so a partial translation
  degrades gracefully instead of showing `undefined` at somebody.
- The long chapters and step-by-step instructions remain English — stated plainly on
  the page rather than pretended otherwise. Translating them properly is a much
  bigger job than translating them badly.

**Ten themes**, grouped as *Professional* (Paper, Slate, Blueprint, Terminal,
Contrast) and *Playful* (Frost, Ember, Aurora, Candy, Vapour). Blueprint swaps the
starfield for a drafting grid; Terminal switches the display font to monospace.

**Brands and devices** — a new searchable section: 61 climate brands with a
“commonly sold in Belgium” filter (40 of them), each mapped to its ESPHome platform
and rated *native / via heatpumpir / try it / capture it*. Then 28 other infrared
devices across four groups — televisions, set-top boxes (Telenet, Proximus, VOO),
sound, and everything else from Dyson fans to Toto washlets.

**The Scribe, finished** — and now linked from a full-width card on the guide.

- **Flipper Zero support.** It is a serial port with a CLI, so this page drives it:
  `device_info`, `ir rx`, `ir rx raw`, `ir universal ac`, and Ctrl-C to stop. The
  dolphin becomes the easiest infrared receiver in the house — no wiring, no config,
  no board to flash. Auto-detected from its banner, with a manual override.
- **`.ir` files both ways.** Drop one in (or paste it) and it becomes ESPHome config;
  export your captures as a `.ir` file to copy onto the SD card. Verified by
  round-trip: raw timings survive byte-for-byte and NEC address/command decode
  correctly from the little-endian byte lists.
- **Five conversion targets** per capture: ESPHome, Tasmota, Pronto, `.ir`, SmartIR.
- **Capture diffing** — tick two, see which pulses moved. Reports contiguous blocks
  and reads the result: a small block means you found the setting; everything moving
  usually means a checksum.
- **Captures survive a reload** (`localStorage`), with suggested names.
- **The protocol quiz** — twelve candidates, one at a time, until the unit answers.
- The seven **Flipper repositories** worth knowing, Flipper-IRDB first.

**Also done**

- Printable **shopping card** with tick boxes and a QR code.
- The comparison table **greys out paths your drawer rules out** and shows how many
  parts each still needs.
- **Undo** for the drawer.

### 2026-07-29 — v4 · tools, and a page that talks to the board

**A second page: [The Scribe](writer/)** — `writer/`, a Web Serial console.

- Opens a serial port straight from the browser: no driver hunt, no serial monitor
  to install, nothing uploaded anywhere.
- **Identify the board** implements the ESP ROM loader protocol by hand — SLIP
  framing, the DTR/RTS reset dance, `SYNC`, then a `READ_REG` of the chip magic at
  `0x40001000` against a table from ESP8266 to ESP32-H2. Read-only, so it cannot
  hurt anything, and it proves the cable, driver, port and chip all work.
- Live log with filtering, pause, copy and save, coloured by meaning.
- **Captures**: anything that looks like an infrared code is pulled out of the
  stream, named, and turned into a paste-ready ESPHome button.
- Writes back too: a send line, and a Tasmota `IRHVAC` builder with five dropdowns
  — plus an honest note that ESPHome does not take commands this way at all.
- **It does not flash firmware, on purpose.** Reading is harmless; writing can
  brick a board, and untested flashing code has no business in a beginner's guide.
  The full plan for adding it — esptool-js vs hand-rolling, the command sequence,
  the chip-specific traps and the testing that must happen first — is in
  [todo-writer.md](todo-writer.md).

**Features finished off**

- **Side by side** — all six paths as one table, twelve rows, tap a name to open it.
- **What went wrong?** — seven symptoms, each with an ordered list of causes, most
  likely first.
- **Offline** — a service worker caches the guide, the tools and the writer page.
  It is read standing in front of an air conditioner, which is where the Wi-Fi is
  worst.
- **Markdown export** — the whole plan as a document: shopping list with checkboxes
  and links, notes, every step, and the generated YAML. Copy or save as `.md`.
- **QR code** — a byte-mode encoder written from the spec (Reed–Solomon over
  GF(256), all eight masks scored, versions 1–10 at level L). Verified by decoding
  its own output back to the original string with an independent decoder.
- **Keyboard shortcuts** — `/` search, `?` help, `g` then a letter to jump, `c` copy
  link, `p` print, `t` cycle theme, `Esc` to close.

**New ideas built**

- **Pin map** — which pins are free on the ESP32, ESP8266 and ESP32-C3, why the
  awkward ones are awkward, and click any of them to use it. Covers both the “board
  diagram” and “which pin is free?” ideas.
- **Read this log for me** — paste log lines, get them marked and explained.
- **Raw code toolbox** — paste captured timings, get a ready-made ESPHome button,
  the same code in Pronto form, and a guess at the protocol from the header
  timings. The Pronto output was checked against the canonical NEC header.
- **Running-cost estimator** — watts, duty cycle, hours and tariff in your chosen
  currency, and what one degree warmer would save.

**Bug fixed**

- The QR format-information blocks were written with rows and columns transposed,
  which produces a code no scanner can read. Found by decoding the output rather
  than by looking at it.

### 2026-07-29 — v3 · take it away

**Bugs fixed**

- The result panel cleared *every* `.pick-flag` on the page, which silently deleted
  the "pick of the bunch" badge from the Athom card in the ready-made section as soon
  as anyone touched the picker. The badges are separate classes now (`pick-flag` for
  paths, `best-flag` for devices) and the cleanup is scoped to `.path`.
- `notesFor()` treated the Ready-Made path as a non-ESPHome route, so it told anyone
  who landed there to go and find a SmartIR code file. It is ESPHome. Fixed.
- Copy buttons reset their label to the literal word "Copy" after use, so
  "Copy the list" became "Copy". They now restore whatever they said before.
- `renderAccordion()` and `renderParts()` threw if their host element was missing.
  Both guard now, like the other renderers.
- The extras section showed a second top-level `climate:` block for the temperature
  sensor. Pasting it as written produces invalid YAML — a duplicate key. It now shows
  the single `sensor:` line to add to the existing block, and says so.
- The panic-button recipe referenced `id: ac` without mentioning that the climate
  block needs that id too.
- The drawer's call-to-action said "two more questions" when there are five.
- Path and device prices were hard-coded strings, which quietly blocked the currency
  switch. All prices are numbers now; only `low` / `high` exist.

**Features**

- **Share / permalink.** State lives in `?s=<base64url>` — drawer, answers, currency,
  theme and builder settings. The address bar updates as you go, so copy-paste works,
  and there is a *Copy share link* button plus the native share sheet on mobile.
  A link always beats stored state, because someone sent it on purpose.
- **The drawer is remembered** in `localStorage` (`frostcaller.v1`), with a quiet
  toast on return so it is never spooky.
- **Print stylesheet + buttons.** *Print* in the toolbar unfolds every accordion and
  prints the whole guide black-on-white, with external URLs printed after their links.
  *Print my plan* in the result panel prints only the recommendation, its shopping
  list and its steps. Both restore the page afterwards.
- **Copy and find parts.** Every part and every finished device has a *Find it* menu
  (AliExpress, Amazon, eBay, Google, DuckDuckGo, Bing) and a *Copy name* button. The
  shopping list can be copied as plain text with prices and links, opened as searches
  all at once, and each row jumps to its card on the parts bench.
- **YAML builder** (`#builder`). Pick a board, a brand, a name and some extras and it
  writes the whole ESPHome file — correct pins per board, receiver, AHT20 sensor,
  panic button, TV button, web server. Copy or download as `.yaml`. Prefills from the
  picker, and knows that an adopted ready-made device only needs the climate block.
- **Live currency switch** — 10 currencies, applied to every price on the page.
  Fixed offline rates, labelled as such in two places.
- **Deep links.** A chain-link button on every path and chapter copies a direct URL;
  opening anything updates the address bar; `hashchange` is handled, so back and
  forward work.
- **Search across everything** (`/` to focus). One index over paths, chapters, FAQ,
  extras, flashing routes, parts, software and finished devices, plus every brand
  name in the compatibility table. Enter opens the first hit; the target opens,
  scrolls and flashes.
- **Four themes**: Frost (the original), Ember (warm), Paper (light, calm, no
  starfield — best for reading and printing) and Contrast (near-black, no glow).

**Housekeeping done**

- Brand table re-checked against the ESPHome documentation, July 2026 — all 21 rows
  still correct, including which platforms "hear back". A dated note now says so on
  the page, so the next reader knows how stale it might be.
- Prices re-read and left as mid-2026 asking prices.
- `tuya-cloudcutter` still active; the hijack path's warnings stand.

### 2026-07-29 — v2 · parts picker, ready-made options, software bench

- **"What is in your drawer?" picker**: 22 tickable items in six groups, driving path
  readiness, the split shopping list and the scoring.
- Removed the old "what is on your desk?" and "do you have Zigbee?" questions — the
  drawer is the single source of truth.
- **Sixth path: 🏁 The Ready-Made** — a blaster that ships with ESPHome on it.
- **Fully built** section: nine buy-and-forget devices compared on price, local vs
  cloud, and whether you get a real thermostat card.
- **Software bench**: 15 tools with links, including the Arduino IDE.
- **Six ways to get firmware onto the chip**, with a complete Arduino sketch and a
  `platformio.ini`.
- **Extras people ask for**: 11 recipes with config to paste.

### 2026-07-29 — v1 · first cut

- Five paths, the taste-based picker, the parts bench, seven shared chapters,
  eight FAQ entries, and the ESPHome brand table.

---

## Backlog

### Content — what still needs a human or a camera

- [ ] **Photographs.** Still the one thing that cannot be drawn: a real KY-005 with
      three wires on it, a real Atom next to a coin, and the phone-camera “is the LED
      firing” test. The SVG drawings cover the geometry; photographs would cover the
      “am I holding the right thing” question, which is different.
- [ ] **Verify the M5 Atom pin numbers** (IR on GPIO12, button on GPIO39) and the
      StickC (GPIO9 / GPIO37) against physical boards; note the revision tested. Both
      are written from documentation, and the YAML builder emits them.
- [ ] **Confirm the M5 Unit IR Grove pin split** instead of telling the reader to try
      both.
- [ ] **Translate the long chapters** into Dutch and French. The whole interface is
      now translated — both pages, down to the drawer items and the fix-it symptoms —
      so what remains is the ~14,000 words of chapters, path steps and FAQ answers.
      That wants somebody who speaks the language rather than a machine that nearly
      does. The page says so plainly rather than pretending.

### Features still open

- [ ] **Translate the log reader's explanations** (~15 strings in `LOG_LINES`). They
      annotate English log lines, so English was defensible — but the annotation is
      for the reader, and the reader may not read English.
- [ ] **A community codes page with somewhere to put them.** The local shelf and the
      export formats are done; what is missing is a server, which this site does not
      have. The honest answer — contribute to Flipper-IRDB, SmartIR or ESPHome — is
      on the page.
- [ ] **Shared build timings.** Same shape of problem: the journal is local, and
      publishing an “average build time” would need data nobody has gathered.
- [ ] **Live exchange rates**, if a no-key source that allows browser calls appears.
- [ ] **Flipper RPC over protobuf** — read and write files on the device directly
      instead of copying them onto the SD card. Much bigger than the text CLI.

### New ideas worth considering

- [ ] **A bit-field mapper** — the checksum guesser finds the check byte; the next
      step is naming the other bytes. Show the diffed bytes and let the user label
      them (“this nibble is the temperature, offset 16”), then generate the encoder.
- [ ] **Try most-significant-bit-first decoding too**, and show whichever gives a
      cleaner checksum fit. Some protocols are MSB-first and currently decode as
      noise.
- [ ] **Detect repeated frames** in a capture and offer to keep only one — many
      remotes send the message twice and the duplicate makes every later analysis
      harder.
- [ ] **A “what changed?” camera** — point a phone at the AC display, press a button,
      and diff the two photographs to confirm which setting moved. Silly, and it
      would work.
- [ ] **Print the whole guide as a booklet** with page numbers and a contents page.
- [ ] **An accessibility pass with a real screen reader.** The markup is careful and
      every control is labelled, but careful is not the same as tested.

### Housekeeping, recurring

- [ ] **Scan the QR code with a real phone.** It round-trips through an independent
      decoder, and every structural check passes, but no camera has looked at it yet.
- [ ] **Run the writer page against real hardware** — both an ESP board and a Flipper
      Zero. The ROM handshake and the Flipper CLI parsing are written from protocol
      documentation; neither has met a physical device.
- [ ] **Check the Flipper CLI output format** across official, Unleashed, RogueMaster
      and Momentum firmware. The parsers are deliberately forgiving, but forgiving is
      not the same as correct.
- [ ] **Verify the Belgian brand mappings** against real units where possible. The
      “native” rows come from the ESPHome documentation; the “try it” rows are
      informed guesses and are labelled as such.
- [ ] Bump `CACHE` in `sw.js` whenever a cached file changes.
- [ ] Re-check prices each season; currently mid-2026 asking prices.
- [ ] Re-check the exchange rates in `CURRENCIES` when they drift enough to mislead.
- [ ] Re-check the ESPHome brand table after major releases. Last checked July 2026.
- [ ] Watch `tuya-cloudcutter` device support — the hijack path ages fastest.
- [ ] Re-check that Athom still ships ESPHome pre-installed.
- [ ] Consider promoting the page from the workshop to the gallery once photographed.

---

## Conventions to keep

- **No `innerHTML` anywhere.** Text goes in via `textContent`; the `rich()` helper only
  emits `<code>`, `<strong>` and vetted `<a>` nodes, and `safeUrl()` gates every href.
- **Content is data, not markup.** Add to `PARTS`, `PATHS`, `INVENTORY`, `READYMADE`,
  `SOFTWARE`, `FLASH_ROUTES`, `FEATURES`, `CHAPTERS`, `FAQ`, `BRANDS`, `BOARDS` in
  `app.js`, `COMPARE_ROWS`, `SYMPTOMS`, `LOG_LINES`, `PINMAP` in `tools.js`,
  `CLIMATE`, `DEVICES`, `FLIPPER_REPOS` in `data-brands.js`, or `STRINGS` and
  `CONTENT` in `i18n.js` — never to `index.html`.
- **Script order matters** and is fixed by `defer`. The guide loads `i18n.js`,
  `text.js`, `ui.js`, `data-themes.js`, `data-brands.js`, `data-guide.js`,
  `data-chapters.js`, `diagrams.js`, `app.js`, `tools.js`, `planner.js`. The writer
  loads `../i18n.js`, `../i18n-writer.js`, `../text.js`, `../ui.js`,
  `../data-themes.js`, `../data-brands.js`, then its own three. All classic scripts
  sharing one global scope. Do not turn any of them into a module without fixing all
  of them — and do not declare the same `const` in two files, which is an instant
  blank page.
- **Which file does a change belong in?** Prose, prices and links → `data-guide.js`.
  Interface words → `i18n.js`, or `i18n-writer.js` if only the console says it.
  Anything both pages need → `text.js` (markup) or `ui.js` (toast, clipboard,
  download, starfield). Everything else is machinery.
- **The guide must never reference a `w.*` key.** They are not loaded there.
- **Never edit these files with PowerShell string operators.** `Get-Content`/`-replace`
  reads UTF-8 as ANSI and writes a BOM back — it corrupted sw.js once already. Use
  Python with explicit UTF-8, or an editor.
- **The fix-it causes are keyed by position** (`fix.noport.0.t`). Rewording the
  English is safe; reordering or inserting causes shifts every key after it — append
  instead, or renumber the translations in the same change.
- **The comparison table judges English, displays translation.** `row.good(v)` runs
  on the raw English value before `tc()` — keep it that way or the ✓-highlighting
  breaks in Dutch and French.
- **`rich()` does not nest.** `**[a](b)**` renders as bold raw markup, not a bold
  link. Pick one. This has caused a visible bug once already.
- **Anything rendering author text must go through `rich()`**, not `textContent` —
  otherwise backticks and asterisks appear literally on screen. Table cells, accordion
  titles and search snippets have all been caught doing this.
- **`hidden` is guarded globally** by `[hidden] { display: none !important; }`. Do not
  remove it: any class that sets `display` silently defeats the attribute otherwise.
- **Grid items do not shrink below their content** unless you say so. Any grid holding
  a code block needs `minmax(0, 1fr)` on the track and `min-width: 0` on the item.
  This has now bitten twice.
- **New interface text needs a key in all three languages**, or at least in `en` — it
  falls through, but a missing Dutch string is a visible seam.
- **Adding a key is only half the job.** A translation that nothing references is
  invisible, and that is how the whole hero stayed English through two releases. After
  any i18n change, run the audit: it parses the three blocks, reports duplicates and
  gaps, and cross-references every `t()`, `tv()` and `data-i18n*` against them. It
  must report zero missing *and* zero unused.
- **Do not put `data-i18n` on an element JavaScript also writes to.** The static pass
  runs on every language change and would overwrite live state — the console's status
  pill and the pause button both have to be set from code instead.
- **A renderer that draws words must be in the redraw list.** `rerenderEverything()`
  on the guide and `redrawTranslated()` on The Scribe. A panel left out of it shows
  whichever language happened to be saved when the page loaded, and never changes.
  Seven panels were in exactly that state.
- **Redrawing must not re-wire.** If a render function attaches listeners, guard them
  with `dataset.wired` — otherwise every language change adds another copy.
- **Verifying a JS change needs `Network.clearBrowserCache`.** `setCacheDisabled` and
  the service-worker bypass are not enough on their own: a cache-busting query on the
  page URL does not touch the script URLs, so the browser happily keeps running the
  old `flipper.js`. This has produced false "the fix does not work" results three
  times now. Check `someFunction.toString()` in the page when a fix looks inert.
- **The writer page shares nothing with the guide** except CSS. That is deliberate:
  it must keep working if `app.js` is rewritten.
- **Prices are numbers** (`low` / `high`, in euros). Never write a currency symbol into
  data, or the currency switch will lie.
- **A new path needs an `inv` block**, or the drawer will report it as buildable with
  nothing.
- **A new part needs a `PART_CAP` entry**, or owning it will not remove it from the
  shopping list.
- **A new board needs every pin field** (`tx`, `rx`, `sda`, `scl`, `btn`) — the builder
  reads them blindly.
- Path display order lives in `PATH_ORDER`, not in the array order.
- Anything searchable needs an `id` and an entry in `buildSearchIndex()`.
- Shop links are always **searches**, never seller or affiliate links.
- Themes only re-point CSS custom properties under `:root[data-theme="…"]`. If a theme
  needs a new rule, the base styling is probably too hard-coded — fix that instead.
- The permalink keys (`o`, `a`, `c`, `t`, `b`) are a format. Changing their meaning
  breaks every link anyone has shared — add new keys, never repurpose old ones.

## Testing

1. `python -m http.server 8777 --bind 127.0.0.1` from `c:\Temp\Git\rami.party`
2. Open `/workshop/frostcaller/` with the HTTP cache disabled — a plain reload will
   happily keep running the previous `app.js` and you will debug a ghost. In Playwright:
   CDP `Network.setCacheDisabled`, then `goto('about:blank')` and back.
3. Check: drawer chips toggle, re-price and survive a reload; a full drawer says
   "nothing to buy"; the currency switch changes every price on the page and does not
   fold open paths; `?s=` alone restores everything with `localStorage` cleared;
   search finds a brand name; every deep link opens and flashes its target; the
   builder emits valid YAML for all six boards; print and print-plan set and then
   clear their body classes.
4. Walk all four themes and check contrast on the code blocks, chips and the caveat
   panels — Paper and Contrast are the ones that break first.
