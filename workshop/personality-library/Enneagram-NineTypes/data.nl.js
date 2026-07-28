/* =============================================================================
   Het Enneagram — Nederlandse inhoud
   Structuur identiek aan data.js; alleen de leesbare teksten zijn vertaald.
   Categoriesleutels, kleuren, iconen en volgorde blijven ongewijzigd.
   ========================================================================== */
const BOOK_NL = {
  meta: {
    key: "enneagram",
    title: "Het Enneagram",
    subtitle: "Negen types, negen kernmotieven",
    short: "Enneagram",
    emoji: "🔯",
    accent: "#db2777",
    eyebrow: "Een persoonlijkheidsmodel",
    description:
      "Een educatieve workshop over de negen enneagramtypes — een kaart van persoonlijkheid op basis van motivatie. Ontdek je kerntype en hoe je met alle negen omgaat.",
    heroTitle: "Negen manieren om<br />naar de wereld te kijken.",
    heroLead:
      "Het Enneagram brengt persoonlijkheid in kaart via het <em>waarom</em> achter ons gedrag — negen kernmotieven, angsten en verlangens. Vind jouw type en leer de andere acht begrijpen.",
    heroCta: "Vind jouw type",
    footerNote:
      "Een educatieve workshop over het Enneagram. Een hulpmiddel voor zelfreflectie en het begrijpen van anderen — geen wetenschappelijk instrument en geen hokje om iemand in op te sluiten.",
    footerSupport:
      "Het Enneagram is een populair hulpmiddel voor zelfinzicht. Ontdek de andere modellen in <strong>De Mensenbibliotheek</strong> om het plaatje compleet te maken.",
  },

  learn: {
    kicker: "De ideeën",
    heading: "Een kaart van drijfveren",
    sub: "Het Enneagram sorteert mensen niet op gedrag maar op de diepere drijfveren eronder. Tik op een kaart om dieper te gaan.",
  },

  concepts: [
    {
      icon: "🔯", name: "Negen types", tag: "Ieder één kerntype.",
      summary: "Het Enneagram beschrijft negen duidelijk verschillende persoonlijkheidstypes, elk met een eigen kernmotief, basisangst en basisverlangen. De meeste mensen hebben één dominant type dat bepaalt hoe ze de wereld zien en erdoorheen bewegen.",
      points: ["Elk type heeft een kernangst en een kernverlangen.", "Je hebt één dominant type, geen negen.", "Types beschrijven motivatie, niet alleen gedrag.", "Geen type is beter — elk heeft gaven en valkuilen."],
    },
    {
      icon: "🧭", name: "Waarom, niet wat", tag: "Motivatie boven gedrag.",
      summary: "Twee mensen kunnen precies hetzelfde doen om tegengestelde redenen. De kracht van het Enneagram is dat het onder de oppervlakte kijkt naar de motivatie achter het gedrag — daarom kan het zo raak aanvoelen.",
      points: ["Dezelfde handeling kan uit verschillende types komen.", "Het benoemt je verborgen 'waarom'.", "Juist daarom voelt het zo persoonlijk.", "Je drijfveer kennen geeft je een keuze."],
    },
    {
      icon: "➡️", name: "Vleugels en pijlen", tag: "Types staan niet los.",
      summary: "Je kerntype krijgt kleur van zijn buren (je 'vleugels'), en je schuift naar andere types bij groei en bij stress (de 'pijlen'). Het is een dynamisch systeem, geen negen vaste hokjes.",
      points: ["Vleugels: de twee types naast het jouwe kleuren je stijl.", "Pijlen: bij groei schuif je naar het ene type, bij stress naar het andere.", "Dat verklaart waarom je op goede en slechte dagen anders bent.", "Het systeem is vloeiend, niet vast."],
    },
    {
      icon: "🌱", name: "Groei en stress", tag: "Zelfde type, gezond of niet.",
      summary: "Elk type heeft een gezonde, gemiddelde en ongezonde uitdrukking. Het doel is niet om van type te wisselen maar om naar de gezonde versie van je eigen type te bewegen — vrijer, minder gestuurd door angst.",
      points: ["Elk type heeft een beste en een slechtste versie.", "Groei = minder geregeerd door je kernangst.", "Zelfinzicht is de eerste stap.", "Je laat je type groeien, je ruilt het niet in."],
    },
    {
      icon: "🤝", name: "Ermee omgaan", tag: "Sluit aan bij hun drijfveer.",
      summary: "Zodra je iemands type aanvoelt, kun je inspelen op wat diegene echt nodig heeft — geruststelling voor een Zes, waardering voor een Twee, respect voor een Acht, ruimte voor een Vijf.",
      points: ["Richt je op de kernbehoefte, niet alleen op het gedrag.", "Verschillende types hebben heel verschillende dingen nodig.", "Het kweekt geduld en empathie.", "Typeer mensen niet om te oordelen — maar om te begrijpen."],
    },
  ],

  assessment: {
    mode: "classify",
    kicker: "Zelftest",
    heading: "Welk enneagramtype ben jij?",
    sub: "Kies bij elke vraag de optie die het meest waar klinkt over wat jou drijft. Antwoord over jezelf in het algemeen, niet over één moment.",
    nav: "Vind type",
    icon: "🔯",
    introTitle: "9 vragen",
    introText: "Kies telkens de optie die het dichtst bij je echte motivatie ligt — ga op je gevoel af.",
    resultEyebrow: "Jouw waarschijnlijke kerntype",
    categories: {
      one: { name: "1 · De Perfectionist", icon: "🎯", color: "#b45309",
        summary: "Principieel, doelgericht en beheerst, met een strenge innerlijke criticus. Gedreven om goed te zijn en dingen te verbeteren.",
        signsTitle: "Kernpatroon", handleTitle: "Hoe je met ze omgaat",
        signs: ["Wil dingen juist doen", "Sterk gevoel van 'het hoort zo'", "Zelfkritisch en precies", "Angst om fout of verdorven te zijn"],
        handle: ["Erken hun standaarden", "Wees eerlijk en betrouwbaar", "Ga niet zelf zitten muggenziften", "Help ze de innerlijke criticus te temperen"] },
      two: { name: "2 · De Helper", icon: "🤲", color: "#db2777",
        summary: "Warm, gul en op mensen gericht, met de wens nodig te zijn en bemind te worden. Kan de eigen behoeften vergeten.",
        signsTitle: "Kernpatroon", handleTitle: "Hoe je met ze omgaat",
        signs: ["Richt zich op de behoeften van anderen", "Wil zich gewaardeerd voelen", "Vindt het lastig om hulp te vragen", "Angst om ongewenst te zijn"],
        handle: ["Waardeer ze oprecht", "Vraag ook wat zíj nodig hebben", "Neem hun geven niet voor lief", "Moedig gezonde grenzen aan"] },
      three: { name: "3 · De Presteerder", icon: "🏆", color: "#f0a500",
        summary: "Gedreven, flexibel en bezig met het eigen imago, met de wens te slagen en bewonderd te worden. Kan het contact met de eigen gevoelens verliezen.",
        signsTitle: "Kernpatroon", handleTitle: "Hoe je met ze omgaat",
        signs: ["Doelgericht en efficiënt", "Hecht aan imago en succes", "Kan zichzelf voorbijwerken", "Angst om waardeloos te zijn"],
        handle: ["Waardeer ze om wie ze zijn, niet alleen om hun successen", "Wees direct en efficiënt", "Help ze vaart te minderen", "Ga niet met ze wedijveren om status"] },
      four: { name: "4 · De Individualist", icon: "🎨", color: "#7c3aed",
        summary: "Gevoelig, expressief en naar binnen gekeerd, met een verlangen naar echtheid en eigenheid. Vatbaar voor zwaarmoedigheid en vergelijken.",
        signsTitle: "Kernpatroon", handleTitle: "Hoe je met ze omgaat",
        signs: ["Emotioneel diep", "Wil als uniek gezien worden", "Vatbaar voor afgunst en verlangen", "Angst om geen eigen identiteit te hebben"],
        handle: ["Neem hun gevoelens serieus", "Jaag ze niet op en repareer ze niet", "Waardeer hun echtheid", "Anker ze zachtjes in het nu"] },
      five: { name: "5 · De Onderzoeker", icon: "🔬", color: "#2563eb",
        summary: "Scherp waarnemend, gesloten en beschouwend, op zoek naar kennis en zuinig op de eigen energie. Kan zich terugtrekken en afsluiten.",
        signsTitle: "Kernpatroon", handleTitle: "Hoe je met ze omgaat",
        signs: ["Snakt naar begrijpen", "Bewaakt tijd en privacy", "Terughoudend en zelfstandig", "Angst om leeggezogen of overlopen te worden"],
        handle: ["Respecteer hun ruimte en energie", "Geef ze denktijd", "Wees helder en niet opdringerig", "Eis geen emotionele vertoning"] },
      six: { name: "6 · De Loyalist", icon: "🛡️", color: "#0891b2",
        summary: "Toegewijd, verantwoordelijk en gericht op veiligheid, altijd scannend op gevaar. Loyaal maar onrustig en twijfelend.",
        signsTitle: "Kernpatroon", handleTitle: "Hoe je met ze omgaat",
        signs: ["Loyaal en voorbereid", "Denkt vooruit over wat mis kan gaan", "Zoekt geruststelling en vertrouwen", "Angst om zonder steun te staan"],
        handle: ["Wees consequent en betrouwbaar", "Bied rustige geruststelling", "Praat hun zorgen door", "Kom niet aanzetten met verrassingen"] },
      seven: { name: "7 · De Enthousiasteling", icon: "🎈", color: "#e11d48",
        summary: "Spontaan, opgewekt en veelzijdig, op jacht naar ervaringen en mogelijkheden. Ontwijkt pijn en het gevoel vast te zitten.",
        signsTitle: "Kernpatroon", handleTitle: "Hoe je met ze omgaat",
        signs: ["Houdt van plezier en mogelijkheden", "Houdt opties open", "Ontwijkt pijn en verveling", "Angst om vast te zitten of iets te missen"],
        handle: ["Breng energie en ideeën mee", "Geef ze vrijheid", "Help ze zachtjes dingen af te maken", "Laat ze ook het moeilijke voelen"] },
      eight: { name: "8 · De Uitdager", icon: "⚡", color: "#b91c1c",
        summary: "Krachtig, besluitvaardig en beschermend, met de wens de regie te houden en kwetsbaarheid te vermijden. Direct en intens.",
        signsTitle: "Kernpatroon", handleTitle: "Hoe je met ze omgaat",
        signs: ["Neemt vanzelf de leiding", "Beschermt de eigen mensen", "Direct en wilskrachtig", "Angst om gecontroleerd of geschaad te worden"],
        handle: ["Wees recht door zee en stevig", "Speel geen spelletjes en manipuleer niet", "Respecteer hun zelfstandigheid", "Laat ze merken dat kwetsbaarheid veilig is"] },
      nine: { name: "9 · De Bemiddelaar", icon: "☮️", color: "#2a9d5c",
        summary: "Makkelijk in de omgang, accepterend en stabiel, op zoek naar harmonie en conflict vermijdend. Kan berustend en zichzelf vergetend worden.",
        signsTitle: "Kernpatroon", handleTitle: "Hoe je met ze omgaat",
        signs: ["Kalm en meegaand", "Ontwijkt conflict", "Gaat op in de agenda van anderen", "Angst voor verlies en scheiding"],
        handle: ["Nodig hun échte mening uit", "Wees geduldig, zet ze niet onder druk", "Waardeer hun standvastigheid", "Help ze voor zichzelf op te komen"] },
    },
    questions: [
      { q: "Wat is voor jou het belangrijkst?", options: [
        { text: "Dingen op de juiste manier doen", cat: "one" },
        { text: "Begrijpen hoe het echt in elkaar zit", cat: "five" },
        { text: "Dat iedereen het goed met elkaar heeft", cat: "nine" } ] },
      { q: "In een groep neig je ertoe…", options: [
        { text: "Voor ieders behoeften te zorgen", cat: "two" },
        { text: "Op te letten wat er mis kan gaan", cat: "six" },
        { text: "Het plezier en de ideeën te brengen", cat: "seven" } ] },
      { q: "Je wilt het liefst…", options: [
        { text: "Succesvol en bewonderd zijn", cat: "three" },
        { text: "Echt en uniek zijn", cat: "four" },
        { text: "Sterk zijn en de regie hebben", cat: "eight" } ] },
      { q: "Je innerlijke stem duwt je om…", options: [
        { text: "Goed en correct te zijn", cat: "one" },
        { text: "Nodig en bemind te zijn", cat: "two" },
        { text: "Indruk te maken en te winnen", cat: "three" } ] },
      { q: "Onder stress…", options: [
        { text: "Trek je je terug in je gevoelens", cat: "four" },
        { text: "Trek je je terug om alleen na te denken", cat: "five" },
        { text: "Zoek je geruststelling en bereid je je voor op het ergste", cat: "six" } ] },
      { q: "Je wilt vooral vermijden…", options: [
        { text: "Verveling en vastzitten", cat: "seven" },
        { text: "Zwakte en gecontroleerd worden", cat: "eight" },
        { text: "Conflict en onder druk gezet worden", cat: "nine" } ] },
      { q: "Jouw natuurlijke energie is…", options: [
        { text: "Gedisciplineerd en dingen verbeterend", cat: "one" },
        { text: "Diep en emotioneel rijk", cat: "four" },
        { text: "Opgewekt en alweer op naar het volgende", cat: "seven" } ] },
      { q: "In relaties…", options: [
        { text: "Geef je veel en wil je waardering", cat: "two" },
        { text: "Heb je veel ruimte en privacy nodig", cat: "five" },
        { text: "Bescherm je je mensen en neem je de leiding", cat: "eight" } ] },
      { q: "Je voelt je het veiligst als…", options: [
        { text: "Je presteert en op koers ligt", cat: "three" },
        { text: "Je weet wie en wat je kunt vertrouwen", cat: "six" },
        { text: "Alles rustig en op zijn plek is", cat: "nine" } ] },
    ],
  },

  handle: {
    kicker: "Aan de slag",
    heading: "Omgaan met alle negen",
    sub: "Elk type heeft iets anders nodig. Sluit aan bij de drijfveer en je bereikt de mens.",
    nav: "Toepassen",
    cta: "Zie hoe het samenhangt met de DISC-kleuren →",
    cards: [
      { icon: "🤝", title: "Sluit aan bij de behoefte", tone: "do", items: [
        "1 en 6: betrouwbaarheid en geruststelling", "2 en 9: waardering en een echte stem", "3 en 7: respecteer hun drive, help ze landen", "4: neem gevoelens serieus; 5: geef ruimte", "8: wees recht door zee en stevig",
      ]},
      { icon: "🌱", title: "Ondersteun groei", tone: "", items: [
        "Spiegel hun gaven terug", "Benoem de angst zachtjes, niet als wapen", "Moedig de gezonde versie van hun type aan", "Heb geduld — verandering gaat traag", "Laat zien dat het veilig is het patroon los te laten",
      ]},
      { icon: "⛔", title: "Vermijd", tone: "dont", items: [
        "Type gebruiken om mensen te etiketteren of weg te zetten", "Aannemen dat je iemand kent op basis van een cijfer", "Een type beter of slechter noemen", "Anderen typeren om discussies te winnen", "Het als vast en definitief behandelen",
      ]},
    ],
  },

  faq: [
    { q: "Is het Enneagram wetenschappelijk?", a: "Het is eerder een populair hulpmiddel voor zelfinzicht dan een gevalideerd wetenschappelijk instrument zoals de Big Five. Veel mensen vinden het verhelderend — houd het gewoon als spiegel, niet als feit." },
    { q: "Kan ik meer dan één type zijn?", a: "Je hebt één kerntype, maar het krijgt kleur van je 'vleugels' (de types ernaast), en bij groei en stress schuif je naar andere. Je herkent jezelf dus in meerdere." },
    { q: "Kan mijn type veranderen?", a: "De meeste leraren zeggen dat je kerntype levenslang stabiel is, maar hoe gezond je het uitdrukt kan enorm veranderen. Groei betekent de beste versie van je type worden." },
    { q: "Wat als twee types even waar voelen?", a: "Dat komt vaak voor. Kijk naar je kernmotief en kernangst in plaats van naar gedrag — het Enneagram gaat over <em>waarom</em> je dingen doet, en dat wijst meestal naar één type." },
    { q: "Is het ene type beter dan het andere?", a: "Nee. Elk type heeft echte gaven en typische valkuilen. Er is geen beste of slechtste — alleen andere kerndrijfveren." },
    { q: "Hoe verhoudt dit zich tot DISC?", a: "Het zijn verschillende kaarten, maar ze overlappen. Zie de DISC-workshop en de kleurenlink hieronder voor een ruwe brug." },
  ],

  disc: {
    kicker: "Verband",
    heading: "Het Enneagram en de DISC-kleuren",
    sub: "Een ruwe brug tussen de negen types en de vier DISC-kleuren.",
    nav: "Kleuren",
    labels: { relate: "Types die hier vaak naar neigen", reflect: "Groeikant", treat: "Hoe sluit je aan" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Ontdek de DISC-kleurenworkshop →",
    colors: {
      red: { relate: "Vaak Achten en gedreven Drieën — assertief en de leiding nemend.", reflect: "Ontwikkel geduld, zachtheid en vertrouwen.", treat: "Wees direct, stevig en ter zake." },
      yellow: { relate: "Vaak Zevens en op imago gerichte Drieën — opgewekt en expressief.", reflect: "Ontwikkel diepgang en dingen afmaken.", treat: "Wees warm en positief, en geef ze ruimte." },
      green: { relate: "Vaak Negens en Tweeën — harmonieus en zorgzaam.", reflect: "Ontwikkel een stevigere, duidelijkere stem.", treat: "Wees geduldig, zacht en waarderend." },
      blue: { relate: "Vaak Enen, Vijven en Zessen — zorgvuldig en bedachtzaam.", reflect: "Ontwikkel flexibiliteit en vertrouwen in jezelf.", treat: "Wees nauwkeurig, rustig en geef denkruimte." },
    },
  },
};

window.BOOK_NL = BOOK_NL;
