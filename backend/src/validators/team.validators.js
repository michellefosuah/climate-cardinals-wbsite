'use strict';

const { z } = require('zod');

const listQuerySchema = z.object({
  tier: z.enum(['LEADERSHIP', 'FELLOW']).optional(),
});

const idParamSchema = z.object({ id: z.string().uuid() });

const createSchema = z.object({
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().min(1).max(120),
  bio: z.string().trim().max(2000).optional(),
  imageUrl: z.string().url().optional(),
  tier: z.enum(['LEADERSHIP', 'FELLOW']).default('FELLOW'),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

const updateSchema = createSchema.partial();

module.exports = { listQuerySchema, idParamSchema, createSchema, updateSchema };
