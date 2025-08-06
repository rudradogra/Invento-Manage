const express = require('express');
const router = express.Router({ mergeParams: true });

// Import tenant middleware
const tenantMiddleware = require('../middleware/tenant');

// Import sub-routes
const productsRoutes = require('./products');
const dashboardRoutes = require('./dashboard');
const inventoryRoutes = require('./inventory');
const salesRoutes = require('./sales');
const usersRoutes = require('./users');

// Apply tenant middleware to all routes in this router
router.use(tenantMiddleware);

// Define sub-routes
router.use('/products', productsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/sales', salesRoutes);
router.use('/users', usersRoutes);

module.exports = router;
