/* ==========================================================================
   Interview Forge — technical question bank (en / nl / fr).
   Networking, security, firewall, cloud, Microsoft 365, Windows, Linux,
   virtualisation, development, databases, DevOps, troubleshooting, data & AI.
   Same shape as the other files; entries concat onto window.IF_QUESTIONS.
   See README.md.
   ========================================================================== */
window.IF_QUESTIONS = (window.IF_QUESTIONS || []).concat([

    /* ---- Networking (from core) ---------------------------------------- */
    {
        id: 'net-tcp-udp', cat: 'networking', roles: ['networking', 'firewall', 'it-support'], level: 'junior',
        q: {
            en: 'What is the difference between TCP and UDP?',
            nl: 'Wat is het verschil tussen TCP en UDP?',
            fr: 'Quelle est la différence entre TCP et UDP ?'
        },
        a: {
            en: 'TCP is connection-oriented: three-way handshake, numbered segments, retransmission, ordering and flow control — used for HTTP, SMTP, SSH. UDP is connectionless and fire-and-forget: no handshake or retransmission, lower overhead and latency — used for DNS, DHCP, VoIP and video.',
            nl: 'TCP is verbindingsgericht: three-way handshake, genummerde segmenten, hertransmissie, volgorde en flow control — voor HTTP, SMTP, SSH. UDP is verbindingsloos: geen handshake of hertransmissie, minder overhead en latency — voor DNS, DHCP, VoIP en video.',
            fr: 'TCP est orienté connexion : poignée de main en trois temps, segments numérotés, retransmission, ordre et contrôle de flux — pour HTTP, SMTP, SSH. UDP est sans connexion : ni poignée de main ni retransmission, moins de surcharge et de latence — pour DNS, DHCP, VoIP et vidéo.'
        }
    },
    {
        id: 'net-dns-fail', cat: 'networking', roles: ['dns', 'troubleshooting', 'it-support'], level: 'junior',
        q: {
            en: 'What happens if DNS does not reply?',
            nl: 'Wat gebeurt er als DNS niet antwoordt?',
            fr: 'Que se passe-t-il si le DNS ne répond pas ?'
        },
        a: {
            en: 'Names cannot be resolved, so anything using a hostname fails or hangs until the resolver times out and tries the secondary server; IP addresses still work. Expect them to mention the local cache, the hosts file, nslookup/dig against a specific server and the difference between "no answer" (SERVFAIL/timeout) and NXDOMAIN.',
            nl: 'Namen kunnen niet omgezet worden, dus alles met een hostnaam faalt of blijft hangen tot de resolver in timeout gaat en de secundaire server probeert; IP-adressen werken nog. Verwacht: lokale cache, hosts-bestand, nslookup/dig tegen een specifieke server en het verschil tussen geen antwoord (SERVFAIL/timeout) en NXDOMAIN.',
            fr: 'Les noms ne sont plus résolus : tout ce qui utilise un nom d’hôte échoue ou se bloque jusqu’au délai d’expiration, puis le serveur secondaire est tenté ; les adresses IP fonctionnent encore. Attendez-vous à : cache local, fichier hosts, nslookup/dig vers un serveur précis et la différence entre absence de réponse (SERVFAIL/timeout) et NXDOMAIN.'
        }
    },
    {
        id: 'net-no-gateway', cat: 'networking', roles: ['networking', 'troubleshooting'], level: 'junior',
        q: {
            en: 'What happens if a device has no default gateway?',
            nl: 'Wat gebeurt er als een toestel geen default gateway heeft?',
            fr: 'Que se passe-t-il si un appareil n’a pas de passerelle par défaut ?'
        },
        a: {
            en: 'It can still reach hosts inside its own subnet (ARP works locally) but has nowhere to send traffic for any other subnet, so internet and remote VLANs fail. A good answer mentions the routing table, 0.0.0.0/0 and that ping to a local IP succeeds while ping to 8.8.8.8 does not.',
            nl: 'Het bereikt nog toestellen in het eigen subnet (ARP werkt lokaal), maar heeft geen bestemming voor verkeer naar andere subnetten; internet en andere VLAN’s falen. Goed antwoord: routeringstabel, 0.0.0.0/0 en dat ping naar een lokaal IP lukt maar ping naar 8.8.8.8 niet.',
            fr: 'Il joint encore les hôtes de son propre sous-réseau (ARP fonctionne localement) mais n’a aucune destination pour les autres sous-réseaux : Internet et les autres VLAN échouent. Bonne réponse : table de routage, 0.0.0.0/0, et le ping local réussit alors que le ping vers 8.8.8.8 échoue.'
        }
    },
    {
        id: 'net-bgp', cat: 'networking', roles: ['routing', 'networking'], level: 'senior',
        q: {
            en: 'What does BGP stand for and what does it do?',
            nl: 'Waar staat BGP voor en wat doet het?',
            fr: 'Que signifie BGP et à quoi sert-il ?'
        },
        a: {
            en: 'Border Gateway Protocol — the path-vector routing protocol that exchanges reachability between autonomous systems and effectively runs routing on the internet. Strong answers mention AS numbers, eBGP vs iBGP, prefixes and attributes such as AS-path, local preference and MED, and that it is policy-driven rather than shortest-path.',
            nl: 'Border Gateway Protocol — het path-vector routeringsprotocol dat bereikbaarheid uitwisselt tussen autonome systemen en de routering van het internet verzorgt. Sterk antwoord: AS-nummers, eBGP versus iBGP, prefixen en attributen zoals AS-path, local preference en MED, en dat het beleidsgestuurd is in plaats van kortste pad.',
            fr: 'Border Gateway Protocol — le protocole de routage à vecteur de chemin qui échange l’accessibilité entre systèmes autonomes et fait fonctionner le routage d’Internet. Bonne réponse : numéros d’AS, eBGP et iBGP, préfixes et attributs comme AS-path, local preference et MED, et le fait qu’il est piloté par la politique et non par le plus court chemin.'
        }
    },
    {
        id: 'net-dhcp', cat: 'networking', roles: ['dns', 'it-support', 'networking'], level: 'junior',
        q: {
            en: 'What is DHCP and which steps does a client go through?',
            nl: 'Wat is DHCP en welke stappen doorloopt een client?',
            fr: 'Qu’est-ce que le DHCP et quelles étapes suit un client ?'
        },
        a: {
            en: 'Dynamic Host Configuration Protocol hands out IP address, mask, gateway, DNS and options automatically. The client does DORA: Discover (broadcast), Offer, Request, Acknowledge. Bonus: leases and renewal at 50%, reservations, scopes, and DHCP relay / IP helper across subnets.',
            nl: 'Dynamic Host Configuration Protocol deelt automatisch IP-adres, masker, gateway, DNS en opties uit. De client doorloopt DORA: Discover (broadcast), Offer, Request, Acknowledge. Bonus: lease en vernieuwing op 50%, reserveringen, scopes en DHCP-relay / IP helper over subnetten heen.',
            fr: 'Dynamic Host Configuration Protocol distribue automatiquement adresse IP, masque, passerelle, DNS et options. Le client suit DORA : Discover (diffusion), Offer, Request, Acknowledge. Bonus : baux et renouvellement à 50 %, réservations, étendues et relais DHCP / IP helper entre sous-réseaux.'
        }
    },
    {
        id: 'net-vlan', cat: 'networking', roles: ['switching', 'networking'], level: 'medior',
        q: {
            en: 'Explain VLANs, access ports and trunk ports.',
            nl: 'Leg VLAN’s, access-poorten en trunk-poorten uit.',
            fr: 'Expliquez les VLAN, les ports d’accès et les ports trunk.'
        },
        a: {
            en: 'A VLAN is a logically separated broadcast domain on the same physical switch. An access port belongs to one VLAN and sends untagged frames to the endpoint; a trunk carries several VLANs between switches using 802.1Q tags, with one native/untagged VLAN. Routing between VLANs needs a layer-3 device or SVI.',
            nl: 'Een VLAN is een logisch gescheiden broadcastdomein op dezelfde fysieke switch. Een access-poort hoort bij één VLAN en stuurt untagged frames naar het toestel; een trunk draagt meerdere VLAN’s tussen switches met 802.1Q-tags en één native/untagged VLAN. Routeren tussen VLAN’s vraagt een laag 3-toestel of SVI.',
            fr: 'Un VLAN est un domaine de diffusion séparé logiquement sur le même commutateur physique. Un port d’accès appartient à un seul VLAN et envoie des trames non étiquetées ; un trunk transporte plusieurs VLAN entre commutateurs via des étiquettes 802.1Q, avec un VLAN natif non étiqueté. Le routage inter-VLAN exige un équipement de niveau 3 ou une SVI.'
        }
    },
    {
        id: 'net-slow-internet', cat: 'troubleshooting', roles: ['troubleshooting', 'it-support', 'networking'], level: 'junior',
        q: {
            en: 'A user says "the internet is slow". How do you troubleshoot that?',
            nl: 'Een gebruiker zegt “het internet is traag”. Hoe pak je dat aan?',
            fr: 'Un utilisateur dit « Internet est lent ». Comment procédez-vous ?'
        },
        a: {
            en: 'Scope it first: one user or everyone, one application or everything, since when, wired or Wi-Fi. Then work the layers: local speed test, ping and traceroute to see where latency appears, DNS response time, Wi-Fi signal and channel, VPN or proxy in the path, and the firewall/ISP line utilisation. Listen for structured elimination rather than guessing.',
            nl: 'Eerst afbakenen: één gebruiker of iedereen, één applicatie of alles, sinds wanneer, bekabeld of wifi. Daarna laag per laag: lokale speedtest, ping en traceroute om te zien waar de latency ontstaat, DNS-responstijd, wifisignaal en kanaal, VPN of proxy in het pad, en de belasting van firewall of ISP-lijn. Let op gestructureerd elimineren in plaats van gokken.',
            fr: 'D’abord délimiter : un utilisateur ou tous, une application ou tout, depuis quand, filaire ou Wi-Fi. Ensuite couche par couche : test de débit local, ping et traceroute pour localiser la latence, temps de réponse DNS, signal et canal Wi-Fi, VPN ou proxy sur le chemin, charge du pare-feu ou de la ligne opérateur. Écoutez une élimination structurée plutôt que des suppositions.'
        }
    },

    /* ---- Firewall & security --------------------------------------------- */
    {
        id: 'fw-nat-rule', cat: 'firewall', roles: ['firewall', 'networking'], level: 'medior',
        q: {
            en: 'What is a NAT rule, and what is the difference between source NAT and destination NAT?',
            nl: 'Wat is een NAT-regel en wat is het verschil tussen source NAT en destination NAT?',
            fr: 'Qu’est-ce qu’une règle NAT et quelle est la différence entre le NAT source et le NAT destination ?'
        },
        a: {
            en: 'NAT rewrites addresses in the packet header. Source NAT (hide/PAT) rewrites the sender so internal clients share a public IP outbound; destination NAT (port forward) rewrites the destination so an external request reaches an internal server. Good answers add that a matching security policy is still required and that NAT and policy are evaluated separately.',
            nl: 'NAT herschrijft adressen in de pakketheader. Source NAT (hide/PAT) herschrijft de afzender zodat interne clients uitgaand één publiek IP delen; destination NAT (port forward) herschrijft de bestemming zodat een externe aanvraag bij een interne server komt. Goed antwoord: er is nog steeds een security policy nodig, NAT en policy worden apart geëvalueerd.',
            fr: 'Le NAT réécrit les adresses dans l’en-tête du paquet. Le NAT source (hide/PAT) réécrit l’expéditeur pour que les clients internes partagent une IP publique en sortie ; le NAT destination (redirection de port) réécrit la destination pour qu’une requête externe atteigne un serveur interne. Bonne réponse : une règle de sécurité reste nécessaire, NAT et politique sont évalués séparément.'
        }
    },
    {
        id: 'fw-sonicwall-upgrade', cat: 'firewall', roles: ['firewall', 'documentation'], level: 'medior',
        q: {
            en: 'Have you ever updated a SonicWall (or similar firewall)? Walk me through how you plan a firmware upgrade.',
            nl: 'Heb je ooit een SonicWall (of gelijkaardige firewall) geüpdatet? Hoe plan je zo’n firmware-upgrade?',
            fr: 'Avez-vous déjà mis à jour un SonicWall (ou un pare-feu similaire) ? Comment planifiez-vous une mise à niveau du firmware ?'
        },
        a: {
            en: 'Look for: read the release notes and the upgrade path, check hardware/licence compatibility, export the configuration and a settings backup, schedule a maintenance window with a rollback plan and out-of-band access, upgrade the passive unit first in an HA pair, then verify VPN tunnels, rules and logs afterwards. Red flag: upgrading during office hours with no backup.',
            nl: 'Let op: release notes en upgradepad lezen, hardware- en licentiecompatibiliteit nakijken, configuratie en settings-backup exporteren, onderhoudsvenster plannen met rollback en out-of-band toegang, bij HA eerst het passieve toestel, daarna VPN-tunnels, regels en logs verifiëren. Alarmbel: upgraden tijdens de kantooruren zonder backup.',
            fr: 'À écouter : lire les notes de version et le chemin de mise à niveau, vérifier la compatibilité matérielle et de licence, exporter la configuration et une sauvegarde, planifier une fenêtre de maintenance avec plan de retour arrière et accès hors bande, en HA mettre à jour d’abord l’équipement passif, puis vérifier tunnels VPN, règles et journaux. Signal d’alarme : mise à niveau en pleine journée sans sauvegarde.'
        }
    },
    {
        id: 'sec-spf-dkim-dmarc', cat: 'security', roles: ['email-security', 'security-ops', 'm365'], level: 'medior',
        q: {
            en: 'What are SPF, DKIM and DMARC, and what does each one do?',
            nl: 'Wat zijn SPF, DKIM en DMARC en wat doet elk daarvan?',
            fr: 'Que sont SPF, DKIM et DMARC, et à quoi sert chacun ?'
        },
        a: {
            en: 'SPF is a DNS record listing which servers may send for a domain (checks the envelope sender). DKIM signs the message with a private key so the receiver can verify integrity and origin via the public key in DNS. DMARC ties both to the visible From domain through alignment, tells receivers what to do on failure (none/quarantine/reject) and sends reports.',
            nl: 'SPF is een DNS-record met de servers die voor een domein mogen verzenden (controleert de envelope-afzender). DKIM ondertekent het bericht met een private sleutel zodat de ontvanger integriteit en herkomst kan verifiëren via de publieke sleutel in DNS. DMARC koppelt beide via alignment aan het zichtbare From-domein, bepaalt wat er bij falen gebeurt (none/quarantine/reject) en stuurt rapporten.',
            fr: 'SPF est un enregistrement DNS listant les serveurs autorisés à émettre pour un domaine (vérifie l’expéditeur d’enveloppe). DKIM signe le message avec une clé privée afin que le destinataire vérifie l’intégrité et l’origine via la clé publique publiée dans le DNS. DMARC relie les deux au domaine From visible par l’alignement, indique quoi faire en cas d’échec (none/quarantine/reject) et envoie des rapports.'
        }
    },
    {
        id: 'sec-phishing-triage', cat: 'security', roles: ['incident-response', 'security-ops', 'it-support'], level: 'medior',
        q: {
            en: 'A user reports they entered their password on a phishing page. What do you do in the first hour?',
            nl: 'Een gebruiker meldt dat hij zijn wachtwoord op een phishingpagina invulde. Wat doe je het eerste uur?',
            fr: 'Un utilisateur signale avoir saisi son mot de passe sur une page de phishing. Que faites-vous dans la première heure ?'
        },
        a: {
            en: 'Reset the password and revoke active sessions and refresh tokens, check MFA methods and registered devices for attacker additions, hunt for new inbox rules, forwarding and OAuth consents, review sign-in logs for unfamiliar locations, and check whether mail was sent from the account. Then communicate and preserve evidence — do not just reset the password and move on.',
            nl: 'Wachtwoord resetten en actieve sessies en refresh tokens intrekken, MFA-methodes en geregistreerde toestellen nakijken op toevoegingen door de aanvaller, zoeken naar nieuwe inboxregels, doorstuurregels en OAuth-toestemmingen, aanmeldlogs bekijken op onbekende locaties en nagaan of er mail verstuurd is. Daarna communiceren en bewijs bewaren — niet enkel het wachtwoord resetten.',
            fr: 'Réinitialiser le mot de passe et révoquer les sessions et jetons d’actualisation, vérifier les méthodes MFA et les appareils enregistrés, chercher de nouvelles règles de boîte de réception, des transferts et des consentements OAuth, examiner les journaux de connexion à la recherche de localisations inhabituelles et vérifier si des messages ont été envoyés. Ensuite communiquer et préserver les preuves — pas seulement réinitialiser le mot de passe.'
        }
    },
    {
        id: 'sec-pentest-method', cat: 'security', roles: ['pentest', 'security-ops'], level: 'senior',
        q: {
            en: 'How do you structure a penetration test, from scoping to report?',
            nl: 'Hoe structureer je een penetratietest, van scope tot rapport?',
            fr: 'Comment structurez-vous un test d’intrusion, du cadrage au rapport ?'
        },
        a: {
            en: 'Written authorisation and scope with rules of engagement and an emergency contact, then reconnaissance, enumeration, vulnerability analysis, controlled exploitation, privilege escalation and lateral movement, followed by clean-up and a report that ranks findings by business risk with reproduction steps and remediation advice. Mentioning OSSTMM/PTES/OWASP and retesting is a plus.',
            nl: 'Schriftelijke toestemming en scope met rules of engagement en een noodcontact, dan verkenning, enumeratie, kwetsbaarheidsanalyse, gecontroleerde exploitatie, privilege-escalatie en laterale beweging, gevolgd door opkuis en een rapport dat bevindingen rangschikt op bedrijfsrisico met reproductiestappen en remediëringsadvies. OSSTMM/PTES/OWASP en hertest vermelden is een plus.',
            fr: 'Autorisation écrite et périmètre avec règles d’engagement et contact d’urgence, puis reconnaissance, énumération, analyse des vulnérabilités, exploitation contrôlée, élévation de privilèges et déplacement latéral, suivis du nettoyage et d’un rapport classant les constats par risque métier avec étapes de reproduction et remédiation. Citer OSSTMM/PTES/OWASP et le contre-test est un plus.'
        }
    },

    /* ---- Cloud, Microsoft & systems --------------------------------------- */
    {
        id: 'az-rbac-scope', cat: 'cloud', roles: ['azure', 'entra-id', 'cloud-architecture'], level: 'medior',
        q: {
            en: 'How are management groups, subscriptions and resource groups related in Azure, and where do you assign permissions?',
            nl: 'Hoe verhouden management groups, subscriptions en resource groups zich in Azure, en waar ken je rechten toe?',
            fr: 'Comment s’articulent groupes d’administration, abonnements et groupes de ressources dans Azure, et où attribuez-vous les droits ?'
        },
        a: {
            en: 'Management groups contain subscriptions, subscriptions contain resource groups, resource groups contain resources — RBAC and policy inherit downwards. Assign roles to Entra groups at the highest sensible scope, use built-in roles before custom ones, and keep the principle of least privilege with PIM for privileged roles.',
            nl: 'Management groups bevatten subscriptions, subscriptions bevatten resource groups, resource groups bevatten resources — RBAC en policy erven naar beneden. Ken rollen toe aan Entra-groepen op het hoogste zinvolle niveau, gebruik ingebouwde rollen vóór custom rollen en hou least privilege aan met PIM voor privilegerollen.',
            fr: 'Les groupes d’administration contiennent les abonnements, qui contiennent les groupes de ressources, qui contiennent les ressources — RBAC et politiques s’héritent vers le bas. Attribuez les rôles à des groupes Entra au niveau le plus pertinent, préférez les rôles intégrés aux rôles personnalisés et appliquez le moindre privilège avec PIM pour les rôles à privilèges.'
        }
    },
    {
        id: 'az-conditional-access', cat: 'microsoft365', roles: ['entra-id', 'm365', 'security-ops'], level: 'medior',
        q: {
            en: 'What is Conditional Access in Entra ID and give an example policy you have built.',
            nl: 'Wat is Conditional Access in Entra ID en geef een voorbeeld van een policy die je bouwde.',
            fr: 'Qu’est-ce que l’accès conditionnel dans Entra ID et donnez un exemple de stratégie que vous avez créée.'
        },
        a: {
            en: 'Policies of the form "if these users/apps/conditions, then require this control" — MFA, compliant device, hybrid join or block. Good examples: require MFA for admins, block legacy authentication, require a compliant device for Exchange, block sign-ins from unexpected countries. Listen for report-only mode, break-glass accounts excluded from every policy, and testing before enforcement.',
            nl: 'Policies van de vorm “als deze gebruikers/apps/voorwaarden, vereis dan deze controle” — MFA, compliant toestel, hybrid join of blokkeren. Goede voorbeelden: MFA verplicht voor beheerders, legacy authenticatie blokkeren, compliant toestel voor Exchange, aanmeldingen uit onverwachte landen blokkeren. Let op report-only, break-glass accounts die uitgesloten zijn, en testen vóór afdwingen.',
            fr: 'Des stratégies du type « si ces utilisateurs/applications/conditions, alors exiger ce contrôle » — MFA, appareil conforme, jonction hybride ou blocage. Bons exemples : MFA obligatoire pour les administrateurs, blocage de l’authentification héritée, appareil conforme pour Exchange, blocage des connexions depuis des pays inattendus. Écoutez : mode rapport seul, comptes de secours exclus, tests avant application.'
        }
    },
    {
        id: 'virt-hypervisors', cat: 'virtualization', roles: ['virtualization', 'windows-admin'], level: 'medior',
        q: {
            en: 'Which hypervisors have you used, and how would you compare them?',
            nl: 'Welke hypervisors heb je gebruikt en hoe vergelijk je ze?',
            fr: 'Quels hyperviseurs avez-vous utilisés et comment les comparez-vous ?'
        },
        a: {
            en: 'Expect hands-on names — VMware ESXi/vSphere, Hyper-V, Proxmox VE, Nutanix, KVM, XenServer — with an opinion grounded in practice: licensing cost, clustering and live migration, storage (vSAN, CSV, ZFS/Ceph), backup integration and tooling. Follow up on snapshots versus backups and on how they size CPU and memory overcommit.',
            nl: 'Verwacht concrete namen — VMware ESXi/vSphere, Hyper-V, Proxmox VE, Nutanix, KVM, XenServer — met een onderbouwde mening: licentiekost, clustering en live migration, opslag (vSAN, CSV, ZFS/Ceph), backupintegratie en tooling. Vraag door over snapshots versus backups en over CPU- en geheugenovercommit.',
            fr: 'Attendez des noms concrets — VMware ESXi/vSphere, Hyper-V, Proxmox VE, Nutanix, KVM, XenServer — avec un avis fondé sur la pratique : coût des licences, clustering et migration à chaud, stockage (vSAN, CSV, ZFS/Ceph), intégration des sauvegardes et outillage. Relancez sur instantanés contre sauvegardes et sur le surengagement CPU et mémoire.'
        }
    },
    {
        id: 'win-login-fail', cat: 'windows', roles: ['windows-admin', 'it-support', 'troubleshooting'], level: 'junior',
        q: {
            en: 'A user cannot log in this morning. How do you find out why?',
            nl: 'Een gebruiker kan vanochtend niet aanmelden. Hoe zoek je uit waarom?',
            fr: 'Un utilisateur ne parvient pas à se connecter ce matin. Comment trouvez-vous la cause ?'
        },
        a: {
            en: 'Ask what exactly happens and what changed, then check the obvious: caps lock and the right username format, account locked, disabled or password expired, MFA device, correct machine and network, cached credentials versus domain reachability, and the security event log or Entra sign-in log for the actual failure reason. Structured elimination and clear communication matter more than the answer itself.',
            nl: 'Vraag wat er precies gebeurt en wat er veranderde, controleer dan het voor de hand liggende: caps lock en juiste gebruikersnaam, account vergrendeld, uitgeschakeld of wachtwoord verlopen, MFA-toestel, juiste pc en netwerk, cached credentials versus bereikbaarheid van het domein, en het security-eventlog of de Entra-aanmeldlog voor de echte foutreden. Gestructureerd elimineren en duidelijk communiceren tellen zwaarder dan het antwoord zelf.',
            fr: 'Demandez ce qui se passe exactement et ce qui a changé, puis vérifiez l’évidence : verrouillage majuscules et format du nom d’utilisateur, compte verrouillé, désactivé ou mot de passe expiré, appareil MFA, bon poste et bon réseau, identifiants en cache contre accessibilité du domaine, et le journal de sécurité ou le journal de connexion Entra pour le motif réel. L’élimination structurée et la communication comptent plus que la réponse elle-même.'
        }
    },
    {
        id: 'sys-backup-321', cat: 'windows', roles: ['backup', 'windows-admin', 'virtualization'], level: 'medior',
        q: {
            en: 'What is the 3-2-1 backup rule, and why is a snapshot not a backup?',
            nl: 'Wat is de 3-2-1-backupregel en waarom is een snapshot geen backup?',
            fr: 'Qu’est-ce que la règle de sauvegarde 3-2-1 et pourquoi un instantané n’est-il pas une sauvegarde ?'
        },
        a: {
            en: 'Three copies of the data, on two different media, one of them off-site (modern variants add one immutable or offline copy and zero restore errors). A snapshot depends on the original storage and grows a delta chain, so it dies with the datastore or the ransomware; it also degrades performance. Ask when they last performed a restore test.',
            nl: 'Drie kopieën van de data, op twee verschillende media, één daarvan off-site (moderne varianten voegen één immutable of offline kopie en nul hersteldfouten toe). Een snapshot hangt af van dezelfde opslag en bouwt een deltaketen op, dus verdwijnt hij samen met de datastore of de ransomware, en hij kost performantie. Vraag wanneer ze voor het laatst een restoretest deden.',
            fr: 'Trois copies des données, sur deux supports différents, dont une hors site (les variantes modernes ajoutent une copie immuable ou hors ligne et zéro erreur de restauration). Un instantané dépend du même stockage et accumule une chaîne de deltas : il disparaît avec la banque de données ou le rançongiciel, et dégrade les performances. Demandez la date du dernier test de restauration.'
        }
    },
    {
        id: 'dev-rest-api', cat: 'dev', roles: ['dev-backend', 'dev-fullstack'], level: 'medior',
        q: {
            en: 'How do you design a REST API endpoint, and how do you handle errors and versioning?',
            nl: 'Hoe ontwerp je een REST API-endpoint en hoe ga je om met fouten en versionering?',
            fr: 'Comment concevez-vous un point de terminaison d’API REST et comment gérez-vous erreurs et versions ?'
        },
        a: {
            en: 'Resource-based nouns, correct verbs and status codes (200/201/204, 400, 401/403, 404, 409, 422, 500), pagination and filtering on collections, consistent error bodies, idempotency for retries, authentication and rate limiting, and versioning through the path or a header with a deprecation policy. Bonus: OpenAPI documentation and contract tests.',
            nl: 'Resources als zelfstandige naamwoorden, juiste werkwoorden en statuscodes (200/201/204, 400, 401/403, 404, 409, 422, 500), paginering en filtering op collecties, consistente foutstructuur, idempotentie voor retries, authenticatie en rate limiting, en versionering via het pad of een header met een deprecatiebeleid. Bonus: OpenAPI-documentatie en contracttests.',
            fr: 'Des ressources sous forme de noms, les bons verbes et codes de statut (200/201/204, 400, 401/403, 404, 409, 422, 500), pagination et filtrage sur les collections, corps d’erreur cohérents, idempotence pour les reprises, authentification et limitation de débit, et versionnage par le chemin ou un en-tête avec politique d’obsolescence. Bonus : documentation OpenAPI et tests de contrat.'
        }
    },
    {
        id: 'dev-sql-index', cat: 'database', roles: ['databases', 'dev-backend', 'data-analytics'], level: 'medior',
        q: {
            en: 'What does an index do in a database, and when can it hurt?',
            nl: 'Wat doet een index in een databank en wanneer werkt hij averechts?',
            fr: 'À quoi sert un index dans une base de données et quand devient-il nuisible ?'
        },
        a: {
            en: 'An index is an ordered structure (usually a B-tree) that lets the engine find rows without a full scan, at the cost of storage and slower writes because every insert/update maintains it. Too many indexes, indexes on low-selectivity columns or the wrong column order hurt. Look for mentions of execution plans, covering and composite indexes.',
            nl: 'Een index is een geordende structuur (meestal een B-tree) waarmee de engine rijen vindt zonder volledige scan, ten koste van opslag en tragere schrijfacties omdat elke insert/update hem bijwerkt. Te veel indexen, indexen op weinig selectieve kolommen of een verkeerde kolomvolgorde werken averechts. Let op vermelding van uitvoeringsplannen, covering en samengestelde indexen.',
            fr: 'Un index est une structure ordonnée (souvent un arbre B) qui permet de trouver les lignes sans balayage complet, au prix de stockage et d’écritures plus lentes puisque chaque insertion ou mise à jour le maintient. Trop d’index, des index sur des colonnes peu sélectives ou un mauvais ordre de colonnes nuisent. Écoutez : plans d’exécution, index couvrants et composites.'
        }
    },
    {
        id: 'dev-cicd', cat: 'devops', roles: ['devops', 'dev-fullstack', 'scripting'], level: 'medior',
        q: {
            en: 'What does a good CI/CD pipeline look like for you?',
            nl: 'Hoe ziet een goede CI/CD-pipeline er voor jou uit?',
            fr: 'À quoi ressemble pour vous un bon pipeline CI/CD ?'
        },
        a: {
            en: 'Every commit builds, runs automated tests and static analysis, produces one immutable artefact that is promoted through environments, with secrets outside the repository, an approval gate for production and a fast, tested rollback. Look for infrastructure as code, short-lived branches and someone who cares about pipeline run time and flaky tests.',
            nl: 'Elke commit bouwt, draait geautomatiseerde tests en statische analyse en levert één onveranderlijk artefact dat door de omgevingen gepromoveerd wordt, met secrets buiten de repository, een goedkeuringsstap voor productie en een snelle, geteste rollback. Let op infrastructure as code, kortlevende branches en aandacht voor doorlooptijd en flaky tests.',
            fr: 'Chaque commit compile, exécute des tests automatisés et une analyse statique, et produit un artefact immuable promu d’un environnement à l’autre, avec des secrets hors du dépôt, une approbation avant la production et un retour arrière rapide et testé. Écoutez : infrastructure as code, branches de courte durée, attention au temps d’exécution et aux tests instables.'
        }
    },

    /* ---- Networking (added) -------------------------------------------- */
    {
        id: 'net-osi-model', cat: 'networking', roles: ['networking', 'troubleshooting', 'it-support'], level: 'junior',
        q: {
            en: 'What is the OSI model and why is it useful when troubleshooting?',
            nl: 'Wat is het OSI-model en waarom is het nuttig bij troubleshooting?',
            fr: 'Qu’est-ce que le modèle OSI et en quoi est-il utile pour le dépannage ?'
        },
        a: {
            en: 'Seven layers from physical up to application (physical, data link, network, transport, session, presentation, application). It is useful as a mental checklist: work bottom-up — is there link and IP, does routing work, is the port open, is it a TLS or an application problem. Strong answers map real protocols to layers and mention that TCP/IP collapses it into four.',
            nl: 'Zeven lagen van fysiek tot applicatie (physical, data link, network, transport, session, presentation, application). Nuttig als mentale checklist: van onder naar boven werken — is er link en IP, werkt routing, staat de poort open, is het een TLS- of applicatieprobleem. Sterk antwoord: echte protocollen aan lagen koppelen en vermelden dat TCP/IP het tot vier lagen herleidt.',
            fr: 'Sept couches, du physique à l’application (physique, liaison, réseau, transport, session, présentation, application). Utile comme liste de contrôle mentale : travailler de bas en haut — lien et IP présents, routage fonctionnel, port ouvert, problème TLS ou applicatif. Bonne réponse : associer de vrais protocoles aux couches et rappeler que TCP/IP la réduit à quatre.'
        }
    },
    {
        id: 'net-subnetting', cat: 'networking', roles: ['networking', 'routing', 'it-support'], level: 'medior',
        q: {
            en: 'Explain subnetting: what does a /24 versus a /26 give you?',
            nl: 'Leg subnetting uit: wat geeft een /24 versus een /26?',
            fr: 'Expliquez le sous-réseautage : que donne un /24 par rapport à un /26 ?'
        },
        a: {
            en: 'The prefix length says how many bits are network versus host. A /24 is 256 addresses (254 usable); a /26 borrows two more bits for four subnets of 64 addresses (62 usable each). Look for the mask (255.255.255.192 for /26), network and broadcast addresses, and why you subnet — segmentation, broadcast domains and address planning.',
            nl: 'De prefixlengte bepaalt hoeveel bits netwerk versus host zijn. Een /24 is 256 adressen (254 bruikbaar); een /26 leent twee bits extra voor vier subnetten van 64 adressen (elk 62 bruikbaar). Let op het masker (255.255.255.192 voor /26), netwerk- en broadcastadres, en waarom je subnet — segmentatie, broadcastdomeinen en adresplanning.',
            fr: 'La longueur du préfixe indique combien de bits sont réseau ou hôte. Un /24 fait 256 adresses (254 utilisables) ; un /26 emprunte deux bits de plus pour quatre sous-réseaux de 64 adresses (62 utilisables chacun). À écouter : le masque (255.255.255.192 pour /26), adresses de réseau et de diffusion, et le pourquoi — segmentation, domaines de diffusion et plan d’adressage.'
        }
    },
    {
        id: 'net-arp', cat: 'networking', roles: ['networking', 'troubleshooting'], level: 'junior',
        q: {
            en: 'What does ARP do, and what is ARP spoofing?',
            nl: 'Wat doet ARP en wat is ARP-spoofing?',
            fr: 'À quoi sert l’ARP et qu’est-ce que l’usurpation ARP ?'
        },
        a: {
            en: 'ARP maps an IP address to a MAC address inside a subnet: a host broadcasts "who has this IP" and caches the reply. ARP spoofing is when an attacker answers with its own MAC to intercept traffic (man-in-the-middle). Good answers mention the ARP cache, gratuitous ARP, and mitigations such as dynamic ARP inspection and static entries for gateways.',
            nl: 'ARP koppelt een IP-adres aan een MAC-adres binnen een subnet: een host broadcast “wie heeft dit IP” en cachet het antwoord. ARP-spoofing is wanneer een aanvaller met zijn eigen MAC antwoordt om verkeer te onderscheppen (man-in-the-middle). Goed antwoord: ARP-cache, gratuitous ARP en tegenmaatregelen zoals dynamic ARP inspection en statische entries voor gateways.',
            fr: 'L’ARP associe une adresse IP à une adresse MAC dans un sous-réseau : un hôte diffuse « qui a cette IP » et met la réponse en cache. L’usurpation ARP consiste, pour un attaquant, à répondre avec sa propre MAC pour intercepter le trafic (homme du milieu). Bonne réponse : cache ARP, ARP gratuit et parades comme le dynamic ARP inspection et des entrées statiques pour les passerelles.'
        }
    },
    {
        id: 'net-stp', cat: 'networking', roles: ['switching', 'networking'], level: 'medior',
        q: {
            en: 'What problem does Spanning Tree Protocol solve?',
            nl: 'Welk probleem lost Spanning Tree Protocol op?',
            fr: 'Quel problème le protocole Spanning Tree résout-il ?'
        },
        a: {
            en: 'STP prevents layer-2 loops in a redundant switched network by blocking redundant paths, leaving one active path and re-converging if a link fails. Without it a loop causes a broadcast storm that takes the LAN down. Strong answers mention root bridge election, RSTP for faster convergence, and edge features like PortFast and BPDU guard.',
            nl: 'STP voorkomt layer 2-loops in een redundant geswitcht netwerk door redundante paden te blokkeren, één actief pad te houden en te herconvergeren als een link faalt. Zonder STP veroorzaakt een loop een broadcaststorm die het LAN platlegt. Sterk antwoord: root-bridge-verkiezing, RSTP voor snellere convergentie en edge-features zoals PortFast en BPDU guard.',
            fr: 'STP empêche les boucles de niveau 2 dans un réseau commuté redondant en bloquant les chemins redondants, en gardant un chemin actif et en reconvergeant si un lien tombe. Sans lui, une boucle provoque une tempête de diffusion qui paralyse le LAN. Bonne réponse : élection du pont racine, RSTP pour une convergence plus rapide et fonctions de bord comme PortFast et BPDU guard.'
        }
    },
    {
        id: 'net-ospf', cat: 'networking', roles: ['routing', 'networking'], level: 'senior',
        q: {
            en: 'Compare OSPF and static routing, and when you would choose each.',
            nl: 'Vergelijk OSPF en statische routing, en wanneer kies je wat?',
            fr: 'Comparez OSPF et le routage statique, et quand choisir l’un ou l’autre.'
        },
        a: {
            en: 'Static routes are manually configured, predictable and fine for small or stub networks, but they do not react to failures. OSPF is a link-state IGP that discovers neighbours, floods LSAs, builds a topology and recomputes shortest paths automatically, scaling with areas. Look for cost metric, areas and the trade-off between control and automatic reconvergence.',
            nl: 'Statische routes zijn manueel geconfigureerd, voorspelbaar en prima voor kleine of stub-netwerken, maar reageren niet op storingen. OSPF is een link-state IGP dat buren ontdekt, LSA’s verspreidt, een topologie bouwt en kortste paden automatisch herberekent, schaalbaar via areas. Let op cost-metric, areas en de afweging tussen controle en automatische herconvergentie.',
            fr: 'Les routes statiques sont configurées manuellement, prévisibles et adaptées aux petits réseaux ou réseaux terminaux, mais ne réagissent pas aux pannes. OSPF est un IGP à état de liens qui découvre les voisins, diffuse des LSA, construit une topologie et recalcule les plus courts chemins automatiquement, avec une mise à l’échelle par zones. À écouter : métrique de coût, zones et l’arbitrage entre contrôle et reconvergence automatique.'
        }
    },
    {
        id: 'net-qos', cat: 'networking', roles: ['networking', 'switching'], level: 'senior',
        q: {
            en: 'What is QoS and why does voice and video traffic need it?',
            nl: 'Wat is QoS en waarom heeft spraak- en videoverkeer het nodig?',
            fr: 'Qu’est-ce que la QoS et pourquoi la voix et la vidéo en ont-elles besoin ?'
        },
        a: {
            en: 'QoS classifies, marks and queues traffic so latency-sensitive flows get priority over bulk data. Voice and video are real-time: jitter, loss and delay degrade the call, so they are marked (DSCP EF) and put in a priority queue. Strong answers mention classification, marking, queuing/scheduling, policing versus shaping, and that QoS only helps when a link is congested.',
            nl: 'QoS classificeert, markeert en wachtrijt verkeer zodat latency-gevoelige stromen voorrang krijgen op bulkdata. Spraak en video zijn realtime: jitter, verlies en vertraging verslechteren het gesprek, dus worden ze gemarkeerd (DSCP EF) en in een prioriteitswachtrij gezet. Sterk antwoord: classificatie, marking, queuing/scheduling, policing versus shaping, en dat QoS enkel helpt bij congestie op een link.',
            fr: 'La QoS classe, marque et met en file d’attente le trafic pour que les flux sensibles à la latence priment sur les données de masse. La voix et la vidéo sont en temps réel : gigue, pertes et délai dégradent l’appel, on les marque donc (DSCP EF) dans une file prioritaire. Bonne réponse : classification, marquage, mise en file/ordonnancement, police contre lissage, et le fait que la QoS n’aide qu’en cas de congestion.'
        }
    },
    {
        id: 'net-wifi-standards', cat: 'networking', roles: ['wifi', 'networking'], level: 'junior',
        q: {
            en: 'What is the difference between the 2.4 GHz and 5 GHz Wi-Fi bands?',
            nl: 'Wat is het verschil tussen de 2,4 GHz- en 5 GHz-wifibanden?',
            fr: 'Quelle est la différence entre les bandes Wi-Fi 2,4 GHz et 5 GHz ?'
        },
        a: {
            en: '2.4 GHz reaches further and passes through walls better but is crowded, has only three non-overlapping channels and is slower; 5 GHz is faster with far more channels but shorter range. Good answers add channel width, interference sources, band steering, and newer standards (Wi-Fi 6/6E and 6 GHz). Listen for practical placement and channel-planning experience.',
            nl: '2,4 GHz reikt verder en gaat beter door muren maar is druk, heeft slechts drie niet-overlappende kanalen en is trager; 5 GHz is sneller met veel meer kanalen maar kortere reikwijdte. Goed antwoord: kanaalbreedte, interferentiebronnen, band steering en nieuwere standaarden (Wi-Fi 6/6E en 6 GHz). Let op praktische plaatsing en ervaring met kanaalplanning.',
            fr: '2,4 GHz porte plus loin et traverse mieux les murs mais est encombrée, n’a que trois canaux non chevauchants et est plus lente ; 5 GHz est plus rapide avec beaucoup plus de canaux mais une portée réduite. Bonne réponse : largeur de canal, sources d’interférence, band steering et normes récentes (Wi-Fi 6/6E et 6 GHz). À écouter : placement concret et expérience de la planification des canaux.'
        }
    },
    {
        id: 'net-wifi-security', cat: 'networking', roles: ['wifi', 'security-ops'], level: 'medior',
        q: {
            en: 'How do you secure a corporate Wi-Fi network?',
            nl: 'Hoe beveilig je een bedrijfs-wifinetwerk?',
            fr: 'Comment sécurisez-vous un réseau Wi-Fi d’entreprise ?'
        },
        a: {
            en: 'Use WPA2/WPA3-Enterprise with 802.1X and RADIUS so each user authenticates individually instead of a shared PSK, separate SSIDs/VLANs for staff, guest and IoT, and a captive portal for guests. Strong answers add certificate-based auth, rogue-AP detection, disabling WPS, and network access control. Red flag: one WPA2-PSK for everything with the password on a sticker.',
            nl: 'Gebruik WPA2/WPA3-Enterprise met 802.1X en RADIUS zodat elke gebruiker individueel authenticeert in plaats van een gedeelde PSK, aparte SSID’s/VLAN’s voor personeel, gast en IoT, en een captive portal voor gasten. Sterk antwoord: certificaatgebaseerde auth, rogue-AP-detectie, WPS uitschakelen en network access control. Alarmbel: één WPA2-PSK voor alles met het wachtwoord op een sticker.',
            fr: 'Utilisez WPA2/WPA3-Enterprise avec 802.1X et RADIUS pour que chaque utilisateur s’authentifie individuellement plutôt qu’avec une PSK partagée, des SSID/VLAN distincts pour le personnel, les invités et l’IoT, et un portail captif pour les invités. Bonne réponse : authentification par certificat, détection de points d’accès pirates, désactivation du WPS et contrôle d’accès réseau. Signal d’alarme : une seule PSK WPA2 pour tout, mot de passe sur un autocollant.'
        }
    },

    /* ---- Troubleshooting ----------------------------------------------- */
    {
        id: 'ts-method', cat: 'troubleshooting', roles: ['troubleshooting', 'it-support'], level: 'junior',
        q: {
            en: 'Walk me through how you approach a problem you have never seen before.',
            nl: 'Leg uit hoe je een probleem aanpakt dat je nog nooit gezien hebt.',
            fr: 'Expliquez comment vous abordez un problème que vous n’avez jamais rencontré.'
        },
        a: {
            en: 'Look for a method: reproduce and define the symptom, gather facts (what changed, when, who is affected), form a hypothesis, test one change at a time, and document what worked. Strong candidates isolate variables, use logs and search knowledge bases, and know when to escalate. Red flag: random fixes with no observation or reverting nothing.',
            nl: 'Let op een methode: reproduceren en het symptoom afbakenen, feiten verzamelen (wat veranderde, wanneer, wie is getroffen), een hypothese vormen, één wijziging per keer testen en documenteren wat werkte. Sterke kandidaten isoleren variabelen, gebruiken logs en kennisbanken en weten wanneer te escaleren. Alarmbel: lukraak dingen proberen zonder observatie of terugdraaien.',
            fr: 'Cherchez une méthode : reproduire et définir le symptôme, réunir les faits (ce qui a changé, quand, qui est touché), formuler une hypothèse, tester un changement à la fois et documenter ce qui a marché. Les bons candidats isolent les variables, utilisent journaux et bases de connaissances et savent quand escalader. Signal d’alarme : des essais au hasard sans observation ni retour arrière.'
        }
    },
    {
        id: 'ts-printer', cat: 'troubleshooting', roles: ['troubleshooting', 'it-support', 'windows-admin'], level: 'junior',
        q: {
            en: 'A network printer suddenly stops printing for one department. Where do you start?',
            nl: 'Een netwerkprinter print plots niet meer voor één afdeling. Waar begin je?',
            fr: 'Une imprimante réseau ne fonctionne plus pour un seul service. Par où commencez-vous ?'
        },
        a: {
            en: 'Scope it: everyone in that department or one user, one application or all, since when. Check the obvious — printer powered and online, paper/toner, its IP reachable by ping, the print queue stuck, the print server or spooler service, and driver or recent update. Good answers separate "printer down" from "print path down" and mention clearing the queue and restarting the spooler.',
            nl: 'Baken af: heel de afdeling of één gebruiker, één applicatie of alles, sinds wanneer. Controleer het voor de hand liggende — printer aan en online, papier/toner, IP bereikbaar via ping, vastgelopen wachtrij, de printserver of spooler-service, en driver of recente update. Goed antwoord: onderscheid tussen “printer down” en “printpad down”, wachtrij leegmaken en spooler herstarten.',
            fr: 'Délimitez : tout le service ou un seul utilisateur, une application ou toutes, depuis quand. Vérifiez l’évidence — imprimante allumée et en ligne, papier/toner, IP joignable par ping, file d’impression bloquée, serveur d’impression ou service spouleur, pilote ou mise à jour récente. Bonne réponse : distinguer « imprimante en panne » de « chemin d’impression en panne », vider la file et redémarrer le spouleur.'
        }
    },
    {
        id: 'ts-intermittent', cat: 'troubleshooting', roles: ['troubleshooting', 'networking', 'monitoring'], level: 'medior',
        q: {
            en: 'How do you troubleshoot an intermittent problem that you cannot reproduce on demand?',
            nl: 'Hoe pak je een intermittent probleem aan dat je niet op commando kan reproduceren?',
            fr: 'Comment dépannez-vous un problème intermittent que vous ne pouvez pas reproduire à volonté ?'
        },
        a: {
            en: 'Since you cannot force it, you instrument and wait: enable detailed logging, capture packets or metrics continuously, and correlate the failures with a timeline — time of day, load, a scheduled job, a specific host or path. Strong answers mention monitoring/alerting, capturing state at failure time, and looking for patterns rather than chasing a single event.',
            nl: 'Omdat je het niet kan forceren, instrumenteer je en wacht je: gedetailleerde logging aanzetten, continu packets of metrics capteren en de storingen correleren met een tijdlijn — tijdstip, belasting, een geplande taak, een specifieke host of pad. Sterk antwoord: monitoring/alerting, de toestand vastleggen op het moment van falen en patronen zoeken in plaats van één event najagen.',
            fr: 'Puisque vous ne pouvez pas le forcer, vous instrumentez et attendez : activer une journalisation détaillée, capturer en continu paquets ou métriques et corréler les pannes à une chronologie — heure, charge, tâche planifiée, hôte ou chemin précis. Bonne réponse : supervision/alertes, capture de l’état au moment de la panne et recherche de motifs plutôt que la poursuite d’un événement isolé.'
        }
    },
    {
        id: 'ts-bluescreen', cat: 'troubleshooting', roles: ['troubleshooting', 'windows-admin', 'it-support'], level: 'medior',
        q: {
            en: 'A laptop keeps crashing with a blue screen. How do you diagnose it?',
            nl: 'Een laptop crasht steeds met een blue screen. Hoe diagnosticeer je dat?',
            fr: 'Un portable plante sans cesse avec un écran bleu. Comment le diagnostiquez-vous ?'
        },
        a: {
            en: 'Note the stop code and failing module, check Reliability History and the memory dump with WinDbg or BlueScreenView, and ask what changed — a driver, update, or new hardware. Then test hardware: memory (MemTest), disk SMART, temperatures. Good answers separate driver/software causes from failing hardware and mention rolling back the last change first.',
            nl: 'Noteer de stopcode en de falende module, bekijk Betrouwbaarheidsgeschiedenis en de memory dump met WinDbg of BlueScreenView, en vraag wat veranderde — een driver, update of nieuwe hardware. Test daarna hardware: geheugen (MemTest), schijf-SMART, temperaturen. Goed antwoord: onderscheid tussen driver-/softwareoorzaken en falende hardware, en eerst de laatste wijziging terugdraaien.',
            fr: 'Notez le code d’arrêt et le module fautif, consultez l’Historique de fiabilité et le vidage mémoire avec WinDbg ou BlueScreenView, et demandez ce qui a changé — un pilote, une mise à jour ou du matériel neuf. Testez ensuite le matériel : mémoire (MemTest), SMART du disque, températures. Bonne réponse : distinguer causes logicielles/pilote et matériel défaillant, et annuler d’abord le dernier changement.'
        }
    },
    {
        id: 'ts-wifi', cat: 'troubleshooting', roles: ['wifi', 'troubleshooting', 'it-support'], level: 'junior',
        q: {
            en: 'Users complain the Wi-Fi keeps dropping in one part of the building. How do you investigate?',
            nl: 'Gebruikers klagen dat de wifi steeds wegvalt in één deel van het gebouw. Hoe onderzoek je dat?',
            fr: 'Des utilisateurs se plaignent que le Wi-Fi coupe dans une partie du bâtiment. Comment enquêtez-vous ?'
        },
        a: {
            en: 'Scope who and where, then measure: signal strength and SNR at the spot, access-point coverage and channel overlap, interference (microwaves, DECT, neighbouring APs), client count per AP and roaming behaviour. A good answer mentions a site survey or heatmap, moving/adding an AP, and checking whether it is really Wi-Fi or the upstream network.',
            nl: 'Baken af wie en waar, meet dan: signaalsterkte en SNR ter plaatse, dekking van access points en kanaaloverlap, interferentie (microgolf, DECT, naburige AP’s), aantal clients per AP en roaminggedrag. Goed antwoord: een site survey of heatmap, een AP verplaatsen/toevoegen, en nagaan of het echt wifi is of het onderliggende netwerk.',
            fr: 'Délimitez qui et où, puis mesurez : puissance du signal et SNR sur place, couverture des points d’accès et chevauchement des canaux, interférences (micro-ondes, DECT, AP voisins), nombre de clients par AP et comportement d’itinérance. Bonne réponse : une étude de site ou une carte thermique, déplacer/ajouter un AP et vérifier s’il s’agit vraiment du Wi-Fi ou du réseau en amont.'
        }
    },
    {
        id: 'ts-escalation', cat: 'troubleshooting', roles: ['troubleshooting', 'it-support', 'servicedesk-process'], level: 'junior',
        q: {
            en: 'When do you decide to escalate an issue instead of continuing yourself?',
            nl: 'Wanneer beslis je om een probleem te escaleren in plaats van zelf door te gaan?',
            fr: 'Quand décidez-vous d’escalader un problème plutôt que de continuer seul ?'
        },
        a: {
            en: 'When it is outside your access or expertise, when the SLA or business impact demands it, or when you are stuck after a reasonable, documented effort. Good answers escalate with a clear handover — what was tried, current state, logs — rather than dumping the ticket. Listen for balance: not too early (no learning) and not too late (breached SLA).',
            nl: 'Wanneer het buiten je toegang of expertise valt, wanneer de SLA of bedrijfsimpact het vereist, of wanneer je vastzit na een redelijke, gedocumenteerde poging. Goed antwoord: escaleren met een duidelijke overdracht — wat geprobeerd is, huidige toestand, logs — in plaats van het ticket te dumpen. Let op evenwicht: niet te vroeg (geen leren) en niet te laat (SLA overschreden).',
            fr: 'Quand cela dépasse vos accès ou votre expertise, quand le SLA ou l’impact métier l’exige, ou quand vous êtes bloqué après un effort raisonnable et documenté. Bonne réponse : escalader avec une passation claire — ce qui a été tenté, l’état actuel, les journaux — au lieu de se débarrasser du ticket. À écouter : l’équilibre, ni trop tôt (pas d’apprentissage) ni trop tard (SLA dépassé).'
        }
    },

    /* ---- Firewalls & VPN ----------------------------------------------- */
    {
        id: 'fw-stateful', cat: 'firewall', roles: ['firewall', 'networking'], level: 'junior',
        q: {
            en: 'What is the difference between a stateful and a stateless firewall?',
            nl: 'Wat is het verschil tussen een stateful en een stateless firewall?',
            fr: 'Quelle est la différence entre un pare-feu à états et un pare-feu sans état ?'
        },
        a: {
            en: 'A stateless firewall filters each packet against static rules with no memory. A stateful firewall tracks connections in a state table, so return traffic for an allowed session is permitted automatically and out-of-state packets are dropped. Strong answers mention the connection table, that you only need a rule for the initiating direction, and how state helps against spoofed packets.',
            nl: 'Een stateless firewall filtert elk pakket tegen statische regels zonder geheugen. Een stateful firewall houdt verbindingen bij in een state-tabel, zodat retourverkeer voor een toegelaten sessie automatisch mag en out-of-state pakketten gedropt worden. Sterk antwoord: de connectietabel, dat je enkel een regel voor de initiërende richting nodig hebt, en hoe state helpt tegen gespoofte pakketten.',
            fr: 'Un pare-feu sans état filtre chaque paquet selon des règles statiques, sans mémoire. Un pare-feu à états suit les connexions dans une table d’état : le trafic de retour d’une session autorisée passe automatiquement et les paquets hors état sont rejetés. Bonne réponse : la table de connexions, le fait de n’avoir besoin d’une règle que pour le sens initiateur, et l’aide de l’état contre les paquets usurpés.'
        }
    },
    {
        id: 'fw-rule-order', cat: 'firewall', roles: ['firewall', 'security-ops'], level: 'medior',
        q: {
            en: 'Why does firewall rule order matter, and what is an implicit deny?',
            nl: 'Waarom is de volgorde van firewallregels belangrijk en wat is een implicit deny?',
            fr: 'Pourquoi l’ordre des règles de pare-feu compte-t-il et qu’est-ce qu’un refus implicite ?'
        },
        a: {
            en: 'Rules are evaluated top-down and the first match wins, so a broad allow above a specific deny defeats the deny. Most firewalls end with an implicit deny-all, so anything not explicitly allowed is blocked. Strong answers mention least-privilege rules, specific before general, logging denies, and periodic rule cleanup to remove shadowed or unused rules.',
            nl: 'Regels worden van boven naar onder geëvalueerd en de eerste match wint, dus een brede allow boven een specifieke deny maakt die deny nutteloos. De meeste firewalls eindigen met een impliciete deny-all, dus wat niet expliciet toegelaten is, wordt geblokkeerd. Sterk antwoord: least-privilege-regels, specifiek vóór algemeen, denies loggen en regelmatige opkuis van shadowed of ongebruikte regels.',
            fr: 'Les règles sont évaluées de haut en bas et la première correspondance l’emporte : une autorisation large au-dessus d’un refus précis annule ce refus. La plupart des pare-feu se terminent par un refus implicite, donc tout ce qui n’est pas explicitement autorisé est bloqué. Bonne réponse : règles au moindre privilège, du précis au général, journalisation des refus et nettoyage régulier des règles masquées ou inutilisées.'
        }
    },
    {
        id: 'fw-ipsec-vpn', cat: 'firewall', roles: ['vpn', 'firewall', 'networking'], level: 'medior',
        q: {
            en: 'Explain how a site-to-site IPsec VPN works.',
            nl: 'Leg uit hoe een site-to-site IPsec-VPN werkt.',
            fr: 'Expliquez comment fonctionne un VPN IPsec site à site.'
        },
        a: {
            en: 'Two firewalls build an encrypted tunnel: IKE phase 1 authenticates the peers (pre-shared key or certificate) and sets up a secure channel; phase 2 negotiates the IPsec SAs and encryption for the interesting traffic defined by each side. Strong answers mention matching parameters on both ends, ESP versus AH, NAT-traversal, and troubleshooting with phase 1/2 status and logs.',
            nl: 'Twee firewalls bouwen een versleutelde tunnel: IKE fase 1 authenticeert de peers (pre-shared key of certificaat) en zet een beveiligd kanaal op; fase 2 onderhandelt de IPsec-SA’s en versleuteling voor het interessante verkeer dat elke kant definieert. Sterk antwoord: overeenstemmende parameters aan beide zijden, ESP versus AH, NAT-traversal, en troubleshooten met fase 1/2-status en logs.',
            fr: 'Deux pare-feu établissent un tunnel chiffré : la phase 1 d’IKE authentifie les pairs (clé pré-partagée ou certificat) et crée un canal sécurisé ; la phase 2 négocie les SA IPsec et le chiffrement du trafic intéressant défini de chaque côté. Bonne réponse : paramètres identiques des deux côtés, ESP contre AH, traversée NAT et dépannage via l’état des phases 1/2 et les journaux.'
        }
    },
    {
        id: 'fw-ssl-vpn', cat: 'firewall', roles: ['vpn', 'firewall', 'security-ops'], level: 'medior',
        q: {
            en: 'What is the difference between an IPsec client VPN and an SSL/TLS VPN for remote users?',
            nl: 'Wat is het verschil tussen een IPsec-client-VPN en een SSL/TLS-VPN voor thuiswerkers?',
            fr: 'Quelle différence entre un VPN client IPsec et un VPN SSL/TLS pour les télétravailleurs ?'
        },
        a: {
            en: 'Both give remote access, but SSL/TLS VPNs run over port 443 so they traverse restrictive networks easily and can offer clientless portal access, while IPsec needs a client and specific ports/ESP. Strong answers weigh client footprint, granular access, MFA integration, and increasingly ZTNA replacing classic VPN. Red flag: no MFA on remote access.',
            nl: 'Beide geven remote toegang, maar SSL/TLS-VPN’s werken over poort 443 zodat ze restrictieve netwerken makkelijk passeren en clientless portaaltoegang kunnen bieden, terwijl IPsec een client en specifieke poorten/ESP nodig heeft. Sterk antwoord: client-footprint, granulaire toegang, MFA-integratie en dat ZTNA steeds vaker de klassieke VPN vervangt. Alarmbel: geen MFA op remote toegang.',
            fr: 'Les deux offrent un accès distant, mais les VPN SSL/TLS passent par le port 443 et traversent donc facilement les réseaux restrictifs, avec parfois un accès portail sans client, alors qu’IPsec exige un client et des ports/ESP précis. Bonne réponse : empreinte du client, accès granulaire, intégration MFA et le ZTNA remplaçant peu à peu le VPN classique. Signal d’alarme : pas de MFA sur l’accès distant.'
        }
    },
    {
        id: 'fw-split-tunnel', cat: 'firewall', roles: ['vpn', 'firewall'], level: 'senior',
        q: {
            en: 'What is split tunnelling on a VPN, and what are the trade-offs?',
            nl: 'Wat is split tunneling op een VPN en wat zijn de afwegingen?',
            fr: 'Qu’est-ce que le split tunneling sur un VPN et quels sont les compromis ?'
        },
        a: {
            en: 'With split tunnelling only corporate traffic goes through the VPN while internet traffic goes out locally; full tunnelling sends everything through the corporate gateway. Split tunnelling saves bandwidth and latency (important for Teams/M365) but reduces central inspection; full tunnelling gives visibility and control at the cost of performance. Strong answers tie the choice to security posture and cloud usage.',
            nl: 'Bij split tunneling gaat enkel bedrijfsverkeer door de VPN terwijl internetverkeer lokaal uitgaat; bij full tunneling gaat alles via de bedrijfsgateway. Split tunneling bespaart bandbreedte en latency (belangrijk voor Teams/M365) maar vermindert centrale inspectie; full tunneling geeft zicht en controle ten koste van performantie. Sterk antwoord: de keuze koppelen aan security posture en cloudgebruik.',
            fr: 'Avec le split tunneling, seul le trafic d’entreprise passe par le VPN tandis que le trafic Internet sort localement ; le tunneling complet fait tout transiter par la passerelle d’entreprise. Le split économise bande passante et latence (utile pour Teams/M365) mais réduit l’inspection centrale ; le complet offre visibilité et contrôle au prix des performances. Bonne réponse : lier le choix à la posture de sécurité et à l’usage du cloud.'
        }
    },

    /* ---- Security ------------------------------------------------------- */
    {
        id: 'sec-cia-triad', cat: 'security', roles: ['security-ops', 'it-support'], level: 'junior',
        q: {
            en: 'What is the CIA triad in information security?',
            nl: 'Wat is de CIA-triade in informatiebeveiliging?',
            fr: 'Qu’est-ce que la triade CIA en sécurité de l’information ?'
        },
        a: {
            en: 'Confidentiality (only authorised people see the data), Integrity (data is accurate and unaltered) and Availability (it is there when needed). Good answers give a control per pillar — encryption and access control, hashing and change control, redundancy and backups — and note that measures often trade off against each other.',
            nl: 'Confidentiality (enkel bevoegden zien de data), Integrity (data is juist en ongewijzigd) en Availability (het is er wanneer nodig). Goed antwoord: een maatregel per pijler — encryptie en toegangscontrole, hashing en change control, redundantie en backups — en de opmerking dat maatregelen elkaar vaak afwegen.',
            fr: 'Confidentialité (seules les personnes autorisées voient les données), Intégrité (données exactes et non altérées) et Disponibilité (présentes au besoin). Bonne réponse : un contrôle par pilier — chiffrement et contrôle d’accès, hachage et gestion des changements, redondance et sauvegardes — et le fait que les mesures s’arbitrent souvent entre elles.'
        }
    },
    {
        id: 'sec-mfa', cat: 'security', roles: ['security-ops', 'entra-id', 'it-support'], level: 'junior',
        q: {
            en: 'Why is MFA important, and are all factors equally strong?',
            nl: 'Waarom is MFA belangrijk en zijn alle factoren even sterk?',
            fr: 'Pourquoi la MFA est-elle importante et tous les facteurs se valent-ils ?'
        },
        a: {
            en: 'MFA combines factors (something you know, have, are) so a stolen password alone is not enough — it blocks the vast majority of account takeovers. Not all factors are equal: SMS is phishable and SIM-swappable, app push is better but subject to MFA fatigue, and phishing-resistant methods (FIDO2/passkeys, certificate) are strongest. Listen for number matching and awareness of MFA-fatigue attacks.',
            nl: 'MFA combineert factoren (iets dat je weet, hebt, bent) zodat een gestolen wachtwoord alleen niet volstaat — het blokkeert de overgrote meerderheid van accountovernames. Niet alle factoren zijn gelijk: sms is phishbaar en SIM-swapbaar, app-push is beter maar gevoelig voor MFA-moeheid, en phishing-resistente methodes (FIDO2/passkeys, certificaat) zijn het sterkst. Let op number matching en besef van MFA-fatigue-aanvallen.',
            fr: 'La MFA combine des facteurs (ce que l’on sait, possède, est) : un mot de passe volé ne suffit plus et elle bloque la grande majorité des détournements de comptes. Les facteurs ne se valent pas : le SMS est hameçonnable et vulnérable au SIM-swap, la notification est meilleure mais sujette à la fatigue MFA, et les méthodes résistantes à l’hameçonnage (FIDO2/passkeys, certificat) sont les plus fortes. À écouter : le number matching et la conscience des attaques par fatigue MFA.'
        }
    },
    {
        id: 'sec-least-privilege', cat: 'security', roles: ['security-ops', 'windows-admin', 'entra-id'], level: 'medior',
        q: {
            en: 'What is least privilege, and how do you apply it in practice?',
            nl: 'Wat is least privilege en hoe pas je het in de praktijk toe?',
            fr: 'Qu’est-ce que le moindre privilège et comment l’appliquez-vous en pratique ?'
        },
        a: {
            en: 'Give each user, service and process only the access it needs, for only as long as it needs it. In practice: role-based groups instead of direct grants, separate admin accounts, no daily use of Domain Admin, just-in-time elevation (PIM), and regular access reviews. Strong answers mention service accounts, tiering, and removing standing access rather than only adding it.',
            nl: 'Geef elke gebruiker, service en proces enkel de toegang die nodig is, en enkel zolang als nodig. In de praktijk: rolgebaseerde groepen in plaats van directe toekenningen, aparte adminaccounts, geen dagelijks gebruik van Domain Admin, just-in-time-elevatie (PIM) en regelmatige access reviews. Sterk antwoord: serviceaccounts, tiering, en staande toegang verwijderen in plaats van enkel toevoegen.',
            fr: 'Donner à chaque utilisateur, service et processus uniquement l’accès nécessaire, et seulement le temps nécessaire. En pratique : groupes par rôle plutôt qu’attributions directes, comptes d’administration séparés, pas d’usage quotidien de Domain Admin, élévation juste-à-temps (PIM) et revues d’accès régulières. Bonne réponse : comptes de service, tiering, et suppression des accès permanents plutôt que simple ajout.'
        }
    },
    {
        id: 'sec-ransomware-response', cat: 'security', roles: ['incident-response', 'security-ops', 'backup'], level: 'senior',
        q: {
            en: 'A server is being encrypted by ransomware right now. What are your first actions?',
            nl: 'Een server wordt op dit moment door ransomware versleuteld. Wat zijn je eerste acties?',
            fr: 'Un serveur est en train d’être chiffré par un rançongiciel. Quelles sont vos premières actions ?'
        },
        a: {
            en: 'Contain first: isolate the host from the network (not power-off, to keep memory evidence if possible), disable affected accounts and block lateral movement, then identify scope and patient zero. In parallel: preserve evidence, check backup integrity and immutability before restoring, and follow the incident plan including legal/insurance and, in the EU, GDPR breach notification. Red flag: paying or wiping before understanding scope.',
            nl: 'Eerst indammen: de host isoleren van het netwerk (niet uitschakelen, om geheugensporen te bewaren indien mogelijk), getroffen accounts uitschakelen en laterale beweging blokkeren, dan de omvang en patient zero bepalen. Parallel: bewijs bewaren, backupintegriteit en immutability nakijken vóór herstel, en het incidentplan volgen inclusief juridisch/verzekering en, in de EU, GDPR-meldplicht. Alarmbel: betalen of wissen vóór je de omvang kent.',
            fr: 'D’abord contenir : isoler l’hôte du réseau (sans l’éteindre, pour préserver la mémoire si possible), désactiver les comptes touchés et bloquer les déplacements latéraux, puis déterminer l’étendue et le patient zéro. En parallèle : préserver les preuves, vérifier l’intégrité et l’immuabilité des sauvegardes avant restauration, et suivre le plan d’incident, juridique/assurance et, dans l’UE, la notification RGPD. Signal d’alarme : payer ou effacer avant de connaître l’étendue.'
        }
    },
    {
        id: 'sec-siem-soc', cat: 'security', roles: ['monitoring', 'security-ops'], level: 'medior',
        q: {
            en: 'What is a SIEM and what does a SOC use it for?',
            nl: 'Wat is een SIEM en waarvoor gebruikt een SOC het?',
            fr: 'Qu’est-ce qu’un SIEM et à quoi un SOC l’utilise-t-il ?'
        },
        a: {
            en: 'A SIEM collects and normalises logs from across the estate, correlates events into alerts and supports search, dashboards and retention. A SOC uses it to detect, triage and investigate incidents, often with SOAR for automated response and threat intel for context. Strong answers mention use cases/detection rules, tuning to reduce false positives, and the difference between SIEM, EDR and XDR.',
            nl: 'Een SIEM verzamelt en normaliseert logs uit heel de omgeving, correleert events tot alerts en biedt zoeken, dashboards en retentie. Een SOC gebruikt het om incidenten te detecteren, triageren en onderzoeken, vaak met SOAR voor geautomatiseerde response en threat intel voor context. Sterk antwoord: use cases/detectieregels, tunen om false positives te verminderen, en het verschil tussen SIEM, EDR en XDR.',
            fr: 'Un SIEM collecte et normalise les journaux de tout le parc, corrèle les événements en alertes et offre recherche, tableaux de bord et rétention. Un SOC l’utilise pour détecter, trier et investiguer les incidents, souvent avec du SOAR pour la réponse automatisée et de la threat intel pour le contexte. Bonne réponse : cas d’usage/règles de détection, réglage pour réduire les faux positifs, et la différence entre SIEM, EDR et XDR.'
        }
    },
    {
        id: 'sec-vuln-mgmt', cat: 'security', roles: ['security-ops', 'pentest'], level: 'medior',
        q: {
            en: 'How do you run a vulnerability management process, and how is it different from a pentest?',
            nl: 'Hoe voer je een vulnerability-managementproces uit, en hoe verschilt het van een pentest?',
            fr: 'Comment menez-vous un processus de gestion des vulnérabilités, et en quoi diffère-t-il d’un pentest ?'
        },
        a: {
            en: 'Vulnerability management is a continuous cycle: discover assets, scan regularly, prioritise by risk (CVSS plus exploitability and exposure), remediate or mitigate, and verify. A pentest is a point-in-time, goal-driven manual assessment that chains weaknesses to prove real impact. Strong answers mention asset inventory, patch SLAs by severity, and not treating a scan report as a to-do list without context.',
            nl: 'Vulnerability management is een continue cyclus: assets ontdekken, regelmatig scannen, prioriteren op risico (CVSS plus exploiteerbaarheid en blootstelling), remediëren of mitigeren, en verifiëren. Een pentest is een momentopname, doelgerichte manuele beoordeling die zwakheden aan elkaar rijgt om echte impact te bewijzen. Sterk antwoord: asset-inventaris, patch-SLA’s per severity, en een scanrapport niet zonder context als takenlijst behandelen.',
            fr: 'La gestion des vulnérabilités est un cycle continu : inventorier les actifs, scanner régulièrement, prioriser par risque (CVSS plus exploitabilité et exposition), corriger ou atténuer, puis vérifier. Un pentest est une évaluation manuelle ponctuelle et orientée objectif qui enchaîne les faiblesses pour prouver un impact réel. Bonne réponse : inventaire des actifs, SLA de correctif par gravité, et ne pas traiter un rapport de scan comme une liste de tâches sans contexte.'
        }
    },
    {
        id: 'sec-zero-trust', cat: 'security', roles: ['security-ops', 'cloud-architecture', 'entra-id'], level: 'senior',
        q: {
            en: 'What does "zero trust" mean, and how does it differ from the classic perimeter model?',
            nl: 'Wat betekent “zero trust” en hoe verschilt het van het klassieke perimetermodel?',
            fr: 'Que signifie le « zero trust » et en quoi diffère-t-il du modèle de périmètre classique ?'
        },
        a: {
            en: 'The old model trusts anything inside the network; zero trust assumes breach and never trusts by location: every request is authenticated, authorised and continuously verified on identity, device health and context, with least privilege and micro-segmentation. Strong answers mention identity as the new perimeter, conditional access, device compliance and that it is a strategy, not one product.',
            nl: 'Het oude model vertrouwt alles binnen het netwerk; zero trust gaat uit van een breach en vertrouwt nooit op locatie: elke aanvraag wordt geauthenticeerd, geautoriseerd en continu geverifieerd op identiteit, toestelgezondheid en context, met least privilege en microsegmentatie. Sterk antwoord: identiteit als de nieuwe perimeter, conditional access, device compliance en dat het een strategie is, geen product.',
            fr: 'L’ancien modèle fait confiance à tout ce qui est dans le réseau ; le zero trust présume la compromission et ne se fie jamais à l’emplacement : chaque requête est authentifiée, autorisée et vérifiée en continu sur l’identité, l’état de l’appareil et le contexte, avec moindre privilège et micro-segmentation. Bonne réponse : l’identité comme nouveau périmètre, l’accès conditionnel, la conformité des appareils et le fait que c’est une stratégie, pas un produit.'
        }
    },
    {
        id: 'sec-owasp-top10', cat: 'security', roles: ['pentest', 'dev-backend', 'security-ops'], level: 'medior',
        q: {
            en: 'Name a few OWASP Top 10 risks and how you would prevent one of them.',
            nl: 'Noem enkele OWASP Top 10-risico’s en hoe je er één van voorkomt.',
            fr: 'Citez quelques risques de l’OWASP Top 10 et comment prévenir l’un d’eux.'
        },
        a: {
            en: 'Expect examples like broken access control, injection, cryptographic failures, SSRF or security misconfiguration. For injection, the answer should be parameterised queries/prepared statements and input validation, not string concatenation. Strong candidates tie prevention to defence in depth — validation, least privilege, encoding output — rather than a single fix, and mention testing for it.',
            nl: 'Verwacht voorbeelden zoals broken access control, injection, cryptografische fouten, SSRF of security misconfiguration. Voor injection is het antwoord parameterized queries/prepared statements en inputvalidatie, geen stringconcatenatie. Sterke kandidaten koppelen preventie aan defence in depth — validatie, least privilege, output encoderen — in plaats van één fix, en vermelden dat je erop test.',
            fr: 'Attendez des exemples comme le contrôle d’accès défaillant, l’injection, les défaillances cryptographiques, le SSRF ou la mauvaise configuration. Pour l’injection, la réponse est requêtes paramétrées/prepared statements et validation des entrées, pas la concaténation de chaînes. Les bons candidats relient la prévention à la défense en profondeur — validation, moindre privilège, encodage de sortie — plutôt qu’à un correctif unique, et évoquent les tests.'
        }
    },
    {
        id: 'sec-incident-lifecycle', cat: 'security', roles: ['incident-response', 'security-ops', 'monitoring'], level: 'medior',
        q: {
            en: 'Describe the phases of incident response.',
            nl: 'Beschrijf de fasen van incident response.',
            fr: 'Décrivez les phases de la réponse à incident.'
        },
        a: {
            en: 'Preparation, detection and analysis, containment, eradication, recovery, and lessons learned (NIST) — or the SANS variant. Strong answers stress that preparation and the post-incident review matter as much as the firefighting, mention short-term versus long-term containment, evidence preservation and clear roles/communication. Red flag: jumping straight to "wipe and reinstall".',
            nl: 'Voorbereiding, detectie en analyse, indamming, uitroeiing, herstel en lessons learned (NIST) — of de SANS-variant. Sterk antwoord: benadrukken dat voorbereiding en de post-incidentreview even belangrijk zijn als het blussen, met korte- versus langetermijnindamming, bewijsbewaring en duidelijke rollen/communicatie. Alarmbel: meteen naar “wissen en herinstalleren” springen.',
            fr: 'Préparation, détection et analyse, confinement, éradication, rétablissement et retour d’expérience (NIST) — ou la variante SANS. Bonne réponse : souligner que la préparation et la revue post-incident comptent autant que l’action, avec confinement court/long terme, préservation des preuves et rôles/communication clairs. Signal d’alarme : passer directement au « formater et réinstaller ».'
        }
    },

    /* ---- Cloud & Azure -------------------------------------------------- */
    {
        id: 'cloud-iaas-paas-saas', cat: 'cloud', roles: ['cloud-architecture', 'azure'], level: 'junior',
        q: {
            en: 'Explain the difference between IaaS, PaaS and SaaS with an example of each.',
            nl: 'Leg het verschil uit tussen IaaS, PaaS en SaaS met een voorbeeld van elk.',
            fr: 'Expliquez la différence entre IaaS, PaaS et SaaS avec un exemple de chacun.'
        },
        a: {
            en: 'It is about who manages what. IaaS gives you virtual infrastructure and you manage the OS upward (Azure VM); PaaS gives you a managed platform to deploy code without patching servers (App Service, Azure SQL); SaaS is a ready application you just consume (Microsoft 365). Strong answers frame it as a shared-responsibility spectrum and pick the model per workload.',
            nl: 'Het draait om wie wat beheert. IaaS geeft je virtuele infrastructuur en jij beheert vanaf het OS (Azure VM); PaaS geeft je een beheerd platform om code te deployen zonder servers te patchen (App Service, Azure SQL); SaaS is een kant-en-klare applicatie die je gewoon gebruikt (Microsoft 365). Sterk antwoord: het als een shared-responsibility-spectrum kaderen en per workload kiezen.',
            fr: 'Tout est question de qui gère quoi. L’IaaS fournit une infrastructure virtuelle et vous gérez à partir de l’OS (VM Azure) ; le PaaS offre une plateforme gérée pour déployer du code sans patcher de serveurs (App Service, Azure SQL) ; le SaaS est une application prête à l’emploi que l’on consomme (Microsoft 365). Bonne réponse : présenter cela comme un spectre de responsabilité partagée et choisir par charge de travail.'
        }
    },
    {
        id: 'cloud-shared-responsibility', cat: 'cloud', roles: ['cloud-architecture', 'security-ops', 'azure'], level: 'junior',
        q: {
            en: 'What is the shared responsibility model in the cloud?',
            nl: 'Wat is het shared-responsibility-model in de cloud?',
            fr: 'Qu’est-ce que le modèle de responsabilité partagée dans le cloud ?'
        },
        a: {
            en: 'The provider secures the cloud (physical, hypervisor, managed services); the customer secures what they put in it (data, identities, access, configuration, and OS/app for IaaS). The line moves with the service model. Strong answers stress that data classification, identity and configuration always stay the customer’s job — most cloud breaches are customer misconfiguration, not provider failure.',
            nl: 'De provider beveiligt de cloud (fysiek, hypervisor, beheerde diensten); de klant beveiligt wat hij erin zet (data, identiteiten, toegang, configuratie, en OS/app bij IaaS). De grens verschuift met het servicemodel. Sterk antwoord: dataclassificatie, identiteit en configuratie blijven altijd de taak van de klant — de meeste cloudbreaches zijn misconfiguratie bij de klant, geen falen van de provider.',
            fr: 'Le fournisseur sécurise le cloud (physique, hyperviseur, services gérés) ; le client sécurise ce qu’il y place (données, identités, accès, configuration, et OS/appli en IaaS). La frontière bouge selon le modèle de service. Bonne réponse : classification des données, identité et configuration restent toujours à la charge du client — la plupart des incidents cloud sont des erreurs de configuration client, pas des défaillances du fournisseur.'
        }
    },
    {
        id: 'cloud-regions-az', cat: 'cloud', roles: ['cloud-architecture', 'azure'], level: 'medior',
        q: {
            en: 'What are regions and availability zones, and how do they affect high availability?',
            nl: 'Wat zijn regions en availability zones, en hoe beïnvloeden ze hoge beschikbaarheid?',
            fr: 'Que sont les régions et les zones de disponibilité, et comment influencent-elles la haute disponibilité ?'
        },
        a: {
            en: 'A region is a geographic location; availability zones are physically separate datacentres within a region with independent power, cooling and network. Spreading instances across zones survives a datacentre failure; using multiple regions handles a regional outage and data residency. Strong answers connect this to SLAs, replication choices, latency and cost, and to disaster recovery design.',
            nl: 'Een region is een geografische locatie; availability zones zijn fysiek gescheiden datacenters binnen een region met onafhankelijke stroom, koeling en netwerk. Instances over zones spreiden overleeft een datacenterstoring; meerdere regions dekken een regionale uitval en dataresidentie. Sterk antwoord: dit koppelen aan SLA’s, replicatiekeuzes, latency en kost, en aan disaster-recoveryontwerp.',
            fr: 'Une région est un emplacement géographique ; les zones de disponibilité sont des centres de données physiquement séparés au sein d’une région, avec alimentation, refroidissement et réseau indépendants. Répartir les instances entre zones résiste à la panne d’un centre ; plusieurs régions gèrent une panne régionale et la résidence des données. Bonne réponse : lier cela aux SLA, aux choix de réplication, à la latence, au coût et à la conception de reprise après sinistre.'
        }
    },
    {
        id: 'cloud-well-architected', cat: 'cloud', roles: ['cloud-architecture', 'azure'], level: 'senior',
        q: {
            en: 'What pillars would you consider when reviewing a cloud architecture?',
            nl: 'Welke pijlers hou je in gedachten bij het reviewen van een cloudarchitectuur?',
            fr: 'Quels piliers considérez-vous lors de la revue d’une architecture cloud ?'
        },
        a: {
            en: 'The well-architected pillars: reliability, security, cost optimisation, operational excellence and performance efficiency (Azure adds them explicitly; AWS mirrors them plus sustainability). Strong answers use them as a trade-off framework — you cannot maximise all at once — and give concrete levers per pillar: autoscaling, least privilege, right-sizing/reservations, IaC and observability.',
            nl: 'De well-architected-pijlers: betrouwbaarheid, security, kostoptimalisatie, operationele excellentie en performantie-efficiëntie (Azure benoemt ze expliciet; AWS spiegelt ze plus duurzaamheid). Sterk antwoord: ze als afwegingskader gebruiken — je kan niet alles tegelijk maximaliseren — met concrete hefbomen per pijler: autoscaling, least privilege, right-sizing/reservations, IaC en observability.',
            fr: 'Les piliers du « well-architected » : fiabilité, sécurité, optimisation des coûts, excellence opérationnelle et efficacité des performances (Azure les nomme explicitement ; AWS les reprend plus la durabilité). Bonne réponse : les utiliser comme cadre d’arbitrage — on ne peut tout maximiser à la fois — avec des leviers concrets par pilier : autoscaling, moindre privilège, redimensionnement/réservations, IaC et observabilité.'
        }
    },
    {
        id: 'cloud-cost-optimization', cat: 'cloud', roles: ['cloud-architecture', 'azure'], level: 'medior',
        q: {
            en: 'A cloud bill is growing every month. How do you get it under control?',
            nl: 'Een cloudfactuur groeit elke maand. Hoe krijg je ze onder controle?',
            fr: 'Une facture cloud grimpe chaque mois. Comment la maîtrisez-vous ?'
        },
        a: {
            en: 'First get visibility with cost tools and tagging to see what and who is spending, then right-size over-provisioned resources, shut down idle/dev resources off-hours, use reservations or savings plans for steady workloads and spot for interruptible ones, and review storage tiers and egress. Strong answers add budgets/alerts, a FinOps ownership model and architectural changes (serverless, autoscaling).',
            nl: 'Eerst zicht krijgen met kosttools en tagging om te zien wat en wie uitgeeft, dan overprovisioned resources right-sizen, idle/dev-resources buiten de uren afsluiten, reservations of savings plans gebruiken voor stabiele workloads en spot voor onderbreekbare, en opslagtiers en egress nakijken. Sterk antwoord: budgetten/alerts, een FinOps-eigenaarschapsmodel en architecturale wijzigingen (serverless, autoscaling).',
            fr: 'D’abord obtenir de la visibilité avec des outils de coûts et l’étiquetage pour voir quoi et qui dépense, puis redimensionner les ressources surprovisionnées, arrêter les ressources inactives/dev hors heures, utiliser réservations ou savings plans pour les charges stables et le spot pour l’interruptible, et revoir les niveaux de stockage et l’egress. Bonne réponse : budgets/alertes, un modèle de responsabilité FinOps et des changements d’architecture (serverless, autoscaling).'
        }
    },
    {
        id: 'cloud-storage-tiers', cat: 'cloud', roles: ['azure', 'cloud-architecture'], level: 'medior',
        q: {
            en: 'Explain object storage tiers (hot, cool, archive) and when to use each.',
            nl: 'Leg object-storagetiers (hot, cool, archive) uit en wanneer je elk gebruikt.',
            fr: 'Expliquez les niveaux de stockage objet (hot, cool, archive) et quand utiliser chacun.'
        },
        a: {
            en: 'Tiers trade storage price against access cost and latency. Hot is for frequently accessed data (highest storage price, cheap access); cool for infrequently accessed data kept a while; archive is cheapest to store but data must be rehydrated with hours of latency and higher retrieval cost. Strong answers mention lifecycle policies to move data automatically and minimum retention periods.',
            nl: 'Tiers wegen opslagprijs af tegen toegangskost en latency. Hot is voor vaak benaderde data (hoogste opslagprijs, goedkope toegang); cool voor zelden benaderde data die je een tijd bewaart; archive is het goedkoopst om op te slaan maar data moet gerehydrateerd worden met uren latency en hogere ophaalkost. Sterk antwoord: lifecycle-policies om data automatisch te verplaatsen en minimale retentieperiodes.',
            fr: 'Les niveaux arbitrent prix de stockage contre coût d’accès et latence. Hot pour les données fréquemment consultées (stockage le plus cher, accès bon marché) ; cool pour des données peu consultées gardées un temps ; archive est le moins cher à stocker mais les données doivent être réhydratées avec des heures de latence et un coût de récupération plus élevé. Bonne réponse : politiques de cycle de vie pour déplacer automatiquement les données et périodes de rétention minimales.'
        }
    },
    {
        id: 'cloud-vnet-peering', cat: 'cloud', roles: ['azure', 'networking', 'cloud-architecture'], level: 'medior',
        q: {
            en: 'How do you connect virtual networks in Azure, and how do you segment them securely?',
            nl: 'Hoe verbind je virtuele netwerken in Azure en hoe segmenteer je ze veilig?',
            fr: 'Comment relier des réseaux virtuels dans Azure et comment les segmenter de façon sécurisée ?'
        },
        a: {
            en: 'VNet peering connects VNets privately over the Microsoft backbone (non-transitive, so a hub-and-spoke topology with a firewall in the hub is common). Segment with subnets, network security groups, application security groups and route tables forcing traffic through the firewall. Strong answers mention private endpoints, hub-spoke, and avoiding overlapping address spaces.',
            nl: 'VNet peering verbindt VNets privé over de Microsoft-backbone (niet-transitief, dus een hub-and-spoke-topologie met een firewall in de hub is gebruikelijk). Segmenteer met subnetten, network security groups, application security groups en route tables die verkeer door de firewall dwingen. Sterk antwoord: private endpoints, hub-spoke, en overlappende adresruimtes vermijden.',
            fr: 'Le peering de VNet relie les VNet en privé via le backbone Microsoft (non transitif, d’où une topologie hub-and-spoke avec un pare-feu dans le hub). Segmentez avec des sous-réseaux, des network security groups, des application security groups et des tables de routage forçant le trafic par le pare-feu. Bonne réponse : points de terminaison privés, hub-spoke et éviter les espaces d’adressage qui se chevauchent.'
        }
    },
    {
        id: 'cloud-landing-zone', cat: 'cloud', roles: ['cloud-architecture', 'azure', 'security-ops'], level: 'senior',
        q: {
            en: 'What is a landing zone and why start with one?',
            nl: 'Wat is een landing zone en waarom start je ermee?',
            fr: 'Qu’est-ce qu’une landing zone et pourquoi commencer par là ?'
        },
        a: {
            en: 'A landing zone is a pre-built, governed cloud foundation — management group hierarchy, subscriptions, identity, networking, policy, logging and security baselines — so teams deploy into a consistent, compliant environment instead of ad hoc. Strong answers mention policy as code, guardrails versus gates, separation of platform and workload subscriptions, and that it scales governance without blocking delivery.',
            nl: 'Een landing zone is een vooraf gebouwde, bestuurde cloudfundering — management group-hiërarchie, subscriptions, identity, netwerk, policy, logging en security-baselines — zodat teams in een consistente, compliant omgeving deployen in plaats van ad hoc. Sterk antwoord: policy as code, guardrails versus gates, scheiding van platform- en workload-subscriptions, en dat het governance schaalt zonder delivery te blokkeren.',
            fr: 'Une landing zone est un socle cloud préconstruit et gouverné — hiérarchie de groupes d’administration, abonnements, identité, réseau, stratégies, journalisation et bases de sécurité — pour que les équipes déploient dans un environnement cohérent et conforme plutôt qu’au cas par cas. Bonne réponse : policy as code, garde-fous contre barrières, séparation des abonnements plateforme et charge de travail, et une gouvernance qui passe à l’échelle sans bloquer la livraison.'
        }
    },
    {
        id: 'cloud-iac', cat: 'cloud', roles: ['devops', 'cloud-architecture', 'azure'], level: 'medior',
        q: {
            en: 'Why deploy cloud infrastructure with code (Terraform/Bicep) instead of clicking in the portal?',
            nl: 'Waarom cloudinfrastructuur uitrollen met code (Terraform/Bicep) in plaats van klikken in de portal?',
            fr: 'Pourquoi déployer l’infrastructure cloud avec du code (Terraform/Bicep) plutôt qu’en cliquant dans le portail ?'
        },
        a: {
            en: 'Infrastructure as code makes deployments repeatable, reviewable and version-controlled, so environments are consistent and changes are auditable and can be rolled back. Strong answers mention idempotency, state management and drift, modules for reuse, plan/preview before apply, and running it through CI/CD. Red flag: manual portal changes that make environments diverge (snowflakes).',
            nl: 'Infrastructure as code maakt deployments herhaalbaar, reviewbaar en versiebeheerd, zodat omgevingen consistent zijn en wijzigingen auditbaar en terugdraaibaar. Sterk antwoord: idempotentie, state management en drift, modules voor hergebruik, plan/preview vóór apply, en het via CI/CD draaien. Alarmbel: manuele portalwijzigingen die omgevingen doen uiteenlopen (snowflakes).',
            fr: 'L’infrastructure as code rend les déploiements reproductibles, revus et versionnés : les environnements sont cohérents et les changements auditables et réversibles. Bonne réponse : idempotence, gestion de l’état et dérive, modules réutilisables, plan/aperçu avant application, et exécution via CI/CD. Signal d’alarme : des changements manuels dans le portail qui font diverger les environnements (snowflakes).'
        }
    },
    {
        id: 'cloud-migration', cat: 'cloud', roles: ['cloud-architecture', 'virtualization', 'azure'], level: 'senior',
        q: {
            en: 'How do you approach migrating on-premises workloads to the cloud?',
            nl: 'Hoe pak je de migratie van on-premises workloads naar de cloud aan?',
            fr: 'Comment abordez-vous la migration de charges de travail sur site vers le cloud ?'
        },
        a: {
            en: 'Start with discovery and assessment, then choose a strategy per workload from the 6 Rs (rehost, replatform, refactor, repurchase, retire, retain). Plan dependencies, data transfer, cutover and rollback, and validate cost and licensing. Strong answers avoid a blind lift-and-shift, pilot low-risk workloads first, and mention landing zone, testing and a decommission plan for the old environment.',
            nl: 'Start met discovery en assessment, kies dan per workload een strategie uit de 6 R’s (rehost, replatform, refactor, repurchase, retire, retain). Plan afhankelijkheden, datatransfer, cutover en rollback, en valideer kost en licenties. Sterk antwoord: geen blinde lift-and-shift, eerst laag-risico workloads piloteren, en landing zone, testen en een decommission-plan voor de oude omgeving vermelden.',
            fr: 'Commencez par la découverte et l’évaluation, puis choisissez une stratégie par charge parmi les 6 R (rehost, replatform, refactor, repurchase, retire, retain). Planifiez dépendances, transfert de données, bascule et retour arrière, et validez coût et licences. Bonne réponse : éviter le lift-and-shift aveugle, piloter d’abord les charges à faible risque, et évoquer landing zone, tests et plan de mise hors service de l’ancien environnement.'
        }
    },

    /* ---- Microsoft 365 -------------------------------------------------- */
    {
        id: 'm365-licensing', cat: 'microsoft365', roles: ['m365', 'it-support'], level: 'junior',
        q: {
            en: 'A new employee needs a mailbox, Teams and Office apps. How do you provision them in Microsoft 365?',
            nl: 'Een nieuwe medewerker heeft een mailbox, Teams en Office-apps nodig. Hoe voorzie je dat in Microsoft 365?',
            fr: 'Un nouvel employé a besoin d’une boîte mail, de Teams et des applications Office. Comment le provisionnez-vous dans Microsoft 365 ?'
        },
        a: {
            en: 'Create or sync the user, assign the right licence (e.g. Business Premium or E3/E5), which enables Exchange Online, Teams and the Office apps, and add them to the correct groups. Good answers prefer group-based licensing over per-user, mention a joiner checklist, MFA enrolment and least-privilege group membership rather than clicking every service by hand.',
            nl: 'Maak of synchroniseer de gebruiker, ken de juiste licentie toe (bv. Business Premium of E3/E5) die Exchange Online, Teams en de Office-apps activeert, en voeg hem aan de juiste groepen toe. Goed antwoord: groepsgebaseerde licentiëring boven per gebruiker, een joiner-checklist, MFA-registratie en least-privilege groepslidmaatschap in plaats van elke dienst handmatig aan te klikken.',
            fr: 'Créez ou synchronisez l’utilisateur, attribuez la bonne licence (ex. Business Premium ou E3/E5) qui active Exchange Online, Teams et les applications Office, et ajoutez-le aux bons groupes. Bonne réponse : préférer la licence par groupe à celle par utilisateur, une checklist d’arrivée, l’inscription MFA et une appartenance au moindre privilège plutôt que cocher chaque service à la main.'
        }
    },
    {
        id: 'm365-exchange-online', cat: 'microsoft365', roles: ['m365', 'email-security'], level: 'medior',
        q: {
            en: 'What is the difference between a shared mailbox, a distribution list and a Microsoft 365 group?',
            nl: 'Wat is het verschil tussen een gedeelde mailbox, een distributielijst en een Microsoft 365-groep?',
            fr: 'Quelle différence entre une boîte partagée, une liste de distribution et un groupe Microsoft 365 ?'
        },
        a: {
            en: 'A shared mailbox is a mailbox several people open with their own credentials (no licence up to 50 GB); a distribution list just fans out mail to members; a Microsoft 365 group is an identity that also brings a shared mailbox, calendar, SharePoint site and Teams. Strong answers pick by use case and mention send-as/send-on-behalf permissions and when a shared mailbox needs a licence.',
            nl: 'Een gedeelde mailbox is een mailbox die meerdere mensen openen met hun eigen credentials (geen licentie tot 50 GB); een distributielijst verspreidt mail gewoon naar leden; een Microsoft 365-groep is een identiteit die ook een gedeelde mailbox, agenda, SharePoint-site en Teams meebrengt. Sterk antwoord: kiezen per use case, send-as/send-on-behalf-rechten en wanneer een gedeelde mailbox een licentie nodig heeft.',
            fr: 'Une boîte partagée est une boîte que plusieurs personnes ouvrent avec leurs propres identifiants (sans licence jusqu’à 50 Go) ; une liste de distribution diffuse simplement le courrier aux membres ; un groupe Microsoft 365 est une identité qui apporte aussi boîte partagée, calendrier, site SharePoint et Teams. Bonne réponse : choisir selon le cas d’usage, droits send-as/send-on-behalf et cas où une boîte partagée nécessite une licence.'
        }
    },
    {
        id: 'm365-sharepoint-teams', cat: 'microsoft365', roles: ['m365', 'digital-workplace'], level: 'junior',
        q: {
            en: 'Where should users store files: OneDrive, SharePoint or a Teams channel?',
            nl: 'Waar bewaren gebruikers best bestanden: OneDrive, SharePoint of een Teams-kanaal?',
            fr: 'Où les utilisateurs devraient-ils stocker les fichiers : OneDrive, SharePoint ou un canal Teams ?'
        },
        a: {
            en: 'OneDrive is personal work storage; SharePoint is for team and organisation content; files shared in a Teams channel actually live in that team’s SharePoint site. So team documents belong in SharePoint/Teams, not a personal OneDrive that vanishes when the person leaves. Strong answers mention governance, permissions inheritance, and retention/versioning.',
            nl: 'OneDrive is persoonlijke werkopslag; SharePoint is voor team- en organisatie-inhoud; bestanden gedeeld in een Teams-kanaal staan eigenlijk in de SharePoint-site van dat team. Teamdocumenten horen dus in SharePoint/Teams, niet in een persoonlijke OneDrive die verdwijnt als de persoon vertrekt. Sterk antwoord: governance, overerving van rechten, en retentie/versiebeheer.',
            fr: 'OneDrive est un stockage de travail personnel ; SharePoint sert au contenu d’équipe et d’organisation ; les fichiers partagés dans un canal Teams résident en fait dans le site SharePoint de cette équipe. Les documents d’équipe vont donc dans SharePoint/Teams, pas dans un OneDrive personnel qui disparaît au départ de la personne. Bonne réponse : gouvernance, héritage des permissions et rétention/versionnage.'
        }
    },
    {
        id: 'm365-intune-enrollment', cat: 'microsoft365', roles: ['intune', 'm365'], level: 'medior',
        q: {
            en: 'How does device enrolment and compliance work with Intune?',
            nl: 'Hoe werkt device-enrollment en compliance met Intune?',
            fr: 'Comment fonctionnent l’inscription et la conformité des appareils avec Intune ?'
        },
        a: {
            en: 'Devices enrol (Autopilot for Windows, ADE/Apple Business Manager, Android enterprise), receive configuration and compliance policies, and report a compliant/non-compliant state that Conditional Access uses to allow or block access. Strong answers mention app deployment and protection policies, the difference between MDM and MAM (BYOD), and remediation when a device drifts out of compliance.',
            nl: 'Toestellen enrollen (Autopilot voor Windows, ADE/Apple Business Manager, Android enterprise), krijgen configuratie- en compliance-policies, en rapporteren een compliant/non-compliant status die Conditional Access gebruikt om toegang toe te laten of te blokkeren. Sterk antwoord: app-deployment en protection policies, het verschil tussen MDM en MAM (BYOD), en remediëring wanneer een toestel uit compliance loopt.',
            fr: 'Les appareils s’inscrivent (Autopilot pour Windows, ADE/Apple Business Manager, Android enterprise), reçoivent des stratégies de configuration et de conformité et signalent un état conforme/non conforme que l’accès conditionnel utilise pour autoriser ou bloquer. Bonne réponse : déploiement d’applications et stratégies de protection, différence entre MDM et MAM (BYOD), et remédiation quand un appareil sort de conformité.'
        }
    },
    {
        id: 'm365-defender', cat: 'microsoft365', roles: ['intune', 'security-ops', 'm365', 'email-security'], level: 'medior',
        q: {
            en: 'What does Microsoft Defender for Office 365 add on top of standard mail filtering?',
            nl: 'Wat voegt Microsoft Defender for Office 365 toe boven op standaard mailfiltering?',
            fr: 'Qu’apporte Microsoft Defender pour Office 365 par rapport au filtrage de courrier standard ?'
        },
        a: {
            en: 'On top of anti-spam and anti-malware, it adds Safe Links (URL rewriting and time-of-click checks), Safe Attachments (detonation in a sandbox), anti-phishing with impersonation and spoof protection, and threat investigation/automated response. Strong answers mention policies and quarantine, user reporting, and that it integrates into the wider Defender XDR for correlation across identity and endpoints.',
            nl: 'Boven op anti-spam en anti-malware voegt het Safe Links toe (URL-herschrijving en checks op moment van klikken), Safe Attachments (detonatie in een sandbox), anti-phishing met impersonatie- en spoofbescherming, en threat investigation/geautomatiseerde response. Sterk antwoord: policies en quarantaine, gebruikersrapportage, en integratie in de bredere Defender XDR voor correlatie over identiteit en endpoints.',
            fr: 'En plus de l’anti-spam et de l’anti-malware, il ajoute Safe Links (réécriture d’URL et vérification au moment du clic), Safe Attachments (détonation en bac à sable), l’anti-hameçonnage avec protection contre l’usurpation, et l’investigation/réponse automatisée. Bonne réponse : stratégies et quarantaine, signalement par les utilisateurs, et intégration au Defender XDR plus large pour corréler identité et postes.'
        }
    },
    {
        id: 'm365-dlp-purview', cat: 'microsoft365', roles: ['m365', 'security-ops'], level: 'senior',
        q: {
            en: 'How would you stop staff from emailing sensitive data out of Microsoft 365?',
            nl: 'Hoe verhinder je dat personeel gevoelige data uit Microsoft 365 mailt?',
            fr: 'Comment empêcher le personnel d’envoyer des données sensibles hors de Microsoft 365 ?'
        },
        a: {
            en: 'Use Purview: sensitivity labels to classify and encrypt content, and DLP policies that detect patterns (credit cards, national IDs) and warn, block or require justification across Exchange, SharePoint, OneDrive and endpoints. Strong answers start in audit/policy-tip mode to avoid breaking work, tune for false positives, combine with retention and insider-risk, and stress user education alongside controls.',
            nl: 'Gebruik Purview: sensitivity labels om inhoud te classificeren en versleutelen, en DLP-policies die patronen detecteren (kredietkaarten, rijksregisternummers) en waarschuwen, blokkeren of rechtvaardiging vragen over Exchange, SharePoint, OneDrive en endpoints. Sterk antwoord: starten in audit/policy-tip-modus om werk niet te breken, tunen voor false positives, combineren met retentie en insider-risk, en gebruikerseducatie naast controles benadrukken.',
            fr: 'Utilisez Purview : étiquettes de confidentialité pour classer et chiffrer le contenu, et stratégies DLP qui détectent des motifs (cartes bancaires, numéros nationaux) et avertissent, bloquent ou exigent une justification sur Exchange, SharePoint, OneDrive et les postes. Bonne réponse : démarrer en mode audit/conseil pour ne pas casser le travail, régler les faux positifs, combiner avec rétention et risque interne, et insister sur la sensibilisation en plus des contrôles.'
        }
    },

    /* ---- Windows & Active Directory ------------------------------------ */
    {
        id: 'win-ad-vs-entra', cat: 'windows', roles: ['windows-admin', 'entra-id'], level: 'medior',
        q: {
            en: 'What is the difference between on-premises Active Directory and Entra ID?',
            nl: 'Wat is het verschil tussen on-premises Active Directory en Entra ID?',
            fr: 'Quelle est la différence entre Active Directory sur site et Entra ID ?'
        },
        a: {
            en: 'AD DS is on-premises directory using LDAP, Kerberos/NTLM and group policy for domain-joined devices; Entra ID is a cloud identity service using modern protocols (OAuth/OIDC, SAML) for SaaS and Conditional Access — it is not just AD in the cloud. Strong answers explain hybrid identity with Entra Connect, that they solve different jobs, and that OUs/GPOs do not exist in Entra.',
            nl: 'AD DS is een on-premises directory met LDAP, Kerberos/NTLM en group policy voor domain-joined toestellen; Entra ID is een cloud-identityservice met moderne protocollen (OAuth/OIDC, SAML) voor SaaS en Conditional Access — het is niet gewoon AD in de cloud. Sterk antwoord: hybride identiteit met Entra Connect, dat ze verschillende taken oplossen, en dat OU’s/GPO’s niet bestaan in Entra.',
            fr: 'AD DS est un annuaire sur site utilisant LDAP, Kerberos/NTLM et les stratégies de groupe pour les appareils joints au domaine ; Entra ID est un service d’identité cloud utilisant des protocoles modernes (OAuth/OIDC, SAML) pour le SaaS et l’accès conditionnel — ce n’est pas simplement AD dans le cloud. Bonne réponse : identité hybride avec Entra Connect, des rôles différents, et l’absence d’OU/GPO dans Entra.'
        }
    },
    {
        id: 'win-gpo', cat: 'windows', roles: ['windows-admin', 'it-support'], level: 'medior',
        q: {
            en: 'What is a Group Policy Object and how does it apply to a user or computer?',
            nl: 'Wat is een Group Policy Object en hoe wordt het toegepast op een gebruiker of computer?',
            fr: 'Qu’est-ce qu’un objet de stratégie de groupe et comment s’applique-t-il à un utilisateur ou un ordinateur ?'
        },
        a: {
            en: 'A GPO is a set of settings linked to a site, domain or OU and applied to the objects in that scope, in the order local–site–domain–OU (last wins), refreshed periodically. Strong answers mention computer versus user configuration, security filtering and WMI filters, loopback processing, gpupdate/gpresult for troubleshooting, and that Intune increasingly replaces GPO for cloud-managed devices.',
            nl: 'Een GPO is een set instellingen gelinkt aan een site, domein of OU en toegepast op de objecten in die scope, in de volgorde local–site–domain–OU (laatste wint), periodiek vernieuwd. Sterk antwoord: computer- versus gebruikersconfiguratie, security filtering en WMI-filters, loopback processing, gpupdate/gpresult om te troubleshooten, en dat Intune GPO steeds meer vervangt voor cloud-beheerde toestellen.',
            fr: 'Un GPO est un ensemble de paramètres lié à un site, un domaine ou une OU et appliqué aux objets de cette portée, dans l’ordre local–site–domaine–OU (le dernier l’emporte), rafraîchi périodiquement. Bonne réponse : configuration ordinateur contre utilisateur, filtrage de sécurité et filtres WMI, traitement en boucle, gpupdate/gpresult pour le dépannage, et le remplacement croissant du GPO par Intune pour les appareils gérés dans le cloud.'
        }
    },
    {
        id: 'win-dns-ad', cat: 'windows', roles: ['windows-admin', 'dns'], level: 'medior',
        q: {
            en: 'Why is DNS so critical to Active Directory?',
            nl: 'Waarom is DNS zo cruciaal voor Active Directory?',
            fr: 'Pourquoi le DNS est-il si critique pour Active Directory ?'
        },
        a: {
            en: 'AD relies on DNS SRV records so clients locate domain controllers for logon, Kerberos and replication; wrong DNS (e.g. pointing clients at a public resolver) breaks authentication and group policy. Strong answers stress that domain members must use internal DNS, mention AD-integrated zones, dynamic registration, and troubleshooting with nslookup for _ldap._tcp SRV records.',
            nl: 'AD steunt op DNS SRV-records zodat clients domain controllers vinden voor logon, Kerberos en replicatie; verkeerde DNS (bv. clients naar een publieke resolver wijzen) breekt authenticatie en group policy. Sterk antwoord: domeinleden moeten interne DNS gebruiken, AD-geïntegreerde zones, dynamische registratie, en troubleshooten met nslookup op _ldap._tcp SRV-records.',
            fr: 'AD s’appuie sur les enregistrements SRV DNS pour que les clients localisent les contrôleurs de domaine pour l’ouverture de session, Kerberos et la réplication ; un mauvais DNS (par ex. pointer les clients vers un résolveur public) casse l’authentification et les stratégies. Bonne réponse : les membres du domaine doivent utiliser le DNS interne, zones intégrées à AD, enregistrement dynamique et dépannage avec nslookup sur les SRV _ldap._tcp.'
        }
    },
    {
        id: 'win-fsmo', cat: 'windows', roles: ['windows-admin'], level: 'senior',
        q: {
            en: 'What are FSMO roles in Active Directory?',
            nl: 'Wat zijn FSMO-rollen in Active Directory?',
            fr: 'Que sont les rôles FSMO dans Active Directory ?'
        },
        a: {
            en: 'Although AD is multi-master, five operations must be single-master: Schema Master and Domain Naming Master (per forest), and RID Master, PDC Emulator and Infrastructure Master (per domain). Strong answers know the PDC Emulator handles time and password/lockout, that roles can be transferred or seized, and which ones matter most if a DC fails.',
            nl: 'Hoewel AD multi-master is, moeten vijf operaties single-master zijn: Schema Master en Domain Naming Master (per forest), en RID Master, PDC Emulator en Infrastructure Master (per domein). Sterk antwoord: de PDC Emulator regelt tijd en wachtwoord/lockout, rollen kunnen getransfereerd of geseized worden, en welke het belangrijkst zijn als een DC uitvalt.',
            fr: 'Bien qu’AD soit multimaître, cinq opérations doivent être à maître unique : Schema Master et Domain Naming Master (par forêt), et RID Master, PDC Emulator et Infrastructure Master (par domaine). Bonne réponse : le PDC Emulator gère l’heure et les mots de passe/verrouillages, les rôles peuvent être transférés ou saisis, et lesquels comptent le plus si un DC tombe.'
        }
    },
    {
        id: 'win-ntfs-share', cat: 'windows', roles: ['windows-admin', 'it-support'], level: 'junior',
        q: {
            en: 'How do share permissions and NTFS permissions combine on a file server?',
            nl: 'Hoe combineren share-permissies en NTFS-permissies op een fileserver?',
            fr: 'Comment les permissions de partage et NTFS se combinent-elles sur un serveur de fichiers ?'
        },
        a: {
            en: 'Over the network the most restrictive of the two applies: share permissions gate access to the share, NTFS permissions apply everywhere including locally. Common practice is to leave share fairly open (e.g. Authenticated Users) and enforce fine-grained control with NTFS groups. Strong answers mention explicit deny winning, inheritance, using groups not users, and effective access.',
            nl: 'Over het netwerk geldt de meest restrictieve van de twee: share-permissies bewaken de toegang tot de share, NTFS-permissies gelden overal inclusief lokaal. Gebruikelijk is de share vrij open laten (bv. Authenticated Users) en fijnmazige controle afdwingen met NTFS-groepen. Sterk antwoord: expliciete deny wint, overerving, groepen in plaats van gebruikers, en effective access.',
            fr: 'Sur le réseau, la plus restrictive des deux s’applique : les permissions de partage gardent l’accès au partage, les permissions NTFS s’appliquent partout, y compris localement. Une pratique courante laisse le partage assez ouvert (ex. Utilisateurs authentifiés) et impose un contrôle fin par groupes NTFS. Bonne réponse : le refus explicite l’emporte, héritage, groupes plutôt qu’utilisateurs, et accès effectif.'
        }
    },
    {
        id: 'win-powershell-basics', cat: 'windows', roles: ['powershell', 'windows-admin', 'scripting'], level: 'junior',
        q: {
            en: 'What makes PowerShell different from a classic shell like cmd or bash?',
            nl: 'Wat maakt PowerShell anders dan een klassieke shell zoals cmd of bash?',
            fr: 'Qu’est-ce qui distingue PowerShell d’un shell classique comme cmd ou bash ?'
        },
        a: {
            en: 'PowerShell passes .NET objects through the pipeline rather than plain text, so you can filter and select on real properties instead of parsing strings. It uses a consistent Verb-Noun cmdlet naming, has structured error handling and rich remoting. Strong answers show comfort with Get-Help, Get-Member, the pipeline and Where-Object/Select-Object, and mention it is cross-platform now.',
            nl: 'PowerShell stuurt .NET-objecten door de pipeline in plaats van platte tekst, zodat je op echte eigenschappen filtert en selecteert in plaats van strings te parsen. Het gebruikt consistente Verb-Noun-cmdletnamen, gestructureerde foutafhandeling en rijke remoting. Sterk antwoord: vlot met Get-Help, Get-Member, de pipeline en Where-Object/Select-Object, en vermelden dat het nu cross-platform is.',
            fr: 'PowerShell fait circuler des objets .NET dans le pipeline plutôt que du texte brut : on filtre et sélectionne sur de vraies propriétés au lieu d’analyser des chaînes. Il utilise un nommage cohérent Verbe-Nom, une gestion structurée des erreurs et un remoting riche. Bonne réponse : aisance avec Get-Help, Get-Member, le pipeline et Where-Object/Select-Object, et le fait qu’il est désormais multiplateforme.'
        }
    },
    {
        id: 'win-powershell-remoting', cat: 'windows', roles: ['powershell', 'windows-admin', 'scripting'], level: 'medior',
        q: {
            en: 'You need to change a setting on 200 servers. How would you use PowerShell to do it safely?',
            nl: 'Je moet een instelling wijzigen op 200 servers. Hoe doe je dat veilig met PowerShell?',
            fr: 'Vous devez modifier un paramètre sur 200 serveurs. Comment le faire en toute sécurité avec PowerShell ?'
        },
        a: {
            en: 'Use remoting (Invoke-Command against a computer list or a session), but safely: test on a small pilot group first, use -WhatIf where available, add error handling and logging, and make the change idempotent so re-runs are safe. Strong answers mention credential and constrained-endpoint security, throttling, capturing per-host results, and a rollback plan. Red flag: firing at all 200 with no test.',
            nl: 'Gebruik remoting (Invoke-Command tegen een computerlijst of sessie), maar veilig: eerst testen op een kleine pilotgroep, -WhatIf gebruiken waar mogelijk, foutafhandeling en logging toevoegen, en de wijziging idempotent maken zodat herhalen veilig is. Sterk antwoord: credential- en constrained-endpoint-security, throttling, resultaten per host vastleggen, en een rollback-plan. Alarmbel: meteen op alle 200 loslaten zonder test.',
            fr: 'Utilisez le remoting (Invoke-Command sur une liste de machines ou une session), mais prudemment : tester d’abord sur un petit groupe pilote, employer -WhatIf si possible, ajouter gestion d’erreurs et journalisation, et rendre le changement idempotent pour des réexécutions sûres. Bonne réponse : sécurité des identifiants et des points de terminaison restreints, throttling, résultats par hôte et plan de retour arrière. Signal d’alarme : lancer sur les 200 sans test.'
        }
    },
    {
        id: 'win-wsus-patching', cat: 'windows', roles: ['windows-admin', 'monitoring', 'security-ops'], level: 'medior',
        q: {
            en: 'How do you manage Windows patching across a fleet of servers and clients?',
            nl: 'Hoe beheer je Windows-patching over een vloot servers en clients?',
            fr: 'Comment gérez-vous les correctifs Windows sur un parc de serveurs et de postes ?'
        },
        a: {
            en: 'Use a managed approach (WSUS, Configuration Manager, or Intune/Windows Update for Business): rings that pilot before broad deployment, maintenance windows, staged reboots, and reporting on compliance. Strong answers separate servers from clients, mention testing before production, out-of-band emergency patches for critical CVEs, and monitoring which machines are behind. Red flag: auto-reboot on production servers mid-day.',
            nl: 'Gebruik een beheerde aanpak (WSUS, Configuration Manager of Intune/Windows Update for Business): rings die piloteren vóór brede uitrol, onderhoudsvensters, gefaseerde reboots, en rapportage over compliance. Sterk antwoord: servers los van clients, testen vóór productie, out-of-band noodpatches voor kritieke CVE’s, en monitoren welke machines achterlopen. Alarmbel: auto-reboot op productieservers midden op de dag.',
            fr: 'Adoptez une approche gérée (WSUS, Configuration Manager ou Intune/Windows Update for Business) : anneaux qui pilotent avant un déploiement large, fenêtres de maintenance, redémarrages échelonnés et rapports de conformité. Bonne réponse : séparer serveurs et postes, tester avant production, correctifs d’urgence hors bande pour les CVE critiques, et surveiller les machines en retard. Signal d’alarme : redémarrage automatique de serveurs de production en pleine journée.'
        }
    },
    {
        id: 'win-intune-apps', cat: 'windows', roles: ['intune', 'powershell', 'windows-admin'], level: 'medior',
        q: {
            en: 'How do you deploy and update applications with Intune?',
            nl: 'Hoe deploy en update je applicaties met Intune?',
            fr: 'Comment déployez-vous et mettez-vous à jour les applications avec Intune ?'
        },
        a: {
            en: 'Package apps (Win32 .intunewin, MSI/store apps), define detection and requirement rules, assign to groups as required or available, and let the Intune Management Extension install and report. Strong answers mention supersedence for updates, dependencies, detection scripts, install/uninstall commands and the Company Portal, plus checking install status and logs when a deployment fails.',
            nl: 'Verpak apps (Win32 .intunewin, MSI/store-apps), definieer detectie- en vereistenregels, wijs toe aan groepen als required of available, en laat de Intune Management Extension installeren en rapporteren. Sterk antwoord: supersedence voor updates, dependencies, detectiescripts, install/uninstall-commando’s en de Company Portal, plus installatiestatus en logs nakijken als een deployment faalt.',
            fr: 'Empaquetez les applications (.intunewin Win32, MSI/apps du store), définissez des règles de détection et de prérequis, affectez aux groupes en « requis » ou « disponible », et laissez l’Intune Management Extension installer et rendre compte. Bonne réponse : supersedence pour les mises à jour, dépendances, scripts de détection, commandes d’installation/désinstallation et le Portail d’entreprise, plus la vérification du statut et des journaux en cas d’échec.'
        }
    },

    /* ---- Linux ---------------------------------------------------------- */
    {
        id: 'lnx-permissions', cat: 'linux', roles: ['linux-admin', 'it-support'], level: 'junior',
        q: {
            en: 'Explain Linux file permissions and what chmod 755 means.',
            nl: 'Leg Linux-bestandsrechten uit en wat chmod 755 betekent.',
            fr: 'Expliquez les permissions de fichiers sous Linux et ce que signifie chmod 755.'
        },
        a: {
            en: 'Permissions are read/write/execute for owner, group and others. 755 means owner rwx (7), group and others r-x (5) — everyone can read and execute, only the owner can write. Strong answers explain the octal-to-rwx mapping, the difference between a file and a directory’s execute bit, chown for ownership, and mention umask, sudo and special bits like setuid.',
            nl: 'Rechten zijn read/write/execute voor owner, group en others. 755 betekent owner rwx (7), group en others r-x (5) — iedereen mag lezen en uitvoeren, enkel de owner mag schrijven. Sterk antwoord: de octaal-naar-rwx-mapping, het verschil tussen de execute-bit op een bestand en een map, chown voor eigenaarschap, en umask, sudo en speciale bits zoals setuid.',
            fr: 'Les permissions sont lecture/écriture/exécution pour le propriétaire, le groupe et les autres. 755 signifie propriétaire rwx (7), groupe et autres r-x (5) — tous peuvent lire et exécuter, seul le propriétaire peut écrire. Bonne réponse : la correspondance octal-rwx, la différence du bit d’exécution entre fichier et répertoire, chown pour la propriété, et umask, sudo et bits spéciaux comme setuid.'
        }
    },
    {
        id: 'lnx-processes', cat: 'linux', roles: ['linux-admin', 'troubleshooting'], level: 'junior',
        q: {
            en: 'A Linux server is slow. Which commands do you use to see what is going on?',
            nl: 'Een Linux-server is traag. Welke commando’s gebruik je om te zien wat er gebeurt?',
            fr: 'Un serveur Linux est lent. Quelles commandes utilisez-vous pour voir ce qui se passe ?'
        },
        a: {
            en: 'Expect top/htop for CPU and memory, then narrow down: uptime/load average, free for memory and swap, iostat/iotop for disk, and vmstat. For a specific process use ps, and check logs in journalctl or /var/log. Strong answers separate CPU, memory, disk and network bottlenecks and reason about load average versus core count rather than just killing processes.',
            nl: 'Verwacht top/htop voor CPU en geheugen, dan verfijnen: uptime/load average, free voor geheugen en swap, iostat/iotop voor schijf, en vmstat. Voor een specifiek proces ps, en logs bekijken in journalctl of /var/log. Sterk antwoord: onderscheid tussen CPU-, geheugen-, schijf- en netwerkbottlenecks en redeneren over load average versus aantal cores in plaats van gewoon processen te killen.',
            fr: 'Attendez top/htop pour le CPU et la mémoire, puis affinez : uptime/charge moyenne, free pour la mémoire et le swap, iostat/iotop pour le disque, et vmstat. Pour un processus précis, ps, et consultez les journaux via journalctl ou /var/log. Bonne réponse : distinguer les goulets CPU, mémoire, disque et réseau et raisonner sur la charge moyenne par rapport au nombre de cœurs plutôt que de simplement tuer des processus.'
        }
    },
    {
        id: 'lnx-systemd', cat: 'linux', roles: ['linux-admin'], level: 'medior',
        q: {
            en: 'How do you manage a service with systemd, and how do you see why it failed?',
            nl: 'Hoe beheer je een dienst met systemd en hoe zie je waarom hij faalde?',
            fr: 'Comment gérez-vous un service avec systemd et comment voyez-vous pourquoi il a échoué ?'
        },
        a: {
            en: 'systemctl start/stop/restart/enable/status manages units; journalctl -u <service> shows its logs, and status shows the last exit and whether it is enabled at boot. Strong answers mention unit files and drop-ins, dependencies (After/Requires), that "enabled" means start at boot while "active" means running now, and using journalctl -xe or --since for the failure detail.',
            nl: 'systemctl start/stop/restart/enable/status beheert units; journalctl -u <service> toont de logs, en status toont de laatste exit en of hij bij boot ingeschakeld is. Sterk antwoord: unit files en drop-ins, dependencies (After/Requires), dat “enabled” starten bij boot betekent terwijl “active” nu draaiend betekent, en journalctl -xe of --since voor het foutdetail.',
            fr: 'systemctl start/stop/restart/enable/status gère les unités ; journalctl -u <service> affiche ses journaux, et status montre la dernière sortie et l’activation au démarrage. Bonne réponse : fichiers d’unité et drop-ins, dépendances (After/Requires), « enabled » signifie démarrer au boot tandis qu’« active » signifie en cours d’exécution, et journalctl -xe ou --since pour le détail de l’échec.'
        }
    },
    {
        id: 'lnx-disk-full', cat: 'linux', roles: ['linux-admin', 'troubleshooting'], level: 'medior',
        q: {
            en: 'A Linux server reports the disk is full but you cannot find the big files. What do you check?',
            nl: 'Een Linux-server meldt dat de schijf vol is maar je vindt de grote bestanden niet. Wat controleer je?',
            fr: 'Un serveur Linux indique que le disque est plein mais vous ne trouvez pas les gros fichiers. Que vérifiez-vous ?'
        },
        a: {
            en: 'Use df -h to find the full filesystem, then du -sh or ncdu to locate large directories. If space seems missing, check for deleted-but-open files still held by a process (lsof +L1), and check inode exhaustion with df -i. Strong answers mention log growth, a full /var, mounted-over directories, and that restarting the holding process frees the space.',
            nl: 'Gebruik df -h om het volle filesystem te vinden, dan du -sh of ncdu om grote mappen te lokaliseren. Lijkt er ruimte te ontbreken, check dan deleted-but-open bestanden die nog door een proces vastgehouden worden (lsof +L1), en inode-uitputting met df -i. Sterk antwoord: loggroei, een volle /var, over-mounted mappen, en dat het herstarten van het vasthoudende proces de ruimte vrijgeeft.',
            fr: 'Utilisez df -h pour trouver le système de fichiers plein, puis du -sh ou ncdu pour repérer les gros répertoires. Si de l’espace semble manquer, cherchez des fichiers supprimés mais encore ouverts par un processus (lsof +L1), et l’épuisement des inodes avec df -i. Bonne réponse : croissance des journaux, /var plein, répertoires masqués par un montage, et le fait que redémarrer le processus détenteur libère l’espace.'
        }
    },
    {
        id: 'lnx-ssh-hardening', cat: 'linux', roles: ['linux-admin', 'security-ops'], level: 'medior',
        q: {
            en: 'How do you secure SSH access to a Linux server?',
            nl: 'Hoe beveilig je SSH-toegang tot een Linux-server?',
            fr: 'Comment sécurisez-vous l’accès SSH à un serveur Linux ?'
        },
        a: {
            en: 'Use key-based auth and disable password login, disable direct root login, keep sudo with individual accounts, and restrict exposure with a firewall, allow-list or bastion instead of opening 22 to the internet. Strong answers add fail2ban/rate limiting, MFA, keeping SSH patched, and monitoring auth logs. Red flag: root login with a shared password exposed publicly.',
            nl: 'Gebruik key-based auth en schakel wachtwoordlogin uit, schakel directe root-login uit, hou sudo met individuele accounts, en beperk blootstelling met een firewall, allow-list of bastion in plaats van 22 open te zetten naar het internet. Sterk antwoord: fail2ban/rate limiting, MFA, SSH gepatcht houden, en auth-logs monitoren. Alarmbel: root-login met een gedeeld wachtwoord publiek blootgesteld.',
            fr: 'Utilisez l’authentification par clé et désactivez le mot de passe, interdisez la connexion root directe, gardez sudo avec des comptes individuels, et limitez l’exposition par un pare-feu, une liste d’autorisation ou un bastion plutôt que d’ouvrir le 22 à Internet. Bonne réponse : fail2ban/limitation de débit, MFA, SSH à jour et surveillance des journaux d’authentification. Signal d’alarme : connexion root avec mot de passe partagé exposé publiquement.'
        }
    },
    {
        id: 'lnx-bash-scripting', cat: 'linux', roles: ['scripting', 'linux-admin'], level: 'medior',
        q: {
            en: 'What makes a Bash script robust rather than fragile?',
            nl: 'Wat maakt een Bash-script robuust in plaats van fragiel?',
            fr: 'Qu’est-ce qui rend un script Bash robuste plutôt que fragile ?'
        },
        a: {
            en: 'Fail fast with set -euo pipefail, quote variables to survive spaces, check inputs and exit codes, and avoid parsing things that break (like ls). Strong answers add logging, idempotency, functions, trap for cleanup, and knowing when a task has outgrown Bash and belongs in Python. Red flag: unquoted variables and no error handling on destructive commands.',
            nl: 'Faal snel met set -euo pipefail, quote variabelen om spaties te overleven, controleer input en exit codes, en vermijd parsen wat breekt (zoals ls). Sterk antwoord: logging, idempotentie, functies, trap voor cleanup, en weten wanneer een taak Bash ontgroeid is en in Python thuishoort. Alarmbel: ongequote variabelen en geen foutafhandeling op destructieve commando’s.',
            fr: 'Échouez vite avec set -euo pipefail, mettez les variables entre guillemets pour survivre aux espaces, vérifiez entrées et codes de sortie, et évitez d’analyser ce qui casse (comme ls). Bonne réponse : journalisation, idempotence, fonctions, trap pour le nettoyage, et savoir quand une tâche dépasse Bash et relève de Python. Signal d’alarme : variables sans guillemets et aucune gestion d’erreur sur des commandes destructrices.'
        }
    },
    {
        id: 'lnx-package-mgmt', cat: 'linux', roles: ['linux-admin', 'it-support'], level: 'junior',
        q: {
            en: 'How do you install and update software on a Linux server?',
            nl: 'Hoe installeer en update je software op een Linux-server?',
            fr: 'Comment installez-vous et mettez-vous à jour des logiciels sur un serveur Linux ?'
        },
        a: {
            en: 'Use the distribution’s package manager — apt on Debian/Ubuntu, dnf/yum on RHEL/Fedora — which resolves dependencies and pulls from repositories, plus updates for security patches. Strong answers mention repositories and GPG-signed packages, not blindly running curl | bash from the internet, and newer options like snap/flatpak and containers for isolation.',
            nl: 'Gebruik de package manager van de distributie — apt op Debian/Ubuntu, dnf/yum op RHEL/Fedora — die dependencies oplost en uit repositories haalt, plus updates voor securitypatches. Sterk antwoord: repositories en GPG-ondertekende pakketten, niet blind curl | bash van het internet draaien, en nieuwere opties zoals snap/flatpak en containers voor isolatie.',
            fr: 'Utilisez le gestionnaire de paquets de la distribution — apt sur Debian/Ubuntu, dnf/yum sur RHEL/Fedora — qui résout les dépendances et récupère depuis les dépôts, plus les mises à jour de sécurité. Bonne réponse : dépôts et paquets signés GPG, ne pas exécuter aveuglément curl | bash depuis Internet, et options récentes comme snap/flatpak et conteneurs pour l’isolation.'
        }
    },

    /* ---- Virtualisation & containers ----------------------------------- */
    {
        id: 'virt-vm-vs-container', cat: 'virtualization', roles: ['virtualization', 'devops'], level: 'medior',
        q: {
            en: 'What is the difference between a virtual machine and a container?',
            nl: 'Wat is het verschil tussen een virtuele machine en een container?',
            fr: 'Quelle est la différence entre une machine virtuelle et un conteneur ?'
        },
        a: {
            en: 'A VM virtualises hardware and runs a full guest OS on a hypervisor; a container virtualises the OS and shares the host kernel, packaging just the app and its dependencies — lighter, faster to start, denser. Strong answers note the trade-off: VMs give stronger isolation, containers give portability and speed, and they are often combined (containers on VMs) with orchestration.',
            nl: 'Een VM virtualiseert hardware en draait een volledig gast-OS op een hypervisor; een container virtualiseert het OS en deelt de host-kernel, en verpakt enkel de app en zijn dependencies — lichter, sneller te starten, denser. Sterk antwoord: de afweging: VM’s geven sterkere isolatie, containers geven portabiliteit en snelheid, en ze worden vaak gecombineerd (containers op VM’s) met orchestratie.',
            fr: 'Une VM virtualise le matériel et exécute un OS invité complet sur un hyperviseur ; un conteneur virtualise l’OS et partage le noyau de l’hôte, empaquetant seulement l’application et ses dépendances — plus léger, plus rapide à démarrer, plus dense. Bonne réponse : l’arbitrage — les VM offrent une isolation plus forte, les conteneurs la portabilité et la vitesse, et on les combine souvent (conteneurs sur VM) avec de l’orchestration.'
        }
    },
    {
        id: 'virt-live-migration', cat: 'virtualization', roles: ['virtualization', 'windows-admin'], level: 'medior',
        q: {
            en: 'What is live migration (vMotion / Live Migration) and what does it need to work?',
            nl: 'Wat is live migration (vMotion / Live Migration) en wat is er nodig om het te laten werken?',
            fr: 'Qu’est-ce que la migration à chaud (vMotion / Live Migration) et de quoi a-t-elle besoin ?'
        },
        a: {
            en: 'It moves a running VM from one host to another with no downtime by copying memory state and switching over, used for maintenance and load balancing. It needs shared or replicated storage (or storage migration), compatible CPUs, and a fast dedicated network. Strong answers mention cluster requirements, DRS/dynamic optimisation, and that it does not protect against a host crash (that is HA/failover).',
            nl: 'Het verplaatst een draaiende VM van de ene host naar de andere zonder downtime door de geheugenstaat te kopiëren en over te schakelen, voor onderhoud en load balancing. Het vereist gedeelde of gerepliceerde opslag (of storage migration), compatibele CPU’s en een snel apart netwerk. Sterk antwoord: clustervereisten, DRS/dynamic optimisation, en dat het niet beschermt tegen een hostcrash (dat is HA/failover).',
            fr: 'Elle déplace une VM en cours d’exécution d’un hôte à un autre sans interruption en copiant l’état mémoire puis en basculant, pour la maintenance et l’équilibrage de charge. Elle exige un stockage partagé ou répliqué (ou une migration de stockage), des CPU compatibles et un réseau dédié rapide. Bonne réponse : prérequis de cluster, DRS/optimisation dynamique, et le fait qu’elle ne protège pas d’un crash d’hôte (c’est la HA/bascule).'
        }
    },
    {
        id: 'virt-snapshots', cat: 'virtualization', roles: ['virtualization', 'backup'], level: 'junior',
        q: {
            en: 'What is a VM snapshot and why should you not leave one running for weeks?',
            nl: 'Wat is een VM-snapshot en waarom laat je die niet weken openstaan?',
            fr: 'Qu’est-ce qu’un instantané de VM et pourquoi ne pas le laisser ouvert des semaines ?'
        },
        a: {
            en: 'A snapshot captures a point in time and then writes changes to a growing delta/differencing disk, handy for a quick rollback before a change. Left for weeks it bloats storage, hurts performance and gets risky to consolidate; it also is not a backup because it depends on the same datastore. Strong answers give a short lifetime and use real backups for retention.',
            nl: 'Een snapshot legt een moment vast en schrijft daarna wijzigingen naar een groeiende delta/differencing disk, handig voor een snelle rollback vóór een wijziging. Weken open laten doet de opslag opzwellen, schaadt performantie en maakt consolideren riskant; het is ook geen backup want het hangt af van dezelfde datastore. Sterk antwoord: korte levensduur en echte backups voor retentie.',
            fr: 'Un instantané fige un instant puis écrit les changements sur un disque delta/différentiel qui grossit, pratique pour un retour arrière rapide avant un changement. Laissé des semaines, il gonfle le stockage, dégrade les performances et rend la consolidation risquée ; ce n’est pas une sauvegarde car il dépend de la même banque de données. Bonne réponse : durée de vie courte et vraies sauvegardes pour la rétention.'
        }
    },
    {
        id: 'virt-resource-overcommit', cat: 'virtualization', roles: ['virtualization'], level: 'senior',
        q: {
            en: 'What is memory and CPU overcommit, and where does it become dangerous?',
            nl: 'Wat is geheugen- en CPU-overcommit en waar wordt het gevaarlijk?',
            fr: 'Qu’est-ce que le surengagement mémoire et CPU, et où devient-il dangereux ?'
        },
        a: {
            en: 'Overcommit allocates more virtual resources to VMs than the host physically has, betting they will not all peak at once. Moderate CPU overcommit is normal; memory overcommit is riskier — once you exhaust RAM the host swaps/balloons and performance collapses. Strong answers mention monitoring ready time and ballooning/swap, sizing for peak workloads, and not overcommitting latency-sensitive systems.',
            nl: 'Overcommit wijst meer virtuele resources aan VM’s toe dan de host fysiek heeft, gokkend dat ze niet allemaal tegelijk pieken. Matige CPU-overcommit is normaal; geheugenovercommit is riskanter — zodra je RAM opraakt gaat de host swappen/ballooning en stort de performantie in. Sterk antwoord: ready time en ballooning/swap monitoren, dimensioneren voor piekbelasting, en latency-gevoelige systemen niet overcommitten.',
            fr: 'Le surengagement alloue aux VM plus de ressources virtuelles que l’hôte n’en a physiquement, en pariant qu’elles ne culmineront pas toutes en même temps. Un surengagement CPU modéré est normal ; le surengagement mémoire est plus risqué — une fois la RAM épuisée, l’hôte swappe/ballonne et les performances s’effondrent. Bonne réponse : surveiller le ready time et le ballooning/swap, dimensionner pour les pics et ne pas surengager les systèmes sensibles à la latence.'
        }
    },
    {
        id: 'virt-kubernetes', cat: 'virtualization', roles: ['devops', 'virtualization', 'cloud-architecture'], level: 'senior',
        q: {
            en: 'At a high level, what problem does Kubernetes solve?',
            nl: 'Op hoog niveau: welk probleem lost Kubernetes op?',
            fr: 'À haut niveau, quel problème Kubernetes résout-il ?'
        },
        a: {
            en: 'Kubernetes orchestrates containers across a cluster: scheduling workloads onto nodes, self-healing failed pods, scaling, service discovery, load balancing and rolling updates from a declarative desired state. Strong answers mention pods/deployments/services, the reconciliation loop, and are honest that it adds real operational complexity you should only take on when you need it.',
            nl: 'Kubernetes orkestreert containers over een cluster: workloads op nodes schedulen, gefaalde pods self-healen, schalen, service discovery, load balancing en rolling updates vanuit een declaratieve gewenste staat. Sterk antwoord: pods/deployments/services, de reconciliatielus, en eerlijk zijn dat het reële operationele complexiteit toevoegt die je enkel aangaat wanneer je ze nodig hebt.',
            fr: 'Kubernetes orchestre des conteneurs sur un cluster : planifier les charges sur les nœuds, auto-réparer les pods défaillants, mettre à l’échelle, découverte de services, équilibrage et mises à jour progressives à partir d’un état désiré déclaratif. Bonne réponse : pods/deployments/services, la boucle de réconciliation, et l’honnêteté sur la complexité opérationnelle réelle qu’il ne faut assumer qu’en cas de besoin.'
        }
    },

    /* ---- Development ---------------------------------------------------- */
    {
        id: 'dev-oop-solid', cat: 'dev', roles: ['dev-backend', 'dev-fullstack'], level: 'medior',
        q: {
            en: 'Explain one or two of the SOLID principles and why they help.',
            nl: 'Leg één of twee SOLID-principes uit en waarom ze helpen.',
            fr: 'Expliquez un ou deux des principes SOLID et pourquoi ils aident.'
        },
        a: {
            en: 'Look for a real, plain-language explanation rather than reciting five acronyms — e.g. single responsibility (a class has one reason to change) or dependency inversion (depend on abstractions so you can swap implementations and test in isolation). Strong answers tie them to maintainability and testability and admit that principles are guidelines, not dogma to over-engineer around.',
            nl: 'Let op een echte uitleg in gewone taal in plaats van vijf letterwoorden opdreunen — bv. single responsibility (een klasse heeft één reden om te wijzigen) of dependency inversion (afhangen van abstracties zodat je implementaties kan wisselen en geïsoleerd testen). Sterk antwoord: ze koppelen aan onderhoudbaarheid en testbaarheid en toegeven dat het richtlijnen zijn, geen dogma om over te over-engineeren.',
            fr: 'Cherchez une vraie explication en langage clair plutôt que réciter cinq acronymes — par ex. responsabilité unique (une classe n’a qu’une raison de changer) ou inversion des dépendances (dépendre d’abstractions pour permuter les implémentations et tester isolément). Bonne réponse : les lier à la maintenabilité et à la testabilité et admettre que ce sont des principes, pas un dogme à sur-concevoir.'
        }
    },
    {
        id: 'dev-git-workflow', cat: 'dev', roles: ['dev-fullstack', 'devops'], level: 'junior',
        q: {
            en: 'Describe a branching workflow you have used with Git.',
            nl: 'Beschrijf een branching-workflow die je met Git gebruikt hebt.',
            fr: 'Décrivez un flux de branches que vous avez utilisé avec Git.'
        },
        a: {
            en: 'Common answers are trunk-based development with short-lived feature branches and pull requests, or GitFlow with develop/release branches. What matters is understanding branching, merge versus rebase, pull requests with review and CI, and resolving conflicts. Strong answers argue for short-lived branches and frequent integration to avoid painful merges, and mention protecting main.',
            nl: 'Gebruikelijke antwoorden zijn trunk-based development met kortlevende feature branches en pull requests, of GitFlow met develop/release branches. Wat telt is begrip van branching, merge versus rebase, pull requests met review en CI, en conflicten oplossen. Sterk antwoord: pleiten voor kortlevende branches en frequente integratie om pijnlijke merges te vermijden, en main beschermen.',
            fr: 'Les réponses courantes sont le trunk-based development avec branches de fonctionnalité de courte durée et pull requests, ou GitFlow avec branches develop/release. L’essentiel est de comprendre les branches, merge contre rebase, les pull requests avec revue et CI, et la résolution des conflits. Bonne réponse : plaider pour des branches courtes et une intégration fréquente pour éviter les fusions douloureuses, et protéger main.'
        }
    },
    {
        id: 'dev-testing-pyramid', cat: 'dev', roles: ['dev-backend', 'dev-fullstack'], level: 'medior',
        q: {
            en: 'What is the testing pyramid and why prefer unit tests over end-to-end tests?',
            nl: 'Wat is de testpiramide en waarom verkies je unittests boven end-to-end tests?',
            fr: 'Qu’est-ce que la pyramide des tests et pourquoi préférer les tests unitaires aux tests de bout en bout ?'
        },
        a: {
            en: 'Many fast, isolated unit tests at the base, fewer integration tests, and a small number of slow, brittle end-to-end tests at the top. Unit tests are fast, pinpoint failures and are cheap to run in CI, while too many E2E tests are slow and flaky. Strong answers stress testing behaviour not implementation, meaningful coverage over a number, and where mocks help or hurt.',
            nl: 'Veel snelle, geïsoleerde unittests aan de basis, minder integratietests, en een klein aantal trage, brosse end-to-end tests bovenaan. Unittests zijn snel, wijzen fouten precies aan en zijn goedkoop in CI, terwijl te veel E2E-tests traag en flaky zijn. Sterk antwoord: gedrag testen in plaats van implementatie, zinvolle coverage boven een getal, en waar mocks helpen of schaden.',
            fr: 'Beaucoup de tests unitaires rapides et isolés à la base, moins de tests d’intégration, et un petit nombre de tests de bout en bout lents et fragiles au sommet. Les tests unitaires sont rapides, localisent les défauts et sont peu coûteux en CI, alors que trop de tests E2E sont lents et instables. Bonne réponse : tester le comportement et non l’implémentation, une couverture utile plutôt qu’un chiffre, et où les mocks aident ou nuisent.'
        }
    },
    {
        id: 'dev-frontend-frameworks', cat: 'dev', roles: ['dev-frontend', 'dev-fullstack'], level: 'medior',
        q: {
            en: 'Why use a framework like React, Angular or Vue instead of plain JavaScript?',
            nl: 'Waarom een framework zoals React, Angular of Vue gebruiken in plaats van pure JavaScript?',
            fr: 'Pourquoi utiliser un framework comme React, Angular ou Vue plutôt que du JavaScript pur ?'
        },
        a: {
            en: 'Frameworks give a component model, declarative rendering and state-driven UI updates so you describe what the UI should be instead of manually manipulating the DOM, plus routing, tooling and an ecosystem. Strong answers weigh the cost — bundle size, complexity, learning curve — and note that for a small static page vanilla JS or web components can be the better call.',
            nl: 'Frameworks geven een componentmodel, declaratieve rendering en state-gestuurde UI-updates zodat je beschrijft wat de UI moet zijn in plaats van de DOM manueel te manipuleren, plus routing, tooling en een ecosysteem. Sterk antwoord: de kost afwegen — bundelgrootte, complexiteit, leercurve — en opmerken dat voor een kleine statische pagina vanilla JS of web components beter kunnen zijn.',
            fr: 'Les frameworks offrent un modèle de composants, un rendu déclaratif et des mises à jour d’interface pilotées par l’état : on décrit ce que l’UI doit être au lieu de manipuler le DOM à la main, plus routage, outillage et écosystème. Bonne réponse : peser le coût — taille du bundle, complexité, courbe d’apprentissage — et noter que pour une petite page statique, le JS pur ou les web components peuvent être préférables.'
        }
    },
    {
        id: 'dev-responsive-a11y', cat: 'dev', roles: ['dev-frontend'], level: 'junior',
        q: {
            en: 'What does it mean to build a responsive and accessible web page?',
            nl: 'Wat betekent het om een responsieve en toegankelijke webpagina te bouwen?',
            fr: 'Que signifie construire une page web réactive et accessible ?'
        },
        a: {
            en: 'Responsive means the layout adapts to screen size using fluid layouts, flexbox/grid and media queries rather than fixed pixels. Accessible means it works for everyone: semantic HTML, keyboard navigation, sufficient colour contrast, alt text and ARIA only where needed. Strong answers mention mobile-first, testing with a screen reader, and that semantic HTML gives most accessibility for free.',
            nl: 'Responsief betekent dat de layout zich aanpast aan de schermgrootte met vloeiende layouts, flexbox/grid en media queries in plaats van vaste pixels. Toegankelijk betekent dat het voor iedereen werkt: semantische HTML, toetsenbordnavigatie, voldoende kleurcontrast, alt-tekst en ARIA enkel waar nodig. Sterk antwoord: mobile-first, testen met een screenreader, en dat semantische HTML de meeste toegankelijkheid gratis geeft.',
            fr: 'Réactif signifie que la mise en page s’adapte à la taille d’écran via des dispositions fluides, flexbox/grid et media queries plutôt que des pixels fixes. Accessible signifie que cela fonctionne pour tous : HTML sémantique, navigation au clavier, contraste suffisant, texte alternatif et ARIA seulement au besoin. Bonne réponse : mobile-first, test avec un lecteur d’écran, et le fait que le HTML sémantique offre l’essentiel de l’accessibilité gratuitement.'
        }
    },
    {
        id: 'dev-state-management', cat: 'dev', roles: ['dev-frontend'], level: 'senior',
        q: {
            en: 'How do you decide when a front-end app needs a state management library?',
            nl: 'Hoe beslis je wanneer een front-end-app een state-managementbibliotheek nodig heeft?',
            fr: 'Comment décidez-vous qu’une application front-end a besoin d’une bibliothèque de gestion d’état ?'
        },
        a: {
            en: 'Start with local component state and the framework’s built-ins; reach for a store only when state is shared widely, must survive navigation, or gets hard to trace. Strong answers distinguish server state (caching libraries like React Query) from client UI state, warn against premature global stores, and reason about prop drilling, derived state and single source of truth.',
            nl: 'Start met lokale componentstate en de ingebouwde middelen van het framework; grijp pas naar een store wanneer state breed gedeeld wordt, navigatie moet overleven, of moeilijk te traceren wordt. Sterk antwoord: onderscheid tussen server state (caching-bibliotheken zoals React Query) en client-UI-state, waarschuwen tegen premature global stores, en redeneren over prop drilling, derived state en single source of truth.',
            fr: 'Commencez par l’état local des composants et les outils intégrés du framework ; n’adoptez un store que lorsque l’état est largement partagé, doit survivre à la navigation ou devient difficile à suivre. Bonne réponse : distinguer l’état serveur (bibliothèques de cache comme React Query) de l’état d’interface, se méfier des stores globaux prématurés et raisonner sur le prop drilling, l’état dérivé et la source unique de vérité.'
        }
    },
    {
        id: 'dev-auth-oauth', cat: 'dev', roles: ['dev-backend', 'security-ops'], level: 'senior',
        q: {
            en: 'What is the difference between authentication and authorisation, and where do OAuth and JWT fit?',
            nl: 'Wat is het verschil tussen authenticatie en autorisatie, en waar passen OAuth en JWT?',
            fr: 'Quelle est la différence entre authentification et autorisation, et où interviennent OAuth et JWT ?'
        },
        a: {
            en: 'Authentication is proving who you are; authorisation is what you are allowed to do. OAuth 2.0 is a delegated authorisation framework (access tokens), OpenID Connect adds authentication on top, and a JWT is a signed token format often used to carry claims. Strong answers mention validating signature, issuer, audience and expiry, not storing secrets in the token, and token lifetime/refresh.',
            nl: 'Authenticatie is bewijzen wie je bent; autorisatie is wat je mag doen. OAuth 2.0 is een gedelegeerd autorisatieframework (access tokens), OpenID Connect voegt authenticatie toe, en een JWT is een ondertekend tokenformaat dat vaak claims draagt. Sterk antwoord: handtekening, issuer, audience en expiry valideren, geen secrets in het token bewaren, en tokenlevensduur/refresh.',
            fr: 'L’authentification prouve qui vous êtes ; l’autorisation définit ce que vous pouvez faire. OAuth 2.0 est un cadre d’autorisation déléguée (jetons d’accès), OpenID Connect y ajoute l’authentification, et un JWT est un format de jeton signé souvent utilisé pour porter des revendications. Bonne réponse : valider signature, émetteur, audience et expiration, ne pas stocker de secrets dans le jeton, et durée de vie/rafraîchissement.'
        }
    },
    {
        id: 'dev-async', cat: 'dev', roles: ['dev-backend', 'dev-fullstack'], level: 'medior',
        q: {
            en: 'What is the difference between synchronous and asynchronous processing, and when do you use a queue?',
            nl: 'Wat is het verschil tussen synchrone en asynchrone verwerking, en wanneer gebruik je een queue?',
            fr: 'Quelle différence entre traitement synchrone et asynchrone, et quand utiliser une file d’attente ?'
        },
        a: {
            en: 'Synchronous work blocks the caller until it finishes; asynchronous work lets the caller continue and get the result later, keeping UIs and services responsive. A message queue decouples producers from consumers for slow, spiky or unreliable work (emails, image processing), adding buffering and retries. Strong answers mention idempotency, ordering, dead-letter queues and eventual consistency.',
            nl: 'Synchroon werk blokkeert de aanroeper tot het klaar is; asynchroon werk laat de aanroeper doorgaan en het resultaat later ophalen, zodat UI’s en services responsief blijven. Een message queue ontkoppelt producers van consumers voor traag, piekerig of onbetrouwbaar werk (mails, beeldverwerking), met buffering en retries. Sterk antwoord: idempotentie, ordering, dead-letter queues en eventual consistency.',
            fr: 'Le travail synchrone bloque l’appelant jusqu’à la fin ; le travail asynchrone laisse l’appelant continuer et récupérer le résultat plus tard, gardant interfaces et services réactifs. Une file de messages découple les producteurs des consommateurs pour du travail lent, en pics ou peu fiable (courriels, traitement d’images), avec tampon et reprises. Bonne réponse : idempotence, ordre, files de lettres mortes et cohérence à terme.'
        }
    },
    {
        id: 'dev-code-review', cat: 'dev', roles: ['dev-fullstack', 'teamwork'], level: 'junior',
        q: {
            en: 'What do you look for when reviewing a colleague’s pull request?',
            nl: 'Waar let je op bij het reviewen van de pull request van een collega?',
            fr: 'Que regardez-vous en relisant la pull request d’un collègue ?'
        },
        a: {
            en: 'Correctness first (does it do the right thing, are edge cases and errors handled), then readability, tests, security and whether it fits the existing design. Good answers separate blocking issues from nitpicks, comment kindly and concretely, and ask questions rather than dictate. Listen for empathy and for keeping reviews small and timely, not personal.',
            nl: 'Eerst correctheid (doet het het juiste, zijn edge cases en fouten afgehandeld), dan leesbaarheid, tests, security en of het past in het bestaande ontwerp. Goed antwoord: blokkerende problemen scheiden van muggenzifterij, vriendelijk en concreet commentaar geven, en vragen stellen in plaats van dicteren. Let op empathie en op reviews klein en tijdig houden, niet persoonlijk.',
            fr: 'D’abord la justesse (fait-elle la bonne chose, cas limites et erreurs gérés), puis lisibilité, tests, sécurité et cohérence avec la conception existante. Bonne réponse : distinguer les points bloquants des détails, commenter avec bienveillance et précision, et poser des questions plutôt que dicter. À écouter : l’empathie et le fait de garder les revues courtes et rapides, pas personnelles.'
        }
    },
    {
        id: 'dev-clean-code', cat: 'dev', roles: ['dev-fullstack', 'dev-backend'], level: 'medior',
        q: {
            en: 'What is technical debt and how do you deal with it?',
            nl: 'Wat is technische schuld en hoe ga je ermee om?',
            fr: 'Qu’est-ce que la dette technique et comment la gérez-vous ?'
        },
        a: {
            en: 'Technical debt is the future cost of shortcuts taken to ship faster — sometimes a deliberate, sensible trade-off, sometimes accidental decay. You deal with it by making it visible, paying it down continuously (boy-scout rule, refactoring alongside features) and prioritising the debt that actually slows the team or causes bugs. Strong answers balance delivery with quality rather than demanding a big rewrite.',
            nl: 'Technische schuld is de toekomstige kost van shortcuts om sneller te leveren — soms een bewuste, zinvolle afweging, soms toevallig verval. Je gaat ermee om door het zichtbaar te maken, het continu af te lossen (boy-scout rule, refactoren naast features) en de schuld te prioriteren die het team echt vertraagt of bugs veroorzaakt. Sterk antwoord: levering en kwaliteit balanceren in plaats van een grote rewrite eisen.',
            fr: 'La dette technique est le coût futur des raccourcis pris pour livrer plus vite — parfois un compromis délibéré et sensé, parfois une dégradation accidentelle. On la gère en la rendant visible, en la remboursant en continu (règle du scout, refactorisation en même temps que les fonctionnalités) et en priorisant celle qui ralentit vraiment l’équipe ou cause des bugs. Bonne réponse : équilibrer livraison et qualité plutôt qu’exiger une grande réécriture.'
        }
    },

    /* ---- Databases ------------------------------------------------------ */
    {
        id: 'db-normalization', cat: 'database', roles: ['databases', 'dev-backend'], level: 'medior',
        q: {
            en: 'What is database normalisation, and when would you deliberately denormalise?',
            nl: 'Wat is databasenormalisatie, en wanneer denormaliseer je bewust?',
            fr: 'Qu’est-ce que la normalisation d’une base de données, et quand dénormaliser volontairement ?'
        },
        a: {
            en: 'Normalisation organises data to remove redundancy and update anomalies, typically to third normal form, so each fact lives in one place. You denormalise deliberately for read performance — duplicating data or precomputing aggregates in reporting/analytics — accepting redundancy and extra write logic. Strong answers weigh integrity versus query speed and mention indexes and caching as alternatives.',
            nl: 'Normalisatie organiseert data om redundantie en update-anomalieën weg te werken, meestal tot derde normaalvorm, zodat elk feit op één plaats staat. Je denormaliseert bewust voor leesperformantie — data dupliceren of aggregaties voorberekenen in rapportering/analytics — met redundantie en extra schrijflogica als prijs. Sterk antwoord: integriteit versus queryspeed afwegen en indexen en caching als alternatieven noemen.',
            fr: 'La normalisation organise les données pour éliminer redondance et anomalies de mise à jour, généralement jusqu’à la troisième forme normale, afin que chaque fait n’existe qu’une fois. On dénormalise volontairement pour la performance en lecture — dupliquer des données ou précalculer des agrégats en reporting/analytique — en acceptant redondance et logique d’écriture. Bonne réponse : arbitrer intégrité contre vitesse et citer index et cache comme alternatives.'
        }
    },
    {
        id: 'db-joins', cat: 'database', roles: ['databases', 'data-analytics'], level: 'junior',
        q: {
            en: 'Explain the difference between an INNER JOIN and a LEFT JOIN.',
            nl: 'Leg het verschil uit tussen een INNER JOIN en een LEFT JOIN.',
            fr: 'Expliquez la différence entre un INNER JOIN et un LEFT JOIN.'
        },
        a: {
            en: 'An INNER JOIN returns only rows that match in both tables; a LEFT JOIN returns all rows from the left table and the matching right-side rows, with NULLs where there is no match. Strong answers give a concrete use (find customers with no orders using LEFT JOIN … WHERE right IS NULL) and warn that filtering the right table in WHERE can silently turn a LEFT JOIN into an INNER JOIN.',
            nl: 'Een INNER JOIN geeft enkel rijen die in beide tabellen matchen; een LEFT JOIN geeft alle rijen uit de linkertabel en de matchende rechterrijen, met NULLs waar er geen match is. Sterk antwoord: een concreet gebruik (klanten zonder bestellingen vinden met LEFT JOIN … WHERE rechts IS NULL) en waarschuwen dat filteren op de rechtertabel in WHERE een LEFT JOIN stil in een INNER JOIN verandert.',
            fr: 'Un INNER JOIN ne renvoie que les lignes correspondant dans les deux tables ; un LEFT JOIN renvoie toutes les lignes de la table de gauche et les lignes correspondantes de droite, avec des NULL en l’absence de correspondance. Bonne réponse : un usage concret (trouver les clients sans commande via LEFT JOIN … WHERE droite IS NULL) et l’avertissement qu’un filtre sur la table de droite dans WHERE transforme discrètement un LEFT JOIN en INNER JOIN.'
        }
    },
    {
        id: 'db-acid-transactions', cat: 'database', roles: ['databases', 'dev-backend'], level: 'medior',
        q: {
            en: 'What does ACID mean, and why do transactions matter?',
            nl: 'Wat betekent ACID en waarom zijn transacties belangrijk?',
            fr: 'Que signifie ACID et pourquoi les transactions comptent-elles ?'
        },
        a: {
            en: 'Atomicity (all or nothing), Consistency (constraints hold), Isolation (concurrent transactions do not corrupt each other) and Durability (committed data survives a crash). Transactions matter for correctness under concurrency and failure — classic example is transferring money between accounts. Strong answers mention isolation levels and phenomena like dirty/non-repeatable reads, and the trade-off with performance.',
            nl: 'Atomicity (alles of niets), Consistency (constraints blijven gelden), Isolation (gelijktijdige transacties corrumperen elkaar niet) en Durability (gecommitte data overleeft een crash). Transacties zijn belangrijk voor correctheid bij concurrency en falen — klassiek voorbeeld is geld overschrijven tussen rekeningen. Sterk antwoord: isolatieniveaus en fenomenen zoals dirty/non-repeatable reads, en de afweging met performantie.',
            fr: 'Atomicité (tout ou rien), Cohérence (les contraintes tiennent), Isolation (les transactions concurrentes ne se corrompent pas) et Durabilité (les données validées survivent à une panne). Les transactions comptent pour la justesse en concurrence et en cas d’échec — l’exemple classique est le virement entre comptes. Bonne réponse : niveaux d’isolation et phénomènes comme lectures sales/non répétables, et l’arbitrage avec la performance.'
        }
    },
    {
        id: 'db-sql-vs-nosql', cat: 'database', roles: ['databases', 'cloud-architecture'], level: 'medior',
        q: {
            en: 'When would you choose a NoSQL database over a relational one?',
            nl: 'Wanneer kies je een NoSQL-database boven een relationele?',
            fr: 'Quand choisir une base NoSQL plutôt que relationnelle ?'
        },
        a: {
            en: 'Relational databases fit structured data with relationships, strong consistency and complex queries; NoSQL (document, key-value, column, graph) fits flexible or evolving schemas, very high scale, or specific access patterns like a document per aggregate. Strong answers reject "NoSQL is faster" as a blanket claim, reason about the data and access pattern, and mention consistency trade-offs and polyglot persistence.',
            nl: 'Relationele databases passen bij gestructureerde data met relaties, sterke consistentie en complexe queries; NoSQL (document, key-value, column, graph) past bij flexibele of evoluerende schema’s, zeer grote schaal, of specifieke accesspatronen zoals één document per aggregaat. Sterk antwoord: “NoSQL is sneller” als algemene claim verwerpen, redeneren over data en accesspatroon, en consistentie-afwegingen en polyglot persistence noemen.',
            fr: 'Les bases relationnelles conviennent aux données structurées avec relations, forte cohérence et requêtes complexes ; le NoSQL (document, clé-valeur, colonne, graphe) convient aux schémas flexibles ou évolutifs, à très grande échelle, ou à des accès précis comme un document par agrégat. Bonne réponse : rejeter « le NoSQL est plus rapide » en général, raisonner sur les données et l’accès, et évoquer les compromis de cohérence et la persistance polyglotte.'
        }
    },
    {
        id: 'db-backup-recovery', cat: 'database', roles: ['databases', 'backup'], level: 'medior',
        q: {
            en: 'How do you back up a production database and know you can restore it?',
            nl: 'Hoe backup je een productiedatabase en hoe weet je dat je kan herstellen?',
            fr: 'Comment sauvegardez-vous une base de production et savez-vous que vous pouvez la restaurer ?'
        },
        a: {
            en: 'Full backups plus differential/transaction-log backups to enable point-in-time recovery, stored off-site/immutable, sized to your RPO and RTO. The key point: a backup you have never restored is not a backup, so test restores regularly. Strong answers mention consistent/online backups, recovery models, protecting against logical corruption (not just hardware) and documenting the restore runbook.',
            nl: 'Volledige backups plus differential/transaction-log-backups voor point-in-time recovery, off-site/immutable opgeslagen, gedimensioneerd op je RPO en RTO. Het kernpunt: een backup die je nooit hersteld hebt is geen backup, dus test restores regelmatig. Sterk antwoord: consistente/online backups, recovery models, bescherming tegen logische corruptie (niet enkel hardware) en de restore-runbook documenteren.',
            fr: 'Des sauvegardes complètes plus différentielles/journaux de transactions pour une restauration à un instant précis, stockées hors site/immuables, dimensionnées selon vos RPO et RTO. Le point clé : une sauvegarde jamais restaurée n’en est pas une, testez donc les restaurations régulièrement. Bonne réponse : sauvegardes cohérentes/en ligne, modèles de récupération, protection contre la corruption logique (pas seulement matérielle) et documentation du runbook de restauration.'
        }
    },
    {
        id: 'db-query-optimization', cat: 'database', roles: ['databases', 'data-analytics'], level: 'senior',
        q: {
            en: 'A query that used to be fast is now slow. How do you diagnose and fix it?',
            nl: 'Een query die vroeger snel was is nu traag. Hoe diagnosticeer en fix je dat?',
            fr: 'Une requête autrefois rapide est devenue lente. Comment la diagnostiquez-vous et la corrigez-vous ?'
        },
        a: {
            en: 'Look at the execution plan to see scans, expensive joins or a bad estimate, and check what changed — data volume, statistics, a missing or changed index, or parameter sniffing. Fixes range from adding/adjusting indexes and updating statistics to rewriting the query or the schema. Strong answers measure before and after, avoid cargo-cult index spam, and consider blocking/locking too.',
            nl: 'Bekijk het uitvoeringsplan voor scans, dure joins of een slechte schatting, en check wat veranderde — datavolume, statistieken, een ontbrekende of gewijzigde index, of parameter sniffing. Fixes gaan van indexen toevoegen/aanpassen en statistieken updaten tot de query of het schema herschrijven. Sterk antwoord: meten voor en na, geen cargo-cult indexspam, en ook blocking/locking overwegen.',
            fr: 'Examinez le plan d’exécution pour repérer balayages, jointures coûteuses ou mauvaise estimation, et vérifiez ce qui a changé — volume de données, statistiques, index manquant ou modifié, ou parameter sniffing. Les correctifs vont de l’ajout/ajustement d’index et la mise à jour des statistiques à la réécriture de la requête ou du schéma. Bonne réponse : mesurer avant/après, éviter l’ajout d’index par superstition, et considérer aussi les verrouillages.'
        }
    },

    /* ---- DevOps --------------------------------------------------------- */
    {
        id: 'ops-iac-tools', cat: 'devops', roles: ['devops', 'cloud-architecture'], level: 'medior',
        q: {
            en: 'What is the difference between configuration management (Ansible) and provisioning (Terraform)?',
            nl: 'Wat is het verschil tussen configuratiebeheer (Ansible) en provisioning (Terraform)?',
            fr: 'Quelle différence entre gestion de configuration (Ansible) et provisionnement (Terraform) ?'
        },
        a: {
            en: 'Terraform provisions infrastructure declaratively and tracks state to create, change and destroy resources; Ansible configures what runs inside them (packages, files, services), often procedurally and agentless. They overlap but complement each other. Strong answers mention idempotency in both, immutable versus mutable infrastructure, and using Terraform for the platform and Ansible/cloud-init for configuration.',
            nl: 'Terraform provisioniert infrastructuur declaratief en houdt state bij om resources te maken, wijzigen en vernietigen; Ansible configureert wat erin draait (pakketten, bestanden, services), vaak procedureel en agentless. Ze overlappen maar vullen elkaar aan. Sterk antwoord: idempotentie in beide, immutable versus mutable infrastructuur, en Terraform voor het platform en Ansible/cloud-init voor configuratie gebruiken.',
            fr: 'Terraform provisionne l’infrastructure de façon déclarative et suit l’état pour créer, modifier et détruire des ressources ; Ansible configure ce qui s’y exécute (paquets, fichiers, services), souvent de manière procédurale et sans agent. Ils se recoupent mais se complètent. Bonne réponse : idempotence des deux, infrastructure immuable contre mutable, et Terraform pour la plateforme, Ansible/cloud-init pour la configuration.'
        }
    },
    {
        id: 'ops-containers-docker', cat: 'devops', roles: ['devops', 'dev-backend'], level: 'medior',
        q: {
            en: 'What problem does Docker solve, and what goes into a good image?',
            nl: 'Welk probleem lost Docker op, en wat maakt een goede image?',
            fr: 'Quel problème Docker résout-il et qu’est-ce qu’une bonne image ?'
        },
        a: {
            en: 'Docker packages an app with its dependencies into a portable image so it runs the same on a laptop, CI and production — killing "works on my machine". A good image is small and layered (multi-stage build), based on a minimal trusted base, runs as a non-root user, pins versions, and keeps secrets out. Strong answers mention layer caching, .dockerignore, and scanning images for vulnerabilities.',
            nl: 'Docker verpakt een app met zijn dependencies in een portable image zodat hij overal hetzelfde draait — op een laptop, in CI en in productie — en “werkt op mijn machine” verdwijnt. Een goede image is klein en gelaagd (multi-stage build), gebaseerd op een minimale vertrouwde base, draait als non-root, pint versies, en houdt secrets buiten. Sterk antwoord: layer caching, .dockerignore, en images scannen op kwetsbaarheden.',
            fr: 'Docker empaquette une application avec ses dépendances dans une image portable qui s’exécute à l’identique sur un portable, en CI et en production — finie la phrase « ça marche chez moi ». Une bonne image est petite et en couches (build multi-étapes), fondée sur une base minimale de confiance, s’exécute en non-root, épingle les versions et exclut les secrets. Bonne réponse : cache de couches, .dockerignore et analyse des vulnérabilités.'
        }
    },
    {
        id: 'ops-monitoring-observability', cat: 'devops', roles: ['monitoring', 'devops'], level: 'medior',
        q: {
            en: 'What is the difference between monitoring and observability, and what would you alert on?',
            nl: 'Wat is het verschil tussen monitoring en observability, en waarop zou je alerteren?',
            fr: 'Quelle différence entre supervision et observabilité, et sur quoi alerteriez-vous ?'
        },
        a: {
            en: 'Monitoring watches known metrics and thresholds; observability (metrics, logs, traces) lets you ask new questions about why a system behaves as it does, including failures you did not predict. Alert on symptoms that hurt users (latency, error rate, saturation, availability) not every raw metric, to avoid alert fatigue. Strong answers mention SLIs/SLOs, actionable alerts and correlation across the three signals.',
            nl: 'Monitoring bewaakt gekende metrics en drempels; observability (metrics, logs, traces) laat je nieuwe vragen stellen over waarom een systeem zich zo gedraagt, inclusief onvoorziene storingen. Alerteer op symptomen die gebruikers raken (latency, error rate, saturatie, beschikbaarheid), niet op elke ruwe metric, om alert fatigue te vermijden. Sterk antwoord: SLI’s/SLO’s, actionable alerts en correlatie over de drie signalen.',
            fr: 'La supervision surveille des métriques et seuils connus ; l’observabilité (métriques, logs, traces) permet de poser de nouvelles questions sur le pourquoi du comportement d’un système, y compris des pannes imprévues. Alertez sur les symptômes qui touchent les utilisateurs (latence, taux d’erreur, saturation, disponibilité), pas sur chaque métrique brute, pour éviter la fatigue d’alertes. Bonne réponse : SLI/SLO, alertes exploitables et corrélation des trois signaux.'
        }
    },
    {
        id: 'ops-blue-green', cat: 'devops', roles: ['devops', 'cloud-architecture'], level: 'senior',
        q: {
            en: 'Compare blue-green and canary deployments.',
            nl: 'Vergelijk blue-green en canary deployments.',
            fr: 'Comparez les déploiements blue-green et canary.'
        },
        a: {
            en: 'Blue-green runs two full environments and switches all traffic at once, giving an instant rollback by switching back. Canary releases the new version to a small slice of traffic, watches metrics, then ramps up, limiting blast radius. Strong answers weigh cost and complexity, mention database/schema compatibility during rollout, feature flags, and automated rollback on error-rate regression.',
            nl: 'Blue-green draait twee volledige omgevingen en schakelt al het verkeer in één keer om, met een directe rollback door terug te schakelen. Canary brengt de nieuwe versie uit naar een klein deel van het verkeer, bekijkt metrics en schaalt dan op, wat de blast radius beperkt. Sterk antwoord: kost en complexiteit afwegen, database/schema-compatibiliteit tijdens uitrol, feature flags, en automatische rollback bij error-rate-regressie.',
            fr: 'Le blue-green fait tourner deux environnements complets et bascule tout le trafic d’un coup, offrant un retour arrière instantané. Le canary publie la nouvelle version vers une petite part du trafic, surveille les métriques puis monte en charge, limitant le rayon d’impact. Bonne réponse : peser coût et complexité, compatibilité base/schéma pendant le déploiement, feature flags et retour arrière automatique en cas de régression du taux d’erreur.'
        }
    },
    {
        id: 'ops-secrets-mgmt', cat: 'devops', roles: ['devops', 'security-ops'], level: 'medior',
        q: {
            en: 'How do you handle secrets like API keys and passwords in a pipeline?',
            nl: 'Hoe ga je om met secrets zoals API-sleutels en wachtwoorden in een pipeline?',
            fr: 'Comment gérez-vous les secrets comme les clés d’API et mots de passe dans un pipeline ?'
        },
        a: {
            en: 'Never commit secrets to the repo; store them in a secret manager (Key Vault, HashiCorp Vault, cloud secrets) or the CI secret store, inject them at runtime as masked variables, and scope them tightly. Strong answers mention rotation, short-lived credentials and workload identity/OIDC instead of long-lived keys, and scanning history for leaked secrets. Red flag: secrets hard-coded or printed in logs.',
            nl: 'Commit nooit secrets naar de repo; bewaar ze in een secret manager (Key Vault, HashiCorp Vault, cloud secrets) of de CI-secret-store, injecteer ze at runtime als gemaskeerde variabelen, en scope ze strak. Sterk antwoord: rotatie, kortlevende credentials en workload identity/OIDC in plaats van langlevende sleutels, en de historiek scannen op gelekte secrets. Alarmbel: secrets hard-coded of geprint in logs.',
            fr: 'Ne validez jamais de secrets dans le dépôt ; stockez-les dans un gestionnaire de secrets (Key Vault, HashiCorp Vault, secrets cloud) ou le coffre CI, injectez-les à l’exécution en variables masquées et limitez leur portée. Bonne réponse : rotation, identifiants éphémères et identité de charge de travail/OIDC plutôt que des clés durables, et analyse de l’historique à la recherche de fuites. Signal d’alarme : secrets codés en dur ou affichés dans les journaux.'
        }
    },
    {
        id: 'ops-gitops', cat: 'devops', roles: ['devops', 'scripting'], level: 'senior',
        q: {
            en: 'What is GitOps and what are its benefits?',
            nl: 'Wat is GitOps en wat zijn de voordelen?',
            fr: 'Qu’est-ce que le GitOps et quels sont ses avantages ?'
        },
        a: {
            en: 'GitOps makes a Git repository the single source of truth for the desired state, and an agent continuously reconciles the running system to match it, so changes happen through pull requests rather than manual commands. Benefits: auditability, easy rollback (revert a commit), consistency and drift detection. Strong answers mention reconciliation, separating config from code, and that it suits declarative platforms like Kubernetes.',
            nl: 'GitOps maakt een Git-repository de single source of truth voor de gewenste staat, en een agent verzoent het draaiende systeem continu ermee, zodat wijzigingen via pull requests gebeuren in plaats van manuele commando’s. Voordelen: auditbaarheid, makkelijke rollback (een commit reverten), consistentie en drift-detectie. Sterk antwoord: reconciliatie, config van code scheiden, en dat het past bij declaratieve platformen zoals Kubernetes.',
            fr: 'Le GitOps fait d’un dépôt Git la source unique de vérité pour l’état désiré, et un agent réconcilie en continu le système en cours pour qu’il corresponde, si bien que les changements passent par des pull requests plutôt que des commandes manuelles. Avantages : auditabilité, retour arrière facile (annuler un commit), cohérence et détection de dérive. Bonne réponse : réconciliation, séparer config et code, et son adéquation aux plateformes déclaratives comme Kubernetes.'
        }
    },

    /* ---- Data & reporting ----------------------------------------------- */
    {
        id: 'data-etl-elt', cat: 'data', roles: ['data-analytics', 'databases'], level: 'medior',
        q: {
            en: 'What is the difference between ETL and ELT?',
            nl: 'Wat is het verschil tussen ETL en ELT?',
            fr: 'Quelle est la différence entre ETL et ELT ?'
        },
        a: {
            en: 'ETL transforms data before loading it into the target, so only shaped data lands; ELT loads raw data first and transforms inside a powerful warehouse. ELT suits modern cloud warehouses that can scale compute and keep raw data for flexibility; ETL still fits when you must cleanse or mask before landing. Strong answers mention data volume, cost, governance and keeping raw data for reprocessing.',
            nl: 'ETL transformeert data vóór het laden in de bestemming, zodat enkel bewerkte data binnenkomt; ELT laadt eerst ruwe data en transformeert binnen een krachtige warehouse. ELT past bij moderne cloudwarehouses die compute schalen en ruwe data bewaren voor flexibiliteit; ETL past nog wanneer je moet cleansen of maskeren vóór het landen. Sterk antwoord: datavolume, kost, governance en ruwe data bewaren voor herverwerking.',
            fr: 'L’ETL transforme les données avant de les charger dans la cible, si bien que seules des données mises en forme arrivent ; l’ELT charge d’abord les données brutes et les transforme dans un entrepôt puissant. L’ELT convient aux entrepôts cloud modernes qui font évoluer le calcul et conservent le brut pour la flexibilité ; l’ETL reste pertinent quand il faut nettoyer ou masquer avant l’arrivée. Bonne réponse : volume, coût, gouvernance et conservation du brut pour retraitement.'
        }
    },
    {
        id: 'data-warehouse-lake', cat: 'data', roles: ['data-analytics', 'cloud-architecture'], level: 'medior',
        q: {
            en: 'What is the difference between a data warehouse and a data lake?',
            nl: 'Wat is het verschil tussen een data warehouse en een data lake?',
            fr: 'Quelle est la différence entre un entrepôt de données et un lac de données ?'
        },
        a: {
            en: 'A warehouse stores structured, modelled data optimised for fast SQL analytics (schema-on-write); a lake stores raw data of any type cheaply and applies structure when read (schema-on-read), suiting data science and unstructured data. Strong answers mention the lakehouse converging the two, governance and the risk of a lake becoming a swamp without cataloguing and quality control.',
            nl: 'Een warehouse bewaart gestructureerde, gemodelleerde data geoptimaliseerd voor snelle SQL-analytics (schema-on-write); een lake bewaart ruwe data van elk type goedkoop en legt structuur op bij het lezen (schema-on-read), passend voor data science en ongestructureerde data. Sterk antwoord: de lakehouse die beide samenbrengt, governance en het risico dat een lake een swamp wordt zonder catalogisering en kwaliteitscontrole.',
            fr: 'Un entrepôt stocke des données structurées et modélisées, optimisées pour l’analyse SQL rapide (schéma à l’écriture) ; un lac stocke à bas coût des données brutes de tout type et applique la structure à la lecture (schéma à la lecture), adapté à la data science et au non structuré. Bonne réponse : le lakehouse qui converge les deux, la gouvernance et le risque qu’un lac devienne un marécage sans catalogage ni contrôle qualité.'
        }
    },
    {
        id: 'data-kpi-dashboard', cat: 'data', roles: ['data-analytics'], level: 'junior',
        q: {
            en: 'What makes a good KPI, and what makes a good dashboard?',
            nl: 'Wat maakt een goede KPI, en wat maakt een goed dashboard?',
            fr: 'Qu’est-ce qu’un bon KPI et un bon tableau de bord ?'
        },
        a: {
            en: 'A good KPI is tied to a decision or goal, measurable, and hard to game — a metric you would actually act on, not a vanity number. A good dashboard answers a specific question for a specific audience, shows context (target, trend, comparison), avoids clutter, and leads the eye to what matters. Strong answers mention the audience, actionability and the difference between a metric and a KPI.',
            nl: 'Een goede KPI is gekoppeld aan een beslissing of doel, meetbaar, en moeilijk te manipuleren — een metric waarnaar je echt zou handelen, geen vanity-getal. Een goed dashboard beantwoordt een specifieke vraag voor een specifiek publiek, toont context (target, trend, vergelijking), vermijdt rommel, en leidt het oog naar wat telt. Sterk antwoord: het publiek, actionability en het verschil tussen een metric en een KPI.',
            fr: 'Un bon KPI est lié à une décision ou un objectif, mesurable et difficile à manipuler — une mesure sur laquelle on agit vraiment, pas un chiffre de vanité. Un bon tableau de bord répond à une question précise pour un public précis, montre le contexte (cible, tendance, comparaison), évite l’encombrement et guide l’œil vers l’essentiel. Bonne réponse : le public, l’actionnabilité et la différence entre une mesure et un KPI.'
        }
    },
    {
        id: 'data-quality', cat: 'data', roles: ['data-analytics', 'databases'], level: 'medior',
        q: {
            en: 'How do you deal with poor data quality in a reporting pipeline?',
            nl: 'Hoe ga je om met slechte datakwaliteit in een rapporteringspijplijn?',
            fr: 'Comment gérez-vous une mauvaise qualité de données dans un pipeline de reporting ?'
        },
        a: {
            en: 'Profile the data to find the issues (missing, duplicate, inconsistent, out-of-range), then add validation and tests in the pipeline that fail loudly, handle nulls and deduplication deliberately, and fix problems at the source where possible rather than patching downstream. Strong answers mention data contracts, monitoring quality over time, and being transparent about caveats instead of silently "cleaning" figures.',
            nl: 'Profileer de data om de problemen te vinden (ontbrekend, dubbel, inconsistent, buiten bereik), voeg dan validatie en tests toe in de pipeline die luid falen, ga bewust om met nulls en deduplicatie, en fix problemen aan de bron waar mogelijk in plaats van stroomafwaarts te patchen. Sterk antwoord: data contracts, kwaliteit over tijd monitoren, en transparant zijn over voorbehouden in plaats van cijfers stil te “kuisen”.',
            fr: 'Profilez les données pour trouver les problèmes (manquant, doublon, incohérent, hors plage), puis ajoutez validation et tests qui échouent bruyamment dans le pipeline, gérez délibérément les valeurs nulles et la déduplication, et corrigez à la source quand c’est possible plutôt qu’en aval. Bonne réponse : contrats de données, suivi de la qualité dans le temps et transparence sur les réserves plutôt que « nettoyer » les chiffres en silence.'
        }
    },
    {
        id: 'data-powerbi', cat: 'data', roles: ['data-analytics', 'office-suite'], level: 'junior',
        q: {
            en: 'You are asked to build a monthly sales report in Power BI. How do you approach it?',
            nl: 'Je wordt gevraagd een maandelijks verkooprapport in Power BI te bouwen. Hoe pak je dat aan?',
            fr: 'On vous demande de construire un rapport de ventes mensuel dans Power BI. Comment procédez-vous ?'
        },
        a: {
            en: 'Clarify the questions and audience first, then connect and shape the data (Power Query), build a clean model with a date table and relationships, write the measures (DAX) you need, and design a focused report with the right visuals and filters. Strong answers mention a star schema, refresh and data source credentials, row-level security if needed, and validating the numbers against a known source.',
            nl: 'Verhelder eerst de vragen en het publiek, verbind en bewerk dan de data (Power Query), bouw een net model met een datumtabel en relaties, schrijf de nodige measures (DAX), en ontwerp een gefocust rapport met de juiste visuals en filters. Sterk antwoord: een sterschema, refresh en databronreferenties, row-level security indien nodig, en de cijfers valideren tegen een gekende bron.',
            fr: 'Clarifiez d’abord les questions et le public, puis connectez et mettez en forme les données (Power Query), construisez un modèle propre avec une table de dates et des relations, écrivez les mesures (DAX) nécessaires, et concevez un rapport ciblé avec les bons visuels et filtres. Bonne réponse : un schéma en étoile, l’actualisation et les identifiants de source, la sécurité au niveau des lignes au besoin, et la validation des chiffres face à une source connue.'
        }
    },
    {
        id: 'data-gdpr-privacy', cat: 'data', roles: ['data-analytics', 'security-ops'], level: 'senior',
        q: {
            en: 'What do you need to consider about privacy when working with personal data in analytics?',
            nl: 'Waar moet je op letten qua privacy bij het werken met persoonsgegevens in analytics?',
            fr: 'Que devez-vous considérer en matière de vie privée en travaillant avec des données personnelles en analytique ?'
        },
        a: {
            en: 'Under GDPR you need a lawful basis and purpose limitation, data minimisation (only what you need), and to protect the data with access control, encryption and retention limits. For analytics, prefer anonymisation or pseudonymisation, and remember aggregated stats can still re-identify people. Strong answers mention DPIAs for high-risk processing, and that consent for one purpose does not cover another.',
            nl: 'Onder GDPR heb je een rechtsgrond en doelbinding nodig, dataminimalisatie (enkel wat nodig is), en bescherming met toegangscontrole, encryptie en retentielimieten. Voor analytics: verkies anonimisering of pseudonimisering, en onthoud dat geaggregeerde statistieken mensen toch kunnen heridentificeren. Sterk antwoord: DPIA’s voor hoog-risicoverwerking, en dat toestemming voor één doel niet geldt voor een ander.',
            fr: 'Sous le RGPD, il faut une base légale et une limitation de finalité, la minimisation des données (seulement le nécessaire), et une protection par contrôle d’accès, chiffrement et limites de conservation. En analytique, préférez l’anonymisation ou la pseudonymisation, et rappelez-vous que des statistiques agrégées peuvent encore ré-identifier des personnes. Bonne réponse : AIPD pour les traitements à risque, et le consentement pour une finalité ne couvre pas une autre.'
        }
    },

    /* ---- AI & machine learning ------------------------------------------ */
    {
        id: 'ai-ml-basics', cat: 'ai', roles: ['ai-ml', 'data-analytics'], level: 'junior',
        q: {
            en: 'What is machine learning, and how is it different from traditional programming?',
            nl: 'Wat is machine learning en hoe verschilt het van traditioneel programmeren?',
            fr: 'Qu’est-ce que l’apprentissage automatique et en quoi diffère-t-il de la programmation traditionnelle ?'
        },
        a: {
            en: 'In traditional programming you write the rules; in machine learning you give examples and the model learns the patterns to make predictions on new data. Strong answers give a concrete case (spam detection, demand forecasting), mention training versus inference and the need for representative data, and are realistic that ML is probabilistic and can be wrong, not magic.',
            nl: 'In traditioneel programmeren schrijf je de regels; in machine learning geef je voorbeelden en leert het model de patronen om voorspellingen te doen op nieuwe data. Sterk antwoord: een concreet geval (spamdetectie, vraagvoorspelling), training versus inference en de nood aan representatieve data, en realistisch zijn dat ML probabilistisch is en fout kan zijn, geen magie.',
            fr: 'En programmation traditionnelle, vous écrivez les règles ; en apprentissage automatique, vous fournissez des exemples et le modèle apprend les motifs pour prédire sur de nouvelles données. Bonne réponse : un cas concret (détection de spam, prévision de demande), entraînement contre inférence et besoin de données représentatives, et le réalisme que le ML est probabiliste et faillible, pas magique.'
        }
    },
    {
        id: 'ai-supervised-unsupervised', cat: 'ai', roles: ['ai-ml', 'data-analytics'], level: 'medior',
        q: {
            en: 'What is the difference between supervised and unsupervised learning?',
            nl: 'Wat is het verschil tussen supervised en unsupervised learning?',
            fr: 'Quelle est la différence entre apprentissage supervisé et non supervisé ?'
        },
        a: {
            en: 'Supervised learning trains on labelled data to predict a known target — classification or regression; unsupervised learning finds structure in unlabelled data — clustering or dimensionality reduction. Strong answers give examples (churn prediction versus customer segmentation), mention that labels are expensive, and can add reinforcement learning and semi-supervised approaches for completeness.',
            nl: 'Supervised learning traint op gelabelde data om een gekend doel te voorspellen — classificatie of regressie; unsupervised learning vindt structuur in ongelabelde data — clustering of dimensionaliteitsreductie. Sterk antwoord: voorbeelden (churn-voorspelling versus klantsegmentatie), dat labels duur zijn, en eventueel reinforcement learning en semi-supervised aanpakken toevoegen.',
            fr: 'L’apprentissage supervisé s’entraîne sur des données étiquetées pour prédire une cible connue — classification ou régression ; le non supervisé trouve une structure dans des données non étiquetées — clustering ou réduction de dimension. Bonne réponse : des exemples (prédiction d’attrition contre segmentation client), le coût des étiquettes, et éventuellement l’apprentissage par renforcement et semi-supervisé.'
        }
    },
    {
        id: 'ai-llm-rag', cat: 'ai', roles: ['ai-ml', 'dev-backend'], level: 'medior',
        q: {
            en: 'What is a large language model, and what is retrieval-augmented generation (RAG)?',
            nl: 'Wat is een large language model en wat is retrieval-augmented generation (RAG)?',
            fr: 'Qu’est-ce qu’un grand modèle de langage et qu’est-ce que la génération augmentée par récupération (RAG) ?'
        },
        a: {
            en: 'An LLM predicts the next token from vast training text, so it is fluent but limited to what it learned and can hallucinate. RAG retrieves relevant documents (often via a vector search) and feeds them into the prompt so the model answers grounded in your own, up-to-date data with citations. Strong answers mention embeddings, chunking, why RAG reduces hallucination and keeps data current without retraining.',
            nl: 'Een LLM voorspelt de volgende token uit enorme trainingtekst, dus het is vlot maar beperkt tot wat het leerde en kan hallucineren. RAG haalt relevante documenten op (vaak via vector search) en voedt ze in de prompt zodat het model antwoordt op basis van je eigen, actuele data met bronnen. Sterk antwoord: embeddings, chunking, waarom RAG hallucinatie vermindert en data actueel houdt zonder hertrainen.',
            fr: 'Un LLM prédit le token suivant à partir d’un immense corpus : il est fluide mais limité à ce qu’il a appris et peut halluciner. Le RAG récupère des documents pertinents (souvent via une recherche vectorielle) et les injecte dans le prompt pour que le modèle réponde en s’appuyant sur vos données à jour, avec citations. Bonne réponse : embeddings, découpage, et pourquoi le RAG réduit l’hallucination et maintient les données à jour sans réentraînement.'
        }
    },
    {
        id: 'ai-prompt-engineering', cat: 'ai', roles: ['ai-ml'], level: 'junior',
        q: {
            en: 'What are some practical ways to get better results from an AI assistant?',
            nl: 'Wat zijn praktische manieren om betere resultaten uit een AI-assistent te halen?',
            fr: 'Quelles sont des façons pratiques d’obtenir de meilleurs résultats d’un assistant IA ?'
        },
        a: {
            en: 'Be specific about the goal, give context and constraints, show an example of the desired output, and iterate. Strong answers mention breaking a task into steps, asking the model to reason or check its work, providing the source material rather than trusting its memory, and always verifying facts and code. Listen for healthy scepticism about hallucination and data privacy.',
            nl: 'Wees specifiek over het doel, geef context en beperkingen, toon een voorbeeld van de gewenste output, en itereer. Sterk antwoord: een taak in stappen opdelen, het model laten redeneren of zijn werk laten controleren, het bronmateriaal aanleveren in plaats van op zijn geheugen te vertrouwen, en altijd feiten en code verifiëren. Let op gezonde scepsis over hallucinatie en dataprivacy.',
            fr: 'Soyez précis sur l’objectif, donnez contexte et contraintes, montrez un exemple du résultat souhaité, et itérez. Bonne réponse : découper une tâche en étapes, demander au modèle de raisonner ou de vérifier son travail, fournir la source plutôt que se fier à sa mémoire, et toujours vérifier faits et code. À écouter : un scepticisme sain sur l’hallucination et la confidentialité des données.'
        }
    },
    {
        id: 'ai-model-evaluation', cat: 'ai', roles: ['ai-ml', 'data-analytics'], level: 'senior',
        q: {
            en: 'Why is accuracy a poor metric on imbalanced data, and what would you use instead?',
            nl: 'Waarom is accuracy een slechte metric op ongebalanceerde data, en wat gebruik je in de plaats?',
            fr: 'Pourquoi l’exactitude est-elle une mauvaise mesure sur des données déséquilibrées, et qu’utiliser à la place ?'
        },
        a: {
            en: 'If 99% of cases are negative, a model that always predicts negative scores 99% accuracy while catching nothing. Use precision, recall, F1, and ROC/PR-AUC, and choose the balance based on the cost of false positives versus false negatives (fraud, disease). Strong answers mention the confusion matrix, threshold tuning, class weighting/resampling, and a proper train/validation/test split.',
            nl: 'Als 99% van de gevallen negatief is, scoort een model dat altijd negatief voorspelt 99% accuracy terwijl het niets vangt. Gebruik precision, recall, F1, en ROC/PR-AUC, en kies de balans op basis van de kost van false positives versus false negatives (fraude, ziekte). Sterk antwoord: de confusion matrix, threshold tuning, class weighting/resampling, en een correcte train/validatie/test-split.',
            fr: 'Si 99 % des cas sont négatifs, un modèle qui prédit toujours négatif atteint 99 % d’exactitude sans rien détecter. Utilisez précision, rappel, F1 et ROC/PR-AUC, et choisissez l’équilibre selon le coût des faux positifs contre faux négatifs (fraude, maladie). Bonne réponse : la matrice de confusion, l’ajustement du seuil, la pondération/rééchantillonnage des classes et une séparation entraînement/validation/test correcte.'
        }
    },
    {
        id: 'ai-ethics-bias', cat: 'ai', roles: ['ai-ml', 'security-ops'], level: 'medior',
        q: {
            en: 'What risks would you consider before putting an AI model into production?',
            nl: 'Welke risico’s hou je in gedachten vóór je een AI-model in productie zet?',
            fr: 'Quels risques considérez-vous avant de mettre un modèle d’IA en production ?'
        },
        a: {
            en: 'Bias and fairness from skewed training data, privacy and consent for the data used, security (prompt injection, data leakage), hallucination and over-reliance, plus explainability and accountability for decisions. Strong answers add human-in-the-loop for high-stakes calls, monitoring for drift, a rollback plan, and awareness of regulation like the EU AI Act and its risk tiers.',
            nl: 'Bias en fairness door scheve trainingdata, privacy en toestemming voor de gebruikte data, security (prompt injection, datalekken), hallucinatie en overafhankelijkheid, plus verklaarbaarheid en verantwoording voor beslissingen. Sterk antwoord: human-in-the-loop voor zwaarwegende beslissingen, monitoren op drift, een rollback-plan, en besef van regelgeving zoals de EU AI Act en zijn risicoklassen.',
            fr: 'Biais et équité dus à des données d’entraînement déséquilibrées, vie privée et consentement pour les données utilisées, sécurité (injection de prompt, fuite de données), hallucination et dépendance excessive, plus explicabilité et responsabilité des décisions. Bonne réponse : un humain dans la boucle pour les décisions à enjeux, la surveillance de la dérive, un plan de retour arrière et la connaissance de réglementations comme l’AI Act européen et ses niveaux de risque.'
        }
    }
]);
