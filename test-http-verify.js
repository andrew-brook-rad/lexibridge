const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/',
  method: 'GET'
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Length:', data.length);
    console.log('Contains LexiBridge:', data.includes('LexiBridge'));
    console.log('Contains Genesis:', data.includes('Genesis'));
  });
});

req.on('error', e => console.log('Error:', e.message));
req.end();
