const net = require('net');

function checkPort(port, host) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 1000;
    socket.setTimeout(timeout);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', (e) => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function scan() {
  const mysql3306 = await checkPort(3306, '127.0.0.1');
  const pg5432 = await checkPort(5432, '127.0.0.1');
  console.log('Port 3306 (MySQL):', mysql3306 ? 'OPEN' : 'CLOSED');
  console.log('Port 5432 (Postgres):', pg5432 ? 'OPEN' : 'CLOSED');
  process.exit(0);
}

scan();
