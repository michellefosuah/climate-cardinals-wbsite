'use strict';

const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const slugify = require('../utils/slugify');
const { getPagination, paginated } = require('../utils/pagination');

const findByIdOrSlug = (idOrSlug) =>
  prisma.event.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
  });

// GET /api/events
const list = asyncHandler(async (req, res) => {
  const q = req.validatedQuery || {};
  const { page, limit, skip, take } = getPagination(q);

  const where = { isPublished: true };
  if (q.category) where.category = q.category;
  if (q.upcoming) where.startTime = { gte: new Date() };

  const [items, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { startTime: 'asc' },
      skip,
      take,
      include: { _count: { select: { registrations: true } } },
    }),
    prisma.event.count({ where }),
  ]);

  const data = items.map((e) => ({
    ...e,
    registrationCount: e._count.registrations,
    _count: undefined,
  }));

  res.json(paginated(data, total, { page, limit }));
});

// GET /api/events/:idOrSlug
const getOne = asyncHandler(async (req, res) => {
  const event = await prisma.event.findFirst({
    where: { OR: [{ id: req.params.idOrSlug }, { slug: req.params.idOrSlug }] },
    include: { _count: { select: { registrations: true } } },
  });
  if (!event) throw ApiError.notFound('Event not found');
  res.json({
    data: { ...event, registrationCount: event._count.registrations, _count: undefined },
  });
});

// POST /api/events/:idOrSlug/register  (guest or user — optionalAuth)
const register = asyncHandler(async (req, res) => {
  const event = await findByIdOrSlug(req.params.idOrSlug);
  if (!event || !event.isPublished) {
    throw ApiError.notFound('Event not found');
  }

  // Capacity check (null capacity = unlimited).
  if (event.capacity != null) {
    const count = await prisma.eventRegistration.count({
      where: { eventId: event.id },
    });
    if (count >= event.capacity) {
      throw ApiError.conflict('This event is fully booked');
    }
  }

  const existing = await prisma.eventRegistration.findUnique({
    where: { eventId_email: { eventId: event.id, email: req.body.email } },
  });
  if (existing) {
    throw ApiError.conflict('You are already registered for this event');
  }

  const registration = await prisma.eventRegistration.create({
    data: {
      eventId: event.id,
      userId: req.user ? req.user.id : null,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
  });

  res.status(201).json({ data: registration });
});

// GET /api/events/:idOrSlug/registrations  (admin)
const listRegistrations = asyncHandler(async (req, res) => {
  const event = await findByIdOrSlug(req.params.idOrSlug);
  if (!event) throw ApiError.notFound('Event not found');

  const registrations = await prisma.eventRegistration.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ data: registrations });
});

// POST /api/events  (admin)
const create = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  data.slug = data.slug || slugify(data.title);
  const event = await prisma.event.create({ data });
  res.status(201).json({ data: event });
});

// PATCH /api/events/:idOrSlug  (admin)
const update = asyncHandler(async (req, res) => {
  const existing = await findByIdOrSlug(req.params.idOrSlug);
  if (!existing) throw ApiError.notFound('Event not found');
  const event = await prisma.event.update({
    where: { id: existing.id },
    data: req.body,
  });
  res.json({ data: event });
});

// DELETE /api/events/:idOrSlug  (admin)
const remove = asyncHandler(async (req, res) => {
  const existing = await findByIdOrSlug(req.params.idOrSlug);
  if (!existing) throw ApiError.notFound('Event not found');
  await prisma.event.delete({ where: { id: existing.id } });
  res.status(204).send();
});

module.exports = {
  list,
  getOne,
  register,
  listRegistrations,
  create,
  update,
  remove,
};
