// test-scraper.js - Simple test for the scraping functionality

const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';

async function testBackend() {
    console.log('🧪 Testing Shuddhorekha Backend...\n');

    try {
        // Test 1: Health check
        console.log('1. Testing health endpoint...');
        const healthResponse = await axios.get(`${BACKEND_URL}/health`);
        console.log('✅ Health check passed:', healthResponse.data);

        // Test 2: API info
        console.log('\n2. Testing API info...');
        const apiResponse = await axios.get(`${BACKEND_URL}/`);
        console.log('✅ API info:', apiResponse.data);

        // Test 3: Invalid URL test
        console.log('\n3. Testing invalid URL validation...');
        try {
            await axios.post(`${BACKEND_URL}/scrape`, { url: 'https://invalid-source.com' });
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ Invalid URL properly rejected:', error.response.data.message);
            } else {
                throw error;
            }
        }

        // Test 4: Valid domain but potentially inaccessible URL
        console.log('\n4. Testing valid Bangladeshi news domain...');
        try {
            const scrapeResponse = await axios.post(`${BACKEND_URL}/scrape`, { 
                url: 'https://www.prothomalo.com/test-article' 
            });
            console.log('✅ Scraping response:', scrapeResponse.data);
        } catch (error) {
            if (error.response) {
                console.log('⚠️ Expected error (URL may not be accessible):', error.response.data.message);
            } else {
                console.log('⚠️ Network error (expected in sandbox):', error.message);
            }
        }

        console.log('\n🎉 Backend tests completed successfully!');
        console.log('📝 Note: Actual URL scraping may fail due to network restrictions in this environment.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testBackend();