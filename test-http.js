const http = require('http');

http.get('http://localhost:3000', (res) => {
  console.log('Server status:', res.statusCode);
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => console.log('Got', data.length, 'bytes'));
}).on('error', e => console.log('Error:', e.message));
