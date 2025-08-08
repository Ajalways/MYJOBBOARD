// Use Node.js built-in fetch (available in Node 18+)
async function testRegistration() {
    try {
        console.log('Testing registration API...');
        
        const testData = {
            email: 'testuser' + Date.now() + '@example.com',
            password: 'testpass123',
            full_name: 'Test User',
            role: 'JOBSEEKER'
        };
        
        console.log('Sending data:', JSON.stringify(testData, null, 2));
        
        const response = await fetch('http://localhost:3001/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers));
        
        const result = await response.json();
        console.log('Response data:', JSON.stringify(result, null, 2));
        
        if (!response.ok) {
            console.error('Registration failed with status:', response.status);
        } else {
            console.log('✅ Registration successful!');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Error details:', error);
    }
}

testRegistration();
