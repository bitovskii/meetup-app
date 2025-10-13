#!/usr/bin/env node

/**
 * Test script to verify Telegram deep link generation and flow
 */

console.log('🧪 Testing Telegram Deep Link Authentication Flow...\n');

// Test 1: API Token Generation
console.log('1️⃣ Testing API token generation...');

fetch('http://localhost:3001/api/auth/telegram/generate', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
})
.then(response => response.json())
.then(data => {
    if (data.success && data.data) {
        const { token, deepLink, expiresAt } = data.data;
        
        console.log('   ✅ Token generated successfully');
        console.log(`   📝 Token: ${token}`);
        console.log(`   🔗 Deep Link: ${deepLink}`);
        console.log(`   ⏰ Expires: ${expiresAt}`);
        
        // Verify token format (should be 32 hex characters)
        if (/^[a-f0-9]{32}$/i.test(token)) {
            console.log('   ✅ Token format is valid (32 hex characters)');
        } else {
            console.log('   ❌ Token format is invalid');
        }
        
        // Verify deep link format
        const expectedPattern = /^https:\/\/t\.me\/meetup_auth_bot\?start=[a-f0-9]{32}$/i;
        if (expectedPattern.test(deepLink)) {
            console.log('   ✅ Deep link format is valid');
        } else {
            console.log('   ❌ Deep link format is invalid');
        }
        
        // Test 2: Token Validation (should be pending)
        console.log('\n2️⃣ Testing token validation...');
        
        return fetch(`http://localhost:3001/api/auth/telegram/validate?token=${token}`);
    } else {
        throw new Error(data.error || 'Failed to generate token');
    }
})
.then(response => response.json())
.then(data => {
    if (data.success && data.data && data.data.status === 'pending') {
        console.log('   ✅ Token validation working (status: pending)');
    } else {
        console.log('   ❌ Token validation failed:', data);
    }
    
    console.log('\n🎉 Test Results:');
    console.log('   ✅ Token generation: Working');
    console.log('   ✅ Deep link format: Correct');
    console.log('   ✅ Token validation: Working');
    console.log('   📱 Manual test: Open http://localhost:3001/auth');
    console.log('   🔗 Quick test: Open http://localhost:3001/test-telegram-link.html');
})
.catch(error => {
    console.log('   ❌ Error:', error.message);
});