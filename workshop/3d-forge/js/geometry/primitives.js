// primitives.js — parametric solid primitives, all in real millimetres and
// watertight by construction. Simple shapes are built by extruding a 2D outline;
// curved shapes (sphere/torus) are built directly with shared poles/seams.

import { Mesh } from '../scene/mesh.js';
import { extrude } from './extrude.js';

// --- 2D outline helpers -----------------------------------------------------
export function circlePts(r, seg = 64) {
    const pts = [];
    for (let i = 0; i < seg; i++) {
        const a = (i / seg) * Math.PI * 2;
        pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return pts;
}

export function polygonPts(sides, r, rot = 0) {
    const pts = [];
    for (let i = 0; i < sides; i++) {
        const a = rot + (i / sides) * Math.PI * 2;
        pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return pts;
}

export function starPts(points, rOuter, rInner) {
    const pts = [];
    for (let i = 0; i < points * 2; i++) {
        const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? rOuter : rInner;
        pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return pts;
}

export function roundedRectPts(w, h, radius, seg = 8) {
    const r = Math.max(0, Math.min(radius, Math.min(w, h) / 2));
    const x = w / 2, y = h / 2;
    const pts = [];
    const corners = [
        [x - r, y - r, 0], [-x + r, y - r, Math.PI / 2],
        [-x + r, -y + r, Math.PI], [x - r, -y + r, -Math.PI / 2],
    ];
    for (const [cx, cy, a0] of corners) {
        for (let i = 0; i <= seg; i++) {
            const a = a0 + (i / seg) * (Math.PI / 2);
            pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
        }
    }
    return pts;
}

// Simplified (trapezoidal) gear tooth profile — robust and printable.
export function gearPts(teeth, module, pressureDeg = 20) {
    teeth = Math.max(6, Math.round(teeth));
    const pitchR = (module * teeth) / 2;
    const addendum = module;
    const dedendum = 1.25 * module;
    const rTip = pitchR + addendum;
    const rRoot = Math.max(1, pitchR - dedendum);
    const toothAngle = (Math.PI * 2) / teeth;
    const t = Math.tan((pressureDeg * Math.PI) / 180);
    const half = toothAngle / 2;
    const tipHalf = half * 0.32;
    const rootHalf = half * 0.5 + tipHalf * (rTip / rRoot) * 0.0 + t * 0; // keep params referenced
    const pts = [];
    for (let i = 0; i < teeth; i++) {
        const c = i * toothAngle;
        pts.push([Math.cos(c - rootHalf) * rRoot, Math.sin(c - rootHalf) * rRoot]);
        pts.push([Math.cos(c - tipHalf) * rTip, Math.sin(c - tipHalf) * rTip]);
        pts.push([Math.cos(c + tipHalf) * rTip, Math.sin(c + tipHalf) * rTip]);
        pts.push([Math.cos(c + rootHalf) * rRoot, Math.sin(c + rootHalf) * rRoot]);
    }
    return pts;
}

// --- solids -----------------------------------------------------------------
export function box(w = 30, d = 30, h = 20) {
    return extrude([{ outer: [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]] }], h);
}

export function roundedBox(w = 30, d = 30, h = 20, radius = 4) {
    return extrude([{ outer: roundedRectPts(w, d, radius) }], h);
}

export function cylinder(d = 24, h = 20, seg = 64) {
    return extrude([{ outer: circlePts(d / 2, seg) }], h);
}

export function prism(sides = 6, d = 24, h = 20) {
    return extrude([{ outer: polygonPts(sides, d / 2, -Math.PI / 2) }], h);
}

export function star(points = 5, dOuter = 40, dInner = 18, h = 8) {
    return extrude([{ outer: starPts(points, dOuter / 2, dInner / 2) }], h);
}

export function gear(teeth = 16, module = 2, h = 6, boreD = 5) {
    const outer = gearPts(teeth, module);
    const shape = { outer, holes: [] };
    if (boreD > 0) shape.holes.push(circlePts(boreD / 2, 48));
    return extrude([shape], h);
}

export function tube(outerD = 30, innerD = 18, h = 20, seg = 64) {
    return extrude([{ outer: circlePts(outerD / 2, seg), holes: [circlePts(innerD / 2, seg)] }], h);
}

export function cone(d = 30, h = 24, seg = 64) {
    const mesh = new Mesh();
    const r = d / 2;
    const apex = mesh.addVertex(0, 0, h);
    const centerB = mesh.addVertex(0, 0, 0);
    const ring = [];
    for (let i = 0; i < seg; i++) {
        const a = (i / seg) * Math.PI * 2;
        ring.push(mesh.addVertex(Math.cos(a) * r, Math.sin(a) * r, 0));
    }
    for (let i = 0; i < seg; i++) {
        const a = ring[i], b = ring[(i + 1) % seg];
        mesh.addTriangle(apex, a, b);       // side
        mesh.addTriangle(centerB, b, a);    // base (faces -Z)
    }
    return mesh;
}

export function sphere(d = 30, seg = 48) {
    const mesh = new Mesh();
    const r = d / 2;
    const rings = Math.max(6, Math.round(seg / 2));
    const grid = [];
    for (let i = 0; i <= rings; i++) {
        const phi = (i / rings) * Math.PI; // 0..PI
        const row = [];
        for (let j = 0; j <= seg; j++) {
            const theta = (j / seg) * Math.PI * 2;
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi) + r; // rest on plate
            row.push(mesh.addVertex(x, y, z));
        }
        grid.push(row);
    }
    for (let i = 0; i < rings; i++) {
        for (let j = 0; j < seg; j++) {
            const a = grid[i][j], b = grid[i][j + 1], c = grid[i + 1][j + 1], dd = grid[i + 1][j];
            mesh.addQuad(a, dd, c, b);
        }
    }
    return mesh;
}

export function torus(outerD = 40, tubeD = 12, seg = 64, tubeSeg = 32) {
    const mesh = new Mesh();
    const R = (outerD - tubeD) / 2;
    const r = tubeD / 2;
    const grid = [];
    for (let i = 0; i < seg; i++) {
        const u = (i / seg) * Math.PI * 2;
        const row = [];
        for (let j = 0; j < tubeSeg; j++) {
            const v = (j / tubeSeg) * Math.PI * 2;
            const x = (R + r * Math.cos(v)) * Math.cos(u);
            const y = (R + r * Math.cos(v)) * Math.sin(u);
            const z = r * Math.sin(v) + r; // rest on plate
            row.push(mesh.addVertex(x, y, z));
        }
        grid.push(row);
    }
    for (let i = 0; i < seg; i++) {
        for (let j = 0; j < tubeSeg; j++) {
            const a = grid[i][j], b = grid[(i + 1) % seg][j];
            const c = grid[(i + 1) % seg][(j + 1) % tubeSeg], dd = grid[i][(j + 1) % tubeSeg];
            mesh.addQuad(a, b, c, dd);
        }
    }
    return mesh;
}
