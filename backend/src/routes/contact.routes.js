'use strict';

const { Router } = require('express');

const controller = require('../controllers/contact.controller');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { createSchema, idParamSchema } = require('../validators/contact.validators');

const router = Router();

router.post('/', validate({ body: createSchema }), controller.create);
router.get('/', authenticate, authorize('ADMIN'), controller.list);
router.patch(
  '/:id/handled',
  authenticate,
  authorize('ADMIN'),
  validate({ params: idParamSchema }),
  controller.markHandled
);

module.exports = router;
