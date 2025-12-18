const http = require('http');
const req = http.get('http://localhost:3004', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Has LexiBridge:', data.includes('LexiBridge'));
    console.log('Content length:', data.length);
  });
}).on('error', e => console.log('Error:', e.message));
