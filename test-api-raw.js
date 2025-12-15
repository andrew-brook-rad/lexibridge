const http = require('http');

const testText = '1 Am Anfang schuf Gott Himmel und Erde.';
const postData = JSON.stringify({ text: testText, chapterNumber: 1 });

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/translate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', chunk => responseData += chunk);
  res.on('end', () => {
    console.log('API Status:', res.statusCode);
    console.log('Full response:');
    console.log(responseData);
  });
});

req.on('error', e => console.log('API Error:', e.message));
req.write(postData);
req.end();
