'use strict';

/* =========================================================================
 * Privacy Cleaner
 * - Really clears this origin's data (storage, cookies, cache, SW, IndexedDB)
 * - Lets you open first-party logout pages for the top 100 websites
 * ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* ---- Top 100 most-used websites with best-effort logout URLs ---------- */
    // url points at the site's own logout endpoint where one exists, otherwise
    // its account/sign-in page. Opening in a new tab runs it in the site's session.
    const SITES = [
        { n: 'Google', d: 'google.com', c: 'Tech', u: 'https://accounts.google.com/Logout' },
        { n: 'YouTube', d: 'youtube.com', c: 'Video', u: 'https://www.youtube.com/logout' },
        { n: 'Gmail', d: 'mail.google.com', c: 'Email', u: 'https://mail.google.com/mail/u/0/?logout' },
        { n: 'Google Drive', d: 'drive.google.com', c: 'Productivity', u: 'https://accounts.google.com/Logout' },
        { n: 'Facebook', d: 'facebook.com', c: 'Social', u: 'https://www.facebook.com/logout.php' },
        { n: 'Instagram', d: 'instagram.com', c: 'Social', u: 'https://www.instagram.com/accounts/logout/' },
        { n: 'X (Twitter)', d: 'x.com', c: 'Social', u: 'https://x.com/logout' },
        { n: 'TikTok', d: 'tiktok.com', c: 'Social', u: 'https://www.tiktok.com/logout' },
        { n: 'Reddit', d: 'reddit.com', c: 'Social', u: 'https://www.reddit.com/logout/' },
        { n: 'Pinterest', d: 'pinterest.com', c: 'Social', u: 'https://www.pinterest.com/logout/' },
        { n: 'Snapchat', d: 'snapchat.com', c: 'Social', u: 'https://accounts.snapchat.com/accounts/logout' },
        { n: 'Tumblr', d: 'tumblr.com', c: 'Social', u: 'https://www.tumblr.com/logout' },
        { n: 'Quora', d: 'quora.com', c: 'Social', u: 'https://www.quora.com/logout' },
        { n: 'Threads', d: 'threads.net', c: 'Social', u: 'https://www.threads.net/logout' },
        { n: 'Mastodon', d: 'mastodon.social', c: 'Social', u: 'https://mastodon.social/auth/sign_out' },
        { n: 'VK', d: 'vk.com', c: 'Social', u: 'https://vk.com/logout' },
        { n: 'Weibo', d: 'weibo.com', c: 'Social', u: 'https://weibo.com/logout.php' },
        { n: 'LinkedIn', d: 'linkedin.com', c: 'Social', u: 'https://www.linkedin.com/m/logout/' },
        { n: 'Discord', d: 'discord.com', c: 'Communication', u: 'https://discord.com/app' },
        { n: 'Telegram Web', d: 'web.telegram.org', c: 'Communication', u: 'https://web.telegram.org' },
        { n: 'WhatsApp Web', d: 'web.whatsapp.com', c: 'Communication', u: 'https://web.whatsapp.com' },
        { n: 'Skype', d: 'skype.com', c: 'Communication', u: 'https://login.skype.com/logout' },
        { n: 'Slack', d: 'slack.com', c: 'Productivity', u: 'https://slack.com/signout' },
        { n: 'Microsoft', d: 'microsoft.com', c: 'Tech', u: 'https://login.live.com/logout.srf' },
        { n: 'Outlook', d: 'outlook.com', c: 'Email', u: 'https://login.live.com/logout.srf' },
        { n: 'Office 365', d: 'office.com', c: 'Productivity', u: 'https://www.office.com/estsredirect?logout=1' },
        { n: 'Microsoft Teams', d: 'teams.microsoft.com', c: 'Productivity', u: 'https://login.live.com/logout.srf' },
        { n: 'Bing', d: 'bing.com', c: 'Tech', u: 'https://login.live.com/logout.srf' },
        { n: 'Xbox', d: 'xbox.com', c: 'Gaming', u: 'https://login.live.com/logout.srf' },
        { n: 'GitHub', d: 'github.com', c: 'Developer', u: 'https://github.com/logout' },
        { n: 'GitLab', d: 'gitlab.com', c: 'Developer', u: 'https://gitlab.com/users/sign_out' },
        { n: 'Bitbucket', d: 'bitbucket.org', c: 'Developer', u: 'https://bitbucket.org/account/signout/' },
        { n: 'Stack Overflow', d: 'stackoverflow.com', c: 'Developer', u: 'https://stackoverflow.com/users/logout' },
        { n: 'npm', d: 'npmjs.com', c: 'Developer', u: 'https://www.npmjs.com/logout' },
        { n: 'Docker Hub', d: 'hub.docker.com', c: 'Developer', u: 'https://hub.docker.com/logout' },
        { n: 'Heroku', d: 'heroku.com', c: 'Developer', u: 'https://id.heroku.com/logout' },
        { n: 'DigitalOcean', d: 'digitalocean.com', c: 'Developer', u: 'https://cloud.digitalocean.com/logout' },
        { n: 'Cloudflare', d: 'cloudflare.com', c: 'Developer', u: 'https://dash.cloudflare.com/logout' },
        { n: 'AWS', d: 'aws.amazon.com', c: 'Developer', u: 'https://signin.aws.amazon.com/oauth?Action=logout' },
        { n: 'Vercel', d: 'vercel.com', c: 'Developer', u: 'https://vercel.com/logout' },
        { n: 'Atlassian', d: 'atlassian.com', c: 'Developer', u: 'https://id.atlassian.com/logout' },
        { n: 'Figma', d: 'figma.com', c: 'Developer', u: 'https://www.figma.com/logout' },
        { n: 'Netflix', d: 'netflix.com', c: 'Video', u: 'https://www.netflix.com/SignOut' },
        { n: 'Twitch', d: 'twitch.tv', c: 'Video', u: 'https://www.twitch.tv/logout' },
        { n: 'Disney+', d: 'disneyplus.com', c: 'Video', u: 'https://www.disneyplus.com/logout' },
        { n: 'Hulu', d: 'hulu.com', c: 'Video', u: 'https://secure.hulu.com/logout' },
        { n: 'Prime Video', d: 'primevideo.com', c: 'Video', u: 'https://www.primevideo.com/logout' },
        { n: 'Max (HBO)', d: 'max.com', c: 'Video', u: 'https://www.max.com/logout' },
        { n: 'Vimeo', d: 'vimeo.com', c: 'Video', u: 'https://vimeo.com/log_out' },
        { n: 'Dailymotion', d: 'dailymotion.com', c: 'Video', u: 'https://www.dailymotion.com/logout' },
        { n: 'Spotify', d: 'spotify.com', c: 'Music', u: 'https://www.spotify.com/logout/' },
        { n: 'SoundCloud', d: 'soundcloud.com', c: 'Music', u: 'https://soundcloud.com/logout' },
        { n: 'Apple Music', d: 'music.apple.com', c: 'Music', u: 'https://appleid.apple.com/logout' },
        { n: 'Amazon', d: 'amazon.com', c: 'Shopping', u: 'https://www.amazon.com/gp/flex/sign-out.html' },
        { n: 'eBay', d: 'ebay.com', c: 'Shopping', u: 'https://signin.ebay.com/ws/eBayISAPI.dll?SignOut' },
        { n: 'AliExpress', d: 'aliexpress.com', c: 'Shopping', u: 'https://login.aliexpress.com/out.htm' },
        { n: 'Alibaba', d: 'alibaba.com', c: 'Shopping', u: 'https://login.alibaba.com/logout.htm' },
        { n: 'Walmart', d: 'walmart.com', c: 'Shopping', u: 'https://www.walmart.com/account/logout' },
        { n: 'Etsy', d: 'etsy.com', c: 'Shopping', u: 'https://www.etsy.com/signout.php' },
        { n: 'Target', d: 'target.com', c: 'Shopping', u: 'https://www.target.com/logout' },
        { n: 'Best Buy', d: 'bestbuy.com', c: 'Shopping', u: 'https://www.bestbuy.com/logout' },
        { n: 'Shopify', d: 'shopify.com', c: 'Shopping', u: 'https://accounts.shopify.com/logout' },
        { n: 'Wish', d: 'wish.com', c: 'Shopping', u: 'https://www.wish.com/logout' },
        { n: 'PayPal', d: 'paypal.com', c: 'Finance', u: 'https://www.paypal.com/myaccount/logout' },
        { n: 'Stripe', d: 'stripe.com', c: 'Finance', u: 'https://dashboard.stripe.com/logout' },
        { n: 'Coinbase', d: 'coinbase.com', c: 'Finance', u: 'https://www.coinbase.com/signout' },
        { n: 'Binance', d: 'binance.com', c: 'Finance', u: 'https://accounts.binance.com/en/logout' },
        { n: 'Chase', d: 'chase.com', c: 'Finance', u: 'https://www.chase.com/personal/logout' },
        { n: 'Bank of America', d: 'bankofamerica.com', c: 'Finance', u: 'https://secure.bankofamerica.com/login/sign-in/signOut.go' },
        { n: 'Wise', d: 'wise.com', c: 'Finance', u: 'https://wise.com/logout' },
        { n: 'Revolut', d: 'revolut.com', c: 'Finance', u: 'https://app.revolut.com/logout' },
        { n: 'Robinhood', d: 'robinhood.com', c: 'Finance', u: 'https://robinhood.com/logout' },
        { n: 'Cash App', d: 'cash.app', c: 'Finance', u: 'https://cash.app/account/signout' },
        { n: 'Dropbox', d: 'dropbox.com', c: 'Productivity', u: 'https://www.dropbox.com/logout' },
        { n: 'Notion', d: 'notion.so', c: 'Productivity', u: 'https://www.notion.so/logout' },
        { n: 'Trello', d: 'trello.com', c: 'Productivity', u: 'https://trello.com/logout' },
        { n: 'Asana', d: 'asana.com', c: 'Productivity', u: 'https://app.asana.com/-/logout' },
        { n: 'Zoom', d: 'zoom.us', c: 'Productivity', u: 'https://zoom.us/logout' },
        { n: 'Evernote', d: 'evernote.com', c: 'Productivity', u: 'https://www.evernote.com/Logout.action' },
        { n: 'Canva', d: 'canva.com', c: 'Productivity', u: 'https://www.canva.com/logout' },
        { n: 'Airtable', d: 'airtable.com', c: 'Productivity', u: 'https://airtable.com/logout' },
        { n: 'Box', d: 'box.com', c: 'Productivity', u: 'https://app.box.com/logout' },
        { n: 'Adobe', d: 'adobe.com', c: 'Productivity', u: 'https://account.adobe.com/logout' },
        { n: 'Salesforce', d: 'salesforce.com', c: 'Productivity', u: 'https://login.salesforce.com/secur/logout.jsp' },
        { n: 'Zendesk', d: 'zendesk.com', c: 'Productivity', u: 'https://www.zendesk.com/logout' },
        { n: 'Zoho', d: 'zoho.com', c: 'Productivity', u: 'https://accounts.zoho.com/logout' },
        { n: 'WordPress.com', d: 'wordpress.com', c: 'Productivity', u: 'https://wordpress.com/wp-login.php?action=logout' },
        { n: 'Yahoo', d: 'yahoo.com', c: 'Email', u: 'https://login.yahoo.com/account/logout' },
        { n: 'Proton', d: 'proton.me', c: 'Email', u: 'https://account.proton.me/logout' },
        { n: 'Apple ID', d: 'apple.com', c: 'Tech', u: 'https://appleid.apple.com/logout' },
        { n: 'iCloud', d: 'icloud.com', c: 'Tech', u: 'https://www.icloud.com/logout' },
        { n: 'Booking.com', d: 'booking.com', c: 'Travel', u: 'https://account.booking.com/sign-out' },
        { n: 'Airbnb', d: 'airbnb.com', c: 'Travel', u: 'https://www.airbnb.com/logout' },
        { n: 'Uber', d: 'uber.com', c: 'Travel', u: 'https://auth.uber.com/v2/logout' },
        { n: 'Expedia', d: 'expedia.com', c: 'Travel', u: 'https://www.expedia.com/logout' },
        { n: 'Yelp', d: 'yelp.com', c: 'Local', u: 'https://www.yelp.com/logout' },
        { n: 'IMDb', d: 'imdb.com', c: 'Entertainment', u: 'https://www.imdb.com/registration/logout' },
        { n: 'Wikipedia', d: 'wikipedia.org', c: 'Reference', u: 'https://en.wikipedia.org/wiki/Special:UserLogout' },
        { n: 'Fandom', d: 'fandom.com', c: 'Reference', u: 'https://auth.fandom.com/logout' },
        { n: 'Medium', d: 'medium.com', c: 'News', u: 'https://medium.com/m/signout' }
    ];

    /* ---- DOM refs --------------------------------------------------------- */
    const $ = (id) => document.getElementById(id);
    const logEl = $('log');
    const themeToggle = $('themeToggle');
    const originLabel = $('originLabel');
    const storageFill = $('storageFill'), storageText = $('storageText');
    const statCookies = $('statCookies'), statLocal = $('statLocal'), statSession = $('statSession'), statCaches = $('statCaches');
    const cleanSelectedBtn = $('cleanSelectedBtn'), cleanAllBtn = $('cleanAllBtn'), refreshStatsBtn = $('refreshStatsBtn');
    const siteSearch = $('siteSearch'), categoryFilter = $('categoryFilter');
    const selectAllBtn = $('selectAllBtn'), selectNoneBtn = $('selectNoneBtn');
    const siteCount = $('siteCount'), selectedCount = $('selectedCount');
    const sitesList = $('sitesList'), openSelectedBtn = $('openSelectedBtn');
    const copyLogBtn = $('copyLogBtn'), clearLogBtn = $('clearLogBtn');

    /* ---- Logging ---------------------------------------------------------- */
    function log(message, kind) {
        const line = document.createElement('span');
        line.className = 'log-line' + (kind ? ' log-' + kind : '');
        const t = new Date().toLocaleTimeString();
        line.textContent = `[${t}] ${message}`;
        logEl.appendChild(line);
        logEl.scrollTop = logEl.scrollHeight;
    }

    /* ---- Theme ------------------------------------------------------------ */
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        themeToggle.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
        try { localStorage.setItem('cleaner-theme', theme); } catch (e) {}
    }
    themeToggle.addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
    });
    (function initTheme() {
        let t = null;
        try { t = localStorage.getItem('cleaner-theme'); } catch (e) {}
        if (!t) t = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        applyTheme(t);
    })();

    /* ---- Stats ------------------------------------------------------------ */
    function countCookies() {
        if (!document.cookie) return 0;
        return document.cookie.split(';').filter(c => c.trim()).length;
    }
    function formatBytes(bytes) {
        if (!bytes) return '0 B';
        const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toFixed(i ? 1 : 0) + ' ' + sizes[i];
    }
    async function refreshStats() {
        try { statCookies.textContent = countCookies(); } catch (e) { statCookies.textContent = 'n/a'; }
        try { statLocal.textContent = localStorage.length; } catch (e) { statLocal.textContent = 'n/a'; }
        try { statSession.textContent = sessionStorage.length; } catch (e) { statSession.textContent = 'n/a'; }
        try {
            statCaches.textContent = ('caches' in window) ? (await caches.keys()).length : 'n/a';
        } catch (e) { statCaches.textContent = 'n/a'; }

        if (navigator.storage && navigator.storage.estimate) {
            try {
                const { usage = 0, quota = 0 } = await navigator.storage.estimate();
                const pct = quota ? Math.min(100, (usage / quota) * 100) : 0;
                storageFill.style.width = pct.toFixed(2) + '%';
                storageText.textContent = `Using ${formatBytes(usage)} of ${formatBytes(quota)} available (${pct.toFixed(1)}%).`;
            } catch (e) {
                storageText.textContent = 'Storage estimate unavailable in this browser.';
            }
        } else {
            storageText.textContent = 'Storage estimate unavailable in this browser.';
        }
    }

    /* ---- Cleaners --------------------------------------------------------- */
    function clearClipboard() {
        return new Promise((resolve) => {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(' ')
                    .then(() => { log('✅ Clipboard overwritten.', 'ok'); resolve(); })
                    .catch(() => { log('⚠️ Clipboard needs focus/permission — click the page and retry.', 'warn'); resolve(); });
            } else {
                log('⚠️ Clipboard API not available.', 'warn');
                resolve();
            }
        });
    }
    function clearLocal() {
        const n = localStorage.length;
        localStorage.clear();
        log(`✅ Cleared local storage (${n} item${n === 1 ? '' : 's'}).`, 'ok');
    }
    function clearSession() {
        const n = sessionStorage.length;
        sessionStorage.clear();
        log(`✅ Cleared session storage (${n} item${n === 1 ? '' : 's'}).`, 'ok');
    }
    function clearCookies() {
        const cookies = document.cookie ? document.cookie.split(';') : [];
        let cleared = 0;
        const host = location.hostname;
        const domains = ['', host, '.' + host];
        // include parent domain (e.g. .example.com)
        const parts = host.split('.');
        if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));
        const paths = ['/', location.pathname];
        cookies.forEach(c => {
            const name = c.split('=')[0].trim();
            if (!name) return;
            const expire = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
            domains.forEach(dom => paths.forEach(p => {
                document.cookie = `${name}=;${expire};path=${p}` + (dom ? `;domain=${dom}` : '');
            }));
            cleared++;
        });
        const remaining = countCookies();
        if (cleared === 0) log('ℹ️ No JavaScript-readable cookies to clear.', 'info');
        else if (remaining === 0) log(`✅ Cleared ${cleared} cookie${cleared === 1 ? '' : 's'}.`, 'ok');
        else log(`⚠️ Cleared ${cleared - remaining}/${cleared} cookies. ${remaining} are HttpOnly/secure and can't be removed by JS.`, 'warn');
    }
    async function clearIndexedDB() {
        if (!window.indexedDB) { log('⚠️ IndexedDB not available.', 'warn'); return; }
        if (!indexedDB.databases) {
            log('ℹ️ This browser can\'t list IndexedDB databases; open DevTools to clear them manually.', 'info');
            return;
        }
        try {
            const dbs = await indexedDB.databases();
            if (!dbs.length) { log('ℹ️ No IndexedDB databases found.', 'info'); return; }
            await Promise.all(dbs.map(db => new Promise((res) => {
                if (!db.name) return res();
                const req = indexedDB.deleteDatabase(db.name);
                req.onsuccess = req.onerror = req.onblocked = () => res();
            })));
            log(`✅ Deleted ${dbs.length} IndexedDB database${dbs.length === 1 ? '' : 's'}.`, 'ok');
        } catch (e) {
            log('❌ Failed to clear IndexedDB: ' + e.message, 'err');
        }
    }
    async function clearCacheStorage() {
        if (!('caches' in window)) { log('⚠️ Cache Storage not available.', 'warn'); return; }
        try {
            const keys = await caches.keys();
            if (!keys.length) { log('ℹ️ No cache stores found.', 'info'); return; }
            await Promise.all(keys.map(k => caches.delete(k)));
            log(`✅ Cleared ${keys.length} cache store${keys.length === 1 ? '' : 's'}.`, 'ok');
        } catch (e) {
            log('❌ Failed to clear cache storage: ' + e.message, 'err');
        }
    }
    async function clearServiceWorkers() {
        if (!('serviceWorker' in navigator)) { log('⚠️ Service workers not supported.', 'warn'); return; }
        try {
            const regs = await navigator.serviceWorker.getRegistrations();
            if (!regs.length) { log('ℹ️ No service workers registered.', 'info'); return; }
            await Promise.all(regs.map(r => r.unregister()));
            log(`✅ Unregistered ${regs.length} service worker${regs.length === 1 ? '' : 's'}.`, 'ok');
        } catch (e) {
            log('❌ Failed to unregister service workers: ' + e.message, 'err');
        }
    }

    async function runClean(keys) {
        log(`Starting cleanup (${keys.join(', ')})…`);
        if (keys.includes('clipboard')) await clearClipboard();
        if (keys.includes('local')) clearLocal();
        if (keys.includes('session')) clearSession();
        if (keys.includes('cookies')) clearCookies();
        if (keys.includes('indexeddb')) await clearIndexedDB();
        if (keys.includes('cache')) await clearCacheStorage();
        if (keys.includes('serviceworkers')) await clearServiceWorkers();
        await refreshStats();
        log('✨ Cleanup finished.', 'ok');
    }

    function selectedKeys() {
        return [...document.querySelectorAll('.opt:checked')].map(c => c.dataset.key);
    }

    cleanSelectedBtn.addEventListener('click', async () => {
        const keys = selectedKeys();
        if (!keys.length) { log('⚠️ Nothing selected to clean.', 'warn'); return; }
        cleanSelectedBtn.disabled = true;
        await runClean(keys);
        cleanSelectedBtn.disabled = false;
    });

    cleanAllBtn.addEventListener('click', async () => {
        if (!confirm('Clear ALL of this site\'s data (storage, cookies, cache, service workers, IndexedDB)?\n\nThis cannot be undone.')) return;
        cleanAllBtn.disabled = true;
        await runClean(['clipboard', 'local', 'session', 'cookies', 'indexeddb', 'cache', 'serviceworkers']);
        cleanAllBtn.disabled = false;
    });

    refreshStatsBtn.addEventListener('click', refreshStats);

    /* ---- Sites list ------------------------------------------------------- */
    const CAT_COLORS = {};
    const palette = ['#2563eb', '#db2777', '#16a34a', '#d97706', '#7c3aed', '#0891b2', '#dc2626', '#4f46e5', '#0d9488', '#ca8a04'];
    function catColor(cat) {
        if (!CAT_COLORS[cat]) {
            const idx = Object.keys(CAT_COLORS).length % palette.length;
            CAT_COLORS[cat] = palette[idx];
        }
        return CAT_COLORS[cat];
    }

    // Populate category filter
    const categories = [...new Set(SITES.map(s => s.c))].sort();
    categories.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c; opt.textContent = c;
        categoryFilter.appendChild(opt);
    });

    function renderSites() {
        const q = siteSearch.value.trim().toLowerCase();
        const cat = categoryFilter.value;
        sitesList.innerHTML = '';
        const filtered = SITES.filter(s =>
            (!cat || s.c === cat) &&
            (!q || s.n.toLowerCase().includes(q) || s.d.toLowerCase().includes(q) || s.c.toLowerCase().includes(q))
        );

        filtered.forEach(s => {
            const row = document.createElement('div');
            row.className = 'site';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.className = 'site-cb';
            cb.dataset.url = s.u;
            cb.dataset.name = s.n;
            cb.addEventListener('change', updateSelectedCount);

            const avatar = document.createElement('div');
            avatar.className = 'avatar';
            avatar.style.background = catColor(s.c);
            avatar.textContent = s.n.charAt(0).toUpperCase();

            const info = document.createElement('div');
            info.className = 'site-info';
            const a = document.createElement('a');
            a.href = s.u; a.target = '_blank'; a.rel = 'noopener noreferrer';
            a.textContent = s.n;
            a.title = s.u;
            const cat2 = document.createElement('div');
            cat2.className = 'cat';
            cat2.textContent = s.c + ' · ' + s.d;
            info.appendChild(a); info.appendChild(cat2);

            const open = document.createElement('a');
            open.className = 'open-link';
            open.href = s.u; open.target = '_blank'; open.rel = 'noopener noreferrer';
            open.textContent = 'Open';
            open.addEventListener('click', () => log(`Opened logout page for ${s.n}.`, 'info'));

            row.append(cb, avatar, info, open);
            sitesList.appendChild(row);
        });

        siteCount.textContent = `${filtered.length} of ${SITES.length} shown`;
        updateSelectedCount();
    }

    function updateSelectedCount() {
        const n = document.querySelectorAll('.site-cb:checked').length;
        selectedCount.textContent = n ? `${n} selected` : '';
        openSelectedBtn.disabled = n === 0;
    }

    siteSearch.addEventListener('input', renderSites);
    categoryFilter.addEventListener('change', renderSites);
    selectAllBtn.addEventListener('click', () => {
        document.querySelectorAll('.site-cb').forEach(cb => cb.checked = true);
        updateSelectedCount();
    });
    selectNoneBtn.addEventListener('click', () => {
        document.querySelectorAll('.site-cb').forEach(cb => cb.checked = false);
        updateSelectedCount();
    });

    openSelectedBtn.addEventListener('click', () => {
        const selected = [...document.querySelectorAll('.site-cb:checked')];
        if (!selected.length) return;
        log(`Opening ${selected.length} logout page${selected.length === 1 ? '' : 's'}…`);
        let blocked = 0, i = 0;
        selected.forEach((cb, idx) => {
            setTimeout(() => {
                const w = window.open(cb.dataset.url, '_blank', 'noopener,noreferrer');
                if (!w || w.closed || typeof w.closed === 'undefined') {
                    blocked++;
                    log(`⚠️ Pop-up blocked for ${cb.dataset.name}. Allow pop-ups or click its Open button.`, 'warn');
                } else {
                    log(`✅ Opened ${cb.dataset.name}.`, 'ok');
                }
                if (++i === selected.length) {
                    if (blocked) log(`Finished — ${blocked} blocked by the pop-up blocker.`, 'warn');
                    else log('Finished opening logout pages.', 'ok');
                }
            }, idx * 350);
        });
    });

    /* ---- Log actions ------------------------------------------------------ */
    copyLogBtn.addEventListener('click', () => {
        const text = logEl.textContent;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(
                () => log('📋 Log copied to clipboard.', 'info'),
                () => log('⚠️ Could not copy log.', 'warn')
            );
        }
    });
    clearLogBtn.addEventListener('click', () => { logEl.innerHTML = ''; });

    /* ---- Init ------------------------------------------------------------- */
    try { originLabel.textContent = location.origin === 'null' ? 'this page' : location.origin; } catch (e) {}
    renderSites();
    refreshStats();
    log('Privacy Cleaner ready. Pick what to clear, or search the top 100 sites to sign out of.', 'info');
});
