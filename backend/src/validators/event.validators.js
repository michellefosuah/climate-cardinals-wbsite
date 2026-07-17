'use strict';

const { z } = require('zod');

const CATEGORIES = ['WORKSHOP', 'SEMINAR', 'MEETING', 'NATURE_WALK', 'OTHER'];

const listQuerySchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  upcoming: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

const idParamSchema = z.object({ idOrSlug: z.string().min(1) });

const createSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().trim().min(1),
  category: z.enum(CATEGORIES).default('OTHER'),
  location: z.string().trim().min(1).max(200),
  startTime: z.coerce.date(),
  endTime: z.coerce.date().optional(),
  capacity: z.coerce.number().int().positive().optional(),
  imageUrl: z.string().url().optional(),
  isPublished: z.boolean().optional(),
});

const updateSchema = createSchema.partial();

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().max(40).optional(),
});

module.exports = {
  listQuerySchema,
  idParamSchema,
  createSchema,
  updateSchema,
  registerSchema,
};
