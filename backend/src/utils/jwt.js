'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Sign a JWT for an authenticated user.
 * @param {{ id: string, role: string }} user
 * @returns {string} signed token
 */
function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/**
 * Verify and decode a JWT. Throws if invalid or expired.
 * @param {string} token
 * @returns {{ sub: string, role: string, iat: number, exp: number }}
 */
function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

module.exports = { signToken, verifyToken };
