// i18n.js — lightweight string table. EN is complete; NL/FR cover the chrome and
// fall back to EN for anything missing (matches the other rami.party realms).

const STR = {
    en: {
        new: 'New', undo: '↶ Undo', redo: '↷ Redo', fit: 'Fit', backlight: '💡 Backlight',
        help: '?', export: '⤓ Export', workshop: '← Workshop',
        t_text: 'Text', t_emoji: 'Emoji', t_litho: 'Lithophane', t_relief: 'Relief', t_qr: 'QR',
        t_box: 'Box', t_rbox: 'R-Box', t_cyl: 'Cylinder', t_cone: 'Cone', t_sphere: 'Sphere',
        t_torus: 'Torus', t_prism: 'Prism', t_star: 'Star', t_gear: 'Gear', t_tube: 'Tube',
        properties: 'Properties', nothing: 'Nothing selected. Add an object from the left, or click one in the scene.',
        objects: 'Objects', plate: 'Build plate', scene: 'Scene',
        hint_title: 'The plate is empty.',
        hint_body: 'Add 3D text, a shape, a QR code, or turn a photo into a lithophane. Everything is generated in your browser and exports print-ready in real millimetres.',
        watertight: 'Watertight', not_watertight: 'Needs repair',
    },
    nl: {
        new: 'Nieuw', undo: '↶ Ongedaan', redo: '↷ Opnieuw', fit: 'Passend', backlight: '💡 Tegenlicht',
        export: '⤓ Exporteren', workshop: '← Werkplaats',
        properties: 'Eigenschappen', objects: 'Objecten', plate: 'Printbed', scene: 'Scène',
        hint_title: 'Het bed is leeg.',
        hint_body: 'Voeg 3D-tekst, een vorm of een QR-code toe, of maak een lithofaan van een foto. Alles blijft in je browser.',
    },
    fr: {
        new: 'Nouveau', undo: '↶ Annuler', redo: '↷ Rétablir', fit: 'Ajuster', backlight: '💡 Rétroéclairage',
        export: '⤓ Exporter', workshop: '← Atelier',
        properties: 'Propriétés', objects: 'Objets', plate: 'Plateau', scene: 'Scène',
        hint_title: 'Le plateau est vide.',
        hint_body: 'Ajoutez du texte 3D, une forme ou un QR code, ou transformez une photo en lithophane. Tout reste dans votre navigateur.',
    },
};

let lang = 'en';
export function setLang(l) { lang = STR[l] ? l : 'en'; }
export function getLang() { return lang; }
export function t(key) { return (STR[lang] && STR[lang][key]) || STR.en[key] || key; }
export function applyI18n(root = document) {
    root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
}
