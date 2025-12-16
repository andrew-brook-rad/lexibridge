const http = require('http');

const PORT = 3007;

// Test 1: Frontend loads
function testFrontend() {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${PORT}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('=== FRONTEND TEST ===');
        console.log('Status:', res.statusCode);
        console.log('Has LexiBridge title:', data.includes('LexiBridge'));
        console.log('Content length:', data.length, 'bytes');
        resolve(res.statusCode === 200);
      });
    });
    req.on('error', (e) => {
      console.error('Frontend error:', e.message);
      reject(e);
    });
  });
}

// Test 2: API endpoint works
function testAPI() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      text: '1 Am Anfang schuf Gott Himmel und Erde.',
      chapterNumber: 1
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

        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log('Response has chapter:', !!json.chapter);
            if (json.chapter) {
              console.log('Chapter number:', json.chapter.number);
              console.log('Paragraphs count:', json.chapter.paragraphs?.length);

              // Count tokens
              let verseNums = 0;
              let words = 0;
              let glosses = 0;

              json.chapter.paragraphs?.forEach(para => {
                para.forEach(token => {
                  if (token.type === 'verse_num') verseNums++;
                  if (token.type === 'word') {
                    words++;
                    token.parts?.forEach(part => {
                      if (part.gloss) glosses++;
                    });
                  }
                });
              });

              console.log('Verse numbers:', verseNums);
              console.log('Words:', words);
              console.log('Glosses:', glosses);
            }
            resolve(true);
          } catch (e) {
            console.error('JSON parse error:', e.message);
            resolve(false);
          }
        } else {
          console.log('Response:', data.substring(0, 200));
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.error('API error:', e.message);
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
        console.log('\n=== LEGO METHOD TEST ===');
        console.log('Status:', res.statusCode);

        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            let compoundWords = [];

            json.chapter?.paragraphs?.forEach(para => {
              para.forEach(token => {
                if (token.type === 'word' && token.parts?.length > 1) {
                  const compound = token.parts.map(p =>
                    `${p.text}(${p.gloss})`
                  ).join('-');
                  compoundWords.push(compound);
                }
              });
            });

            console.log('Compound words found:', compoundWords.length);
            compoundWords.forEach(w => console.log('  -', w));

            // Check for expected compounds
            const hasWassern = compoundWords.some(w => w.toLowerCase().includes('wasser'));
            const hasUnterschied = compoundWords.some(w => w.toLowerCase().includes('unter'));

            console.log('Has "Wassern" split:', hasWassern);
            console.log('Has "Unterschied" split:', hasUnterschied);

            resolve(compoundWords.length > 0);
          } catch (e) {
            console.error('JSON parse error:', e.message);
            resolve(false);
          }
        } else {
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.error('Lego test error:', e.message);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log('LexiBridge Session 28 Verification Tests');
  console.log('========================================\n');

  try {
    await testFrontend();
    await testAPI();
    await testLegoMethod();

    console.log('\n========================================');
    console.log('All verification tests completed!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

runTests();
