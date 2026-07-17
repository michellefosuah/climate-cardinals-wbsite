'use strict';

const { z } = require('zod');

const lineItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().positive().max(99),
});

const createOrderSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().max(40).optional(),
  address: z.string().trim().min(3).max(255),
  city: z.string().trim().min(1).max(120),
  region: z.string().trim().min(1).max(120),
  paymentMethod: z.enum(['CARD', 'MOMO']).default('CARD'),
  donation: z.coerce.number().nonnegative().max(100000).optional(),
  // Optional: when omitted, the server uses the authenticated user's cart.
  items: z.array(lineItemSchema).min(1).optional(),
});

const listQuerySchema = z.object({
  scope: z.enum(['own', 'all']).optional(),
  status: z.enum(['PENDING', 'PAID', 'FULFILLED', 'CANCELLED']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

const idParamSchema = z.object({ id: z.string().uuid() });

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'FULFILLED', 'CANCELLED']),
});

module.exports = {
  createOrderSchema,
  listQuerySchema,
  idParamSchema,
  updateStatusSchema,
};
