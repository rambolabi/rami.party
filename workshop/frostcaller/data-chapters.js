/* ==========================================================================
   Frostcaller — the chapters that were missing
   --------------------------------------------------------------------------
   Same block shape as CHAPTERS in app.js, appended to it at load. Split into
   its own file purely so app.js stays readable.

   Block types: h, p, ul, ol, code, note, table, and `svg` (a function name
   from diagrams.js, resolved by renderBlocks).
   ========================================================================== */

'use strict';

const EXTRA_CHAPTERS = [
    /* ------------------------------------------------------------ winter */
    {
        id: 'ch-winter',
        t: '❄️ Heating in winter — the half of the year this guide keeps forgetting',
        blocks: [
            { p: 'Almost every split unit sold in Belgium is a **heat pump**, which means it heats far more cheaply than it cools. The rest of this guide is written as though it were permanently August. It is not, so here is the other half.' },
            { h: 'Nothing extra to buy' },
            { p: 'The same blaster, the same config, the same infrared codes. `climate_ir` platforms expose heating already — the thermostat card simply gains a **heat** mode. If it does not, the platform has been told not to:' },
            {
                code: {
                    label: 'ESPHome · make sure heating is offered', text: `climate:
  - platform: coolix
    name: "Air conditioner"
    supports_heat: true      # the default on most platforms
    supports_cool: true`,
                },
            },
            { note: 'The one exception worth knowing: **cooling-only Mitsubishi units often ignore the “off” command** unless you set `supports_heat: false`. If your unit cannot heat and will not turn off, that is why.' },
            { h: 'Heating automations are not cooling automations backwards' },
            { p: 'A cooling automation fires when the room is **above** a number. A heating one fires when it is **below**. Copying and flipping the comparison is most of the work, but three things genuinely differ:' },
            {
                ul: [
                    '**Heat pumps hate short cycles even more than air conditioners do.** A compressor starting into a cold outdoor coil is the hardest work it ever does. Give it wider dead-bands and longer `for:` delays than you would in summer.',
                    '**Defrost cycles look like failure.** Below about 5 °C outside, the unit periodically stops heating and runs backwards to melt ice off the outdoor coil. The room cools for a few minutes and the unit may steam alarmingly. This is normal and you must not automate around it — any rule that reacts within ten minutes will fight the defrost.',
                    '**Pre-heating is worth more than pre-cooling.** A cold room takes far longer to warm than a warm room takes to cool, so the schedule wants to start earlier than instinct suggests.',
                ],
            },
            {
                code: {
                    label: 'Home Assistant · warm the room before you get up', text: `alias: Warm the bedroom before the alarm
triggers:
  - trigger: time
    at: "05:45:00"
conditions:
  - condition: numeric_state
    entity_id: sensor.bedroom_temperature
    below: 18
  - condition: time
    weekday: [mon, tue, wed, thu, fri]
actions:
  - action: climate.set_temperature
    target:
      entity_id: climate.air_conditioner
    data:
      hvac_mode: heat
      temperature: 20`,
                },
            },
            { h: 'Switching modes with the seasons' },
            { p: 'One automation that picks heat or cool from the outdoor temperature saves you touching anything in March and October. Home Assistant\'s built-in weather integration is enough — you do not need a sensor outside.' },
            {
                code: {
                    label: 'Home Assistant · pick the mode from the season', text: `alias: Seasonal mode
triggers:
  - trigger: numeric_state
    entity_id: sensor.outdoor_temperature
    above: 18
    for: "06:00:00"
    id: summer
  - trigger: numeric_state
    entity_id: sensor.outdoor_temperature
    below: 14
    for: "06:00:00"
    id: winter
actions:
  - choose:
      - conditions:
          - condition: trigger
            id: summer
        sequence:
          - action: input_select.select_option
            target: { entity_id: input_select.ac_season }
            data: { option: cooling }
      - conditions:
          - condition: trigger
            id: winter
        sequence:
          - action: input_select.select_option
            target: { entity_id: input_select.ac_season }
            data: { option: heating }`,
                },
            },
            { note: 'The six-hour `for:` is deliberate. Without it, one sunny afternoon in February flips your house into cooling mode.' },
            { h: 'What not to do' },
            {
                ul: [
                    '**Do not use a heat pump as a frost guard for a building you leave empty.** Infrared is fire-and-forget: if one “on” command is missed, nobody notices until the pipes do.',
                    '**Do not chase the last degree.** Running a heat pump at 24 °C costs far more than 21 °C and a jumper, and the efficiency falls as the target rises.',
                    '**Do not automate on the unit\'s own sensor.** It sits inside the machine, in the returning air, and reads several degrees off. Add a [room sensor](#x-temp) — in winter the error is larger, not smaller.',
                ],
            },
        ],
    },

    /* ------------------------------------------------------- heatpumpir */
    {
        id: 'ch-heatpumpir',
        t: '📚 The full `heatpumpir` example — where most people get stuck',
        blocks: [
            { p: '`heatpumpir` is the escape hatch: it wraps the Arduino-HeatpumpIR library and covers dozens of manufacturers ESPHome has no native support for. It is also the only climate platform that **refuses to compile without four extra settings**, which is exactly why beginners stall here.' },
            { h: 'The four it insists on' },
            {
                ul: [
                    '`protocol:` — which of the library\'s protocols to speak. The list is long and the names are terse; the table below has the ones people actually need.',
                    '`horizontal_default:` — where the left-right vane sits when you are not asking it to swing.',
                    '`vertical_default:` — the same for up-down.',
                    '`min_temperature:` and `max_temperature:` — the range **your unit** accepts. Get these wrong and the card offers settings the machine ignores.',
                ],
            },
            {
                code: {
                    label: 'ESPHome · a complete, working heatpumpir block', text: `# heatpumpir needs the Arduino framework on ESP8266, and works with
# either framework on ESP32. If your build fails with "no such platform",
# this is usually why.

remote_transmitter:
  pin: GPIO14
  carrier_duty_percent: 50%

climate:
  - platform: heatpumpir
    name: "Air conditioner"
    protocol: panasonic_dke     # <- the one line that matters most
    horizontal_default: middle  # left | mleft | middle | mright | right | auto
    vertical_default: middle    # down | mdown | middle | mup | up | auto
    min_temperature: 16
    max_temperature: 30
    visual:
      temperature_step: 1.0`,
                },
            },
            { h: 'Picking the protocol' },
            { p: 'Try the closest match, send a command, and watch the unit. A wrong protocol usually does nothing at all rather than something odd, so this is safe to iterate on.' },
            {
                ul: [
                    '**Panasonic** — `panasonic_dke`, `panasonic_nke`, `panasonic_jke`, `panasonic_lke`, `panasonic_ckp`. DKE is the most common in Europe.',
                    '**Mitsubishi Heavy** — `mitsubishi_heavy_zm`, `_zj`, `_zmp`, `_fdtc`. Not the same company as Mitsubishi Electric, which has its own native platform.',
                    '**Samsung** — `samsung_aqv`, `samsung_fjm`.',
                    '**Carrier** — `carrier_mca`, `carrier_nqv`, `carrier_qlima_1`, `carrier_qlima_2`. The Qlima ones are worth trying for Belgian portables.',
                    '**Sharp** — `sharp`. **Hisense** — `hisense_aud`. **Hyundai** — `hyundai`. **AUX** — `aux`. **IVT** — `ivt`. **Nibe** — `nibe`. **Vaillant** — `vaillantvai8`.',
                    '**Gree variants** — `greeyaa`, `greeyac`, `greeyan`, `greeyap`, `greeyt`. Try the native `gree` platform first; it gives you extra switches.',
                    '**Fujitsu** — `fujitsu_awyz`. **Toshiba** — `toshiba`, `toshiba_daiseikai`.',
                ],
            },
            { h: 'The temperature range is not cosmetic' },
            { p: 'If you tell ESPHome the unit accepts 16–30 but the handset only goes to 18, the card will happily send 16 and the unit will silently clamp it — or ignore the whole message. **Read the range off your own remote**, not off a spec sheet for a similar model.' },
            { note: 'The one genuinely annoying limitation: `heatpumpir` uses the library\'s one-size-fits-all interface, so a unit with six fan speeds may only expose four. That is not a bug in your config — it is the price of covering a hundred manufacturers with one API. If it matters, [capture your own codes](#ch-learn) instead.' },
            { h: '“I-Feel”, and why the fan sometimes ignores you' },
            { p: 'Some Gree units (`greeyac`) expect the handset to broadcast the room temperature periodically. Give the platform a `sensor:` and it will do the same — but the update interval must be **under ten minutes** or the unit falls back to its own sensor and your readings stop mattering. Two minutes works well.' },
        ],
    },

    /* ------------------------------------------------------ toggle test */
    {
        id: 'ch-toggle',
        t: '🔁 Is your remote a toggle or a statement? — a five-minute test',
        blocks: [
            { p: 'This decides whether it is safe to re-send a command, and almost nothing else in the guide matters as much. It takes five minutes and needs no extra hardware.' },
            { h: 'The two kinds of remote' },
            {
                ul: [
                    '**A statement remote** sends the whole desired state every time: “be on, cooling, 22 degrees, fan auto”. Sending it twice is harmless — the second message says exactly what the first did. **Almost every air conditioner works this way.**',
                    '**A toggle remote** sends “change”: the same code means on if it is off, and off if it is on. Sending it twice returns you to where you started. Cheap fans, some heaters and a few older units do this.',
                ],
            },
            { p: 'The guide\'s repeat-sending advice, its “say it twice because nobody is listening back” automation, and any retry logic you write are **only safe on a statement remote**.' },
            { h: 'The test' },
            {
                ol: [
                    'Turn the air conditioner **off** with its own handset.',
                    'On the thermostat card, set **cool, 22 °C**. The unit should start.',
                    'Wait ten seconds.',
                    'Send **exactly the same thing again** — set it to cool, 22 °C once more. On a Home Assistant card, nudge the temperature up and back down, or call the action twice from *Developer tools → Actions*.',
                    'Watch the unit.',
                ],
            },
            {
                ul: [
                    '**It stays on, and may beep.** Statement remote. Repeat-sending is safe; go and use it.',
                    '**It turns off.** Toggle remote. Never repeat a command, never build a retry, and treat every automation as fire-once.',
                    '**Nothing happens the second time.** Also fine — some units ignore an identical message within a few seconds. Try again after thirty seconds to be sure which case you are in.',
                ],
            },
            { h: 'If you have a toggle remote' },
            {
                ul: [
                    'Remove the repeat from any automation, and delete the “re-send every half hour” one entirely.',
                    'Get real state feedback before you automate anything — a [metering plug](#x-state) is the honest answer, because with a toggle remote a missed command leaves Home Assistant *and* the unit disagreeing.',
                    'If your unit has separate on and off buttons on the handset, capture those individually and use them instead of one toggle. Separate codes turn a toggle remote back into a statement one.',
                ],
            },
            { note: 'Write the answer down somewhere — in the device name, in a comment in your YAML, anywhere. In six months you will not remember, and the failure mode is “the house was freezing when we got back”.' },
        ],
    },

    /* ------------------------------------------------------- midea uart */
    {
        id: 'ch-midea',
        t: '🔌 The wired option, for people willing to open the unit',
        blocks: [
            { note: '**Read this whole chapter before touching anything.** Unlike every other page here, this one involves opening an appliance connected to mains electricity. If that sentence makes you uneasy, that is the correct reaction — the infrared routes are genuinely good and cost you nothing but line of sight.' },
            { p: 'Many air conditioners have a small internal connector intended for the manufacturer\'s own Wi-Fi dongle. On **Midea** units — and the many brands Midea builds for — that connector is a plain serial port, and ESPHome can speak to it directly with the `midea` component.' },
            { h: 'What you get that infrared cannot give you' },
            {
                ul: [
                    '**Real state.** The unit reports what it is actually doing. No guessing, no metering plug, no assumptions.',
                    '**The indoor temperature sensor**, straight from the machine.',
                    '**No line of sight.** The box lives inside the unit, so nothing can block it and nothing to aim.',
                    '**Error codes**, on some models.',
                ],
            },
            { h: 'What it costs you' },
            {
                ul: [
                    '**The warranty**, almost certainly.',
                    '**Mains safety.** The unit must be switched off at the breaker — not the remote, not the wall switch, the breaker — and left off while the cover is open.',
                    '**A soldering-free promise this guide otherwise keeps.** You need the right connector, and often that means cutting the plug off a spare dongle cable.',
                    '**Universality.** It works on Midea-family units and almost nothing else. Check before you buy anything.',
                ],
            },
            {
                code: {
                    label: 'ESPHome · the wired Midea component', text: `uart:
  tx_pin: GPIO1
  rx_pin: GPIO3
  baud_rate: 9600

climate:
  - platform: midea
    name: "Air conditioner"
    period: 1s
    timeout: 2s
    num_attempts: 3
    beeper: false            # stop it chirping at every command
    supported_modes:
      - FAN_ONLY
      - HEAT_COOL
      - COOL
      - HEAT
      - DRY
    outdoor_temperature:
      name: "Outdoor temperature"
    power_usage:
      name: "AC power usage"
    humidity_setpoint:
      name: "AC humidity"`,
                },
            },
            { h: 'If you are going to do it anyway' },
            {
                ol: [
                    '**Switch the unit off at the consumer unit** and check with a tester that it is dead.',
                    'Find the dongle connector — usually a 4-pin JST behind the front panel, labelled something like `CN` or `USB`. It carries 5 V, GND, TX and RX.',
                    '**Confirm the voltage before connecting anything.** Some units put 12 V on that connector; an ESP8266 will die instantly.',
                    'Use an ESP8266 board with the `midea` component. The ESP32 works too but the ESP8266\'s single hardware UART is what most guides assume.',
                    'Reassemble fully before restoring power. Never run the unit with the cover off.',
                ],
            },
            { note: 'There is a middle road worth knowing: **buy the manufacturer\'s own dongle** and put it on a separate VLAN with no internet access. You keep the warranty and the real state, and lose only the smugness. For most people that is the better trade.' },
        ],
    },

    /* -------------------------------------------------- capture walkthrough */
    {
        id: 'ch-walkthrough',
        t: '🎬 A capture, start to finish — with the log you will actually see',
        blocks: [
            { p: 'The [capturing chapter](#ch-learn) tells you what to do. This one shows you what it looks like, because the gap between “add a receiver” and “I have a working button” is where most people stop.' },
            { h: '1. What you should see when the receiver is working' },
            { p: 'With `remote_receiver:` and `dump: all` in the config, open the device **LOGS** and press any button on any remote. Even the wrong remote. If the log is silent, the receiver is wired wrong and no amount of pressing will help.' },
            {
                code: {
                    label: 'ESPHome logs · a TV remote, recognised', text: `[16:04:19][D][remote.nec:070]: Received NEC: address=0x20DF, command=0x10EF
[16:04:19][D][remote.raw:028]: Received Raw: 9000, -4500, 560, -560, 560, -1690,
  560, -560, 560, -560, 560, -560, 560, -1690, 560, -1690, 560, -560, 560, -39000`,
                },
            },
            { note: 'Two lines for one press is normal and good: one decoder recognised it, and `raw` printed the timings regardless. That is exactly what `dump: all` is for.' },
            { h: '2. What an air conditioner looks like instead' },
            { p: 'Now press **cool, 22 °C** on the air-conditioner handset. Expect something far longer, and usually with no friendly decode above it:' },
            {
                code: {
                    label: 'ESPHome logs · an air conditioner, not recognised', text: `[16:05:02][D][remote.raw:028]: Received Raw: 4400, -4400, 550, -1650, 550, -1650,
  550, -550, 550, -550, 550, -550, 550, -1650, 550, -550, 550, -1650, 550, -550,
  550, -550, 550, -1650, 550, -1650, 550, -550, 550, -1650, 550, -550, 550, -550,
  … 96 more values …
  550, -5000, 4400, -4400, 550, -1650, 550, -550`,
                },
            },
            {
                ul: [
                    '**A hundred-odd pulses is normal.** The whole state travels in one burst: mode, temperature, fan, swing, timer, everything.',
                    '**Two bursts separated by a long gap** (that `-5000` in the middle) means the remote sends the message twice. Copy the whole thing, gap included — it is one code.',
                    '**No decoder line** simply means no decoder recognised it. Nothing is broken.',
                ],
            },
            { h: '3. Turn it into something usable' },
            { p: 'Copy the entire `Received Raw:` line — every number, minus signs and all — and paste it into [the raw-code toolbox](#rawtool). It will tell you the header timings, guess the protocol family, and hand you back a ready-to-paste button, a Pronto code and a SmartIR entry.' },
            { p: 'If the toolbox says the header looks like a known family — Coolix, Daikin, Gree — **go and try that platform first**. Thirty seconds of trying `platform: coolix` beats an evening of raw buttons, because a platform gives you a real thermostat card and raw codes only ever give you buttons.' },
            { h: '4. Capture the states you will actually use' },
            { p: 'You do not need every combination. Four is usually plenty, and each one is a separate press:' },
            {
                ul: [
                    '`off`',
                    '`cool 22, fan auto` — the everyday setting',
                    '`cool 25, fan low` — the gentle night one',
                    '`heat 20` — if the unit heats',
                ],
            },
            { note: 'Name each capture **as you take it**. Ten minutes later they all look like identical walls of numbers, and re-capturing means fetching the handset again. [The Scribe](writer/) does the naming for you and keeps them across a reload.' },
            { h: '5. Prove it before you tidy up' },
            { p: 'Flash the button, press it in Home Assistant, and watch the unit — with the receiver still connected. If the unit responds, you are done. If it does not, the log will now show **your own transmission** being received, which tells you the code left the board and the problem is aim, distance or a wrong pin.' },
            { note: 'That last trick is the most useful debugging tool on this page: with a receiver and a transmitter on the same board, the device can hear itself. If the log shows your code going out but the unit ignores it, stop editing YAML and go and look at where the box is pointing.' },
        ],
    },
];
