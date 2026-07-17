'use strict';

const { z } = require('zod');

const CATEGORIES = [
  'APPAREL',
  'STICKERS',
  'ACCESSORIES',
  'DRINKWARE',
  'OTHER',
];

const listQuerySchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  includeInactive: z.coerce.boolean().optional(),
});

const idParamSchema = z.object({
  idOrSlug: z.string().min(1),
});

const createSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, 'Slug may contain only lowercase letters, numbers and hyphens')
    .optional(),
  description: z.string().trim().min(1),
  price: z.coerce.number().nonnegative(),
  category: z.enum(CATEGORIES).default('OTHER'),
  imageUrl: z.string().url().optional(),
  badge: z.string().trim().max(60).optional(),
  stock: z.coerce.number().int().nonnegative().default(0),
  isActive: z.boolean().optional(),
});

const updateSchema = createSchema.partial();

module.exports = { listQuerySchema, idParamSchema, createSchema, updateSchema };
