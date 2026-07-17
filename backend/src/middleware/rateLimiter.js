'use strict';

const rateLimit = require('express-rate-limit');

/**
 * General API limiter — protects every route from abusive traffic.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many requests, please try again later.' } },
});

/**
 * Stricter limiter for authentication endpoints to slow brute-force attempts.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: { message: 'Too many authentication attempts, please slow down.' },
  },
});

module.exports = { apiLimiter, authLimiter };
