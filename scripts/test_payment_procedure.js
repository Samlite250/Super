const http = require('http');

function post(path, data, token) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    if (token) options.headers.Authorization = `Bearer ${token}`;
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async function(){
  try {
    const login = await post('/api/auth/login', { email: 'admin@supercash.com', password: 'adminpass123' });
    console.log('login', login.status, login.body);
    if (!login.body || !login.body.token) return console.error('no token');
    const token = login.body.token;
    const proc = { country: 'Rwanda', method: 'MoMo', instructions: '1. Dial *182#\n2. Choose Send', accountDetails: '250783000000' };
    const res = await post('/api/settings/payment-procedures', proc, token);
    console.log('saveProc', res.status, res.body);
  } catch (err) {
    console.error(err);
  }
})();
