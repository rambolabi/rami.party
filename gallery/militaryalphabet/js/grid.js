/* ============================================================
   Phonetic Alphabet Studio — alphabet grid
   Builds the tile grid for the current alphabet and handles search,
   jump-to-letter and the flash highlight used while speaking.
   ============================================================ */
(function (window, document) {
    "use strict";

    const PAS = window.PAS = window.PAS || {};
    let showMorse = true;
    let query = "";

    function tileFor(entry, isDigit) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tile" + (isDigit ? " is-digit" : "");
        btn.dataset.char = entry[0];
        btn.setAttribute("aria-label", PAS.t("tile.aria", { char: entry[0], word: entry[1] }));

        const morse = PAS.translator.morseFor(entry);
        btn.innerHTML =
            '<span class="t-letter">' + PAS.escapeHtml(entry[0]) + '</span>' +
            '<span class="t-word">' + PAS.escapeHtml(entry[1]) + '</span>' +
            '<span class="t-pron">' + PAS.escapeHtml(entry[2] || "") + '</span>' +
            (morse ? '<span class="t-morse" aria-hidden="true">' + PAS.escapeHtml(morse) + '</span>' : "");

        // Searched on every keystroke, so build the haystack once.
        btn.dataset.search = (entry[0] + " " + entry[1] + " " + (entry[2] || "") + " " + morse).toUpperCase();

        btn.addEventListener("click", function () {
            PAS.speech.speak(entry[1], { lang: PAS.translator.alphabet().lang });
            PAS.copy(entry[1]);
            grid.flash(entry[0]);
        });
        return btn;
    }

    const grid = {
        render: function () {
            const host = PAS.$("grid");
            if (!host) { return; }
            const a = PAS.translator.alphabet();
            const frag = document.createDocumentFragment();
            host.innerHTML = "";
            a.letters.forEach(function (e) { frag.appendChild(tileFor(e, false)); });
            a.digits.forEach(function (e) { frag.appendChild(tileFor(e, true)); });
            host.appendChild(frag);
            host.classList.toggle("hide-morse", !showMorse);
            grid.filter(query);
        },

        setMorse: function (on) {
            showMorse = !!on;
            const host = PAS.$("grid");
            if (host) { host.classList.toggle("hide-morse", !showMorse); }
        },

        filter: function (q) {
            query = String(q || "").trim().toUpperCase();
            const tiles = PAS.$$("#grid .tile");
            let shown = 0;
            tiles.forEach(function (tile) {
                const hit = !query || tile.dataset.search.indexOf(query) >= 0;
                tile.hidden = !hit;
                if (hit) { shown++; }
            });
            const empty = PAS.$("gridEmpty");
            if (empty) { empty.hidden = shown > 0; }
            return shown;
        },

        /* Scroll a tile into view and pulse it. Used by search and by
           the "type a letter to jump" shortcut. */
        flash: function (ch) {
            if (!ch) { return null; }
            const tile = PAS.$$("#grid .tile").filter(function (t) {
                return t.dataset.char === ch || t.dataset.char === ch.toUpperCase();
            })[0];
            if (!tile) { return null; }
            tile.classList.remove("flash");
            void tile.offsetWidth;                 // restart the animation
            tile.classList.add("flash");
            return tile;
        },

        jumpTo: function (ch) {
            const tile = grid.flash(ch);
            if (!tile) { return false; }
            tile.scrollIntoView({ block: "center", behavior: "smooth" });
            return true;
        },

        clearHighlights: function () {
            PAS.$$("#grid .tile.speaking").forEach(function (t) { t.classList.remove("speaking"); });
        },

        highlight: function (ch) {
            grid.clearHighlights();
            const tile = PAS.$$("#grid .tile").filter(function (t) { return t.dataset.char === ch; })[0];
            if (tile) { tile.classList.add("speaking"); }
        }
    };

    PAS.grid = grid;
})(window, document);
