const express = require('express');
const router = express.Router();

// Get all suppliers for a tenant
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    const tenantId = req.tenantId;

    let query = req.supabase
      .from('suppliers')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId);

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
      },
      tenant: req.tenant.org_name
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suppliers',
      error: error.message
    });
  }
});

// Get supplier by ID for a tenant
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const { data, error } = await req.supabase
      .from('suppliers')
      .select('*')
      .eq('supplier_id', id)
      .eq('tenant_id', tenantId)
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

// Create new supplier for a tenant
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
    const tenantId = req.tenantId;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Supplier name is required'
      });
    }

    // Check if supplier already exists for this tenant
    const { data: existingSupplier, error: checkError } = await req.supabase
      .from('suppliers')
      .select('supplier_id')
      .eq('tenant_id', tenantId)
      .eq('name', name.trim())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        message: 'Supplier with this name already exists'
      });
    }

    const { data, error } = await req.supabase
      .from('suppliers')
      .insert({
        tenant_id: tenantId,
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

// Update supplier for a tenant
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
    const tenantId = req.tenantId;

    // Check if another supplier with the same name exists for this tenant
    if (name) {
      const { data: existingSupplier, error: checkError } = await req.supabase
        .from('suppliers')
        .select('supplier_id')
        .eq('tenant_id', tenantId)
        .eq('name', name.trim())
        .neq('supplier_id', id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingSupplier) {
        return res.status(400).json({
          success: false,
          message: 'Supplier with this name already exists'
        });
      }
    }

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
      .eq('supplier_id', id)
      .eq('tenant_id', tenantId)
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

// Delete supplier for a tenant
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    // Check if supplier has products for this tenant
    const { data: products, error: checkError } = await req.supabase
      .from('products')
      .select('product_id')
      .eq('supplier_id', id)
      .eq('tenant_id', tenantId)
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
      .eq('supplier_id', id)
      .eq('tenant_id', tenantId);

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

// Get products from supplier for a tenant
router.get('/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const tenantId = req.tenantId;

    const { data, error, count } = await req.supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('supplier_id', id)
      .eq('tenant_id', tenantId)
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
