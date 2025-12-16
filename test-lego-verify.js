const http = require('http');

const PORT = 3004;

// Test API with compound words
function testLegoMethod() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      text: '6 Und Gott sprach: Es werde eine Feste zwischen den Wassern, und die sei ein Unterschied zwischen den Wassern. 7 Da machte Gott die Feste und schied das Wasser unter der Feste von dem Wasser über der Feste.'
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
        console.log('=== Lego Method Test (Compound Words) ===');
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
                    console.log('  Compound:', token.original_full, '->', token.parts.map(p => `${p.text}(${p.gloss})`).join('-'));
                  }
                }
              }
            }
          }

          console.log('\nSummary:');
          console.log('  Verse numbers:', verseNums);
          console.log('  Word tokens:', words);
          console.log('  Compound words (Lego Method):', compounds);

          if (compounds > 0) {
            console.log('\n✅ Lego Method working - compound words are being split!');
          } else {
            console.log('\n⚠️ No compound words found in this text');
          }

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
  console.log('LexiBridge Lite - Lego Method Verification\n');
  console.log('Testing on port:', PORT);
  console.log('Text contains: "Unterschied" which should split to "Unter-schied"\n');

  try {
    await testLegoMethod();
    console.log('\n=== Test completed! ===');
  } catch (e) {
    console.error('\n=== Test failed! ===');
    console.error(e.message);
    process.exit(1);
  }
}

run();
