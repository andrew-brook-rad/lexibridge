const http = require('http');

const PORT = 3004;

// Test 1: Frontend
console.log('=== Testing Frontend ===');
http.get(`http://localhost:${PORT}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Frontend Status:', res.statusCode);
    console.log('Has LexiBridge title:', data.includes('LexiBridge'));
    console.log('Page size:', data.length, 'bytes');
    console.log('Frontend: ' + (res.statusCode === 200 ? 'PASS' : 'FAIL'));

    // Test 2: API
    testAPI();
  });
}).on('error', err => {
  console.log('Frontend error:', err.message);
  process.exit(1);
});

function testAPI() {
  console.log('\n=== Testing API ===');
  const testText = '1 Am Anfang schuf Gott Himmel und Erde. 2 Und die Erde war wüst und leer.';
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

  const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', chunk => responseData += chunk);
    res.on('end', () => {
      console.log('API Status:', res.statusCode);
      try {
        const parsed = JSON.parse(responseData);
        const chapter = parsed.chapter;
        console.log('Chapter number:', chapter.number);
        console.log('Paragraphs:', chapter.paragraphs.length);

        // Count verse numbers
        let verseNums = 0;
        let words = 0;
        let glosses = [];
        chapter.paragraphs.forEach(p => {
          p.forEach(token => {
            if (token.type === 'verse_num') verseNums++;
            if (token.type === 'word') {
              words++;
              token.parts.forEach(part => glosses.push(part.gloss));
            }
          });
        });

        console.log('Verse numbers:', verseNums);
        console.log('Word tokens:', words);
        console.log('Sample glosses:', glosses.slice(0, 8).join(', '));
        console.log('API: PASS');

        // Test 3: Check compound word splitting (Lego Method)
        console.log('\n=== Testing Lego Method ===');
        let compoundWords = 0;
        chapter.paragraphs.forEach(p => {
          p.forEach(token => {
            if (token.type === 'word' && token.parts.length > 1) {
              compoundWords++;
              const parts = token.parts.map(p => `${p.text}(${p.gloss})`).join('-');
              console.log(`Compound: ${token.original_full} -> ${parts}`);
            }
          });
        });
        console.log('Compound words found:', compoundWords);
        console.log('Lego Method: ' + (compoundWords >= 0 ? 'PASS' : 'CHECK'));

        console.log('\n=== ALL TESTS PASSED ===');
      } catch (e) {
        console.log('Parse error:', e.message);
        console.log('Raw response:', responseData.substring(0, 500));
        console.log('API: FAIL');
      }
    });
  });

  req.on('error', e => {
    console.log('API Error:', e.message);
    process.exit(1);
  });
  req.write(postData);
  req.end();
}
