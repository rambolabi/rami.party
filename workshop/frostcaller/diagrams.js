/* ==========================================================================
   Frostcaller — drawings
   --------------------------------------------------------------------------
   Every picture on this site is drawn here, in SVG, at load time. No image
   files, nothing to download, and they re-colour themselves with the theme
   because they use `currentColor` and the CSS custom properties.

   Built with createElementNS and setAttribute — same house rule as the rest
   of the project: no innerHTML, ever.

     svgWiring()        the three-wire bench, drawn as it actually looks
     svgBoard(id)       a pinout card per board, with the infrared pin lit up
     svgBeam()          why line-of-sight matters, in one picture
     svgRemote(id)      handset silhouettes, for "which remote is this?"
   ========================================================================== */

'use strict';

const SVGNS = 'http://www.w3.org/2000/svg';

function sv(tag, attrs, text) {
    const n = document.createElementNS(SVGNS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, String(v)));
    if (text != null) n.textContent = text;
    return n;
}

function svgRoot(w, h, label) {
    const s = sv('svg', {
        viewBox: '0 0 ' + w + ' ' + h,
        role: 'img',
        'aria-label': label,
        class: 'fig',
        preserveAspectRatio: 'xMidYMid meet',
    });
    return s;
}

/* ── The three-wire bench ────────────────────────────────────────────────── */
function svgWiring() {
    const s = svgRoot(560, 300, 'Wiring diagram: an ESP32 board connected to an infrared module with three jumper wires');

    /* ESP32 board */
    s.appendChild(sv('rect', { x: 40, y: 60, width: 150, height: 200, rx: 8, class: 'fig-board' }));
    s.appendChild(sv('rect', { x: 78, y: 44, width: 74, height: 26, rx: 4, class: 'fig-chip' }));
    s.appendChild(sv('text', { x: 115, y: 62, class: 'fig-t fig-mid' }, 'USB'));
    s.appendChild(sv('rect', { x: 70, y: 96, width: 90, height: 54, rx: 3, class: 'fig-chip' }));
    s.appendChild(sv('text', { x: 115, y: 128, class: 'fig-t fig-mid' }, 'ESP32'));
    s.appendChild(sv('text', { x: 115, y: 282, class: 'fig-label fig-mid' }, 'ESP32 dev board'));

    /* Header pins down the right-hand edge */
    const pins = [
        { y: 170, name: '3V3', wire: 'v' },
        { y: 196, name: 'GND', wire: 'g' },
        { y: 222, name: 'GPIO14', wire: 's' },
    ];
    pins.forEach(p => {
        s.appendChild(sv('rect', { x: 182, y: p.y - 5, width: 10, height: 10, rx: 2, class: 'fig-pin' }));
        s.appendChild(sv('text', { x: 176, y: p.y + 4, class: 'fig-t fig-end' }, p.name));
    });

    /* IR module */
    s.appendChild(sv('rect', { x: 380, y: 110, width: 130, height: 100, rx: 8, class: 'fig-board' }));
    s.appendChild(sv('text', { x: 445, y: 232, class: 'fig-label fig-mid' }, 'KY-005 module'));
    /* the LED itself */
    s.appendChild(sv('rect', { x: 432, y: 84, width: 26, height: 30, rx: 12, class: 'fig-led' }));
    s.appendChild(sv('text', { x: 445, y: 74, class: 'fig-t fig-mid fig-accent' }, 'IR LED'));

    const mPins = [
        { y: 140, name: '−  GND', wire: 'g' },
        { y: 165, name: 'middle  +', wire: 'v' },
        { y: 190, name: 'S  signal', wire: 's' },
    ];
    mPins.forEach(p => {
        s.appendChild(sv('rect', { x: 372, y: p.y - 5, width: 10, height: 10, rx: 2, class: 'fig-pin' }));
        s.appendChild(sv('text', { x: 392, y: p.y + 4, class: 'fig-t' }, p.name));
    });

    /* The three wires. Routed so they never cross, because a diagram whose
       lines cross is a diagram somebody will wire up wrong. */
    const wire = (from, to, cls, dip) => {
        const d = 'M ' + 192 + ' ' + from + ' C ' + (250 + dip) + ' ' + from + ', ' +
            (320 - dip) + ' ' + to + ', ' + 372 + ' ' + to;
        s.appendChild(sv('path', { d, class: 'fig-wire ' + cls, fill: 'none' }));
    };
    wire(170, 165, 'is-v', 0);      /* 3V3   → middle */
    wire(196, 140, 'is-g', 20);     /* GND   → −      */
    wire(222, 190, 'is-s', 40);     /* GPIO14 → S     */

    /* Legend */
    const legend = [
        { x: 40, label: 'signal', cls: 'is-s' },
        { x: 150, label: '3.3 V — never 5 V', cls: 'is-v' },
        { x: 330, label: 'ground', cls: 'is-g' },
    ];
    legend.forEach(l => {
        s.appendChild(sv('line', { x1: l.x, y1: 24, x2: l.x + 22, y2: 24, class: 'fig-wire ' + l.cls }));
        s.appendChild(sv('text', { x: l.x + 30, y: 28, class: 'fig-t' }, l.label));
    });

    return s;
}

/* ── Board pinout cards ─────────────────────────────────────────────────── */
/* Left and right pin lists per board, with a status per pin so the drawing
   agrees with the pin map table rather than contradicting it. */
const BOARD_PINS = {
    esp32dev: {
        name: 'ESP32 DevKit (30-pin)', w: 200, h: 400,
        left: ['EN', 'GPIO36 in', 'GPIO39 in', 'GPIO34 in', 'GPIO35 in', 'GPIO32', 'GPIO33', 'GPIO25',
            'GPIO26', 'GPIO27', 'GPIO14', 'GPIO12', 'GND', 'GPIO13'],
        right: ['GPIO23', 'GPIO22', 'GPIO1 TX', 'GPIO3 RX', 'GPIO21', 'GND', 'GPIO19', 'GPIO18',
            'GPIO5', 'GPIO17', 'GPIO16', 'GPIO4', 'GPIO0', 'GPIO2'],
        ir: 'GPIO14', power: ['3V3', '5V', 'GND', 'VIN', 'EN'],
    },
    d1mini: {
        name: 'Wemos D1 mini', w: 180, h: 260,
        left: ['RST', 'A0', 'D0', 'D5', 'D6', 'D7', 'D8', '3V3'],
        right: ['TX', 'RX', 'D1', 'D2', 'D3', 'D4', 'GND', '5V'],
        ir: 'D2', power: ['3V3', '5V', 'GND'],
    },
    atom: {
        name: 'M5Stack Atom Lite', w: 190, h: 190,
        left: ['G22', 'G19', 'G23', 'G33', '5V'],
        right: ['G21', 'G25', 'G26', 'G32', 'GND'],
        ir: 'built in', power: ['5V', 'GND', '3V3'],
        builtIn: 'Infrared LED inside, on GPIO12 — nothing to wire',
    },
    esp32c3: {
        name: 'ESP32-C3 SuperMini', w: 170, h: 250,
        left: ['5V', 'GND', '3V3', 'GPIO4', 'GPIO3', 'GPIO2', 'GPIO1', 'GPIO0'],
        right: ['GPIO5', 'GPIO6', 'GPIO7', 'GPIO8', 'GPIO9', 'GPIO10', 'GPIO20', 'GPIO21'],
        ir: 'GPIO4', power: ['3V3', '5V', 'GND'],
    },
};

/* Which pins to shade amber. Mirrors PINMAP in tools.js — keep them in step. */
const PIN_WARN = /GPIO0\b|GPIO2\b|GPIO5\b|GPIO12\b|GPIO15\b|GPIO8\b|GPIO9\b|D3|D4|D8|D0/;
const PIN_BAD = /TX|RX|GPIO20|GPIO21\b(?!.*SuperMini)/;

function svgBoard(id) {
    const b = BOARD_PINS[id];
    if (!b) return null;

    const rows = Math.max(b.left.length, b.right.length);
    const rowH = 22;
    const boardW = b.w;
    const boardH = rows * rowH + 46;
    const W = boardW + 260;
    const H = boardH + 60;

    const s = svgRoot(W, H, 'Pinout of the ' + b.name + ', with the infrared pin highlighted');
    const bx = (W - boardW) / 2;
    const by = 34;

    s.appendChild(sv('rect', { x: bx, y: by, width: boardW, height: boardH, rx: 10, class: 'fig-board' }));
    s.appendChild(sv('rect', { x: bx + boardW / 2 - 20, y: by - 12, width: 40, height: 18, rx: 3, class: 'fig-chip' }));
    s.appendChild(sv('text', { x: W / 2, y: by - 18, class: 'fig-label fig-mid' }, b.name));
    s.appendChild(sv('text', { x: W / 2, y: by + boardH + 22, class: 'fig-t fig-mid fig-dim' }, 'USB at the top'));

    const drawSide = (list, side) => {
        list.forEach((label, i) => {
            const y = by + 34 + i * rowH;
            const isIr = label.split(' ')[0] === b.ir;
            const cls = isIr ? 'is-ir'
                : PIN_BAD.test(label) ? 'is-bad'
                    : PIN_WARN.test(label) ? 'is-warn'
                        : /GND|3V3|5V|VIN|EN|RST/.test(label) ? 'is-power' : 'is-good';

            const px = side === 'left' ? bx - 6 : bx + boardW - 6;
            s.appendChild(sv('rect', { x: px, y: y - 5, width: 12, height: 10, rx: 2, class: 'fig-pin ' + cls }));

            const tx = side === 'left' ? bx - 16 : bx + boardW + 16;
            s.appendChild(sv('text', {
                x: tx, y: y + 4,
                class: 'fig-t ' + (side === 'left' ? 'fig-end' : '') + (isIr ? ' fig-accent' : ''),
            }, label));

            if (isIr) {
                const lx = side === 'left' ? bx - 120 : bx + boardW + 120;
                s.appendChild(sv('text', { x: lx, y: y + 4, class: 'fig-t fig-accent' }, '◀ infrared'));
            }
        });
    };
    drawSide(b.left, 'left');
    drawSide(b.right, 'right');

    if (b.builtIn) {
        s.appendChild(sv('rect', { x: bx + boardW / 2 - 16, y: by + boardH / 2 - 16, width: 32, height: 32, rx: 16, class: 'fig-led' }));
        s.appendChild(sv('text', { x: W / 2, y: by + boardH / 2 + 44, class: 'fig-t fig-mid fig-accent' }, b.builtIn));
    }

    return s;
}

/* ── Why line-of-sight matters ──────────────────────────────────────────── */
function svgBeam() {
    const s = svgRoot(560, 240, 'Three ways to aim an infrared blaster at an air conditioner');

    /* The indoor unit, up on the wall */
    s.appendChild(sv('rect', { x: 380, y: 26, width: 150, height: 46, rx: 6, class: 'fig-board' }));
    s.appendChild(sv('rect', { x: 392, y: 56, width: 18, height: 10, rx: 2, class: 'fig-eye' }));
    s.appendChild(sv('text', { x: 455, y: 52, class: 'fig-t fig-mid' }, 'indoor unit'));
    s.appendChild(sv('text', { x: 401, y: 84, class: 'fig-t fig-mid fig-accent' }, 'the eye'));

    /* Ceiling */
    s.appendChild(sv('line', { x1: 20, y1: 16, x2: 540, y2: 16, class: 'fig-rule' }));
    s.appendChild(sv('text', { x: 26, y: 30, class: 'fig-t fig-dim' }, 'ceiling'));

    /* Good: straight shot */
    s.appendChild(sv('rect', { x: 40, y: 96, width: 34, height: 22, rx: 4, class: 'fig-board' }));
    s.appendChild(sv('text', { x: 57, y: 134, class: 'fig-t fig-mid' }, 'box'));
    s.appendChild(sv('path', { d: 'M 78 104 L 388 62', class: 'fig-beam is-good', fill: 'none' }));
    s.appendChild(sv('text', { x: 200, y: 76, class: 'fig-t fig-good' }, 'clear line of sight — best'));

    /* Also fine: bounce off the ceiling */
    s.appendChild(sv('path', { d: 'M 78 100 L 230 20 L 390 58', class: 'fig-beam is-ok', fill: 'none' }));
    s.appendChild(sv('text', { x: 236, y: 40, class: 'fig-t' }, 'bounced off the ceiling — often works'));

    /* Blocked */
    s.appendChild(sv('rect', { x: 230, y: 150, width: 26, height: 70, rx: 3, class: 'fig-block' }));
    s.appendChild(sv('text', { x: 243, y: 236, class: 'fig-t fig-mid fig-dim' }, 'bookcase'));
    s.appendChild(sv('rect', { x: 40, y: 176, width: 34, height: 22, rx: 4, class: 'fig-board' }));
    s.appendChild(sv('path', { d: 'M 78 186 L 228 176', class: 'fig-beam is-bad', fill: 'none' }));
    s.appendChild(sv('text', { x: 90, y: 208, class: 'fig-t fig-bad' }, 'blocked — nothing arrives'));
    s.appendChild(sv('text', { x: 268, y: 186, class: 'fig-t fig-dim' }, 'infrared is light. It does not bend.'));

    return s;
}

/* ── Handset silhouettes ────────────────────────────────────────────────── */
/* Shapes are far more diagnostic than the badge on the front, because the
   same handset is sold under a dozen brand names. */
const REMOTE_SHAPES = [
    {
        id: 'zhlt01',
        name: 'The flat white slab with a hinged flap',
        plat: 'zhlt01',
        say: 'A wide flat handset, usually white, with a small display at the top and a flip-down cover hiding half the buttons. This is the ZH/LT-01 family: Eurom, Qlima, Tristar, Chigo, Elgin, Sumikura and a dozen others. If yours looks like this, `zhlt01` is very likely a straight hit.',
        draw: g => {
            g.appendChild(sv('rect', { x: 20, y: 10, width: 80, height: 150, rx: 10, class: 'fig-board' }));
            g.appendChild(sv('rect', { x: 32, y: 22, width: 56, height: 40, rx: 4, class: 'fig-screen' }));
            g.appendChild(sv('line', { x1: 20, y1: 96, x2: 100, y2: 96, class: 'fig-rule' }));
            [0, 1, 2].forEach(r => [0, 1, 2].forEach(c => {
                g.appendChild(sv('rect', { x: 34 + c * 18, y: 106 + r * 16, width: 12, height: 10, rx: 3, class: 'fig-key' }));
            }));
            g.appendChild(sv('text', { x: 60, y: 92, class: 'fig-t fig-mid fig-dim' }, 'flap'));
        },
    },
    {
        id: 'daikin',
        name: 'Tall, narrow, one big round button',
        plat: 'daikin',
        say: 'Slim and tall with a large display and one prominent ON/OFF button, often with a sliding cover. Daikin and Mitsubishi Electric handsets look like this. Try `daikin` first, then `mitsubishi`.',
        draw: g => {
            g.appendChild(sv('rect', { x: 34, y: 6, width: 52, height: 160, rx: 12, class: 'fig-board' }));
            g.appendChild(sv('rect', { x: 42, y: 16, width: 36, height: 46, rx: 4, class: 'fig-screen' }));
            g.appendChild(sv('circle', { cx: 60, cy: 82, r: 11, class: 'fig-key is-accent' }));
            [0, 1, 2, 3].forEach(r => [0, 1].forEach(c => {
                g.appendChild(sv('rect', { x: 44 + c * 20, y: 104 + r * 14, width: 14, height: 9, rx: 3, class: 'fig-key' }));
            }));
        },
    },
    {
        id: 'coolix',
        name: 'Small, square, cheap-feeling',
        plat: 'coolix',
        say: 'A short stubby handset with a small screen and eight to twelve rubbery buttons, usually unbranded or with a sticker. This is the shape that most often answers `coolix` — the protocol shared by an enormous number of budget units.',
        draw: g => {
            g.appendChild(sv('rect', { x: 26, y: 30, width: 68, height: 110, rx: 8, class: 'fig-board' }));
            g.appendChild(sv('rect', { x: 36, y: 40, width: 48, height: 28, rx: 3, class: 'fig-screen' }));
            [0, 1, 2].forEach(r => [0, 1].forEach(c => {
                g.appendChild(sv('rect', { x: 38 + c * 26, y: 80 + r * 18, width: 20, height: 12, rx: 3, class: 'fig-key' }));
            }));
        },
    },
    {
        id: 'lg',
        name: 'Rounded, a single line of display',
        plat: 'climate_ir_lg',
        say: 'Curved sides, a narrow one-line display and a scattering of small buttons. LG and some Samsung handsets. Try `climate_ir_lg`, then `heatpumpir` with a Samsung protocol.',
        draw: g => {
            g.appendChild(sv('rect', { x: 32, y: 14, width: 56, height: 148, rx: 26, class: 'fig-board' }));
            g.appendChild(sv('rect', { x: 42, y: 30, width: 36, height: 18, rx: 9, class: 'fig-screen' }));
            [0, 1, 2, 3, 4].forEach(r => [0, 1].forEach(c => {
                g.appendChild(sv('circle', { cx: 50 + c * 20, cy: 68 + r * 18, r: 6, class: 'fig-key' }));
            }));
        },
    },
];

function svgRemote(id) {
    const shape = REMOTE_SHAPES.find(r => r.id === id);
    if (!shape) return null;
    const s = svgRoot(120, 175, 'Silhouette of ' + shape.name);
    const g = sv('g', {});
    shape.draw(g);
    s.appendChild(g);
    return s;
}
