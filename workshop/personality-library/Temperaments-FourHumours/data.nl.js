/* =============================================================================
   De vier temperamenten — Nederlandse inhoud
   Structuur identiek aan data.js; alleen de leesbare teksten zijn vertaald.
   Categoriesleutels, kleuren, iconen en volgorde blijven ongewijzigd.
   ========================================================================== */
const BOOK_NL = {
  meta: {
    key: "temperaments",
    title: "De vier temperamenten",
    subtitle: "De oudste persoonlijkheidskaart — en waarom hij nog klopt",
    short: "Temperamenten",
    emoji: "🌡️",
    accent: "#9333ea",
    eyebrow: "Een klassiek model",
    description:
      "Een educatieve workshop over de vier klassieke temperamenten — sanguinisch, cholerisch, melancholisch en flegmatisch — en hoe ze samenvallen met DISC en moderne modellen.",
    heroTitle: "De 2.000 jaar oude<br />persoonlijkheidskaart.",
    heroLead:
      "Lang voor de moderne psychologie deelden de ouden mensen al in vier <em>temperamenten</em> in: sanguinisch, cholerisch, melancholisch en flegmatisch. Opvallend genoeg klinkt het nog steeds waar. Vind het jouwe.",
    heroCta: "Vind jouw temperament",
    footerNote:
      "Een educatieve workshop over de vier klassieke temperamenten (Hippocrates en Galenus). Een historische bril om over na te denken — de oude biologie van de 'lichaamssappen' is allang achterhaald, maar de gedragspatronen zijn gebleven.",
    footerSupport:
      "De vier temperamenten zijn de voorouder van veel moderne modellen, waaronder DISC. Ontdek de andere in <strong>De Mensenbibliotheek</strong>.",
  },

  learn: {
    kicker: "De ideeën",
    heading: "Vier smaken menselijke natuur",
    sub: "De vier temperamenten zijn de overgrootouder van DISC en de Big Five. Tik op een kaart om dieper te gaan.",
  },

  concepts: [
    {
      icon: "🏛️", name: "Antieke oorsprong", tag: "Hippocrates en Galenus.",
      summary: "Ruim tweeduizend jaar geleden koppelden Griekse artsen persoonlijkheid aan vier lichaamssappen. De biologie klopte niet, maar de vier gedragspatronen die ze beschreven waren scherp — en ze echoën door in elk persoonlijkheidsmodel sindsdien.",
      points: ["Voorgesteld door Hippocrates, uitgewerkt door Galenus.", "De biologie van de 'lichaamssappen' is achterhaald.", "De gedragspatronen bleven toch overeind.", "De directe voorouder van DISC en andere modellen."],
    },
    {
      icon: "🎭", name: "De vier temperamenten", tag: "Sanguinisch, cholerisch, melancholisch, flegmatisch.",
      summary: "Sanguinisch (sociaal en levendig), cholerisch (gedreven en vurig), melancholisch (diep en zorgvuldig) en flegmatisch (kalm en stabiel). De meeste mensen zijn een mengeling, met één of twee die de toon zetten.",
      points: ["<strong>Sanguinisch</strong> — uitbundig, vrolijk, sociaal.", "<strong>Cholerisch</strong> — stoutmoedig, gedreven, besluitvaardig.", "<strong>Melancholisch</strong> — bedachtzaam, precies, diep.", "<strong>Flegmatisch</strong> — kalm, geduldig, stabiel."],
    },
    {
      icon: "🔗", name: "De moderne vertaling", tag: "Het werd DISC.",
      summary: "De vier temperamenten vallen bijna één op één samen met de DISC-kleuren: cholerisch→Rood, sanguinisch→Geel, flegmatisch→Groen, melancholisch→Blauw. Het ene begrijpen verdiept het andere.",
      points: ["Cholerisch ≈ DISC Rood (Dominantie).", "Sanguinisch ≈ DISC Geel (Invloed).", "Flegmatisch ≈ DISC Groen (Stabiliteit).", "Melancholisch ≈ DISC Blauw (Consciëntieusheid)."],
    },
    {
      icon: "🌗", name: "Iedereen is een mengeling", tag: "Eén of twee zetten de toon.",
      summary: "Bijna niemand is één zuiver temperament. Meestal heb je een dominant en een ondersteunend temperament, en juist die mix maakt jou jou. De combinaties kunnen elkaars zwakke kanten zelfs opvangen.",
      points: ["Zuivere enkelvoudige temperamenten zijn zeldzaam.", "Een dominant plus een tweede is de regel.", "Tegengestelde mengelingen vullen elkaar mooi aan.", "De combinatie is het echte portret."],
    },
    {
      icon: "🤝", name: "Ermee omgaan", tag: "Oude wijsheid, nog altijd handig.",
      summary: "De temperamenten zijn een snelle, makkelijk te onthouden manier om een ruimte te lezen: geef de sanguinicus energie, kom bij de cholericus meteen ter zake, kom tegemoet aan de behoefte aan nauwkeurigheid van de melancholicus, en heb geduld met de flegmaticus.",
      points: ["Sanguinisch: houd het warm en leuk.", "Cholerisch: wees kort en resultaatgericht.", "Melancholisch: geef detail en kwaliteit.", "Flegmatisch: wees geduldig en stabiel."],
    },
  ],

  assessment: {
    mode: "classify",
    kicker: "Zelftest",
    heading: "Welk temperament ben jij?",
    sub: "Antwoord zoals je meestal bent, dan schatten we jouw leidende temperament in.",
    nav: "Vind het jouwe",
    icon: "🌡️",
    introTitle: "10 vragen",
    introText: "Kies de optie die het meest van de tijd het beste bij <em>jou</em> past.",
    resultEyebrow: "Jouw leidende temperament",
    categories: {
      sanguine: { name: "Sanguinisch", icon: "🎈", color: "#f0a500",
        summary: "Sociaal, levendig en optimistisch — je houdt van mensen, plezier en nieuwe ervaringen. Warm en spontaan, al ben je soms alle kanten tegelijk op. (DISC Geel.)",
        signsTitle: "Je bent meestal", handleTitle: "Hoe je met jou werkt",
        signs: ["Uitbundig en vrolijk", "Spraakzaam en spontaan", "Optimistisch en warm", "Snel verveeld door details"],
        handle: ["Houd het warm en sociaal", "Laat ze praten en schitteren", "Geef erkenning", "Help met structuur en afmaken"] },
      choleric: { name: "Cholerisch", icon: "🔥", color: "#b91c1c",
        summary: "Stoutmoedig, gedreven en besluitvaardig — je neemt de leiding en gaat vol voor je doel. Zelfverzekerd en snel, al ben je soms ongeduldig of bot. (DISC Rood.)",
        signsTitle: "Je bent meestal", handleTitle: "Hoe je met jou werkt",
        signs: ["Ambitieus en besluitvaardig", "Direct en competitief", "Snel in actie", "Ongeduldig bij vertraging"],
        handle: ["Wees kort en ter zake", "Richt je op resultaat", "Bied opties en laat ze kiezen", "Verspil hun tijd niet"] },
      melancholic: { name: "Melancholisch", icon: "🌧️", color: "#2563eb",
        summary: "Bedachtzaam, precies en diep — je hecht aan kwaliteit, nauwkeurigheid en betekenis. Zorgvuldig en loyaal, al kun je te lang doordenken. (DISC Blauw.)",
        signsTitle: "Je bent meestal", handleTitle: "Hoe je met jou werkt",
        signs: ["Analytisch en zorgvuldig", "Met hoge standaarden", "Diep en reflectief", "Geneigd tot doordenken"],
        handle: ["Geef detail en nauwkeurigheid", "Respecteer hun standaarden", "Geef tijd om te overwegen", "Vermijd haast en vaagheid"] },
      phlegmatic: { name: "Flegmatisch", icon: "🍃", color: "#2a9d5c",
        summary: "Kalm, geduldig en stabiel — jij bent de vredige, betrouwbare aanwezigheid die alles in balans houdt. Loyaal en makkelijk in de omgang, al houd je niet van verandering. (DISC Groen.)",
        signsTitle: "Je bent meestal", handleTitle: "Hoe je met jou werkt",
        signs: ["Kalm en gelijkmatig", "Geduldig en betrouwbaar", "Vredig en meegaand", "Terughoudend bij verandering"],
        handle: ["Wees geduldig en persoonlijk", "Geef geruststelling en stabiliteit", "Voer verandering geleidelijk in", "Waardeer hun standvastigheid"] },
    },
    questions: [
      { q: "Op een sociale gelegenheid ben jij…", options: [
        { text: "Vrolijk aan het kletsen met iedereen", cat: "sanguine" },
        { text: "De groep of het plan aan het sturen", cat: "choleric" },
        { text: "In een diep gesprek met één iemand", cat: "melancholic" },
        { text: "Ontspannen meedrijvend op de stroom", cat: "phlegmatic" } ] },
      { q: "Jouw tempo is…", options: [
        { text: "Snel en levendig", cat: "sanguine" },
        { text: "Snel en krachtig", cat: "choleric" },
        { text: "Zorgvuldig en afgewogen", cat: "melancholic" },
        { text: "Traag en gestaag", cat: "phlegmatic" } ] },
      { q: "Je geeft het meest om…", options: [
        { text: "Plezier en mensen", cat: "sanguine" },
        { text: "Resultaat en winnen", cat: "choleric" },
        { text: "Kwaliteit en nauwkeurigheid", cat: "melancholic" },
        { text: "Rust en stabiliteit", cat: "phlegmatic" } ] },
      { q: "Jouw zwakke plek is…", options: [
        { text: "Alle kanten op schieten", cat: "sanguine" },
        { text: "Ongeduldig zijn", cat: "choleric" },
        { text: "Te lang doordenken", cat: "melancholic" },
        { text: "Verandering ontwijken", cat: "phlegmatic" } ] },
      { q: "Bij beslissingen…", options: [
        { text: "Ga je op je gevoel en je enthousiasme af", cat: "sanguine" },
        { text: "Beslis je snel en stevig", cat: "choleric" },
        { text: "Analyseer je eerst grondig", cat: "melancholic" },
        { text: "Neem je de tijd en zoek je draagvlak", cat: "phlegmatic" } ] },
      { q: "Onder stress word je…", options: [
        { text: "Chaotisch en afgeleid", cat: "sanguine" },
        { text: "Eisend en scherp", cat: "choleric" },
        { text: "Teruggetrokken en kritisch", cat: "melancholic" },
        { text: "Stil en koppig", cat: "phlegmatic" } ] },
      { q: "Mensen zouden je noemen…", options: [
        { text: "Leuk en uitbundig", cat: "sanguine" },
        { text: "Gedreven en stoutmoedig", cat: "choleric" },
        { text: "Diep en precies", cat: "melancholic" },
        { text: "Kalm en betrouwbaar", cat: "phlegmatic" } ] },
      { q: "Jouw ideale werk is…", options: [
        { text: "Sociaal en afwisselend", cat: "sanguine" },
        { text: "Uitdagend met vrijheid", cat: "choleric" },
        { text: "Gedetailleerd en van hoge kwaliteit", cat: "melancholic" },
        { text: "Stabiel en harmonieus", cat: "phlegmatic" } ] },
      { q: "In gesprek…", options: [
        { text: "Praat je veel en vertel je verhalen", cat: "sanguine" },
        { text: "Kom je meteen ter zake", cat: "choleric" },
        { text: "Kies je je woorden zorgvuldig", cat: "melancholic" },
        { text: "Luister je meer dan je spreekt", cat: "phlegmatic" } ] },
      { q: "Verandering en risico voelen…", options: [
        { text: "Spannend", cat: "sanguine" },
        { text: "Het waard voor de winst", cat: "choleric" },
        { text: "Als iets om eerst te analyseren", cat: "melancholic" },
        { text: "Onrustig — ik verkies stabiliteit", cat: "phlegmatic" } ] },
    ],
  },

  handle: {
    kicker: "Aan de slag",
    heading: "Omgaan met elk temperament",
    sub: "Antieke wijsheid, verrassend praktisch om een ruimte te lezen.",
    nav: "Toepassen",
    cta: "Bekijk het volledige verband met de DISC-kleuren →",
    cards: [
      { icon: "🎈", title: "Met een sanguinicus", tone: "do", items: [
        "Houd het warm, leuk en sociaal", "Laat ze praten en gezien worden", "Geef erkenning en afwisseling", "Help ze met detail en structuur",
      ]},
      { icon: "🔥", title: "Met een cholericus", tone: "", items: [
        "Wees kort en direct", "Richt je op resultaat en doelen", "Bied keuzes, laat ze beslissen", "Verspil hun tijd niet",
      ]},
      { icon: "🌧️", title: "Met een melancholicus / flegmaticus", tone: "dont", items: [
        "Melancholisch: geef detail, nauwkeurigheid en tijd", "Melancholisch: respecteer hun hoge standaarden", "Flegmatisch: wees geduldig en geruststellend", "Flegmatisch: voer verandering zachtjes in",
      ]},
    ],
  },

  faq: [
    { q: "Is het idee van de 'vier lichaamssappen' niet achterhaald?", a: "De biologie — dat persoonlijkheid uit bloed, gal en slijm zou komen — is volledig achterhaald. Maar de vier <em>gedragspatronen</em> die de ouden beschreven bleken opmerkelijk duurzaam en zitten verwerkt in moderne modellen." },
    { q: "Hoe verhoudt dit zich tot DISC?", a: "Bijna rechtstreeks: cholerisch→Rood, sanguinisch→Geel, flegmatisch→Groen, melancholisch→Blauw. De temperamenten zijn feitelijk de voorouder van DISC. Zie de kleurenlink hieronder." },
    { q: "Kan ik er meer dan één zijn?", a: "Ja — vrijwel iedereen is een mengeling met één of twee leidende temperamenten. De uitslag toont je sterkste plus de balans." },
    { q: "Is één temperament beter?", a: "Nee. Elk heeft duidelijke sterke kanten en typische zwakke plekken; in teams en relaties vangen ze elkaar op." },
    { q: "Waarom zou je überhaupt een antiek model leren?", a: "Het is simpel, blijft hangen en sluit netjes aan op moderne modellen — een vriendelijke opstap naar mensen lezen, en een herinnering dat de menselijke natuur opvallend constant is." },
    { q: "Kan mijn temperament veranderen?", a: "Je kernneiging is redelijk stabiel, maar levenservaring, groei en context bepalen mee hoe het zich laat zien." },
  ],

  disc: {
    kicker: "Verband",
    heading: "Temperamenten en de DISC-kleuren",
    sub: "De vier temperamenten vallen bijna één op één samen met de vier DISC-kleuren.",
    nav: "Kleuren",
    labels: { relate: "Bijpassend temperament", reflect: "Groeikant", treat: "Hoe sluit je aan" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Ontdek de volledige DISC-kleurenworkshop →",
    colors: {
      red: { relate: "Cholerisch — stoutmoedig, gedreven, besluitvaardig.", reflect: "Ontwikkel geduld en empathie.", treat: "Wees kort, direct en resultaatgericht." },
      yellow: { relate: "Sanguinisch — sociaal, levendig, optimistisch.", reflect: "Ontwikkel focus en dingen afmaken.", treat: "Wees warm en sociaal, en geef erkenning." },
      green: { relate: "Flegmatisch — kalm, geduldig, stabiel.", reflect: "Ontwikkel assertiviteit en openheid voor verandering.", treat: "Wees geduldig, persoonlijk en geruststellend." },
      blue: { relate: "Melancholisch — diep, precies, zorgvuldig.", reflect: "Ontwikkel flexibiliteit; temper het doordenken.", treat: "Geef detail, nauwkeurigheid en denktijd." },
    },
  },
};

window.BOOK_NL = BOOK_NL;
