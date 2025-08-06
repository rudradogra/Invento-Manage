const tenantMiddleware = async (req, res, next) => {
  try {
    const tenantId = req.params.tenantId || req.header('X-Tenant-ID');
    
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required. Provide it in URL path or X-Tenant-ID header.'
      });
    }

    // Validate tenant exists
    const { data: tenant, error } = await req.supabase
      .from('tenants')
      .select('tenant_id, org_name, active')
      .eq('tenant_id', tenantId)
      .single();

    if (error || !tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    if (!tenant.active) {
      return res.status(403).json({
        success: false,
        message: 'Tenant account is inactive'
      });
    }

    // Add tenant info to request object
    req.tenant = tenant;
    req.tenantId = tenantId;
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify tenant',
      error: error.message
    });
  }
};

module.exports = tenantMiddleware;
