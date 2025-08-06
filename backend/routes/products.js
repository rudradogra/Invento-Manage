const express = require('express');
const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = req.supabase
      .from('products')
      .select('*', { count: 'exact' });

    // Add search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    // Add category filter
    if (category) {
      query = query.eq('category', category);
    }

    // Add pagination
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

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
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await req.supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

// Create new product
router.post('/', async (req, res) => {
  try {
    const {
      name,
      sku,
      description,
      category,
      price,
      cost,
      quantity,
      min_stock_level,
      supplier_id,
      barcode
    } = req.body;

    // Validate required fields
    if (!name || !sku || !category || !price || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, sku, category, price, quantity'
      });
    }

    const { data, error } = await req.supabase
      .from('products')
      .insert({
        name,
        sku,
        description,
        category,
        price,
        cost,
        quantity,
        min_stock_level: min_stock_level || 10,
        supplier_id,
        barcode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      sku,
      description,
      category,
      price,
      cost,
      quantity,
      min_stock_level,
      supplier_id,
      barcode
    } = req.body;

    const { data, error } = await req.supabase
      .from('products')
      .update({
        name,
        sku,
        description,
        category,
        price,
        cost,
        quantity,
        min_stock_level,
        supplier_id,
        barcode,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await req.supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
});

// Get low stock products
router.get('/alerts/low-stock', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('products')
      .select('*')
      .lt('quantity', 'min_stock_level')
      .order('quantity', { ascending: true });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock products',
      error: error.message
    });
  }
});

// Update stock quantity
router.patch('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation = 'set' } = req.body; // operation: 'set', 'add', 'subtract'

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required'
      });
    }

    let updateQuery;
    
    if (operation === 'add') {
      updateQuery = req.supabase.rpc('increment_stock', { 
        product_id: id, 
        amount: quantity 
      });
    } else if (operation === 'subtract') {
      updateQuery = req.supabase.rpc('decrement_stock', { 
        product_id: id, 
        amount: quantity 
      });
    } else {
      // Set operation
      updateQuery = req.supabase
        .from('products')
        .update({
          quantity: quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
    }

    const { data, error } = await updateQuery;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
});

module.exports = router;
