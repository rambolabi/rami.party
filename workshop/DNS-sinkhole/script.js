// Blocklist data
const blocklists = [
    {
        name: "StevenBlack Unified Hosts",
        url: "https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts",
        description: "Unified hosts file with adware and malware blocking",
        category: "Ads & Malware"
    },
    {
        name: "KAD Hosts",
        url: "https://raw.githubusercontent.com/PolishFiltersTeam/KADhosts/master/KADhosts.txt",
        description: "Blocks fraud, adware, and malware domains",
        category: "Ads"
    },
    {
        name: "FadeMind Spam",
        url: "https://raw.githubusercontent.com/FadeMind/hosts.extras/master/add.Spam/hosts",
        description: "Blocks spam and junk domains",
        category: "Spam"
    },
    {
        name: "W3KBL",
        url: "https://v.firebog.net/hosts/static/w3kbl.txt",
        description: "Blocks web exploits and malicious domains",
        category: "Malware"
    },
    {
        name: "AdAway",
        url: "https://adaway.org/hosts.txt",
        description: "Mobile and general advertising blocking",
        category: "Ads"
    },
    {
        name: "AdGuard DNS",
        url: "https://v.firebog.net/hosts/AdguardDNS.txt",
        description: "AdGuard's DNS blocking list",
        category: "Ads"
    },
    {
        name: "Admiral",
        url: "https://v.firebog.net/hosts/Admiral.txt",
        description: "Blocks anti-adblock detection scripts",
        category: "Anti-Adblock"
    },
    {
        name: "Anudeep Ad Servers",
        url: "https://raw.githubusercontent.com/anudeepND/blacklist/master/adservers.txt",
        description: "Curated list of ad serving domains",
        category: "Ads"
    },
    {
        name: "Disconnect.me Simple Ad",
        url: "https://s3.amazonaws.com/lists.disconnect.me/simple_ad.txt",
        description: "Basic advertising tracking protection",
        category: "Ads"
    },
    {
        name: "Easylist",
        url: "https://v.firebog.net/hosts/Easylist.txt",
        description: "Primary filter list for ad blocking",
        category: "Ads"
    },
    {
        name: "Yoyo Ad Servers",
        url: "https://pgl.yoyo.org/adservers/serverlist.php?hostformat=hosts&showintro=0&mimetype=plaintext",
        description: "Comprehensive ad server blocking list",
        category: "Ads"
    },
    {
        name: "Unchecky Ads",
        url: "https://raw.githubusercontent.com/FadeMind/hosts.extras/master/UncheckyAds/hosts",
        description: "Blocks ads from bundled installers",
        category: "Ads"
    },
    {
        name: "HostsVN",
        url: "https://raw.githubusercontent.com/bigdargon/hostsVN/master/hosts",
        description: "Vietnamese ad and tracking domains",
        category: "Ads"
    },
    {
        name: "EasyPrivacy",
        url: "https://v.firebog.net/hosts/Easyprivacy.txt",
        description: "Blocks privacy-invasive trackers",
        category: "Tracking"
    },
    {
        name: "Prigent Ads",
        url: "https://v.firebog.net/hosts/Prigent-Ads.txt",
        description: "Advertising domains blocklist",
        category: "Ads"
    },
    {
        name: "2o7.net Tracking",
        url: "https://raw.githubusercontent.com/FadeMind/hosts.extras/master/add.2o7Net/hosts",
        description: "Blocks Adobe/Omniture tracking (2o7.net)",
        category: "Tracking"
    },
    {
        name: "Windows Spy Blocker",
        url: "https://raw.githubusercontent.com/crazy-max/WindowsSpyBlocker/master/data/hosts/spy.txt",
        description: "Blocks Windows telemetry and tracking",
        category: "Tracking"
    },
    {
        name: "First-party Trackers",
        url: "https://hostfiles.frogeye.fr/firstparty-trackers-hosts.txt",
        description: "Blocks first-party tracking domains",
        category: "Tracking"
    },
    {
        name: "DandelionSprout Anti-Malware",
        url: "https://raw.githubusercontent.com/DandelionSprout/adfilt/master/Alternate%20versions%20Anti-Malware%20List/AntiMalwareHosts.txt",
        description: "Malware, phishing, and scam domains",
        category: "Malware"
    },
    {
        name: "Disconnect.me Malvertising",
        url: "https://s3.amazonaws.com/lists.disconnect.me/simple_malvertising.txt",
        description: "Blocks malicious advertising networks",
        category: "Malware"
    },
    {
        name: "Prigent Crypto",
        url: "https://v.firebog.net/hosts/Prigent-Crypto.txt",
        description: "Blocks cryptocurrency mining and crypto-related threats",
        category: "Cryptomining"
    },
    {
        name: "FadeMind Risk Domains",
        url: "https://raw.githubusercontent.com/FadeMind/hosts.extras/master/add.Risk/hosts",
        description: "High-risk and suspicious domains",
        category: "Malware"
    },
    {
        name: "Mandiant APT1",
        url: "https://bitbucket.org/ethanr/dns-blacklists/raw/8575c9f96e5b4a1308f2f12394abd86d0927a4a0/bad_lists/Mandiant_APT1_Report_Appendix_D.txt",
        description: "Advanced Persistent Threat indicators from Mandiant report",
        category: "Malware"
    },
    {
        name: "Phishing Army",
        url: "https://phishing.army/download/phishing_army_blocklist_extended.txt",
        description: "Extended phishing and scam domains",
        category: "Phishing"
    },
    {
        name: "NoTrack Malware",
        url: "https://gitlab.com/quidsup/notrack-blocklists/raw/master/notrack-malware.txt",
        description: "Malware and malicious site blocking",
        category: "Malware"
    },
    {
        name: "RPiList Malware",
        url: "https://v.firebog.net/hosts/RPiList-Malware.txt",
        description: "Raspberry Pi focused malware blocklist",
        category: "Malware"
    },
    {
        name: "RPiList Phishing",
        url: "https://v.firebog.net/hosts/RPiList-Phishing.txt",
        description: "Raspberry Pi focused phishing blocklist",
        category: "Phishing"
    },
    {
        name: "Spam404",
        url: "https://raw.githubusercontent.com/Spam404/lists/master/main-blacklist.txt",
        description: "Spam and scam domains blacklist",
        category: "Spam"
    },
    {
        name: "Stalkerware Indicators",
        url: "https://raw.githubusercontent.com/AssoEchap/stalkerware-indicators/master/generated/hosts",
        description: "Blocks stalkerware and spyware domains",
        category: "Spyware"
    },
    {
        name: "URLhaus Malware",
        url: "https://urlhaus.abuse.ch/downloads/hostfile/",
        description: "Active malware distribution sites from abuse.ch",
        category: "Malware"
    },
    {
        name: "Hagezi Gambling",
        url: "https://raw.githubusercontent.com/hagezi/dns-blocklists/main/wildcard/gambling-onlydomains.txt",
        description: "Blocks gambling and betting sites",
        category: "Gambling"
    },
    {
        name: "DeveloperDan Ads & Tracking Extended",
        url: "https://www.github.developerdan.com/hosts/lists/ads-and-tracking-extended.txt",
        description: "Extended ads and tracking blocklist by Lightswitch05",
        category: "Ads & Tracking"
    },
    {
        name: "Phishing Army Blocklist",
        url: "https://phishing.army/download/phishing_army_blocklist.txt",
        description: "Comprehensive phishing domain blocklist",
        category: "Phishing"
    },
    {
        name: "DeveloperDan AMP Hosts Extended",
        url: "https://www.github.developerdan.com/hosts/lists/amp-hosts-extended.txt",
        description: "Blocks Google AMP (Accelerated Mobile Pages) domains",
        category: "Privacy"
    },
    {
        name: "OISD Big",
        url: "https://big.oisd.nl/",
        description: "Large unified blocklist from OISD project",
        category: "Comprehensive"
    },
    {
        name: "OISD NSFW",
        url: "https://nsfw.oisd.nl/",
        description: "Blocks NSFW and adult content domains",
        category: "Adult Content"
    },
    {
        name: "DRSDavidSoft Ad Servers & Trackers",
        url: "https://raw.githubusercontent.com/DRSDavidSoft/additional-hosts/master/domains/blacklist/adservers-and-trackers.txt",
        description: "Additional ad servers and tracking domains",
        category: "Ads & Tracking"
    },
    {
        name: "Mobile Hosts - AdGuard Mobile Ads",
        url: "https://raw.githubusercontent.com/r-a-y/mobile-hosts/master/AdguardMobileAds.txt",
        description: "Mobile-specific advertising domains",
        category: "Mobile Ads"
    },
    {
        name: "Mobile Hosts - AdGuard DNS",
        url: "https://raw.githubusercontent.com/r-a-y/mobile-hosts/master/AdguardDNS.txt",
        description: "AdGuard DNS filter for mobile",
        category: "Mobile Ads"
    },
    {
        name: "Mobile Hosts - CNAME Microsites",
        url: "https://raw.githubusercontent.com/r-a-y/mobile-hosts/master/AdguardCNAMEMicrosites.txt",
        description: "CNAME cloaking microsites for mobile",
        category: "Mobile Tracking"
    },
    {
        name: "Mobile Hosts - AdGuard Apps",
        url: "https://raw.githubusercontent.com/r-a-y/mobile-hosts/master/AdguardApps.txt",
        description: "App-based tracking and ads (last updated 2020)",
        category: "Mobile Ads"
    },
    {
        name: "Mobile Hosts - CNAME",
        url: "https://raw.githubusercontent.com/r-a-y/mobile-hosts/master/AdguardCNAME.txt",
        description: "CNAME cloaking tracking domains",
        category: "Mobile Tracking"
    },
    {
        name: "Mobile Hosts - CNAME Ads",
        url: "https://raw.githubusercontent.com/r-a-y/mobile-hosts/master/AdguardCNAMEAds.txt",
        description: "CNAME-based advertising domains",
        category: "Mobile Ads"
    },
    {
        name: "Mobile Hosts - CNAME Clickthroughs",
        url: "https://raw.githubusercontent.com/r-a-y/mobile-hosts/master/AdguardCNAMEClickthroughs.txt",
        description: "CNAME clickthrough tracking",
        category: "Mobile Tracking"
    },
    {
        name: "Mobile Hosts - EasyPrivacy Specific",
        url: "https://raw.githubusercontent.com/r-a-y/mobile-hosts/master/EasyPrivacySpecific.txt",
        description: "Specific privacy trackers for mobile",
        category: "Mobile Tracking"
    },
    {
        name: "Mobile Hosts - EasyPrivacy CNAME",
        url: "https://raw.githubusercontent.com/r-a-y/mobile-hosts/master/EasyPrivacyCNAME.txt",
        description: "EasyPrivacy CNAME cloaking trackers",
        category: "Mobile Tracking"
    },
    {
        name: "Mobile Hosts - EasyPrivacy 3rd Party",
        url: "https://raw.githubusercontent.com/r-a-y/mobile-hosts/master/EasyPrivacy3rdParty.txt",
        description: "Third-party privacy trackers for mobile",
        category: "Mobile Tracking"
    },
    {
        name: "Mobile Hosts - AdGuard Tracking",
        url: "https://raw.githubusercontent.com/r-a-y/mobile-hosts/master/AdguardTracking.txt",
        description: "AdGuard tracking domains for mobile",
        category: "Mobile Tracking"
    },
    {
        name: "Mobile Hosts - Mobile Spyware",
        url: "https://raw.githubusercontent.com/r-a-y/mobile-hosts/master/AdguardMobileSpyware.txt",
        description: "Mobile spyware and malicious apps",
        category: "Mobile Spyware"
    },
    {
        name: "NoTrack Blocklist",
        url: "https://gitlab.com/quidsup/notrack-blocklists/raw/master/notrack-blocklist.txt",
        description: "General tracking and ad blocking",
        category: "Ads & Tracking"
    },
    {
        name: "No Google Analytics",
        url: "https://raw.githubusercontent.com/nickspaargaren/no-google/master/categories/analyticsparsed",
        description: "Blocks Google Analytics and tracking services",
        category: "Privacy"
    },
    {
        name: "mmotti Pi-hole Regex",
        url: "https://raw.githubusercontent.com/mmotti/pihole-regex/master/regex.list",
        description: "Regex patterns for advanced blocking (Pi-hole compatible)",
        category: "Regex"
    }
];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    renderBlocklists();
    renderCategoryChips();
    setupEventListeners();
    updateStats();
    startStarfield();

    const heroCount = document.getElementById('heroCount');
    if (heroCount) heroCount.textContent = blocklists.length;
});

// Current active category filter ('all' = no category filter)
let activeCategory = 'all';

// Escape untrusted-ish text before injecting into the DOM
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Render blocklists
function renderBlocklists() {
    const container = document.getElementById('blocklistContainer');
    container.innerHTML = '';

    const frag = document.createDocumentFragment();
    blocklists.forEach((list, index) => {
        frag.appendChild(createBlocklistItem(list, index));
    });
    container.appendChild(frag);
}

// Create a blocklist item element
function createBlocklistItem(list, index) {
    const div = document.createElement('div');
    div.className = 'blocklist-item';
    div.dataset.index = index;

    div.innerHTML = `
        <div class="blocklist-name">${escapeHtml(list.name)}</div>
        <div class="blocklist-description">${escapeHtml(list.description)}</div>
        <span class="blocklist-category">${escapeHtml(list.category)}</span>
        <div class="blocklist-url">
            <span class="url-text" title="${escapeHtml(list.url)}">${escapeHtml(list.url)}</span>
            <button class="btn-copy" type="button" data-index="${index}"
                aria-label="Copy URL for ${escapeHtml(list.name)}">Copy</button>
        </div>
    `;

    return div;
}

// Build category filter chips from the data
function renderCategoryChips() {
    const wrap = document.getElementById('categoryChips');
    if (!wrap) return;

    const counts = new Map();
    blocklists.forEach(l => counts.set(l.category, (counts.get(l.category) || 0) + 1));

    const categories = [...counts.keys()].sort((a, b) => a.localeCompare(b));

    const makeChip = (label, value, count) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chip';
        btn.dataset.category = value;
        btn.setAttribute('aria-pressed', value === activeCategory ? 'true' : 'false');
        btn.innerHTML = `${escapeHtml(label)} <span class="chip-count">${count}</span>`;
        return btn;
    };

    wrap.innerHTML = '';
    wrap.appendChild(makeChip('All', 'all', blocklists.length));
    categories.forEach(cat => wrap.appendChild(makeChip(cat, cat, counts.get(cat))));
}

// Setup event listeners
function setupEventListeners() {
    const filterInput = document.getElementById('filterInput');
    const filterClear = document.getElementById('filterClear');
    const copyAllBtn = document.getElementById('copyAll');
    const chips = document.getElementById('categoryChips');
    const resetBtn = document.getElementById('resetFilters');
    const container = document.getElementById('blocklistContainer');

    filterInput.addEventListener('input', () => {
        filterClear.hidden = filterInput.value.length === 0;
        applyFilters();
    });

    filterClear.addEventListener('click', () => {
        filterInput.value = '';
        filterClear.hidden = true;
        applyFilters();
        filterInput.focus();
    });

    copyAllBtn.addEventListener('click', copyAllUrls);

    // Category chips (event delegation)
    chips.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        activeCategory = chip.dataset.category;
        chips.querySelectorAll('.chip').forEach(c =>
            c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'));
        applyFilters();
    });

    // Individual copy buttons (event delegation)
    container.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-copy');
        if (!btn) return;
        const index = parseInt(btn.dataset.index, 10);
        copyUrl(blocklists[index].url, btn);
    });

    if (resetBtn) resetBtn.addEventListener('click', resetFilters);

    setupChrome();
}

// Apply search + category filters together
function applyFilters() {
    const searchTerm = document.getElementById('filterInput').value.trim().toLowerCase();
    const items = document.querySelectorAll('.blocklist-item');
    let visibleCount = 0;

    items.forEach(item => {
        const list = blocklists[parseInt(item.dataset.index, 10)];
        const matchesCategory = activeCategory === 'all' || list.category === activeCategory;
        const searchableText = `${list.name} ${list.description} ${list.category} ${list.url}`.toLowerCase();
        const matchesSearch = searchableText.includes(searchTerm);

        if (matchesCategory && matchesSearch) {
            item.classList.remove('hidden');
            visibleCount++;
        } else {
            item.classList.add('hidden');
        }
    });

    document.getElementById('emptyState').hidden = visibleCount !== 0;
    updateStats(visibleCount);
}

function resetFilters() {
    const filterInput = document.getElementById('filterInput');
    filterInput.value = '';
    document.getElementById('filterClear').hidden = true;
    activeCategory = 'all';
    document.querySelectorAll('.chip').forEach(c =>
        c.setAttribute('aria-pressed', c.dataset.category === 'all' ? 'true' : 'false'));
    applyFilters();
}

// Update stats
function updateStats(visibleCount = null) {
    const totalCount = document.getElementById('totalCount');
    const filteredCountEl = document.getElementById('filteredCount');

    totalCount.textContent = `${blocklists.length} blocklists`;

    if (visibleCount !== null && visibleCount !== blocklists.length) {
        filteredCountEl.textContent = `${visibleCount} shown`;
    } else {
        filteredCountEl.textContent = '';
    }
}

// Copy a single URL
function copyUrl(url, button) {
    copyText(url).then(ok => {
        if (!ok) { showToast('Copy failed — select the URL manually'); return; }
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('copied');
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 1600);
    });
}

// Copy all currently visible URLs
function copyAllUrls() {
    const visibleItems = document.querySelectorAll('.blocklist-item:not(.hidden)');
    const urls = Array.from(visibleItems).map(item =>
        blocklists[parseInt(item.dataset.index, 10)].url);

    if (urls.length === 0) {
        showToast('No blocklists to copy');
        return;
    }

    copyText(urls.join('\n')).then(ok => {
        if (!ok) { showToast('Copy failed — try again'); return; }
        const btn = document.getElementById('copyAll');
        const originalText = btn.textContent;
        btn.textContent = `Copied ${urls.length} URL${urls.length === 1 ? '' : 's'}!`;
        showToast(`${urls.length} URL${urls.length === 1 ? '' : 's'} copied to clipboard`);
        setTimeout(() => { btn.textContent = originalText; }, 2000);
    });
}

// Clipboard helper with a legacy fallback (works without HTTPS / older browsers)
function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
    }
    return new Promise(resolve => {
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            resolve(ok);
        } catch {
            resolve(false);
        }
    });
}

// Lightweight toast notification
let toastTimer;
function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.setAttribute('role', 'status');
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    requestAnimationFrame(() => toast.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// Back-to-top button
function setupChrome() {
    const toTop = document.getElementById('toTop');
    if (!toTop) return;
    const onScroll = () => {
        const show = window.scrollY > 400;
        toTop.hidden = false;
        toTop.classList.toggle('show', show);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    toTop.addEventListener('click', () =>
        window.scrollTo({ top: 0, behavior: 'smooth' }));
    onScroll();
}

/* ---- Starfield backdrop (self-contained, matches rami.party) ------------- */
function startStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d');
    let stars = [];
    let w, h, dpr, rafId;

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = canvas.width = Math.floor(innerWidth * dpr);
        h = canvas.height = Math.floor(innerHeight * dpr);
        canvas.style.width = innerWidth + 'px';
        canvas.style.height = innerHeight + 'px';
        const count = Math.min(160, Math.floor((innerWidth * innerHeight) / 9000));
        const palette = ['#ffffff', '#c99bff', '#7fe6f7', '#ffd77a', '#ff9ecb'];
        stars = Array.from({ length: count }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: (Math.random() * 1.4 + 0.3) * dpr,
            a: Math.random(),
            tw: Math.random() * 0.02 + 0.004,
            dir: Math.random() > 0.5 ? 1 : -1,
            c: palette[(Math.random() * palette.length) | 0],
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        for (const s of stars) {
            s.a += s.tw * s.dir;
            if (s.a <= 0.1 || s.a >= 1) s.dir *= -1;
            ctx.globalAlpha = Math.max(0.1, Math.min(1, s.a));
            ctx.fillStyle = s.c;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        rafId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', () => {
        cancelAnimationFrame(rafId);
        resize();
        if (!reduceMotion) draw();
    });

    if (reduceMotion) {
        draw();
        cancelAnimationFrame(rafId);
    } else {
        draw();
    }
}
