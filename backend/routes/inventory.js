const express = require('express');
const router = express.Router();

// Get all inventory for a tenant
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', location = '' } = req.query;
    const offset = (page - 1) * limit;
    const tenantId = req.tenantId;

    let query = req.supabase
      .from('inventory')
      .select(`
        *,
        products:product_id (
          name,
          brand,
          purchase_price,
          mrp
        )
      `, { count: 'exact' })
      .eq('tenant_id', tenantId);

    // Add search filter by location
    if (search) {
      query = query.ilike('location', `%${search}%`);
    }

    // Add location filter
    if (location) {
      query = query.eq('location', location);
    }

    // Add pagination
    query = query
      .range(offset, offset + limit - 1)
      .order('updated_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      },
      tenant: req.tenant.org_name
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error.message
    });
  }
});

// Get inventory for specific product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const tenantId = req.tenantId;

    const { data, error } = await req.supabase
      .from('inventory')
      .select(`
        *,
        products:product_id (
          name,
          brand,
          purchase_price,
          mrp
        )
      `)
      .eq('product_id', productId)
      .eq('tenant_id', tenantId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product inventory',
      error: error.message
    });
  }
});

// Add inventory entry
router.post('/', async (req, res) => {
  try {
    const {
      product_id,
      location,
      quantity,
      capacity
    } = req.body;
    const tenantId = req.tenantId;

    // Validate required fields
    if (!product_id || !location || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: product_id, location, quantity'
      });
    }

    // Verify product belongs to this tenant
    const { data: product, error: productError } = await req.supabase
      .from('products')
      .select('product_id')
      .eq('product_id', product_id)
      .eq('tenant_id', tenantId)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found for this tenant'
      });
    }

    const { data, error } = await req.supabase
      .from('inventory')
      .insert({
        tenant_id: tenantId,
        product_id,
        location,
        quantity,
        capacity
      })
      .select(`
        *,
        products:product_id (
          name,
          brand,
          purchase_price,
          mrp
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Inventory entry created successfully',
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create inventory entry',
      error: error.message
    });
  }
});

// Update inventory quantity
router.put('/:productId/:location', async (req, res) => {
  try {
    const { productId, location } = req.params;
    const { quantity, capacity, operation = 'set' } = req.body;
    const tenantId = req.tenantId;

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required'
      });
    }

    let updateData = {};
    
    if (operation === 'add') {
      // Add to existing quantity
      const { data: currentInventory } = await req.supabase
        .from('inventory')
        .select('quantity')
        .eq('product_id', productId)
        .eq('location', location)
        .eq('tenant_id', tenantId)
        .single();
      
      updateData.quantity = (currentInventory?.quantity || 0) + quantity;
    } else if (operation === 'subtract') {
      // Subtract from existing quantity
      const { data: currentInventory } = await req.supabase
        .from('inventory')
        .select('quantity')
        .eq('product_id', productId)
        .eq('location', location)
        .eq('tenant_id', tenantId)
        .single();
      
      updateData.quantity = Math.max(0, (currentInventory?.quantity || 0) - quantity);
    } else {
      // Set operation
      updateData.quantity = quantity;
    }

    if (capacity !== undefined) {
      updateData.capacity = capacity;
    }

    const { data, error } = await req.supabase
      .from('inventory')
      .update(updateData)
      .eq('product_id', productId)
      .eq('location', location)
      .eq('tenant_id', tenantId)
      .select(`
        *,
        products:product_id (
          name,
          brand,
          purchase_price,
          mrp
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Inventory entry not found for this tenant'
      });
    }

    res.json({
      success: true,
      message: 'Inventory updated successfully',
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update inventory',
      error: error.message
    });
  }
});

// Get low stock alerts
router.get('/alerts/low-stock', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { threshold = 10 } = req.query;

    const { data, error } = await req.supabase
      .from('inventory')
      .select(`
        *,
        products:product_id (
          name,
          brand,
          purchase_price,
          mrp
        )
      `)
      .eq('tenant_id', tenantId)
      .lt('quantity', threshold)
      .order('quantity', { ascending: true });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data,
      count: data.length,
      threshold: parseInt(threshold)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock alerts',
      error: error.message
    });
  }
});

// Delete inventory entry
router.delete('/:productId/:location', async (req, res) => {
  try {
    const { productId, location } = req.params;
    const tenantId = req.tenantId;

    const { error } = await req.supabase
      .from('inventory')
      .delete()
      .eq('product_id', productId)
      .eq('location', location)
      .eq('tenant_id', tenantId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Inventory entry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete inventory entry',
      error: error.message
    });
  }
});

module.exports = router;
