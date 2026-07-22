// i18n.js — tiny localisation (EN / NL / FR). t(key) falls back to English.

const DICT = {
    en: {
        new: 'New', undo: '↶ Undo', redo: '↷ Redo', fit: 'Fit', export: '⤓ Export',
        workshop: '← Workshop', save: 'Save', open: 'Open', help: '?', pro: 'Pro mode',
        lang: 'Language',
        t_text: 'Text', t_emoji: 'Emoji', t_image: 'Image', t_qr: 'QR', t_puzzle: 'Puzzle',
        t_barcode: 'Barcode', t_box: 'Box', t_gear: 'Gear', t_ruler: 'Ruler', t_hinge: 'Hinge',
        t_reg: 'Marks', t_test: 'Test', t_rect: 'Rect', t_circle: 'Circle', t_poly: 'Poly', t_star: 'Star',
        t_heart: 'Heart', t_line: 'Line',
        properties: 'Properties', layers: 'Layers', artboard: 'Artboard',
        nothing: 'Nothing selected. Pick an object on the canvas, or add one from the left.',
        name: 'Name', operation: 'Operation (colour = layer)', width: 'Width mm', height: 'Height mm',
        rotation: 'Rotation °', mirror: 'Mirror', duplicate: 'Duplicate', forward: 'Forward',
        back: 'Back', delete: 'Delete', array: 'Array…',
        bed: 'Bed preset', targetsw: 'Target software', format: 'Format', download: '⤓ Download',
        dpi: 'DPI / resolution', kerf: 'Kerf comp. mm', overscan: 'Overscan mm',
        estimate: 'Estimate', help_title: 'Help & shortcuts',
        hint_title: 'The forge is empty.',
        hint_body: 'Add text, a shape, a QR code, or upload an image to make a perfect grayscale engraving. Everything stays in your browser.',
    },
    nl: {
        new: 'Nieuw', undo: '↶ Ongedaan', redo: '↷ Opnieuw', fit: 'Passend', export: '⤓ Exporteren',
        workshop: '← Werkplaats', save: 'Opslaan', open: 'Openen', help: '?', pro: 'Pro-modus',
        lang: 'Taal',
        t_text: 'Tekst', t_emoji: 'Emoji', t_image: 'Afbeelding', t_qr: 'QR', t_puzzle: 'Puzzel',
        t_barcode: 'Barcode', t_box: 'Doos', t_gear: 'Tandwiel', t_ruler: 'Liniaal', t_hinge: 'Scharnier',
        t_reg: 'Merken', t_test: 'Test', t_rect: 'Recht.', t_circle: 'Cirkel', t_poly: 'Veelh.', t_star: 'Ster',
        t_heart: 'Hart', t_line: 'Lijn',
        properties: 'Eigenschappen', layers: 'Lagen', artboard: 'Werkblad',
        nothing: 'Niets geselecteerd. Kies een object op het canvas of voeg er links een toe.',
        name: 'Naam', operation: 'Bewerking (kleur = laag)', width: 'Breedte mm', height: 'Hoogte mm',
        rotation: 'Rotatie °', mirror: 'Spiegel', duplicate: 'Dupliceren', forward: 'Vooruit',
        back: 'Terug', delete: 'Verwijderen', array: 'Raster…',
        bed: 'Bed-voorinstelling', targetsw: 'Doelsoftware', format: 'Formaat', download: '⤓ Downloaden',
        dpi: 'DPI / resolutie', kerf: 'Kerf-comp. mm', overscan: 'Overscan mm',
        estimate: 'Schatting', help_title: 'Hulp & sneltoetsen',
        hint_title: 'De smederij is leeg.',
        hint_body: 'Voeg tekst, een vorm of een QR-code toe, of upload een afbeelding voor een perfecte grijswaarde-gravure. Alles blijft in je browser.',
    },
    fr: {
        new: 'Nouveau', undo: '↶ Annuler', redo: '↷ Rétablir', fit: 'Ajuster', export: '⤓ Exporter',
        workshop: '← Atelier', save: 'Enregistrer', open: 'Ouvrir', help: '?', pro: 'Mode Pro',
        lang: 'Langue',
        t_text: 'Texte', t_emoji: 'Emoji', t_image: 'Image', t_qr: 'QR', t_puzzle: 'Puzzle',
        t_barcode: 'Code-barres', t_box: 'Boîte', t_gear: 'Engrenage', t_ruler: 'Règle', t_hinge: 'Charnière',
        t_reg: 'Repères', t_test: 'Test', t_rect: 'Rect.', t_circle: 'Cercle', t_poly: 'Polyg.', t_star: 'Étoile',
        t_heart: 'Cœur', t_line: 'Ligne',
        properties: 'Propriétés', layers: 'Calques', artboard: "Plan de travail",
        nothing: "Rien de sélectionné. Choisissez un objet sur le canevas ou ajoutez-en un à gauche.",
        name: 'Nom', operation: 'Opération (couleur = calque)', width: 'Largeur mm', height: 'Hauteur mm',
        rotation: 'Rotation °', mirror: 'Miroir', duplicate: 'Dupliquer', forward: 'Avancer',
        back: 'Reculer', delete: 'Supprimer', array: 'Grille…',
        bed: 'Préréglage plateau', targetsw: 'Logiciel cible', format: 'Format', download: '⤓ Télécharger',
        dpi: 'DPI / résolution', kerf: 'Comp. kerf mm', overscan: 'Overscan mm',
        estimate: 'Estimation', help_title: 'Aide & raccourcis',
        hint_title: 'La forge est vide.',
        hint_body: "Ajoutez du texte, une forme ou un QR code, ou importez une image pour une gravure en niveaux de gris parfaite. Tout reste dans votre navigateur.",
    },
};

let lang = localStorage.getItem('laserforge.lang') || 'en';

export function setLang(l) {
    lang = DICT[l] ? l : 'en';
    localStorage.setItem('laserforge.lang', lang);
    applyI18n();
}
export function getLang() { return lang; }
export function t(key) {
    return (DICT[lang] && DICT[lang][key]) || DICT.en[key] || key;
}
export function applyI18n(root = document) {
    root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
}
export const LANGS = ['en', 'nl', 'fr'];
