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

**Phase 1 — Skeleton, viewport & mesh core**
- [ ] `index.html` + theme + panel layout + WebGL viewport (orbit/pan/zoom + plate/grid).
- [ ] `Mesh` datatype, transforms, normals, **manifold/watertight validator**, state + undo.

**Phase 2 — Geometry: primitives + 3D text + emoji**
- [ ] Primitives, ear-clipping triangulation, extrude, 3D text (font upload), emoji solids.

**Phase 3 — Mesh export (highest value first)**
- [ ] Binary + ASCII **STL** ← ship first, verify watertight in Cura/PrusaSlicer.
- [ ] **3MF** (ZIP+XML, mm units) → verify in Bambu/Orca/Prusa.
- [ ] **OBJ+MTL**, **PLY** (colour), **AMF**.

**Phase 4 — Image → 3D (the headline features)**
- [ ] Image pipeline (grayscale/contrast/gamma/invert) in a Worker.
- [ ] **Lithophane** (flat/curved/cyl/dome/box) + **heightmap relief**. → print-test a lithophane.

**Phase 5 — QR/logo → 3D + booleans + templates**
- [ ] QR→3D, bitmap→contour→extrude, CSG booleans, keychain/cookie-cutter/stamp templates.

**Phase 6 — Optional built-in G-code slicer + printer/material presets**
- [ ] Minimal planar slicer (perimeters/infill/supports) + profiles + strong safety UX.

**Phase 7 — Polish**
- [ ] Auto-repair pass, decimation, wall-thickness warnings, i18n, tooltips, a11y, README.

---

## 11. Validation checklist (definition of done)

- [ ] Every export is **watertight/manifold** — imports into Cura & PrusaSlicer with **no
  repair warning**, at correct real-world **mm** size.
- [ ] 3MF opens in Bambu/Orca with correct units (and colour where set).
- [ ] A lithophane STL slices and prints with correct light/dark polarity.
- [ ] 3D text stands up, is watertight, and needs no manual scaling.
- [ ] QR→3D print scans with a phone.
- [ ] PLY vertex colours display in Meshmixer/Blender.
- [ ] Everything works **offline** with no network calls (verify in devtools).

---

## 12. Decisions locked in

- **v1 scope:** ship **all** mesh formats (STL / 3MF / OBJ / PLY / AMF); G-code slicer is
  opt-in Phase 6+. ✅
- **Libraries:** **prefer pure JavaScript**; only possible exception is the WebGL viewport
  (three.js vendored locally *only if* the hand-rolled renderer proves fragile). ✅
- **Companion project:** the laser-engraver sibling — see
  [`workshop/laser-forge/todo.md`](../laser-forge/todo.md). ✅
- **Folder name:** `workshop/3d-forge/` (change on request).

---

> **Status: awaiting your go-ahead.** Per your instruction, I've stopped here after the
> plan. Say the word and I'll start Phase 1 (I can build both forges in parallel, or one
> first — your call).
