// Test script for MongoDB integration
// Run this in the browser console to test result saving

async function testResultSaving() {
    console.log('🧪 Testing MongoDB result saving...');
    
    // Test data
    const testResult = {
        testConfig: {
            mode: 'words',
            wordCount: 25,
            textSource: 'mixed',
            textContent: 'The quick brown fox jumps over the lazy dog and runs through the forest.'
        },
        results: {
            wpm: 45,
            accuracy: 95,
            totalCharacters: 75,
            correctCharacters: 71,
            incorrectCharacters: 4,
            timeElapsed: 60,
            completed: true
        },
        metadata: {
            language: 'en-US',
            keyboard: 'en-US',
            testDuration: 60
        }
    };

    try {
        // Get or create guest session
        let sessionId = localStorage.getItem('guestSessionId');
        if (!sessionId) {
            console.log('📝 Creating guest session...');
            const sessionResponse = await fetch('http://localhost:5002/api/auth/guest-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const sessionData = await sessionResponse.json();
            if (sessionData.success) {
                sessionId = sessionData.data.sessionId;
                localStorage.setItem('guestSessionId', sessionId);
                console.log('✅ Guest session created:', sessionId);
            }
        }

        // Add session ID to test data
        testResult.sessionId = sessionId;

        // Test result saving
        console.log('💾 Saving test result...');
        const response = await fetch('http://localhost:5002/api/results/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testResult)
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Result saved successfully!');
            console.log('📊 Result ID:', result.data.id);
            
            // Test statistics retrieval
            console.log('📈 Fetching statistics...');
            const statsResponse = await fetch(`http://localhost:5002/api/results/stats/summary?sessionId=${sessionId}`);
            const statsData = await statsResponse.json();
            
            if (statsData.success) {
                console.log('✅ Statistics retrieved successfully!');
                console.log('📊 Total tests:', statsData.data.summary.totalTests);
                console.log('📊 Average WPM:', Math.round(statsData.data.summary.averageWPM));
                console.log('📊 Best WPM:', Math.round(statsData.data.summary.bestWPM));
                console.log('📊 Average accuracy:', Math.round(statsData.data.summary.averageAccuracy) + '%');
            } else {
                console.error('❌ Failed to retrieve statistics:', statsData.message);
            }
            
        } else {
            console.error('❌ Failed to save result:', result.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Test user registration
async function testUserRegistration() {
    console.log('🧪 Testing user registration...');
    
    const userData = {
        username: 'testuser_' + Math.random().toString(36).substr(2, 5),
        email: `test${Math.random().toString(36).substr(2, 5)}@example.com`,
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'User'
    };
    
    try {
        const response = await fetch('http://localhost:5002/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ User registered successfully!');
            console.log('👤 Username:', result.data.user.username);
            console.log('🔑 Token received:', !!result.data.token);
            
            // Store token for further tests
            localStorage.setItem('authToken', result.data.token);
            
            return result.data;
        } else {
            console.error('❌ Registration failed:', result.message);
        }
    } catch (error) {
        console.error('❌ Registration test failed:', error);
    }
}

// Combined test
async function runAllTests() {
    console.log('🚀 Starting comprehensive MongoDB integration tests...\n');
    
    // Test 1: Guest result saving
    console.log('--- TEST 1: Guest Result Saving ---');
    await testResultSaving();
    
    console.log('\n--- TEST 2: User Registration ---');
    await testUserRegistration();
    
    console.log('\n--- TEST 3: Authenticated Result Saving ---');
    await testResultSaving(); // This should now save with the registered user
    
    console.log('\n🎉 All tests completed! Check the console for results.');
}

// Export functions for manual testing
window.testMongoDB = {
    testResultSaving,
    testUserRegistration,
    runAllTests
};

console.log('🧪 MongoDB test functions loaded!');
console.log('📋 Available commands:');
console.log('  - testMongoDB.testResultSaving()');
console.log('  - testMongoDB.testUserRegistration()');
console.log('  - testMongoDB.runAllTests()');
console.log('');
console.log('🚀 Run testMongoDB.runAllTests() to test everything!');
