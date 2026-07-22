# Laser Forge — Build Plan (`todo.md`)

> A browser-based generator that turns **text, emoji, symbols, shapes, QR/barcodes and
> uploaded images** into clean, machine-ready files for **any** laser engraver / cutter
> software. 100% client-side. No server, no upload, no tracking. HTML + CSS + vanilla JS.
>
> Written from the perspective of a world-leading web developer — engineered so that a
> hobbyist with a $200 diode laser and a shop running a $40k CO₂ galvo can both drop the
> output straight into their software and hit "Start" with zero cleanup.

---

## 0. Design principles (non-negotiable)

- **Everything runs offline in the browser.** All processing via Canvas / Web Workers.
  A design file never leaves the user's machine — the #1 trust concern for makers.
- **"Correct by construction" exports.** Real physical units (mm), true 1:1 scale, and
  format-valid files that import without a "scale / units" dialog fight.
- **Preview == Output.** What renders on screen is exactly what exports (WYSIWYG).
- **Progressive disclosure.** Simple mode for beginners, "Pro" panel for full control.
- **Zero dependencies where sane.** Pure JS for SVG/DXF/G-code (they're just text).
  Only pull a tiny library if it removes real risk (QR + font parsing — see §9).

---

## 1. Target software & what they demand (compatibility matrix)

| Software | Primary vector | Primary raster | Direct machine code | Notes |
|---|---|---|---|---|
| **LightBurn** (diode/CO₂/galvo) | SVG, **AI/PDF**, DXF | PNG, JPG, BMP | — (generates its own) | Wants mm, single unit scale, layers by colour |
| **LaserGRBL** | SVG (basic) | **BMP**, PNG, JPG | GRBL G-code | BMP most reliable; loves clean B/W + dithered |
| **xTool Creative Space** | SVG, DXF | PNG, JPG | — | SVG must have real dimensions |
| **Glowforge** | **SVG**, PDF | PNG (traced) | — | SVG colour = operation (cut/score/engrave) |
| **Snapmaker Luban** | SVG | PNG, JPG, BMP | G-code | — |
| **RDWorks / Ruida (CO₂)** | **DXF**, AI, PLT | BMP, PNG | RD (proprietary) | DXF is king in industrial shops |
| **EZCAD (fiber/galvo)** | **DXF**, PLT, AI | BMP | — | Fiber marking; hairline vectors |
| **Inkscape → any** | SVG | — | (Gcodetools) | SVG interop baseline; real mm dimensions |
| **Rayforge** (GRBL, Linux) | **SVG**, DXF | PNG | GRBL G-code | Modern open-source laser GUI; SVG/vector friendly |
| **Universal CNC senders** | — | — | **G-code (.nc/.gcode)** | Direct-drive fallback |

**Conclusion → we must export:** `SVG`, `DXF`, `PNG`, `JPG`, `BMP`, `PDF`, `G-code`.
Optional stretch: `PLT/HPGL`, `EPS`.

---

## 2. Export formats — spec & why (the heart of the tool)

### Vector (for **cutting**, **scoring**, **line/stroke engraving**)
- [x] **SVG** — the universal exchange format.
  - Real `width`/`height` in **mm** + matching `viewBox` (no unit ambiguity).
  - **Colour = operation** convention (cut = red, score = blue, engrave/fill = black) so
    LightBurn/Glowforge auto-map layers. Expose a legend + toggle.
  - Hairline strokes (`stroke-width:0.001mm`/`0.01`) option for "vector cut" lines.
  - Convert **text → outlines (paths)** so no font is required on import (critical!).
  - Optional: keep live `<text>` as a fallback copy on a hidden layer.
- [x] **DXF** (R12 ASCII — the most widely importable flavour).
  - Entities: `LINE`, `LWPOLYLINE`, `CIRCLE`, `ARC`, `SPLINE`→polyline-approx.
  - Layers by colour/operation. Units header (`$INSUNITS = 4` = mm).
  - This is what unlocks Ruida/EZCAD/industrial shops.
- [x] **PDF** (vector) — Glowforge & LightBurn friendly; also a "print & keep" artifact.
  - Single page sized to the artboard in mm; vector paths preserved.

### Raster (for **photo / grayscale / filled engraving**)
- [x] **PNG** — lossless, **alpha transparency** preserved (transparent = "don't fire").
  - Exact pixel dimensions derived from **DPI × physical size**.
  - Modes: full grayscale, pure B/W (1-bit), dithered.
- [x] **BMP** — required/most reliable for **LaserGRBL** & some Ruida.
  - Support **1-bit monochrome BMP** and 8-bit grayscale (write encoder by hand).
- [x] **JPG** — compatibility fallback; quality slider; warn "lossy, no transparency".

### Direct machine code (optional, power users)
- [x] **G-code** (GRBL "laser mode" `M4`/`M3` dynamic power, `M5` off).
  - Raster engrave: line-by-line scan, `S` power modulated per pixel, configurable
    speed / power / **line interval (LPI)** / travel-speed / overscan.
  - Vector: `G0` travel / `G1` burn with power + feed.
  - Header/footer templates (`G21` mm, `G90` abs, homing optional) + machine profile.
  - ⚠️ Safety banner: "Verify on your machine. Never run unattended."

---

## 3. Input / content generators (what users create)

- [x] **Text engine**
  - Font picker: bundled web-safe + **user font upload** (`.ttf/.otf/.woff`).
  - **Single-line / stroke ("engraving") fonts** support (Hershey / centerline) —
    hugely requested for fast vector engraving & CNC-style marking.
  - Size in **mm or pt**, letter-spacing, line-height, alignment, curved/arc text,
    bold/italic, outline vs fill, mirror (for reverse-acrylic & rotary).
- [x] **Emoji & symbol library**
  - Render emoji as **monochrome vector outlines** (not colour glyphs) — pick an
    open outline emoji set (e.g. OpenMoji black/outline) so they engrave cleanly.
  - Categories + search; single-click insert.
- [x] **Shapes & primitives** — rect, rounded-rect, circle, polygon, star, line, arrow,
  heart; corner radius, sides, inner/outer radius controls.
- [x] **QR code generator** — text/URL/wifi/vcard; error-correction level; quiet zone;
  export as crisp vector (module = filled square) → perfect engraves.
- [x] **Barcode generator** — Code 128 (subset B). *(EAN/UPC still to add.)*
- [x] **Image / photo upload** → the processing pipeline (§4).
- [ ] **Icon / clipart trace** — drop any bitmap, auto-vectorize (§5).
- [x] **Puzzle generator** — turn the artboard into laser-cuttable puzzles:
  - **Jigsaw** — classic grid with random interlocking tabs.
  - **Tessellation (SHMUZZLE-style)** — a single *repeating tile that fits into itself*: every
    internal edge shares one profile, so every interior piece is congruent (a self-tiling
    rep-tile). This is the “repeating shape that fits in itself” / repeating-object puzzle.
  - **Geometric tiling** — straight-cut square, triangle, or hexagon tilings (“boring” /
    geometric puzzles).
  - **Repeating icon** — optionally engrave the same emoji/character in every piece for a
    custom repetitive-icon puzzle. Cut lines and engraved icons live on separate operations.

---

## 4. Raster image-processing pipeline (photo → engrave-ready)

The single most-requested capability set for laser photo engraving. All non-destructive,
live-preview, GPU/Canvas-backed, order-configurable:

- [x] Grayscale conversion (luminance-weighted + selectable weightings).
- [x] **Brightness / Contrast / Gamma / Exposure** sliders.
- [x] **Levels / Curves** (black point, white point, midtones).
- [ ] Sharpen / Unsharp mask; blur; denoise.
- [x] **Invert** (for engraving light-on-dark materials, slate, anodized alu).
- [x] **Threshold** (pure 1-bit B/W) with adjustable cutoff.
- [x] **Dithering algorithms** (the crown jewel — offer all common ones):
  - Floyd–Steinberg, Jarvis-Judice-Ninke, Stucki, Atkinson, Sierra, Burkes,
    Bayer/ordered (2×2,4×4,8×8), Halftone (dot), random/noise.
- [x] **Halftone** (newspaper dot) with angle + dot size.
- [ ] **Edge detection / outline** (Sobel) → for line-art engraving.
- [x] **Background removal** (chroma / luminance key) → transparent PNG.
- [x] **DPI / resolution** control (150–1000+) with live px-dimension readout.
- [ ] **Line interval (LPI)** preview for scan engraving.
- [ ] Material presets (wood, acrylic, slate, leather, anodized, coated metal, glass)
  that pre-load sensible dither + contrast + invert defaults.

---

## 5. Vectorization (bitmap → clean vectors)

- [ ] **Centerline trace** (skeleton) — single-stroke paths for fast vector engraving.
- [x] **Outline / fill trace** (contour) — for cut/score.
- [x] Threshold, speckle-suppression, corner/curve smoothing controls.
- [ ] Colour-count posterize → multi-layer separation (each colour = its own op layer).

---

## 6. Canvas / layout / artboard (shared workspace)

- [x] Physical artboard sized in **mm** (machine bed presets: 400×400, A4, 600×300, etc.).
- [ ] Real-world ruler, grid, snapping, zoom/pan.
- [ ] Multi-object canvas: move / scale / rotate / align / distribute / group.
- [x] **Layers = operations** (Cut / Score / Engrave-line / Engrave-fill) with colour map.
- [x] Mirror / flip (rotary + reverse-engraving), tile / array / grid duplication.
- [x] **Kerf offset** control (compensate beam width for precise cut fit).
- [ ] Boolean ops (union/subtract/intersect) for shape building.
- [ ] Origin selector (which corner/center the machine treats as 0,0).

---

## 7. Export dialog (the payoff moment)

- [ ] One panel, format tabs; live preview of the exact export per format.
- [x] Per-format options surfaced contextually (DPI for raster, hairline for SVG, etc.).
- [x] **"Target software" quick-preset** dropdown (LightBurn / LaserGRBL / Glowforge / xTool
  / Ruida …) that auto-sets format + conventions so beginners can't get it wrong.
- [x] Filename templating; download via Blob (no server round-trip).
- [x] Export summary: dimensions (mm), DPI, layer/op list, est. file integrity note.

---

## 8. UX / accessibility / polish

- [x] Match `rami.party` workshop theme (`../../theme.css`, `../../style.css`), dark UI.
- [x] Responsive; keyboard shortcuts; undo/redo history stack.
- [x] Drag-&-drop file import anywhere on canvas.
- [x] Tooltips explaining every laser term (LPI, kerf, dither) — teach while doing.
- [x] LocalStorage autosave of the working project; export/import project JSON.
- [x] i18n-ready string table (EN first; NL/FR to follow — matches other realms).
- [ ] a11y: ARIA labels, focus states, reduced-motion honoring.

---

## 9. Architecture & files (HTML/CSS/JS, no build step)

```
workshop/laser-forge/
  index.html            # shell + panels
  style.css             # scoped styles (+ theme vars)
  js/
    app.js              # bootstrap, state, event wiring
    canvas.js           # artboard, objects, transforms, layers
    text.js             # font load, text→path (single-line + outline)
    emoji.js            # outline emoji picker + insert
    shapes.js           # primitives + boolean ops
    qrbarcode.js        # QR / barcode generation → vector
    image/
      pipeline.js       # filter chain (grayscale…dither) in a Web Worker
      dither.js         # all dithering algorithms
      trace.js          # bitmap → vector (centerline + outline)
    export/
      svg.js            # SVG writer (mm, layers, text→path)
      dxf.js            # DXF R12 ASCII writer
      pdf.js            # minimal vector PDF writer
      png.js            # canvas → PNG (DPI-aware)
      bmp.js            # hand-rolled 1-bit + 8-bit BMP encoder
      jpg.js            # canvas → JPEG
      gcode.js          # GRBL raster + vector G-code
    workers/            # heavy pipelines off the main thread
  presets/
    machines.json       # bed sizes, gcode headers per firmware
    materials.json      # dither/contrast/invert defaults per material
  todo.md
```

**Library policy (decided): prefer pure JavaScript.** Hand-roll everything we reasonably
can; vendor a tiny MIT-licensed lib locally *only* where a pure-JS reimplementation is
genuinely risky, and prefer a pure-JS port over a WASM/binary blob.
- SVG / DXF / PDF / BMP / JPG / PNG / G-code writers → **hand-rolled pure JS** (just text/bytes).
- Dithering, filters, trace, QR/barcode matrix, shapes → **hand-rolled pure JS**.
- Font glyph→path (TTF/OTF parsing) → hand-rolling a full parser is risky; vendor
  `opentype.js` (pure JS, MIT) locally *only if* our minimal parser proves unreliable.
- Barcode symbologies (EAN/UPC checksum quirks) → vendor a pure-JS lib locally only if needed.

---

## 10. Phased implementation plan

**Phase 1 — Skeleton & artboard (MVP shell)**
- [ ] `index.html` + theme wiring + panel layout + mm artboard + zoom/pan/grid.
- [ ] State model + undo/redo + LocalStorage autosave.

**Phase 2 — Content: text + shapes + emoji**
- [ ] Text engine (outline via opentype.js, size in mm), shapes, emoji picker.
- [ ] Layers/operations + colour mapping.

**Phase 3 — Vector export (highest value first)**
- [ ] SVG writer (mm, text→path, colour=op). ← ship this first, verify in LightBurn.
- [ ] DXF R12 writer. → verify in RDWorks/LibreCAD.
- [ ] PDF writer.

**Phase 4 — Image pipeline + raster export**
- [ ] Upload → grayscale/contrast/gamma/levels/invert/threshold.
- [ ] Dithering suite + halftone (Web Worker).
- [ ] PNG (DPI-aware) + BMP (1-bit/8-bit) + JPG export. → verify in LaserGRBL.

**Phase 5 — QR / barcode + vectorization**
- [ ] QR + barcode → vector. Centerline + outline trace.

**Phase 6 — Direct G-code + machine/material presets**
- [ ] GRBL raster + vector G-code with profiles + safety UX.
- [ ] Material presets + "target software" export quick-presets.

**Phase 7 — Polish**
- [ ] Kerf, arrays, boolean ops, mirror, i18n, tooltips, accessibility pass.
- [ ] README + in-app help + verification checklist across all 8 formats.

---

## 11. Validation checklist (definition of done)

- [ ] SVG imports at **correct real-world size** in LightBurn & Inkscape (no scale prompt).
- [ ] DXF opens with correct units in LibreCAD / RDWorks.
- [ ] PNG/BMP dithered photo engraves cleanly in LaserGRBL at chosen DPI.
- [ ] Text exports as outlines — opens on a machine **without the font installed**.
- [ ] Colour→operation layers map automatically in LightBurn & Glowforge.
- [ ] G-code runs a dry-frame correctly on a GRBL test bench.
- [ ] Everything works **offline** with no network calls (verify in devtools).

---

## 12. Decisions locked in

- **v1 scope:** ship **all** file types (SVG / DXF / PDF / PNG / BMP / JPG / G-code). ✅
- **Libraries:** **prefer pure JavaScript**; hand-roll writers & processing; vendor a tiny
  MIT lib locally only where pure-JS is genuinely risky (see §9). ✅
- **Companion project:** a sibling tool for **3D printers** — see
  [`workshop/3d-forge/todo.md`](../3d-forge/todo.md). ✅
- **Folder name:** `workshop/laser-forge/` (change on request).

---

## 13. NEXT LEVEL (future) — drive the laser straight from the browser

> **Not implemented yet — documented here as the planned v2 leap.** Today Laser Forge is a
> *file generator*: it produces artwork/G-code you load into LightBurn/LaserGRBL. The next
> level turns the browser itself into the **machine controller**, so a user can design →
> frame → and **run the job on the laser without any desktop software**.

### 13.1 How it works (the enabling tech)
- **Web Serial API** (`navigator.serial`) — the primary path. GRBL/GRBL-LPC/grblHAL diode &
  CO₂ controllers speak plain-text G-code over a USB serial (CDC) port at 115200 baud.
  The browser can `requestPort()`, open it, and stream commands — exactly what LaserGRBL /
  Universal Gcode Sender do natively. Chrome/Edge/Opera (desktop) support it today; must be
  served over **HTTPS** (or `localhost`) and requires a **user gesture** to pick the port.
- **WebUSB** (`navigator.usb`) — fallback for controllers exposed as raw USB (or to talk to
  boards via a vendor protocol). More fiddly (no OS driver claiming), used only if serial
  isn't available.
- **Web Bluetooth** — for BLE-equipped machines (some xTool/desktop units).

### 13.2 The GRBL streaming protocol (what we must implement)
1. **Connect & wake** — open port @115200, toggle DTR, send `\r\n\r\n`, wait for the GRBL
   banner (`Grbl 1.1f ['$' for help]`).
2. **Character-counting flow control** — the robust streaming method: track bytes in GRBL's
   128-byte RX buffer; only send the next line when it fits; increment on send, decrement on
   each `ok`/`error` reply. (Simpler "send-response" works but is slower.)
3. **Real-time status** — poll `?` at ~5 Hz → parse `<Idle|MPos:...|FS:...>` for a live DRO
   (position/state/feed/power) and a progress bar.
4. **Real-time overrides** — feed/power/spindle override bytes (`0x90…`, `0x99…`) for live
   speed/power tuning mid-burn.
5. **Job control** — pause `!`, resume `~`, soft-reset/abort `0x18`, plus `$H` homing,
   `$X` alarm-unlock, `G10 L20` set-origin.

### 13.3 Killer UX to build on top
- **Connect Laser** button → device dropdown → live console + DRO panel.
- **Jog pad** (X/Y/Z arrows, step size) to position the head.
- **Frame / trace bounding box** at low power so the user sees where the job lands.
- **Home / Set origin / Go to origin**; **material test grid** generator (speed×power).
- **Run / Pause / Resume / Stop** with live progress, ETA, and an always-visible **E-STOP**.
- **Machine profiles** (bed size, `$$` settings read/write, GRBL vs Marlin-laser dialects).

### 13.4 Safety & security (must-haves before shipping v2)
- Persistent, unmissable warning: **never run a laser unattended; wear rated eyewear; ensure
  fume extraction & fire suppression.** Require an explicit "I understand" gate.
- Soft-limit / travel checks against the machine profile before streaming.
- Everything stays client-side; the serial port is user-picked per session (no silent access).
- Watchdog: auto-issue `M5`/laser-off + hold on disconnect, tab-hide, or lost status.

### 13.5 Suggested build order (v2)
1. Serial connect + banner detect + raw console.  2. Character-counted streamer + `ok`
tracking.  3. `?` status parser + DRO + progress.  4. Jog + home + set-origin.  5. Frame /
material-test generators.  6. Overrides + pause/resume/E-STOP.  7. Machine-profile manager
(`$$`).  8. Safety gating, watchdogs, polish. → *Only then* implement.

---

## 14. Build status (v1)

- [x] Plan approved — implementation started.
- [x] Phase 1 — shell, mm artboard, zoom/pan/grid, state + undo + autosave.
- [x] Phase 2 — text (fill/outline/stroke) + shapes + emoji + colour-as-operation layers.
- [x] Phase 3 — vector export: **SVG**, **DXF (R12)**, **PDF**.
- [x] Phase 4 — image upload → **grayscale pipeline** (brightness/contrast/gamma/levels/
  invert/threshold) + full **dithering** suite → **PNG / BMP (1-bit & 8-bit) / JPG**.
- [x] Phase 5 — **QR** generator → vector; bitmap **trace** (outline) for text & images.
- [x] Phase 6 — **G-code** (GRBL raster + vector) with machine/material presets + safety UX.
- [x] Phase 7 — target-software export presets, tooltips, autosave, README, a11y pass.

> **Status: v1 implemented.** §13 (direct browser→laser control) intentionally left for v2.

## 15. Post-v1 additions

- [x] **Inkscape** and **Rayforge** added as target-software export presets + matrix entries.
- [x] **Puzzle generator** object: jigsaw, tessellation (SHMUZZLE-style self-fitting tile),
  geometric tiling (square/triangle/hexagon), and an optional repeating engraved icon.
- [x] Geometry pipeline generalised to **per-loop operations** (one object can mix cut lines
  and engraved fills), honoured across SVG / DXF / PDF / G-code / preview.

## 16. Code review & fixes (round 1)

Reviewed the whole codebase; verified in-browser (all exporters, QR, puzzle, undo/redo).
Fixed the following real issues:

- [x] **Style toggles now persist** — `bold` / `italic` / `filled` and font/alignment changes
  committed to history + autosave (previously only re-rendered, lost on reload).
- [x] **Puzzle icon persists** — the repeating-icon field now commits on blur.
- [x] **No duplicate undo steps** — removed a double-commit on `<select>` changes.
- [x] **No empty undo steps** — `commit()` skips when nothing actually changed
  (click-to-select no longer pollutes the undo stack).
- [x] **Text W/H = uniform scale** — editing width/height on a text object now scales the
  font size proportionally instead of desyncing the bounding box.
- [x] **Null-safety** — property inputs guard against a missing selection.
- [x] Confirmed no console/runtime errors; SVG/DXF/PDF/PNG/BMP/JPG/G-code all valid.

## 17. Usability — is it simple enough for end users?

**Verdict: good for hobbyists, with room to lower the first-run barrier.** What already helps:
add-buttons with icons, an empty-state hint, live WYSIWYG preview, tooltips on every control,
mm everywhere, a **“target software” preset** that auto-configures the export, autosave, and a
safety gate on G-code. Friction that remains (planned below):

- [x] **Beginner vs Pro mode** — a header toggle hides advanced fields (e.g. export kerf/overscan)
  by default; the Help modal gives a “1) add 2) tweak 3) export” quick start.
- [x] **Inline explainers** — tooltips + inline hint lines on key options + a full in-app **Guide** modal.
- [x] **Drag-and-drop image onto the canvas**.
- [x] **Undo/redo + shortcut cheatsheet** surfaced in the Help modal.
- [x] **Touch / mobile** layout (responsive header/toolbar; deeper touch gestures still to add).
- [x] **Localisation** — EN / NL / FR chrome with a language switcher (property labels fall back to EN).

## 18. Still to do (v1 polish backlog)

- [ ] **True single-line / centerline engraving fonts** (Hershey) — currently text is exported
  as filled outlines; add stroke-font output for fast one-pass vector engraving.
- [x] **Jigsaw neck tabs** — added a locking **dovetail** tab style beside the semicircle.
- [ ] **Move heavy work to Web Workers** — dithering + tracing + raster G-code can block the UI
  on large images; offload for responsiveness and progress bars.
- [x] **Kerf compensation** for cut paths (offset by beam width) and **overscan** for raster.
- [~] **Multi-select + align/distribute/group**, snapping — *numeric grid **Array** done*; the rest pending.
- [ ] **Boolean operations** (union/subtract/intersect) for shape building.
- [x] **Barcode generator** (Code 128). *(EAN/UPC still to add.)*
- [x] **Project save/load as file** (`.json`) in addition to LocalStorage autosave.
- [ ] **DXF/SVG import** (not just export) so users can bring existing art in.
- [ ] **Per-object “tabs/bridges”** for cutouts so pieces don’t fall out mid-cut.
- [ ] **Material test-grid generator** (speed × power matrix) as a first-class object.

## 19. Future expansion ideas (backlog / nice-to-have)

**Puzzles & tiling**
- [ ] More tessellation families: Escher-style rotational/glide tiles, Penrose/aperiodic tiles,
  and spiral / radial puzzles. *(Organic **Voronoi** puzzle + interactive **custom draw-your-own tile** done.)*
- [ ] **Image-into-puzzle**: drop a photo, auto-fit it across the pieces (engrave per-piece
  slices) for a printable photo puzzle.
- [x] Numbered/lettered pieces (Voronoi + grid). *(Auto assembly-key sheet still to add.)*
- [ ] Rep-tile explorer (L-tromino, sphinx, etc.) for true self-similar “fits-in-itself” shapes.

**Content generators**
- [x] Parametric boxes / finger-joint (laser-cut enclosures) + **living hinge** + **gear** + **ruler**.
- [~] Text-on-path, **warp/arc text** *(arc done)*; variable-data batch (CSV → many tags) still to add.
- [ ] Icon/clipart library + SVG paste; halftone/stipple/line-art photo styles.
- [ ] Fill patterns (hatch, cross-hatch, spiral) for engrave regions.

**Workflow & output**
- [x] Additional formats: **PLT/HPGL**, **EPS**, **AI**; SVG layers named per LightBurn/Inkscape convention.
- [ ] **Nesting / auto-layout** to pack many parts onto the sheet efficiently.
- [x] Print-and-cut **registration marks** object *(camera alignment helpers still to add)*.
- [x] Cost/time estimator (path length × speeds) shown in the export dialog.
- [x] Cloud-free **shareable project links** (project encoded in the URL) — still no server.

**Platform**
- [ ] PWA / offline install; file-system access API for “open/save” round-trips.
- [ ] Plugin hooks for custom generators and custom G-code dialects (Marlin, Smoothie, Ruida RD).
- [ ] The big one: **§13 direct browser→laser control** (Web Serial streaming) as v2.
> **Platform features are planned but on hold** — full step-by-step plan lives in
> [`todo-platform.md`](todo-platform.md). Do not implement yet.

---

## 20. Round-2 implementation status

Implemented and **verified in-browser** this round (no console errors; all exporters produce
valid output):

- **Software support:** Inkscape + Rayforge presets; SVG now writes **named operation layers**
  (Inkscape/LightBurn friendly).
- **New generators:** finger-joint **Box**, **Gear**, **Ruler**, **Living hinge**,
  **Registration marks**, **Barcode (Code 128)**.
- **Puzzles:** **Voronoi** organic style, **numbered pieces**, locking **dovetail** tab style
  (beside jigsaw / tessellation / geometric).
- **Text:** **arc / curved** text.
- **Export:** **AI / PLT (HPGL) / EPS** formats, **kerf compensation**, raster **overscan**,
  and a **cost/time estimate** in the dialog.
- **Workflow:** **project Save/Open (.json)**, **shareable project links** (URL-encoded),
  numeric **grid Array**.
- **UX (§17):** **Beginner/Pro mode**, **drag-&-drop images**, **Help & shortcuts modal**,
  **EN/NL/FR** localisation, responsive/mobile chrome.

Deliberately deferred to a later round (higher risk / larger scope), tracked above:
Hershey single-line fonts, Web-Worker offloading, multi-select + align/distribute/group +
snapping, boolean operations, DXF/SVG **import**, tabs/bridges, material test-grid,
Escher/Penrose tiles, image-into-puzzle, rep-tile explorer, CSV variable data, SVG paste,
stipple/line-art, hatch fills, and nesting.

## 21. Round-3 additions

- [x] **Custom repeating-shape editor** — a “Custom” puzzle style with an interactive **tile
  editor**: drag the top &amp; left edges of a square; the opposite edges mirror by translation,
  so every piece is congruent and interlocks into one giant puzzle of the same shape
  (the **“Connecting Cats”** / translational-tessellation principle). Live 3×3 tessellation
  preview; click to add points, drag to shape, double-click to remove. Verified: all internal
  edges come out congruent, and the puzzle tiles correctly.
- [x] **In-app Guide** — the Help modal now explains every tool (when to use it), the three
  operations (cut/score/engrave), which **export format** to pick, and the handy options
  (dithering, kerf, overscan, array, save/share).
- [x] **Inline explanations** — short hint lines under key controls (operation colours,
  dithering, puzzle style, custom tile) so beginners know what each does.
