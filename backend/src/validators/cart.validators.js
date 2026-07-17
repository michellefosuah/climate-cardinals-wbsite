'use strict';

const { z } = require('zod');

const addItemSchema = z.object({
  productId: z.string().uuid('A valid productId is required'),
  quantity: z.coerce.number().int().positive().max(99).default(1),
});

const updateItemSchema = z.object({
  quantity: z.coerce.number().int().min(0).max(99),
});

const productIdParamSchema = z.object({
  productId: z.string().uuid(),
});

module.exports = { addItemSchema, updateItemSchema, productIdParamSchema };
