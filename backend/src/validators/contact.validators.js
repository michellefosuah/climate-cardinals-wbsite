'use strict';

const { z } = require('zod');

const createSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  subject: z.string().trim().max(160).optional(),
  message: z.string().trim().min(1).max(5000),
});

const idParamSchema = z.object({ id: z.string().uuid() });

module.exports = { createSchema, idParamSchema };
