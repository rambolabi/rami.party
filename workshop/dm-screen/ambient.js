/* ==========================================================================
   Loregate — ambient weather layer (v4)
   Renders several weather types at once, each confined to the cells that use
   it. The DM can paint different weather onto different blocks. Pauses when
   animations are off.
   Model: getModel() -> { cols, rows, at(c,r)->type, types:[...] }
   ========================================================================== */
(function (global) {
    'use strict';

    function initAmbient(canvas, getModel, animationsOn) {
        const ctx = canvas.getContext('2d');
        let w = 0, h = 0, pools = {}, typesKey = '', raf = null, model = null;
        let flash = 0, nextFlash = 0;

        function cellType(x, y) {
            if (!model) return 'none';
            const c = Math.floor(x / w * model.cols), r = Math.floor(y / h * model.rows);
            return model.at(c, r);
        }

        function baseCount(type) {
            switch (type) {
                case 'fog': return 16;
                case 'mist': return 12;
                case 'embers': return 36;
                case 'sun': return 22;
                case 'heat': return 20;
                case 'cold': return 56;
                case 'hail': return 70;
                default: return 95; // rain / thunder / snow
            }
        }
        function spawn(type) {
            const R = Math.random;
            switch (type) {
                case 'snow': return { x: R() * w, y: R() * h, r: 1 + R() * 2.5, sp: .3 + R() * .8, dx: (R() - .5) * .4 };
                case 'hail': return { x: R() * w, y: R() * h, r: 1.4 + R() * 2, sp: 5 + R() * 5, dx: (R() - .5) * .6 };
                case 'embers': return { x: R() * w, y: h + R() * h, r: .6 + R() * 1.8, sp: .3 + R() * 1, dx: (R() - .5) * .5, life: R() };
                case 'sun': return { x: R() * w, y: R() * h, r: 1 + R() * 3, sp: .15 + R() * .3, dx: .1 + R() * .2, tw: R() * 6.28 };
                case 'heat': return { x: R() * w, y: h + R() * 40, r: 10 + R() * 30, sp: .4 + R() * .8, ph: R() * 6.28 };
                case 'cold': return { x: R() * w, y: R() * h, r: .5 + R() * 1.4, sp: .15 + R() * .4, dx: (R() - .5) * .3, tw: R() * 6.28 };
                case 'fog':
                case 'mist': return { x: R() * w, y: R() * h, r: 55 + R() * 120, sp: .08 + R() * .22 };
                default: return { x: R() * w, y: R() * h, len: 8 + R() * 14, sp: 6 + R() * 6, dx: -1.2 };
            }
        }
        function seedAll() {
            Object.keys(pools).forEach((t) => { pools[t] = []; const n = baseCount(t); for (let i = 0; i < n; i++) pools[t].push(spawn(t)); });
        }
        function ensurePools(types) {
            const key = types.slice().sort().join(',');
            if (key === typesKey) return;
            typesKey = key; pools = {};
            types.forEach((t) => { pools[t] = []; });
            seedAll();
        }
        function resize() {
            const rect = canvas.getBoundingClientRect();
            w = canvas.width = Math.max(1, rect.width);
            h = canvas.height = Math.max(1, rect.height);
            seedAll();
        }

        function drawType(type, arr) {
            if (type === 'rain' || type === 'thunder') {
                ctx.strokeStyle = 'rgba(150,190,230,0.35)'; ctx.lineWidth = 1.1;
                arr.forEach((p) => {
                    if (cellType(p.x, p.y) === type) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.dx * 3, p.y + p.len); ctx.stroke(); }
                    p.y += p.sp * 2; p.x += p.dx;
                    if (p.y > h) { p.y = -p.len; p.x = Math.random() * w; }
                });
            } else if (type === 'snow') {
                ctx.fillStyle = 'rgba(255,255,255,0.85)';
                arr.forEach((p) => {
                    if (cellType(p.x, p.y) === type) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }
                    p.y += p.sp; p.x += Math.sin(p.y / 40) * .5 + p.dx;
                    if (p.y > h) { p.y = -4; p.x = Math.random() * w; }
                });
            } else if (type === 'hail') {
                ctx.fillStyle = 'rgba(225,240,255,0.9)';
                arr.forEach((p) => {
                    if (cellType(p.x, p.y) === type) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }
                    p.y += p.sp; p.x += p.dx;
                    if (p.y > h) { p.y = -4; p.x = Math.random() * w; }
                });
            } else if (type === 'embers') {
                arr.forEach((p) => {
                    p.life += 0.008;
                    const a = Math.max(0, Math.sin(p.life * Math.PI));
                    if (cellType(p.x, p.y) === type) { ctx.fillStyle = `rgba(255,${140 + Math.floor(80 * a)},60,${a * 0.8})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }
                    p.y -= p.sp; p.x += p.dx * Math.sin(p.y / 30);
                    if (p.y < -4 || p.life > 1) Object.assign(p, spawn(type), { y: h + 4, life: 0 });
                });
            } else if (type === 'sun') {
                arr.forEach((p) => {
                    p.tw += 0.03; const a = 0.3 + 0.3 * Math.sin(p.tw);
                    if (cellType(p.x, p.y) === type) { ctx.fillStyle = `rgba(255,235,160,${a})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }
                    p.x += p.sp;
                    if (p.x > w + 4) { p.x = -4; p.y = Math.random() * h; }
                });
            } else if (type === 'heat') {
                arr.forEach((p) => {
                    p.ph += 0.05; const x = p.x + Math.sin(p.ph) * 8;
                    if (cellType(x, p.y) === type) {
                        const g = ctx.createRadialGradient(x, p.y, 0, x, p.y, p.r);
                        g.addColorStop(0, 'rgba(255,180,90,0.09)'); g.addColorStop(1, 'rgba(255,180,90,0)');
                        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, p.y, p.r, 0, 6.283); ctx.fill();
                    }
                    p.y -= p.sp;
                    if (p.y + p.r < 0) { p.y = h + p.r; p.x = Math.random() * w; }
                });
            } else if (type === 'cold') {
                arr.forEach((p) => {
                    p.tw += 0.04; const a = 0.4 + 0.4 * Math.sin(p.tw);
                    if (cellType(p.x, p.y) === type) { ctx.fillStyle = `rgba(200,230,255,${a})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }
                    p.y += p.sp; p.x += p.dx;
                    if (p.y > h) { p.y = -3; p.x = Math.random() * w; }
                });
            } else if (type === 'fog' || type === 'mist') {
                const alpha = type === 'fog' ? 0.11 : 0.06;
                arr.forEach((p) => {
                    if (cellType(p.x, p.y) === type) {
                        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
                        g.addColorStop(0, `rgba(205,212,225,${alpha})`); g.addColorStop(1, 'rgba(205,212,225,0)');
                        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
                    }
                    p.x += p.sp;
                    if (p.x - p.r > w) { p.x = -p.r; p.y = Math.random() * h; }
                });
            }
        }

        function step() {
            ctx.clearRect(0, 0, w, h);
            Object.keys(pools).forEach((t) => drawType(t, pools[t]));
            if (pools.thunder) {
                if (performance.now() > nextFlash) { flash = 1; nextFlash = performance.now() + 2500 + Math.random() * 5000; }
                if (flash > 0) { ctx.fillStyle = `rgba(220,230,255,${flash * 0.45})`; ctx.fillRect(0, 0, w, h); flash -= 0.04; }
            }
            raf = requestAnimationFrame(step);
        }
        function stop() { if (raf) cancelAnimationFrame(raf); raf = null; ctx.clearRect(0, 0, w, h); }

        function sync() {
            model = getModel();
            const types = (model && model.types || []).filter((t) => t && t !== 'none');
            const on = animationsOn();
            if (!types.length || !on) { canvas.style.display = 'none'; stop(); pools = {}; typesKey = ''; return; }
            canvas.style.display = 'block';
            if (!w || !h) resize();
            ensurePools(types);
            if (!raf) step();
        }

        window.addEventListener('resize', () => { if (Object.keys(pools).length) resize(); });
        return { sync };
    }

    global.LoregateAmbient = { init: initAmbient };
})(window);
