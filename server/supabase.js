// Load environment variables
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if Supabase credentials are configured
if (!supabaseUrl || !supabaseKey || supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn('⚠️  Supabase credentials not configured. Using in-memory storage only.');
  console.warn('   To enable database persistence, set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
  module.exports = null;
} else {
  console.log('🔗 Initializing Supabase connection...');
  console.log(`   URL: ${supabaseUrl}`);
  
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Create admin client with service role key for storage operations
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  
  // Test connection
  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('❌ Supabase connection failed:', error.message);
        console.log('   Falling back to in-memory storage');
        return false;
      } else {
        console.log('✅ Supabase connection established successfully!');
        console.log('   Database: Ready for operations');
        console.log('   Storage: Ready for PDF uploads');
        return true;
      }
    } catch (err) {
      console.error('❌ Supabase connection test failed:', err.message);
      console.log('   Falling back to in-memory storage');
      return false;
    }
  };
  
  // Test connection on startup
  testConnection();
  
  module.exports = { supabase, supabaseAdmin, testConnection };
}
