/**
 * Cinnamona API Routes
 * RESTful endpoints for admin panel
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const DataStore = require('./dataStore');

// Initialize data store
const store = new DataStore();

// Multer config for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'public', 'images'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|gif/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

// JWT Auth Middleware
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

// =====================
// AUTH ROUTES
// =====================

router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    // Check against env credentials (simple auth for now)
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign(
            { email, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        return res.json({ success: true, token, user: { email, role: 'admin' } });
    }

    res.status(401).json({ success: false, error: 'Invalid credentials' });
});

router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'ok',
        hasAdminEmail: Boolean(process.env.ADMIN_EMAIL),
        hasAdminPassword: Boolean(process.env.ADMIN_PASSWORD),
        hasJwtSecret: Boolean(process.env.JWT_SECRET)
    });
});

router.get('/auth/me', authMiddleware, (req, res) => {
    res.json({ success: true, user: req.user });
});

// =====================
// PRODUCTS ROUTES
// =====================

router.get('/products', async (req, res) => {
    try {
        const products = await store.getAll('products');
        res.json({ success: true, data: products });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/products/:id', async (req, res) => {
    try {
        const product = await store.getById('products', req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/products', authMiddleware, async (req, res) => {
    try {
        const product = await store.create('products', req.body);
        res.status(201).json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.put('/products/:id', authMiddleware, async (req, res) => {
    try {
        const product = await store.update('products', req.params.id, req.body);
        res.json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.delete('/products/:id', authMiddleware, async (req, res) => {
    try {
        await store.delete('products', req.params.id);
        res.json({ success: true, message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// =====================
// SHOPS ROUTES
// =====================

router.get('/shops', async (req, res) => {
    try {
        const shops = await store.getAll('shops');
        res.json({ success: true, data: shops });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/shops', authMiddleware, async (req, res) => {
    try {
        const shop = await store.create('shops', req.body);
        res.status(201).json({ success: true, data: shop });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.put('/shops/:id', authMiddleware, async (req, res) => {
    try {
        const shop = await store.update('shops', req.params.id, req.body);
        res.json({ success: true, data: shop });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.delete('/shops/:id', authMiddleware, async (req, res) => {
    try {
        await store.delete('shops', req.params.id);
        res.json({ success: true, message: 'Shop deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// =====================
// FAQ ROUTES
// =====================

router.get('/faqs', async (req, res) => {
    try {
        const faqs = await store.getAll('faqs');
        res.json({ success: true, data: faqs });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/faqs', authMiddleware, async (req, res) => {
    try {
        const faq = await store.create('faqs', req.body);
        res.status(201).json({ success: true, data: faq });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.put('/faqs/:id', authMiddleware, async (req, res) => {
    try {
        const faq = await store.update('faqs', req.params.id, req.body);
        res.json({ success: true, data: faq });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.delete('/faqs/:id', authMiddleware, async (req, res) => {
    try {
        await store.delete('faqs', req.params.id);
        res.json({ success: true, message: 'FAQ deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// =====================
// SETTINGS ROUTES
// =====================

router.get('/settings', async (req, res) => {
    try {
        const settings = await store.getAll('settings');
        res.json({ success: true, data: settings[0] || {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.put('/settings', authMiddleware, async (req, res) => {
    try {
        let settings = await store.getAll('settings');
        if (settings.length > 0) {
            settings = await store.update('settings', settings[0].id, req.body);
        } else {
            settings = await store.create('settings', req.body);
        }
        res.json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// =====================
// MEDIA UPLOAD
// =====================

router.post('/upload', authMiddleware, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    res.json({
        success: true,
        data: {
            filename: req.file.filename,
            path: `/images/${req.file.filename}`,
            size: req.file.size
        }
    });
});

// =====================
// CONTACT FORM
// =====================

router.post('/contact', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, error: 'Name, email and message required' });
        }

        const contact = await store.create('contacts', {
            name, email, phone, subject, message,
            status: 'new',
            createdAt: new Date().toISOString()
        });

        res.status(201).json({ success: true, message: 'Message received', data: contact });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/contacts', authMiddleware, async (req, res) => {
    try {
        const contacts = await store.getAll('contacts');
        res.json({ success: true, data: contacts });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.put('/contacts/:id', authMiddleware, async (req, res) => {
    try {
        const contact = await store.update('contacts', req.params.id, req.body);
        res.json({ success: true, data: contact });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
