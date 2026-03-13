const http = require('http');

const testUrl = 'http://localhost:5000/uploads/tractor_basic_1_1773321998878.png';

http.get(testUrl, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Content-Type: ${res.headers['content-type']}`);
  process.exit();
}).on('error', (e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
