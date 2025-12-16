const http = require('http');

const PORT = 3004;

// Test frontend
function testFrontend() {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${PORT}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('=== Frontend Test ===');
        console.log('Status:', res.statusCode);
        console.log('Has LexiBridge:', data.includes('LexiBridge'));
        console.log('Page size:', data.length, 'bytes');
        resolve(res.statusCode === 200);
      });
    }).on('error', e => {
      console.error('Frontend error:', e.message);
      reject(e);
    });
  });
}

// Test API
function testAPI() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      text: '1 Am Anfang schuf Gott Himmel und Erde. 2 Und die Erde war wüst und leer.'
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
        console.log('\n=== API Test ===');
        console.log('Status:', res.statusCode);

        try {
          const json = JSON.parse(data);
          console.log('Chapter number:', json.chapter?.number);
          console.log('Paragraphs:', json.chapter?.paragraphs?.length);

          // Count tokens
          let verseNums = 0;
          let words = 0;
          let compounds = 0;

          if (json.chapter?.paragraphs) {
            for (const para of json.chapter.paragraphs) {
              for (const token of para) {
                if (token.type === 'verse_num') verseNums++;
                if (token.type === 'word') {
                  words++;
                  if (token.parts && token.parts.length > 1) {
                    compounds++;
                    console.log('Compound found:', token.original_full, '->', token.parts.map(p => p.text).join('-'));
                  }
                }
              }
            }
          }

          console.log('Verse numbers:', verseNums);
          console.log('Word tokens:', words);
          console.log('Compound words (Lego Method):', compounds);

          resolve(res.statusCode === 200);
        } catch (e) {
          console.error('Parse error:', e.message);
          console.log('Raw response:', data.substring(0, 500));
          reject(e);
        }
      });
    });

    req.on('error', e => {
      console.error('API error:', e.message);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('LexiBridge Lite - Session 22 Verification\n');
  console.log('Testing on port:', PORT);

  try {
    await testFrontend();
    await testAPI();
    console.log('\n=== All tests passed! ===');
  } catch (e) {
    console.error('\n=== Test failed! ===');
    console.error(e.message);
    process.exit(1);
  }
}

run();
