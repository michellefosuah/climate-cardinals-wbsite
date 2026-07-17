'use strict';

const { Router } = require('express');

const controller = require('../controllers/donation.controller');
const validate = require('../middleware/validate');
const { authenticate, optionalAuth, authorize } = require('../middleware/auth');
const {
  createSchema,
  listQuerySchema,
} = require('../validators/donation.validators');

const router = Router();

router.post('/', optionalAuth, validate({ body: createSchema }), controller.create);
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate({ query: listQuerySchema }),
  controller.list
);

module.exports = router;
