// Cart Page JavaScript
// Handles rendering and management of the full cart page

document.addEventListener("DOMContentLoaded", () => {
    const cartContent = document.getElementById('cart-content');
    if (!cartContent) return;

    // Access the CartManager instance
    const storageKey = 'cinnamona-cart';
    let cart = loadCart();

    function loadCart() {
        try {
            const stored = localStorage.getItem(storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error loading cart:', e);
            return [];
        }
    }

    function saveCart() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(cart));
            updateCartBadge();
        } catch (e) {
            console.error('Error saving cart:', e);
        }
    }

    function updateCartBadge() {
        const badge = document.getElementById('cart-count');
        if (badge) {
            const total = cart.reduce((sum, item) => sum + item.quantity, 0);
            badge.textContent = total.toString();
        }
    }

    function removeItem(productName) {
        cart = cart.filter(item => item.name !== productName);
        saveCart();
        renderCart();
    }

    function updateQuantity(productName, newQuantity) {
        const item = cart.find(item => item.name === productName);
        if (item) {
            item.quantity = Math.max(1, newQuantity);
            saveCart();
            renderCart();
        }
    }

    function getDeliveryFee() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return subtotal >= 300 ? 0 : 30; // Free delivery above 300 MAD
    }

    function getTotal() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return subtotal + getDeliveryFee();
    }

    function renderCart() {
        if (cart.length === 0) {
            cartContent.innerHTML = `
                <div class="cart-empty">
                    <div class="cart-empty-icon">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                    </div>
                    <h2>Votre panier est vide</h2>
                    <p>Découvrez nos délicieuses pâtisseries végétales et ajoutez-les à votre panier !</p>
                    <a href="../index.html#featured" class="btn btn-primary">Découvrir nos produits</a>
                </div>
            `;
            return;
        }

        const itemsHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image.replace('../', '')}" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p class="cart-item-price">${item.price} MAD</p>
                </div>
                <div class="cart-item-quantity">
                    <button 
                        class="quantity-btn quantity-btn-decrease" 
                        data-product="${item.name}"
                        aria-label="Diminuer la quantité">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                    <input 
                        type="number" 
                        class="quantity-input" 
                        value="${item.quantity}" 
                        min="1"
                        data-product="${item.name}"
                        aria-label="Quantité">
                    <button 
                        class="quantity-btn quantity-btn-increase" 
                        data-product="${item.name}"
                        aria-label="Augmenter la quantité">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>
                <div class="cart-item-total">
                    <strong>${item.price * item.quantity} MAD</strong>
                </div>
                <button 
                    class="cart-item-remove" 
                    data-product="${item.name}"
                    aria-label="Retirer ${item.name}">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `).join('');

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const delivery = getDeliveryFee();
        const total = getTotal();

        cartContent.innerHTML = `
            <div class="cart-layout">
                <div class="cart-items-section">
                    <div class="cart-items-header">
                        <h2>Articles (${cart.reduce((sum, item) => sum + item.quantity, 0)})</h2>
                    </div>
                    <div class="cart-items-list">
                        ${itemsHTML}
                    </div>
                </div>
                <div class="cart-summary-section">
                    <div class="cart-summary">
                        <h2>Résumé de la commande</h2>
                        <div class="cart-summary-line">
                            <span>Sous-total</span>
                            <span>${subtotal} MAD</span>
                        </div>
                        <div class="cart-summary-line">
                            <span>Livraison</span>
                            <span>${delivery === 0 ? 'Gratuite' : delivery + ' MAD'}</span>
                        </div>
                        ${delivery > 0 ? `
                            <p class="cart-delivery-notice">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                                Livraison gratuite dès 300 MAD
                            </p>
                        ` : ''}
                        <div class="cart-summary-total">
                            <strong>Total</strong>
                            <strong class="cart-total-amount">${total} MAD</strong>
                        </div>
                        <button class="btn btn-primary cart-checkout-btn" onclick="alert('Fonctionnalité de paiement à venir !')">
                            Passer la commande
                        </button>
                        <a href="catalogue.html" class="btn btn-outline cart-continue-btn">
                            Continuer mes achats
                        </a>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners for quantity controls
        document.querySelectorAll('.quantity-btn-decrease').forEach(btn => {
            btn.addEventListener('click', () => {
                const productName = btn.dataset.product;
                const item = cart.find(i => i.name === productName);
                if (item && item.quantity > 1) {
                    updateQuantity(productName, item.quantity - 1);
                }
            });
        });

        document.querySelectorAll('.quantity-btn-increase').forEach(btn => {
            btn.addEventListener('click', () => {
                const productName = btn.dataset.product;
                const item = cart.find(i => i.name === productName);
                if (item) {
                    updateQuantity(productName, item.quantity + 1);
                }
            });
        });

        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', () => {
                const productName = input.dataset.product;
                const newQuantity = parseInt(input.value) || 1;
                updateQuantity(productName, newQuantity);
            });
        });

        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const productName = btn.dataset.product;
                removeItem(productName);
            });
        });
    }

    // Initial render
    renderCart();
    updateCartBadge();
});
