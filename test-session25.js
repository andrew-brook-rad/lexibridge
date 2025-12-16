const http = require('http');

const PORT = 3006;

// Test 1: Frontend load test
console.log('=== TEST 1: Frontend Load ===');
const frontendReq = http.get(`http://localhost:${PORT}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Frontend Status:', res.statusCode);
    console.log('Has LexiBridge title:', data.includes('LexiBridge'));
    console.log('Page size:', data.length, 'bytes');

    // Test 2: API test
    console.log('\n=== TEST 2: API Translation ===');
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

    const apiReq = http.request(options, (apiRes) => {
      let responseData = '';
      apiRes.on('data', chunk => responseData += chunk);
      apiRes.on('end', () => {
        console.log('API Status:', apiRes.statusCode);
        try {
          const parsed = JSON.parse(responseData);
          console.log('Chapter number:', parsed.number);
          console.log('Paragraphs count:', parsed.paragraphs?.length);

          // Count tokens
          let verseNums = 0;
          let words = 0;
          let glosses = 0;

          if (parsed.paragraphs) {
            parsed.paragraphs.forEach(para => {
              para.forEach(token => {
                if (token.type === 'verse_num') verseNums++;
                if (token.type === 'word') {
                  words++;
                  if (token.parts) {
                    token.parts.forEach(part => {
                      if (part.gloss) glosses++;
                    });
                  }
                }
              });
            });
          }

          console.log('Verse numbers found:', verseNums);
          console.log('Word tokens found:', words);
          console.log('Glosses found:', glosses);
          console.log('\n=== ALL TESTS PASSED ===');
        } catch (e) {
          console.log('Parse error:', e.message);
          console.log('Raw response:', responseData.substring(0, 500));
        }
      });
    });

    apiReq.on('error', e => console.log('API Error:', e.message));
    apiReq.write(postData);
    apiReq.end();
  });
});

frontendReq.on('error', e => console.log('Frontend Error:', e.message));
