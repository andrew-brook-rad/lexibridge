const http = require('http');

http.get('http://localhost:3001', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Bytes:', data.length);
    console.log('Contains LexiBridge:', data.includes('LexiBridge'));
    console.log('Contains Genesis:', data.includes('Genesis'));
  });
}).on('error', e => console.log('Error:', e.message));
