# Surrounded by Bad Bosses (and Lazy Employees) — Web Application Project

## Project Overview
An educational, interactive workshop based on Thomas Erikson's *Surrounded by Bad Bosses and
Lazy Employees*. It teaches the classic bad-boss failure modes and how to manage up.

## Key Requirements
- Educational content: leadership as behaviour, the bad-boss types, the "lazy employee" myth,
  managing up, and self-awareness if you're the boss.
- Observer assessment (classify): 12 observations → which of four boss types (Tyrant,
  Micromanager, Ghost, Pushover), with a distribution bar chart.
- Handle / field guide: Do / Don't + match-the-type tactics.
- FAQ.

## Design & UX
- Clean, modern, professional, amber accent.
- Responsive, accessible, print-friendly, one question at a time, result at end.

## Technical Implementation
- Shared data-driven engine (`app.js`) + `style.css`.
- Book-specific content in `data.js` (`BOOK` object, assessment mode `classify`).
- No backend, static site.

## Content Authority
Inspired by *Surrounded by Bad Bosses and Lazy Employees* by Thomas Erikson. Reflection tool, not
a performance review of any real person. Footer invites readers to buy the book.

## Build Status — DELIVERED
- [x] index.html / style.css / app.js (shared engine, amber accent)
- [x] data.js — bad-boss content + 12-question classifier (4 types)
- [x] Concept cards + detail drawers
- [x] Classify assessment with type profile + distribution bars
- [x] Do/Don't + match-the-type field guide
- [x] FAQ, responsive, print-friendly, buy-the-book footer

## Questions for Thomas Erikson
1. Are these four boss types the right split, or would you add e.g. "the Credit-Taker"?
Yes, add the four colors in here as well, you can point to the DISC project.
2. Would you like a parallel "lazy employee" classifier as a second assessment?
Yes, absolutely, we need a lazy employee assessment.
3. Any DISC cross-link (which colours drift into which bad-boss type under stress)?
Yes, and how each color should reflect so they can take care of themselve and how they should be treated from boss or employee perspective.