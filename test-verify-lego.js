const http = require('http');

const PORT = 3004;

// Test with Genesis 1:6-7 which contains compound words like "Unterschied"
const testText = '6 Und Gott sprach: Es werde eine Feste zwischen den Wassern, und die sei ein Unterschied zwischen den Wassern. 7 Da machte Gott die Feste und schied das Wasser unter der Feste von dem Wasser über der Feste.';

console.log('=== Testing Lego Method (Compound Words) ===');
console.log('Input text:', testText.substring(0, 80) + '...');

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

      let compoundWords = 0;
      let totalWords = 0;

      chapter.paragraphs.forEach(p => {
        p.forEach(token => {
          if (token.type === 'word') {
            totalWords++;
            if (token.parts.length > 1) {
              compoundWords++;
              const parts = token.parts.map(p => `${p.text}(${p.gloss})`).join('-');
              console.log(`Compound: "${token.original_full}" -> ${parts}`);
            }
          }
        });
      });

      console.log('\nTotal words:', totalWords);
      console.log('Compound words found:', compoundWords);
      console.log('Lego Method: ' + (compoundWords > 0 ? 'PASS - Working!' : 'CHECK - No compounds split'));

    } catch (e) {
      console.log('Parse error:', e.message);
      console.log('Raw response:', responseData.substring(0, 500));
    }
  });
});

req.on('error', e => {
  console.log('Error:', e.message);
  process.exit(1);
});
req.write(postData);
req.end();
