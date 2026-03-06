const fs = require('fs');
async function testAuth() {
    const email = `test${Date.now()}@example.com`;
    const password = "password123";
    let output = "";

    output += `Testing Registration with ${email}...\n`;
    try {
        const regRes = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Test User", email, password })
        });

        const regData = await regRes.json();
        output += `Register response: ${regRes.status} ${JSON.stringify(regData)}\n`;

        if (regRes.ok) {
            output += `\nTesting Login with ${email}...\n`;
            const loginRes = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const loginData = await loginRes.json();
            output += `Login response: ${loginRes.status} ${JSON.stringify(loginData)}\n`;
        }
    } catch (err) {
        output += `Fetch error: ${err}\n`;
    }
    fs.writeFileSync('test_out.log', output, 'utf8');
}
testAuth();
