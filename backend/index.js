require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Invento-Manage Backend API',
    status: 'Running',
    timestamp: new Date().toISOString()
  });
});

// Test Supabase connection
app.get('/api/test-db', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('your_table_name') // Replace with an actual table name from your Supabase
      .select('*')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    res.json({ 
      message: 'Database connection successful',
      data: data 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
});

module.exports = app;