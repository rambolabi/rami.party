/* ==========================================================================
   Subnet Studio — fully local subnet calculator + theme engine.
   No external dependencies, no network calls.
   ========================================================================== */
(function () {
    'use strict';

    const K_THEME = 'subnet-studio:theme';
    const K_LANG = 'subnet-studio:lang';
    const K_MODE = 'subnet-studio:mode';
    const THEMES = [
        { id: 'aurora', name: 'Aurora', sw: ['#a855f7', '#22d3ee'] },
        { id: 'midnight', name: 'Midnight', sw: ['#3b82f6', '#38bdf8'] },
        { id: 'solar', name: 'Solar', sw: ['#b58900', '#cb4b16'] },
        { id: 'nord', name: 'Nord', sw: ['#5e81ac', '#88c0d0'] },
        { id: 'dracula', name: 'Dracula', sw: ['#bd93f9', '#ff79c6'] },
        { id: 'rose', name: 'Rosé Pine', sw: ['#c4a7e7', '#ebbcba'] },
        { id: 'matrix', name: 'Matrix', sw: ['#00ff66', '#008f39'] },
        { id: 'paper', name: 'Paper', sw: ['#2563eb', '#db2777'] },
        { id: 'sunset', name: 'Sunset', sw: ['#fb923c', '#f472b6'] },
        { id: 'cyberpunk', name: 'Cyberpunk', sw: ['#ff00c8', '#00f0ff'] }
    ];

    /* --- Languages -------------------------------------------------------- */
    const LANGS = [
        { id: 'nl', name: 'Nederlands', flag: '🇳🇱', locale: 'nl-BE' },
        { id: 'en', name: 'English', flag: '🇬🇧', locale: 'en-US' },
        { id: 'fr', name: 'Français', flag: '🇫🇷', locale: 'fr-FR' }
    ];
    const I18N = {
        nl: {
            brand_tag: 'IPv4 · lokaal · privé',
            title: 'Subnet Calculator — IPv4 CIDR, netmask & host bereik | rami.party',
            meta_desc: 'Gratis, snelle en privacyvriendelijke IPv4 subnet calculator. Bereken netwerkadres, broadcast, subnetmasker, wildcard, CIDR-prefix, bruikbare hosts en IP-klasse. Werkt volledig lokaal in je browser — geen tracking.',
            hero_desc: 'Bereken in één klik netwerkadres, broadcast, subnetmasker, wildcard, bruikbare hosts en de IP-klasse. Alles gebeurt lokaal in je browser — er wordt niets verstuurd.',
            calc_title: 'Bereken een subnet',
            ip_label: 'IP-adres',
            prefix_label: 'Prefix (/CIDR)',
            calc_button: 'Bereken',
            examples_label: 'Voorbeelden:',
            bin_label: 'Netwerk in binair (netwerkbits gemarkeerd)',
            info_title: 'IP-klassen & privé-adressen',
            classes_title: 'IP-klassen',
            classes_body: '<strong>Klasse A</strong> — <code>0.0.0.0</code> t/m <code>127.255.255.255</code> (<code>/8</code>), grote netwerken.<br><strong>Klasse B</strong> — <code>128.0.0.0</code> t/m <code>191.255.255.255</code> (<code>/16</code>), middelgrote netwerken.<br><strong>Klasse C</strong> — <code>192.0.0.0</code> t/m <code>223.255.255.255</code> (<code>/24</code>), kleine netwerken.',
            private_title: 'Privé-bereiken',
            private_body: 'Gereserveerd voor intern gebruik en niet direct bereikbaar vanaf internet.<br><strong>Klasse A</strong> — <code>10.0.0.0</code> t/m <code>10.255.255.255</code><br><strong>Klasse B</strong> — <code>172.16.0.0</code> t/m <code>172.31.255.255</code><br><strong>Klasse C</strong> — <code>192.168.0.0</code> t/m <code>192.168.255.255</code>',
            table_title: 'Prefix-referentietabel',
            th_addresses: 'Adressen', th_bits: 'Bits', th_prefix: 'Prefix', th_classful: 'Klassevorm', th_mask: 'Masker',
            footer: 'Gemaakt met ♥ op <a href="https://rami.party/">rami.party</a> · alles draait lokaal, geen tracking.',
            net_address: 'Netwerkadres', broadcast: 'Broadcastadres',
            first_host: 'Eerste bruikbare host', last_host: 'Laatste bruikbare host',
            subnet_mask: 'Subnetmasker', wildcard: 'Wildcard mask',
            usable_hosts: 'Bruikbare hosts', total_addr: 'Totaal adressen', cidr_prefix: 'CIDR-prefix',
            class_tag: 'Klasse {L} · {note}', private_tag: 'Privé-adres', public_tag: 'Publiek-adres',
            note_large: 'grote netwerken', note_medium: 'middelgrote netwerken', note_small: 'kleine netwerken',
            note_multicast: 'multicast', note_experimental: 'experimenteel',
            sp_loopback: 'loopback', sp_linklocal: 'link-local', sp_multicast: 'multicast',
            err_ip: 'Ongeldig IP-adres. Gebruik het formaat 192.168.1.0.',
            err_prefix: 'Prefix moet tussen 0 en 32 liggen.',
            copied: 'Gekopieerd: '
        },
        en: {
            brand_tag: 'IPv4 · local · private',
            title: 'Subnet Calculator — IPv4 CIDR, netmask & host range | rami.party',
            meta_desc: 'Free, fast and privacy-friendly IPv4 subnet calculator. Compute network address, broadcast, subnet mask, wildcard, CIDR prefix, usable hosts and IP class. Runs entirely locally in your browser — no tracking.',
            hero_desc: 'Calculate the network address, broadcast, subnet mask, wildcard, usable hosts and IP class in one click. Everything runs locally in your browser — nothing is sent.',
            calc_title: 'Calculate a subnet',
            ip_label: 'IP address',
            prefix_label: 'Prefix (/CIDR)',
            calc_button: 'Calculate',
            examples_label: 'Examples:',
            bin_label: 'Network in binary (network bits highlighted)',
            info_title: 'IP classes & private addresses',
            classes_title: 'IP classes',
            classes_body: '<strong>Class A</strong> — <code>0.0.0.0</code> to <code>127.255.255.255</code> (<code>/8</code>), large networks.<br><strong>Class B</strong> — <code>128.0.0.0</code> to <code>191.255.255.255</code> (<code>/16</code>), medium networks.<br><strong>Class C</strong> — <code>192.0.0.0</code> to <code>223.255.255.255</code> (<code>/24</code>), small networks.',
            private_title: 'Private ranges',
            private_body: 'Reserved for internal use and not directly reachable from the internet.<br><strong>Class A</strong> — <code>10.0.0.0</code> to <code>10.255.255.255</code><br><strong>Class B</strong> — <code>172.16.0.0</code> to <code>172.31.255.255</code><br><strong>Class C</strong> — <code>192.168.0.0</code> to <code>192.168.255.255</code>',
            table_title: 'Prefix reference table',
            th_addresses: 'Addresses', th_bits: 'Bits', th_prefix: 'Prefix', th_classful: 'Classful', th_mask: 'Mask',
            footer: 'Made with ♥ on <a href="https://rami.party/">rami.party</a> · runs entirely locally, no tracking.',
            net_address: 'Network address', broadcast: 'Broadcast address',
            first_host: 'First usable host', last_host: 'Last usable host',
            subnet_mask: 'Subnet mask', wildcard: 'Wildcard mask',
            usable_hosts: 'Usable hosts', total_addr: 'Total addresses', cidr_prefix: 'CIDR prefix',
            class_tag: 'Class {L} · {note}', private_tag: 'Private address', public_tag: 'Public address',
            note_large: 'large networks', note_medium: 'medium networks', note_small: 'small networks',
            note_multicast: 'multicast', note_experimental: 'experimental',
            sp_loopback: 'loopback', sp_linklocal: 'link-local', sp_multicast: 'multicast',
            err_ip: 'Invalid IP address. Use the format 192.168.1.0.',
            err_prefix: 'Prefix must be between 0 and 32.',
            copied: 'Copied: '
        },
        fr: {
            brand_tag: 'IPv4 · local · privé',
            title: 'Calculateur de sous-réseau — IPv4 CIDR, masque & plage d\'hôtes | rami.party',
            meta_desc: 'Calculateur de sous-réseau IPv4 gratuit, rapide et respectueux de la vie privée. Calculez l\'adresse réseau, le broadcast, le masque, le wildcard, le préfixe CIDR, les hôtes utilisables et la classe IP. Fonctionne entièrement en local — sans traçage.',
            hero_desc: 'Calculez en un clic l\'adresse réseau, le broadcast, le masque de sous-réseau, le wildcard, les hôtes utilisables et la classe IP. Tout se passe localement dans votre navigateur — rien n\'est envoyé.',
            calc_title: 'Calculer un sous-réseau',
            ip_label: 'Adresse IP',
            prefix_label: 'Préfixe (/CIDR)',
            calc_button: 'Calculer',
            examples_label: 'Exemples :',
            bin_label: 'Réseau en binaire (bits réseau en surbrillance)',
            info_title: 'Classes IP & adresses privées',
            classes_title: 'Classes IP',
            classes_body: '<strong>Classe A</strong> — <code>0.0.0.0</code> à <code>127.255.255.255</code> (<code>/8</code>), grands réseaux.<br><strong>Classe B</strong> — <code>128.0.0.0</code> à <code>191.255.255.255</code> (<code>/16</code>), réseaux moyens.<br><strong>Classe C</strong> — <code>192.0.0.0</code> à <code>223.255.255.255</code> (<code>/24</code>), petits réseaux.',
            private_title: 'Plages privées',
            private_body: 'Réservées à un usage interne et non joignables directement depuis Internet.<br><strong>Classe A</strong> — <code>10.0.0.0</code> à <code>10.255.255.255</code><br><strong>Classe B</strong> — <code>172.16.0.0</code> à <code>172.31.255.255</code><br><strong>Classe C</strong> — <code>192.168.0.0</code> à <code>192.168.255.255</code>',
            table_title: 'Table de référence des préfixes',
            th_addresses: 'Adresses', th_bits: 'Bits', th_prefix: 'Préfixe', th_classful: 'Forme classée', th_mask: 'Masque',
            footer: 'Fait avec ♥ sur <a href="https://rami.party/">rami.party</a> · fonctionne entièrement en local, sans traçage.',
            net_address: 'Adresse réseau', broadcast: 'Adresse de broadcast',
            first_host: 'Premier hôte utilisable', last_host: 'Dernier hôte utilisable',
            subnet_mask: 'Masque de sous-réseau', wildcard: 'Masque générique',
            usable_hosts: 'Hôtes utilisables', total_addr: 'Adresses totales', cidr_prefix: 'Préfixe CIDR',
            class_tag: 'Classe {L} · {note}', private_tag: 'Adresse privée', public_tag: 'Adresse publique',
            note_large: 'grands réseaux', note_medium: 'réseaux moyens', note_small: 'petits réseaux',
            note_multicast: 'multicast', note_experimental: 'expérimental',
            sp_loopback: 'loopback', sp_linklocal: 'link-local', sp_multicast: 'multicast',
            err_ip: 'Adresse IP invalide. Utilisez le format 192.168.1.0.',
            err_prefix: 'Le préfixe doit être compris entre 0 et 32.',
            copied: 'Copié : '
        }
    };

    /* --- Extra strings: tooltips, IPv6, glossary -------------------------- */
    const EXTRA_I18N = {
        nl: {
            hero_desc: 'Bereken in één klik alles over een IPv4- of IPv6-subnet: netwerkadres, broadcast, masker, bereik en meer. Met uitleg voor beginners. Alles lokaal in je browser — er wordt niets verstuurd.',
            tip_prefix: 'Het aantal netwerkbits. /24 = 24 bits voor het netwerk, de rest is voor hosts.',
            tip_network: 'Het eerste adres van het subnet; benoemt het netwerk zelf. Niet toewijsbaar aan een apparaat.',
            tip_broadcast: 'Het laatste adres; een bericht hierheen bereikt álle hosts in het subnet. Niet toewijsbaar.',
            tip_first_host: 'Het eerste adres dat je aan een apparaat kunt geven (netwerkadres + 1).',
            tip_last_host: 'Het laatste bruikbare adres (broadcast − 1).',
            tip_mask: 'Toont welk deel netwerk is (255) en welk deel host (0).',
            tip_wildcard: 'Het omgekeerde van het masker; gebruikt in firewalls, ACLs en OSPF.',
            tip_usable: 'Totaal aantal adressen min 2: netwerk- en broadcastadres kun je niet toewijzen.',
            tip_total: 'Alle adressen in het blok, inclusief netwerk- en broadcastadres (2^hostbits).',
            tip_cidr: 'Compacte schrijfwijze van het masker als /aantal-netwerkbits.',
            tip_v6_network: 'Het begin van het IPv6-blok, verkort volgens de standaard (RFC 5952).',
            tip_v6_first: 'Eerste adres van het bereik. In IPv6 het "subnet-router anycast"-adres, meestal gewoon bruikbaar.',
            tip_v6_last: 'Laatste adres van het bereik. IPv6 heeft geen broadcast, dus dit adres is gewoon bruikbaar.',
            tip_v6_total: 'Aantal adressen in het blok (2^(128−prefix)). Exact:',
            tip_v6_expanded: 'Het volledige adres zonder verkorting, met alle nullen uitgeschreven.',
            v6_net_address: 'Netwerk (verkort)', v6_first: 'Eerste adres', v6_last: 'Laatste adres',
            v6_expanded: 'Volledig adres', v6_prefix_len: 'Prefix-lengte',
            v6_unspecified: 'Niet-gespecificeerd (::)', v6_loopback: 'Loopback (::1)',
            v6_multicast: 'Multicast (ff00::/8)', v6_linklocal: 'Link-local (fe80::/10)',
            v6_ula: 'Unique Local · privé (fc00::/7)', v6_global: 'Global Unicast (2000::/3)',
            v6_other: 'Gereserveerd / overig', v6_doc: 'Documentatie (2001:db8::/32)',
            v6_nobroadcast: 'Geen broadcast',
            err_v6: 'Ongeldig IPv6-adres. Voorbeeld: 2001:db8::1',
            err_prefix6: 'Prefix moet tussen 0 en 128 liggen.',
            v6_info_title: 'IPv6-adrestypes & veelgebruikte prefixes',
            v6_types_title: 'Adrestypes',
            v6_types_body: '<strong>Global Unicast</strong> — <code>2000::/3</code>, publiek routeerbaar (zoals een publiek IPv4).<br><strong>Unique Local (ULA)</strong> — <code>fc00::/7</code> (in de praktijk <code>fd00::/8</code>), privé, zoals 192.168.x.x.<br><strong>Link-local</strong> — <code>fe80::/10</code>, alleen op de lokale link, automatisch aanwezig.<br><strong>Multicast</strong> — <code>ff00::/8</code>, één-naar-veel.<br><strong>Loopback</strong> — <code>::1</code> · <strong>Onbepaald</strong> — <code>::</code>',
            v6_prefixes_title: 'Veelgebruikte prefixes',
            v6_prefixes_body: 'IPv6 gebruikt geen subnetmaskers zoals IPv4 — alleen de prefixlengte telt.<br><strong>/48</strong> — een hele site.<br><strong>/56</strong> — vaak toegewezen aan thuisgebruikers.<br><strong>/64</strong> — één subnet (de standaard; kleiner breekt automatische adressering).<br><strong>/128</strong> — één enkel adres (host).',
            glossary_title: 'Beginnersgids: begrippen uitgelegd',
            glossary: [
                { cat: 'Algemeen' },
                { q: 'Wat is een subnet?', a: 'Een subnet is een afgebakend stukje van een groter netwerk. Opsplitsen houdt verkeer gescheiden, overzichtelijk en veiliger.' },
                { q: 'Wat betekent /24 of "CIDR"?', a: 'CIDR schrijft een netwerk als adres + prefix, bv. <code>192.168.1.0/24</code>. Het getal na de <code>/</code> is het aantal <strong>netwerkbits</strong>. Hoger getal = kleiner netwerk.' },
                { q: 'Netwerkbits vs hostbits?', a: 'Een adres heeft twee delen: de <strong>netwerkbits</strong> (welk netwerk) en de <strong>hostbits</strong> (welk apparaat). De prefix bepaalt de grens ertussen.' },
                { cat: 'IPv4' },
                { q: 'Netwerkadres en broadcast — wat zijn dat?', a: 'Het <strong>netwerkadres</strong> (eerste) benoemt het netwerk zelf. Het <strong>broadcastadres</strong> (laatste) stuurt naar álle hosts tegelijk. Beide kun je niet aan een apparaat geven.' },
                { q: 'Waarom "bruikbare hosts − 2"?', a: 'Omdat netwerk- en broadcastadres gereserveerd zijn. Een /24 heeft 256 adressen, waarvan 254 bruikbaar. Uitzonderingen: /31 (2 bruikbaar) en /32 (1 adres).' },
                { q: 'Subnetmasker vs wildcard?', a: 'Het <strong>subnetmasker</strong> (<code>255.255.255.0</code>) toont de netwerkbits als enen. Het <strong>wildcard</strong> is het omgekeerde (<code>0.0.0.255</code>), gebruikt in firewalls en routing.' },
                { q: 'Privé of publiek adres?', a: 'Privé-adressen (<code>10.x</code>, <code>172.16–31.x</code>, <code>192.168.x</code>) werken alleen binnen je eigen netwerk. Publieke adressen zijn rechtstreeks bereikbaar op internet.' },
                { cat: 'IPv6' },
                { q: 'Waarom ziet IPv6 er zo anders uit?', a: 'IPv6 gebruikt 128 bits (IPv4: 32) in <strong>hexadecimaal</strong>: 8 groepen van 4 tekens gescheiden door <code>:</code>, bv. <code>2001:db8:0:0:0:0:0:1</code>.' },
                { q: 'Wat betekent "::" ?', a: 'De dubbele dubbelepunt <code>::</code> vervangt één of meer groepen die allemaal nul zijn — maar één keer per adres. Zo wordt <code>2001:db8:0:0:0:0:0:1</code> korter: <code>2001:db8::1</code>.' },
                { q: 'Waarom bijna altijd /64?', a: 'Een <strong>/64</strong> is de standaard subnetgrootte in IPv6. Automatische adressering (SLAAC) verwacht 64 hostbits; kleinere subnetten breken dat meestal.' },
                { q: 'Heeft IPv6 een broadcast?', a: 'Nee. IPv6 kent geen broadcast; in de plaats komt <strong>multicast</strong> (<code>ff00::/8</code>). Daarom is er ook geen "−2" voor bruikbare adressen.' },
                { q: 'Wat is link-local (fe80::)?', a: 'Elk IPv6-apparaat krijgt automatisch een <code>fe80::</code>-adres dat alleen op de directe verbinding werkt — niet routeerbaar op internet.' }
            ]
        },
        en: {
            hero_desc: 'Calculate everything about an IPv4 or IPv6 subnet in one click: network address, broadcast, mask, range and more. With beginner-friendly explanations. Everything runs locally — nothing is sent.',
            tip_prefix: 'The number of network bits. /24 = 24 bits for the network, the rest for hosts.',
            tip_network: 'The first address of the subnet; identifies the network itself. Not assignable to a device.',
            tip_broadcast: 'The last address; a message here reaches every host in the subnet. Not assignable.',
            tip_first_host: 'The first address you can assign to a device (network address + 1).',
            tip_last_host: 'The last usable address (broadcast − 1).',
            tip_mask: 'Shows which part is network (255) and which is host (0).',
            tip_wildcard: 'The inverse of the mask; used in firewalls, ACLs and OSPF.',
            tip_usable: 'Total addresses minus 2: the network and broadcast addresses cannot be assigned.',
            tip_total: 'All addresses in the block, including network and broadcast (2^host-bits).',
            tip_cidr: 'Compact notation of the mask as /number-of-network-bits.',
            tip_v6_network: 'The start of the IPv6 block, compressed per the standard (RFC 5952).',
            tip_v6_first: 'First address of the range. In IPv6 this is the "subnet-router anycast" address, usually still usable.',
            tip_v6_last: 'Last address of the range. IPv6 has no broadcast, so this address is simply usable.',
            tip_v6_total: 'Number of addresses in the block (2^(128−prefix)). Exact:',
            tip_v6_expanded: 'The full address without compression, with every zero written out.',
            v6_net_address: 'Network (compressed)', v6_first: 'First address', v6_last: 'Last address',
            v6_expanded: 'Full address', v6_prefix_len: 'Prefix length',
            v6_unspecified: 'Unspecified (::)', v6_loopback: 'Loopback (::1)',
            v6_multicast: 'Multicast (ff00::/8)', v6_linklocal: 'Link-local (fe80::/10)',
            v6_ula: 'Unique Local · private (fc00::/7)', v6_global: 'Global Unicast (2000::/3)',
            v6_other: 'Reserved / other', v6_doc: 'Documentation (2001:db8::/32)',
            v6_nobroadcast: 'No broadcast',
            err_v6: 'Invalid IPv6 address. Example: 2001:db8::1',
            err_prefix6: 'Prefix must be between 0 and 128.',
            v6_info_title: 'IPv6 address types & common prefixes',
            v6_types_title: 'Address types',
            v6_types_body: '<strong>Global Unicast</strong> — <code>2000::/3</code>, publicly routable (like a public IPv4).<br><strong>Unique Local (ULA)</strong> — <code>fc00::/7</code> (in practice <code>fd00::/8</code>), private, like 192.168.x.x.<br><strong>Link-local</strong> — <code>fe80::/10</code>, only on the local link, always present.<br><strong>Multicast</strong> — <code>ff00::/8</code>, one-to-many.<br><strong>Loopback</strong> — <code>::1</code> · <strong>Unspecified</strong> — <code>::</code>',
            v6_prefixes_title: 'Common prefixes',
            v6_prefixes_body: 'IPv6 does not use subnet masks like IPv4 — only the prefix length matters.<br><strong>/48</strong> — a whole site.<br><strong>/56</strong> — often assigned to home users.<br><strong>/64</strong> — one subnet (the standard; anything smaller breaks autoconfiguration).<br><strong>/128</strong> — a single address (host).',
            glossary_title: 'Beginner’s guide: concepts explained',
            glossary: [
                { cat: 'General' },
                { q: 'What is a subnet?', a: 'A subnet is a slice of a larger network. Splitting keeps traffic separated, organised and safer.' },
                { q: 'What does /24 or "CIDR" mean?', a: 'CIDR writes a network as address + prefix, e.g. <code>192.168.1.0/24</code>. The number after the <code>/</code> is the count of <strong>network bits</strong>. Higher number = smaller network.' },
                { q: 'Network bits vs host bits?', a: 'An address has two parts: the <strong>network bits</strong> (which network) and the <strong>host bits</strong> (which device). The prefix sets the boundary between them.' },
                { cat: 'IPv4' },
                { q: 'Network and broadcast — what are they?', a: 'The <strong>network address</strong> (first) names the network itself. The <strong>broadcast address</strong> (last) sends to every host at once. Neither can be assigned to a device.' },
                { q: 'Why "usable hosts − 2"?', a: 'Because the network and broadcast addresses are reserved. A /24 has 256 addresses, of which 254 are usable. Exceptions: /31 (2 usable) and /32 (1 address).' },
                { q: 'Subnet mask vs wildcard?', a: 'The <strong>subnet mask</strong> (<code>255.255.255.0</code>) shows network bits as ones. The <strong>wildcard</strong> is the inverse (<code>0.0.0.255</code>), used in firewalls and routing.' },
                { q: 'Private or public address?', a: 'Private addresses (<code>10.x</code>, <code>172.16–31.x</code>, <code>192.168.x</code>) work only inside your own network. Public addresses are reachable directly on the internet.' },
                { cat: 'IPv6' },
                { q: 'Why does IPv6 look so different?', a: 'IPv6 uses 128 bits (IPv4: 32) in <strong>hexadecimal</strong>: 8 groups of 4 characters separated by <code>:</code>, e.g. <code>2001:db8:0:0:0:0:0:1</code>.' },
                { q: 'What does "::" mean?', a: 'The double colon <code>::</code> replaces one or more all-zero groups — once per address. So <code>2001:db8:0:0:0:0:0:1</code> becomes <code>2001:db8::1</code>.' },
                { q: 'Why almost always /64?', a: 'A <strong>/64</strong> is the standard subnet size in IPv6. Stateless autoconfiguration (SLAAC) expects 64 host bits; smaller subnets usually break it.' },
                { q: 'Does IPv6 have a broadcast?', a: 'No. IPv6 has no broadcast; <strong>multicast</strong> (<code>ff00::/8</code>) takes its place. That is why there is no "−2" for usable addresses.' },
                { q: 'What is link-local (fe80::)?', a: 'Every IPv6 device automatically gets an <code>fe80::</code> address that works only on the direct link — not routable on the internet.' }
            ]
        },
        fr: {
            hero_desc: 'Calculez tout sur un sous-réseau IPv4 ou IPv6 en un clic : adresse réseau, broadcast, masque, plage et plus. Avec des explications pour débutants. Tout en local — rien n’est envoyé.',
            tip_prefix: 'Le nombre de bits réseau. /24 = 24 bits pour le réseau, le reste pour les hôtes.',
            tip_network: 'La première adresse du sous-réseau ; identifie le réseau lui-même. Non attribuable à un appareil.',
            tip_broadcast: 'La dernière adresse ; un message ici atteint tous les hôtes du sous-réseau. Non attribuable.',
            tip_first_host: 'La première adresse attribuable à un appareil (adresse réseau + 1).',
            tip_last_host: 'La dernière adresse utilisable (broadcast − 1).',
            tip_mask: 'Indique quelle partie est réseau (255) et laquelle est hôte (0).',
            tip_wildcard: 'L’inverse du masque ; utilisé dans les pare-feux, ACL et OSPF.',
            tip_usable: 'Adresses totales moins 2 : les adresses réseau et broadcast ne sont pas attribuables.',
            tip_total: 'Toutes les adresses du bloc, y compris réseau et broadcast (2^bits-hôte).',
            tip_cidr: 'Notation compacte du masque en /nombre-de-bits-réseau.',
            tip_v6_network: 'Le début du bloc IPv6, compressé selon la norme (RFC 5952).',
            tip_v6_first: 'Première adresse de la plage. En IPv6, l’adresse « subnet-router anycast », généralement utilisable.',
            tip_v6_last: 'Dernière adresse de la plage. IPv6 n’a pas de broadcast, cette adresse est donc utilisable.',
            tip_v6_total: 'Nombre d’adresses dans le bloc (2^(128−préfixe)). Exact :',
            tip_v6_expanded: 'L’adresse complète sans compression, tous les zéros écrits.',
            v6_net_address: 'Réseau (compressé)', v6_first: 'Première adresse', v6_last: 'Dernière adresse',
            v6_expanded: 'Adresse complète', v6_prefix_len: 'Longueur de préfixe',
            v6_unspecified: 'Non spécifiée (::)', v6_loopback: 'Loopback (::1)',
            v6_multicast: 'Multicast (ff00::/8)', v6_linklocal: 'Link-local (fe80::/10)',
            v6_ula: 'Unique Local · privée (fc00::/7)', v6_global: 'Global Unicast (2000::/3)',
            v6_other: 'Réservée / autre', v6_doc: 'Documentation (2001:db8::/32)',
            v6_nobroadcast: 'Pas de broadcast',
            err_v6: 'Adresse IPv6 invalide. Exemple : 2001:db8::1',
            err_prefix6: 'Le préfixe doit être compris entre 0 et 128.',
            v6_info_title: 'Types d’adresses IPv6 & préfixes courants',
            v6_types_title: 'Types d’adresses',
            v6_types_body: '<strong>Global Unicast</strong> — <code>2000::/3</code>, routable publiquement (comme un IPv4 public).<br><strong>Unique Local (ULA)</strong> — <code>fc00::/7</code> (en pratique <code>fd00::/8</code>), privée, comme 192.168.x.x.<br><strong>Link-local</strong> — <code>fe80::/10</code>, uniquement sur le lien local, toujours présente.<br><strong>Multicast</strong> — <code>ff00::/8</code>, un-vers-plusieurs.<br><strong>Loopback</strong> — <code>::1</code> · <strong>Non spécifiée</strong> — <code>::</code>',
            v6_prefixes_title: 'Préfixes courants',
            v6_prefixes_body: 'IPv6 n’utilise pas de masques comme IPv4 — seule la longueur du préfixe compte.<br><strong>/48</strong> — un site entier.<br><strong>/56</strong> — souvent attribué aux particuliers.<br><strong>/64</strong> — un sous-réseau (la norme ; plus petit casse l’autoconfiguration).<br><strong>/128</strong> — une seule adresse (hôte).',
            glossary_title: 'Guide débutant : les concepts expliqués',
            glossary: [
                { cat: 'Général' },
                { q: 'Qu’est-ce qu’un sous-réseau ?', a: 'Un sous-réseau est une portion délimitée d’un réseau plus grand. Le découpage garde le trafic séparé, organisé et plus sûr.' },
                { q: 'Que signifie /24 ou « CIDR » ?', a: 'CIDR écrit un réseau comme adresse + préfixe, ex. <code>192.168.1.0/24</code>. Le nombre après le <code>/</code> est le nombre de <strong>bits réseau</strong>. Plus grand = réseau plus petit.' },
                { q: 'Bits réseau vs bits hôte ?', a: 'Une adresse a deux parties : les <strong>bits réseau</strong> (quel réseau) et les <strong>bits hôte</strong> (quel appareil). Le préfixe fixe la frontière entre les deux.' },
                { cat: 'IPv4' },
                { q: 'Adresse réseau et broadcast ?', a: 'L’<strong>adresse réseau</strong> (première) nomme le réseau. L’<strong>adresse de broadcast</strong> (dernière) envoie à tous les hôtes à la fois. Aucune n’est attribuable à un appareil.' },
                { q: 'Pourquoi « hôtes utilisables − 2 » ?', a: 'Parce que les adresses réseau et broadcast sont réservées. Un /24 a 256 adresses, dont 254 utilisables. Exceptions : /31 (2 utilisables) et /32 (1 adresse).' },
                { q: 'Masque vs wildcard ?', a: 'Le <strong>masque</strong> (<code>255.255.255.0</code>) montre les bits réseau en uns. Le <strong>wildcard</strong> est l’inverse (<code>0.0.0.255</code>), utilisé dans les pare-feux et le routage.' },
                { q: 'Adresse privée ou publique ?', a: 'Les adresses privées (<code>10.x</code>, <code>172.16–31.x</code>, <code>192.168.x</code>) ne fonctionnent que dans votre réseau. Les adresses publiques sont joignables sur Internet.' },
                { cat: 'IPv6' },
                { q: 'Pourquoi IPv6 est si différent ?', a: 'IPv6 utilise 128 bits (IPv4 : 32) en <strong>hexadécimal</strong> : 8 groupes de 4 caractères séparés par <code>:</code>, ex. <code>2001:db8:0:0:0:0:0:1</code>.' },
                { q: 'Que signifie « :: » ?', a: 'Le double deux-points <code>::</code> remplace un ou plusieurs groupes entièrement nuls — une seule fois par adresse. Ainsi <code>2001:db8:0:0:0:0:0:1</code> devient <code>2001:db8::1</code>.' },
                { q: 'Pourquoi presque toujours /64 ?', a: 'Un <strong>/64</strong> est la taille de sous-réseau standard en IPv6. L’autoconfiguration (SLAAC) attend 64 bits hôte ; plus petit la casse souvent.' },
                { q: 'IPv6 a-t-il un broadcast ?', a: 'Non. IPv6 n’a pas de broadcast ; le <strong>multicast</strong> (<code>ff00::/8</code>) le remplace. C’est pourquoi il n’y a pas de « −2 » pour les adresses utilisables.' },
                { q: 'Qu’est-ce que link-local (fe80::) ?', a: 'Chaque appareil IPv6 reçoit automatiquement une adresse <code>fe80::</code> qui ne fonctionne que sur le lien direct — non routable sur Internet.' }
            ]
        }
    };
    for (const lang in EXTRA_I18N) Object.assign(I18N[lang], EXTRA_I18N[lang]);

    let currentLang = 'nl';
    let currentMode = 'ipv4';
    const t = (key, vars) => {
        let s = (I18N[currentLang] && I18N[currentLang][key]) || I18N.nl[key] || key;
        if (vars) for (const k in vars) s = s.replace('{' + k + '}', vars[k]);
        return s;
    };
    const currentLocale = () => (LANGS.find((l) => l.id === currentLang) || LANGS[0]).locale;

    const $ = (id) => document.getElementById(id);
    const html = document.documentElement;
    const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
    const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } };

    /* --- Theme engine ----------------------------------------------------- */
    const themeMenu = $('theme-menu');
    function applyTheme(id) {
        const t = THEMES.find((x) => x.id === id) || THEMES[0];
        html.setAttribute('data-theme', t.id);
        $('theme-name').textContent = t.name;
        lsSet(K_THEME, t.id);
        const meta = $('meta-theme');
        if (meta) meta.setAttribute('content', getComputedStyle(html).getPropertyValue('--bg-1').trim());
        themeMenu.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.theme === t.id));
    }
    THEMES.forEach((t) => {
        const b = document.createElement('button');
        b.type = 'button'; b.setAttribute('role', 'menuitem'); b.dataset.theme = t.id;
        b.innerHTML = `<span class="swatch" style="--sw1:${t.sw[0]};--sw2:${t.sw[1]}"></span>${t.name}`;
        b.addEventListener('click', () => { applyTheme(t.id); closeMenus(); });
        themeMenu.appendChild(b);
    });
    const themeBtn = $('theme-btn');
    themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = themeMenu.hidden;
        closeMenus();
        themeMenu.hidden = !open;
        themeBtn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', closeMenus);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenus(); });

    /* --- Language engine -------------------------------------------------- */
    const langMenu = $('lang-menu');
    const langBtn = $('lang-btn');
    function closeMenus() {
        themeMenu.hidden = true; themeBtn.setAttribute('aria-expanded', 'false');
        langMenu.hidden = true; langBtn.setAttribute('aria-expanded', 'false');
    }
    function applyLang(id) {
        const l = LANGS.find((x) => x.id === id) || LANGS[0];
        currentLang = l.id;
        html.setAttribute('lang', l.id);
        lsSet(K_LANG, l.id);
        $('lang-name').textContent = l.name;
        document.title = t('title');
        const md = document.querySelector('meta[name="description"]');
        if (md) md.setAttribute('content', t('meta_desc'));
        document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.getAttribute('data-i18n')); });
        document.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
        langMenu.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.lang === l.id));
        renderGlossary();
        if (lastCalc) calculate(lastCalc.ip, lastCalc.prefix);
    }

    /* --- Glossary --------------------------------------------------------- */
    function renderGlossary() {
        const wrap = $('glossary');
        if (!wrap) return;
        const items = (I18N[currentLang] && I18N[currentLang].glossary) || I18N.nl.glossary || [];
        wrap.innerHTML = '';
        items.forEach((it) => {
            if (it.cat) {
                const h = document.createElement('div');
                h.className = 'gcat'; h.textContent = it.cat;
                wrap.appendChild(h);
            } else {
                const d = document.createElement('details');
                const s = document.createElement('summary');
                s.textContent = it.q;
                const a = document.createElement('div');
                a.className = 'ga'; a.innerHTML = it.a;
                d.appendChild(s); d.appendChild(a);
                wrap.appendChild(d);
            }
        });
    }
    LANGS.forEach((l) => {
        const b = document.createElement('button');
        b.type = 'button'; b.setAttribute('role', 'menuitem'); b.dataset.lang = l.id;
        b.innerHTML = `<span aria-hidden="true">${l.flag}</span>${l.name}`;
        b.addEventListener('click', () => { applyLang(l.id); closeMenus(); });
        langMenu.appendChild(b);
    });
    langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = langMenu.hidden;
        closeMenus();
        langMenu.hidden = !open;
        langBtn.setAttribute('aria-expanded', String(open));
    });

    /* --- IP maths --------------------------------------------------------- */
    function ipToInt(ip) { return ip.split('.').reduce((a, o) => (a << 8) + (parseInt(o, 10) & 255), 0) >>> 0; }
    function intToIp(int) { return [24, 16, 8, 0].map((s) => (int >>> s) & 255).join('.'); }
    function prefixToMask(p) { return p === 0 ? 0 : (~0 << (32 - p)) >>> 0; }
    function validOctets(ip) { return ip.split('.').every((o) => { const n = Number(o); return o !== '' && Number.isInteger(n) && n >= 0 && n <= 255; }); }

    function ipClass(firstOctet) {
        if (firstOctet < 128) return { letter: 'A', note: 'note_large' };
        if (firstOctet < 192) return { letter: 'B', note: 'note_medium' };
        if (firstOctet < 224) return { letter: 'C', note: 'note_small' };
        if (firstOctet < 240) return { letter: 'D', note: 'note_multicast' };
        return { letter: 'E', note: 'note_experimental' };
    }
    function isPrivate(int) {
        const a = (int >>> 24) & 255, b = (int >>> 16) & 255;
        if (a === 10) return true;
        if (a === 172 && b >= 16 && b <= 31) return true;
        if (a === 192 && b === 168) return true;
        return false;
    }
    function specialLabel(int) {
        const a = (int >>> 24) & 255, b = (int >>> 16) & 255;
        if (a === 127) return 'sp_loopback';
        if (a === 169 && b === 254) return 'sp_linklocal';
        if (a >= 224 && a < 240) return 'sp_multicast';
        return null;
    }

    function binaryNetwork(networkInt, prefix) {
        let bits = (networkInt >>> 0).toString(2).padStart(32, '0');
        let out = '';
        for (let i = 0; i < 32; i++) {
            if (i > 0 && i % 8 === 0) out += '.';
            const cls = i < prefix ? 'net' : 'host';
            out += `<span class="${cls}">${bits[i]}</span>`;
        }
        return out;
    }

    /* --- IPv6 maths (BigInt) ---------------------------------------------- */
    const V6_FULL = (1n << 128n) - 1n;

    // Parse an IPv6 string to a BigInt, or return null if invalid.
    function parseIPv6(addr) {
        addr = String(addr).trim().split('%')[0]; // drop zone id
        if (!addr) return null;
        const parseGroups = (str) => {
            if (str === '') return [];
            const out = [];
            for (const g of str.split(':')) {
                if (g.includes('.')) { // embedded IPv4 tail (e.g. ::ffff:192.168.0.1)
                    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(g)) return null;
                    const o = g.split('.').map(Number);
                    if (o.some((x) => x > 255)) return null;
                    out.push(((o[0] << 8) | o[1]).toString(16));
                    out.push(((o[2] << 8) | o[3]).toString(16));
                } else {
                    if (!/^[0-9a-fA-F]{1,4}$/.test(g)) return null;
                    out.push(g);
                }
            }
            return out;
        };
        const parts = addr.split('::');
        if (parts.length > 2) return null;
        let full;
        if (parts.length === 2) {
            const head = parseGroups(parts[0]);
            const tail = parseGroups(parts[1]);
            if (head === null || tail === null) return null;
            const missing = 8 - head.length - tail.length;
            if (missing < 1) return null; // "::" must stand for at least one group
            full = head.concat(Array(missing).fill('0'), tail);
        } else {
            full = parseGroups(addr);
            if (full === null) return null;
        }
        if (full.length !== 8) return null;
        let v = 0n;
        for (const g of full) v = (v << 16n) | BigInt(parseInt(g, 16));
        return v;
    }

    function v6Groups(v) {
        const g = [];
        for (let i = 0; i < 8; i++) { g.unshift(Number(v & 0xffffn)); v >>= 16n; }
        return g;
    }
    function v6Expand(v) {
        return v6Groups(v).map((x) => x.toString(16).padStart(4, '0')).join(':');
    }
    function v6Compress(v) {
        const g = v6Groups(v);
        const hex = g.map((x) => x.toString(16));
        let bestStart = -1, bestLen = 0, curStart = -1, curLen = 0;
        for (let i = 0; i < 8; i++) {
            if (g[i] === 0) { if (curStart < 0) curStart = i; curLen++; if (curLen > bestLen) { bestLen = curLen; bestStart = curStart; } }
            else { curStart = -1; curLen = 0; }
        }
        if (bestLen < 2) return hex.join(':');
        const before = hex.slice(0, bestStart).join(':');
        const after = hex.slice(bestStart + bestLen).join(':');
        return before + '::' + after;
    }
    function v6PrefixMask(p) { return p === 0 ? 0n : ((V6_FULL << BigInt(128 - p)) & V6_FULL); }
    function v6Type(v) {
        if (v === 0n) return 'v6_unspecified';
        if (v === 1n) return 'v6_loopback';
        const first = Number(v >> 112n) & 0xffff;
        if ((first >> 8) === 0xff) return 'v6_multicast';         // ff00::/8
        if ((first & 0xffc0) === 0xfe80) return 'v6_linklocal';   // fe80::/10
        if ((first & 0xfe00) === 0xfc00) return 'v6_ula';         // fc00::/7
        if ((first & 0xe000) === 0x2000) return 'v6_global';      // 2000::/3
        return 'v6_other';
    }
    function v6IsDoc(v) { return (v >> 96n) === 0x20010db8n; } // 2001:db8::/32
    function bigFmt(b, loc) { try { return b.toLocaleString(loc); } catch (e) { return b.toString(); } }

    /* --- Render ----------------------------------------------------------- */
    const resultEl = $('result');
    const gridEl = $('result-grid');
    const tagsEl = $('result-tags');
    const binEl = $('result-bin');
    const errEl = $('form-error');

    function statCard(label, value, cls, tip) {
        const info = tip
            ? ` <span class="info" tabindex="0" role="button" aria-label="?"><span class="ii">i</span><span class="tip">${tip}</span></span>`
            : '';
        const safeVal = String(value).replace(/"/g, '&quot;');
        return `<div class="stat ${cls || ''}">
            <div class="k">${label}${info}</div>
            <div class="v" data-copy="${safeVal}">${value}</div>
            <button type="button" class="copy" title="⧉" aria-label="${label}">⧉</button>
        </div>`;
    }

    let lastCalc = null;

    function calculate(ip, prefix) {
        errEl.textContent = '';
        lastCalc = { ip: ip, prefix: prefix };
        if (currentMode === 'ipv6') calcIPv6(ip, prefix);
        else calcIPv4(ip, prefix);
    }

    function calcIPv4(ip, prefix) {
        if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip) || !validOctets(ip)) { showError(t('err_ip')); return; }
        if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) { showError(t('err_prefix')); return; }

        const ipInt = ipToInt(ip);
        const maskInt = prefixToMask(prefix);
        const wildInt = (~maskInt) >>> 0;
        const networkInt = (ipInt & maskInt) >>> 0;
        const broadcastInt = (networkInt | wildInt) >>> 0;
        const total = Math.pow(2, 32 - prefix);

        let firstUsable, lastUsable, usable;
        if (prefix >= 31) {
            firstUsable = intToIp(networkInt);
            lastUsable = intToIp(broadcastInt);
            usable = prefix === 32 ? 1 : 2; // /31 per RFC 3021
        } else {
            firstUsable = intToIp(networkInt + 1);
            lastUsable = intToIp(broadcastInt - 1);
            usable = total - 2;
        }

        const network = intToIp(networkInt);
        const broadcast = intToIp(broadcastInt);
        const mask = intToIp(maskInt);
        const wildcard = intToIp(wildInt);
        const firstOctet = (networkInt >>> 24) & 255;
        const klass = ipClass(firstOctet);
        const priv = isPrivate(networkInt);
        const special = specialLabel(networkInt);

        let tags = `<span class="tag klass">${t('class_tag', { L: klass.letter, note: t(klass.note) })}</span>`;
        tags += priv
            ? `<span class="tag private">${t('private_tag')}</span>`
            : `<span class="tag public">${t('public_tag')}</span>`;
        if (special) tags += `<span class="tag">${t(special)}</span>`;
        tagsEl.innerHTML = tags;

        const loc = currentLocale();
        gridEl.innerHTML =
            statCard(t('net_address'), `${network}/${prefix}`, 'accent', t('tip_network')) +
            statCard(t('broadcast'), broadcast, '', t('tip_broadcast')) +
            statCard(t('first_host'), firstUsable, 'good', t('tip_first_host')) +
            statCard(t('last_host'), lastUsable, 'good', t('tip_last_host')) +
            statCard(t('subnet_mask'), mask, '', t('tip_mask')) +
            statCard(t('wildcard'), wildcard, '', t('tip_wildcard')) +
            statCard(t('usable_hosts'), usable.toLocaleString(loc), '', t('tip_usable')) +
            statCard(t('total_addr'), total.toLocaleString(loc), '', t('tip_total')) +
            statCard(t('cidr_prefix'), `/${prefix}`, '', t('tip_cidr'));

        binEl.innerHTML = binaryNetwork(networkInt, prefix);
        $('bin-section').hidden = false;
        resultEl.hidden = false;
        resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function calcIPv6(addr, prefix) {
        const v = parseIPv6(addr);
        if (v === null) { showError(t('err_v6')); return; }
        if (!Number.isInteger(prefix) || prefix < 0 || prefix > 128) { showError(t('err_prefix6')); return; }

        const mask = v6PrefixMask(prefix);
        const network = v & mask;
        const last = network | ((~mask) & V6_FULL);
        const exp = 128 - prefix;
        const countBig = 1n << BigInt(exp);
        const loc = currentLocale();

        const type = v6Type(network);
        let tags = `<span class="tag klass">${t(type)}</span>`;
        if (v6IsDoc(network)) tags += `<span class="tag">${t('v6_doc')}</span>`;
        tags += `<span class="tag public">${t('v6_nobroadcast')}</span>`;
        tagsEl.innerHTML = tags;

        const totalDisplay = exp <= 20 ? bigFmt(countBig, loc) : '2^' + exp;
        const totalTip = t('tip_v6_total') + ' ' + bigFmt(countBig, loc);

        gridEl.innerHTML =
            statCard(t('v6_net_address'), `${v6Compress(network)}/${prefix}`, 'accent', t('tip_v6_network')) +
            statCard(t('cidr_prefix'), `/${prefix}`, '', t('tip_cidr')) +
            statCard(t('v6_first'), v6Compress(network), 'good', t('tip_v6_first')) +
            statCard(t('v6_last'), v6Compress(last), 'good', t('tip_v6_last')) +
            statCard(t('total_addr'), totalDisplay, '', totalTip) +
            statCard(t('v6_expanded'), v6Expand(network), '', t('tip_v6_expanded'));

        $('bin-section').hidden = true;
        resultEl.hidden = false;
        resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function showError(msg) {
        errEl.textContent = msg;
        resultEl.hidden = true;
    }

    /* --- Copy ------------------------------------------------------------- */
    let toastEl = null, toastTimer = null;
    function flash(msg) {
        if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
        toastEl.textContent = msg; toastEl.classList.add('show');
        clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1500);
    }
    async function copy(text) {
        try { await navigator.clipboard.writeText(text); flash(t('copied') + text); }
        catch (e) {
            const ta = document.createElement('textarea');
            ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta); ta.select();
            try { document.execCommand('copy'); flash(t('copied') + text); } catch (_) { flash('✗'); }
            ta.remove();
        }
    }
    gridEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.copy');
        if (!btn) return;
        const val = btn.parentElement.querySelector('.v').getAttribute('data-copy');
        if (val) copy(val);
    });

    /* --- Form ------------------------------------------------------------- */
    $('subnet-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const ip = $('ip').value.trim();
        const prefix = parseInt($('prefix').value, 10);
        calculate(ip, prefix);
    });

    document.querySelectorAll('.chip[data-ex]').forEach((chip) => {
        chip.addEventListener('click', () => {
            const raw = chip.dataset.ex;
            const slash = raw.lastIndexOf('/');
            const ip = raw.slice(0, slash);
            const p = raw.slice(slash + 1);
            $('ip').value = ip;
            $('prefix').value = p;
            calculate(ip, parseInt(p, 10));
        });
    });

    /* --- Mode (IPv4 / IPv6) ---------------------------------------------- */
    const DEFAULTS = {
        ipv4: { ip: '192.168.1.0', prefix: '24', ph: '192.168.1.0', max: 32 },
        ipv6: { ip: '2001:db8:abcd:12::', prefix: '64', ph: '2001:db8:abcd:12::', max: 128 }
    };
    function setMode(mode, keepValues) {
        currentMode = (mode === 'ipv6') ? 'ipv6' : 'ipv4';
        lsSet(K_MODE, currentMode);
        const ipv6 = currentMode === 'ipv6';
        document.querySelectorAll('.mode-btn').forEach((b) => {
            const on = b.dataset.mode === currentMode;
            b.classList.toggle('active', on);
            b.setAttribute('aria-selected', String(on));
        });
        $('examples-ipv4').hidden = ipv6;
        $('examples-ipv6').hidden = !ipv6;
        document.querySelectorAll('.ipv4-only').forEach((e) => { e.hidden = ipv6; });
        document.querySelectorAll('.ipv6-only').forEach((e) => { e.hidden = !ipv6; });
        const d = DEFAULTS[currentMode];
        $('prefix').max = d.max;
        $('ip').placeholder = d.ph;
        if (!keepValues) {
            $('ip').value = d.ip;
            $('prefix').value = d.prefix;
            calculate(d.ip, parseInt(d.prefix, 10));
        }
    }
    document.querySelectorAll('.mode-btn').forEach((b) => {
        b.addEventListener('click', () => { if (b.dataset.mode !== currentMode) setMode(b.dataset.mode); });
    });

    /* --- Init ------------------------------------------------------------- */
    applyTheme(lsGet(K_THEME) || 'aurora');
    applyLang(lsGet(K_LANG) || 'nl');
    setMode(lsGet(K_MODE) || 'ipv4');
})();
