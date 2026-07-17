'use strict';

const { Router } = require('express');

const controller = require('../controllers/volunteer.controller');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createSchema,
  idParamSchema,
  updateStatusSchema,
} = require('../validators/volunteer.validators');

const router = Router();

router.post('/', validate({ body: createSchema }), controller.create);
router.get('/', authenticate, authorize('ADMIN'), controller.list);
router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN'),
  validate({ params: idParamSchema, body: updateStatusSchema }),
  controller.updateStatus
);

module.exports = router;
