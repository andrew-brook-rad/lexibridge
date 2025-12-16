const http = require('http');

const PORT = 3006;
const testText = '1 Am Anfang schuf Gott Himmel und Erde.';
const postData = JSON.stringify({ text: testText, chapterNumber: 1 });

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

console.log('Sending request to API...');

const apiReq = http.request(options, (apiRes) => {
  let responseData = '';
  apiRes.on('data', chunk => responseData += chunk);
  apiRes.on('end', () => {
    console.log('API Status:', apiRes.statusCode);
    console.log('Response length:', responseData.length);
    console.log('Raw response:');
    console.log(responseData);
  });
});

apiReq.on('error', e => console.log('API Error:', e.message));
apiReq.write(postData);
apiReq.end();
