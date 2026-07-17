'use strict';

const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const env = require('../config/env');

// Shape returned to clients — never includes the password hash.
const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

// Set the JWT as an httpOnly cookie so browser clients can stay logged in
// without storing the token in JS-accessible storage. The token is also
// returned in the body for non-cookie clients (e.g. mobile).
function sendToken(res, user, statusCode) {
  const token = signToken(user);
  res.cookie('token', token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  res.status(statusCode).json({ token, user: publicUser(user) });
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  sendToken(res, user, 201);
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  sendToken(res, user, 200);
});

// POST /api/auth/logout
const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me  (requires authenticate middleware)
const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw ApiError.notFound('User not found');
  res.json({ user: publicUser(user) });
});

module.exports = { register, login, logout, me };
