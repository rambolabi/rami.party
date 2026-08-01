/* ============================================================
   Phonetic Alphabet Studio — speech
   Thin wrapper over the Web Speech API: mute, voice picking, rate,
   pitch and a cancellable letter-by-letter sequencer that reports
   progress so the UI can highlight what is being read.
   ============================================================ */
(function (window) {
    "use strict";

    const PAS = window.PAS = window.PAS || {};
    const synth = window.speechSynthesis || null;

    const state = {
        muted: true,
        rate: 0.92,
        pitch: 1,
        gap: 180,            // ms of silence between letters in a sequence
        voiceURI: "",
        lang: "en-US",
        voices: [],
        runToken: 0          // bumped on cancel so stale callbacks stop
    };

    /* Resolved voice per language tag. Letter-by-letter playback builds one
       utterance per letter, so this must not rescan the voice list each time. */
    let voiceCache = {};

    function loadVoices() {
        if (!synth) { return; }
        try { state.voices = synth.getVoices() || []; }
        catch (e) { state.voices = []; }
        voiceCache = {};
        PAS.emit("voices", state.voices);
    }

    if (synth) {
        loadVoices();
        // Chrome populates the list asynchronously.
        if (typeof synth.addEventListener === "function") {
            synth.addEventListener("voiceschanged", loadVoices);
        } else {
            synth.onvoiceschanged = loadVoices;
        }
    }

    function bestVoice(lang) {
        if (!state.voices.length) { return null; }
        const want = String(lang || state.lang || "en-US").toLowerCase();
        const key = state.voiceURI + "|" + want;
        if (Object.prototype.hasOwnProperty.call(voiceCache, key)) { return voiceCache[key]; }

        let found = null;
        if (state.voiceURI) {
            found = state.voices.filter(function (v) { return v.voiceURI === state.voiceURI; })[0] || null;
        }
        if (!found) {
            const base = want.split("-")[0];
            let exact = null, sameLang = null;
            state.voices.forEach(function (v) {
                const vl = String(v.lang || "").toLowerCase().replace("_", "-");
                if (!exact && vl === want) { exact = v; }
                if (!sameLang && vl.split("-")[0] === base) { sameLang = v; }
            });
            found = exact || sameLang || null;
        }
        voiceCache[key] = found;
        return found;
    }

    function makeUtterance(text, lang) {
        const u = new window.SpeechSynthesisUtterance(text);
        u.rate = state.rate;
        u.pitch = state.pitch;
        u.lang = lang || state.lang || "en-US";
        const v = bestVoice(u.lang);
        if (v) { u.voice = v; }
        return u;
    }

    const speech = {
        /* ---- settings ---- */
        setMuted: function (on) {
            state.muted = !!on;
            if (state.muted) { speech.cancel(); }
        },
        isMuted: function () { return state.muted; },
        setLang: function (lang) { state.lang = lang || "en-US"; },
        setRate: function (n) { state.rate = PAS.clamp(Number(n) || 1, 0.5, 2); },
        setPitch: function (n) { state.pitch = PAS.clamp(Number(n) || 1, 0.5, 2); },
        setGap: function (ms) { state.gap = PAS.clamp(Number(ms) || 0, 0, 2000); },
        setVoice: function (uri) { state.voiceURI = uri || ""; },
        getVoice: function () { return state.voiceURI; },
        voices: function () { return state.voices.slice(); },

        /* ---- playback ---- */
        cancel: function () {
            state.runToken++;
            if (!synth) { return; }
            try { synth.cancel(); } catch (e) { /* ignore */ }
            PAS.emit("speech:end", null);
        },

        /* Speak one blob of text. opts.explicit => complain when muted. */
        speak: function (text, opts) {
            opts = opts || {};
            if (!text) { return false; }
            if (state.muted) {
                if (opts.explicit) { PAS.toast(PAS.t("t.muted")); }
                return false;
            }
            if (!synth) {
                if (opts.explicit) { PAS.toast(PAS.t("t.noSpeech")); }
                return false;
            }
            try {
                synth.cancel();
                synth.speak(makeUtterance(text, opts.lang));
                return true;
            } catch (e) { return false; }
        },

        /* Speak an array of { text, data } parts one at a time.
           Fires speech:part / speech:end so tiles can highlight along. */
        speakSequence: function (parts, opts) {
            opts = opts || {};
            if (!parts || !parts.length) { return false; }
            if (state.muted) {
                if (opts.explicit) { PAS.toast(PAS.t("t.muted")); }
                return false;
            }
            if (!synth) {
                if (opts.explicit) { PAS.toast(PAS.t("t.noSpeech")); }
                return false;
            }

            speech.cancel();
            const token = state.runToken;
            let i = 0;

            function step() {
                if (token !== state.runToken) { return; }        // cancelled
                if (i >= parts.length) {
                    PAS.emit("speech:end", null);
                    if (typeof opts.onDone === "function") { opts.onDone(); }
                    return;
                }
                const part = parts[i++];
                PAS.emit("speech:part", part);
                const u = makeUtterance(part.text, opts.lang);
                u.onend = function () {
                    if (token !== state.runToken) { return; }
                    if (state.gap > 0) { setTimeout(step, state.gap); } else { step(); }
                };
                u.onerror = u.onend;
                try { synth.speak(u); }
                catch (e) { step(); }
            }

            step();
            return true;
        }
    };

    PAS.speech = speech;
})(window);
