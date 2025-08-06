require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Import middleware
const supabaseMiddleware = require('./middleware/supabase');

// Import routes
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const suppliersRoutes = require('./routes/suppliers');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

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

// Routes
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Invento-Manage Backend API',
    status: 'Running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      categories: '/api/categories',
      suppliers: '/api/suppliers',
      dashboard: '/api/dashboard'
    }
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
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'GET /api/products',
      'POST /api/products',
      'GET /api/categories',
      'POST /api/categories',
      'GET /api/suppliers',
      'POST /api/suppliers',
      'GET /api/dashboard/stats'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
  console.log(`🏷️  Categories API: http://localhost:${PORT}/api/categories`);
  console.log(`🏢 Suppliers API: http://localhost:${PORT}/api/suppliers`);
  console.log(`💊 Health Check: http://localhost:${PORT}/api/health`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});

module.exports = app;