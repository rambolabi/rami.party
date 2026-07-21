/* ==========================================================================
   Loregate — ambient weather layer (v3)
   A lightweight canvas particle system shared by both screens. Supports
   rain, snow, hail, mist, fog, thunder, sun, heat, cold and embers, can be
   masked to skip excluded cells, and pauses when animations are off.
   ========================================================================== */
(function (global) {
    'use strict';

    function initAmbient(canvas, getMode, animationsOn, getBlocked) {
        const ctx = canvas.getContext('2d');
        let w = 0, h = 0, particles = [], mode = 'none', raf = null;
        let flash = 0, nextFlash = 0;
        getBlocked = getBlocked || (() => null);

        function resize() {
            const rect = canvas.getBoundingClientRect();
            w = canvas.width = Math.max(1, rect.width);
            h = canvas.height = Math.max(1, rect.height);
            seed();
        }

        function count() {
            switch (mode) {
                case 'fog': return 20;
                case 'mist': return 14;
                case 'embers': return 45;
                case 'sun': return 26;
                case 'heat': return 24;
                case 'cold': return 70;
                case 'hail': return 90;
                default: return 130;
            }
        }
        function seed() { particles = []; for (let i = 0; i < count(); i++) particles.push(spawn()); }

        function spawn() {
            const R = Math.random;
            switch (mode) {
                case 'snow': return { x: R() * w, y: R() * h, r: 1 + R() * 2.5, sp: .3 + R() * .8, dx: (R() - .5) * .4 };
                case 'hail': return { x: R() * w, y: R() * h, r: 1.4 + R() * 2, sp: 5 + R() * 5, dx: (R() - .5) * .6 };
                case 'embers': return { x: R() * w, y: h + R() * h, r: .6 + R() * 1.8, sp: .3 + R() * 1, dx: (R() - .5) * .5, life: R() };
                case 'sun': return { x: R() * w, y: R() * h, r: 1 + R() * 3, sp: .15 + R() * .3, dx: .1 + R() * .2, tw: R() * 6.28 };
                case 'heat': return { x: R() * w, y: h + R() * 40, r: 10 + R() * 30, sp: .4 + R() * .8, ph: R() * 6.28 };
                case 'cold': return { x: R() * w, y: R() * h, r: .5 + R() * 1.4, sp: .15 + R() * .4, dx: (R() - .5) * .3, tw: R() * 6.28 };
                case 'fog':
                case 'mist': return { x: R() * w, y: R() * h, r: 55 + R() * 120, sp: .08 + R() * .22 };
                default: return { x: R() * w, y: R() * h, len: 8 + R() * 14, sp: 6 + R() * 6, dx: -1.2 }; // rain / thunder
            }
        }

        function blockedAt(x, y) {
            const m = getBlocked();
            if (!m || !m.blocked || !m.blocked.size) return false;
            const c = Math.floor(x / w * m.cols), r = Math.floor(y / h * m.rows);
            return m.blocked.has(c + ',' + r);
        }

        function step() {
            ctx.clearRect(0, 0, w, h);
            const rain = mode === 'rain' || mode === 'thunder';

            if (mode === 'sun') { ctx.fillStyle = 'rgba(255,220,120,0.05)'; ctx.fillRect(0, 0, w, h); }
            else if (mode === 'heat') { ctx.fillStyle = 'rgba(255,150,60,0.04)'; ctx.fillRect(0, 0, w, h); }
            else if (mode === 'cold') { ctx.fillStyle = 'rgba(150,200,255,0.05)'; ctx.fillRect(0, 0, w, h); }

            if (rain) {
                ctx.strokeStyle = 'rgba(150,190,230,0.35)'; ctx.lineWidth = 1.1;
                particles.forEach((p) => {
                    if (!blockedAt(p.x, p.y)) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.dx * 3, p.y + p.len); ctx.stroke(); }
                    p.y += p.sp * 2; p.x += p.dx;
                    if (p.y > h) { p.y = -p.len; p.x = Math.random() * w; }
                });
                if (mode === 'thunder') {
                    if (performance.now() > nextFlash) { flash = 1; nextFlash = performance.now() + 2500 + Math.random() * 5000; }
                    if (flash > 0) { ctx.fillStyle = `rgba(220,230,255,${flash * 0.5})`; ctx.fillRect(0, 0, w, h); flash -= 0.04; }
                }
            } else if (mode === 'snow') {
                ctx.fillStyle = 'rgba(255,255,255,0.85)';
                particles.forEach((p) => {
                    if (!blockedAt(p.x, p.y)) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }
                    p.y += p.sp; p.x += Math.sin(p.y / 40) * .5 + p.dx;
                    if (p.y > h) { p.y = -4; p.x = Math.random() * w; }
                });
            } else if (mode === 'hail') {
                ctx.fillStyle = 'rgba(225,240,255,0.9)';
                particles.forEach((p) => {
                    if (!blockedAt(p.x, p.y)) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }
                    p.y += p.sp; p.x += p.dx;
                    if (p.y > h) { p.y = -4; p.x = Math.random() * w; }
                });
            } else if (mode === 'embers') {
                particles.forEach((p) => {
                    p.life += 0.008;
                    const a = Math.max(0, Math.sin(p.life * Math.PI));
                    if (!blockedAt(p.x, p.y)) { ctx.fillStyle = `rgba(255,${140 + Math.floor(80 * a)},60,${a * 0.8})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }
                    p.y -= p.sp; p.x += p.dx * Math.sin(p.y / 30);
                    if (p.y < -4 || p.life > 1) Object.assign(p, spawn(), { y: h + 4, life: 0 });
                });
            } else if (mode === 'sun') {
                particles.forEach((p) => {
                    p.tw += 0.03;
                    const a = 0.3 + 0.3 * Math.sin(p.tw);
                    if (!blockedAt(p.x, p.y)) { ctx.fillStyle = `rgba(255,235,160,${a})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }
                    p.x += p.sp; p.y -= p.dx * .2;
                    if (p.x > w + 4) { p.x = -4; p.y = Math.random() * h; }
                });
            } else if (mode === 'heat') {
                particles.forEach((p) => {
                    p.ph += 0.05;
                    const x = p.x + Math.sin(p.ph) * 8;
                    if (!blockedAt(x, p.y)) {
                        const g = ctx.createRadialGradient(x, p.y, 0, x, p.y, p.r);
                        g.addColorStop(0, 'rgba(255,180,90,0.09)'); g.addColorStop(1, 'rgba(255,180,90,0)');
                        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, p.y, p.r, 0, 6.283); ctx.fill();
                    }
                    p.y -= p.sp;
                    if (p.y + p.r < 0) { p.y = h + p.r; p.x = Math.random() * w; }
                });
            } else if (mode === 'cold') {
                particles.forEach((p) => {
                    p.tw += 0.04;
                    const a = 0.4 + 0.4 * Math.sin(p.tw);
                    if (!blockedAt(p.x, p.y)) { ctx.fillStyle = `rgba(200,230,255,${a})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }
                    p.y += p.sp; p.x += p.dx;
                    if (p.y > h) { p.y = -3; p.x = Math.random() * w; }
                });
            } else if (mode === 'fog' || mode === 'mist') {
                const alpha = mode === 'fog' ? 0.11 : 0.06;
                particles.forEach((p) => {
                    if (!blockedAt(p.x, p.y)) {
                        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
                        g.addColorStop(0, `rgba(205,212,225,${alpha})`); g.addColorStop(1, 'rgba(205,212,225,0)');
                        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
                    }
                    p.x += p.sp;
                    if (p.x - p.r > w) { p.x = -p.r; p.y = Math.random() * h; }
                });
            }
            raf = requestAnimationFrame(step);
        }

        function stop() { if (raf) cancelAnimationFrame(raf); raf = null; ctx.clearRect(0, 0, w, h); }

        function sync() {
            const next = getMode() || 'none';
            const on = animationsOn();
            canvas.style.display = (next === 'none' || !on) ? 'none' : 'block';
            if (next === 'none' || !on) { stop(); mode = 'none'; return; }
            if (next !== mode) { mode = next; resize(); }
            if (!raf) step();
        }

        window.addEventListener('resize', () => { if (mode !== 'none') resize(); });
        return { sync };
    }

    global.LoregateAmbient = { init: initAmbient };
})(window);
