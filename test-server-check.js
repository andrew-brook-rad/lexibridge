const http = require('http');

http.get('http://localhost:3000', (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Page length:', data.length, 'chars');
    console.log('Contains LexiBridge:', data.includes('LexiBridge'));
    console.log('Contains Genesis:', data.includes('Genesis'));
    console.log('Server is working!');
  });
}).on('error', (e) => console.log('Error:', e.message));
