const http = require('http');

http.get('http://localhost:3000', res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Has LexiBridge:', data.includes('LexiBridge'));
    console.log('Size:', data.length);
  });
}).on('error', e => console.log('Error:', e.message));
