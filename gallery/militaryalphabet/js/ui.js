/* ============================================================
   Phonetic Alphabet Studio — shell UI
   Alphabet, theme and language selection, sound, voice settings, tabs,
   the reference tables, keyboard shortcuts and the clock.
   Presentation mode lives in js/ui-present.js.
   ============================================================ */
(function (window, document) {
    "use strict";

    const PAS = window.PAS = window.PAS || {};
    const KEYS = PAS.KEYS;

    let muted = true;

    /* ============================================================
       Alphabet & theme
       ============================================================ */
    function alphabetName(a) { return PAS.t("alpha." + a.id + ".name", null, a.name); }

    function applyAlphabet(id, save) {
        const found = PAS.getAlphabet(id) || PAS.getAlphabet(PAS.DEFAULT_ALPHABET);
        PAS.translator.setAlphabet(found);
        PAS.speech.setLang(found.lang);
        PAS.grid.render();

        const note = PAS.$("alphaNote");
        if (note) {
            note.innerHTML = "<strong>" + PAS.escapeHtml(alphabetName(found)) + "</strong> \u2014 " +
                PAS.escapeHtml(PAS.t("alpha." + found.id + ".note", null, found.note));
        }
        const sel = PAS.$("alphabetSelect");
        if (sel && sel.value !== found.id) { sel.value = found.id; }
        const count = PAS.$("alphaCount");
        if (count) { count.textContent = PAS.t("ctl.symbols", { n: PAS.translator.entries().length }); }

        if (save) { PAS.store(KEYS.alphabet, found.id); }
        PAS.emit("alphabet:change", found);
    }

    function applyTheme(id, save) {
        const theme = PAS.THEMES.indexOf(id) >= 0 ? id : PAS.DEFAULT_THEME;
        document.documentElement.setAttribute("data-theme", theme);
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
            if (bg) { meta.setAttribute("content", bg); }
        }
        const sel = PAS.$("themeSelect");
        if (sel && sel.value !== theme) { sel.value = theme; }
        if (save) { PAS.store(KEYS.theme, theme); }
    }

    function buildSelectors() {
        const aSel = PAS.$("alphabetSelect");
        const groups = {};
        PAS.ALPHABETS.forEach(function (a) {
            if (!groups[a.group]) {
                const og = document.createElement("optgroup");
                og.dataset.group = a.group;
                og.label = PAS.t("group." + a.group, null, a.group);
                aSel.appendChild(og);
                groups[a.group] = og;
            }
            const opt = document.createElement("option");
            opt.value = a.id;
            opt.textContent = alphabetName(a);
            groups[a.group].appendChild(opt);
        });

        const tSel = PAS.$("themeSelect");
        PAS.THEMES.forEach(function (id) {
            const opt = document.createElement("option");
            opt.value = id;
            opt.textContent = PAS.t("theme." + id);
            tSel.appendChild(opt);
        });

        const lSel = PAS.$("langSelect");
        PAS.LANGUAGES.forEach(function (l) {
            const opt = document.createElement("option");
            opt.value = l.id;
            opt.textContent = l.name;
            lSel.appendChild(opt);
        });
    }

    /* ============================================================
       Mute
       ============================================================ */
    function setMute(state, save) {
        muted = !!state;
        PAS.speech.setMuted(muted);
        const btn = PAS.$("muteToggle");
        if (btn) {
            btn.classList.toggle("on", !muted);
            btn.classList.toggle("off", muted);
            btn.setAttribute("aria-pressed", muted ? "true" : "false");
            PAS.$("muteText").textContent = PAS.t(muted ? "sound.off" : "sound.on");
            PAS.$("mutePip").textContent = muted ? "\uD83D\uDD07" : "\uD83D\uDD0A";
        }
        if (save) { PAS.storeBool(KEYS.muted, muted); }
    }

    /* ============================================================
       Voice settings
       ============================================================ */
    function fillVoices() {
        const sel = PAS.$("voiceSelect");
        if (!sel) { return; }
        const voices = PAS.speech.voices();
        const chosen = PAS.speech.getVoice();
        sel.innerHTML = "";

        const auto = document.createElement("option");
        auto.value = "";
        auto.textContent = PAS.t("voice.auto");
        sel.appendChild(auto);

        voices.forEach(function (v) {
            const opt = document.createElement("option");
            opt.value = v.voiceURI;
            opt.textContent = v.name + " (" + v.lang + ")";
            sel.appendChild(opt);
        });
        sel.value = chosen || "";
        sel.disabled = !voices.length;
    }

    function bindRange(id, labelId, apply, suffix) {
        const range = PAS.$(id);
        const label = PAS.$(labelId);
        if (!range) { return; }
        const paint = function () {
            apply(range.value);
            if (label) { label.textContent = range.value + (suffix || ""); }
        };
        range.addEventListener("input", paint);
        paint();
    }

    /* ============================================================
       Tabs
       ============================================================ */
    function showTab(name, save, focusSearch) {
        const tabs = PAS.$$(".tab");
        const known = tabs.some(function (t) { return t.dataset.tab === name; });
        const target = known ? name : "translate";
        tabs.forEach(function (tab) {
            const on = tab.dataset.tab === target;
            tab.classList.toggle("is-active", on);
            tab.setAttribute("aria-selected", on ? "true" : "false");
            tab.tabIndex = on ? 0 : -1;
        });
        PAS.$$(".tab-panel").forEach(function (panel) {
            panel.hidden = panel.dataset.panel !== target;
        });
        if (save) { PAS.store(KEYS.tab, target); }
        if (target === "chart" && focusSearch) {
            const search = PAS.$("gridSearch");
            if (search) { search.focus(); }
        }
    }

    /* ============================================================
       Reference tables
       ============================================================ */
    function buildReference() {
        const render = function (hostId, rows, prefix, termClass) {
            const host = PAS.$(hostId);
            if (!host) { return; }
            const frag = document.createDocumentFragment();
            host.innerHTML = "";
            rows.forEach(function (row) {
                const dt = document.createElement("dt");
                dt.className = termClass || "";
                dt.textContent = row.term;
                const dd = document.createElement("dd");
                dd.textContent = PAS.t(prefix + row.key, null, row.text);
                frag.appendChild(dt);
                frag.appendChild(dd);
            });
            host.appendChild(frag);
        };

        const plain = function (rows) {
            return rows.map(function (r) { return { term: r[0], key: r[0], text: r[1] }; });
        };

        render("prowordList", plain(PAS.PROWORDS), "pw.");
        render("qcodeList", plain(PAS.QCODES), "q.");
        render("tencodeList", plain(PAS.TENCODES), "ten.");
        render("punctList", PAS.PUNCTUATION.map(function (p) {
            return { term: p[0] + "  " + p[1], key: p[1], text: p[2] };
        }), "punct.", "is-symbol");
    }

    /* ============================================================
       Keyboard shortcuts
       ============================================================ */
    function closeTopmost() {
        if (PAS.uiPresent.isOpen()) { PAS.uiPresent.open(false); return true; }
        if (!PAS.$("shortcutsOverlay").hidden) { PAS.$("shortcutsOverlay").hidden = true; return true; }
        if (PAS.uiWake.isPanelOpen()) { PAS.uiWake.closePanel(); return true; }
        return false;
    }

    function onKey(e) {
        if (e.key === "Escape") {
            if (closeTopmost()) { e.preventDefault(); }
            return;
        }
        if (PAS.uiPresent.isOpen()) {
            PAS.uiPresent.handleKey(e);
            return;
        }
        if (e.ctrlKey || e.metaKey || e.altKey || PAS.isTyping()) { return; }

        const key = e.key.toLowerCase();
        const actions = {
            "s": function () { PAS.uiTranslate.speak(); },
            "c": function () { PAS.uiTranslate.copy(); },
            "x": function () { PAS.$("dirToggle").click(); },
            "m": function () { setMute(!muted, true); PAS.toast(PAS.t(muted ? "t.soundOff" : "t.soundOn")); },
            "w": function () { PAS.wake.toggle(); },
            "t": function () { PAS.uiWake.togglePanel(); },
            "p": function () { PAS.uiPresent.open(true); },
            "/": function () { showTab("chart", true, true); },
            "1": function () { showTab("translate", true); },
            "2": function () { showTab("chart", true); },
            "3": function () { showTab("practice", true); },
            "4": function () { showTab("codes", true); }
        };

        if (e.key === "?" || (e.shiftKey && key === "/")) {
            e.preventDefault();
            PAS.$("shortcutsOverlay").hidden = false;
            return;
        }
        if (actions[key]) {
            e.preventDefault();
            actions[key]();
        }
    }

    /* ============================================================
       Clock & easter egg
       ============================================================ */
    function tickClock() {
        const c = PAS.$("clock");
        if (c) { c.textContent = new Date().toLocaleTimeString("en-GB", { hour12: false }); }
    }

    function konami() {
        const seq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
        let buf = [];
        document.addEventListener("keydown", function (e) {
            buf.push(e.key);
            buf = buf.slice(-seq.length);
            if (buf.join(",") === seq.join(",")) {
                document.body.style.animation = "matrix 2s ease-in-out";
                PAS.toast(PAS.t("t.konami"));
                setTimeout(function () { document.body.style.animation = ""; }, 2000);
            }
        });
    }

    /* ============================================================
       Interface language
       ============================================================ */
    function applyLanguage(lang, save, announce) {
        PAS.i18n.set(lang, save);
        const sel = PAS.$("langSelect");
        if (sel && sel.value !== PAS.i18n.current()) { sel.value = PAS.i18n.current(); }
        if (announce) { PAS.toast(PAS.t("t.langChanged", { lang: PAS.i18n.name() })); }
    }

    /* Everything that is painted from JS rather than from data-i18n. */
    function relabel() {
        PAS.$$("#alphabetSelect optgroup").forEach(function (og) {
            og.label = PAS.t("group." + og.dataset.group, null, og.dataset.group);
        });
        PAS.$$("#alphabetSelect option").forEach(function (opt) {
            const a = PAS.getAlphabet(opt.value);
            if (a) { opt.textContent = alphabetName(a); }
        });
        PAS.$$("#themeSelect option").forEach(function (opt) {
            opt.textContent = PAS.t("theme." + opt.value);
        });
        applyAlphabet(PAS.translator.alphabet().id, false);
        setMute(muted, false);
        fillVoices();
        buildReference();
        PAS.quiz.relabel();
        PAS.uiPresent.relabel();
    }

    /* ============================================================
       Init
       ============================================================ */
    PAS.ui = {
        showTab: showTab,
        tick: tickClock,

        init: function () {
            buildSelectors();
            buildReference();

            /* ---- interface language (already resolved in app.js) ---- */
            PAS.$("langSelect").value = PAS.i18n.current();
            PAS.$("langSelect").addEventListener("change", function () {
                applyLanguage(this.value, true, true);
            });
            PAS.on("lang:change", relabel);

            /* ---- theme ---- */
            applyTheme(PAS.param("t") || PAS.load(KEYS.theme, PAS.DEFAULT_THEME), false);
            PAS.$("themeSelect").addEventListener("change", function () { applyTheme(this.value, true); });

            /* ---- alphabet (URL > saved > browser language > NATO) ---- */
            let startAlphabet = PAS.param("a") || PAS.load(KEYS.alphabet);
            if (!startAlphabet && !PAS.loadBool(KEYS.seen, false)) {
                const guess = PAS.alphabetForLanguage(navigator.language);
                if (guess) { startAlphabet = guess.id; }
            }
            PAS.storeBool(KEYS.seen, true);
            applyAlphabet(startAlphabet || PAS.DEFAULT_ALPHABET, false);
            PAS.$("alphabetSelect").addEventListener("change", function () {
                applyAlphabet(this.value, true);
                PAS.quiz.refresh();
            });

            /* ---- sound (default: muted) ---- */
            setMute(PAS.loadBool(KEYS.muted, true), false);
            PAS.$("muteToggle").addEventListener("click", function () {
                setMute(!muted, true);
                PAS.toast(muted ? "\uD83D\uDD07 Sound muted" : "\uD83D\uDD0A Sound enabled");
            });

            /* ---- voice settings ---- */
            PAS.speech.setVoice(PAS.load(KEYS.voice, ""));
            fillVoices();
            PAS.on("voices", fillVoices);
            PAS.$("voiceSelect").addEventListener("change", function () {
                PAS.speech.setVoice(this.value);
                PAS.store(KEYS.voice, this.value);
            });

            PAS.$("rateRange").value = PAS.loadNum(KEYS.rate, 0.92);
            PAS.$("pitchRange").value = PAS.loadNum(KEYS.pitch, 1);
            PAS.$("gapRange").value = PAS.loadNum(KEYS.gap, 180);
            bindRange("rateRange", "rateValue", function (v) {
                PAS.speech.setRate(v);
                PAS.store(KEYS.rate, v);
            }, "\u00D7");
            bindRange("pitchRange", "pitchValue", function (v) {
                PAS.speech.setPitch(v);
                PAS.store(KEYS.pitch, v);
            }, "\u00D7");
            bindRange("gapRange", "gapValue", function (v) {
                PAS.speech.setGap(v);
                PAS.store(KEYS.gap, v);
            }, " ms");

            /* ---- tabs ---- */
            const tabs = PAS.$$(".tab");
            tabs.forEach(function (tab) {
                tab.addEventListener("click", function () { showTab(tab.dataset.tab, true); });
            });
            // Arrow keys move between tabs, as the ARIA tab pattern expects.
            document.querySelector(".tabs").addEventListener("keydown", function (e) {
                const keys = { ArrowLeft: -1, ArrowRight: 1 };
                if (!(e.key in keys) && e.key !== "Home" && e.key !== "End") { return; }
                e.preventDefault();
                const index = tabs.indexOf(document.activeElement);
                if (index < 0) { return; }
                let next = e.key === "Home" ? 0 : (e.key === "End" ? tabs.length - 1 : index + keys[e.key]);
                next = (next + tabs.length) % tabs.length;
                showTab(tabs[next].dataset.tab, true);
                tabs[next].focus();
            });
            showTab(PAS.load(KEYS.tab, "translate"), false);

            /* ---- chart tools ---- */
            const search = PAS.$("gridSearch");
            search.addEventListener("input", function () {
                const q = search.value.trim();
                PAS.grid.filter(q);
                if (Array.from(q).length === 1) { PAS.grid.jumpTo(q.toUpperCase()); }
            });
            PAS.$("gridSearchClear").addEventListener("click", function () {
                search.value = "";
                PAS.grid.filter("");
                search.focus();
            });

            const morseBox = PAS.$("morseToggle");
            morseBox.checked = PAS.loadBool(KEYS.morseRow, true);
            PAS.grid.setMorse(morseBox.checked);
            morseBox.addEventListener("change", function () {
                PAS.grid.setMorse(morseBox.checked);
                PAS.storeBool(KEYS.morseRow, morseBox.checked);
            });

            PAS.$("printBtn").addEventListener("click", PAS.exporters.print);
            PAS.$("csvBtn").addEventListener("click", PAS.exporters.csv);
            PAS.$("jsonBtn").addEventListener("click", PAS.exporters.json);

            /* ---- shortcuts overlay ---- */
            PAS.$("shortcutsToggle").addEventListener("click", function () {
                PAS.$("shortcutsOverlay").hidden = false;
            });
            PAS.$("shortcutsClose").addEventListener("click", function () {
                PAS.$("shortcutsOverlay").hidden = true;
            });

            document.addEventListener("keydown", onKey);

            tickClock();
            konami();
        }
    };
})(window, document);
