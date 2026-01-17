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

    const buildCard = (product) => {
        const name = escapeHtml(product.name || 'Product');
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
                data-category="${escapeHtml(category)}" data-description="${description}"
                ${tagString ? `data-tags="${escapeHtml(tagString)}"` : ''}>
                <div class="product-media">
                    <span class="${badgeClass}">${escapeHtml(badgeText)}</span>
                    <img src="${escapeHtml(image)}" alt="${name}" loading="lazy">
                    <span class="product-category-overlay">${escapeHtml(category.replace(/-/g, ' '))}</span>
                    <div class="product-actions-overlay">
                        <button class="btn-icon" aria-label="Quick View" data-quickview="${name}">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </button>
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

    const bindQuickView = () => {
        if (!window.Modal) return;
        document.querySelectorAll('[data-quickview]').forEach((btn) => {
            if (btn.dataset.quickviewBound) return;
            btn.dataset.quickviewBound = 'true';
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productCard = btn.closest('.product-card');
                if (!productCard) return;

                let description = productCard.dataset.description || productCard.querySelector('.product-desc')?.textContent || '';
                if (window.I18n && window.I18n.t) {
                    description = window.I18n.t(description);
                }

                let tags = [];
                if (productCard.dataset.tags) {
                    tags = productCard.dataset.tags.split(',').map(tag => {
                        const tagKey = tag.trim();
                        return (window.I18n && window.I18n.t) ? window.I18n.t(tagKey) : tagKey;
                    });
                } else if (productCard.querySelectorAll('.product-tags li').length > 0) {
                    tags = Array.from(productCard.querySelectorAll('.product-tags li')).map(li => li.textContent);
                }

                const nameEl = productCard.querySelector('h3');
                const productKey = nameEl?.dataset.i18n || null;

                const product = {
                    id: productCard.dataset.productId || Date.now(),
                    name: nameEl?.textContent || 'Product',
                    productKey: productKey,
                    price: productCard.querySelector('.product-price')?.textContent?.replace(/&nbsp;/g, ' ').replace(' MAD', '') || '0',
                    description: description,
                    image: productCard.querySelector('img')?.src || '',
                    tags: tags
                };
                window.Modal.quickView(product);
            });
        });
    };

    const bindCartButtons = () => {
        if (window.cartManager && typeof window.cartManager.setupAddToCartButtons === 'function') {
            window.cartManager.setupAddToCartButtons();
        }
    };

    const loadProducts = async () => {
        try {
            const response = await fetch('/api/products');
            if (!response.ok) return;
            const result = await response.json();
            const products = result.data || [];
            const additions = products.filter((product) => {
                if (product.status && product.status !== 'active') return false;
                const name = (product.name || '').trim().toLowerCase();
                return name && !existingNames.has(name);
            });

            if (!additions.length) return;

            grid.insertAdjacentHTML('beforeend', additions.map(buildCard).join(''));
            additions.forEach((product) => {
                const name = (product.name || '').trim().toLowerCase();
                if (name) existingNames.add(name);
            });

            bindQuickView();
            bindCartButtons();
        } catch (err) {
            // Keep original menu if API is unavailable.
        }
    };

    loadProducts();
})();
