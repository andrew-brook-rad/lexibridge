const http = require('http');

const req = http.get('http://localhost:3001', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    console.log('Size:', data.length, 'bytes');
    console.log('Contains LexiBridge:', data.includes('LexiBridge'));
  });
}).on('error', e => console.log('Error:', e.message));
