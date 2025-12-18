const http = require('http');

const ports = [3000, 3001, 3002];
let completed = 0;

ports.forEach(port => {
  const req = http.get('http://localhost:' + port, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      console.log('Port ' + port + ': Status ' + res.statusCode + ', ' + data.length + ' bytes');
      if (++completed === ports.length) process.exit(0);
    });
  });
  req.on('error', (e) => {
    console.log('Port ' + port + ': Error - ' + e.message);
    if (++completed === ports.length) process.exit(0);
  });
  req.setTimeout(3000, () => {
    console.log('Port ' + port + ': Timeout');
    req.destroy();
    if (++completed === ports.length) process.exit(0);
  });
});
