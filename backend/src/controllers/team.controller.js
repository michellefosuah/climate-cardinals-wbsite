'use strict';

const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// GET /api/team
const list = asyncHandler(async (req, res) => {
  const q = req.validatedQuery || {};
  const where = { isActive: true };
  if (q.tier) where.tier = q.tier;

  const members = await prisma.teamMember.findMany({
    where,
    orderBy: [{ tier: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
  res.json({ data: members });
});

// POST /api/team  (admin)
const create = asyncHandler(async (req, res) => {
  const member = await prisma.teamMember.create({ data: req.body });
  res.status(201).json({ data: member });
});

// PATCH /api/team/:id  (admin)
const update = asyncHandler(async (req, res) => {
  const member = await prisma.teamMember.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json({ data: member });
});

// DELETE /api/team/:id  (admin)
const remove = asyncHandler(async (req, res) => {
  await prisma.teamMember.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

module.exports = { list, create, update, remove };
