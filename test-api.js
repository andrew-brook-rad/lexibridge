const http = require('http');

const testText = '1 Am Anfang schuf Gott Himmel und Erde.';

const data = JSON.stringify({
  text: testText,
  chapterNumber: 1
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/translate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', chunk => responseData += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const parsed = JSON.parse(responseData);
      console.log('Response:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Raw response:', responseData.substring(0, 1000));
    }
  });
});

req.on('error', e => console.log('Error:', e.message));
req.write(data);
req.end();
