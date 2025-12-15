const http = require('http');

http.get('http://localhost:3003', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Content-Length:', data.length);
    console.log('First 500 chars:', data.substring(0, 500));
  });
}).on('error', e => console.log('Error:', e.message));
