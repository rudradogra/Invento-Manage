const express = require('express');
const router = express.Router();

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = req.supabase
      .from('suppliers')
      .select('*', { count: 'exact' });

    // Add search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Add pagination
    query = query
      .range(offset, offset + limit - 1)
      .order('name', { ascending: true });

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
      message: 'Failed to fetch suppliers',
      error: error.message
    });
  }
});

// Get supplier by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await req.supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supplier',
      error: error.message
    });
  }
});

// Create new supplier
router.post('/', async (req, res) => {
  try {
    const {
      name,
      contact_person,
      email,
      phone,
      address,
      city,
      state,
      country,
      postal_code,
      website,
      notes
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Supplier name is required'
      });
    }

    const { data, error } = await req.supabase
      .from('suppliers')
      .insert({
        name,
        contact_person,
        email,
        phone,
        address,
        city,
        state,
        country,
        postal_code,
        website,
        notes,
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
      message: 'Supplier created successfully',
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create supplier',
      error: error.message
    });
  }
});

// Update supplier
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      contact_person,
      email,
      phone,
      address,
      city,
      state,
      country,
      postal_code,
      website,
      notes
    } = req.body;

    const { data, error } = await req.supabase
      .from('suppliers')
      .update({
        name,
        contact_person,
        email,
        phone,
        address,
        city,
        state,
        country,
        postal_code,
        website,
        notes,
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
        message: 'Supplier not found'
      });
    }

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update supplier',
      error: error.message
    });
  }
});

// Delete supplier
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if supplier has products
    const { data: products, error: checkError } = await req.supabase
      .from('products')
      .select('id')
      .eq('supplier_id', id)
      .limit(1);

    if (checkError) {
      throw checkError;
    }

    if (products && products.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete supplier with existing products'
      });
    }

    const { error } = await req.supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete supplier',
      error: error.message
    });
  }
});

// Get products from supplier
router.get('/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { data, error, count } = await req.supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('supplier_id', id)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

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
      message: 'Failed to fetch supplier products',
      error: error.message
    });
  }
});

module.exports = router;
