# Loregate Multiplayer — design & build plan

> **Status: NOT STARTED — this is a plan for a separate follow-up project.**
> Nothing here is implemented in the current single-machine Loregate. This
> document describes how to give **each player their own screen** (own device)
> showing their own character, stats, HP and items, with everything synced to
> the DM screen and the shared player map.

---

## 1. Goal

Today Loregate runs on **one machine**: the DM screen and the shared player map
sync through the same browser (`BroadcastChannel` + `localStorage`). Multiplayer
adds **remote participants**, each on their own device:

- **DM** — the existing control screen (authoritative).
- **Shared screen** — the big map on the TV (read-only, as today).
- **Player screens** (new) — one per player, on their own phone/laptop, showing
  *their* character sheet, HP, conditions, inventory and the map, and letting
  them take their own actions (move their token, update HP, roll dice, edit
  their sheet).

All of this must stay in sync: a player's HP change appears on the DM screen and
the shared screen; the DM's map/fog/weather changes appear on every player.

---

## 2. Why the current approach isn't enough

`BroadcastChannel` and `localStorage` only sync **within one browser on one
computer**. Remote players need a **network transport**. Two viable paths:

| Option | Pros | Cons |
|--------|------|------|
| **A. Small realtime backend** (WebSocket server) | Simple mental model, reliable, easy auth, single source of truth | Needs hosting (Node + `ws`, or a service like Ably/Pusher/Supabase Realtime/Firebase) |
| **B. Peer-to-peer (WebRTC)** with the DM as host | No server to run; DM's browser is the hub | NAT/firewall traversal needs a STUN/TURN + a tiny signalling server anyway; DM must stay online |

**Recommendation:** Option A with a lightweight WebSocket relay (or a hosted
realtime service) — the DM's browser remains the **authoritative state owner**;
the server just relays and persists.

---

## 3. State model changes

Extend the current state with players and per-player ownership.

```jsonc
{
  "room": { "code": "ABCD", "dmSecret": "…" },
  "players": [
    {
      "id": "p1",
      "name": "Aria",
      "color": "#38bdf8",
      "tokenId": "tok-…",          // links to a token on the active location
      "sheet": {
        "class": "Ranger", "level": 5, "race": "Elf",
        "abilities": { "str": 10, "dex": 16, "con": 14, "int": 12, "wis": 15, "cha": 8 },
        "ac": 15, "speed": 30, "profBonus": 3,
        "saves": {…}, "skills": {…}, "spellSlots": {…}, "features": […]
      },
      "hp": 30, "maxHp": 30, "tempHp": 0, "conditions": [],
      "inventory": [ { "name": "Longbow", "qty": 1 }, … ],
      "notes": ""
    }
  ],
  "locations": [ … ],              // unchanged
  "settings": { … }                // unchanged
}
```

- Each **player owns their token** (`tokenId`) and their `sheet`, `hp`,
  `inventory`, `conditions`.
- The DM can still see and override everything (authoritative).

---

## 4. Roles & permissions

| Action | DM | Player (own) | Player (others) | Shared screen |
|--------|----|--------------|-----------------|---------------|
| Move own token | ✅ | ✅ | ❌ | ❌ |
| Move any token | ✅ | ❌ | ❌ | ❌ |
| Edit own HP / sheet / inventory | ✅ | ✅ | ❌ | ❌ |
| Reveal fog / weather / terrain | ✅ | ❌ | ❌ | ❌ |
| Roll dice (broadcast) | ✅ | ✅ | ✅ | ❌ |
| See hidden tokens / DM fog / notes | ✅ | ❌ | ❌ | ❌ |

Enforce on the **authoritative side** (DM browser or server) — never trust the
client. A player message like "move token X to (c,r)" is accepted only if
`X === player.tokenId`.

---

## 5. Architecture

```
                    ┌─────────────┐
                    │  DM screen  │  (authoritative state owner)
                    └──────┬──────┘
                           │ WebSocket
                    ┌──────┴──────┐
                    │   Relay /   │  (WebSocket server or hosted realtime)
                    │   server    │  persists snapshots, relays deltas
                    └──┬───┬───┬──┘
        ┌──────────────┘   │   └──────────────┐
   ┌────┴────┐        ┌────┴────┐         ┌────┴────┐
   │ Shared  │        │ Player  │   …     │ Player  │
   │ screen  │        │ Aria    │         │ Bram    │
   └─────────┘        └─────────┘         └─────────┘
```

- **Transport:** JSON messages over WebSocket. Rooms keyed by a short **join
  code** (e.g. `ABCD`). DM holds a `dmSecret`; players join with the code +
  their name.
- **Sync strategy:** authoritative state + **deltas**. The DM (or server) owns
  the canonical state; clients send *intents* (deltas scoped to what they own);
  the authority validates, applies, and broadcasts the resulting patch.
- **Reuse the existing store:** keep `store.js` as the local mirror. Add a
  `net.js` layer that:
  - on local `update()`, sends a delta to the server (if the change is allowed
    for this client),
  - on incoming server messages, applies patches and calls the store's `notify()`.
- Keep `BroadcastChannel` for same-machine sync (DM + shared TV on one PC), and
  add the network layer on top for remote players.

---

## 6. New screens

- **`join.html`** — landing page: enter room code + name → opens the player app.
- **`play.html`** — the player app:
  - a **character sheet** panel (abilities, saves, skills, AC, speed, spell slots, features),
  - **HP / temp HP / conditions** controls,
  - a personal **inventory**,
  - the **live map** (same renderer as the shared screen, read-only except their own token which they can drag),
  - a **dice roller** that broadcasts to everyone,
  - **notes**.
- **DM screen additions:** a "Players" panel to create/link players to tokens,
  generate the room code, see who's connected, and lock/allow player actions.

---

## 7. Build steps (suggested order)

1. **Extract the map renderer** shared by shared-screen and player app into a
   reusable module (currently duplicated between `dm.js` / `player.js`).
2. **Add `players[]` + character sheets** to the state model and the DM "Players"
   panel (works offline first, single machine).
3. **Build the character sheet UI** (`play.html`) reading/writing a player's own
   slice of state locally.
4. **Add the network layer** (`net.js`) + a minimal **WebSocket relay** (Node +
   `ws`, or a hosted realtime service). Rooms, join codes, reconnect.
5. **Delta protocol + permission checks** on the authority side.
6. **Presence** (who's online), **cursor/laser per player**, optimistic updates
   with server reconciliation.
7. **Persistence** — server stores the latest snapshot so a refresh/reconnect
   restores the session.
8. **Auth hardening** — DM secret, per-player tokens, validate every intent.

---

## 8. Open questions / decisions to make

- Host our own tiny WebSocket server, or use a managed realtime service?
- How much of the D&D 5e ruleset to model in the sheet (full automation vs. free-form fields)?
- Should players see each other's full sheets, or just names + HP?
- Offline/late-join behaviour and conflict resolution when two clients edit at once.
- Do we support multiple simultaneous campaigns/rooms per server?

---

_This is a planning document only. Do not implement until the single-machine
Loregate is signed off and this plan is approved._
