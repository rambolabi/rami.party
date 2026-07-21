# 🐉 Loregate — a dual-screen Dungeon Master's table

Loregate is a browser-based **virtual tabletop** for Dungeons &amp; Dragons and
other tabletop RPGs. It runs on **two screens**:

- **Your screen** (`index.html`) — the DM control table: build the map, move
  everything, track the fight, and keep your secrets.
- **The players' screen** (`player.html`) — a clean, live map you put on a
  second monitor, TV or projector. It shows only what you choose to reveal.

Everything is stored **locally in your browser** and mirrors between the two
screens instantly. No account, no server, nothing leaves your device.

---

## Quick start

1. Open **`index.html`** on your laptop.
2. Click **🖥️ Open player screen**. A new window opens — drag it onto your
   second monitor / TV and press **F11** for full-screen.
3. Pick a map from the **✨ New / preset…** menu (or start blank), then start
   dragging tokens around. The player screen updates as you go.

> Both screens must be opened from the **same browser on the same computer**
> (they sync through that browser). To play across the internet you'd need the
> networked version listed in `todo.md`.

---

## The DM screen, panel by panel

### Top bar
- **Open player screen** – launches / focuses the players' map.
- **Save / Load** – export or import the whole campaign as a `.json` file.
- **Reset** – wipe back to a fresh table.

### Location bar
- **‹ ›** – flip between saved locations. Each location keeps its own map,
  tokens, items, fog and weather.
- **✨ New / preset…** – make a blank location or generate a ready-made,
  realistic map (tavern, fields, cavern, vault, mimic hall). Presets start
  **fogged** so you can reveal them as the party explores.
- **⭳ / ⭱** – export or import a single location (with all its contents).
- **🗑️** – delete the current location.
- Type in the name field to rename the location.

### Terrain toolbar
- Choose a **terrain** and click **🖌️ Paint** to paint it onto individual
  cells (walls, water, roads, rugs…). **🧽 Erase** removes painted terrain.
  **Fill map** repaints the whole base.
- **Grid** toggle, **📍 Ping** (click the map to flash a marker for players),
  **📏 Measure** (drag to read distance in squares / feet / metres).

### Fog toolbar
- **On** toggles fog of war. **🔦 Reveal** and **🌫️ Hide** are brushes — pick a
  **brush size** (1×1 / 3×3 / 5×5) and drag over the map. Hold **Alt** to
  invert a brush.
- **Reveal all / Hide all** for the whole location.
- **See-through** slider — how transparent the *unrevealed* fog looks on **your**
  screen (players always see solid black).
- **⬛ Blackout** — instantly black out the players' screen (scene changes,
  breaks, dramatic reveals).

### Weather bar
- Click any weather to toggle it for the current location: Rain, Storm, Snow,
  Hail, Mist, Fog, Sun, Heat, Cold, Embers, or **Clear**.
- **Skip indoors** keeps weather off walls and floors automatically.
- **✂️ Clear cells** — brush over specific blocks to remove weather there.

### Panels (drag-order with ▲ ▼)
- **Scene &amp; Story** – campaign title + a read-aloud scene (toggle whether players see it).
- **The Big Bad** – villain stat block with a chooseable **size**; drop it on the map.
- **Roster &amp; Combat** – add tokens; adjust HP, AC, initiative, conditions, size;
  hide from players; show HP to players; centre or delete. Drag tokens on the map to move them.
- **Items &amp; Props** – a palette of 30+ props. Click one, then click the map to
  place it (or place and drag). Rename, resize, hide from players, or delete each.
- **Initiative** – auto-roll, step through turns, track the round.
- **Bestiary** – reusable stat blocks; **spawn** them onto the map.
- **Party Inventory** – shared items; toggle to show it on the players' screen.
- **Dice Roller** – d4–d100 with count, modifier, advantage. Tick **Show rolls to
  the players** to reveal each result on their screen with a flourish.
- **Settings** – animations, night overlay, grid on the player screen, coordinates,
  snap-to-grid, dynamic light + radius, party stats sidebar, inventory sharing,
  dice sharing, HP as numbers, names on hover, confirm deletions.
- **DM Notes** – private scratchpad, never shown to players.

---

## What the players see

The player screen shows the active location's map with the current terrain,
grid (optional), revealed areas, weather and any tokens/items you've left
visible. It never shows hidden tokens/items, DM fog, names floating on the map,
or your notes. It **can** show, if you enable them:

- a **party HP sidebar** (names, HP bars, conditions),
- the **party inventory**,
- **dice rolls** you push to them,
- the **read-aloud scene** text,
- whose **turn** it is.

Tokens keep their name &amp; HP *inside* their square, so nothing clutters the map.

---

## Tips

- **Reveal as you go:** leave presets fogged and use the reveal brush room by room.
- **Dynamic light:** turn on *Dynamic light* in Settings and give a player a torch
  or lantern — fog opens up around them automatically.
- **Dramatic pause:** hit **Blackout** while you reset the map behind the scenes.
- **Reorder:** use the ▲ ▼ on any panel to push rarely-used panels (like the Big
  Bad) to the bottom.
- **Back up a session:** use **Save** before a big fight; **Load** to roll back.

---

## Files

| File | Purpose |
|------|---------|
| `index.html` / `dm.js` / `dm.css` | The DM control screen |
| `player.html` / `player.js` / `player.css` | The players' map screen |
| `store.js` | Shared state, terrain &amp; item catalogues, preset maps, sync |
| `ambient.js` | Weather particle effects |
| `style.css` | Shared map / token / terrain styling |
| `todo.md` | Build log &amp; roadmap |

Built for [rami.party](https://rami.party) · runs 100% in the browser.
