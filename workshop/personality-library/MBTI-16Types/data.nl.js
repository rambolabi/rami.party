/* =============================================================================
   De 16 types (MBTI-stijl) — Nederlandse inhoud
   Structuur identiek aan data.js; alleen de leesbare teksten zijn vertaald.
   De assen, de lettercodes (E/I/S/N/T/F/J/P) en de 16 typesleutels blijven
   ongewijzigd: de engine plakt de letters aan elkaar tot een viercijferige code.
   ========================================================================== */
const BOOK_NL = {
  meta: {
    key: "mbti",
    title: "De 16 types",
    subtitle: "Het vierlettermodel, eerlijk uitgelegd",
    short: "16 types",
    emoji: "🔠",
    accent: "#7c3aed",
    eyebrow: "Een persoonlijkheidsmodel",
    description:
      "Een educatieve workshop over de 16 persoonlijkheidstypes (MBTI-stijl): vier assen die samen een viercijferige lettercode vormen. Met eerlijke kanttekeningen.",
    heroTitle: "Vier letters,<br />zestien types.",
    heroLead:
      "De beroemdste persoonlijkheidstest ter wereld sorteert mensen langs vier assen in zestien types. Enorm populair — en het waard om te begrijpen <em>en</em> te bevragen. Vind jouw vier letters.",
    heroCta: "Vind jouw type",
    footerNote:
      "Een educatieve workshop over het 16-typemodel (MBTI-stijl), gebouwd op de ideeën van Carl Jung. Populair en nuttig om over na te denken, maar wetenschappelijk zwakker dan de Big Five — behandel je uitslag als een spiegel, niet als een hokje.",
    footerSupport:
      "Het 16-typemodel is populair maar wetenschappelijk omstreden. Wil je het beter onderbouwde alternatief? Probeer de <strong>Big Five</strong> in De Mensenbibliotheek.",
  },

  learn: {
    kicker: "De ideeën",
    heading: "Hoe de zestien types werken",
    sub: "Vier of-of-voorkeuren vormen samen een viercijferige lettercode. Tik op een kaart om dieper te gaan.",
  },

  concepts: [
    {
      icon: "🔠",
      name: "Vier assen, zestien types",
      tag: "E/I · S/N · T/F · J/P.",
      summary:
        "Het model vraagt waar je je aandacht het liefst op richt, hoe je informatie opneemt, hoe je beslist en hoe je je leven inricht. Elke as heeft twee polen, en jouw voorkeuren vormen samen een van de zestien vierlettertypes. De letters zijn de Engelse beginletters en blijven internationaal hetzelfde.",
      points: [
        "<strong>E/I</strong> — waar je energie vandaan komt: mensen (Extravert) of alleen zijn (Introvert).",
        "<strong>S/N</strong> — wat je opmerkt: feiten (Sensing, zintuiglijk) of patronen (iNtuition, intuïtief).",
        "<strong>T/F</strong> — hoe je beslist: logica (Thinking, denken) of waarden (Feeling, voelen).",
        "<strong>J/P</strong> — hoe je leeft: gepland (Judging) of flexibel (Perceiving).",
      ],
    },
    {
      icon: "🧭",
      name: "Voorkeuren, geen vaardigheden",
      tag: "Linker- of rechterhand.",
      summary:
        "Een voorkeur is als links- of rechtshandig zijn: je kunt beide, maar één voelt natuurlijk. Introvert zijn betekent niet dat je niet sociaal kunt zijn — alleen dat het meer energie kost dan het oplevert.",
      points: [
        "Je gebruikt beide polen; één is gewoon je standaard.",
        "Voorkeuren zeggen niets over vaardigheid of intelligentie.",
        "De meeste mensen zijn op sommige assen duidelijker dan op andere.",
        "Een as die bijna 50/50 is, betekent simpelweg dat je makkelijk schakelt.",
      ],
    },
    {
      icon: "⚠️",
      name: "Een eerlijke kanttekening",
      tag: "Leuk, maar geen evangelie.",
      summary:
        "Het 16-typemodel is boeiend en kan inzicht opleveren, maar het staat wetenschappelijk wankel: uitslagen kunnen veranderen als je de test opnieuw doet, en mensen in of-of-hokjes duwen kost nuance. Geniet ervan als spiegel — gebruik het niet om iemand te etiketteren of in te perken.",
      points: [
        "Bij een hertest rollen er vaak een of twee andere letters uit.",
        "Echte eigenschappen zijn spectra, geen aan-uitknoppen.",
        "Gebruik type nooit om aan te nemen, te oordelen of gedrag goed te praten.",
        "Wil je degelijkheid? Combineer het met de Big Five.",
      ],
    },
    {
      icon: "🤝",
      name: "Type gebruiken met mensen",
      tag: "Sluit aan bij hun voorkeuren.",
      summary:
        "Type is het nuttigst als bril voor communicatie: geef de zintuiglijke concrete details, geef de intuïtieve de visie, geef de denker de logica, geef de voeler de menselijke impact, en respecteer of iemand het liefst gepland of open werkt.",
      points: [
        "Zintuiglijken willen feiten; intuïtieven willen het grote idee.",
        "Denkers willen logica; voelers willen waarden en impact.",
        "Planners willen beslissingen; flexibelen willen opties.",
        "Introverten willen denktijd; extraverten denken hardop.",
      ],
    },
    {
      icon: "🔄",
      name: "Type is geen lot",
      tag: "Je bent meer dan vier letters.",
      summary:
        "Geen vier letters kunnen een heel mens vangen. Gebruik je type als startpunt voor zelfreflectie en betere gesprekken — en houd het daarna licht. Groeien betekent ook je niet-voorkeurskanten ontwikkelen.",
      points: [
        "Je type is een hypothese, geen vonnis.",
        "Gezonde groei rekt juist je zwakkere voorkeuren op.",
        "Context en stemming verschuiven je gedrag dagelijks.",
        "Twee mensen van hetzelfde type kunnen enorm verschillen.",
      ],
    },
  ],

  assessment: {
    mode: "axes",
    axisColor: "#7c3aed",
    kicker: "Zelftest",
    heading: "Vind jouw vier letters",
    sub: "Twaalf of-of-keuzes. Kies de optie die natuurlijker voelt — ook als het maar een beetje is.",
    nav: "Vind type",
    icon: "🔠",
    introTitle: "12 of-of-keuzes",
    introText: "Kies bij elk paar de optie die het grootste deel van de tijd beter bij je past.",
    resultEyebrow: "Jouw type",
    axes: [
      { key: "EI", left: { code: "E", name: "Extraversie" }, right: { code: "I", name: "Introversie" } },
      { key: "SN", left: { code: "S", name: "Zintuiglijk" }, right: { code: "N", name: "Intuïtief" } },
      { key: "TF", left: { code: "T", name: "Denken" }, right: { code: "F", name: "Voelen" } },
      { key: "JP", left: { code: "J", name: "Plannend" }, right: { code: "P", name: "Flexibel" } },
    ],
    questions: [
      { q: "Op een levendig feest doe je eerder…", axis: "EI", options: [ { text: "Breed rondgaan en de sfeer opstoken", side: "L" }, { text: "Dieper praten met een paar mensen", side: "R" } ] },
      { q: "Na een drukke week laad je op door…", axis: "EI", options: [ { text: "Eropuit te gaan en mensen te zien", side: "L" }, { text: "Rustige tijd alleen te nemen", side: "R" } ] },
      { q: "Je neigt ertoe…", axis: "EI", options: [ { text: "Hardop te denken", side: "L" }, { text: "Het eerst uit te denken en dan te spreken", side: "R" } ] },
      { q: "Je vertrouwt meer op…", axis: "SN", options: [ { text: "Concrete feiten en ervaring", side: "L" }, { text: "Patronen en mogelijkheden", side: "R" } ] },
      { q: "Je richt je meer op…", axis: "SN", options: [ { text: "De details die voor je liggen", side: "L" }, { text: "Het grote geheel en wat er kan zijn", side: "R" } ] },
      { q: "Je wordt liever gezien als…", axis: "SN", options: [ { text: "Praktisch en met beide benen op de grond", side: "L" }, { text: "Fantasierijk en origineel", side: "R" } ] },
      { q: "Je beslist vooral met…", axis: "TF", options: [ { text: "Logica en objectieve analyse", side: "L" }, { text: "Waarden en hoe mensen zich voelen", side: "R" } ] },
      { q: "Bij onenigheid geef je voorrang aan…", axis: "TF", options: [ { text: "Wat eerlijk en juist is", side: "L" }, { text: "Harmonie en inleving", side: "R" } ] },
      { q: "Je wordt liever genoemd…", axis: "TF", options: [ { text: "Redelijk", side: "L" }, { text: "Meelevend", side: "R" } ] },
      { q: "Je leven heb je het liefst…", axis: "JP", options: [ { text: "Gepland en vastgelegd", side: "L" }, { text: "Flexibel en open", side: "R" } ] },
      { q: "Je voelt je beter als dingen…", axis: "JP", options: [ { text: "Beslist zijn", side: "L" }, { text: "Nog alle kanten op kunnen", side: "R" } ] },
      { q: "Jouw agenda is meestal…", axis: "JP", options: [ { text: "Gestructureerd en ordelijk", side: "L" }, { text: "Spontaan en aanpasbaar", side: "R" } ] },
    ],
    types: {
      INTJ: { name: "De Architect", blurb: "Strategische, zelfstandige visionairs die complexe systemen graag doorgronden.", strengths: ["Strategie op lange termijn", "Zelfstandig denken"], watch: ["Kan afstandelijk overkomen", "Ongeduldig bij inefficiëntie"] },
      INTP: { name: "De Logicus", blurb: "Nieuwsgierige, vindingrijke analisten die leven voor ideeën en begrip.", strengths: ["Origineel problemen oplossen", "Logische diepgang"], watch: ["Kan te ver doordenken", "Kan het praktische vergeten"] },
      ENTJ: { name: "De Commandant", blurb: "Besluitvaardige, gedreven leiders die mensen en plannen richten op grote doelen.", strengths: ["Natuurlijk leiderschap", "Strategische drive"], watch: ["Kan anderen overrijden", "Ongeduldig"] },
      ENTP: { name: "De Debater", blurb: "Snel en vindingrijk, dol op een goede intellectuele uitdaging of discussie.", strengths: ["Ideeën genereren", "Aanpassingsvermogen"], watch: ["Discussieert soms voor de sport", "Slordig in afmaken"] },
      INFJ: { name: "De Advocaat", blurb: "Scherpzinnige, principiële idealisten met een stille drang om anderen te helpen.", strengths: ["Diepe empathie", "Visie met overtuiging"], watch: ["Perfectionisme", "Opbranden door te veel geven"] },
      INFP: { name: "De Bemiddelaar", blurb: "Zachte, fantasierijke idealisten die zich laten leiden door sterke eigen waarden.", strengths: ["Mededogen", "Creativiteit"], watch: ["Te veel idealisme", "Conflictvermijding"] },
      ENFJ: { name: "De Protagonist", blurb: "Warme, charismatische mentoren die inspireren en mensen samenbrengen.", strengths: ["Anderen inspireren", "Mensen lezen"], watch: ["Te betrokken", "Iedereen te vriend willen houden"] },
      ENFP: { name: "De Campagnevoerder", blurb: "Enthousiaste, creatieve vrije geesten die overal mogelijkheden zien.", strengths: ["Enthousiasme", "Contact maken met mensen"], watch: ["Verspreide aandacht", "Rusteloos"] },
      ISTJ: { name: "De Logistiek Manager", blurb: "Betrouwbare, grondige realisten die hechten aan plicht en het goed doen.", strengths: ["Betrouwbaarheid", "Oog voor detail"], watch: ["Star bij verandering", "Te veel volgens het boekje"] },
      ISFJ: { name: "De Verdediger", blurb: "Warme, loyale beschermers die zich wijden aan de zorg voor de mensen om hen heen.", strengths: ["Loyaliteit", "Praktische zorg"], watch: ["Zichzelf wegcijferen", "Ontwijkt conflict"] },
      ESTJ: { name: "De Directeur", blurb: "Georganiseerde, besluitvaardige managers die orde brengen en dingen afkrijgen.", strengths: ["Organisatie", "Besluitvaardigheid"], watch: ["Weinig flexibel", "Bot"] },
      ESFJ: { name: "De Consul", blurb: "Sociale, zorgzame organisatoren die gemeenschappen draaiende en verbonden houden.", strengths: ["Warmte", "Harmonie in het team"], watch: ["Heeft goedkeuring nodig", "Ontwijkt conflict"] },
      ISTP: { name: "De Virtuoos", blurb: "Praktische, koelbloedige sleutelaars die dol zijn op problemen met hun handen oplossen.", strengths: ["Praktisch meesterschap", "Kalm in een crisis"], watch: ["Kan afstandelijk lijken", "Zoekt risico op"] },
      ISFP: { name: "De Avonturier", blurb: "Zachte, artistieke zielen die in het moment leven en vrijheid koesteren.", strengths: ["Gevoel voor schoonheid", "Stille warmte"], watch: ["Conflictvermijdend", "Moeilijk te peilen"] },
      ESTP: { name: "De Ondernemer", blurb: "Stoutmoedige, energieke realisten die opbloeien bij actie en snel resultaat.", strengths: ["Durf", "Snel handelen"], watch: ["Ongeduldig", "Zoekt risico op"] },
      ESFP: { name: "De Entertainer", blurb: "Spontane levensgenieters die energie en vrolijkheid in een ruimte brengen.", strengths: ["Enthousiasme", "In het nu leven"], watch: ["Hekel aan routine", "Ontwijkt stevig plannen"] },
    },
  },

  handle: {
    kicker: "Aan de slag",
    heading: "Praten dwars door de types heen",
    sub: "Type is het nuttigst als communicatiebril. Ontmoet mensen in hun voorkeuren.",
    nav: "Toepassen",
    cta: "Zie hoe het samenhangt met de DISC-kleuren →",
    cards: [
      { icon: "✅", title: "Doen", tone: "do", items: [
        "Geef zintuiglijken concrete feiten en stappen", "Geef intuïtieven de visie en het 'waarom'", "Geef denkers heldere logica", "Geef voelers de menselijke impact", "Geef introverten tijd om te verwerken",
      ]},
      { icon: "⛔", title: "Niet doen", tone: "dont", items: [
        "Type gebruiken om mensen te beoordelen of in een hokje te duwen", "Aannemen dat hetzelfde type hetzelfde mens is", "Het als vast en onveranderlijk behandelen", "Flexibele mensen in starre plannen persen", "Extraverten in stilte laten zitten",
      ]},
      { icon: "🪞", title: "Houd het licht", tone: "", items: [
        "Gebruik het om te reflecteren, niet om te etiketteren", "Verwacht dat je letters met de tijd verschuiven", "Ontwikkel ook je niet-voorkeurskanten", "Combineer het met de Big Five voor degelijkheid", "Laat mensen je verrassen",
      ]},
    ],
  },

  faq: [
    { q: "Is de 16-typetest wetenschappelijk?", a: "Hij is populair en kan inzicht geven, maar psychologen vinden hem zwak als meetinstrument: uitslagen veranderen vaak bij een hertest, en spectra in of-of-hokjes persen kost nauwkeurigheid. Behandel het als spiegel, niet als vonnis." },
    { q: "Waarom kreeg ik eerder een ander type?", a: "Omdat meerdere assen voor veel mensen dicht bij 50/50 liggen, kan een kleine verschuiving in stemming of formulering een letter doen omslaan. Dat is een bekende beperking van elke of-of-test." },
    { q: "Wat betekenen de letters?", a: "Het zijn de Engelse beginletters. E/I is waar je energie vandaan komt (mensen versus alleen zijn), S/N is wat je opmerkt (feiten versus patronen), T/F is hoe je beslist (logica versus waarden) en J/P is hoe je je leven inricht (gepland versus flexibel)." },
    { q: "Is het ene type beter dan het andere?", a: "Nee. Elk type heeft sterke kanten en blinde vlekken. Er is geen beste type — alleen een betere of slechtere match met een situatie of rol." },
    { q: "Kan mijn type veranderen?", a: "Je voorkeuren kunnen geleidelijk verschuiven, en je kunt bewust je zwakkere kanten ontwikkelen. Je zit nooit vast aan vier letters." },
    { q: "Mag ik type op het werk gebruiken om mensen te selecteren?", a: "Nee. Het is niet betrouwbaar of eerlijk genoeg voor werving of selectie. Gebruik het uitsluitend voor zelfreflectie en betere communicatie." },
  ],

  disc: {
    kicker: "Verband",
    heading: "De 16 types en de DISC-kleuren",
    sub: "De modellen zijn niet identiek, maar ze rijmen. Dit is een ruwe brug naar de DISC-kleuren.",
    nav: "Kleuren",
    labels: { relate: "Types die hier vaak naar neigen", reflect: "Groeikant", treat: "Hoe sluit je aan" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Ontdek de DISC-kleurenworkshop →",
    colors: {
      red: {
        relate: "Vaak de besluitvaardige ExTJ-types (ENTJ, ESTJ) — gedreven en de leiding nemend.",
        reflect: "Ontwikkel geduld en empathie voor tragere, zachtere mensen.",
        treat: "Wees kort, logisch en resultaatgericht.",
      },
      yellow: {
        relate: "Vaak de uitbundige ExFP- / ENxP-types — sociaal, enthousiast, dol op ideeën.",
        reflect: "Ontwikkel focus en dingen afmaken.",
        treat: "Wees warm en opgewekt, en geef ze de ruimte om te praten.",
      },
      green: {
        relate: "Vaak de zorgzame IxFx-types (ISFJ, INFP) — loyaal, zacht, gericht op harmonie.",
        reflect: "Ontwikkel assertiviteit en gemak bij conflict.",
        treat: "Wees geduldig, persoonlijk en geruststellend.",
      },
      blue: {
        relate: "Vaak de analytische IxTx-types (INTJ, ISTJ) — precies en grondig.",
        reflect: "Ontwikkel flexibiliteit en openheid voor de gevoelens van anderen.",
        treat: "Breng detail, logica en denktijd mee.",
      },
    },
  },
};

window.BOOK_NL = BOOK_NL;
