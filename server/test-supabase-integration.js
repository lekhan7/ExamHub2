// Load environment variables first
require('dotenv').config();

const DatabaseServices = require('./databaseServices');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Supabase Integration Test...\n');

async function runTests() {
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Check Supabase Configuration
  console.log('📋 Test 1: Supabase Configuration');
  try {
    const supabaseConfig = require('./supabase');
    if (supabaseConfig) {
      console.log('✅ Supabase is configured');
      console.log(`   URL: ${process.env.SUPABASE_URL}`);
      results.passed++;
      results.tests.push('✅ Supabase Configuration');
    } else {
      console.log('❌ Supabase is not configured');
      results.failed++;
      results.tests.push('❌ Supabase Configuration');
    }
  } catch (error) {
    console.log('❌ Error loading Supabase config:', error.message);
    results.failed++;
    results.tests.push('❌ Supabase Configuration');
  }

  // Test 2: Test Database Connection
  console.log('\n📋 Test 2: Database Connection');
  try {
    if (supabaseConfig && supabaseConfig.testConnection) {
      const isConnected = await supabaseConfig.testConnection();
      if (isConnected) {
        console.log('✅ Database connection successful');
        results.passed++;
        results.tests.push('✅ Database Connection');
      } else {
        console.log('❌ Database connection failed');
        results.failed++;
        results.tests.push('❌ Database Connection');
      }
    }
  } catch (error) {
    console.log('❌ Database connection error:', error.message);
    results.failed++;
    results.tests.push('❌ Database Connection');
  }

  // Test 3: Create a Test User
  console.log('\n📋 Test 3: Create Test User');
  try {
    const testUser = await DatabaseServices.createOrUpdateUser('TestUser', 'test-socket-123');
    if (testUser && testUser.id) {
      console.log('✅ Test user created successfully');
      console.log(`   User ID: ${testUser.id}`);
      console.log(`   Display Name: ${testUser.display_name}`);
      results.passed++;
      results.tests.push('✅ Create Test User');
    } else {
      console.log('❌ Failed to create test user');
      results.failed++;
      results.tests.push('❌ Create Test User');
    }
  } catch (error) {
    console.log('❌ Error creating test user:', error.message);
    results.failed++;
    results.tests.push('❌ Create Test User');
  }

  // Test 4: Create a Test Room
  console.log('\n📋 Test 4: Create Test Room');
  try {
    const testRoom = await DatabaseServices.createRoom('Test Room', 'math', false, 'TestUser');
    if (testRoom && testRoom.id) {
      console.log('✅ Test room created successfully');
      console.log(`   Room ID: ${testRoom.id}`);
      console.log(`   Room Name: ${testRoom.name}`);
      console.log(`   Room Code: ${testRoom.roomCode}`);
      results.passed++;
      results.tests.push('✅ Create Test Room');
      
      // Test 5: Get Room Details
      console.log('\n📋 Test 5: Get Room Details');
      try {
        const retrievedRoom = await DatabaseServices.getRoom(testRoom.id);
        if (retrievedRoom && retrievedRoom.id === testRoom.id) {
          console.log('✅ Room retrieved successfully');
          console.log(`   Members: ${retrievedRoom.members.length}`);
          results.passed++;
          results.tests.push('✅ Get Room Details');
        } else {
          console.log('❌ Failed to retrieve room');
          results.failed++;
          results.tests.push('❌ Get Room Details');
        }
      } catch (error) {
        console.log('❌ Error retrieving room:', error.message);
        results.failed++;
        results.tests.push('❌ Get Room Details');
      }

      // Test 6: Add Member to Room
      console.log('\n📋 Test 6: Add Member to Room');
      try {
        const testUser2 = await DatabaseServices.createOrUpdateUser('TestUser2', 'test-socket-456');
        const memberAdded = await DatabaseServices.addMemberToRoom(testRoom.id, testUser2.id, false, 'test-socket-456');
        if (memberAdded) {
          console.log('✅ Member added successfully');
          console.log(`   Member: ${memberAdded.displayName}`);
          results.passed++;
          results.tests.push('✅ Add Member to Room');
        } else {
          console.log('❌ Failed to add member');
          results.failed++;
          results.tests.push('❌ Add Member to Room');
        }
      } catch (error) {
        console.log('❌ Error adding member:', error.message);
        results.failed++;
        results.tests.push('❌ Add Member to Room');
      }

      // Test 7: Test PDF Upload (Mock)
      console.log('\n📋 Test 7: Test PDF Upload');
      try {
        // Create a mock PDF buffer
        const mockPdfBuffer = Buffer.from('Mock PDF content for testing');
        const pdfUpload = await DatabaseServices.updateRoomPDF(
          testRoom.id, 
          mockPdfBuffer, 
          'test-document.pdf', 
          testRoom.creator_id || 'TestUser'
        );
        
        if (pdfUpload && pdfUpload.data) {
          console.log('✅ PDF uploaded successfully');
          console.log(`   File Name: ${pdfUpload.fileName}`);
          console.log(`   File Size: ${pdfUpload.fileSize} bytes`);
          results.passed++;
          results.tests.push('✅ Test PDF Upload');
        } else {
          console.log('❌ Failed to upload PDF');
          results.failed++;
          results.tests.push('❌ Test PDF Upload');
        }
      } catch (error) {
        console.log('❌ Error uploading PDF:', error.message);
        results.failed++;
        results.tests.push('❌ Test PDF Upload');
      }

      // Test 8: Get Public Rooms
      console.log('\n📋 Test 8: Get Public Rooms');
      try {
        // Create a public room first
        const publicRoom = await DatabaseServices.createRoom('Public Test Room', 'science', true, 'TestUser');
        const publicRooms = await DatabaseServices.getPublicRooms();
        
        if (Array.isArray(publicRooms)) {
          console.log('✅ Public rooms retrieved successfully');
          console.log(`   Total Public Rooms: ${publicRooms.length}`);
          results.passed++;
          results.tests.push('✅ Get Public Rooms');
        } else {
          console.log('❌ Failed to get public rooms');
          results.failed++;
          results.tests.push('❌ Get Public Rooms');
        }
      } catch (error) {
        console.log('❌ Error getting public rooms:', error.message);
        results.failed++;
        results.tests.push('❌ Get Public Rooms');
      }

    } else {
      console.log('❌ Failed to create test room');
      results.failed++;
      results.tests.push('❌ Create Test Room');
    }
  } catch (error) {
    console.log('❌ Error creating test room:', error.message);
    results.failed++;
    results.tests.push('❌ Create Test Room');
  }

  // Print Summary
  console.log('\n' + '='.repeat(50));
  console.log('🏁 TEST SUMMARY');
  console.log('='.repeat(50));
  
  results.tests.forEach(test => console.log(test));
  
  console.log('\n📊 Results:');
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! Supabase integration is working perfectly!');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
  
  console.log('\n🔍 Check your Supabase dashboard to see the created test data.');
}

// Run the tests
runTests().catch(console.error);
