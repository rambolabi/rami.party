document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const searchBar = document.getElementById('search-bar');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const closeBtn = document.querySelector('.close-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    // Wire each category button to its config entry via a shared handler.
    const buttons = {
        lore: document.getElementById('lore-btn'),
        muggle: document.getElementById('muggle-btn'),
        magic: document.getElementById('magic-btn')
    };

    let currentCategory = 'lore';
    let currentIndex = 0;
    let currentImages = [];
    let lastFocused = null;

    // Cache of discovered images per category, so we only scan a folder once.
    const discovered = new Map();

    /* ---------------------------------------------------------------------
       Image auto-discovery
       Probes ./img/<folder>/<folder> (n).<ext> and finds how many exist.
       Uses exponential + binary search so a folder of 500 images costs
       only ~18 tiny requests instead of 500. Assumes contiguous numbering.
       --------------------------------------------------------------------- */
    function resolveImage(folder, index) {
        // Try each allowed extension until one loads; resolves to the src or null.
        return new Promise((resolve) => {
            let i = 0;
            const tryNext = () => {
                if (i >= GALLERY_EXTENSIONS.length) return resolve(null);
                const src = `./img/${folder}/${folder} (${index}).${GALLERY_EXTENSIONS[i++]}`;
                const probe = new Image();
                probe.onload = () => resolve(src);
                probe.onerror = tryNext;
                probe.src = src;
            };
            tryNext();
        });
    }

    async function countImages(folder) {
        if (!(await resolveImage(folder, 1))) return 0;
        // Find an upper bound that does NOT exist.
        let lo = 1;
        let hi = 2;
        while (await resolveImage(folder, hi)) {
            lo = hi;
            hi *= 2;
            if (hi > 100000) break; // safety valve
        }
        // Binary search for the last existing index between lo and hi.
        while (hi - lo > 1) {
            const mid = Math.floor((lo + hi) / 2);
            if (await resolveImage(folder, mid)) lo = mid;
            else hi = mid;
        }
        return lo;
    }

    async function loadCategory(category) {
        if (discovered.has(category)) return discovered.get(category);

        const cfg = GALLERY_CONFIG.find((c) => c.category === category);
        if (!cfg) {
            discovered.set(category, []);
            return [];
        }

        const count = await countImages(cfg.folder);
        const list = [];
        for (let i = 1; i <= count; i++) {
            list.push({
                folder: cfg.folder,
                index: i,
                src: candidate(cfg.folder, i, 0),
                title: `${cfg.title} ${i}`,
                keywords: `${cfg.keywords} ${i}`,
                category: cfg.category
            });
        }
        discovered.set(category, list);
        return list;
    }

    // Build the src for a folder/index using the Nth allowed extension.
    function candidate(folder, index, extIndex) {
        return `./img/${folder}/${folder} (${index}).${GALLERY_EXTENSIONS[extIndex]}`;
    }

    /* ---------------------------------------------------------------------
       Rendering
       --------------------------------------------------------------------- */
    function setMessage(html) {
        gallery.innerHTML = `<p class="gallery-message">${html}</p>`;
    }

    function displayImages(imageArray) {
        currentImages = imageArray;

        if (imageArray.length === 0) {
            setMessage('No scrolls match your search. Try another incantation. 🔮');
            return;
        }

        const fragment = document.createDocumentFragment();
        imageArray.forEach((image, index) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'gallery-item';
            item.setAttribute('aria-label', `Open ${image.title}`);
            item.style.setProperty('--i', index % 24); // staggered reveal

            const img = document.createElement('img');
            img.alt = image.title;
            img.loading = 'lazy';
            img.decoding = 'async';
            // Fade each thumbnail in once it has decoded, and remember which
            // extension actually worked so the lightbox reuses it instantly.
            img.addEventListener('load', () => {
                image.src = img.src;
                img.classList.add('loaded');
            });
            // Try the next allowed extension; drop the tile only if none work.
            let extIndex = 0;
            img.addEventListener('error', () => {
                extIndex++;
                if (extIndex < GALLERY_EXTENSIONS.length) {
                    img.src = candidate(image.folder, image.index, extIndex);
                } else {
                    item.remove();
                }
            });
            img.src = image.src;

            const title = document.createElement('div');
            title.className = 'title';
            title.textContent = image.title;

            item.appendChild(img);
            item.appendChild(title);
            item.addEventListener('click', () => openLightbox(index));

            fragment.appendChild(item);
        });

        gallery.innerHTML = '';
        gallery.appendChild(fragment);
    }

    async function filterByCategory() {
        const category = currentCategory;
        if (!discovered.has(category)) {
            setMessage('Summoning the archives…');
            await loadCategory(category);
            // The user switched category while we were loading — bail out.
            if (category !== currentCategory) return;
        }

        const searchTerm = searchBar.value.trim().toLowerCase();
        let filtered = discovered.get(category) || [];

        if (searchTerm) {
            filtered = filtered.filter((image) =>
                image.title.toLowerCase().includes(searchTerm) ||
                image.keywords.toLowerCase().includes(searchTerm)
            );
        }

        displayImages(filtered);
    }

    /* ---------------------------------------------------------------------
       Lightbox
       --------------------------------------------------------------------- */
    let lightboxExt = 0;

    function preload(index) {
        const image = currentImages[index];
        if (!image) return;
        const probe = new Image();
        probe.onload = () => { image.src = probe.src; };
        probe.src = image.src;
    }

    function updateLightbox() {
        const image = currentImages[currentIndex];
        if (!image) return;
        lightboxExt = 0;
        lightboxImg.classList.remove('loaded');
        lightboxImg.src = image.src;
        lightboxImg.alt = image.title;
        lightboxTitle.textContent = image.title;
        // Preload neighbours for instant next/prev.
        preload((currentIndex + 1) % currentImages.length);
        preload((currentIndex - 1 + currentImages.length) % currentImages.length);
    }

    function openLightbox(index) {
        if (!currentImages.length) return;
        lastFocused = document.activeElement;
        currentIndex = index;
        updateLightbox();
        lightbox.classList.remove('hidden');
        // Next frame so the CSS transition can play.
        requestAnimationFrame(() => lightbox.classList.add('open'));
        document.body.classList.add('lightbox-open');
        closeBtn.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.classList.remove('lightbox-open');
        const done = (e) => {
            // Ignore transitions bubbling up from child elements (the image).
            if (e && e.target !== lightbox) return;
            lightbox.classList.add('hidden');
            lightbox.removeEventListener('transitionend', done);
        };
        lightbox.addEventListener('transitionend', done);
        // Fallback in case no transition fires (e.g. reduced motion).
        setTimeout(done, 320);
        if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    function showNext() {
        if (currentImages.length < 2) return;
        currentIndex = (currentIndex + 1) % currentImages.length;
        updateLightbox();
    }

    function showPrev() {
        if (currentImages.length < 2) return;
        currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        updateLightbox();
    }

    lightboxImg.addEventListener('load', () => {
        const image = currentImages[currentIndex];
        if (image) image.src = lightboxImg.src;
        lightboxImg.classList.add('loaded');
    });

    // If the current extension fails in the lightbox, try the next one.
    lightboxImg.addEventListener('error', () => {
        const image = currentImages[currentIndex];
        if (!image) return;
        lightboxExt++;
        if (lightboxExt < GALLERY_EXTENSIONS.length) {
            lightboxImg.src = candidate(image.folder, image.index, lightboxExt);
        }
    });

    /* ---------------------------------------------------------------------
       Events
       --------------------------------------------------------------------- */
    function selectCategory(category) {
        if (category === currentCategory) return;
        currentCategory = category;
        Object.entries(buttons).forEach(([key, btn]) => {
            if (!btn) return;
            const isActive = key === category;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', String(isActive));
        });
        filterByCategory();
    }

    Object.entries(buttons).forEach(([category, btn]) => {
        if (btn) btn.addEventListener('click', () => selectCategory(category));
    });

    // Debounced search for a smoother feel while typing.
    let searchTimer;
    searchBar.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(filterByCategory, 120);
    });

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);

    // Let the control "spans" respond to Enter/Space like real buttons.
    [closeBtn, prevBtn, nextBtn].forEach((el) => {
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                el.click();
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('hidden')) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowRight') showNext();
        else if (e.key === 'ArrowLeft') showPrev();
    });

    // Click the backdrop (not the image or controls) to close.
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Touch swipe for mobile.
    let touchStartX = 0;
    let touchStartY = 0;
    const minSwipeDistance = 50;

    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        const diffX = e.changedTouches[0].screenX - touchStartX;
        const diffY = e.changedTouches[0].screenY - touchStartY;
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
            if (diffX > 0) showPrev();
            else showNext();
        }
    }, { passive: true });

    // Initial display.
    filterByCategory();
});
