'use strict';

const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Hash a plaintext password for storage.
 * @param {string} plain
 * @returns {Promise<string>}
 */
async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * Compare a plaintext password against a stored hash.
 * @param {string} plain
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = { hashPassword, verifyPassword };
