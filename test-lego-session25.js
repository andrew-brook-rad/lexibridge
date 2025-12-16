const http = require('http');

const PORT = 3006;
// Genesis 1:6-7 contains compound words like "Unterschied" and "Wassern"
const testText = '6 Und Gott sprach: Es werde eine Feste zwischen den Wassern, und die sei ein Unterschied zwischen den Wassern. 7 Da machte Gott die Feste und schied das Wasser unter der Feste von dem Wasser über der Feste.';
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

console.log('Testing Lego Method (compound word splitting)...\n');

const apiReq = http.request(options, (apiRes) => {
  let responseData = '';
  apiRes.on('data', chunk => responseData += chunk);
  apiRes.on('end', () => {
    console.log('API Status:', apiRes.statusCode);
    try {
      const parsed = JSON.parse(responseData);
      const chapter = parsed.chapter || parsed;

      console.log('Chapter number:', chapter.number);
      console.log('Paragraphs count:', chapter.paragraphs?.length);

      // Count tokens and find compound words
      let verseNums = 0;
      let words = 0;
      let compoundWords = [];

      if (chapter.paragraphs) {
        chapter.paragraphs.forEach(para => {
          para.forEach(token => {
            if (token.type === 'verse_num') verseNums++;
            if (token.type === 'word') {
              words++;
              if (token.parts && token.parts.length > 1) {
                const parts = token.parts.map(p => `${p.text}(${p.gloss})`).join('-');
                compoundWords.push(`${token.original_full} -> ${parts}`);
              }
            }
          });
        });
      }

      console.log('Verse numbers found:', verseNums);
      console.log('Word tokens found:', words);
      console.log('\nCompound words split (Lego Method):');
      if (compoundWords.length > 0) {
        compoundWords.forEach(cw => console.log('  -', cw));
      } else {
        console.log('  (none found)');
      }

      console.log('\n=== LEGO METHOD TEST COMPLETE ===');
    } catch (e) {
      console.log('Parse error:', e.message);
      console.log('Raw response:', responseData.substring(0, 1000));
    }
  });
});

apiReq.on('error', e => console.log('API Error:', e.message));
apiReq.write(postData);
apiReq.end();
