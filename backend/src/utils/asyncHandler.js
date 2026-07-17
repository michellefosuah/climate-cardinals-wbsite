'use strict';

/**
 * Wraps an async route handler so any rejected promise is forwarded to
 * Express's error-handling middleware via next(). Removes the need for a
 * try/catch in every controller.
 *
 * @param {Function} fn async (req, res, next) => {...}
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
