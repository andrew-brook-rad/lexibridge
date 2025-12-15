const http = require('http');

// Test frontend
http.get('http://localhost:3001', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Frontend Status:', res.statusCode);
    console.log('Has LexiBridge:', data.includes('LexiBridge'));
    console.log('Has Next.js root:', data.includes('__next'));
    console.log('Page size:', data.length, 'bytes');
  });
}).on('error', e => console.log('Frontend Error:', e.message));

// Test API
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
    console.log('\nAPI Status:', res.statusCode);
    try {
      const parsed = JSON.parse(responseData);
      console.log('Chapter number:', parsed.number);
      console.log('Paragraphs:', parsed.paragraphs?.length);
      const firstPara = parsed.paragraphs?.[0] || [];
      const verseNums = firstPara.filter(t => t.type === 'verse_num');
      const words = firstPara.filter(t => t.type === 'word');
      console.log('Verse numbers:', verseNums.length);
      console.log('Words:', words.length);
      if (words.length > 0) {
        console.log('Sample gloss:', words[0].parts?.[0]?.gloss);
      }
    } catch (e) {
      console.log('Parse error:', e.message);
      console.log('Raw:', responseData.substring(0, 500));
    }
  });
});

req.on('error', e => console.log('API Error:', e.message));
req.write(postData);
req.end();
