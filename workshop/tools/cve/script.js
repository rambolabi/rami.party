// Page-specific JS for cve/index.html
// - Gathers links from the DOM (#cveList)
// - Opens each link in a new tab with a small delay to reduce popup-blocking heuristics
// - If popups are blocked, copies the URLs to the clipboard as a fallback

function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
    return weekNo;
}

// Language switcher shared by every code path below.
function setLanguage(lang) {
  document.body.setAttribute('data-lang', lang);
  document.querySelectorAll('.lang-btn').forEach(b => {
    const on = b.getAttribute('data-lang') === lang;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', String(on));
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.addEventListener('click', () => setLanguage(b.getAttribute('data-lang')));
  });

  // Update intro text with week number
  const now = new Date();
  const week = getWeekNumber(now);
  const year = now.getFullYear();
  document.querySelectorAll('.lang[data-text-template]').forEach(span => {
    const template = span.getAttribute('data-text-template');
    span.textContent = template.replace('{week}', week).replace('{year}', year);
  });

  const listContainer = document.getElementById('cveList');
  const btn = document.getElementById('openAll');

  if (!listContainer) return;

  // Load links from local JSON file
  let links = [];
  try {
    const res = await fetch('./links.json');
    if (!res.ok) throw new Error('Failed to fetch links.json: ' + res.status);
    links = await res.json();
  } catch (e) {
    console.error('Could not load links.json', e);
    listContainer.textContent = '';
    const fail = document.createElement('div');
    fail.className = 'note';
    fail.textContent = 'Failed to load link list. See console for details.';
    listContainer.appendChild(fail);
    return;
  }

  // Render list
  listContainer.textContent = '';
  links.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cve-item';
    // support both the older `title` field and the newer `title_en`
    const title = item.title_en || item.title || '';
    const url = item.url || '';

    if (url && /^https?:\/\//i.test(url)) {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = title;
      div.appendChild(a);
    } else {
      const span = document.createElement('span');
      span.textContent = title + (url ? ' (' + url + ')' : ' (URL not set)');
      span.className = 'missing-url';
      div.appendChild(span);
    }
    listContainer.appendChild(div);
  });
  
  // Only include valid http(s) URLs for the "open all" action
  const urls = links.map(l => l.url).filter(u => typeof u === 'string' && /^https?:\/\//i.test(u));

  if (!btn) return;
  btn.setAttribute('aria-pressed', 'false');
  btn.setAttribute('aria-busy', 'false');

  btn.addEventListener('click', async () => {
    if (btn.getAttribute('aria-busy') === 'true') return;
    const proceed = confirm('Open all monitored URLs in new tabs?');
    if (!proceed) return;

    btn.setAttribute('aria-busy', 'true');
    btn.setAttribute('aria-pressed', 'true');

    let blocked = false;
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      try {
        const w = window.open(url, '_blank');
        if (!w) {
          blocked = true;
          break;
        }
      } catch (e) {
        console.error('open failed', e);
        blocked = true;
        break;
      }
      // very small delay to reduce popup-blocker heuristics
      await new Promise(r => setTimeout(r, 25));
    }

    btn.removeAttribute('aria-busy');
    btn.setAttribute('aria-pressed', 'false');

    if (blocked) {
      // fallback: copy URLs to clipboard so user can paste or open manually
      const text = urls.join('\n');
      try {
        await navigator.clipboard.writeText(text);
        alert('Popup blocked. All URLs were copied to your clipboard. Paste them into a browser or open the links manually.');
      } catch (e) {
        // Clipboard unavailable: show a single text area as a last resort
        const listText = urls.map(u => '- ' + u).join('\n');
        const msg = 'Popup blocked and clipboard not available. Please open the following links manually:\n\n' + listText;
        alert(msg);
      }
    }
  });

});
