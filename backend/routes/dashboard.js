const express = require('express');
const router = express.Router();

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total products count
    const { count: totalProducts, error: productsError } = await req.supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (productsError) {
      throw productsError;
    }

    // Get low stock products (quantity < min_stock_level)
    const { data: lowStockProducts, error: lowStockError } = await req.supabase
      .from('products')
      .select('id')
      .lt('quantity', 'min_stock_level');

    if (lowStockError) {
      throw lowStockError;
    }

    // Get out of stock products (quantity = 0)
    const { count: outOfStock, error: outOfStockError } = await req.supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('quantity', 0);

    if (outOfStockError) {
      throw outOfStockError;
    }

    // Get total inventory value
    const { data: products, error: valueError } = await req.supabase
      .from('products')
      .select('quantity, price');

    if (valueError) {
      throw valueError;
    }

    const totalValue = products.reduce((sum, product) => {
      return sum + (product.quantity * product.price);
    }, 0);

    // Get categories count
    const { count: totalCategories, error: categoriesError } = await req.supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });

    if (categoriesError) {
      throw categoriesError;
    }

    // Get suppliers count
    const { count: totalSuppliers, error: suppliersError } = await req.supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true });

    if (suppliersError) {
      throw suppliersError;
    }

    res.json({
      success: true,
      data: {
        totalProducts: totalProducts || 0,
        lowStock: lowStockProducts ? lowStockProducts.length : 0,
        outOfStock: outOfStock || 0,
        totalValue: Math.round(totalValue * 100) / 100,
        totalCategories: totalCategories || 0,
        totalSuppliers: totalSuppliers || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
});

// Get recent activities (last 10 product updates)
router.get('/recent-activity', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('products')
      .select('id, name, sku, updated_at, quantity')
      .order('updated_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity',
      error: error.message
    });
  }
});

// Get top products by value
router.get('/top-products', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const { data, error } = await req.supabase
      .from('products')
      .select('id, name, sku, quantity, price')
      .order('price', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      throw error;
    }

    // Calculate total value for each product
    const topProducts = data.map(product => ({
      ...product,
      totalValue: product.quantity * product.price
    }));

    res.json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top products',
      error: error.message
    });
  }
});

// Get products by category distribution
router.get('/category-distribution', async (req, res) => {
  try {
    const { data: products, error } = await req.supabase
      .from('products')
      .select('category');

    if (error) {
      throw error;
    }

    // Count products by category
    const distribution = products.reduce((acc, product) => {
      const category = product.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Convert to array format
    const categoryData = Object.entries(distribution).map(([category, count]) => ({
      category,
      count
    }));

    res.json({
      success: true,
      data: categoryData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category distribution',
      error: error.message
    });
  }
});

// Get stock alerts
router.get('/alerts', async (req, res) => {
  try {
    // Get low stock products
    const { data: lowStock, error: lowStockError } = await req.supabase
      .from('products')
      .select('id, name, sku, quantity, min_stock_level')
      .lt('quantity', 'min_stock_level')
      .gt('quantity', 0)
      .order('quantity', { ascending: true });

    if (lowStockError) {
      throw lowStockError;
    }

    // Get out of stock products
    const { data: outOfStock, error: outOfStockError } = await req.supabase
      .from('products')
      .select('id, name, sku, quantity')
      .eq('quantity', 0)
      .order('updated_at', { ascending: false });

    if (outOfStockError) {
      throw outOfStockError;
    }

    res.json({
      success: true,
      data: {
        lowStock: lowStock || [],
        outOfStock: outOfStock || []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock alerts',
      error: error.message
    });
  }
});

module.exports = router;
