# Laser Forge — Direct Control (v2)

The **v2** evolution of [Laser Forge](../laser-forge/): not just a file *generator* but a full
browser-based laser **workbench** — design your art **and drive the machine directly** over
**Web Serial**, plus PWA/offline install, real file open/save, and plugin hooks.

> **Status:** v2 is implemented. On top of the full v1 design/export toolset it adds
> multi-select editing, boolean ops, SVG/DXF import, canvas rulers + origin, material presets,
> a live export preview, **PWA offline install**, **File System Access** open/save, **plugin
> hooks**, and — the headline — **direct laser control over Web Serial** (connect, jog, frame,
> stream, overrides, and an always-visible E-STOP behind a mandatory safety gate). See
> [`todo.md`](todo.md) for the full build log.

**100% client-side.** Nothing is uploaded — every design stays in your browser, and the
serial port is user-picked per session. Built with plain HTML + CSS + vanilla JavaScript
(ES modules), no build step, no third-party runtime dependencies.

Part of the [rami.party](https://rami.party) **workshop**.

---

## What v2 adds on top of v1

- **Editor:** multi-select (Shift-click + marquee), group move, align / distribute, group /
  ungroup, boolean union / intersect / subtract / xor, arrow-key nudge, canvas rulers, origin
  (0,0) selector, snapping, LPI scan preview, and material presets.
- **Import:** bring in **SVG** (paths/shapes, curves flattened) and **DXF R12** as editable paths.
- **Export:** a live preview in the dialog; origin-aware G-code.
- **Platform:** installable **PWA** that works fully offline; **File System Access** for real
  open/save round-trips with recents; a **plugin** system for custom generators and G-code
  dialects (behind a run-untrusted-code gate).
- **Direct control (Web Serial):** Connect to a GRBL laser, jog/home/set-origin, **frame** the
  job, stream with character-counted flow control, live DRO + status, feed/power overrides,
  pause/resume, and an always-visible **E-STOP** — all gated behind a safety acknowledgement,
  with a watchdog that feed-holds on tab-hide and cuts power on disconnect.

---

## Features (inherited from v1)

- **Content generators**
  - Text — any font (with `.ttf/.otf` upload via the browser), size in mm, bold/italic,
    alignment, multi-line, mirror. Exported as true outlines so no font is needed on import.
  - Emoji & symbols — inserted as monochrome silhouettes, traced to clean vectors on export.
  - Shapes — rectangle (rounded), circle/ellipse, polygon, star, heart, line.
  - QR codes — self-contained encoder (byte mode, versions 1–10, error-correction L/M/Q/H).
- **Image → grayscale engraving pipeline** (the crown feature)
  - Grayscale, brightness, contrast, gamma, levels (black/white points), invert.
  - **Dithering:** Floyd–Steinberg, Jarvis, Stucki, Atkinson, Sierra, Burkes, ordered
    2×2/4×4/8×8, halftone, plus pure threshold and continuous grayscale.
  - White-background removal, live preview — what you see is what engraves.
- **Layout** — millimetre artboard with bed presets, grid, zoom/pan, move/resize/rotate,
  layers, and **colour-as-operation** (engrave = black, cut = red, score = blue).
- **Exports (all real, all in-browser):**

  | Format | Kind | Best for |
  |---|---|---|
  | **SVG** | vector (+ embedded images) | LightBurn, Glowforge, xTool, Inkscape |
  | **DXF** (R12) | vector | Ruida / RDWorks, EZCAD, CAD |
  | **PDF** | vector + image | LightBurn, print/keep |
  | **PNG** | raster (grayscale/dithered) | photo engraving |
  | **BMP** (8-bit & 1-bit) | raster | LaserGRBL |
  | **JPG** | raster | compatibility |
  | **G-code** | direct machine code | GRBL diode/CO₂ (vector + raster engrave) |

  A **“Target software” preset** auto-picks the ideal format + settings so beginners can’t
  get it wrong. Everything exports at true **1:1 millimetre scale**.

---

## Running it

It’s a static site. Because it uses ES modules, serve it over HTTP (not `file://`):

```powershell
# from the repo root
python -m http.server 8777
# then open http://localhost:8777/workshop/laser-forge/index.html
```

Any static host works (GitHub Pages, etc.). No server code, no API keys, no tracking.

---

## Project structure

```
laser-forge/
  index.html        UI shell
  style.css         scoped styling (rami.party palette)
  js/
    main.js         UI wiring: toolbar, properties, layers, export dialog
    store.js        state, undo/redo, autosave
    artboard.js     interactive mm canvas (select/move/resize/rotate/zoom/pan)
    objects.js      object factories, preview drawing, vector geometry
    image.js        decode + grayscale/adjust/dither pipeline
    dither.js       dithering algorithms
    trace.js        bitmap → vector contours (marching squares)
    qr.js           self-contained QR encoder
    exporters.js    SVG / DXF / PDF / PNG / BMP / JPG / G-code writers
    geometry.js     shared math helpers
  todo.md           full build plan + roadmap
```

---

## Safety (G-code / direct control)

Laser cutting/engraving is dangerous. Always **verify generated G-code**, wear rated
eyewear, run with fume extraction and fire suppression, and **never run a laser
unattended**. The G-code exporter requires an explicit safety acknowledgement.

## Roadmap

The next major version turns the browser into the **machine controller** (Web Serial /
GRBL streaming — connect, jog, frame, run) so you can go from design to burn without any
desktop software. See **§13** of [`todo.md`](todo.md) for the full plan. Not yet implemented.
