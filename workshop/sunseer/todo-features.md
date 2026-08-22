# Sunseer feature todo

The most requested features for a home solar dashboard, and how each one is
executed in this codebase. Scope rule: everything stays browser + one tiny
relay script, no cloud, no accounts, no build step.

## 1. Works from any browser in the house (tablet road)
- [x] A tablet cannot run Python, and an https page may not open `ws://` to
      another machine. So the relay itself serves the dashboard over plain
      HTTP: run `python solis-bridge.py --lan` on any PC, Pi or NAS, then open
      `http://<that-machine>:7102/` on the tablet. Same-host page + WebSocket
      means no mixed content and nothing to install on the tablet.
- **How**: extend `process_request` in `solis-bridge.py` to serve the app
  files (allowlist, correct content types, no path tricks); add a `--lan`
  flag that binds 0.0.0.0 and prints the URL to open; widen the WebSocket
  origin allowlist to private-network origins. In `app.js`, pick the
  WebSocket target from `location.host` when the page is served by the relay,
  with a manual relay-address override in settings.

## 2. Reload without losing data (localStorage everywhere)
- [x] The last reading of every inverter, the sparkline and the records
      survive a reload or a browser restart: the dashboard paints instantly
      from storage and marks the data as "last seen HH:MM" until fresh
      readings arrive. History (hourly for 14 days, daily for 400 days) was
      already stored; now the live snapshot is too.
- **How**: persist `{devices, spark, records}` under `ss_live` on every
  render (throttled) and on `pagehide`; restore it at boot before the first
  poll; base staleness on the stored timestamp instead of dropping old data.

## 3. Tablet kiosk mode
- [x] One tap turns the page into a wall display: full screen, header and
      footer chrome hidden, bigger numbers, and the screen is kept awake with
      the Wake Lock API. Esc or the floating ✕ leaves kiosk mode.
- **How**: a `⛶ Full screen` button toggles `body.kiosk` +
  `requestFullscreen()` + `navigator.wakeLock.request('screen')` (re-acquired
  on visibility change, silently skipped where unsupported).

## 4. Install as an app (PWA)
- [x] On https (rami.party) the dashboard is installable on a tablet's home
      screen and its shell loads offline.
- **How**: `manifest.webmanifest` + `icon.svg` + a small `sw.js`
  (network-first shell, cache-first versioned assets, `updateViaCache:
  'none'`), registered only in secure contexts so the LAN-http road is
  unaffected. Asset URLs carry `?v=` so cached HTML and assets can never
  mismatch behind the CDN.

## 5. Money tile
- [x] What the sun earned: today, this month and all time, from two prices
      set once in settings (price per imported kWh, feed-in price per
      exported kWh). Self-used solar counts at the import price, exported
      solar at the feed-in price.
- **How**: `value = max(0, generated - exported) × importPrice + exported ×
  feedInPrice`, computed from the inverter's own daily counters (today), the
  stored daily snapshots (month) and lifetime counters (all time).

## 6. Self-sufficiency tile
- [x] Two honest percentages for today with bars: self-consumption (how much
      of the solar stayed home) and autarky (how much of the house ran on
      sun). Autarky needs the hybrid's load counter and hides itself
      otherwise.
- **How**: `selfUsed = generated - exported`; self-consumption =
  `selfUsed / generated`; autarky = `selfUsed / houseLoad`.

## 7. CO2 avoided tile
- [x] Kilograms of CO2 avoided today and all time, with a configurable grid
      factor (default 0.35 kg per kWh) and a tree-equivalent line for scale.
- **How**: multiply the generation counters by the factor; 21 kg per tree
  per year for the equivalence.

## 8. Records tile
- [x] Peak power ever seen (with timestamp) and the best day ever (with
      date), kept across reloads.
- **How**: track the maximum of the live solar power and of the daily
  generation deltas; persist inside `ss_live`.

## 9. Battery time-to-full / time-to-empty
- [x] While charging, the battery tile says roughly when it will be full;
      while discharging, when it will hit the 10% floor. Needs the battery
      capacity (kWh) set once in settings.
- **How**: `hours = remaining_kWh / |battery_power_kW|` from SOC, capacity
  and the live battery power; formatted as `~2 h 40 m`.

## 10. Faults front and center
- [x] Any inverter fault code or stick alarm shows as a red banner right
      under the status line, named per machine, instead of hiding inside a
      card.
- **How**: collect `status_code >= 0x1000` and non-empty logger alarms in
  the render pass into a `role="alert"` banner.

## 11. Daily ledger + CSV export
- [x] A table of the last 14 days (solar, import, export, and value when
      prices are set) plus a one-tap CSV download of the full daily history
      for spreadsheets.
- **How**: render the daily counter deltas into a table tile; the CSV button
  serialises all daily deltas with a header row.

## 12. Auto theme
- [x] A fifth theme choice, Auto, follows the device's light/dark preference
      (helios in the dark, dawn in the light). New visitors start on Auto.
- **How**: resolve `auto` via `matchMedia('(prefers-color-scheme: dark)')`
  at apply time and re-apply on its change event.
