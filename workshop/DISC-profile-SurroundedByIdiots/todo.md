# DISC Personality Workshop - Web Application Project

## Project Overview
Create a professional, interactive webpage based on "Surrounded by Idiots" by Thomas Erikson that educates users about the 4 DISC personality color profiles with engaging quizzes.

## Key Requirements

### 1. Educational Content Section
- **Red (Dominant/Driver)**: Direct, results-oriented, competitive, decisive, commanding
- **Yellow (Expressive/Influencer)**: Enthusiastic, outgoing, optimistic, sociable, persuasive
- **Green (Steady/Supporter)**: Calm, patient, reliable, supportive, team-focused
- **Blue (Conscientious/Analyser)**: Careful, logical, precise, quality-focused, thoughtful

For each color, include:
- Core characteristics and traits
- Communication style
- Decision-making approach
- Work environment preferences
- Strengths and potential weaknesses
- How they interact with other colors

### 2. Self-Assessment Quiz
- 15-25 targeted questions about personal preferences and behaviors
- Questions hidden during the quiz experience
- Results displayed ONLY at the end
- Single color result or percentage breakdown
- Detailed interpretation page with recommendations

### 3. Others Assessment Quiz
- 15-25 questions about observing someone else's behavior
- **Real-time dynamic graph** updating after each answer
- Graph shows live probability distribution across all 4 colors
- Visual indicators showing which color is currently "winning"
- Final result with confidence levels
- Ability to take multiple assessments for different people

### 4. Design & UX Requirements
- Clean, modern, professional layout
- Color-coded sections matching each personality (Red, Yellow, Green, Blue)
- Responsive design (mobile, tablet, desktop)
- Easy navigation between content and quizzes
- Progress indicators for quizzes
- Print-friendly results pages
- Accessibility standards compliance (WCAG 2.1)

### 5. Technical Implementation
- HTML5/CSS3 for structure and styling
- JavaScript for quiz logic and real-time graph updates
- Chart library (Chart.js or similar) for dynamic visualization
- Local storage for session management
- No backend required (static site acceptable)

### 6. Additional Features
- Information cards/panels for quick reference
- FAQ section addressing common questions
- Quick personality identifier (rapid assessment)
- Shareable results (with permission)
- Tips for working with each color type
- Workshop facilitation guide integration

## Content Authority
Information sourced from "Surrounded by Idiots" and established DISC methodology by William Moulton Marston.

---

## Build Status — DELIVERED (v2, incorporating Thomas Erikson's feedback)
Files:
- `index.html` — workshop hub (Learn, Test Yourself, Read Someone, Quick ID, Tips, **Cards**, FAQ)
- `style.css` — clean professional light theme, responsive, print styles
- `data.js` — content, questions, **adapted-style questions, forced-choice groups, comms + pairComms**
- `shared.js` — shared scoring/chart/blend helpers (`window.DUI`) used by all pages
- `app.js` — workshop engine (nav, learn, matrix, self, two-pass observer, quick, cards)
- `communicate.html` + `communicate.js` — shareable "how to communicate with me" cards (single + pair)
- `self-forced-choice.html` + `forced-choice.js` — alternative most/least test

v2 changes from feedback:
1. [x] Colours kept front and centre (DISC letters secondary)
2. [x] Results always name the top **two** colours; 3- and 4-way close mixes get explicit "bigger situational mix" wording
3. [x] Marston behavioural model referenced alongside Erikson
4. [x] Separate **forced-choice** test page (most/least) built for side-by-side comparison with the Likert test
5. [x] Observer test now runs **two passes** — natural style (live graph) + adapted/under-pressure style — with an overlay radar and a "what changes under pressure" note
6. [x] Footer now invites visitors to **buy the book and support the author**
7. [x] Per-colour **communication cards** + all six **two-colour blend** cards, cross-linked and linking back to the workshop
8. [x] Strengths/watch-outs kept as-is

## Original build (v1) requirements — all still met
- [x] Educational content for all 4 colours
- [x] Colour-to-colour interaction matrix
- [x] Self-assessment (Likert, one at a time, result only at end, % + radar)
- [x] Others-assessment (live real-time graph, confidence, multiple people)
- [x] Quick identifier, Tips, FAQ
- [x] Responsive, accessible, print-friendly, Chart.js via CDN, no backend

## Questions for Thomas Erikson (collaboration notes)
Please confirm / advise so v2 stays faithful to the book:
1. **Terminology** — For a general audience, do you prefer the plain colour names (Red/Yellow/Green/Blue) foregrounded over the DISC letters? Current build leads with colours and shows DISC labels as secondary. OK?
Yes stay with the colors.

2. **Blend messaging** — The book stresses ~80% of people are two-colour blends. I surface the top-two blend when the gap is small. Would you like the results to *always* name a primary + secondary pair rather than a single colour?
Unless there are no other colors, speak of both top colors.
If all three or four colors are a close mix, add in some more specific text to show this person is a bigger mix depending on the situation than just one or two colors.

3. **Question wording** — Any statements/observations you'd rephrase to match the book's voice? Happy to swap in your preferred phrasings verbatim.
You are allowed to take parts from William Moulton Marston his behavioral model as well.

4. **Scoring weights** — Self-test maps Likert 1–5 to weight 0–4 per colour. Do you want forced-choice ("most/least like me") ranking instead, which some DISC purists prefer?
Make a seperate test as an example in a different webpage, we will see the difference and what we prefer.

5. **Stress vs. baseline** — Should the observer test distinguish a person's *adapted* (work/pressure) style from their *natural* style, as the book discusses? Could add a second short pass.
Yes

6. **Attribution / licensing** — Any specific credit line, disclaimer, or trademark wording you want on the footer regarding the book and the DISC model?
If the visitor wants more information they should buy the book and support the author.

7. **Facilitation guide** — The todo mentions a workshop facilitation guide. Do you want a printable facilitator's script/slide companion added as a separate page?
Make a seperate page regarding each color so people can send each other a "how to communicate with me/him/her" page.
This page should contain the most critical information on how to handle this color.
These pages should forward back to each other and to the main page.
There should also be mixed pages, a mix between each two colors and how to handle these double color people.

8. **Colour meanings nuance** — Any corrections to the strengths/watch-outs lists you'd like adjusted to avoid stereotyping?
No, the current explanation is perfectly fine.
