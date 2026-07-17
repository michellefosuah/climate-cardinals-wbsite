'use strict';

const { z } = require('zod');

const idParamSchema = z.object({ id: z.string().uuid() });

const createSchema = z.object({
  label: z.string().trim().min(1).max(120),
  value: z.string().trim().min(1).max(60),
  description: z.string().trim().max(500).optional(),
  icon: z.string().trim().max(60).optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

const updateSchema = createSchema.partial();

module.exports = { idParamSchema, createSchema, updateSchema };
