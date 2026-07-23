# 3D Forge

The 3D-printing sibling of **Laser Forge** — a 100% client-side, offline generator that turns
**text, emoji, shapes, QR codes and photos** into **watertight, print-ready 3D models** for
*any* slicer. Part of the [rami.party](https://rami.party) workshop.

> Type a word, drop in a photo, or pick a shape → download an STL/3MF that slices with **no
> repair warnings**, at true **millimetre** scale.

## Features

- **3D text** in any installed *or uploaded* font (`.ttf/.otf`), plus colour **emoji → solid**.
- **Primitives**: box, rounded box, cylinder, cone, sphere, torus, prism, star, **gear**, tube.
- **Photo → Lithophane** ⭐ (flat / curved / cylinder) with a live **backlight preview**.
- **Image → relief** (embossed heightmap sign/coin).
- **QR code → 3D** with quiet zone + raised modules (scannable by print).
- **Watertight by construction** — a live validator badges every model ✓ Watertight and
  reports size (mm), triangle count, volume and PLA weight.
- **Export**: `STL` (binary/ASCII), `3MF` (units + colour), `OBJ`+`MTL`, `PLY` (vertex colour),
  `AMF`. A **target-slicer** picker auto-chooses the ideal format (Cura / PrusaSlicer /
  Bambu / Orca / Simplify3D / Chitubox / Meshmixer).
- **Real millimetres everywhere**, orbit/pan/zoom viewport, undo/redo, autosave, project
  save/open, per-object colour, drop-to-plate / centre / duplicate.

## Use it

Open `index.html` from a static web server (ES modules need HTTP, not `file://`):

```powershell
cd workshop/3d-forge
python -m http.server 8777
# then browse http://localhost:8777/
```

Everything runs in your browser — **nothing is ever uploaded**.

## How it works (pure JS, no build step, no dependencies)

- `js/scene/` — `Mesh` datatype (+ mat4, weld, **manifold validator**) and a hand-rolled
  minimal **WebGL** `Viewport` (orbit/pan/zoom, plate/grid, backlight, CPU ray-pick).
- `js/geometry/` — earcut-style `triangulate` (holes via ray-cast visibility bridging),
  `extrude`, `primitives`, `text3d`, `heightmap`, `lithophane`, `qr3d`.
- `js/image/` — `pipeline` (grayscale/contrast/gamma/invert) and `trace` (marching-squares
  contours + Douglas–Peucker + hole nesting).
- `js/export/` — `stl`, `obj`, `ply`, `amf`, `threemf` (+ a tiny CRC-32 STORE `zip`).
- `js/` — `qr` encoder, `objects`, `store` (undo/autosave/cache), `i18n`, `app` (UI wiring).

Text/emoji are rasterised to a canvas, traced to clean contours and extruded — so *any*
font works with zero dependencies. The WebGL preview is hand-rolled; **three.js is not used**.

## Roadmap

See [`todo.md`](todo.md) — next up: a logo/photo → extruded-outline tool, CSG booleans, a
templates gallery (keychain / cookie cutter / stamp / coin), dome & box lithophanes, and an
optional built-in G-code slicer.

## License

Part of rami.party. Not for redistribution without permission.
