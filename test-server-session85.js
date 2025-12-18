const http = require('http');

const req = http.get('http://localhost:3006', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Size:', data.length, 'bytes');
    console.log('Contains LexiBridge:', data.includes('LexiBridge'));
  });
});

req.on('error', e => console.log('Error:', e.message));
