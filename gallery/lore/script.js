document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const searchBar = document.getElementById('search-bar');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const closeBtn = document.querySelector('.close-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const remixBtn = document.getElementById('remix-btn');

    const buttons = {
        lore: document.getElementById('lore-btn'),
        muggle: document.getElementById('muggle-btn'),
        magic: document.getElementById('magic-btn')
    };

    let currentCategory = 'lore';
    let currentIndex = 0;
    let currentImages = [];
    let lastFocused = null;

    /* ---------------------------------------------------------------------
       Catalogue — built synchronously from the manifest in img.js.
       No network probing, no 404s: the page knows every image up front.
       --------------------------------------------------------------------- */
    const catalogue = new Map();
    GALLERY_CONFIG.forEach((cfg) => {
        const list = [];
        for (let i = 1; i <= cfg.count; i++) {
            list.push({
                src: gallerySrc(cfg, i),
                title: `${cfg.title} ${i}`,
                keywords: `${cfg.keywords} ${i}`,
                category: cfg.category
            });
        }
        catalogue.set(cfg.category, list);
    });

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
            img.addEventListener('load', () => img.classList.add('loaded'));
            // Only fires if the manifest count is wrong — drop the tile quietly.
            img.addEventListener('error', () => item.remove());
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

    function filterByCategory() {
        const searchTerm = searchBar.value.trim().toLowerCase();
        let filtered = catalogue.get(currentCategory) || [];

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
    function preload(index) {
        const image = currentImages[index];
        if (!image) return;
        new Image().src = image.src;
    }

    function updateLightbox() {
        const image = currentImages[currentIndex];
        if (!image) return;
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

    lightboxImg.addEventListener('load', () => lightboxImg.classList.add('loaded'));

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

    // Send the current image into the Lore Creator.
    if (remixBtn) {
        remixBtn.addEventListener('click', () => {
            const image = currentImages[currentIndex];
            if (!image || !window.LoreCreator) return;
            closeLightbox();
            window.LoreCreator.openWith(image.src);
        });
    }

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
