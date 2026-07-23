// objects.js — the scene object model. Each object stores plain parameters; a
// builder turns those (plus any cached image asset) into a local-space Mesh.
// Keeping meshes derived from params makes undo/redo and autosave trivial.

import { buildText3D } from './geometry/text3d.js';
import { buildQR3D } from './geometry/qr3d.js';
import { buildLithophane } from './geometry/lithophane.js';
import { buildRelief } from './geometry/heightmap.js';
import { adjust } from './image/pipeline.js';
import * as P from './geometry/primitives.js';
import { Mesh } from './scene/mesh.js';

let counter = 1;
export const uid = () => `o${Date.now().toString(36)}${(counter++).toString(36)}`;

const COLORS = {
    text: [0.67, 0.55, 0.95], emoji: [0.98, 0.78, 0.28], primitive: [0.55, 0.75, 0.95],
    qr: [0.95, 0.95, 0.98], lithophane: [0.9, 0.88, 0.82], relief: [0.7, 0.85, 0.7],
};

export function defaultTransform() {
    return { pos: [0, 0, 0], rot: [0, 0, 0], scale: [1, 1, 1] };
}

export function createText(text = 'Hello') {
    return {
        id: uid(), type: 'text', name: 'Text',
        params: { text, fontFamily: 'Arial, sans-serif', heightMm: 20, depthMm: 4, bold: true, italic: false, letterSpacing: 0 },
        transform: defaultTransform(), color: COLORS.text.slice(),
    };
}

export function createEmoji(char = '★') {
    return {
        id: uid(), type: 'emoji', name: 'Emoji',
        params: { text: char, fontFamily: 'sans-serif', heightMm: 24, depthMm: 5, bold: false, italic: false, letterSpacing: 0 },
        transform: defaultTransform(), color: COLORS.emoji.slice(),
    };
}

export function createPrimitive(kind = 'box') {
    return {
        id: uid(), type: 'primitive', name: kind[0].toUpperCase() + kind.slice(1),
        params: {
            kind, w: 30, d: 30, h: 20, diameter: 24, radius: 4, sides: 6,
            points: 5, outerD: 40, innerD: 18, teeth: 16, module: 2, boreD: 5, tubeD: 12, seg: 64,
        },
        transform: defaultTransform(), color: COLORS.primitive.slice(),
    };
}

export function createQR(text = 'https://rami.party') {
    return {
        id: uid(), type: 'qr', name: 'QR code',
        params: { text, ecl: 'M', widthMm: 50, baseMm: 2, moduleMm: 1.6, quiet: 2 },
        transform: defaultTransform(), color: COLORS.qr.slice(),
    };
}

export function createImageObject(mode, src) {
    const isLitho = mode === 'lithophane';
    return {
        id: uid(), type: mode, name: isLitho ? 'Lithophane' : 'Relief',
        params: {
            src, shape: 'flat', widthMm: isLitho ? 100 : 80,
            minMm: 0.8, maxMm: 3, baseMm: 1.2, reliefMm: 3,
            diameterMm: 60, arcDeg: 60, maxCols: isLitho ? 260 : 220,
            brightness: 0, contrast: 0, gamma: 1, invert: false,
        },
        transform: defaultTransform(), color: (isLitho ? COLORS.lithophane : COLORS.relief).slice(),
    };
}

// Build a local-space Mesh for an object. `assets` maps id → { field } for images.
export function buildMesh(obj, assets = {}) {
    const p = obj.params;
    try {
        if (obj.type === 'text' || obj.type === 'emoji') {
            return buildText3D(p.text, {
                fontFamily: p.fontFamily, heightMm: p.heightMm, depthMm: p.depthMm,
                bold: p.bold, italic: p.italic, letterSpacing: p.letterSpacing,
            });
        }
        if (obj.type === 'qr') {
            return buildQR3D(p.text, { ecl: p.ecl, widthMm: p.widthMm, baseMm: p.baseMm, moduleMm: p.moduleMm, quiet: p.quiet });
        }
        if (obj.type === 'lithophane' || obj.type === 'relief') {
            const base = assets[obj.id] && assets[obj.id].field;
            if (!base) return new Mesh();
            const adj = adjust(base, { brightness: p.brightness, contrast: p.contrast, gamma: p.gamma, invert: p.invert });
            if (obj.type === 'lithophane') {
                return buildLithophane(adj, { shape: p.shape, widthMm: p.widthMm, minMm: p.minMm, maxMm: p.maxMm, diameterMm: p.diameterMm, arcDeg: p.arcDeg, maxCols: p.maxCols });
            }
            return buildRelief(adj, { widthMm: p.widthMm, baseMm: p.baseMm, reliefMm: p.reliefMm, maxCols: p.maxCols });
        }
        if (obj.type === 'primitive') return buildPrimitive(p);
    } catch (e) {
        console.warn('build failed', obj.type, e);
    }
    return new Mesh();
}

function buildPrimitive(p) {
    switch (p.kind) {
        case 'box': return P.box(p.w, p.d, p.h);
        case 'roundedBox': return P.roundedBox(p.w, p.d, p.h, p.radius);
        case 'cylinder': return P.cylinder(p.diameter, p.h, p.seg);
        case 'cone': return P.cone(p.diameter, p.h, p.seg);
        case 'sphere': return P.sphere(p.diameter, p.seg);
        case 'torus': return P.torus(p.outerD, p.tubeD, p.seg);
        case 'prism': return P.prism(p.sides, p.diameter, p.h);
        case 'star': return P.star(p.points, p.outerD, p.innerD, p.h);
        case 'gear': return P.gear(p.teeth, p.module, p.h, p.boreD);
        case 'tube': return P.tube(p.outerD, p.innerD, p.h, p.seg);
        default: return P.box(p.w, p.d, p.h);
    }
}
