const axios = require('axios');

async function generateTestData() {
    // Make multiple API calls
    for (let i = 0; i < 5; i++) {
        try {
            await axios.post('http://localhost:3000/api/add-source', {
                sourceType: 'google_workspace',
                credentials: {
                    clientEmail: `test${i}@example.com`,
                    privateKey: 'test-key'
                },
                logFetchInterval: 300,
                callbackUrl: 'http://example.com/webhook'
            });
        } catch (error) {
            console.error(`Error in iteration ${i}:`, error.message);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

generateTestData(); 