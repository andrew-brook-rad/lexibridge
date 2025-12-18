const http = require('http');

const ports = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007];

async function checkPort(port) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/',
      method: 'GET',
      timeout: 2000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ port, status: res.statusCode, hasLexiBridge: data.includes('LexiBridge') });
      });
    });

    req.on('error', () => resolve({ port, status: 'error', hasLexiBridge: false }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ port, status: 'timeout', hasLexiBridge: false });
    });

    req.end();
  });
}

async function main() {
  console.log('Scanning ports for LexiBridge server...\n');

  for (const port of ports) {
    const result = await checkPort(port);
    console.log(`Port ${result.port}: ${result.status}${result.hasLexiBridge ? ' ✅ LexiBridge found!' : ''}`);
  }
}

main();
