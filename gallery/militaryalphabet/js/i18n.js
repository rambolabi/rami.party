/* ============================================================
   Phonetic Alphabet Studio — interface language
   A tiny translation layer: PAS.t(key) resolves against the active
   language, falls back to English, then to an explicit fallback,
   then to the key itself.

   Markup is translated declaratively:
     data-i18n="key"              -> textContent
     data-i18n-html="key"         -> innerHTML (only for strings with markup)
     data-i18n-title="key"        -> title attribute
     data-i18n-placeholder="key"  -> placeholder attribute
     data-i18n-aria-label="key"   -> aria-label attribute

   The catalogues live one per language in js/lang/<code>.js, so adding a
   language is a single new file plus an entry in PAS.LANGUAGES.
   ============================================================ */
(function (window, document) {
    "use strict";

    const PAS = window.PAS = window.PAS || {};

    PAS.LANGUAGES = [
        { id: "en", name: "English" },
        { id: "fr", name: "Français" },
        { id: "nl", name: "Nederlands" }
    ];
    PAS.DEFAULT_LANG = "en";

    /* Catalogues register themselves from js/lang/<code>.js. */
    const STRINGS = {};

    let current = PAS.DEFAULT_LANG;

    function interpolate(text, vars) {
        if (!vars) { return text; }
        return text.replace(/\{(\w+)\}/g, function (match, key) {
            return Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match;
        });
    }

    /* t("key") · t("key", {n: 3}) · t("key", null, "fallback if untranslated") */
    PAS.t = function (key, vars, fallback) {
        const table = STRINGS[current] || STRINGS.en;
        let text = table[key];
        if (text === undefined) { text = STRINGS.en[key]; }
        if (text === undefined) { text = fallback === undefined ? key : fallback; }
        return interpolate(text, vars);
    };

    /* Extra tables (alphabet notes, code descriptions) register here. */
    PAS.addStrings = function (lang, table) {
        STRINGS[lang] = Object.assign(STRINGS[lang] || {}, table);
    };

    /* One pass over the document; each element may carry several of these. */
    const BINDINGS = [
        ["data-i18n", null],
        ["data-i18n-html", null],
        ["data-i18n-title", "title"],
        ["data-i18n-placeholder", "placeholder"],
        ["data-i18n-aria-label", "aria-label"]
    ];
    const SELECTOR = BINDINGS.map(function (b) { return "[" + b[0] + "]"; }).join(",");

    function applyTo(root) {
        PAS.$$(SELECTOR, root || document).forEach(function (el) {
            BINDINGS.forEach(function (binding) {
                const key = el.getAttribute(binding[0]);
                if (key === null) { return; }
                const text = PAS.t(key);
                if (binding[1]) { el.setAttribute(binding[1], text); }
                else if (binding[0] === "data-i18n") { el.textContent = text; }
                else { el.innerHTML = text; }
            });
        });
    }

    PAS.i18n = {
        current: function () { return current; },
        has: function (lang) { return Object.prototype.hasOwnProperty.call(STRINGS, lang); },

        /* Best match for a BCP-47 tag: "fr-BE" -> "fr". */
        match: function (tag) {
            if (!tag) { return null; }
            const base = String(tag).toLowerCase().split("-")[0];
            return PAS.i18n.has(base) ? base : null;
        },

        set: function (lang, save) {
            current = PAS.i18n.has(lang) ? lang : PAS.DEFAULT_LANG;
            document.documentElement.setAttribute("lang", current);
            document.title = PAS.t("app.title");
            applyTo(document);
            if (save) { PAS.store(PAS.KEYS.lang, current); }
            PAS.emit("lang:change", current);
        },

        name: function (lang) {
            const found = PAS.LANGUAGES.filter(function (l) { return l.id === (lang || current); })[0];
            return found ? found.name : current;
        }
    };
})(window, document);
