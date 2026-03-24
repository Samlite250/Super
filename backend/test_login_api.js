const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      loginIdentifier: 'uganda',
      password: 'password123' // I don't know the password, but I want to see the error message
    });
    console.log('Login success:', res.data);
  } catch (err) {
    console.error('Login error:', err.response?.status, err.response?.data);
  }
}

testLogin();
