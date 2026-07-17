'use strict';

const { z } = require('zod');

const createSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  amount: z.coerce.number().positive().max(1000000),
  project: z.string().trim().max(160).optional(),
  message: z.string().trim().max(2000).optional(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

module.exports = { createSchema, listQuerySchema };
