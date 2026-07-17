'use strict';

const { Router } = require('express');

const controller = require('../controllers/cart.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const {
  addItemSchema,
  updateItemSchema,
  productIdParamSchema,
} = require('../validators/cart.validators');

const router = Router();

// The cart is always tied to a logged-in user.
router.use(authenticate);

router.get('/', controller.getCart);
router.delete('/', controller.clearCart);
router.post('/items', validate({ body: addItemSchema }), controller.addItem);
router.patch(
  '/items/:productId',
  validate({ params: productIdParamSchema, body: updateItemSchema }),
  controller.updateItem
);
router.delete(
  '/items/:productId',
  validate({ params: productIdParamSchema }),
  controller.removeItem
);

module.exports = router;
