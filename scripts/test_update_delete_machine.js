const http = require('http');

function req(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : null;
    const options = { hostname: 'localhost', port: 5000, path, method, headers: {} };
    if (body) options.headers['Content-Type'] = 'application/json';
    if (body) options.headers['Content-Length'] = Buffer.byteLength(body);
    if (token) options.headers['Authorization'] = 'Bearer ' + token;
    const r = http.request(options, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d || '{}') }); }
        catch (e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

(async function(){
  try {
    const login = await req('POST','/api/auth/login',{ email: 'admin@supercash.com', password: 'adminpass123' });
    console.log('login', login.status);
    if (!login.body || !login.body.token) return console.error('Cannot login', login.body);
    const token = login.body.token;

    const list = await req('GET','/api/machines', null, token);
    console.log('machines', list.status, Array.isArray(list.body) ? list.body.length : list.body);
    if (!Array.isArray(list.body) || list.body.length === 0) return console.log('no machines to test');
    const m = list.body[0];
    console.log('testing machine id', m.id, m.name);

    // Attempt update (toggle premium)
    const updateData = { name: m.name, description: m.description || '', priceFBu: m.priceFBu || 0, durationDays: m.durationDays || 30, dailyPercent: m.dailyPercent || 1, premium: !m.premium };
    const upd = await req('PUT', `/api/machines/${m.id}`, updateData, token);
    console.log('update', upd.status, upd.body);

    // Attempt delete
    const del = await req('DELETE', `/api/machines/${m.id}`, null, token);
    console.log('delete', del.status, del.body);
  } catch (err) {
    console.error('error', err);
  }
})();
