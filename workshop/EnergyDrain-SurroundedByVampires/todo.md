# Surrounded by Vampires — Web Application Project

## Project Overview
An educational, interactive workshop inspired by Thomas Erikson's book on energy vampires. It
teaches the four kinds of energy drainer and how to protect your energy.

## Key Requirements
- Educational content: what an energy vampire is, the four types, how they drain you, protecting
  your energy, and managing your own state.
- Observer assessment (classify): 12 observations → which of four types (Victim, Critic, Drama
  Magnet, Controller), with a distribution bar chart.
- Handle / field guide: Do / Don't + energy boundaries.
- FAQ.

## Design & UX
- Clean, modern, professional, deep-magenta accent.
- Responsive, accessible, print-friendly, one question at a time, result at end.

## Technical Implementation
- Shared data-driven engine (`app.js`) + `style.css`.
- Book-specific content in `data.js` (`BOOK` object, assessment mode `classify`).
- No backend, static site.

## Content Authority
Inspired by *Surrounded by Vampires* by Thomas Erikson. Reflection tool, not a label for real
people. Footer invites readers to buy the book.

## Build Status — DELIVERED
- [x] index.html / style.css / app.js (shared engine, magenta accent)
- [x] data.js — energy-vampire content + 12-question classifier (4 types)
- [x] Concept cards + detail drawers
- [x] Classify assessment with type profile + distribution bars
- [x] Do/Don't + energy-boundaries field guide
- [x] FAQ, responsive, print-friendly, buy-the-book footer

## Questions for Thomas Erikson
1. Are these four energy-vampire types the split you use? (Victim / Critic / Drama / Controller)
Yes, include explanation regarding each color from DISC and how each gets drained or drains.
2. Should we add a self-check "are you draining others?" second assessment?
Yes
3. Any DISC cross-link (which colours are most vulnerable to which drainer)?
Yes, absolutely, you can link the DISC assessment for more information.
