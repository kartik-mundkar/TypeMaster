#!/usr/bin/env node
/**
 * Simple connectivity test for external APIs
 * Run this to check if your network can reach the external services
 */

const axios = require('axios');

const testEndpoints = [
  {
    name: 'Quotes API',
    url: 'https://api.quotable.io/quotes/random?minLength=50&maxLength=200',
    description: 'External quotes service'
  },
  {
    name: 'Lorem API', 
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    description: 'Lorem ipsum text service'
  },
  {
    name: 'Google DNS',
    url: 'https://8.8.8.8',
    description: 'Basic internet connectivity'
  }
];

async function testConnectivity() {
  console.log('🔍 Testing external API connectivity...\n');
  
  for (const endpoint of testEndpoints) {
    try {
      console.log(`Testing ${endpoint.name}...`);
      const startTime = Date.now();
      
      const response = await axios.get(endpoint.url, { 
        timeout: 5000,
        headers: {
          'User-Agent': 'TypeMaster-Connectivity-Test/1.0'
        }
      });
      
      const duration = Date.now() - startTime;
      console.log(`✅ ${endpoint.name}: OK (${duration}ms, status: ${response.status})`);
      
    } catch (error) {
      const errorCode = error.code || 'UNKNOWN';
      const errorMsg = error.message || 'Unknown error';
      console.log(`❌ ${endpoint.name}: FAILED`);
      console.log(`   Error: ${errorCode} - ${errorMsg}`);
      
      if (errorCode === 'EAI_AGAIN') {
        console.log(`   → This is a DNS resolution issue. Check your internet connection.`);
      } else if (errorCode === 'ECONNREFUSED') {
        console.log(`   → Connection refused. The service might be down.`);
      } else if (errorCode === 'ENOTFOUND') {
        console.log(`   → Domain not found. Check your DNS settings.`);
      }
    }
    console.log('');
  }
  
  console.log('💡 Note: If external APIs fail, TypeMaster will automatically use local fallback content.');
  console.log('💡 Your typing app will work perfectly even without external connectivity!');
}

// Run the test
testConnectivity().catch(console.error);
