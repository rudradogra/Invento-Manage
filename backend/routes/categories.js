const express = require('express');
const router = express.Router();

// Get all categories for a tenant
router.get('/', async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const { data, error } = await req.supabase
      .from('categories')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name');

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data || [],
      tenant: req.tenant.org_name
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// Get a specific category for a tenant
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const { data, error } = await req.supabase
      .from('categories')
      .select('*')
      .eq('category_id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
});

// Create a new category for a tenant
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const tenantId = req.tenantId;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if category already exists for this tenant
    const { data: existingCategory, error: checkError } = await req.supabase
      .from('categories')
      .select('category_id')
      .eq('tenant_id', tenantId)
      .eq('name', name.trim())
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw checkError;
    }

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const { data, error } = await req.supabase
      .from('categories')
      .insert([{
        tenant_id: tenantId,
        name: name.trim(),
        description: description?.trim() || null
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
});

// Update a category for a tenant
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const tenantId = req.tenantId;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if another category with the same name exists for this tenant
    const { data: existingCategory, error: checkError } = await req.supabase
      .from('categories')
      .select('category_id')
      .eq('tenant_id', tenantId)
      .eq('name', name.trim())
      .neq('category_id', id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const { data, error } = await req.supabase
      .from('categories')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('category_id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
});

// Delete a category for a tenant
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    // Check if category is being used by any products
    const { count: productCount, error: countError } = await req.supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)
      .eq('tenant_id', tenantId);

    if (countError) {
      throw countError;
    }

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It is being used by ${productCount} product(s)`
      });
    }

    const { data, error } = await req.supabase
      .from('categories')
      .delete()
      .eq('category_id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully',
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
});

// Get products by category for a tenant
router.get('/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const { data, error } = await req.supabase
      .from('products')
      .select('*')
      .eq('category_id', id)
      .eq('tenant_id', tenantId)
      .order('name');

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
      message: 'Failed to fetch products for category',
      error: error.message
    });
  }
});

// Get category statistics for a tenant
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    // Get product count for this category
    const { count: productCount, error: productError } = await req.supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)
      .eq('tenant_id', tenantId);

    if (productError) {
      throw productError;
    }

    // Get total inventory for this category
    const { data: inventoryData, error: inventoryError } = await req.supabase
      .from('inventory')
      .select(`
        quantity,
        products:product_id (
          category_id,
          purchase_price
        )
      `)
      .eq('tenant_id', tenantId);

    if (inventoryError) {
      throw inventoryError;
    }

    // Filter by category and calculate totals
    const categoryInventory = inventoryData.filter(item => 
      item.products?.category_id === parseInt(id)
    );
    
    const totalQuantity = categoryInventory.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = categoryInventory.reduce((sum, item) => {
      return sum + (item.quantity * (item.products?.purchase_price || 0));
    }, 0);

    res.json({
      success: true,
      data: {
        productCount: productCount || 0,
        totalQuantity: totalQuantity || 0,
        totalValue: Math.round(totalValue * 100) / 100
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category statistics',
      error: error.message
    });
  }
});

module.exports = router;
