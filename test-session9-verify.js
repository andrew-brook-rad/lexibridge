const http = require('http');

const PORT = 3003;

// Test the API
function testAPI() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      text: '1 Am Anfang schuf Gott Himmel und Erde.'
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
        console.log('API Status:', res.statusCode);
        if (res.statusCode === 200) {
          const json = JSON.parse(data);
          console.log('Chapter number:', json.chapter?.number);
          console.log('Paragraphs:', json.chapter?.paragraphs?.length);
          if (json.chapter?.paragraphs?.[0]) {
            console.log('First paragraph tokens:', json.chapter.paragraphs[0].length);
            // Check for verse_num token
            const verseToken = json.chapter.paragraphs[0].find(t => t.type === 'verse_num');
            console.log('Has verse_num token:', !!verseToken);
            // Check for word tokens
            const wordTokens = json.chapter.paragraphs[0].filter(t => t.type === 'word');
            console.log('Word tokens:', wordTokens.length);
            if (wordTokens[0]) {
              console.log('First word:', wordTokens[0].original_full, '->', wordTokens[0].parts?.map(p => p.gloss).join(' + '));
            }
          }
          resolve(true);
        } else {
          console.log('API Error:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.log('Request error:', e.message);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Test the main page loads
function testMainPage() {
  return new Promise((resolve) => {
    http.get(`http://localhost:${PORT}`, (res) => {
      console.log('Main page status:', res.statusCode);
      resolve(res.statusCode === 200);
    }).on('error', (e) => {
      console.log('Main page error:', e.message);
      resolve(false);
    });
  });
}

async function run() {
  console.log('=== Session 9 Verification Tests ===\n');

  console.log('1. Testing main page...');
  const mainOk = await testMainPage();

  console.log('\n2. Testing API...');
  const apiOk = await testAPI();

  console.log('\n=== Results ===');
  console.log('Main page:', mainOk ? 'PASS' : 'FAIL');
  console.log('API:', apiOk ? 'PASS' : 'FAIL');

  process.exit(mainOk && apiOk ? 0 : 1);
}

run();
