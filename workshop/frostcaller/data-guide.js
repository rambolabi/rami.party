/* ==========================================================================
   Frostcaller — everything the guide says
   --------------------------------------------------------------------------
   The content: the six paths and their steps, the parts bench, the drawer, the
   ready-made devices, the software list, the six flashing routes, the extras,
   the shared chapters, the FAQ and the picker's questions.

   Kept apart from app.js on purpose. This file is prose, prices and links —
   change it freely. app.js is the machinery that draws it, and wants more
   care. Both load on the guide page only; The Scribe needs none of it.

   Conventions:
     • Text may use `code`, **bold** and [links](url) — rendered by rich() in
       text.js. They do not nest.
     • Prices are euro cents at the low and high end, converted at display time.
     • Anything user-visible that is not prose belongs in i18n.js instead.
   ========================================================================== */

'use strict';

/* ── Parts bench ─────────────────────────────────────────────────────────── */
/* low / high are EUR, used to total up a shopping list. `q` is the AliExpress
   search phrase — we link to a search page, never to one seller.            */
const PARTS = [
    {
        id: 'atom',
        name: 'M5Stack Atom Lite',
        low: 7, high: 10,
        q: 'm5stack atom lite',
        why: 'A 24 mm cube holding an ESP32, a USB-C socket, a button and — the important bit — an **infrared LED already on board**. Nothing to wire, nothing to solder, and it comes in a case.',
    },
    {
        id: 'stickc',
        name: 'M5StickC Plus2',
        low: 16, high: 22,
        q: 'm5stickc plus2',
        why: 'The Atom’s bigger sibling: same built-in IR LED, plus a screen and a small battery. Nice if you want the room temperature shown on the device itself. Costs double.',
    },
    {
        id: 'esp32',
        name: 'ESP32 dev board (headers pre-soldered)',
        low: 2.5, high: 4.5,
        q: 'esp32 devkit v1 38 pin',
        why: 'The classic blue board. Make sure the listing photo shows the **black pin strips already attached** — the “kit” versions ship them loose in the bag, which means soldering.',
    },
    {
        id: 'd1mini',
        name: 'Wemos D1 mini (ESP8266)',
        low: 1.5, high: 3,
        q: 'wemos d1 mini esp8266',
        why: 'The cheapest thing that can do this, and you may already own one. Works, but the ESP8266 has no hardware timer for infrared, so long AC codes are a little less reliable than on an ESP32.',
    },
    {
        id: 'ky005',
        name: 'KY-005 infrared transmitter module',
        low: 0.6, high: 1.5,
        q: 'ky-005 ir transmitter module',
        why: 'An IR LED on a small board with three labelled pins, so jumper wires can just push on. Range is modest — think **1 to 3 metres, pointing straight at the unit**.',
    },
    {
        id: 'blaster',
        name: 'IR blaster module with driver transistor (2–4 LEDs)',
        low: 1.5, high: 3,
        q: 'ir led transmitter module transistor 38khz',
        why: 'Same idea as the KY-005 but with a transistor driving several LEDs, so it reaches across a room and does not care as much about aim. Wires on the same three pins.',
    },
    {
        id: 'irrx',
        name: 'VS1838B / KY-022 infrared receiver module',
        low: 0.5, high: 1.2,
        q: 'vs1838b ir receiver module',
        why: 'Only needed if your AC brand is not in ESPHome’s list: this is the **ear** that listens to your original remote so you can copy its codes. Buy one anyway, they cost less than a coffee.',
    },
    {
        id: 'dupont',
        name: 'Female–female Dupont jumper wires (40 pcs)',
        low: 1, high: 2,
        q: 'female to female dupont jumper wires 20cm',
        why: 'The whole reason this guide needs no soldering. Get the **female–female** kind: a socket on each end, which pushes straight onto both the board’s pins and the module’s pins.',
    },
    {
        id: 'serial',
        name: 'USB-to-serial adapter (CH340 or CP2102, 3.3 V)',
        low: 1.5, high: 3,
        q: 'usb to ttl serial adapter ch340 3.3v',
        why: 'Only needed if you go hunting inside a shop-bought puck that will not accept firmware over the air. Buy the kind with a **3.3 V / 5 V jumper** and leave it on 3.3 V forever.',
    },
    {
        id: 'psu',
        name: '5 V USB charger + cable',
        low: 2, high: 4,
        q: 'usb charger 5v 1a eu plug',
        why: 'The box lives in the room permanently, so it needs a socket. Any phone charger of 1 A or more will do — a decent brand, not the mystery €0.60 one. Check the cable is a **data** cable if you also want to flash through it.',
    },
    {
        id: 'm5ir',
        name: 'M5Stack Unit IR (U002)',
        low: 4, high: 6,
        q: 'm5stack unit ir u002',
        why: 'A plug-in pod with both an IR transmitter and receiver, joined to an Atom by one Grove cable. The tidiest way to add “learning” to the Pocket Wand path without touching a wire.',
    },
    {
        id: 'tuyair',
        name: 'Tuya / Moes Wi-Fi IR blaster',
        low: 5, high: 9,
        q: 'tuya wifi ir remote control blaster',
        why: 'A finished, good-looking puck with a powerful 360° blaster inside, sold for less than the parts cost. Out of the box it is cloud-only — the fun is in replacing its firmware.',
    },
    {
        id: 'zbir',
        name: 'Moes UFO-R11 Zigbee IR blaster',
        low: 9, high: 14,
        q: 'ufo-r11 zigbee ir remote control',
        why: 'Same puck, but speaking Zigbee instead of Wi-Fi. No Wi-Fi password to hand over, no cloud once paired, and it joins your existing Zigbee mesh.',
    },
    {
        id: 'broadlink',
        name: 'Broadlink RM4 Mini',
        low: 13, high: 20,
        q: 'broadlink rm4 mini',
        why: 'The “I do not want a project” option. Home Assistant has supported it natively for years, it talks locally on your LAN after setup, and it has a strong blaster.',
    },
    {
        id: 'athom',
        name: 'Athom IR remote controller (ESPHome pre-installed)',
        low: 15, high: 22,
        q: 'athom esphome ir remote controller',
        why: 'A finished puck that **already runs ESPHome** when it arrives. Power it up, join your Wi-Fi, and Home Assistant discovers it. All the local-control benefits of the DIY paths, none of the flashing. Athom and a few similar makers sell these; check the listing says ESPHome or Tasmota **pre-installed**.',
    },
    {
        id: 'th',
        name: 'AHT20 or BME280 temperature sensor module',
        low: 1, high: 3,
        q: 'aht20 module i2c',
        why: 'Four jumper wires and your box also reports the real room temperature — which is what you actually want to automate on. The M5 “ENV” unit does the same by Grove cable for a few euro more.',
    },
    {
        id: 'plug',
        name: 'Smart plug with power monitoring',
        low: 8, high: 14,
        q: 'zigbee smart plug power monitoring',
        why: 'Optional but clever: if your AC plugs into a wall socket, a metering plug tells Home Assistant whether the unit is **truly** running — the one thing infrared can never know.',
    },
    {
        id: 'zbdongle',
        name: 'Zigbee coordinator (e.g. SONOFF ZBDongle-E)',
        low: 18, high: 25,
        q: 'sonoff zbdongle-e zigbee',
        why: 'Only if you have no Zigbee network yet. It plugs into the machine running Home Assistant and gives every future Zigbee gadget a home.',
    },
];


/* ── The five paths ──────────────────────────────────────────────────────── */
const PATHS = [
    /* ---------------------------------------------------------------- wand */
    {
        id: 'wand',
        glyph: '🪄',
        name: 'The Pocket Wand',
        sub: 'M5Stack Atom Lite + ESPHome · nothing to wire at all',
        low: 9, high: 14,
        level: 'Beginner',
        time: 'One evening',
        tags: [
            { t: 'No soldering', c: 'good' },
            { t: 'No wiring either', c: 'good' },
            { t: '100% local', c: 'good' },
            { t: 'Needs Home Assistant', c: '' },
        ],
        needs: ['atom', 'psu'],
        extras: ['m5ir', 'th'],
        inv: [
            { any: ['m5'], part: 'atom', label: 'An M5Stack Atom Lite (or StickC)' },
            { any: ['psu'], part: 'psu', label: 'A USB charger and a data cable' },
            { any: ['computer'], part: null, label: 'A computer running Chrome or Edge (once)' },
            { any: ['haserver'], part: null, label: 'Home Assistant running somewhere' },
        ],
        ends: 'A proper **thermostat card** in Home Assistant — mode, target temperature, fan speed — driven by a matchbox-sized cube that plugs into any USB charger. No cloud, no account, no subscription.',
        pros: [
            'Genuinely solder-free and wire-free: the infrared LED is already inside.',
            'It arrives in a case, so it looks finished rather than like homework.',
            'ESPHome updates it over Wi-Fi forever after the first USB flash.',
            'Add-on pods (temperature, extra IR) clip on with one cable.',
        ],
        cons: [
            'Twice the price of a bare ESP32, which is still only about €8.',
            'The built-in LED is small: aim it at the unit and stay within roughly 3 metres.',
            'You need Home Assistant running somewhere on your network.',
        ],
        steps: [
            {
                t: 'Get Home Assistant ready',
                p: [
                    'You need Home Assistant running somewhere — a Raspberry Pi, an old laptop, a NAS, a mini PC. If you have not installed it yet, read the chapter [Home Assistant & ESPHome, from zero](#ch-ha) first and come back.',
                    'Then install the **ESPHome Builder** add-on: `Settings → Add-ons → Add-on store → ESPHome Builder → Install → Start`, and tick *Show in sidebar*.',
                ],
            },
            {
                t: 'Plug the Atom into your computer',
                p: [
                    'Use a USB-C cable that carries **data**, not one of the thick charge-only ones that came with a power bank. If the board does not show up later, this is the first thing to suspect.',
                    'Open ESPHome Builder in a **Chrome or Edge** browser on that same computer. Firefox and Safari cannot talk to serial ports.',
                ],
            },
            {
                t: 'Create the device',
                p: [
                    'In ESPHome Builder click **+ NEW DEVICE**, name it `ac-wand`, and pick **ESP32** when it asks for the chip. It will generate a starter configuration containing your Wi-Fi details and a randomly generated encryption key — leave all of that exactly as it is.',
                    'When it offers to install straight away, choose **Skip** — we want to add the infrared part first.',
                ],
            },
            {
                t: 'Add the infrared bits to the config',
                p: [
                    'Click **EDIT** on the new device card and paste the blocks below at the **bottom** of the file, keeping everything ESPHome already wrote above.',
                    'The only line you may need to change is the platform name on the `climate:` block. See [the brand table](#ch-brands) — and if your brand is not listed, start with `coolix` anyway, because a surprising number of cheap units speak it.',
                ],
                code: {
                    label: 'ESPHome · ac-wand.yaml (append)',
                    text: `logger:

# The Atom Lite has an infrared LED built in, on GPIO12.
remote_transmitter:
  pin: GPIO12
  carrier_duty_percent: 50%

climate:
  - platform: coolix          # <-- your brand goes here
    id: ac
    name: "Air conditioner"

# Optional: the button on the front becomes a panic "off" switch.
binary_sensor:
  - platform: gpio
    pin:
      number: GPIO39
      inverted: true
    name: "Wand button"
    on_press:
      - climate.control:
          id: ac
          mode: "OFF"`,
                },
                note: 'If the compile complains about the button block, just delete it — pin numbers move around between board revisions and the infrared part does not care about buttons.',
            },
            {
                t: 'Install it over USB',
                p: [
                    'Click **INSTALL → Plug into this computer**, pick the serial port that appears, and go make tea. The very first build downloads a compiler and can take five to fifteen minutes. Every later update takes seconds and happens over Wi-Fi.',
                    'When the log window starts scrolling with lines about Wi-Fi and an IP address, it worked.',
                ],
            },
            {
                t: 'Adopt it in Home Assistant',
                p: [
                    'Go to `Settings → Devices & services`. A new **ESPHome** device is waiting to be configured — click **Configure**, accept, and you now have an entity called something like `climate.air_conditioner`.',
                    'Drop it on a dashboard: `Edit dashboard → + Add card → Thermostat`.',
                ],
            },
            {
                t: 'Put it in the room and aim it',
                p: [
                    'Unplug it from the computer, plug it into the USB charger, and place it where the LED has a clear line of sight to the AC’s little dark window. Read [Where to put the box](#ch-place) — this is the step that decides whether the whole thing works.',
                ],
            },
            {
                t: 'Test like a scientist',
                p: [
                    'Set the card to **cool, 22 °C** and watch the AC. If it beeps and the display changes, you are done — go and read [Automations worth having](#ch-automate).',
                    'If nothing happens, do not start changing five things at once. Go to [When it does not work](#ch-trouble) and work down the list.',
                ],
            },
        ],
    },

    /* --------------------------------------------------------------- bench */
    {
        id: 'bench',
        glyph: '🔌',
        name: 'The Three-Wire Bench',
        sub: 'ESP32 (or an old ESP8266) + a €1 IR module + jumper wires',
        low: 5, high: 9,
        level: 'Beginner+',
        time: 'One evening',
        tags: [
            { t: 'Cheapest new build', c: 'good' },
            { t: 'No soldering', c: 'good' },
            { t: '100% local', c: 'good' },
            { t: 'Three wires to push on', c: '' },
        ],
        needs: ['esp32', 'ky005', 'dupont', 'psu'],
        extras: ['blaster', 'irrx', 'th'],
        inv: [
            { any: ['esp32', 'esp8266'], part: 'esp32', label: 'An ESP32 or ESP8266 board with header pins' },
            { any: ['irled'], part: 'ky005', label: 'An infrared transmitter module' },
            { any: ['wires'], part: 'dupont', label: 'Female–female jumper wires' },
            { any: ['psu'], part: 'psu', label: 'A USB charger and a data cable' },
            { any: ['computer'], part: null, label: 'A computer running Chrome or Edge (once)' },
            { any: ['haserver'], part: null, label: 'Home Assistant running somewhere' },
        ],
        ends: 'Exactly the same **thermostat card** as the Pocket Wand, for about half the money, at the cost of a small tangle of wires and no case. Perfect if you already have a board in a drawer.',
        pros: [
            'The cheapest honest way in — under €8 including the charger.',
            'Still no soldering: female-to-female jumper wires push onto both parts.',
            'Swapping the weak LED module for a stronger blaster module is a 30-second upgrade.',
            'Any leftover ESP32 or D1 mini you already own makes this nearly free.',
        ],
        cons: [
            'It looks like a science project. Consider an empty mint tin or a 3D-printed case.',
            'The KY-005 module is dim: 1 to 3 metres, aimed properly. Longer needs the driver module.',
            'Three wires means three chances to put a wire on the wrong pin.',
        ],
        steps: [
            {
                t: 'Set up Home Assistant and ESPHome',
                p: [
                    'Identical to the other ESPHome path: install Home Assistant, then the **ESPHome Builder** add-on. The full walkthrough is in [Home Assistant & ESPHome, from zero](#ch-ha).',
                ],
            },
            {
                t: 'Push three wires on — with the board unplugged',
                p: [
                    'The IR module has three pins. Different sellers label them differently, so read the tiny silkscreen letters rather than counting positions.',
                ],
                list: [
                    '`S` (or `DAT`, or `SIG`) → **GPIO14** on the ESP32',
                    'the middle pin (`+`, `VCC`, `MID`) → **3V3** — *not* 5V',
                    '`−` (or `GND`, `G`) → any **GND** pin',
                ],
                svg: 'wiring',
                note: '**Why 3.3 V?** The module usually has no proper driver transistor, so the LED hangs directly off the chip’s pin. 3.3 V keeps both of them comfortably inside their limits. It costs you a little range and buys you a board that survives the summer.',
            },
            {
                t: 'Create the device in ESPHome',
                p: [
                    '**+ NEW DEVICE**, name it `ac-blaster`, choose **ESP32** (or **ESP8266** for a D1 mini), let it write the Wi-Fi and encryption blocks, then **Skip** the install offer.',
                ],
            },
            {
                t: 'Paste the config',
                p: [
                    'Click **EDIT** and append the block below. Change the `climate:` platform to match [your brand](#ch-brands); if you have no idea, leave `coolix` and try it — it is the single most widely understood protocol among cheap units.',
                ],
                code: {
                    label: 'ESPHome · ac-blaster.yaml (append)',
                    text: `logger:

remote_transmitter:
  pin: GPIO14              # the pin your module's S wire sits on
  carrier_duty_percent: 50%

climate:
  - platform: coolix       # <-- your brand goes here
    name: "Air conditioner"`,
                },
                note: 'On a **Wemos D1 mini (ESP8266)** the pins are named differently: use `pin: D2` and pick *ESP8266 → d1_mini* when creating the device. Everything else is the same.',
            },
            {
                t: 'Install over USB, then adopt it',
                p: [
                    '**INSTALL → Plug into this computer**, pick the port, wait out the first long build. Then `Settings → Devices & services → ESPHome → Configure` in Home Assistant.',
                ],
                note: 'Some ESP32 clones need you to hold the **BOOT** button while the flash starts. If the installer says it cannot connect, try that, and try a different USB cable before anything else.',
            },
            {
                t: 'Aim, power, test',
                p: [
                    'Point the little clear-blue LED straight at the AC’s receiver window, from no more than a couple of metres to start with. Set the thermostat card to cool, 22 °C.',
                    'Nothing? Bring it to 20 cm from the unit and try again. If it works at 20 cm but not at 2 m, your LED is simply too weak — see [Where to put the box](#ch-place) for the fix.',
                ],
            },
            {
                t: 'Give it a home',
                p: [
                    'Once it works, tape the module to the front edge of a shelf, hide the board behind a book, and plug the whole thing into the USB charger. An empty tin, a small plastic box or a printed case all beat a naked board on a windowsill.',
                ],
            },
        ],
    },

    /* -------------------------------------------------------------- hijack */
    {
        id: 'hijack',
        glyph: '👻',
        name: 'The Captured Familiar',
        sub: 'Buy a €6 Tuya Wi-Fi blaster, throw away its firmware',
        low: 7, high: 12,
        level: 'Advanced',
        time: 'An evening, or three',
        tags: [
            { t: 'Looks finished', c: 'good' },
            { t: 'Strongest blaster', c: 'good' },
            { t: 'Chip lottery', c: 'warn' },
            { t: 'Can be bricked', c: 'warn' },
        ],
        needs: ['tuyair'],
        extras: ['psu'],
        inv: [
            { any: ['tuyapuck'], part: 'tuyair', label: 'A Tuya / Moes Wi-Fi infrared blaster' },
            { any: ['computer'], part: null, label: 'A computer — ideally one that can run Linux' },
            { any: ['haserver'], part: null, label: 'Home Assistant running somewhere' },
            { any: ['serial', 'solder'], part: 'serial', label: 'A USB-to-serial adapter, in case the wireless route fails', soft: true },
        ],
        ends: 'The same **thermostat card** as the DIY paths, but inside a proper moulded puck with a 360° blaster that reaches the whole room — and no cloud account, because you deleted the manufacturer’s firmware.',
        pros: [
            'A finished product with a real enclosure and a strong multi-LED blaster, cheaper than the loose parts.',
            'After re-flashing it is pure ESPHome: same YAML, same Home Assistant experience.',
            'No soldering *if* the over-the-air exploit works on your unit.',
        ],
        cons: [
            'The chip inside is a lottery and changes between batches: ESP8285, BK7231N, BK7231T, or something new.',
            'The over-the-air route relies on old firmware bugs. New stock is often already patched, and then you need a serial adapter and steady hands.',
            'A failed flash can leave you with a €6 paperweight. There is no warranty for this.',
            'Not a first project. Do the Pocket Wand first, then come back for sport.',
        ],
        steps: [
            {
                t: 'Understand the bargain before you buy',
                p: [
                    'These pucks are sold below parts cost because the seller expects to own your data. Re-flashing removes the cloud entirely — but whether you *can* re-flash depends on which chip the factory used that month.',
                    'Search the listing text and photos for **ESP8285**, **BK7231N** or **CB3S** / **WB3S** module codes. Sellers rarely say. Buying two from different sellers costs €12 and doubles your odds.',
                ],
            },
            {
                t: 'Try the wire-free route first',
                p: [
                    'The [tuya-cloudcutter](https://github.com/tuya-cloudcutter/tuya-cloudcutter) project can talk a vulnerable device into accepting new firmware **over the air**, with no soldering and no case-opening. You run it from a Linux machine — a Raspberry Pi works — with a Wi-Fi adapter it can take over.',
                    'It walks you through pairing the device in “fast blink” mode, identifies the firmware, and offers a replacement. If it reports that your device is patched, stop here and read the next step.',
                ],
                note: 'Do this **before** you ever add the device to the Tuya app. Once it has updated itself over the internet, the door usually closes.',
            },
            {
                t: 'If that fails: the serial route',
                p: [
                    'The case clips open without screws. Inside, the module has flat pads or holes labelled `TX`, `RX`, `GND`, `3V3` and (on Beken chips) `CEN`. A USB-to-serial adapter set to **3.3 V** connects to them.',
                    'Solder-free trick: push a row of male header pins into the holes at a slight angle and hold them with a clothes peg or a bit of tape while flashing. Ugly, effective, and unlike soldering it is reversible.',
                    'Use [ltchiptool](https://github.com/libretiny-eu/ltchiptool) for Beken chips, or the standard ESPHome web installer for ESP8285 ones.',
                ],
                note: '**TX goes to RX and RX goes to TX.** Never connect the adapter’s 5 V line to anything on the board. Never leave the puck plugged into mains while a serial adapter is attached.',
            },
            {
                t: 'Write the ESPHome config',
                p: [
                    'Beken devices use the `bk72xx:` platform (via LibreTiny) instead of `esp32:`. The GPIO the blaster sits on is different on every model — look yours up in the [LibreTiny device database](https://docs.libretiny.eu/boards/) or the community config collections, then confirm by testing.',
                ],
                code: {
                    label: 'ESPHome · captured-blaster.yaml (Beken example)',
                    text: `bk72xx:
  board: cb3s             # match the module printed on the board

logger:

remote_transmitter:
  pin: P8                 # <-- varies by model; verify yours
  carrier_duty_percent: 50%

climate:
  - platform: coolix      # <-- your brand goes here
    name: "Air conditioner"`,
                },
            },
            {
                t: 'From here it is the ordinary path',
                p: [
                    'Adopt it in Home Assistant, pick the right brand platform, place it in the room. The remaining chapters — [brands](#ch-brands), [placement](#ch-place), [automations](#ch-automate) — apply unchanged.',
                ],
            },
        ],
    },

    /* -------------------------------------------------------------- ready */
    {
        id: 'ready',
        glyph: '🏁',
        name: 'The Ready-Made',
        sub: 'A blaster that already runs ESPHome when it arrives',
        low: 15, high: 22,
        level: 'Easiest local',
        time: 'Fifteen minutes',
        tags: [
            { t: 'Nothing to build', c: 'good' },
            { t: 'Nothing to flash', c: 'good' },
            { t: '100% local', c: 'good' },
            { t: 'Needs Home Assistant', c: '' },
        ],
        needs: ['athom'],
        extras: ['th', 'plug'],
        inv: [
            { any: ['readymade'], part: 'athom', label: 'A blaster with ESPHome or Tasmota pre-installed' },
            { any: ['haserver'], part: null, label: 'Home Assistant running somewhere' },
        ],
        ends: 'The **same thermostat card, the same firmware and the same total independence** as the DIY paths — but delivered in a finished case, with the firmware already on it. This is the answer for “I want the ESPHome result without the ESPHome evening”.',
        pros: [
            'Genuinely no build and no flashing: plug it in, join Wi-Fi, Home Assistant finds it.',
            'It is still ESPHome, so you keep full local control, over-the-air updates and the exact same YAML as the DIY paths.',
            'Proper mains-powered enclosure and a multi-LED blaster that covers a whole room.',
            'You can still take the config over and change anything later — nothing is locked.',
        ],
        cons: [
            'Two to three times the price of the bare-parts routes.',
            'You must check the listing actually says **ESPHome (or Tasmota) pre-installed** — most look identical to the cloud-only pucks.',
            'The stock config gives you buttons; you still add the one `climate:` block for your AC brand.',
        ],
        steps: [
            {
                t: 'Buy the right one',
                p: [
                    'Search for a blaster sold as **ESPHome pre-installed** — Athom is the best-known maker, and a few others do the same. Read the product page, not just the title: the cloud-only Tuya pucks look identical and are half the price for a reason.',
                    'Anything advertised as *Tasmota pre-installed* is equally fine — it lands in Home Assistant over MQTT instead, and you can re-flash it to ESPHome from its own web page later.',
                ],
                note: 'If you want the finished look but do not mind an evening of work, the [Captured Familiar](#p-hijack) path gets you to almost the same place for about €7. This path is that path with the hard part already done.',
            },
            {
                t: 'Power it and join your Wi-Fi',
                p: [
                    'Plug it into a USB charger in the room with the AC. On first boot it puts out its own Wi-Fi network (usually named after the device) or offers **Improv** setup over Bluetooth.',
                    'Join that network with a phone or laptop, and a captive portal appears asking for your real Wi-Fi name and password. 2.4 GHz only, as always.',
                ],
            },
            {
                t: 'Let Home Assistant discover it',
                p: [
                    'Within a minute, `Settings → Devices & services` shows a new **ESPHome** device. Click **Configure**. If it asks for an encryption key, the maker prints it on the box or in the listing.',
                    'You now have its stock entities — usually a raw “send this code” button and a status LED.',
                ],
            },
            {
                t: 'Take over the configuration',
                p: [
                    'Open the **ESPHome Builder** add-on. The device appears in the list with an **ADOPT** button — click it and ESPHome imports the maker’s configuration into your own dashboard. From that moment it is yours: your Wi-Fi secrets, your updates, your YAML.',
                ],
                note: 'This step is optional. If you never adopt it, the device keeps working exactly as shipped — you simply cannot change what it does.',
            },
            {
                t: 'Add the one block that matters',
                p: [
                    'Edit the adopted config and append the `climate:` block, using the transmitter the maker already defined. The GPIO is already correct because the maker set it up; you only choose your brand from [the brand table](#ch-brands).',
                ],
                code: {
                    label: 'ESPHome · adopted device (append)',
                    text: `climate:
  - platform: coolix          # <-- your brand goes here
    name: "Air conditioner"
    # transmitter_id is only needed if the config defines several;
    # with one remote_transmitter, ESPHome picks it automatically.`,
                },
            },
            {
                t: 'Place it and test',
                p: [
                    'These pucks blast in every direction, so placement is forgiving — but line of sight still wins. Set the thermostat card to cool, 22 °C, and check [where to put the box](#ch-place) if nothing happens.',
                ],
            },
        ],
    },

    /* --------------------------------------------------------------- djinn */
    {
        id: 'djinn',
        glyph: '🧞',
        name: 'The Tamed Djinn',
        sub: 'Broadlink RM4 Mini · no code, no flashing, ten minutes',
        low: 15, high: 22,
        level: 'Easiest',
        time: 'Ten minutes',
        tags: [
            { t: 'Zero soldering', c: 'good' },
            { t: 'Zero firmware', c: 'good' },
            { t: 'Local after setup', c: 'good' },
            { t: 'Phone app once', c: 'warn' },
        ],
        needs: ['broadlink'],
        extras: ['plug'],
        inv: [
            { any: ['broadlink'], part: 'broadlink', label: 'A Broadlink RM4 Mini' },
            { any: ['phone'], part: null, label: 'A phone, for the one-time Wi-Fi setup' },
            { any: ['haserver'], part: null, label: 'Home Assistant running somewhere' },
        ],
        ends: 'Either a **handful of buttons** (“AC on, cool, 22”, “AC off”) in ten minutes, or — with one extra add-on — the full **thermostat card**. Both without writing a line of firmware.',
        pros: [
            'Genuinely the fastest route. Unbox, join Wi-Fi, add integration, done.',
            'Home Assistant has supported Broadlink natively for years; nothing custom to maintain.',
            'Strong blaster, tidy little box, and it will happily run your TV and fan too.',
            'After setup it talks locally on your LAN — you can even block it from the internet.',
        ],
        cons: [
            'Twice to three times the price of the DIY routes.',
            'Initial Wi-Fi setup goes through the vendor’s phone app and cloud account. Once.',
            'Out of the box you get “buttons”, not a thermostat. The thermostat needs SmartIR, a community add-on installed via HACS.',
        ],
        steps: [
            {
                t: 'Join it to your Wi-Fi',
                p: [
                    'Install the **Broadlink** app on a phone, create the account it insists on, and follow its pairing flow. Your phone must be on the **2.4 GHz** band — these devices cannot see 5 GHz networks.',
                    'While you are in the router, give it a fixed IP address (a DHCP reservation). Home Assistant will find it by IP and you will thank yourself later.',
                ],
                note: 'Once Home Assistant has it, you can block the device from the internet in your router and it keeps working. That is the whole point of choosing this one over a cloud-only puck.',
            },
            {
                t: 'Add it to Home Assistant',
                p: [
                    '`Settings → Devices & services → + Add integration → Broadlink`. It usually discovers itself; if not, type the IP address you reserved.',
                    'You now have a `remote.` entity. That is the raw “blink whatever I tell you” interface.',
                ],
            },
            {
                t: 'Teach it your remote',
                p: [
                    'Go to `Developer tools → Actions`, choose **Remote: Learn command**, target your Broadlink, and fill in a device name and a command name — for example device `aircon`, command `off`.',
                    'Run it, then hold your AC remote about 15 cm from the front of the Broadlink and press the button you are naming. Repeat for every button you care about: `off`, `cool_22`, `cool_24`, `fan_high`, and so on.',
                ],
                note: '**Air conditioner remotes are not TV remotes.** Each press sends the *entire state* — mode, temperature, fan, swing — as one long code. So “22 °C in cool mode with fan auto” is one learned command, and you need one per combination you actually want. In practice three or four is plenty.',
            },
            {
                t: 'End A — buttons in ten minutes',
                p: [
                    'Wrap each learned command in a script and you have a working setup: two buttons on a dashboard, usable in any automation. This is where most people should stop.',
                ],
                code: {
                    label: 'Home Assistant · scripts.yaml',
                    text: `ac_cool_22:
  alias: AC on — cool 22
  sequence:
    - action: remote.send_command
      target:
        entity_id: remote.broadlink_living_room
      data:
        device: aircon
        command: cool_22

ac_off:
  alias: AC off
  sequence:
    - action: remote.send_command
      target:
        entity_id: remote.broadlink_living_room
      data:
        device: aircon
        command: "off"`,
                },
            },
            {
                t: 'End B — a real thermostat card',
                p: [
                    'Install **HACS** (the community store), then add the **SmartIR** integration through it. SmartIR ships ready-made code files for hundreds of AC models and turns them into a proper `climate` entity with a temperature dial.',
                    'You pick your device code from its list, point it at your Broadlink, restart, and the thermostat card appears. If your exact model is missing you can build a file from the codes you learned above.',
                ],
                note: 'SmartIR is a third-party integration. It is popular and well maintained, but it is not part of Home Assistant core — it can break on a major upgrade in a way the ESPHome paths cannot.',
            },
        ],
    },

    /* ------------------------------------------------------------- whisper */
    {
        id: 'whisper',
        glyph: '📻',
        name: 'The Zigbee Whisperer',
        sub: 'UFO-R11 blaster + Zigbee2MQTT · no Wi-Fi password given away',
        low: 11, high: 16,
        level: 'Intermediate',
        time: 'An hour',
        tags: [
            { t: 'No soldering', c: 'good' },
            { t: 'No cloud, ever', c: 'good' },
            { t: 'Needs a Zigbee hub', c: 'warn' },
        ],
        needs: ['zbir'],
        extras: ['zbdongle', 'psu'],
        inv: [
            { any: ['zigbeeir'], part: 'zbir', label: 'A Zigbee infrared blaster (UFO-R11 or similar)' },
            { any: ['zbcoord'], part: 'zbdongle', label: 'A Zigbee coordinator with Zigbee2MQTT or ZHA' },
            { any: ['psu'], part: 'psu', label: 'A USB charger' },
            { any: ['haserver'], part: null, label: 'Home Assistant running somewhere' },
        ],
        ends: 'Learned IR codes delivered over your **Zigbee mesh** instead of Wi-Fi — and with SmartIR on top, the same thermostat card as everyone else. The device never learns your Wi-Fi password and never phones home.',
        pros: [
            'Nothing to flash and nothing to solder: pair it and it works.',
            'No Wi-Fi credentials handed to an unknown chip, and no cloud account at all.',
            'Zigbee mesh range: it works fine in a far bedroom where Wi-Fi is thin.',
            'Sips power, and the mesh gets stronger with every mains-powered node you add.',
        ],
        cons: [
            'Pointless unless you already run Zigbee2MQTT or ZHA — otherwise add ~€20 for a coordinator.',
            'Learning codes is a fiddlier, more manual process than with ESPHome.',
            'The thermostat card again means SmartIR, a third-party integration.',
        ],
        steps: [
            {
                t: 'Check you have somewhere to pair it',
                p: [
                    'This path assumes a working Zigbee network: a coordinator dongle plugged into your Home Assistant machine, running **Zigbee2MQTT** (recommended here) or ZHA. If you have neither, either add a coordinator to the shopping list or take the Pocket Wand path instead.',
                ],
            },
            {
                t: 'Pair the blaster',
                p: [
                    'Plug the puck into a USB charger near the AC. In Zigbee2MQTT, click **Permit join**. Hold the button on the puck for about 5 seconds until the light blinks quickly.',
                    'It should appear within a few seconds, usually identified as `UFO-R11` or `ZS06`. Rename it to something you will recognise.',
                ],
            },
            {
                t: 'Learn each button',
                p: [
                    'Open the device in Zigbee2MQTT and find the **Exposes** tab. Set `learn_ir_code` to on, then press a button on your AC remote at the puck. A long base64 string appears in `learned_ir_code`.',
                    'Copy that string somewhere safe and label it. Repeat for every state you want — remember that an AC remote sends its **whole state** in one code, so “cool 22 fan auto” is a single code.',
                ],
            },
            {
                t: 'End A — send codes straight from an automation',
                p: [
                    'You can now fire any learned code by publishing it to the device. Crude, but it works and needs nothing extra installed.',
                ],
                code: {
                    label: 'Home Assistant · script using MQTT',
                    text: `ac_cool_22:
  alias: AC on — cool 22
  sequence:
    - action: mqtt.publish
      data:
        topic: zigbee2mqtt/ir_blaster_bedroom/set
        payload: >-
          {"ir_code_to_send": "PASTE_THE_LONG_BASE64_STRING_HERE"}`,
                },
            },
            {
                t: 'End B — the thermostat card',
                p: [
                    'Install **HACS**, then **SmartIR**, and choose its Zigbee2MQTT controller. Point it at your blaster’s topic and pick (or build) the code file for your AC model. You end up with the same `climate.` entity as every other path here.',
                ],
            },
        ],
    },
];


/* ── The drawer: what the reader already owns ────────────────────────────── */
/* `w` is what owning this nudges the path scores by.                        */
const INVENTORY = [
    {
        group: 'Boards & controllers',
        items: [
            { id: 'esp32', label: 'ESP32 dev board', w: { bench: 8 } },
            { id: 'esp8266', label: 'ESP8266 / Wemos D1 mini', w: { bench: 6 } },
            { id: 'm5', label: 'M5Stack Atom or StickC', w: { wand: 9 } },
            { id: 'pi', label: 'A spare Raspberry Pi', w: {} },
        ],
    },
    {
        group: 'Infrared bits',
        items: [
            { id: 'irled', label: 'IR transmitter LED or module', w: { bench: 3 } },
            { id: 'irrx', label: 'IR receiver module', w: { bench: 1 } },
        ],
    },
    {
        group: 'Finished blasters',
        items: [
            { id: 'readymade', label: 'ESPHome / Tasmota blaster', w: { ready: 10 } },
            { id: 'broadlink', label: 'Broadlink RM4 / RM Mini', w: { djinn: 10 } },
            { id: 'tuyapuck', label: 'Tuya / Moes Wi-Fi blaster', w: { hijack: 9 } },
            { id: 'zigbeeir', label: 'Zigbee IR blaster (UFO-R11)', w: { whisper: 9 } },
        ],
    },
    {
        group: 'Odds and ends',
        items: [
            { id: 'wires', label: 'Dupont jumper wires', w: { bench: 2 } },
            { id: 'psu', label: 'Spare USB charger + cable', w: { bench: 1, wand: 1 } },
            { id: 'th', label: 'Temperature sensor module', w: {} },
            { id: 'plug', label: 'Metering smart plug', w: {} },
        ],
    },
    {
        group: 'Already running here',
        items: [
            { id: 'haserver', label: 'Home Assistant', w: { wand: 3, bench: 3, ready: 3, whisper: 2, hijack: 2, djinn: 1 } },
            { id: 'zbcoord', label: 'Zigbee2MQTT or ZHA', w: { whisper: 4 } },
            { id: 'mqtt', label: 'An MQTT broker', w: {} },
            { id: 'hacs', label: 'HACS', w: { djinn: 1, whisper: 1 } },
        ],
    },
    {
        group: 'Tools on the bench',
        items: [
            { id: 'computer', label: 'A computer with Chrome or Edge', w: {} },
            { id: 'phone', label: 'A smartphone', w: {} },
            { id: 'serial', label: 'USB-to-serial adapter', w: { hijack: 2 } },
            { id: 'solder', label: 'A soldering iron (and the nerve)', w: { hijack: 2 } },
        ],
    },
];


/* ── Fully built, buy-and-forget devices ─────────────────────────────────── */
const READYMADE = [
    {
        name: 'Athom IR remote controller',
        low: 15, high: 22,
        local: 'Fully local',
        card: 'Yes, via ESPHome',
        q: 'athom esphome ir remote controller',
        note: 'Ships with **ESPHome already on it**. Home Assistant discovers it, you adopt it, you add one `climate:` block. Everything the DIY paths give you, with the soldering-free part taken to its logical end. This is [The Ready-Made](#p-ready) path.',
        best: true,
    },
    {
        name: 'Broadlink RM4 Mini / RM4 Pro',
        low: 13, high: 25,
        local: 'Local after setup',
        card: 'With SmartIR',
        q: 'broadlink rm4 mini',
        note: 'Native Home Assistant integration, years of track record, strong blaster. One-time cloud account during Wi-Fi setup; block it from the internet afterwards and it keeps working. The Pro model adds 433 MHz radio. This is [The Tamed Djinn](#p-djinn) path.',
    },
    {
        name: 'Moes / Tuya UFO-R11 (Zigbee)',
        low: 9, high: 14,
        local: 'Fully local',
        card: 'With SmartIR',
        q: 'ufo-r11 zigbee ir remote control',
        note: 'The cheapest genuinely local finished device — but only if you already run Zigbee. No cloud, no Wi-Fi password given away. This is [The Zigbee Whisperer](#p-whisper) path.',
    },
    {
        name: 'Tuya / Moes Wi-Fi IR blaster (stock firmware)',
        low: 5, high: 9,
        local: 'Cloud only',
        card: 'Awkward',
        q: 'tuya wifi ir remote control blaster',
        note: 'Cheapest of all, and the one to avoid unless you intend to re-flash it. Out of the box it needs the vendor cloud, and Home Assistant reaches it only through the Tuya integration or LocalTuya. Buy it for [the hijack](#p-hijack), not for itself.',
        warn: true,
    },
    {
        name: 'SwitchBot Hub 2 / Hub Mini',
        low: 25, high: 70,
        local: 'Mostly cloud',
        card: 'Partly',
        q: 'switchbot hub 2',
        note: 'Well made, easy app, and the Hub 2 also reports temperature and humidity. Home Assistant support goes through the SwitchBot cloud API or Matter, and air-conditioner control is coarser than the ESPHome routes. Convenient rather than powerful.',
    },
    {
        name: 'Xiaomi / Mi Smart Remote (Miot)',
        low: 15, high: 25,
        local: 'Local with a custom integration',
        card: 'With SmartIR',
        q: 'xiaomi mi smart remote ir',
        note: 'Cheap and widely available. Needs a token extracted from the Xiaomi app and a community integration; once done it behaves nicely. Fiddlier to set up than a Broadlink, cheaper than a Sensibo.',
    },
    {
        name: 'Sensibo Air / Sensibo Sky',
        low: 80, high: 150,
        local: 'Cloud',
        card: 'Yes, official integration',
        q: 'sensibo air conditioner controller',
        note: 'A proper consumer product: screen, sensors, geofencing, an official Home Assistant integration and a polished app. It also depends entirely on the maker’s servers, and some features sit behind a subscription. If your time is worth more than €100, this is a rational purchase.',
    },
    {
        name: 'Tado Smart AC Control V3+',
        low: 100, high: 130,
        local: 'Cloud',
        card: 'Yes, official integration',
        q: 'tado smart ac control v3',
        note: 'Same trade as Sensibo, with better European support and an even stronger push towards a subscription. Excellent scheduling and open-window detection out of the box.',
    },
    {
        name: 'Nature Remo mini',
        low: 40, high: 60,
        local: 'Cloud',
        card: 'Via a community integration',
        q: 'nature remo mini',
        note: 'Popular in Japan, decent hardware, cloud API. Worth knowing about if the others are unavailable where you live.',
    },
];


/* ── Software & tools ────────────────────────────────────────────────────── */
const SOFTWARE = [
    {
        name: 'Home Assistant',
        what: 'The local smart-home hub that ends up holding the thermostat card, the automations and the dashboard. Free, open source, runs on a Pi, a NAS, an old laptop or a virtual machine.',
        url: 'https://www.home-assistant.io/installation/',
        link: 'Installation guide',
        who: 'Every path',
        key: true,
    },
    {
        name: 'ESPHome Builder (add-on)',
        what: 'The friendly way to use ESPHome: an add-on inside Home Assistant that edits your YAML, compiles it and installs it over USB or Wi-Fi. No command line, no compiler to install.',
        url: 'https://esphome.io/guides/getting_started_hassio/',
        link: 'Getting started',
        who: 'Pocket Wand · Three-Wire Bench · Ready-Made · Captured Familiar',
        key: true,
    },
    {
        name: 'ESPHome Web',
        what: 'ESPHome’s browser-only flasher. Nothing to install at all: open the page in Chrome or Edge, plug the board in, click. Perfect for a first “does this board even work” test before Home Assistant exists.',
        url: 'https://web.esphome.io/',
        link: 'Open the web flasher',
        who: 'Anyone without Home Assistant yet',
    },
    {
        name: 'ESPHome command line',
        what: 'The same tool as a Python package: `pip install esphome`, then `esphome run ac-wand.yaml`. The route to take if you run Home Assistant in Docker and have no add-on store.',
        url: 'https://esphome.io/guides/installing_esphome/',
        link: 'Install ESPHome',
        who: 'Docker and Core installs',
    },
    {
        name: 'Arduino IDE',
        what: 'The classic beginner’s programming environment for these chips. You do not need it for any path in this guide — but if you would rather write real code than YAML, this plus the IRremoteESP8266 library is the traditional way to build an IR blaster, and it is genuinely good for learning what the hardware is doing.',
        url: 'https://www.arduino.cc/en/software/',
        link: 'Download the Arduino IDE',
        who: 'The code-it-yourself route',
    },
    {
        name: 'IRremoteESP8266 library',
        what: 'The library that does the actual work in the Arduino route: it knows the protocols for well over a hundred air conditioners and gives each one a tidy class with `setTemp()`, `setMode()` and `send()`. Its `IRrecvDumpV2` example is also the best code-based way to identify an unknown remote.',
        url: 'https://github.com/crankyoldgit/IRremoteESP8266',
        link: 'Library & examples',
        who: 'The Arduino route',
    },
    {
        name: 'PlatformIO for VS Code',
        what: 'A grown-up alternative to the Arduino IDE, living inside VS Code: proper autocomplete, library management and per-project settings. Same code, better editor.',
        url: 'https://platformio.org/install/ide?install=vscode',
        link: 'Install PlatformIO',
        who: 'The Arduino route, upgraded',
    },
    {
        name: 'Tasmota + Tasmota Web Installer',
        what: 'A ready-made firmware you flash from a web page — no compiling at all. Its `IRHVAC` command speaks a long list of air conditioners, and it announces itself to Home Assistant over MQTT. A strong alternative if ESPHome’s compile step annoys you.',
        url: 'https://tasmota.github.io/install/',
        link: 'Flash Tasmota in a browser',
        who: 'An alternative to ESPHome',
    },
    {
        name: 'esptool / esptool-js',
        what: 'The low-level flashing tool from the chip maker, and its browser version. The safety net when a board refuses everything else: erase the flash completely and start again.',
        url: 'https://espressif.github.io/esptool-js/',
        link: 'esptool in the browser',
        who: 'Rescue operations',
    },
    {
        name: 'tuya-cloudcutter',
        what: 'Talks a vulnerable Tuya device into accepting new firmware over the air, with no soldering and no opening the case.',
        url: 'https://github.com/tuya-cloudcutter/tuya-cloudcutter',
        link: 'Project & device list',
        who: 'Captured Familiar',
    },
    {
        name: 'ltchiptool / LibreTiny',
        what: 'Flashing and firmware support for the Beken chips found in most modern Tuya devices — the reason ESPHome can run on hardware it was never designed for.',
        url: 'https://docs.libretiny.eu/',
        link: 'LibreTiny docs',
        who: 'Captured Familiar',
    },
    {
        name: 'HACS',
        what: 'The community add-on store for Home Assistant. You need it to install SmartIR and most other community integrations.',
        url: 'https://hacs.xyz/',
        link: 'Install HACS',
        who: 'Tamed Djinn · Zigbee Whisperer',
    },
    {
        name: 'SmartIR',
        what: 'Turns a “blast this code” device into a proper thermostat entity, using ready-made code files for hundreds of AC models. The missing piece for every non-ESPHome path.',
        url: 'https://github.com/smartHomeHub/SmartIR',
        link: 'SmartIR & device codes',
        who: 'Tamed Djinn · Zigbee Whisperer',
    },
    {
        name: 'Zigbee2MQTT',
        what: 'The bridge between a Zigbee coordinator dongle and Home Assistant. Excellent device support, a good web interface, and the place where you will teach the Zigbee blaster its codes.',
        url: 'https://www.zigbee2mqtt.io/',
        link: 'Zigbee2MQTT docs',
        who: 'Zigbee Whisperer',
    },
    {
        name: 'USB serial drivers (CH340 / CP210x)',
        what: 'Windows sometimes needs a driver before it can see a cheap dev board. If the board never appears as a COM port, install the driver matching the little chip next to the USB socket.',
        url: 'https://www.silabs.com/developer-tools/usb-to-uart-bridge-vcp-drivers',
        link: 'CP210x drivers (Silicon Labs)',
        who: 'Windows, occasionally',
    },
];


/* ── Alternative ways to get firmware onto a chip ────────────────────────── */
const FLASH_ROUTES = [
    {
        id: 'fr-builder',
        t: '① ESPHome Builder — the recommended route',
        blocks: [
            { p: '**Best for:** everyone following this guide. **You need:** Home Assistant, a USB cable, Chrome or Edge.' },
            { p: 'An add-on inside Home Assistant that holds your configuration files, compiles them and installs them. First install goes over USB; every update afterwards goes over Wi-Fi, from your armchair. It also keeps a log window that tells you exactly what the device is doing.' },
            { ul: [
                'No compiler, no command line, no accounts.',
                'Your Wi-Fi password lives in one `secrets.yaml` and is never typed again.',
                'The device is adopted into Home Assistant automatically.',
                'Downside: the first build is slow, and it wants a reasonably capable machine.',
            ] },
        ],
    },
    {
        id: 'fr-web',
        t: '② ESPHome Web — nothing installed at all',
        blocks: [
            { p: '**Best for:** trying a board before you own a server. **You need:** Chrome or Edge and a USB cable.' },
            { p: 'Open [web.esphome.io](https://web.esphome.io/), click **Connect**, pick the port, and prepare a fresh board in about a minute. It can install a minimal ESPHome firmware, join it to Wi-Fi and hand it over to a full ESPHome installation later.' },
            { p: 'It is also the fastest way to prove a suspicious board or cable works, before you blame your YAML.' },
        ],
    },
    {
        id: 'fr-cli',
        t: '③ ESPHome on the command line',
        blocks: [
            { p: '**Best for:** Docker and Home Assistant Core installs, or anyone happier in a terminal. **You need:** Python.' },
            { code: { label: 'terminal', text: `pip install esphome
esphome wizard ac-wand.yaml     # asks the same questions as the add-on
esphome run ac-wand.yaml        # compile, upload, then tail the logs` } },
            { p: 'Identical configuration files to the add-on — you can move a YAML file between the two freely.' },
        ],
    },
    {
        id: 'fr-arduino',
        t: '④ Arduino IDE — write the code yourself',
        blocks: [
            { p: '**Best for:** people who would rather write C++ than YAML, or who want to understand what is actually happening. **You need:** the [Arduino IDE](https://www.arduino.cc/en/software/) and the IRremoteESP8266 library.' },
            { ol: [
                'Install the [Arduino IDE](https://www.arduino.cc/en/software/).',
                'In `File → Preferences → Additional boards manager URLs`, add the ESP32 (or ESP8266) board package URL from the [Espressif instructions](https://docs.espressif.com/projects/arduino-esp32/en/latest/installing.html), then install it under `Tools → Board → Boards Manager`.',
                'In `Tools → Manage Libraries`, search for **IRremoteESP8266** and install it.',
                'Pick your board and port, paste the sketch below, and press Upload.',
            ] },
            { code: { label: 'Arduino · send a Coolix command', text: `#include <Arduino.h>
#include <IRremoteESP8266.h>
#include <IRsend.h>
#include <ir_Coolix.h>

const uint16_t kIrLed = 14;   // the GPIO your IR LED sits on
IRCoolixAC ac(kIrLed);        // swap the class for your brand

void setup() {
  Serial.begin(115200);
  ac.begin();

  ac.on();
  ac.setMode(kCoolixCool);
  ac.setTemp(22);
  ac.setFan(kCoolixFanAuto);
  ac.send();                  // <- the whole state goes out at once

  Serial.println("Sent: cool, 22C, fan auto");
}

void loop() {}` } },
            { p: 'To identify an unknown remote, open `File → Examples → IRremoteESP8266 → IRrecvDumpV2`, wire a receiver to the pin named in the sketch, and press buttons while watching the Serial Monitor. It prints the protocol name and the raw timings.' },
            { note: '**The honest trade:** this gives you total control and teaches you the most, but nothing appears in Home Assistant by itself. You would add Wi-Fi and MQTT code yourself — which is precisely the work ESPHome exists to avoid. Most people are happiest writing the sketch once for fun, then switching to ESPHome for the thing that lives on the wall.' },
        ],
    },
    {
        id: 'fr-pio',
        t: '⑤ PlatformIO in VS Code',
        blocks: [
            { p: '**Best for:** the Arduino route with a better editor. **You need:** VS Code and the [PlatformIO extension](https://platformio.org/install/ide?install=vscode).' },
            { p: 'Same C++ code as above, but with autocomplete, per-project library pinning and a sane build system. A `platformio.ini` like this is all the configuration it needs:' },
            { code: { label: 'platformio.ini', text: `[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
monitor_speed = 115200
lib_deps = crankyoldgit/IRremoteESP8266` } },
        ],
    },
    {
        id: 'fr-tasmota',
        t: '⑥ Tasmota — a ready-made firmware, no compiling',
        blocks: [
            { p: '**Best for:** people who want a finished firmware flashed from a web page. **You need:** Chrome or Edge, and MQTT in Home Assistant.' },
            { ol: [
                'Open the [Tasmota Web Installer](https://tasmota.github.io/install/) and choose the **IR** variant (`tasmota-ir`), which includes the air-conditioner protocols.',
                'Connect the board over USB and install. Configure Wi-Fi through the captive portal it creates.',
                'Point it at your MQTT broker; Home Assistant discovers it automatically.',
                'Control the AC with the `IRHVAC` command — see the [Tasmota IR documentation](https://tasmota.github.io/docs/Tasmota-IR/).',
            ] },
            { code: { label: 'Tasmota console', text: `IRHVAC {"Vendor":"Coolix","Power":"On","Mode":"Cold","FanSpeed":"Auto","Temp":22}` } },
            { note: 'Tasmota and ESPHome are both excellent and both fully local. Tasmota installs faster and needs no compiler; ESPHome integrates with Home Assistant more deeply and gives you a real thermostat entity without extra work. Either is a fine answer.' },
        ],
    },
];


/* ── Requested extras ────────────────────────────────────────────────────── */
const FEATURES = [
    {
        id: 'x-temp',
        t: '🌡️  Report the real room temperature',
        blocks: [
            { p: '*Works on: the ESPHome paths.* The single most requested addition, and the one that makes automations actually sensible — the AC’s own sensor sits inside the unit and lies to you.' },
            { p: 'Push four jumper wires from an AHT20 module: `VIN → 3V3`, `GND → GND`, `SDA → GPIO21`, `SCL → GPIO22`. On an M5 Atom, the ENV pod does the same over one Grove cable.' },
            { code: { label: 'ESPHome · append', text: `i2c:
  sda: GPIO21
  scl: GPIO22

sensor:
  - platform: aht10
    variant: AHT20
    temperature:
      name: "Room temperature"
      id: room_temp
    humidity:
      name: "Room humidity"
    update_interval: 60s` } },
            { p: 'Then add **one line** to the `climate:` block you already have, so the thermostat card shows the real room temperature instead of nothing:' },
            { code: { label: 'ESPHome · inside your existing climate block', text: `climate:
  - platform: coolix
    name: "Air conditioner"
    sensor: room_temp        # <- this line is the whole trick` } },
            { note: 'Do not paste a second `climate:` block — YAML allows each key only once at the top level. Add the `sensor:` line to the block that is already there. The [config writer](#builder) does this for you if you tick the sensor box.' },
            { note: 'Keep the sensor **out of the cold blast**, or it will read 14 °C and your automations will think the room is an igloo.' },
        ],
    },
    {
        id: 'x-state',
        t: '✅  Know whether the AC is really running',
        blocks: [
            { p: '*Works on: every path.* Infrared never hears back, so Home Assistant only ever shows what it believes. Three ways to turn that belief into a fact, cheapest first:' },
            { ol: [
                '**A metering smart plug** (~€10) between the AC and the wall. Running compressor = hundreds of watts, standby = a couple. This is the most reliable answer by far.',
                '**A temperature sensor near the air outlet.** Within a minute of real cooling it drops several degrees. Cheap, no rewiring, slightly slower to react.',
                '**An IR receiver**, on the platforms that support it — then the device also notices when someone uses the handheld remote.',
            ] },
            { code: { label: 'ESPHome · listen to the original remote too', text: `remote_receiver:
  id: rcvr
  pin:
    number: GPIO32
    inverted: true
    mode:
      input: true
      pullup: true
  tolerance: 55%

climate:
  - platform: coolix
    name: "Air conditioner"
    receiver_id: rcvr        # only on platforms marked "hears back"` } },
            { code: { label: 'Home Assistant · a truthful "AC is running" sensor', text: `template:
  - binary_sensor:
      - name: "AC actually running"
        device_class: running
        state: >-
          {{ states('sensor.ac_plug_power') | float(0) > 60 }}` } },
        ],
    },
    {
        id: 'x-presence',
        t: '🚪  Presence, windows and not cooling the garden',
        blocks: [
            { p: '*Works on: every path.* The automations people ask for most, in one place. All of them belong in `Settings → Automations → ⋮ → Edit in YAML`.' },
            { code: { label: 'Home Assistant · arrive-home pre-cool', text: `alias: Cool the flat before I get home
triggers:
  - trigger: zone
    entity_id: person.you
    zone: zone.home
    event: enter
conditions:
  - condition: numeric_state
    entity_id: sensor.room_temperature
    above: 25
actions:
  - action: climate.set_temperature
    target:
      entity_id: climate.air_conditioner
    data:
      hvac_mode: cool
      temperature: 23` } },
            { p: 'Pair it with the “everyone left” and “window opened” automations in [Automations worth having](#ch-automate), and add a `for: "00:02:00"` to the window trigger so a quick airing does not fight you.' },
        ],
    },
    {
        id: 'x-sleep',
        t: '🌙  A sleep ramp that does not freeze you at 4 a.m.',
        blocks: [
            { p: '*Works on: every path.* Real AC sleep modes are crude. This nudges the target up by one degree an hour for three hours, then stops.' },
            { code: { label: 'Home Assistant · automation', text: `alias: Sleep ramp
triggers:
  - trigger: time
    at: "23:00:00"
conditions:
  - condition: state
    entity_id: climate.air_conditioner
    state: cool
actions:
  - repeat:
      count: 3
      sequence:
        - delay: "01:00:00"
        - action: climate.set_temperature
          target:
            entity_id: climate.air_conditioner
          data:
            temperature: >-
              {{ (state_attr('climate.air_conditioner','temperature') | float(23)) + 1 }}` } },
        ],
    },
    {
        id: 'x-tv',
        t: '📺  Run the TV, the fan and everything else from the same box',
        blocks: [
            { p: '*Works on: the ESPHome paths.* The transmitter does not care what it is talking to. Add a button per command and one blaster runs the whole room.' },
            { code: { label: 'ESPHome · append', text: `button:
  - platform: template
    name: "TV power"
    on_press:
      - remote_transmitter.transmit_nec:
          address: 0x1234
          command: 0x78AB

  - platform: template
    name: "Fan speed up"
    on_press:
      - remote_transmitter.transmit_raw:
          carrier_frequency: 38kHz
          code: [1258, -422, 1258, -422]   # from your own capture` } },
            { p: 'Use [capturing your own remote](#ch-learn) to get the numbers. For televisions the decoded protocols (`nec`, `sony`, `samsung`, `rc5`) are usually printed straight into the log, which is tidier than raw timings.' },
        ],
    },
    {
        id: 'x-voice',
        t: '🗣️  Alexa, Google and Siri',
        blocks: [
            { p: '*Works on: every path, once the entity exists in Home Assistant.*' },
            { ul: [
                '**Apple Home / Siri:** free and local — add the built-in **HomeKit Bridge** integration and expose the climate entity. Nothing leaves your network.',
                '**Alexa & Google:** the easy route is Home Assistant Cloud (Nabu Casa), which is a paid subscription that also funds the project. The free routes exist (a custom Alexa skill, or a Google Actions project) and are a genuine afternoon of work.',
                '**Matter:** Home Assistant can expose entities over Matter to anything that speaks it, which is increasingly everything.',
            ] },
            { p: 'Whatever you choose, give the entity a name you can say out loud. “Air conditioner” beats “climate.esphome_web_a1b2c3”.' },
        ],
    },
    {
        id: 'x-offline',
        t: '🛟  Make it survive Home Assistant being down',
        blocks: [
            { p: '*Works on: the ESPHome paths.* A device that only works when the server is up is a device that will annoy you eventually.' },
            { code: { label: 'ESPHome · append', text: `# Its own little control page at http://<device-ip>/
web_server:
  port: 80

# Don't reboot in a loop just because the server is rebooting
api:
  reboot_timeout: 0s

# A physical button that always works, server or no server
binary_sensor:
  - platform: gpio
    pin:
      number: GPIO39
      inverted: true
    name: "Panic off"
    on_press:
      - climate.control:
          id: ac
          mode: "OFF"` } },
            { note: 'And the real failsafe, which costs nothing: **keep the original remote, with batteries in it**, somewhere you can find it in the dark.' },
            { note: 'The button block refers to `id: ac`, so your `climate:` block needs `id: ac` on it too. The [config writer](#builder) adds both for you.' },
        ],
    },
    {
        id: 'x-many',
        t: '🏘️  More than one air conditioner',
        blocks: [
            { p: '*Works on: every path.* One box per room — infrared cannot go through walls, so there is no clever shortcut here.' },
            { ul: [
                'Give each device a room name from the start: `ac-bedroom`, `ac-living`. Renaming later is possible but tedious.',
                'ESPHome [packages](https://esphome.io/components/packages.html) let you keep one shared config and a three-line file per room.',
                'In Home Assistant, put them in **Areas** and you get “turn off all the air conditioning” for free.',
                'If two units in the same room respond to the same codes, they will both obey. That is usually a feature, occasionally a surprise.',
            ] },
        ],
    },
    {
        id: 'x-notify',
        t: '🔔  Nag me when I have left it on',
        blocks: [
            { p: '*Works on: every path.* Requires the Home Assistant Companion app on your phone.' },
            { code: { label: 'Home Assistant · automation', text: `alias: AC has been on for three hours
triggers:
  - trigger: state
    entity_id: climate.air_conditioner
    to: cool
    for: "03:00:00"
actions:
  - action: notify.mobile_app_your_phone
    data:
      title: "Still cooling"
      message: "The air conditioning has been on for three hours."
      data:
        actions:
          - action: "AC_OFF"
            title: "Turn it off"` } },
        ],
    },
    {
        id: 'x-cost',
        t: '💶  What is it costing me?',
        blocks: [
            { p: '*Works on: every path, with a metering plug.* Add the plug’s energy sensor to the Home Assistant **Energy dashboard** as an individual device, and you get daily and monthly cost per air conditioner.' },
            { p: 'The useful trick afterwards: an automation that refuses to start cooling when your electricity tariff is in its expensive window, unless the room is genuinely unbearable. A `condition:` comparing your price sensor is all it takes.' },
        ],
    },
    {
        id: 'x-backup',
        t: '💾  Back it up so you never rebuild it twice',
        blocks: [
            { p: '*Works on: every path.*' },
            { ul: [
                'ESPHome configs are plain text — keep the folder in a git repository, or at least copy the YAML somewhere safe.',
                'Turn on scheduled **Home Assistant backups** and send them off the machine.',
                'Write your captured raw IR codes into a text file with labels. Re-capturing them is the most annoying step to repeat.',
                'Note the encryption key for each ESPHome device; without it Home Assistant cannot re-adopt the device after a rebuild.',
            ] },
        ],
    },
];


/* ── Brand → ESPHome platform ────────────────────────────────────────────── */
const BRANDS = [
    ['Ballu', 'ballu', 'yes'],
    ['Coolix — and a great many unbranded / budget units', 'coolix', 'yes'],
    ['Daikin', 'daikin', 'yes'],
    ['Daikin (Japanese ARC remotes)', 'daikin_arc', 'yes'],
    ['Daikin (BRC ceiling cassette)', 'daikin_brc', 'yes'],
    ['De’Longhi', 'delonghi', 'yes'],
    ['Emmeti', 'emmeti', 'yes'],
    ['Fujitsu General', 'fujitsu_general', 'yes'],
    ['GREE (pick a model: generic, yan, yaa, yac, yag…)', 'gree', '—'],
    ['Hitachi', 'hitachi_ac344 / hitachi_ac424', 'yes'],
    ['LG', 'climate_ir_lg', 'yes'],
    ['Midea', 'midea_ir', 'yes'],
    ['Mitsubishi (also some Stiebel Eltron)', 'mitsubishi', 'yes'],
    ['Noblex', 'noblex', 'yes'],
    ['TCL, Electrolux, Fuego', 'tcl112', 'yes'],
    ['Toshiba (also Midea MAP14HS1TBL)', 'toshiba', 'yes'],
    ['Whirlpool', 'whirlpool', 'yes'],
    ['Whynter', 'whynter', 'yes'],
    ['Yashima', 'yashima', '—'],
    ['Eurom, Chigo, Tristar, Elgin, Sumikura… (ZH/LT-01 remote)', 'zhlt01', 'yes'],
    ['Dozens more — Panasonic, Sharp, Samsung, Hyundai, IVT…', 'heatpumpir', '—'],
];


/* ── Shared chapters ─────────────────────────────────────────────────────── */
const CHAPTERS = [
    {
        id: 'ch-ha',
        t: 'Home Assistant & ESPHome, from zero',
        blocks: [
            { p: 'Home Assistant is the free, local smart-home hub that will hold the thermostat card. ESPHome is its sibling project: you describe what a chip should do in a short settings file, and it builds and installs the firmware for you. Neither costs money and neither needs an account.' },
            { h: 'Installing Home Assistant' },
            { p: 'The painless option is **Home Assistant OS** on a Raspberry Pi 4/5 or any old mini PC: you write one image to a disk, boot it, and open `http://homeassistant.local:8123` in a browser. The [official installation guide](https://www.home-assistant.io/installation/) covers every route including Docker and virtual machines.' },
            { p: 'If you run it in Docker or a Python virtual environment instead, you will not have the add-on store. ESPHome then runs as a [separate Docker container](https://esphome.io/guides/installing_esphome/) — same tool, one extra step.' },
            { h: 'Installing ESPHome Builder' },
            { ol: [
                'In Home Assistant: `Settings → Add-ons → Add-on store`.',
                'Find **ESPHome Builder**, click **Install** (this takes a few minutes).',
                'Turn on **Start on boot** and **Show in sidebar**, then **Start**.',
                'Open it from the sidebar. The first time it will ask for your Wi-Fi name and password, which it stores in a `secrets.yaml` so you never type them again.',
            ] },
            { note: 'Wi-Fi on these chips is **2.4 GHz only**. If your router hides both bands behind one name, that usually still works, but it is the first thing to check when a board refuses to connect.' },
        ],
    },
    {
        id: 'ch-brands',
        t: 'Find your air conditioner in the list',
        blocks: [
            { p: 'ESPHome already knows how to speak to these units. Put the name from the middle column into the `platform:` line of your `climate:` block — that is the whole job.' },
            { table: true },
            { p: 'The **“hears back”** column matters: those platforms can optionally *listen* to your original remote through an IR receiver, so if someone uses the handset, Home Assistant notices. See [capturing codes](#ch-learn) for the receiver wiring.' },
            { note: 'Checked against the ESPHome documentation in **July 2026**. The list only ever grows — if your brand is missing here, look at the [live page](https://esphome.io/components/climate/climate_ir.html) before giving up.' },
            { h: 'What if my brand is not there?' },
            { ol: [
                'Try `coolix` first. It is the most widely copied protocol among budget units and costs you two minutes.',
                'Try `heatpumpir`, which wraps a third-party library covering dozens more manufacturers. It needs a few extra settings — protocol, min/max temperature, default vane positions.',
                'Still nothing? [Capture the raw codes](#ch-learn) from your own remote. It always works, because you are literally recording your own remote.',
            ] },
            { p: 'Full details and every option live in the [ESPHome IR climate documentation](https://esphome.io/components/climate/climate_ir.html).' },
        ],
    },
    {
        id: 'ch-learn',
        t: 'When your AC is not in the list: copying your own remote',
        blocks: [
            { p: 'This is the universal fallback, and it is far less scary than it sounds. You add an infrared **receiver** for a night, point your remote at it, and ESPHome prints in its log exactly what the remote said. Then you play those recordings back.' },
            { h: '1. Wire the ear (three wires, no solder)' },
            { ul: [
                '`OUT` / `S` on the receiver module → **GPIO32**',
                '`VCC` / `+` → **3V3**',
                '`GND` / `−` → **GND**',
            ] },
            { p: 'On an M5 Atom, the [Unit IR pod](#parts) does the same job through one Grove cable — check its documentation for which of the two Grove pins is receive.' },
            { h: '2. Add a listener to the config' },
            { code: { label: 'ESPHome · temporary listening config', text: `remote_receiver:
  pin:
    number: GPIO32
    inverted: true
    mode:
      input: true
      pullup: true
  dump: all
  tolerance: 55%

logger:
  level: DEBUG` } },
            { h: '3. Press buttons and read the log' },
            { p: 'Install, then open the device’s **LOGS**. Point your AC remote at the receiver and press a button. You will see either a friendly decoded line (`Received Coolix: 0xB23FE4` — congratulations, that is your protocol, go back and use it) or a long `Received Raw:` list of numbers.' },
            { p: 'Copy the whole raw list. Repeat for each state you want: off, cool at 22, cool at 25, fan high. Label them as you go, because they all look identical afterwards.' },
            { h: '4. Play them back as buttons' },
            { code: { label: 'ESPHome · replaying captured codes', text: `remote_transmitter:
  pin: GPIO14
  carrier_duty_percent: 50%

button:
  - platform: template
    name: "AC — cool 22"
    on_press:
      - remote_transmitter.transmit_raw:
          carrier_frequency: 38kHz
          code: [4088, -1542, 1019, -510, 513, -1019, 510, -509]   # your numbers here

  - platform: template
    name: "AC — off"
    on_press:
      - remote_transmitter.transmit_raw:
          carrier_frequency: 38kHz
          code: [4090, -1540, 1020, -509, 512, -1018, 511, -510]   # your numbers here` } },
            { note: 'These buttons give you the **simpler ending**: switches rather than a temperature dial. If you want a real thermostat card from captured codes, look at **SmartIR**, which builds one from a JSON file of codes — or contribute your protocol back to ESPHome and become someone’s hero.' },
        ],
    },
    {
        id: 'ch-place',
        t: 'Where to put the box, and how far infrared really reaches',
        blocks: [
            { p: 'This is the step people get wrong, then blame the software. Infrared is light. It does not go through walls, around corners, or through the back of a bookcase.' },
            { h: 'The rules' },
            { svg: 'beam' },
            { ul: [
                '**Line of sight wins.** The LED must be able to “see” the dark plastic window on the indoor unit — usually bottom-centre, sometimes behind the flap.',
                '**Closer is better than clever.** Two metres of clear air beats five metres of aiming genius.',
                '**Bouncing works.** Infrared reflects off white ceilings and walls surprisingly well. Aiming a strong blaster at the ceiling above the AC often beats aiming it directly.',
                '**Sunlight is noise.** Direct sun on either device swamps the signal. Do not put the box on a sunny windowsill.',
                '**The AC needs power.** If the unit is switched off at the wall or the breaker, no amount of blinking will help.',
            ] },
            { h: 'If it works at 20 cm but not across the room' },
            { p: 'Your transmitter is simply too weak — this is normal for a bare KY-005 module driven from a chip pin. In order of effort:' },
            { ol: [
                'Move it closer, or point it at the ceiling above the unit.',
                'Swap in an **IR blaster module with a driver transistor** (~€2). This is the real fix and it is still just three wires.',
                'Buy a finished blaster puck (the [Tamed Djinn](#p-djinn) or [Zigbee Whisperer](#p-whisper) paths) — their 360° arrays are far stronger than anything you will hand-wire.',
            ] },
            { note: 'Want to know if your LED is firing at all? Point a **phone camera** at it while sending a command. Most phone front cameras see infrared as a faint purple-white flicker. It is the fastest test in this entire guide.' },
        ],
    },
    {
        id: 'ch-automate',
        t: 'Automations worth having',
        blocks: [
            { p: 'Paste these into `Settings → Automations → ⋮ → Edit in YAML` and change the entity names to yours. They assume a `climate.air_conditioner` entity; the button-only paths would call a script instead.' },
            { h: 'Cool the bedroom before you get in it' },
            { code: { label: 'Home Assistant · automation', text: `alias: Pre-cool the bedroom
triggers:
  - trigger: time
    at: "21:30:00"
conditions:
  - condition: numeric_state
    entity_id: sensor.bedroom_temperature
    above: 24
actions:
  - action: climate.set_temperature
    target:
      entity_id: climate.air_conditioner
    data:
      hvac_mode: cool
      temperature: 22` } },
            { h: 'Never cool an empty house' },
            { code: { label: 'Home Assistant · automation', text: `alias: AC off when everyone leaves
triggers:
  - trigger: state
    entity_id: zone.home
    to: "0"
    for: "00:10:00"
actions:
  - action: climate.turn_off
    target:
      entity_id: climate.air_conditioner` } },
            { h: 'Stop cooling the garden' },
            { code: { label: 'Home Assistant · automation', text: `alias: AC off when a window opens
triggers:
  - trigger: state
    entity_id: binary_sensor.bedroom_window
    to: "on"
    for: "00:01:00"
actions:
  - action: climate.turn_off
    target:
      entity_id: climate.air_conditioner` } },
            { h: 'Say it twice, because nobody is listening back' },
            { p: 'Infrared is fire-and-forget: if someone walked in front of the beam, the command is simply lost. Most AC protocols send the **complete state** rather than a toggle, so re-sending the same command is harmless — it just re-states the truth. A gentle repeat every half hour while the AC should be on quietly fixes missed commands.' },
            { note: '**Check this on your own unit before trusting it.** A small number of remotes send a genuine on/off *toggle*, and repeating that would turn your AC off. Test by sending the same command twice and watching what happens.' },
            { h: 'Be kind to the compressor' },
            { p: 'Never build something that can switch the unit on and off every few minutes — short-cycling wears compressors out. Put a `for:` delay on your triggers, use a wide temperature dead-band (cool below 26, stop at 23, not 24.0 and 23.9), and if in doubt add a `condition` that the AC has been in its current state for at least five minutes.' },
        ],
    },
    {
        id: 'ch-trouble',
        t: 'When it does not work',
        blocks: [
            { h: 'The board never appears when I plug it in' },
            { ul: [
                'Try another USB cable. Half of all “dead boards” are charge-only cables.',
                'Use Chrome or Edge — Firefox and Safari cannot flash over USB.',
                'Some clones need the **BOOT** button held while flashing starts.',
                'On Windows, a missing CH340 or CP2102 driver is the usual culprit.',
            ] },
            { h: 'It flashed, but never joins Wi-Fi' },
            { ul: [
                '2.4 GHz only. Always. Check your network is not 5 GHz-only.',
                'Typos in the password — retype it in ESPHome’s `secrets.yaml`.',
                'Weak signal where the AC is. Move it, or take the Zigbee path.',
                'Some routers block new devices by default (MAC filtering, guest isolation).',
            ] },
            { h: 'The card works but the AC ignores it' },
            { ul: [
                'Wrong brand platform — try `coolix`, then your actual brand, then `heatpumpir`.',
                'Check the LED is firing at all with a **phone camera** (see [placement](#ch-place)).',
                'Get within 20 cm and retry. If that works, it is a range problem, not a code problem.',
                'Check the wire on `S` is really on the GPIO you wrote in the config.',
                'Some units ignore commands for a few minutes after being powered on.',
            ] },
            { h: 'It turns on but the temperature or mode is wrong' },
            { ul: [
                'Several platforms have a `model:` or `use_fahrenheit:` option — read the [ESPHome page](https://esphome.io/components/climate/climate_ir.html) for yours.',
                'Some units only support a subset of modes; set `supports_heat: false` or `supports_dry: false` to stop offering them.',
                'Mitsubishi units that cannot heat sometimes ignore “off” entirely unless `supports_heat` is false.',
            ] },
            { h: 'Home Assistant says the AC is on, but it is off' },
            { p: 'That is not a bug, that is infrared. The box has no way to know. If this bothers you — and after the first time you come home to a freezing house it will — add a **power-monitoring smart plug** on the AC, or a cheap temperature sensor taped near the air outlet. Either gives you real feedback to automate on.' },
            { h: 'The build fails or runs out of memory' },
            { ul: [
                'Give the machine running ESPHome more time and more RAM; a Pi 3 building for an ESP32 is genuinely slow.',
                'Remove the parts of the config you are not using yet (extra sensors, the web server).',
                'Check indentation. YAML cares about spaces, and only spaces — never tabs.',
            ] },
        ],
    },
    {
        id: 'ch-safe',
        t: 'Safety, sanity and warranties',
        blocks: [
            { ul: [
                '**Nothing here touches your air conditioner.** You are pointing a torch at it, exactly as its own remote does. No warranty is at risk, no wire is cut, no panel is opened.',
                '**This is not a safety cut-out.** “Off” over infrared asks the unit politely. It does not isolate power. Never rely on it for anything that matters.',
                '**Do not short-cycle the compressor.** Give it at least five minutes between state changes, always.',
                '**Keep the original remote, with batteries in it.** It is your escape hatch when the Wi-Fi dies at 3 a.m.',
                '**Watch it for the first week.** Automations that run while you are out are exactly the ones that surprise you on the bill.',
                '**Use a decent USB charger.** It runs 24/7 in a bedroom. This is not the place to save €2.',
                '**Do not put the box in the AC’s airflow** if you are reading its temperature sensor — it will read the cold blast, not the room.',
                '**If the flap or the unit is unusual**, check that automating it is allowed by your rental agreement or building rules before you make it clever.',
            ] },
        ],
    },
];


/* ── FAQ ─────────────────────────────────────────────────────────────────── */
const FAQ = [
    {
        id: 'faq-1', t: 'Do I really need Home Assistant?',
        blocks: [{ p: 'For the ESPHome paths, no — the device also serves its own little web page you can open from a browser, and it can talk plain MQTT. But every worthwhile automation in this guide (nobody home, window open, it is 26 degrees) needs something that knows about the rest of your house, and that is what Home Assistant is. It is free and runs on hardware you probably already own.' }],
    },
    {
        id: 'faq-2', t: 'Will this void my warranty?',
        blocks: [{ p: 'No. You are not opening, wiring into, or modifying the air conditioner in any way. You are building a second remote control. The only warranty you can affect is the €6 Tuya puck’s, if you re-flash it — and that is rather the point.' }],
    },
    {
        id: 'faq-3', t: 'Can it work from another room, or through a wall?',
        blocks: [{ p: 'No. Infrared is light. The device must live in the same room with a clear view of the unit — which is why every path here assumes a USB charger in that room. If Wi-Fi is poor there, take the Zigbee path; Zigbee mesh usually reaches where Wi-Fi does not.' }],
    },
    {
        id: 'faq-4', t: 'Why not just buy a Sensibo or Tado AC controller?',
        blocks: [{ p: 'You absolutely can, and if you value your evenings, maybe you should. They cost roughly €80–150, look lovely, and mostly depend on the maker’s cloud staying alive and free. The devices in this guide cost €5–20, keep working when the internet is down, and will still work in ten years because nothing can be switched off remotely.' }],
    },
    {
        id: 'faq-5', t: 'Can the same box also run my TV, fan or projector?',
        blocks: [{ p: 'Yes, and it is nearly free to add. The same `remote_transmitter` can send NEC, Sony, Samsung, RC5 and raw codes; add a `button:` for each one. A single well-placed blaster can drive every infrared thing in the room.' }],
    },
    {
        id: 'faq-6', t: 'ESP32 or ESP8266 — does it matter?',
        blocks: [{ p: 'A little. The ESP32 has dedicated hardware (the RMT peripheral) for producing precisely timed infrared pulses, and AC codes are long. The ESP8266 does it in software and is usually fine, but it is the more likely of the two to drop a command. If you are buying new, buy an ESP32; if one is already in your drawer, use it.' }],
    },
    {
        id: 'faq-7', t: 'How do I know whether the AC is really running?',
        blocks: [{ p: 'You cannot, from infrared alone — no path in this guide changes that. The two cheap fixes: a power-monitoring smart plug in line with the AC (if it plugs into a socket), or a temperature sensor taped near the air outlet, which drops sharply within a minute of the unit actually cooling. Either turns a guess into a fact you can automate on.' }],
    },
    {
        id: 'faq-8', t: 'Which path should I pick if I just want it done?',
        blocks: [{ p: 'The [Tamed Djinn](#p-djinn) if your time is worth more than €10, the [Pocket Wand](#p-wand) if you want it local, tidy and genuinely yours, and the [Three-Wire Bench](#p-bench) if the point is to spend as little money as possible and learn something. All three end up at the same thermostat card.' }],
    },
];


/* ── The picker ──────────────────────────────────────────────────────────── */
const QUESTIONS = [
    {
        id: 'fiddle',
        q: 'How much fiddling do you actually enjoy?',
        hint: 'Be honest. Nobody is watching.',
        opts: [
            { v: 'none', label: 'None — it must just work', w: { djinn: 6, ready: 7, whisper: 2 } },
            { v: 'some', label: 'I can copy-paste a config file', w: { wand: 5, bench: 4, ready: 3, whisper: 3 } },
            { v: 'lots', label: 'Logs, flashing, the lot — that is the fun', w: { bench: 4, hijack: 7, wand: 2 } },
        ],
    },
    {
        id: 'dist',
        q: 'How far will the box sit from the air conditioner?',
        hint: 'Infrared is light: this decides which LED you need.',
        opts: [
            { v: 'near', label: 'Right under it, under 2 m', w: { bench: 4, wand: 3 } },
            { v: 'mid', label: 'Same wall, 2–5 m', w: { wand: 1, djinn: 2, whisper: 2, hijack: 2, ready: 2 } },
            { v: 'far', label: 'Across the room, or aimed awkwardly', w: { djinn: 6, ready: 6, hijack: 5, whisper: 4, wand: -2, bench: -1 } },
        ],
    },
    {
        id: 'ha',
        q: 'Do you run Home Assistant?',
        hint: 'Skip this if you already ticked it in your drawer.',
        opts: [
            { v: 'yes', label: 'Yes, already', w: { wand: 3, bench: 3, ready: 3, whisper: 2, hijack: 2, djinn: 2 } },
            { v: 'soon', label: 'Not yet, but I will set it up', w: { wand: 2, bench: 2, ready: 2, djinn: 2 } },
            { v: 'never', label: 'No, and I would rather not', w: { djinn: 6 } },
        ],
    },
    {
        id: 'brand',
        q: 'Which air conditioner is it?',
        hint: 'This only changes one line of config — but it is the line people get stuck on.',
        select: true,
        opts: [
            { v: '', label: 'Pick a brand (or leave blank)' },
            { v: 'coolix', label: 'Unbranded / budget unit — try Coolix' },
            { v: 'daikin', label: 'Daikin' },
            { v: 'climate_ir_lg', label: 'LG' },
            { v: 'midea_ir', label: 'Midea' },
            { v: 'mitsubishi', label: 'Mitsubishi' },
            { v: 'fujitsu_general', label: 'Fujitsu General' },
            { v: 'gree', label: 'GREE' },
            { v: 'hitachi_ac424', label: 'Hitachi' },
            { v: 'toshiba', label: 'Toshiba' },
            { v: 'tcl112', label: 'TCL / Electrolux / Fuego' },
            { v: 'whirlpool', label: 'Whirlpool' },
            { v: 'delonghi', label: 'De’Longhi' },
            { v: 'ballu', label: 'Ballu' },
            { v: 'zhlt01', label: 'Eurom / Chigo / Tristar (ZH-LT-01 remote)' },
            { v: 'heatpumpir', label: 'Panasonic, Samsung, Sharp, other' },
            { v: 'unknown', label: 'No idea / not on this list' },
        ],
    },
    {
        id: 'temp',
        q: 'Do you also want the room temperature?',
        hint: 'Strongly recommended — it is what you will automate on.',
        opts: [
            { v: 'yes', label: 'Yes, add a sensor', w: {} },
            { v: 'no', label: 'No, just control', w: {} },
        ],
    },
];
