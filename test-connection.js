const http = require('http');

http.get('http://localhost:3002', (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response length:', data.length);
    console.log('Contains LexiBridge:', data.includes('LexiBridge'));
    process.exit(0);
  });
}).on('error', (e) => {
  console.log('Error:', e.message);
  process.exit(1);
});
