'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiter');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// Trust the reverse proxy (needed for correct client IPs behind Nginx, etc.).
app.set('trust proxy', 1);

// Security headers.
app.use(helmet());

// Cross-origin access for the static frontend.
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  })
);

// Body & cookie parsing.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging.
app.use(morgan(env.isDevelopment ? 'dev' : 'combined'));

// Global rate limiting.
app.use('/api', apiLimiter);

// Health check (kept outside /api so uptime monitors have a stable path).
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'climate-cardinals-api', uptime: process.uptime() });
});

// API routes.
app.use('/api', routes);

// 404 + error handling (must be registered last).
app.use(notFound);
app.use(errorHandler);

module.exports = app;
