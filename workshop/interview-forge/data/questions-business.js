/* ==========================================================================
   Interview Forge — business, service & consulting question bank (en / nl / fr).
   Service desk & process, office tooling, project management, customer
   success, marketing, HR, compliance and consulting.
   Loaded after taxonomy.js; appends to window.IF_QUESTIONS. See ../README.md.
   ========================================================================== */
window.IF_QUESTIONS = (window.IF_QUESTIONS || []).concat([
    /* ---- Service desk & process -------------------------------------------- */
    {
        id: 'sd-incident-problem', cat: 'itil', roles: ['itil', 'servicedesk-process', 'it-support'], level: 'junior',
        q: {
            en: 'What is the difference between an incident, a problem, a change and a service request?',
            nl: 'Wat is het verschil tussen een incident, een probleem, een change en een serviceaanvraag?',
            fr: 'Quelle est la différence entre un incident, un problème, un changement et une demande de service ?'
        },
        a: {
            en: 'An incident is an unplanned interruption or quality reduction — restore service fast. A problem is the underlying cause of one or more incidents — remove it permanently. A change is a controlled modification to the environment. A service request is a standard, pre-approved user ask such as access or new hardware.',
            nl: 'Een incident is een ongeplande onderbreking of kwaliteitsverlies — dienst snel herstellen. Een probleem is de onderliggende oorzaak van één of meer incidenten — definitief wegnemen. Een change is een gecontroleerde wijziging aan de omgeving. Een serviceaanvraag is een standaard, vooraf goedgekeurde vraag zoals toegang of nieuwe hardware.',
            fr: 'Un incident est une interruption non planifiée ou une dégradation — rétablir le service vite. Un problème est la cause sous-jacente d’un ou plusieurs incidents — l’éliminer durablement. Un changement est une modification contrôlée de l’environnement. Une demande de service est une demande standard préapprouvée : accès, nouveau matériel, etc.'
        }
    },
    {
        id: 'sd-priority', cat: 'servicedesk', roles: ['servicedesk-process', 'itil', 'it-support'], level: 'junior',
        q: {
            en: 'How do you decide the priority of a ticket?',
            nl: 'Hoe bepaal je de prioriteit van een ticket?',
            fr: 'Comment déterminez-vous la priorité d’un ticket ?'
        },
        a: {
            en: 'Priority = impact × urgency: how many people or which business process is affected, and how quickly it must be fixed, against the SLA. Expect examples (one user versus a whole site, a VIP or a production line down) and awareness that the customer’s perception must be handled with communication, not by silently reprioritising.',
            nl: 'Prioriteit = impact × urgentie: hoeveel mensen of welk bedrijfsproces geraakt wordt en hoe snel het opgelost moet zijn, afgezet tegen de SLA. Verwacht voorbeelden (één gebruiker versus een hele site, een VIP of een stilliggende productielijn) en het besef dat de perceptie van de klant met communicatie behandeld wordt, niet met stil herprioriteren.',
            fr: 'Priorité = impact × urgence : combien de personnes ou quel processus métier est touché, et à quelle vitesse il faut résoudre, au regard du SLA. Attendez des exemples (un utilisateur contre un site entier, un VIP ou une ligne de production à l’arrêt) et la conscience que la perception du client se gère par la communication, pas par une repriorisation silencieuse.'
        }
    },
    {
        id: 'sd-angry-user', cat: 'servicedesk', roles: ['communication', 'it-support', 'stress'], level: 'junior',
        q: {
            en: 'An angry user calls and starts shouting. How do you handle the call?',
            nl: 'Een boze gebruiker belt en begint te roepen. Hoe pak je dat gesprek aan?',
            fr: 'Un utilisateur en colère appelle et se met à crier. Comment gérez-vous l’appel ?'
        },
        a: {
            en: 'Let them finish, acknowledge the impact, stay factual and do not take it personally, repeat the problem back to confirm understanding, give a concrete next step and a moment when they will hear from you — and then actually follow up. Escalating to a lead when it turns abusive is fine. Red flags: arguing, blaming the user, promising what they cannot deliver.',
            nl: 'Laat uitspreken, erken de impact, blijf feitelijk en trek het niet persoonlijk, herhaal het probleem om begrip te bevestigen, geef een concrete volgende stap en een moment waarop ze iets horen — en volg dat ook echt op. Escaleren naar een teamlead bij beledigend gedrag mag. Alarmbellen: discussiëren, de gebruiker de schuld geven, beloven wat niet waargemaakt kan worden.',
            fr: 'Laisser terminer, reconnaître l’impact, rester factuel sans le prendre personnellement, reformuler le problème pour confirmer la compréhension, donner une étape suivante concrète et un moment de retour — puis assurer réellement le suivi. Escalader vers un responsable en cas d’abus est légitime. Signaux d’alarme : argumenter, blâmer l’utilisateur, promettre l’impossible.'
        }
    },
    {
        id: 'off-excel', cat: 'office', roles: ['office-suite', 'digital-workplace', 'data-analytics'], level: 'junior',
        q: {
            en: 'How comfortable are you in Excel? Explain VLOOKUP or XLOOKUP and a pivot table in your own words.',
            nl: 'Hoe sterk ben je in Excel? Leg VLOOKUP of XLOOKUP en een draaitabel uit in je eigen woorden.',
            fr: 'Quel est votre niveau en Excel ? Expliquez RECHERCHEV ou RECHERCHEX et un tableau croisé dynamique avec vos mots.'
        },
        a: {
            en: 'Look for a working explanation rather than a definition: a lookup fetches a value from another table using a key (XLOOKUP being more flexible and not breaking when columns move), a pivot table summarises rows into totals per category without formulas. Bonus: Power Query, absolute references, and knowing when a spreadsheet should become a database.',
            nl: 'Let op een werkbare uitleg in plaats van een definitie: een lookup haalt een waarde uit een andere tabel op basis van een sleutel (XLOOKUP is flexibeler en breekt niet als kolommen verschuiven), een draaitabel vat rijen samen tot totalen per categorie zonder formules. Bonus: Power Query, absolute verwijzingen en weten wanneer een rekenblad een databank moet worden.',
            fr: 'Cherchez une explication opérationnelle plutôt qu’une définition : une recherche va chercher une valeur dans une autre table via une clé (RECHERCHEX est plus souple et ne casse pas si les colonnes bougent), un tableau croisé dynamique résume les lignes en totaux par catégorie sans formules. Bonus : Power Query, références absolues, et savoir quand un tableur doit devenir une base de données.'
        }
    },
    {
        id: 'dw-adoption', cat: 'consulting', roles: ['digital-workplace', 'consulting', 'communication'], level: 'medior',
        q: {
            en: 'You roll out Teams and SharePoint at a customer. How do you make sure people actually use it?',
            nl: 'Je rolt Teams en SharePoint uit bij een klant. Hoe zorg je dat mensen het echt gebruiken?',
            fr: 'Vous déployez Teams et SharePoint chez un client. Comment vous assurez-vous que les gens l’utilisent réellement ?'
        },
        a: {
            en: 'Adoption is a change project, not a licence: sponsorship from management, key users or champions, governance decided up front (what goes in Teams, SharePoint or OneDrive, naming, external sharing), scenario-based training instead of feature tours, quick wins, and measuring usage afterwards to steer. Listen for empathy with non-technical users.',
            nl: 'Adoptie is een veranderproject, geen licentie: sponsorschap vanuit het management, key users of champions, governance vooraf beslist (wat hoort in Teams, SharePoint of OneDrive, naamgeving, extern delen), scenariogerichte training in plaats van functieoverzichten, quick wins, en achteraf gebruik meten om bij te sturen. Let op empathie met niet-technische gebruikers.',
            fr: 'L’adoption est un projet de changement, pas une licence : parrainage de la direction, utilisateurs clés ou ambassadeurs, gouvernance décidée en amont (ce qui va dans Teams, SharePoint ou OneDrive, nommage, partage externe), formations par scénarios plutôt que par fonctionnalités, victoires rapides et mesure de l’usage pour ajuster. Écoutez l’empathie envers les utilisateurs non techniques.'
        }
    },

    /* ---- Business & delivery ------------------------------------------------ */
    {
        id: 'pm-scope-creep', cat: 'projectmanagement', roles: ['project-management', 'planning'], level: 'medior',
        q: {
            en: 'A customer keeps adding requirements mid-project. How do you handle scope creep?',
            nl: 'Een klant blijft eisen toevoegen tijdens het project. Hoe ga je om met scope creep?',
            fr: 'Un client ajoute sans cesse des exigences en cours de projet. Comment gérez-vous la dérive du périmètre ?'
        },
        a: {
            en: 'A change request process: log it, analyse the impact on time, budget and quality, let the sponsor decide explicitly, update the baseline and the change log, and communicate transparently instead of quietly absorbing the work. Look for someone who says no politely but keeps the relationship intact.',
            nl: 'Een change request-proces: registreren, impact op tijd, budget en kwaliteit analyseren, de sponsor expliciet laten beslissen, de baseline en het changelog bijwerken en transparant communiceren in plaats van het werk stil te absorberen. Zoek iemand die beleefd nee zegt maar de relatie intact houdt.',
            fr: 'Un processus de demande de changement : enregistrer, analyser l’impact sur le délai, le budget et la qualité, faire trancher explicitement le sponsor, mettre à jour la référence et le journal des changements, et communiquer de façon transparente au lieu d’absorber le travail en silence. Cherchez quelqu’un qui sait dire non poliment sans casser la relation.'
        }
    },
    {
        id: 'cs-churn', cat: 'customersuccess', roles: ['customer-success', 'account-management'], level: 'medior',
        q: {
            en: 'Which signals tell you a customer is about to leave, and what do you do about it?',
            nl: 'Welke signalen wijzen erop dat een klant zal vertrekken en wat doe je daaraan?',
            fr: 'Quels signaux annoncent le départ d’un client et qu’en faites-vous ?'
        },
        a: {
            en: 'Dropping usage or logins, tickets going unanswered on their side, a sponsor leaving, missed QBRs, invoices being questioned, silence after an escalation. The action is proactive: reach out at management level, rebuild the value story with data, agree a joint plan with dates, and involve the account owner early rather than at renewal.',
            nl: 'Dalend gebruik of minder aanmeldingen, tickets die aan hun kant onbeantwoord blijven, een sponsor die vertrekt, gemiste QBR’s, discussies over facturen, stilte na een escalatie. De actie is proactief: contact op managementniveau, het waardeverhaal met cijfers heropbouwen, een gezamenlijk plan met datums afspreken en de accountverantwoordelijke vroeg betrekken in plaats van bij de verlenging.',
            fr: 'Usage ou connexions en baisse, tickets sans réponse de leur côté, départ du sponsor, revues trimestrielles manquées, factures contestées, silence après une escalade. L’action est proactive : contact au niveau direction, reconstruire le discours de valeur avec des données, convenir d’un plan commun daté et impliquer le responsable de compte tôt, pas au moment du renouvellement.'
        }
    },
    {
        id: 'mkt-campaign', cat: 'marketing', roles: ['marketing', 'content', 'seo'], level: 'junior',
        q: {
            en: 'How would you plan a campaign for a new service, and how do you measure whether it worked?',
            nl: 'Hoe plan je een campagne voor een nieuwe dienst en hoe meet je of ze werkte?',
            fr: 'Comment planifieriez-vous une campagne pour un nouveau service et comment mesurez-vous son succès ?'
        },
        a: {
            en: 'Audience and persona first, then the message and proof points, channels that fit that audience, a content calendar and budget, and measurable goals set beforehand — reach, click-through, leads, cost per lead, conversion. Bonus: A/B testing, UTM tagging and a post-mortem instead of "it got a lot of likes".',
            nl: 'Eerst doelgroep en persona, dan de boodschap en bewijsvoering, kanalen die bij die doelgroep passen, een contentkalender en budget, en vooraf bepaalde meetbare doelen — bereik, doorklik, leads, kost per lead, conversie. Bonus: A/B-testen, UTM-tagging en een evaluatie achteraf in plaats van “het kreeg veel likes”.',
            fr: 'D’abord l’audience et le persona, puis le message et les preuves, des canaux adaptés à cette audience, un calendrier de contenu et un budget, et des objectifs mesurables fixés à l’avance — portée, taux de clic, prospects, coût par prospect, conversion. Bonus : tests A/B, balises UTM et bilan a posteriori plutôt que « ça a eu beaucoup de likes ».'
        }
    },
    {
        id: 'hr-structured-interview', cat: 'hr', roles: ['hr', 'recruitment', 'integrity'], level: 'medior',
        q: {
            en: 'How do you keep an interview structured and free of bias?',
            nl: 'Hoe hou je een sollicitatiegesprek gestructureerd en vrij van vooroordelen?',
            fr: 'Comment gardez-vous un entretien structuré et exempt de biais ?'
        },
        a: {
            en: 'Define the criteria and the question set before meeting anyone, ask every candidate the same core questions, score against a rubric immediately after, use behavioural questions with evidence rather than gut feeling, interview with more than one person and be aware of halo, similarity and first-impression bias. Mentioning GDPR and what may not be asked is a plus.',
            nl: 'Criteria en vragenset vastleggen vóór het eerste gesprek, elke kandidaat dezelfde kernvragen stellen, meteen erna scoren tegen een rubriek, gedragsgerichte vragen met bewijs gebruiken in plaats van buikgevoel, met meer dan één persoon interviewen en alert zijn op halo-, gelijkenis- en eerste-indrukbias. GDPR en wat niet gevraagd mag worden vermelden is een plus.',
            fr: 'Définir les critères et la trame avant de rencontrer quiconque, poser les mêmes questions clés à tous, noter selon une grille juste après, utiliser des questions comportementales fondées sur des preuves plutôt que l’intuition, mener l’entretien à plusieurs et rester conscient des biais de halo, de similarité et de première impression. Citer le RGPD et les questions interdites est un plus.'
        }
    },
    {
        id: 'comp-gdpr', cat: 'compliance', roles: ['grc', 'hr', 'documentation'], level: 'medior',
        q: {
            en: 'What does GDPR mean in your daily work?',
            nl: 'Wat betekent de GDPR in je dagelijks werk?',
            fr: 'Que signifie le RGPD dans votre travail quotidien ?'
        },
        a: {
            en: 'Practical answers beat legal recitals: only collect what you need and keep it no longer than necessary, have a lawful basis, restrict access, do not copy production data into test, report a breach within 72 hours, and handle access or deletion requests. Look for someone who knows when to involve the DPO rather than deciding alone.',
            nl: 'Praktische antwoorden zijn beter dan juridische opsommingen: enkel verzamelen wat nodig is en niet langer bewaren dan nodig, een rechtsgrond hebben, toegang beperken, geen productiedata naar test kopiëren, een datalek binnen 72 uur melden en inzage- of verwijderverzoeken afhandelen. Zoek iemand die weet wanneer de DPO betrokken moet worden in plaats van zelf te beslissen.',
            fr: 'Les réponses pratiques valent mieux que les récitations juridiques : ne collecter que le nécessaire et ne pas le conserver trop longtemps, disposer d’une base légale, restreindre les accès, ne pas copier des données de production en test, notifier une violation sous 72 heures et traiter les demandes d’accès ou d’effacement. Cherchez quelqu’un qui sait quand impliquer le DPO plutôt que de trancher seul.'
        }
    },

    /* ---- Consulting ------------------------------------------------------ */
    {
        id: 'cons-knowledge-transfer', cat: 'consulting', roles: ['consulting', 'documentation', 'digital-workplace'], level: 'medior',
        q: {
            en: 'How do you make sure a client can run without you when the engagement ends?',
            nl: 'Hoe zorg je dat een klant zonder jou verder kan als de opdracht eindigt?',
            fr: 'Comment vous assurez-vous qu’un client peut fonctionner sans vous à la fin de la mission ?'
        },
        a: {
            en: 'Build knowledge transfer in from the start: document decisions and runbooks, train the client’s people rather than doing everything yourself, hand over cleanly, and avoid engineering dependency for repeat billing. Strong answers see leaving the client capable as the mark of a good consultant. Red flag: hoarding knowledge to stay indispensable.',
            nl: 'Bouw kennisoverdracht van bij de start in: documenteer beslissingen en runbooks, leid de mensen van de klant op in plaats van alles zelf te doen, draag netjes over, en vermijd afhankelijkheid te creëren voor herhaalfacturatie. Sterke antwoorden zien een klant die zelfstandig verder kan als het kenmerk van een goede consultant. Alarmbel: kennis hamsteren om onmisbaar te blijven.',
            fr: 'Intégrer le transfert de connaissances dès le début : documenter les décisions et les runbooks, former les équipes du client plutôt que tout faire soi-même, transmettre proprement et éviter de créer une dépendance pour refacturer. Les bonnes réponses voient dans un client autonome la marque d’un bon consultant. Signal d’alarme : garder la connaissance pour soi afin de rester indispensable.'
        }
    },
    {
        id: 'cons-proposal', cat: 'consulting', roles: ['consulting', 'sales', 'account-management'], level: 'medior',
        q: {
            en: 'What makes a strong proposal or statement of work?',
            nl: 'Wat maakt een sterk voorstel of opdrachtomschrijving?',
            fr: 'Qu’est-ce qu’une proposition ou un cahier des charges solide ?'
        },
        a: {
            en: 'It restates the client’s problem in their words, defines clear scope, deliverables, assumptions and exclusions, timeline, price and responsibilities, and ties everything to the outcome they care about. Ambiguity is where disputes start. Strong answers mention acceptance criteria and what is explicitly out of scope. Red flag: a vague proposal that invites scope creep and payment arguments.',
            nl: 'Het herformuleert het probleem van de klant in zijn woorden, definieert duidelijke scope, deliverables, aannames en uitsluitingen, timing, prijs en verantwoordelijkheden, en koppelt alles aan het resultaat dat hem interesseert. Vaagheid is waar disputen beginnen. Sterke antwoorden vermelden acceptatiecriteria en wat expliciet buiten scope valt. Alarmbel: een vaag voorstel dat scope creep en betaaldiscussies uitlokt.',
            fr: 'Elle reformule le problème du client dans ses mots, définit un périmètre clair, les livrables, les hypothèses et exclusions, le calendrier, le prix et les responsabilités, et relie tout au résultat qui lui importe. L’ambiguïté est la source des litiges. Les bonnes réponses citent les critères d’acceptation et ce qui est explicitement hors périmètre. Signal d’alarme : une proposition vague qui invite la dérive du périmètre et les litiges de paiement.'
        }
    },
    {
        id: 'cons-difficult-client', cat: 'consulting', roles: ['consulting', 'communication'], level: 'senior',
        q: {
            en: 'Tell me how you handled a client who was unhappy with your work.',
            nl: 'Vertel hoe je omging met een klant die ontevreden was over je werk.',
            fr: 'Racontez comment vous avez géré un client mécontent de votre travail.'
        },
        a: {
            en: 'Look for ownership rather than defensiveness: listen to understand the real complaint, acknowledge it, separate fact from emotion, propose a concrete plan to fix it, and follow up. A senior answer reflects on what they would change and whether expectations were set wrong up front. Red flags: blaming the client entirely, or caving to unreasonable demands to avoid conflict.',
            nl: 'Let op eigenaarschap in plaats van verdediging: luister om de echte klacht te begrijpen, erken ze, scheid feit van emotie, stel een concreet plan voor om het recht te zetten, en volg op. Een senior antwoord reflecteert op wat men anders zou doen en of de verwachtingen vooraf verkeerd gezet waren. Alarmbellen: de klant volledig de schuld geven, of zwichten voor onredelijke eisen om conflict te vermijden.',
            fr: 'Cherchez la responsabilité plutôt que la défense : écouter pour comprendre la vraie plainte, la reconnaître, distinguer le fait de l’émotion, proposer un plan concret pour corriger, et assurer le suivi. Une réponse senior réfléchit à ce qu’elle changerait et à des attentes mal cadrées au départ. Signaux d’alarme : rejeter toute la faute sur le client, ou céder à des exigences déraisonnables pour éviter le conflit.'
        }
    },
    {
        id: 'cons-billable-utilization', cat: 'consulting', roles: ['consulting', 'account-management', 'planning'], level: 'medior',
        q: {
            en: 'What is billable utilisation and why can maximising it be a trap?',
            nl: 'Wat is billable utilisation en waarom kan maximaliseren ervan een valkuil zijn?',
            fr: 'Qu’est-ce que le taux de facturation et pourquoi le maximiser peut-il être un piège ?'
        },
        a: {
            en: 'Utilisation is the share of time billed to clients. It drives revenue, but pushing it to the limit leaves no room for pre-sales, learning, internal work or slack for quality, and burns people out. Strong answers argue for a healthy target rather than 100%, and connect utilisation to margin and client value, not just hours. Red flag: treating every non-billable hour as waste.',
            nl: 'Utilisation is het aandeel tijd dat aan klanten gefactureerd wordt. Het stuwt omzet, maar het tot het uiterste drijven laat geen ruimte voor pre-sales, leren, intern werk of marge voor kwaliteit, en put mensen uit. Sterke antwoorden pleiten voor een gezond doel in plaats van 100%, en koppelen utilisation aan marge en klantwaarde, niet enkel uren. Alarmbel: elk niet-factureerbaar uur als verspilling zien.',
            fr: 'Le taux de facturation est la part du temps facturée aux clients. Il génère du chiffre, mais le pousser à l’extrême ne laisse plus de place à l’avant-vente, à l’apprentissage, au travail interne ou à une marge pour la qualité, et épuise les équipes. Les bonnes réponses plaident pour une cible saine plutôt que 100 %, et relient le taux à la marge et à la valeur client, pas aux seules heures. Signal d’alarme : voir chaque heure non facturable comme du gaspillage.'
        }
    },
    {
        id: 'cons-change-management', cat: 'consulting', roles: ['consulting', 'digital-workplace', 'communication'], level: 'senior',
        q: {
            en: 'How do you lead the human side of a change, not just the technical rollout?',
            nl: 'Hoe leid je de menselijke kant van een verandering, niet enkel de technische uitrol?',
            fr: 'Comment pilotez-vous le volet humain d’un changement, pas seulement le déploiement technique ?'
        },
        a: {
            en: 'Explain the why, involve people early, address what they lose and fear, use sponsors and champions, communicate repeatedly through the curve of resistance, train in real scenarios, and support after go-live. A model like ADKAR or Kotter is a plus if used, not recited. Strong answers show empathy and measure adoption. Red flag: assuming a good tool sells itself.',
            nl: 'Leg het waarom uit, betrek mensen vroeg, adresseer wat ze verliezen en vrezen, gebruik sponsors en champions, communiceer herhaaldelijk door de weerstandscurve, train in echte scenario’s, en ondersteun na go-live. Een model als ADKAR of Kotter is een plus als het gebruikt wordt, niet opgedreund. Sterke antwoorden tonen empathie en meten adoptie. Alarmbel: aannemen dat een goede tool zichzelf verkoopt.',
            fr: 'Expliquer le pourquoi, impliquer les gens tôt, traiter ce qu’ils perdent et craignent, s’appuyer sur des sponsors et des ambassadeurs, communiquer à répétition tout au long de la courbe de résistance, former sur des scénarios réels et soutenir après la mise en service. Un modèle comme ADKAR ou Kotter est un plus s’il est utilisé, pas récité. Les bonnes réponses montrent de l’empathie et mesurent l’adoption. Signal d’alarme : croire qu’un bon outil se vend tout seul.'
        }
    },
    /* ---- Sales & account management --------------------------------------- */
    {
        id: 'sales-qualify-lead', cat: 'sales', roles: ['sales', 'account-management', 'communication'], level: 'junior',
        q: {
            en: 'How do you decide whether a lead is worth pursuing?',
            nl: 'Hoe bepaal je of een lead de moeite waard is om op te volgen?',
            fr: 'Comment décidez-vous qu’une piste vaut la peine d’être suivie ?'
        },
        a: {
            en: 'Qualify before investing: is there a real problem, a budget, a decision maker and a timeline (BANT or a similar frame)? Ask about the impact of not solving it, who signs, and what else competes for that budget. Strong answers disqualify early and honestly instead of keeping dead deals in the pipeline. Red flag: chasing every lead and calling a full pipeline a result.',
            nl: 'Kwalificeer voor je investeert: is er een echt probleem, een budget, een beslisser en een timing (BANT of een gelijkaardig kader)? Vraag naar de impact van niets doen, wie tekent, en wat er nog met dat budget concurreert. Sterke antwoorden diskwalificeren vroeg en eerlijk in plaats van dode deals in de pijplijn te houden. Alarmbel: elke lead achternalopen en een volle pijplijn een resultaat noemen.',
            fr: 'Qualifier avant d’investir : y a-t-il un vrai problème, un budget, un décideur et une échéance (BANT ou un cadre équivalent) ? Demandez l’impact de l’inaction, qui signe et ce qui concurrence ce budget. Les bonnes réponses disqualifient tôt et honnêtement au lieu de garder des affaires mortes dans le pipeline. Signal d’alarme : courir après chaque piste et présenter un pipeline plein comme un résultat.'
        }
    },
    {
        id: 'sales-objection-price', cat: 'sales', roles: ['sales', 'account-management', 'communication'], level: 'medior',
        q: {
            en: 'A prospect says you are too expensive. What do you do?',
            nl: 'Een prospect zegt dat je te duur bent. Wat doe je?',
            fr: 'Un prospect vous dit que vous êtes trop cher. Que faites-vous ?'
        },
        a: {
            en: 'Find out what "expensive" means: compared to what, and against which cost of the problem? Re-anchor on value and total cost of ownership, ask what would have to be true to justify it, and adjust scope rather than reflexively discounting. Strong answers are willing to walk away from a bad-fit deal. Red flag: cutting price immediately, which teaches the client that the price was never real.',
            nl: 'Zoek uit wat "duur" betekent: duur tegenover wat, en tegenover welke kost van het probleem? Herkader op waarde en total cost of ownership, vraag wat waar zou moeten zijn om het te verantwoorden, en pas de scope aan in plaats van reflexmatig korting te geven. Sterke antwoorden durven een slecht passende deal loslaten. Alarmbel: meteen zakken in prijs, waarmee je de klant leert dat de prijs nooit echt was.',
            fr: 'Cherchez ce que « cher » veut dire : cher par rapport à quoi, et face à quel coût du problème ? Recentrez sur la valeur et le coût total de possession, demandez ce qui devrait être vrai pour le justifier, et ajustez le périmètre plutôt que de remiser par réflexe. Les bonnes réponses savent renoncer à une affaire mal adaptée. Signal d’alarme : baisser le prix immédiatement, ce qui apprend au client que le prix n’était pas réel.'
        }
    },
    {
        id: 'sales-handover-delivery', cat: 'sales', roles: ['sales', 'account-management', 'customer-success', 'documentation'], level: 'medior',
        q: {
            en: 'How do you hand a signed deal over to the delivery team?',
            nl: 'Hoe draag je een getekende deal over aan het uitvoeringsteam?',
            fr: 'Comment transmettez-vous une affaire signée à l’équipe de réalisation ?'
        },
        a: {
            en: 'Write down what was actually promised — scope, assumptions, exclusions, dates and the political context — and hold a joint kick-off so delivery hears it first hand, not from the invoice. Stay reachable for the first weeks. Strong answers admit that overselling comes back as an escalation. Red flag: "that is delivery’s problem once it is signed".',
            nl: 'Schrijf op wat er écht beloofd is — scope, aannames, uitsluitingen, data en de politieke context — en hou een gezamenlijke kick-off zodat delivery het uit eerste hand hoort en niet via de factuur. Blijf de eerste weken bereikbaar. Sterke antwoorden geven toe dat overselling terugkomt als escalatie. Alarmbel: "dat is het probleem van delivery zodra het getekend is".',
            fr: 'Consignez ce qui a réellement été promis — périmètre, hypothèses, exclusions, dates et contexte politique — et organisez un lancement commun pour que la réalisation l’entende de première main, pas via la facture. Restez joignable les premières semaines. Les bonnes réponses reconnaissent qu’une survente revient en escalade. Signal d’alarme : « une fois signé, c’est le problème de la réalisation ».'
        }
    },

    /* ---- Agile & Scrum ---------------------------------------------------- */
    {
        id: 'agile-ceremonies', cat: 'projectmanagement', roles: ['agile', 'project-management', 'teamwork'], level: 'junior',
        q: {
            en: 'What are the Scrum events and what is each one actually for?',
            nl: 'Wat zijn de Scrum-events en waar dient elk van hen echt voor?',
            fr: 'Quels sont les événements Scrum et à quoi sert réellement chacun d’eux ?'
        },
        a: {
            en: 'Sprint planning picks the goal and the work; the daily scrum is the team re-planning its own day, not a status report to a manager; the review shows working software to stakeholders and collects feedback; the retrospective improves how the team works. Refinement keeps the backlog ready. Strong answers explain the purpose; red flag: reciting the calendar without knowing why any of it exists.',
            nl: 'Sprint planning kiest het doel en het werk; de daily is het team dat zijn eigen dag herplant, geen statusrapport aan een manager; de review toont werkende software aan stakeholders en haalt feedback op; de retrospective verbetert hoe het team werkt. Refinement houdt de backlog klaar. Sterke antwoorden leggen het doel uit; alarmbel: de kalender opdreunen zonder te weten waarom.',
            fr: 'La planification de sprint choisit l’objectif et le travail ; la mêlée quotidienne est l’équipe qui replanifie sa journée, pas un rapport d’état au manager ; la revue montre un produit fonctionnel aux parties prenantes et récolte du retour ; la rétrospective améliore le fonctionnement de l’équipe. L’affinage garde le backlog prêt. Les bonnes réponses expliquent le but ; signal d’alarme : réciter l’agenda sans savoir pourquoi.'
        }
    },
    {
        id: 'agile-blocked-team', cat: 'projectmanagement', roles: ['agile', 'leadership', 'project-management', 'communication'], level: 'medior',
        q: {
            en: 'Your team is blocked halfway through the sprint by another department. What do you do?',
            nl: 'Je team zit halverwege de sprint geblokkeerd door een andere afdeling. Wat doe je?',
            fr: 'Votre équipe est bloquée en milieu de sprint par un autre service. Que faites-vous ?'
        },
        a: {
            en: 'Make the impediment visible and owned: name it, name the person who can unblock it, agree a date, and escalate along an agreed path if that date slips. Meanwhile let the team pull other sprint work rather than idle, and be honest at the review about what the block cost. Red flag: silently absorbing the delay and reporting green until the deadline.',
            nl: 'Maak de blokkade zichtbaar en toegewezen: benoem ze, benoem wie ze kan wegnemen, spreek een datum af, en escaleer via een afgesproken pad als die datum verschuift. Laat het team ondertussen ander sprintwerk oppakken in plaats van stil te vallen, en wees bij de review eerlijk over wat de blokkade gekost heeft. Alarmbel: de vertraging stil opvangen en groen rapporteren tot de deadline.',
            fr: 'Rendez l’obstacle visible et attribué : nommez-le, nommez la personne qui peut le lever, fixez une date et escaladez selon un chemin convenu si cette date glisse. Entre-temps, laissez l’équipe prendre d’autres travaux du sprint plutôt que d’attendre, et soyez honnête en revue sur ce que le blocage a coûté. Signal d’alarme : absorber le retard en silence et rapporter au vert jusqu’à l’échéance.'
        }
    }
]);
