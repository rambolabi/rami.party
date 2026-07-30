/* ============================================================
   Phonetic Alphabet Studio — translator UI
   The TRANSLATE tab: both directions, output formats, callsign mode,
   speak-along highlighting, voice dictation and the recent history.
   ============================================================ */
(function (window, document) {
    "use strict";

    const PAS = window.PAS = window.PAS || {};
    const KEYS = PAS.KEYS;

    let direction = "to";        // "to" = text -> phonetic, "from" = phonetic -> text
    let format = PAS.DEFAULT_FORMAT;
    let callsign = false;
    let tokens = [];
    let lastOutput = "";
    let recognition = null;

    function chipFor(token, index) {
        const chip = document.createElement("span");
        chip.dataset.index = String(index);
        if (token.type === "code") {
            chip.className = "chip";
            chip.dataset.char = token.char;
            chip.innerHTML = '<span class="chip-char">' + PAS.escapeHtml(token.char) + '</span>' +
                '<span class="chip-word">' + PAS.escapeHtml(token.word) + '</span>' +
                (token.pron ? '<span class="chip-pron">' + PAS.escapeHtml(token.pron) + '</span>' : "");
            chip.title = PAS.t("chip.hear", { word: token.word });
            chip.addEventListener("click", function () {
                PAS.speech.speak(token.word, { lang: PAS.translator.alphabet().lang, explicit: true });
                PAS.grid.flash(token.char);
            });
        } else if (token.type === "punct") {
            chip.className = "chip is-punct";
            chip.innerHTML = '<span class="chip-char">' + PAS.escapeHtml(token.char) + '</span>' +
                '<span class="chip-word">' + PAS.escapeHtml(token.word) + '</span>';
        } else {
            chip.className = "chip is-literal";
            chip.innerHTML = '<span class="chip-word">' + PAS.escapeHtml(token.char) + '</span>';
        }
        return chip;
    }

    function renderForward(text) {
        const output = PAS.$("output");
        tokens = PAS.translator.tokenize(text, { callsign: callsign });
        output.innerHTML = "";
        output.classList.remove("is-text");

        if (!tokens.length) {
            const empty = document.createElement("span");
            empty.className = "output-empty";
            empty.textContent = PAS.t("out.emptyTo");
            output.appendChild(empty);
            return "";
        }

        const frag = document.createDocumentFragment();
        let index = 0;
        tokens.forEach(function (token) {
            if (token.type === "space") {
                const br = document.createElement("span");
                br.className = "chip is-space";
                frag.appendChild(br);
                return;
            }
            frag.appendChild(chipFor(token, index++));
        });
        output.appendChild(frag);
        return PAS.translator.format(tokens, format);
    }

    function renderReverse(text) {
        const output = PAS.$("output");
        tokens = [];
        output.innerHTML = "";
        output.classList.add("is-text");

        const decoded = PAS.translator.reverse(text);
        if (!decoded) {
            const empty = document.createElement("span");
            empty.className = "output-empty";
            empty.textContent = PAS.t("out.emptyFrom");
            output.appendChild(empty);
            return "";
        }
        const box = document.createElement("span");
        box.className = "reverse-out";
        box.textContent = decoded;
        output.appendChild(box);
        return decoded;
    }

    function render() {
        const text = PAS.$("input").value;
        lastOutput = direction === "to" ? renderForward(text) : renderReverse(text);
        const meter = PAS.$("outputMeter");
        if (meter) {
            const count = direction === "to"
                ? tokens.filter(function (t) { return t.type !== "space"; }).length
                : lastOutput.length;
            meter.textContent = count
                ? PAS.t(direction === "to" ? "out.symbols" : "out.characters", { n: count })
                : "";
        }
        return lastOutput;
    }

    function setDirection(dir, save) {
        direction = dir === "from" ? "from" : "to";
        const btn = PAS.$("dirToggle");
        btn.textContent = PAS.t(direction === "to" ? "dir.to" : "dir.from");
        btn.setAttribute("aria-label", PAS.t("dir.aria", { dir: btn.textContent }));
        PAS.$("input").placeholder = PAS.t(direction === "to" ? "ph.to" : "ph.from");
        PAS.$("formatField").hidden = direction === "from";
        PAS.$("callsignField").hidden = direction === "from";
        if (save) { PAS.store(KEYS.direction, direction); }
        render();
    }

    function speakOutput() {
        if (direction === "from") {
            if (!lastOutput) { PAS.toast(PAS.t("t.nothingSpeak")); return; }
            PAS.speech.speak(lastOutput.split("").join(" "), { explicit: true });
            return;
        }
        const parts = PAS.translator.speechParts(tokens);
        if (!parts.length) { PAS.toast(PAS.t("t.nothingSpeak")); return; }
        PAS.speech.speakSequence(parts, {
            lang: PAS.translator.alphabet().lang,
            explicit: true,
            onDone: function () { clearHighlight(); }
        });
    }

    function clearHighlight() {
        PAS.$$("#output .chip.speaking").forEach(function (c) { c.classList.remove("speaking"); });
        PAS.grid.clearHighlights();
    }

    /* ---------- Recent translations ---------- */
    function renderHistory(list) {
        const host = PAS.$("historyList");
        if (!host) { return; }
        list = list || PAS.translator.history();
        host.innerHTML = "";
        if (!list.length) {
            host.innerHTML = '<li class="history-empty"></li>';
            host.firstChild.textContent = PAS.t("hist.empty");
            return;
        }
        list.forEach(function (item) {
            const li = document.createElement("li");
            li.className = "history-item";

            const label = document.createElement("button");
            label.type = "button";
            label.className = "history-text";
            label.textContent = item.text;
            label.title = PAS.t("hist.load");
            label.addEventListener("click", function () {
                PAS.$("input").value = item.text;
                setDirection(item.dir, true);
                render();
            });

            const copyBtn = document.createElement("button");
            copyBtn.type = "button";
            copyBtn.className = "history-copy";
            copyBtn.textContent = "\u29C9";
            copyBtn.title = PAS.t("hist.copy");
            copyBtn.setAttribute("aria-label", PAS.t("hist.copyAria", { text: item.text }));
            copyBtn.addEventListener("click", function () {
                const t = PAS.translator.tokenize(item.text, { callsign: callsign });
                PAS.copy(PAS.translator.format(t, format));
            });

            li.appendChild(label);
            li.appendChild(copyBtn);
            host.appendChild(li);
        });
    }

    /* ---------- Voice dictation ---------- */
    function setupRecognition() {
        const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
        const micBtn = PAS.$("micBtn");
        if (!Ctor) { micBtn.hidden = true; return; }

        micBtn.addEventListener("click", function () {
            if (recognition) { recognition.stop(); return; }
            recognition = new Ctor();
            recognition.lang = PAS.translator.alphabet().lang;
            recognition.interimResults = false;
            recognition.continuous = false;
            micBtn.classList.add("is-live");
            PAS.toast(PAS.t("t.listening"));

            recognition.onresult = function (e) {
                const transcript = Array.prototype.slice.call(e.results)
                    .map(function (r) { return r[0].transcript; }).join(" ").trim();
                if (!transcript) { return; }
                PAS.$("input").value = transcript;
                setDirection("from", true);
                render();
                PAS.toast(PAS.t("t.heard", { text: transcript }));
            };
            recognition.onerror = function (e) {
                PAS.toast(PAS.t(e.error === "not-allowed" ? "t.micBlocked" : "t.micFailed"));
            };
            recognition.onend = function () {
                micBtn.classList.remove("is-live");
                recognition = null;
            };
            try { recognition.start(); }
            catch (err) { micBtn.classList.remove("is-live"); recognition = null; }
        });
    }

    PAS.uiTranslate = {
        speak: speakOutput,
        setText: function (text) {
            PAS.$("input").value = text;
            render();
        },

        copy: function () {
            const str = render();
            if (!str) { PAS.toast(PAS.t("t.nothingCopy")); return; }
            PAS.copy(str);
            PAS.translator.addHistory(PAS.$("input").value, direction);
        },

        init: function () {
            const input = PAS.$("input");
            const formatSel = PAS.$("formatSelect");

            PAS.FORMATS.forEach(function (id) {
                const opt = document.createElement("option");
                opt.value = id;
                opt.textContent = PAS.t("fmt." + id);
                formatSel.appendChild(opt);
            });
            format = PAS.load(KEYS.format, PAS.DEFAULT_FORMAT);
            if (PAS.FORMATS.indexOf(format) < 0) { format = PAS.DEFAULT_FORMAT; }
            formatSel.value = format;
            formatSel.addEventListener("change", function () {
                format = formatSel.value;
                PAS.store(KEYS.format, format);
                render();
            });

            callsign = PAS.loadBool(KEYS.callsign, false);
            const callsignBox = PAS.$("callsignToggle");
            callsignBox.checked = callsign;
            callsignBox.addEventListener("change", function () {
                callsign = callsignBox.checked;
                PAS.storeBool(KEYS.callsign, callsign);
                render();
            });

            input.addEventListener("input", render);
            PAS.$("dirToggle").addEventListener("click", function () {
                // Swapping keeps the work: the output becomes the new input.
                const swapped = lastOutput;
                setDirection(direction === "to" ? "from" : "to", true);
                if (swapped) { input.value = swapped; render(); }
            });

            PAS.$("speakBtn").addEventListener("click", speakOutput);
            PAS.$("copyBtn").addEventListener("click", PAS.uiTranslate.copy);
            PAS.$("clearBtn").addEventListener("click", function () {
                input.value = "";
                render();
                input.focus();
            });
            PAS.$("shareBtn").addEventListener("click", function () {
                PAS.exporters.share(input.value);
                PAS.translator.addHistory(input.value, direction);
            });
            PAS.$("imageBtn").addEventListener("click", function () {
                PAS.exporters.copyImage(render());
            });

            setupRecognition();

            PAS.on("speech:part", function (part) {
                PAS.$$("#output .chip.speaking").forEach(function (c) { c.classList.remove("speaking"); });
                const chip = PAS.$$("#output .chip").filter(function (c) {
                    return c.dataset.index === String(part.index);
                })[0];
                if (chip) { chip.classList.add("speaking"); }
                if (part.token && part.token.type === "code") { PAS.grid.highlight(part.token.char); }
            });
            PAS.on("speech:end", clearHighlight);
            PAS.on("history:change", renderHistory);
            PAS.on("alphabet:change", render);
            PAS.on("lang:change", function () {
                PAS.$$("option", formatSel).forEach(function (opt) {
                    opt.textContent = PAS.t("fmt." + opt.value);
                });
                setDirection(direction, false);
                renderHistory();
            });

            PAS.$("historyClear").addEventListener("click", function () {
                PAS.translator.clearHistory();
                PAS.toast(PAS.t("t.historyCleared"));
            });

            setDirection(PAS.load(KEYS.direction, "to"), false);
            renderHistory();
        }
    };
})(window, document);
