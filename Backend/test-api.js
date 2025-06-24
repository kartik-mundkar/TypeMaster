#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/text';

async function testAPI() {
  console.log('🧪 Testing TypeMaster Backend APIs\n');
  
  const sources = ['mixed', 'quotes', 'lorem', 'news'];
  
  for (const source of sources) {
    try {
      console.log(`📝 Testing ${source} source...`);
      const response = await axios.get(`${BASE_URL}/random?source=${source}`);
      
      if (response.data && response.data.success && response.data.data) {
        const { text, wordCount, characterCount } = response.data.data;
        console.log(`✅ ${source}: ${wordCount} words, ${characterCount} chars`);
        console.log(`   "${text.substring(0, 80)}..."\n`);
      } else {
        console.log(`❌ ${source}: Invalid response format\n`);
      }
    } catch (error) {
      console.log(`❌ ${source}: ${error.message}\n`);
    }
  }
  
  // Test health endpoint
  try {
    console.log('🏥 Testing health endpoint...');
    const response = await axios.get('http://localhost:5000/health');
    console.log(`✅ Health: ${response.data.status} - ${response.data.message}`);
  } catch (error) {
    console.log(`❌ Health: ${error.message}`);
  }
}

testAPI().catch(console.error);
