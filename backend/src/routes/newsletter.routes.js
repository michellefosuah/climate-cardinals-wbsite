'use strict';

const { Router } = require('express');

const controller = require('../controllers/newsletter.controller');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { subscribeSchema } = require('../validators/newsletter.validators');

const router = Router();

router.post('/subscribe', validate({ body: subscribeSchema }), controller.subscribe);
router.post('/unsubscribe', validate({ body: subscribeSchema }), controller.unsubscribe);
router.get('/subscribers', authenticate, authorize('ADMIN'), controller.list);

module.exports = router;
