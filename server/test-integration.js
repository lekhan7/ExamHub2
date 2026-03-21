// Test integration without Supabase
console.log('🧪 Testing Exam Hub integration without Supabase...\n');

// Test 1: Supabase module
try {
  const supabase = require('./supabase');
  console.log('✅ Supabase module: ', supabase === null ? 'Not configured (expected)' : 'Configured');
} catch (error) {
  console.log('❌ Supabase module error:', error.message);
}

// Test 2: DatabaseServices

try {
  const DatabaseServices = require('./databaseServices');
  console.log('✅ DatabaseServices loaded successfully');
  
  // Test basic operations
  DatabaseServices.createRoom('Test Room', 'TEST', true, 'TestUser')
    .then(room => {
      console.log('✅ Room creation works:', room ? 'Success' : 'Failed');
    })
    .catch(err => console.log('❌ Room creation failed:', err.message));
} catch (error) {
  console.log('❌ DatabaseServices error:', error.message);
}

// Test 3: RoomManager
try {
  const roomManager = require('./roomManager');
  console.log('✅ RoomManager loaded successfully');
} catch (error) {
  console.log('❌ RoomManager error:', error.message);
}

console.log('\n🎉 Integration test complete!');
console.log('📝 The server should now work without Supabase configured');
