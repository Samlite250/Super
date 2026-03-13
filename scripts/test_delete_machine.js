const http = require('http');

function req(method, path, data, token, isForm=false) {
  return new Promise((resolve, reject) => {
    const body = data && !isForm ? JSON.stringify(data) : null;
    const options = { hostname: 'localhost', port: 5000, path, method, headers: {} };
    if (body) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }
    if (token) options.headers.Authorization = 'Bearer ' + token;
    const r = http.request(options, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d || '{}') }); } catch (e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

(async ()=>{
  try {
    const login = await req('POST','/api/auth/login',{ email: 'admin@supercash.com', password: 'adminpass123' });
    console.log('login', login.status);
    if (!login.body || !login.body.token) return console.error('no token', login);
    const token = login.body.token;
    const list = await req('GET','/api/machines', null, token);
    console.log('machines count', Array.isArray(list.body)?list.body.length:0);
    if (!Array.isArray(list.body) || list.body.length===0) return console.log('no machines to delete');
    const id = list.body[0].id;
    console.log('deleting id', id);
    const del = await req('DELETE',`/api/machines/${id}`, null, token);
    console.log('delete', del.status, del.body);
  } catch (err) { console.error(err); }
})();
