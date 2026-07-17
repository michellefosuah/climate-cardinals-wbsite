'use strict';

const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/newsletter/subscribe
// Idempotent: re-subscribing an existing email reactivates it.
const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const subscriber = await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { isSubscribed: true, unsubscribedAt: null },
    create: { email },
  });
  res
    .status(201)
    .json({ message: 'Subscribed successfully', data: { email: subscriber.email } });
});

// POST /api/newsletter/unsubscribe
const unsubscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await prisma.newsletterSubscriber.updateMany({
    where: { email },
    data: { isSubscribed: false, unsubscribedAt: new Date() },
  });
  res.json({ message: 'Unsubscribed successfully' });
});

// GET /api/newsletter/subscribers  (admin)
const list = asyncHandler(async (_req, res) => {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { isSubscribed: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ data: subscribers });
});

module.exports = { subscribe, unsubscribe, list };
