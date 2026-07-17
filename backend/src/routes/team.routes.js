'use strict';

const { Router } = require('express');

const controller = require('../controllers/team.controller');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  listQuerySchema,
  idParamSchema,
  createSchema,
  updateSchema,
} = require('../validators/team.validators');

const router = Router();

router.get('/', validate({ query: listQuerySchema }), controller.list);
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
