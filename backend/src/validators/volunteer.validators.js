'use strict';

const { z } = require('zod');

const createSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().max(40).optional(),
  interest: z.string().trim().max(160).optional(),
  message: z.string().trim().max(2000).optional(),
});

const idParamSchema = z.object({ id: z.string().uuid() });

const updateStatusSchema = z.object({
  status: z.enum(['NEW', 'REVIEWING', 'ACCEPTED', 'DECLINED']),
});

module.exports = { createSchema, idParamSchema, updateStatusSchema };
