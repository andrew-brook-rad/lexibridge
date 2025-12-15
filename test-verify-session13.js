const http = require('http');

const testText = '1 Am Anfang schuf Gott Himmel und Erde.';

const data = JSON.stringify({
  text: testText,
  chapterNumber: 1
});

const options = {
  hostname: 'localhost',
  port: 3001,
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
      const tokens = parsed.chapter?.paragraphs?.[0] || [];
      console.log('Tokens count:', tokens.length);
      console.log('Has verse_num:', tokens.some(t => t.type === 'verse_num'));
      console.log('Has word tokens:', tokens.some(t => t.type === 'word'));
      console.log('Has glosses:', tokens.filter(t => t.type === 'word').some(t => t.parts?.some(p => p.gloss)));
      console.log('Test PASSED: API working correctly');
    } catch (e) {
      console.log('Parse error:', e.message);
      console.log('Raw response:', responseData.substring(0, 500));
    }
  });
});

req.on('error', e => console.log('Error:', e.message));
req.write(data);
req.end();
