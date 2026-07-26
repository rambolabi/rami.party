// Gallery data is built from the owner-editable list in artworks.js.
// To add/remove art, edit artworks.js only — nothing here needs to change.
const allImages = (window.ARTWORKS || []).map(parseArtwork);

// Turn an artworks.js entry into the internal shape the gallery uses.
// Accepts either a plain PNG file-name string, or { png, svg }.
function parseArtwork(entry) {
    const pngFile = typeof entry === 'string' ? entry : (entry && entry.png) || '';
    const svgFile = typeof entry === 'string' ? null : (entry && entry.svg) || null;
    // Display/base name: strip an optional size tag ("-4096px"/"_2048px") and ".png".
    const name = pngFile
        .replace(/[_-]\d+px\.png$/i, '')
        .replace(/\.png$/i, '');
    return { name, pngFile, svgFile, hasSVG: !!svgFile };
}

// State
let currentIndex = 0;
let filteredImages = [...allImages];
let formatFilter = 'all'; // 'all' | 'svg'
let isGridView = false;

// DOM Elements
const mainImage = document.getElementById('mainImage');
const imageName = document.getElementById('imageName');
const imageCounter = document.getElementById('imageCounter');
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');
const resultCount = document.getElementById('resultCount');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const downloadPNG = document.getElementById('downloadPNG');
const downloadSVG = document.getElementById('downloadSVG');
const imageContainer = document.getElementById('imageContainer');
const toggleViewBtn = document.getElementById('toggleViewBtn');
const viewLabel = document.getElementById('viewLabel');
const viewIcon = document.getElementById('viewIcon');
const gridView = document.getElementById('gridView');
const gallery = document.getElementById('gallery');
const controls = document.getElementById('controls');
const viewerHint = document.getElementById('viewerHint');
const svgBadge = document.getElementById('svgBadge');
const plateLoader = document.getElementById('plateLoader');
const emptyState = document.getElementById('emptyState');
const chipAll = document.getElementById('chipAll');
const chipSvg = document.getElementById('chipSvg');
const toTop = document.getElementById('toTop');

// Lightbox elements
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

// Helpers -------------------------------------------------------------------
function formatImageName(name) {
    return name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function pngPath(image) {
    return `./img/${image.pngFile}`;
}

function svgPath(image) {
    return `./img/${image.svgFile}`;
}

// Single-image viewer -------------------------------------------------------
function displayImage() {
    if (filteredImages.length === 0) {
        mainImage.removeAttribute('src');
        mainImage.alt = '';
        imageName.textContent = 'No engravings found';
        imageCounter.textContent = '';
        svgBadge.hidden = true;
        plateLoader.hidden = true;
        downloadPNG.disabled = true;
        downloadSVG.disabled = true;
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
    }

    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex > filteredImages.length - 1) currentIndex = filteredImages.length - 1;

    const image = filteredImages[currentIndex];
    const label = formatImageName(image.name);

    // Loading state
    mainImage.classList.add('loading');
    plateLoader.hidden = false;

    mainImage.onload = () => {
        mainImage.classList.remove('loading');
        plateLoader.hidden = true;
    };
    mainImage.onerror = () => {
        plateLoader.hidden = true;
        mainImage.classList.remove('loading');
        mainImage.alt = 'Preview unavailable';
    };

    mainImage.src = pngPath(image);
    mainImage.alt = label;
    imageName.textContent = label;
    imageCounter.textContent = `${currentIndex + 1} / ${filteredImages.length}`;
    svgBadge.hidden = !image.hasSVG;

    downloadPNG.disabled = false;
    downloadSVG.disabled = !image.hasSVG;
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === filteredImages.length - 1;
}

function showPrevious() {
    if (currentIndex > 0) { currentIndex--; displayImage(); }
}

function showNext() {
    if (currentIndex < filteredImages.length - 1) { currentIndex++; displayImage(); }
}

// Filtering -----------------------------------------------------------------
function applyFilters() {
    const query = searchInput.value.toLowerCase().trim();

    filteredImages = allImages.filter(img => {
        const matchesFormat = formatFilter === 'all' || img.hasSVG;
        const matchesQuery = !query || img.name.toLowerCase().includes(query);
        return matchesFormat && matchesQuery;
    });

    currentIndex = 0;
    searchClear.hidden = query.length === 0;

    const n = filteredImages.length;
    resultCount.textContent = (query || formatFilter !== 'all')
        ? `${n} result${n !== 1 ? 's' : ''}`
        : '';

    updateLayout();

    displayImage();
    if (isGridView) renderGridView();
}

// Single source of truth for which view (grid / single / empty) is visible
function updateLayout() {
    const empty = filteredImages.length === 0;
    emptyState.hidden = !empty;
    gridView.classList.toggle('active', isGridView);

    const showViewer = !isGridView && !empty;
    gallery.style.display = showViewer ? '' : 'none';
    controls.style.display = showViewer ? '' : 'none';
    viewerHint.style.display = showViewer ? '' : 'none';
}

function resetFilters() {
    searchInput.value = '';
    searchClear.hidden = true;
    setFormatFilter('all');
}

function setFormatFilter(value) {
    formatFilter = value;
    chipAll.setAttribute('aria-pressed', value === 'all' ? 'true' : 'false');
    chipSvg.setAttribute('aria-pressed', value === 'svg' ? 'true' : 'false');
    applyFilters();
}

// Downloads -----------------------------------------------------------------
function downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function downloadCurrentPNG() {
    if (filteredImages.length === 0) return;
    const image = filteredImages[currentIndex];
    downloadFile(pngPath(image), `${image.name}.png`);
    showToast('Beaming down PNG…');
}

function downloadCurrentSVG() {
    if (filteredImages.length === 0) return;
    const image = filteredImages[currentIndex];
    if (image.hasSVG) {
        downloadFile(svgPath(image), `${image.name}.svg`);
        showToast('Beaming down SVG…');
    }
}

// Grid view -----------------------------------------------------------------
function renderGridView() {
    gridView.innerHTML = '';
    const frag = document.createDocumentFragment();

    filteredImages.forEach((image, index) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'grid-item';
        item.setAttribute('aria-label', `Open ${formatImageName(image.name)}`);

        const img = document.createElement('img');
        img.src = pngPath(image);
        img.alt = formatImageName(image.name);
        img.loading = 'lazy';
        img.decoding = 'async';
        item.appendChild(img);

        if (image.hasSVG) {
            const badge = document.createElement('span');
            badge.className = 'grid-badge';
            badge.textContent = 'SVG';
            item.appendChild(badge);
        }

        const nameLabel = document.createElement('span');
        nameLabel.className = 'grid-item-name';
        nameLabel.textContent = formatImageName(image.name);
        item.appendChild(nameLabel);

        item.addEventListener('click', () => openLightbox(index));

        frag.appendChild(item);
    });

    gridView.appendChild(frag);
}

function setView(grid) {
    isGridView = grid;

    updateLayout();

    toggleViewBtn.setAttribute('aria-pressed', String(!grid));
    viewLabel.textContent = grid ? 'Viewer' : 'Grid';
    toggleViewBtn.title = grid ? 'Switch to single-image view' : 'Switch to grid view';
    viewIcon.innerHTML = grid
        ? '<rect x="4" y="4" width="16" height="16" rx="2"></rect><line x1="4" y1="12" x2="20" y2="12"></line>'
        : '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>';

    if (grid) renderGridView();
    else displayImage();
}

function toggleView() {
    setView(!isGridView);
}

// Lightbox ------------------------------------------------------------------
function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add('show'));
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
}

function updateLightbox() {
    const image = filteredImages[currentIndex];
    if (!image) return;
    lightboxImg.src = pngPath(image);
    lightboxImg.alt = formatImageName(image.name);
    lightboxCaption.textContent = formatImageName(image.name);
    lightboxPrev.disabled = currentIndex === 0;
    lightboxNext.disabled = currentIndex === filteredImages.length - 1;
}

function closeLightbox() {
    lightbox.classList.remove('show');
    document.body.style.overflow = '';
    setTimeout(() => { lightbox.hidden = true; }, 250);
    displayImage();
}

function lightboxStep(dir) {
    const next = currentIndex + dir;
    if (next >= 0 && next < filteredImages.length) {
        currentIndex = next;
        updateLightbox();
    }
}

// Toast ---------------------------------------------------------------------
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
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

// Touch swipe (single viewer) ----------------------------------------------
let touchStartX = 0;
imageContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

imageContainer.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) { diff > 0 ? showNext() : showPrevious(); }
}, { passive: true });

// Event wiring --------------------------------------------------------------
prevBtn.addEventListener('click', showPrevious);
nextBtn.addEventListener('click', showNext);
downloadPNG.addEventListener('click', downloadCurrentPNG);
downloadSVG.addEventListener('click', downloadCurrentSVG);
searchInput.addEventListener('input', applyFilters);
searchClear.addEventListener('click', () => { searchInput.value = ''; applyFilters(); searchInput.focus(); });
toggleViewBtn.addEventListener('click', toggleView);
chipAll.addEventListener('click', () => setFormatFilter('all'));
chipSvg.addEventListener('click', () => setFormatFilter('svg'));
document.getElementById('resetSearch').addEventListener('click', resetFilters);

// Click main image to zoom in the lightbox
mainImage.addEventListener('click', () => {
    if (filteredImages.length) openLightbox(currentIndex);
});

// Lightbox controls
lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => lightboxStep(-1));
lightboxNext.addEventListener('click', () => lightboxStep(1));
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

// Back to top
window.addEventListener('scroll', () => {
    toTop.hidden = false;
    toTop.classList.toggle('show', window.scrollY > 500);
}, { passive: true });
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Keyboard — ignore when typing in the search field
document.addEventListener('keydown', (e) => {
    const typing = document.activeElement === searchInput;

    if (!lightbox.hidden) {
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') lightboxStep(-1);
        else if (e.key === 'ArrowRight') lightboxStep(1);
        return;
    }

    if (typing) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); showPrevious(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); showNext(); }
});

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
    draw();
    if (reduceMotion) cancelAnimationFrame(rafId);
}

// Initialize ----------------------------------------------------------------
function init() {
    const svgCount = allImages.filter(i => i.hasSVG).length;
    document.getElementById('totalArt').textContent = allImages.length;
    document.getElementById('countAll').textContent = allImages.length;
    document.getElementById('countSvg').textContent = svgCount;

    displayImage();
    startStarfield();
}

init();
