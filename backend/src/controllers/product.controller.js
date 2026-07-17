'use strict';

const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const slugify = require('../utils/slugify');
const { getPagination, paginated } = require('../utils/pagination');

// Serialize a product, converting Decimal price to a Number for JSON clients.
const serialize = (p) => ({ ...p, price: Number(p.price) });

// Look up by UUID id or by slug.
const findByIdOrSlug = (idOrSlug) =>
  prisma.product.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
  });

// GET /api/products
const list = asyncHandler(async (req, res) => {
  const q = req.validatedQuery || {};
  const { page, limit, skip, take } = getPagination(q);

  const where = {};
  if (!q.includeInactive) where.isActive = true;
  if (q.category) where.category = q.category;
  if (q.search) {
    where.OR = [
      { name: { contains: q.search, mode: 'insensitive' } },
      { description: { contains: q.search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  res.json(paginated(items.map(serialize), total, { page, limit }));
});

// GET /api/products/:idOrSlug
const getOne = asyncHandler(async (req, res) => {
  const product = await findByIdOrSlug(req.params.idOrSlug);
  if (!product) throw ApiError.notFound('Product not found');
  res.json({ data: serialize(product) });
});

// POST /api/products  (admin)
const create = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  data.slug = data.slug || slugify(data.name);
  const product = await prisma.product.create({ data });
  res.status(201).json({ data: serialize(product) });
});

// PATCH /api/products/:idOrSlug  (admin)
const update = asyncHandler(async (req, res) => {
  const existing = await findByIdOrSlug(req.params.idOrSlug);
  if (!existing) throw ApiError.notFound('Product not found');

  const product = await prisma.product.update({
    where: { id: existing.id },
    data: req.body,
  });
  res.json({ data: serialize(product) });
});

// DELETE /api/products/:idOrSlug  (admin)
const remove = asyncHandler(async (req, res) => {
  const existing = await findByIdOrSlug(req.params.idOrSlug);
  if (!existing) throw ApiError.notFound('Product not found');

  await prisma.product.delete({ where: { id: existing.id } });
  res.status(204).send();
});

module.exports = { list, getOne, create, update, remove };
