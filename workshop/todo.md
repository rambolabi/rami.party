# 🗂️ rami.party — Master TODO

> Consolidated backlog for **every** project folder in this repository: remaining tasks,
> planned features, and known bugs — each with a concrete fix.
>
> Compiled: 2026-07-27 · Sources: root `followUp.md`, every per-project `todo.md` /
> `README.md`, plus a live audit of `projects.js`, asset references and SEO files.
>
> Legend: `[ ]` open · `[~]` partially done · **🐞 BUG** = confirmed defect · **🔗** = wiring/registry gap

---

## ✅ Implemented on 2026-07-27

Everything in §0 except 0.12 has landed, plus §9 and the registry drift in §7/§8.
Verified over a local static server: **34/34 sitemap URLs return 200, zero broken asset
references site-wide, zero console errors across the hub, Workshop, Wastelands, D&D Forge,
The People Library, IT Tools, the CVE page and the GhostTooth relic.**

| Done | What changed |
|---|---|
| 0.1 | `workshop/D&D Forge/` → **`workshop/dnd-forge/`** (`git mv`), registered in `RAMI_WORKSHOP`, stale `RAMI_PLANNED` entry removed |
| 0.2 | **The People Library** registered as one catalogue entry; stale *DISC Profile* planned entry removed |
| 0.3 | `sitemap.xml` rewritten — 34 real URLs, `soon`/noindex pages excluded |
| 0.4 | `noindex` lifted on 14 content pages + canonicals added; 404, admin, DM companion screens, laser-forge-v2 and the GhostTooth relic stay noindex |
| 0.5 | CVE page's absolute `/style.css` → `../style.css` |
| 0.6 | User-visible lebon.info branding rebranded; cross-origin favicon dropped |
| 0.7 | **False alarm** — BBQ uses `mailto:`, no backend needed (see below) |
| 0.8 | `followUp.md` rewritten as a decisions-only document |
| 0.9 | GhostTooth relic: stale back-link fixed, noindex + canonical to the live site, now reachable from the Wastelands |
| 0.10 | `status:'soon'` set on Laser Works, Laser Forge v2, Window View, Tinkerer's Desk |
| 0.11 | `RAMI_PLANNED` grown to five real ideas |
| 7, 8 | Markdown Scribe description corrected (no more "powered by showdown"); Disk Filler catalogue item ticked |
| 9 | Laser Works: **18 broken images fixed** with local SVG placeholders |

**Still open:** 0.12 (per-project READMEs), the two new findings in §0.13–0.14, and every
per-project section from §1 onward.

---

## 📋 Contents

| # | Area | Open items |
|---|---|---|
| [0](#0-site-wide--critical) | Site-wide / critical | 3 |
| [1](#1-laser-forge-v1-workshoplaser-forge) | Laser Forge (v1) | 12 |
| [2](#2-laser-forge--direct-control-v2-workshoplaser-forge-v2) | Laser Forge · Direct Control (v2) | 40 |
| [3](#3-3d-forge-workshop3d-forge) | 3D Forge | 16 |
| [4](#4-dd-forge-workshopdnd-forge) | D&D Forge | 21 |
| [5](#5-loregate--dm-screen-workshopdm-screen) | Loregate (DM Screen) | 10 + 18 ideas |
| [6](#6-mail-headers-workshopmail-wardanalyzer) | Mail Headers (now Mail Ward · analyzer) | 16 |
| [7](#7-markdown-scribe-workshopmd) | Markdown Scribe | 8 |
| [8](#8-disk-filler-workshopfill) | Disk Filler | 4 |
| [9](#9-laser-works-workshoplaser) | Laser Works | 3 |
| [10](#10-the-people-library-workshoppersonality-library--15-book-workshops) | The People Library (15 workshops) | 2 |
| [11](#11-tapfate--random-first-player-wastelandrandom-first-player) | TapFate / Random First Player | 6 |
| [12](#12-ghosttooth-copy-wastelandbluetooth) | GhostTooth copy (wasteland) | 1 |
| [13](#13-projects-with-no-todo-file--audit-needed) | Undocumented projects | audit |

---

## 0. Site-wide / critical

### ✅ 0.1 — D&D Forge is completely orphaned — **FIXED**
The folder was renamed `D&D Forge/` → **`dnd-forge/`** with `git mv` (a space and an `&` in a
path must be percent-encoded everywhere — a permanent source of broken links), and registered
in `RAMI_WORKSHOP` with glyph 🐉, aura gold and a keyword-rich hidden `search` string. The
stale `{ name: 'D&D', … }` entry was removed from `RAMI_PLANNED`.

### ✅ 0.2 — The People Library + 15 book workshops orphaned — **FIXED**
Added **one** catalogue entry (`./personality-library/`, glyph 🧠) rather than 15 near-identical
cards, because the library page is already a good hub for them. The stale
`{ name: 'DISC Profile', … }` planned entry was removed.

### ✅ 0.3 — `sitemap.xml` advertised pages that do not exist — **FIXED**
Rewritten from 6 URLs (4 of which 404'd) to **34 real, verified URLs**. `status:'soon'` realms,
`external:true` realms and every noindex page are deliberately excluded, and the file carries a
header comment explaining the rule. All 34 verified 200 over a local server.

### ✅ 0.4 — The whole site was `noindex` — **FIXED (publish)**
`followUp.md` already recorded the plan ("flip `robots` off `noindex`, refresh `sitemap.xml`…,
add canonical URLs"), so that is what was done.

- **Now `index, follow` + canonical:** `/`, `/workshop/`, `/wasteland/`, `/gallery/lore/`,
  `/gallery/prankscreens/`, `3d-forge`, `batlistener`, `character-forge`, `dm-screen`,
  `dm-screen/guide.html`, `DNS-sinkhole`, `Engraving`, `laser-forge`, `todo`, `dnd-forge`,
  `personality-library`.
- **Deliberately still noindex:** `404.html`, `admin/` (private), `dm-screen/player.html` and
  `dm-screen/characters.html` (second-monitor companion screens), `laser-forge-v2/`
  (canonical → v1, duplicate content) and `wasteland/bluetooth/` (canonical →
  ghosttooth.labidi.eu).

> **To reverse:** put `content="noindex, nofollow"` back in those 16 files. Nothing else
> depends on the change.

### ✅ 0.5 — `workshop/tools/cve/` loaded a stylesheet that doesn't exist here — **FIXED**
`href="/style.css"` (a lebon.info leftover that resolved to the *hub* stylesheet) →
`href="../style.css"`. The terminal theme now renders correctly.

### ✅ 0.6 — Residual lebon.info branding — **FIXED (user-visible strings)**
Rebranded: the IT Toolkit `<title>`, the CVE `<title>` and shell prompt, and the
"📍 lebon.info" verified-stamp in three places (`tools/index.html`, `tools/script.js`,
`tools/style.css`, `news/theme.css`). The cross-origin favicon
`https://lebon.info/logoConsole.png` was swapped for the local `/favicon.svg`.

**Deliberately kept:**
- Real external links to tools genuinely hosted there — `scan.lebon.info`, `note.lebon.info`,
  `lebon.info/project/`.
- Source-comment attributions such as `/* Based on lebon.info Terminal Theme */` in
  `webcheck/style.css`, `webcheck/about.html` and `wasteland/bluetooth/style.css` — accurate
  history, not a stale reference.
- `BBQ@lebon.info` in the BBQ mailer — a real recipient address.

### ✅ 0.7 — BBQ Mailer "has no backend" — **FALSE ALARM, no change needed**
The original note in `followUp.md` was inherited from the *lebon.info* version, which posted to
`submit.php`. The copy here does not: `sendEmail()` in [bbq/script.js](bbq/script.js#L1637)
builds a `mailto:` URL and hands it to the OS mail client. **That works perfectly on static
hosting.** The catalogue entry stays `status:'live'`, local, and unchanged.

### ✅ 0.8 — `followUp.md` was stale — **FIXED**
Rewritten as a **decisions-only** document: current structure, a decision table with the
reasoning behind each choice made today, the add-a-project recipe, and six genuinely open
human decisions. The task backlog now lives here.

### ✅ 0.9 — Duplicate GhostTooth — **RESOLVED (keep as a relic)**
- 🐞 Fixed a stale back-link: `wasteland/bluetooth/` pointed at `/workshop/` even though the
  folder lives in the Wastelands — now `/wasteland/`.
- Added `robots: noindex, follow` + `canonical → https://ghosttooth.labidi.eu/` so the relic
  cannot compete with the live site for the same search terms.
- The three "reborn elsewhere" cards (GhostTooth, Huiskeuring, TapFate) linked **only** to their
  new external homes, leaving the preserved husks unreachable. Each now has a secondary
  "… or poke the husk that stayed behind" link (`.realm-relic` in `style.css`).

### ✅ 0.10 — Per-project completeness pass — **FIXED**
`status:'soon'` set on **Laser Works** (no photography), **Laser Forge · Direct Control** (a
verbatim copy of v1), **Window View** (a stub) and **Tinkerer's Desk** (a scratch page). Their
descriptions were reworded so the copy matches reality.

### ✅ 0.11 — Grow `RAMI_PLANNED` — **FIXED**
Now five entries: *Screen Fill*, *Boolean Bench*, *Sitemap Scribe*, *Realm Sentinel*,
*Colour Grimoire* — three of which are tools that would automate maintenance chores found
during this audit.

### 0.12 — Add a `README.md` per project folder
Still open. Only 7 of ~45 project folders have one, so nobody can tell what `dashboard_v1`,
`rami`, `to-check`, `trace-results` or `clear` are without opening the code.

**Fix** — drop a 5-line README in each: what it is, how to run it, current status. Best done
as part of the §13 audit rather than as a bulk commit of empty stubs.

### 🆕 0.13 — 44 pages depend on third-party CDNs, breaking the offline-first promise
Every Forge advertises "100% client-side, offline-first, no tracking", yet **44 HTML pages**
load `fonts.googleapis.com` (and the DISC workshop loads Chart.js from a CDN). That means:
every visitor's IP goes to Google, the pages render with fallback fonts offline, and a PWA
install can never be truly offline.

**Fix**
1. Download the four font families actually in use (Quicksand, Cinzel / Cinzel Decorative,
   EB Garamond, Fraunces + Inter) as `woff2` into a shared `/fonts/` folder.
2. Add one `@font-face` block per family to `theme.css`, then delete the `<link
   rel="preconnect">` / `<link href="https://fonts.googleapis.com/…">` pairs.
3. Vendor `chart.min.js` locally for the DISC workshop (or replace the radar with a small
   hand-rolled canvas renderer — it draws one polygon).
4. Verify with DevTools → Offline → hard reload on `/`, `/workshop/laser-forge/` and
   `/workshop/personality-library/`.

### 🆕 0.14 — `wasteland/index.html` is hand-written while everything else is data-driven
The hub and the Workshop both render their cards from `projects.js` via `window.cardMarkup`,
but the Wastelands index has its seven cards hard-coded in HTML. They have already drifted:
the hand-written page lists GhostTooth, Huiskeuring and TapFate, while `RAMI_REALMS` does not.

**Fix** — give the wastes realms the same treatment: move the seven cards into `RAMI_REALMS`
with `category:'wastes'`, add an optional `relic: './bluetooth/'` field for the "poke the husk"
link, and render `wasteland/index.html` from the registry with `cardMarkup`. One source of
truth, and `sitemap.xml` becomes generatable (see *Sitemap Scribe* in `RAMI_PLANNED`).

---

## 1. Laser Forge (v1) — `workshop/laser-forge/`

v1 is shipped and feature-complete. Remaining backlog:

### Performance
- [ ] **Move heavy work to Web Workers.** Dithering, tracing and raster G-code block the UI on
      large images.
      *Fix:* move `js/image/dither.js`, `js/image/trace.js` and the raster branch of
      `js/export/gcode.js` into `js/workers/`; post `ImageData` via transferable buffers; add a
      progress bar driven by `postMessage` ticks.

### Editor
- [~] **Multi-select + align/distribute/group + snapping.** Numeric grid *Array* is done; the
      rest is pending. *Fix:* see [2.1](#21-track-a--editor-backlog) — build it in v2 and
      back-port, or skip in v1.
- [ ] **Boolean operations** (union/subtract/intersect). *Fix:* the raster-mask helper
      `booleanObjects(objs, mode)` already exists — it just needs a toolbar and multi-select.
- [ ] **Origin selector** — which corner/centre the machine treats as (0,0).
      *Fix:* add to the artboard settings, render a marker, feed into the G-code writer.
- [ ] **On-canvas rulers** (mm) along top/left, following zoom/pan.
- [ ] **LPI / line-interval preview** overlay for raster scan engraving.

### Import / export
- [~] **DXF/SVG import.** Trace-to-vector produces an editable path; real file parsing is missing.
      *Fix:* write `js/import/svg.js` (parse `path|rect|circle|polygon|line`) and
      `js/import/dxf.js` (R12 `LINE|LWPOLYLINE|CIRCLE|ARC`) → objects.
- [ ] **Live export preview** in the export dialog (render the exact per-format result).
- [ ] **EAN/UPC barcodes** — only Code 128 subset B ships.
      *Fix:* add the check-digit algorithms in `js/qrbarcode.js`.

### Content
- [ ] **Material presets** (wood / acrylic / slate / leather / anodized / coated metal / glass)
      that pre-load dither + contrast + invert + suggested speed/power.
- [ ] **Image-into-puzzle** — drop a photo, auto-slice it across the pieces so each piece
      engraves its own slice.
- [ ] **Rep-tile explorer** (L-tromino, sphinx…) plus Escher/Penrose tessellations.
- [ ] **Auto assembly-key sheet** for numbered/lettered puzzle pieces.

### Accessibility
- [ ] **a11y pass** — ARIA labels on every control, visible focus states, honour
      `prefers-reduced-motion`.

### Validation (definition of done — none verified on hardware yet)
- [ ] SVG imports at correct real-world size in LightBurn & Inkscape (no scale prompt).
- [ ] DXF opens with correct units in LibreCAD / RDWorks.
- [ ] PNG/BMP dithered photo engraves cleanly in LaserGRBL at the chosen DPI.
- [ ] Colour→operation layers map automatically in LightBurn & Glowforge.
- [ ] G-code runs a dry-frame correctly on a GRBL test bench.
- [ ] Verify **zero network calls** in DevTools.

---

## 2. Laser Forge · Direct Control (v2) — `workshop/laser-forge-v2/`

> Currently a **verbatim copy of v1** rebranded "Direct Control · v2". None of the v2 work is
> built yet.
> ✅ **Fixed 2026-07-27:** the catalogue entry was `status:'live'` with copy promising Web Serial
> control that does not exist. It is now `status:'soon'` (locked teaser), the description says
> "still on the workbench", and the page is `noindex` with a canonical pointing at v1 so the
> duplicate doesn't compete in search. Flip both back when §2.3 lands.

### 2.1 Track A — editor backlog
- [ ] **Multi-select.** Replace `store.selectedId` with `selectedIds` (keep a back-compat
      getter); Shift/Ctrl-click to toggle; marquee drag on empty canvas.
- [ ] **Group transforms** — move/scale/rotate around the combined bbox; keep numeric fields
      for single selection.
- [ ] **Align** (L/C/R, T/M/B) + **distribute** (h/v) + **group/ungroup**.
- [ ] **Snapping** to grid, object edges/centres, artboard centre/edges (Pro-mode toggle).
- [ ] **Boolean ops UI** — wire `booleanObjects(objs, mode)` to a multi-select toolbar; emit one
      editable path object; single undo commit; preserve the primary object's op/layer.
- [ ] **Rulers**, **origin selector**, **LPI preview**, **material presets** (same as §1).
- [ ] **SVG import**, **DXF import**, **live export preview**, **a11y pass**, **Web Workers**.

### 2.2 Track B — platform
**PWA / offline**
- [ ] `manifest.webmanifest` — name, `short_name: "Laser Forge"`, `start_url: "./"`,
      `scope: "./"`, `display: "standalone"`, `theme_color: #0b0524`, `background_color: #06030f`,
      icons 192 / 512 / maskable-512. Add `<link rel="manifest">`.
- [ ] `sw.js` — `install` pre-caches a versioned explicit shell list (`CACHE='laserforge-v1'`);
      `activate` deletes old caches; `fetch` is cache-first for same-origin assets and **never**
      caches exports. Register from `main.js` behind `'serviceWorker' in navigator`.
- [ ] **Bundle Quicksand locally** and drop the `fonts.googleapis.com` link — required for true offline.
- [ ] Offline verification (DevTools → Offline → full reload boots **and** exports).
- [ ] "Update available — reload" toast when a new SW is `waiting`.

**File System Access API**
- [ ] Capability check `('showSaveFilePicker' in window)` with graceful fallback to today's
      Blob download + `<input type=file>`.
- [ ] **Open** keeps a live `FileSystemFileHandle`; **Save** → `createWritable()` writes back with
      no re-prompt; **Save As** picks a new handle.
- [ ] Dirty tracking (`●` in the title, warn on unload); re-request permission when
      `queryPermission() !== 'granted'`.
- [ ] **Recent files** — persist handles in IndexedDB (they're structured-cloneable).

**Plugin hooks**
- [ ] `LaserForge.registerGenerator({ type, label, icon, defaults, properties, localLoops })`
      with a declarative property schema → auto-built panel; wire into `objects.js` dispatch and
      `main.js` toolbar/`typeHTML`.
- [ ] `LaserForge.registerDialect({ id, name, header, moveOn, moveOff, … })` — extract the GRBL
      writer into a dialect descriptor; ship GRBL / Marlin-laser / Smoothieware; flag Ruida RD
      experimental (binary format needs its own encoder).
- [ ] Persist plugins in IndexedDB; enable/disable/remove panel.
- [ ] ⚠️ **"Run untrusted code?" gate** with a restricted API surface (no network, canvas-only
      DOM). Do not ship plugin loading without this.

### 2.3 Track C — browser → laser control (Web Serial)
- [ ] **Connect** — serve over HTTPS; `navigator.serial.requestPort()` behind a user gesture;
      open @115200; toggle DTR; send `\r\n\r\n`; detect the `Grbl 1.1…` banner.
- [ ] Raw serial **console** panel.
- [ ] **Character-counted streamer** — track GRBL's 128-byte RX budget; only send a line when it
      fits; increment on send, decrement on each `ok`/`error`.
- [ ] Progress bar + **ETA** (reuse the v1 cost/time estimator) + error surfacing + safe stop.
- [ ] **Status/DRO** — poll `?` at ~5 Hz, parse `<State|MPos|WPos|FS>`, show a state pill
      (Idle/Run/Hold/Alarm).
- [ ] **Motion** — jog pad (X/Y/±, step size), Home `$H`, Unlock `$X`, Set origin `G10 L20`,
      Go-to-origin.
- [ ] **Frame / trace bounding box** at low power; run the material test grid directly.
- [ ] **Overrides** (feed/power/rapid bytes `0x90…`/`0x99…`), Run / Pause `!` / Resume `~` /
      Soft-reset `0x18`, always-visible **E-STOP**.
- [ ] **Machine profiles** — bed size, `$$` read/write, dialect selection.
- [ ] 🔴 **Safety gate (blocking — must land *with*, not after, first streaming)**
      - explicit "I understand" agreement (rated eyewear, never unattended, fume extraction, fire
        suppression);
      - soft-limit / travel checks against the profile **before** streaming;
      - watchdog that auto-issues `M5` + feed-hold on disconnect, tab-hide/blur or lost status,
        and requires an explicit re-arm.
- [ ] **Fallbacks** — WebUSB and Web Bluetooth paths where Web Serial is unavailable.

### 2.4 Build order
A1→A2 → A3 → A4 → B1 → B2→B3 → C1→C2→C3 → C4→C5 → C6→C7 → C8 → C9.

### 2.5 Definition of done
- [ ] v1 parity preserved — every export still valid, no console errors.
- [ ] Multi-select, align/distribute/group, snapping and booleans all undo cleanly.
- [ ] SVG/DXF import round-trips at correct real-world size.
- [ ] Installs as a PWA and boots + exports fully offline.
- [ ] Save writes back to the same file; Recents re-open with permission.
- [ ] Plugin generator + custom dialect load, run and persist behind the trust gate.

---

## 3. 3D Forge — `workshop/3d-forge/`

v1 shipped (watertight validator, STL/3MF/OBJ/PLY/AMF, lithophane, heightmap, QR→3D).

### Biggest capability gaps
- [ ] **CSG booleans** (union / difference / intersection) — *the* missing feature: cutting
      holes, merging text onto a base, emboss/deboss.
      *Fix:* implement `js/scene/boolean.js` (BSP-tree CSG over the existing `Mesh` type), then
      re-run the watertight validator on the result.
- [ ] **Logo/photo → extruded outline tool.** The tracer already exists in `js/image/trace.js`;
      just add a toolbar button that traces an uploaded bitmap and pipes contours into
      `geometry/extrude.js` (stencils, cookie cutters, keychains, badges).
- [ ] **Templates gallery** — keychain/name-tag, cookie cutter (outline → walls + base), stamp
      (mirrored relief), coin/medallion, fridge-magnet pocket, cable label.

### Geometry / meshing
- [ ] **Dome + 4-panel box lithophane** shapes + a night-light base generator.
- [ ] **Mesh decimation** slider + triangle-budget readout (lithophanes explode triangle counts).
- [ ] **Wall-thickness / min-feature checker** against a chosen nozzle Ø, with red highlight.
- [ ] **Text-on-a-path / on-a-ring**, per-letter bevel/chamfer, outline (shell-only) text.

### Scene / workflow
- [ ] **Auto-arrange / pack** objects on the plate without overlap; array/duplicate grid.
- [ ] **Snap & align tools**, measurement/ruler overlay, section/clip plane.
- [ ] **Shareable links** (compress the project into the URL hash, like Laser Forge).
- [ ] **Web Worker meshing** for big photos + progress bar; OffscreenCanvas rendering.

### Export
- [ ] **Multi-material / AMS** — per-object colour is already stored; emit a 2-colour 3MF as
      separate objects/plates (QR base vs modules, 2-tone text).
- [ ] **glTF/GLB** export (AR quick-look / sharing); **STEP** export (hard, later).
- [ ] **Optional G-code slicer** (Phase 6) — planar perimeters + infill + supports, printer
      profiles, and a very loud "verify before printing" banner.
- [ ] **Supports/brim hint preview** + estimated print-time heuristic.

### Polish / validation
- [ ] Full **a11y pass** + **NL/FR strings** (only the chrome is translated today).
- [ ] **Real-world print tests** — lithophane light/dark polarity, phone-scan a printed QR,
      PLY vertex colours in Meshmixer.

---

## 4. D&D Forge — `workshop/dnd-forge/`

v1.6 shipped. ✅ Surfaced on the hub and renamed — see [0.1](#-01--dd-forge-is-completely-orphaned--fixed).

### 🐞 Bugs / risks
- [x] ~~**Folder name contains `&` and a space.**~~ **Fixed** — renamed to `dnd-forge/` via
  `git mv`, so history is preserved and no URL needs percent-encoding.
- **Older editions are fake.** 1E / 2E / 3.5 / 4E all reuse adapted 5E SRD data. THAC0, 3.x skill
  points and 4E powers are not modelled — only an on-screen "approximation" note covers this.
  *Fix:* either implement per-edition rules modules, or demote those options to a clearly
  labelled "5E-flavoured approximation" group so users aren't misled.
- **Catalog is a subset.** SRD has ~319 spells; 141 ship. Subraces/subclasses/items likewise.

### Rules engine
- [ ] **Multiclassing** with prerequisite validation.
- [ ] **Skill-point allocation UI** for point-based editions (3.x).
- [ ] **Known/prepared spell limits** validation (prepared vs known casters).
- [ ] **Validation & guidance** — warn on illegal choices, show prerequisites, "points remaining"
      counters.
- [ ] **Warn + optionally migrate** when switching edition mid-build.
- [ ] **Full per-level class-feature trees**.

### Equipment
- [ ] **Starting equipment** — choose class/background packs *or* roll gold and buy.
- [ ] **Attunement tracking** + magic items (rarity, bonuses).
- [ ] **Ammunition tracking**.
- [ ] **Homebrew custom weapon/item creator**.

### Magic
- [ ] **Homebrew custom spell creator**.

### App / UX
- [ ] **Undo/redo** (autosave exists, undo does not).
- [ ] **Global search** across spells, feats, items and rules.
- [ ] **Tooltips / rules reference** on hover for every term (SRD text).
- [ ] **PWA / service worker** for offline play (`manifest.webmanifest` already exists —
      just add `sw.js` + registration).
- [ ] **Accessibility** — keyboard nav, ARIA, high-contrast mode, screen-reader labels.
- [ ] **Homebrew mode** — custom races/classes/backgrounds.
- [ ] **i18n** (EN/NL/FR to match the other realms).
- [ ] **Self-host the fonts.** Cinzel / Cinzel Decorative / EB Garamond come from Google Fonts,
      so the app is not actually offline-capable and every visitor's IP leaks to Google.
      See [0.13](#-013--44-pages-depend-on-third-party-cdns-breaking-the-offline-first-promise).

---

## 5. Loregate — DM Screen — `workshop/dm-screen/`

### Polish / follow-ups (approved)
- [ ] Persist **per-panel open/closed state** between sessions.
- [ ] **Undo/redo for map edits** beyond drawings — token moves, terrain painting, fog.
      *Fix:* snapshot the location object into a bounded history stack in `store.js`.
- [ ] **Touch-friendly drag on tablets** — pointer events are wired; needs on-device testing.
- [ ] **Larger prop art / directional walls** instead of emoji + terrain walls.
- [ ] **Multi-cell wall-drawing tool** (click-drag a wall line).
- [ ] **Measurement tool** — snap to grid centres; support diagonal rules (5-5-5 vs 5-10-5).
- [ ] **Per-token vision** so dynamic light only reveals line-of-sight.
- [ ] **Confirm-before-overwrite** when importing a campaign.
- [ ] **De-duplicate the map renderer** — currently duplicated between `dm.js` and `player.js`.
      *Fix:* extract into a shared module; prerequisite for multiplayer.

### Multiplayer (separate project — planned, not started; see `multiplayer.md`)
- [ ] Decide the transport: **WebSocket relay** (recommended; DM browser stays authoritative) vs
      WebRTC P2P (still needs STUN/TURN + signalling).
- [ ] Extend state with `players[]` (sheet, hp, conditions, inventory, `tokenId`) + `room`.
- [ ] Build `join.html` (room code + name) and `play.html` (player sheet, HP, inventory, live map,
      dice, notes).
- [ ] Add `net.js` on top of `store.js`; keep `BroadcastChannel` for same-machine sync.
- [ ] 🔒 **Enforce permissions on the authority side** — never trust the client. Accept
      "move token X" only when `X === player.tokenId`.
- [ ] Presence, per-player cursor/laser, optimistic updates + reconciliation, snapshot
      persistence, DM secret + per-player tokens.
- **Open questions:** self-host the relay or use a managed service? How much of 5e to model?
  Do players see each other's full sheets? Late-join/conflict resolution? Multiple rooms?

### Researched ideas awaiting go-ahead
Handouts/image reveal · soundboard & ambient audio · combat automation · area templates
(cone/circle/line) · movement & reach presets with auto path distance · line-of-sight walls ·
3D dice tray with shared history · initiative with delay/ready/group/lair actions · journal with
revealable secrets · scene "moods" (weather + light + audio in one click) · explored-vs-visible
memory fog · token status auras · hex + gridless maps · map image import with auto grid
alignment · encounter builder with CR/XP budget · weather intensity + wind direction.

---

## 6. Mail Headers — `workshop/mail-ward/analyzer/`

> **Moved 2026-07-31.** This tool is no longer a standalone project: it is now the second
> page of **Mail Ward** (`workshop/mail-ward/`), alongside the SPF/DKIM/DMARC guide and the
> volume dashboard. `workshop/mailheaders/` is now a noindex redirect stub. The backlog below
> still applies — see `workshop/mail-ward/analyzer/todo.md` for the tool's own notes.

### 🐞 Known limitations to verify or fix
- [ ] **Organizational-domain check** uses a small built-in two-part-TLD list, not the full Public
      Suffix List — exotic ccTLDs may mis-align.
      *Fix:* bundle a trimmed offline PSL as `js/data-psl.js` (see also the last item below).
- [ ] **MIME parser is pragmatic, not RFC-complete** — `message/rfc822` nesting and RFC 2231
      filenames are only partly handled.
- [ ] **Large base64 attachments hash on the main thread** → UI freeze.
      *Fix:* move SHA-256 hashing + large-body parsing into a Web Worker.
- [ ] **Rare legacy charsets** fall back to latin1 (`TextDecoder` limitation).

### Feature backlog
- [ ] Decode **RFC 2047 encoded-words** (`=?utf-8?B?…?=`) in Subject / From display names.
- [ ] Extract & list **all body URLs** with per-link opt-in VirusTotal/urlscan lookups; flag
      look-alike/punycode link domains and mismatched anchor-text vs href.
- [ ] Detect **tracking pixels** (1×1 images / known trackers) and list them explicitly.
- [ ] Highlight **reverse-DNS (PTR) vs HELO** name mismatches per relay hop.
- [ ] Bundle an **offline Public Suffix List** for accurate organizational-domain alignment.
- [ ] Flag **forged `Received` chains** (private-IP origin, impossible timestamps, missing hops).
- [ ] Parse & display **DMARC/DKIM policy tags** (`p=`, `sp=`, `adkim`/`aspf`, selector, key length).
- [ ] Bundled **homoglyph/confusable table** to score look-alike domains offline.
- [ ] **Header anomaly scan** — duplicate `From`, bare-newline injection, oversized header count.
- [ ] **Message-ID domain vs From domain** consistency check.
- [ ] **"Copy as defanged"** output (`hxxp://`, `[.]`) for safe sharing in tickets.
- [ ] **Shareable permalink** encoding the report in the URL hash (local only, no upload).

---

## 7. Markdown Scribe — moved to `md.labidi.eu`

> 🚚 **Moved 2026-07-30.** Markdown Studio outgrew the workshop and now lives at
> **<https://md.labidi.eu/>**, with an English, Dutch and French interface. `workshop/md/`
> is a tombstone: a redirect page plus a service worker that clears the old cache-first
> installation, exactly like `workshop/OASIS/`. The registry entry is now `external: true`
> and the sitemap URL is gone.
>
> ✅ **Registry drift fixed 2026-07-27.** The `projects.js` entry claimed it was "powered by
> showdown" long after that CDN dependency was replaced by a hand-written parser. The
> description and hidden `search` string now say "fully offline and dependency free" and list
> the real feature set (themes, TOC, slash commands, find & replace, tabs, lint, diagrams, vim,
> PWA).

- [x] ~~Move it out of the workshop and give it its own domain.~~
- Remaining work now lives in that repository's own `todo.md` — language-specific
  highlighting grammars, more diagram types, caret-accurate slash menu, export/import
  bundles, Vim leader mappings, an Emacs mode, drag-to-reorder and word-count goals.

---

## 8. Disk Filler — `workshop/fill/`

- [x] ~~Add it to the workshop catalogue~~ — it was **already listed** as *Disk Filler*; the stale
      unchecked line in [fill/todo.md](fill/todo.md) has been ticked.
- [ ] Swap emoji cats for real cat images/GIFs (the original used photos).
- [ ] Add a real `trololo` audio file instead of the synthesised loop.
- [ ] **Cross-browser spot-check on Safari/iOS and Firefox** (quota + audio behaviour) — the
      quota cap differs per browser and the page currently asserts one number.
- [ ] Decide whether to state that the reached cap differs per browser.

---

## 9. Laser Works — `workshop/laser/`

### ✅ 18 broken images — **FIXED**
The page referenced `./media/*.jpg` fifteen times with **no `media/` folder at all**, plus a
`/api/placeholder/50/50` header logo, a `/api/placeholder/40/40` footer logo, and an
`<img src="">` lightbox element that made the browser re-request the page itself.

**What was done**
- Added four hand-drawn SVG placeholders in the page's own palette (`#121212` / `#8B4513` /
  `#A0522D`): `placeholder-wide.svg` (hero, motif only — no text, so it works as a full-bleed
  background), `placeholder-card.svg` (services + gallery, labelled "PHOTOGRAPH PENDING"),
  `placeholder-portrait.svg` (testimonial avatars) and `logo.svg`.
- Repointed all 17 `<img>` tags; removed the empty `src=""`.
- Set the catalogue entry to `status:'soon'` so the hub is honest about it.
- Verified in-browser: 18 images, **0 broken**, no console errors.

> To go live, drop the real photos into `./media/` and swap the `src` values back — a
> find-and-replace, nothing structural.

### Still open
- [ ] **Real photography** (16 shots: 1 hero, 3 service, 8 gallery, 3 portraits, 1 logo).
- [ ] **⚠️ The testimonials are fictional people.** "Sarah Johnson", "Michael & Emma Davis" and
      "Robert Chen" with invented quotes. Fine for a layout demo, **not** fine on a real
      storefront. Either label the page as a demo or replace them with real, consented quotes.
- [ ] **Mixed languages.** `<html lang="nl">` with English `alt` text and a NL/FR/EN switcher.
      Set `lang` from the switcher and translate the `alt` attributes too.

---

## 10. The People Library — **moved to `library.labidi.eu`**

> Migrated out of this repo on 2026-07-30 to its own domain and repo
> (`Compyra/library.labidi.eu`). `workshop/personality-library/` is now only a
> redirect stub. The remaining items below moved with it — track them there.

All 15 workshops are **delivered** (shared `index.html`/`style.css`/`app.js` engine + per-book
`data.js`). Remaining work is wiring and consistency:

- [x] ~~Surface the library on the hub~~ — **done**, see
      [0.2](#-02--the-people-library--15-book-workshops-orphaned--fixed).
- [ ] **Chart.js is loaded from a CDN** (DISC workshop) while every other rami.party project is
      offline-first. *Fix:* vendor `chart.min.js` locally, or replace the radar with a small
      hand-rolled canvas renderer to match the "no third-party requests" standard. See also
      [0.13](#-013--44-pages-depend-on-third-party-cdns-breaking-the-offline-first-promise).
- [ ] **Cross-link consistency** — Big Five, MBTI, Enneagram and Temperaments link back to DISC,
      but the other 11 don't cross-link. Add a shared "related workshops" footer component.

---

## 11. TapFate / Random First Player — `wasteland/random-first-player/`

> Now shipped as `tapfate.labidi.eu` (and a `tapfate-apk` Android build). This folder is the
> preserved web original — decide whether to retire it or keep it in sync.

- [ ] **Raster icons for stores & legacy browsers** — export `192×192`, `512×512` and a
      **512×512 maskable** PNG from `favicon.svg`, add them to `manifest.webmanifest`
      (Google Play / Bubblewrap requires the 512 PNG).
- [ ] **Service worker** for offline play + the Android install prompt (fully static → a tiny
      cache-first SW is enough).
- [x] ~~Deploy under a subdomain~~ — done: `tapfate.labidi.eu`.
- [ ] **SEO pass** — Open Graph / Twitter cards, `og:image`, canonical URL, `robots.txt`,
      `sitemap.xml`.
- [ ] **Privacy note** — "no data leaves the device" is a genuine selling point; optional
      privacy-friendly analytics.
- [ ] **Cross-device test matrix** — iOS Safari, Android Chrome, iPad, desktop
      Chrome/Firefox/Edge/Safari; verify multi-touch on real hardware.
- [ ] Nice-to-haves: sound + `navigator.vibrate()` haptics on selection; winner glow uses the
      picked colour instead of white; "reverse" mode (who goes *last*); configurable team count (4+).

---

## 12. GhostTooth copy — `wasteland/bluetooth/`

All 7 roadmap items in [../wasteland/bluetooth/TODO.md](../wasteland/bluetooth/TODO.md) are done.

- [x] ~~Fix the stale back-link, resolve the duplication, strip lebon.info~~ — **done**, see
      [0.9](#-09--duplicate-ghosttooth--resolved-keep-as-a-relic). Kept as a preserved relic:
      noindexed, canonicalised to `ghosttooth.labidi.eu`, and now reachable from the Wastelands
      index. The `/* Terminal theme matching lebon.info */` comment stays as design attribution.
- [ ] **Optional phase 2 of item 4** — per-device RSSI history (capped ~50-sample ring buffer)
      rendered as an inline sparkline. Only worth doing upstream in `ghosttooth.labidi.eu`;
      this copy is frozen.

---

## 13. Projects with no todo file — audit needed

These folders ship on the site but have **no documentation and no recorded backlog**. Each needs
a quick review pass (does it work? is it finished? should it be `status:'soon'` or archived?):

| Folder | Catalogue name | Suspected state |
|---|---|---|
| `workshop/batlistener/` | Echo | live, undocumented |
| `workshop/bbq/` | BBQ Mailer | ✅ works (`mailto:`) — undocumented |
| `workshop/blur/` | Document Censor | live, undocumented |
| `workshop/character-forge/` | Isekai Forge | live, undocumented |
| `workshop/clear/` | Privacy Broom | live, undocumented |
| `workshop/dashboard_v1/` | Window View | stub — now `status:'soon'` ✅ |
| `workshop/demoscene-forge/` | Demoscene Generator | live; `todo.md` is the original brief, not a build log |
| `workshop/DNS-sinkhole/` | DNS Sinkhole | live, undocumented |
| `workshop/Engraving/` | Engraving Gallery | live, undocumented |
| `workshop/news/` | IT News Scroll | live; ✅ rebranded |
| `workshop/rami/` | Tinkerer's Desk | scratch page — now `status:'soon'` ✅ |
| `workshop/scoreboard/` | Scoreboard | live, undocumented |
| `workshop/subnets/` | Subnet Calculator | live, undocumented |
| `workshop/to-check/` | Wishlist Scroll | link dump — value? |
| `workshop/todo/` | Daybook | live, undocumented |
| `workshop/tools/` | IT Tools Workbench | ✅ CVE sub-page + branding fixed |
| `workshop/trace-results/` | Volume Seer | **moved** → `workshop/mail-ward/volume/`, redirect stub left behind |
| `workshop/webcheck/` | Webcheck | live, undocumented |
| `wasteland/adhd/` | ADHD experiment | empty husk (intentional) |
| `wasteland/house/` | The Little House | ✅ now reachable from the Wastelands card |
| `wasteland/notes/` | Notes & Todo | archived, superseded by Daybook |
| `gallery/militaryalphabet/` | Phonetic Codex | ✅ moved to `alphabet.labidi.eu`; redirect + tombstone sw only |

Also worth noting: `workshop/demoscene-forge/todo.md` and
`workshop/personality-library/DISC-profile-SurroundedByIdiots/todo.md` are *specification briefs*
rather than build logs — neither records what actually shipped or what is left. Convert them to the
same "Delivered / Still open" shape the other project todos use.

---

## 🎯 Suggested order of attack

**Round 1 — done 2026-07-27:** 0.1–0.11, §7, §8, §9.

**Round 2 — recommended next:**

1. **0.13** — self-host the fonts and Chart.js. 44 pages currently contradict the
   "offline-first, no tracking" promise printed on the Forges themselves. Biggest
   credibility win, and mechanical to do.
2. **0.14 + *Sitemap Scribe*** — make `wasteland/index.html` data-driven, then generate
   `sitemap.xml` from `projects.js` so it can never drift again.
3. **§9** — real photography for Laser Works, or label it an explicit demo (the testimonials
   are invented people).
4. **§3 CSG booleans** and **§2.1 multi-select** — the two biggest single feature unlocks
   across the two Forges.
5. **0.12 + §13** — README + audit pass over the ~20 undocumented folders; retire whatever
   no longer earns its place.
6. **§4** — decide what to do about D&D Forge's fake older editions (implement, or relabel).

---

_Generated 2026-07-27 · keep per-project `todo.md` files as the detailed source of truth; this
file is the roll-up._

