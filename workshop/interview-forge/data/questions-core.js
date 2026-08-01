/* ==========================================================================
   Interview Forge — core question bank (en / nl / fr).
   Append more files in this folder with the same shape; they concat onto
   window.IF_QUESTIONS. See README.md.
   ========================================================================== */
window.IF_QUESTIONS = (window.IF_QUESTIONS || []).concat([
    /* ---- Networking ----------------------------------------------------- */
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

    /* ---- Behaviour & motivation ---------------------------------------------- */
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

    /* ---- DISC ---------------------------------------------------------------- */
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
    }
]);
