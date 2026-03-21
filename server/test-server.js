// Quick test to verify server can start without Supabase
console.log('Testing server startup without Supabase...');

try {
  // Test Supabase module
  const supabase = require('./supabase');
  console.log('✅ Supabase module loaded:', supabase === null ? 'Not configured (expected)' : 'Configured');
  
  // Test DatabaseServices
  const DatabaseServices = require('./databaseServices');
  console.log('✅ DatabaseServices module loaded');
  
  // Test roomManager
  const roomManager = require('./roomManager');
  console.log('✅ RoomManager module loaded');
  
  console.log('🎉 All modules loaded successfully!');
  console.log('📝 Server should start without Supabase configured');
  
} catch (error) {
  console.error('❌ Error loading modules:', error.message);
  process.exit(1);
}
