'use strict';

const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { computeTotals } = require('../utils/totals');
const { getPagination, paginated } = require('../utils/pagination');

// Convert Decimal fields to Numbers for JSON responses.
function serializeOrder(order) {
  return {
    ...order,
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    tax: Number(order.tax),
    donation: Number(order.donation),
    total: Number(order.total),
    items: order.items
      ? order.items.map((i) => ({ ...i, unitPrice: Number(i.unitPrice) }))
      : undefined,
  };
}

/**
 * Resolve the line items for an order.
 * Priority: explicit `items` in the request body, else the user's saved cart.
 * Returns [{ productId, name, unitPrice, quantity }] using DB prices only.
 */
async function resolveLineItems(reqBody, userId) {
  let requested = reqBody.items;

  if ((!requested || requested.length === 0) && userId) {
    const cart = await prisma.cartItem.findMany({ where: { userId } });
    requested = cart.map((c) => ({
      productId: c.productId,
      quantity: c.quantity,
    }));
  }

  if (!requested || requested.length === 0) {
    throw ApiError.badRequest('No items to order — cart is empty');
  }

  // Fetch authoritative product data; never trust client-supplied prices.
  const productIds = [...new Set(requested.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const lines = requested.map((item) => {
    const product = productMap.get(item.productId);
    if (!product || !product.isActive) {
      throw ApiError.badRequest(`Product ${item.productId} is unavailable`);
    }
    if (product.stock < item.quantity) {
      throw ApiError.badRequest(
        `Not enough stock for "${product.name}" (available: ${product.stock})`
      );
    }
    return {
      productId: product.id,
      name: product.name,
      unitPrice: Number(product.price),
      quantity: item.quantity,
    };
  });

  return lines;
}

// POST /api/orders  (guest or authenticated — optionalAuth)
const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const lines = await resolveLineItems(req.body, userId);
  const totals = computeTotals(lines, req.body.donation || 0);

  const order = await prisma.$transaction(async (tx) => {
    // Decrement stock for each product.
    for (const line of lines) {
      await tx.product.update({
        where: { id: line.productId },
        data: { stock: { decrement: line.quantity } },
      });
    }

    const created = await tx.order.create({
      data: {
        userId,
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        region: req.body.region,
        paymentMethod: req.body.paymentMethod,
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        donation: totals.donation,
        total: totals.total,
        items: {
          create: lines.map((l) => ({
            productId: l.productId,
            name: l.name,
            unitPrice: l.unitPrice,
            quantity: l.quantity,
          })),
        },
      },
      include: { items: true },
    });

    // Empty the saved cart once it has been converted into an order.
    if (userId) {
      await tx.cartItem.deleteMany({ where: { userId } });
    }

    return created;
  });

  res.status(201).json({ data: serializeOrder(order) });
});

// GET /api/orders  (authenticated) — own orders, or all for admins with scope=all
const listOrders = asyncHandler(async (req, res) => {
  const q = req.validatedQuery || {};
  const { page, limit, skip, take } = getPagination(q);
  const isAdmin = req.user.role === 'ADMIN';

  const where = {};
  if (!(isAdmin && q.scope === 'all')) {
    where.userId = req.user.id;
  }
  if (q.status) where.status = q.status;

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.order.count({ where }),
  ]);

  res.json(paginated(items.map(serializeOrder), total, { page, limit }));
});

// GET /api/orders/:id  (owner or admin)
const getOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: true },
  });
  if (!order) throw ApiError.notFound('Order not found');

  const isOwner = order.userId && order.userId === req.user.id;
  if (!isOwner && req.user.role !== 'ADMIN') {
    throw ApiError.forbidden('You cannot view this order');
  }

  res.json({ data: serializeOrder(order) });
});

// PATCH /api/orders/:id/status  (admin)
const updateStatus = asyncHandler(async (req, res) => {
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
    include: { items: true },
  });
  res.json({ data: serializeOrder(order) });
});

module.exports = { createOrder, listOrders, getOrder, updateStatus };
