const testLogin = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@smartdine.com', password: 'password123' })
        });
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Result:', data);
    } catch (e) {
        console.error(e);
    }
};

testLogin();
