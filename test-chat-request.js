#!/usr/bin/env node

/**
 * Test script to check if the Python backend can handle chat requests
 */

const http = require('http');

function testChatRequest() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      message: "Hello, test message",
      user_id: "test-user-123",
      health_context: null
    });

    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000 // 30 seconds
    };

    console.log('🧪 Testing chat request...');
    console.log('Request data:', postData);

    const req = http.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
        console.log('Received chunk:', chunk.length, 'bytes');
      });

      res.on('end', () => {
        console.log('✅ Response received');
        console.log('Response body:', data);
        resolve(true);
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request error:', error.message);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('⏰ Request timeout (30s)');
      req.destroy();
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('🏥 Testing Python Backend Chat Request...\n');
  
  const success = await testChatRequest();
  
  if (success) {
    console.log('\n🎉 Chat request test completed successfully!');
  } else {
    console.log('\n❌ Chat request test failed');
    console.log('\nPossible issues:');
    console.log('1. Python backend not running: cd python-backend && python run.py');
    console.log('2. Ollama not running: ollama serve');
    console.log('3. Authentication issues (expected for this test)');
    console.log('4. Backend taking too long to respond');
  }
}

main().catch(console.error);