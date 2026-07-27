# 🐉 D&D Forge — Character Creator

A beautiful, edition-aware **Dungeons & Dragons character creator** that runs entirely in your
browser. Design a full hero — abilities, race, class, skills, weapons, spells, feats, backstory —
across editions, with a live character sheet, dice roller, DM controls and shareable links.
No install, no accounts, nothing leaves your device.

## ✨ Features

- **Edition selector** — D&D 5E (2024, default & 2014 with the full rules engine), plus 3.5, 4E,
  AD&D 2E and 1E (SRD-adapted approximations).
- **9-step builder** — Identity → Race → Class → Abilities → Background → Skills → Equipment →
  Spells → Review, with a **live character sheet**.
- **Abilities** — Standard Array, Point Buy (27), Roll 4d6-drop-lowest, or Manual, with
  edition-aware racial / background boosts.
- **Skills, weapons & magic** — enforced skill picks + expertise, full weapon/armor tables with
  auto attack/damage & AC, and a spellcasting engine (save DC, attack, slots, searchable spellbook).
- **Backstory Weaver** — rerollable personality/ideal/bond/flaw/origin/motivation/moment/secret
  lines that weave into an editable prose backstory.
- **Feats**, **portraits**, **fantasy name generator**, **gold & adventuring gear**, carrying
  capacity, languages & tools.
- **Play aids** — inspiration, death saves, and tap-to-roll skills & saving throws via the dice roller.
- **🔮 Fate Seed** — reproduce any random character from a seed number / share link.
- **🛡️ DM's Charter** — set table rules (lock edition, fixed/max level, ability caps, weapon/spell
  limits, barred races/classes) and send players a link that enforces them.
- **Save/Load** (Party Manager), **JSON export/import**, **shareable link**, **copy to clipboard**,
  **print sheet**, light/dark theme, PWA manifest, responsive & accessible.

## 🚀 Use

Open `index.html` in any modern browser. That's it. Data persists in `localStorage`.

## 📁 Structure

```
D&D/
├── index.html              # app shell
├── manifest.webmanifest    # PWA metadata
├── css/styles.css          # parchment / dark-leather theme + print CSS
├── js/data.js              # SRD rules data (window.DND)
├── js/app.js               # state, rendering, calculations, dice, sharing
└── todo.md                 # roadmap + build notes
```

## 📜 Licensing

Rules content is from the **SRD** under the **OGL v1.0a** and **CC-BY-4.0** (SRD 5.1). *Dungeons &
Dragons* is a trademark of Wizards of the Coast; this fan project is unaffiliated and non-commercial.
See **Rules & Licensing** in the app footer.
