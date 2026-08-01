/* ============================================================
   Phonetic Alphabet Studio — bootstrap
   Wires the modules together in dependency order and applies
   anything that came in through the URL.
   ============================================================ */
(function (window, document) {
    "use strict";

    const PAS = window.PAS;

    function registerServiceWorker() {
        // Service workers need http(s); skip silently when opened from disk.
        if (!("serviceWorker" in navigator) || window.location.protocol === "file:") { return; }
        window.addEventListener("load", function () {
            navigator.serviceWorker.register("sw.js").catch(function () { /* offline support is optional */ });
        });
    }

    /* Resolve the interface language before anything paints: every other
       module reads PAS.t() while building its labels. */
    function startLanguage() {
        const fromUrl = PAS.i18n.match(PAS.param("lang"));
        const saved = PAS.i18n.match(PAS.load(PAS.KEYS.lang));
        const guess = PAS.i18n.match(navigator.language);
        PAS.i18n.set(fromUrl || saved || guess || PAS.DEFAULT_LANG, false);
    }

    document.addEventListener("DOMContentLoaded", function () {
        startLanguage();          // first: everything below reads PAS.t()
        PAS.wake.init();          // restores wake intent and the running timer
        PAS.ui.init();            // theme, alphabet, tabs, voice, shortcuts
        PAS.uiWake.init();        // pills + timer panel
        PAS.uiTranslate.init();   // translator panel
        PAS.uiPresent.init();     // presentation overlay
        PAS.quiz.init();          // practice tab

        // One heartbeat for everything that counts seconds.
        setInterval(function () {
            PAS.wake.tick();
            PAS.ui.tick();
            PAS.quiz.tick();
        }, 1000);

        const text = PAS.param("text");
        if (text) {
            PAS.uiTranslate.setText(text);
            PAS.ui.showTab("translate", false);
        }

        registerServiceWorker();
    });
})(window, document);
