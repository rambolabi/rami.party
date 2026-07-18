/* =====================================================================
   DEMOFORGE — Demoscene Video & Music Generator
   Vanilla JS. Canvas rendering + WebAudio synthesis + MediaRecorder.
   ===================================================================== */
(() => {
  "use strict";

  // ---------- Seeded RNG (mulberry32 + string hash) ----------
  function hashSeed(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  let rand = mulberry32(hashSeed("demoforge"));

  // ---------- DOM helpers ----------
  const $ = (id) => document.getElementById(id);
  const canvas = $("scene");
  const ctx = canvas.getContext("2d", { alpha: false });
  const statusEl = $("status");
  const watermarkEl = $("watermark");

  const els = {
    shape: $("shape"), movement: $("movement"), count: $("count"), size: $("size"), speed: $("speed"),
    objColor: $("objColor"), objColor2: $("objColor2"), objAlpha: $("objAlpha"),
    bgColor: $("bgColor"), bgColor2: $("bgColor2"), bgGradient: $("bgGradient"),
    grid: $("grid"), gridSize: $("gridSize"), gridAnim: $("gridAnim"),
    colorCycle: $("colorCycle"), glow: $("glow"), scanlines: $("scanlines"), crt: $("crt"),
    plasma: $("plasma"), kaleidoscope: $("kaleidoscope"), kaleidoSlices: $("kaleidoSlices"),
    trails: $("trails"), trail: $("trail"), distortion: $("distortion"),
    shapeCycle: $("shapeCycle"), shapeCycleSpeed: $("shapeCycleSpeed"),
    pulse: $("pulse"), spread: $("spread"),
    outline: $("outline"), outlineWidth: $("outlineWidth"), blend: $("blend"), starfield: $("starfield"),
    chromatic: $("chromatic"), pixelate: $("pixelate"), pixelSize: $("pixelSize"),
    invert: $("invert"), posterize: $("posterize"), vhs: $("vhs"),
    camZoom: $("camZoom"), camRot: $("camRot"),
    audioOn: $("audioOn"), bpm: $("bpm"), scale: $("scale"), waveform: $("waveform"),
    root: $("root"), steps: $("steps"), density: $("density"), octave: $("octave"),
    arpPattern: $("arpPattern"), arpSpeed: $("arpSpeed"),
    drums: $("drums"), snare: $("snare"), hats: $("hats"), bass: $("bass"), pads: $("pads"), evolve: $("evolve"),
    swing: $("swing"), cutoff: $("cutoff"), filterLfo: $("filterLfo"), vibrato: $("vibrato"),
    bitcrush: $("bitcrush"), echo: $("echo"), echoAmt: $("echoAmt"),
    audioReactive: $("audioReactive"), vol: $("vol"),
    resolution: $("resolution"), dur: $("dur"), seed: $("seed"),
    livePreview: $("livePreview"), removeWatermark: $("removeWatermark"), chaos: $("chaos"),
  };

  // Value readouts bound to sliders
  const readouts = {
    count: (v) => v,
    size: (v) => v,
    speed: (v) => (v / 100).toFixed(1),
    objAlpha: (v) => (v / 100).toFixed(2),
    gridSize: (v) => v,
    kaleidoSlices: (v) => v,
    trail: (v) => (v / 100).toFixed(2),
    shapeCycleSpeed: (v) => (v / 20).toFixed(1),
    spread: (v) => (v / 100).toFixed(1),
    outlineWidth: (v) => v,
    pixelSize: (v) => v,
    camZoom: (v) => (v / 100).toFixed(1),
    camRot: (v) => (v / 100).toFixed(1),
    bpm: (v) => v,
    steps: (v) => v,
    density: (v) => (v / 100).toFixed(2),
    octave: (v) => v,
    arpSpeed: (v) => v,
    swing: (v) => (v / 100).toFixed(2),
    cutoff: (v) => (v / 100).toFixed(2),
    filterLfo: (v) => (v / 100).toFixed(1),
    vibrato: (v) => (v / 100).toFixed(1),
    bitcrush: (v) => (v / 100).toFixed(1),
    echoAmt: (v) => (v / 100).toFixed(2),
    vol: (v) => (v / 100).toFixed(2),
    dur: (v) => v,
  };
  const readoutIds = {
    count: "countVal", size: "sizeVal", speed: "speedVal", objAlpha: "objAlphaVal",
    gridSize: "gridSizeVal", kaleidoSlices: "kaleidoVal", trail: "trailVal",
    shapeCycleSpeed: "shapeCycleSpeedVal", spread: "spreadVal", outlineWidth: "outlineWidthVal",
    pixelSize: "pixelSizeVal", camZoom: "camZoomVal", camRot: "camRotVal",
    bpm: "bpmVal", steps: "stepsVal", density: "densityVal", octave: "octaveVal",
    arpSpeed: "arpSpeedVal", swing: "swingVal", cutoff: "cutoffVal", filterLfo: "filterLfoVal",
    vibrato: "vibratoVal", bitcrush: "bitcrushVal", echoAmt: "echoAmtVal",
    vol: "volVal", dur: "durVal",
  };
  function refreshReadouts() {
    for (const k in readoutIds) {
      const out = $(readoutIds[k]);
      if (out && els[k]) out.textContent = readouts[k](+els[k].value);
    }
  }

  // ---------- State snapshot ----------
  const S = {};
  function readState() {
    S.shape = els.shape.value;
    S.movement = els.movement.value;
    S.count = +els.count.value;
    S.size = +els.size.value;
    S.speed = +els.speed.value / 100;
    S.objColor = els.objColor.value;
    S.objColor2 = els.objColor2.value;
    S.objAlpha = +els.objAlpha.value / 100;
    S.bgColor = els.bgColor.value;
    S.bgColor2 = els.bgColor2.value;
    S.bgGradient = els.bgGradient.checked;
    S.grid = els.grid.checked;
    S.gridSize = +els.gridSize.value;
    S.gridAnim = els.gridAnim.checked;
    S.colorCycle = els.colorCycle.checked;
    S.glow = els.glow.checked;
    S.scanlines = els.scanlines.checked;
    S.crt = els.crt.checked;
    S.plasma = els.plasma.checked;
    S.kaleidoscope = els.kaleidoscope.checked;
    S.kaleidoSlices = +els.kaleidoSlices.value;
    S.trails = els.trails.checked;
    S.trail = +els.trail.value / 100;
    S.distortion = els.distortion.checked;
    S.shapeCycle = els.shapeCycle.checked;
    S.shapeCycleSpeed = +els.shapeCycleSpeed.value / 20;
    S.pulse = els.pulse.checked;
    S.spread = +els.spread.value / 100;
    S.outline = els.outline.checked;
    S.outlineWidth = +els.outlineWidth.value;
    S.blend = els.blend.value;
    S.starfield = els.starfield.checked;
    S.chromatic = els.chromatic.checked;
    S.pixelate = els.pixelate.checked;
    S.pixelSize = +els.pixelSize.value;
    S.invert = els.invert.checked;
    S.posterize = els.posterize.checked;
    S.vhs = els.vhs.checked;
    S.camZoom = +els.camZoom.value / 100;
    S.camRot = +els.camRot.value / 100;
    S.audioOn = els.audioOn.checked;
    S.bpm = +els.bpm.value;
    S.scale = els.scale.value;
    S.waveform = els.waveform.value;
    S.root = +els.root.value;
    S.steps = +els.steps.value;
    S.density = +els.density.value / 100;
    S.octave = +els.octave.value;
    S.arpPattern = els.arpPattern.value;
    S.arpSpeed = +els.arpSpeed.value;
    S.drums = els.drums.checked;
    S.snare = els.snare.checked;
    S.hats = els.hats.checked;
    S.bass = els.bass.checked;
    S.pads = els.pads.checked;
    S.evolve = els.evolve.checked;
    S.swing = +els.swing.value / 100;
    S.cutoff = +els.cutoff.value / 100;
    S.filterLfo = +els.filterLfo.value / 100;
    S.vibrato = +els.vibrato.value / 100;
    S.bitcrush = +els.bitcrush.value / 100;
    S.echo = els.echo.checked;
    S.echoAmt = +els.echoAmt.value / 100;
    S.audioReactive = els.audioReactive.checked;
    S.vol = +els.vol.value / 100;
    S.dur = +els.dur.value;
    S.seed = els.seed.value || "demoforge";
    S.livePreview = els.livePreview.checked;
    S.removeWatermark = els.removeWatermark.checked;
    S.chaos = els.chaos.checked;
  }

  // ---------- Resolution ----------
  function applyResolution() {
    const [w, h] = els.resolution.value.split("x").map(Number);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      seedObjects();
    }
  }

  // ---------- Color utils ----------
  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function hslToRgb(h, s, l) {
    h /= 360;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
      const k = (n + h * 12) % 12;
      return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
  }
  function cycleColor(baseHex, t, on) {
    const c = hexToRgb(baseHex);
    if (!on) return c;
    // rotate hue over time
    const max = Math.max(c.r, c.g, c.b) / 255, min = Math.min(c.r, c.g, c.b) / 255;
    const l = (max + min) / 2;
    const shifted = hslToRgb((t * 60) % 360, 0.9, Math.max(0.4, l));
    return shifted;
  }
  const rgbStr = (c, a = 1) => `rgba(${c.r},${c.g},${c.b},${a})`;

  // ---------- Objects ----------
  let objects = [];
  let stars = [];
  function seedObjects() {
    rand = mulberry32(hashSeed(S.seed || "demoforge"));
    const w = canvas.width, h = canvas.height;
    objects = [];
    const n = S.count || 24;
    for (let i = 0; i < n; i++) {
      const ang = rand() * Math.PI * 2;
      objects.push({
        x: rand() * w,
        y: rand() * h,
        vx: Math.cos(ang) * (0.5 + rand()),
        vy: Math.sin(ang) * (0.5 + rand()),
        rot: rand() * Math.PI * 2,
        rotSpeed: (rand() - 0.5) * 0.06,
        radius: (0.4 + rand()) * 0.5,
        phase: rand() * Math.PI * 2,
        orbit: 40 + rand() * Math.min(w, h) * 0.4,
        shape: pickShape(),
        shapeIdx: Math.floor(rand() * SHAPES.length),
        hueOff: rand() * 360,
      });
    }
    // starfield
    stars = [];
    for (let i = 0; i < 220; i++) {
      stars.push({ x: rand() * w, y: rand() * h, z: rand(), tw: rand() * Math.PI * 2 });
    }
  }
  const SHAPES = ["square", "circle", "triangle", "star", "hexagon", "ring"];
  function pickShape() {
    if (S.shape && S.shape !== "random") return S.shape;
    return SHAPES[Math.floor(rand() * SHAPES.length)];
  }
  function shapeFor(o, t) {
    if (S.shapeCycle) {
      const idx = Math.floor(o.shapeIdx + t * S.shapeCycleSpeed) % SHAPES.length;
      return SHAPES[idx];
    }
    return o.shape;
  }

  // ---------- Shape drawing ----------
  function drawShape(g, shape, size) {
    const r = size / 2;
    g.beginPath();
    switch (shape) {
      case "square":
        g.rect(-r, -r, size, size);
        break;
      case "circle":
        g.arc(0, 0, r, 0, Math.PI * 2);
        break;
      case "ring":
        g.arc(0, 0, r, 0, Math.PI * 2);
        g.arc(0, 0, r * 0.55, 0, Math.PI * 2, true);
        break;
      case "triangle":
        for (let i = 0; i < 3; i++) {
          const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
          const x = Math.cos(a) * r, y = Math.sin(a) * r;
          i === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
        }
        g.closePath();
        break;
      case "hexagon":
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          const x = Math.cos(a) * r, y = Math.sin(a) * r;
          i === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
        }
        g.closePath();
        break;
      case "star":
        for (let i = 0; i < 10; i++) {
          const rr = i % 2 === 0 ? r : r * 0.45;
          const a = -Math.PI / 2 + (i * Math.PI) / 5;
          const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
          i === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
        }
        g.closePath();
        break;
    }
  }

  // ---------- Background ----------
  let plasmaBuf = null, plasmaImg = null;
  function drawBackground(g, w, h, t) {
    if (S.plasma) {
      drawPlasma(g, w, h, t);
      return;
    }
    if (S.bgGradient) {
      const grad = g.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, S.bgColor);
      grad.addColorStop(1, S.bgColor2);
      g.fillStyle = grad;
    } else {
      g.fillStyle = S.bgColor;
    }
    g.fillRect(0, 0, w, h);
  }

  function drawPlasma(g, w, h, t) {
    // low-res plasma scaled up for performance
    const pw = 160, ph = Math.round((160 * h) / w);
    if (!plasmaBuf || plasmaBuf.width !== pw || plasmaBuf.height !== ph) {
      plasmaBuf = Object.assign(document.createElement("canvas"), { width: pw, height: ph });
      plasmaImg = plasmaBuf.getContext("2d").createImageData(pw, ph);
    }
    const data = plasmaImg.data;
    const c1 = hexToRgb(S.bgColor), c2 = hexToRgb(S.bgColor2);
    for (let y = 0; y < ph; y++) {
      for (let x = 0; x < pw; x++) {
        const v =
          Math.sin(x * 0.06 + t) +
          Math.sin(y * 0.07 - t * 0.8) +
          Math.sin((x + y) * 0.05 + t * 1.3) +
          Math.sin(Math.hypot(x - pw / 2, y - ph / 2) * 0.08 - t);
        const m = (v + 4) / 8; // 0..1
        const i = (y * pw + x) * 4;
        data[i] = c1.r + (c2.r - c1.r) * m;
        data[i + 1] = c1.g + (c2.g - c1.g) * m;
        data[i + 2] = c1.b + (c2.b - c1.b) * m;
        data[i + 3] = 255;
      }
    }
    const pctx = plasmaBuf.getContext("2d");
    pctx.putImageData(plasmaImg, 0, 0);
    g.imageSmoothingEnabled = true;
    g.drawImage(plasmaBuf, 0, 0, w, h);
  }

  function drawStarfield(g, w, h, t) {
    g.save();
    for (const s of stars) {
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (0.5 + s.z) + s.tw));
      const size = 0.5 + s.z * 2;
      g.fillStyle = `rgba(255,255,255,${tw * (0.3 + s.z * 0.7)})`;
      g.fillRect(s.x, s.y, size, size);
    }
    g.restore();
  }

  // ---------- Grid ----------
  function drawGrid(g, w, h, t) {
    const gs = S.gridSize;
    const shift = S.gridAnim ? (t * 20) % gs : 0;
    const morph = S.gridAnim ? Math.sin(t) * gs * 0.15 : 0;
    const hue = S.gridAnim ? (t * 40) % 360 : 180;
    g.save();
    g.lineWidth = 1;
    g.strokeStyle = `hsla(${hue},80%,55%,0.22)`;
    g.beginPath();
    for (let x = -gs + shift; x <= w + gs; x += gs) {
      const off = S.gridAnim ? Math.sin(x * 0.02 + t) * morph : 0;
      g.moveTo(x + off, 0);
      g.lineTo(x - off, h);
    }
    for (let y = -gs + shift; y <= h + gs; y += gs) {
      const off = S.gridAnim ? Math.cos(y * 0.02 + t) * morph : 0;
      g.moveTo(0, y + off);
      g.lineTo(w, y - off);
    }
    g.stroke();
    g.restore();
  }

  // ---------- Motion update ----------
  function updateObjects(t, dt, level) {
    const w = canvas.width, h = canvas.height;
    const sp = S.speed * (1 + level * 1.5);
    for (const o of objects) {
      switch (S.movement) {
        case "still": break;
        case "rotate": o.rot += o.rotSpeed * (1 + sp); break;
        case "linear":
          o.x += o.vx * sp * 2;
          o.y += o.vy * sp * 2;
          if (o.x > w + 50) o.x = -50; if (o.x < -50) o.x = w + 50;
          if (o.y > h + 50) o.y = -50; if (o.y < -50) o.y = h + 50;
          o.rot += o.rotSpeed;
          break;
        case "bounce": {
          o.x += o.vx * sp * 3;
          o.y += o.vy * sp * 3;
          const r = (S.size * o.radius) / 2;
          if (o.x < r) { o.x = r; o.vx = Math.abs(o.vx); flash(o); }
          if (o.x > w - r) { o.x = w - r; o.vx = -Math.abs(o.vx); flash(o); }
          if (o.y < r) { o.y = r; o.vy = Math.abs(o.vy); flash(o); }
          if (o.y > h - r) { o.y = h - r; o.vy = -Math.abs(o.vy); flash(o); }
          o.rot += o.rotSpeed;
          break;
        }
        case "spiral": {
          o.phase += 0.01 * (1 + sp);
          o.x = w / 2 + Math.cos(o.phase + o.hueOff) * o.orbit;
          o.y = h / 2 + Math.sin(o.phase + o.hueOff) * o.orbit;
          o.rot += o.rotSpeed * 2;
          break;
        }
        case "wave": {
          o.x += o.vx * sp * 2;
          if (o.x > w + 50) o.x = -50;
          o.y = h / 2 + Math.sin(o.x * 0.01 + o.phase + t) * h * 0.3;
          o.rot += o.rotSpeed;
          break;
        }
        case "particles": {
          o.x += o.vx * sp * 4 + Math.sin(t + o.phase) * 0.5;
          o.y += o.vy * sp * 4 + Math.cos(t + o.phase) * 0.5;
          if (o.x > w) o.x = 0; if (o.x < 0) o.x = w;
          if (o.y > h) o.y = 0; if (o.y < 0) o.y = h;
          break;
        }
      }
    }
  }
  function flash(o) { o.flash = 1; }

  // ---------- Draw objects into a graphics ctx ----------
  function drawObjects(g, t, level) {
    const baseA = S.objAlpha;
    const spread = S.spread;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    for (const o of objects) {
      const pulse = S.pulse ? 1 + Math.sin(t * 4 + o.phase) * 0.4 + level * 0.6 : 1;
      const size = S.size * o.radius * (1 + level * 0.6) * pulse;
      // spread scales position around the center
      const px = cx + (o.x - cx) * spread;
      const py = cy + (o.y - cy) * spread;
      let c1 = cycleColor(S.objColor, t + o.hueOff / 90, S.colorCycle);
      let c2 = cycleColor(S.objColor2, t + o.hueOff / 90 + 1, S.colorCycle);
      g.save();
      g.translate(px, py);
      g.rotate(o.rot);
      if (S.glow) {
        g.shadowBlur = 18 + level * 30;
        g.shadowColor = rgbStr(c1, 1);
      }
      const grad = g.createLinearGradient(-size / 2, -size / 2, size / 2, size / 2);
      grad.addColorStop(0, rgbStr(c1, baseA));
      grad.addColorStop(1, rgbStr(c2, baseA));
      g.fillStyle = grad;
      if (o.flash) {
        g.fillStyle = `rgba(255,255,255,${o.flash})`;
        o.flash *= 0.8;
        if (o.flash < 0.05) o.flash = 0;
      }
      drawShape(g, shapeFor(o, t), size);
      g.fill("evenodd");
      if (S.outline) {
        g.lineWidth = S.outlineWidth;
        g.strokeStyle = rgbStr(c2, Math.min(1, baseA + 0.3));
        g.stroke();
      }
      g.restore();
    }
  }

  // ---------- Offscreen scene buffer (for kaleidoscope/distortion) ----------
  let sceneBuf = null, sctx = null;
  function ensureSceneBuf(w, h) {
    if (!sceneBuf || sceneBuf.width !== w || sceneBuf.height !== h) {
      sceneBuf = Object.assign(document.createElement("canvas"), { width: w, height: h });
      sctx = sceneBuf.getContext("2d");
    }
  }

  // ---------- Post effects ----------
  function applyKaleidoscope(g, w, h) {
    const slices = S.kaleidoSlices;
    const step = (Math.PI * 2) / slices;
    g.save();
    g.translate(w / 2, h / 2);
    const rad = Math.hypot(w, h) / 2;
    for (let i = 0; i < slices; i++) {
      g.save();
      g.rotate(i * step);
      if (i % 2 === 1) g.scale(1, -1);
      g.beginPath();
      g.moveTo(0, 0);
      g.arc(0, 0, rad, -step / 2, step / 2);
      g.closePath();
      g.clip();
      g.drawImage(sceneBuf, -w / 2, -h / 2);
      g.restore();
    }
    g.restore();
  }

  function applyDistortion(g, w, h, t) {
    ensureDistBuf(w, h);
    dctx.clearRect(0, 0, w, h);
    dctx.drawImage(sceneBuf, 0, 0);
    const strips = 60;
    const sh = h / strips;
    for (let i = 0; i < strips; i++) {
      const y = i * sh;
      const dx = Math.sin(y * 0.02 + t * 2) * 18;
      g.drawImage(distBuf, 0, y, w, sh, dx, y, w, sh);
    }
  }
  let distBuf = null, dctx = null;
  function ensureDistBuf(w, h) {
    if (!distBuf || distBuf.width !== w || distBuf.height !== h) {
      distBuf = Object.assign(document.createElement("canvas"), { width: w, height: h });
      dctx = distBuf.getContext("2d");
    }
  }

  function applyScanlines(g, w, h) {
    g.save();
    g.globalAlpha = 0.18;
    g.fillStyle = "#000";
    for (let y = 0; y < h; y += 3) g.fillRect(0, y, w, 1);
    g.restore();
  }

  function applyCRT(g, w, h) {
    const grad = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.7)");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  }

  // scratch buffer reused by post effects that read the main canvas
  let scratchBuf = null, scctx = null;
  function ensureScratch(w, h) {
    if (!scratchBuf || scratchBuf.width !== w || scratchBuf.height !== h) {
      scratchBuf = Object.assign(document.createElement("canvas"), { width: w, height: h });
      scctx = scratchBuf.getContext("2d");
    }
  }

  function applyPixelate(g, w, h) {
    const px = Math.max(2, S.pixelSize);
    const sw = Math.max(1, Math.round(w / px)), sh = Math.max(1, Math.round(h / px));
    ensureScratch(w, h);
    scctx.clearRect(0, 0, w, h);
    scctx.imageSmoothingEnabled = false;
    scctx.drawImage(canvas, 0, 0, w, h, 0, 0, sw, sh);
    g.imageSmoothingEnabled = false;
    g.drawImage(scratchBuf, 0, 0, sw, sh, 0, 0, w, h);
    g.imageSmoothingEnabled = true;
  }

  function applyChromatic(g, w, h, t) {
    ensureScratch(w, h);
    scctx.clearRect(0, 0, w, h);
    scctx.drawImage(canvas, 0, 0);
    const dx = 3 + Math.sin(t * 3) * 3;
    g.fillStyle = "#000";
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = "lighter";
    // red left, green center, blue right using channel tints
    tintDraw(g, scratchBuf, w, h, -dx, 0, "rgba(255,0,0,1)");
    tintDraw(g, scratchBuf, w, h, 0, 0, "rgba(0,255,0,1)");
    tintDraw(g, scratchBuf, w, h, dx, 0, "rgba(0,0,255,1)");
    g.globalCompositeOperation = "source-over";
  }
  let tintBuf = null, tctx = null;
  function tintDraw(g, src, w, h, ox, oy, tint) {
    if (!tintBuf || tintBuf.width !== w || tintBuf.height !== h) {
      tintBuf = Object.assign(document.createElement("canvas"), { width: w, height: h });
      tctx = tintBuf.getContext("2d");
    }
    tctx.globalCompositeOperation = "source-over";
    tctx.clearRect(0, 0, w, h);
    tctx.drawImage(src, 0, 0);
    tctx.globalCompositeOperation = "multiply";
    tctx.fillStyle = tint;
    tctx.fillRect(0, 0, w, h);
    tctx.globalCompositeOperation = "source-over";
    g.drawImage(tintBuf, ox, oy);
  }

  function applyInvert(g, w, h) {
    g.save();
    g.globalCompositeOperation = "difference";
    g.fillStyle = "#fff";
    g.fillRect(0, 0, w, h);
    g.restore();
  }

  function applyPosterize(g, w, h) {
    const img = g.getImageData(0, 0, w, h);
    const d = img.data;
    const levels = 5, step = 255 / (levels - 1);
    for (let i = 0; i < d.length; i += 4) {
      d[i] = Math.round(d[i] / step) * step;
      d[i + 1] = Math.round(d[i + 1] / step) * step;
      d[i + 2] = Math.round(d[i + 2] / step) * step;
    }
    g.putImageData(img, 0, 0);
  }

  function applyVHS(g, w, h, t) {
    g.save();
    const bands = 3;
    for (let b = 0; b < bands; b++) {
      const y = ((t * 120 + b * h / bands) % h);
      const bh = 6 + (b % 2) * 4;
      g.fillStyle = "rgba(255,255,255,0.06)";
      g.fillRect(0, y, w, bh);
      g.fillStyle = "rgba(0,0,0,0.10)";
      g.fillRect(0, y + bh, w, 2);
    }
    // occasional horizontal jitter line
    if (Math.random() > 0.85) {
      const y = Math.random() * h;
      g.fillStyle = "rgba(255,0,120,0.12)";
      g.fillRect(0, y, w, 2 + Math.random() * 4);
    }
    g.restore();
  }

  // ---------- Main render ----------
  function renderFrame(t, dt) {
    const w = canvas.width, h = canvas.height;
    const level = analyser ? getAudioLevel() : 0;

    updateObjects(t, dt, S.audioReactive ? level : 0);

    const camOn = S.camZoom > 0 || S.camRot > 0;
    const needsBuf = S.kaleidoscope || S.distortion || camOn;
    const g = needsBuf ? (ensureSceneBuf(w, h), sctx) : ctx;

    // trails: fade instead of clear
    if (S.trails && !needsBuf) {
      g.fillStyle = rgbStr(hexToRgb(S.bgColor), Math.max(0.04, 1 - S.trail));
      g.globalCompositeOperation = "source-over";
      g.fillRect(0, 0, w, h);
    } else {
      drawBackground(g, w, h, t);
    }

    if (S.starfield) drawStarfield(g, w, h, t);
    if (S.grid) drawGrid(g, w, h, t);

    const blendOp = S.blend === "auto" ? (S.glow ? "lighter" : "source-over") : S.blend;
    g.globalCompositeOperation = blendOp;
    drawObjects(g, t, S.audioReactive ? level : 0);
    g.globalCompositeOperation = "source-over";

    // composite buffer -> main canvas with camera + geometric post transforms
    if (needsBuf) {
      drawBackground(ctx, w, h, t);
      ctx.save();
      if (camOn) {
        const zoom = 1 + (Math.sin(t * 2) * 0.5 + 0.5) * S.camZoom * 0.6;
        const rot = Math.sin(t * 0.5) * S.camRot * 0.6;
        ctx.translate(w / 2, h / 2);
        ctx.scale(zoom, zoom);
        ctx.rotate(rot);
        ctx.translate(-w / 2, -h / 2);
      }
      if (S.kaleidoscope) applyKaleidoscope(ctx, w, h);
      else if (S.distortion) applyDistortion(ctx, w, h, t);
      else ctx.drawImage(sceneBuf, 0, 0);
      ctx.restore();
    }

    // ---- pixel / color post effects (read main canvas) ----
    if (S.pixelate) applyPixelate(ctx, w, h);
    if (S.chromatic) applyChromatic(ctx, w, h, t);
    if (S.invert) applyInvert(ctx, w, h);
    if (S.posterize) applyPosterize(ctx, w, h);

    // ---- overlays ----
    if (S.vhs) applyVHS(ctx, w, h, t);
    if (S.scanlines) applyScanlines(ctx, w, h);
    if (S.crt) applyCRT(ctx, w, h);
  }

  // ---------- Animation loop ----------
  let running = false, rafId = 0, lastTs = 0, clock = 0;
  function loop(ts) {
    if (!running) return;
    const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0);
    lastTs = ts;
    clock += dt;
    renderFrame(clock, dt);
    rafId = requestAnimationFrame(loop);
  }
  function start() {
    if (running) return;
    readState();
    applyResolution();
    running = true;
    lastTs = performance.now();
    rafId = requestAnimationFrame(loop);
    if (S.audioOn) startAudio();
    $("playBtn").textContent = "⏸ Pause";
    $("playBtn").classList.add("playing");
    setStatus("Playing.");
  }
  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
    stopAudio();
    $("playBtn").textContent = "▶ Play";
    $("playBtn").classList.remove("playing");
    setStatus("Paused.");
  }

  // =====================================================================
  //  AUDIO — WebAudio chiptune generator + analyser + FX chain
  // =====================================================================
  let actx = null, master = null, crusher = null, filter = null, masterOut = null;
  let delay = null, feedback = null, delayWet = null, analyser = null, freqData = null;
  let seqTimer = null, nextNoteTime = 0, stepN = 0;
  let audioRand = mulberry32(hashSeed("demoforge-audio"));
  let melody = [];

  const SCALES = {
    minor: [0, 2, 3, 5, 7, 8, 10],
    major: [0, 2, 4, 5, 7, 9, 11],
    pentatonic: [0, 3, 5, 7, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
  };
  function noteToFreq(semi) { return 220 * Math.pow(2, (semi + (S.root || 0)) / 12); }

  function ensureAudioCtx() {
    if (actx) return;
    actx = new (window.AudioContext || window.webkitAudioContext)();
    master = actx.createGain();
    crusher = actx.createWaveShaper();
    filter = actx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 8000;
    masterOut = actx.createGain();
    delay = actx.createDelay(1.0);
    feedback = actx.createGain(); feedback.gain.value = 0.35;
    delayWet = actx.createGain(); delayWet.gain.value = 0;
    analyser = actx.createAnalyser(); analyser.fftSize = 256;
    freqData = new Uint8Array(analyser.frequencyBinCount);
    // routing: master -> crusher -> filter -> (dry + delay) -> masterOut -> analyser -> out
    master.connect(crusher); crusher.connect(filter);
    filter.connect(masterOut);
    filter.connect(delay); delay.connect(delayWet); delayWet.connect(masterOut);
    delay.connect(feedback); feedback.connect(delay);
    masterOut.connect(analyser); analyser.connect(actx.destination);
  }

  function updateCrusher() {
    if (!crusher) return;
    const amt = S.bitcrush || 0;
    if (amt <= 0) { crusher.curve = null; return; }
    const bits = 8 - amt * 6;
    const levels = Math.max(2, Math.pow(2, bits));
    const n = 1024, curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1;
      curve[i] = Math.round((x * 0.5 + 0.5) * (levels - 1)) / (levels - 1) * 2 - 1;
    }
    crusher.curve = curve;
  }
  function updateAudioFX() {
    if (!actx) return;
    master.gain.value = S.vol;
    delay.delayTime.value = (60 / S.bpm) * 0.75;
    delayWet.gain.value = S.echo ? S.echoAmt : 0;
    updateCrusher();
  }

  function buildMelody() {
    const scale = SCALES[S.scale] || SCALES.pentatonic;
    melody = [];
    for (let i = 0; i < 32; i++) {
      const deg = scale[Math.floor(audioRand() * scale.length)];
      const oct = Math.floor(audioRand() * S.octave) * 12;
      melody.push(deg + oct);
    }
  }

  function startAudio() {
    ensureAudioCtx();
    if (actx.state === "suspended") actx.resume();
    audioRand = mulberry32(hashSeed((S.seed || "demoforge") + "-audio"));
    buildMelody();
    updateAudioFX();
    stepN = 0;
    nextNoteTime = actx.currentTime + 0.05;
    if (seqTimer) clearInterval(seqTimer);
    seqTimer = setInterval(scheduler, 25);
  }
  function stopAudio() {
    if (seqTimer) { clearInterval(seqTimer); seqTimer = null; }
  }
  function scheduler() {
    if (!actx) return;
    const steps = S.steps || 16;
    const secPerStep = 60 / S.bpm / 4;
    const baseCut = 200 + S.cutoff * 8000;
    const lfo = S.filterLfo > 0 ? (Math.sin(actx.currentTime * 2) * 0.5 + 0.5) * S.filterLfo * 6000 : 0;
    filter.frequency.setTargetAtTime(Math.max(90, baseCut + lfo), actx.currentTime, 0.03);
    while (nextNoteTime < actx.currentTime + 0.1) {
      const swing = stepN % 2 === 1 ? secPerStep * S.swing : 0;
      playStep(stepN, nextNoteTime + swing, secPerStep);
      nextNoteTime += secPerStep;
      stepN = (stepN + 1) % steps;
      if (S.evolve && audioRand() > 0.9) {
        const scale = SCALES[S.scale] || SCALES.pentatonic;
        melody[Math.floor(audioRand() * melody.length)] =
          scale[Math.floor(audioRand() * scale.length)] + Math.floor(audioRand() * S.octave) * 12;
      }
    }
  }
  function playStep(step, time, dur) {
    const scale = SCALES[S.scale] || SCALES.pentatonic;
    if (S.drums && step % 4 === 0) kick(time);
    if (S.snare && step % 8 === 4) snare(time);
    if (S.hats && step % 2 === 1) hat(time, 0.15);
    if (S.bass && step % 4 === 0) voice(noteToFreq(scale[0] - 12), time, dur * 3.5, "triangle", 0.5);
    if (S.pads && step % 8 === 0) {
      [0, 2, 4].forEach((i) => voice(noteToFreq(scale[i % scale.length]), time, dur * 8, "sawtooth", 0.06));
    }
    if (S.arpPattern !== "off") {
      const chord = [scale[0], scale[2 % scale.length], scale[4 % scale.length], scale[0] + 12];
      const sub = S.arpSpeed;
      for (let a = 0; a < sub; a++) {
        let idx;
        const p = step * sub + a;
        if (S.arpPattern === "up") idx = p % chord.length;
        else if (S.arpPattern === "down") idx = chord.length - 1 - (p % chord.length);
        else if (S.arpPattern === "updown") {
          const m = (chord.length - 1) * 2, q = p % m;
          idx = q < chord.length ? q : m - q;
        } else idx = Math.floor(audioRand() * chord.length);
        voice(noteToFreq(chord[idx] + 12), time + (a * dur) / sub, (dur / sub) * 0.9, "square", 0.12);
      }
    }
    if (audioRand() < S.density) {
      const semi = melody[step % melody.length];
      voice(noteToFreq(semi), time, dur * (audioRand() > 0.5 ? 1.5 : 0.9), S.waveform, 0.3);
    }
  }
  function voice(freq, time, dur, type, gain) {
    const osc = actx.createOscillator();
    const g = actx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    if (S.vibrato > 0) {
      const vib = actx.createOscillator(), vg = actx.createGain();
      vib.frequency.value = 5 + S.vibrato * 3;
      vg.gain.value = freq * 0.03 * S.vibrato;
      vib.connect(vg).connect(osc.frequency);
      vib.start(time); vib.stop(time + dur + 0.05);
    }
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(gain, time + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(g).connect(master);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }
  function kick(time) {
    const osc = actx.createOscillator();
    const g = actx.createGain();
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);
    g.gain.setValueAtTime(0.7, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
    osc.connect(g).connect(master);
    osc.start(time); osc.stop(time + 0.2);
  }
  function snare(time) {
    const bufSize = actx.sampleRate * 0.2;
    const buf = actx.createBuffer(1, bufSize, actx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 2);
    const src = actx.createBufferSource();
    src.buffer = buf;
    const bp = actx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 1800;
    const g = actx.createGain(); g.gain.value = 0.4;
    src.connect(bp).connect(g).connect(master);
    src.start(time);
    const osc = actx.createOscillator(), og = actx.createGain();
    osc.type = "triangle"; osc.frequency.setValueAtTime(180, time);
    og.gain.setValueAtTime(0.3, time);
    og.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    osc.connect(og).connect(master);
    osc.start(time); osc.stop(time + 0.14);
  }
  function hat(time, gain) {
    const bufSize = actx.sampleRate * 0.05;
    const buf = actx.createBuffer(1, bufSize, actx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const src = actx.createBufferSource();
    src.buffer = buf;
    const hp = actx.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = 7000;
    const g = actx.createGain();
    g.gain.value = gain;
    src.connect(hp).connect(g).connect(master);
    src.start(time);
  }
  function getAudioLevel() {
    if (!analyser) return 0;
    analyser.getByteFrequencyData(freqData);
    let sum = 0;
    for (let i = 0; i < freqData.length; i++) sum += freqData[i];
    return sum / freqData.length / 255;
  }

  // =====================================================================
  //  VIDEO EXPORT — MediaRecorder(canvas + audio)
  // =====================================================================
  let recorder = null, recChunks = [];
  function exportVideo() {
    if (recorder) return;
    readState();
    if (!running) start();
    ensureAudioCtx();
    if (S.audioOn && actx.state === "suspended") actx.resume();

    const canvasStream = canvas.captureStream(60);
    let stream = canvasStream;
    if (S.audioOn) {
      const dest = actx.createMediaStreamDestination();
      master.connect(dest);
      stream = new MediaStream([...canvasStream.getVideoTracks(), ...dest.stream.getAudioTracks()]);
    }

    const mime = pickMime();
    if (!mime) { setStatus("Recording not supported in this browser."); return; }
    recChunks = [];
    recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
    recorder.ondataavailable = (e) => { if (e.data.size) recChunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(recChunks, { type: mime });
      download(blob, `demoforge.${mime.includes("mp4") ? "mp4" : "webm"}`);
      recorder = null;
      $("recVideoBtn").classList.remove("recording");
      $("recVideoBtn").textContent = "● Export Video";
      $("recDot").hidden = true;
      setStatus("Video exported.");
    };
    recorder.start();
    $("recVideoBtn").classList.add("recording");
    $("recVideoBtn").textContent = "■ Stop";
    $("recDot").hidden = false;
    setStatus(`Recording ${S.dur}s…`);
    const stopAt = S.dur * 1000;
    const timer = setTimeout(() => { if (recorder && recorder.state === "recording") recorder.stop(); }, stopAt);
    // allow manual stop
    $("recVideoBtn").onclick = () => {
      clearTimeout(timer);
      if (recorder && recorder.state === "recording") recorder.stop();
    };
  }
  function pickMime() {
    const opts = [
      "video/mp4;codecs=avc1",
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ];
    return opts.find((m) => MediaRecorder.isTypeSupported(m)) || "";
  }

  // =====================================================================
  //  AUDIO EXPORT — offline render to WAV
  // =====================================================================
  async function exportAudio() {
    readState();
    setStatus("Rendering audio…");
    const dur = S.dur;
    const sr = 44100;
    const off = new OfflineAudioContext(2, sr * dur, sr);
    const om = off.createGain();
    om.gain.value = S.vol;
    // filter + optional echo mirror of the live chain
    const oFilter = off.createBiquadFilter();
    oFilter.type = "lowpass";
    oFilter.frequency.value = 200 + S.cutoff * 8000;
    const oOut = off.createGain();
    oFilter.connect(oOut);
    if (S.echo) {
      const oDelay = off.createDelay(1.0);
      oDelay.delayTime.value = (60 / S.bpm) * 0.75;
      const oFb = off.createGain(); oFb.gain.value = 0.35;
      const oWet = off.createGain(); oWet.gain.value = S.echoAmt;
      oFilter.connect(oDelay); oDelay.connect(oWet); oWet.connect(oOut);
      oDelay.connect(oFb); oFb.connect(oDelay);
    }
    oOut.connect(om);
    om.connect(off.destination);
    const bus = oFilter; // instruments connect here

    const scale = SCALES[S.scale] || SCALES.pentatonic;
    const arand = mulberry32(hashSeed((S.seed || "demoforge") + "-audio"));
    const secPerStep = 60 / S.bpm / 4;
    const nSteps = Math.ceil(dur / secPerStep);
    const patLen = S.steps || 16;
    // build melody (same as live)
    const mel = [];
    for (let i = 0; i < 32; i++) {
      mel.push(scale[Math.floor(arand() * scale.length)] + Math.floor(arand() * S.octave) * 12);
    }

    const oVoice = (freq, time, d, type, gain) => {
      if (time >= dur) return;
      const osc = off.createOscillator(), g = off.createGain();
      osc.type = type; osc.frequency.setValueAtTime(freq, time);
      g.gain.setValueAtTime(0, time);
      g.gain.linearRampToValueAtTime(gain, time + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, time + d);
      osc.connect(g).connect(bus); osc.start(time); osc.stop(time + d + 0.02);
    };
    const oKick = (time) => {
      if (time >= dur) return;
      const osc = off.createOscillator(), g = off.createGain();
      osc.frequency.setValueAtTime(140, time);
      osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);
      g.gain.setValueAtTime(0.7, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
      osc.connect(g).connect(bus); osc.start(time); osc.stop(time + 0.2);
    };
    const oNoise = (time, len, gain, type, freq) => {
      if (time >= dur) return;
      const bs = Math.floor(sr * len);
      const b = off.createBuffer(1, bs, sr), dd = b.getChannelData(0);
      for (let i = 0; i < bs; i++) dd[i] = (Math.random() * 2 - 1) * (1 - i / bs);
      const src = off.createBufferSource(); src.buffer = b;
      const f = off.createBiquadFilter(); f.type = type; f.frequency.value = freq;
      const g = off.createGain(); g.gain.value = gain;
      src.connect(f).connect(g).connect(bus); src.start(time);
    };

    for (let s = 0; s < nSteps; s++) {
      const swing = s % 2 === 1 ? secPerStep * S.swing : 0;
      const time = s * secPerStep + swing;
      const step = s % patLen;
      if (S.drums && step % 4 === 0) oKick(time);
      if (S.snare && step % 8 === 4) { oNoise(time, 0.2, 0.4, "bandpass", 1800); oVoice(180, time, 0.12, "triangle", 0.3); }
      if (S.hats && step % 2 === 1) oNoise(time, 0.05, 0.15, "highpass", 7000);
      if (S.bass && step % 4 === 0) oVoice(noteToFreq(scale[0] - 12), time, secPerStep * 3.5, "triangle", 0.5);
      if (S.pads && step % 8 === 0) {
        [0, 2, 4].forEach((i) => oVoice(noteToFreq(scale[i % scale.length]), time, secPerStep * 8, "sawtooth", 0.06));
      }
      if (S.arpPattern !== "off") {
        const chord = [scale[0], scale[2 % scale.length], scale[4 % scale.length], scale[0] + 12];
        const sub = S.arpSpeed;
        for (let a = 0; a < sub; a++) {
          let idx;
          const p = step * sub + a;
          if (S.arpPattern === "up") idx = p % chord.length;
          else if (S.arpPattern === "down") idx = chord.length - 1 - (p % chord.length);
          else if (S.arpPattern === "updown") { const m = (chord.length - 1) * 2, q = p % m; idx = q < chord.length ? q : m - q; }
          else idx = Math.floor(arand() * chord.length);
          oVoice(noteToFreq(chord[idx] + 12), time + (a * secPerStep) / sub, (secPerStep / sub) * 0.9, "square", 0.12);
        }
      }
      if (arand() < S.density) {
        oVoice(noteToFreq(mel[step % mel.length]), time, secPerStep * (arand() > 0.5 ? 1.5 : 0.9), S.waveform, 0.3);
      }
    }

    const buffer = await off.startRendering();
    const wav = audioBufferToWav(buffer);
    download(new Blob([wav], { type: "audio/wav" }), "demoforge.wav");
    setStatus("Audio exported (WAV).");
  }

  function audioBufferToWav(buffer) {
    const numCh = buffer.numberOfChannels, sr = buffer.sampleRate;
    const len = buffer.length * numCh * 2 + 44;
    const ab = new ArrayBuffer(len);
    const view = new DataView(ab);
    const chans = [];
    let offset = 0;
    const writeStr = (s) => { for (let i = 0; i < s.length; i++) view.setUint8(offset++, s.charCodeAt(i)); };
    const write32 = (v) => { view.setUint32(offset, v, true); offset += 4; };
    const write16 = (v) => { view.setUint16(offset, v, true); offset += 2; };
    writeStr("RIFF"); write32(len - 8); writeStr("WAVE");
    writeStr("fmt "); write32(16); write16(1); write16(numCh);
    write32(sr); write32(sr * numCh * 2); write16(numCh * 2); write16(16);
    writeStr("data"); write32(len - offset - 4);
    for (let c = 0; c < numCh; c++) chans.push(buffer.getChannelData(c));
    for (let i = 0; i < buffer.length; i++) {
      for (let c = 0; c < numCh; c++) {
        let s = Math.max(-1, Math.min(1, chans[c][i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        offset += 2;
      }
    }
    return ab;
  }

  // ---------- Download helper ----------
  function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  // =====================================================================
  //  PRESET save / load
  // =====================================================================
  function exportPreset() {
    readState();
    const preset = {};
    for (const k in els) {
      const el = els[k];
      preset[k] = el.type === "checkbox" ? el.checked : el.value;
    }
    preset.resolution = els.resolution.value;
    download(new Blob([JSON.stringify(preset, null, 2)], { type: "application/json" }), "demoforge-preset.json");
    setStatus("Preset saved.");
  }
  function importPreset(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const preset = JSON.parse(reader.result);
        for (const k in preset) {
          const el = els[k];
          if (!el) continue;
          if (el.type === "checkbox") el.checked = !!preset[k];
          else el.value = preset[k];
        }
        refreshReadouts();
        readState();
        applyWatermark();
        applyResolution();
        seedObjects();
        setStatus("Preset loaded.");
      } catch (e) {
        setStatus("Invalid preset file.");
      }
    };
    reader.readAsText(file);
  }

  // =====================================================================
  //  RANDOMIZE
  // =====================================================================
  function randomize() {
    const r = () => Math.random();
    const pick = (arr) => arr[Math.floor(r() * arr.length)];
    els.shape.value = pick(["random", "square", "circle", "triangle", "star", "hexagon", "ring"]);
    els.movement.value = pick(["still", "rotate", "linear", "bounce", "spiral", "wave", "particles"]);
    els.count.value = Math.floor(4 + r() * 120);
    els.size.value = Math.floor(10 + r() * 120);
    els.speed.value = Math.floor(20 + r() * 300);
    els.shapeCycleSpeed.value = Math.floor(5 + r() * 80);
    els.spread.value = Math.floor(60 + r() * 120);
    els.objColor.value = randHex();
    els.objColor2.value = randHex();
    els.objAlpha.value = Math.floor(40 + r() * 60);
    els.bgColor.value = randDark();
    els.bgColor2.value = randDark();
    els.gridSize.value = Math.floor(16 + r() * 100);
    els.kaleidoSlices.value = Math.floor(2 + r() * 12);
    els.trail.value = Math.floor(5 + r() * 60);
    els.outlineWidth.value = Math.floor(1 + r() * 8);
    els.blend.value = pick(["auto", "lighter", "screen", "difference", "exclusion", "overlay", "hard-light"]);
    els.pixelSize.value = Math.floor(3 + r() * 20);
    els.camZoom.value = r() > 0.6 ? Math.floor(r() * 60) : 0;
    els.camRot.value = r() > 0.6 ? Math.floor(r() * 50) : 0;
    // random visual/effect toggles
    [els.bgGradient, els.grid, els.gridAnim, els.colorCycle, els.glow, els.scanlines,
     els.crt, els.plasma, els.kaleidoscope, els.trails, els.distortion, els.shapeCycle,
     els.pulse, els.outline, els.starfield, els.chromatic, els.pixelate, els.invert,
     els.posterize, els.vhs, els.audioReactive]
      .forEach((c) => { c.checked = r() > 0.5; });
    // audio
    els.bpm.value = Math.floor(80 + r() * 100);
    els.scale.value = pick(["minor", "major", "pentatonic", "phrygian"]);
    els.waveform.value = pick(["square", "sawtooth", "triangle", "sine"]);
    els.root.value = String(Math.floor(r() * 12));
    els.steps.value = pick([8, 12, 16, 16, 24, 32]);
    els.density.value = Math.floor(30 + r() * 60);
    els.octave.value = Math.floor(1 + r() * 3);
    els.arpPattern.value = pick(["off", "up", "down", "updown", "random"]);
    els.arpSpeed.value = Math.floor(1 + r() * 3);
    els.swing.value = r() > 0.5 ? Math.floor(r() * 60) : 0;
    els.cutoff.value = Math.floor(30 + r() * 70);
    els.filterLfo.value = r() > 0.5 ? Math.floor(r() * 80) : 0;
    els.vibrato.value = r() > 0.6 ? Math.floor(r() * 60) : 0;
    els.bitcrush.value = r() > 0.7 ? Math.floor(r() * 60) : 0;
    els.echoAmt.value = Math.floor(10 + r() * 60);
    [els.drums, els.snare, els.hats, els.bass].forEach((c) => (c.checked = r() > 0.25));
    [els.pads, els.evolve, els.echo].forEach((c) => (c.checked = r() > 0.5));
    els.seed.value = Math.random().toString(36).slice(2, 9);
    refreshReadouts();
    readState();
    seedObjects();
    if (running && S.audioOn) startAudio();
    setStatus("Randomized.");
  }
  function randHex() {
    const c = hslToRgb(Math.random() * 360, 0.9, 0.55);
    return "#" + [c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, "0")).join("");
  }
  function randDark() {
    const c = hslToRgb(Math.random() * 360, 0.8, 0.08 + Math.random() * 0.1);
    return "#" + [c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, "0")).join("");
  }

  // ---------- Watermark & live preview ----------
  function applyWatermark() {
    watermarkEl.classList.toggle("hidden", els.removeWatermark.checked);
  }
  function applyLivePreview() {
    canvas.style.opacity = els.livePreview.checked ? "1" : "1";
  }

  function setStatus(msg) { statusEl.textContent = msg; }

  // =====================================================================
  //  WIRING
  // =====================================================================
  // Collapsible groups
  document.querySelectorAll(".group-head").forEach((btn) => {
    btn.addEventListener("click", () => {
      const g = btn.closest(".group");
      const open = g.getAttribute("data-open") === "true";
      g.setAttribute("data-open", String(!open));
      btn.setAttribute("aria-expanded", String(!open));
    });
  });

  // Live binding of every control -> state
  Object.values(els).forEach((el) => {
    const evt = el.type === "range" ? "input" : "change";
    el.addEventListener(evt, () => {
      refreshReadouts();
      readState();
      if (el === els.resolution) applyResolution();
      if (el === els.count || el === els.seed) seedObjects();
      if (el === els.seed) applySeedEasterEgg(els.seed.value);
      if (el === els.removeWatermark) applyWatermark();
      if (el === els.livePreview) applyLivePreview();
      if (el === els.chaos) applyChaos();
      if ([els.vol, els.cutoff, els.filterLfo, els.echo, els.echoAmt, els.bitcrush, els.bpm].includes(el)) updateAudioFX();
      if (el === els.audioOn) { if (S.audioOn && running) startAudio(); else if (!S.audioOn) stopAudio(); }
    });
  });

  // Buttons
  $("playBtn").addEventListener("click", () => (running ? stop() : start()));
  $("randomBtn").addEventListener("click", randomize);
  $("recVideoBtn").addEventListener("click", exportVideo);
  $("recAudioBtn").addEventListener("click", exportAudio);
  $("exportJsonBtn").addEventListener("click", exportPreset);
  $("importJsonBtn").addEventListener("click", () => $("importFile").click());
  $("importFile").addEventListener("change", (e) => { if (e.target.files[0]) importPreset(e.target.files[0]); });

  // =====================================================================
  //  EASTER EGGS
  // =====================================================================
  // 1) Secret seed keywords -> instant palettes / presets
  const SEED_EGGS = {
    matrix: { objColor: "#00ff41", objColor2: "#003b00", bgColor: "#000000", bgColor2: "#001a00",
      shape: "square", movement: "linear", colorCycle: false, glow: true, scanlines: true, grid: false, msg: "wake up…" },
    vaporwave: { objColor: "#ff71ce", objColor2: "#01cdfe", bgColor: "#2d0036", bgColor2: "#05ffa1",
      shape: "triangle", movement: "wave", plasma: true, colorCycle: true, glow: true, msg: "A E S T H E T I C" },
    c64: { objColor: "#6c5eb5", objColor2: "#a0a0ff", bgColor: "#40318d", bgColor2: "#40318d",
      shape: "square", movement: "bounce", grid: false, scanlines: true, colorCycle: false, msg: "READY. ▮" },
    amiga: { objColor: "#ff8800", objColor2: "#0088ff", bgColor: "#000033", bgColor2: "#000000",
      shape: "circle", movement: "spiral", plasma: true, kaleidoscope: true, glow: true, msg: "Only Amiga makes it possible." },
    rainbow: { colorCycle: true, glow: true, shapeCycle: true, kaleidoscope: true, movement: "spiral",
      msg: "🌈 taste the rainbow" },
    demo: { glow: true, plasma: true, kaleidoscope: true, scanlines: true, crt: true, colorCycle: true,
      shapeCycle: true, movement: "spiral", msg: "greetz to all sceners! ✌" },
  };
  function applySeedEasterEgg(seed) {
    const egg = SEED_EGGS[(seed || "").trim().toLowerCase()];
    if (!egg) return;
    for (const k in egg) {
      if (k === "msg") continue;
      const el = els[k];
      if (!el) continue;
      if (el.type === "checkbox") el.checked = !!egg[k];
      else el.value = egg[k];
    }
    refreshReadouts();
    readState();
    seedObjects();
    if (running && S.audioOn) startAudio();
    setStatus("✦ secret unlocked: " + egg.msg);
  }

  // 2) Konami code -> HYPERDRIVE party mode
  const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let konamiIdx = 0;
  let hyperdrive = false;
  function toggleHyperdrive() {
    hyperdrive = !hyperdrive;
    document.getElementById("app").classList.toggle("hyperdrive", hyperdrive);
    if (hyperdrive) {
      els.glow.checked = true; els.colorCycle.checked = true; els.kaleidoscope.checked = true;
      els.shapeCycle.checked = true; els.trails.checked = true;
      els.speed.value = 400; els.count.value = 120; els.bpm.value = 175;
      els.arpPattern.value = "updown"; els.arpSpeed.value = 4;
      refreshReadouts(); readState(); seedObjects();
      if (running && S.audioOn) startAudio();
      setStatus("⚡⚡ HYPERDRIVE ENGAGED ⚡⚡");
      if (!running) start();
    } else {
      setStatus("Hyperdrive off.");
    }
  }

  // 3) Click the logo 5× to reveal CHAOS MODE
  let logoClicks = 0;
  const logoEl = document.querySelector(".logo");
  if (logoEl) {
    logoEl.addEventListener("click", () => {
      logoClicks++;
      if (logoClicks === 5) {
        document.getElementById("chaosCtl").classList.add("revealed");
        setStatus("⚡ CHAOS MODE unlocked in ADVANCED ⚡");
      } else if (logoClicks < 5) {
        setStatus(`${5 - logoClicks} more…`);
      }
    });
  }

  // CHAOS mode: randomize everything continuously while enabled
  let chaosTimer = null;
  function applyChaos() {
    if (S.chaos) {
      if (!running) start();
      if (chaosTimer) clearInterval(chaosTimer);
      chaosTimer = setInterval(randomize, 2000);
      setStatus("⚡ CHAOS unleashed — reroute every 2s");
    } else if (chaosTimer) {
      clearInterval(chaosTimer); chaosTimer = null;
      setStatus("Chaos contained.");
    }
  }

  // Keyboard
  window.addEventListener("keydown", (e) => {
    // Konami works even when focused elsewhere
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === KONAMI[konamiIdx].toLowerCase()) {
      konamiIdx++;
      if (konamiIdx === KONAMI.length) { konamiIdx = 0; toggleHyperdrive(); }
    } else {
      konamiIdx = key === KONAMI[0].toLowerCase() ? 1 : 0;
    }
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
    if (e.code === "Space") { e.preventDefault(); running ? stop() : start(); }
    if (e.key === "r" || e.key === "R") randomize();
  });

  // ---------- Init ----------
  refreshReadouts();
  readState();
  applyResolution();
  applyWatermark();
  applyLivePreview();
  seedObjects();
  renderFrame(0, 0); // draw first frame
  setStatus("Ready. Press ▶ Play or Space.");
})();
