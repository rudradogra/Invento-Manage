const express = require('express');
const router = express.Router();

// Get dashboard statistics for a tenant
router.get('/stats', async (req, res) => {
  try {
    const tenantId = req.tenantId;

    // Get total products count
    const { count: totalProducts, error: productsError } = await req.supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    if (productsError) {
      throw productsError;
    }

    // Get total inventory quantity
    const { data: inventoryData, error: inventoryError } = await req.supabase
      .from('inventory')
      .select('quantity')
      .eq('tenant_id', tenantId);

    if (inventoryError) {
      throw inventoryError;
    }

    const totalInventory = inventoryData.reduce((sum, item) => sum + item.quantity, 0);

    // Get low stock items (quantity < 10)
    const { data: lowStockData, error: lowStockError } = await req.supabase
      .from('inventory')
      .select('quantity')
      .eq('tenant_id', tenantId)
      .lt('quantity', 10);

    if (lowStockError) {
      throw lowStockError;
    }

    // Get out of stock items (quantity = 0)
    const { count: outOfStock, error: outOfStockError } = await req.supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('quantity', 0);

    if (outOfStockError) {
      throw outOfStockError;
    }

    // Get total inventory value
    const { data: inventoryWithProducts, error: valueError } = await req.supabase
      .from('inventory')
      .select(`
        quantity,
        products:product_id (
          purchase_price
        )
      `)
      .eq('tenant_id', tenantId);

    if (valueError) {
      throw valueError;
    }

    const totalValue = inventoryWithProducts.reduce((sum, item) => {
      return sum + (item.quantity * (item.products?.purchase_price || 0));
    }, 0);

    // Get recent sales count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recentSales, error: salesError } = await req.supabase
      .from('sales')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (salesError) {
      throw salesError;
    }

    // Get total users count for this tenant
    const { count: totalUsers, error: usersError } = await req.supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    if (usersError) {
      throw usersError;
    }

    res.json({
      success: true,
      data: {
        totalProducts: totalProducts || 0,
        totalInventory: totalInventory || 0,
        lowStock: lowStockData ? lowStockData.length : 0,
        outOfStock: outOfStock || 0,
        totalValue: Math.round(totalValue * 100) / 100,
        recentSales: recentSales || 0,
        totalUsers: totalUsers || 0
      },
      tenant: req.tenant.org_name
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
});

// Get recent activities for a tenant
router.get('/recent-activity', async (req, res) => {
  try {
    const tenantId = req.tenantId;

    // Get recent sales
    const { data: recentSales, error: salesError } = await req.supabase
      .from('sales')
      .select(`
        sale_id,
        quantity,
        selling_price,
        created_at,
        products:product_id (
          name,
          brand
        )
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (salesError) {
      throw salesError;
    }

    // Get recent product additions
    const { data: recentProducts, error: productsError } = await req.supabase
      .from('products')
      .select('product_id, name, brand, created_at')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (productsError) {
      throw productsError;
    }

    res.json({
      success: true,
      data: {
        recentSales: recentSales || [],
        recentProducts: recentProducts || []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity',
      error: error.message
    });
  }
});

// Get top products by sales volume for a tenant
router.get('/top-products', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const tenantId = req.tenantId;

    const { data, error } = await req.supabase
      .from('sales')
      .select(`
        product_id,
        quantity,
        products:product_id (
          name,
          brand,
          purchase_price,
          mrp
        )
      `)
      .eq('tenant_id', tenantId);

    if (error) {
      throw error;
    }

    // Aggregate sales by product
    const productSales = data.reduce((acc, sale) => {
      const productId = sale.product_id;
      if (!acc[productId]) {
        acc[productId] = {
          product_id: productId,
          name: sale.products?.name,
          brand: sale.products?.brand,
          purchase_price: sale.products?.purchase_price,
          mrp: sale.products?.mrp,
          totalQuantitySold: 0
        };
      }
      acc[productId].totalQuantitySold += sale.quantity;
      return acc;
    }, {});

    // Sort by quantity sold and take top products
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
      .slice(0, parseInt(limit));

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

// Get inventory alerts for a tenant
router.get('/alerts', async (req, res) => {
  try {
    const tenantId = req.tenantId;

    // Get low stock items
    const { data: lowStock, error: lowStockError } = await req.supabase
      .from('inventory')
      .select(`
        product_id,
        location,
        quantity,
        capacity,
        products:product_id (
          name,
          brand
        )
      `)
      .eq('tenant_id', tenantId)
      .lt('quantity', 10)
      .gt('quantity', 0)
      .order('quantity', { ascending: true });

    if (lowStockError) {
      throw lowStockError;
    }

    // Get out of stock items
    const { data: outOfStock, error: outOfStockError } = await req.supabase
      .from('inventory')
      .select(`
        product_id,
        location,
        quantity,
        products:product_id (
          name,
          brand
        )
      `)
      .eq('tenant_id', tenantId)
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
