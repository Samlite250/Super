const https = require('https');

async function seed() {
  const loginData = JSON.stringify({
    loginIdentifier: 'admin',
    password: 'admin123'
  });

  const reqObj = {
    hostname: 'super-rho-plum.vercel.app',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  };

  const req = https.request(reqObj, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const resp = JSON.parse(data);
      console.log('Login Response:', resp);

      if (resp.token) {
        const seedReqObj = {
          hostname: 'super-rho-plum.vercel.app',
          port: 443,
          path: '/api/machines/seed-countries',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + resp.token,
             // Add Content-Length: 0 for POST with no body
             'Content-Length': '0'
          }
        };

        const seedReq = https.request(seedReqObj, sRes => {
          let sData = '';
          sRes.on('data', chunk => sData += chunk);
          sRes.on('end', () => console.log('Seed Response:', sData));
        });
        seedReq.on('error', e => console.error(e));
        seedReq.end();
      }
    });
  });

  req.on('error', e => console.error(e));
  req.write(loginData);
  req.end();
}

seed();
