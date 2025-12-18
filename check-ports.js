const http = require('http');

const ports = [3000, 3001, 3002, 3003, 3004];

ports.forEach(port => {
  const req = http.get(`http://localhost:${port}`, (res) => {
    console.log(`Port ${port}: HTTP ${res.statusCode}`);
  });
  req.on('error', (e) => {
    console.log(`Port ${port}: ${e.message}`);
  });
  req.setTimeout(2000, () => {
    console.log(`Port ${port}: timeout`);
    req.destroy();
  });
});
