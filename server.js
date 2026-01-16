

require('dotenv').config();
const compression = require('compression');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;
const ASSET_CACHE_MAX_AGE_SECONDS = 60 * 60 * 12;
const ASSET_CACHE_REGEX = /\.(css|js|mjs|cjs|svg|png|jpg|jpeg|gif|webp|ico|ttf|otf|woff|woff2|eot)$/i;

const setAssetCacheHeaders = (res, filePath) => {
    if (ASSET_CACHE_REGEX.test(filePath)) {
        res.setHeader('Cache-Control', `public, max-age=${ASSET_CACHE_MAX_AGE_SECONDS}`);
    }
};

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes (must come before static files)
const apiRouter = require('./api/routes');
app.use('/api', apiRouter);

// Serve admin panel static files
app.use('/admin', express.static(path.join(__dirname, 'admin'), { setHeaders: setAssetCacheHeaders }));

// Serve static files from root (for main website)
app.use(express.static(path.join(__dirname), { setHeaders: setAssetCacheHeaders }));

// SPA fallback for admin routes
app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

// 404 handler (only for HTML pages, not static assets)
app.use((req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ success: false, error: 'API endpoint not found' });
    }
    // Only serve index.html for actual page requests (not CSS, JS, images, etc.)
    if (!req.path.includes('.')) {
        return res.status(404).sendFile(path.join(__dirname, 'index.html'));
    }
    // For missing assets, return 404
    res.status(404).send('File not found');
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║     🥐 Golden Sweet Server Running            ║
╠═══════════════════════════════════════════════╣
║  Website: http://localhost:${PORT}               ║
║  Admin:   http://localhost:${PORT}/admin         ║
║  API:     http://localhost:${PORT}/api           ║
╚═══════════════════════════════════════════════╝
    `);
});

module.exports = app;
