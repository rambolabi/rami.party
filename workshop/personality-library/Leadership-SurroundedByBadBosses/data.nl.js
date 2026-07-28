/* =============================================================================
   Omringd door slechte bazen (en luie werknemers) — Nederlandse inhoud
   Educatieve workshop geïnspireerd op het boek van Thomas Erikson. Structuur
   identiek aan data.js; categoriesleutels, kleuren, iconen en volgorde blijven
   ongewijzigd.
   ========================================================================== */
const BOOK_NL = {
  meta: {
    key: "bad-bosses",
    title: "Omringd door slechte bazen",
    subtitle: "Herken het type en leer je baas te managen",
    short: "Slechte bazen",
    emoji: "💼",
    accent: "#b45309",
    eyebrow: "Een workshop van Thomas Erikson",
    description:
      "Een educatieve workshop geïnspireerd op 'Omringd door slechte bazen en luie werknemers' van Thomas Erikson. Herken de valkuilen van leiderschap en leer omhoog managen.",
    heroTitle: "Is jouw baas<br />het probleem?",
    heroLead:
      "Slecht management put teams sneller uit dan wat ook. Leer de klassieke types slechte baas kennen uit <em>Omringd door slechte bazen en luie werknemers</em> van Thomas Erikson — en hoe je omhoog managet.",
    heroCta: "Diagnosticeer je baas",
    footerNote:
      "Een educatieve workshop geïnspireerd op <em>Omringd door slechte bazen en luie werknemers</em> van Thomas Erikson. Een hulpmiddel om over na te denken en werkrelaties te verbeteren — geen beoordeling van een echt persoon.",
  },

  learn: {
    kicker: "De ideeën",
    heading: "Waarom goed management zeldzaam is",
    sub: "De meeste slechte bazen zijn geen schurken — het zijn mensen die verder zijn gepromoveerd dan hun kunnen, onder druk staan en op instinct leidinggeven. Tik op een kaart om dieper te gaan.",
  },

  concepts: [
    {
      icon: "🧭",
      name: "Leiderschap is gedrag",
      tag: "Geen titel — een set gewoonten.",
      summary:
        "Leiderschap is geen persoonlijkheid waarmee je geboren wordt; het is gedrag dat je kiest. De beste leidinggevenden passen hun stijl aan de persoon en de situatie aan. De slechtste leggen één starre stijl op aan iedereen en noemen dat 'zo ben ik nu eenmaal'.",
      points: [
        "Goed management past zich aan de mens aan, niet aan het organogram.",
        "Verschillende mensen hebben verschillende hoeveelheden sturing en steun nodig.",
        "De meeste 'slechte bazen' leiden op de automatische piloot, niet uit kwaadwil.",
        "Hetzelfde gedrag kan sterk of giftig zijn, afhankelijk van de dosis.",
      ],
    },
    {
      icon: "🎭",
      name: "De types slechte baas",
      tag: "Tiran, micromanager, spookbaas, watje.",
      summary:
        "Slecht management valt uiteen in herkenbare valkuilen: regeren met angst, elk detail controleren, volledig verdwijnen, of elke lastige beslissing ontlopen. De test schat in met welk type je te maken hebt.",
      points: [
        "<strong>De tiran:</strong> leidt met angst, druk en schuld.",
        "<strong>De micromanager:</strong> kan niet delegeren of vertrouwen.",
        "<strong>De spookbaas:</strong> afwezig, vaag, zonder richting.",
        "<strong>Het watje:</strong> ontloopt beslissingen en conflict.",
      ],
    },
    {
      icon: "😴",
      name: "De mythe van de 'luie werknemer'",
      tag: "Afhaken heeft oorzaken.",
      summary:
        "Erikson stelt dat de meeste 'luie' werknemers niet lui zijn — ze weten het niet, ze zijn ongemotiveerd, ze zitten op de verkeerde plek of ze worden slecht geleid. Gedrag dat op luiheid lijkt heeft meestal een oorzaak die je kunt oplossen.",
      points: [
        "Onduidelijke verwachtingen lijken op luiheid.",
        "De verkeerde rol voor iemands sterke kanten lijkt op luiheid.",
        "Verloren motivatie na genegeerd te zijn lijkt op luiheid.",
        "Los de oorzaak op voordat je de persoon beoordeelt.",
      ],
    },
    {
      icon: "⬆️",
      name: "Omhoog managen",
      tag: "Werk met de baas die je hebt.",
      summary:
        "Je kunt je baas zelden kiezen, maar je kunt de relatie wél managen. Begrijp waar ze bang voor zijn en wat ze waarderen, pas je communicatie aan, en maak het ze makkelijk om je te vertrouwen.",
      points: [
        "Zoek uit waar je baas zich werkelijk zorgen over maakt.",
        "Geef ze informatie in de vorm die zij prettig vinden.",
        "Verminder hun onzekerheid en je vermindert hun rare gedrag.",
        "Leg afspraken vast, zodat de lat niet stilletjes verschuift.",
      ],
    },
    {
      icon: "🔧",
      name: "Als jij de baas bent",
      tag: "De zelfbewuste leidinggevende.",
      summary:
        "In elk van deze types glijd je onder druk zomaar. Het tegengif is zelfinzicht: merk op in welke valkuil je standaard schiet en beweeg bewust naar wat elk mens nodig heeft.",
      points: [
        "Weet in welk type slechte baas je schiet onder stress.",
        "Vraag om eerlijke feedback en doe er ook echt iets mee.",
        "Delegeer uitkomsten, niet alleen taken.",
        "Pas je stijl aan per teamlid.",
      ],
    },
  ],

  assessment: {
    mode: "classify",
    kicker: "Diagnose",
    heading: "Wat voor baas heb jij?",
    sub: "Denk aan één specifieke leidinggevende — nu of vroeger. Antwoord op wat je waarneemt, dan schatten we hun dominante valkuil in.",
    nav: "Diagnose",
    icon: "🔎",
    introTitle: "12 waarnemingen",
    introText: "Houd één baas in gedachten en kies de optie die het beste bij <em>hen</em> past.",
    resultEyebrow: "Het dominante type van jouw baas",
    categories: {
      tyrant: {
        name: "De tiran",
        icon: "⚡",
        color: "#b91c1c",
        summary:
          "Leidt met angst, druk en schuld. Resultaat nu, gevoelens nooit. Het team presteert uit spanning, niet uit betrokkenheid — en brandt op.",
        signs: ["Regeert met intimidatie en druk", "Geeft schuld in plaats van te coachen", "Kritiek in het openbaar, eer in eigen zak", "Weinig oog voor werkdruk of mensen", "Mensen vallen stil als ze binnenkomen"],
        handle: ["Blijf rustig, feitelijk en zelfverzekerd", "Kom met oplossingen, niet met problemen", "Leg beslissingen en instructies vast", "Stel grenzen aan onaanvaardbaar gedrag", "Bescherm je welzijn en ken je uitgangen"],
      },
      micromanager: {
        name: "De micromanager",
        icon: "🔬",
        color: "#b45309",
        summary:
          "Kan niet delegeren of vertrouwen. Wil elk detail goedkeuren, herschrijft je werk en verwart controle met kwaliteit. Talent stikt eronder.",
        signs: ["Wil alles controleren en goedkeuren", "Herschrijft werk zonder noodzaak", "Vraagt voortdurend om updates", "Kan geen echt eigenaarschap weggeven", "Verwart controle met kwaliteit"],
        handle: ["Communiceer voortgang uit jezelf en ruim", "Deel je plan voordat ze erom vragen", "Bouw vertrouwen op met kleine, betrouwbare successen", "Spreek vaste ijkmomenten af om verrassing weg te nemen", "Vraag rustig om eigenaarschap over afgebakende stukken"],
      },
      ghost: {
        name: "De spookbaas",
        icon: "👻",
        color: "#64748b",
        summary:
          "Afwezig en vaag. Geen richting, geen feedback, onbereikbaar als je een beslissing nodig hebt — en dan verbaasd als het misgaat, of stilletjes met de eer strijkend.",
        signs: ["Onbereikbaar en moeilijk vast te pinnen", "Geeft vage of geen richting", "Weinig feedback of steun", "Beslissingen blijven op hen wachten", "Duikt op zodra er eer te halen valt"],
        handle: ["Vraag om concrete, schriftelijke beslissingen", "Stel standaardacties voor: 'tenzij je bezwaar hebt, doe ik…'", "Creëer je eigen duidelijkheid en bevestig die", "Houd bij wat jij hebt bijgedragen", "Bouw een steunnetwerk buiten hen om"],
      },
      pushover: {
        name: "Het watje",
        icon: "🌾",
        color: "#0891b2",
        summary:
          "Conflictschuw en besluiteloos. Zo graag aardig gevonden dat problemen etteren, zwakke presteerders ongemoeid blijven en het team stuurloos afdrijft.",
        signs: ["Ontloopt lastige beslissingen en conflict", "Zegt tegen iedereen ja, komt bij niemand na", "Laat problemen en zwakke presteerders lopen", "Verandert van koers naar wie het laatst iets zei", "Het team mist duidelijke prioriteiten"],
        handle: ["Kom met heldere aanbevelingen om over te beslissen", "Maak 'ja' zeggen makkelijk en risicoloos", "Zet prioriteiten op papier om ze eraan te houden", "Vul het vacuüm met je eigen duidelijkheid", "Escaleer blokkades beleefd maar stevig"],
      },
    },
    questions: [
      { q: "Hoe geven ze richting?", options: [
        { text: "Bevelen, met druk om te leveren", cat: "tyrant" },
        { text: "In uitputtend, controlerend detail", cat: "micromanager" },
        { text: "Vaag, als ze het al doen", cat: "ghost" },
        { text: "Wat degene die het laatst vroeg maar wil", cat: "pushover" },
      ]},
      { q: "Als er iets misgaat…", options: [
        { text: "Zoeken ze iemand om de schuld te geven", cat: "tyrant" },
        { text: "Nemen ze het over en doen ze het zelf opnieuw", cat: "micromanager" },
        { text: "Zijn ze nergens te bekennen", cat: "ghost" },
        { text: "Gaan ze het gesprek helemaal uit de weg", cat: "pushover" },
      ]},
      { q: "Hoe gaan ze om met jouw werk?", options: [
        { text: "Meer eisen, en sneller", cat: "tyrant" },
        { text: "Elk detail controleren en herschrijven", cat: "micromanager" },
        { text: "Er nauwelijks naar kijken", cat: "ghost" },
        { text: "Alles goedkeuren om wrijving te vermijden", cat: "pushover" },
      ]},
      { q: "In vergaderingen…", options: [
        { text: "Domineren en intimideren ze", cat: "tyrant" },
        { text: "Boren ze door tot in de kleinste details", cat: "micromanager" },
        { text: "Zijn ze afwezig of afgeleid", cat: "ghost" },
        { text: "Zijn ze het met iedereen eens en beslissen ze niets", cat: "pushover" },
      ]},
      { q: "Hun feedback is meestal…", options: [
        { text: "Hard en kritisch", cat: "tyrant" },
        { text: "Muggenzifterig en onophoudelijk", cat: "micromanager" },
        { text: "Zeldzaam of onbestaand", cat: "ghost" },
        { text: "Vaag en geruststellend, nooit bruikbaar", cat: "pushover" },
      ]},
      { q: "Hoe gaan ze om met fouten?", options: [
        { text: "Ze straffen ze af", cat: "tyrant" },
        { text: "Ze gebruiken ze om nog meer controle te rechtvaardigen", cat: "micromanager" },
        { text: "Ze merken het pas als het een crisis is", cat: "ghost" },
        { text: "Ze vegen ze onder het tapijt", cat: "pushover" },
      ]},
      { q: "Hoeveel vertrouwen ze het team?", options: [
        { text: "Alleen via angst en toezicht", cat: "tyrant" },
        { text: "Helemaal niet — ze moeten alles goedkeuren", cat: "micromanager" },
        { text: "Ze zijn helemaal afgehaakt", cat: "ghost" },
        { text: "Ze vertrouwen iedereen even veel, ook zwakke presteerders", cat: "pushover" },
      ]},
      { q: "Als je een beslissing nodig hebt…", options: [
        { text: "Beslissen ze snel maar walsen ze over bezwaren heen", cat: "tyrant" },
        { text: "Beslissen ze niet zonder elk detail", cat: "micromanager" },
        { text: "Zijn ze onmogelijk te bereiken", cat: "ghost" },
        { text: "Blijven ze uitstellen om niemand te ontstemmen", cat: "pushover" },
      ]},
      { q: "Hoe gaan ze om met eer?", options: [
        { text: "Ze pakken de eer en schuiven de schuld naar beneden", cat: "tyrant" },
        { text: "Ze beweren dat jouw werk al hun correcties nodig had", cat: "micromanager" },
        { text: "Ze duiken alleen op als er eer te halen valt", cat: "ghost" },
        { text: "Ze geven de eer weg om de lieve vrede", cat: "pushover" },
      ]},
      { q: "De sfeer die ze scheppen is…", options: [
        { text: "Gespannen en angstig", cat: "tyrant" },
        { text: "Onrustig en twijfelend", cat: "micromanager" },
        { text: "Stuurloos en verward", cat: "ghost" },
        { text: "Richtingloos en gefrustreerd", cat: "pushover" },
      ]},
      { q: "Zwakke presteerders in het team worden…", options: [
        { text: "Weggepest", cat: "tyrant" },
        { text: "Beheerd door hun alle vrijheid af te nemen", cat: "micromanager" },
        { text: "Genegeerd, net als iedereen", cat: "ghost" },
        { text: "Nooit aangesproken", cat: "pushover" },
      ]},
      { q: "Als jij tegengas geeft…", options: [
        { text: "Reageren ze boos", cat: "tyrant" },
        { text: "Knijpen ze de teugels strakker", cat: "micromanager" },
        { text: "Haken ze nog verder af", cat: "ghost" },
        { text: "Zwichten ze en zijn ze er stilletjes rancuneus over", cat: "pushover" },
      ]},
    ],
  },

  assessment2: {
    mode: "classify",
    kicker: "Tweede test",
    heading: "Is die medewerker echt lui?",
    sub: "Erikson stelt dat de meeste 'luie' werknemers niet lui zijn — ze weten het niet, zitten verkeerd, zijn gedemotiveerd of hebben afgehaakt. Denk aan één iemand die ondermaats presteert en vind de echte oorzaak.",
    nav: "Luie werknemers",
    icon: "\uD83D\uDE34",
    introTitle: "10 waarnemingen",
    introText: "Houd één ondermaats presterend persoon in gedachten en kies wat het beste bij <em>hen</em> past.",
    resultEyebrow: "De echte reden achter de 'luiheid'",
    categories: {
      unclear: {
        name: "De onduidelijke", icon: "\u2753", color: "#0891b2",
        summary: "Niet lui — het is niet duidelijk. Ze weten simpelweg niet hoe 'goed' eruitziet, dus de inzet verwaait of stokt.",
        signsTitle: "Wat je merkt", handleTitle: "Hoe je ze weer aan boord krijgt",
        signs: ["Welwillend maar in de war", "Werk mist steeds het doel", "Verrast door feedback", "Vaak nieuw of net gereorganiseerd"],
        handle: ["Benoem verwachtingen en hoe 'klaar' eruitziet", "Spreek prioriteiten en ijkmomenten af", "Toets of het begrepen is — ga er niet vanuit", "Stuur vroeg en vaak bij"],
      },
      mismatched: {
        name: "De verkeerd geplaatste", icon: "\uD83E\uDDE9", color: "#b45309",
        summary: "Niet lui — verkeerd geplaatst. Een vierkant blokje in een rond gat; hun sterke kanten liggen elders.",
        signsTitle: "Wat je merkt", handleTitle: "Hoe je ze weer aan boord krijgt",
        signs: ["Doet hard zijn best aan de verkeerde dingen", "Blijft worstelen ondanks inzet", "Bloeit op bij andere taken", "Past nooit helemaal in de rol"],
        handle: ["Breng hun echte sterke kanten in kaart", "Herontwerp de rol of verplaats ze", "Speel in op wat ze goed kunnen", "Verwar een slechte match niet met een slechte houding"],
      },
      demotivated: {
        name: "De gedemotiveerde", icon: "\uD83D\uDD0B", color: "#64748b",
        summary: "Niet lui — gedemotiveerd. Ze gáven erom, voelden zich toen genegeerd of vanzelfsprekend, en zetten de knop om.",
        signsTitle: "Wat je merkt", handleTitle: "Hoe je ze weer aan boord krijgt",
        signs: ["Vlakke, ontmoedigde energie", "Een 'waarom zou ik'-houding", "Leeft op bij erkenning", "Een verleden van over het hoofd gezien worden"],
        handle: ["Erken hun bijdrage oprecht", "Betrek ze bij beslissingen", "Verbind hun werk weer met betekenis", "Herstel vertrouwen door je afspraken na te komen"],
      },
      checkedout: {
        name: "De afgehaakte", icon: "\uD83D\uDEAA", color: "#b91c1c",
        summary: "Echt afgehaakt of opgebrand. Ze zijn mentaal al vertrokken — dit vraagt een eerlijke herstart, geen extra druk.",
        signsTitle: "Wat je merkt", handleTitle: "Hoe je ze weer aan boord krijgt",
        signs: ["Minimale betrokkenheid", "Nauwelijks reactie op feedback", "Al lang ongelukkig of uitgeput", "Doet alleen nog de bewegingen"],
        handle: ["Voer een open, vriendelijk gesprek", "Onderzoek of het burn-out is of afhaken", "Spreek een helder pad af: opnieuw aanhaken of verdergaan", "Pak de oorzaak aan, stapel geen druk op"],
      },
    },
    questions: [
      { q: "Als je vraagt waarom het werk niet af is, zeggen ze…", options: [
        { text: "'Ik wist niet dat je dát bedoelde'", cat: "unclear" },
        { text: "'Dit is eigenlijk niet waar ik goed in ben'", cat: "mismatched" },
        { text: "'Wat maakt het uit, niemand merkt het toch'", cat: "demotivated" },
        { text: "'Eerlijk gezegd kan het me niet meer schelen'", cat: "checkedout" },
      ]},
      { q: "Hun energie is…", options: [
        { text: "Welwillend maar in de war", cat: "unclear" },
        { text: "Hard aan de verkeerde dingen werkend", cat: "mismatched" },
        { text: "Vlak en ontmoedigd", cat: "demotivated" },
        { text: "Afwezig", cat: "checkedout" },
      ]},
      { q: "Bij een duidelijke, goed passende taak…", options: [
        { text: "Leveren ze ineens goed werk", cat: "unclear" },
        { text: "Blijven ze worstelen", cat: "mismatched" },
        { text: "Doen ze het als ze zich gewaardeerd voelen", cat: "demotivated" },
        { text: "Haken ze nog steeds niet aan", cat: "checkedout" },
      ]},
      { q: "Ze leven op als…", options: [
        { text: "Verwachtingen worden uitgespeld", cat: "unclear" },
        { text: "Ze naar werk gaan dat bij ze past", cat: "mismatched" },
        { text: "Hun inzet erkend wordt", cat: "demotivated" },
        { text: "Zelden — ze zijn mentaal vertrokken", cat: "checkedout" },
      ]},
      { q: "De onderliggende oorzaak lijkt…", options: [
        { text: "Slechte communicatie", cat: "unclear" },
        { text: "Een verkeerde rol", cat: "mismatched" },
        { text: "Als vanzelfsprekend beschouwd worden", cat: "demotivated" },
        { text: "Diep afhaken of burn-out", cat: "checkedout" },
      ]},
      { q: "Hun voorgeschiedenis is…", options: [
        { text: "Nieuw of net van rol veranderd", cat: "unclear" },
        { text: "Altijd al net te hoog gegrepen", cat: "mismatched" },
        { text: "Gaven erom en werden toen genegeerd", cat: "demotivated" },
        { text: "Al lang ongelukkig of uitgeput", cat: "checkedout" },
      ]},
      { q: "Als je feedback geeft…", options: [
        { text: "Zeggen ze 'o, dat had ik niet door'", cat: "unclear" },
        { text: "Zijn ze het ermee eens maar lukt verbeteren niet", cat: "mismatched" },
        { text: "Halen ze hun schouders op — 'wat maakt het uit'", cat: "demotivated" },
        { text: "Reageren ze nauwelijks", cat: "checkedout" },
      ]},
      { q: "Ze reageren het best op…", options: [
        { text: "Heldere doelen en ijkmomenten", cat: "unclear" },
        { text: "Een herontworpen rol of een overstap", cat: "mismatched" },
        { text: "Erkenning en betrokkenheid", cat: "demotivated" },
        { text: "Een open gesprek over blijven of gaan", cat: "checkedout" },
      ]},
      { q: "Hun potentieel is…", options: [
        { text: "Hoog, zodra het op één lijn ligt", cat: "unclear" },
        { text: "Elders beter besteed", cat: "mismatched" },
        { text: "Terug te winnen met waardering", cat: "demotivated" },
        { text: "Onzeker — er is een herstart nodig", cat: "checkedout" },
      ]},
      { q: "Wat ze het meest nodig hebben is…", options: [
        { text: "Duidelijkheid", cat: "unclear" },
        { text: "Een beter passende rol", cat: "mismatched" },
        { text: "Zich gewaardeerd voelen", cat: "demotivated" },
        { text: "Een echt, eerlijk gesprek", cat: "checkedout" },
      ]},
    ],
  },

  handle: {
    kicker: "Veldgids",
    heading: "Hoe je omhoog managet",
    sub: "Je kunt je baas niet kiezen, maar je kunt de relatie wel managen — en je werk en je welzijn beschermen.",
    nav: "Omhoog managen",
    cta: "Lees de gids voor omhoog managen →",
    cards: [
      { icon: "✅", title: "Doen", tone: "do", items: [
        "Zoek uit waar je baas bang voor is en wat die waardeert", "Communiceer in hun voorkeursstijl", "Neem hun onzekerheid uit jezelf weg", "Leg belangrijke afspraken schriftelijk vast", "Houd bij wat jij hebt bijgedragen",
      ]},
      { icon: "⛔", title: "Niet doen", tone: "dont", items: [
        "Hun gedrag opvatten als een oordeel over jou", "Alleen problemen brengen en nooit oplossingen", "Aannemen dat ze je goede werk vanzelf zien", "In het openbaar of in woede discussiëren", "In stilte lijden — bouw steun op",
      ]},
      { icon: "🧩", title: "Stem af op het type", tone: "", items: [
        "Tiran: blijf rustig, feitelijk en begrensd", "Micromanager: communiceer voortgang ruim vooraf", "Spookbaas: vraag om schriftelijke beslissingen en standaardacties", "Watje: kom met heldere aanbevelingen", "Altijd: vastleggen, vastleggen, vastleggen",
      ]},
    ],
  },

  faq: [
    { q: "Is mijn baas echt 'slecht', of gewoon anders?", a: "Dit hulpmiddel wijst <em>valkuilen</em> aan, geen vonnissen. Een veeleisende baas is niet automatisch een tiran. Kijk naar een consequent patroon dat het team schaadt, niet naar één stressvolle week." },
    { q: "Kan een slechte baas beter worden?", a: "Vaak wel — velen zijn simpelweg onbewust of staan onder druk. Eerlijke feedback, zelfinzicht en hun stijl aanpassen per persoon kunnen het tij keren." },
    { q: "Zijn 'luie werknemers' echt lui?", a: "Zelden. Erikson stelt dat afhaken meestal voortkomt uit onduidelijke verwachtingen, de verkeerde rol, verloren motivatie of slecht leiderschap. Los de oorzaak op voordat je de persoon beoordeelt." },
    { q: "Wat als omhoog managen niet genoeg is?", a: "Soms is van team of rol veranderen de gezondste zet. Bescherm je welzijn, houd bij wat je hebt bijgedragen en ken je opties." },
    { q: "Kan een baas meer dan één type zijn?", a: "Ja. Onder verschillende druk kan een leidinggevende verschuiven — een micromanager die spookbaas wordt als het te veel wordt, bijvoorbeeld. Je uitslag toont de sterkste match plus de balans." },
    { q: "Ik denk dat ik een van deze types ben — en nu?", a: "Goed zelfinzicht is het halve werk. Merk je stressreflex op, vraag je team om eerlijke feedback, delegeer uitkomsten en pas je stijl aan per persoon." },
  ],

  disc: {
    kicker: "De vier kleuren",
    heading: "Slechte bazen en de vier kleuren",
    sub: "Onder druk schuift elke DISC-kleur naar een andere valkuil — als baas of als medewerker. Herken de jouwe en leer met elke kleur werken.",
    nav: "Kleuren",
    labels: { relate: "Onder druk schuift deze kleur naar", reflect: "Als dit jij bent — check jezelf", treat: "Hoe je met ze werkt" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Ontdek de DISC-kleurenworkshop →",
    colors: {
      red: {
        relate: "Een gestreste Rood wordt de tiran — harder duwen, schuld geven, over het team heen walsen.",
        reflect: "Vraag je af of je resultaat aanjaagt of gewoon mensen opjaagt. Wacht even voordat je snauwt.",
        treat: "Wees kort en resultaatgericht; houd rustig je poot stijf en kom met oplossingen, niet met problemen.",
      },
      yellow: {
        relate: "Een gestrest Geel schuift naar de spookbaas — achter het leuke aan en administratie en lastige beslissingen ontwijken.",
        reflect: "Kijk wat je aan het ontwijken bent. Je geloofwaardigheid bouw je door dingen af te maken.",
        treat: "Houd het opgewekt, maar pin beslissingen en details schriftelijk vast.",
      },
      green: {
        relate: "Een gestrest Groen wordt het watje — conflict ontwijken tot problemen stilletjes etteren.",
        reflect: "Merk op waar 'iedereen tevreden houden' eigenlijk een moeilijk gesprek ontwijkt.",
        treat: "Wees geduldig en geruststellend; help ze zich te binden aan heldere, opgeschreven prioriteiten.",
      },
      blue: {
        relate: "Een gestrest Blauw wordt de micromanager — elk detail controleren, niet kunnen vertrouwen.",
        reflect: "Vraag je af of je hoge standaarden zijn doorgeslagen in controle. Delegeer uitkomsten, niet alleen taken.",
        treat: "Kom met detail en data; verdien vertrouwen door betrouwbaar en nauwkeurig te leveren.",
      },
    },
  },
};

window.BOOK_NL = BOOK_NL;
