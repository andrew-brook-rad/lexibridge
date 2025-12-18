const http = require('http');
const ports = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009];
Promise.all(ports.map(port => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:' + port, (res) => {
      console.log('Port ' + port + ': RESPONDING (status ' + res.statusCode + ')');
      resolve(port);
    });
    req.on('error', () => resolve(null));
    req.setTimeout(1000, () => { req.destroy(); resolve(null); });
  });
})).then(results => {
  const working = results.filter(p => p !== null);
  console.log('Working ports:', working.join(', ') || 'none');
});
