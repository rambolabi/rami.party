// exporters.js — one entry point that turns the (repaired) scene mesh into
// downloadable files for the chosen format, plus target-slicer quick presets.

import { stlBinary, stlAscii } from './stl.js';
import { objExport } from './obj.js';
import { plyExport } from './ply.js';
import { amfExport } from './amf.js';
import { threeMFExport } from './threemf.js';

// Auto-pick the ideal format + options for popular slicers so beginners can't
// choose wrong.
export const SLICER_PRESETS = {
    cura: { format: '3mf', label: 'UltiMaker Cura' },
    prusa: { format: '3mf', label: 'PrusaSlicer' },
    bambu: { format: '3mf', label: 'Bambu Studio' },
    orca: { format: '3mf', label: 'OrcaSlicer' },
    simplify3d: { format: 'stl', stlBinary: true, label: 'Simplify3D' },
    chitubox: { format: 'stl', stlBinary: true, label: 'Chitubox / Lychee (resin)' },
    meshmixer: { format: 'ply', label: 'Meshmixer / Blender' },
    generic: { format: 'stl', stlBinary: true, label: 'Generic / Thingiverse' },
};

export const FORMATS = [
    { id: '3mf', label: '3MF — project (units, colour) · slicer-preferred' },
    { id: 'stl', label: 'STL — universal mesh' },
    { id: 'obj', label: 'OBJ (+MTL) — Blender / Meshmixer' },
    { id: 'ply', label: 'PLY — mesh with vertex colour' },
    { id: 'amf', label: 'AMF — XML mesh + colour' },
];

// mesh = repaired world-space Mesh. Returns [{ blob, name }].
export function runExport(mesh, format, opts = {}) {
    const name = (opts.name || 'model').replace(/[^\w.-]+/g, '_') || 'model';
    const color = opts.color || [0.72, 0.6, 0.92];
    switch (format) {
        case 'stl':
            return [{ blob: opts.stlBinary === false ? stlAscii(mesh) : stlBinary(mesh), name: `${name}.stl` }];
        case '3mf':
            return [{ blob: threeMFExport(mesh, { name, color }), name: `${name}.3mf` }];
        case 'obj': {
            const { obj, mtl } = objExport(mesh, { name, color });
            return [{ blob: obj, name: `${name}.obj` }, { blob: mtl, name: `${name}.mtl` }];
        }
        case 'ply':
            return [{ blob: plyExport(mesh, { binary: opts.plyBinary !== false, color: color.map((v) => Math.round(v * 255)) }), name: `${name}.ply` }];
        case 'amf':
            return [{ blob: amfExport(mesh, { color }), name: `${name}.amf` }];
        default:
            return [{ blob: stlBinary(mesh), name: `${name}.stl` }];
    }
}
