const http = require('http');

http.get('http://localhost:3003', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Size:', data.length, 'bytes');
    console.log('Contains LexiBridge:', data.includes('LexiBridge') ? 'Yes' : 'No');
  });
}).on('error', e => {
  console.log('Error:', e.message);
});
