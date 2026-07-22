// tileeditor.js — interactive editor for a custom self-tiling tessellation tile.
// The user drags the TOP and LEFT edges of a square; the opposite edges mirror by
// translation, so every piece interlocks (the "Connecting Cats" principle).

const $ = (s) => document.querySelector(s);

// Build the closed tile boundary (unit space) from interior edge points.
export function buildTileBoundary(eh, ev) {
    const H = [...eh].sort((a, b) => a.t - b.t);
    const V = [...ev].sort((a, b) => a.t - b.t);
    const pts = [{ x: 0, y: 0 }];
    for (const p of H) pts.push({ x: p.t, y: p.o });
    pts.push({ x: 1, y: 0 });
    for (const p of V) pts.push({ x: 1 + p.o, y: p.t });            // right = left + (1,0)
    pts.push({ x: 1, y: 1 });
    for (let i = H.length - 1; i >= 0; i--) pts.push({ x: H[i].t, y: H[i].o + 1 }); // bottom = top + (0,1)
    pts.push({ x: 0, y: 1 });
    for (let i = V.length - 1; i >= 0; i--) pts.push({ x: V[i].o, y: V[i].t });     // left
    return pts;
}

export function openTileEditor(initial, onApply) {
    const modal = $('#tile-modal');
    const canvas = $('#tile-canvas');
    const ctx = canvas.getContext('2d');
    let eh = (initial.edgeH || []).map((p) => ({ t: p.t, o: p.o }));
    let ev = (initial.edgeV || []).map((p) => ({ t: p.t, o: p.o }));
    let handles = [];
    let drag = null;
    let CW = 0, CH = 0, S = 0, ox = 0, oy = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    function resize() {
        const r = canvas.getBoundingClientRect();
        CW = r.width; CH = r.height;
        canvas.width = Math.round(CW * dpr); canvas.height = Math.round(CH * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        S = Math.min(CW, CH) * 0.5;
        ox = CW / 2 - S / 2; oy = CH / 2 - S / 2;
        draw();
    }
    const u2s = (x, y) => ({ X: ox + x * S, Y: oy + y * S });
    const s2u = (sx, sy) => ({ x: (sx - ox) / S, y: (sy - oy) / S });

    function strokePoly(pts, close) {
        ctx.beginPath();
        pts.forEach((p, i) => { const s = u2s(p.x, p.y); i === 0 ? ctx.moveTo(s.X, s.Y) : ctx.lineTo(s.X, s.Y); });
        if (close) ctx.closePath();
        ctx.stroke();
    }

    function draw() {
        ctx.clearRect(0, 0, CW, CH);
        const boundary = buildTileBoundary(eh, ev);
        // tessellation preview (3×3) — shows the interlock
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(168,85,247,0.30)';
        for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
            if (i === 0 && j === 0) continue;
            strokePoly(boundary.map((p) => ({ x: p.x + i, y: p.y + j })), true);
        }
        // the tile itself
        ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(236,233,255,0.9)';
        strokePoly(boundary, true);
        // editable edges highlighted
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#22d3ee';
        strokePoly([{ x: 0, y: 0 }, ...[...eh].sort((a, b) => a.t - b.t).map((p) => ({ x: p.t, y: p.o })), { x: 1, y: 0 }], false);
        ctx.strokeStyle = '#a855f7';
        strokePoly([{ x: 0, y: 0 }, ...[...ev].sort((a, b) => a.t - b.t).map((p) => ({ x: p.o, y: p.t })), { x: 0, y: 1 }], false);
        // corners (fixed)
        ctx.fillStyle = '#6b6b8a';
        for (const c of [[0, 0], [1, 0], [1, 1], [0, 1]]) { const s = u2s(c[0], c[1]); ctx.beginPath(); ctx.arc(s.X, s.Y, 3, 0, 7); ctx.fill(); }
        // handles
        handles = [];
        const dot = (px, py, color, ref, edge) => {
            const s = u2s(px, py);
            ctx.fillStyle = color; ctx.strokeStyle = '#0b0524'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(s.X, s.Y, 6, 0, 7); ctx.fill(); ctx.stroke();
            handles.push({ sx: s.X, sy: s.Y, ref, edge });
        };
        for (const p of eh) dot(p.t, p.o, '#22d3ee', p, 'H');
        for (const p of ev) dot(p.o, p.t, '#a855f7', p, 'V');
    }

    function hit(sx, sy) {
        for (const h of handles) if (Math.hypot(h.sx - sx, h.sy - sy) <= 9) return h;
        return null;
    }
    function pos(e) { const r = canvas.getBoundingClientRect(); return { sx: e.clientX - r.left, sy: e.clientY - r.top }; }

    function down(e) {
        const { sx, sy } = pos(e);
        const h = hit(sx, sy);
        if (h) { drag = h; return; }
        // add a point to the nearer editable edge
        const u = s2u(sx, sy);
        const dTop = Math.abs(u.y), dLeft = Math.abs(u.x);
        if (dTop < 0.3 && u.x > 0.03 && u.x < 0.97 && dTop <= dLeft) {
            const p = { t: clamp(u.x, 0.06, 0.94), o: clamp(u.y, -0.45, 0.45) };
            eh.push(p); drag = { ref: p, edge: 'H' };
        } else if (dLeft < 0.3 && u.y > 0.03 && u.y < 0.97) {
            const p = { t: clamp(u.y, 0.06, 0.94), o: clamp(u.x, -0.45, 0.45) };
            ev.push(p); drag = { ref: p, edge: 'V' };
        }
        draw();
    }
    function move(e) {
        if (!drag) return;
        const u = s2u(pos(e).sx, pos(e).sy);
        if (drag.edge === 'H') { drag.ref.t = clamp(u.x, 0.04, 0.96); drag.ref.o = clamp(u.y, -0.45, 0.45); }
        else { drag.ref.t = clamp(u.y, 0.04, 0.96); drag.ref.o = clamp(u.x, -0.45, 0.45); }
        draw();
    }
    function up() { drag = null; }
    function dbl(e) {
        const { sx, sy } = pos(e);
        const h = hit(sx, sy);
        if (!h) return;
        if (h.edge === 'H') eh = eh.filter((p) => p !== h.ref);
        else ev = ev.filter((p) => p !== h.ref);
        draw();
    }

    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

    // wire (once per open; remove on close)
    canvas.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    canvas.addEventListener('dblclick', dbl);

    const close = () => {
        modal.hidden = true;
        canvas.removeEventListener('pointerdown', down);
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('resize', resize);
        canvas.removeEventListener('dblclick', dbl);
        $('#tile-apply').onclick = $('#tile-cancel').onclick = $('#tile-close').onclick = $('#tile-reset').onclick = null;
    };
    $('#tile-reset').onclick = () => { eh = []; ev = []; draw(); };
    $('#tile-cancel').onclick = close;
    $('#tile-close').onclick = close;
    $('#tile-apply').onclick = () => { onApply({ edgeH: eh, edgeV: ev }); close(); };

    modal.hidden = false;
    resize();
    requestAnimationFrame(resize); // re-measure once layout settles
    window.addEventListener('resize', resize);
}
