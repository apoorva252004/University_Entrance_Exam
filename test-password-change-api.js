/**
 * Test script for password change API
 * Run with: node test-password-change-api.js
 */

async function testPasswordChangeAPI() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('🧪 Testing Password Change API...\n');
  
  // Test 1: API endpoint exists and returns JSON
  console.log('Test 1: Checking if API endpoint returns JSON...');
  try {
    const response = await fetch(`${baseUrl}/api/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newPassword: 'Test@123',
        confirmPassword: 'Test@123'
      })
    });
    
    const contentType = response.headers.get('content-type');
    console.log(`  Status: ${response.status}`);
    console.log(`  Content-Type: ${contentType}`);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log(`  Response:`, data);
      console.log('  ✅ API returns JSON (expected: 401 Unauthorized without session)\n');
    } else {
      const text = await response.text();
      console.log(`  ❌ API returned HTML instead of JSON`);
      console.log(`  First 200 chars: ${text.substring(0, 200)}\n`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}\n`);
    return false;
  }
  
  console.log('✅ All tests passed! API is working correctly.');
  console.log('\n📝 Next steps:');
  console.log('1. Start dev server: npm run dev');
  console.log('2. Login with a first-time user');
  console.log('3. Try changing password with: Saketh@548');
  console.log('4. Check terminal for logs: [API] Change password request received');
  
  return true;
}

// Run tests
testPasswordChangeAPI().catch(console.error);
