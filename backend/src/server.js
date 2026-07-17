'use strict';

const app = require('./app');
const env = require('./config/env');
const prisma = require('./lib/prisma');

const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(
    `🌱 Climate Cardinals API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`
  );
});

/**
 * Graceful shutdown: stop accepting connections and close the DB pool so the
 * process exits cleanly on SIGINT/SIGTERM (Ctrl-C, container stop).
 */
async function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} received — shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  // Force-exit if connections do not drain in time.
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = server;
