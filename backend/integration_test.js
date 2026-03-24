const axios = require('axios');

async function fullTest() {
  const username = 'testfull' + Date.now();
  const email = username + '@gmail.com';
  const password = 'password123';
  
  try {
    console.log('--- Registering user...');
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      fullName: 'Full Test User',
      username,
      phone: '257' + Math.floor(Math.random() * 10000000),
      email,
      password,
      country: 'Burundi'
    });
    console.log('Register success:', regRes.data.message);

    console.log('--- Logging in user...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      loginIdentifier: username,
      password
    });
    console.log('Login success! User ID:', loginRes.data.user.id);

  } catch (err) {
    if (err.response) {
      console.error('API Error:', err.response.status, err.response.data);
    } else {
      console.error('Network Error:', err.message);
    }
  }
}

fullTest();
