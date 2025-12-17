#!/usr/bin/env node

/**
 * Simple test script to check if the Python backend is running
 */

const http = require('http');

function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const request = http.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        console.log(`✅ ${description}: ${response.statusCode}`);
        if (response.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log(`   Response: ${JSON.stringify(json, null, 2)}`);
          } catch (e) {
            console.log(`   Response: ${data.substring(0, 100)}...`);
          }
        }
        resolve(true);
      });
    });

    request.on('error', (error) => {
      console.log(`❌ ${description}: ${error.message}`);
      resolve(false);
    });

    request.setTimeout(5000, () => {
      console.log(`⏰ ${description}: Timeout`);
      request.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log('🧪 Testing Python Backend Connection...\n');

  const tests = [
    ['http://localhost:8000/health', 'Health Check'],
    ['http://localhost:8000/api/ollama/status', 'Ollama Status'],
    ['http://localhost:11434/api/tags', 'Direct Ollama Check'],
  ];

  for (const [url, description] of tests) {
    await testEndpoint(url, description);
    console.log('');
  }

  console.log('🏁 Test completed!');
  console.log('\nIf health check failed:');
  console.log('  cd python-backend && python run.py');
  console.log('\nIf Ollama check failed:');
  console.log('  ollama serve');
}

main().catch(console.error);