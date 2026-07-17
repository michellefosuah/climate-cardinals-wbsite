'use strict';

const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/volunteers  (public application — replaces the external wkf.ms form)
const create = asyncHandler(async (req, res) => {
  await prisma.volunteerApplication.create({ data: req.body });
  res.status(201).json({
    message: 'Thanks for applying to volunteer! Our team will be in touch.',
  });
});

// GET /api/volunteers  (admin)
const list = asyncHandler(async (_req, res) => {
  const applications = await prisma.volunteerApplication.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json({ data: applications });
});

// PATCH /api/volunteers/:id/status  (admin)
const updateStatus = asyncHandler(async (req, res) => {
  const application = await prisma.volunteerApplication.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
  });
  res.json({ data: application });
});

module.exports = { create, list, updateStatus };
