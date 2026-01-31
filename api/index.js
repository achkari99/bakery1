// Vercel serverless entrypoint for the API
const serverless = require('serverless-http');
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const apiRouter = require('./routes');

const app = express();
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes under /api (matches server.js and Vercel function path /api/*)
app.use('/api', apiRouter);

module.exports = serverless(app);
