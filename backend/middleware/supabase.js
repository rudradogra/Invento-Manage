const { createClient } = require('@supabase/supabase-js');

const supabaseMiddleware = (req, res, next) => {
  // Initialize Supabase client and attach to request
  req.supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  
  // Also create admin client for operations that require service role
  req.supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  next();
};

module.exports = supabaseMiddleware;
