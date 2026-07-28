/* =============================================================================
   Conflictstijlen (Thomas–Kilmann) — Nederlandse inhoud
   Structuur identiek aan data.js; alleen de leesbare teksten zijn vertaald.
   Categoriesleutels, kleuren, iconen en volgorde blijven ongewijzigd.
   ========================================================================== */
const BOOK_NL = {
  meta: {
    key: "conflict",
    title: "Conflictstijlen",
    subtitle: "Hoe je omgaat met onenigheid (Thomas–Kilmann)",
    short: "Conflictstijlen",
    emoji: "⚔️",
    accent: "#ea580c",
    eyebrow: "Een gedragsmodel",
    description:
      "Een educatieve workshop over de conflictstijlen van Thomas–Kilmann. Ontdek je standaardstijl bij conflict en leer meebewegen met de situatie.",
    heroTitle: "Hoe ga jij om<br />met conflict?",
    heroLead:
      "Iedereen heeft een vaste zet zodra de spanning oploopt. Het <em>Thomas–Kilmann</em>-model plaatst vijf conflictstijlen op assertiviteit en coöperativiteit. Vind de jouwe — en leer wanneer je moet omschakelen.",
    heroCta: "Vind jouw conflictstijl",
    footerNote:
      "Een educatieve workshop over het Thomas–Kilmann-model voor conflicthantering. Een hulpmiddel om over na te denken en beter te ruziën, geen formele test.",
    footerSupport:
      "De vijf conflictstijlen komen uit het Thomas–Kilmann Conflict Mode Instrument. Ontdek de andere modellen in <strong>De Mensenbibliotheek</strong>.",
  },

  learn: {
    kicker: "De ideeën",
    heading: "Vijf manieren om een botsing aan te gaan",
    sub: "Elke conflictstijl is een mix van hoeveel je opkomt voor je eigen behoeften en hoeveel je met de ander meewerkt. Tik op een kaart om dieper te gaan.",
  },

  concepts: [
    {
      icon: "📐", name: "Twee dimensies", tag: "Assertiviteit × coöperativiteit.",
      summary: "Het model zet conflictgedrag uit op twee assen: hoeveel je opkomt voor je eigen belang (assertiviteit) en hoeveel je opkomt voor dat van de ander (coöperativiteit). Uit de hoeken en het midden komen vijf stijlen naar voren.",
      points: ["<strong>Assertiviteit</strong> — opkomen voor je eigen behoeften.", "<strong>Coöperativiteit</strong> — oog hebben voor die van de ander.", "De mix levert vijf duidelijke stijlen op.", "Iedereen kan alle vijf gebruiken — je valt alleen standaard terug op één of twee."],
    },
    {
      icon: "🎭", name: "De vijf stijlen", tag: "Doordrukken, samenwerken, compromis, vermijden, toegeven.",
      summary: "Doordrukken (ik win), toegeven (jij wint), vermijden (niemand gaat het aan), samenwerken (we winnen allebei) en compromis sluiten (we geven allebei een beetje). Elke stijl past bij sommige situaties en juist niet bij andere.",
      points: ["<strong>Doordrukken</strong> — hoog assertief, laag coöperatief.", "<strong>Toegeven</strong> — laag assertief, hoog coöperatief.", "<strong>Vermijden</strong> — laag op allebei.", "<strong>Samenwerken</strong> — hoog op allebei.", "<strong>Compromis sluiten</strong> — gemiddeld op allebei."],
    },
    {
      icon: "🎯", name: "Geen 'beste' stijl", tag: "Het hangt van de situatie af.",
      summary: "Er is geen enkele juiste stijl. Doordrukken past bij noodgevallen; toegeven beschermt een dierbare relatie; vermijden koopt tijd; samenwerken lost de belangrijke dingen op; een compromis regelt de rest. De kunst is de stijl bij het moment te kiezen.",
      points: ["Noodsituaties vragen soms om doordrukken.", "Onbelangrijke kwesties vragen soms om vermijden.", "Grote, gedeelde problemen belonen samenwerken.", "Wijsheid zit in meebewegen, niet in je vaste zet."],
    },
    {
      icon: "👀", name: "Lees de andere kant", tag: "Twee stijlen, één botsing.",
      summary: "Conflicten worden gevormd door de stijl van beide mensen. Twee doordrukkers escaleren; een vermijder frustreert een samenwerker; een toegever wordt overreden door een doordrukker. Beide stijlen zien helpt je sturen.",
      points: ["Twee doordrukkers escaleren snel.", "Vermijders laten kwesties onopgelost.", "Toegevers kunnen worden overreden.", "De dynamiek benoemen kalmeert het."],
    },
    {
      icon: "🤸", name: "Beweeg mee", tag: "Vergroot je bereik.",
      summary: "Het doel is bereik: de stijl kunnen pakken die de situatie vraagt in plaats van altijd je favoriet. Meestal betekent dat oefenen met de stijlen die je ontwijkt — vaak samenwerken of, voor sommigen, gezond doordrukken.",
      points: ["Merk op waar je automatisch heen gaat.", "Oefen de stijlen die je te weinig gebruikt.", "Kies je stijl bewust.", "Bereik wint van één sterke gewoonte."],
    },
  ],

  assessment: {
    mode: "classify",
    kicker: "Zelftest",
    heading: "Wat is jouw conflictstijl?",
    sub: "Antwoord hoe je écht neigt te reageren bij onenigheid — niet hoe je denkt dat het hoort.",
    nav: "Vind de jouwe",
    icon: "⚔️",
    introTitle: "10 vragen",
    introText: "Denk aan hoe je je meestal gedraagt bij een echte onenigheid en kies wat het beste bij <em>jou</em> past.",
    resultEyebrow: "Jouw standaard conflictstijl",
    categories: {
      competing: { name: "Doordrukken", icon: "🦁", color: "#b91c1c",
        summary: "Assertief en weinig coöperatief — je gaat stevig voor je eigen standpunt. Goud waard in een crisis of uit principe; duur voor relaties als het je enige stijl is.",
        signsTitle: "Je neigt ertoe", handleTitle: "Hoe je met jou werkt",
        signs: ["Stevig je poot stijf houden", "Doorduwen voor jouw uitkomst", "Snel beslissen onder druk", "Stillere mensen kunnen overrijden"],
        handle: ["Wees zelf ook direct en zelfverzekerd", "Kom met feiten, niet met gevoelens", "Kies alleen echt belangrijke gevechten", "Vraag anderen om inbreng als tegenwicht"] },
      collaborating: { name: "Samenwerken", icon: "🤝", color: "#2a9d5c",
        summary: "Assertief én coöperatief — je graaft naar een oplossing die voor iedereen werkt. Krachtig bij belangrijke kwesties, maar traag bij kleinigheden.",
        signsTitle: "Je neigt ertoe", handleTitle: "Hoe je met jou werkt",
        signs: ["Zoeken naar win-winoplossingen", "Ieders behoeften boven tafel krijgen", "Tijd investeren om het echt op te lossen", "Kleine kwesties kunnen overdrijven"],
        handle: ["Ga er open en eerlijk in mee", "Deel de echte onderliggende behoeften", "Bewaar het voor wat er echt toe doet", "Verwar het niet met besluiteloosheid"] },
      compromising: { name: "Compromis sluiten", icon: "⚖️", color: "#f0a500",
        summary: "Gemiddeld op allebei — je zoekt een eerlijk midden waar beide kanten een beetje inleveren. Snel en praktisch, al krijgt niemand alles.",
        signsTitle: "Je neigt ertoe", handleTitle: "Hoe je met jou werkt",
        signs: ["Het verschil delen", "Eerlijkheid en snelheid waarderen", "Toegevingen uitruilen", "Te snel akkoord gaan"],
        handle: ["Kom klaar om te geven en te nemen", "Wees duidelijk over je harde eisen", "Gebruik het als de tijd dringt", "Dring aan op samenwerken bij grote kwesties"] },
      avoiding: { name: "Vermijden", icon: "🚪", color: "#0891b2",
        summary: "Weinig assertief en weinig coöperatief — je gaat het conflict uit de weg. Handig om af te koelen of onbelangrijke ruzies te ontwijken; schadelijk als echte kwesties zo begraven raken.",
        signsTitle: "Je neigt ertoe", handleTitle: "Hoe je met jou werkt",
        signs: ["Conflict ontwijken of uitstellen", "De vrede bewaren door je terug te trekken", "Sommige kwesties laten wegebben", "Echte problemen onopgelost laten"],
        handle: ["Maak het veilig om het gesprek aan te gaan", "Breng kwesties zachtjes in, niet in een hinderlaag", "Geef tijd om zich voor te bereiden", "Kom erop terug, zodat het niet begraven blijft"] },
      accommodating: { name: "Toegeven", icon: "🕊️", color: "#7c3aed",
        summary: "Coöperatief en weinig assertief — je geeft toe om de relatie of de vrede te bewaren. Genereus en grootmoedig, maar riskant als je je eigen behoeften nooit uitspreekt.",
        signsTitle: "Je neigt ertoe", handleTitle: "Hoe je met jou werkt",
        signs: ["Toegeven om de harmonie te bewaren", "De behoeften van anderen voorop zetten", "Zelden je eigen mening doordrukken", "Stille wrok opbouwen"],
        handle: ["Vraag actief naar hun mening", "Neem hun 'ja' niet voor lief", "Maak het veilig om het oneens te zijn", "Bescherm ze tegen overreden worden"] },
    },
    questions: [
      { q: "Als er onenigheid oplaait, is je instinct om…", options: [
        { text: "Hard voor je standpunt te gaan", cat: "competing" },
        { text: "Te graven naar een oplossing voor iedereen", cat: "collaborating" },
        { text: "Een eerlijk midden te zoeken", cat: "compromising" },
        { text: "Een stap terug te doen en het te laten afkoelen", cat: "avoiding" },
        { text: "Toe te geven om de lieve vrede", cat: "accommodating" } ] },
      { q: "De discussie winnen is…", options: [
        { text: "Belangrijk — ik haal graag mijn gelijk", cat: "competing" },
        { text: "Minder belangrijk dan het goed oplossen", cat: "collaborating" },
        { text: "Prima om doormidden te delen", cat: "compromising" },
        { text: "De stress niet waard", cat: "avoiding" },
        { text: "Minder belangrijk dan de relatie", cat: "accommodating" } ] },
      { q: "Onder druk doe je het meest waarschijnlijk…", options: [
        { text: "De leiding nemen en beslissen", cat: "competing" },
        { text: "Ieders behoeften op tafel leggen", cat: "collaborating" },
        { text: "Snel een uitruil regelen", cat: "compromising" },
        { text: "Tijd kopen en je terugtrekken", cat: "avoiding" },
        { text: "Je schikken om het rustig te houden", cat: "accommodating" } ] },
      { q: "Jouw risico bij conflict is…", options: [
        { text: "Mensen overrijden", cat: "competing" },
        { text: "Kleine dingen te groot maken", cat: "collaborating" },
        { text: "Te snel akkoord gaan", cat: "compromising" },
        { text: "Kwesties onopgelost laten", cat: "avoiding" },
        { text: "Je eigen behoeften nooit uitspreken", cat: "accommodating" } ] },
      { q: "Je voelt je het best over een conflict als…", options: [
        { text: "Je de uitkomst kreeg die je wilde", cat: "competing" },
        { text: "Ieders behoeften zijn ingevuld", cat: "collaborating" },
        { text: "Het voor beide kanten eerlijk was", cat: "compromising" },
        { text: "Het stilletjes overwaaide", cat: "avoiding" },
        { text: "De relatie warm bleef", cat: "accommodating" } ] },
      { q: "Als iemand je uitdaagt…", options: [
        { text: "Daag je meteen terug uit", cat: "competing" },
        { text: "Word je nieuwsgierig naar hun kijk", cat: "collaborating" },
        { text: "Zoek je naar een deal", cat: "compromising" },
        { text: "Verander je van onderwerp of vertrek je", cat: "avoiding" },
        { text: "Geef je vaak gewoon gelijk", cat: "accommodating" } ] },
      { q: "Anderen zouden je noemen…", options: [
        { text: "Doortastend", cat: "competing" },
        { text: "Grondig", cat: "collaborating" },
        { text: "Pragmatisch", cat: "compromising" },
        { text: "Conflictschuw", cat: "avoiding" },
        { text: "Makkelijk in de omgang", cat: "accommodating" } ] },
      { q: "Een onbeduidende onenigheid verdient…", options: [
        { text: "Een snelle, stevige beslissing", cat: "competing" },
        { text: "Toch een goed gesprek", cat: "collaborating" },
        { text: "Snel de knoop doorhakken", cat: "compromising" },
        { text: "Gewoon laten lopen", cat: "avoiding" },
        { text: "De ander zijn zin geven", cat: "accommodating" } ] },
      { q: "Jouw prioriteit voor de relatie bij conflict is…", options: [
        { text: "Het juiste resultaat halen", cat: "competing" },
        { text: "Resultaat én relatie samen", cat: "collaborating" },
        { text: "Een werkbare balans", cat: "compromising" },
        { text: "De spanning vermijden", cat: "avoiding" },
        { text: "De relatie beschermen", cat: "accommodating" } ] },
      { q: "Na een conflict voel je je meestal…", options: [
        { text: "Tevreden als je gewonnen hebt", cat: "competing" },
        { text: "Goed als het echt is opgelost", cat: "collaborating" },
        { text: "Oké met een eerlijke ruil", cat: "compromising" },
        { text: "Opgelucht dat het voorbij is", cat: "avoiding" },
        { text: "Blij als de vrede bewaard bleef", cat: "accommodating" } ] },
    ],
  },

  handle: {
    kicker: "Aan de slag",
    heading: "Meebewegen met je stijl",
    sub: "Er is geen beste stijl — alleen de beste stijl voor dit moment. Vergroot je bereik.",
    nav: "Toepassen",
    cta: "Terug naar de Mensenbibliotheek →",
    cards: [
      { icon: "🧭", title: "Pas bij het moment", tone: "do", items: [
        "Druk door bij een noodgeval of principiële kwestie", "Werk samen aan belangrijke, gedeelde problemen", "Sluit een compromis als de tijd dringt", "Vermijd echt onbeduidende of verhitte momenten", "Geef toe als de relatie het zwaarst weegt",
      ]},
      { icon: "🤸", title: "Vergroot je bereik", tone: "", items: [
        "Merk je automatische reflex op", "Oefen de stijlen die je ontwijkt", "Kies je stijl bewust", "Vraag je af wat de situatie echt nodig heeft", "Kijk hoe de stijl van anderen de botsing vormt",
      ]},
      { icon: "⛔", title: "Vermijd", tone: "dont", items: [
        "Eén stijl voor alles gebruiken", "Doordrukken over dingen die er niet toe doen", "Kwesties vermijden die echt lucht nodig hebben", "Zo lang toegeven tot je er wrok van krijgt", "Hun stijl lezen als een persoonlijke aanval",
      ]},
    ],
  },

  faq: [
    { q: "Welke conflictstijl is de beste?", a: "Geen enkele — het hangt van de situatie af. De kunst is meebewegen: doordrukken in een crisis, samenwerken bij grote gedeelde kwesties, een compromis als de tijd dringt, enzovoort." },
    { q: "Kan ik meer dan één stijl hebben?", a: "Ja. De meeste mensen hebben een hoofdstijl en een reservestijl. De uitslag toont je sterkste neiging plus de balans over alle vijf." },
    { q: "Is vermijden altijd slecht?", a: "Nee. Vermijden is verstandig bij onbeduidende kwesties of om een verhit moment te laten afkoelen. Het wordt pas schadelijk als het je antwoord op alles wordt." },
    { q: "Ik geef altijd toe — is dat een probleem?", a: "Het is genereus, maar als je je eigen behoeften nooit uitspreekt, kweekt dat wrok en laat je anderen over je heen lopen. Oefen wat gezonde assertiviteit." },
    { q: "Hoe ga ik om met iemand die doordrukt?", a: "Blijf rustig en zelfverzekerd, kom met feiten, kies je gevechten en laat je niet provoceren. Kracht beantwoorden met paniek of met nóg meer kracht pakt allebei slecht uit." },
    { q: "Kan mijn stijl veranderen?", a: "Ja. Stijlen zijn gewoonten, geen vaste eigenschappen. Met bewustzijn en oefening verbreed je je bereik en kies je je reactie." },
  ],
};

window.BOOK_NL = BOOK_NL;
