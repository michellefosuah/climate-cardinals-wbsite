'use strict';

const { Router } = require('express');

const controller = require('../controllers/impact.controller');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  idParamSchema,
  createSchema,
  updateSchema,
} = require('../validators/impact.validators');

const router = Router();

router.get('/', controller.list);
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate({ body: createSchema }),
  controller.create
);
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate({ params: idParamSchema, body: updateSchema }),
  controller.update
);
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate({ params: idParamSchema }),
  controller.remove
);

module.exports = router;
