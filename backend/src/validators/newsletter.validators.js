'use strict';

const { z } = require('zod');

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email('A valid email is required'),
});

module.exports = { subscribeSchema };
