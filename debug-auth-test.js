console.log('=== Authentication Debug Test ===');

// Test the current auth state
const userData = localStorage.getItem('meetup_user');
console.log('1. LocalStorage user data:', userData);

if (userData) {
    try {
        const parsedUser = JSON.parse(userData);
        console.log('2. Parsed user object:', parsedUser);
        console.log('3. Session token exists:', !!parsedUser.sessionToken);
        console.log('4. Session token value:', parsedUser.sessionToken);
        console.log('5. Session expires at:', parsedUser.sessionExpiresAt);
        
        if (parsedUser.sessionExpiresAt) {
            const expiryDate = new Date(parsedUser.sessionExpiresAt);
            const now = new Date();
            console.log('6. Session is valid:', expiryDate > now);
            console.log('7. Time until expiry (hours):', (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        }
        
        // Test API call with current token
        if (parsedUser.sessionToken) {
            console.log('8. Testing API call with current token...');
            
            fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${parsedUser.sessionToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: 'Test Event',
                    description: 'Debug test',
                    date: '25.10.2025',
                    time: '10:00',
                    place: 'Test Place'
                })
            })
            .then(response => {
                console.log('9. API Response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('10. API Response data:', data);
            })
            .catch(error => {
                console.log('11. API Error:', error);
            });
        } else {
            console.log('8. No session token to test with');
        }
        
    } catch (error) {
        console.log('Error parsing user data:', error);
    }
} else {
    console.log('2. No user data found in localStorage');
}