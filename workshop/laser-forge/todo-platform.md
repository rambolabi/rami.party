# Laser Forge — Platform features (`todo-platform.md`)

> **Status: planned, NOT implemented — awaiting go-ahead.** This file holds the full,
> step-by-step plan for the "Platform" backlog from [`todo.md`](todo.md) §19. Everything here
> stays true to Laser Forge's rules: **100% client-side, offline-first, no server, no
> tracking, prefer pure JavaScript.**

Scope of this document:
1. PWA / offline install
2. File System Access API (real open/save round-trips)
3. Plugin hooks (custom generators + custom G-code dialects)
4. Direct browser → laser control (Web Serial) — cross-links §13 of `todo.md`

---

## 1. PWA / offline install

**Goal:** installable app that works with no network, launches from the OS, and updates cleanly.

- [ ] **Web app manifest** `manifest.webmanifest`
  - `name`, `short_name` ("Laser Forge"), `start_url: "./"`, `scope: "./"`,
    `display: "standalone"`, `theme_color: #0b0524`, `background_color: #06030f`.
  - Icons: 192, 512, and a `maskable` 512 (SVG source → export PNGs). Add `<link rel="manifest">`.
- [ ] **Service worker** `sw.js` (vanilla, no framework)
  - `install`: pre-cache the app shell (index.html, css, every `js/*.js`, fonts) — an explicit
    versioned list (`CACHE = 'laserforge-v1'`).
  - `activate`: delete old caches (keep current version) → clean upgrades.
  - `fetch`: **cache-first for same-origin app assets**, network-fallback; never cache exports.
  - Register from `main.js` behind a feature check (`'serviceWorker' in navigator`).
- [ ] **Offline verification** — DevTools → Offline → full reload still boots and exports.
- [ ] **Update UX** — detect `waiting` SW → small "Update available – reload" toast.
- [ ] **Note:** self-hosted Google Font is required for true offline (bundle Quicksand locally,
  drop the `fonts.googleapis.com` link).

**Build order:** manifest + icons → SW pre-cache + register → activate/cleanup → offline test →
update toast → local font bundle.

---

## 2. File System Access API (open / save round-trips)

**Goal:** "Save" writes back to the *same* `.json` file (Ctrl+S feel); "Open" keeps a live handle.
Graceful fallback to the current download/upload flow where unsupported (Firefox/Safari).

- [ ] **Capability check** — `('showSaveFilePicker' in window)`; otherwise keep today's
  Blob-download + `<input type=file>`.
- [ ] **Open** → `showOpenFilePicker({types:[{accept:{'application/json':['.json']}}]})`
  → keep the `FileSystemFileHandle` in memory as the "current document".
- [ ] **Save** → if a handle exists, `createWritable()` → write → close (no re-prompt).
  **Save As** → `showSaveFilePicker()` → store the new handle.
- [ ] **Dirty tracking** — mark modified on `commit`; show `●` in the title; warn on unload if dirty.
- [ ] **Permissions** — re-request read/write permission on handle if `queryPermission` !== granted.
- [ ] **Recent files** — persist handles in IndexedDB (handles are structured-cloneable) for a
  "recent projects" list; re-verify permission on click.
- [ ] **SVG/DXF import hook** (pairs with the `todo.md` import item) — same picker, parse into objects.

**Build order:** capability + fallback wiring → Open handle → Save/Save-As → dirty state →
IndexedDB recents → permission re-prompt.

---

## 3. Plugin hooks (custom generators + G-code dialects)

**Goal:** let power users add their own object generators and machine dialects **without forking**,
while staying offline and safe.

### 3.1 Generator plugin API
- [ ] Define a stable interface mirroring built-ins:
  ```js
  LaserForge.registerGenerator({
    type: 'myPart', label: 'My Part', icon: '🧷',
    defaults: { w: 50, h: 50, /* params */ },
    properties: [ /* declarative field schema → auto-built panel */ ],
    localLoops(obj) { return [{ pts:[...], closed:true, op:'cut' }]; },
  });
  ```
- [ ] **Declarative property schema** (`{key,label,type:'number|range|select|checkbox|text',min,max,step}`)
  so the Properties panel is generated for plugins exactly like core types.
- [ ] Wire the registry into `objects.js` dispatch (`localLoops`), `main.js` toolbar + `typeHTML`.
- [ ] **Sandboxing / safety** — plugins are JS; load only user-pasted/opened code with a clear
  "run untrusted code?" gate. Prefer a restricted API surface (no network, no DOM beyond canvas).
- [ ] **Persist** installed plugins in IndexedDB; list + enable/disable + remove in a "Plugins" panel.

### 3.2 G-code dialect plugins
- [ ] Extract the current GRBL writer into a **dialect descriptor** (header/footer, laser-on/off,
    power word `S`, feed word `F`, arc support, units, travel/burn templates).
- [ ] Ship descriptors for **GRBL**, **Marlin (laser)**, **Smoothieware**, and a **Ruida RD**
    note (RD is binary/proprietary → separate encoder, flagged experimental).
- [ ] Let plugins register a dialect: `LaserForge.registerDialect({ id, name, header(p), moveOn, moveOff, ... })`.
- [ ] Export dialog: dialect dropdown next to the G-code options.

**Build order:** registry + declarative panels → core dispatch integration → persistence/UI →
untrusted-code gate → dialect descriptor refactor → extra dialects.

---

## 4. Direct browser → laser control (Web Serial) — v2

> Detailed protocol notes already live in **§13 of [`todo.md`](todo.md)**. This is the
> platform-side build checklist; keep the safety gating from §13.4 non-negotiable.

- [ ] **Serve over HTTPS** (Web Serial requires a secure context) — GitHub Pages is fine.
- [ ] **Connect** — `navigator.serial.requestPort()` (user gesture) → open @115200 → wake →
  detect GRBL banner → raw console.
- [ ] **Streamer** — character-counted flow control (128-byte RX budget), `ok`/`error` tracking,
  progress + ETA (reuse the §19 cost estimator).
- [ ] **Status** — poll `?` ~5 Hz → parse `<State|MPos|FS>` → live DRO + state pill.
- [ ] **Controls** — jog pad, home `$H`, unlock `$X`, set origin `G10 L20`, **frame** bounding box
  at low power, **material test grid** (ties to that generator).
- [ ] **Overrides + job control** — feed/power override bytes, pause `!` / resume `~` /
  soft-reset `0x18`, always-visible **E-STOP**.
- [ ] **Machine profiles** — bed size, `$$` read/write, dialect (from §3.2).
- [ ] **Safety & watchdogs (blocking gate)** — explicit "I understand" agreement; soft-limit checks
  before streaming; auto `M5` + feed-hold on disconnect / tab-hide / lost status.
- [ ] **Fallbacks** — WebUSB / Web Bluetooth paths where serial is unavailable.

**Build order:** connect + console → streamer + ok tracking → status/DRO → jog/home/origin →
frame + test-grid → overrides + E-STOP → profiles/`$$` → safety gating + watchdogs → fallbacks.

---

## Cross-cutting

- [ ] Keep **pure-JS / no-dependency** discipline; vendor a tiny MIT lib locally only if a hand-roll
  is genuinely risky.
- [ ] Everything must keep working **offline** and **client-side** — verify each feature with the
  network disabled.
- [ ] Accessibility pass (ARIA, focus, reduced-motion) alongside the new panels.

> **Do not implement yet** — this file is the agreed plan; start on request, top-to-bottom.
