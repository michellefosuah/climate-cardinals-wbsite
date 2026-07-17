'use strict';

const { Router } = require('express');

const router = Router();

// API index — lists available resource groups.
router.get('/', (_req, res) => {
  res.json({
    service: 'climate-cardinals-api',
    version: '1.0.0',
    resources: [
      'auth',
      'products',
      'cart',
      'orders',
      'events',
      'newsletter',
      'team',
      'impact',
      'contact',
      'donations',
      'volunteers',
    ],
  });
});

// Resource routers are mounted below as each module is added.
router.use('/auth', require('./auth.routes'));
router.use('/products', require('./product.routes'));
router.use('/cart', require('./cart.routes'));
router.use('/orders', require('./order.routes'));
router.use('/events', require('./event.routes'));
router.use('/newsletter', require('./newsletter.routes'));
router.use('/team', require('./team.routes'));
router.use('/impact', require('./impact.routes'));
router.use('/contact', require('./contact.routes'));
router.use('/donations', require('./donation.routes'));
router.use('/volunteers', require('./volunteer.routes'));

module.exports = router;
