const http = require('http');
http.get('http://localhost:3000', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Size:', data.length, 'bytes');
    console.log('Contains LexiBridge:', data.includes('LexiBridge'));
    console.log('Contains Genesis:', data.includes('Genesis'));
  });
}).on('error', e => console.error('Error:', e.message));
