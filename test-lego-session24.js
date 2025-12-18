const http = require('http');

// Test compound word splitting (Lego Method)
const testText = '6 Und Gott sprach: Es werde eine Feste zwischen den Wassern, und die sei ein Unterschied zwischen den Wassern. 7 Da machte Gott die Feste und schied das Wasser unter der Feste von dem Wasser über der Feste.';
const postData = JSON.stringify({ text: testText, chapterNumber: 1 });

const options = {
  hostname: 'localhost',
  port: 3003,
  path: '/api/translate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('=== LEGO METHOD TEST (Compound Word Splitting) ===');
console.log('Testing Genesis 1:6-7 for compound words...\n');

const apiReq = http.request(options, (apiRes) => {
  let responseData = '';
  apiRes.on('data', chunk => responseData += chunk);
  apiRes.on('end', () => {
    console.log('API Status:', apiRes.statusCode);
    try {
      const parsed = JSON.parse(responseData);
      const chapter = parsed.chapter;

      console.log('Chapter number:', chapter.number);
      console.log('Paragraphs count:', chapter.paragraphs?.length);

      // Find compound words (words with multiple parts)
      let compoundWords = [];
      let wordTokens = 0;
      let verseNums = 0;

      if (chapter.paragraphs) {
        chapter.paragraphs.forEach(para => {
          para.forEach(token => {
            if (token.type === 'verse_num') verseNums++;
            if (token.type === 'word') {
              wordTokens++;
              if (token.parts && token.parts.length > 1) {
                compoundWords.push({
                  original: token.original_full,
                  parts: token.parts.map(p => `${p.text}(${p.gloss})`).join('-')
                });
              }
            }
          });
        });
      }

      console.log('Verse numbers:', verseNums);
      console.log('Word tokens:', wordTokens);
      console.log('\n=== COMPOUND WORDS FOUND ===');

      if (compoundWords.length > 0) {
        compoundWords.forEach(cw => {
          console.log(`  "${cw.original}" -> ${cw.parts}`);
        });
        console.log('\n=== LEGO METHOD WORKING ===');
      } else {
        console.log('  No compound words with multiple parts found');
        console.log('  (This may be normal if the AI decided not to split these particular words)');
      }

    } catch (e) {
      console.log('Parse error:', e.message);
    }
  });
});

apiReq.on('error', e => console.log('API Error:', e.message));
apiReq.write(postData);
apiReq.end();
