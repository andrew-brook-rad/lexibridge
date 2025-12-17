const http = require('http');

http.get('http://localhost:3007', (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Contains LexiBridge:', data.includes('LexiBridge'));
    console.log('Page length:', data.length);
  });
}).on('error', e => console.log('Error:', e.message));
