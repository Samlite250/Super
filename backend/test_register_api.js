const axios = require('axios');

async function testRegister() {
  const username = 'testuser' + Date.now();
  try {
    const res = await axios.post('http://localhost:5000/api/auth/register', {
      fullName: 'Test Automation',
      username: username,
      phone: '257' + Math.floor(Math.random() * 100000000),
      email: username + '@gmail.com',
      password: 'password123',
      country: 'Burundi'
    });
    console.log('Register success:', res.data);
  } catch (err) {
    console.error('Register error:', err.response?.status, err.response?.data);
  }
}

testRegister();
