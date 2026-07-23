// threemf.js — 3MF writer (ZIP + XML), the format every major slicer prefers.
// Embeds units = millimetre, per-object colour and a build item so the model
// drops into Cura / PrusaSlicer / Bambu / Orca at true scale.

import { zipStore } from './zip.js';

function xmlEscape(s) {
    return String(s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
}
function toHex(color) {
    const h = (v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0');
    return `#${h(color[0])}${h(color[1])}${h(color[2])}FF`;
}

export function threeMFExport(mesh, { name = 'model', color = [0.7, 0.6, 0.9] } = {}) {
    const p = mesh.positions, idx = mesh.indices;
    const c = mesh.color || color;

    const model = [];
    model.push('<?xml version="1.0" encoding="UTF-8"?>');
    model.push('<model unit="millimeter" xml:lang="en-US" ' +
        'xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" ' +
        'xmlns:m="http://schemas.microsoft.com/3dmanufacturing/material/2015/02">');
    model.push(`  <metadata name="Application">3D Forge · rami.party</metadata>`);
    model.push(`  <metadata name="Title">${xmlEscape(name)}</metadata>`);
    model.push('  <resources>');
    model.push(`    <m:colorgroup id="1"><m:color color="${toHex(c)}" /></m:colorgroup>`);
    model.push('    <object id="2" type="model" pid="1" pindex="0">');
    model.push('      <mesh>');
    model.push('        <vertices>');
    const f = (n) => n.toFixed(5);
    for (let i = 0; i < p.length; i += 3) {
        model.push(`          <vertex x="${f(p[i])}" y="${f(p[i + 1])}" z="${f(p[i + 2])}" />`);
    }
    model.push('        </vertices>');
    model.push('        <triangles>');
    for (let i = 0; i < idx.length; i += 3) {
        model.push(`          <triangle v1="${idx[i]}" v2="${idx[i + 1]}" v3="${idx[i + 2]}" />`);
    }
    model.push('        </triangles>');
    model.push('      </mesh>');
    model.push('    </object>');
    model.push('  </resources>');
    model.push('  <build><item objectid="2" /></build>');
    model.push('</model>');

    const contentTypes =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />' +
        '<Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml" />' +
        '</Types>';

    const rels =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Target="/3D/3dmodel.model" Id="rel0" ' +
        'Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel" /></Relationships>';

    const enc = new TextEncoder();
    return zipStore([
        { name: '[Content_Types].xml', data: enc.encode(contentTypes) },
        { name: '_rels/.rels', data: enc.encode(rels) },
        { name: '3D/3dmodel.model', data: enc.encode(model.join('\n')) },
    ]);
}
