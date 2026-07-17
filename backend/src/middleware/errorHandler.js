'use strict';

const { Prisma } = require('@prisma/client');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

/**
 * Central error handler. Converts thrown errors into a consistent JSON shape:
 *   { error: { message, details? } }
 * and maps common Prisma errors to sensible HTTP status codes.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  let statusCode = 500;
  let message = 'Internal server error';
  let details;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // unique constraint violation
        statusCode = 409;
        message = `A record with this ${
          (err.meta && err.meta.target) || 'value'
        } already exists`;
        break;
      case 'P2025': // record not found
        statusCode = 404;
        message = 'Requested record was not found';
        break;
      case 'P2003': // foreign key constraint
        statusCode = 400;
        message = 'Related record does not exist';
        break;
      default:
        statusCode = 400;
        message = 'Database request error';
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('[error]', err);
  }

  const payload = { error: { message } };
  if (details) payload.error.details = details;
  if (env.isDevelopment && statusCode >= 500) {
    payload.error.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}

module.exports = errorHandler;
