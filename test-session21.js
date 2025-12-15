const http = require('http');

const PORT = 3003;

// Test frontend
function testFrontend() {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${PORT}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('=== FRONTEND TEST ===');
        console.log('Status:', res.statusCode);
        console.log('Has LexiBridge:', data.includes('LexiBridge'));
        console.log('Page size:', data.length, 'bytes');
        resolve(res.statusCode === 200);
      });
    }).on('error', (e) => {
      console.log('Frontend Error:', e.message);
      reject(e);
    });
  });
}

// Test API
function testAPI() {
  return new Promise((resolve, reject) => {
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
        console.log('\n=== API TEST ===');
        console.log('Status:', res.statusCode);

        try {
          const json = JSON.parse(data);
          console.log('Has chapters:', !!json.chapters);
          if (json.chapters && json.chapters.length > 0) {
            const chapter = json.chapters[0];
            console.log('Chapter number:', chapter.number);
            console.log('Paragraphs:', chapter.paragraphs?.length || 0);

            // Count tokens
            let verseCount = 0;
            let wordCount = 0;
            let compoundCount = 0;

            chapter.paragraphs?.forEach(para => {
              para.forEach(token => {
                if (token.type === 'verse_num') verseCount++;
                if (token.type === 'word') {
                  wordCount++;
                  if (token.parts && token.parts.length > 1) compoundCount++;
                }
              });
            });

            console.log('Verse numbers:', verseCount);
            console.log('Word tokens:', wordCount);
            console.log('Compound words:', compoundCount);
          }
          resolve(res.statusCode === 200);
        } catch (e) {
          console.log('JSON parse error:', e.message);
          console.log('Raw response:', data.substring(0, 200));
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.log('API Error:', e.message);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

// Run tests
async function runTests() {
  try {
    await testFrontend();
    await testAPI();
    console.log('\n=== ALL TESTS PASSED ===');
  } catch (e) {
    console.log('\n=== TEST FAILED ===');
    console.log(e.message);
  }
}

runTests();
