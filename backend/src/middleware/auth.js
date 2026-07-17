'use strict';

const prisma = require('../lib/prisma');
const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Extract a bearer token from the Authorization header or an auth cookie.
 */
function extractToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
}

/**
 * Loads the user for a valid token and attaches it to req.user.
 * Throws 401 when the token is missing or invalid.
 */
const authenticate = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) {
    throw ApiError.unauthorized('Authentication token is required');
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    throw ApiError.unauthorized('User no longer exists');
  }

  req.user = user;
  next();
});

/**
 * Like authenticate, but does not fail when no token is present.
 * Useful for endpoints that behave differently for guests vs. logged-in users
 * (e.g. checkout, event registration).
 */
const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) {
    return next();
  }
  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true },
    });
    if (user) req.user = user;
  } catch (_err) {
    // Ignore bad tokens for optional auth — treat as guest.
  }
  next();
});

/**
 * Role gate. Must be used after `authenticate`.
 * @param {...string} roles allowed roles
 */
function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have access to this resource'));
    }
    next();
  };
}

module.exports = { authenticate, optionalAuth, authorize };
