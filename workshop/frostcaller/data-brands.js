/* ==========================================================================
   Frostcaller — brand & device catalogue
   --------------------------------------------------------------------------
   Loaded before app.js. Three tables:

     CLIMATE   → air conditioners and heat pumps, weighted towards what is
                 actually sold in Belgium and the Low Countries.
     DEVICES   → everything else in the room that answers to infrared.
     FLIPPER   → the Flipper Zero firmware and code-database repositories.

   `how` is how well ESPHome knows the brand:
     native  — a first-class ESPHome platform, gives you a thermostat card
     library — through `heatpumpir`, which wraps Arduino-HeatpumpIR
     try     — no dedicated support, but one of the generic protocols usually
               lands. Start with the platform named and be ready to capture.
     capture — nothing known. Copy your own remote; it always works.

   Keep `be: true` honest — it means "commonly sold in Belgium", not
   "exists in Belgium".
   ========================================================================== */

'use strict';

const CLIMATE = [
    /* ---- The big installers' brands, everywhere in Belgium ------------- */
    { name: 'Daikin', plat: 'daikin', how: 'native', be: true, note: 'The most-installed split brand in Belgium. Japanese ARC remotes need `daikin_arc`; ceiling cassettes use `daikin_brc`.' },
    { name: 'Mitsubishi Electric', plat: 'mitsubishi', how: 'native', be: true, note: 'Cooling-only units often ignore “off” unless you set `supports_heat: false`.' },
    { name: 'Mitsubishi Heavy Industries', plat: 'heatpumpir', how: 'library', be: true, note: 'A different company from Mitsubishi Electric, and a different protocol. Use `mitsubishi_heavy_zm` or `_zj`.' },
    { name: 'Panasonic', plat: 'heatpumpir', how: 'library', be: true, note: 'Pick the protocol matching your remote: `panasonic_dke`, `_nke`, `_jke`, `_lke` or `_ckp`.' },
    { name: 'LG', plat: 'climate_ir_lg', how: 'native', be: true, note: 'Brazilian and some European units need different header timings — the platform lets you set them.' },
    { name: 'Samsung', plat: 'heatpumpir', how: 'library', be: true, note: 'Use `samsung_aqv` or `samsung_fjm`.' },
    { name: 'Toshiba', plat: 'toshiba', how: 'native', be: true, note: 'Four models to choose from; `RAS-2819T` uses a two-packet protocol.' },
    { name: 'Hitachi', plat: 'hitachi_ac344', how: 'native', be: true, note: 'Try `hitachi_ac424` if the first one is ignored.' },
    { name: 'Fujitsu General', plat: 'fujitsu_general', how: 'native', be: true },
    { name: 'Vaillant', plat: 'heatpumpir', how: 'library', be: true, note: 'Protocol `vaillantvai8`. Big in Belgian new-builds.' },
    { name: 'Viessmann', plat: 'coolix', how: 'try', be: true, note: 'Often a rebadged unit. Try `coolix`, then capture.' },
    { name: 'Bosch / Buderus / Nefit', plat: 'midea_ir', how: 'try', be: true, note: 'Frequently Midea underneath. Try `midea_ir`, then `coolix`.' },
    { name: 'Atlantic', plat: 'coolix', how: 'try', be: true, note: 'French, common in Wallonia. Usually a rebadge — capture if `coolix` fails.' },
    { name: 'Airwell', plat: 'coolix', how: 'try', be: true },
    { name: 'Carrier', plat: 'heatpumpir', how: 'library', be: true, note: '`carrier_mca`, `carrier_nqv` or the Qlima variants.' },
    { name: 'Sharp', plat: 'heatpumpir', how: 'library', be: true, note: 'Protocol `sharp`.' },
    { name: 'Stiebel Eltron', plat: 'mitsubishi', how: 'try', be: true, note: 'Tested working with the KM07F remote on an ACW 25 i.' },
    { name: 'Nibe', plat: 'heatpumpir', how: 'library', be: true, note: 'Protocol `nibe`.' },
    { name: 'IVT', plat: 'heatpumpir', how: 'library', note: 'Protocol `ivt`.' },

    /* ---- Volume brands, the ones in every Belgian DIY shed ------------- */
    { name: 'Midea', plat: 'midea_ir', how: 'native', be: true, note: 'Also builds for half the labels below. If a cheap unit answers `midea_ir`, that is why.' },
    { name: 'Gree', plat: 'gree', how: 'native', be: true, note: 'Needs a `model:` — try `yan`, then `yaa`, then `yac`.' },
    { name: 'TCL', plat: 'tcl112', how: 'native', be: true },
    { name: 'Electrolux', plat: 'tcl112', how: 'native', be: true },
    { name: 'Hisense', plat: 'heatpumpir', how: 'library', be: true, note: 'Protocol `hisense_aud`.' },
    { name: 'Haier', plat: 'haier', how: 'native', be: true, note: 'ESPHome has a dedicated Haier component — pick protocol `smartair2` or `hon`.' },
    { name: 'Whirlpool', plat: 'whirlpool', how: 'native', be: true, note: 'Two models: `DG11J1-3A` and `DG11J1-91`.' },
    { name: 'De’Longhi', plat: 'delonghi', how: 'native', be: true, note: 'Known working with the PAC WE 120HP portable.' },
    { name: 'Beko', plat: 'coolix', how: 'try', be: true },
    { name: 'AEG', plat: 'coolix', how: 'try', be: true },
    { name: 'Hyundai', plat: 'heatpumpir', how: 'library', note: 'Protocol `hyundai`.' },
    { name: 'AUX', plat: 'heatpumpir', how: 'library', note: 'Protocol `aux`.' },
    { name: 'Ballu', plat: 'ballu', how: 'native' },
    { name: 'Whynter', plat: 'whynter', how: 'native' },
    { name: 'Noblex', plat: 'noblex', how: 'native' },
    { name: 'Emmeti', plat: 'emmeti', how: 'native' },
    { name: 'Yashima', plat: 'yashima', how: 'native' },
    { name: 'Fuego', plat: 'tcl112', how: 'native' },

    /* ---- Portables and shop brands: Belgium's real bestsellers --------- */
    { name: 'Qlima / Zibro', plat: 'zhlt01', how: 'try', be: true, note: 'The portable everyone buys at Brico. Try `zhlt01` first, then `heatpumpir` with `carrier_qlima_1`.' },
    { name: 'Eurom', plat: 'zhlt01', how: 'native', be: true, note: 'The ZH/LT-01 remote family — a straight hit for `zhlt01`.' },
    { name: 'Domo', plat: 'coolix', how: 'try', be: true, note: 'Belgian house brand, usually a rebadge. `coolix` is the first thing to try.' },
    { name: 'Livoo', plat: 'coolix', how: 'try', be: true },
    { name: 'Central Park (Aveve)', plat: 'coolix', how: 'try', be: true },
    { name: 'Cotech (Hubo)', plat: 'coolix', how: 'try', be: true },
    { name: 'Trotec', plat: 'coolix', how: 'try', be: true },
    { name: 'Argo', plat: 'coolix', how: 'try', be: true, note: 'Known to IRremoteESP8266 but not to ESPHome. If `coolix` fails, capture it.' },
    { name: 'Olimpia Splendid', plat: 'coolix', how: 'try', be: true, note: 'The Unico range is common in Belgian flats where no outdoor unit is allowed.' },
    { name: 'Remko', plat: 'coolix', how: 'try', be: true },
    { name: 'Suntec', plat: 'coolix', how: 'try', be: true },
    { name: 'Tristar', plat: 'zhlt01', how: 'native', be: true },
    { name: 'Chigo', plat: 'zhlt01', how: 'native' },
    { name: 'Tecnomaster, Elgin, Geant, Tekno, Topair', plat: 'zhlt01', how: 'native', note: 'All ship the same ZH/LT-01 handset.' },
    { name: 'Proma, Sumikura, JBS, Turbo Air, Nakatomy', plat: 'zhlt01', how: 'native' },
    { name: 'Celestial Air, Ager, Blueway, Airlux', plat: 'zhlt01', how: 'native' },
    { name: 'Vivax', plat: 'gree', how: 'try', note: 'Usually Gree underneath.' },
    { name: 'Sinclair', plat: 'gree', how: 'try' },
    { name: 'Cooper & Hunter', plat: 'gree', how: 'try' },
    { name: 'Rotenso', plat: 'gree', how: 'try' },
    { name: 'Kelvinator', plat: 'coolix', how: 'try', note: 'IRremoteESP8266 knows it; ESPHome does not. Capture if `coolix` misses.' },
    { name: 'Sanyo', plat: 'coolix', how: 'try' },
    { name: 'Coolix (generic)', plat: 'coolix', how: 'native', note: 'Not a brand — a protocol that a startling number of budget units speak. Always try this first.' },
    { name: 'Anything else', plat: 'coolix', how: 'capture', note: 'Try `coolix`, then `heatpumpir`, then copy your own remote. The last one never fails.' },
];

/* ── Everything else in the room ─────────────────────────────────────────── */
const DEVICES = [
    {
        group: 'Televisions',
        items: [
            { name: 'Samsung', proto: 'samsung', act: 'transmit_samsung', note: 'Power is usually `0xE0E040BF`.' },
            { name: 'LG', proto: 'nec / lg', act: 'transmit_lg', note: 'Power `0x20DF10EF` with `nbits: 32`.' },
            { name: 'Philips', proto: 'rc5 / rc6', act: 'transmit_rc5', note: 'Older sets are RC5, newer ones RC6. Both are in ESPHome.' },
            { name: 'Sony', proto: 'sony', act: 'transmit_sony', note: 'Needs `nbits` — 12, 15 or 20 depending on the set.' },
            { name: 'Panasonic', proto: 'panasonic', act: 'transmit_panasonic' },
            { name: 'Toshiba, Hisense, TCL, Sharp', proto: 'nec', act: 'transmit_nec', note: 'Almost everything cheap is NEC.' },
            { name: 'Loewe, Grundig', proto: 'rc5', act: 'transmit_rc5' },
        ],
    },
    {
        group: 'Set-top boxes & streaming',
        items: [
            { name: 'Telenet / Telenet TV box', proto: 'nec', act: 'transmit_nec', be: true, note: 'Technicolor hardware. Capture it — the codes vary by box generation.' },
            { name: 'Proximus Pickx', proto: 'rc6 / nec', act: 'transmit_rc6', be: true, note: 'Also Technicolor. Capture rather than guess.' },
            { name: 'VOO', proto: 'nec', act: 'transmit_nec', be: true },
            { name: 'Apple TV', proto: 'nec', act: 'transmit_nec', note: 'NEC with address `0x87EE`. The aluminium remote, not the Siri one — that is Bluetooth.' },
            { name: 'Nvidia Shield, Fire TV', proto: 'nec', act: 'transmit_nec', note: 'Only the IR-capable models; most use Bluetooth now.' },
            { name: 'Dish, DirecTV', proto: 'dish', act: 'transmit_dish', note: 'A different carrier frequency (57.6 kHz) — many receivers cannot even hear it.' },
        ],
    },
    {
        group: 'Sound',
        items: [
            { name: 'Samsung, LG soundbars', proto: 'samsung / nec', act: 'transmit_samsung' },
            { name: 'Yamaha, Denon, Marantz', proto: 'nec', act: 'transmit_nec' },
            { name: 'Pioneer', proto: 'pioneer', act: 'transmit_pioneer', note: 'Often needs the code sent twice — set `repeat: times: 2`.' },
            { name: 'Bang & Olufsen', proto: 'beo4', act: 'transmit_beo4', note: 'A 455 kHz carrier. Standard receivers cannot read it; you need B&O hardware.' },
            { name: 'JVC', proto: 'jvc', act: 'transmit_jvc' },
        ],
    },
    {
        group: 'Around the house',
        items: [
            { name: 'Ceiling and tower fans', proto: 'nec / raw', act: 'transmit_nec', note: 'Cheap fans are usually NEC. Dyson has its own — see below.' },
            { name: 'Dyson fans and purifiers', proto: 'dyson', act: 'transmit_dyson', note: 'Rolling codes: the index must change every send or the fan ignores you.' },
            { name: 'LED strip remotes (24 and 44 key)', proto: 'nec', act: 'transmit_nec', note: 'The classic white credit-card remote is plain NEC.' },
            { name: 'Roomba', proto: 'roomba', act: 'transmit_roomba', note: 'Send it at least three times or it will not act.' },
            { name: 'Dehumidifiers, air purifiers', proto: 'nec / raw', act: 'transmit_raw' },
            { name: 'Electric fireplaces, pellet stoves', proto: 'raw', act: 'transmit_raw', note: 'Almost always worth just capturing.' },
            { name: 'Projectors (Epson, BenQ, Optoma)', proto: 'nec', act: 'transmit_nec' },
            { name: 'Motorised projector screens', proto: 'nec / rf', act: 'transmit_nec', note: 'Many are 433 MHz radio, not infrared — check before buying an IR blaster for it.' },
            { name: 'Toto washlets', proto: 'toto', act: 'transmit_toto' },
            { name: 'MagiQuest wands', proto: 'magiquest', act: 'transmit_magiquest', note: 'Because someone always asks.' },
        ],
    },
];

/* ── Flipper Zero ────────────────────────────────────────────────────────── */
const FLIPPER_REPOS = [
    {
        name: 'flipperdevices/flipperzero-firmware',
        url: 'https://github.com/flipperdevices/flipperzero-firmware',
        what: 'The official firmware. The `ir` command in its serial CLI is what this page talks to, and `applications/main/infrared` is where the protocol decoders live if you want to read how it works.',
        key: true,
    },
    {
        name: 'Flipper-IRDB',
        url: 'https://github.com/Lucaslhm/Flipper-IRDB',
        what: 'The community infrared database — thousands of `.ir` files sorted by device type and brand, including a large `ACs/` folder. If your air conditioner is not in ESPHome, there is a fair chance somebody has already captured it here. Download the `.ir` and drop it into the converter on this page.',
        key: true,
    },
    {
        name: 'UberGuidoZ/Flipper',
        url: 'https://github.com/UberGuidoZ/Flipper',
        what: 'The other great pile of files — infrared, sub-GHz, NFC and more, with a well-organised `Infrared/` tree.',
    },
    {
        name: 'DarkFlippers/unleashed-firmware',
        url: 'https://github.com/DarkFlippers/unleashed-firmware',
        what: 'Unleashed: the best-known custom firmware. The infrared CLI behaves the same, so everything here works unchanged.',
    },
    {
        name: 'RogueMaster/flipperzero-firmware-wPlugins',
        url: 'https://github.com/RogueMaster/flipperzero-firmware-wPlugins',
        what: 'RogueMaster: everything, all at once, including a bundled IR database. Heavier, and the CLI output occasionally gains extra decoration — this page copes with both.',
    },
    {
        name: 'Next-Flip/Momentum-Firmware',
        url: 'https://github.com/Next-Flip/Momentum-Firmware',
        what: 'Momentum: a tidier custom firmware with an active following. Same CLI.',
    },
    {
        name: 'flipperdevices/flipperzero-protobuf',
        url: 'https://github.com/flipperdevices/flipperzero-protobuf',
        what: 'The RPC protocol definitions. Only needed if you want to go beyond the text CLI — reading and writing files on the device, for instance. Noted here for whoever picks that up.',
    },
];
