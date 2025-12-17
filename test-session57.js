const http = require('http');

function testServer() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response length:', data.length, 'bytes');
        console.log('Contains LexiBridge:', data.includes('LexiBridge'));
        console.log('App responding:', res.statusCode === 200 ? 'YES' : 'NO');
        resolve(res.statusCode === 200);
      });
    });
    req.on('error', (e) => {
      console.log('Error:', e.message);
      resolve(false);
    });
    req.setTimeout(5000, () => {
      console.log('Timeout');
      req.destroy();
      resolve(false);
    });
  });
}

testServer().then(success => {
  console.log('\nTest result:', success ? 'PASS' : 'FAIL');
  process.exit(success ? 0 : 1);
});
