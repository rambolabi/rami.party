# Laser Forge — Direct Control (v2) — Build Plan (`todo.md`)

> **v2** turns Laser Forge from a *file generator* into a full **browser-based laser
> workbench**: design your art **and run the job on the machine** — framing, jogging, and
> streaming G-code straight from the browser over **Web Serial** — with no desktop software.
>
> Forked from the stable **v1** at [`../laser-forge/`](../laser-forge/). This copy starts
> **feature-identical to v1**; the plan below is the v2 work, to be built top-to-bottom.
>
> **Non-negotiable rules (unchanged from v1):** 100% client-side, offline-first, no server,
> no tracking, prefer pure JavaScript, WYSIWYG (preview == output), correct-by-construction
> exports in real mm.

---

## 0. Relationship to v1

- **v1 (`../laser-forge/`)** stays the stable, shipping *design + export* tool. Do **not**
  regress it — all v2 work lives in this folder.
- This folder is a verbatim copy of v1 (same 14 JS modules, same exporters, same generators),
  rebranded "Direct Control · v2".
- The detailed platform/serial protocol notes live in
  [`todo-platform.md`](todo-platform.md) and **§13 of the v1 todo**; this file is the ordered
  build checklist that ties them together.

### Inherited from v1 (already done — baseline)
- [x] Content: text (outline + **single-line/centreline**), emoji, shapes, QR, barcode,
  images, puzzles (jigsaw/tessellation/geometric/voronoi/custom/spiral), box/gear/ruler/
  hinge/registration/**material test-grid**.
- [x] Raster pipeline: grayscale, brightness/contrast/gamma/levels, invert, threshold, full
  dithering suite, halftone, background removal, **blur/sharpen/edge/posterize**, DPI control.
- [x] Vectorisation: outline trace + **centerline (Zhang–Suen)** trace → editable path object.
- [x] Cut-craft: **hatch fill** (angle), **tabs/bridges**, kerf compensation, raster overscan.
- [x] Exports: SVG (named op layers), DXF (R12), PDF, PNG, BMP (1/8-bit), JPG, PLT/HPGL, EPS,
  GRBL G-code (vector + raster) — engrave fills *closed* areas, strokes *open* paths.
- [x] Workflow: undo/redo, autosave, project Save/Open (.json), shareable URL links, arrays,
  target-software export presets, cost/time estimate, Beginner/Pro mode, Help guide, EN/NL/FR.

---

## 1. Track A — finish the editor backlog (do first)

These are the remaining v1 backlog items. They make the canvas a real multi-object editor,
which several v2/serial features depend on (e.g. boolean UI needs multi-select; framing needs
a reliable origin).

### 1.1 Multi-select + transforms
- [ ] Selection **set** in `store` (replace single `selectedId` with `selectedIds`, keep a
  back-compat getter). Shift/Ctrl-click to add/remove; marquee/rubber-band drag on empty canvas.
- [ ] Group move / scale / rotate around the combined bbox; keep per-object numeric fields for
  a single selection.
- [ ] **Align** (left/centre/right, top/middle/bottom) + **distribute** (h/v) + **group/ungroup**.
- [ ] Snapping: to grid, to object edges/centres, and to artboard centre/edges (toggle in Pro).

### 1.2 Boolean operations UI
- [ ] Wire the existing raster-mask helper `booleanObjects(objs, mode)` (union / intersect /
  subtract / xor) to a multi-select toolbar; output a single editable **path** object.
- [ ] Undo-friendly (one commit); preserves op/layer of the primary object.

### 1.3 Canvas polish
- [ ] On-canvas **rulers** (mm) along top/left, following zoom/pan.
- [ ] **Origin selector** — which corner/centre the machine treats as (0,0); show a marker and
  feed it into G-code + framing.
- [ ] **LPI / line-interval preview** overlay for raster scan engraving.
- [ ] Material presets (wood / acrylic / slate / leather / anodized / coated metal / glass)
  that pre-load dither + contrast + invert + suggested speed/power.

### 1.4 Import + preview + a11y + workers
- [ ] **SVG import** — parse `path`/`rect`/`circle`/`polygon`/`line` → objects (pairs with
  File System Access below).
- [ ] **DXF import** — R12 `LINE`/`LWPOLYLINE`/`CIRCLE`/`ARC` → objects.
- [ ] **Live export preview** in the export dialog (render the exact per-format result).
- [ ] **Accessibility pass** — ARIA labels, focus states, reduced-motion honouring.
- [ ] **Web Workers** — move dithering, tracing, and raster G-code off the main thread with
  progress bars (unblocks large images; needed before streaming big raster jobs).

---

## 2. Track B — Platform (PWA / files / plugins)

Full detail in [`todo-platform.md`](todo-platform.md) §1–§3.

### 2.1 PWA / offline install
- [ ] `manifest.webmanifest` (name, icons 192/512 + maskable, standalone, theme colours) +
  `<link rel="manifest">`.
- [ ] `sw.js` service worker — versioned pre-cache of the app shell; activate/cleanup;
  cache-first for same-origin assets, never cache exports; register from `main.js`.
- [ ] **Bundle Quicksand locally** (drop the Google Fonts link) for true offline.
- [ ] Offline verification (DevTools → Offline → full reload boots + exports).
- [ ] "Update available — reload" toast when a new SW is waiting.

### 2.2 File System Access API
- [ ] Capability check + graceful fallback to today's Blob-download / `<input type=file>`.
- [ ] **Open** keeps a live `FileSystemFileHandle`; **Save** writes back (no re-prompt);
  **Save As** picks a new handle.
- [ ] Dirty tracking (`●` in title, warn-on-unload); permission re-request when needed.
- [ ] **Recent files** via IndexedDB handles; SVG/DXF import through the same picker.

### 2.3 Plugin hooks
- [ ] `LaserForge.registerGenerator({...})` with a **declarative property schema** → auto-built
  panel; wire into `objects.js` dispatch + `main.js` toolbar/`typeHTML`.
- [ ] `LaserForge.registerDialect({...})` — extract the GRBL writer into a **dialect descriptor**
  (header/footer, laser on/off, power `S`, feed `F`, arcs, units); ship GRBL / Marlin-laser /
  Smoothieware; Ruida RD flagged experimental.
- [ ] Persist installed plugins in IndexedDB; enable/disable/remove panel; **"run untrusted
  code?" gate** with a restricted API surface (no network, canvas-only DOM).

---

## 3. Track C — Direct browser → laser control (the headline v2 feature)

Web Serial streaming. Detail in [`todo-platform.md`](todo-platform.md) §4 and v1 `todo.md` §13.
**Safety gating (§3.8) is a blocking requirement before any streaming ships.**

### 3.1 Connect + console
- [ ] Serve over **HTTPS** (secure context required; GitHub Pages is fine) — `localhost` for dev.
- [ ] **Connect Laser** button → `navigator.serial.requestPort()` (user gesture) → open @115200
  → toggle DTR, send `\r\n\r\n`, detect GRBL banner (`Grbl 1.1…`).
- [ ] Raw serial **console** panel (send arbitrary lines, see replies).

### 3.2 Streamer
- [ ] **Character-counted flow control** — track GRBL's 128-byte RX budget; send next line only
  when it fits; increment on send, decrement on each `ok`/`error`.
- [ ] Progress bar + **ETA** (reuse the v1 cost/time estimator); error surfacing + safe stop.

### 3.3 Status / DRO
- [ ] Poll `?` at ~5 Hz → parse `<State|MPos|WPos|FS>` → live **DRO** (position/state/feed/power)
  + a state pill (Idle/Run/Hold/Alarm).

### 3.4 Motion controls
- [ ] **Jog pad** (X/Y/±, step size), **Home** `$H`, **Unlock** `$X`, **Set origin** `G10 L20`,
  Go-to-origin.

### 3.5 Framing + test
- [ ] **Frame / trace bounding box** at low power (uses the artboard bbox + chosen origin).
- [ ] Run the **material test grid** generator job (speed × power) directly.

### 3.6 Overrides + job control
- [ ] Feed / power / rapid **override** bytes (live tuning mid-burn).
- [ ] **Run / Pause `!` / Resume `~` / Soft-reset `0x18`**, and an always-visible **E-STOP**.

### 3.7 Machine profiles
- [ ] Bed size, `$$` settings **read/write**, dialect selection (from §2.3), homing/units flavour.

### 3.8 Safety & watchdogs (blocking gate — non-negotiable)
- [ ] Explicit, unmissable **"I understand"** agreement (eyewear, never unattended, fume/fire).
- [ ] **Soft-limit / travel checks** against the profile *before* streaming.
- [ ] **Watchdog** — auto `M5` (laser off) + feed-hold on disconnect, tab-hide/blur, or lost
  status; require re-arm to resume.

### 3.9 Fallbacks
- [ ] **WebUSB** and **Web Bluetooth** paths where Web Serial is unavailable.

---

## 4. Suggested build order (top-to-bottom)

1. **A1** multi-select + transforms → **A2** boolean UI.
2. **A3** rulers + origin + LPI + material presets.
3. **A4** SVG/DXF import + export preview + a11y + workers.
4. **B1** PWA/offline (also unblocks "run from the browser on the bench").
5. **B2** File System Access → **B3** plugin hooks + dialect descriptors.
6. **C1→C2→C3** connect → streamer → status/DRO.
7. **C4→C5** jog/home/origin → frame + test grid.
8. **C6→C7** overrides + E-STOP → machine profiles / `$$`.
9. **C8** safety gating + watchdogs (must land with, not after, first streaming).
10. **C9** WebUSB / Bluetooth fallbacks.

---

## 5. Validation checklist (v2 definition of done)

- [ ] v1 parity preserved — every existing export still valid; no console errors.
- [ ] Multi-select, align/distribute/group, snapping, and boolean ops work and undo cleanly.
- [ ] SVG/DXF **import** round-trips at correct real-world size.
- [ ] Installs as a PWA and **boots + exports fully offline** (network disabled in DevTools).
- [ ] File System Access: Save writes back to the same file; Recents re-open with permission.
- [ ] Plugin generator + custom G-code dialect load, run, and persist (behind the trust gate).
- [ ] **Web Serial**: connect → frame → run a real GRBL job on a test bench; `?` DRO live;
  pause/resume/override work; **E-STOP cuts power immediately**.
- [ ] Safety gate blocks streaming until acknowledged; watchdog kills the beam on
  disconnect / tab-hide / lost status.
- [ ] Everything stays **client-side** — verify zero network calls in DevTools.

---

## 6. Build status (v2)

- [x] Forked from v1 into `workshop/laser-forge-v2/` (feature-identical copy, rebranded).
- [x] v2 plan written (this file) + platform detail retained in `todo-platform.md`.
- [ ] Track A — editor backlog (multi-select, boolean, rulers/origin, import, preview, a11y, workers).
- [ ] Track B — PWA/offline, File System Access, plugin hooks.
- [ ] Track C — Web Serial direct control (connect → stream → DRO → jog/frame → overrides/E-STOP → profiles → safety → fallbacks).

> **Awaiting go-ahead to start Track A.** Nothing in Tracks A–C is implemented yet.
