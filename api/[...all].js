// Catch‑all serverless function so /api/* routes hit the Express API on Vercel
const serverless = require('serverless-http');
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const path = require('path');

// Load env from project root when running in the function
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const apiRouter = require('./routes');

const app = express();
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount all routes; Vercel will map /api/* to this function
app.use('/', apiRouter);

module.exports = serverless(app);
