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

// Mount routes at root so /api/auth/login works when function is at /api
app.use('/', apiRouter);

module.exports = serverless(app);
