// Catch‑all serverless function so /api/* routes hit the Express API on Vercel
const serverless = require('serverless-http');
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const path = require('path');

// Load env from project root when running in the function
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const apiRouter = require('./routes');

process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
});

const app = express();
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount under /api so /api/* requests match the router definitions
app.use('/api', apiRouter);

// Error handler to avoid hanging requests in serverless
app.use((err, req, res, next) => {
    console.error('API error:', err);
    const status = err.status || 500;
    res.status(status).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

const handler = serverless(app);
module.exports = async (req, res) => {
    try {
        return await handler(req, res);
    } catch (err) {
        console.error('Unhandled API error:', err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Unhandled server error' });
        }
    }
};
