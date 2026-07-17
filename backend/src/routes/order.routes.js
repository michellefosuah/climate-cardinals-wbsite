'use strict';

const { Router } = require('express');

const controller = require('../controllers/order.controller');
const validate = require('../middleware/validate');
const { authenticate, optionalAuth, authorize } = require('../middleware/auth');
const {
  createOrderSchema,
  listQuerySchema,
  idParamSchema,
  updateStatusSchema,
} = require('../validators/order.validators');

const router = Router();

// Checkout — guests and logged-in users can both place orders.
router.post(
  '/',
  optionalAuth,
  validate({ body: createOrderSchema }),
  controller.createOrder
);

// Order history — requires a logged-in account.
router.get(
  '/',
  authenticate,
  validate({ query: listQuerySchema }),
  controller.listOrders
);
router.get(
  '/:id',
  authenticate,
  validate({ params: idParamSchema }),
  controller.getOrder
);

// Admin: update fulfilment status.
router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN'),
  validate({ params: idParamSchema, body: updateStatusSchema }),
  controller.updateStatus
);

module.exports = router;
