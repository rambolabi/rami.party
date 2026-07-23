# 3D Forge — Build Plan (`todo.md`)

> The sibling of **Laser Forge**, but for **3D printers**. A browser-based generator that
> turns **text, emoji, symbols, shapes, QR codes and uploaded images/photos** into
> **ready-to-slice 3D models** (and, optionally, sliced G-code) for *any* 3D-printing
> software. 100% client-side. HTML + CSS + vanilla JS.
>
> Written from the perspective of a world-leading web developer — engineered so a beginner
> with a $150 Ender-class FDM printer and a studio running a resin/MJF farm can both drop
> the output straight into their slicer and print with zero repair or rescaling.

---

## 0. Design principles (non-negotiable)

- **Everything runs offline in the browser.** Geometry + meshing in Web Workers; nothing uploaded.
- **"Watertight by construction."** Every generated mesh is manifold, correctly-normalled,
  and non-self-intersecting so slicers never throw repair warnings.
- **Real millimetres, always.** Models export at true physical scale (mm) — no "your model
  is 1/25th size / giant" surprises when imported into Cura/PrusaSlicer/Bambu/Orca.
- **Preview == Print.** The 3D viewport shows exactly the geometry that exports.
- **Progressive disclosure.** Simple mode (type text → download STL) + a Pro panel.
- **Prefer pure JavaScript** (see §9 for the one pragmatic exception: the WebGL preview).

---

## 1. Target software & what they demand (compatibility matrix)

| Slicer / software | Imports | Preferred | Notes |
|---|---|---|---|
| **UltiMaker Cura** | STL, OBJ, 3MF, AMF, PLY, X3D | 3MF / STL | mm units; per-object settings via 3MF |
| **PrusaSlicer** | STL, OBJ, 3MF, AMF, STEP | **3MF** | 3MF stores project + settings |
| **Bambu Studio / OrcaSlicer** | STL, OBJ, 3MF, STEP | **3MF** | 3MF carries plates, colours, supports |
| **Simplify3D** | STL, OBJ, 3MF | STL | — |
| **Chitubox / Lychee (resin)** | STL, OBJ, 3MF | STL | watertight critical for resin |
| **CAD / repair (Meshmixer, Blender, Netfabb)** | STL, OBJ, PLY, 3MF, AMF | OBJ/PLY | PLY carries vertex colour |
| **Web/marketplaces (Thingiverse, Printables, MakerWorld)** | STL, 3MF | STL/3MF | — |
| **Direct-to-printer (rare)** | **G-code** (.gcode) | — | slicing is machine-specific; opt-in only |

**Conclusion → we must export:** `STL` (binary + ASCII), `3MF`, `OBJ` (+`.mtl`), `PLY`
(ascii/binary, with vertex colour), `AMF`. Stretch: `STEP` (hard, later), `glTF/GLB`
(for AR/sharing), and optional **G-code** via a minimal built-in slicer.

---

## 2. Export formats — spec & why (the heart of the tool)

### Mesh / model formats (for **slicing**)
- [ ] **STL** — the universal de-facto format. Write **binary** (compact) *and* **ASCII**.
  - Guarantee watertight, consistent outward normals, mm scale.
- [ ] **3MF** — modern ISO/IEC standard (ZIP+XML). *Preferred by every major slicer.*
  - Embed **units = millimetre**, per-object transforms, and (where set) **colour** and
    **material** so multi-colour/AMS designs map straight in. Write the ZIP by hand
    (store/deflate) — pure JS, no external zip lib if avoidable.
- [ ] **OBJ (+ MTL)** — great interop with Blender/Meshmixer; carries UVs + material refs.
- [ ] **PLY** — ascii + binary; **per-vertex colour** (ideal for lithophane/relief tint & QC).
- [ ] **AMF** — XML; curved-triangle + colour/material; smaller than STL for lattices.

### Direct machine code (opt-in, advanced)
- [ ] **G-code** — a *minimal* built-in FDM slicer (planar, perimeters + infill + optional
  supports) for quick single-part prints. Machine profile (bed size, nozzle, layer height,
  temps, speeds, retraction). ⚠️ Clear banner: "Basic slicer — verify before printing;
  for production use your own slicer with a 3MF/STL export." Keep this **Phase 6+**.

---

## 3. Input / content generators (what users create → 3D)

- [ ] **3D Text engine**
  - Font picker + **user font upload** (`.ttf/.otf`); glyphs → outline → **extrude** to depth.
  - Bevel/chamfer, height, curved/arc text, mirror, per-letter spacing.
  - Modes: raised (emboss), recessed (deboss/engrave into a base), or standalone letters.
- [ ] **Emoji & symbol → 3D** — outline emoji set extruded to solids (raised or inset).
- [ ] **Shapes & primitives (true solids)** — box, rounded box, cylinder, cone, sphere,
  torus, prism, star, gear, text-on-ring; parametric dimensions in mm.
- [ ] **QR code → 3D** — raised or recessed modules on a base plate (scannable-by-print);
  optional 2-colour (base + modules) for AMS/multi-material.
- [ ] **Image → relief / heightmap** — brightness → Z-height displacement (embossed sign/coin).
- [ ] **Image → Lithophane** ⭐ (the single most-requested 3D image feature)
  - Brightness → inverse thickness (dark = thick = blocks light; light = thin).
  - Flat / curved / cylindrical / dome / heart / box(4-panel lamp) shapes.
  - Controls: max/min thickness, size (mm), border/frame, positive/negative, resolution,
    optional backlight-preview mode in the viewport.
- [ ] **Photo/logo → extruded outline** — vectorize bitmap (§5) then extrude (stencils,
  cookie cutters, keychains, badges).
- [ ] **Practical templates** — keychain/name-tag, cookie cutter (outline→walls+base),
  stamp (mirrored relief), coin/medallion, fridge magnet, cable label, sign/nameplate.

---

## 4. Raster → 3D pipeline (photo → printable relief)

- [ ] Grayscale conversion + **brightness / contrast / gamma / levels**.
- [ ] Invert (lithophane needs correct polarity), sharpen, denoise, blur.
- [ ] **Resolution / mm-per-pixel** control → drives mesh density (with triangle-count readout).
- [ ] Height mapping: min thickness, max thickness, base thickness, Z-exaggeration.
- [ ] Edge smoothing / decimation to keep triangle counts sane for slicers.
- [ ] Border/frame generation, hanging-hole punch, corner rounding.
- [ ] Material/print presets (lithophane PLA white, wood-PLA relief, resin fine detail).

---

## 5. Vectorization → extrusion (bitmap/logo → solid)

- [ ] Threshold + **contour trace** (outline) → closed polygons.
- [ ] Polygon triangulation (ear-clipping) → cap faces; extrude → side walls → watertight solid.
- [ ] Speckle suppression, corner/curve smoothing, min-feature guard (printability).
- [ ] Multi-region → multi-body / multi-colour separation for AMS.

---

## 6. 3D workspace / scene (shared viewport)

- [ ] Real-mm build plate presets (220×220, 256×256, 300×300, resin small beds…).
- [ ] WebGL viewport: orbit / pan / zoom, grid, plate, shadows; wireframe & backlight views.
- [ ] Multi-object scene: move / rotate / scale (mm-aware) / align / duplicate / array.
- [ ] **Boolean ops** (union / difference / intersection) — combine text + base, cut holes.
- [ ] Auto "lay flat" / drop-to-plate; centre-on-plate; mirror.
- [ ] Live **manifold / watertight checker** + triangle count + bounding-box (mm) readout.
- [ ] Wall-thickness / min-feature warning against a chosen nozzle size.

---

## 7. Export dialog (the payoff moment)

- [ ] Format tabs (STL / 3MF / OBJ / PLY / AMF / G-code) with per-format options.
- [ ] STL binary-vs-ascii toggle; 3MF colour/material embed; PLY colour toggle.
- [ ] **"Target slicer" quick-preset** (Cura / PrusaSlicer / Bambu / Orca / Chitubox) that
  picks the ideal format + settings so beginners can't pick wrong.
- [ ] Pre-export **auto-repair** pass (weld verts, fix normals, close gaps) with a report.
- [ ] Blob download (no server); filename templating; export summary (mm size, tris, watertight ✓).

---

## 8. UX / accessibility / polish

- [ ] Match `rami.party` workshop theme (`../../theme.css`, `../../style.css`), dark UI.
- [ ] Responsive; keyboard shortcuts; undo/redo; drag-&-drop image/font import.
- [ ] Tooltips teaching 3D-print terms (manifold, lithophane, infill, retraction, AMS).
- [ ] LocalStorage autosave + project export/import (JSON).
- [ ] i18n-ready string table (EN first; NL/FR to follow — matches other realms).
- [ ] a11y: ARIA labels, focus states, reduced-motion honoring.

---

## 9. Architecture & files (HTML/CSS/JS, no build step)

```
workshop/3d-forge/
  index.html
  style.css
  js/
    app.js               # bootstrap, state, events
    scene/
      viewport.js        # WebGL camera/orbit/render loop
      renderer.js        # mesh → WebGL buffers, lighting, backlight mode
      mesh.js            # Mesh datatype: verts/tris/normals, transforms, validate
      boolean.js         # CSG union/difference/intersection
    geometry/
      extrude.js         # outline → triangulated capped solid
      primitives.js      # box/cyl/sphere/torus/gear…
      text3d.js          # font glyph → outline → extrude
      heightmap.js       # image → relief mesh
      lithophane.js      # image → lithophane (flat/curved/cyl/dome/box)
      triangulate.js     # ear-clipping polygon triangulation
    image/
      pipeline.js        # grayscale/contrast/gamma/invert (Web Worker)
      trace.js           # bitmap → contours
    qr.js                # QR matrix → 3D modules
    export/
      stl.js             # binary + ascii STL writer
      threemf.js         # 3MF (ZIP+XML) writer, units=mm, colour/material
      obj.js             # OBJ + MTL writer
      ply.js             # PLY ascii/binary (+ vertex colour)
      amf.js             # AMF (XML) writer
      gcode.js           # minimal FDM slicer (Phase 6+)
      zip.js             # tiny store/deflate zip for 3MF (pure JS)
    workers/             # meshing / slicing off the main thread
  presets/
    printers.json        # bed sizes, nozzle, slicer gcode profiles
    materials.json       # lithophane/relief/resin print presets
  todo.md
```

**Library policy: prefer pure JavaScript.** Hand-roll geometry, meshing, triangulation,
CSG, the tiny ZIP for 3MF, and all mesh writers — these are pure math/bytes.
- **One pragmatic exception:** the **WebGL 3D preview**. Hand-rolling a minimal WebGL
  renderer is very feasible (and the default plan), but if it proves fragile we may vendor
  a single lightweight lib (e.g. **three.js**, MIT) *locally* purely for the viewport —
  geometry + all exports stay pure-JS and library-independent regardless.
- Font glyph→path: hand-roll a minimal TTF parser; vendor `opentype.js` (pure JS, MIT)
  locally only if the minimal parser proves unreliable.

---

## 10. Phased implementation plan

**Phase 1 — Skeleton, viewport & mesh core** ✅ DONE
- [x] `index.html` + theme + panel layout + WebGL viewport (orbit/pan/zoom + plate/grid).
- [x] `Mesh` datatype, transforms, normals, **manifold/watertight validator**, state + undo/redo.

**Phase 2 — Geometry: primitives + 3D text + emoji** ✅ DONE
- [x] Primitives (box, rounded box, cylinder, cone, sphere, torus, prism, star, gear, tube).
- [x] Robust ear-clipping triangulation **with holes** (global-index bridging + ray-cast
  visibility, earcut-style) — gears, letters, tubes all stay manifold.
- [x] Extrude (outline → capped watertight solid).
- [x] 3D text via canvas glyph raster → marching-squares contour trace → extrude
  (works with any installed **and uploaded** font, plus colour emoji).

**Phase 3 — Mesh export (highest value first)** ✅ DONE
- [x] Binary + ASCII **STL** — verified watertight.
- [x] **3MF** (hand-rolled ZIP+XML, mm units, colour) — verified as a valid ZIP package.
- [x] **OBJ+MTL**, **PLY** (ascii/binary + vertex colour), **AMF**.
- [x] Target-slicer quick presets (Cura / Prusa / Bambu / Orca / Simplify3D / Chitubox / Meshmixer).

**Phase 4 — Image → 3D (the headline features)** ✅ DONE (main-thread; Worker = future)
- [x] Image pipeline (grayscale/contrast/gamma/invert/levels).
- [x] **Lithophane** (flat / curved arc / cylinder) + **heightmap relief** via a shared
  watertight `heightfieldSolid` builder. Backlight preview in the viewport.
- [ ] Dome + 4-panel box lithophane shapes (future).

**Phase 5 — QR/logo → 3D + booleans + templates** — PARTIAL
- [x] QR→3D (base plate + raised modules, quiet zone, scannable).
- [ ] Bitmap logo → contour → extrude object (the tracer exists — expose as a tool).
- [ ] CSG booleans (union/difference/intersection).
- [ ] Keychain / cookie-cutter / stamp / coin templates.

**Phase 6 — Optional built-in G-code slicer + printer/material presets** — NOT STARTED
- [ ] Minimal planar slicer (perimeters/infill/supports) + profiles + strong safety UX.

**Phase 7 — Polish** — PARTIAL
- [x] Pre-export auto-repair pass (weld + reorient), live watertight badge, mm size,
  triangle count, volume + PLA weight, over-plate warning.
- [x] i18n scaffold (EN full; NL/FR chrome), tooltips, keyboard shortcuts, LocalStorage
  autosave, project save/open (JSON), duplicate/drop-to-plate/centre, colour per object.
- [ ] Mesh decimation, per-nozzle wall-thickness warnings, full a11y pass, NL/FR strings.

---

## 11. Validation checklist (definition of done)

- [x] Every export is **watertight/manifold** — the live validator reports ✓ Watertight for
  box, 3D text (with counters like e/o), gear (with bore) and QR, at correct **mm** size.
- [x] 3MF is a valid ZIP with `unit="millimeter"` (verified by unzipping the export).
- [x] 3D text stands up, is watertight, and needs no manual scaling.
- [x] QR→3D generated with quiet zone + raised modules (scan-ready geometry).
- [x] Everything runs **offline** — no network calls (fonts CDN is the only optional asset).
- [ ] Real-world print tests: lithophane light/dark polarity, phone-scan a printed QR,
  PLY vertex colours in Meshmixer (pending physical prints).

---

## 11b. Build log — what shipped in v1

File map actually built (all pure JS, no build step, hand-rolled WebGL — no three.js needed):
- `js/scene/mesh.js` — Mesh + mat4, weld, **watertight validator**, volume, repair.
- `js/scene/viewport.js` — minimal WebGL renderer, orbit/pan/zoom, plate/grid, backlight,
  CPU ray-pick selection.
- `js/geometry/` — `triangulate.js` (earcut-style holes), `extrude.js`, `primitives.js`,
  `text3d.js`, `heightmap.js`, `lithophane.js`, `qr3d.js`.
- `js/image/` — `pipeline.js` (grayscale/adjust), `trace.js` (marching-squares contours
  + Douglas–Peucker + hole nesting).
- `js/export/` — `stl.js`, `obj.js`, `ply.js`, `amf.js`, `threemf.js`, `zip.js` (CRC-32 STORE),
  `exporters.js` (+ slicer presets).
- `js/qr.js`, `js/objects.js`, `js/store.js` (undo/autosave/cache), `js/i18n.js`, `js/app.js`.
- `index.html`, `style.css`, `README.md`.

Key bugs found & fixed during bring-up (recorded so we don't repeat them):
1. Shoelace **sign convention** was inverted in both `triangulate` and `extrude` → CCW
   rings were flipped to CW → ear-clipper produced **no cap triangles** (open shells).
2. Naive hole-bridge picked a non-visible outer vertex on non-convex outlines (gears) →
   forced clips created **non-manifold edges**. Replaced with ray-cast visibility bridge.
3. Output duplicated bridge vertices → non-manifold after weld. Now triangulate against a
   combined vertex list using **global indices** (no duplicated points).

---

## 12. Decisions locked in

- **v1 scope:** ship **all** mesh formats (STL / 3MF / OBJ / PLY / AMF); G-code slicer is
  opt-in Phase 6+. ✅
- **Libraries:** **prefer pure JavaScript**; only possible exception is the WebGL viewport
  (three.js vendored locally *only if* the hand-rolled renderer proves fragile). ✅
- **Companion project:** the laser-engraver sibling — see
  [`workshop/laser-forge/todo.md`](../laser-forge/todo.md). ✅
- **Folder name:** `workshop/3d-forge/` (change on request).
- **WebGL viewport:** hand-rolled renderer shipped and stable — **three.js not needed**. ✅
- **Fonts/glyphs:** canvas-raster + contour-trace approach chosen over a TTF parser — works
  for any installed/uploaded font and colour emoji with zero dependencies. ✅
- **Image pipeline:** runs on the main thread for v1 (fast enough); Web Worker offload is a
  future optimisation for very large photos. ✅

---

## 13. Future ideas / backlog (new, added during the v1 build)

- **Logo / photo → extruded outline tool** — the contour tracer already exists (`trace.js`);
  wire a toolbar button that traces an uploaded bitmap and extrudes it (stencils, cookie
  cutters, keychains, badges).
- **Boolean/CSG** (union / difference / intersection) so users can cut holes, merge text
  onto a base, emboss/deboss — the single biggest capability gap.
- **Templates gallery**: keychain/name-tag, cookie cutter (outline→walls+base), stamp
  (mirrored relief), coin/medallion, fridge-magnet pocket, cable label.
- **Dome & 4-panel-box lithophane** shapes + a night-light base generator.
- **Multi-material / AMS**: per-object colour is stored already; export a 2-colour 3MF
  (e.g. QR base vs modules, or 2-tone text) as separate objects/plates.
- **Text-on-a-path / on-a-ring**, per-letter bevel/chamfer, and outline (shell-only) text.
- **Mesh decimation** slider to keep lithophane/relief triangle counts slicer-friendly,
  plus a triangle-budget readout with a quality/size trade-off.
- **Wall-thickness / min-feature checker** against a chosen nozzle Ø, with red highlight.
- **Auto-arrange / pack** multiple objects on the plate without overlap; array/duplicate grid.
- **Snap & align tools**, measurement/ruler overlay, and a section/clip plane.
- **Web Worker** meshing for big photos + a progress bar; OffscreenCanvas rendering.
- **Shareable links** (compress project to URL hash) like Laser Forge.
- **Optional G-code slicer** (Phase 6) with a very loud "verify before printing" banner.
- **STEP export** (hard) and **glTF/GLB** export for AR quick-look / sharing.
- **Supports/brim hint preview** and an estimated print-time heuristic.

---

> **Status: v1 built & self-verified (watertight box / text / gear / QR; valid 3MF export).**
> Open it at `workshop/3d-forge/index.html`. Next up: logo-trace tool, CSG booleans, templates.
