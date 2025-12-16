const http = require('http');

// Test 1: Frontend loads
function testFrontend() {
  return new Promise((resolve, reject) => {
    const options = { hostname: 'localhost', port: 3007, path: '/', method: 'GET' };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('=== FRONTEND TEST ===');
        console.log('Status:', res.statusCode);
        console.log('Title present:', data.includes('LexiBridge'));
        console.log('Size:', data.length, 'bytes');
        resolve(res.statusCode === 200);
      });
    });
    req.on('error', (e) => {
      console.error('Frontend Error:', e.message);
      reject(e);
    });
    req.end();
  });
}

// Test 2: API endpoint
function testAPI() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      text: '1 Am Anfang schuf Gott Himmel und Erde.',
      chapterNumber: 1
    });

    const options = {
      hostname: 'localhost',
      port: 3007,
      path: '/api/translate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('\n=== API TEST ===');
        console.log('Status:', res.statusCode);
        try {
          const json = JSON.parse(data);
          const chapter = json.chapter || json;
          console.log('Chapter number:', chapter.number);
          console.log('Paragraphs:', chapter.paragraphs ? chapter.paragraphs.length : 0);

          // Count verse numbers and words
          let verseCount = 0;
          let wordCount = 0;
          if (chapter.paragraphs) {
            chapter.paragraphs.forEach(p => {
              p.forEach(token => {
                if (token.type === 'verse_num') verseCount++;
                if (token.type === 'word') wordCount++;
              });
            });
          }
          console.log('Verse numbers:', verseCount);
          console.log('Word tokens:', wordCount);
          resolve(res.statusCode === 200);
        } catch (e) {
          console.error('JSON parse error:', e.message);
          console.log('Raw response:', data.substring(0, 200));
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error('API Error:', e.message);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

// Test 3: Lego Method (compound word splitting)
function testLegoMethod() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      text: '6 Und Gott sprach: Es werde eine Feste zwischen den Wassern, und die sei ein Unterschied zwischen den Wassern.',
      chapterNumber: 1
    });

    const options = {
      hostname: 'localhost',
      port: 3007,
      path: '/api/translate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('\n=== LEGO METHOD TEST ===');
        console.log('Status:', res.statusCode);
        try {
          const json = JSON.parse(data);
          const chapter = json.chapter || json;

          // Find compound words (words with multiple parts)
          let compoundWords = [];
          if (chapter.paragraphs) {
            chapter.paragraphs.forEach(p => {
              p.forEach(token => {
                if (token.type === 'word' && token.parts && token.parts.length > 1) {
                  compoundWords.push({
                    original: token.original_full,
                    parts: token.parts.map(part => part.text + '(' + part.gloss + ')').join('-')
                  });
                }
              });
            });
          }

          console.log('Compound words found:', compoundWords.length);
          compoundWords.forEach(cw => {
            console.log('  -', cw.original, '->', cw.parts);
          });

          // Check for specific expected splits
          const hasUnterschied = compoundWords.some(cw =>
            cw.original && cw.original.toLowerCase().includes('unterschied'));
          console.log('Unterschied split:', hasUnterschied ? 'YES' : 'NO');

          resolve(res.statusCode === 200 && compoundWords.length > 0);
        } catch (e) {
          console.error('JSON parse error:', e.message);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error('Lego Error:', e.message);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log('LexiBridge Lite - Session 27 Verification');
  console.log('=========================================\n');

  try {
    await testFrontend();
    await testAPI();
    await testLegoMethod();

    console.log('\n=== ALL TESTS COMPLETE ===');
  } catch (e) {
    console.error('\nTest failed:', e.message);
  }
}

runTests();
