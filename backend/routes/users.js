const express = require('express');
const router = express.Router();

// Get all users for a tenant
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    const tenantId = req.tenantId;

    let query = req.supabase
      .from('users')
      .select('user_id, tenant_id, name, email, role, created_at', { count: 'exact' })
      .eq('tenant_id', tenantId);

    // Add search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
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
      data: data || [],
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
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Get a specific user for a tenant
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const tenantId = req.tenantId;

    const { data, error } = await req.supabase
      .from('users')
      .select('user_id, tenant_id, name, email, role, created_at')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

module.exports = router;
