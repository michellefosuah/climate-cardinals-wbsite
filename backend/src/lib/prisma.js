'use strict';

const { PrismaClient } = require('@prisma/client');
const env = require('../config/env');

/**
 * Reuse a single PrismaClient instance across the process. Under `node --watch`
 * (or hot reload) a new module instance could otherwise open a fresh pool of
 * connections on every reload and exhaust the database.
 */
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__prisma ||
  new PrismaClient({
    log: env.isDevelopment ? ['warn', 'error'] : ['error'],
  });

if (!env.isProduction) {
  globalForPrisma.__prisma = prisma;
}

module.exports = prisma;
