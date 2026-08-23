# WattWarden — feature backlog

What people actually build and ask for in P1-meter / home-energy dashboards.
Sources: the Home Assistant energy dashboard and its feature-request forum, Domoticz
and ESPHome P1 projects, the HomeWizard Energy app and its helpdesk, Tweakers "slimme
meter uitlezen" threads, and GitHub issues on the various homewizard-energy libraries.

Legend: `[x]` shipped on this page · `[ ]` backlog. One line each, grouped by theme.
The page is a static, no-account, browser-only dashboard: features that need a server,
an external paid API or another device are honestly parked in the backlog.

## Costs and tariffs

1. [x] Price per kWh for imported energy
2. [x] Separate tariff-1 / tariff-2 (night/day) prices, with a single-price mode
3. [x] Feed-in compensation price per exported kWh
4. [x] Gas price per m³
5. [x] Water price per m³
6. [x] Fixed standing charge per day (vastrecht, netbeheer)
7. [x] Currency choice (€, £, $, kr, CHF)
8. [x] Cost today, live, from the meter's own tariff counters
9. [x] Cost this month, plus a projected month total at the current pace
10. [x] Yearly cost estimate of your always-on base load
11. [ ] Dynamic hour prices (EPEX / easyEnergy / Frank Energie): needs an external
       price API with keys and terms; parked until a stable free endpoint is chosen
12. [ ] Contract manager (multiple price periods over time, so old history is costed
       with the price that applied back then)

## Live view

13. [x] Big current-power readout with import/export colouring
14. [x] Watt / kilowatt display toggle (auto-switch above 1 kW)
15. [x] Live sparkline, window selectable: 10, 30 or 60 minutes
16. [x] Power bar showing where the current draw sits against your alert ceiling
17. [x] Active tariff badge (T1/T2)
18. [x] Plain-language load description ("something big is heating")
19. [x] Power-flow strip: grid → home or home → grid with animated direction
20. [x] Today's minimum / maximum / average power, with the time of the peak
21. [x] Base-load estimate (the quiet minimum your house never drops below)
22. [ ] Appliance recognition from the load signature (fridge, kettle, dryer): real
       NILM needs way more than a 1-second feed; out of scope for a webpage

## History and charts

23. [x] Hourly snapshots kept 14 days (localStorage)
24. [x] Daily snapshots kept 400 days (localStorage)
25. [x] Per-tariff counters stored in snapshots, so costs stay honest later
26. [x] Last-24-hours bar chart (import up, export down)
27. [x] History chart with switchable period: 7 days, 30 days, 12 months
28. [x] 12-month aggregation built from the daily snapshots
29. [x] Gas shown per day in the history data (stored per snapshot)
30. [x] Charts redraw in theme colours and on resize
31. [x] Hover or tap any chart bar for the exact values: time, kWh in and out,
        gas and the cost of that hour, day or month
32. [x] Cost overlay drawn on the energy charts (own scale, peak labelled,
        per-bar figures in the tooltips)
33. [ ] Average line and trend line on charts
34. [ ] Save any chart as a PNG image
35. [ ] Zoom and pan inside a chart

## Comparisons and insight

36. [x] Today so far vs yesterday's full day
37. [x] Yesterday's total, 7-day average, this month and last month at a glance
38. [x] Net grid position today (imported minus exported)
39. [x] CO₂ footprint today and this month (configurable g/kWh and g/m³ factors)
40. [x] Month cost projection ("at this pace: ± € 92")
41. [ ] Same-weekday comparison (this Monday vs previous Mondays)
42. [ ] Degree-day corrected gas comparison (needs outside temperature data)
43. [ ] Average-household comparison presets per country
44. [ ] Solar self-consumption percentage (needs the inverter's production feed,
       not just the net P1 reading; see the neighbouring Sunseer project)
45. [ ] Anomaly detection ("this fridge-hour is 40% above its usual")

## Alerts

46. [x] High-usage alert with a configurable watt ceiling
47. [x] Meter-offline alert when readings stop arriving
48. [x] Belgian capaciteitstarief guard: warn when the running 15-minute average
       approaches this month's registered peak
49. [x] Voltage out-of-band warning (EN 50160: outside 207-253 V)
50. [x] Phase-current warning near your main fuse rating (configurable ampère)
51. [x] Alert banner on the page itself
52. [x] Optional beep (Web Audio, no files)
53. [x] Optional browser notification (with a permission button in settings)
54. [x] One alert per condition until it recovers (no notification storms)
55. [ ] Quiet hours for alerts
56. [ ] Alert history log page
57. [ ] Webhook / ntfy.sh push when an alert fires (needs an allow-listed endpoint)

## Display, themes and layout

58. [x] Theme picker with seven looks: Ember, Aurora, Paper, Contrast, Solar,
        OLED black (true #000 for burn-in-prone panels) and Nord
59. [x] Custom accent colour with a colour picker, applied to charts too
60. [x] Display scale from 85% to 140% for readability across tablets
61. [x] Compact density mode that fits more tiles per screen
62. [x] Tiles individually shown or hidden
63. [x] Tile order rearrangeable from settings (move up / move down)
64. [x] Sixteen tiles to choose from, sensible eight visible by default
65. [x] Clock in the header (kiosk classic), optional
66. [ ] Drag-and-drop tile rearranging
67. [ ] Resizable tiles (small / wide / tall)
68. [ ] Custom CSS box for power users
69. [ ] Multiple saved layouts (day layout vs night layout)

## Kiosk and wall-tablet

70. [x] Works with zero installs straight from the browser where allowed
        (direct fetch with the local-network permission), relay only as fallback
71. [x] Keep the screen awake (Wake Lock, re-acquired when the tab returns)
72. [x] Fullscreen kiosk button in the header
73. [x] Night dimming on a schedule (from/to time, dim strength)
74. [x] Installable as an app: web manifest with icon, standalone display
75. [x] Service worker so the shell loads instantly even when the meter is off
76. [x] Optional pause of polling while the tab is hidden (saves phone battery)
77. [ ] Auto-rotate between tile pages every N seconds (menu-board style)

## Data management

78. [x] Export the full history as JSON
79. [x] Export the history as CSV for spreadsheets
80. [x] Import a JSON export back (merge, deduplicated per hour/day)
81. [x] Storage meter in settings (snapshots counted, KB used)
82. [x] Wipe-history button with confirmation
83. [x] Counter-regression guard (meter swap or reset never poisons "today")
84. [x] Demo household mode kept in its own storage, never mixing with real data
85. [ ] Automatic periodic backup download reminder
86. [ ] Sync history between browsers (needs a server or file-sync trickery)

## Grid quality and meter detail

87. [x] Per-phase power bars, voltage and current per line
88. [x] Grid frequency readout
89. [x] Voltage sag / swell counters and power-failure counters
90. [x] Meter model, DSMR version, Wi-Fi network and signal strength
91. [x] Raw JSON inspector showing the meter's last full reply
92. [x] Connection health: source in use (direct/relay), reading age, fetch latency
93. [x] Monthly peak tile with timestamp (Belgian capaciteitstarief)

## Connectivity and other meters

94. [x] HomeWizard P1 v1 API, all fields optional, both peak-typo spellings
95. [x] Direct-first connection with precise failure diagnosis, relay fallback,
        automatic recovery and re-probing
96. [ ] HomeWizard v2 API (HTTPS + token): browsers refuse its self-signed
       certificate, so this only becomes possible through the relay
97. [ ] Multiple dongles on one dashboard (P1 + kWh meter + Watermeter)
98. [ ] Other dongle brands that mimic the API (Slimmelezer, ESPHome p1reader)
99. [ ] mDNS discovery of meters via the relay ("find my meter" button)

## Integrations (all need something outside a static page)

100. [ ] MQTT publishing over WebSocket to a broker
101. [ ] Home Assistant long-term statistics export format
102. [ ] InfluxDB / Grafana line-protocol export
103. [ ] PVOutput / EnergyID uploads

## Added after field testing on a real meter (2026-08-23)

104. [x] Alert messages name the exact measurement and phase that tripped them
        ("L2 at 198.4 V", "L1 at 23.1 A"), so the number is visible without
        opening any tile
105. [x] 0.0 V on a phase that carries current is treated as what it is: a smart
        meter that does not report voltage there (no false alarm, explained in
        the Voltage & current tile)
106. [x] Clean console: the page only tries the relay while it would actually be
        used; a direct connection means zero WebSocket retry noise
107. [x] Fullscreen is a real kiosk mode: intro, explainer and footer disappear,
        the header shrinks to one line, the buttons tuck into a corner
108. [x] Full-screen-width layout option for TVs and big monitors (kiosk mode
        does this automatically)
109. [x] Transfer code: one tap copies history plus settings as a compact code,
        paste it in another browser or on another device to move house
110. [x] JSON import can also restore the settings from the export
111. [ ] QR code on screen carrying the transfer code, scan it with the tablet
112. [ ] Tariff schedule editor (automatic T1/T2 by hour and weekend per region)
113. [ ] Net-metering (saldering) year balance view for Dutch solar owners
114. [ ] Gas and water drawn as their own history charts
115. [ ] Outside temperature overlay for gas context (needs a weather API)
116. [ ] Auto theme by clock: light theme by day, OLED black at night
117. [ ] Phase imbalance warning for three-phase homes
118. [ ] EV charger and home battery tiles on the same dashboard
119. [ ] Weekly summary as a printable / shareable image
120. [ ] Language switch (NL, DE, FR)
121. [ ] Read-only live view for a second device on the LAN (relay would serve it)
122. [x] Hover or press any statistic for a plain-language explanation of what it
        means and where it comes from (sparkline included, point by point)
123. [x] Settings dialog laid out in two columns: prices and alerts on one side,
        appearance and data/demo on the other, stacking again on narrow screens
124. [x] Last 60 minutes chart: full-width power line with import/export shading,
        point-by-point hover, and the readings survive a page reload

## More field requests gathered from the community (2026-08-23, round 2)

What keeps coming up in Home Assistant forums, Tweakers energy threads and
smart-meter app reviews, still open here:

125. [ ] Picture-in-picture mini window: pop the live wattage into a small
        always-on-top window while you work (Document Picture-in-Picture)
126. [ ] Day-by-hour heatmap: a calendar grid coloured by usage, the classic
        "find your patterns at a glance" view
127. [ ] Monthly budget: set a kWh or euro target, watch a progress bar and get
        warned when the pace will overshoot it
128. [ ] Same month last year comparison once enough history has built up
129. [ ] Standby hunt mode: pin the current wattage, walk around unplugging
        things, and see exactly how much each device was sipping
130. [ ] Water leak watch: warn when water keeps flowing in the small hours
        (needs the Watermeter feed)
131. [ ] Cheap hour advisor for dynamic contracts: shift the dishwasher to the
        cheapest block (pairs with the dynamic price feed, item 11)
132. [ ] Spoken or chimed announcements for chosen events ("exporting now")
133. [ ] Cast the dashboard to a Chromecast or smart TV
134. [ ] Scheduled automatic backups straight into a folder you pick once
        (File System Access API, Chromium only)
135. [ ] Backfill old history by importing the grid operator's CSV export
        (Fluvius, Liander, Enexis portals all offer one)
136. [ ] Printable monthly report: one tidy page of totals, costs and charts
137. [x] Import level colours: paint the power line in your own colours per band,
        for example blue up to 1 kW and red above it, threshold and colours free
        to choose (export keeps the theme's green)
138. [x] Graph picker in Appearance: tick which graphs you want (live sparkline,
        60 minutes, 24 hours, history) without digging through the tile list
139. [x] Simple view: an energy-display style screen (big ring gauges plus side
        stats, like the HomeWizard Energy Display), with templates (Energy
        display, Solar, Costs, Minimal), free slot assignment from a catalogue
        of eighteen readings and per-ring colours
