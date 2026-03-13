const http = require('http');

function get(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'GET',
      headers: {}
    };
    if (token) options.headers.Authorization = `Bearer ${token}`;
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data || '{}') }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

(async function(){
  try {
    // login first to obtain admin token
    const http = require('http');
    function post(path, data) {
      return new Promise((resolve, reject) => {
        const body = JSON.stringify(data);
        const options = { hostname: 'localhost', port: 5000, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } };
        const req = http.request(options, (res) => {
          let d = '';
          res.on('data', c => d += c);
          res.on('end', () => { try{ resolve({ status: res.statusCode, body: JSON.parse(d || '{}') }); }catch(e){ resolve({ status: res.statusCode, body: d }); } });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
      });
    }

    const login = await post('/api/auth/login', { email: 'admin@supercash.com', password: 'adminpass123' });
    if (!login.body || !login.body.token) return console.error('login failed', login);
    const token = login.body.token;
    const res = await get('/api/settings', token);
    console.log('settings', res.status);
    console.log(JSON.stringify(res.body, null, 2));
  } catch (err) {
    console.error(err);
  }
})();
