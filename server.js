/**
 * Cinnamona by Mona - Express Server
 * Backend API for admin panel and content management
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes (must come before static files)
const apiRouter = require('./api/routes');
app.use('/api', apiRouter);

// Serve admin panel static files
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Serve static files from root (for main website)
app.use(express.static(path.join(__dirname)));

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
║     🥐 Cinnamona by Mona Server Running       ║
╠═══════════════════════════════════════════════╣
║  Website: http://localhost:${PORT}              ║
║  Admin:   http://localhost:${PORT}/admin        ║
║  API:     http://localhost:${PORT}/api          ║
╚═══════════════════════════════════════════════╝
    `);
});

module.exports = app;
