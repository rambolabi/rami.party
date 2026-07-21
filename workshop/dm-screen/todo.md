# Loregate — build log &amp; roadmap

A dual-screen Dungeon Master's table. The DM drives everything from
`index.html`; the players watch a live, mirrored map on `player.html`
(second monitor / TV). All state lives in the browser and syncs instantly
between the two screens via `BroadcastChannel` + `localStorage`.

---

## ✅ Done

### Core / architecture
- Two synced screens (DM control + player map) over one shared store (`store.js`).
- Live cross-window sync (`BroadcastChannel`, `localStorage` fallback) — no server, fully offline.
- Save / load the whole campaign to a JSON file; reset to a fresh table.
- Migration layer so older saves keep working.

### Locations
- Multiple saved locations with ‹ › arrow navigation; each keeps its own map, terrain, tokens, items, fog, weather and drawings.
- Rename, delete, **export / import a single location** (with all its stats, items and creatures).
- **Generate new location** and a big library of **pre-made, realistic maps**: Tavern (with / without NPCs), Market square, School / academy, King's road (ambush), Fields, Deep forest, Elven glade, Treehouse village, Abandoned villa, Cavern (spider lair), Villain's lair, Vault (traps &amp; treasure), Mimic hall.
- Pre-made maps are **realistic, D&D-style layouts** — walls, floors, roads, doors, bar counters, kitchens, stairs, furniture, props and placed NPCs/monsters.
- Presets start **fully fogged**.

### Map &amp; terrain
- 18 realistic, textured terrains (grass, forest, dirt, stone, cobble, wood, plank, rug, water, deep water, sand, snow, lava, cavern, moss, swamp, road, wall, void) + custom image backgrounds.
- **Paint terrain per cell** (brush), erase painted terrain, or fill the whole base map.
- Animated water shimmer &amp; lava glow.
- Optional grid, coordinates, night/dim overlay.

### Tokens &amp; creatures
- Add players / enemies / NPCs; drag to move (grid-snapped).
- HP +/- and direct entry, AC, initiative, 8 conditions, size (Medium → Gargantuan), per-token hide-from-players and show-HP-to-players.
- Names &amp; HP are kept **inside the token square** (never floating outside); names appear on hover for the DM and in the player sidebar.
- The **Big Bad** stat block with a chooseable size, one-click "drop onto the map".
- Bestiary of reusable stat blocks that spawn onto the map.

### Fog &amp; visibility
- Fog of war with **Reveal** and **Hide** brushes and 1×1 / 3×3 / 5×5 brush sizes (Alt inverts).
- Reveal all / hide all.
- **DM "see-through" slider** — how transparent unrevealed fog looks on the DM screen.
- Dynamic light: auto-reveal fog around players, torches, lanterns (with a radius setting).
- **Blackout** button to black out the player screen entirely.

### Weather (per location &amp; per block)
- Dedicated buttons: Rain, Storm (thunder flashes), Snow, Hail, Mist, Fog, Sun, Heat, Cold, Embers.
- **Select a weather brush**, then apply it to the **whole map** or **paint it onto individual blocks** — several different weathers can play at once on the same map.
- **Erase cells** removes weather from specific blocks; **Clear all** resets it; **Skip indoors** keeps weather off walls / floors automatically.
- Water &amp; lava shimmer stay contained to their own cells.
- One global animations toggle pauses all of it.

### Drawing &amp; laser
- **Pen** with colour, thickness and four styles (Pen, Marker, Glow, Dashed).
- **Erase**, **Undo** and **Clear** for drawings; strokes sync to the player screen.
- **Laser pointer** — a glowing red dot that follows the cursor on both screens and vanishes on release.

### Play aids
- Initiative tracker (auto-roll, next / prev, round counter).
- Dice roller (d4–d100, count, modifier, advantage, crit / fumble) with a roll log.
- **Show rolls to the players** — broadcasts the result to the player screen with an animated flourish.
- Party inventory, with a toggle to show it on the player screen.
- Measurement tool showing **squares · feet · metres**.
- Ping the map for the players.
- Party HP sidebar on the player screen.

### UX
- **Reorderable panels** — move up ▲, down ▼ or straight to the bottom ⤓ (persisted).
- Dragging pieces no longer jumps the DM screen.
- An in-app **HTML guide** (`guide.html`) plus this build log.
- Big settings panel (animations, grid, coordinates, snap, dynamic light, sidebar, dice-to-players, HP as numbers, names on hover, confirm deletions, …).

---

## 🔜 Steps still to do (polish / follow-ups)
- Persist per-panel open/closed state between sessions.
- Undo / redo for map edits beyond drawings (token moves, terrain, fog).
- Touch-friendly drag on tablets (pointer events are in place; needs testing on-device).
- Larger prop art / directional walls instead of emoji + terrain walls.
- Multi-cell "wall drawing" tool (click-drag a wall line).
- Snap the measurement tool to grid centres and support diagonal (5-5-5 vs 5-10-5) rules.
- Optional per-token vision so dynamic light only reveals line-of-sight.
- Confirm-before-overwrite when importing a campaign.
- **Multiplayer** — give each player their own device/screen (see `multiplayer.md`, a separate approved-pending project).

---

## 💡 Suggested / good ideas (researched — awaiting the go-ahead)
> Common asks from online DM tools (Roll20, Foundry, Owlbear Rodeo, D&D Beyond).
> Listed for approval; not built yet.

- **Character sheets** linked to tokens (abilities, saves, skills, spell slots).
- **Handouts / image reveal** — show the players an item, letter or portrait full-screen.
- **Soundboard / ambient audio** (tavern noise, combat, rain) tied to weather/scene.
- **Combat automation** — attack rolls, damage application, death saves, concentration checks.
- **Area templates** — cones, circles, lines for spells, draggable onto the map.
- **Measurement presets** for movement speed &amp; reach; auto path distance.
- **Line-of-sight / dynamic vision** walls that block both light and sight.
- **Dice tray with 3D dice** and shared roll history for the whole party.
- **Initiative auto-sort with delay/ready actions**, group initiative, lair actions.
- **Notes / journal** with linked, revealable secrets per location.
- **Music/scene "moods"** that switch weather + lighting + audio in one click.
- **Fog presets** (explored vs currently-visible "memory" fog).
- **Token status auras / markers** (concentration, reactions used, legendary actions left).
- **Multi-DM / remote players** over the network (would need a backend or WebRTC).
- **Grid types** — hex grids and gridless maps.
- **Import maps** from image files with automatic grid alignment.
- **Encounter builder** with CR budget &amp; XP totals.
- **Weather intensity slider** and wind direction for particles.

---

_Last updated: 2026-07-22_
