const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Size:', data.length, 'bytes');
    console.log('Contains LexiBridge:', data.includes('LexiBridge') || data.includes('lexibridge'));
  });
});

req.on('error', (e) => {
  console.log('Error:', e.message);
});

req.end();
