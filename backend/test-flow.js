const test = async () => {
    try {
        const email = 'testuser123@example.com';
        const password = 'Password@123';
        const name = 'Test User';

        console.log('Registering...');
        let res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role: 'customer' })
        });
        console.log('Status:', res.status, await res.json());

        console.log('\nLogging in...');
        res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        console.log('Status:', res.status, await res.json());
    } catch (e) {
        console.error(e);
    }
};

test();
