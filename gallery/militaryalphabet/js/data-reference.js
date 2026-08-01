/* ============================================================
   Phonetic Alphabet Studio — reference data
   Themes, Morse code, punctuation names, accent folding, prowords,
   Q-codes and ten-codes. Pure data, no behaviour.
   ============================================================ */
(function (window) {
    "use strict";

    const PAS = window.PAS = window.PAS || {};

    /* ---------- Themes (labels live in js/i18n.js as theme.<id>) ---------- */
    PAS.THEMES = ["pro", "slate", "paper", "amber", "terminal", "arcane"];
    PAS.DEFAULT_THEME = "pro";

    /* ---------- Morse (ITU) ---------- */
    PAS.MORSE = {
        "A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".", "F": "..-.",
        "G": "--.", "H": "....", "I": "..", "J": ".---", "K": "-.-", "L": ".-..",
        "M": "--", "N": "-.", "O": "---", "P": ".--.", "Q": "--.-", "R": ".-.",
        "S": "...", "T": "-", "U": "..-", "V": "...-", "W": ".--", "X": "-..-",
        "Y": "-.--", "Z": "--..",
        "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
        "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
        ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
        "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
        ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-",
        '"': ".-..-.", "$": "...-..-", "@": ".--.-."
    };

    /* ---------- Punctuation & symbols (ITU / aviation phrasing) ---------- */
    PAS.PUNCTUATION = [
        [".", "STOP", "full stop / decimal point"],
        [",", "COMMA", "comma"],
        ["-", "DASH", "hyphen / dash"],
        ["_", "UNDERSCORE", "underscore"],
        ["/", "SLANT", "slash / stroke"],
        ["\\", "BACKSLANT", "backslash"],
        ["@", "AT", "at sign"],
        [":", "COLON", "colon"],
        [";", "SEMICOLON", "semicolon"],
        ["?", "QUESTION MARK", "question mark"],
        ["!", "EXCLAMATION", "exclamation mark"],
        ["'", "APOSTROPHE", "apostrophe"],
        ["\"", "QUOTE", "quotation mark"],
        ["(", "OPEN BRACKET", "left parenthesis"],
        [")", "CLOSE BRACKET", "right parenthesis"],
        ["[", "OPEN SQUARE", "left square bracket"],
        ["]", "CLOSE SQUARE", "right square bracket"],
        ["{", "OPEN BRACE", "left brace"],
        ["}", "CLOSE BRACE", "right brace"],
        ["+", "PLUS", "plus"],
        ["=", "EQUALS", "equals"],
        ["&", "AMPERSAND", "ampersand"],
        ["#", "HASH", "number sign"],
        ["%", "PERCENT", "percent"],
        ["*", "ASTERISK", "star"],
        ["$", "DOLLAR", "dollar"],
        ["€", "EURO", "euro"],
        ["£", "POUND", "pound sterling"],
        ["<", "LESS THAN", "less than"],
        [">", "GREATER THAN", "greater than"],
        ["|", "PIPE", "vertical bar"],
        ["~", "TILDE", "tilde"],
        ["^", "CARET", "caret"],
        ["`", "BACKTICK", "grave accent"]
    ];

    PAS.PUNCT_MAP = {};
    PAS.PUNCTUATION.forEach(function (p) { PAS.PUNCT_MAP[p[0]] = p[1]; });

    /* ---------- Accent folding ----------
       Characters that NFD normalisation cannot split into base + mark.
       Everything else (é, ü, å, ç …) is handled by stripping combining marks. */
    PAS.FOLD_SPECIAL = {
        "ß": "SS", "ẞ": "SS", "Ø": "O", "ø": "O", "Æ": "AE", "æ": "AE",
        "Œ": "OE", "œ": "OE", "Đ": "D", "đ": "D", "Ð": "D", "ð": "D",
        "Þ": "TH", "þ": "TH", "Ł": "L", "ł": "L", "Ħ": "H", "ħ": "H",
        "Ŋ": "NG", "ŋ": "NG", "İ": "I", "ı": "I"
    };

    /* Strip diacritics: "Évora" -> "EVORA". Returns "" when nothing is left. */
    PAS.foldChar = function (ch) {
        if (Object.prototype.hasOwnProperty.call(PAS.FOLD_SPECIAL, ch)) {
            return PAS.FOLD_SPECIAL[ch];
        }
        try {
            return ch.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
        } catch (e) { return ""; }
    };

    /* ---------- Prowords (procedure words) ---------- */
    PAS.PROWORDS = [
        ["AFFIRMATIVE", "Yes / that is correct."],
        ["NEGATIVE", "No / permission not granted."],
        ["ROGER", "I have received your last transmission."],
        ["WILCO", "Received and I will comply. Never say \u201cRoger Wilco\u201d — it is redundant."],
        ["OVER", "My transmission is ended, I expect a reply."],
        ["OUT", "My transmission is ended, no reply expected."],
        ["SAY AGAIN", "Repeat your last transmission (never say \u201crepeat\u201d — that means fire again)."],
        ["I SAY AGAIN", "I am repeating my transmission."],
        ["STAND BY", "Wait, I will call you back."],
        ["WAIT ONE", "Short pause, stay on the frequency."],
        ["BREAK", "Separates parts of a message."],
        ["BREAK BREAK", "Urgent interruption of an ongoing exchange."],
        ["CORRECTION", "An error was made, the correct version follows."],
        ["DISREGARD", "Ignore that last transmission."],
        ["FIGURES", "Numerals follow."],
        ["I SPELL", "I will spell the next word phonetically."],
        ["READ BACK", "Repeat this message back to me."],
        ["HOW COPY", "Did you receive and understand?"],
        ["LOUD AND CLEAR", "Your signal is strong and readable."],
        ["RADIO CHECK", "What is my signal strength and readability?"],
        ["COPY", "I understand your message."],
        ["MAYDAY", "Distress: grave and imminent danger, immediate assistance required."],
        ["PAN-PAN", "Urgency: a problem, but no immediate danger to life."],
        ["SÉCURITÉ", "Safety: a navigational or weather warning follows."]
    ];

    /* ---------- Q-codes (amateur & maritime radio) ---------- */
    PAS.QCODES = [
        ["QRA", "What is the name of your station?"],
        ["QRG", "What is my exact frequency?"],
        ["QRL", "Are you busy? / This frequency is in use."],
        ["QRM", "Interference from other stations."],
        ["QRN", "Interference from static or noise."],
        ["QRO", "Increase transmitter power."],
        ["QRP", "Decrease transmitter power / low-power operation."],
        ["QRQ", "Send faster."],
        ["QRS", "Send more slowly."],
        ["QRT", "Stop sending / I am closing down."],
        ["QRU", "Do you have anything for me? / I have nothing for you."],
        ["QRV", "Are you ready? / I am ready."],
        ["QRX", "Stand by, I will call you again."],
        ["QRZ", "Who is calling me?"],
        ["QSB", "Your signal is fading."],
        ["QSL", "Acknowledge receipt / I confirm receipt."],
        ["QSO", "A two-way contact / conversation."],
        ["QSY", "Change to another frequency."],
        ["QTH", "What is your location? / My location is…"],
        ["QTR", "What is the correct time?"]
    ];

    /* ---------- Ten-codes (APCO Project 14). Meanings vary a lot between
       agencies — several US states have dropped them entirely. ---------- */
    PAS.TENCODES = [
        ["10-1", "Signal weak / cannot copy."],
        ["10-2", "Signal good."],
        ["10-3", "Stop transmitting."],
        ["10-4", "Acknowledgement — message received."],
        ["10-5", "Relay this message."],
        ["10-6", "Busy, stand by."],
        ["10-7", "Out of service."],
        ["10-8", "In service."],
        ["10-9", "Repeat / say again."],
        ["10-10", "Fight in progress."],
        ["10-12", "Visitors present — stand by."],
        ["10-13", "Weather and road report."],
        ["10-20", "What is your location?"],
        ["10-21", "Call by telephone."],
        ["10-22", "Disregard."],
        ["10-23", "Arrived at scene."],
        ["10-27", "Driving licence check."],
        ["10-33", "Emergency — all units stand by."],
        ["10-76", "En route."],
        ["10-97", "Check (test) signal."],
        ["10-99", "Records indicate wanted or stolen."]
    ];
})(window);
