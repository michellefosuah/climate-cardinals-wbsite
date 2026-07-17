'use strict';

const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, paginated } = require('../utils/pagination');

const serialize = (d) => ({ ...d, amount: Number(d.amount) });

// POST /api/donations  (guest or user — optionalAuth)
const create = asyncHandler(async (req, res) => {
  const donation = await prisma.donation.create({
    data: {
      userId: req.user ? req.user.id : null,
      name: req.body.name,
      email: req.body.email,
      amount: req.body.amount,
      project: req.body.project,
      message: req.body.message,
    },
  });
  res
    .status(201)
    .json({ message: 'Thank you for your donation!', data: serialize(donation) });
});

// GET /api/donations  (admin)
const list = asyncHandler(async (req, res) => {
  const q = req.validatedQuery || {};
  const { page, limit, skip, take } = getPagination(q);

  const [items, total] = await Promise.all([
    prisma.donation.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.donation.count(),
  ]);

  res.json(paginated(items.map(serialize), total, { page, limit }));
});

module.exports = { create, list };
