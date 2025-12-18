const http = require('http');

const PORT = 3006;

// Test 1: Frontend loads
function testFrontend() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path: '/',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('=== Frontend Test ===');
        console.log('Status:', res.statusCode);
        console.log('Body length:', data.length);
        console.log('Contains LexiBridge:', data.includes('LexiBridge'));
        resolve(res.statusCode === 200 && data.includes('LexiBridge'));
      });
    });
    req.on('error', (e) => {
      console.error('Frontend Error:', e.message);
      reject(e);
    });
    req.end();
  });
}

// Test 2: API endpoint responds
function testAPI() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      text: '1 Am Anfang schuf Gott Himmel und Erde.',
      chapterNumber: 1
    });

    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/translate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\n=== API Test ===');
        console.log('Status:', res.statusCode);
        try {
          const json = JSON.parse(data);
          console.log('Has chapter:', !!json.chapter);
          console.log('Chapter number:', json.chapter?.number);
          console.log('Has paragraphs:', !!json.chapter?.paragraphs);
          const firstPara = json.chapter?.paragraphs?.[0];
          if (firstPara) {
            console.log('First paragraph tokens:', firstPara.length);
            const verseNums = firstPara.filter(t => t.type === 'verse_num');
            const words = firstPara.filter(t => t.type === 'word');
            console.log('Verse numbers found:', verseNums.length);
            console.log('Words found:', words.length);
            if (words.length > 0) {
              console.log('Sample word:', words[0].original_full);
              console.log('Sample gloss:', words[0].parts?.[0]?.gloss);
            }
          }
          resolve(res.statusCode === 200 && json.chapter);
        } catch (e) {
          console.log('Parse error:', e.message);
          console.log('Raw response:', data.substring(0, 200));
          resolve(false);
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

// Test 3: Compound word splitting (Lego Method)
function testLegoMethod() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      text: '6 Und Gott sprach: Es werde eine Feste zwischen den Wassern, und die sei ein Unterschied zwischen den Wassern.',
      chapterNumber: 1
    });

    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/translate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\n=== Lego Method Test ===');
        console.log('Status:', res.statusCode);
        try {
          const json = JSON.parse(data);
          const allTokens = json.chapter?.paragraphs?.flat() || [];
          const compoundWords = allTokens.filter(t => t.type === 'word' && t.parts && t.parts.length > 1);
          console.log('Compound words found:', compoundWords.length);
          compoundWords.forEach(w => {
            const parts = w.parts.map(p => `${p.text}(${p.gloss})`).join('-');
            console.log(`  ${w.original_full}: ${parts}`);
          });
          resolve(compoundWords.length > 0);
        } catch (e) {
          console.log('Parse error:', e.message);
          resolve(false);
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
  console.log('LexiBridge Lite - Session 26 Verification');
  console.log('=========================================\n');

  try {
    const frontendOk = await testFrontend();
    const apiOk = await testAPI();
    const legoOk = await testLegoMethod();

    console.log('\n=== Summary ===');
    console.log('Frontend:', frontendOk ? 'PASS' : 'FAIL');
    console.log('API:', apiOk ? 'PASS' : 'FAIL');
    console.log('Lego Method:', legoOk ? 'PASS' : 'FAIL');
    console.log('\nAll tests:', (frontendOk && apiOk && legoOk) ? 'PASSED' : 'SOME FAILED');
  } catch (e) {
    console.error('Test failed:', e.message);
  }
}

runTests();
