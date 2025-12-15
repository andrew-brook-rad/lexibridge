const http = require('http');

const PORT = 3003;

const postData = JSON.stringify({
  text: '1 Am Anfang schuf Gott Himmel und Erde.',
  sourceLanguage: 'German',
  targetLanguage: 'English'
});

const options = {
  hostname: 'localhost',
  port: PORT,
  path: '/api/translate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Full response:');
    console.log(data);
  });
});

req.on('error', (e) => {
  console.log('Error:', e.message);
});

req.write(postData);
req.end();
