const http = require('http');

http.get('http://localhost:3000', (res) => {
  console.log('Port 3000 responding, status:', res.statusCode);
  process.exit(0);
}).on('error', (e) => {
  console.log('Port 3000 error:', e.message);
  process.exit(1);
});
