/**
 * MODAL.JS - Modal and Lightbox functionality
 */

class ModalManager {
    constructor() {
        this.activeModal = null;
        this.init();
    }

    init() {
        // Create modal container if it doesn't exist
        if (!document.getElementById('dynamic-modal')) {
            const overlay = document.createElement('div');
            overlay.id = 'dynamic-modal';
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal-content">
                    <button class="modal-close" aria-label="Close modal">&times;</button>
                    <div class="modal-body"></div>
                </div>
            `;
            document.body.appendChild(overlay);

            // Close listeners
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.close();
            });

            overlay.querySelector('.modal-close').addEventListener('click', () => this.close());

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.activeModal) this.close();
            });
        }
    }

    open(content, options = {}) {
        const overlay = document.getElementById('dynamic-modal');
        const body = overlay.querySelector('.modal-body');

        body.innerHTML = content;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        this.activeModal = overlay;

        // Trigger any callbacks
        if (options.onOpen) options.onOpen();
    }

    close() {
        const overlay = document.getElementById('dynamic-modal');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        this.activeModal = null;
    }

    quickView(product) {
        const content = `
            <div class="quick-view">
                <div class="quick-view-grid">
                    <div class="quick-view-image image-zoom">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="quick-view-info">
                        <h2>${product.name}</h2>
                        <p class="quick-view-price">${product.price} MAD</p>
                        <p class="quick-view-description">${product.description}</p>
                        ${product.tags ? `
                            <div class="quick-view-tags">
                                ${product.tags.map(tag => `<span class="quick-view-tag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                        <button class="btn btn-primary btn-animated" onclick="Modal.addToCart('${product.id}')">
                            ${(window.I18n && window.I18n.t) ? window.I18n.t('products.add_to_cart') : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        this.open(content);
    }

    addToCart(productId) {
        // Cart animation
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            const current = parseInt(badge.textContent) || 0;
            badge.textContent = current + 1;
            badge.classList.add('active', 'bump');
            setTimeout(() => badge.classList.remove('bump'), 500);
        }

        this.close();

        // Show toast
        if (window.showToast) {
            const message = (window.I18n && window.I18n.t) ? window.I18n.t('common.added_to_cart') : 'Added to cart!';
            window.showToast(message, 'success');
        }
    }
}

// Initialize global modal manager
window.Modal = new ModalManager();

// Auto-setup quick view for products
document.addEventListener('DOMContentLoaded', () => {
    // Quick view buttons
    document.querySelectorAll('[data-quickview]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const productCard = btn.closest('.product-card');

            // Translate description if it looks like a key (contains dots) or just try translating
            let description = productCard.dataset.description || productCard.querySelector('.product-desc')?.textContent || '';
            if (window.I18n && window.I18n.t) {
                // If it's a key, this returns translation. If it's text and no key matches, it returns text.
                description = window.I18n.t(description);
            }

            // Translate tags
            let tags = [];
            if (productCard.dataset.tags) {
                tags = productCard.dataset.tags.split(',').map(tag => {
                    const tagKey = tag.trim();
                    return (window.I18n && window.I18n.t) ? window.I18n.t(tagKey) : tagKey;
                });
            } else if (productCard.querySelectorAll('.product-tags li').length > 0) {
                tags = Array.from(productCard.querySelectorAll('.product-tags li')).map(li => li.textContent);
            }

            const product = {
                id: productCard.dataset.productId || Date.now(),
                name: productCard.querySelector('h3')?.textContent || 'Product',
                price: productCard.querySelector('.product-price')?.textContent?.replace(/&nbsp;/g, ' ').replace(' MAD', '') || '0',
                description: description,
                image: productCard.querySelector('img')?.src || '',
                tags: tags
            };
            window.Modal.quickView(product);
        });
    });
});
