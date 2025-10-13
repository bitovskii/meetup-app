// Test script to verify Telegram authentication API endpoints
const BASE_URL = 'http://localhost:3001';

async function testAuthFlow() {
  console.log('🧪 Testing Telegram Authentication Flow...\n');

  try {
    // Step 1: Generate token
    console.log('1️⃣ Generating auth token...');
    const generateResponse = await fetch(`${BASE_URL}/api/auth/telegram/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const generateData = await generateResponse.json();
    console.log('Generate Response:', generateData);
    
    if (!generateData.success) {
      throw new Error(`Generate failed: ${generateData.error}`);
    }
    
    const { token, deepLink } = generateData.data;
    console.log(`✅ Token generated: ${token}`);
    console.log(`✅ Deep link: ${deepLink}\n`);

    // Step 2: Check token status (should be pending)
    console.log('2️⃣ Checking token status...');
    const statusResponse = await fetch(`${BASE_URL}/api/auth/telegram/validate?token=${token}`);
    const statusData = await statusResponse.json();
    console.log('Status Response:', statusData);
    
    if (!statusData.success) {
      throw new Error(`Status check failed: ${statusData.error}`);
    }
    
    console.log(`✅ Token status: ${statusData.data.status}\n`);

    // Step 3: Simulate webhook authentication
    console.log('3️⃣ Simulating webhook authentication...');
    const mockUserData = {
      id: 123456789,
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      photo_url: 'https://example.com/photo.jpg',
      auth_date: Math.floor(Date.now() / 1000)
    };

    // Simulate what the webhook would do (update token directly in database)
    // For testing, we'll use the webhook endpoint
    const webhookData = {
      message: {
        from: mockUserData,
        text: `/start ${token}`,
        chat: { id: 123456789 }
      }
    };

    const webhookResponse = await fetch(`${BASE_URL}/api/auth/telegram/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookData)
    });

    console.log('Webhook Response Status:', webhookResponse.status);
    
    // Step 4: Check if token is now authenticated
    console.log('4️⃣ Checking final token status...');
    const finalStatusResponse = await fetch(`${BASE_URL}/api/auth/telegram/validate?token=${token}`);
    const finalStatusData = await finalStatusResponse.json();
    console.log('Final Status Response:', finalStatusData);
    
    if (finalStatusData.success && finalStatusData.data.status === 'success') {
      console.log('✅ Authentication flow completed successfully!');
      console.log('User data:', finalStatusData.data.user);
    } else {
      console.log('❌ Authentication flow failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAuthFlow();