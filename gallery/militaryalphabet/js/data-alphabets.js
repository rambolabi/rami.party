/* ============================================================
   Phonetic Alphabet Studio — alphabet data
   Kept as a plain script (not JSON) on purpose: a fetch() of a local
   JSON file is blocked over file://, and this tool has to keep working
   when it is saved to disk or carried on a USB stick.

   Entry format:  [ char, code word, pronunciation, latinKeys?, altWords? ]
     char       — the character shown on the tile
     latinKeys  — optional: Latin characters that should also resolve to
                  this entry, so a QWERTY keyboard can drive a non-Latin
                  alphabet. One character per key, no duplicates within
                  an alphabet.
     altWords   — optional: spellings the reverse translator should also
                  accept, e.g. ALPHA for the official ICAO spelling ALFA.

   To add an alphabet: define the two arrays, then register it in
   PAS.ALPHABETS with a unique id, a group and a BCP-47 lang tag
   (the lang drives which speech-synthesis voice is picked).
   ============================================================ */
(function (window) {
    "use strict";

    const PAS = window.PAS = window.PAS || {};

    /* ============================================================
       STANDARD
       ============================================================ */

    /* ---- NATO / ICAO (the professional default) ----
       ICAO Annex 10 spells A and J as ALFA and JULIETT on purpose: PH is not
       read as F, and a single T is dropped, in several languages. ALPHA and
       JULIET are accepted by the reverse translator. */
    const NATO_LETTERS = [
        ["A", "ALFA", "AL-FAH", "", ["ALPHA"]], ["B", "BRAVO", "BRAH-VOH"], ["C", "CHARLIE", "CHAR-LEE"],
        ["D", "DELTA", "DELL-TAH"], ["E", "ECHO", "ECK-OH"], ["F", "FOXTROT", "FOKS-TROT"],
        ["G", "GOLF", "GOLF"], ["H", "HOTEL", "HOH-TELL"], ["I", "INDIA", "IN-DEE-AH"],
        ["J", "JULIETT", "JEW-LEE-ETT", "", ["JULIET"]], ["K", "KILO", "KEY-LOH"], ["L", "LIMA", "LEE-MAH"],
        ["M", "MIKE", "MIKE"], ["N", "NOVEMBER", "NO-VEM-BER"], ["O", "OSCAR", "OSS-CAH"],
        ["P", "PAPA", "PAH-PAH"], ["Q", "QUEBEC", "KEH-BECK"], ["R", "ROMEO", "ROW-ME-OH"],
        ["S", "SIERRA", "SEE-AIR-RAH"], ["T", "TANGO", "TANG-GO"], ["U", "UNIFORM", "YOU-NEE-FORM"],
        ["V", "VICTOR", "VIK-TAH"], ["W", "WHISKEY", "WISS-KEY", "", ["WHISKY"]], ["X", "XRAY", "ECKS-RAY"],
        ["Y", "YANKEE", "YANG-KEY"], ["Z", "ZULU", "ZOO-LOO"]
    ];
    const NATO_DIGITS = [
        ["0", "ZERO", "ZEE-RO"], ["1", "ONE", "WUN"], ["2", "TWO", "TOO"], ["3", "THREE", "TREE"],
        ["4", "FOUR", "FOW-ER"], ["5", "FIVE", "FIFE"], ["6", "SIX", "SIX"], ["7", "SEVEN", "SEV-EN"],
        ["8", "EIGHT", "AIT"], ["9", "NINE", "NIN-ER"]
    ];

    /* ============================================================
       HISTORICAL & SERVICES
       ============================================================ */

    /* ---- LAPD / APCO — still used by US police and emergency services ---- */
    const LAPD_LETTERS = [
        ["A", "ADAM", "AD-am"], ["B", "BOY", "boy"], ["C", "CHARLES", "CHAR-uls"],
        ["D", "DAVID", "DAY-vid"], ["E", "EDWARD", "ED-ward"], ["F", "FRANK", "frank"],
        ["G", "GEORGE", "jorj"], ["H", "HENRY", "HEN-ree"], ["I", "IDA", "EYE-dah"],
        ["J", "JOHN", "jon"], ["K", "KING", "king"], ["L", "LINCOLN", "LINK-un"],
        ["M", "MARY", "MAIR-ee"], ["N", "NORA", "NOR-ah"], ["O", "OCEAN", "OH-shun"],
        ["P", "PAUL", "pawl"], ["Q", "QUEEN", "kween"], ["R", "ROBERT", "ROB-ert"],
        ["S", "SAM", "sam"], ["T", "TOM", "tom"], ["U", "UNION", "YOON-yun"],
        ["V", "VICTOR", "VIK-tor"], ["W", "WILLIAM", "WIL-yum"], ["X", "XRAY", "EKS-ray"],
        ["Y", "YOUNG", "yung"], ["Z", "ZEBRA", "ZEE-brah"]
    ];

    /* ---- Western Union — the classic US telegram alphabet ---- */
    const WU_LETTERS = [
        ["A", "ADAMS", "AD-ums"], ["B", "BOSTON", "BOS-tun"], ["C", "CHICAGO", "shi-KAH-go"],
        ["D", "DENVER", "DEN-ver"], ["E", "EASY", "EE-zee"], ["F", "FRANK", "frank"],
        ["G", "GEORGE", "jorj"], ["H", "HENRY", "HEN-ree"], ["I", "IDA", "EYE-dah"],
        ["J", "JOHN", "jon"], ["K", "KING", "king"], ["L", "LINCOLN", "LINK-un"],
        ["M", "MARY", "MAIR-ee"], ["N", "NEW YORK", "noo YORK"], ["O", "OCEAN", "OH-shun"],
        ["P", "PETER", "PEE-ter"], ["Q", "QUEEN", "kween"], ["R", "ROGER", "ROJ-er"],
        ["S", "SUGAR", "SHUG-ar"], ["T", "THOMAS", "TOM-us"], ["U", "UNION", "YOON-yun"],
        ["V", "VICTOR", "VIK-tor"], ["W", "WILLIAM", "WIL-yum"], ["X", "XRAY", "EKS-ray"],
        ["Y", "YOUNG", "yung"], ["Z", "ZERO", "ZEE-ro"]
    ];

    /* ---- Joint Army/Navy "Able Baker" (US & UK, 1941–1956) ---- */
    const ABLE_LETTERS = [
        ["A", "ABLE", "AY-bul"], ["B", "BAKER", "BAY-ker"], ["C", "CHARLIE", "CHAR-lee"],
        ["D", "DOG", "dog"], ["E", "EASY", "EE-zee"], ["F", "FOX", "foks"],
        ["G", "GEORGE", "jorj"], ["H", "HOW", "how"], ["I", "ITEM", "EYE-tum"],
        ["J", "JIG", "jig"], ["K", "KING", "king"], ["L", "LOVE", "luv"],
        ["M", "MIKE", "mike"], ["N", "NAN", "nan"], ["O", "OBOE", "OH-boh"],
        ["P", "PETER", "PEE-ter"], ["Q", "QUEEN", "kween"], ["R", "ROGER", "ROJ-er"],
        ["S", "SUGAR", "SHUG-ar"], ["T", "TARE", "tair"], ["U", "UNCLE", "UNK-ul"],
        ["V", "VICTOR", "VIK-tor"], ["W", "WILLIAM", "WIL-yum"], ["X", "XRAY", "EKS-ray"],
        ["Y", "YOKE", "yohk"], ["Z", "ZEBRA", "ZEE-brah"]
    ];

    /* ---- RAF 1924–1942 — the "Ace Beer Charlie" list ---- */
    const RAF24_LETTERS = [
        ["A", "ACE", "ays"], ["B", "BEER", "beer"], ["C", "CHARLIE", "CHAR-lee"],
        ["D", "DON", "don"], ["E", "EDWARD", "ED-wud"], ["F", "FREDDIE", "FRED-ee"],
        ["G", "GEORGE", "jorj"], ["H", "HARRY", "HA-ree"], ["I", "INK", "ink"],
        ["J", "JOHNNIE", "JON-ee"], ["K", "KING", "king"], ["L", "LONDON", "LUN-dun"],
        ["M", "MONKEY", "MUN-kee"], ["N", "NUTS", "nuts"], ["O", "ORANGE", "OR-inj"],
        ["P", "PIP", "pip"], ["Q", "QUEEN", "kween"], ["R", "ROBERT", "ROB-ut"],
        ["S", "SUGAR", "SHUG-ar"], ["T", "TOC", "tok"], ["U", "UNCLE", "UNK-ul"],
        ["V", "VIC", "vik"], ["W", "WILLIAM", "WIL-yum"], ["X", "XRAY", "EKS-ray"],
        ["Y", "YORKER", "YOR-ker"], ["Z", "ZEBRA", "ZEB-rah"]
    ];

    /* ---- Royal Navy 1917 — the oldest table here ---- */
    const RN17_LETTERS = [
        ["A", "APPLES", "AP-ulz"], ["B", "BUTTER", "BUT-er"], ["C", "CHARLIE", "CHAR-lee"],
        ["D", "DUFF", "duf"], ["E", "EDWARD", "ED-wud"], ["F", "FREDDY", "FRED-ee"],
        ["G", "GEORGE", "jorj"], ["H", "HARRY", "HA-ree"], ["I", "INK", "ink"],
        ["J", "JOHNNIE", "JON-ee"], ["K", "KING", "king"], ["L", "LONDON", "LUN-dun"],
        ["M", "MONKEY", "MUN-kee"], ["N", "NUTS", "nuts"], ["O", "ORANGE", "OR-inj"],
        ["P", "PUDDING", "PUD-ing"], ["Q", "QUEENIE", "KWEE-nee"], ["R", "ROBERT", "ROB-ut"],
        ["S", "SUGAR", "SHUG-ar"], ["T", "TOMMY", "TOM-ee"], ["U", "UNCLE", "UNK-ul"],
        ["V", "VINEGAR", "VIN-i-gar"], ["W", "WILLIE", "WIL-ee"], ["X", "XERXES", "ZURK-seez"],
        ["Y", "YELLOW", "YEL-oh"], ["Z", "ZEBRA", "ZEB-rah"]
    ];

    /* ---- ICAO 1947 — the short-lived table replaced by NATO in 1956 ---- */
    const ICAO47_LETTERS = [
        ["A", "ABLE", "AY-bul"], ["B", "BAKER", "BAY-ker"], ["C", "CHARLIE", "CHAR-lee"],
        ["D", "DOG", "dog"], ["E", "EASY", "EE-zee"], ["F", "FOX", "foks"],
        ["G", "GEORGE", "jorj"], ["H", "HOW", "how"], ["I", "ITEM", "EYE-tum"],
        ["J", "JIG", "jig"], ["K", "KING", "king"], ["L", "LOVE", "luv"],
        ["M", "METRO", "MET-roh"], ["N", "NECTAR", "NEK-tar"], ["O", "OPTION", "OP-shun"],
        ["P", "POLKA", "POHL-kah"], ["Q", "QUEEN", "kween"], ["R", "ROMEO", "ROH-me-oh"],
        ["S", "SIERRA", "see-AIR-ah"], ["T", "TANGO", "TANG-go"], ["U", "UNION", "YOON-yun"],
        ["V", "VICTOR", "VIK-tor"], ["W", "WHISKY", "WIS-kee"], ["X", "EXTRA", "EKS-trah"],
        ["Y", "YANKEE", "YANG-kee"], ["Z", "ZULU", "ZOO-loo"]
    ];

    /* Shared English digit table for the historical/service alphabets. */
    const EN_DIGITS = [
        ["0", "ZERO", "ZEE-ro"], ["1", "ONE", "wun"], ["2", "TWO", "too"], ["3", "THREE", "three"],
        ["4", "FOUR", "for"], ["5", "FIVE", "five"], ["6", "SIX", "siks"], ["7", "SEVEN", "SEV-en"],
        ["8", "EIGHT", "ayt"], ["9", "NINE", "nine"]
    ];

    /* ============================================================
       WORLD LANGUAGES
       ============================================================ */

    /* ---- German (Deutsches Funkalphabet) ---- */
    const DE_LETTERS = [
        ["A", "ANTON", "AHN-ton"], ["B", "BERTA", "BAIR-tah"], ["C", "CÄSAR", "TSAY-zar"],
        ["D", "DORA", "DOH-rah"], ["E", "EMIL", "AY-meel"], ["F", "FRIEDRICH", "FREED-rikh"],
        ["G", "GUSTAV", "GOOS-tahf"], ["H", "HEINRICH", "HYNE-rikh"], ["I", "IDA", "EE-dah"],
        ["J", "JULIUS", "YOO-lee-oos"], ["K", "KAUFMANN", "KOWF-mahn"], ["L", "LUDWIG", "LOOD-vikh"],
        ["M", "MARTHA", "MAR-tah"], ["N", "NORDPOL", "NORD-pohl"], ["O", "OTTO", "OT-toh"],
        ["P", "PAULA", "POW-lah"], ["Q", "QUELLE", "KVEL-luh"], ["R", "RICHARD", "RIKH-art"],
        ["S", "SAMUEL", "ZAH-moo-el"], ["T", "THEODOR", "TAY-oh-dor"], ["U", "ULRICH", "OOL-rikh"],
        ["V", "VIKTOR", "VIK-tor"], ["W", "WILHELM", "VIL-helm"], ["X", "XANTHIPPE", "ksan-TIP-puh"],
        ["Y", "YPSILON", "IP-see-lon"], ["Z", "ZACHARIAS", "tsah-khah-REE-ahs"],
        ["Ä", "ÄRGER", "AIR-ger"], ["Ö", "ÖKONOM", "uh-ko-NOHM"], ["Ü", "ÜBERMUT", "OO-ber-moot"],
        ["ß", "ESZETT", "es-TSET"]
    ];
    const DE_DIGITS = [
        ["0", "NULL", "nool"], ["1", "EINS", "eyness"], ["2", "ZWEI", "tsvy"], ["3", "DREI", "dry"],
        ["4", "VIER", "feer"], ["5", "FÜNF", "fewnf"], ["6", "SECHS", "zeks"], ["7", "SIEBEN", "ZEE-ben"],
        ["8", "ACHT", "ahkht"], ["9", "NEUN", "noyn"]
    ];

    /* ---- French (épellation téléphonique) ---- */
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

    /* ---- Italian (nomi di città) ---- */
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

    /* ---- Spanish (nombres propios) ---- */
    const ES_LETTERS = [
        ["A", "ANTONIO", "an-TOH-nyoh"], ["B", "BURGOS", "BOOR-gohs"], ["C", "CARMEN", "KAR-men"],
        ["D", "DOLORES", "do-LOH-res"], ["E", "ENRIQUE", "en-REE-keh"], ["F", "FRANCISCO", "fran-SEES-koh"],
        ["G", "GERONA", "kheh-ROH-nah"], ["H", "HISTORIA", "ees-TOH-ryah"], ["I", "INÉS", "ee-NES"],
        ["J", "JOSÉ", "kho-SEH"], ["K", "KILO", "KEE-loh"], ["L", "LORENZO", "lo-REN-soh"],
        ["M", "MADRID", "mah-DREED"], ["N", "NAVARRA", "nah-VAR-rah"], ["Ñ", "ÑOÑO", "NYOH-nyoh"],
        ["O", "OVIEDO", "o-VYEH-doh"], ["P", "PARÍS", "pah-REES"], ["Q", "QUERIDO", "keh-REE-doh"],
        ["R", "RAMÓN", "rah-MOHN"], ["S", "SÁBADO", "SAH-bah-doh"], ["T", "TOLEDO", "to-LEH-doh"],
        ["U", "ULISES", "oo-LEE-ses"], ["V", "VALENCIA", "vah-LEN-syah"], ["W", "WÁSHINGTON", "WOSH-ing-ton"],
        ["X", "XILÓFONO", "see-LOH-fo-noh"], ["Y", "YEGUA", "YEH-gwah"], ["Z", "ZARAGOZA", "sah-rah-GOH-sah"]
    ];
    const ES_DIGITS = [
        ["0", "CERO", "SEH-roh"], ["1", "UNO", "OO-noh"], ["2", "DOS", "dohs"], ["3", "TRES", "tres"],
        ["4", "CUATRO", "KWAH-troh"], ["5", "CINCO", "SEEN-koh"], ["6", "SEIS", "says"], ["7", "SIETE", "SYEH-teh"],
        ["8", "OCHO", "OH-choh"], ["9", "NUEVE", "NWEH-veh"]
    ];

    /* ---- Dutch (Nederlands telefoonalfabet) ---- */
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

    /* ---- Portuguese (cidades) ---- */
    const PT_LETTERS = [
        ["A", "AVEIRO", "ah-VAY-roo"], ["B", "BRAGA", "BRAH-gah"], ["C", "COIMBRA", "kweem-BRAH"],
        ["D", "DAFUNDO", "dah-FOON-doo"], ["E", "ÉVORA", "EH-voo-rah"], ["F", "FARO", "FAH-roo"],
        ["G", "GUARDA", "GWAR-dah"], ["H", "HORTA", "OR-tah"], ["I", "ITÁLIA", "ee-TAH-lyah"],
        ["J", "JOSÉ", "zhoo-ZEH"], ["K", "KILOGRAMA", "kee-loo-GRAH-mah"], ["L", "LISBOA", "leezh-BOH-ah"],
        ["M", "MARIA", "mah-REE-ah"], ["N", "NAZARÉ", "nah-zah-REH"], ["O", "OVAR", "oo-VAR"],
        ["P", "PORTO", "POR-too"], ["Q", "QUELUZ", "keh-LOOSH"], ["R", "ROSSIO", "roo-SEE-oo"],
        ["S", "SETÚBAL", "seh-TOO-bahl"], ["T", "TAVIRA", "tah-VEE-rah"], ["U", "UNIDADE", "oo-nee-DAH-deh"],
        ["V", "VIDAGO", "vee-DAH-goo"], ["W", "WALDEMAR", "val-deh-MAR"], ["X", "XAVIER", "shah-vee-EHR"],
        ["Y", "YORK", "york"], ["Z", "ZULMIRA", "zool-MEE-rah"]
    ];
    const PT_DIGITS = [
        ["0", "ZERO", "ZEH-roo"], ["1", "UM", "oom"], ["2", "DOIS", "doysh"], ["3", "TRÊS", "traysh"],
        ["4", "QUATRO", "KWAH-troo"], ["5", "CINCO", "SEEN-koo"], ["6", "SEIS", "saysh"], ["7", "SETE", "SEH-teh"],
        ["8", "OITO", "OY-too"], ["9", "NOVE", "NOH-veh"]
    ];

    /* ---- Swedish ---- */
    const SV_LETTERS = [
        ["A", "ADAM", "AH-dam"], ["B", "BERTIL", "BAIR-til"], ["C", "CESAR", "SAY-sar"],
        ["D", "DAVID", "DAH-vid"], ["E", "ERIK", "AIR-ik"], ["F", "FILIP", "FIL-ip"],
        ["G", "GUSTAV", "GUS-tahv"], ["H", "HELGE", "HEL-geh"], ["I", "IVAR", "EE-var"],
        ["J", "JOHAN", "YOO-han"], ["K", "KALLE", "KAL-leh"], ["L", "LUDVIG", "LOOD-vig"],
        ["M", "MARTIN", "MAR-tin"], ["N", "NIKLAS", "NIK-lass"], ["O", "OLOF", "OO-lof"],
        ["P", "PETTER", "PET-ter"], ["Q", "QVINTUS", "KVIN-tus"], ["R", "RUDOLF", "ROO-dolf"],
        ["S", "SIGURD", "SEE-gurd"], ["T", "TORE", "TOO-reh"], ["U", "URBAN", "UR-bahn"],
        ["V", "VIKTOR", "VIK-tor"], ["W", "WILHELM", "VIL-helm"], ["X", "XERXES", "SAIRK-ses"],
        ["Y", "YNGVE", "ING-veh"], ["Z", "ZÄTA", "ZEH-tah"],
        ["Å", "ÅKE", "OH-keh"], ["Ä", "ÄRLIG", "AIR-lig"], ["Ö", "ÖSTEN", "UH-sten"]
    ];
    const SV_DIGITS = [
        ["0", "NOLLA", "NOL-lah"], ["1", "ETT", "et"], ["2", "TVÅ", "tvoh"], ["3", "TRE", "treh"],
        ["4", "FYRA", "FEE-rah"], ["5", "FEM", "fem"], ["6", "SEX", "seks"], ["7", "SJU", "hwoo"],
        ["8", "ÅTTA", "OT-tah"], ["9", "NIO", "NEE-oo"]
    ];

    /* ---- Danish ---- */
    const DA_LETTERS = [
        ["A", "ANNA", "AH-nah"], ["B", "BERNHARD", "BAIRN-hard"], ["C", "CECILIE", "seh-SEEL-yeh"],
        ["D", "DAVID", "DAH-vid"], ["E", "ERIK", "AIR-ik"], ["F", "FREDERIK", "FREH-deh-rik"],
        ["G", "GEORG", "GAY-org"], ["H", "HANS", "hans"], ["I", "IDA", "EE-dah"],
        ["J", "JOHAN", "YOH-han"], ["K", "KAREN", "KAH-ren"], ["L", "LUDVIG", "LOOD-vee"],
        ["M", "MARI", "MAH-ree"], ["N", "NIKOLAJ", "NEE-ko-lie"], ["O", "ODIN", "OH-din"],
        ["P", "PETER", "PEH-ter"], ["Q", "QUINTUS", "KVIN-tus"], ["R", "RASMUS", "RAS-mus"],
        ["S", "SØREN", "SUH-ren"], ["T", "THEODOR", "TEH-oh-dor"], ["U", "ULLA", "OOL-lah"],
        ["V", "VIGGO", "VIG-goh"], ["W", "WILLIAM", "VIL-yam"], ["X", "XERXES", "SAIRK-ses"],
        ["Y", "YRSA", "EER-sah"], ["Z", "ZACKARIAS", "sah-kah-REE-as"],
        ["Æ", "ÆGIR", "AY-eer"], ["Ø", "ØDIS", "UH-dis"], ["Å", "ÅSE", "OH-seh"]
    ];
    const DA_DIGITS = [
        ["0", "NUL", "nool"], ["1", "EN", "ayn"], ["2", "TO", "toh"], ["3", "TRE", "treh"],
        ["4", "FIRE", "FEE-ah"], ["5", "FEM", "fem"], ["6", "SEKS", "seks"], ["7", "SYV", "syoo"],
        ["8", "OTTE", "OH-deh"], ["9", "NI", "nee"]
    ];

    /* ---- Norwegian ---- */
    const NO_LETTERS = [
        ["A", "ANNA", "AH-nah"], ["B", "BERNHARD", "BAIRN-hard"], ["C", "CAESAR", "SAY-sar"],
        ["D", "DAVID", "DAH-vid"], ["E", "EDITH", "EH-dit"], ["F", "FREDRIK", "FRED-rik"],
        ["G", "GUSTAV", "GOOS-tav"], ["H", "HARALD", "HAH-rald"], ["I", "IVAR", "EE-var"],
        ["J", "JOHAN", "YOO-han"], ["K", "KARIN", "KAH-rin"], ["L", "LUDVIG", "LOOD-vig"],
        ["M", "MARTIN", "MAR-tin"], ["N", "NILS", "nils"], ["O", "OLIVIA", "oo-LEE-vee-ah"],
        ["P", "PETTER", "PET-ter"], ["Q", "QUINTUS", "KVIN-tus"], ["R", "RIKARD", "REE-kard"],
        ["S", "SIGRID", "SEEG-rid"], ["T", "TEODOR", "TEH-oo-dor"], ["U", "ULRIK", "OOL-rik"],
        ["V", "ENKEL-V", "EN-kel-veh"], ["W", "DOBBELT-V", "DOB-belt-veh"], ["X", "XERXES", "SAIRK-ses"],
        ["Y", "YNGLING", "ING-ling"], ["Z", "ZAKARIAS", "sah-kah-REE-as"],
        ["Æ", "ÆRLIG", "AIR-li"], ["Ø", "ØSTEN", "UHS-ten"], ["Å", "ÅGOT", "OH-got"]
    ];
    const NO_DIGITS = [
        ["0", "NULL", "nool"], ["1", "EN", "ayn"], ["2", "TO", "too"], ["3", "TRE", "treh"],
        ["4", "FIRE", "FEE-reh"], ["5", "FEM", "fem"], ["6", "SEKS", "seks"], ["7", "SJU", "shoo"],
        ["8", "ÅTTE", "OT-teh"], ["9", "NI", "nee"]
    ];

    /* ---- Finnish ---- */
    const FI_LETTERS = [
        ["A", "AARNE", "AHR-neh"], ["B", "BERTTA", "BAIRT-tah"], ["C", "CELSIUS", "SEL-see-us"],
        ["D", "DAAVID", "DAH-vid"], ["E", "EEMELI", "AY-meh-lee"], ["F", "FAARAO", "FAH-rah-oh"],
        ["G", "GIDEON", "GEE-deh-on"], ["H", "HEIKKI", "HAYK-kee"], ["I", "IIVARI", "EE-vah-ree"],
        ["J", "JUSSI", "YOOS-see"], ["K", "KALLE", "KAHL-leh"], ["L", "LAURI", "LOW-ree"],
        ["M", "MATTI", "MAHT-tee"], ["N", "NIILO", "NEE-loh"], ["O", "OTTO", "OT-toh"],
        ["P", "PAAVO", "PAH-voh"], ["Q", "KUU", "koo"], ["R", "RISTO", "RIS-toh"],
        ["S", "SAKARI", "SAH-kah-ree"], ["T", "TYYNE", "TUU-neh"], ["U", "URHO", "OOR-hoh"],
        ["V", "VIHTORI", "VIH-toh-ree"], ["W", "WISKARI", "VIS-kah-ree"], ["X", "ÄKSÄ", "AK-sah"],
        ["Y", "YRJÖ", "UUR-yuh"], ["Z", "TSETA", "TSEH-tah"],
        ["Å", "ÅKE", "OH-keh"], ["Ä", "ÄITI", "AY-tee"], ["Ö", "ÖLJY", "UHL-yuu"]
    ];
    const FI_DIGITS = [
        ["0", "NOLLA", "NOL-lah"], ["1", "YKSI", "UUK-see"], ["2", "KAKSI", "KAHK-see"], ["3", "KOLME", "KOL-meh"],
        ["4", "NELJÄ", "NEL-yah"], ["5", "VIISI", "VEE-see"], ["6", "KUUSI", "KOO-see"], ["7", "SEITSEMÄN", "SAYT-seh-man"],
        ["8", "KAHDEKSAN", "KAH-dek-san"], ["9", "YHDEKSÄN", "UUH-dek-san"]
    ];

    /* ---- Polish ---- */
    const PL_LETTERS = [
        ["A", "ADAM", "AH-dam"], ["B", "BARBARA", "bar-BAH-rah"], ["C", "CELINA", "tseh-LEE-nah"],
        ["D", "DOROTA", "do-ROH-tah"], ["E", "EWA", "EH-vah"], ["F", "FRANCISZEK", "fran-CHEE-shek"],
        ["G", "GUSTAW", "GOOS-tav"], ["H", "HALINA", "hah-LEE-nah"], ["I", "IRENA", "ee-REH-nah"],
        ["J", "JADWIGA", "yad-VEE-gah"], ["K", "KAROL", "KAH-rol"], ["L", "LEON", "LEH-on"],
        ["M", "MARIA", "MAH-ryah"], ["N", "NATALIA", "nah-TAH-lyah"], ["O", "OLGA", "OL-gah"],
        ["P", "PAWEŁ", "PAH-veh"], ["Q", "QUEBEC", "KEH-bek"], ["R", "ROMAN", "ROH-man"],
        ["S", "STEFAN", "STEH-fan"], ["T", "TADEUSZ", "tah-DEH-oosh"], ["U", "URSZULA", "oor-SHOO-lah"],
        ["V", "VIOLETTA", "vyo-LET-tah"], ["W", "WACŁAW", "VATS-wav"], ["X", "XANTYPA", "ksan-TY-pah"],
        ["Y", "YPSILON", "IP-see-lon"], ["Z", "ZYGMUNT", "ZYG-moont"]
    ];
    const PL_DIGITS = [
        ["0", "ZERO", "ZEH-ro"], ["1", "JEDEN", "YEH-den"], ["2", "DWA", "dvah"], ["3", "TRZY", "tshy"],
        ["4", "CZTERY", "CHTEH-ry"], ["5", "PIĘĆ", "pyench"], ["6", "SZEŚĆ", "sheshch"], ["7", "SIEDEM", "SHEH-dem"],
        ["8", "OSIEM", "OH-shem"], ["9", "DZIEWIĘĆ", "JEH-vyench"]
    ];

    /* ---- Czech ---- */
    const CS_LETTERS = [
        ["A", "ADAM", "AH-dam"], ["B", "BOŽENA", "BOH-zheh-nah"], ["C", "CYRIL", "TSI-ril"],
        ["D", "DAVID", "DAH-vid"], ["E", "EMIL", "EH-mil"], ["F", "FRANTIŠEK", "FRAN-tee-shek"],
        ["G", "GUSTAV", "GOOS-tav"], ["H", "HELENA", "HEH-leh-nah"], ["I", "IVAN", "EE-van"],
        ["J", "JOSEF", "YOH-sef"], ["K", "KAREL", "KAH-rel"], ["L", "LUDVÍK", "LOOD-veek"],
        ["M", "MARIE", "MAH-ree-eh"], ["N", "NORBERT", "NOR-bert"], ["O", "OTO", "OH-toh"],
        ["P", "PETR", "PEH-tr"], ["Q", "QUIDO", "KVEE-doh"], ["R", "RUDOLF", "ROO-dolf"],
        ["S", "SVATOPLUK", "SVAH-toh-plook"], ["T", "TOMÁŠ", "TOH-mahsh"], ["U", "URBAN", "OOR-ban"],
        ["V", "VÁCLAV", "VAHTS-lav"], ["W", "DVOJITÉ VÉ", "DVOY-ee-teh veh"], ["X", "XAVER", "KSAH-ver"],
        ["Y", "YPSILON", "IP-see-lon"], ["Z", "ZUZANA", "ZOO-zah-nah"]
    ];
    const CS_DIGITS = [
        ["0", "NULA", "NOO-lah"], ["1", "JEDNA", "YED-nah"], ["2", "DVA", "dvah"], ["3", "TŘI", "trzhee"],
        ["4", "ČTYŘI", "CHTY-rzhee"], ["5", "PĚT", "pyet"], ["6", "ŠEST", "shest"], ["7", "SEDM", "SEH-dum"],
        ["8", "OSM", "OH-sum"], ["9", "DEVĚT", "DEH-vyet"]
    ];

    /* ---- Turkish (il isimleri). Turkish has no Q, W or X. ---- */
    const TR_LETTERS = [
        ["A", "ADANA", "ah-DAH-nah"], ["B", "BOLU", "boh-LOO"], ["C", "CEYHAN", "jay-HAN"],
        ["Ç", "ÇANAKKALE", "chah-nak-kah-LEH"], ["D", "DENİZLİ", "deh-neez-LEE"], ["E", "EDİRNE", "eh-deer-NEH"],
        ["F", "FATSA", "faht-SAH"], ["G", "GİRESUN", "gee-reh-SOON"], ["Ğ", "YUMUŞAK G", "yoo-moo-SHAK geh"],
        ["H", "HATAY", "hah-TIE"], ["I", "ISPARTA", "is-par-TAH"], ["İ", "İZMİR", "eez-MEER"],
        ["J", "JANDARMA", "jan-dar-MAH"], ["K", "KARS", "kars"], ["L", "LÜLEBURGAZ", "loo-leh-boor-GAZ"],
        ["M", "MUŞ", "moosh"], ["N", "NİĞDE", "nee-DEH"], ["O", "ORDU", "or-DOO"],
        ["Ö", "ÖDEMİŞ", "uh-deh-MEESH"], ["P", "POLATLI", "po-lat-LUH"], ["R", "RİZE", "ree-ZEH"],
        ["S", "SİNOP", "see-NOP"], ["Ş", "ŞIRNAK", "shuhr-NAK"], ["T", "TOKAT", "toh-KAT"],
        ["U", "UŞAK", "oo-SHAK"], ["Ü", "ÜNYE", "oon-YEH"], ["V", "VAN", "van"],
        ["Y", "YOZGAT", "yoz-GAT"], ["Z", "ZONGULDAK", "zon-gool-DAK"]
    ];
    const TR_DIGITS = [
        ["0", "SIFIR", "suh-FUHR"], ["1", "BİR", "beer"], ["2", "İKİ", "ee-KEE"], ["3", "ÜÇ", "ooch"],
        ["4", "DÖRT", "durt"], ["5", "BEŞ", "besh"], ["6", "ALTI", "al-TUH"], ["7", "YEDİ", "yeh-DEE"],
        ["8", "SEKİZ", "seh-KEEZ"], ["9", "DOKUZ", "doh-KOOZ"]
    ];

    /* ---- Greek. Latin keys follow the Beta Code convention so a
           QWERTY keyboard maps 1:1 onto the Greek letters. ---- */
    const EL_LETTERS = [
        ["Α", "ΑΣΤΗΡ", "ah-STEER", "A"], ["Β", "ΒΥΡΩΝ", "VEE-ron", "B"], ["Γ", "ΓΑΛΗ", "gah-LEE", "G"],
        ["Δ", "ΔΟΞΑ", "DOK-sah", "D"], ["Ε", "ΕΡΜΗΣ", "er-MEES", "E"], ["Ζ", "ΖΕΥΣ", "zefs", "Z"],
        ["Η", "ΗΡΩ", "ee-ROH", "H"], ["Θ", "ΘΕΑ", "theh-AH", "Q"], ["Ι", "ΙΣΚΙΟΣ", "IS-kyos", "I"],
        ["Κ", "ΚΕΝΟΝ", "keh-NON", "K"], ["Λ", "ΛΑΜΑ", "LAH-mah", "L"], ["Μ", "ΜΕΛΙ", "MEH-lee", "M"],
        ["Ν", "ΝΑΟΣ", "nah-OS", "N"], ["Ξ", "ΞΕΡΞΗΣ", "KSER-ksees", "X"], ["Ο", "ΟΣΜΗ", "os-MEE", "O"],
        ["Π", "ΠΕΤΡΟΣ", "PEH-tros", "P"], ["Ρ", "ΡΗΓΑΣ", "REE-gas", "R"], ["Σ", "ΣΟΦΙΑ", "so-FEE-ah", "S"],
        ["Τ", "ΤΙΓΡΗΣ", "TEE-grees", "T"], ["Υ", "ΥΜΝΟΣ", "EEM-nos", "U"], ["Φ", "ΦΩΦΩ", "fo-FOH", "F"],
        ["Χ", "ΧΑΡΑ", "khah-RAH", "C"], ["Ψ", "ΨΥΧΗ", "psee-KHEE", "Y"], ["Ω", "ΩΜΕΓΑ", "o-MEH-gah", "W"]
    ];
    const EL_DIGITS = [
        ["0", "ΜΗΔΕΝ", "mee-DEN"], ["1", "ΕΝΑ", "EH-nah"], ["2", "ΔΥΟ", "DEE-oh"], ["3", "ΤΡΙΑ", "TREE-ah"],
        ["4", "ΤΕΣΣΕΡΑ", "TES-seh-rah"], ["5", "ΠΕΝΤΕ", "PEN-deh"], ["6", "ΕΞΙ", "EK-see"], ["7", "ΕΠΤΑ", "ep-TAH"],
        ["8", "ΟΚΤΩ", "ok-TOH"], ["9", "ΕΝΝΕΑ", "en-NEH-ah"]
    ];

    /* ---- Russian. Latin keys use a common single-character
           transliteration so the tiles can be typed on QWERTY. ---- */
    const RU_LETTERS = [
        ["А", "АННА", "AN-nah", "A"], ["Б", "БОРИС", "bah-REES", "B"], ["В", "ВАСИЛИЙ", "vah-SEE-lee", "V"],
        ["Г", "ГРИГОРИЙ", "gree-GO-ree", "G"], ["Д", "ДМИТРИЙ", "DMEE-tree", "D"], ["Е", "ЕЛЕНА", "yeh-LYEH-nah", "E"],
        ["Ж", "ЖЕНЯ", "ZHEH-nyah", "X"], ["З", "ЗИНАИДА", "zee-nah-EE-dah", "Z"], ["И", "ИВАН", "ee-VAHN", "I"],
        ["Й", "ИВАН КРАТКИЙ", "ee-VAHN KRAT-kee", "J"], ["К", "КОНСТАНТИН", "kon-stan-TEEN", "K"],
        ["Л", "ЛЕОНИД", "leh-ah-NEED", "L"], ["М", "МИХАИЛ", "mee-khah-EEL", "M"], ["Н", "НИКОЛАЙ", "nee-kah-LIE", "N"],
        ["О", "ОЛЬГА", "OL-gah", "O"], ["П", "ПАВЕЛ", "PAH-vyel", "P"], ["Р", "РОМАН", "rah-MAHN", "R"],
        ["С", "СЕМЁН", "sye-MYON", "S"], ["Т", "ТАТЬЯНА", "tat-YAH-nah", "T"], ["У", "УЛЬЯНА", "ool-YAH-nah", "U"],
        ["Ф", "ФЁДОР", "FYO-dor", "F"], ["Х", "ХАРИТОН", "khah-ree-TON", "H"], ["Ц", "ЦАПЛЯ", "TSAP-lyah", "C"],
        ["Ч", "ЧЕЛОВЕК", "cheh-lah-VYEK", "Q"], ["Ш", "ШУРА", "SHOO-rah", "W"], ["Щ", "ЩУКА", "SHCHOO-kah"],
        ["Ъ", "ТВЁРДЫЙ ЗНАК", "TVYOR-dee znahk"], ["Ы", "ЕРЫ", "yeh-RIH", "Y"], ["Ь", "МЯГКИЙ ЗНАК", "MYAKH-kee znahk"],
        ["Э", "ЭХО", "EH-khah"], ["Ю", "ЮРИЙ", "YOO-ree"], ["Я", "ЯКОВ", "YAH-kov"]
    ];
    const RU_DIGITS = [
        ["0", "НОЛЬ", "nol"], ["1", "ОДИН", "ah-DEEN"], ["2", "ДВА", "dvah"], ["3", "ТРИ", "tree"],
        ["4", "ЧЕТЫРЕ", "cheh-TIH-reh"], ["5", "ПЯТЬ", "pyat"], ["6", "ШЕСТЬ", "shest"], ["7", "СЕМЬ", "syem"],
        ["8", "ВОСЕМЬ", "VOH-syem"], ["9", "ДЕВЯТЬ", "DYEH-vyat"]
    ];

    /* ---- Japanese Wabun (和文通話表) — the official NTT/radio table ---- */
    const JA_LETTERS = [
        ["ア", "朝日のア", "ASAHI no A", "A"], ["イ", "いろはのイ", "IROHA no I", "I"],
        ["ウ", "上野のウ", "UENO no U", "U"], ["エ", "英語のエ", "EIGO no E", "E"],
        ["オ", "大阪のオ", "OSAKA no O", "O"], ["カ", "為替のカ", "KAWASE no KA", "K"],
        ["キ", "切手のキ", "KITTE no KI"], ["ク", "クラブのク", "KURABU no KU"],
        ["ケ", "景色のケ", "KESHIKI no KE"], ["コ", "子供のコ", "KODOMO no KO"],
        ["サ", "桜のサ", "SAKURA no SA", "S"], ["シ", "新聞のシ", "SHINBUN no SHI"],
        ["ス", "すずめのス", "SUZUME no SU"], ["セ", "世界のセ", "SEKAI no SE"],
        ["ソ", "そろばんのソ", "SOROBAN no SO"], ["タ", "煙草のタ", "TABAKO no TA", "T"],
        ["チ", "千鳥のチ", "CHIDORI no CHI"], ["ツ", "つるかめのツ", "TSURUKAME no TSU"],
        ["テ", "手紙のテ", "TEGAMI no TE"], ["ト", "東京のト", "TOKYO no TO"],
        ["ナ", "名古屋のナ", "NAGOYA no NA", "N"], ["ニ", "日本のニ", "NIHON no NI"],
        ["ヌ", "沼津のヌ", "NUMAZU no NU"], ["ネ", "ねずみのネ", "NEZUMI no NE"],
        ["ノ", "野原のノ", "NOHARA no NO"], ["ハ", "はがきのハ", "HAGAKI no HA", "H"],
        ["ヒ", "飛行機のヒ", "HIKOUKI no HI"], ["フ", "富士山のフ", "FUJISAN no FU", "F"],
        ["ヘ", "平和のヘ", "HEIWA no HE"], ["ホ", "保険のホ", "HOKEN no HO"],
        ["マ", "マッチのマ", "MATCHI no MA", "M"], ["ミ", "三笠のミ", "MIKASA no MI"],
        ["ム", "無線のム", "MUSEN no MU"], ["メ", "明治のメ", "MEIJI no ME"],
        ["モ", "もみじのモ", "MOMIJI no MO"], ["ヤ", "大和のヤ", "YAMATO no YA", "Y"],
        ["ユ", "弓矢のユ", "YUMIYA no YU"], ["ヨ", "吉野のヨ", "YOSHINO no YO"],
        ["ラ", "ラジオのラ", "RAJIO no RA", "R"], ["リ", "りんごのリ", "RINGO no RI"],
        ["ル", "留守居のル", "RUSUI no RU"], ["レ", "れんげのレ", "RENGE no RE"],
        ["ロ", "ローマのロ", "ROMA no RO"], ["ワ", "わらびのワ", "WARABI no WA", "W"],
        ["ヲ", "尾張のヲ", "OWARI no WO"], ["ン", "おしまいのン", "OSHIMAI no N"]
    ];
    const JA_DIGITS = [
        ["0", "数字のゼロ", "SUUJI no ZERO"], ["1", "数字のひと", "SUUJI no HITO"], ["2", "数字のに", "SUUJI no NI"],
        ["3", "数字のさん", "SUUJI no SAN"], ["4", "数字のよん", "SUUJI no YON"], ["5", "数字のご", "SUUJI no GO"],
        ["6", "数字のろく", "SUUJI no ROKU"], ["7", "数字のなな", "SUUJI no NANA"], ["8", "数字のはち", "SUUJI no HACHI"],
        ["9", "数字のきゅう", "SUUJI no KYUU"]
    ];

    /* ============================================================
       FANTASY
       ============================================================ */

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

    /* ============================================================
       REGISTRY
       ============================================================ */
    PAS.ALPHABETS = [
        { id: "nato", name: "NATO / ICAO (Military)", group: "Standard", lang: "en-US",
          note: "The NATO / ICAO spelling alphabet. ICAO spells A and J as ALFA and JULIETT — ALPHA and JULIET are accepted too.",
          letters: NATO_LETTERS, digits: NATO_DIGITS },

        { id: "lapd", name: "LAPD / APCO (Police)", group: "Historical & Services", lang: "en-US",
          note: "LAPD / APCO — \u201cAdam Boy Charles\u201d, still heard on US police radio.",
          letters: LAPD_LETTERS, digits: EN_DIGITS },
        { id: "western-union", name: "Western Union (Telegram)", group: "Historical & Services", lang: "en-US",
          note: "Western Union's telegram alphabet — mostly US city and first names. Z is ZERO, the same word as the digit 0, so decoding ZERO gives Z.",
          letters: WU_LETTERS, digits: EN_DIGITS },
        { id: "able-baker", name: "Able Baker (1941–1956)", group: "Historical & Services", lang: "en-US",
          note: "The Joint Army/Navy alphabet used by US and UK forces before NATO took over.",
          letters: ABLE_LETTERS, digits: EN_DIGITS },
        { id: "icao-1947", name: "ICAO 1947", group: "Historical & Services", lang: "en-US",
          note: "The short-lived 1947 ICAO table — replaced by the NATO alphabet in 1956.",
          letters: ICAO47_LETTERS, digits: EN_DIGITS },
        { id: "raf-1924", name: "RAF 1924–1942", group: "Historical & Services", lang: "en-GB",
          note: "RAF wartime signalling — \u201cAce Beer Charlie Don\u201d.",
          letters: RAF24_LETTERS, digits: EN_DIGITS },
        { id: "rn-1917", name: "Royal Navy 1917", group: "Historical & Services", lang: "en-GB",
          note: "The oldest table here — Royal Navy signalling from the First World War.",
          letters: RN17_LETTERS, digits: EN_DIGITS },

        { id: "de", name: "German (Funkalphabet)", group: "World Languages", lang: "de-DE",
          note: "Deutsches Funkalphabet — the traditional table. DIN 5009 replaced these names with city names in 2022.",
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
        { id: "pt", name: "Portuguese (Cidades)", group: "World Languages", lang: "pt-PT",
          note: "Portuguese spelling alphabet — mostly towns, from Aveiro to Zulmira.",
          letters: PT_LETTERS, digits: PT_DIGITS },
        { id: "nl", name: "Dutch (Telefoonalfabet)", group: "World Languages", lang: "nl-NL",
          note: "Nederlands telefoonalfabet — the standard Dutch spelling table.",
          letters: NL_LETTERS, digits: NL_DIGITS },
        { id: "wvl", name: "West-Vlaams (West Flemish)", group: "World Languages", lang: "nl-BE",
          note: "West-Vlaams — spelt with West Flemish towns and a dash of dialect. Amai!",
          letters: WVL_LETTERS, digits: WVL_DIGITS },
        { id: "sv", name: "Swedish (Klartext)", group: "World Languages", lang: "sv-SE",
          note: "Swedish spelling alphabet — Adam Bertil Cesar, plus Å, Ä and Ö.",
          letters: SV_LETTERS, digits: SV_DIGITS },
        { id: "da", name: "Danish", group: "World Languages", lang: "da-DK",
          note: "Danish spelling alphabet, including Æ, Ø and Å.",
          letters: DA_LETTERS, digits: DA_DIGITS },
        { id: "no", name: "Norwegian", group: "World Languages", lang: "nb-NO",
          note: "Norwegian spelling alphabet — note Enkel-V and Dobbel-V for V and W.",
          letters: NO_LETTERS, digits: NO_DIGITS },
        { id: "fi", name: "Finnish", group: "World Languages", lang: "fi-FI",
          note: "Finnish spelling alphabet — Aarne Bertta Celsius, plus Ä and Ö.",
          letters: FI_LETTERS, digits: FI_DIGITS },
        { id: "pl", name: "Polish", group: "World Languages", lang: "pl-PL",
          note: "Polish spelling alphabet built from first names.",
          letters: PL_LETTERS, digits: PL_DIGITS },
        { id: "cs", name: "Czech", group: "World Languages", lang: "cs-CZ",
          note: "Czech spelling alphabet — Adam Božena Cyril.",
          letters: CS_LETTERS, digits: CS_DIGITS },
        { id: "tr", name: "Turkish (İl isimleri)", group: "World Languages", lang: "tr-TR",
          note: "Turkish spelling alphabet from province names. Turkish has no Q, W or X.",
          letters: TR_LETTERS, digits: TR_DIGITS },
        { id: "el", name: "Greek (Ελληνικό)", group: "World Languages", lang: "el-GR",
          note: "Greek spelling alphabet. Latin keys follow Beta Code: q=Θ, c=Χ, y=Ψ, w=Ω.",
          letters: EL_LETTERS, digits: EL_DIGITS },
        { id: "ru", name: "Russian (Русский)", group: "World Languages", lang: "ru-RU",
          note: "Russian spelling alphabet. Latin keys are transliterated: x=Ж, c=Ц, q=Ч, w=Ш.",
          letters: RU_LETTERS, digits: RU_DIGITS },
        { id: "ja", name: "Japanese Wabun (和文通話表)", group: "World Languages", lang: "ja-JP",
          note: "The official Japanese radio table — each kana is given as \u201c<word> no <kana>\u201d.",
          letters: JA_LETTERS, digits: JA_DIGITS },

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

    PAS.DEFAULT_ALPHABET = "nato";

    PAS.getAlphabet = function (id) {
        for (let i = 0; i < PAS.ALPHABETS.length; i++) {
            if (PAS.ALPHABETS[i].id === id) { return PAS.ALPHABETS[i]; }
        }
        return null;
    };

    /* First visit only: pick the alphabet that matches the browser language. */
    PAS.alphabetForLanguage = function (tag) {
        if (!tag) { return null; }
        const lower = String(tag).toLowerCase();
        let exact = null;
        let prefix = null;
        PAS.ALPHABETS.forEach(function (a) {
            const alang = a.lang.toLowerCase();
            if (alang === lower && !exact) { exact = a; }
            if (!prefix && alang.split("-")[0] === lower.split("-")[0] && a.group === "World Languages") { prefix = a; }
        });
        return exact || prefix;
    };
})(window);
