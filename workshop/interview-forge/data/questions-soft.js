/* === Interview Forge — Behavioural / Personality / DISC question bank ===
 * Trilingual (en / nl / fr) behavioural, competency and DISC questions.
 * Loaded after taxonomy.js; appends to window.IF_QUESTIONS.
 * cat ids come from IF_CATEGORIES, role ids from IF_ROLES.
 * === */
window.IF_QUESTIONS = (window.IF_QUESTIONS || []).concat([
    /* ---- Behaviour & integrity ----------------------------------------------- */
    {
        id: 'int-mistake', cat: 'behaviour', roles: ['integrity', 'problem-solving'], level: 'medior',
        q: {
            en: 'Tell me about a mistake you made that had real impact. What happened next?',
            nl: 'Vertel over een fout met echte impact. Wat gebeurde er daarna?',
            fr: 'Parlez-moi d’une erreur ayant eu un impact réel. Que s’est-il passé ensuite ?'
        },
        a: {
            en: 'The best answers admit it quickly, describe how they contained the damage, who they informed and how fast, and what structurally changed afterwards (a checklist, a test, a four-eyes rule). Red flags: "I cannot think of one", blaming a colleague, or hiding it until someone else found out.',
            nl: 'De beste antwoorden geven het snel toe, beschrijven hoe ze de schade beperkten, wie ze hoe snel informeerden en wat er structureel veranderde (een checklist, een test, vierogenprincipe). Alarmbellen: “ik kan er geen bedenken”, een collega de schuld geven, of het verzwijgen tot iemand anders het ontdekte.',
            fr: 'Les meilleures réponses reconnaissent vite l’erreur, décrivent comment les dégâts ont été contenus, qui a été informé et à quelle vitesse, et ce qui a changé structurellement ensuite (liste de contrôle, test, principe des quatre yeux). Signaux d’alarme : « je n’en vois pas », blâmer un collègue, ou l’avoir caché jusqu’à ce qu’un autre le découvre.'
        }
    },
    {
        id: 'beh-feedback-received', cat: 'behaviour', roles: ['integrity', 'communication'], level: 'junior',
        q: {
            en: 'Tell me about a time you received critical feedback you did not agree with. What did you do?',
            nl: 'Vertel over een keer dat je kritische feedback kreeg waar je het niet mee eens was. Wat deed je?',
            fr: 'Parlez-moi d’une fois où vous avez reçu un retour critique avec lequel vous n’étiez pas d’accord. Qu’avez-vous fait ?'
        },
        a: {
            en: 'A strong answer shows they listened first, asked for specifics, and separated the useful part from the part they disputed before responding calmly. Look for a concrete outcome and something they changed. Red flags: instant defensiveness, dismissing the source, or claiming they have never been wrong.',
            nl: 'Een sterk antwoord toont dat ze eerst luisterden, om concrete voorbeelden vroegen en het bruikbare deel scheidden van wat ze betwistten vóór ze rustig reageerden. Let op een concreet resultaat en iets wat ze aanpasten. Alarmbellen: meteen in de verdediging, de bron wegwuiven, of beweren nooit fout te zitten.',
            fr: 'Une bonne réponse montre qu’ils ont d’abord écouté, demandé des exemples précis et distingué la part utile de celle qu’ils contestaient avant de répondre calmement. Cherchez un résultat concret et un changement adopté. Signaux d’alarme : sur la défensive immédiate, discréditer la source, ou prétendre n’avoir jamais tort.'
        }
    },
    {
        id: 'beh-ownership-failure', cat: 'behaviour', roles: ['integrity', 'problem-solving'], level: 'medior',
        q: {
            en: 'Tell me about a project that failed or fell short. What was your part in it?',
            nl: 'Vertel over een project dat mislukte of tegenviel. Wat was jouw aandeel daarin?',
            fr: 'Parlez-moi d’un projet qui a échoué ou déçu. Quelle a été votre part de responsabilité ?'
        },
        a: {
            en: 'Look for genuine ownership: what they personally could have done differently, not just external causes, plus the concrete lesson applied since. A strong answer is balanced and specific. Red flags: an answer that is entirely other people’s fault, or a "failure" so minor it is really a humblebrag.',
            nl: 'Let op echt eigenaarschap: wat ze zelf anders hadden kunnen doen, niet enkel externe oorzaken, plus de concrete les die ze sindsdien toepassen. Een sterk antwoord is evenwichtig en specifiek. Alarmbellen: een verhaal dat volledig de schuld bij anderen legt, of een “mislukking” die zo klein is dat het eigenlijk opschepperij is.',
            fr: 'Cherchez une vraie responsabilité assumée : ce qu’ils auraient pu faire autrement eux-mêmes, pas seulement des causes externes, et la leçon concrète appliquée depuis. Une bonne réponse est nuancée et précise. Signaux d’alarme : tout rejeter sur les autres, ou un « échec » si mineur qu’il s’agit d’un faux aveu flatteur.'
        }
    },
    {
        id: 'beh-proactive', cat: 'behaviour', roles: ['problem-solving', 'motivation'], level: 'medior',
        q: {
            en: 'Tell me about a time you spotted a problem before anyone asked and acted on it.',
            nl: 'Vertel over een keer dat je een probleem zag vóór iemand erom vroeg en er iets aan deed.',
            fr: 'Parlez-moi d’une fois où vous avez repéré un problème avant qu’on vous le demande et où vous avez agi.'
        },
        a: {
            en: 'A strong answer shows initiative with judgement: they saw the issue, checked it was worth acting on, took proportionate action, and looped in the right people rather than going rogue. Red flags: no real example, or "initiative" that ignored others and created rework.',
            nl: 'Een sterk antwoord toont initiatief met oordeel: ze zagen het probleem, checkten of het de moeite was, namen een proportionele actie en betrokken de juiste mensen in plaats van solo te gaan. Alarmbellen: geen echt voorbeeld, of “initiatief” dat anderen negeerde en extra werk veroorzaakte.',
            fr: 'Une bonne réponse montre de l’initiative avec du discernement : ils ont vu le problème, vérifié qu’il valait la peine d’agir, pris une action proportionnée et impliqué les bonnes personnes plutôt que d’agir seuls. Signaux d’alarme : aucun exemple réel, ou une « initiative » qui a ignoré les autres et créé du retravail.'
        }
    },
    {
        id: 'beh-boundaries', cat: 'behaviour', roles: ['integrity', 'stress'], level: 'senior',
        q: {
            en: 'Tell me about a time you had to say no or push back on something you were asked to do.',
            nl: 'Vertel over een keer dat je nee moest zeggen of iets moest weigeren wat je gevraagd werd.',
            fr: 'Parlez-moi d’une fois où vous avez dû dire non ou refuser une demande.'
        },
        a: {
            en: 'Look for principled, respectful pushback: they explained the risk or trade-off, offered an alternative, and stayed professional. A strong answer shows they can protect quality, ethics or their team without being obstructive. Red flags: never saying no, or saying it aggressively with no alternative.',
            nl: 'Let op principiële, respectvolle tegenspraak: ze legden het risico of de afweging uit, boden een alternatief en bleven professioneel. Een sterk antwoord toont dat ze kwaliteit, ethiek of hun team kunnen beschermen zonder dwars te liggen. Alarmbellen: nooit nee zeggen, of het agressief doen zonder alternatief.',
            fr: 'Cherchez un refus argumenté et respectueux : ils ont expliqué le risque ou l’arbitrage, proposé une alternative et gardé leur professionnalisme. Une bonne réponse montre qu’ils savent protéger la qualité, l’éthique ou leur équipe sans être obstructifs. Signaux d’alarme : ne jamais dire non, ou le dire agressivement sans alternative.'
        }
    },
    {
        id: 'beh-adapt-setback', cat: 'behaviour', roles: ['adaptability', 'stress'], level: 'junior',
        q: {
            en: 'Tell me about a time plans changed suddenly and you had to adjust. How did you handle it?',
            nl: 'Vertel over een keer dat plannen plots veranderden en je je moest aanpassen. Hoe pakte je dat aan?',
            fr: 'Parlez-moi d’une fois où les plans ont changé soudainement et où vous avez dû vous adapter. Comment avez-vous géré ?'
        },
        a: {
            en: 'A strong answer stays practical and calm: they re-checked priorities, adjusted the plan, communicated the change, and kept moving without dwelling on the disruption. Look for a concrete result. Red flags: visible resentment, freezing until told exactly what to do, or blaming the change for a poor outcome.',
            nl: 'Een sterk antwoord blijft praktisch en kalm: ze checkten de prioriteiten opnieuw, pasten het plan aan, communiceerden de wijziging en gingen door zonder te blijven hangen in de verstoring. Let op een concreet resultaat. Alarmbellen: zichtbare wrevel, verlammen tot ze precies gezegd krijgen wat te doen, of de wijziging de schuld geven van een slecht resultaat.',
            fr: 'Une bonne réponse reste pragmatique et calme : ils ont revu les priorités, ajusté le plan, communiqué le changement et continué sans s’attarder sur la perturbation. Cherchez un résultat concret. Signaux d’alarme : rancœur visible, blocage tant qu’on ne leur dit pas exactement quoi faire, ou imputer un mauvais résultat au changement.'
        }
    },
    /* ---- Teamwork ------------------------------------------------------------ */
    {
        id: 'team-collaborate', cat: 'teamwork', roles: ['teamwork', 'communication'], level: 'junior',
        q: {
            en: 'Can you work in a team? Tell me about a time a colleague slowed the team down.',
            nl: 'Kan je in team werken? Vertel over een keer dat een collega het team ophield.',
            fr: 'Savez-vous travailler en équipe ? Parlez-moi d’une fois où un collègue a ralenti l’équipe.'
        },
        a: {
            en: 'Listen for a concrete STAR example: the situation, what they personally did, whether they raised it directly with the colleague before escalating, and the result. Red flags: only blame, no ownership, no follow-up, or an answer that stays entirely theoretical.',
            nl: 'Let op een concreet STAR-voorbeeld: de situatie, wat ze zelf deden, of ze het rechtstreeks met de collega bespraken vóór ze escaleerden, en het resultaat. Alarmbellen: enkel schuld leggen, geen eigenaarschap, geen opvolging, of een volledig theoretisch antwoord.',
            fr: 'Écoutez un exemple STAR concret : la situation, ce qu’ils ont fait personnellement, s’ils en ont parlé directement au collègue avant d’escalader, et le résultat. Signaux d’alarme : uniquement des reproches, aucune responsabilité assumée, aucun suivi, ou une réponse purement théorique.'
        }
    },
    {
        id: 'team-disagree-peer', cat: 'teamwork', roles: ['teamwork', 'communication'], level: 'medior',
        q: {
            en: 'Tell me about a time you disagreed with a teammate on how to do something. How was it resolved?',
            nl: 'Vertel over een keer dat je het met een teamgenoot oneens was over de aanpak. Hoe werd het opgelost?',
            fr: 'Parlez-moi d’une fois où vous étiez en désaccord avec un coéquipier sur la manière de faire. Comment cela s’est-il réglé ?'
        },
        a: {
            en: 'A strong answer separates the person from the problem: they made their case with reasons, listened to the other view, and converged on a decision (or accepted the team’s call) without lingering resentment. Red flags: always having to win, going silent and undermining later, or escalating before talking.',
            nl: 'Een sterk antwoord scheidt de persoon van het probleem: ze onderbouwden hun standpunt, luisterden naar het andere en kwamen tot een beslissing (of aanvaardden de teamkeuze) zonder blijvende wrevel. Alarmbellen: altijd willen winnen, stilvallen en later ondermijnen, of escaleren vóór het gesprek.',
            fr: 'Une bonne réponse sépare la personne du problème : ils ont argumenté, écouté l’autre point de vue et convergé vers une décision (ou accepté le choix de l’équipe) sans rancune persistante. Signaux d’alarme : devoir toujours gagner, se taire puis saper ensuite, ou escalader avant d’en parler.'
        }
    },
    {
        id: 'team-newcomer', cat: 'teamwork', roles: ['teamwork', 'culture-fit'], level: 'junior',
        q: {
            en: 'Tell me about a time you helped a new colleague get up to speed. What did you do?',
            nl: 'Vertel over een keer dat je een nieuwe collega hielp om ingewerkt te raken. Wat deed je?',
            fr: 'Parlez-moi d’une fois où vous avez aidé un nouveau collègue à monter en compétence. Qu’avez-vous fait ?'
        },
        a: {
            en: 'Look for genuine generosity with time and knowledge: making themselves available, explaining the unwritten rules, and checking in rather than dumping documentation. A strong answer shows they care about the team succeeding, not just their own tasks. Red flags: "not my job", or help that was really taking over.',
            nl: 'Let op echte vrijgevigheid met tijd en kennis: zich beschikbaar stellen, de ongeschreven regels uitleggen en opvolgen in plaats van enkel documentatie doorsturen. Een sterk antwoord toont dat ze om het succes van het team geven, niet enkel om eigen taken. Alarmbellen: “niet mijn taak”, of hulp die eigenlijk overnemen was.',
            fr: 'Cherchez une vraie générosité de temps et de savoir : se rendre disponible, expliquer les règles non écrites et faire des points réguliers plutôt que de renvoyer à la documentation. Une bonne réponse montre qu’ils tiennent à la réussite de l’équipe, pas seulement à leurs tâches. Signaux d’alarme : « pas mon rôle », ou une aide qui revenait à faire à la place.'
        }
    },
    {
        id: 'team-difficult-member', cat: 'teamwork', roles: ['teamwork', 'problem-solving'], level: 'senior',
        q: {
            en: 'Tell me about the most difficult person you have had to work with. How did you make it work?',
            nl: 'Vertel over de moeilijkste persoon met wie je hebt moeten samenwerken. Hoe kreeg je het werkbaar?',
            fr: 'Parlez-moi de la personne la plus difficile avec qui vous avez dû travailler. Comment avez-vous fait ?'
        },
        a: {
            en: 'A strong answer stays fair and professional: they tried to understand what drove the behaviour, adjusted their own approach, set clear expectations, and focused on the shared goal. Red flags: contempt, labelling the person as simply "toxic", or no attempt to find common ground.',
            nl: 'Een sterk antwoord blijft eerlijk en professioneel: ze probeerden te begrijpen wat het gedrag dreef, pasten hun eigen aanpak aan, stelden duidelijke verwachtingen en focusten op het gedeelde doel. Alarmbellen: minachting, de persoon simpelweg “toxisch” noemen, of geen poging om raakvlakken te vinden.',
            fr: 'Une bonne réponse reste équitable et professionnelle : ils ont cherché à comprendre ce qui motivait le comportement, ajusté leur approche, posé des attentes claires et gardé le cap sur l’objectif commun. Signaux d’alarme : mépris, qualifier la personne de simplement « toxique », ou aucune tentative de terrain d’entente.'
        }
    },
    {
        id: 'team-credit', cat: 'teamwork', roles: ['teamwork', 'integrity'], level: 'medior',
        q: {
            en: 'Tell me about a team success. How do you describe who did what?',
            nl: 'Vertel over een teamsucces. Hoe beschrijf je wie wat deed?',
            fr: 'Parlez-moi d’une réussite d’équipe. Comment décrivez-vous qui a fait quoi ?'
        },
        a: {
            en: 'Listen for how they share credit: naming others’ contributions specifically and being honest about their own role. A strong answer neither erases the team nor inflates the self. Red flags: "I" for everything that went well and "they" for everything that did not, or vague credit that names no one.',
            nl: 'Let op hoe ze de eer delen: de bijdragen van anderen concreet benoemen en eerlijk zijn over hun eigen rol. Een sterk antwoord wist het team niet uit en blaast het ego niet op. Alarmbellen: “ik” voor alles wat goed ging en “zij” voor alles wat misging, of vage eer die niemand noemt.',
            fr: 'Écoutez comment ils partagent le mérite : citer précisément les contributions des autres et rester honnêtes sur leur propre rôle. Une bonne réponse n’efface pas l’équipe et ne gonfle pas l’ego. Signaux d’alarme : « je » pour tout ce qui a réussi et « ils » pour le reste, ou un mérite vague sans nommer personne.'
        }
    },
    {
        id: 'team-crossfunctional', cat: 'teamwork', roles: ['teamwork', 'communication'], level: 'senior',
        q: {
            en: 'Tell me about a time you had to deliver something with people from other teams or departments.',
            nl: 'Vertel over een keer dat je iets moest opleveren samen met mensen uit andere teams of afdelingen.',
            fr: 'Parlez-moi d’une fois où vous avez dû livrer quelque chose avec des personnes d’autres équipes ou services.'
        },
        a: {
            en: 'A strong answer shows they aligned on a shared goal, clarified who owns what, and kept everyone informed across boundaries where authority is unclear. Look for handling of competing priorities. Red flags: treating other teams as obstacles, or assuming everyone shares their context.',
            nl: 'Een sterk antwoord toont dat ze afstemden op een gedeeld doel, verduidelijkten wie waarvoor verantwoordelijk is en iedereen informeerden over de grenzen heen waar de bevoegdheid onduidelijk is. Let op hoe ze met botsende prioriteiten omgaan. Alarmbellen: andere teams als obstakels zien, of aannemen dat iedereen hun context deelt.',
            fr: 'Une bonne réponse montre qu’ils se sont alignés sur un objectif commun, ont clarifié les responsabilités et tenu chacun informé au-delà des frontières où l’autorité est floue. Cherchez la gestion des priorités concurrentes. Signaux d’alarme : voir les autres équipes comme des obstacles, ou supposer que tous partagent leur contexte.'
        }
    },
    /* ---- Leadership ---------------------------------------------------------- */
    {
        id: 'lead-teamlead', cat: 'leadership', roles: ['leadership', 'teamwork'], level: 'medior',
        q: {
            en: 'Have you been a team leader before? What did you find hardest about it?',
            nl: 'Ben je al teamleider geweest? Wat vond je daar het moeilijkst aan?',
            fr: 'Avez-vous déjà été chef d’équipe ? Qu’est-ce qui vous a semblé le plus difficile ?'
        },
        a: {
            en: 'Look for self-awareness: giving critical feedback, letting go of doing the technical work themselves, dealing with an underperformer, protecting the team from unrealistic deadlines. A strong answer names a real difficulty and what they learned; a weak one claims leading was easy and everyone loved them.',
            nl: 'Let op zelfinzicht: kritische feedback geven, het technische werk loslaten, omgaan met een onderpresteerder, het team beschermen tegen onrealistische deadlines. Een sterk antwoord noemt een echte moeilijkheid en wat ze leerden; een zwak antwoord beweert dat leidinggeven makkelijk was en iedereen hen graag zag.',
            fr: 'Cherchez de la lucidité : donner un retour critique, lâcher la partie technique, gérer une sous-performance, protéger l’équipe de délais irréalistes. Une bonne réponse nomme une vraie difficulté et l’apprentissage ; une faible prétend que diriger était facile et que tout le monde les appréciait.'
        }
    },
    {
        id: 'lead-delegate', cat: 'leadership', roles: ['leadership', 'teamwork'], level: 'medior',
        q: {
            en: 'Tell me about a time you delegated something important. How did you decide what to hand over?',
            nl: 'Vertel over een keer dat je iets belangrijks delegeerde. Hoe besliste je wat je uit handen gaf?',
            fr: 'Parlez-moi d’une fois où vous avez délégué quelque chose d’important. Comment avez-vous choisi ce que vous confiez ?'
        },
        a: {
            en: 'A strong answer matches the task to the person’s ability and growth, sets a clear outcome, and follows up without micromanaging. Look for trusting others with real responsibility. Red flags: only delegating trivial work, dumping without context, or taking it back at the first wobble.',
            nl: 'Een sterk antwoord stemt de taak af op het kunnen en de groei van de persoon, stelt een duidelijk resultaat en volgt op zonder micromanagement. Let op het toevertrouwen van echte verantwoordelijkheid. Alarmbellen: enkel triviaal werk delegeren, zonder context dumpen, of het bij de eerste hapering terugnemen.',
            fr: 'Une bonne réponse adapte la tâche aux capacités et au développement de la personne, fixe un résultat clair et fait le suivi sans micromanager. Cherchez la confiance sur de vraies responsabilités. Signaux d’alarme : ne déléguer que le trivial, confier sans contexte, ou tout reprendre au premier accroc.'
        }
    },
    {
        id: 'lead-underperformer', cat: 'leadership', roles: ['leadership', 'communication'], level: 'senior',
        q: {
            en: 'Tell me about a time someone on your team was underperforming. What did you do?',
            nl: 'Vertel over een keer dat iemand in je team onderpresteerde. Wat deed je?',
            fr: 'Parlez-moi d’une fois où un membre de votre équipe sous-performait. Qu’avez-vous fait ?'
        },
        a: {
            en: 'A strong answer starts with a direct, respectful conversation to understand the cause, sets clear expectations and support, and follows through. Look for both empathy and accountability. Red flags: avoiding the conversation, going straight to punishment, or letting it slide and resenting it.',
            nl: 'Een sterk antwoord begint met een direct, respectvol gesprek om de oorzaak te begrijpen, stelt duidelijke verwachtingen en ondersteuning en volgt dat op. Let op zowel empathie als aanspreekbaarheid. Alarmbellen: het gesprek vermijden, meteen naar sancties gaan, of het laten lopen en er wrevel over voelen.',
            fr: 'Une bonne réponse commence par une conversation directe et respectueuse pour comprendre la cause, pose des attentes claires et un soutien, puis assure le suivi. Cherchez à la fois empathie et exigence. Signaux d’alarme : éviter la conversation, sanctionner d’emblée, ou laisser filer en accumulant de la rancune.'
        }
    },
    {
        id: 'lead-motivate', cat: 'leadership', roles: ['leadership', 'motivation'], level: 'senior',
        q: {
            en: 'Tell me about a time you had to keep a team motivated through a tough stretch.',
            nl: 'Vertel over een keer dat je een team gemotiveerd moest houden tijdens een zware periode.',
            fr: 'Parlez-moi d’une fois où vous avez dû garder une équipe motivée pendant une période difficile.'
        },
        a: {
            en: 'Look for concrete actions, not slogans: being honest about the situation, breaking work into visible wins, shielding the team from noise, and recognising effort. A strong answer adapts to what individuals needed. Red flags: pure cheerleading, or assuming money or pressure is the only lever.',
            nl: 'Let op concrete acties, geen slogans: eerlijk zijn over de situatie, werk opdelen in zichtbare successen, het team afschermen van ruis en inzet erkennen. Een sterk antwoord past zich aan wat individuen nodig hadden. Alarmbellen: louter aanmoedigen, of aannemen dat geld of druk de enige hefboom is.',
            fr: 'Cherchez des actions concrètes, pas des slogans : être honnête sur la situation, découper le travail en victoires visibles, protéger l’équipe du bruit et reconnaître les efforts. Une bonne réponse s’adapte aux besoins de chacun. Signaux d’alarme : de l’encouragement creux, ou croire que l’argent ou la pression est le seul levier.'
        }
    },
    {
        id: 'lead-unpopular-decision', cat: 'leadership', roles: ['leadership', 'communication'], level: 'senior',
        q: {
            en: 'Tell me about an unpopular decision you had to make and stand behind. How did you handle it?',
            nl: 'Vertel over een impopulaire beslissing die je moest nemen en verdedigen. Hoe pakte je dat aan?',
            fr: 'Parlez-moi d’une décision impopulaire que vous avez dû prendre et assumer. Comment avez-vous géré ?'
        },
        a: {
            en: 'A strong answer explains the reasoning, communicates it transparently, listens to objections, and owns the decision rather than blaming "management". Look for consistency between words and follow-through. Red flags: caving under any pushback, or ramming it through without listening.',
            nl: 'Een sterk antwoord legt de redenering uit, communiceert die transparant, luistert naar bezwaren en staat achter de beslissing in plaats van “het management” de schuld te geven. Let op consistentie tussen woorden en opvolging. Alarmbellen: bij elke tegenspraak plooien, of het erdoor duwen zonder te luisteren.',
            fr: 'Une bonne réponse explique le raisonnement, le communique avec transparence, écoute les objections et assume la décision plutôt que de blâmer « la direction ». Cherchez la cohérence entre les mots et les actes. Signaux d’alarme : céder à la moindre contestation, ou l’imposer sans écouter.'
        }
    },
    {
        id: 'lead-develop-someone', cat: 'leadership', roles: ['leadership', 'culture-fit'], level: 'medior',
        q: {
            en: 'Tell me about someone you helped grow. What did you actually do to develop them?',
            nl: 'Vertel over iemand die je hebt helpen groeien. Wat deed je concreet om hen te ontwikkelen?',
            fr: 'Parlez-moi de quelqu’un que vous avez aidé à progresser. Qu’avez-vous concrètement fait pour son développement ?'
        },
        a: {
            en: 'Look for deliberate development: stretching assignments, honest feedback, coaching rather than doing it for them, and pride in their progress. A strong answer names the person’s growth, not just their own mentoring. Red flags: no examples, or "development" that was really offloading work.',
            nl: 'Let op bewuste ontwikkeling: uitdagende opdrachten, eerlijke feedback, coachen in plaats van het overnemen, en trots op hun vooruitgang. Een sterk antwoord benoemt de groei van de persoon, niet enkel het eigen mentorschap. Alarmbellen: geen voorbeelden, of “ontwikkeling” die eigenlijk werk afschuiven was.',
            fr: 'Cherchez un développement volontaire : missions stimulantes, retours honnêtes, coaching plutôt que faire à leur place, et fierté de leurs progrès. Une bonne réponse nomme la progression de la personne, pas seulement leur propre mentorat. Signaux d’alarme : aucun exemple, ou un « développement » qui revenait à se décharger de travail.'
        }
    },
    /* ---- Communication ------------------------------------------------------- */
    {
        id: 'comm-explain-nontech', cat: 'communication', roles: ['communication', 'problem-solving'], level: 'junior',
        q: {
            en: 'Tell me about a time you had to explain something complex to someone without your background.',
            nl: 'Vertel over een keer dat je iets complex moest uitleggen aan iemand zonder jouw achtergrond.',
            fr: 'Parlez-moi d’une fois où vous avez dû expliquer quelque chose de complexe à une personne sans votre bagage.'
        },
        a: {
            en: 'A strong answer adapts to the audience: they checked what the person already knew, used analogies or plain language, and confirmed understanding rather than lecturing. Look for the outcome. Red flags: blaming the listener for not getting it, or drowning them in jargon to sound smart.',
            nl: 'Een sterk antwoord past zich aan het publiek aan: ze checkten wat de persoon al wist, gebruikten analogieën of gewone taal en toetsten of het begrepen werd in plaats van te doceren. Let op het resultaat. Alarmbellen: de luisteraar de schuld geven, of hen overladen met jargon om slim te lijken.',
            fr: 'Une bonne réponse s’adapte au public : ils ont vérifié ce que la personne savait déjà, utilisé des analogies ou un langage simple et confirmé la compréhension plutôt que de faire un cours. Cherchez le résultat. Signaux d’alarme : reprocher à l’autre de ne pas comprendre, ou noyer sous le jargon pour paraître savant.'
        }
    },
    {
        id: 'comm-bad-news', cat: 'communication', roles: ['communication', 'stress'], level: 'medior',
        q: {
            en: 'Tell me about a time you had to deliver bad news to a manager or a client. How did you approach it?',
            nl: 'Vertel over een keer dat je slecht nieuws moest brengen aan een manager of klant. Hoe pakte je dat aan?',
            fr: 'Parlez-moi d’une fois où vous avez dû annoncer une mauvaise nouvelle à un responsable ou un client. Comment avez-vous procédé ?'
        },
        a: {
            en: 'Look for early, honest, factual communication with a proposed way forward, not just the problem. A strong answer shows they did not hide or delay it and managed the reaction calmly. Red flags: waiting until it was too late, sugar-coating so much the message was lost, or dumping the problem with no options.',
            nl: 'Let op tijdige, eerlijke, feitelijke communicatie met een voorgestelde uitweg, niet enkel het probleem. Een sterk antwoord toont dat ze het niet verborgen of uitstelden en de reactie kalm beheersten. Alarmbellen: wachten tot het te laat was, zo verbloemen dat de boodschap wegviel, of het probleem dumpen zonder opties.',
            fr: 'Cherchez une communication précoce, honnête et factuelle avec une piste de solution, pas seulement le problème. Une bonne réponse montre qu’ils n’ont ni caché ni tardé et ont géré la réaction avec calme. Signaux d’alarme : attendre qu’il soit trop tard, enrober au point de perdre le message, ou livrer le problème sans options.'
        }
    },
    {
        id: 'comm-listen', cat: 'communication', roles: ['communication', 'teamwork'], level: 'junior',
        q: {
            en: 'Tell me about a time listening carefully changed your understanding of a situation.',
            nl: 'Vertel over een keer dat aandachtig luisteren je kijk op een situatie veranderde.',
            fr: 'Parlez-moi d’une fois où écouter attentivement a changé votre compréhension d’une situation.'
        },
        a: {
            en: 'A strong answer shows real listening: they asked questions, let the other person finish, and updated their view based on what they heard. Look for a concrete shift. Red flags: no example, or a story where "listening" was just waiting for their turn to talk.',
            nl: 'Een sterk antwoord toont echt luisteren: ze stelden vragen, lieten de ander uitspreken en pasten hun mening aan op basis van wat ze hoorden. Let op een concrete kentering. Alarmbellen: geen voorbeeld, of een verhaal waarin “luisteren” gewoon wachten op hun beurt was.',
            fr: 'Une bonne réponse montre une vraie écoute : ils ont posé des questions, laissé l’autre terminer et révisé leur avis selon ce qu’ils ont entendu. Cherchez un changement concret. Signaux d’alarme : aucun exemple, ou un récit où « écouter » signifiait attendre son tour de parler.'
        }
    },
    {
        id: 'comm-written', cat: 'communication', roles: ['communication'], level: 'medior',
        q: {
            en: 'Tell me about a time clear written communication (an email, a doc, a report) made a real difference.',
            nl: 'Vertel over een keer dat heldere schriftelijke communicatie (een mail, document, rapport) echt het verschil maakte.',
            fr: 'Parlez-moi d’une fois où une communication écrite claire (un e-mail, un document, un rapport) a vraiment fait la différence.'
        },
        a: {
            en: 'Look for awareness that writing has a purpose and an audience: structuring for the reader, stating the ask up front, and adjusting tone. A strong answer ties the writing to an outcome. Red flags: seeing writing as a chore, or examples that were long and unstructured.',
            nl: 'Let op besef dat schrijven een doel en publiek heeft: structureren voor de lezer, de vraag vooraan zetten en de toon afstemmen. Een sterk antwoord koppelt het schrijven aan een resultaat. Alarmbellen: schrijven als een last zien, of voorbeelden die lang en ongestructureerd waren.',
            fr: 'Cherchez la conscience qu’un écrit a un but et un public : structurer pour le lecteur, énoncer la demande d’emblée et ajuster le ton. Une bonne réponse relie l’écrit à un résultat. Signaux d’alarme : voir l’écrit comme une corvée, ou des exemples longs et non structurés.'
        }
    },
    {
        id: 'comm-persuade', cat: 'communication', roles: ['communication', 'leadership'], level: 'senior',
        q: {
            en: 'Tell me about a time you convinced others to adopt an idea they were initially against.',
            nl: 'Vertel over een keer dat je anderen overtuigde van een idee waar ze eerst tegen waren.',
            fr: 'Parlez-moi d’une fois où vous avez convaincu d’autres personnes d’adopter une idée à laquelle elles étaient d’abord opposées.'
        },
        a: {
            en: 'A strong answer builds the case around others’ interests, uses evidence, and addresses objections rather than steamrolling. Look for a durable buy-in, not a one-off yes. Red flags: persuasion by authority or pressure only, or an inability to name why people resisted.',
            nl: 'Een sterk antwoord bouwt het pleidooi rond de belangen van anderen, gebruikt bewijs en gaat in op bezwaren in plaats van door te drammen. Let op duurzame steun, geen eenmalig ja. Alarmbellen: overtuigen enkel via gezag of druk, of niet kunnen benoemen waarom mensen weerstand boden.',
            fr: 'Une bonne réponse construit l’argumentaire autour des intérêts des autres, s’appuie sur des preuves et traite les objections plutôt que de forcer. Cherchez une adhésion durable, pas un oui ponctuel. Signaux d’alarme : convaincre uniquement par l’autorité ou la pression, ou ne pas savoir dire pourquoi les gens résistaient.'
        }
    },
    {
        id: 'comm-difficult-conversation', cat: 'communication', roles: ['communication', 'integrity'], level: 'medior',
        q: {
            en: 'Tell me about a difficult conversation you were tempted to avoid but had anyway.',
            nl: 'Vertel over een moeilijk gesprek dat je liever had vermeden maar toch voerde.',
            fr: 'Parlez-moi d’une conversation difficile que vous étiez tenté d’éviter mais que vous avez menée quand même.'
        },
        a: {
            en: 'Look for courage plus tact: they prepared, were direct about the issue, stayed respectful, and aimed for a resolution not a win. A strong answer names what made it hard and the result. Red flags: habitually avoiding hard conversations, or having them so bluntly that relationships broke.',
            nl: 'Let op moed én tact: ze bereidden zich voor, waren direct over de kwestie, bleven respectvol en mikten op een oplossing, niet op winst. Een sterk antwoord benoemt wat het moeilijk maakte en het resultaat. Alarmbellen: moeilijke gesprekken structureel vermijden, of ze zo bot voeren dat relaties braken.',
            fr: 'Cherchez du courage et du tact : ils se sont préparés, ont été directs sur le sujet, sont restés respectueux et ont visé une résolution, pas une victoire. Une bonne réponse nomme la difficulté et le résultat. Signaux d’alarme : éviter systématiquement les conversations difficiles, ou les mener si brutalement que les relations se brisent.'
        }
    },
    /* ---- Motivation ---------------------------------------------------------- */
    {
        id: 'mot-why-us', cat: 'motivation', roles: ['motivation', 'culture-fit'], level: 'junior',
        q: {
            en: 'Why this role and this company, and where do you want to be in three years?',
            nl: 'Waarom deze functie en dit bedrijf, en waar wil je over drie jaar staan?',
            fr: 'Pourquoi ce poste et cette entreprise, et où voulez-vous être dans trois ans ?'
        },
        a: {
            en: 'Look for specifics that show they read about the company and the vacancy, a link between their own path and this job, and honest ambitions that this role can actually support. Generic flattery, or plans that clearly do not fit the position, are the signal to probe further.',
            nl: 'Let op specifieke elementen die tonen dat ze zich in het bedrijf en de vacature verdiepten, een link tussen hun eigen traject en deze job, en eerlijke ambities die deze functie ook kan waarmaken. Algemene complimenten of plannen die duidelijk niet bij de functie passen zijn een reden om door te vragen.',
            fr: 'Cherchez des éléments précis montrant qu’ils se sont renseignés sur l’entreprise et l’offre, un lien entre leur parcours et ce poste, et des ambitions honnêtes que le poste peut réellement soutenir. Des compliments génériques ou des projets manifestement incompatibles appellent des questions supplémentaires.'
        }
    },
    {
        id: 'mot-proud', cat: 'motivation', roles: ['motivation'], level: 'junior',
        q: {
            en: 'Tell me about a piece of work you are genuinely proud of. Why that one?',
            nl: 'Vertel over werk waar je echt trots op bent. Waarom net dat?',
            fr: 'Parlez-moi d’un travail dont vous êtes réellement fier. Pourquoi celui-là ?'
        },
        a: {
            en: 'The "why" reveals what drives them: impact, craft, learning, helping others, solving something hard. A strong answer is concrete and shows intrinsic motivation aligned with the role. Red flags: nothing comes to mind, or pride based only on recognition rather than the work itself.',
            nl: 'Het “waarom” toont wat hen drijft: impact, vakmanschap, leren, anderen helpen, iets moeilijks oplossen. Een sterk antwoord is concreet en toont intrinsieke motivatie die bij de functie past. Alarmbellen: niets schiet te binnen, of trots enkel om de erkenning in plaats van het werk zelf.',
            fr: 'Le « pourquoi » révèle ce qui les motive : impact, savoir-faire, apprentissage, aider les autres, résoudre un problème ardu. Une bonne réponse est concrète et montre une motivation intrinsèque alignée avec le poste. Signaux d’alarme : rien ne vient, ou une fierté fondée seulement sur la reconnaissance plutôt que sur le travail.'
        }
    },
    {
        id: 'mot-energy', cat: 'motivation', roles: ['motivation', 'culture-fit'], level: 'junior',
        q: {
            en: 'What kind of work gives you energy, and what kind drains it? Give examples.',
            nl: 'Van welk soort werk krijg je energie, en wat put je uit? Geef voorbeelden.',
            fr: 'Quel type de travail vous donne de l’énergie, et lequel vous épuise ? Donnez des exemples.'
        },
        a: {
            en: 'Look for honest self-knowledge backed by examples, and a realistic fit with what this job actually involves. A strong answer accepts that every role has less fun parts. Red flags: everything energises them (not credible), or the draining parts are the core of this job.',
            nl: 'Let op eerlijke zelfkennis met voorbeelden en een realistische match met wat deze job echt inhoudt. Een sterk antwoord aanvaardt dat elke functie minder leuke kanten heeft. Alarmbellen: alles geeft energie (ongeloofwaardig), of net de kern van deze job put hen uit.',
            fr: 'Cherchez une connaissance de soi honnête, appuyée par des exemples, et une adéquation réaliste avec ce que le poste implique vraiment. Une bonne réponse admet que chaque rôle a ses parts ingrates. Signaux d’alarme : tout les stimule (peu crédible), ou ce qui les épuise est justement le cœur du poste.'
        }
    },
    {
        id: 'mot-boring-task', cat: 'motivation', roles: ['motivation', 'stress'], level: 'junior',
        q: {
            en: 'Tell me about a time you had to keep doing tedious but necessary work. How did you stay on it?',
            nl: 'Vertel over een keer dat je saai maar noodzakelijk werk moest blijven doen. Hoe hield je vol?',
            fr: 'Parlez-moi d’une fois où vous avez dû faire un travail fastidieux mais nécessaire. Comment avez-vous tenu ?'
        },
        a: {
            en: 'A strong answer shows reliability: understanding why it mattered, keeping quality up, and perhaps finding a way to make it lighter or better. Look for follow-through without cutting corners. Red flags: quietly dropping quality on "boring" work, or expecting only interesting tasks.',
            nl: 'Een sterk antwoord toont betrouwbaarheid: begrijpen waarom het belangrijk was, de kwaliteit hooghouden en misschien een manier vinden om het lichter of beter te maken. Let op doorzetten zonder shortcuts. Alarmbellen: stilletjes de kwaliteit laten zakken bij “saai” werk, of enkel interessante taken verwachten.',
            fr: 'Une bonne réponse montre de la fiabilité : comprendre pourquoi c’était important, maintenir la qualité et peut-être trouver un moyen d’alléger ou d’améliorer. Cherchez la constance sans bâcler. Signaux d’alarme : baisser discrètement la qualité sur le travail « ennuyeux », ou n’attendre que des tâches intéressantes.'
        }
    },
    {
        id: 'mot-growth', cat: 'motivation', roles: ['motivation', 'adaptability'], level: 'medior',
        q: {
            en: 'Tell me about a time you pushed yourself to grow when nobody required it.',
            nl: 'Vertel over een keer dat je jezelf uitdaagde om te groeien terwijl niemand dat vroeg.',
            fr: 'Parlez-moi d’une fois où vous vous êtes poussé à progresser sans qu’on vous le demande.'
        },
        a: {
            en: 'Look for self-driven development: a goal they set, the effort invested on their own initiative, and the result. A strong answer shows curiosity and ambition beyond the minimum. Red flags: only growing when forced, or "growth" with no evidence of effort or result.',
            nl: 'Let op zelfgestuurde ontwikkeling: een doel dat ze zichzelf stelden, de inspanning op eigen initiatief en het resultaat. Een sterk antwoord toont nieuwsgierigheid en ambitie voorbij het minimum. Alarmbellen: enkel groeien onder dwang, of “groei” zonder bewijs van inspanning of resultaat.',
            fr: 'Cherchez un développement autonome : un objectif qu’ils se sont fixé, l’effort investi de leur propre initiative et le résultat. Une bonne réponse montre curiosité et ambition au-delà du minimum. Signaux d’alarme : ne progresser que sous contrainte, ou une « progression » sans preuve d’effort ni de résultat.'
        }
    },
    {
        id: 'mot-values', cat: 'motivation', roles: ['motivation', 'culture-fit'], level: 'medior',
        q: {
            en: 'What matters most to you in how a team works day to day? Tell me why.',
            nl: 'Wat vind je het belangrijkst in hoe een team dagelijks werkt? Vertel waarom.',
            fr: 'Qu’est-ce qui compte le plus pour vous dans le fonctionnement quotidien d’une équipe ? Dites-moi pourquoi.'
        },
        a: {
            en: 'Look for values they can articulate and back with experience (autonomy, transparency, craftsmanship, pace) and honest reflection on where they thrive. A strong answer helps you judge fit both ways. Red flags: textbook answers with no personal grounding, or values that clash with how the team actually operates.',
            nl: 'Let op waarden die ze kunnen verwoorden en onderbouwen met ervaring (autonomie, transparantie, vakmanschap, tempo) en eerlijke reflectie over waar ze floreren. Een sterk antwoord helpt de match in beide richtingen inschatten. Alarmbellen: boekenwijsheid zonder persoonlijke grond, of waarden die botsen met hoe het team echt werkt.',
            fr: 'Cherchez des valeurs qu’ils savent formuler et étayer par l’expérience (autonomie, transparence, exigence, rythme) et une réflexion honnête sur les conditions où ils s’épanouissent. Une bonne réponse aide à juger l’adéquation dans les deux sens. Signaux d’alarme : des réponses de manuel sans ancrage personnel, ou des valeurs incompatibles avec le fonctionnement réel de l’équipe.'
        }
    },
    /* ---- Culture fit --------------------------------------------------------- */
    {
        id: 'cult-environment', cat: 'culture', roles: ['culture-fit'], level: 'junior',
        q: {
            en: 'Describe the environment where you have done your best work. What made it work for you?',
            nl: 'Beschrijf de omgeving waarin je je beste werk leverde. Wat maakte dat het voor jou werkte?',
            fr: 'Décrivez l’environnement dans lequel vous avez fait votre meilleur travail. Qu’est-ce qui vous convenait ?'
        },
        a: {
            en: 'Look for concrete conditions (autonomy, structure, collaboration, feedback) and honest reflection rather than telling you what you want to hear. Compare it to the real environment to judge fit both ways. Red flags: describing a setup that is the opposite of this team, or an answer that is pure flattery.',
            nl: 'Let op concrete voorwaarden (autonomie, structuur, samenwerking, feedback) en eerlijke reflectie in plaats van u naar de mond praten. Vergelijk het met de echte omgeving om de match in beide richtingen te beoordelen. Alarmbellen: een setting beschrijven die het tegengestelde van dit team is, of louter vleierij.',
            fr: 'Cherchez des conditions concrètes (autonomie, structure, collaboration, feedback) et une réflexion honnête plutôt que de vous dire ce que vous voulez entendre. Comparez au contexte réel pour juger l’adéquation dans les deux sens. Signaux d’alarme : décrire l’exact opposé de cette équipe, ou une réponse de pure flatterie.'
        }
    },
    {
        id: 'cult-values-clash', cat: 'culture', roles: ['culture-fit', 'integrity'], level: 'senior',
        q: {
            en: 'Tell me about a time the way things were done somewhere clashed with your own values. What did you do?',
            nl: 'Vertel over een keer dat de manier van werken ergens botste met je eigen waarden. Wat deed je?',
            fr: 'Parlez-moi d’une fois où la façon de faire d’un endroit heurtait vos propres valeurs. Qu’avez-vous fait ?'
        },
        a: {
            en: 'A strong answer shows they raised it constructively, tried to influence within the rules, and made a considered choice (adapt, push for change, or leave) with integrity. Look for maturity, not self-righteousness. Red flags: silent compliance against their stated values, or framing every disagreement as a moral crusade.',
            nl: 'Een sterk antwoord toont dat ze het constructief aankaartten, binnen de regels probeerden te beïnvloeden en een doordachte keuze maakten (aanpassen, verandering bepleiten of vertrekken) met integriteit. Let op maturiteit, geen zelfingenomenheid. Alarmbellen: stil meelopen tegen hun eigen waarden in, of elk meningsverschil als een morele kruistocht kaderen.',
            fr: 'Une bonne réponse montre qu’ils l’ont soulevé de façon constructive, ont cherché à influencer dans les règles et fait un choix réfléchi (s’adapter, plaider le changement ou partir) avec intégrité. Cherchez de la maturité, pas de l’autosatisfaction. Signaux d’alarme : se conformer en silence contre ses valeurs, ou ériger chaque désaccord en croisade morale.'
        }
    },
    {
        id: 'cult-feedback-culture', cat: 'culture', roles: ['culture-fit', 'communication'], level: 'medior',
        q: {
            en: 'How do you like to give and receive feedback? Give an example of each.',
            nl: 'Hoe geef en ontvang je graag feedback? Geef van beide een voorbeeld.',
            fr: 'Comment aimez-vous donner et recevoir du feedback ? Donnez un exemple de chaque.'
        },
        a: {
            en: 'Look for a healthy feedback attitude: direct but kind, timely, specific, and two-way. A strong answer backs both preferences with real examples. Red flags: only comfortable giving, not receiving (or vice versa), avoiding feedback entirely, or an approach that is harsh or purely positive.',
            nl: 'Let op een gezonde feedbackhouding: direct maar vriendelijk, tijdig, specifiek en tweerichtings. Een sterk antwoord onderbouwt beide voorkeuren met echte voorbeelden. Alarmbellen: enkel comfortabel met geven, niet met ontvangen (of omgekeerd), feedback helemaal vermijden, of een aanpak die hard of louter positief is.',
            fr: 'Cherchez une attitude saine face au feedback : direct mais bienveillant, au bon moment, précis et à double sens. Une bonne réponse illustre les deux préférences par des exemples réels. Signaux d’alarme : à l’aise seulement pour donner, pas pour recevoir (ou l’inverse), éviter tout feedback, ou une approche brutale ou uniquement positive.'
        }
    },
    {
        id: 'cult-diversity', cat: 'culture', roles: ['culture-fit', 'teamwork'], level: 'medior',
        q: {
            en: 'Tell me about a time you worked with people whose approach or perspective was very different from yours.',
            nl: 'Vertel over een keer dat je samenwerkte met mensen wier aanpak of kijk sterk van de jouwe verschilde.',
            fr: 'Parlez-moi d’une fois où vous avez travaillé avec des personnes dont l’approche ou le point de vue différait beaucoup du vôtre.'
        },
        a: {
            en: 'A strong answer treats difference as useful: they stayed curious, adapted how they collaborated, and got a better result from the mix. Look for respect and openness. Red flags: framing difference as a problem to be corrected, or an answer that only works when everyone thinks alike.',
            nl: 'Een sterk antwoord ziet verschil als nuttig: ze bleven nieuwsgierig, pasten hun samenwerking aan en haalden een beter resultaat uit de mix. Let op respect en openheid. Alarmbellen: verschil als een te corrigeren probleem zien, of een antwoord dat enkel werkt als iedereen hetzelfde denkt.',
            fr: 'Une bonne réponse voit la différence comme utile : ils sont restés curieux, ont adapté leur manière de collaborer et tiré un meilleur résultat du mélange. Cherchez respect et ouverture. Signaux d’alarme : présenter la différence comme un problème à corriger, ou une réponse qui ne marche que si tout le monde pense pareil.'
        }
    },
    {
        id: 'cult-change-culture', cat: 'culture', roles: ['culture-fit', 'adaptability'], level: 'medior',
        q: {
            en: 'Tell me about joining a team or company and adapting to a culture unlike your last one.',
            nl: 'Vertel over hoe je bij een team of bedrijf begon en je aanpaste aan een cultuur die anders was dan je vorige.',
            fr: 'Parlez-moi de votre arrivée dans une équipe ou une entreprise et de votre adaptation à une culture différente de la précédente.'
        },
        a: {
            en: 'Look for observation before judgement: they learned the norms, adapted where sensible, and kept their own strengths. A strong answer shows respect for the new culture without losing themselves. Red flags: "my old company did it better" as a stance, or changing nothing and expecting the team to adapt to them.',
            nl: 'Let op observeren vóór oordelen: ze leerden de normen, pasten zich aan waar zinvol en behielden hun eigen sterktes. Een sterk antwoord toont respect voor de nieuwe cultuur zonder zichzelf te verliezen. Alarmbellen: “mijn vorige bedrijf deed het beter” als houding, of niets veranderen en verwachten dat het team zich aan hen aanpast.',
            fr: 'Cherchez l’observation avant le jugement : ils ont appris les normes, se sont adaptés là où c’était pertinent et ont gardé leurs atouts. Une bonne réponse montre du respect pour la nouvelle culture sans se renier. Signaux d’alarme : « mon ancienne boîte faisait mieux » comme posture, ou ne rien changer en attendant que l’équipe s’adapte à eux.'
        }
    },
    {
        id: 'cult-worst-fit', cat: 'culture', roles: ['culture-fit', 'motivation'], level: 'senior',
        q: {
            en: 'What kind of workplace would bring out the worst in you? Be honest.',
            nl: 'In wat voor werkplek zou je het slechtst functioneren? Wees eerlijk.',
            fr: 'Dans quel type d’environnement de travail donneriez-vous le pire de vous-même ? Soyez honnête.'
        },
        a: {
            en: 'Honest self-knowledge is the point: naming conditions where they struggle (micromanagement, no feedback, constant chaos) shows maturity and helps judge fit. A strong answer is specific and self-aware. Red flags: "nothing, I adapt to anything", or naming exactly what this role offers.',
            nl: 'Eerlijke zelfkennis is de kern: benoemen waar ze het moeilijk hebben (micromanagement, geen feedback, constante chaos) toont maturiteit en helpt de match inschatten. Een sterk antwoord is specifiek en zelfbewust. Alarmbellen: “niets, ik pas me aan alles aan”, of net beschrijven wat deze functie biedt.',
            fr: 'La connaissance de soi honnête est l’enjeu : nommer les conditions où ils peinent (micromanagement, absence de feedback, chaos permanent) montre de la maturité et aide à juger l’adéquation. Une bonne réponse est précise et lucide. Signaux d’alarme : « rien, je m’adapte à tout », ou décrire exactement ce que le poste propose.'
        }
    },
    /* ---- Conflict ------------------------------------------------------------ */
    {
        id: 'conf-colleague', cat: 'conflict', roles: ['problem-solving', 'communication'], level: 'medior',
        q: {
            en: 'Tell me about a serious conflict you had with a colleague. How did it end?',
            nl: 'Vertel over een stevig conflict met een collega. Hoe liep het af?',
            fr: 'Parlez-moi d’un conflit sérieux avec un collègue. Comment cela s’est-il terminé ?'
        },
        a: {
            en: 'A strong answer separates issue from person, shows they sought to understand the other side, addressed it directly, and reached a workable resolution. Look for honest reflection on their own part. Red flags: still bitter, casting themselves as the only reasonable one, or resolving nothing.',
            nl: 'Een sterk antwoord scheidt de kwestie van de persoon, toont dat ze de andere kant probeerden te begrijpen, het rechtstreeks aanpakten en tot een werkbare oplossing kwamen. Let op eerlijke reflectie over hun eigen aandeel. Alarmbellen: nog steeds verbitterd, zichzelf als enige redelijke neerzetten, of niets oplossen.',
            fr: 'Une bonne réponse dissocie le problème de la personne, montre qu’ils ont cherché à comprendre l’autre, abordé la chose directement et trouvé une issue viable. Cherchez une réflexion honnête sur leur propre part. Signaux d’alarme : rancune persistante, se présenter comme le seul raisonnable, ou ne rien résoudre.'
        }
    },
    {
        id: 'conf-manager', cat: 'conflict', roles: ['communication', 'integrity'], level: 'senior',
        q: {
            en: 'Tell me about a time you disagreed with your manager on something important. What happened?',
            nl: 'Vertel over een keer dat je het met je manager oneens was over iets belangrijks. Wat gebeurde er?',
            fr: 'Parlez-moi d’une fois où vous étiez en désaccord avec votre responsable sur un point important. Que s’est-il passé ?'
        },
        a: {
            en: 'Look for respectful candour: making their case with reasons and evidence in private, then committing to the final decision even if it went the other way ("disagree and commit"). A strong answer balances backbone and loyalty. Red flags: never challenging up, or undermining the decision afterwards.',
            nl: 'Let op respectvolle openhartigheid: hun standpunt onderbouwen met redenen en bewijs in besloten kring, en zich dan neerleggen bij de finale beslissing, ook als die anders uitviel (“disagree and commit”). Een sterk antwoord balanceert ruggengraat en loyaliteit. Alarmbellen: nooit naar boven tegenspreken, of de beslissing achteraf ondermijnen.',
            fr: 'Cherchez une franchise respectueuse : défendre son point avec arguments et preuves en privé, puis se rallier à la décision finale même contraire (« disagree and commit »). Une bonne réponse équilibre caractère et loyauté. Signaux d’alarme : ne jamais contester vers le haut, ou saper la décision après coup.'
        }
    },
    {
        id: 'conf-customer', cat: 'conflict', roles: ['communication', 'stress'], level: 'medior',
        q: {
            en: 'Tell me about an angry customer or stakeholder you had to deal with. How did you handle it?',
            nl: 'Vertel over een boze klant of stakeholder die je moest kalmeren. Hoe pakte je dat aan?',
            fr: 'Parlez-moi d’un client ou d’une partie prenante en colère que vous avez dû gérer. Comment avez-vous fait ?'
        },
        a: {
            en: 'A strong answer stays calm, lets the person vent, acknowledges the impact, separates emotion from facts, and moves to a concrete next step. Look for de-escalation and follow-through. Red flags: getting defensive or matching the anger, over-promising to make it stop, or blaming the customer.',
            nl: 'Een sterk antwoord blijft kalm, laat de persoon stoom afblazen, erkent de impact, scheidt emotie van feiten en gaat naar een concrete volgende stap. Let op de-escalatie en opvolging. Alarmbellen: in de verdediging schieten of even boos worden, te veel beloven om het te stoppen, of de klant de schuld geven.',
            fr: 'Une bonne réponse reste calme, laisse la personne s’exprimer, reconnaît l’impact, sépare l’émotion des faits et propose une étape concrète. Cherchez la désescalade et le suivi. Signaux d’alarme : se braquer ou répondre à la colère par la colère, sur-promettre pour faire cesser, ou blâmer le client.'
        }
    },
    {
        id: 'conf-mediate', cat: 'conflict', roles: ['problem-solving', 'leadership'], level: 'senior',
        q: {
            en: 'Tell me about a time you helped two other people resolve a conflict between them.',
            nl: 'Vertel over een keer dat je twee andere mensen hielp een conflict tussen hen op te lossen.',
            fr: 'Parlez-moi d’une fois où vous avez aidé deux autres personnes à résoudre un conflit entre elles.'
        },
        a: {
            en: 'Look for neutral facilitation: hearing both sides, keeping it about the issue, helping them find common ground, and letting them own the resolution. A strong answer shows they did not take sides or impose a fix. Red flags: picking a winner, gossiping, or avoiding involvement when they should have stepped in.',
            nl: 'Let op neutrale facilitatie: beide kanten horen, bij de kwestie blijven, hen helpen raakvlakken te vinden en de oplossing bij hen laten. Een sterk antwoord toont dat ze geen partij kozen of een fix oplegden. Alarmbellen: een winnaar aanduiden, roddelen, of zich afzijdig houden waar ze hadden moeten ingrijpen.',
            fr: 'Cherchez une facilitation neutre : entendre les deux parties, rester sur le fond, les aider à trouver un terrain commun et leur laisser la résolution. Une bonne réponse montre qu’ils n’ont ni pris parti ni imposé de solution. Signaux d’alarme : désigner un gagnant, colporter, ou rester en retrait alors qu’il fallait intervenir.'
        }
    },
    {
        id: 'conf-style', cat: 'conflict', roles: ['teamwork', 'communication'], level: 'junior',
        q: {
            en: 'Tell me about a time a difference in working styles caused friction. What did you do about it?',
            nl: 'Vertel over een keer dat een verschil in werkstijl wrijving veroorzaakte. Wat deed je eraan?',
            fr: 'Parlez-moi d’une fois où une différence de style de travail a créé des frictions. Qu’avez-vous fait ?'
        },
        a: {
            en: 'A strong answer names the specific mismatch (pace, detail, planning vs improvising), talks about it openly, and agrees on how to work together. Look for adaptation rather than expecting the other to change. Red flags: labelling the other style as simply wrong, or letting the friction fester silently.',
            nl: 'Een sterk antwoord benoemt de concrete mismatch (tempo, detail, plannen vs. improviseren), bespreekt het open en spreekt af hoe samen te werken. Let op aanpassing in plaats van verwachten dat de ander verandert. Alarmbellen: de andere stijl gewoon fout noemen, of de wrijving stil laten etteren.',
            fr: 'Une bonne réponse nomme le décalage précis (rythme, détail, planifier vs improviser), en parle ouvertement et convient d’une façon de travailler ensemble. Cherchez l’adaptation plutôt que d’attendre que l’autre change. Signaux d’alarme : qualifier l’autre style de simplement mauvais, ou laisser la friction s’envenimer en silence.'
        }
    },
    {
        id: 'conf-unresolved', cat: 'conflict', roles: ['problem-solving', 'communication'], level: 'senior',
        q: {
            en: 'Tell me about a conflict you could not fully resolve. Looking back, what would you do differently?',
            nl: 'Vertel over een conflict dat je niet volledig kon oplossen. Wat zou je achteraf anders doen?',
            fr: 'Parlez-moi d’un conflit que vous n’avez pas pu résoudre complètement. Avec le recul, que feriez-vous autrement ?'
        },
        a: {
            en: 'This tests honesty and reflection. A strong answer accepts that not everything resolves, describes what they tried, and draws a real lesson without excessive self-blame or blaming only the other. Red flags: pretending they always succeed, or a lesson that is really "the other person was impossible".',
            nl: 'Dit toetst eerlijkheid en reflectie. Een sterk antwoord aanvaardt dat niet alles opgelost raakt, beschrijft wat ze probeerden en trekt een echte les zonder overdreven zelfverwijt of enkel de ander de schuld geven. Alarmbellen: doen alsof ze altijd slagen, of een les die eigenlijk “de ander was onmogelijk” is.',
            fr: 'Cela teste l’honnêteté et la réflexion. Une bonne réponse admet que tout ne se résout pas, décrit ce qui a été tenté et tire une vraie leçon sans excès d’auto-accusation ni tout rejeter sur l’autre. Signaux d’alarme : prétendre réussir toujours, ou une leçon qui revient à « l’autre était impossible ».'
        }
    },
    /* ---- Time management ----------------------------------------------------- */
    {
        id: 'stress-deadline', cat: 'timemanagement', roles: ['stress', 'planning', 'problem-solving'], level: 'junior',
        q: {
            en: 'Three urgent things land at once and all of them are "priority one". What do you do?',
            nl: 'Drie dringende zaken komen tegelijk binnen en alles is “prioriteit één”. Wat doe je?',
            fr: 'Trois urgences arrivent en même temps et tout est « priorité un ». Que faites-vous ?'
        },
        a: {
            en: 'A good answer makes the trade-off visible instead of silently working overtime: assess business impact, decide or ask the manager to decide what waits, communicate the new expectation to everyone involved, delegate or ask for help, and keep a short list rather than juggling from memory.',
            nl: 'Een goed antwoord maakt de afweging zichtbaar in plaats van stil over te werken: bedrijfsimpact inschatten, zelf beslissen of de manager laten beslissen wat wacht, de nieuwe verwachting communiceren aan alle betrokkenen, delegeren of hulp vragen, en met een korte lijst werken in plaats van uit het hoofd te jongleren.',
            fr: 'Une bonne réponse rend l’arbitrage visible au lieu de faire des heures en silence : évaluer l’impact métier, décider ou faire décider le responsable de ce qui attend, communiquer la nouvelle attente à toutes les parties, déléguer ou demander de l’aide, et tenir une liste courte plutôt que de tout garder en tête.'
        }
    },
    {
        id: 'time-prioritise', cat: 'timemanagement', roles: ['planning', 'problem-solving'], level: 'junior',
        q: {
            en: 'Tell me how you plan a typical week. What method do you actually use?',
            nl: 'Vertel hoe je een typische week plant. Welke methode gebruik je echt?',
            fr: 'Racontez-moi comment vous planifiez une semaine type. Quelle méthode utilisez-vous réellement ?'
        },
        a: {
            en: 'Look for a concrete, working system: distinguishing important from merely urgent, blocking time for deep work, and a way to capture and re-prioritise as things change. A strong answer is theirs, not a textbook. Red flags: "I just keep it all in my head", or a rigid plan with no room for reality.',
            nl: 'Let op een concreet, werkend systeem: belangrijk onderscheiden van louter dringend, tijd blokken voor diep werk en een manier om zaken vast te leggen en te herprioriteren als het verandert. Een sterk antwoord is het hunne, geen leerboek. Alarmbellen: “ik hou het gewoon in mijn hoofd”, of een rigide plan zonder ruimte voor de realiteit.',
            fr: 'Cherchez un système concret et éprouvé : distinguer l’important du simplement urgent, réserver du temps pour le travail de fond et un moyen de capturer et de re-prioriser quand les choses changent. Une bonne réponse leur est propre, pas issue d’un manuel. Signaux d’alarme : « je garde tout en tête », ou un plan rigide sans place pour la réalité.'
        }
    },
    {
        id: 'time-overcommit', cat: 'timemanagement', roles: ['planning', 'stress'], level: 'medior',
        q: {
            en: 'Tell me about a time you took on too much. How did you get out of it?',
            nl: 'Vertel over een keer dat je te veel hooi op je vork nam. Hoe raakte je eruit?',
            fr: 'Parlez-moi d’une fois où vous avez pris trop de choses en charge. Comment vous en êtes-vous sorti ?'
        },
        a: {
            en: 'A strong answer shows they recognised it, communicated early, renegotiated scope or deadlines, and learned to protect their capacity. Look for honesty about the cause. Red flags: hiding it until things broke, silently burning out, or blaming everyone who "kept adding work".',
            nl: 'Een sterk antwoord toont dat ze het herkenden, tijdig communiceerden, de scope of deadlines heronderhandelden en leerden hun capaciteit te bewaken. Let op eerlijkheid over de oorzaak. Alarmbellen: het verbergen tot het misliep, stil opbranden, of iedereen de schuld geven die “steeds werk bleef toevoegen”.',
            fr: 'Une bonne réponse montre qu’ils l’ont reconnu, communiqué tôt, renégocié le périmètre ou les délais et appris à protéger leur capacité. Cherchez l’honnêteté sur la cause. Signaux d’alarme : cacher jusqu’à la rupture, s’épuiser en silence, ou blâmer tous ceux qui « n’arrêtaient pas d’ajouter du travail ».'
        }
    },
    {
        id: 'time-missed-deadline', cat: 'timemanagement', roles: ['planning', 'integrity'], level: 'medior',
        q: {
            en: 'Tell me about a deadline you missed. How did you handle it and what changed afterwards?',
            nl: 'Vertel over een deadline die je miste. Hoe ging je ermee om en wat veranderde daarna?',
            fr: 'Parlez-moi d’un délai que vous avez manqué. Comment avez-vous géré et qu’est-ce qui a changé ensuite ?'
        },
        a: {
            en: 'Look for early warning rather than a last-minute surprise, ownership of the cause, and a concrete change to estimation or planning afterwards. A strong answer is honest and constructive. Red flags: never missing a deadline (unlikely), blaming only others, or no lesson drawn.',
            nl: 'Let op tijdig waarschuwen in plaats van een verrassing op het laatste moment, eigenaarschap van de oorzaak en een concrete aanpassing van de raming of planning nadien. Een sterk antwoord is eerlijk en constructief. Alarmbellen: nooit een deadline missen (onwaarschijnlijk), enkel anderen de schuld geven, of geen les trekken.',
            fr: 'Cherchez un avertissement précoce plutôt qu’une surprise de dernière minute, l’appropriation de la cause et un changement concret d’estimation ou de planification ensuite. Une bonne réponse est honnête et constructive. Signaux d’alarme : ne jamais manquer un délai (peu crédible), blâmer uniquement les autres, ou aucune leçon tirée.'
        }
    },
    {
        id: 'time-longterm', cat: 'timemanagement', roles: ['planning', 'adaptability'], level: 'senior',
        q: {
            en: 'Tell me how you keep a long project on track when the deadline is months away.',
            nl: 'Vertel hoe je een lang project op koers houdt als de deadline nog maanden weg is.',
            fr: 'Racontez-moi comment vous gardez un long projet sur les rails quand l’échéance est à des mois.'
        },
        a: {
            en: 'A strong answer breaks the work into milestones, tracks progress against them, and adjusts early when reality drifts from the plan. Look for proactive course-correction, not a rush at the end. Red flags: no interim checkpoints, or treating the plan as fixed regardless of new information.',
            nl: 'Een sterk antwoord splitst het werk in mijlpalen, volgt de voortgang daartegen op en stuurt tijdig bij als de realiteit afwijkt van het plan. Let op proactief bijsturen, geen eindsprint. Alarmbellen: geen tussentijdse checkpoints, of het plan als vaststaand behandelen ongeacht nieuwe informatie.',
            fr: 'Une bonne réponse découpe le travail en jalons, suit l’avancement par rapport à eux et corrige tôt quand la réalité s’écarte du plan. Cherchez une correction proactive, pas un sprint final. Signaux d’alarme : aucun point d’étape, ou traiter le plan comme figé malgré de nouvelles informations.'
        }
    },
    {
        id: 'time-focus', cat: 'timemanagement', roles: ['planning', 'stress'], level: 'junior',
        q: {
            en: 'Tell me about a time constant interruptions threatened your work. How did you protect your focus?',
            nl: 'Vertel over een keer dat constante onderbrekingen je werk bedreigden. Hoe beschermde je je focus?',
            fr: 'Parlez-moi d’une fois où des interruptions constantes menaçaient votre travail. Comment avez-vous protégé votre concentration ?'
        },
        a: {
            en: 'Look for practical tactics balanced with availability: time-blocking, batching questions, setting expectations, but still being reachable when it matters. A strong answer protects deep work without becoming unresponsive. Red flags: ignoring the team to focus, or having no strategy and just suffering the churn.',
            nl: 'Let op praktische tactieken in balans met bereikbaarheid: tijd blokken, vragen bundelen, verwachtingen stellen, maar toch bereikbaar blijven wanneer het telt. Een sterk antwoord beschermt diep werk zonder onbereikbaar te worden. Alarmbellen: het team negeren om te focussen, of geen strategie hebben en de chaos gewoon ondergaan.',
            fr: 'Cherchez des tactiques pratiques équilibrées avec la disponibilité : blocs de temps, regrouper les questions, poser des attentes, tout en restant joignable quand c’est important. Une bonne réponse protège le travail de fond sans devenir injoignable. Signaux d’alarme : ignorer l’équipe pour se concentrer, ou n’avoir aucune stratégie et subir le chaos.'
        }
    },
    /* ---- Learning & growth --------------------------------------------------- */
    {
        id: 'learn-newtech', cat: 'learning', roles: ['adaptability', 'motivation'], level: 'junior',
        q: {
            en: 'How do you learn a technology you have never touched before? Give a recent example.',
            nl: 'Hoe leer je een technologie die je nog nooit gebruikt hebt? Geef een recent voorbeeld.',
            fr: 'Comment apprenez-vous une technologie que vous n’avez jamais utilisée ? Donnez un exemple récent.'
        },
        a: {
            en: 'Look for a real, recent example and a repeatable method: official documentation, a lab or test tenant, a small project, a course or community, and asking a colleague early instead of getting stuck for days. Vague enthusiasm without an example is a weak signal.',
            nl: 'Let op een echt, recent voorbeeld en een herhaalbare methode: officiële documentatie, een lab of testtenant, een klein project, een cursus of community, en tijdig een collega vragen in plaats van dagen vast te zitten. Vaag enthousiasme zonder voorbeeld is een zwak signaal.',
            fr: 'Cherchez un exemple réel et récent et une méthode reproductible : documentation officielle, laboratoire ou tenant de test, petit projet, formation ou communauté, et solliciter un collègue tôt plutôt que de bloquer des jours. Un enthousiasme vague sans exemple est un signal faible.'
        }
    },
    {
        id: 'learn-feedback-growth', cat: 'learning', roles: ['adaptability', 'motivation'], level: 'junior',
        q: {
            en: 'Tell me about a piece of feedback that genuinely changed how you work.',
            nl: 'Vertel over feedback die echt veranderde hoe je werkt.',
            fr: 'Parlez-moi d’un retour qui a réellement changé votre façon de travailler.'
        },
        a: {
            en: 'A strong answer names the feedback specifically, shows they took it seriously without over-reacting, and describes the lasting change. Look for a growth mindset. Red flags: cannot recall any feedback, brushing it off, or a "change" with no evidence it stuck.',
            nl: 'Een sterk antwoord benoemt de feedback concreet, toont dat ze die ernstig namen zonder te overdrijven en beschrijft de blijvende verandering. Let op een groeimindset. Alarmbellen: geen feedback kunnen herinneren, ze wegwuiven, of een “verandering” zonder bewijs dat ze bleef.',
            fr: 'Une bonne réponse nomme le retour avec précision, montre qu’ils l’ont pris au sérieux sans surréagir et décrit le changement durable. Cherchez un état d’esprit de croissance. Signaux d’alarme : ne se souvenir d’aucun retour, le balayer, ou un « changement » sans preuve qu’il a tenu.'
        }
    },
    {
        id: 'learn-outside-comfort', cat: 'learning', roles: ['adaptability', 'stress'], level: 'medior',
        q: {
            en: 'Tell me about a time you had to work well outside your comfort zone.',
            nl: 'Vertel over een keer dat je goed moest presteren ver buiten je comfortzone.',
            fr: 'Parlez-moi d’une fois où vous avez dû bien fonctionner en dehors de votre zone de confort.'
        },
        a: {
            en: 'Look for how they coped with discomfort: acknowledging the gap, seeking help, learning fast, and delivering despite the stretch. A strong answer shows resilience and self-honesty. Red flags: never leaving the comfort zone, or a story where they froze and blamed the situation.',
            nl: 'Let op hoe ze met ongemak omgingen: de kloof erkennen, hulp zoeken, snel leren en toch leveren ondanks de uitdaging. Een sterk antwoord toont veerkracht en zelfeerlijkheid. Alarmbellen: nooit de comfortzone verlaten, of een verhaal waarin ze verlamden en de situatie de schuld gaven.',
            fr: 'Cherchez comment ils ont géré l’inconfort : reconnaître l’écart, demander de l’aide, apprendre vite et livrer malgré le défi. Une bonne réponse montre de la résilience et de l’honnêteté. Signaux d’alarme : ne jamais sortir de sa zone de confort, ou un récit où ils se sont figés en blâmant la situation.'
        }
    },
    {
        id: 'learn-failure-lesson', cat: 'learning', roles: ['adaptability', 'problem-solving'], level: 'medior',
        q: {
            en: 'Tell me about something you tried that did not work. What did you take from it?',
            nl: 'Vertel over iets wat je probeerde en niet lukte. Wat nam je eruit mee?',
            fr: 'Parlez-moi de quelque chose que vous avez tenté sans succès. Qu’en avez-vous retiré ?'
        },
        a: {
            en: 'Look for experimentation and reflection: a considered attempt, an honest read of why it failed, and a concrete adjustment. A strong answer treats failure as data. Red flags: never trying anything risky, or a "failure" that was really external and taught them nothing.',
            nl: 'Let op experimenteren en reflecteren: een doordachte poging, een eerlijke inschatting van waarom het faalde en een concrete aanpassing. Een sterk antwoord ziet falen als data. Alarmbellen: nooit iets riskants proberen, of een “mislukking” die eigenlijk extern was en hen niets leerde.',
            fr: 'Cherchez de l’expérimentation et de la réflexion : une tentative réfléchie, une lecture honnête de l’échec et un ajustement concret. Une bonne réponse voit l’échec comme une donnée. Signaux d’alarme : ne jamais rien tenter de risqué, ou un « échec » purement externe dont ils n’ont rien appris.'
        }
    },
    {
        id: 'learn-teach', cat: 'learning', roles: ['communication', 'motivation'], level: 'junior',
        q: {
            en: 'Tell me about a time you taught yourself something and then shared it with others.',
            nl: 'Vertel over een keer dat je jezelf iets aanleerde en het daarna met anderen deelde.',
            fr: 'Parlez-moi d’une fois où vous avez appris quelque chose seul, puis l’avez partagé avec d’autres.'
        },
        a: {
            en: 'A strong answer shows both self-learning and generosity: they turned new knowledge into something useful for the team (a doc, a demo, a session). Look for genuine knowledge-sharing. Red flags: hoarding knowledge, or "sharing" that was really showing off rather than helping.',
            nl: 'Een sterk antwoord toont zowel zelfstudie als vrijgevigheid: ze zetten nieuwe kennis om in iets nuttigs voor het team (een document, een demo, een sessie). Let op oprecht kennis delen. Alarmbellen: kennis hamsteren, of “delen” dat eigenlijk opscheppen was in plaats van helpen.',
            fr: 'Une bonne réponse montre à la fois l’auto-apprentissage et la générosité : ils ont transformé un nouveau savoir en quelque chose d’utile pour l’équipe (un document, une démo, une session). Cherchez un vrai partage de connaissances. Signaux d’alarme : garder le savoir pour soi, ou un « partage » qui relevait de l’esbroufe plutôt que de l’aide.'
        }
    },
    {
        id: 'learn-keep-current', cat: 'learning', roles: ['adaptability', 'motivation'], level: 'medior',
        q: {
            en: 'How do you keep your skills current in a field that keeps changing? Give concrete examples.',
            nl: 'Hoe hou je je vaardigheden actueel in een vakgebied dat blijft veranderen? Geef concrete voorbeelden.',
            fr: 'Comment maintenez-vous vos compétences à jour dans un domaine en évolution constante ? Donnez des exemples concrets.'
        },
        a: {
            en: 'Look for sustainable habits, not heroic bursts: regular reading, side projects, communities, courses, applying new things at work. A strong answer gives recent, specific examples. Red flags: relying entirely on the employer to train them, or vague claims with nothing concrete behind them.',
            nl: 'Let op duurzame gewoonten, geen heroïsche pieken: regelmatig lezen, zijprojecten, communities, cursussen, nieuwe dingen op het werk toepassen. Een sterk antwoord geeft recente, specifieke voorbeelden. Alarmbellen: volledig rekenen op de werkgever om hen op te leiden, of vage beweringen zonder concrete grond.',
            fr: 'Cherchez des habitudes durables, pas des sursauts héroïques : lectures régulières, projets personnels, communautés, formations, application de nouveautés au travail. Une bonne réponse donne des exemples récents et précis. Signaux d’alarme : tout attendre de l’employeur pour se former, ou des affirmations vagues sans rien de concret.'
        }
    },
    /* ---- DISC — Dominance (D / red) ------------------------------------------ */
    {
        id: 'disc-decide-fast', cat: 'disc', roles: ['disc'], level: 'junior', disc: 'D',
        q: {
            en: 'You have to decide today with only half the information. What do you do?',
            nl: 'Je moet vandaag beslissen met maar de helft van de informatie. Wat doe je?',
            fr: 'Vous devez décider aujourd’hui avec seulement la moitié des informations. Que faites-vous ?'
        },
        a: {
            en: 'Deciding anyway, taking responsibility and correcting later points to D (red). Wanting to gather the missing data first points to C (blue); asking the team first points to S (green); wanting to talk it through with people points to I (yellow).',
            nl: 'Toch beslissen, verantwoordelijkheid nemen en later bijsturen wijst op D (rood). Eerst de ontbrekende data verzamelen wijst op C (blauw); eerst het team vragen op S (groen); het met mensen willen bespreken op I (geel).',
            fr: 'Décider malgré tout, assumer et corriger ensuite indique D (rouge). Vouloir d’abord réunir les données manquantes indique C (bleu) ; demander d’abord à l’équipe, S (vert) ; vouloir en discuter avec des gens, I (jaune).'
        }
    },
    {
        id: 'disc-conflict-direct', cat: 'disc', roles: ['disc'], level: 'medior', disc: 'D',
        q: {
            en: 'A colleague is blocking your result. How direct are you with them?',
            nl: 'Een collega blokkeert jouw resultaat. Hoe direct ben je daarin?',
            fr: 'Un collègue bloque votre résultat. À quel point êtes-vous direct avec lui ?'
        },
        a: {
            en: 'Confronting it immediately and bluntly, focused on the result, points to D (red). Softening it to keep the peace points to S (green); escalating with documented facts points to C (blue); trying to win them over socially points to I (yellow).',
            nl: 'Het meteen en onomwonden aankaarten, gericht op het resultaat, wijst op D (rood). Het afzwakken om de vrede te bewaren wijst op S (groen); escaleren met gedocumenteerde feiten op C (blauw); hen sociaal proberen te winnen op I (geel).',
            fr: 'Aborder la chose immédiatement et sans détour, centré sur le résultat, indique D (rouge). Adoucir pour préserver la paix indique S (vert) ; escalader avec des faits documentés, C (bleu) ; tenter de les convaincre socialement, I (jaune).'
        }
    },
    {
        id: 'disc-take-charge', cat: 'disc', roles: ['disc'], level: 'junior', disc: 'D',
        q: {
            en: 'A group task has no clear leader and time is ticking. What do you do?',
            nl: 'Een groepstaak heeft geen duidelijke leider en de tijd tikt. Wat doe je?',
            fr: 'Une tâche de groupe n’a pas de leader clair et le temps presse. Que faites-vous ?'
        },
        a: {
            en: 'Stepping up, setting a direction and getting things moving points to D (red). Waiting for the group to agree first points to S (green); asking who is supposed to lead points to C (blue); energising people to volunteer points to I (yellow).',
            nl: 'Naar voren stappen, een richting bepalen en zaken in gang zetten wijst op D (rood). Eerst wachten tot de groep het eens is wijst op S (groen); vragen wie hoort te leiden op C (blauw); mensen enthousiasmeren om zich aan te bieden op I (geel).',
            fr: 'Prendre les devants, fixer un cap et faire avancer indique D (rouge). Attendre l’accord du groupe indique S (vert) ; demander qui est censé diriger, C (bleu) ; motiver les gens à se porter volontaires, I (jaune).'
        }
    },
    {
        id: 'disc-target', cat: 'disc', roles: ['disc'], level: 'junior', disc: 'D',
        q: {
            en: 'You are given an ambitious target that others call unrealistic. How do you react?',
            nl: 'Je krijgt een ambitieus doel dat anderen onrealistisch noemen. Hoe reageer je?',
            fr: 'On vous fixe un objectif ambitieux que d’autres jugent irréaliste. Comment réagissez-vous ?'
        },
        a: {
            en: 'Taking it on as a challenge and pushing to hit it points to D (red). Wanting to check the numbers and assumptions first points to C (blue); worrying about the pressure on the team points to S (green); getting excited and rallying people points to I (yellow).',
            nl: 'Het als uitdaging aannemen en ervoor gaan wijst op D (rood). Eerst de cijfers en aannames willen checken wijst op C (blauw); bezorgd zijn om de druk op het team op S (groen); enthousiast worden en mensen meekrijgen op I (geel).',
            fr: 'Le relever comme un défi et foncer indique D (rouge). Vouloir d’abord vérifier les chiffres et hypothèses indique C (bleu) ; s’inquiéter de la pression sur l’équipe, S (vert) ; s’enthousiasmer et entraîner les gens, I (jaune).'
        }
    },
    {
        id: 'disc-pushback', cat: 'disc', roles: ['disc'], level: 'medior', disc: 'D',
        q: {
            en: 'Someone senior gives an instruction you think is wrong. What is your first move?',
            nl: 'Iemand hoger in rang geeft een instructie die volgens jou fout is. Wat is je eerste zet?',
            fr: 'Un supérieur donne une consigne que vous jugez erronée. Quel est votre premier réflexe ?'
        },
        a: {
            en: 'Challenging it directly and stating your case points to D (red). Building a fact-based counter-argument first points to C (blue); going along to avoid friction points to S (green); talking to people to test the mood points to I (yellow).',
            nl: 'Het rechtstreeks aanvechten en je standpunt stellen wijst op D (rood). Eerst een feitelijk tegenargument opbouwen wijst op C (blauw); meegaan om wrijving te vermijden op S (groen); met mensen praten om de sfeer te polsen op I (geel).',
            fr: 'La contester directement et défendre votre position indique D (rouge). Bâtir d’abord un contre-argument factuel indique C (bleu) ; suivre pour éviter les frictions, S (vert) ; sonder les gens pour tester l’ambiance, I (jaune).'
        }
    },
    {
        id: 'disc-overloaded', cat: 'disc', roles: ['disc'], level: 'medior', disc: 'D',
        q: {
            en: 'Your plate is overloaded. How do you get back in control?',
            nl: 'Je hebt te veel op je bord. Hoe krijg je opnieuw grip?',
            fr: 'Vous êtes surchargé. Comment reprenez-vous le contrôle ?'
        },
        a: {
            en: 'Cutting or pushing back on the lowest-value work fast and decisively points to D (red). Making a detailed re-plan points to C (blue); asking the manager to help prioritise points to S (green); reaching out to people to share the load points to I (yellow).',
            nl: 'Snel en beslist het minst waardevolle werk schrappen of afwijzen wijst op D (rood). Een gedetailleerde herplanning maken wijst op C (blauw); de manager om hulp bij prioriteren vragen op S (groen); mensen aanspreken om de last te delen op I (geel).',
            fr: 'Couper ou refuser vite et fermement le travail à moindre valeur indique D (rouge). Refaire un plan détaillé indique C (bleu) ; demander au responsable d’aider à prioriser, S (vert) ; solliciter les gens pour partager la charge, I (jaune).'
        }
    },
    {
        id: 'disc-quick-win', cat: 'disc', roles: ['disc'], level: 'junior', disc: 'D',
        q: {
            en: 'You join a project that is drifting. What do you focus on first?',
            nl: 'Je stapt in een project dat op drift is. Waar focus je eerst op?',
            fr: 'Vous rejoignez un projet qui dérive. Sur quoi vous concentrez-vous d’abord ?'
        },
        a: {
            en: 'Driving toward a concrete result and a quick win points to D (red). Mapping the situation in detail first points to C (blue); making sure the team feels settled points to S (green); getting everyone talking and re-energised points to I (yellow).',
            nl: 'Naar een concreet resultaat en een snelle winst duwen wijst op D (rood). Eerst de situatie gedetailleerd in kaart brengen wijst op C (blauw); zorgen dat het team zich op zijn gemak voelt op S (groen); iedereen aan het praten en heropgeladen krijgen op I (geel).',
            fr: 'Pousser vers un résultat concret et une victoire rapide indique D (rouge). Cartographier la situation en détail d’abord indique C (bleu) ; s’assurer que l’équipe se sente stable, S (vert) ; faire parler et remotiver tout le monde, I (jaune).'
        }
    },
    {
        id: 'disc-lead-crisis', cat: 'disc', roles: ['disc'], level: 'senior', disc: 'D',
        q: {
            en: 'A crisis hits and everyone looks unsure. What do you naturally do?',
            nl: 'Er breekt een crisis uit en iedereen twijfelt. Wat doe je van nature?',
            fr: 'Une crise éclate et tout le monde hésite. Que faites-vous naturellement ?'
        },
        a: {
            en: 'Taking charge, making calls and giving clear direction points to D (red). Working the problem methodically with the facts points to C (blue); keeping people calm and reassured points to S (green); rallying and motivating the group points to I (yellow).',
            nl: 'De leiding nemen, knopen doorhakken en duidelijke richting geven wijst op D (rood). Het probleem methodisch met de feiten aanpakken wijst op C (blauw); mensen kalm en gerustgesteld houden op S (groen); de groep mobiliseren en motiveren op I (geel).',
            fr: 'Prendre les commandes, trancher et donner une direction claire indique D (rouge). Traiter le problème méthodiquement avec les faits indique C (bleu) ; garder les gens calmes et rassurés, S (vert) ; mobiliser et motiver le groupe, I (jaune).'
        }
    },
    {
        id: 'disc-measure-success', cat: 'disc', roles: ['disc'], level: 'senior', disc: 'D',
        q: {
            en: 'How do you know a piece of work went well?',
            nl: 'Waaraan merk je dat een stuk werk goed ging?',
            fr: 'À quoi voyez-vous qu’un travail s’est bien passé ?'
        },
        a: {
            en: 'Measuring by results and targets hit points to D (red). Measuring by accuracy and standards met points to C (blue); by whether the team was happy and steady points to S (green); by the energy and recognition around it points to I (yellow).',
            nl: 'Meten aan resultaten en gehaalde doelen wijst op D (rood). Meten aan correctheid en gehaalde normen wijst op C (blauw); aan of het team tevreden en stabiel was op S (groen); aan de energie en erkenning eromheen op I (geel).',
            fr: 'Mesurer aux résultats et aux objectifs atteints indique D (rouge). Mesurer à l’exactitude et aux normes respectées indique C (bleu) ; au fait que l’équipe soit satisfaite et stable, S (vert) ; à l’énergie et à la reconnaissance autour, I (jaune).'
        }
    },
    /* ---- DISC — Influence (I / yellow) --------------------------------------- */
    {
        id: 'disc-present', cat: 'disc', roles: ['disc'], level: 'junior', disc: 'I',
        q: {
            en: 'You have to present an idea to thirty people tomorrow. How do you feel about that?',
            nl: 'Je moet morgen een idee voorstellen aan dertig mensen. Hoe voelt dat?',
            fr: 'Vous devez présenter une idée à trente personnes demain. Comment le vivez-vous ?'
        },
        a: {
            en: 'Energised, improvising, enjoying the audience points to I (yellow). Preparing every slide and rehearsing the detail points to C (blue); doing it because the team needs it, without enjoying it, points to S (green); wanting it short and to the point points to D (red).',
            nl: 'Energie krijgen, improviseren, genieten van het publiek wijst op I (geel). Elke slide voorbereiden en de details repeteren wijst op C (blauw); het doen omdat het team het nodig heeft zonder ervan te genieten op S (groen); het kort en zakelijk willen houden op D (rood).',
            fr: 'Se sentir stimulé, improviser, apprécier le public indique I (jaune). Préparer chaque diapositive et répéter les détails indique C (bleu) ; le faire parce que l’équipe en a besoin sans y prendre plaisir, S (vert) ; vouloir faire court et efficace, D (rouge).'
        }
    },
    {
        id: 'disc-network', cat: 'disc', roles: ['disc'], level: 'junior', disc: 'I',
        q: {
            en: 'How do you get something done in a department you do not know?',
            nl: 'Hoe krijg je iets gedaan in een afdeling die je niet kent?',
            fr: 'Comment faites-vous avancer un sujet dans un service que vous ne connaissez pas ?'
        },
        a: {
            en: 'Walking over, meeting people and building the relationship first points to I (yellow). Going through the official process or ticket points to C (blue); asking their own manager to arrange it points to S (green); going straight to whoever can decide points to D (red).',
            nl: 'Er naartoe stappen, mensen leren kennen en eerst de relatie bouwen wijst op I (geel). Via het officiële proces of ticket gaan wijst op C (blauw); de eigen manager het laten regelen op S (groen); rechtstreeks naar wie kan beslissen stappen op D (rood).',
            fr: 'Aller sur place, rencontrer les gens et construire d’abord la relation indique I (jaune). Passer par le processus officiel ou un ticket indique C (bleu) ; demander à son propre responsable d’arranger cela, S (vert) ; aller directement au décideur, D (rouge).'
        }
    },
    {
        id: 'disc-motivate-others', cat: 'disc', roles: ['disc'], level: 'junior', disc: 'I',
        q: {
            en: 'The team’s mood is flat. What is your instinct?',
            nl: 'De sfeer in het team is vlak. Wat is je instinct?',
            fr: 'L’ambiance de l’équipe est morose. Quel est votre instinct ?'
        },
        a: {
            en: 'Lifting people, bringing energy and getting them talking points to I (yellow). Quietly checking that everyone is okay points to S (green); looking for the concrete cause to fix points to C (blue); pushing for a goal to rally around points to D (red).',
            nl: 'Mensen opbeuren, energie brengen en hen aan het praten krijgen wijst op I (geel). Stil checken of iedereen oké is wijst op S (groen); de concrete oorzaak zoeken om op te lossen op C (blauw); een doel pushen om rond te verzamelen op D (rood).',
            fr: 'Remonter le moral, apporter de l’énergie et faire parler les gens indique I (jaune). Vérifier discrètement que chacun va bien indique S (vert) ; chercher la cause concrète à corriger, C (bleu) ; pousser un objectif fédérateur, D (rouge).'
        }
    },
    {
        id: 'disc-new-people', cat: 'disc', roles: ['disc'], level: 'junior', disc: 'I',
        q: {
            en: 'It is your first day in a new team. How do you spend it?',
            nl: 'Het is je eerste dag in een nieuw team. Hoe vul je die in?',
            fr: 'C’est votre premier jour dans une nouvelle équipe. Comment l’occupez-vous ?'
        },
        a: {
            en: 'Meeting as many people as possible and making connections points to I (yellow). Reading the docs and understanding how things work points to C (blue); quietly settling in and observing points to S (green); asking what results are expected of them points to D (red).',
            nl: 'Zoveel mogelijk mensen ontmoeten en connecties leggen wijst op I (geel). De documentatie lezen en begrijpen hoe alles werkt wijst op C (blauw); rustig landen en observeren op S (groen); vragen welke resultaten van hen verwacht worden op D (rood).',
            fr: 'Rencontrer un maximum de gens et créer des liens indique I (jaune). Lire la documentation et comprendre le fonctionnement indique C (bleu) ; s’installer tranquillement et observer, S (vert) ; demander quels résultats on attend d’eux, D (rouge).'
        }
    },
    {
        id: 'disc-sell-idea', cat: 'disc', roles: ['disc'], level: 'medior', disc: 'I',
        q: {
            en: 'You believe in an idea and need others on board. How do you win them over?',
            nl: 'Je gelooft in een idee en hebt anderen nodig. Hoe krijg je hen mee?',
            fr: 'Vous croyez en une idée et devez rallier les autres. Comment les convainquez-vous ?'
        },
        a: {
            en: 'Selling the vision with enthusiasm and personal conversations points to I (yellow). Building a data-backed case points to C (blue); getting the team’s buy-in gently and gradually points to S (green); pushing the decision through on its merits points to D (red).',
            nl: 'De visie met enthousiasme en persoonlijke gesprekken verkopen wijst op I (geel). Een met data onderbouwd pleidooi opbouwen wijst op C (blauw); de steun van het team zacht en geleidelijk krijgen op S (groen); de beslissing op haar merites doordrukken op D (rood).',
            fr: 'Vendre la vision avec enthousiasme et des échanges personnels indique I (jaune). Bâtir un dossier étayé par des données indique C (bleu) ; obtenir l’adhésion de l’équipe en douceur et progressivement, S (vert) ; imposer la décision sur ses mérites, D (rouge).'
        }
    },
    {
        id: 'disc-recognition', cat: 'disc', roles: ['disc'], level: 'junior', disc: 'I',
        q: {
            en: 'What makes a workday feel really rewarding to you?',
            nl: 'Wat maakt een werkdag voor jou echt de moeite?',
            fr: 'Qu’est-ce qui rend une journée de travail vraiment gratifiante pour vous ?'
        },
        a: {
            en: 'Recognition, buzz and positive interactions point to I (yellow). Hitting a target or winning points to D (red); a job done accurately and correctly points to C (blue); a calm, harmonious day with the team points to S (green).',
            nl: 'Erkenning, dynamiek en positieve interacties wijzen op I (geel). Een doel halen of winnen wijst op D (rood); een taak accuraat en correct afgewerkt op C (blauw); een kalme, harmonieuze dag met het team op S (groen).',
            fr: 'La reconnaissance, l’effervescence et les interactions positives indiquent I (jaune). Atteindre un objectif ou gagner indique D (rouge) ; un travail fait avec exactitude, C (bleu) ; une journée calme et harmonieuse avec l’équipe, S (vert).'
        }
    },
    {
        id: 'disc-brainstorm', cat: 'disc', roles: ['disc'], level: 'junior', disc: 'I',
        q: {
            en: 'A brainstorm is starting on a fresh problem. What role do you take?',
            nl: 'Er start een brainstorm over een nieuw probleem. Welke rol neem je?',
            fr: 'Un brainstorming démarre sur un problème nouveau. Quel rôle prenez-vous ?'
        },
        a: {
            en: 'Throwing out lots of ideas and sparking others points to I (yellow). Organising and evaluating the ideas points to C (blue); making sure everyone gets a turn points to S (green); pushing to pick one and move points to D (red).',
            nl: 'Veel ideeën spuien en anderen inspireren wijst op I (geel). De ideeën ordenen en beoordelen wijst op C (blauw); zorgen dat iedereen aan bod komt op S (groen); duwen om er één te kiezen en door te gaan op D (rood).',
            fr: 'Lancer beaucoup d’idées et stimuler les autres indique I (jaune). Organiser et évaluer les idées indique C (bleu) ; veiller à ce que chacun s’exprime, S (vert) ; pousser à en choisir une et avancer, D (rouge).'
        }
    },
    {
        id: 'disc-conflict-social', cat: 'disc', roles: ['disc'], level: 'medior', disc: 'I',
        q: {
            en: 'Two teammates are tense with each other. How do you get involved?',
            nl: 'Twee teamgenoten zitten gespannen tegenover elkaar. Hoe meng je je erin?',
            fr: 'Deux coéquipiers sont tendus l’un envers l’autre. Comment vous en mêlez-vous ?'
        },
        a: {
            en: 'Talking to each of them warmly and smoothing things over socially points to I (yellow). Quietly keeping the peace and comforting both points to S (green); getting the facts and addressing the root cause points to C (blue); telling them to sort it out and focus on the work points to D (red).',
            nl: 'Met elk van hen warm praten en het sociaal gladstrijken wijst op I (geel). Stil de vrede bewaren en beiden geruststellen wijst op S (groen); de feiten verzamelen en de grondoorzaak aanpakken op C (blauw); hen zeggen het uit te klaren en op het werk te focussen op D (rood).',
            fr: 'Parler chaleureusement à chacun et arrondir les angles socialement indique I (jaune). Préserver la paix en douceur et rassurer les deux indique S (vert) ; réunir les faits et traiter la cause profonde, C (bleu) ; leur dire de régler ça et de se concentrer sur le travail, D (rouge).'
        }
    },
    {
        id: 'disc-variety', cat: 'disc', roles: ['disc'], level: 'senior', disc: 'I',
        q: {
            en: 'Would you rather own one thing deeply or juggle many different things? Why?',
            nl: 'Werk je liever één ding grondig uit of jongleer je met veel verschillende dingen? Waarom?',
            fr: 'Préférez-vous maîtriser une seule chose en profondeur ou jongler entre plusieurs sujets ? Pourquoi ?'
        },
        a: {
            en: 'Wanting variety, people contact and new things points to I (yellow). Wanting to master one thing to a high standard points to C (blue); preferring a stable, familiar scope points to S (green); wanting whatever delivers the biggest result points to D (red).',
            nl: 'Variatie, contact met mensen en nieuwe dingen willen wijst op I (geel). Één ding tot een hoog niveau willen beheersen wijst op C (blauw); een stabiele, vertrouwde scope verkiezen op S (groen); willen wat het grootste resultaat oplevert op D (rood).',
            fr: 'Vouloir de la variété, du contact humain et de la nouveauté indique I (jaune). Vouloir maîtriser une chose à un haut niveau indique C (bleu) ; préférer un périmètre stable et familier, S (vert) ; vouloir ce qui produit le plus grand résultat, D (rouge).'
        }
    },
    /* ---- DISC — Steadiness (S / green) --------------------------------------- */
    {
        id: 'disc-change', cat: 'disc', roles: ['disc'], level: 'junior', disc: 'S',
        q: {
            en: 'Your team’s way of working changes overnight. What is your first reaction?',
            nl: 'De werkwijze van je team verandert van de ene dag op de andere. Wat is je eerste reactie?',
            fr: 'La façon de travailler de votre équipe change du jour au lendemain. Quelle est votre première réaction ?'
        },
        a: {
            en: 'Wanting time, clarity and reassurance for the team before moving points to S (green). Asking for the data and the reasoning points to C (blue); embracing the speed points to D (red); getting enthusiastic about the novelty points to I (yellow).',
            nl: 'Tijd, duidelijkheid en geruststelling voor het team willen vóór er bewogen wordt, wijst op S (groen). Om de data en de redenering vragen wijst op C (blauw); de snelheid omarmen op D (rood); enthousiast worden van het nieuwe op I (geel).',
            fr: 'Vouloir du temps, de la clarté et rassurer l’équipe avant d’avancer indique S (vert). Demander les données et le raisonnement indique C (bleu) ; adopter le rythme rapide, D (rouge) ; s’enthousiasmer pour la nouveauté, I (jaune).'
        }
    },
    {
        id: 'disc-help', cat: 'disc', roles: ['disc'], level: 'junior', disc: 'S',
        q: {
            en: 'A colleague is drowning in work while you are on schedule. What happens?',
            nl: 'Een collega verzuipt in het werk terwijl jij op schema zit. Wat gebeurt er?',
            fr: 'Un collègue croule sous le travail alors que vous êtes dans les temps. Que se passe-t-il ?'
        },
        a: {
            en: 'Quietly stepping in and helping, even at their own cost, points to S (green). Helping but first checking priorities with the manager points to C (blue); pointing out it is a planning problem to be solved points to D (red); rallying others to pitch in points to I (yellow).',
            nl: 'Stilletjes bijspringen en helpen, ook ten koste van zichzelf, wijst op S (groen). Helpen maar eerst de prioriteiten met de manager aftoetsen wijst op C (blauw); erop wijzen dat het een planningsprobleem is dat opgelost moet worden op D (rood); anderen mee mobiliseren op I (geel).',
            fr: 'Aider discrètement, même à ses dépens, indique S (vert). Aider mais vérifier d’abord les priorités avec le responsable indique C (bleu) ; souligner que c’est un problème de planification à résoudre, D (rouge) ; mobiliser les autres pour aider, I (jaune).'
        }
    },
    {
        id: 'disc-stability', cat: 'disc', roles: ['disc'], level: 'junior', disc: 'S',
        q: {
            en: 'What kind of work rhythm suits you best?',
            nl: 'Welk werkritme past het best bij jou?',
            fr: 'Quel rythme de travail vous convient le mieux ?'
        },
        a: {
            en: 'Preferring a steady, predictable rhythm points to S (green). Preferring a fast, high-pressure pace points to D (red); a varied, lively pace points to I (yellow); a rhythm that leaves room for care and precision points to C (blue).',
            nl: 'Een stabiel, voorspelbaar ritme verkiezen wijst op S (groen). Een snel tempo onder hoge druk verkiezen wijst op D (rood); een gevarieerd, levendig tempo op I (geel); een ritme met ruimte voor zorgvuldigheid en precisie op C (blauw).',
            fr: 'Préférer un rythme stable et prévisible indique S (vert). Préférer un rythme rapide et sous pression indique D (rouge) ; un rythme varié et animé, I (jaune) ; un rythme laissant place au soin et à la précision, C (bleu).'
        }
    },
    {
        id: 'disc-loyalty', cat: 'disc', roles: ['disc'], level: 'medior', disc: 'S',
        q: {
            en: 'A better-paid job elsewhere appears, but your team is mid-project. What goes through your mind?',
            nl: 'Er duikt een beter betaalde job elders op, maar je team zit midden in een project. Wat gaat er door je hoofd?',
            fr: 'Un poste mieux payé se présente ailleurs, mais votre équipe est en plein projet. Qu’est-ce qui vous traverse l’esprit ?'
        },
        a: {
            en: 'Feeling a strong pull to see the team through first points to S (green). Weighing it on career results and money points to D (red); analysing the pros and cons carefully points to C (blue); thinking about the new people and opportunities points to I (yellow).',
            nl: 'Een sterke drang voelen om eerst het team af te maken wijst op S (groen). Het afwegen op carrièreresultaten en geld wijst op D (rood); de voor- en nadelen zorgvuldig analyseren op C (blauw); denken aan de nieuwe mensen en kansen op I (geel).',
            fr: 'Ressentir un fort besoin de mener l’équipe au bout d’abord indique S (vert). Peser cela sur les résultats de carrière et l’argent indique D (rouge) ; analyser soigneusement le pour et le contre, C (bleu) ; penser aux nouvelles personnes et opportunités, I (jaune).'
        }
    },
    {
        id: 'disc-support-team', cat: 'disc', roles: ['disc'], level: 'junior', disc: 'S',
        q: {
            en: 'A decision is made that you are lukewarm about but the team supports. What do you do?',
            nl: 'Er valt een beslissing waar jij lauw over bent maar die het team steunt. Wat doe je?',
            fr: 'Une décision est prise qui vous laisse tiède mais que l’équipe soutient. Que faites-vous ?'
        },
        a: {
            en: 'Going along to keep the team united points to S (green). Voicing your objection clearly regardless points to D (red); asking for the reasoning and evidence points to C (blue); talking it over socially to feel the room points to I (yellow).',
            nl: 'Meegaan om het team verenigd te houden wijst op S (groen). Je bezwaar toch duidelijk uiten wijst op D (rood); om de redenering en het bewijs vragen op C (blauw); het sociaal bespreken om de sfeer te voelen op I (geel).',
            fr: 'Suivre pour garder l’équipe unie indique S (vert). Exprimer clairement votre objection malgré tout indique D (rouge) ; demander le raisonnement et les preuves, C (bleu) ; en discuter socialement pour sentir l’ambiance, I (jaune).'
        }
    },
    {
        id: 'disc-harmony', cat: 'disc', roles: ['disc'], level: 'junior', disc: 'S',
        q: {
            en: 'Tension is rising in a meeting. What is your instinct?',
            nl: 'De spanning loopt op in een vergadering. Wat is je instinct?',
            fr: 'La tension monte en réunion. Quel est votre instinct ?'
        },
        a: {
            en: 'Calming things down and restoring harmony points to S (green). Cutting to a decision to end it points to D (red); refocusing on the facts points to C (blue); using humour and warmth to defuse it points to I (yellow).',
            nl: 'De boel kalmeren en de harmonie herstellen wijst op S (groen). Doorhakken naar een beslissing om het te beëindigen wijst op D (rood); terug naar de feiten focussen op C (blauw); humor en warmte gebruiken om te ontladen op I (geel).',
            fr: 'Apaiser et rétablir l’harmonie indique S (vert). Trancher pour en finir indique D (rouge) ; recentrer sur les faits, C (bleu) ; désamorcer par l’humour et la chaleur, I (jaune).'
        }
    },
    {
        id: 'disc-routine', cat: 'disc', roles: ['disc'], level: 'junior', disc: 'S',
        q: {
            en: 'How do you feel about doing the same reliable process day after day?',
            nl: 'Hoe voel je je bij hetzelfde betrouwbare proces dag in dag uit?',
            fr: 'Que ressentez-vous à répéter le même processus fiable jour après jour ?'
        },
        a: {
            en: 'Being comfortable and reassured by a steady routine points to S (green). Getting bored and wanting new challenges points to D (red) or I (yellow); wanting to refine and perfect the process points to C (blue); pushing to make it faster or more efficient points to D (red).',
            nl: 'Je comfortabel en gerustgesteld voelen bij een vaste routine wijst op S (groen). Je vervelen en nieuwe uitdagingen willen wijst op D (rood) of I (geel); het proces willen verfijnen en perfectioneren op C (blauw); duwen om het sneller of efficiënter te maken op D (rood).',
            fr: 'Se sentir à l’aise et rassuré par une routine stable indique S (vert). S’ennuyer et vouloir de nouveaux défis indique D (rouge) ou I (jaune) ; vouloir affiner et perfectionner le processus, C (bleu) ; pousser pour le rendre plus rapide ou efficace, D (rouge).'
        }
    },
    {
        id: 'disc-listen-first', cat: 'disc', roles: ['disc'], level: 'medior', disc: 'S',
        q: {
            en: 'A teammate keeps venting about a problem to you. How do you respond?',
            nl: 'Een teamgenoot blijft bij jou zijn hart luchten over een probleem. Hoe reageer je?',
            fr: 'Un coéquipier n’arrête pas de se confier à vous sur un problème. Comment réagissez-vous ?'
        },
        a: {
            en: 'Listening patiently and offering support points to S (green). Wanting to fix the problem quickly points to D (red); analysing what is actually wrong points to C (blue); cheering them up and lightening the mood points to I (yellow).',
            nl: 'Geduldig luisteren en steun bieden wijst op S (groen). Het probleem snel willen oplossen wijst op D (rood); analyseren wat er echt mis is op C (blauw); hen opvrolijken en de sfeer luchtiger maken op I (geel).',
            fr: 'Écouter patiemment et offrir du soutien indique S (vert). Vouloir régler vite le problème indique D (rouge) ; analyser ce qui ne va vraiment pas, C (bleu) ; leur remonter le moral et alléger l’ambiance, I (jaune).'
        }
    },
    {
        id: 'disc-slow-change', cat: 'disc', roles: ['disc'], level: 'senior', disc: 'S',
        q: {
            en: 'Leadership wants a big reorganisation. What do you focus on?',
            nl: 'Het management wil een grote reorganisatie. Waar focus je op?',
            fr: 'La direction veut une grande réorganisation. Sur quoi vous concentrez-vous ?'
        },
        a: {
            en: 'Protecting the people and easing the transition points to S (green). Pushing to execute it fast points to D (red); mapping the risks and the plan in detail points to C (blue); getting people excited about the new future points to I (yellow).',
            nl: 'De mensen beschermen en de overgang verzachten wijst op S (groen). Duwen om het snel uit te voeren wijst op D (rood); de risico’s en het plan gedetailleerd in kaart brengen op C (blauw); mensen enthousiast maken voor de nieuwe toekomst op I (geel).',
            fr: 'Protéger les personnes et faciliter la transition indique S (vert). Pousser pour exécuter vite indique D (rouge) ; cartographier en détail les risques et le plan, C (bleu) ; enthousiasmer les gens pour l’avenir nouveau, I (jaune).'
        }
    },
    /* ---- DISC — Conscientiousness (C / blue) --------------------------------- */
    {
        id: 'disc-quality', cat: 'disc', roles: ['disc'], level: 'medior', disc: 'C',
        q: {
            en: 'Would you rather deliver on time or deliver flawlessly? Why?',
            nl: 'Lever je liever op tijd of foutloos? Waarom?',
            fr: 'Préférez-vous livrer à temps ou livrer sans défaut ? Pourquoi ?'
        },
        a: {
            en: 'Insisting on correctness, checks and documentation before release points to C (blue). Choosing the deadline and fixing afterwards points to D (red); asking what the team agreed points to S (green); promising both with optimism points to I (yellow).',
            nl: 'Vasthouden aan correctheid, controles en documentatie vóór oplevering wijst op C (blauw). Voor de deadline kiezen en achteraf bijwerken wijst op D (rood); vragen wat het team afsprak op S (groen); optimistisch beide beloven op I (geel).',
            fr: 'Insister sur l’exactitude, les vérifications et la documentation avant livraison indique C (bleu). Choisir l’échéance et corriger après indique D (rouge) ; demander ce que l’équipe a convenu, S (vert) ; promettre les deux avec optimisme, I (jaune).'
        }
    },
    {
        id: 'disc-rules', cat: 'disc', roles: ['disc'], level: 'medior', disc: 'C',
        q: {
            en: 'A procedure slows you down but exists for a reason. How do you deal with it?',
            nl: 'Een procedure vertraagt je maar bestaat niet zonder reden. Hoe ga je ermee om?',
            fr: 'Une procédure vous ralentit mais existe pour une raison. Comment faites-vous ?'
        },
        a: {
            en: 'Following it and proposing a documented improvement through the right channel points to C (blue). Working around it to get the result points to D (red); following it because that is what the team does points to S (green); talking to people until an exception is granted points to I (yellow).',
            nl: 'Ze volgen en via het juiste kanaal een gedocumenteerde verbetering voorstellen wijst op C (blauw). Er omheen werken om het resultaat te halen wijst op D (rood); ze volgen omdat het team dat doet op S (groen); met mensen praten tot er een uitzondering komt op I (geel).',
            fr: 'La suivre et proposer une amélioration documentée par le bon canal indique C (bleu). La contourner pour obtenir le résultat indique D (rouge) ; la suivre parce que l’équipe fait ainsi, S (vert) ; parler aux gens jusqu’à obtenir une dérogation, I (jaune).'
        }
    },
    {
        id: 'disc-detail', cat: 'disc', roles: ['disc'], level: 'junior', disc: 'C',
        q: {
            en: 'You are handed a document full of small errors. What do you do?',
            nl: 'Je krijgt een document vol kleine foutjes. Wat doe je?',
            fr: 'On vous remet un document truffé de petites erreurs. Que faites-vous ?'
        },
        a: {
            en: 'Correcting them carefully because details matter points to C (blue). Fixing only what blocks the result points to D (red); flagging it gently to avoid embarrassing anyone points to S (green); mentioning it lightly and moving on points to I (yellow).',
            nl: 'Ze zorgvuldig verbeteren omdat details tellen wijst op C (blauw). Enkel corrigeren wat het resultaat blokkeert wijst op D (rood); het zacht aankaarten om niemand in verlegenheid te brengen op S (groen); het luchtig vermelden en doorgaan op I (geel).',
            fr: 'Les corriger soigneusement parce que les détails comptent indique C (bleu). Ne corriger que ce qui bloque le résultat indique D (rouge) ; le signaler avec tact pour ne gêner personne, S (vert) ; le mentionner légèrement et passer à autre chose, I (jaune).'
        }
    },
    {
        id: 'disc-plan-first', cat: 'disc', roles: ['disc'], level: 'junior', disc: 'C',
        q: {
            en: 'You are starting a task you have never done before. What is your first step?',
            nl: 'Je begint aan een taak die je nog nooit deed. Wat is je eerste stap?',
            fr: 'Vous commencez une tâche que vous n’avez jamais faite. Quelle est votre première étape ?'
        },
        a: {
            en: 'Researching and planning carefully before starting points to C (blue). Diving in and figuring it out by doing points to D (red); asking a colleague who has done it points to S (green); talking it through with people to get ideas points to I (yellow).',
            nl: 'Grondig uitzoeken en plannen vóór je begint wijst op C (blauw). Er induiken en al doende uitvissen wijst op D (rood); een collega vragen die het al deed op S (groen); het met mensen bespreken om ideeën op te doen op I (geel).',
            fr: 'Se documenter et planifier soigneusement avant de commencer indique C (bleu). Se lancer et apprendre en faisant indique D (rouge) ; demander à un collègue qui l’a déjà fait, S (vert) ; en discuter avec des gens pour recueillir des idées, I (jaune).'
        }
    },
    {
        id: 'disc-standards', cat: 'disc', roles: ['disc'], level: 'medior', disc: 'C',
        q: {
            en: 'The team wants to ship "good enough". You see quality gaps. What do you do?',
            nl: 'Het team wil “goed genoeg” opleveren. Jij ziet kwaliteitsgaten. Wat doe je?',
            fr: 'L’équipe veut livrer un « assez bien ». Vous voyez des lacunes de qualité. Que faites-vous ?'
        },
        a: {
            en: 'Documenting the gaps and pressing for the standard to be met points to C (blue). Deciding fast whether the result is acceptable points to D (red); going with the team to keep harmony points to S (green); talking people round to your view points to I (yellow).',
            nl: 'De gaten documenteren en aandringen dat de norm gehaald wordt wijst op C (blauw). Snel beslissen of het resultaat aanvaardbaar is wijst op D (rood); met het team meegaan om de harmonie te bewaren op S (groen); mensen naar je mening praten op I (geel).',
            fr: 'Documenter les lacunes et insister pour que la norme soit respectée indique C (bleu). Décider vite si le résultat est acceptable indique D (rouge) ; suivre l’équipe pour préserver l’harmonie, S (vert) ; rallier les gens à votre avis, I (jaune).'
        }
    },
    {
        id: 'disc-data-decision', cat: 'disc', roles: ['disc'], level: 'medior', disc: 'C',
        q: {
            en: 'The team wants to pick an option based on a gut feeling. How do you respond?',
            nl: 'Het team wil een optie kiezen op basis van buikgevoel. Hoe reageer je?',
            fr: 'L’équipe veut choisir une option au feeling. Comment réagissez-vous ?'
        },
        a: {
            en: 'Asking for data and evidence before deciding points to C (blue). Trusting a fast decision and adjusting later points to D (red); going with whatever keeps the team comfortable points to S (green); trusting the collective enthusiasm points to I (yellow).',
            nl: 'Om data en bewijs vragen vóór je beslist wijst op C (blauw). Op een snelle beslissing vertrouwen en later bijsturen wijst op D (rood); meegaan met wat het team comfortabel houdt op S (groen); op het collectieve enthousiasme vertrouwen op I (geel).',
            fr: 'Demander des données et des preuves avant de décider indique C (bleu). Se fier à une décision rapide et ajuster ensuite indique D (rouge) ; suivre ce qui met l’équipe à l’aise, S (vert) ; se fier à l’enthousiasme collectif, I (jaune).'
        }
    },
    {
        id: 'disc-process', cat: 'disc', roles: ['disc'], level: 'junior', disc: 'C',
        q: {
            en: 'You spot the same mistake happening again and again. What do you do?',
            nl: 'Je ziet steeds dezelfde fout terugkomen. Wat doe je?',
            fr: 'Vous constatez que la même erreur revient sans cesse. Que faites-vous ?'
        },
        a: {
            en: 'Designing a checklist or process so it cannot recur points to C (blue). Fixing it decisively and moving on points to D (red); quietly correcting it each time to help points to S (green); raising it with the group to get attention points to I (yellow).',
            nl: 'Een checklist of proces ontwerpen zodat het niet meer kan gebeuren wijst op C (blauw). Het beslist oplossen en doorgaan wijst op D (rood); het stil telkens corrigeren om te helpen op S (groen); het bij de groep aankaarten om aandacht te krijgen op I (geel).',
            fr: 'Concevoir une liste de contrôle ou un processus pour que cela ne se reproduise plus indique C (bleu). Le régler résolument et passer à autre chose indique D (rouge) ; le corriger discrètement à chaque fois pour aider, S (vert) ; le soulever auprès du groupe pour attirer l’attention, I (jaune).'
        }
    },
    {
        id: 'disc-accuracy', cat: 'disc', roles: ['disc'], level: 'senior', disc: 'C',
        q: {
            en: 'Under time pressure, where are you unwilling to cut corners?',
            nl: 'Onder tijdsdruk, waar wil je absoluut geen bochten afsnijden?',
            fr: 'Sous pression du temps, où refusez-vous de rogner sur la qualité ?'
        },
        a: {
            en: 'Protecting accuracy, testing and correctness no matter what points to C (blue). Protecting the deadline and the result above all points to D (red); protecting the team’s wellbeing points to S (green); protecting relationships and morale points to I (yellow).',
            nl: 'Nauwkeurigheid, testen en correctheid koste wat kost beschermen wijst op C (blauw). De deadline en het resultaat boven alles beschermen wijst op D (rood); het welzijn van het team beschermen op S (groen); relaties en moraal beschermen op I (geel).',
            fr: 'Protéger l’exactitude, les tests et la justesse coûte que coûte indique C (bleu). Protéger avant tout l’échéance et le résultat indique D (rouge) ; protéger le bien-être de l’équipe, S (vert) ; protéger les relations et le moral, I (jaune).'
        }
    },
    {
        id: 'disc-analyse', cat: 'disc', roles: ['disc'], level: 'junior', disc: 'C',
        q: {
            en: 'Faced with a big, messy problem, what is your natural first move?',
            nl: 'Bij een groot, rommelig probleem, wat is je natuurlijke eerste zet?',
            fr: 'Face à un problème vaste et confus, quel est votre premier réflexe naturel ?'
        },
        a: {
            en: 'Breaking it down and analysing it methodically points to C (blue). Acting on the biggest lever right away points to D (red); checking how it affects the team points to S (green); talking it through with others to explore it points to I (yellow).',
            nl: 'Het opdelen en methodisch analyseren wijst op C (blauw). Meteen op de grootste hefboom handelen wijst op D (rood); nagaan hoe het het team raakt op S (groen); het met anderen bespreken om het te verkennen op I (geel).',
            fr: 'Le décomposer et l’analyser méthodiquement indique C (bleu). Agir tout de suite sur le plus grand levier indique D (rouge) ; vérifier l’impact sur l’équipe, S (vert) ; en discuter avec d’autres pour l’explorer, I (jaune).'
        }
    }
]);
