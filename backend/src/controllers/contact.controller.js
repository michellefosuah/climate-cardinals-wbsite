'use strict';

const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/contact
const create = asyncHandler(async (req, res) => {
  await prisma.contactMessage.create({ data: req.body });
  res
    .status(201)
    .json({ message: 'Thanks for reaching out! We will get back to you soon.' });
});

// GET /api/contact  (admin)
const list = asyncHandler(async (_req, res) => {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json({ data: messages });
});

// PATCH /api/contact/:id/handled  (admin)
const markHandled = asyncHandler(async (req, res) => {
  const message = await prisma.contactMessage.update({
    where: { id: req.params.id },
    data: { isHandled: true },
  });
  res.json({ data: message });
});

module.exports = { create, list, markHandled };
