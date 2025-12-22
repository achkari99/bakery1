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
                    <h2>Your cart is empty</h2>
                    <p>Discover our delicious healthy pastries and add them to your cart!</p>
                    <a href="menu.html" class="btn btn-primary">Discover our products</a>
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
                        aria-label="Decrease quantity">
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
                        aria-label="Quantity">
                    <button 
                        class="quantity-btn quantity-btn-increase" 
                        data-product="${item.name}"
                        aria-label="Increase quantity">
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
                    aria-label="Remove ${item.name}">
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
                        <h2>Items (${cart.reduce((sum, item) => sum + item.quantity, 0)})</h2>
                    </div>
                    <div class="cart-items-list">
                        ${itemsHTML}
                    </div>
                </div>
                <div class="cart-summary-section">
                    <!-- Customer Information Form (Step 1) -->
                    <div class="customer-info-form" id="customer-info-panel">
                        <h2>Customer Information</h2>
                        <form id="customer-form">
                            <div class="form-group">
                                <label for="customer-name">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    Full Name
                                </label>
                                <input type="text" id="customer-name" name="name" required placeholder="Enter your full name">
                            </div>
                            <div class="form-group">
                                <label for="customer-phone">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                    </svg>
                                    Phone Number
                                </label>
                                <input type="tel" id="customer-phone" name="phone" required placeholder="06XXXXXXXX">
                            </div>
                            <div class="form-group">
                                <label for="customer-email">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                    Email (optional)
                                </label>
                                <input type="email" id="customer-email" name="email" placeholder="your.email@example.com">
                            </div>
                            <div class="form-group">
                                <label for="customer-address">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    Delivery Address
                                </label>
                                <textarea id="customer-address" name="address" required rows="3" placeholder="Street, City, Postal Code"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="customer-notes">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14,2 14,8 20,8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10,9 9,9 8,9"></polyline>
                                    </svg>
                                    Special Instructions (optional)
                                </label>
                                <textarea id="customer-notes" name="notes" rows="2" placeholder="Any special requests or delivery instructions?"></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary cart-proceed-order-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="9,18 15,12 9,6"></polyline>
                                </svg>
                                Proceed to Order
                            </button>
                        </form>
                    </div>

                    <!-- Order Summary (Step 2) - Initially Hidden -->
                    <div class="cart-summary" id="order-summary-panel" style="display: none;">
                        <div class="summary-back-button">
                            <button type="button" id="back-to-info-btn" class="btn-back">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="15,18 9,12 15,6"></polyline>
                                </svg>
                                Edit Information
                            </button>
                        </div>
                        <h2>Order Summary</h2>
                        
                        <!-- Customer Info Preview -->
                        <div class="customer-info-preview">
                            <div class="preview-item">
                                <strong>Customer:</strong>
                                <span id="preview-name"></span>
                            </div>
                            <div class="preview-item">
                                <strong>Phone:</strong>
                                <span id="preview-phone"></span>
                            </div>
                            <div class="preview-item">
                                <strong>Address:</strong>
                                <span id="preview-address"></span>
                            </div>
                        </div>

                        <div class="cart-summary-line">
                            <span>Subtotal</span>
                            <span>${subtotal} MAD</span>
                        </div>
                        <div class="cart-summary-line">
                            <span>Delivery</span>
                            <span>${delivery === 0 ? 'Free' : delivery + ' MAD'}</span>
                        </div>
                        ${delivery > 0 ? `
                            <p class="cart-delivery-notice">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                                Free delivery from 500 MAD
                            </p>
                        ` : ''}
                        <div class="cart-summary-total">
                            <strong>Total</strong>
                            <strong class="cart-total-amount">${total} MAD</strong>
                        </div>
                        <button class="btn btn-primary cart-checkout-btn" id="proceed-checkout-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9,22 9,12 15,12 15,22"></polyline>
                            </svg>
                            Proceed to checkout
                        </button>
                        <a href="menu.html" class="btn btn-outline cart-continue-btn">
                            Continue shopping
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

        // Customer form submission handler (Step 1 -> Step 2)
        const customerForm = document.getElementById('customer-form');
        if (customerForm) {
            customerForm.addEventListener('submit', (e) => {
                e.preventDefault();

                // Get customer information
                const customerInfo = {
                    name: document.getElementById('customer-name').value,
                    phone: document.getElementById('customer-phone').value,
                    email: document.getElementById('customer-email').value,
                    address: document.getElementById('customer-address').value,
                    notes: document.getElementById('customer-notes').value
                };

                // Store in localStorage
                localStorage.setItem('customer-info', JSON.stringify(customerInfo));

                // Update preview in order summary
                document.getElementById('preview-name').textContent = customerInfo.name;
                document.getElementById('preview-phone').textContent = customerInfo.phone;
                document.getElementById('preview-address').textContent = customerInfo.address;

                // Smooth transition: Hide form, show summary
                const formPanel = document.getElementById('customer-info-panel');
                const summaryPanel = document.getElementById('order-summary-panel');

                formPanel.style.opacity = '1';
                formPanel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                formPanel.style.transform = 'translateX(0)';

                // Fade out form
                requestAnimationFrame(() => {
                    formPanel.style.opacity = '0';
                    formPanel.style.transform = 'translateX(-30px)';
                });

                setTimeout(() => {
                    formPanel.style.display = 'none';
                    summaryPanel.style.display = 'block';
                    summaryPanel.style.opacity = '0';
                    summaryPanel.style.transform = 'translateX(30px)';
                    summaryPanel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

                    // Fade in summary
                    requestAnimationFrame(() => {
                        summaryPanel.style.opacity = '1';
                        summaryPanel.style.transform = 'translateX(0)';
                    });
                }, 300);
            });
        }

        // Back button handler (Step 2 -> Step 1)
        const backButton = document.getElementById('back-to-info-btn');
        if (backButton) {
            backButton.addEventListener('click', () => {
                const formPanel = document.getElementById('customer-info-panel');
                const summaryPanel = document.getElementById('order-summary-panel');

                // Fade out summary
                summaryPanel.style.opacity = '1';
                summaryPanel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                summaryPanel.style.transform = 'translateX(0)';

                requestAnimationFrame(() => {
                    summaryPanel.style.opacity = '0';
                    summaryPanel.style.transform = 'translateX(30px)';
                });

                setTimeout(() => {
                    summaryPanel.style.display = 'none';
                    formPanel.style.display = 'block';
                    formPanel.style.opacity = '0';
                    formPanel.style.transform = 'translateX(-30px)';
                    formPanel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

                    // Fade in form
                    requestAnimationFrame(() => {
                        formPanel.style.opacity = '1';
                        formPanel.style.transform = 'translateX(0)';
                    });
                }, 300);
            });
        }

        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const productName = btn.dataset.product;
                removeItem(productName);
            });
        });

        // Checkout button handler
        const checkoutBtn = document.getElementById('proceed-checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', async () => {
                // Get customer information from localStorage (already saved during form submission)
                const customerInfoStr = localStorage.getItem('customer-info');
                if (!customerInfoStr) {
                    alert('Error: Customer information not found. Please go back and fill the form again.');
                    return;
                }

                const customerInfo = JSON.parse(customerInfoStr);

                // Prepare totals
                const totals = {
                    subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                    delivery: getDeliveryFee(),
                    total: getTotal()
                };

                // Show loading state
                const originalText = checkoutBtn.innerHTML;
                checkoutBtn.disabled = true;
                checkoutBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
                        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1"></path>
                    </svg>
                    Génération de la facture...
                `;

                try {
                    // Check if html2canvas is loaded
                    if (typeof html2canvas === 'undefined') {
                        throw new Error('html2canvas library not loaded');
                    }

                    // Generate invoice
                    const invoiceGenerator = new InvoiceGenerator();
                    // Set your business WhatsApp number here (format: country code + number, no + or spaces)
                    // Example: invoiceGenerator.setBusinessWhatsApp('212600000000');

                    const invoiceData = await invoiceGenerator.generateInvoice(customerInfo, cart, totals);

                    // Store customer info in localStorage
                    localStorage.setItem('customer-info', JSON.stringify(customerInfo));

                    // Send to WhatsApp
                    await invoiceGenerator.sendToWhatsApp(invoiceData, customerInfo, totals);


                    // Optionally clear cart after successful order
                    // cart = [];
                    // saveCart();
                    // renderCart();

                } catch (error) {
                    console.error('Error generating invoice:', error);
                    alert('Erreur lors de la génération de la facture. Veuillez réessayer.');
                } finally {
                    // Restore button state
                    checkoutBtn.disabled = false;
                    checkoutBtn.innerHTML = originalText;
                }
            });
        }
    }

    // Initial render
    renderCart();
    updateCartBadge();
});
