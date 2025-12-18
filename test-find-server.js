const http = require('http');

// Check multiple ports
const ports = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007];

function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get({ hostname: 'localhost', port: port, path: '/', timeout: 2000 }, (res) => {
      resolve({ port, status: res.statusCode });
    });
    req.on('error', () => resolve({ port, status: 'error' }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ port, status: 'timeout' });
    });
  });
}

async function findServer() {
  console.log('Checking ports for running Next.js server...\n');

  const results = await Promise.all(ports.map(checkPort));

  results.forEach(r => {
    if (r.status === 200) {
      console.log(`Port ${r.port}: ✅ Running (Status 200)`);
    } else {
      console.log(`Port ${r.port}: ❌ ${r.status}`);
    }
  });

  const activePort = results.find(r => r.status === 200);
  if (activePort) {
    console.log(`\nActive server found on port ${activePort.port}`);
    return activePort.port;
  } else {
    console.log('\nNo active server found. Starting new server...');
    return null;
  }
}

findServer();
