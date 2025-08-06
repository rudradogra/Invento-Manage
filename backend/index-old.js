require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import middleware
const supabaseMiddleware = require('./middleware/supabase');

// Import tenant routes handler
const tenantRoutes = require('./routes/tenant');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-frontend-domain.com' 
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add Supabase middleware to all API routes
app.use('/api', supabaseMiddleware);

// Routes with tenant-based access
app.use('/api/:tenantId', tenantRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Invento-Manage Multi-Tenant Backend API',
    status: 'Running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    description: 'Multi-tenant inventory management system',
    endpoints: {
      health: '/api/health',
      tenantProducts: '/api/{tenantId}/products',
      tenantCategories: '/api/{tenantId}/categories',
      tenantSuppliers: '/api/{tenantId}/suppliers',
      tenantDashboard: '/api/{tenantId}/dashboard',
      tenantInventory: '/api/{tenantId}/inventory',
      tenantSales: '/api/{tenantId}/sales'
    },
    usage: 'All tenant-specific operations require tenantId in the URL path'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found - API in minimal test mode'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🔍 Test endpoint: http://localhost:${PORT}/test`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Invento-Manage Multi-Tenant Backend API',
    status: 'Running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    description: 'Multi-tenant inventory management system',
    endpoints: {
      health: '/api/health',
      tenantProducts: '/api/{tenantId}/products',
      tenantCategories: '/api/{tenantId}/categories',
      tenantSuppliers: '/api/{tenantId}/suppliers',
      tenantDashboard: '/api/{tenantId}/dashboard',
      tenantInventory: '/api/{tenantId}/inventory',
      tenantSales: '/api/{tenantId}/sales'
    },
    usage: 'All tenant-specific operations require tenantId in the URL path'
  });
});

// Test Supabase connection
app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist, which is OK for testing
      throw error;
    }
    
    res.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    hint: 'Use /api/{tenantId}/{endpoint} format for tenant-specific operations',
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'GET /api/{tenantId}/products',
      'POST /api/{tenantId}/products',
      'GET /api/{tenantId}/categories',
      'POST /api/{tenantId}/categories',
      'GET /api/{tenantId}/suppliers',
      'POST /api/{tenantId}/suppliers',
      'GET /api/{tenantId}/dashboard/stats',
      'GET /api/{tenantId}/inventory',
      'POST /api/{tenantId}/sales'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🏢 Multi-tenant Inventory Management API`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/{tenantId}/dashboard/stats`);
  console.log(`📦 Products API: http://localhost:${PORT}/api/{tenantId}/products`);
  console.log(`🏷️  Categories API: http://localhost:${PORT}/api/{tenantId}/categories`);
  console.log(`🏭 Suppliers API: http://localhost:${PORT}/api/{tenantId}/suppliers`);
  console.log(`📋 Inventory API: http://localhost:${PORT}/api/{tenantId}/inventory`);
  console.log(`💰 Sales API: http://localhost:${PORT}/api/{tenantId}/sales`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});

module.exports = app;