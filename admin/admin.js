/**
 * Cinnamona Admin Panel JavaScript
 * Handles authentication, CRUD operations, and UI using LocalStorage
 */

const Admin = (() => {
    // Keys for LocalStorage
    const KEYS = {
        TOKEN: 'cinnamona-admin-token',
        PRODUCTS: 'cinnamona-products',
        SHOPS: 'cinnamona-shops',
        FAQS: 'cinnamona-faqs',
        CONTACTS: 'cinnamona-contacts',
        SETTINGS: 'cinnamona-settings',
        ORDERS: 'cinnamona-orders'
    };

    let currentUser = null;
    let currentSection = 'overview';

    // =====================
    // Data Management
    // =====================

    const initialData = {
        products: [
            { id: 'p1', name: 'Original Cinnamon Roll', category: 'rolls', price: 25, status: 'Active', featured: true, description: 'Classic cinnamon roll with our signature frosting.' },
            { id: 'p2', name: 'Chocolate Hazelnut', category: 'rolls', price: 30, status: 'Active', featured: true, description: 'Rich chocolate and hazelnut filling.' },
            { id: 'p3', name: 'Salted Caramel', category: 'rolls', price: 28, status: 'Active', featured: false, description: 'Topped with homemade salted caramel sauce.' },
            { id: 'p4', name: 'Box of 4', category: 'boxes', price: 95, status: 'Active', featured: false, description: 'Your choice of 4 rolls.' }
        ],
        shops: [
            { id: 's1', name: 'Golden Sweet Tetouan', address: 'Tetouan, Morocco', phone: '+212 603-981438', hours: '10:00 - 22:00' }
        ],
        faqs: [
            { id: 'f1', question: 'Do you offer delivery?', category: 'delivery', answer: 'Yes, we deliver to Tetouan & Tangier.' },
            { id: 'f2', question: 'Are they vegan?', category: 'allergens', answer: 'Our standard rolls contain dairy and eggs.' }
        ],
        contacts: [
            { id: 'c1', name: 'Test User', email: 'test@example.com', subject: 'Inquiry', message: 'Do you cater for weddings?', status: 'new', createdAt: new Date().toISOString() }
        ],
        settings: {
            siteName: 'Cinnamona by Mona',
            phone: '+212 637-629395',
            email: 'bonjour@cinnamona.ma',
            address: 'Tetouan & Tangier, Morocco',
            promoText: 'FOR A LIMITED TIME · FREE DELIVERY TO TANGIER FROM 500 DHs'
        },
        orders: [
            { id: 'o1', customer: 'John Doe', items: '2x Original Cinnamon Roll', total: 50, date: new Date().toISOString(), status: 'WhatsApp Sent' }
        ]
    };

    function loadData(key) {
        const stored = localStorage.getItem(key);
        if (!stored) {
            // Initialize with default data if empty
            const defaultKey = key.replace('cinnamona-', '');
            if (initialData[defaultKey]) {
                localStorage.setItem(key, JSON.stringify(initialData[defaultKey]));
                return initialData[defaultKey];
            }
            return [];
        }
        return JSON.parse(stored);
    }

    function saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // =====================
    // Authentication
    // =====================

    function login(email, password) {
        // Simple mock authentication
        if (email === 'admin@goldensweet.ma' && password === 'admin123') {
            const token = 'mock-token-' + Date.now();
            localStorage.setItem(KEYS.TOKEN, token);
            currentUser = { email, name: 'Admin' };
            showDashboard();
            loadStats();
        } else {
            document.getElementById('login-error').textContent = 'Invalid credentials (try admin@goldensweet.ma / admin123)';
        }
    }

    function logout() {
        localStorage.removeItem(KEYS.TOKEN);
        currentUser = null;
        showLogin();
    }

    function checkAuth() {
        const token = localStorage.getItem(KEYS.TOKEN);
        if (token) {
            showDashboard();
            loadStats();
        } else {
            showLogin();
        }
    }

    function showLogin() {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
    }

    function showDashboard() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
    }

    // =====================
    // Navigation
    // =====================

    function showSection(section) {
        currentSection = section;

        // Update nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === section);
        });

        // Update sections
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.toggle('active', sec.id === `section-${section}`);
        });

        // Update title
        const titles = {
            overview: 'Dashboard',
            products: 'Products',
            shops: 'Shops',
            faqs: 'FAQs',
            contacts: 'Messages',
            settings: 'Settings',
            orders: 'Order History'
        };
        document.getElementById('page-title').textContent = titles[section] || 'Dashboard';

        // Load section data
        loadSectionData(section);
    }

    function loadSectionData(section) {
        switch (section) {
            case 'products': renderProducts(); break;
            case 'shops': renderShops(); break;
            case 'faqs': renderFaqs(); break;
            case 'contacts': renderContacts(); break;
            case 'settings': renderSettings(); break;
            case 'orders': renderOrders(); break;
        }
    }

    // =====================
    // Stats
    // =====================

    function loadStats() {
        const products = loadData(KEYS.PRODUCTS);
        const shops = loadData(KEYS.SHOPS);
        const faqs = loadData(KEYS.FAQS);
        const contacts = loadData(KEYS.CONTACTS);
        const orders = loadData(KEYS.ORDERS);
        const settings = loadData(KEYS.SETTINGS);

        document.getElementById('stat-products').textContent = products.length;
        document.getElementById('stat-shops').textContent = shops.length;
        document.getElementById('stat-faqs').textContent = faqs.length;
        document.getElementById('stat-contacts').textContent = (contacts.filter(c => c.status === 'new').length + orders.length);

        // Update site name in dashboard header if changed
        if (settings.siteName) {
            document.querySelectorAll('.sidebar-header h2, .login-header h1').forEach(el => el.textContent = settings.siteName);
        }
    }

    // =====================
    // Products CRUD
    // =====================

    function renderProducts() {
        const products = loadData(KEYS.PRODUCTS);
        const tbody = document.getElementById('products-table');

        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem">No products yet. Click "Add Product" to create one.</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(p => `
            <tr>
                <td>
                    <strong>${p.name}</strong>
                    ${p.featured ? '<span class="badge badge-replied" style="font-size:0.75em; margin-left:8px">Featured</span>' : ''}
                </td>
                <td>${p.category || '-'}</td>
                <td>${p.price} MAD</td>
                <td><span class="badge ${p.inStock !== false ? 'badge-active' : 'badge-danger'}">${p.inStock !== false ? 'In Stock' : 'Sold Out'}</span></td>
                <td class="actions">
                    <button class="btn btn-outline btn-small" onclick="Admin.toggleStock('${p.id}')">${p.inStock !== false ? 'Mark Sold Out' : 'Restock'}</button>
                    <button class="btn btn-outline btn-small" onclick="Admin.editProduct('${p.id}')">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="Admin.deleteProduct('${p.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    function saveProduct(data, id = null) {
        const products = loadData(KEYS.PRODUCTS);

        // Handle checkboxes (featured and inStock)
        data.featured = data.featured === 'on';
        data.inStock = data.inStock === 'on';

        if (id) {
            const index = products.findIndex(p => p.id === id);
            if (index !== -1) {
                products[index] = { ...products[index], ...data };
            }
        } else {
            products.push({ ...data, id: 'p' + Date.now() });
        }
        saveData(KEYS.PRODUCTS, products);
        closeModal();
        renderProducts();
        loadStats();
    }

    function toggleStock(id) {
        const products = loadData(KEYS.PRODUCTS);
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index].inStock = products[index].inStock === false ? true : false;
            saveData(KEYS.PRODUCTS, products);
            renderProducts();
        }
    }

    function deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        const products = loadData(KEYS.PRODUCTS);
        const filtered = products.filter(p => p.id !== id);
        saveData(KEYS.PRODUCTS, filtered);
        renderProducts();
        loadStats();
    }

    function editProduct(id) {
        const products = loadData(KEYS.PRODUCTS);
        const product = products.find(p => p.id === id);
        if (product) openModal('product', product);
    }

    // =====================
    // Shops CRUD
    // =====================

    function renderShops() {
        const shops = loadData(KEYS.SHOPS);
        const tbody = document.getElementById('shops-table');

        if (shops.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:2rem">No shops yet.</td></tr>';
            return;
        }

        tbody.innerHTML = shops.map(s => `
            <tr>
                <td><strong>${s.name}</strong></td>
                <td>${s.address || '-'}</td>
                <td>${s.phone || '-'}</td>
                <td class="actions">
                    <button class="btn btn-outline btn-small" onclick="Admin.editShop('${s.id}')">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="Admin.deleteShop('${s.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    function saveShop(data, id = null) {
        const shops = loadData(KEYS.SHOPS);
        if (id) {
            const index = shops.findIndex(s => s.id === id);
            if (index !== -1) shops[index] = { ...shops[index], ...data };
        } else {
            shops.push({ ...data, id: 's' + Date.now() });
        }
        saveData(KEYS.SHOPS, shops);
        closeModal();
        renderShops();
        loadStats();
    }

    function deleteShop(id) {
        if (!confirm('Delete this shop?')) return;
        const shops = loadData(KEYS.SHOPS);
        const filtered = shops.filter(s => s.id !== id);
        saveData(KEYS.SHOPS, filtered);
        renderShops();
        loadStats();
    }

    function editShop(id) {
        const shops = loadData(KEYS.SHOPS);
        const shop = shops.find(s => s.id === id);
        if (shop) openModal('shop', shop);
    }

    // =====================
    // FAQs CRUD
    // =====================

    function renderFaqs() {
        const faqs = loadData(KEYS.FAQS);
        const tbody = document.getElementById('faqs-table');

        if (faqs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:2rem">No FAQs yet.</td></tr>';
            return;
        }

        tbody.innerHTML = faqs.map(f => `
            <tr>
                <td>${f.question}</td>
                <td>${f.category || '-'}</td>
                <td class="actions">
                    <button class="btn btn-outline btn-small" onclick="Admin.editFaq('${f.id}')">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="Admin.deleteFaq('${f.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    function saveFaq(data, id = null) {
        const faqs = loadData(KEYS.FAQS);
        if (id) {
            const index = faqs.findIndex(f => f.id === id);
            if (index !== -1) faqs[index] = { ...faqs[index], ...data };
        } else {
            faqs.push({ ...data, id: 'f' + Date.now() });
        }
        saveData(KEYS.FAQS, faqs);
        closeModal();
        renderFaqs();
        loadStats();
    }

    function deleteFaq(id) {
        if (!confirm('Delete this FAQ?')) return;
        const faqs = loadData(KEYS.FAQS);
        const filtered = faqs.filter(f => f.id !== id);
        saveData(KEYS.FAQS, filtered);
        renderFaqs();
        loadStats();
    }

    function editFaq(id) {
        const faqs = loadData(KEYS.FAQS);
        const faq = faqs.find(f => f.id === id);
        if (faq) openModal('faq', faq);
    }

    // =====================
    // Contacts
    // =====================

    function renderContacts() {
        const contacts = loadData(KEYS.CONTACTS);
        const tbody = document.getElementById('contacts-table');

        if (contacts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem">No messages yet.</td></tr>';
            return;
        }

        tbody.innerHTML = contacts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(c => `
            <tr>
                <td>${new Date(c.createdAt).toLocaleDateString()}</td>
                <td><strong>${c.name}</strong></td>
                <td><a href="mailto:${c.email}">${c.email}</a></td>
                <td>${c.subject || '-'}</td>
                <td><span class="badge badge-${c.status}">${c.status}</span></td>
                <td class="actions">
                    <button class="btn btn-outline btn-small" onclick="Admin.viewContact('${c.id}')">View</button>
                    <button class="btn btn-small" onclick="Admin.markReplied('${c.id}')">Mark Replied</button>
                </td>
            </tr>
        `).join('');
    }

    function viewContact(id) {
        const contacts = loadData(KEYS.CONTACTS);
        const contact = contacts.find(c => c.id === id);
        if (contact) {
            alert(`From: ${contact.name}\nEmail: ${contact.email}\nPhone: ${contact.phone || 'N/A'}\nSubject: ${contact.subject || 'N/A'}\n\nMessage:\n${contact.message}`);
        }
    }

    function markReplied(id) {
        const contacts = loadData(KEYS.CONTACTS);
        const index = contacts.findIndex(c => c.id === id);
        if (index !== -1) {
            contacts[index].status = 'replied';
            saveData(KEYS.CONTACTS, contacts);
            renderContacts();
            loadStats();
        }
    }

    // =====================
    // Orders Tracking
    // =====================

    function renderOrders() {
        const orders = loadData(KEYS.ORDERS);
        const tbody = document.getElementById('orders-table');

        if (!tbody) return;

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem">No orders recorded yet. Orders are tracked when users click "Order on WhatsApp".</td></tr>';
            return;
        }

        tbody.innerHTML = orders.sort((a, b) => new Date(b.date) - new Date(a.date)).map(o => `
            <tr>
                <td>${new Date(o.date).toLocaleString()}</td>
                <td><strong>${o.customer}</strong></td>
                <td><small>${o.items}</small></td>
                <td>${o.total} MAD</td>
                <td><span class="badge badge-replied">${o.status || 'WhatsApp Sent'}</span></td>
            </tr>
        `).join('');
    }

    /**
     * Public method to record an order from other scripts
     */
    function recordOrder(orderData) {
        const orders = loadData(KEYS.ORDERS);
        orders.push({
            id: 'o' + Date.now(),
            date: new Date().toISOString(),
            status: 'WhatsApp Sent',
            ...orderData
        });
        saveData(KEYS.ORDERS, orders);
    }

    // =====================
    // Settings
    // =====================

    function renderSettings() {
        const settings = loadData(KEYS.SETTINGS);
        if (settings) {
            document.getElementById('site-name').value = settings.siteName || '';
            document.getElementById('site-phone').value = settings.phone || '';
            document.getElementById('site-email').value = settings.email || '';
            document.getElementById('site-address').value = settings.address || '';
            document.getElementById('promo-text').value = settings.promoText || '';
        }
    }

    function saveSettings(data) {
        saveData(KEYS.SETTINGS, data);
        alert('Settings saved successfully!');
    }

    // =====================
    // Export Data
    // =====================

    function exportData() {
        const data = {
            products: loadData(KEYS.PRODUCTS),
            shops: loadData(KEYS.SHOPS),
            faqs: loadData(KEYS.FAQS),
            settings: loadData(KEYS.SETTINGS)
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cinnamona-config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // =====================
    // Modal
    // =====================

    function openModal(type, data = null) {
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');

        const isEdit = !!data;
        title.textContent = isEdit ? `Edit ${type}` : `Add ${type}`;

        const forms = {
            product: `
                <form id="modal-form">
                    <input type="hidden" name="id" value="${data?.id || ''}">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" name="name" required value="${data?.name || ''}">
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select name="category">
                            <option value="rolls" ${data?.category === 'rolls' ? 'selected' : ''}>Cinnamon Rolls</option>
                            <option value="canneles" ${data?.category === 'canneles' ? 'selected' : ''}>Cannelés</option>
                            <option value="pasteis" ${data?.category === 'pasteis' ? 'selected' : ''}>Pastéis</option>
                            <option value="drinks" ${data?.category === 'drinks' ? 'selected' : ''}>Drinks</option>
                            <option value="boxes" ${data?.category === 'boxes' ? 'selected' : ''}>Gift Boxes</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Price (MAD)</label>
                        <input type="number" name="price" required value="${data?.price || ''}">
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea name="description" rows="3">${data?.description || ''}</textarea>
                    </div>
                    <div style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="featured-check" name="featured" ${data?.featured ? 'checked' : ''} style="width: auto; margin: 0;">
                        <label for="featured-check" style="margin: 0; font-weight: normal;">Featured on Homepage</label>
                    </div>
                    <div style="margin-bottom: 2rem; display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="instock-check" name="inStock" ${data?.inStock !== false ? 'checked' : ''} style="width: auto; margin: 0;">
                        <label for="instock-check" style="margin: 0; font-weight: normal;">In Stock / Available</label>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Save Product</button>
                </form>
            `,
            shop: `
                <form id="modal-form">
                    <input type="hidden" name="id" value="${data?.id || ''}">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" name="name" required value="${data?.name || ''}">
                    </div>
                    <div class="form-group">
                        <label>Address</label>
                        <textarea name="address" rows="2">${data?.address || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Phone</label>
                        <input type="tel" name="phone" value="${data?.phone || ''}">
                    </div>
                    <div class="form-group">
                        <label>Hours</label>
                        <input type="text" name="hours" value="${data?.hours || 'Open 24/7'}">
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Save Shop</button>
                </form>
            `,
            faq: `
                <form id="modal-form">
                    <input type="hidden" name="id" value="${data?.id || ''}">
                    <div class="form-group">
                        <label>Category</label>
                        <select name="category">
                            <option value="allergens" ${data?.category === 'allergens' ? 'selected' : ''}>Allergens</option>
                            <option value="orders" ${data?.category === 'orders' ? 'selected' : ''}>Orders</option>
                            <option value="delivery" ${data?.category === 'delivery' ? 'selected' : ''}>Delivery</option>
                            <option value="payment" ${data?.category === 'payment' ? 'selected' : ''}>Payment</option>
                            <option value="general" ${data?.category === 'general' ? 'selected' : ''}>General</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Question</label>
                        <input type="text" name="question" required value="${data?.question || ''}">
                    </div>
                    <div class="form-group">
                        <label>Answer</label>
                        <textarea name="answer" rows="4" required>${data?.answer || ''}</textarea>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Save FAQ</button>
                </form>
            `
        };

        body.innerHTML = forms[type] || '';
        modal.classList.remove('hidden');

        // Form submit handler
        document.getElementById('modal-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const obj = Object.fromEntries(formData);
            const id = obj.id || null;
            delete obj.id;

            switch (type) {
                case 'product': saveProduct(obj, id); break;
                case 'shop': saveShop(obj, id); break;
                case 'faq': saveFaq(obj, id); break;
            }
        });
    }

    function closeModal() {
        document.getElementById('modal').classList.add('hidden');
    }

    // =====================
    // Init
    // =====================

    function init() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            login(email, password);
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', logout);

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                showSection(item.dataset.section);
            });
        });

        // Settings form
        document.getElementById('settings-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            saveSettings(Object.fromEntries(formData));
        });

        // Modal close on backdrop click
        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') closeModal();
        });

        // Check auth on load
        checkAuth();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    return {
        showSection,
        openModal,
        closeModal,
        editProduct,
        deleteProduct,
        editShop,
        deleteShop,
        editFaq,
        deleteFaq,
        viewContact,
        markReplied,
        exportData,
        recordOrder,
        toggleStock
    };
})();
