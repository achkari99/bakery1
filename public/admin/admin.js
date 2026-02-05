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

    const API_BASE = '/api';
    let currentUser = null;
    let currentSection = 'overview';
    let productsCache = [];
    let shopsCache = [];
    let faqsCache = [];
    let contactsCache = [];

    async function apiFetch(path, options = {}) {
        const token = localStorage.getItem(KEYS.TOKEN);
        const headers = options.headers ? { ...options.headers } : {};
        const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

        if (!isFormData && options.body && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            const message = payload?.error || `Request failed (${response.status})`;
            throw new Error(message);
        }

        return response.json();
    }

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
            { id: 's1', name: 'Cinnamona Tetouan', address: 'Tetouan, Morocco', phone: '+212 603-981438', hours: '10:00 - 22:00' }
        ],
        faqs: [
            { id: 'f1', question: 'Do you offer delivery?', category: 'delivery', answer: 'Yes, we deliver to Tetouan & Tangier.' },
            { id: 'f2', question: 'Are they vegan?', category: 'allergens', answer: 'Our standard rolls contain dairy and eggs.' }
        ],
        contacts: [
            { id: 'c1', name: 'Test User', email: 'test@example.com', subject: 'Inquiry', message: 'Do you cater for weddings?', status: 'new', createdAt: new Date().toISOString() }
        ],
        settings: {
            siteName: 'Golden Sweet',
            phone: '+212 637-629395',
            email: 'contact@goldensweet.co',
            address: 'Tetouan & Tangier, Morocco'
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
        const parsed = JSON.parse(stored);
        if (key === KEYS.SETTINGS) {
            let dirty = false;
            if (parsed?.siteName === 'Cinnamona by Mona' || parsed?.siteName === 'Cinnamona') {
                parsed.siteName = 'Golden Sweet';
                dirty = true;
            }
            if (parsed?.email === 'bonjour@cinnamona.ma') {
                parsed.email = 'contact@goldensweet.co';
                dirty = true;
            }
            if (dirty) {
                localStorage.setItem(key, JSON.stringify(parsed));
            }
        }
        return parsed;
    }

    function saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // =====================
    // Authentication
    // =====================

    async function login(email, password) {
        const errorEl = document.getElementById('login-error');
        errorEl.textContent = '';

        try {
            const result = await apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            localStorage.setItem(KEYS.TOKEN, result.token);
            currentUser = result.user;
            showDashboard();
            loadStats();
        } catch (err) {
            errorEl.textContent = err.message || 'Invalid credentials.';
        }
    }

    function logout() {
        localStorage.removeItem(KEYS.TOKEN);
        currentUser = null;
        showLogin();
    }

    async function checkAuth() {
        const token = localStorage.getItem(KEYS.TOKEN);
        if (!token) {
            showLogin();
            return;
        }

        try {
            const result = await apiFetch('/auth/me');
            currentUser = result.user;
            showDashboard();
            loadStats();
        } catch (err) {
            logout();
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

    async function loadStats() {
        const orders = loadData(KEYS.ORDERS);
        const settings = loadData(KEYS.SETTINGS);
        let productCount = 0;
        let shopCount = 0;
        let faqCount = 0;
        let contactCount = 0;

        try {
            const result = await apiFetch('/products');
            productCount = result.data?.length || 0;
        } catch (err) {
            productCount = 0;
        }

        try {
            const result = await apiFetch('/shops');
            shopCount = result.data?.length || 0;
        } catch (err) {
            shopCount = 0;
        }

        try {
            const result = await apiFetch('/faqs');
            faqCount = result.data?.length || 0;
        } catch (err) {
            faqCount = 0;
        }

        try {
            const result = await apiFetch('/contacts');
            const contacts = result.data || [];
            contactCount = contacts.filter(c => c.status === 'new').length;
        } catch (err) {
            contactCount = 0;
        }

        document.getElementById('stat-products').textContent = productCount;
        document.getElementById('stat-shops').textContent = shopCount;
        document.getElementById('stat-faqs').textContent = faqCount;
        document.getElementById('stat-contacts').textContent = contactCount + orders.length;

        // Update site name in dashboard header if changed
        if (settings.siteName) {
            document.querySelectorAll('.sidebar-header h2, .login-header h1').forEach(el => el.textContent = settings.siteName);
        }
    }

    // =====================
    // Products CRUD
    // =====================

    async function renderProducts() {
        const tbody = document.getElementById('products-table');
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem">Loading products...</td></tr>';

        try {
            const result = await apiFetch('/products');
            const products = result.data || [];
            productsCache = products;

            if (products.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem">No products yet. Click "Add Product" to create one.</td></tr>';
                return;
            }

            tbody.innerHTML = products.map(p => {
                const thumb = p.image ? `<img class="product-thumb" src="${p.image}" alt="${p.name}">` : '';
                const featuredBadge = p.featured ? '<span class="badge badge-replied" style="font-size:0.75em; margin-left:8px">Featured</span>' : '';
                const bestBadge = p.bestSeller ? '<span class="badge badge-active" style="font-size:0.75em; margin-left:8px">Best-seller</span>' : '';
                const inStock = p.inStock !== false;
                const tags = Array.isArray(p.tags) ? p.tags : (p.tags ? [p.tags] : []);
                return `
                    <tr>
                        <td>
                            <div class="product-cell">
                                ${thumb}
                                <div class="product-meta">
                                    <strong>${p.name}</strong>
                                    ${featuredBadge}${bestBadge}
                                    ${tags.length ? `<small>${tags.join(', ')}</small>` : ''}
                                </div>
                            </div>
                        </td>
                        <td>${p.category || '-'}</td>
                        <td>${p.price} MAD</td>
                        <td><span class="badge ${inStock ? 'badge-active' : 'badge-danger'}">${inStock ? 'In Stock' : 'Sold Out'}</span></td>
                        <td class="actions">
                            <button class="btn btn-outline btn-small" onclick="Admin.toggleStock('${p.id}', ${inStock})">${inStock ? 'Mark Sold Out' : 'Restock'}</button>
                            <button class="btn btn-outline btn-small" onclick="Admin.editProduct('${p.id}')">Edit</button>
                            <button class="btn btn-danger btn-small" onclick="Admin.deleteProduct('${p.id}')">Delete</button>
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:#b94a48;">${err.message}</td></tr>`;
        }
    }

    async function uploadProductImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        const result = await apiFetch('/upload', {
            method: 'POST',
            body: formData
        });
        return result.data?.path || '';
    }

    async function saveProduct(data, id = null, imageFile = null) {
        const payload = {
            name: data.name?.trim(),
            nameAr: data.nameAr?.trim() || '',
            name_ar: data.name_ar?.trim() || '',
            category: data.category || '',
            price: Number(data.price || 0),
            description: data.description || '',
            descriptionAr: data.descriptionAr?.trim() || '',
            description_ar: data.description_ar?.trim() || '',
            featured: data.featured === 'on',
            bestSeller: data.bestSeller === 'on',
            inStock: data.inStock === 'on',
            image: data.image || '',
            tags: data.tags
                ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
                : []
        };

        if (imageFile && imageFile.size > 0) {
            payload.image = await uploadProductImage(imageFile);
        }

        if (id) {
            await apiFetch(`/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        } else {
            await apiFetch('/products', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }

        closeModal();
        renderProducts();
        loadStats();
    }

    async function toggleStock(id, currentInStock) {
        try {
            await apiFetch(`/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ inStock: !currentInStock })
            });
            renderProducts();
        } catch (err) {
            alert(err.message || 'Failed to update product stock.');
        }
    }

    async function deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await apiFetch(`/products/${id}`, { method: 'DELETE' });
            renderProducts();
            loadStats();
        } catch (err) {
            alert(err.message || 'Failed to delete product.');
        }
    }

    function editProduct(id) {
        const targetId = String(id);
        const product = productsCache.find(p => String(p.id) === targetId);
        if (product) openModal('product', product);
    }

    // =====================
    // Shops CRUD
    // =====================

    async function renderShops() {
        const tbody = document.getElementById('shops-table');
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:2rem">Loading shops...</td></tr>';

        try {
            const result = await apiFetch('/shops');
            const shops = result.data || [];
            shopsCache = shops;

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
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:2rem;color:#b94a48;">${err.message}</td></tr>`;
        }
    }

    async function saveShop(data, id = null) {
        const payload = {
            name: data.name?.trim(),
            address: data.address || '',
            phone: data.phone || '',
            hours: data.hours || ''
        };

        if (id) {
            await apiFetch(`/shops/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        } else {
            await apiFetch('/shops', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }
        closeModal();
        renderShops();
        loadStats();
    }

    async function deleteShop(id) {
        if (!confirm('Delete this shop?')) return;
        await apiFetch(`/shops/${id}`, { method: 'DELETE' });
        renderShops();
        loadStats();
    }

    function editShop(id) {
        const shop = shopsCache.find(s => s.id === id);
        if (shop) openModal('shop', shop);
    }

    // =====================
    // FAQs CRUD
    // =====================

    async function renderFaqs() {
        const tbody = document.getElementById('faqs-table');
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:2rem">Loading FAQs...</td></tr>';

        try {
            const result = await apiFetch('/faqs');
            const faqs = result.data || [];
            faqsCache = faqs;

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
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:2rem;color:#b94a48;">${err.message}</td></tr>`;
        }
    }

    async function saveFaq(data, id = null) {
        const payload = {
            category: data.category || '',
            question: data.question || '',
            answer: data.answer || ''
        };

        if (id) {
            await apiFetch(`/faqs/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        } else {
            await apiFetch('/faqs', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }
        closeModal();
        renderFaqs();
        loadStats();
    }

    async function deleteFaq(id) {
        if (!confirm('Delete this FAQ?')) return;
        await apiFetch(`/faqs/${id}`, { method: 'DELETE' });
        renderFaqs();
        loadStats();
    }

    function editFaq(id) {
        const faq = faqsCache.find(f => f.id === id);
        if (faq) openModal('faq', faq);
    }

    // =====================
    // Contacts
    // =====================

    async function renderContacts() {
        const tbody = document.getElementById('contacts-table');
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem">Loading messages...</td></tr>';

        try {
            const result = await apiFetch('/contacts');
            const contacts = result.data || [];
            contactsCache = contacts;

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
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:#b94a48;">${err.message}</td></tr>`;
        }
    }

    function viewContact(id) {
        const contact = contactsCache.find(c => c.id === id);
        if (contact) {
            alert(`From: ${contact.name}\nEmail: ${contact.email}\nPhone: ${contact.phone || 'N/A'}\nSubject: ${contact.subject || 'N/A'}\n\nMessage:\n${contact.message}`);
        }
    }

    async function markReplied(id) {
        await apiFetch(`/contacts/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'replied' })
        });
        renderContacts();
        loadStats();
    }

    // =====================
    // Orders Tracking
    // =====================

    function renderOrders() {
        const orders = loadData(KEYS.ORDERS);
        const tbody = document.getElementById('orders-table');

        if (!tbody) return;

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem">No orders recorded yet. Orders are tracked when users click "Order on WhatsApp".</td></tr>';
            return;
        }

        tbody.innerHTML = orders
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(o => `
            <tr>
                <td>${new Date(o.date).toLocaleString()}</td>
                <td><strong>${o.customer}</strong><br><small>${o.phone || ''}</small></td>
                <td><small>${o.items}</small></td>
                <td>${o.total} MAD</td>
                <td><span class="badge badge-replied">${o.status || 'WhatsApp Sent'}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-secondary btn-small" data-edit-order="${o.id}">Edit</button>
                        <button class="btn btn-danger btn-small" data-delete-order="${o.id}">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('[data-edit-order]').forEach(btn => {
            btn.addEventListener('click', () => {
                const order = orders.find(o => o.id === btn.dataset.editOrder);
                openModal('order', order);
            });
        });

        tbody.querySelectorAll('[data-delete-order]').forEach(btn => {
            btn.addEventListener('click', () => {
                deleteOrder(btn.dataset.deleteOrder);
            });
        });
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

    function saveOrder(orderData, id) {
        const orders = loadData(KEYS.ORDERS);
        if (id) {
            const idx = orders.findIndex(o => o.id === id);
            if (idx !== -1) {
                orders[idx] = { ...orders[idx], ...orderData, id };
            }
        } else {
            orders.push({
                id: 'o' + Date.now(),
                date: new Date().toISOString(),
                status: 'Updated',
                ...orderData
            });
        }
        saveData(KEYS.ORDERS, orders);
        renderOrders();
        loadStats();
    }

    function deleteOrder(id) {
        const orders = loadData(KEYS.ORDERS).filter(o => o.id !== id);
        saveData(KEYS.ORDERS, orders);
        renderOrders();
        loadStats();
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
                    <input type="hidden" name="image" value="${data?.image || ''}">
                    <div class="form-group">
                        <label>English Name</label>
                        <input type="text" name="name" required value="${data?.name || ''}">
                    </div>
                    <div class="form-group">
                        <label>Arabic Name</label>
                        <input type="text" name="nameAr" dir="rtl" value="${data?.nameAr || data?.name_ar || data?.nameArabic || ''}">
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select name="category">
                            <option value="gluten-vegetarian" ${data?.category === 'vegetarian' ? 'selected' : ''}>Vegetarian</option>
                            <option value="gluten-free" ${data?.category === 'gluten-free' ? 'selected' : ''}>Gluten Free</option>
                            <option value="low-carb" ${data?.category === 'low-carb' ? 'selected' : ''}>Low Carb</option>
                            <option value="healthy" ${data?.category === 'healthy' ? 'selected' : ''}>Healthy</option>
                            <option value="raw-materials" ${data?.category === 'raw-materials' ? 'selected' : ''}>Raw Materials</option>
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
                    <div class="form-group">
                        <label>Arabic Description</label>
                        <textarea name="descriptionAr" rows="3" dir="rtl">${data?.descriptionAr || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Tags (comma separated)</label>
                        <input type="text" name="tags" value="${Array.isArray(data?.tags) ? data.tags.join(', ') : (data?.tags || '')}">
                    </div>
                    <div class="form-group">
                        <label>Product Image</label>
                        ${data?.image ? `
                            <div class="image-preview">
                                <img src="${data.image}" alt="${data.name || 'Product image'}">
                                <span>Current image</span>
                            </div>
                        ` : ''}
                        <input type="file" name="imageFile" accept="image/*">
                    </div>
                    <div style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="featured-check" name="featured" ${data?.featured ? 'checked' : ''} style="width: auto; margin: 0;">
                        <label for="featured-check" style="margin: 0; font-weight: normal;">Featured on Homepage</label>
                    </div>
                    <div style="margin-bottom: 1rem; display: flex; gap: 1.25rem; flex-wrap: wrap;">
                        <label style="display: inline-flex; align-items: center; gap: 0.5rem; font-weight: normal;">
                            <input type="checkbox" name="bestSeller" ${data?.bestSeller ? 'checked' : ''} style="width: auto; margin: 0;">
                            Best-seller
                        </label>
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
            `,
            order: `
                <form id="modal-form">
                    <input type="hidden" name="id" value="${data?.id || ''}">
                    <div class="form-group">
                        <label>Customer</label>
                        <input type="text" name="customer" required value="${data?.customer || ''}">
                    </div>
                    <div class="form-group">
                        <label>Phone</label>
                        <input type="tel" name="phone" value="${data?.phone || ''}">
                    </div>
                    <div class="form-group">
                        <label>Items</label>
                        <textarea name="items" rows="3" required>${data?.items || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Total (MAD)</label>
                        <input type="number" name="total" min="0" step="0.01" required value="${data?.total || ''}">
                    </div>
                    <div class="form-group">
                        <label>Delivery Address</label>
                        <textarea name="address" rows="2" placeholder="City, neighborhood, street...">${data?.address || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Special Instructions</label>
                        <textarea name="instructions" rows="2" placeholder="No sugar, call on arrival, gate code, etc.">${data?.instructions || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select name="status">
                            ${['WhatsApp Sent','Pending','Confirmed','Preparing','Ready','Delivered','Cancelled'].map(s => `
                                <option value="${s}" ${data?.status === s ? 'selected' : ''}>${s}</option>
                            `).join('')}
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Save Order</button>
                </form>
            `
        };

        body.innerHTML = forms[type] || '';
        modal.classList.remove('hidden');

        // Form submit handler
        document.getElementById('modal-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const id = formData.get('id') || null;

            try {
                switch (type) {
                    case 'product': {
                        const imageFile = formData.get('imageFile');
                        const data = {
                            name: formData.get('name'),
                            nameAr: (formData.get('nameAr') || '').trim(),
                            name_ar: (formData.get('nameAr') || '').trim(),
                            category: formData.get('category'),
                            price: formData.get('price'),
                            description: formData.get('description'),
                            descriptionAr: (formData.get('descriptionAr') || '').trim(),
                            description_ar: (formData.get('descriptionAr') || '').trim(),
                            featured: formData.get('featured'),
                            bestSeller: formData.get('bestSeller'),
                            inStock: formData.get('inStock'),
                            tags: formData.get('tags'),
                            image: formData.get('image')
                        };
                        await saveProduct(data, id, imageFile);
                        break;
                    }
                    case 'shop':
                        {
                            const data = Object.fromEntries(formData);
                            delete data.id;
                            await saveShop(data, id);
                        }
                        break;
                    case 'faq':
                        {
                            const data = Object.fromEntries(formData);
                            delete data.id;
                            await saveFaq(data, id);
                        }
                        break;
                    case 'order': {
                        const data = Object.fromEntries(formData);
                        const numericTotal = Number(data.total || 0);
                        data.total = Number.isFinite(numericTotal) ? numericTotal : 0;
                        delete data.id;
                        saveOrder(data, id);
                        break;
                    }
                }
            } catch (err) {
                alert(err.message || 'Something went wrong. Please try again.');
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
