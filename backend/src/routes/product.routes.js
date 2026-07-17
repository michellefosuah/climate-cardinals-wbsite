'use strict';

const { Router } = require('express');

const controller = require('../controllers/product.controller');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  listQuerySchema,
  idParamSchema,
  createSchema,
  updateSchema,
} = require('../validators/product.validators');

const router = Router();

// Public reads
router.get('/', validate({ query: listQuerySchema }), controller.list);
router.get('/:idOrSlug', validate({ params: idParamSchema }), controller.getOne);

// Admin writes
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate({ body: createSchema }),
  controller.create
);
router.patch(
  '/:idOrSlug',
  authenticate,
  authorize('ADMIN'),
  validate({ params: idParamSchema, body: updateSchema }),
  controller.update
);
router.delete(
  '/:idOrSlug',
  authenticate,
  authorize('ADMIN'),
  validate({ params: idParamSchema }),
  controller.remove
);

module.exports = router;
