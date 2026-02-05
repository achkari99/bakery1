(() => {
    const grid = document.querySelector('.product-grid');
    if (!grid) return;

    const existingNames = new Set(
        Array.from(grid.querySelectorAll('.product-card h3'))
            .map((el) => el.textContent.trim().toLowerCase())
            .filter(Boolean)
    );

    const escapeHtml = (value) => {
        if (!value) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    const getCurrentLang = () => document.documentElement.lang || (window.I18n && window.I18n.currentLang) || 'en';

    const getProductName = (product) => {
        const lang = getCurrentLang();
        if (lang === 'ar') {
            return product.nameAr || product.name_ar || product.nameArabic || product.name || 'Product';
        }
        return product.name || 'Product';
    };

    const buildCard = (product) => {
        const nameEn = product.name || 'Product';
        const nameAr = product.nameAr || product.name_ar || product.nameArabic || '';
        const name = escapeHtml(getProductName(product));
        const price = Number(product.price || 0);
        const image = product.image || '/images/logo1.png';
        const category = product.category || 'sugar-free';
        const tags = Array.isArray(product.tags) ? product.tags : (product.tags ? [product.tags] : []);
        const tagString = tags.join(',');
        const description = escapeHtml(product.description || '');
        const inStock = product.inStock !== false;
        const badgeText = inStock ? category.replace(/-/g, ' ') : 'Sold Out';
        const badgeClass = inStock ? 'product-badge' : 'product-badge product-badge--bright';

        return `
            <article class="product-card" data-product data-product-id="${product.id || ''}"
                data-category="${escapeHtml(category)}"
                data-name-en="${escapeHtml(nameEn)}"
                data-name-ar="${escapeHtml(nameAr)}">
                <div class="product-media">
                    <span class="${badgeClass}">${escapeHtml(badgeText)}</span>
                    <img src="${escapeHtml(image)}" alt="${name}" loading="lazy">
                    <span class="product-category-overlay">${escapeHtml(category.replace(/-/g, ' '))}</span>
                    <div class="product-actions-overlay">
                        <button class="btn-icon" aria-label="Add to Cart"
                            data-add-to-cart="${name}" ${inStock ? '' : 'disabled aria-disabled="true"'}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path
                                    d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-7-4h7a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2z" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-header">
                        <h3>${name}</h3>
                        <p class="product-price">${price}&nbsp;MAD</p>
                    </div>
                </div>
            </article>
        `;
    };

    const refreshLocalizedCards = () => {
        const lang = getCurrentLang();
        grid.querySelectorAll('.product-card[data-name-en]').forEach((card) => {
            const nameEn = card.dataset.nameEn || 'Product';
            const nameAr = card.dataset.nameAr || '';
            const displayName = (lang === 'ar' && nameAr) ? nameAr : nameEn;

            const nameEl = card.querySelector('h3');
            if (nameEl) nameEl.textContent = displayName;

            const img = card.querySelector('img');
            if (img) img.alt = displayName;

            const addBtn = card.querySelector('[data-add-to-cart]');
            if (addBtn) addBtn.setAttribute('data-add-to-cart', displayName);
        });
    };

    const bindCartButtons = () => {
        if (window.cartManager && typeof window.cartManager.setupAddToCartButtons === 'function') {
            window.cartManager.setupAddToCartButtons();
        }
    };

    const applyActiveFilter = () => {
        const activeBtn = document.querySelector('.filter-btn.active');
        if (!activeBtn) return;
        const filter = activeBtn.dataset.filter || 'all';
        document.querySelectorAll('.product-card').forEach((card) => {
            const categories = (card.dataset.category || '').split(' ');
            if (filter === 'all' || categories.includes(filter)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    };

    const fetchProducts = async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Fetch failed: ${url}`);
        const result = await response.json();
        return result.data || result;
    };

    const loadProducts = async () => {
        try {
            let products = [];
            try {
                products = await fetchProducts('/api/products');
            } catch {
                products = await fetchProducts('/data/products.json');
            }
            const additions = products.filter((product) => {
                if (product.status && product.status !== 'active') return false;
                const name = (getProductName(product) || '').trim().toLowerCase();
                return name && !existingNames.has(name);
            });

            if (!additions.length) return;

            grid.insertAdjacentHTML('beforeend', additions.map(buildCard).join(''));
            additions.forEach((product) => {
                const name = (getProductName(product) || '').trim().toLowerCase();
                if (name) existingNames.add(name);
            });

            bindCartButtons();
            applyActiveFilter();
            refreshLocalizedCards();
        } catch (err) {
            // Keep original menu if API is unavailable.
        }
    };

    document.addEventListener('i18n:applied', refreshLocalizedCards);
    loadProducts();
})();
