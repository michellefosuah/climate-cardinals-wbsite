'use strict';

const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { computeTotals } = require('../utils/totals');

// Load the user's cart, join product data, and compute totals.
async function buildCart(userId) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: 'asc' },
  });

  const lines = items.map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.product.name,
    slug: item.product.slug,
    imageUrl: item.product.imageUrl,
    unitPrice: Number(item.product.price),
    quantity: item.quantity,
    lineTotal: Number(item.product.price) * item.quantity,
  }));

  const totals = computeTotals(lines);
  return { items: lines, totals };
}

// GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  res.json(await buildCart(req.user.id));
});

// POST /api/cart/items  { productId, quantity }
const addItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true },
  });
  if (!product) throw ApiError.notFound('Product not found or unavailable');

  // Upsert: add to an existing line's quantity, or create a new line.
  await prisma.cartItem.upsert({
    where: { userId_productId: { userId: req.user.id, productId } },
    update: { quantity: { increment: quantity } },
    create: { userId: req.user.id, productId, quantity },
  });

  res.status(201).json(await buildCart(req.user.id));
});

// PATCH /api/cart/items/:productId  { quantity }
// quantity 0 removes the line.
const updateItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: req.user.id, productId } },
  });
  if (!existing) throw ApiError.notFound('Item is not in your cart');

  if (quantity === 0) {
    await prisma.cartItem.delete({ where: { id: existing.id } });
  } else {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity },
    });
  }

  res.json(await buildCart(req.user.id));
});

// DELETE /api/cart/items/:productId
const removeItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  await prisma.cartItem.deleteMany({
    where: { userId: req.user.id, productId },
  });
  res.json(await buildCart(req.user.id));
});

// DELETE /api/cart  (clear the whole cart)
const clearCart = asyncHandler(async (req, res) => {
  await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
  res.json(await buildCart(req.user.id));
});

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  buildCart,
};
