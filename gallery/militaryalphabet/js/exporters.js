/* ============================================================
   Phonetic Alphabet Studio — export & share
   Printable cheat sheet, CSV/JSON download, PNG of the current
   translation, and shareable deep links.
   ============================================================ */
(function (window, document) {
    "use strict";

    const PAS = window.PAS = window.PAS || {};

    function cssVar(name, fallback) {
        const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return v || fallback;
    }

    function slug(text) {
        return String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }

    /* Greedy wrap on spaces, hard-splitting anything longer than the line. */
    function wrap(text, maxChars) {
        const lines = [];
        String(text).split(/\s{2,}\/\s{2,}|\n/).forEach(function (block) {
            let line = "";
            block.split(/\s+/).forEach(function (word) {
                while (word.length > maxChars) {
                    if (line) { lines.push(line); line = ""; }
                    lines.push(word.slice(0, maxChars));
                    word = word.slice(maxChars);
                }
                if (!line) { line = word; }
                else if ((line + " " + word).length <= maxChars) { line += " " + word; }
                else { lines.push(line); line = word; }
            });
            if (line) { lines.push(line); }
        });
        return lines;
    }

    const exporters = {
        /* ---------- Printable cheat sheet ---------- */
        print: function () {
            window.print();
        },

        /* ---------- Raw data ---------- */
        csv: function () {
            const a = PAS.translator.alphabet();
            PAS.download("phonetic-" + slug(a.id) + ".csv", "text/csv", PAS.translator.toCSV());
            PAS.toast(PAS.t("t.csv"));
        },

        json: function () {
            const a = PAS.translator.alphabet();
            PAS.download("phonetic-" + slug(a.id) + ".json", "application/json", PAS.translator.toJSON());
            PAS.toast(PAS.t("t.json"));
        },

        /* ---------- PNG of the current translation ---------- */
        toCanvas: function (text) {
            const a = PAS.translator.alphabet();
            const lines = wrap(text, 34);
            const pad = 36;
            const lineH = 40;
            const titleH = 64;
            const width = 720;
            const height = titleH + pad + Math.max(1, lines.length) * lineH + pad;

            const canvas = document.createElement("canvas");
            const scale = window.devicePixelRatio > 1 ? 2 : 1;
            canvas.width = width * scale;
            canvas.height = height * scale;
            const ctx = canvas.getContext("2d");
            ctx.scale(scale, scale);

            const bg = cssVar("--bg", "#0d1117");
            const accent = cssVar("--accent", "#4c8dff");
            const soft = cssVar("--accent-soft", "#a9c8ff");
            const dim = cssVar("--ink-dim", "#9aa7b6");

            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, width, height);
            ctx.strokeStyle = accent;
            ctx.globalAlpha = 0.35;
            ctx.strokeRect(6, 6, width - 12, height - 12);
            ctx.globalAlpha = 1;

            ctx.font = "700 20px 'Courier New', monospace";
            ctx.fillStyle = accent;
            ctx.fillText(PAS.t("app.brand"), pad, 40);
            ctx.font = "13px 'Courier New', monospace";
            ctx.fillStyle = dim;
            ctx.fillText(PAS.t("alpha." + a.id + ".name", null, a.name), pad, 60);

            ctx.font = "600 22px 'Courier New', monospace";
            ctx.fillStyle = soft;
            lines.forEach(function (line, i) {
                ctx.fillText(line, pad, titleH + pad + i * lineH);
            });

            return canvas;
        },

        copyImage: function (text) {
            if (!text) { PAS.toast(PAS.t("t.nothingCopy")); return; }
            const canvas = exporters.toCanvas(text);
            canvas.toBlob(function (blob) {
                if (!blob) { PAS.toast(PAS.t("t.imageFailed")); return; }
                const canWrite = window.ClipboardItem && navigator.clipboard && navigator.clipboard.write;
                if (!canWrite) {
                    PAS.download("phonetic.png", "image/png", blob);
                    PAS.toast(PAS.t("t.imageDownloaded"));
                    return;
                }
                navigator.clipboard.write([new window.ClipboardItem({ "image/png": blob })]).then(
                    function () { PAS.toast(PAS.t("t.imageCopied")); },
                    function () {
                        PAS.download("phonetic.png", "image/png", blob);
                        PAS.toast(PAS.t("t.imageBlocked"));
                    }
                );
            }, "image/png");
        },

        /* ---------- Deep link ---------- */
        buildLink: function (opts) {
            opts = opts || {};
            const url = new URL(window.location.href);
            url.hash = "";
            url.search = "";
            const p = url.searchParams;
            p.set("a", PAS.translator.alphabet().id);
            p.set("t", document.documentElement.getAttribute("data-theme") || PAS.DEFAULT_THEME);
            p.set("lang", PAS.i18n.current());
            if (opts.text) { p.set("text", opts.text); }
            const wake = PAS.wake.state();
            if (opts.includeWake && wake.wanted) { p.set("wake", String(wake.minutes)); }
            return url.toString();
        },

        share: function (text) {
            const link = exporters.buildLink({ text: text, includeWake: true });
            if (navigator.share) {
                navigator.share({ title: "Phonetic Alphabet Studio", url: link }).catch(function (err) {
                    // User dismissing the share sheet is not a failure; only
                    // fall back to the clipboard when sharing really broke.
                    if (!err || err.name !== "AbortError") { PAS.copy(link); }
                });
                return;
            }
            PAS.copy(link).then(function (ok) {
                if (ok) { PAS.toast(PAS.t("t.linkCopied")); }
            });
        }
    };

    PAS.exporters = exporters;
})(window, document);
