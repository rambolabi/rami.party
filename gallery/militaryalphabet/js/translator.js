/* ============================================================
   Phonetic Alphabet Studio — translator engine
   Text -> phonetic tokens, phonetic -> text, output formatting and
   the recent-translation history. Pure logic: it never touches the DOM.
   ============================================================ */
(function (window) {
    "use strict";

    const PAS = window.PAS = window.PAS || {};
    const KEYS = PAS.KEYS;
    const HISTORY_MAX = 20;

    let alphabet = null;
    let MAP = {};          // char (and Latin alias) -> entry
    let REVERSE = {};      // normalised code word -> char
    let REVERSE_SPAN = 1;  // longest code word, in whitespace-separated words

    /* Code words are matched on letters and digits only, so "X-RAY", "X RAY"
       and "XRAY" all resolve to the same entry — and so do multi-word entries
       like NEW YORK, ENKEL-V or ТВЁРДЫЙ ЗНАК. */
    function normKey(s) {
        return String(s).toUpperCase().replace(/[^\p{L}\p{N}]/gu, "");
    }

    function addReverse(word, char) {
        const key = normKey(word);
        if (!key) { return; }
        if (!Object.prototype.hasOwnProperty.call(REVERSE, key)) { REVERSE[key] = char; }
        REVERSE_SPAN = Math.max(REVERSE_SPAN, String(word).trim().split(/\s+/).length);
    }

    function titleCase(word) {
        return String(word).toLowerCase().replace(/(^|[\s\-])(\p{L})/gu, function (m, sep, ch) {
            return sep + ch.toUpperCase();
        });
    }

    /* Turn a list of spoken words back into characters. Tries the longest run
       of words first, then falls back to splitting a single token on hyphens. */
    function decode(tokens) {
        let out = "";
        let i = 0;

        while (i < tokens.length) {
            if (tokens[i] === "/") { out += " "; i++; continue; }

            let matched = false;
            const maxSpan = Math.min(REVERSE_SPAN, tokens.length - i);
            for (let span = maxSpan; span >= 1; span--) {
                const slice = tokens.slice(i, i + span);
                if (slice.indexOf("/") >= 0) { continue; }
                const key = normKey(slice.join(""));
                if (key && Object.prototype.hasOwnProperty.call(REVERSE, key)) {
                    out += REVERSE[key];
                    i += span;
                    matched = true;
                    break;
                }
            }
            if (matched) { continue; }

            // ALFA-BRAVO is two letters; ENKEL-V is one and was matched above.
            const parts = tokens[i].split(/[-\u2010-\u2015]+/).filter(Boolean);
            if (parts.length > 1) {
                out += decode(parts);
                i++;
                continue;
            }

            const bare = normKey(tokens[i]);
            if (bare) {
                out += (Array.from(bare).length === 1 || /^\p{N}+$/u.test(bare)) ? bare : "[" + bare + "]";
            }
            i++;
        }

        return out;
    }

    /* ---------- Output formats (labels live in js/i18n.js as fmt.<id>) ---------- */
    PAS.FORMATS = ["words", "hyphen", "comma", "asin", "pron", "letters", "morse"];
    PAS.DEFAULT_FORMAT = "words";

    function morseFor(entry) {
        const direct = PAS.MORSE[entry[0]];
        if (direct) { return direct; }
        const alias = entry[3] ? entry[3].charAt(0) : "";
        return alias ? (PAS.MORSE[alias] || "") : "";
    }

    const translator = {
        setAlphabet: function (a) {
            alphabet = a;
            MAP = {};
            REVERSE = {};
            REVERSE_SPAN = 1;
            a.letters.concat(a.digits).forEach(function (entry) {
                MAP[entry[0]] = entry;
                const upper = entry[0].toUpperCase();
                if (upper !== entry[0]) { MAP[upper] = entry; }
                if (entry[3]) {
                    entry[3].split("").forEach(function (key) {
                        const k = key.toUpperCase();
                        if (!Object.prototype.hasOwnProperty.call(MAP, k)) { MAP[k] = entry; }
                    });
                }
                addReverse(entry[1], entry[0]);
                // Accepted alternate spellings, e.g. ALPHA for the official ALFA.
                (entry[4] || []).forEach(function (alt) { addReverse(alt, entry[0]); });
            });
            // Punctuation names decode back to their symbol too.
            PAS.PUNCTUATION.forEach(function (p) { addReverse(p[1], p[0]); });
        },

        alphabet: function () { return alphabet; },
        entries: function () { return alphabet.letters.concat(alphabet.digits); },
        lookup: function (ch) { return MAP[ch] || null; },
        morseFor: morseFor,

        /* ---------- Text -> tokens ----------
           Token: { type, char, word, pron, morse }
           type: "code" | "punct" | "literal" | "space" */
        tokenize: function (text, opts) {
            opts = opts || {};
            let raw = String(text || "");
            if (opts.callsign) {
                // Callsigns are read as one unbroken group: drop spaces and punctuation.
                raw = raw.replace(/[^\p{L}\p{N}]+/gu, "");
            }
            const chars = Array.from(raw);
            const tokens = [];

            chars.forEach(function (ch) {
                if (/\s/.test(ch)) {
                    if (tokens.length && tokens[tokens.length - 1].type !== "space") {
                        tokens.push({ type: "space", char: " ", word: "", pron: "", morse: "" });
                    }
                    return;
                }

                const up = ch.toUpperCase();
                const entry = MAP[up] || MAP[ch];
                if (entry) {
                    tokens.push({
                        type: "code", char: entry[0], word: entry[1],
                        pron: entry[2] || "", morse: morseFor(entry)
                    });
                    return;
                }

                if (Object.prototype.hasOwnProperty.call(PAS.PUNCT_MAP, ch)) {
                    tokens.push({
                        type: "punct", char: ch, word: PAS.PUNCT_MAP[ch],
                        pron: PAS.PUNCT_MAP[ch].toLowerCase(), morse: PAS.MORSE[ch] || ""
                    });
                    return;
                }

                // Accented or exotic letter: fold to its base letters (é -> E, ß -> SS).
                // No guard against folded === up: "ß".toUpperCase() is already "SS",
                // and we only get here once a direct lookup has failed anyway.
                const folded = PAS.foldChar(ch);
                if (folded) {
                    const parts = folded.split("").map(function (f) { return MAP[f]; }).filter(Boolean);
                    if (parts.length === folded.length) {
                        tokens.push({
                            type: "code", char: ch, folded: folded,
                            word: parts.map(function (p) { return p[1]; }).join(" "),
                            pron: parts.map(function (p) { return p[2]; }).join(" "),
                            morse: parts.map(morseFor).join(" ")
                        });
                        return;
                    }
                }

                tokens.push({ type: "literal", char: ch, word: ch, pron: "", morse: "" });
            });

            while (tokens.length && tokens[tokens.length - 1].type === "space") { tokens.pop(); }
            return tokens;
        },

        /* ---------- Tokens -> a copyable string ---------- */
        format: function (tokens, fmt) {
            if (!tokens.length) { return ""; }
            const words = [];
            const groups = [];
            let group = [];

            tokens.forEach(function (t) {
                if (t.type === "space") {
                    if (group.length) { groups.push(group); group = []; }
                    return;
                }
                group.push(t);
            });
            if (group.length) { groups.push(group); }

            function render(list) {
                switch (fmt) {
                    case "hyphen":
                        return list.map(function (t) { return t.word; }).join("-");
                    case "comma":
                        return list.map(function (t) { return t.word; }).join(", ");
                    case "asin":
                        return list.map(function (t) {
                            if (t.type !== "code") { return t.word; }
                            return t.char + PAS.t("fmt.asinJoin") + titleCase(t.word);
                        }).join(", ");
                    case "pron":
                        return list.map(function (t) {
                            return t.pron ? t.word + " (" + t.pron + ")" : t.word;
                        }).join(" ");
                    case "letters":
                        return list.map(function (t) { return t.char; }).join("-");
                    case "morse":
                        return list.map(function (t) { return t.morse || t.char; }).join(" ");
                    default:
                        return list.map(function (t) { return t.word; }).join(" ");
                }
            }

            groups.forEach(function (g) { words.push(render(g)); });
            return words.join("  /  ").trim();
        },

        /* ---------- Phonetic -> text ----------
           Greedy longest-match so multi-word code words (NEW YORK, ENKEL-V,
           ТВЁРДЫЙ ЗНАК, QUESTION MARK) decode correctly, while a hyphenated
           run like ALFA-BRAVO still splits into two letters. */
        reverse: function (text) {
            let raw = String(text || "");

            // Drop the "(PRONUNCIATION)" hints emitted by the pron format.
            raw = raw.replace(/\([^)]*\)/g, " ");

            // "A as in Alfa" / "A comme Alfa" / "A als in Alfa" -> "Alfa"
            raw = raw.replace(
                /(^|[\s,;])[\p{L}\p{N}]\s+(?:as\s+in|comme|als\s+in)\s+/giu,
                "$1"
            );

            const tokens = raw.replace(/[,;]+/g, " ").split(/\s+|(\/)/).filter(Boolean);
            return decode(tokens).replace(/\s{2,}/g, " ").trim();
        },

        /* ---------- Parts for letter-by-letter speech ---------- */
        speechParts: function (tokens) {
            return tokens.filter(function (t) { return t.type !== "space"; })
                .map(function (t, i) { return { text: t.word, index: i, token: t }; });
        },

        /* ---------- Recent translations ---------- */
        history: function () { return PAS.loadJSON(KEYS.history, []) || []; },

        addHistory: function (text, direction) {
            const clean = String(text || "").trim();
            if (!clean) { return; }
            let list = translator.history().filter(function (h) {
                return !(h.text === clean && h.dir === direction && h.alphabet === alphabet.id);
            });
            list.unshift({ text: clean, dir: direction, alphabet: alphabet.id, at: Date.now() });
            list = list.slice(0, HISTORY_MAX);
            PAS.storeJSON(KEYS.history, list);
            PAS.emit("history:change", list);
        },

        clearHistory: function () {
            PAS.remove(KEYS.history);
            PAS.emit("history:change", []);
        },

        /* ---------- Data export ---------- */
        toCSV: function () {
            const rows = [["character", "code word", "pronunciation", "morse"]];
            translator.entries().forEach(function (e) {
                rows.push([e[0], e[1], e[2] || "", morseFor(e)]);
            });
            return rows.map(function (r) {
                return r.map(function (cell) { return '"' + String(cell).replace(/"/g, '""') + '"'; }).join(",");
            }).join("\r\n");
        },

        toJSON: function () {
            return JSON.stringify({
                id: alphabet.id,
                name: alphabet.name,
                group: alphabet.group,
                lang: alphabet.lang,
                note: alphabet.note,
                entries: translator.entries().map(function (e) {
                    return { char: e[0], word: e[1], pronunciation: e[2] || "", morse: morseFor(e) };
                })
            }, null, 2);
        }
    };

    PAS.translator = translator;
})(window);
