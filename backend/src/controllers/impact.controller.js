'use strict';

const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/impact
const list = asyncHandler(async (_req, res) => {
  const stats = await prisma.impactStat.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
  res.json({ data: stats });
});

// POST /api/impact  (admin)
const create = asyncHandler(async (req, res) => {
  const stat = await prisma.impactStat.create({ data: req.body });
  res.status(201).json({ data: stat });
});

// PATCH /api/impact/:id  (admin)
const update = asyncHandler(async (req, res) => {
  const stat = await prisma.impactStat.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json({ data: stat });
});

// DELETE /api/impact/:id  (admin)
const remove = asyncHandler(async (req, res) => {
  await prisma.impactStat.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

module.exports = { list, create, update, remove };
