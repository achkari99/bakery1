/**
 * Cinnamona Admin Panel JavaScript
 * Handles authentication, CRUD operations, and UI
 */

const Admin = (() => {
    const API_BASE = '/api';
    let token = localStorage.getItem('cinnamona-admin-token');
    let currentSection = 'overview';

    // =====================
    // API Helpers
    // =====================

    async function api(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        };

        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: { ...headers, ...options.headers }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API Error');
        }

        return data;
    }

    // =====================
    // Authentication
    // =====================

    async function login(email, password) {
        try {
            const result = await api('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            token = result.token;
            localStorage.setItem('cinnamona-admin-token', token);
            showDashboard();
            loadStats();
        } catch (err) {
            document.getElementById('login-error').textContent = err.message;
        }
    }

    function logout() {
        token = null;
        localStorage.removeItem('cinnamona-admin-token');
        showLogin();
    }

    async function checkAuth() {
        if (!token) {
            showLogin();
            return;
        }

        try {
            await api('/auth/me');
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
            settings: 'Settings'
        };
        document.getElementById('page-title').textContent = titles[section] || 'Dashboard';

        // Load section data
        loadSectionData(section);
    }

    async function loadSectionData(section) {
        switch (section) {
            case 'products':
                await loadProducts();
                break;
            case 'shops':
                await loadShops();
                break;
            case 'faqs':
                await loadFaqs();
                break;
            case 'contacts':
                await loadContacts();
                break;
            case 'settings':
                await loadSettings();
                break;
        }
    }

    // =====================
    // Stats
    // =====================

    async function loadStats() {
        try {
            const [products, shops, faqs, contacts] = await Promise.all([
                api('/products'),
                api('/shops'),
                api('/faqs'),
                api('/contacts')
            ]);

            document.getElementById('stat-products').textContent = products.data?.length || 0;
            document.getElementById('stat-shops').textContent = shops.data?.length || 0;
            document.getElementById('stat-faqs').textContent = faqs.data?.length || 0;
            document.getElementById('stat-contacts').textContent =
                contacts.data?.filter(c => c.status === 'new').length || 0;
        } catch (err) {
            console.error('Error loading stats:', err);
        }
    }

    // =====================
    // Products CRUD
    // =====================

    async function loadProducts() {
        try {
            const result = await api('/products');
            const tbody = document.getElementById('products-table');

            if (!result.data || result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem">No products yet. Click "Add Product" to create one.</td></tr>';
                return;
            }

            tbody.innerHTML = result.data.map(p => `
                <tr>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.category || '-'}</td>
                    <td>${p.price} MAD</td>
                    <td><span class="badge badge-active">${p.status || 'Active'}</span></td>
                    <td class="actions">
                        <button class="btn btn-outline btn-small" onclick="Admin.editProduct('${p.id}')">Edit</button>
                        <button class="btn btn-danger btn-small" onclick="Admin.deleteProduct('${p.id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error('Error loading products:', err);
        }
    }

    async function saveProduct(data, id = null) {
        try {
            if (id) {
                await api(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
            } else {
                await api('/products', { method: 'POST', body: JSON.stringify(data) });
            }
            closeModal();
            loadProducts();
            loadStats();
        } catch (err) {
            alert('Error saving product: ' + err.message);
        }
    }

    async function deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api(`/products/${id}`, { method: 'DELETE' });
            loadProducts();
            loadStats();
        } catch (err) {
            alert('Error deleting product: ' + err.message);
        }
    }

    async function editProduct(id) {
        const result = await api(`/products/${id}`);
        openModal('product', result.data);
    }

    // =====================
    // Shops CRUD
    // =====================

    async function loadShops() {
        try {
            const result = await api('/shops');
            const tbody = document.getElementById('shops-table');

            if (!result.data || result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:2rem">No shops yet.</td></tr>';
                return;
            }

            tbody.innerHTML = result.data.map(s => `
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
            console.error('Error loading shops:', err);
        }
    }

    async function saveShop(data, id = null) {
        try {
            if (id) {
                await api(`/shops/${id}`, { method: 'PUT', body: JSON.stringify(data) });
            } else {
                await api('/shops', { method: 'POST', body: JSON.stringify(data) });
            }
            closeModal();
            loadShops();
            loadStats();
        } catch (err) {
            alert('Error saving shop: ' + err.message);
        }
    }

    async function deleteShop(id) {
        if (!confirm('Delete this shop?')) return;
        try {
            await api(`/shops/${id}`, { method: 'DELETE' });
            loadShops();
            loadStats();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    }

    async function editShop(id) {
        const result = await api(`/shops/${id}`);
        openModal('shop', result.data);
    }

    // =====================
    // FAQs CRUD
    // =====================

    async function loadFaqs() {
        try {
            const result = await api('/faqs');
            const tbody = document.getElementById('faqs-table');

            if (!result.data || result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:2rem">No FAQs yet.</td></tr>';
                return;
            }

            tbody.innerHTML = result.data.map(f => `
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
            console.error('Error loading FAQs:', err);
        }
    }

    async function saveFaq(data, id = null) {
        try {
            if (id) {
                await api(`/faqs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
            } else {
                await api('/faqs', { method: 'POST', body: JSON.stringify(data) });
            }
            closeModal();
            loadFaqs();
            loadStats();
        } catch (err) {
            alert('Error saving FAQ: ' + err.message);
        }
    }

    async function deleteFaq(id) {
        if (!confirm('Delete this FAQ?')) return;
        try {
            await api(`/faqs/${id}`, { method: 'DELETE' });
            loadFaqs();
            loadStats();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    }

    async function editFaq(id) {
        const result = await api(`/faqs/${id}`);
        openModal('faq', result.data);
    }

    // =====================
    // Contacts
    // =====================

    async function loadContacts() {
        try {
            const result = await api('/contacts');
            const tbody = document.getElementById('contacts-table');

            if (!result.data || result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem">No messages yet.</td></tr>';
                return;
            }

            tbody.innerHTML = result.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(c => `
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
            console.error('Error loading contacts:', err);
        }
    }

    async function viewContact(id) {
        const result = await api(`/contacts`);
        const contact = result.data.find(c => c.id === id);
        if (contact) {
            alert(`From: ${contact.name}\nEmail: ${contact.email}\nPhone: ${contact.phone || 'N/A'}\nSubject: ${contact.subject || 'N/A'}\n\nMessage:\n${contact.message}`);
        }
    }

    async function markReplied(id) {
        try {
            await api(`/contacts/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'replied' })
            });
            loadContacts();
            loadStats();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    }

    // =====================
    // Settings
    // =====================

    async function loadSettings() {
        try {
            const result = await api('/settings');
            if (result.data) {
                document.getElementById('site-name').value = result.data.siteName || '';
                document.getElementById('site-phone').value = result.data.phone || '';
                document.getElementById('site-email').value = result.data.email || '';
                document.getElementById('site-address').value = result.data.address || '';
            }
        } catch (err) {
            console.error('Error loading settings:', err);
        }
    }

    async function saveSettings(data) {
        try {
            await api('/settings', { method: 'PUT', body: JSON.stringify(data) });
            alert('Settings saved!');
        } catch (err) {
            alert('Error saving settings: ' + err.message);
        }
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
        document.getElementById('modal-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const obj = Object.fromEntries(formData);
            const id = obj.id || null;
            delete obj.id;

            switch (type) {
                case 'product': await saveProduct(obj, id); break;
                case 'shop': await saveShop(obj, id); break;
                case 'faq': await saveFaq(obj, id); break;
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
        markReplied
    };
})();
