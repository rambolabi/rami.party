// extrude.js — turn 2D outlines into watertight 3D solids.
// A "shape" is { outer: ring, holes: [ring, ...] } where a ring is an array of
// [x, y] points. Extrusion builds two caps + side walls with consistent outward
// normals, so the result is manifold by construction.

import { Mesh } from '../scene/mesh.js';
import { triangulate } from './triangulate.js';

function signedArea(ring) {
    let a = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        a += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
    }
    return a / 2; // > 0 for counter-clockwise rings
}

// Normalise a shape so the outer ring is CCW and holes are CW.
export function normalizeShape(shape) {
    const outer = signedArea(shape.outer) < 0 ? shape.outer.slice().reverse() : shape.outer.slice();
    const holes = (shape.holes || []).map((h) => (signedArea(h) > 0 ? h.slice().reverse() : h.slice()));
    return { outer, holes };
}

// Extrude one normalised shape between z=z0 and z=z1.
function extrudeShape(mesh, shape, z0, z1) {
    const { outer, holes } = shape;
    const rings = [outer, ...holes];

    // --- caps -------------------------------------------------------------
    const { points, tris } = triangulate(outer, holes);
    const topBase = mesh.vertexCount;
    for (const p of points) mesh.addVertex(p[0], p[1], z1);
    for (let i = 0; i < tris.length; i += 3) {
        mesh.addTriangle(topBase + tris[i], topBase + tris[i + 1], topBase + tris[i + 2]);
    }
    const botBase = mesh.vertexCount;
    for (const p of points) mesh.addVertex(p[0], p[1], z0);
    for (let i = 0; i < tris.length; i += 3) {
        // reversed winding → bottom faces -Z
        mesh.addTriangle(botBase + tris[i], botBase + tris[i + 2], botBase + tris[i + 1]);
    }

    // --- walls ------------------------------------------------------------
    for (const ring of rings) {
        const n = ring.length;
        const base = mesh.vertexCount;
        for (const p of ring) { mesh.addVertex(p[0], p[1], z0); mesh.addVertex(p[0], p[1], z1); }
        for (let i = 0; i < n; i++) {
            const a = base + i * 2;             // A0
            const a1 = a + 1;                    // A1 (top)
            const b = base + ((i + 1) % n) * 2;  // B0
            const b1 = b + 1;                     // B1 (top)
            mesh.addQuad(a, b, b1, a1);
        }
    }
    return mesh;
}

// Extrude a list of shapes to a total depth (mm). `center` puts z in [-d/2, d/2].
export function extrude(shapes, depth, { center = false } = {}) {
    const mesh = new Mesh();
    const z0 = center ? -depth / 2 : 0;
    const z1 = center ? depth / 2 : depth;
    for (const raw of shapes) extrudeShape(mesh, normalizeShape(raw), z0, z1);
    return mesh;
}
