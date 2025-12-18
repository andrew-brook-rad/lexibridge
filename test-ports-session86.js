const http = require('http');
const ports = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007];
let checked = 0;

ports.forEach(port => {
  const req = http.get('http://localhost:' + port, {timeout: 2000}, (res) => {
    console.log('Port ' + port + ': HTTP ' + res.statusCode);
    checked++;
    if (checked === ports.length) process.exit(0);
  });
  req.on('error', (e) => {
    console.log('Port ' + port + ': Not responding');
    checked++;
    if (checked === ports.length) process.exit(0);
  });
  req.on('timeout', () => {
    console.log('Port ' + port + ': Timeout');
    req.destroy();
    checked++;
    if (checked === ports.length) process.exit(0);
  });
});
