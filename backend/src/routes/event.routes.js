'use strict';

const { Router } = require('express');

const controller = require('../controllers/event.controller');
const validate = require('../middleware/validate');
const { authenticate, optionalAuth, authorize } = require('../middleware/auth');
const {
  listQuerySchema,
  idParamSchema,
  createSchema,
  updateSchema,
  registerSchema,
} = require('../validators/event.validators');

const router = Router();

// Public
router.get('/', validate({ query: listQuerySchema }), controller.list);
router.get('/:idOrSlug', validate({ params: idParamSchema }), controller.getOne);
router.post(
  '/:idOrSlug/register',
  optionalAuth,
  validate({ params: idParamSchema, body: registerSchema }),
  controller.register
);

// Admin
router.get(
  '/:idOrSlug/registrations',
  authenticate,
  authorize('ADMIN'),
  validate({ params: idParamSchema }),
  controller.listRegistrations
);
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
