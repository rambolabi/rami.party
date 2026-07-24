/* ============================================================
   Phonetic Alphabet Studio — interactivity
   - Multiple spelling alphabets (military, world languages, fantasy)
   - Switchable visual themes
   - Live text -> phonetic translator
   - Click to hear (Web Speech API) & copy  ·  Mute (default: muted)
   - Screen Wake Lock toggle (keeps display awake)
   No dependencies.
   ============================================================ */
(function () {
    "use strict";

    /* ============================================================
       ALPHABET DATA — each entry: [char, code word, pronunciation]
       To add a new alphabet, copy a block and register it in ALPHABETS.
       ============================================================ */

    /* ---- Standard: NATO / ICAO military (the professional default) ---- */
    const NATO_LETTERS = [
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
    const NATO_DIGITS = [
        ["0", "ZERO", "ZEE-RO"], ["1", "ONE", "WUN"], ["2", "TWO", "TOO"], ["3", "THREE", "TREE"],
        ["4", "FOUR", "FOW-ER"], ["5", "FIVE", "FIFE"], ["6", "SIX", "SIX"], ["7", "SEVEN", "SEV-EN"],
        ["8", "EIGHT", "AIT"], ["9", "NINE", "NIN-ER"]
    ];

    /* ---- German spelling alphabet (Deutsches Funkalphabet) ---- */
    const DE_LETTERS = [
        ["A", "ANTON", "AHN-ton"], ["B", "BERTA", "BAIR-tah"], ["C", "CÄSAR", "TSAY-zar"],
        ["D", "DORA", "DOH-rah"], ["E", "EMIL", "AY-meel"], ["F", "FRIEDRICH", "FREED-rikh"],
        ["G", "GUSTAV", "GOOS-tahf"], ["H", "HEINRICH", "HYNE-rikh"], ["I", "IDA", "EE-dah"],
        ["J", "JULIUS", "YOO-lee-oos"], ["K", "KAUFMANN", "KOWF-mahn"], ["L", "LUDWIG", "LOOD-vikh"],
        ["M", "MARTHA", "MAR-tah"], ["N", "NORDPOL", "NORD-pohl"], ["O", "OTTO", "OT-toh"],
        ["P", "PAULA", "POW-lah"], ["Q", "QUELLE", "KVEL-luh"], ["R", "RICHARD", "RIKH-art"],
        ["S", "SAMUEL", "ZAH-moo-el"], ["T", "THEODOR", "TAY-oh-dor"], ["U", "ULRICH", "OOL-rikh"],
        ["V", "VIKTOR", "VIK-tor"], ["W", "WILHELM", "VIL-helm"], ["X", "XANTHIPPE", "ksan-TIP-puh"],
        ["Y", "YPSILON", "IP-see-lon"], ["Z", "ZACHARIAS", "tsah-khah-REE-ahs"]
    ];
    const DE_DIGITS = [
        ["0", "NULL", "nool"], ["1", "EINS", "eyness"], ["2", "ZWEI", "tsvy"], ["3", "DREI", "dry"],
        ["4", "VIER", "feer"], ["5", "FÜNF", "fewnf"], ["6", "SECHS", "zeks"], ["7", "SIEBEN", "ZEE-ben"],
        ["8", "ACHT", "ahkht"], ["9", "NEUN", "noyn"]
    ];

    /* ---- French spelling alphabet (épellation téléphonique) ---- */
    const FR_LETTERS = [
        ["A", "ANATOLE", "ah-nah-TOL"], ["B", "BERTHE", "bairt"], ["C", "CÉLESTIN", "say-les-TAN"],
        ["D", "DÉSIRÉ", "day-zee-RAY"], ["E", "EUGÈNE", "uh-ZHEN"], ["F", "FRANÇOIS", "frahn-SWAH"],
        ["G", "GASTON", "gas-TON"], ["H", "HENRI", "ahn-REE"], ["I", "IRMA", "eer-MAH"],
        ["J", "JOSEPH", "zho-ZEF"], ["K", "KLÉBER", "klay-BAIR"], ["L", "LOUIS", "loo-EE"],
        ["M", "MARCEL", "mar-SEL"], ["N", "NICOLAS", "nee-ko-LAH"], ["O", "OSCAR", "os-KAR"],
        ["P", "PIERRE", "pee-AIR"], ["Q", "QUINTAL", "kan-TAL"], ["R", "RAOUL", "rah-OOL"],
        ["S", "SUZANNE", "soo-ZAN"], ["T", "THÉRÈSE", "tay-REZ"], ["U", "URSULE", "oor-SOOL"],
        ["V", "VICTOR", "veek-TOR"], ["W", "WILLIAM", "wee-lee-AM"], ["X", "XAVIER", "gzah-vee-AY"],
        ["Y", "YVONNE", "ee-VON"], ["Z", "ZOÉ", "zo-AY"]
    ];
    const FR_DIGITS = [
        ["0", "ZÉRO", "zay-ROH"], ["1", "UN", "uhn"], ["2", "DEUX", "duh"], ["3", "TROIS", "trwah"],
        ["4", "QUATRE", "KAH-truh"], ["5", "CINQ", "sank"], ["6", "SIX", "sees"], ["7", "SEPT", "set"],
        ["8", "HUIT", "weet"], ["9", "NEUF", "nuhf"]
    ];

    /* ---- Italian spelling alphabet (nomi di città) ---- */
    const IT_LETTERS = [
        ["A", "ANCONA", "an-KOH-nah"], ["B", "BOLOGNA", "bo-LOH-nyah"], ["C", "COMO", "KOH-moh"],
        ["D", "DOMODOSSOLA", "do-mo-DOS-so-lah"], ["E", "EMPOLI", "EM-po-lee"], ["F", "FIRENZE", "fee-REN-tseh"],
        ["G", "GENOVA", "JEH-no-vah"], ["H", "HOTEL", "o-TEL"], ["I", "IMOLA", "EE-mo-lah"],
        ["J", "JOLLY", "JOL-lee"], ["K", "KURSAAL", "KOOR-sahl"], ["L", "LIVORNO", "lee-VOR-noh"],
        ["M", "MILANO", "mee-LAH-noh"], ["N", "NAPOLI", "NAH-po-lee"], ["O", "OTRANTO", "OH-tran-toh"],
        ["P", "PADOVA", "PAH-do-vah"], ["Q", "QUARTO", "KWAR-toh"], ["R", "ROMA", "ROH-mah"],
        ["S", "SAVONA", "sah-VOH-nah"], ["T", "TORINO", "to-REE-noh"], ["U", "UDINE", "OO-dee-neh"],
        ["V", "VENEZIA", "veh-NEH-tsee-ah"], ["W", "WASHINGTON", "WOSH-ing-ton"], ["X", "XILOFONO", "ksee-LO-fo-noh"],
        ["Y", "YORK", "york"], ["Z", "ZARA", "TSAH-rah"]
    ];
    const IT_DIGITS = [
        ["0", "ZERO", "DZEH-roh"], ["1", "UNO", "OO-noh"], ["2", "DUE", "DOO-eh"], ["3", "TRE", "treh"],
        ["4", "QUATTRO", "KWAT-troh"], ["5", "CINQUE", "CHEEN-kweh"], ["6", "SEI", "say"], ["7", "SETTE", "SET-teh"],
        ["8", "OTTO", "OT-toh"], ["9", "NOVE", "NOH-veh"]
    ];

    /* ---- Spanish spelling alphabet (nombres propios) ---- */
    const ES_LETTERS = [
        ["A", "ANTONIO", "an-TOH-nyoh"], ["B", "BURGOS", "BOOR-gohs"], ["C", "CARMEN", "KAR-men"],
        ["D", "DOLORES", "do-LOH-res"], ["E", "ENRIQUE", "en-REE-keh"], ["F", "FRANCISCO", "fran-SEES-koh"],
        ["G", "GERONA", "kheh-ROH-nah"], ["H", "HISTORIA", "ees-TOH-ryah"], ["I", "INÉS", "ee-NES"],
        ["J", "JOSÉ", "kho-SEH"], ["K", "KILO", "KEE-loh"], ["L", "LORENZO", "lo-REN-soh"],
        ["M", "MADRID", "mah-DREED"], ["N", "NAVARRA", "nah-VAR-rah"], ["O", "OVIEDO", "o-VYEH-doh"],
        ["P", "PARÍS", "pah-REES"], ["Q", "QUERIDO", "keh-REE-doh"], ["R", "RAMÓN", "rah-MOHN"],
        ["S", "SÁBADO", "SAH-bah-doh"], ["T", "TOLEDO", "to-LEH-doh"], ["U", "ULISES", "oo-LEE-ses"],
        ["V", "VALENCIA", "vah-LEN-syah"], ["W", "WÁSHINGTON", "WOSH-ing-ton"], ["X", "XILÓFONO", "see-LOH-fo-noh"],
        ["Y", "YEGUA", "YEH-gwah"], ["Z", "ZARAGOZA", "sah-rah-GOH-sah"]
    ];
    const ES_DIGITS = [
        ["0", "CERO", "SEH-roh"], ["1", "UNO", "OO-noh"], ["2", "DOS", "dohs"], ["3", "TRES", "tres"],
        ["4", "CUATRO", "KWAH-troh"], ["5", "CINCO", "SEEN-koh"], ["6", "SEIS", "says"], ["7", "SIETE", "SYEH-teh"],
        ["8", "OCHO", "OH-choh"], ["9", "NUEVE", "NWEH-veh"]
    ];

    /* ---- Dutch spelling alphabet (Nederlands telefoonalfabet) ---- */
    const NL_LETTERS = [
        ["A", "ANNA", "AH-nah"], ["B", "BERNARD", "BEHR-nart"], ["C", "CORNELIS", "kor-NAY-lis"],
        ["D", "DIRK", "deerk"], ["E", "EDUARD", "AY-doo-art"], ["F", "FERDINAND", "FEHR-dee-nant"],
        ["G", "GERARD", "GHAY-rart"], ["H", "HENDRIK", "HEN-drik"], ["I", "IZAAK", "EE-zahk"],
        ["J", "JOHAN", "YOH-hahn"], ["K", "KAREL", "KAH-rel"], ["L", "LODEWIJK", "LOH-duh-vayk"],
        ["M", "MARIA", "mah-REE-yah"], ["N", "NICO", "NEE-koh"], ["O", "OTTO", "OT-toh"],
        ["P", "PIETER", "PEE-ter"], ["Q", "QUOTIËNT", "kvoh-SHENT"], ["R", "RICHARD", "REE-shart"],
        ["S", "SIMON", "SEE-mon"], ["T", "THEODOOR", "TAY-oh-dor"], ["U", "UTRECHT", "OO-trekht"],
        ["V", "VICTOR", "VIK-tor"], ["W", "WILLEM", "VIL-lem"], ["X", "XANTIPPE", "ksan-TIP-puh"],
        ["Y", "YPSILON", "IP-see-lon"], ["Z", "ZAANDAM", "ZAHN-dam"]
    ];
    const NL_DIGITS = [
        ["0", "NUL", "nul"], ["1", "EEN", "ayn"], ["2", "TWEE", "tvay"], ["3", "DRIE", "dree"],
        ["4", "VIER", "feer"], ["5", "VIJF", "fayf"], ["6", "ZES", "zes"], ["7", "ZEVEN", "ZAY-ven"],
        ["8", "ACHT", "ahkht"], ["9", "NEGEN", "NAY-ghen"]
    ];

    /* ---- West-Vlaams (West Flemish — towns & dialect flavour) ---- */
    const WVL_LETTERS = [
        ["A", "AMAI", "ah-MY"], ["B", "BLÈTN", "BLET-un"], ["C", "CONTENT", "kon-TENT"],
        ["D", "DRONKE", "DRONG-kuh"], ["E", "ELPN", "EL-pun"], ["F", "FRIETKOT", "FREET-kot"],
        ["G", "GEIRN", "GHAYRN"], ["H", "HOEHEL", "HOO-hul"], ["I", "ILLIGEN", "IL-lee-ghun"],
        ["J", "JOAT", "yoat"], ["K", "KIEKN", "KEE-kun"], ["L", "LEUTE", "LUH-tuh"],
        ["M", "MULLE", "MUL-luh"], ["N", "NINT", "nint"], ["O", "OLSAN", "OL-sun"],
        ["P", "PUPPE", "PUP-puh"], ["Q", "QUATJE", "KWAT-yuh"], ["R", "RIEKEN", "REE-kun"],
        ["S", "SCHELLE", "SKHEL-luh"], ["T", "TRUTTE", "TRUT-tuh"], ["U", "UUS", "oos"],
        ["V", "VINT", "vint"], ["W", "WUF", "wuf"], ["X", "XANDER", "KSAN-dur"],
        ["Y", "YSER", "EE-zur"], ["Z", "ZWIENS", "zveens"]
    ];
    const WVL_DIGITS = [
        ["0", "NULLE", "NUL-luh"], ["1", "ÊEN", "ayn"], ["2", "TWÊE", "tvay-uh"], ["3", "DRIE", "dree-uh"],
        ["4", "VIERE", "VEE-ruh"], ["5", "VUVE", "VUU-vuh"], ["6", "ZESSE", "ZES-suh"], ["7", "ZEVNE", "ZEV-nuh"],
        ["8", "ACHTE", "AHKH-tuh"], ["9", "NEGNE", "NEGH-nuh"]
    ];

    /* ---- Elvish (LOTR — Sindarin/Quenya inspired) ---- */
    const ELF_LETTERS = [
        ["A", "ANOR", "AH-nor"], ["B", "BRETHIL", "BRETH-il"], ["C", "CELEB", "KEH-leb"],
        ["D", "DORON", "DOH-ron"], ["E", "ELEN", "EH-len"], ["F", "FALAS", "FAH-lass"],
        ["G", "GALADH", "GAH-lath"], ["H", "HÎR", "heer"], ["I", "ITHIL", "IH-thil"],
        ["J", "JAERON", "JYE-ron"], ["K", "KELVAR", "KEL-var"], ["L", "LOTH", "loth"],
        ["M", "MALLORN", "MAL-lorn"], ["N", "NIMLOTH", "NIM-loth"], ["O", "OROD", "OH-rod"],
        ["P", "PERIAN", "PEH-ree-an"], ["Q", "QUENYA", "KWEN-yah"], ["R", "ROCHIR", "ROKH-ir"],
        ["S", "SILIVREN", "sil-IV-ren"], ["T", "TAUR", "towr"], ["U", "UIAL", "OO-ee-al"],
        ["V", "VALAR", "VAH-lar"], ["W", "WILWARIN", "wil-WAH-rin"], ["X", "XELOTH", "ZEH-loth"],
        ["Y", "YÁVË", "YAH-veh"], ["Z", "ZIRITH", "ZEE-rith"]
    ];
    const ELF_DIGITS = [
        ["0", "Ú", "oo"], ["1", "MIN", "min"], ["2", "TÂD", "tahd"], ["3", "NELED", "NEH-led"],
        ["4", "CANAD", "KAH-nad"], ["5", "LEBEN", "LEH-ben"], ["6", "ENEG", "EH-neg"], ["7", "ODOG", "OH-dog"],
        ["8", "TOLOTH", "TOH-loth"], ["9", "NEDER", "NEH-der"]
    ];

    /* ---- Dwarvish (LOTR — Khuzdul inspired) ---- */
    const DWARF_LETTERS = [
        ["A", "AZGHAR", "AZ-ghar"], ["B", "BARUK", "BAH-rook"], ["C", "CARAK", "KAH-rak"],
        ["D", "DÛM", "doom"], ["E", "EZGAR", "EZ-gar"], ["F", "FELAK", "FEH-lak"],
        ["G", "GABIL", "GAH-bil"], ["H", "HARÂD", "HAH-rahd"], ["I", "IKHUZ", "IK-hooz"],
        ["J", "JARÛK", "jah-ROOK"], ["K", "KHAZAD", "KHAH-zad"], ["L", "LÛKHUD", "LOO-khud"],
        ["M", "MAZARBUL", "mah-ZAR-bool"], ["N", "NARAG", "NAH-rag"], ["O", "OZGAR", "OZ-gar"],
        ["P", "PURZÛL", "poor-ZOOL"], ["Q", "QAZÛM", "kah-ZOOM"], ["R", "RUKHS", "rookhs"],
        ["S", "SIGIN", "SIG-in"], ["T", "TARÂG", "tah-RAHG"], ["U", "UZBAD", "OOZ-bad"],
        ["V", "VAKÂR", "vah-KAR"], ["W", "WHARÛM", "wah-ROOM"], ["X", "XARAK", "ZAH-rak"],
        ["Y", "YORZÛL", "yor-ZOOL"], ["Z", "ZIRAK", "ZEE-rak"]
    ];
    const DWARF_DIGITS = [
        ["0", "ÛM", "oom"], ["1", "AIN", "ine"], ["2", "DÛL", "dool"], ["3", "THRIN", "thrin"],
        ["4", "FERAK", "FEH-rak"], ["5", "BUNDA", "BOON-dah"], ["6", "SKÛN", "skoon"], ["7", "DOGÛR", "do-GOOR"],
        ["8", "TOLZOL", "TOL-zol"], ["9", "NEDÛR", "neh-DOOR"]
    ];

    /* ---- Draconic (classic high-fantasy dragon tongue) ---- */
    const DRAGON_LETTERS = [
        ["A", "ARKHAN", "AR-kahn"], ["B", "BALAUR", "bah-LOWR"], ["C", "CHARRAX", "CHAR-raks"],
        ["D", "DRAAK", "drahk"], ["E", "EMBRAX", "EM-braks"], ["F", "FYRAX", "FY-raks"],
        ["G", "GARROK", "GAR-rok"], ["H", "HOARTH", "hoarth"], ["I", "IGNYX", "IG-niks"],
        ["J", "JARRAX", "JAR-raks"], ["K", "KARRAGH", "KAR-rah"], ["L", "LORATH", "LOH-rath"],
        ["M", "MALAX", "MAH-laks"], ["N", "NAGATH", "NAH-gath"], ["O", "OROTH", "OH-roth"],
        ["P", "PYRRUS", "PEER-rus"], ["Q", "QUORAX", "KWOR-aks"], ["R", "RAKH", "rahk"],
        ["S", "SCORYTH", "SKOR-ith"], ["T", "THARAX", "THAR-aks"], ["U", "UMBRAX", "UM-braks"],
        ["V", "VORATH", "VOR-ath"], ["W", "WYRMIS", "WUR-mis"], ["X", "XARRATH", "ZAR-rath"],
        ["Y", "YMBRIX", "IM-briks"], ["Z", "ZYKRAX", "ZY-kraks"]
    ];
    const DRAGON_DIGITS = [
        ["0", "NUL", "nul"], ["1", "SARR", "sar"], ["2", "DORN", "dorn"], ["3", "THREX", "threks"],
        ["4", "KARR", "kar"], ["5", "VYTH", "vith"], ["6", "SEKH", "sekh"], ["7", "SORN", "sorn"],
        ["8", "ATH", "ath"], ["9", "NYTH", "nith"]
    ];

    /* ---- Valyrian (Game of Thrones — High Valyrian inspired) ---- */
    const VALYRIAN_LETTERS = [
        ["A", "AÑOGAR", "ah-NYO-gar"], ["B", "BANTIS", "BAN-tis"], ["C", "CÉLOS", "SEH-los"],
        ["D", "DRACARYS", "drah-KAH-ris"], ["E", "EMBAR", "EM-bar"], ["F", "FÉDRYS", "FEH-dris"],
        ["G", "GERON", "GEH-ron"], ["H", "HEDRYS", "HEH-dris"], ["I", "IKSOS", "IK-sos"],
        ["J", "JELMĀZMA", "yel-MAHZ-mah"], ["K", "KESSA", "KES-sah"], ["L", "LYKIRI", "ly-KEE-ree"],
        ["M", "MORGHŪLIS", "mor-GOO-lis"], ["N", "NAEJOT", "NYE-jot"], ["O", "ŌÑOS", "OH-nyos"],
        ["P", "PERZYS", "PER-zis"], ["Q", "QĒLOS", "KWEH-los"], ["R", "RIÑA", "REE-nyah"],
        ["S", "SŌVĒS", "SOH-vehs"], ["T", "TEGON", "TEH-gon"], ["U", "UDIR", "OO-dir"],
        ["V", "VALAR", "VAH-lar"], ["W", "WĒDRA", "WEH-drah"], ["X", "XĒDRA", "ZEH-drah"],
        ["Y", "YNOT", "IH-not"], ["Z", "ZALDRĪZES", "zal-DREE-zes"]
    ];
    const VALYRIAN_DIGITS = [
        ["0", "NĒDYS", "NEH-dis"], ["1", "MĒRE", "MEH-reh"], ["2", "LANTA", "LAN-tah"], ["3", "HĀRE", "HAH-reh"],
        ["4", "IZULA", "ee-ZOO-lah"], ["5", "TOLĪ", "TOH-lee"], ["6", "BYKA", "BY-kah"], ["7", "SĪKUDA", "SEE-koo-dah"],
        ["8", "JĒNQA", "YEN-kah"], ["9", "VĒZOS", "VEH-zos"]
    ];

    const ALPHABETS = [
        { id: "nato", name: "NATO / ICAO (Military)", group: "Standard", lang: "en-US",
          note: "The NATO / ICAO spelling alphabet — spell anything clearly over radio or phone.",
          letters: NATO_LETTERS, digits: NATO_DIGITS },

        { id: "de", name: "German (Funkalphabet)", group: "World Languages", lang: "de-DE",
          note: "Deutsches Funkalphabet — the standard German spelling table.",
          letters: DE_LETTERS, digits: DE_DIGITS },
        { id: "fr", name: "French (Épellation)", group: "World Languages", lang: "fr-FR",
          note: "French telephone spelling alphabet — épellation téléphonique.",
          letters: FR_LETTERS, digits: FR_DIGITS },
        { id: "it", name: "Italian (Città)", group: "World Languages", lang: "it-IT",
          note: "Italian spelling alphabet built from the names of cities.",
          letters: IT_LETTERS, digits: IT_DIGITS },
        { id: "es", name: "Spanish (Nombres)", group: "World Languages", lang: "es-ES",
          note: "Spanish spelling alphabet using common proper names.",
          letters: ES_LETTERS, digits: ES_DIGITS },
        { id: "nl", name: "Dutch (Telefoonalfabet)", group: "World Languages", lang: "nl-NL",
          note: "Nederlands telefoonalfabet — the standard Dutch spelling table.",
          letters: NL_LETTERS, digits: NL_DIGITS },
        { id: "wvl", name: "West-Vlaams (West Flemish)", group: "World Languages", lang: "nl-BE",
          note: "West-Vlaams — spelt with West Flemish towns and a dash of dialect. Amai!",
          letters: WVL_LETTERS, digits: WVL_DIGITS },

        { id: "elvish", name: "Elvish (LOTR)", group: "Fantasy", lang: "en-US",
          note: "Elvish — a phonetic set inspired by Tolkien's Sindarin & Quenya.",
          letters: ELF_LETTERS, digits: ELF_DIGITS },
        { id: "dwarvish", name: "Dwarvish (LOTR)", group: "Fantasy", lang: "en-US",
          note: "Dwarvish — forged from the harsh sounds of Tolkien's Khuzdul.",
          letters: DWARF_LETTERS, digits: DWARF_DIGITS },
        { id: "draconic", name: "Draconic (Dragon Tongue)", group: "Fantasy", lang: "en-US",
          note: "Draconic — the ancient tongue of dragons across high fantasy.",
          letters: DRAGON_LETTERS, digits: DRAGON_DIGITS },
        { id: "valyrian", name: "Valyrian (GoT)", group: "Fantasy", lang: "en-US",
          note: "Valyrian — inspired by the High Valyrian of Game of Thrones.",
          letters: VALYRIAN_LETTERS, digits: VALYRIAN_DIGITS }
    ];

    /* ============================================================
       THEMES  (applied via data-theme on <html>)
       ============================================================ */
    const THEMES = [
        { id: "pro", name: "Professional" },
        { id: "slate", name: "Slate" },
        { id: "paper", name: "Paper (Light)" },
        { id: "amber", name: "Amber CRT" },
        { id: "terminal", name: "Terminal Green" },
        { id: "arcane", name: "Arcane (Magical)" }
    ];

    const DEFAULT_ALPHABET = "nato";
    const DEFAULT_THEME = "pro";
    const STORE = { alphabet: "ma.alphabet", theme: "ma.theme", muted: "ma.muted" };

    /* ---- Live state ---- */
    let current = ALPHABETS[0];
    let currentLang = current.lang;
    let MAP = {};
    let muted = true; // default: muted

    function rebuildMap() {
        MAP = {};
        current.letters.concat(current.digits).forEach(function (e) { MAP[e[0]] = e[1]; });
    }

    const $ = function (id) { return document.getElementById(id); };

    function store(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* ignore */ } }
    function load(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }

    /* ---------- Text to speech ---------- */
    function speak(text, opts) {
        opts = opts || {};
        if (muted) { if (opts.explicit) { toast("\uD83D\uDD07 Muted — tap the sound button"); } return; }
        if (!("speechSynthesis" in window)) { toast("Speech not supported"); return; }
        try {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.rate = 0.92; u.pitch = 1; u.lang = opts.lang || currentLang || "en-US";
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
        grid.innerHTML = "";
        const frag = document.createDocumentFragment();

        function tile(entry, isDigit) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "tile" + (isDigit ? " is-digit" : "");
            btn.setAttribute("aria-label", entry[0] + " as in " + entry[1]);
            btn.innerHTML =
                '<span class="t-letter">' + escapeHtml(entry[0]) + '</span>' +
                '<span class="t-word">' + escapeHtml(entry[1]) + '</span>' +
                '<span class="t-pron">' + escapeHtml(entry[2]) + '</span>';
            btn.addEventListener("click", function () {
                speak(entry[1]);
                copy(entry[1]);
                btn.classList.remove("flash");
                void btn.offsetWidth;       // restart animation
                btn.classList.add("flash");
            });
            return btn;
        }

        current.letters.forEach(function (e) { frag.appendChild(tile(e, false)); });
        current.digits.forEach(function (e) { frag.appendChild(tile(e, true)); });
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
                chip.innerHTML = '<span class="chip-char">' + escapeHtml(ch) + '</span><span class="chip-word">' + escapeHtml(word) + '</span>';
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
        return String(s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    /* ---------- Alphabet & Theme switching ---------- */
    function applyAlphabet(id, save) {
        const found = ALPHABETS.filter(function (a) { return a.id === id; })[0];
        current = found || ALPHABETS[0];
        currentLang = current.lang;
        rebuildMap();
        buildGrid();
        translate();
        const note = $("alphaNote");
        if (note) { note.textContent = current.note; }
        const sel = $("alphabetSelect");
        if (sel && sel.value !== current.id) { sel.value = current.id; }
        if (save) { store(STORE.alphabet, current.id); }
    }

    function applyTheme(id, save) {
        const found = THEMES.filter(function (t) { return t.id === id; })[0];
        const theme = found ? found.id : DEFAULT_THEME;
        document.documentElement.setAttribute("data-theme", theme);
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
            if (bg) { meta.setAttribute("content", bg); }
        }
        const sel = $("themeSelect");
        if (sel && sel.value !== theme) { sel.value = theme; }
        if (save) { store(STORE.theme, theme); }
    }

    /* ---------- Mute toggle (default muted) ---------- */
    function setMute(state, save) {
        muted = !!state;
        const btn = $("muteToggle");
        if (btn) {
            btn.classList.toggle("on", !muted);
            btn.classList.toggle("off", muted);
            btn.setAttribute("aria-pressed", muted ? "true" : "false");
            $("muteText").textContent = muted ? "SOUND: OFF" : "SOUND: ON";
            $("mutePip").textContent = muted ? "\uD83D\uDD07" : "\uD83D\uDD0A";
        }
        if (muted && "speechSynthesis" in window) {
            try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
        }
        if (save) { store(STORE.muted, muted ? "1" : "0"); }
    }

    /* ---------- Populate the <select> controls ---------- */
    function buildSelectors() {
        const aSel = $("alphabetSelect");
        const groups = {};
        ALPHABETS.forEach(function (a) {
            if (!groups[a.group]) {
                const og = document.createElement("optgroup");
                og.label = a.group;
                aSel.appendChild(og);
                groups[a.group] = og;
            }
            const opt = document.createElement("option");
            opt.value = a.id; opt.textContent = a.name;
            groups[a.group].appendChild(opt);
        });

        const tSel = $("themeSelect");
        THEMES.forEach(function (t) {
            const opt = document.createElement("option");
            opt.value = t.id; opt.textContent = t.name;
            tSel.appendChild(opt);
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
        buildSelectors();

        // Restore saved preferences (fall back to professional + NATO + muted).
        applyTheme(load(STORE.theme) || DEFAULT_THEME, false);
        applyAlphabet(load(STORE.alphabet) || DEFAULT_ALPHABET, false);
        setMute(load(STORE.muted) === "0" ? false : true, false);

        const input = $("input");
        input.addEventListener("input", translate);

        $("alphabetSelect").addEventListener("change", function () { applyAlphabet(this.value, true); });
        $("themeSelect").addEventListener("change", function () { applyTheme(this.value, true); });
        $("muteToggle").addEventListener("click", function () {
            setMute(!muted, true);
            toast(muted ? "\uD83D\uDD07 Sound muted" : "\uD83D\uDD0A Sound enabled");
        });

        $("speakBtn").addEventListener("click", function () {
            const str = translate();
            if (str) { speak(str.replace(/\//g, " "), { explicit: true }); } else { toast("Nothing to speak"); }
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
