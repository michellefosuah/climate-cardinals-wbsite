'use strict';

const ApiError = require('../utils/ApiError');

/**
 * Build a middleware that validates parts of the request against Zod schemas.
 * Parsed (and coerced) values replace the originals, so controllers receive
 * clean, typed data.
 *
 * @param {{ body?: ZodSchema, params?: ZodSchema, query?: ZodSchema }} schemas
 */
function validate(schemas) {
  return (req, _res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        // req.query is a read-only getter in Express 5-style setups; assign
        // onto a private field the controllers can read.
        req.validatedQuery = schemas.query.parse(req.query);
      }
      next();
    } catch (err) {
      if (err.name === 'ZodError') {
        const details = err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        return next(new ApiError(422, 'Validation failed', details));
      }
      next(err);
    }
  };
}

module.exports = validate;
