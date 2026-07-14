/* ============================================================
   Military Phonetic Alphabet — interactivity
   - NATO/ICAO reference grid (letters + digits)
   - Live text -> phonetic translator
   - Click to hear (Web Speech API) & copy
   - Screen Wake Lock toggle (keeps display awake)
   No dependencies.
   ============================================================ */
(function () {
    "use strict";

    /* [char, code word, pronunciation] — official ICAO/NATO respellings */
    const LETTERS = [
        ["A", "ALPHA", "AL-FAH"], ["B", "BRAVO", "BRAH-VOH"], ["C", "CHARLIE", "CHAR-LEE"],
        ["D", "DELTA", "DELL-TAH"], ["E", "ECHO", "ECK-OH"], ["F", "FOXTROT", "FOKS-TROT"],
        ["G", "GOLF", "GOLF"], ["H", "HOTEL", "HOH-TELL"], ["I", "INDIA", "IN-DEE-AH"],
        ["J", "JULIETT", "JEW-LEE-ETT"], ["K", "KILO", "KEY-LOH"], ["L", "LIMA", "LEE-MAH"],
        ["M", "MIKE", "MIKE"], ["N", "NOVEMBER", "NO-VEM-BER"], ["O", "OSCAR", "OSS-CAH"],
        ["P", "PAPA", "PAH-PAH"], ["Q", "QUEBEC", "KEH-BECK"], ["R", "ROMEO", "ROW-ME-OH"],
        ["S", "SIERRA", "SEE-AIR-RAH"], ["T", "TANGO", "TANG-GO"], ["U", "UNIFORM", "YOU-NEE-FORM"],
        ["V", "VICTOR", "VIK-TAH"], ["W", "WHISKEY", "WISS-KEY"], ["X", "XRAY", "ECKS-RAY"],
        ["Y", "YANKEE", "YANG-KEY"], ["Z", "ZULU", "ZOO-LOO"]
    ];
    const DIGITS = [
        ["0", "ZERO", "ZEE-RO"], ["1", "ONE", "WUN"], ["2", "TWO", "TOO"], ["3", "THREE", "TREE"],
        ["4", "FOUR", "FOW-ER"], ["5", "FIVE", "FIFE"], ["6", "SIX", "SIX"], ["7", "SEVEN", "SEV-EN"],
        ["8", "EIGHT", "AIT"], ["9", "NINE", "NIN-ER"]
    ];

    const MAP = {};
    LETTERS.concat(DIGITS).forEach(function (e) { MAP[e[0]] = e[1]; });

    const $ = function (id) { return document.getElementById(id); };

    /* ---------- Text to speech ---------- */
    function speak(text) {
        if (!("speechSynthesis" in window)) { toast("Speech not supported"); return; }
        try {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.rate = 0.92; u.pitch = 1; u.lang = "en-US";
            window.speechSynthesis.speak(u);
        } catch (e) { /* ignore */ }
    }

    /* ---------- Clipboard ---------- */
    function copy(text) {
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(
                function () { toast("Copied \u2713"); },
                function () { fallbackCopy(text); }
            );
        } else { fallbackCopy(text); }
    }
    function fallbackCopy(text) {
        const ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", "");
        ta.style.position = "absolute"; ta.style.left = "-9999px";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); toast("Copied \u2713"); }
        catch (e) { toast("Copy failed"); }
        document.body.removeChild(ta);
    }

    /* ---------- Toast ---------- */
    let toastTimer = null;
    function toast(msg) {
        const t = $("toast");
        if (!t) return;
        t.textContent = msg;
        t.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { t.classList.remove("show"); }, 1600);
    }

    /* ---------- Render alphabet grid ---------- */
    function buildGrid() {
        const grid = $("grid");
        const frag = document.createDocumentFragment();

        function tile(entry, isDigit) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "tile" + (isDigit ? " is-digit" : "");
            btn.setAttribute("aria-label", entry[0] + " as in " + entry[1]);
            btn.innerHTML =
                '<span class="t-letter">' + entry[0] + '</span>' +
                '<span class="t-word">' + entry[1] + '</span>' +
                '<span class="t-pron">' + entry[2] + '</span>';
            btn.addEventListener("click", function () {
                speak(entry[1]);
                copy(entry[1]);
                btn.classList.remove("flash");
                void btn.offsetWidth;       // restart animation
                btn.classList.add("flash");
            });
            return btn;
        }

        LETTERS.forEach(function (e) { frag.appendChild(tile(e, false)); });
        DIGITS.forEach(function (e) { frag.appendChild(tile(e, true)); });
        grid.appendChild(frag);
    }

    /* ---------- Translator ---------- */
    function translate() {
        const input = $("input");
        const output = $("output");
        const raw = input.value;
        output.innerHTML = "";

        if (!raw.trim()) {
            const empty = document.createElement("span");
            empty.className = "output-empty";
            empty.textContent = "// phonetic output appears here";
            output.appendChild(empty);
            return "";
        }

        const words = [];
        const chars = raw.toUpperCase().split("");
        chars.forEach(function (ch) {
            if (ch === " ") {
                const br = document.createElement("span");
                br.className = "chip is-space";
                output.appendChild(br);
                words.push("/");
                return;
            }
            const chip = document.createElement("span");
            if (Object.prototype.hasOwnProperty.call(MAP, ch)) {
                const word = MAP[ch];
                chip.className = "chip";
                chip.innerHTML = '<span class="chip-char">' + ch + '</span><span class="chip-word">' + word + '</span>';
                chip.title = "Click to hear \u201c" + word + "\u201d";
                chip.addEventListener("click", function () { speak(word); });
                words.push(word);
            } else {
                chip.className = "chip is-literal";
                chip.innerHTML = '<span class="chip-word">' + escapeHtml(ch) + '</span>';
                words.push(ch);
            }
            output.appendChild(chip);
        });

        return words.join(" ").replace(/\s*\/\s*/g, "  /  ").trim();
    }

    function escapeHtml(s) {
        return s.replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    /* ---------- Wake Lock ---------- */
    let wakeLock = null;
    let wakeWanted = true;               // user intent
    const pill = $("wakeToggle");

    function setPill(state, text) {
        pill.classList.remove("on", "off", "unsupported");
        pill.classList.add(state);
        $("wakeText").textContent = text;
        pill.setAttribute("aria-pressed", state === "on" ? "true" : "false");
    }

    async function acquireWakeLock() {
        if (!("wakeLock" in navigator)) { setPill("unsupported", "WAKE LOCK: N/A"); return; }
        try {
            wakeLock = await navigator.wakeLock.request("screen");
            setPill("on", "WAKE LOCK: ON");
            wakeLock.addEventListener("release", function () {
                if (wakeWanted) { setPill("off", "WAKE LOCK: PAUSED"); }
            });
        } catch (err) {
            setPill("off", "WAKE LOCK: OFF");
        }
    }

    async function releaseWakeLock() {
        try { if (wakeLock) { await wakeLock.release(); } } catch (e) { /* ignore */ }
        wakeLock = null;
    }

    async function toggleWakeLock() {
        if (!("wakeLock" in navigator)) { toast("Wake Lock not supported"); return; }
        wakeWanted = !wakeWanted;
        if (wakeWanted) { await acquireWakeLock(); toast("Screen will stay awake"); }
        else { await releaseWakeLock(); setPill("off", "WAKE LOCK: OFF"); toast("Wake lock disabled"); }
    }

    /* ---------- Clock ---------- */
    function tickClock() {
        const c = $("clock");
        if (c) {
            c.textContent = new Date().toLocaleTimeString("en-GB", { hour12: false });
        }
    }

    /* ---------- Konami easter egg ---------- */
    function konami() {
        const seq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
        let buf = [];
        document.addEventListener("keydown", function (e) {
            buf.push(e.key); buf = buf.slice(-10);
            if (buf.join(",") === seq.join(",")) {
                document.body.style.animation = "matrix 2s ease-in-out";
                toast("\u2726 SIGNAL BOOST \u2726");
                setTimeout(function () { document.body.style.animation = ""; }, 2000);
            }
        });
    }

    /* ---------- Init ---------- */
    document.addEventListener("DOMContentLoaded", function () {
        buildGrid();
        translate();

        const input = $("input");
        input.addEventListener("input", translate);

        $("speakBtn").addEventListener("click", function () {
            const str = translate();
            if (str) { speak(str.replace(/\//g, " ")); } else { toast("Nothing to speak"); }
        });
        $("copyBtn").addEventListener("click", function () {
            const str = translate();
            if (str) { copy(str); } else { toast("Nothing to copy"); }
        });
        $("clearBtn").addEventListener("click", function () {
            input.value = ""; translate(); input.focus();
        });

        pill.addEventListener("click", toggleWakeLock);
        acquireWakeLock();

        // Re-acquire when returning to the tab (locks auto-release on blur)
        document.addEventListener("visibilitychange", function () {
            if (document.visibilityState === "visible" && wakeWanted) { acquireWakeLock(); }
        });

        tickClock();
        setInterval(tickClock, 1000);
        konami();
    });
})();
