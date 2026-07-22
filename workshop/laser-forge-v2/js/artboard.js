// artboard.js — interactive mm canvas: render, select, move, resize, rotate, zoom/pan

import { rotatePoint, clamp } from './geometry.js';
import { drawObject, measureText } from './objects.js';

const HANDLE = 8; // screen px

export class Artboard {
    constructor(store, canvas) {
        this.store = store;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.dpr = Math.min(2, window.devicePixelRatio || 1);
        this.drag = null;
        this.space = false;
        this.onStatus = null;

        this._bind();
        this.store.subscribe(() => this.render());
        const ro = new ResizeObserver(() => this.resize());
        ro.observe(canvas.parentElement);
        this.resize();
        requestAnimationFrame(() => this.fit());
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = Math.max(1, Math.round(rect.width * this.dpr));
        this.canvas.height = Math.max(1, Math.round(rect.height * this.dpr));
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.render();
    }

    get view() { return this.store.state.view; }
    w2s(x, y) { const v = this.view; return { x: x * v.zoom + v.panX, y: y * v.zoom + v.panY }; }
    s2w(x, y) { const v = this.view; return { x: (x - v.panX) / v.zoom, y: (y - v.panY) / v.zoom }; }

    fit() {
        const { widthMM, heightMM } = this.store.state.artboard;
        const cw = this.canvas.width / this.dpr, ch = this.canvas.height / this.dpr;
        const margin = 40;
        const zoom = Math.min((cw - margin * 2) / widthMM, (ch - margin * 2) / heightMM);
        this.view.zoom = zoom;
        this.view.panX = (cw - widthMM * zoom) / 2;
        this.view.panY = (ch - heightMM * zoom) / 2;
        this.render();
    }

    requestRedraw() { if (!this._raf) this._raf = requestAnimationFrame(() => { this._raf = 0; this.render(); }); }

    render() {
        const ctx = this.ctx;
        const { widthMM: W, heightMM: H } = this.store.state.artboard;
        const dpr = this.dpr, v = this.view;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // world transform (mm-space)
        ctx.setTransform(v.zoom * dpr, 0, 0, v.zoom * dpr, v.panX * dpr, v.panY * dpr);

        // material / artboard
        ctx.fillStyle = '#f7f7fb';
        ctx.fillRect(0, 0, W, H);
        // grid
        ctx.lineWidth = 1 / v.zoom;
        ctx.strokeStyle = 'rgba(90,80,140,0.18)';
        const step = W > 400 ? 50 : 10;
        ctx.beginPath();
        for (let x = 0; x <= W + 0.01; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
        for (let y = 0; y <= H + 0.01; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
        ctx.stroke();
        // border
        ctx.lineWidth = 1.4 / v.zoom;
        ctx.strokeStyle = 'rgba(120,90,200,0.8)';
        ctx.strokeRect(0, 0, W, H);

        // objects
        for (const obj of this.store.objects) {
            drawObject(ctx, obj, v.zoom, { requestRedraw: () => this.requestRedraw() });
        }

        // selection overlay (screen space)
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const sel = this.store.selected;
        if (sel) this._drawSelection(sel);

        if (this.onStatus) this.onStatus();
    }

    _corners(obj) {
        const cx = obj.x + obj.w / 2, cy = obj.y + obj.h / 2;
        const pts = [
            { x: obj.x, y: obj.y }, { x: obj.x + obj.w, y: obj.y },
            { x: obj.x + obj.w, y: obj.y + obj.h }, { x: obj.x, y: obj.y + obj.h },
        ].map((p) => rotatePoint(p.x, p.y, cx, cy, obj.rotation || 0));
        return pts.map((p) => this.w2s(p.x, p.y));
    }

    _handlePositions(obj) {
        const c = this._corners(obj); // NW NE SE SW (screen)
        const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
        const handles = {
            nw: c[0], ne: c[1], se: c[2], sw: c[3],
            n: mid(c[0], c[1]), e: mid(c[1], c[2]), s: mid(c[2], c[3]), w: mid(c[3], c[0]),
        };
        // rotate handle above the top edge
        const top = handles.n;
        const dir = { x: top.x - handles.s.x, y: top.y - handles.s.y };
        const len = Math.hypot(dir.x, dir.y) || 1;
        handles.rot = { x: top.x + (dir.x / len) * 26, y: top.y + (dir.y / len) * 26 };
        return handles;
    }

    _drawSelection(obj) {
        const ctx = this.ctx;
        const c = this._corners(obj);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#22d3ee';
        ctx.beginPath();
        ctx.moveTo(c[0].x, c[0].y);
        for (let i = 1; i < 4; i++) ctx.lineTo(c[i].x, c[i].y);
        ctx.closePath(); ctx.stroke();

        const H = this._handlePositions(obj);
        // rotate stalk
        ctx.beginPath(); ctx.moveTo(H.n.x, H.n.y); ctx.lineTo(H.rot.x, H.rot.y); ctx.stroke();
        const showResize = !obj.rotation || obj.rotation % 360 === 0;
        ctx.fillStyle = '#fff'; ctx.strokeStyle = '#22d3ee';
        const dot = (p, r = HANDLE / 2) => { ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fill(); ctx.stroke(); };
        if (showResize) for (const k of ['nw', 'ne', 'se', 'sw', 'n', 'e', 's', 'w']) dot(H[k]);
        ctx.fillStyle = '#22d3ee'; ctx.strokeStyle = '#0b0524';
        dot(H.rot, 6);
    }

    _hitHandle(obj, sx, sy) {
        const H = this._handlePositions(obj);
        const near = (p) => Math.hypot(p.x - sx, p.y - sy) <= HANDLE + 2;
        if (near(H.rot)) return 'rot';
        if (!obj.rotation || obj.rotation % 360 === 0) {
            for (const k of ['nw', 'ne', 'se', 'sw', 'n', 'e', 's', 'w']) if (near(H[k])) return k;
        }
        return null;
    }

    _hitObject(wx, wy) {
        const objs = this.store.objects;
        for (let i = objs.length - 1; i >= 0; i--) {
            const o = objs[i];
            if (o.visible === false) continue;
            const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
            const p = rotatePoint(wx, wy, cx, cy, -(o.rotation || 0));
            if (p.x >= o.x - 0.5 && p.x <= o.x + o.w + 0.5 && p.y >= o.y - 0.5 && p.y <= o.y + o.h + 0.5) return o;
        }
        return null;
    }

    _bind() {
        const cv = this.canvas;
        cv.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = cv.getBoundingClientRect();
            const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
            const before = this.s2w(sx, sy);
            const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
            this.view.zoom = clamp(this.view.zoom * factor, 0.05, 200);
            const after = this.s2w(sx, sy);
            this.view.panX += (after.x - before.x) * this.view.zoom;
            this.view.panY += (after.y - before.y) * this.view.zoom;
            this.render();
        }, { passive: false });

        window.addEventListener('keydown', (e) => { if (e.code === 'Space') this.space = true; });
        window.addEventListener('keyup', (e) => { if (e.code === 'Space') this.space = false; });

        cv.addEventListener('pointerdown', (e) => this._down(e));
        window.addEventListener('pointermove', (e) => this._move(e));
        window.addEventListener('pointerup', (e) => this._up(e));
    }

    _pos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return { sx: e.clientX - rect.left, sy: e.clientY - rect.top };
    }

    _down(e) {
        const { sx, sy } = this._pos(e);
        const w = this.s2w(sx, sy);
        if (this.space || e.button === 1) {
            this.drag = { type: 'pan', sx, sy, panX: this.view.panX, panY: this.view.panY };
            return;
        }
        const sel = this.store.selected;
        if (sel) {
            const h = this._hitHandle(sel, sx, sy);
            if (h === 'rot') {
                const cx = sel.x + sel.w / 2, cy = sel.y + sel.h / 2;
                const cs = this.w2s(cx, cy);
                const a0 = Math.atan2(sy - cs.y, sx - cs.x);
                this.drag = { type: 'rotate', obj: sel, cs, a0, rot0: sel.rotation || 0 };
                return;
            }
            if (h) { this.drag = { type: 'resize', obj: sel, handle: h, start: { ...sel }, w0: w }; return; }
        }
        const hit = this._hitObject(w.x, w.y);
        if (hit) {
            this.store.select(hit.id);
            this.drag = { type: 'move', obj: hit, w0: w, x0: hit.x, y0: hit.y };
        } else {
            this.store.select(null);
            this.drag = { type: 'pan', sx, sy, panX: this.view.panX, panY: this.view.panY };
        }
    }

    _move(e) {
        if (!this.drag) return;
        const { sx, sy } = this._pos(e);
        const w = this.s2w(sx, sy);
        const d = this.drag;
        if (d.type === 'pan') {
            this.view.panX = d.panX + (sx - d.sx);
            this.view.panY = d.panY + (sy - d.sy);
            this.render();
        } else if (d.type === 'move') {
            const nx = d.x0 + (w.x - d.w0.x), ny = d.y0 + (w.y - d.w0.y);
            this.store.patch(d.obj.id, { x: nx, y: ny }, { transient: true });
        } else if (d.type === 'rotate') {
            const a = Math.atan2(sy - d.cs.y, sx - d.cs.x);
            let deg = d.rot0 + ((a - d.a0) * 180) / Math.PI;
            if (e.shiftKey) deg = Math.round(deg / 15) * 15;
            this.store.patch(d.obj.id, { rotation: ((deg % 360) + 360) % 360 }, { transient: true });
        } else if (d.type === 'resize') {
            this._applyResize(d, w);
        }
    }

    _applyResize(d, w) {
        const s = d.start;
        const o = d.obj;
        let { x, y, w: ww, h: hh } = s;
        const minS = 1;
        const H = d.handle;
        if (H.includes('e')) ww = Math.max(minS, w.x - s.x);
        if (H.includes('s')) hh = Math.max(minS, w.y - s.y);
        if (H.includes('w')) { const nx = Math.min(w.x, s.x + s.w - minS); ww = s.x + s.w - nx; x = nx; }
        if (H.includes('n')) { const ny = Math.min(w.y, s.y + s.h - minS); hh = s.y + s.h - ny; y = ny; }
        if (o.type === 'text') {
            const m0 = measureText(s);
            const sizeMM = clamp(s.sizeMM * (hh / s.h), 1, 2000);
            const patched = { ...s, sizeMM };
            const m = measureText(patched);
            this.store.patch(o.id, { sizeMM, w: m.wMM, h: m.hMM, x, y }, { transient: true });
        } else {
            this.store.patch(o.id, { x, y, w: ww, h: hh }, { transient: true });
        }
    }

    _up() {
        if (!this.drag) return;
        const wasEdit = ['move', 'resize', 'rotate'].includes(this.drag.type);
        this.drag = null;
        if (wasEdit) this.store.commit('transform');
    }
}
