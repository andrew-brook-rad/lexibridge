const http = require('http');

function fetchPage(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          port,
          status: res.statusCode,
          hasLexiBridge: data.includes('LexiBridge'),
          hasSettingsPanel: data.includes('Settings') || data.includes('settings'),
          size: data.length
        });
      });
    });
    req.on('error', (e) => {
      resolve({ port, error: e.message });
    });
    req.setTimeout(3000, () => {
      resolve({ port, error: 'timeout' });
      req.destroy();
    });
  });
}

async function main() {
  const results = await Promise.all([3000, 3001, 3002, 3003].map(fetchPage));
  console.log('App verification results:');
  results.forEach(r => {
    if (r.error) {
      console.log(`  Port ${r.port}: ${r.error}`);
    } else {
      console.log(`  Port ${r.port}: HTTP ${r.status}, ${r.size} bytes, LexiBridge: ${r.hasLexiBridge}, Settings: ${r.hasSettingsPanel}`);
    }
  });
}

main();
