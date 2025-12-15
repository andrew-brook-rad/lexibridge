const http = require('http');

const PORT = 3002;

// Test 1: Frontend page loads
const testFrontend = () => {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${PORT}/`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('=== Frontend Test ===');
        console.log('Status:', res.statusCode);
        console.log('Has LexiBridge:', data.includes('LexiBridge') ? 'YES' : 'NO');
        console.log('Page size:', data.length, 'bytes');
        resolve(res.statusCode === 200 && data.includes('LexiBridge'));
      });
    });
    req.on('error', e => { console.log('Frontend Error:', e.message); resolve(false); });
  });
};

// Test 2: API endpoint
const testAPI = () => {
  return new Promise((resolve) => {
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
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\n=== API Test ===');
        console.log('Status:', res.statusCode);
        try {
          const json = JSON.parse(data);
          // API returns "chapter" (singular) not "chapters" (plural)
          const hasChapter = json.chapter && json.chapter.number !== undefined;
          const hasParagraphs = hasChapter && json.chapter.paragraphs && json.chapter.paragraphs.length > 0;
          console.log('Has chapter:', hasChapter ? 'YES' : 'NO');
          console.log('Has paragraphs:', hasParagraphs ? 'YES' : 'NO');
          if (hasParagraphs) {
            const para = json.chapter.paragraphs[0];
            const wordCount = para.filter(t => t.type === 'word').length;
            const verseCount = para.filter(t => t.type === 'verse_num').length;
            console.log('Word tokens:', wordCount);
            console.log('Verse numbers:', verseCount);
          }
          resolve(res.statusCode === 200 && hasChapter);
        } catch (e) {
          console.log('Parse error:', e.message);
          resolve(false);
        }
      });
    });
    req.on('error', e => { console.log('API Error:', e.message); resolve(false); });
    req.write(postData);
    req.end();
  });
};

// Run tests
async function main() {
  console.log('LexiBridge Lite - Session 20 Verification');
  console.log('=========================================\n');

  const frontendOk = await testFrontend();
  const apiOk = await testAPI();

  console.log('\n=== Summary ===');
  console.log('Frontend:', frontendOk ? 'PASS' : 'FAIL');
  console.log('API:', apiOk ? 'PASS' : 'FAIL');
  console.log('Overall:', (frontendOk && apiOk) ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED');
}

main();
