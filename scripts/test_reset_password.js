const API = 'http://localhost:5000/api';
const admin = { email: 'admin@supercash.com', password: 'adminpass123' };

(async () => {
  try {
    const loginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(admin),
    });
    const login = await loginRes.json();
    if (!login.token) return console.error('Login failed', login);
    const token = login.token;
    console.log('Got token');

    const res = await fetch(`${API}/admin/users/2/reset-password`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log('Reset response:', data);
  } catch (err) {
    console.error(err.message || err);
  }
})();
