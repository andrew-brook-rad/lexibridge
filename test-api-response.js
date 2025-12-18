const http = require('http');

const testText = '1 Am Anfang schuf Gott Himmel und Erde.';
const postData = JSON.stringify({ text: testText, chapterNumber: 1 });

const options = {
  hostname: 'localhost',
  port: 3003,
  path: '/api/translate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const apiReq = http.request(options, (apiRes) => {
  let responseData = '';
  apiRes.on('data', chunk => responseData += chunk);
  apiRes.on('end', () => {
    console.log('API Status:', apiRes.statusCode);
    console.log('Raw Response:');
    console.log(responseData);
  });
});

apiReq.on('error', e => console.log('API Error:', e.message));
apiReq.write(postData);
apiReq.end();
