/* ============================================================
   Phonetic Alphabet Studio — practice mode
   Four drills over the active alphabet: letter -> word, word -> letter,
   listen -> letter, and "spell this word". Keeps score, streak and a
   per-mode best streak, with an optional 60-second timed run.
   ============================================================ */
(function (window, document) {
    "use strict";

    const PAS = window.PAS = window.PAS || {};
    const KEYS = PAS.KEYS;
    const ROUND_MS = 60000;
    const OPTIONS = 4;

    PAS.QUIZ_MODES = ["letter2word", "word2letter", "listen", "spell"];

    const q = {
        mode: "letter2word",
        running: false,
        score: 0,
        asked: 0,
        streak: 0,
        best: 0,
        timed: false,
        endsAt: 0,
        queue: [],
        current: null,
        locked: false,
        lastReason: ""
    };

    function bestKey(mode) { return KEYS.quizBest + "." + mode; }

    function loadBest(mode) { return parseInt(PAS.load(bestKey(mode), "0"), 10) || 0; }

    function saveBest(mode, value) { PAS.store(bestKey(mode), String(value)); }

    function setText(id, value) {
        const el = PAS.$(id);
        if (el) { el.textContent = value; }
    }

    function renderStats() {
        setText("quizScore", q.score + " / " + q.asked);
        setText("quizStreak", String(q.streak));
        setText("quizBest", String(q.best));
        const timer = PAS.$("quizTimer");
        if (timer) {
            timer.hidden = !q.timed || !q.running;
            if (q.timed && q.running) {
                timer.textContent = PAS.fmtCountdown(Math.max(0, q.endsAt - Date.now()));
            }
        }
    }

    function optionButton(label, value, isChar) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quiz-option" + (isChar ? " is-char" : "");
        btn.textContent = label;
        btn.dataset.value = value;
        btn.addEventListener("click", function () { answer(btn); });
        return btn;
    }

    /* Wrong answers must differ in BOTH character and code word: some tables
       reuse a word (Western Union spells Z and 0 as ZERO), which would
       otherwise offer two identical buttons or two correct characters. */
    function distractors(entry, entries) {
        const word = String(entry[1]).toUpperCase();
        const pool = entries.filter(function (e) {
            return e[0] !== entry[0] && String(e[1]).toUpperCase() !== word;
        });
        return PAS.shuffle(pool).slice(0, OPTIONS - 1);
    }

    function ask() {
        const entries = PAS.translator.entries();
        if (!entries.length) { return; }

        let entry;
        if (q.mode === "spell") {
            if (!q.queue.length) { finish("complete"); return; }
            entry = q.queue.shift();
        } else {
            entry = PAS.pick(entries);
            if (q.current && entries.length > 1 && entry[0] === q.current.entry[0]) {
                entry = PAS.pick(entries.filter(function (e) { return e[0] !== q.current.entry[0]; }));
            }
        }

        const asChar = q.mode === "word2letter" || q.mode === "listen";
        q.current = { entry: entry, asChar: asChar, choices: PAS.shuffle([entry].concat(distractors(entry, entries))) };
        q.locked = false;
        renderQuestion(true);
    }

    /* Paints q.current. Called again (with speak=false) after a language switch
       so the labels update without pulling a new question. */
    function renderQuestion(speak) {
        if (!q.current) { return; }
        const entry = q.current.entry;
        const promptEl = PAS.$("quizPrompt");
        const hintEl = PAS.$("quizHint");
        const lang = PAS.translator.alphabet().lang;

        if (q.mode === "letter2word" || q.mode === "spell") {
            promptEl.innerHTML = '<span class="quiz-big">' + PAS.escapeHtml(entry[0]) + "</span>";
            hintEl.textContent = q.mode === "spell"
                ? PAS.t("quiz.hint.spell", { i: q.asked + 1, n: q.asked + 1 + q.queue.length })
                : PAS.t("quiz.hint.word");
        } else if (q.mode === "word2letter") {
            promptEl.innerHTML = '<span class="quiz-word">' + PAS.escapeHtml(entry[1]) + "</span>";
            hintEl.textContent = PAS.t("quiz.hint.char");
        } else {
            promptEl.innerHTML = '<span class="quiz-word quiz-listen">\uD83D\uDD0A</span>';
            hintEl.textContent = PAS.speech.isMuted()
                ? PAS.t("quiz.hint.muted")
                : PAS.t("quiz.hint.listen");
            if (speak) { PAS.speech.speak(entry[1], { lang: lang, explicit: true }); }
        }

        const host = PAS.$("quizOptions");
        host.innerHTML = "";
        q.current.choices.forEach(function (choice) {
            host.appendChild(optionButton(q.current.asChar ? choice[0] : choice[1], choice[0], q.current.asChar));
        });

        const replay = PAS.$("quizReplay");
        if (replay) { replay.hidden = q.mode !== "listen"; }
        renderStats();
    }

    function answer(btn) {
        if (!q.running || q.locked || !q.current) { return; }
        q.locked = true;
        q.asked++;

        const correct = btn.dataset.value === q.current.entry[0];
        if (correct) {
            q.score++;
            q.streak++;
            if (q.streak > q.best) { q.best = q.streak; saveBest(q.mode, q.best); }
            btn.classList.add("is-right");
        } else {
            q.streak = 0;
            btn.classList.add("is-wrong");
            PAS.$$("#quizOptions .quiz-option").forEach(function (o) {
                if (o.dataset.value === q.current.entry[0]) { o.classList.add("is-right"); }
            });
        }

        renderStats();
        setTimeout(function () {
            if (!q.running) { return; }
            if (q.timed && Date.now() >= q.endsAt) { finish("time"); return; }
            ask();
        }, correct ? 420 : 1100);
    }

    function start() {
        const entries = PAS.translator.entries();
        if (!entries.length) { return; }

        q.mode = PAS.$("quizMode").value;
        q.timed = PAS.$("quizTimed").checked;
        q.best = loadBest(q.mode);
        q.score = 0;
        q.asked = 0;
        q.streak = 0;
        q.queue = [];
        q.current = null;
        q.lastReason = "";
        q.running = true;
        q.endsAt = Date.now() + ROUND_MS;

        if (q.mode === "spell") {
            const word = String(PAS.$("quizWord").value || "").trim();
            if (!word) {
                PAS.toast(PAS.t("t.quizWord"));
                q.running = false;
                PAS.$("quizWord").focus();
                return;
            }
            q.timed = false;
            q.queue = PAS.translator.tokenize(word)
                .filter(function (t) { return t.type === "code"; })
                .map(function (t) { return PAS.translator.lookup(t.char); })
                .filter(Boolean);
            if (!q.queue.length) {
                PAS.toast(PAS.t("t.quizNoMatch"));
                q.running = false;
                return;
            }
        }

        PAS.$("quizStage").hidden = false;
        PAS.$("quizStart").textContent = PAS.t("quiz.restart");
        PAS.$("quizResult").hidden = true;
        PAS.store(KEYS.quizMode, q.mode);
        ask();
    }

    function renderResult() {
        const result = PAS.$("quizResult");
        if (!q.lastReason) { return; }
        result.hidden = false;
        result.innerHTML = PAS.t("quiz.result", {
            reason: PAS.escapeHtml(PAS.t("quiz.reason." + q.lastReason)),
            score: q.score,
            asked: q.asked,
            pct: q.asked ? Math.round((q.score / q.asked) * 100) : 0,
            best: q.best
        });
    }

    function finish(reason) {
        q.running = false;
        q.current = null;
        q.lastReason = reason;
        PAS.$("quizStage").hidden = true;
        PAS.$("quizStart").textContent = PAS.t("quiz.start");
        renderResult();
        renderStats();
    }

    const quiz = {
        tick: function () {
            if (!q.running || !q.timed) { return; }
            if (Date.now() >= q.endsAt) { finish("time"); return; }
            renderStats();
        },

        stop: function () { if (q.running) { finish("stopped"); } },

        /* Rebuild the current question when the alphabet changes underneath. */
        refresh: function () {
            if (q.running && q.mode !== "spell") { ask(); }
            else if (q.running) { finish("alphabet"); }
        },

        /* Re-label the mode list and any live question after a language switch. */
        relabel: function () {
            const modeSel = PAS.$("quizMode");
            PAS.$$("option", modeSel).forEach(function (opt) {
                opt.textContent = PAS.t("quiz.mode." + opt.value);
            });
            PAS.$("quizStart").textContent = PAS.t(q.running ? "quiz.restart" : "quiz.start");
            if (q.running) { renderQuestion(false); } else { renderResult(); }
            renderStats();
        },

        init: function () {
            const modeSel = PAS.$("quizMode");
            PAS.QUIZ_MODES.forEach(function (id) {
                const opt = document.createElement("option");
                opt.value = id;
                opt.textContent = PAS.t("quiz.mode." + id);
                modeSel.appendChild(opt);
            });
            modeSel.value = PAS.load(KEYS.quizMode, "letter2word");

            const syncMode = function () {
                const spell = modeSel.value === "spell";
                PAS.$("quizWordField").hidden = !spell;
                PAS.$("quizTimedField").hidden = spell;
                q.best = loadBest(modeSel.value);
                renderStats();
            };
            modeSel.addEventListener("change", function () {
                if (q.running) { finish("mode"); }
                syncMode();
            });

            PAS.$("quizStart").addEventListener("click", start);
            PAS.$("quizStop").addEventListener("click", quiz.stop);
            PAS.$("quizReplay").addEventListener("click", function () {
                if (q.current) {
                    PAS.speech.speak(q.current.entry[1], { lang: PAS.translator.alphabet().lang, explicit: true });
                }
            });
            PAS.$("quizWord").addEventListener("keydown", function (e) {
                if (e.key === "Enter") { e.preventDefault(); start(); }
            });

            syncMode();
            renderStats();
        }
    };

    PAS.quiz = quiz;
})(window, document);
