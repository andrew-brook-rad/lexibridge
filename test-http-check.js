const http = require('http');

// Quick HTTP check to see if server is responding
const options = {
  hostname: 'localhost',
  port: 3004,
  path: '/',
  method: 'GET',
  timeout: 5000
};

console.log('Checking if server is running on port 3004...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Response length: ${data.length} bytes`);
    if (data.includes('LexiBridge')) {
      console.log('✅ Server is running and responding with LexiBridge content!');
    } else {
      console.log('Server responding but content may be different');
    }
  });
});

req.on('error', (e) => {
  console.error(`Error connecting to server: ${e.message}`);
});

req.on('timeout', () => {
  console.error('Request timed out');
  req.destroy();
});

req.end();
