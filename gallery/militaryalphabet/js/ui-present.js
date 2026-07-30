/* ============================================================
   Phonetic Alphabet Studio — presentation mode
   Full-screen single card: big character, code word, pronunciation.
   Steps through the current translation when there is one, otherwise
   through the whole alphabet, and holds the wake lock while it runs.
   ============================================================ */
(function (window, document) {
    "use strict";

    const PAS = window.PAS = window.PAS || {};
    const STEP_MS = 2600;

    const state = {
        open: false,
        list: [],
        index: 0,
        playing: false,
        timer: null,
        forcedWake: false      // we turned the wake lock on, so we turn it back off
    };

    /* Whatever is in the translator box, else the full alphabet. */
    function source() {
        const tokens = PAS.translator.tokenize(PAS.$("input").value)
            .filter(function (t) { return t.type === "code"; });
        if (tokens.length) {
            return tokens.map(function (t) { return [t.char, t.word, t.pron]; });
        }
        return PAS.translator.entries();
    }

    function paint(speak) {
        const item = state.list[state.index];
        if (!item) { return; }
        PAS.$("presentLetter").textContent = item[0];
        PAS.$("presentWord").textContent = item[1];
        PAS.$("presentPron").textContent = item[2] || "";
        PAS.$("presentIndex").textContent = (state.index + 1) + " / " + state.list.length;
        if (speak) { PAS.speech.speak(item[1], { lang: PAS.translator.alphabet().lang }); }
    }

    function step(delta) {
        if (!state.list.length) { return; }
        state.index = (state.index + delta + state.list.length) % state.list.length;
        paint(true);
    }

    function play(on) {
        state.playing = on;
        clearInterval(state.timer);
        PAS.$("presentPlay").textContent = PAS.t(on ? "present.pause" : "present.play");
        if (on) { state.timer = setInterval(function () { step(1); }, STEP_MS); }
    }

    function open(wanted) {
        state.open = wanted;
        PAS.$("presentOverlay").hidden = !wanted;
        document.body.classList.toggle("presenting", wanted);

        if (wanted) {
            state.list = source();
            state.index = 0;
            if (!PAS.wake.state().wanted) {
                state.forcedWake = true;
                PAS.wake.start(0, false);
            }
            paint(true);
            PAS.$("presentClose").focus();
        } else {
            play(false);
            PAS.speech.cancel();
            if (state.forcedWake) {
                state.forcedWake = false;
                PAS.wake.off(true);
            }
            PAS.$("presentToggle").focus();
        }
    }

    PAS.uiPresent = {
        open: open,
        isOpen: function () { return state.open; },

        /* Arrow keys while the overlay has focus. */
        handleKey: function (e) {
            if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); step(1); return true; }
            if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); return true; }
            return false;
        },

        relabel: function () {
            play(state.playing);
            if (state.open) { paint(false); }
        },

        init: function () {
            PAS.$("presentToggle").addEventListener("click", function () { open(true); });
            PAS.$("presentClose").addEventListener("click", function () { open(false); });
            PAS.$("presentPrev").addEventListener("click", function () { step(-1); });
            PAS.$("presentNext").addEventListener("click", function () { step(1); });
            PAS.$("presentPlay").addEventListener("click", function () { play(!state.playing); });
        }
    };
})(window, document);
