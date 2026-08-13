# Glamours: ideas backlog

Things worth building next, mostly for the two ConnectWise scripts. Gathered
from what people ask of PSA tooling over and over; nothing here is promised.

## Comfort Glamour

- [ ] Board auto-refresh on a countdown, with rows that changed since the last
      look marked in the accent for a few seconds. Manage makes you press
      refresh yourself and everybody forgets.
- [ ] Keyboard triage: j/k walks the rows with a visible focus ring, x ticks
      the checkbox, Enter opens the ticket, c copies the ticket number. Hands
      stay on the keyboard for a whole board pass.
- [ ] Click a ticket number to copy it. Half of every escalation message is a
      ticket number that had to be selected with the mouse first.
- [ ] Compact density toggle: Manage's 25px rows are airy on a 1080p screen;
      an optional 20px squeezes a third more tickets onto a board.
- [ ] SLA countdown chip on the preview card, read off the SLA Status column
      when the view carries it, amber under an hour, red past due.
- [ ] "My tickets" chip in the board header: one press filters the grid to
      rows whose owner cell is your name (the Autopilot already knows it).
- [ ] Colour-blind safe variant of the stale highlight (pattern or bar-only,
      no red/green reliance).
- [ ] Per-board theme override, so the sandbox tenant can scream Hot Pink
      while production stays calm. The exclude keeps the sandbox bare today.
- [ ] Plus Jakarta Sans as an optional font override, only when the font is
      already installed locally: the script makes no network requests and
      that promise is worth keeping.
- [ ] Export the visible grid to CSV. The data is already on screen; nobody
      should need a report run for "just this board, today".

## Ticket Autopilot

- [ ] Per-board presets: remember a different stamp (status, type, owner) for
      each board name, applied by whichever board the ticket sits on.
- [ ] A dry-run switch: log what would be written without writing it, for the
      first day on a new tenant.
- [ ] Undo for the last stamp: the log already knows what was written and
      what stood there before; a click could put the old values back.
- [ ] Time-entry helper: a small timer pill that starts when a ticket opens
      and offers the elapsed time when the time-entry window appears.

## Done

- [x] Repainted brand themes (Good IT green, Good IT purple, Hot Pink), with
      hover, selection and checkboxes in the theme accent (v1.11.x).
- [x] Panel log fold keeping the last 15 notices instead of text that appears
      and disappears (v1.11.0).
- [x] Autopilot learns option lists from the tenant instead of shipping them
      (v1.6.0), with a Read button per field and an assign-to-me toggle.
