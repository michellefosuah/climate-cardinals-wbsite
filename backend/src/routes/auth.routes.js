'use strict';

const { Router } = require('express');

const controller = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerSchema,
  loginSchema,
} = require('../validators/auth.validators');

const router = Router();

router.post(
  '/register',
  authLimiter,
  validate({ body: registerSchema }),
  controller.register
);
router.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  controller.login
);
router.post('/logout', controller.logout);
router.get('/me', authenticate, controller.me);

module.exports = router;
