/* =============================================================================
   De Big Five (OCEAN) — Nederlandse inhoud
   Structuur identiek aan data.js; alleen de leesbare teksten zijn vertaald.
   Trait-sleutels, kleuren, iconen en volgorde blijven ongewijzigd.
   ========================================================================== */
const BOOK_NL = {
  meta: {
    key: "bigfive",
    title: "De Big Five",
    subtitle: "De wetenschappelijk best onderbouwde kaart van persoonlijkheid (OCEAN)",
    short: "Big Five",
    emoji: "🧬",
    accent: "#2563eb",
    eyebrow: "Een persoonlijkheidsmodel",
    description:
      "Een educatieve workshop over de Big Five (OCEAN) — het wetenschappelijk meest gerespecteerde persoonlijkheidsmodel. Meet je vijf eigenschappen en leer anderen lezen.",
    heroTitle: "Vijf schuifjes die<br />iedereen beschrijven.",
    heroLead:
      "Vergeet hokjes en types. De <em>Big Five</em> is het best onderzochte model in de psychologie — vijf onafhankelijke eigenschappen, elk een spectrum waarop jij ergens zit. Ontdek jouw profiel.",
    heroCta: "Meet je vijf eigenschappen",
    footerNote:
      "Een educatieve workshop over het Big Five-model (OCEAN). Een korte zelftest is een spiegel om over na te denken, geen klinische diagnose.",
    footerSupport:
      "De Big Five is het best onderzochte persoonlijkheidsmodel (de OCEAN-eigenschappen). Ontdek de andere modellen in <strong>De Mensenbibliotheek</strong> en zie hoe ze samenhangen.",
  },

  learn: {
    kicker: "De ideeën",
    heading: "Persoonlijkheid, gemeten",
    sub: "De Big Five kwam na decennia onderzoek naar voren als de vijf dimensies die het beste beschrijven hoe mensen van elkaar verschillen. Tik op een kaart om dieper te gaan.",
  },

  concepts: [
    {
      icon: "🧬",
      name: "Het best onderbouwde model",
      tag: "Gebouwd op bewijs, niet op intuïtie.",
      summary:
        "Anders dan typesystemen is de Big Five statistisch ontdekt — door te analyseren welke woorden we in verschillende talen en culturen gebruiken om mensen te beschrijven. Het is het model waar de academische psychologie op leunt, omdat het uitkomsten in het echte leven voorspelt en stabiel blijft over de tijd.",
      points: [
        "Afgeleid uit data, niet uit de theorie van één persoon.",
        "Repliceert over culturen en talen heen.",
        "Voorspelt uitkomsten als gezondheid, werk en relaties.",
        "De wetenschappelijke maatstaf waaraan andere tests worden afgemeten.",
      ],
    },
    {
      icon: "🎚️",
      name: "Eigenschappen zijn spectra",
      tag: "Geen hokjes — schuifjes.",
      summary:
        "Je bent geen enkel 'type'. Op elk van de vijf eigenschappen zit je ergens op een glijdende schaal, meestal dicht bij het midden. Er is geen goed of fout uiteinde — elk heeft sterke kanten en nadelen, afhankelijk van de situatie.",
      points: [
        "Iedereen heeft alle vijf de eigenschappen, in verschillende mate.",
        "De meeste mensen zitten op de meeste eigenschappen in het midden.",
        "Geen uiteinde is 'beter' — de context beslist.",
        "Je profiel is de combinatie, niet één losse score.",
      ],
    },
    {
      icon: "🔤",
      name: "De vijf eigenschappen (OCEAN)",
      tag: "Openheid, Consciëntieusheid, Extraversie, Altruïsme, Neuroticisme.",
      summary:
        "De vijf vangen nieuwsgierigheid, discipline, sociale energie, warmte en emotionele gevoeligheid. Samen schetsen ze een rijk, flexibel beeld van hoe iemand denkt, werkt en zich verbindt.",
      points: [
        "<strong>O</strong>penheid — nieuwsgierigheid, verbeelding, liefde voor het nieuwe.",
        "<strong>C</strong>onsciëntieusheid — orde, discipline, betrouwbaarheid.",
        "<strong>E</strong>xtraversie — sociale energie, opladen bij mensen.",
        "<strong>A</strong>ltruïsme — warmte, vertrouwen, samenwerking.",
        "<strong>N</strong>euroticisme — gevoeligheid voor stress en negatieve emotie.",
      ],
    },
    {
      icon: "🔄",
      name: "Eigenschappen versus toestanden",
      tag: "Stabiel, maar niet vastgezet.",
      summary:
        "Eigenschappen zijn redelijk stabiel, maar ze schuiven geleidelijk door je leven — de meeste mensen worden consciëntieuzer en vriendelijker en minder neurotisch met de jaren. En op elk moment past je gedrag zich aan de situatie aan.",
      points: [
        "Eigenschappen verschuiven over jaren, niet van de ene dag op de andere.",
        "Je kunt tegen je natuur in handelen als het ertoe doet.",
        "Groei is normaal — je zit niet vast aan een score.",
        "Gedrag = eigenschap + situatie.",
      ],
    },
    {
      icon: "🤝",
      name: "Het toepassen op mensen",
      tag: "Lees de schuifjes, pas je aan.",
      summary:
        "Zodra je iemands eigenschappen kunt inschatten, kun je beter aansluiten: geef detail aan de consciëntieuze, ruimte aan de introvert, warmte aan de vriendelijke en rust aan de gevoelige.",
      points: [
        "Hoge consciëntieusheid: geef structuur en heldere plannen.",
        "Lage extraversie: laat stilte en één-op-één-contact toe.",
        "Hoog neuroticisme: bied geruststelling en stabiliteit.",
        "Hoge openheid: breng ideeën, vernieuwing en het grote plaatje.",
      ],
    },
  ],

  assessment: {
    mode: "profile",
    kicker: "Zelftest",
    heading: "Vind je Big Five-profiel",
    sub: "Geef aan hoezeer je het met elke stelling eens bent. Vijftien korte items geven je een meting op alle vijf de eigenschappen.",
    nav: "Meten",
    icon: "🎚️",
    introTitle: "15 stellingen",
    introText: "Antwoord eerlijk en op je gevoel, over hoe je doorgaans bent. Duurt ongeveer twee minuten.",
    resultEyebrow: "Jouw profiel op vijf eigenschappen",
    resultTitle: "Jouw Big Five-profiel",
    resultBlurb: "Vijf onafhankelijke spectra. Er is geen 'beste' profiel — alleen het jouwe. Hoger is niet beter; elk uiteinde heeft zijn sterke kanten.",
    traitOrder: ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"],
    traits: {
      openness: { name: "Openheid", icon: "🌈", color: "#2563eb",
        high: "Je bent nieuwsgierig, verbeeldingsrijk en aangetrokken tot nieuwe ideeën, kunst en ervaringen. Routine kan je vervelen.",
        low: "Je bent praktisch, geaard en houdt van het vertrouwde en beproefde. Verandering om de verandering kan weerstand oproepen.",
        mid: "Je combineert nieuwsgierigheid met nuchterheid — open voor nieuwe ideeën, maar tevreden met wat werkt." },
      conscientiousness: { name: "Consciëntieusheid", icon: "🎯", color: "#0891b2",
        high: "Je bent georganiseerd, gedisciplineerd en betrouwbaar. Let op perfectionisme en starheid.",
        low: "Je bent flexibel en spontaan, maar structuur, deadlines en afmaken kunnen lastig zijn.",
        mid: "Je kunt georganiseerd zijn als het ertoe doet, zonder je door regels te laten leven." },
      extraversion: { name: "Extraversie", icon: "☀️", color: "#f0a500",
        high: "Je bent sociaal, energiek en laadt op bij mensen. Stilte of alleen zijn kan je juist leegtrekken.",
        low: "Je bent terughoudender en beschouwender, en laadt op in rust en alleen-zijn. Grote sociale settings vermoeien je.",
        mid: "Je geniet ongeveer evenveel van mensen als van alleen zijn — een ambivert." },
      agreeableness: { name: "Altruïsme", icon: "🤝", color: "#2a9d5c",
        high: "Je bent warm, vertrouwend en coöperatief. Let op dat je je eigen behoeften niet verwaarloost of conflict vermijdt.",
        low: "Je bent direct, competitief en sceptisch — sterk bij lastige knopen, maar je kunt bot of koel overkomen.",
        mid: "Je combineert warmte met eerlijkheid: je werkt samen zonder over je heen te laten lopen." },
      neuroticism: { name: "Neuroticisme", icon: "🌊", color: "#db2777",
        high: "Je voelt emoties intens en bent gevoelig voor stress. Dat geeft empathie en alertheid, maar ook zorgen.",
        low: "Je bent emotioneel stabiel en kalm onder druk. Zorg wel dat je echte risico's en gevoelens blijft opmerken.",
        mid: "Je voelt stress zoals iedereen, maar houdt over het algemeen je balans." },
    },
    questions: [
      { q: "Ik probeer graag nieuwe dingen, ideeën en ervaringen.", trait: "openness" },
      { q: "Ik heb een levendige fantasie en verken graag ideeën.", trait: "openness" },
      { q: "Ik verkies vertrouwde routine boven afwisseling en verandering.", trait: "openness", reverse: true },
      { q: "Ik houd dingen graag georganiseerd en gepland.", trait: "conscientiousness" },
      { q: "Ik kom betrouwbaar na wat ik toezeg.", trait: "conscientiousness" },
      { q: "Ik stel dingen vaak uit tot het laatste moment.", trait: "conscientiousness", reverse: true },
      { q: "Ik krijg energie als ik onder veel mensen ben.", trait: "extraversion" },
      { q: "Ik begin makkelijk een gesprek met onbekenden.", trait: "extraversion" },
      { q: "Ik verkies rustige tijd alleen boven grote sociale gelegenheden.", trait: "extraversion", reverse: true },
      { q: "Ik doe extra mijn best om anderen te helpen en samen te werken.", trait: "agreeableness" },
      { q: "Ik vertrouw mensen doorgaans en ga uit van goede bedoelingen.", trait: "agreeableness" },
      { q: "Ik kan bot zijn en mijn eigen behoeften voorop zetten.", trait: "agreeableness", reverse: true },
      { q: "Ik maak me nogal veel zorgen over dingen.", trait: "neuroticism" },
      { q: "Mijn stemming kan snel en heftig omslaan.", trait: "neuroticism" },
      { q: "Ik blijf kalm en stabiel onder druk.", trait: "neuroticism", reverse: true },
    ],
  },

  handle: {
    kicker: "Aan de slag",
    heading: "Mensen lezen en ontmoeten",
    sub: "Het punt van de Big Five is geen etiket — het is meebewegen en mensen ontmoeten waar ze zijn.",
    nav: "Toepassen",
    cta: "Zie hoe het samenhangt met de DISC-kleuren →",
    cards: [
      { icon: "🧭", title: "Lees de schuifjes", tone: "do", items: [
        "Let op energie: uitbundig versus terughoudend (E)", "Let op orde: gepland versus spontaan (C)", "Let op openheid voor nieuwe ideeën (O)", "Let op warmte versus botheid (A)", "Let op gevoeligheid voor stress (N)",
      ]},
      { icon: "💪", title: "Speel in op sterke kanten", tone: "", items: [
        "Geef de consciëntieuze heldere structuur", "Geef de open geest vernieuwing en visie", "Geef de extravert mensen en reuring", "Geef de vriendelijke een gevoel van samenwerking", "Geef de gevoelige rust en geruststelling",
      ]},
      { icon: "⚖️", title: "Overbrug verschillen", tone: "dont", items: [
        "Dwing een introvert niet tot 'optreden'", "Verdrink een spontaan iemand niet in procedures", "Zet een gevoelig iemand niet weg als 'te veel'", "Lees botheid niet als persoonlijke afkeer", "Pas je eigen stijl aan, eis niet dat zij veranderen",
      ]},
    ],
  },

  faq: [
    { q: "Is de Big Five beter dan Myers-Briggs?", a: "Wetenschappelijk gezien wel. De Big Five is uit data opgebouwd, meet spectra in plaats van hokjes, en is betrouwbaarder en voorspellender. MBTI is populair en intuïtief, maar veel zwakker als meetinstrument. Beide kunnen nuttig zijn om over na te denken." },
    { q: "Kunnen mijn eigenschappen veranderen?", a: "Langzaam. Eigenschappen zijn stabiel over maanden, maar schuiven door je leven — de meeste mensen worden consciëntieuzer en vriendelijker en minder neurotisch met de jaren. Bewuste inspanning kan ze ook verschuiven." },
    { q: "Is een hoge of lage score beter?", a: "Geen van beide. Elk uiteinde van elke eigenschap heeft sterke kanten en nadelen, afhankelijk van de situatie. Hoge consciëntieusheid helpt je afmaken; lage helpt je aanpassen. Het gaat om passendheid, niet om een ranglijst." },
    { q: "Wat is neuroticisme nu eigenlijk?", a: "Simpelweg hoe gevoelig je bent voor stress en negatieve emotie. Hoog is geen gebrek — het komt met empathie en alertheid. Laag geeft rust, maar kan echte risico's missen." },
    { q: "Hoe nauwkeurig is een test van 15 items?", a: "Het is een snelle indicatie, geen gevalideerd klinisch instrument. Genoeg om nuttige reflectie op gang te brengen; volwaardige onderzoeksschalen gebruiken veel meer items." },
    { q: "Hoe verhoudt dit zich tot de DISC-kleuren?", a: "Ze overlappen: Rood in DISC hangt losjes samen met laag altruïsme plus hoge extraversie en drive, Geel met hoge extraversie en openheid, Groen met hoog altruïsme en laag neuroticisme, en Blauw met hoge consciëntieusheid. Zie de DISC-workshop voor meer." },
  ],

  disc: {
    kicker: "Verband",
    heading: "De Big Five en de DISC-kleuren",
    sub: "De twee modellen overlappen. Zo valt elke DISC-kleur ruwweg samen met de vijf eigenschappen.",
    nav: "Kleuren",
    labels: { relate: "Typische Big Five-neiging", reflect: "Groeikant", treat: "Hoe sluit je aan" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Ontdek de DISC-kleurenworkshop →",
    colors: {
      red: {
        relate: "Lager altruïsme, meer drive en assertiviteit — direct en resultaatgericht.",
        reflect: "Ontwikkel warmte en geduld; niet elk moment is een wedstrijd.",
        treat: "Wees kort, feitelijk en gericht op de uitkomst.",
      },
      yellow: {
        relate: "Hoge extraversie en openheid — sociaal, enthousiast, gedreven door ideeën.",
        reflect: "Ontwikkel consciëntieusheid: maak de details ook echt af.",
        treat: "Wees warm en sociaal, en geef erkenning.",
      },
      green: {
        relate: "Hoog altruïsme, lager neuroticisme — warm, stabiel, coöperatief.",
        reflect: "Ontwikkel assertiviteit: benoem ook je eigen behoeften.",
        treat: "Wees geduldig, persoonlijk en geruststellend.",
      },
      blue: {
        relate: "Hoge consciëntieusheid, terughoudender — precies, zorgvuldig, kwaliteitsgericht.",
        reflect: "Ontwikkel flexibiliteit; laat normen niet doorslaan in starheid.",
        treat: "Breng detail, nauwkeurigheid en denktijd mee.",
      },
    },
  },
};

window.BOOK_NL = BOOK_NL;
